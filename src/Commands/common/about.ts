import { Message } from 'discord.js'
import { Command } from '../../Interfaces'
import { sendEphemeralEmbed, Color } from '../../Utils'
import Logger from '../../Logger'
import Configs from '../../config.json'
const log = Logger(Configs.CommandsLogLevel, 'ping.ts')

export const command: Command = {
    name: 'about',
    aliases: [],
    description: 'Shows info about the bot.',
    run: async (client, message) => {
        await sendEphemeralEmbed(message.channel, {
            color: Color.warn,
            author: {
                name: 'About Sloth Music Bot.',
            },
            description:
                '```ini\n' +
                "I'm a dedicated music bot used in The Language Sloth server, made with Java, Javascript and Typescript.\n\nFeel free to report any bug🐛 or problem in the suggestion channel. You can use my help command " +
                `[s${global.dataState.botID}help]` +
                ' to see all the avaliable commands.\n\nObs: Spotify does not allow songs to be played directly, in practice the equivalent song is found on youtube.' +
                '\n```',
            fields: [
                {
                    name: `Youtube Support`,
                    value: 'Videos: ✅ | Playlists: ✅ | Lives: ✅',
                    inline: true,
                },
                {
                    name: `Soundcloud Support`,
                    value: 'Songs: ✅ | Playlists: ✅ | Albums: ✅',
                    inline: false,
                },
                {
                    name: `Spotify Support`,
                    value: 'Songs ⚠️ | Playlists: ⚠️ | Albums: ⚠️',
                    inline: false,
                },
                {
                    name: `Vimeo Support`,
                    value: 'Songs ✅ | Playlists: ✅',
                    inline: false,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: message.guild.name,
                icon_url: message.guild.iconURL({ dynamic: true }),
            },
        })
    },
}
