import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Emojis, sendEphemeralEmbed, Color } from '../../Utils'
import { VoiceChannel } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'thread.ts')

export const command: Command = {
    name: 'thread',
    aliases: ['t'],
    description: 'Creates a dedicated thread to the music bot.',
    run: async (client, ctx) => {
        let managerPermission: boolean = await global.dataState.managerBotPermission(ctx)
        if (managerPermission === true) {
            if (global.musicState.player === null || global.dataState.isThreadCreated === true) {
                await safeReact(ctx, Emojis.error)

                return
            }

            let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

            await ctx.guild.channels
                .fetch(global.musicState.player.voiceChannel)
                .then(async (voiceChannel: VoiceChannel) => {
                    let member = voiceChannel.members.get(ctx.author.id)

                    if (member !== undefined || userPermissions[0] === RoleLevel.ControlRole) {
                        if (
                            (global.musicState.player.queue.length > 0 && userPermissions[0] === RoleLevel.ControlRole) ||
                            (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) ||
                            (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true)
                        ) {
                            global.musicState.taskQueue.enqueueTask('Thread', [client, ctx])
                        } else await safeReact(ctx, Emojis.error)
                    } else await safeReact(ctx, Emojis.error)
                })
                .catch(async (e) => {
                    log.error(`Failed to fetch voice channel, this is a discord internal error\n${e.stack}`)

                    await safeReact(ctx, Emojis.error)

                    return
                })
        } else {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.info,
                author: {
                    name: 'This function is not implemented yet.',
                },
            })
        }
        return
    },
}
