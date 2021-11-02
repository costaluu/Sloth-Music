import { Command } from '../../Interfaces'
import { Color, sendEphemeralEmbed } from '../../Utils'

export const command: Command = {
    name: 'help',
    aliases: [],
    description: 'Are you really using help command with the help param?',
    run: async (client, message, args) => {
        if (args[0] === '') {
            await sendEphemeralEmbed(message.channel, {
                color: Color.info,
                author: {
                    name: 'All commands for Sloth Music Bot',
                },
                description:
                    '```ini\nYou can use ' +
                    `s${global.dataState.botID}help` +
                    ' [command] to get more info about a specific command.\n\nTemplate: s[index][command/alias] [arg]\n\nObs: [index/command/alias] means that you should use the command without [].\n```',
                fields: [
                    {
                        name: `Common commands`,
                        value: '`ping`, `help`, `about`, `uptime`',
                        inline: false,
                    },
                    {
                        name: `Music commands`,
                        value: '`play`, `pause`, `resume`, `clear`, `search`, `queue`, `remove`, `leave`, `skip`, `loop`, `jump`, `nowplaying`, `shuffle`, `fairshuffle`, `thread`',
                        inline: false,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: message.guild.name,
                    icon_url: message.guild.iconURL({
                        dynamic: true,
                    }),
                },
            })
        } else {
            for (let i = 0; i < args.length; i++) {
                let find = client.commands.get(args[i])

                if (find !== undefined) {
                    let aliasesString = find.aliases?.join(', ')

                    if (aliasesString === '') aliasesString = 'No aliases.'

                    await sendEphemeralEmbed(message.channel, {
                        color: Color.info,
                        author: {
                            name: find.name[0].toUpperCase() + find.name.slice(1) + ' command',
                        },
                        description: '```ini\n' + `[Aliases]: ${aliasesString}\n\n[Description]: ${find?.description}` + '\n```',
                    })
                } else {
                    find = client.aliases.get(args[i])

                    if (find !== undefined) {
                        let aliasesString = find.aliases?.join(', ')

                        if (aliasesString === '') aliasesString = 'No aliases.'

                        await sendEphemeralEmbed(message.channel, {
                            color: Color.info,
                            author: {
                                name: find.name,
                            },
                            description: '```ini\n' + `[Aliases]: ${aliasesString}\n\n[Description]: ${find?.description}` + '\n```',
                        })
                    } else {
                        await sendEphemeralEmbed(message.channel, {
                            color: Color.error,
                            author: {
                                name: `Command not found`,
                            },
                        })
                    }
                }
            }
        }
    },
}
