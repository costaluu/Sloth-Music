import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Emojis } from '../../Utils'

export const command: Command = {
    name: 'lyrics',
    aliases: ['ly'],
    description: 'Searches the lyrics of the current song.',
    run: async (client, ctx) => {
        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

        if (global.musicState.player === null || global.musicState.player.queue.current === null || userPermissions[1] === false) {
            await safeReact(ctx, Emojis.error)

            return
        }

        global.musicState.taskQueue.enqueueTask('Lyrics', [ctx])

        return
    },
}
