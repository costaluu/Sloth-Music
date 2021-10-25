import { Event, Command } from '../Interfaces'
import { Message, VoiceState, VoiceChannel, TextChannel, User } from 'discord.js'
import Logger from '../Logger'
import { sendEphemeralEmbed, Color } from '../Utils'
import Configs from '../config.json'
const log = Logger(Configs.EventsLogLevel, 'voiceStateUpdate.ts')

export const event: Event = {
    name: 'voiceStateUpdate',
    run: async (client, oldChannel: VoiceState, newChannel: VoiceState) => {
        if (oldChannel.channelId === `${global.dataState.voiceChannelID}` && newChannel.channelId !== `${global.dataState.voiceChannelID}`) {
            await client.channels.fetch(global.dataState.voiceChannelID).then(async (channel: VoiceChannel) => {
                if (channel) {
                    if (channel.members.size === 1 && channel.members.get(client.user.id) !== undefined) {
                        log.debug(`Bot alone in call, clearing state...`)

                        await client.channels.fetch(global.dataState.channelID).then(async (channel: TextChannel) => {
                            if (channel) {
                                let findThread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                if (findThread !== undefined) {
                                    log.info('Thread found! Deleting...')

                                    try {
                                        await findThread.delete()
                                    } catch (e) {
                                        log.error(new Error(`Failed to delete thread, this is a discord internal error ${e.stack}`))
                                    }
                                }

                                await global.musicState.player.destroy()

                                global.musicState.clear()
                                global.dataState.clear()
                            } else log.warn(`Failed to fetch text channel while clearing state`)
                        })
                    } else if (oldChannel.id === global.dataState.anchorUser.id) {
                        // Handover

                        log.debug(`Executing a handover, fetching new anchor user...`)

                        let iterator = channel.members.keys()
                        let nextAnchorUserId = iterator.next().value

                        while (nextAnchorUserId === client.user.id) nextAnchorUserId = iterator.next().value

                        global.dataState.anchorUser = channel.members.get(nextAnchorUserId).user as User

                        if (global.dataState.anchorUser) log.debug(`New anchor user found!`)

                        await client.channels.fetch(global.dataState.channelID).then(async (channel: TextChannel) => {
                            if (channel) {
                                let thread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                if (thread !== undefined) {
                                    if (global.musicState.mainEmbedMessageID !== '') {
                                        log.debug(`Editing message...`)

                                        await thread.messages.fetch(global.musicState.mainEmbedMessageID).then(async (message: Message) => {
                                            try {
                                                await message.edit({ embeds: [await global.musicState.mainEmbedMessage()], components: [global.musicState.mainEmbedMessageButtons()], files: [global.musicState.thumbSloth] })
                                            } catch (e) {
                                                log.error(`Failed to edit message while handover, this is a discord internal error ${e.stack}`)
                                            }
                                        })
                                    }

                                    if (thread.members.cache.get(nextAnchorUserId) === undefined) {
                                        log.debug(`New anchor user is not in the thread, adding member...`)

                                        try {
                                            await thread.members.add(nextAnchorUserId)
                                        } catch (e) {
                                            log.error(`Failed to add member while handover, this is a discord internal error ${e.stack}`)
                                        }
                                    }

                                    //if (global.dataState.isThreadCreated === true) await updateMainEmbedMessage()
                                } else log.warn(`Thread not found while handover`)
                            } else log.warn(`Failed to fetch text channel while handover`)
                        })
                    } else if (oldChannel.id === client.user.id) {
                        log.debug(`Bot left the voice channel, clearing state...`)

                        if (global.dataState.channelID !== '') {
                            await client.channels.fetch(global.dataState.channelID).then(async (channel: TextChannel) => {
                                if (channel) {
                                    let findThread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                                    if (findThread !== undefined) {
                                        log.debug('Thread found! Deleting...')

                                        try {
                                            await findThread.delete()
                                        } catch (e) {
                                            log.error(new Error(`Failed to delete thread, this is a discord internal error ${e.stack}`))
                                        }
                                    }

                                    await global.musicState.player.destroy()

                                    global.musicState.clear()
                                    global.dataState.clear()
                                } else log.warn(`Failed to fetch text channel while clearing bot state`)
                            })
                        } else log.warn(`ChannelID not registred while clearing bot state`)
                    }

                    if (global.dataState.channelID !== '') {
                        log.debug(`Common member left the channel, checking thread members...`)

                        await client.channels.fetch(global.dataState.channelID).then(async (channel: TextChannel) => {
                            if (channel) {
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
                            } else log.warn(`Failed to fetch text channel while checking thread members`)
                        })
                    }
                } else log.warn(`Failed to fetch voice channel while updating member voice state`)
            })
        } else if (newChannel.channelId === `${global.dataState.voiceChannelID}`) {
            //if (global.dataState.isThreadCreated === true) await updateMainEmbedMessage()
        }
    },
}
