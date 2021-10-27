import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Reactions } from '../../Utils'
import { VoiceChannel } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'remove.ts')

export const command: Command = {
    name: 'remove',
    aliases: ['rm'],
    description: 'Removes a specific song in a given position.',
    run: async (client, ctx, pos) => {
        let position: number = parseInt(pos[0])

        if (global.musicState.player === null || global.musicState.player.queue.current === null || isNaN(position) === true) {
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
                            position = position - 1
                            if (position >= 0 && position < global.musicState.player.queue.length) {
                                global.musicState.taskQueue.enqueueTask('Remove', [ctx, position])
                            } else await safeReact(ctx, Reactions.error)
                        } else {
                            await safeReact(ctx, Reactions.error)
                        }
                    } else await safeReact(ctx, Reactions.error)

                    global.musicState.player.queue.pagesGenerator()

                    return
                })
                .catch(async (e) => {
                    log.error(`Failed to fetch voice channel, this is a discord internal error\n${e.stack}`)

                    await safeReact(ctx, Reactions.error)

                    return
                })
        } else log.debug(`Received a skip command while voiceChannelID was no registred`)
    },
}
