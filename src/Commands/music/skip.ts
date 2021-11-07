import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Emojis, sendEphemeralEmbed, Color } from '../../Utils'
import { VoiceChannel } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'skip.ts')

export const command: Command = {
    name: 'skip',
    aliases: ['s', 'skipto', 'next'],
    description: 'Adds a skip vote or skips the song.',
    run: async (client, ctx) => {
        if (global.musicState.player === null || global.musicState.player.queue.current === null) {
            await safeReact(ctx, Emojis.error)

            return
        }

        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

        await ctx.guild.channels
            .fetch(global.musicState.player.voiceChannel)
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
                        await safeReact(ctx, Emojis.error)

                        return
                    }

                    if (global.musicState.currentSkipVotes === votesToSkip) {
                        global.musicState.taskQueue.enqueueTask('Skip', [ctx, false])
                    }

                    await safeReact(ctx, Emojis.success)
                } else await safeReact(ctx, Emojis.error)
            })
            .catch(async (e) => {
                log.error(`Failed to fetch voice channel, this is a discord internal error\n${e.stack}`)

                await safeReact(ctx, Emojis.error)
            })
    },
}
