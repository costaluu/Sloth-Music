import { Command } from '../../Interfaces'
import { safeReact, Emojis } from '../../Utils'

export const command: Command = {
    name: 'reboot',
    aliases: [],
    description: 'Reboots the bot',
    run: async (client, ctx) => {
        let managerPermission: boolean = await global.dataState.managerBotPermission(ctx)

        if (managerPermission === true) {
            await global.musicState.clear(true)

            await safeReact(ctx, Emojis.success)

            await process.exit(1)
        } else await safeReact(ctx, Emojis.error)
    },
}
