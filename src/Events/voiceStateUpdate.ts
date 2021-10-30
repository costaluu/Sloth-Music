import { Event } from '../Interfaces'
import { Message, VoiceState, VoiceChannel, TextChannel, User } from 'discord.js'
import Logger from '../Logger'
import Configs from '../config.json'
const log = Logger(Configs.EventsLogLevel, 'voiceStateUpdate.ts')

export const event: Event = {
    name: 'voiceStateUpdate',
    run: async (client, oldChannel: VoiceState, newChannel: VoiceState) => {
        if (global.musicState.player !== null) {
            let textChannelID = global.musicState.player.textChannel
            let voiceChannelID = global.musicState.player.voiceChannel

            if (newChannel.channelId === oldChannel.channelId && oldChannel.id === client.user.id) {
                /* Bot was disconnected from VC */

                log.debug(`Bot left the voice channel, clearing state...`)

                await client.channels
                    .fetch(textChannelID)
                    .then(async (channel: TextChannel) => {
                        if (channel) {
                            let findThread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                            if (findThread !== undefined) {
                                log.debug('Thread found! Deleting...')

                                await findThread.delete().catch((e) => {
                                    log.warn(`Failed to delete thread, this is a discord internal error\n${e.stack}`)
                                })
                            }

                            global.musicState.clear()
                            global.dataState.clear()
                        } else log.warn(`Failed to fetch text channel while clearing bot state`)
                    })
                    .catch((e) => {
                        log.warn(`Failed to fetch text channel while clearing bot state\n${e.stack}`)
                    })
            }
            if (newChannel.channelId === voiceChannelID && oldChannel.channelId !== newChannel.channelId && newChannel.id !== client.user.id) {
                /* A user joined on VC */
                console.log('a')
                //if (global.dataState.isThreadCreated === true) await updateMainEmbedMessage()
            } else if (newChannel.channelId !== voiceChannelID) {
                console.log('b')
                /* A user left the channel */
                if (oldChannel.id === client.user.id) {
                    console.log('c')
                    /* This user is the client */
                    if (newChannel.channelId !== voiceChannelID) {
                        /* Bot change voice channel */
                        console.log('e')

                        log.debug(`Bot changed to another VC!`)

                        try {
                            global.musicState.player.setVoiceChannel(newChannel.channelId)
                        } catch (e) {
                            log.warn(`Failed to change voice channel exiting...\n${e.stack}`)

                            /* TODO: Change task queue structure to accept optional parameters, this is necessary to make the client leave if something happen */

                            //global.musicState.taskQueue.enqueueTask('Leave', [ctx])
                        }
                    }
                } else {
                    /* Its a user */
                    console.log('f')

                    await client.channels
                        .fetch(voiceChannelID)
                        .then(async (channel: VoiceChannel) => {
                            if (channel.members.size === 1 && channel.members.get(client.user.id) !== undefined) {
                                /* Bot alone in call */
                                console.log('g')

                                log.debug(`Bot alone in call, clearing state...`)

                                await client.channels
                                    .fetch(textChannelID)
                                    .then(async (channel: TextChannel) => {
                                        let findThread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                        if (findThread !== undefined) {
                                            log.info('Thread found! Deleting...')

                                            await findThread.delete().catch((e) => {
                                                log.warn(`Failed to delete thread, this is a discord internal error\n${e.stack}`)
                                            })
                                        }

                                        try {
                                            global.musicState.clear()
                                            global.dataState.clear()
                                        } catch (e) {
                                            log.warn(`Failed to destroy the player\n${e.stack}`)
                                        }
                                    })
                                    .catch((e) => {
                                        log.warn(`Failed to fetch text channel while clearing state`)
                                    })
                            } else if (oldChannel.id === global.dataState.anchorUser.id) {
                                console.log('h')
                                /* Anchoruser left, handover */

                                log.debug(`Executing a handover, fetching new anchor user...`)

                                let iterator = channel.members.keys()
                                let nextAnchorUserId = iterator.next().value

                                while (nextAnchorUserId === client.user.id) nextAnchorUserId = iterator.next().value

                                global.dataState.anchorUser = channel.members.get(nextAnchorUserId).user as User

                                if (global.dataState.anchorUser) log.debug(`New anchor user found!`)

                                if (global.dataState.isThreadCreated === true) {
                                    await client.channels
                                        .fetch(textChannelID)
                                        .then(async (channel: TextChannel) => {
                                            let thread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                            if (global.musicState.mainEmbedMessageID !== '') {
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

                                            //if (global.dataState.isThreadCreated === true) await updateMainEmbedMessage()
                                        })
                                        .catch((e) => {
                                            log.warn(`Failed to fetch text channel while handover, this is a discord internal error\n${e.stack}`)
                                        })
                                }
                            } else if (global.dataState.isThreadCreated === true) {
                                console.log('i')
                                /* Common user left the channel */

                                log.debug(`Common member left the channel, checking thread members...`)

                                await client.channels
                                    .fetch(textChannelID)
                                    .then(async (channel: TextChannel) => {
                                        let thread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                        if (thread !== undefined && thread.members.cache.get(oldChannel.id) !== undefined) {
                                            log.debug(`Member was in thread, removing...`)

                                            try {
                                                await thread.members.remove(oldChannel.id)

                                                log.success({ message: `Done`, level: 4 })
                                            } catch (e) {
                                                log.error(new Error(`Failed to remove thread member, this is a discord internal error ${e.stack}`))
                                            }
                                        }

                                        //if (global.dataState.isThreadCreated === true) await updateMainEmbedMessage()
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
        }
    },
}
