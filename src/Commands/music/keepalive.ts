import { Command } from '../../Interfaces'
import { safeReact, Emojis, Color, sendEphemeralEmbed } from '../../Utils'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'keepalive.ts')

export const command: Command = {
    name: 'keepalive',
    aliases: ['keep', 'kpa'],
    description: 'Toggles if the bot shoud stay on VC or not after queue end event.',
    run: async (client, ctx) => {
        let managerPermission: boolean = await global.dataState.managerBotPermission(ctx)

        if (managerPermission === true) {
            global.dataState.keepAlive = !global.dataState.keepAlive

            if (global.dataState.keepAlive === true) {
                await sendEphemeralEmbed(ctx.channel, {
                    color: Color.success,
                    author: {
                        name: `Keep alive mode: on. 🦜`,
                    },
                })
            } else {
                await sendEphemeralEmbed(ctx.channel, {
                    color: Color.success,
                    author: {
                        name: `Keep alive mode: off.`,
                    },
                })
            }
        } else await safeReact(ctx, Emojis.error)
    },
}
