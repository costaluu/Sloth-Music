import { Command, RoleLevel } from '../../Interfaces'
import { Color, sendEphemeralEmbed, safeReact, Emojis } from '../../Utils'
import { VoiceChannel, User, TextChannel, MessageActionRow, MessageButton, Interaction, ButtonInteraction } from 'discord.js'
import Logger from '../../Logger'
import { SearchResult } from 'erela.js'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'search.ts')

export const command: Command = {
    name: 'search',
    aliases: ['srch', 'src'],
    description: 'Search for a video on youtube.',
    run: async (client, ctx, request) => {
        request[0] = request[0].trim()

        if (global.musicState.player === null || global.musicState.player.queue.current === null) {
            await safeReact(ctx, Emojis.error)

            return
        }

        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

        if (global.dataState.voiceChannelID !== '') {
            await ctx.guild.channels
                .fetch(global.dataState.voiceChannelID)
                .then(async (voiceChannel: VoiceChannel) => {
                    let member = voiceChannel.members.get(ctx.author.id)

                    if (member !== undefined || userPermissions[0] === RoleLevel.ControlRole) {
                        let query: SearchResult = await global.musicState.player.search(request[0], ctx.author)

                        try {
                            if (query.loadType === 'LOAD_FAILED') {
                                if (!global.musicState.player.queue.current) global.musicState.player.destroy()

                                throw query.exception
                            } else if (query.loadType === 'NO_MATCHES' || request[0] === '') {
                                await sendEphemeralEmbed(ctx.channel, {
                                    color: Color.error,
                                    author: {
                                        name: `No song found.`,
                                    },
                                })

                                return
                            }

                            if (query.loadType === 'SEARCH_RESULT') {
                                try {
                                    const searchEmbedRowButtonsSelect = new MessageActionRow().addComponents([
                                        new MessageButton().setCustomId('SearchFirst').setEmoji('1️⃣').setStyle('SECONDARY'),
                                        new MessageButton().setCustomId('SearchSecond').setEmoji('2️⃣').setStyle('SECONDARY'),
                                        new MessageButton().setCustomId('SearchThird').setEmoji('3️⃣').setStyle('SECONDARY'),
                                        new MessageButton().setCustomId('SearchFourth').setEmoji('4️⃣').setStyle('SECONDARY'),
                                        new MessageButton().setCustomId('SearchFifth').setEmoji('5️⃣').setStyle('SECONDARY'),
                                    ])
                                    const searchCancelRowButton = new MessageActionRow().addComponents([new MessageButton().setCustomId('SearchCancelButton').setEmoji('⭕').setStyle('SECONDARY')])

                                    let songs = '\n'

                                    for (let i = 0; i < 5; i++) songs += `${i + 1}. [${query.tracks[i].title}](${query.tracks[i].uri})\n`

                                    songs += '0. Cancel\n'

                                    let sendedMessage = await ctx.reply({
                                        embeds: [
                                            {
                                                title: 'Choose a song 👉',
                                                color: Color.info,
                                                description: songs,
                                                footer: {
                                                    text: `${ctx.author.username}, hit a button to select a song`,
                                                    icon_url: ctx.author.displayAvatarURL(),
                                                },
                                            },
                                        ],
                                        components: [searchEmbedRowButtonsSelect, searchCancelRowButton],
                                    })

                                    const filter = (interaction) => interaction.user.id === ctx.author.id
                                    const collector = sendedMessage.channel.createMessageComponentCollector({ filter, time: 40 * 1000, max: 1 })

                                    collector.once('collect', async (interaction: ButtonInteraction) => {
                                        if (interaction.customId === 'SearchFirst') {
                                            global.musicState.taskQueue.enqueueTask('Enqueue', [ctx, query.tracks[0]])
                                        } else if (interaction.customId === 'SearchSecond') {
                                            global.musicState.taskQueue.enqueueTask('Enqueue', [ctx, query.tracks[1]])
                                        } else if (interaction.customId === 'SearchThird') {
                                            global.musicState.taskQueue.enqueueTask('Enqueue', [ctx, query.tracks[2]])
                                        } else if (interaction.customId === 'SearchFourth') {
                                            global.musicState.taskQueue.enqueueTask('Enqueue', [ctx, query.tracks[3]])
                                        } else if (interaction.customId === 'SearchFifth') {
                                            global.musicState.taskQueue.enqueueTask('Enqueue', [ctx, query.tracks[4]])
                                        }

                                        sendedMessage.delete().catch((e) => {
                                            log.error(`Failed to delete message, this is discord internal error\n${e.stack}`)
                                        })
                                    })

                                    collector.once('end', async () => {
                                        sendedMessage.delete().catch((e) => {
                                            log.debug(`Message already deleted!`)
                                        })
                                    })
                                } catch (e) {
                                    console.log(`Theres a error during search command\n${e.stack}`)

                                    await sendEphemeralEmbed(ctx.channel, {
                                        color: Color.error,
                                        author: {
                                            name: `No song found.`,
                                        },
                                    })

                                    return
                                }
                            } else {
                                await sendEphemeralEmbed(ctx.channel, {
                                    color: Color.error,
                                    author: {
                                        name: `You can't search with links, please input a valid query.`,
                                    },
                                })

                                return
                            }
                        } catch (e) {
                            await sendEphemeralEmbed(ctx.channel, {
                                color: Color.error,
                                author: {
                                    name: `There was an error while searching.`,
                                },
                            })

                            log.warn(`There was an error while searching\n${e.stack}`)
                        }
                    } else await safeReact(ctx, Emojis.error)
                })
                .catch(async (e) => {
                    log.error(`Failed to fetch voice channel, this is a discord internal error\n${e.stack}`)

                    await safeReact(ctx, Emojis.error)

                    return
                })
        } else log.debug(`Received a skip command while voiceChannelID was no registred`)
    },
}
