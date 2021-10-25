import { Command } from '../../Interfaces'
import { safeReact, Reactions } from '../../Utils'
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

        if (global.musicState.player === null) {
            await safeReact(ctx, Reactions.error)

            return
        }

        if (isNaN(position) === true) position = 0
        else if (position - 1 >= 0 && position - 1 < global.musicState.player.queue.pages.length) position = position - 1
        else position = 0

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
