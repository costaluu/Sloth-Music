import { Command } from '../../Interfaces'
import { safeReact, Emojis } from '../../Utils'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'clearstate.ts')

export const command: Command = {
    name: 'clearstate',
    aliases: [],
    description: 'Clear the state of the bot.',
    run: async (client, ctx) => {
        let managerPermission: boolean = await global.dataState.managerBotPermission(ctx)

        if (managerPermission === true) {
            log.info(`Clear state requested by ${ctx.author.username}#${ctx.author.discriminator}`)

            await global.musicState.clear(true)

            await safeReact(ctx, Emojis.success)
        } else await safeReact(ctx, Emojis.error)
    },
}
