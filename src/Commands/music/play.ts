import { Command } from '../../Interfaces'
import { Color, sendEphemeralEmbed } from '../../Utils'
import { VoiceChannel, User, TextChannel } from 'discord.js'
import Logger from '../../Logger'
import { SearchResult, Player } from 'erela.js'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'play.ts')

export const command: Command = {
    name: 'play',
    aliases: ['p'],
    description: 'Plays track(s) from a given source(free text / links / playlists / albums).',
    run: async (client, ctx, request) => {
        request[0] = request[0].trim()

        if (ctx.member.voice.channel === null) {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.error,
                author: {
                    name: `You are not in a Voice Channel`,
                },
            })

            return
        }

        const voiceChannel = ctx.member.voice.channel as VoiceChannel

        if (voiceChannel.joinable === false) {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.error,
                author: {
                    name: `I don't have permission to join in this voice channel`,
                },
            })

            return
        }

        if (voiceChannel.speakable === false) {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.error,
                author: {
                    name: `I don't have permission to speak in this voice channel`,
                },
            })

            return
        }

        let checkNode: Player | undefined = client.manager.get(ctx.guild.id)

        if (!checkNode) {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.error,
                author: {
                    name: `Node not connected`,
                },
            })

            return
        }

        try {
            if (global.musicState.player === null) {
                log.debug(`Setting up player and Bot state...`)

                const channel = ctx.channel as TextChannel
                global.dataState.anchorUser = ctx.author as User

                global.musicState.player = client.manager.create({
                    guild: channel.guild.id,
                    voiceChannel: voiceChannel.id,
                    textChannel: channel.id,
                    selfDeafen: true,
                })
            }

            if (!global.musicState.player) {
                await sendEphemeralEmbed(ctx.channel, {
                    color: Color.error,
                    author: {
                        name: `There is not player at moment`,
                    },
                })

                return
            }

            if (global.musicState.player.state !== 'CONNECTED') global.musicState.player.connect()
        } catch (e) {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.error,
                author: {
                    name: 'Failed to connect to voice channel, please try again',
                },
            })

            global.musicState.taskQueue.enqueueTask('Leave', [null, true])

            return
        }

        await ctx.guild.channels
            .fetch(global.musicState.player.voiceChannel)
            .then(async (voiceChannel: VoiceChannel) => {
                if (voiceChannel) {
                    if (voiceChannel.members.get(ctx.author.id) !== undefined) {
                        if (global.musicState.player.queue.totalSize + 1 >= Configs.maxPagesInQueue * Configs.maxSongsPerPage) {
                            await sendEphemeralEmbed(ctx.channel, {
                                color: Color.error,
                                author: {
                                    name: "The queue is full, you can't add more songs",
                                },
                            })

                            return
                        }

                        let query: SearchResult = await global.musicState.player.search(request[0], ctx.author)

                        try {
                            if (query.loadType === 'LOAD_FAILED') {
                                if (!global.musicState.player.queue.current) global.musicState.taskQueue.enqueueTask('Leave', [null, true])
                            } else if (query.loadType === 'NO_MATCHES' || request[0] === '') {
                                await sendEphemeralEmbed(ctx.channel, {
                                    color: Color.error,
                                    author: {
                                        name: `No song found.`,
                                    },
                                })

                                return
                            }

                            global.musicState.taskQueue.enqueueTask('Enqueue', [ctx, query])
                        } catch (e) {
                            await sendEphemeralEmbed(ctx.channel, {
                                color: Color.error,
                                author: {
                                    name: `There was an error while searching.`,
                                },
                            })

                            log.warn(`There was an error while searching\n${e.stack}`)
                        }
                    } else {
                        await sendEphemeralEmbed(ctx.channel, {
                            color: Color.error,
                            author: {
                                name: 'Failed to connect to voice channel, please try again',
                            },
                        })

                        global.musicState.taskQueue.enqueueTask('Leave', [null, true])
                    }
                } else {
                    await sendEphemeralEmbed(ctx.channel, {
                        color: Color.error,
                        author: {
                            name: `I'm in another voice channel`,
                        },
                    })
                }
            })
            .catch((e) => {
                log.warn(`Failed to fetch the voice channel, this is a discord internal error\n${e.stack}`)
            })
    },
}
