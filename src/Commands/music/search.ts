import { Command, RoleLevel } from '../../Interfaces'
import { Color, sendEphemeralEmbed, safeReact, Reactions } from '../../Utils'
import { VoiceChannel, User, TextChannel } from 'discord.js'
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
