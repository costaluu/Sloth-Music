import { Event } from '../Interfaces'
import { Message, VoiceState, VoiceChannel, TextChannel, User, ThreadChannel, ThreadMember } from 'discord.js'
import Logger from '../Logger'
import Configs from '../config.json'
const log = Logger(Configs.EventsLogLevel, 'voiceStateUpdate.ts')

export const event: Event = {
    name: 'voiceStateUpdate',
    run: async (client, oldChannel: VoiceState, newChannel: VoiceState) => {
        if (global.musicState.player === null || global.musicState.player.state !== 'CONNECTED') return
        if (oldChannel.channel === null && newChannel.channel === null) return /* just checking, you know :] */
        if (newChannel.serverMute == true && oldChannel.serverMute == false) return global.musicState.player.pause(true)
        if (newChannel.serverMute == false && oldChannel.serverMute == true) return global.musicState.player.pause(false)

        let oldVC: string = oldChannel.channelId
        let newVC: string = newChannel.channelId
        let currentVC: string = global.musicState.player.voiceChannel
        let currentTC: string = global.musicState.player.textChannel

        if (oldVC === currentVC || newVC === currentVC) {
            if (newVC === currentVC) {
                if (oldVC !== newVC) {
                    /* User joined in the currentVC */
                    if (global.dataState.isThreadCreated === true) global.musicState.taskQueue.enqueueTask('updateMainMessage', [null])
                } else if (oldChannel.id === client.user.id || newChannel.id === client.user.id) {
                    /* Bot leaved the current voice channel */

                    log.debug(`Bot left the voice channel, clearing state...`)

                    global.musicState.taskQueue.enqueueTask('Leave', [null, true])
                }
            } else {
                await client.channels
                    .fetch(currentVC)
                    .then(async (channel: VoiceChannel) => {
                        if (channel.members.size === 1 && channel.members.get(client.user.id) !== undefined) {
                            /* Bot alone in call */
                            log.debug(`Bot alone in call, clearing state...`)

                            global.musicState.taskQueue.enqueueTask('Leave', [null, true])
                        } else if (oldChannel.id === global.dataState.anchorUser.id) {
                            /* Anchoruser left, handover */

                            log.debug(`Executing a handover, fetching new anchor user...`)

                            let iterator = channel.members.keys()
                            let nextAnchorUserId = iterator.next().value

                            while (nextAnchorUserId === client.user.id) nextAnchorUserId = iterator.next().value

                            global.dataState.anchorUser = channel.members.get(nextAnchorUserId).user as User

                            if (global.dataState.anchorUser) log.debug(`New anchor user found!`)

                            if (global.dataState.isThreadCreated === true) {
                                await client.channels
                                    .fetch(currentTC)
                                    .then(async (channel: TextChannel) => {
                                        await channel.threads
                                            .fetch(global.dataState.threadID)
                                            .then(async (thread: ThreadChannel) => {
                                                if (thread) {
                                                    await thread.members
                                                        .fetch(nextAnchorUserId)
                                                        .then(() => {
                                                            log.debug(`Next anchor is already in thread.`)
                                                        })
                                                        .catch(async (e) => {
                                                            await thread.members.add(nextAnchorUserId).catch((e) => {
                                                                log.error(`Failed to add member while handover, this is a discord internal error\n${e.stack}`)
                                                            })
                                                        })
                                                } else log.debug(`Thread not valid while handover`)
                                            })
                                            .catch((e) => {
                                                log.error(`Failed to fetch thread while handover, this is a discord internal error\n${e.stack}`)
                                            })

                                        global.musicState.taskQueue.enqueueTask('updateMainMessage', [null])
                                    })
                                    .catch((e) => {
                                        log.warn(`Failed to fetch text channel while handover, this is a discord internal error\n${e.stack}`)
                                    })
                            }
                        } else if (global.dataState.isThreadCreated === true) {
                            /* Common user left the channel */

                            log.debug(`Common member left the channel, checking thread members...`)

                            await client.channels
                                .fetch(currentTC)
                                .then(async (channel: TextChannel) => {
                                    await channel.threads
                                        .fetch(global.dataState.threadID)
                                        .then(async (thread: ThreadChannel) => {
                                            await thread.members
                                                .fetch(oldChannel.id)
                                                .then(async (member: ThreadMember) => {
                                                    await member
                                                        .remove()
                                                        .then(() => {
                                                            log.debug(`Member was in thread, removing...`)
                                                            log.success({ message: `Done`, level: 4 })
                                                        })
                                                        .catch((e) => {
                                                            log.error(`Failed to remove thread member, this is a discord internal error\n${e.stack}`)
                                                        })
                                                })
                                                .catch((e) => {
                                                    log.error(`Member is not in thread.`)
                                                })
                                        })
                                        .catch((e) => {
                                            log.error(`Failed to remove thread member, this is a discord internal error\n${e.stack}`)
                                        })

                                    global.musicState.taskQueue.enqueueTask('updateMainMessage', [null])
                                })
                                .catch((e) => {
                                    log.warn(`Failed to fetch text channel while checking thread members\n${e.stack}`)
                                })
                        }
                    })
                    .catch((e) => {
                        log.warn(`Failed to fetch the voice channel, this is a discord internal error\n${e.stack}`)
                    })
            }
        }
    },
}
