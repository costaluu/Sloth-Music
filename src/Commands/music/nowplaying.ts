import { Command, RoleLevel } from '../../Interfaces'
import { safeReact, Emojis, sendEphemeralEmbed, Color } from '../../Utils'
import { User } from 'discord.js'
import { Player, Track, UnresolvedTrack } from 'erela.js'

/**
 * Thanks to string-progressbar for this function
 * https://github.com/Sparker-99/string-progressbar
 */

const splitBar = (total: number, current: number, size: number = 40, line: string = '▬', slider: string = '🔵'): string => {
    if (!total) throw new Error('Total value is either not provided or invalid')
    if (!current && current !== 0) throw new Error('Current value is either not provided or invalid')
    if (isNaN(total)) throw new Error('Total value is not an integer')
    if (isNaN(current)) throw new Error('Current value is not an integer')
    if (isNaN(size)) throw new Error('Size is not an integer')
    if (current > total) {
        const bar = line.repeat(size + 2)
        return bar
    } else {
        const percentage = current / total
        const progress = Math.round(size * percentage)
        const emptyProgress = size - progress
        const progressText = line.repeat(progress).replace(/.$/, slider)
        const emptyProgressText = line.repeat(emptyProgress)
        const bar = progressText + emptyProgressText
        return bar
    }
}

export const command: Command = {
    name: 'nowplaying',
    aliases: ['np'],
    description: 'Shows the current song.',
    run: async (client, ctx) => {
        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(ctx.author.id)

        if (global.musicState.player === null || global.musicState.player.queue.current === null || userPermissions[1] === false) {
            await safeReact(ctx, Emojis.error)

            return
        }

        let player: Player = global.musicState.player

        let current: Track | UnresolvedTrack = player.queue.current

        let requester: User = current.requester as any as User

        let split: string = splitBar(current?.duration, player.position, 40, '▬', '🔵')

        let playSymbol: string = global.musicState.player.paused === false ? '▶️' : '⏸️'

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.info,
            author: {
                name: 'Now playing 🔊',
            },
            title: global.musicState.mainEmbedMessageTitle(current.isStream, false),
            url: current.uri,
            description:
                '\n```' +
                (current.isStream === true ? '' : ` ${global.musicState.player.queue.getDurationString(player.position)} ${playSymbol} ${split} ${global.musicState.player.queue.getDurationString(current.duration)} \`\`\``) +
                `\nRequested by <@${requester.id}>`,
        })

        return
    },
}
