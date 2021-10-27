import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Reactions } from '../../Utils'
import { VoiceChannel } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'toggle.ts')

export const command: Command = {
    name: 'toggle',
    aliases: ['tg'],
    description: 'Pause and unpause the player.',
    run: async (client, ctx) => {
        if (global.musicState.player === null) {
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
                        if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true)) {
                            global.musicState.taskQueue.enqueueTask('Toggle', [ctx])
                        } else await safeReact(ctx, Reactions.error)
                    } else await safeReact(ctx, Reactions.error)
                })
                .catch(async (e) => {
                    log.error(`Failed to fetch voice channel, this is a discord internal error\n${e.stack}`)

                    await safeReact(ctx, Reactions.error)

                    return
                })
        } else log.debug(`Received a toggle command while voiceChannelID was no registred`)
    },
}
