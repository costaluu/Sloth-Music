import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Reactions, sendEphemeralEmbed, Color } from '../../Utils'
import { VoiceChannel } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'skip.ts')

export const command: Command = {
    name: 'skip',
    aliases: ['s'],
    description: 'Adds a skip vote or skips the song.',
    run: async (client, ctx) => {
        if (global.musicState.player === null || global.musicState.player.queue.current === null || global.musicState.player.queue.current === undefined) {
            await safeReact(ctx, Reactions.error)

            return
        }

        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

        if (global.dataState.voiceChannelID !== '') {
            await ctx.guild.channels
                .fetch(global.dataState.voiceChannelID)
                .then(async (voiceChannel: VoiceChannel) => {
                    let member = voiceChannel.members.get(ctx.author.id)

                    if (member !== undefined || userPermissions[0] === RoleLevel.ControlRole) {
                        let votesToSkip = await global.musicState.votesToSkip()

                        if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true)) {
                            global.musicState.currentSkipVotes = votesToSkip
                        } else if (global.musicState.votesByUser.get(ctx.author.id) === undefined) {
                            global.musicState.votesByUser.set(ctx.author.id, true) /* Unique vote */

                            global.musicState.currentSkipVotes = global.musicState.currentSkipVotes + 1

                            await sendEphemeralEmbed(ctx.channel, {
                                color: Color.success,
                                author: {
                                    name: `Skip votes ${global.musicState.currentSkipVotes}/${votesToSkip}`,
                                },
                            })
                        } else {
                            await safeReact(ctx, Reactions.error)

                            return
                        }

                        if (global.musicState.currentSkipVotes === votesToSkip) {
                            await sendEphemeralEmbed(ctx.channel, {
                                color: Color.success,
                                author: {
                                    name: `Skipping...`,
                                },
                            })

                            global.musicState.currentSkipVotes = 0
                            global.musicState.votesByUser = new Map()

                            if (global.musicState.player.queueRepeat === true || global.musicState.player.trackRepeat === true) global.musicState.player.queue.push(global.musicState.player.queue.current)

                            await global.musicState.player.stop()

                            global.musicState.player.queue.pagesGenerator()
                        }

                        await safeReact(ctx, Reactions.success)
                    } else await safeReact(ctx, Reactions.error)
                })
                .catch(async (e) => {
                    log.error(`Failed to fetch voice channel, this is a discord internal error\n${e.stack}`)

                    await safeReact(ctx, Reactions.error)

                    return
                })
        } else log.debug(`Received a skip command while voiceChannelID was no registred`)
    },
}
