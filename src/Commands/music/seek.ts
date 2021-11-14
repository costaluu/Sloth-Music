import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Emojis, durationToMS, sendEphemeralEmbed, Color } from '../../Utils'
import { VoiceChannel } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'seek.ts')

export const command: Command = {
    name: 'seek',
    aliases: ['sk'],
    description: 'Seek to a specific music position.',
    run: async (client, ctx, duration) => {
        if (global.musicState.player === null) {
            await safeReact(ctx, Emojis.error)

            return
        }

        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

        await ctx.guild.channels
            .fetch(global.musicState.player.voiceChannel)
            .then(async (voiceChannel: VoiceChannel) => {
                let member = voiceChannel.members.get(ctx.author.id)

                if (member !== undefined || userPermissions[0] === RoleLevel.ControlRole) {
                    if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true)) {
                        let msDuration: number | null = durationToMS(duration[0])
                        if (msDuration !== null && msDuration < global.musicState.player.queue.current.duration) global.musicState.taskQueue.enqueueTask('Seek', [ctx, msDuration])
                        else {
                            await sendEphemeralEmbed(ctx.channel, {
                                color: Color.warn,
                                author: {
                                    name: `Wrong format or parameter, the correct format is HH:MM:SS, MM:SS, SS, Please try again.`,
                                },
                            })
                        }
                    } else await safeReact(ctx, Emojis.error)
                } else await safeReact(ctx, Emojis.error)
            })
            .catch(async (e) => {
                log.error(`Failed to fetch voice channel, this is a discord internal error\n${e.stack}`)

                await safeReact(ctx, Emojis.error)

                return
            })
    },
}
