import { TextChannel, Message, TextBasedChannels } from 'discord.js'
import Logger from '../Logger'
import Configs from '../config.json'
const log = Logger(Configs.CommandsLogLevel, 'utils.ts')

/**
 * Colors enum.
 */

export enum Color {
    info = parseInt(Configs.Colors.info),
    warn = parseInt(Configs.Colors.warn),
    success = parseInt(Configs.Colors.success),
    error = parseInt(Configs.Colors.error),
}

/**
 * Emojis enum.
 */

export enum Emojis {
    success = '<:zslothsalute:695418865131454534>',
    error = '<:zslothmad:859400824421613588>',
    playlist = '💽',
    song = '🎵',
}

/**
 * Function to send safely a ephemeral embed wich is deleted after some time.
 */

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

/**
 * Function to react to a message safely.
 */

export async function safeReact(message: Message, reaction: string): Promise<void> {
    await message.react(reaction).catch((e) => {
        log.debug(`Failed to react, this is a discord internal error\n${e.stack}`)
    })
}

/**
 * Function to convert DD:HH:MM:ss string to milliseconds.
 */

export function durationToMS(durationStr: string): number | null {
    let regexDays = /^([0-9]+):(\d?\d):(\d?\d):(\d?\d)$/gm.exec(durationStr)
    let regexHours = /^(\d?\d):(\d?\d):(\d?\d)$/gm.exec(durationStr)
    let regexMinutes = /^(\d?\d):(\d?\d)$/gm.exec(durationStr)
    let regexSeconds = /^(\d?\d)$/gm.exec(durationStr)

    if (regexDays !== null) {
        let days = parseInt(regexDays[1]) * 86400000
        let hours = parseInt(regexDays[2]) * 3600000
        let minutes = parseInt(regexDays[3]) * 60000
        let seconds = parseInt(regexDays[4]) * 1000

        return days + hours + minutes + seconds
    } else if (regexHours !== null) {
        let hours = parseInt(regexHours[1]) * 3600000
        let minutes = parseInt(regexHours[2]) * 60000
        let seconds = parseInt(regexHours[3]) * 1000

        return hours + minutes + seconds
    } else if (regexMinutes !== null) {
        let minutes = parseInt(regexMinutes[1]) * 60000
        let seconds = parseInt(regexMinutes[2]) * 1000

        return minutes + seconds
    } else if (regexSeconds !== null) {
        return parseInt(regexSeconds[1]) * 1000
    } else return null
}
