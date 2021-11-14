import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Emojis, sendEphemeralEmbed, Color } from '../../Utils'
import { VoiceChannel } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'bassboost.ts')

export const command: Command = {
    name: 'bassboost',
    aliases: ['bass'],
    description: 'Change the bass mode: none | low | medium | high',
    run: async (client, ctx, level) => {
        if (global.musicState.player === null) {
            await safeReact(ctx, Emojis.error)

            return
        }

        if (level[0] === '') {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.warn,
                author: {
                    name: `Please input a bassboost level: none | low | medium | high`,
                },
            })

            return
        }

        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

        await ctx.guild.channels
            .fetch(global.musicState.player.voiceChannel)
            .then(async (voiceChannel: VoiceChannel) => {
                let member = voiceChannel.members.get(ctx.author.id)

                if (member !== undefined || userPermissions[0] === RoleLevel.ControlRole) {
                    if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true)) {
                        global.musicState.taskQueue.enqueueTask('Bassboost', [ctx, level[0].toLowerCase()])
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
