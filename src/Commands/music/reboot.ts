import { Command } from '../../Interfaces'
import { safeReact, Emojis } from '../../Utils'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'reboot.ts')

export const command: Command = {
    name: 'reboot',
    aliases: [],
    description: 'Reboots the bot',
    run: async (client, ctx) => {
        let managerPermission: boolean = await global.dataState.managerBotPermission(ctx)

        if (managerPermission === true) {
            log.info(`Reboot requested by ${ctx.author.username}#${ctx.author.discriminator}`)

            await global.musicState.clear(true)

            await safeReact(ctx, Emojis.success)

            process.exit(1)
        } else await safeReact(ctx, Emojis.error)
    },
}
