import { TextChannel, Message, TextBasedChannels, ThreadChannel } from 'discord.js'
import Logger from '../Logger'
import Configs from '../config.json'
const log = Logger(Configs.CommandsLogLevel, 'utils.ts')

export enum Color {
    info = parseInt(Configs.Colors.info),
    warn = parseInt(Configs.Colors.warn),
    success = parseInt(Configs.Colors.success),
    error = parseInt(Configs.Colors.error),
}

export enum Emojis {
    success = '<:zslothsalute:695418865131454534>',
    error = '<:zslothmad:859400824421613588>',
    playlist = '💽',
    song = '🎵',
}

export async function sendEphemeralEmbed(textChannel: TextChannel | TextBasedChannels, content: Object): Promise<void> {
    await textChannel
        .send({
            embeds: [content],
        })
        .then((message: Message) => {
            setTimeout(() => {
                message.delete().catch((e) => {
                    log.debug(`Failed to delete message, this is a discord internal error\n${e.stack}`)
                })
            }, Configs.EphemeralMessageTime * 1000)
        })
        .catch((e) => {
            log.debug(`Failed to send message, this is a discord internal error\n${e.stack}`)
        })
}

export async function safeReact(message: Message, reaction: string): Promise<void> {
    await message.react(reaction).catch((e) => {
        log.debug(`Failed to react, this is a discord internal error\n${e.stack}`)
    })
}
