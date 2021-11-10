import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Emojis } from '../../Utils'
import { Message } from 'discord.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'queue.ts')

export const command: Command = {
    name: 'queue',
    aliases: ['q'],
    description: 'Shows the current or specific queue page.',
    run: async (client, ctx, page) => {
        let position: number = parseInt(page[0])
        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

        if (global.musicState.player === null || userPermissions[1] === false) {
            await safeReact(ctx, Emojis.error)

            return
        }

        if (isNaN(position) === true || position <= 0 || position > global.musicState.player.queue.pagesCount()) position = 1

        ctx.reply(global.musicState.player.queue.pageTextGenerator(position))
            .then((message: Message) => {
                setTimeout(async () => {
                    await message.delete()
                }, Configs.EphemeralMessageTime * 1000)
            })
            .catch((e) => {
                log.debug(`Failed to send message, this is a discord internal error\n${e.stack}`)
            })

        return
    },
}
