import { Command } from '../../Interfaces'
import { safeReact, Reactions, sendEphemeralEmbed, Color } from '../../Utils'
import { Message } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'thread.ts')

export const command: Command = {
    name: 'thread',
    aliases: ['t'],
    description: 'Creates a dedicated thread to the music bot.',
    run: async (client, ctx) => {
        await sendEphemeralEmbed(ctx.channel, {
            color: Color.info,
            author: {
                name: 'This function is not implemented yet.',
            },
        })

        return
    },
}
