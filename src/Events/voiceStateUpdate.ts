import { Event } from '../Interfaces'
import { Message, VoiceState, VoiceChannel, TextChannel, User } from 'discord.js'
import { updateMainEmbedMessage } from '../VoiceHandler'
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
                    if (global.dataState.isThreadCreated === true) await updateMainEmbedMessage()
                } else if (oldChannel.id === client.user.id || newChannel.id === client.user.id) {
                    /* Bot leaved the current voice channel */

                    log.debug(`Bot left the voice channel, clearing state...`)

                    await client.channels
                        .fetch(currentTC)
                        .then(async (channel: TextChannel) => {
                            if (channel) {
                                let findThread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                if (findThread !== undefined) {
                                    log.debug('Thread found! Deleting...')

                                    await findThread.delete().catch((e) => {
                                        log.warn(`Failed to delete thread, this is a discord internal error\n${e.stack}`)
                                    })
                                }
                            } else log.warn(`Failed to fetch text channel while clearing bot state`)
                        })
                        .catch((e) => {
                            log.warn(`Failed to fetch text channel while clearing bot state\n${e.stack}`)
                        })

                    global.musicState.taskQueue.enqueueTask('Leave', [null, true])
                }
            } else {
                await client.channels
                    .fetch(currentVC)
                    .then(async (channel: VoiceChannel) => {
                        if (channel.members.size === 1 && channel.members.get(client.user.id) !== undefined) {
                            /* Bot alone in call */
                            log.debug(`Bot alone in call, clearing state...`)

                            if (global.dataState.isThreadCreated === true) {
                                await client.channels
                                    .fetch(currentTC)
                                    .then(async (channel: TextChannel) => {
                                        let findThread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                        if (findThread !== undefined) {
                                            log.info('Thread found! Deleting...')

                                            await findThread.delete().catch((e) => {
                                                log.warn(`Failed to delete thread, this is a discord internal error\n${e.stack}`)
                                            })
                                        }
                                    })
                                    .catch((e) => {
                                        log.warn(`Failed to fetch text channel while clearing state`)
                                    })
                            }

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
                                        let thread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                        if (global.musicState.mainEmbedMessageID !== '' && global.dataState.isThreadCreated === true) {
                                            log.debug(`Editing message...`)

                                            await thread.messages.fetch(global.musicState.mainEmbedMessageID).then(async (message: Message) => {
                                                try {
                                                    await message.edit({ embeds: [await global.musicState.mainEmbedMessage()], components: [global.musicState.mainEmbedMessageButtons()] })
                                                } catch (e) {
                                                    log.error(`Failed to edit message while handover, this is a discord internal error\n${e.stack}`)
                                                }
                                            })
                                        }

                                        if (thread.members.cache.get(nextAnchorUserId) === undefined) {
                                            log.debug(`New anchor user is not in the thread, adding member...`)

                                            try {
                                                await thread.members.add(nextAnchorUserId)
                                            } catch (e) {
                                                log.error(`Failed to add member while handover, this is a discord internal error\n${e.stack}`)
                                            }
                                        }

                                        if (global.dataState.isThreadCreated === true) await updateMainEmbedMessage()
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
                                    let thread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                    if (thread !== undefined && thread.members.cache.get(oldChannel.id) !== undefined) {
                                        log.debug(`Member was in thread, removing...`)

                                        try {
                                            await thread.members.remove(oldChannel.id)

                                            log.success({ message: `Done`, level: 4 })
                                        } catch (e) {
                                            log.error(`Failed to remove thread member, this is a discord internal error\n${e.stack}`)
                                        }
                                    }

                                    if (global.dataState.isThreadCreated === true) await updateMainEmbedMessage()
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
