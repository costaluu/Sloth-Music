import { Command } from '../../Interfaces'
import { safeReact, Emojis } from '../../Utils'

export const command: Command = {
    name: 'clearstate',
    aliases: [],
    description: 'Clear the state of the bot.',
    run: async (client, ctx) => {
        if (global.musicState.player === null) {
            await safeReact(ctx, Emojis.error)

            return
        }

        if (ctx.author.id === '358060034489581571') {
            await global.musicState.clear()
            global.dataState.clear()

            await safeReact(ctx, Emojis.success)
        } else await safeReact(ctx, Emojis.error)
    },
}
