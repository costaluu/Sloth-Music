import { Command } from '../../Interfaces'
import { safeReact, Emojis, sendEphemeralEmbed, Color } from '../../Utils'
import { Message, User } from 'discord.js'
import { Player, Track, UnresolvedTrack } from 'erela.js'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'nowplaying.ts')

/**
 * Thanks to string-progressbar for this function
 * https://github.com/Sparker-99/string-progressbar
 */

const splitBar = (total: number, current: number, size: number = 40, line: string = '▬', slider: string = '🔘'): string => {
    if (!total) throw new Error('Total value is either not provided or invalid')
    if (!current && current !== 0) throw new Error('Current value is either not provided or invalid')
    if (isNaN(total)) throw new Error('Total value is not an integer')
    if (isNaN(current)) throw new Error('Current value is not an integer')
    if (isNaN(size)) throw new Error('Size is not an integer')
    if (current > total) {
        const bar = line.repeat(size + 2)
        const percentage = (current / total) * 100
        return bar
    } else {
        const percentage = current / total
        const progress = Math.round(size * percentage)
        const emptyProgress = size - progress
        const progressText = line.repeat(progress).replace(/.$/, slider)
        const emptyProgressText = line.repeat(emptyProgress)
        const bar = progressText + emptyProgressText
        const calculated = percentage * 100
        return bar
    }
}

export const command: Command = {
    name: 'nowplaying',
    aliases: ['np'],
    description: 'Shows the current song.',
    run: async (client, ctx) => {
        if (global.musicState.player === null && global.musicState.player.queue.current !== null) {
            await safeReact(ctx, Emojis.error)

            return
        }

        let player: Player = global.musicState.player

        let current: Track | UnresolvedTrack = player.queue.current

        let requester: User = current.requester as any as User

        let split: string = splitBar(current?.duration, player.position, 15, '▬', '🔘')

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.info,
            author: {
                name: 'Now playing 🔊',
            },
            title: global.musicState.mainEmbedMessageTitle(current.isStream, false),
            url: current.uri,
            description:
                `- Requested by <@${requester.id}>` +
                (current.isStream === true ? '' : `\n\n▶️ ${split}\n\n[${global.musicState.player.queue.getDurationString(player.position)}/${global.musicState.player.queue.getDurationString(current.duration)}]\n`),
        })

        return
    },
}
