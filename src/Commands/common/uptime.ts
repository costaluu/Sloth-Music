import { Message } from 'discord.js'
import { Command } from '../../Interfaces'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'uptime.ts')

export const command: Command = {
    name: 'uptime',
    aliases: ['upt'],
    description: 'Shows connection status.',
    run: async (client, message) => {
        try {
            let uptime = Math.floor((+new Date() - client.uptime) / 1000)
            await message.reply(`I have been online for <t:${uptime}:R>`).then((message: Message) => {
                setTimeout(async () => {
                    await message.delete()
                }, Configs.EphemeralMessageTime * 1000)
            })
        } catch (e) {
            log.debug(`Failed to send message during ping command, this is a discord internal error\n${e.stack}`)
        }
    },
}
