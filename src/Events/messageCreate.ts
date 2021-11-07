import { Event, Command } from '../Interfaces'
import { Message, ThreadChannel } from 'discord.js'
import Logger from '../Logger'
import { sendEphemeralEmbed, Color } from '../Utils'
import Configs from '../config.json'
const log = Logger(Configs.EventsLogLevel, 'messageCreate.ts')

export const event: Event = {
    name: 'messageCreate',
    run: async (client, message: Message) => {
        if (message.author.bot === true || !message.guild) return

        if (message.mentions.users.has(client.user.id) === true) {
            await message
                .reply('Hi, you can use `' + `s${global.dataState.botID}help` + '` to see all commands')
                .then((message: Message) => {
                    setTimeout(async () => {
                        try {
                            await message.delete()
                        } catch (e) {
                            log.debug(`Failed to delete message, this is a discord internal error! \n${e.stack}`)
                        }
                    }, Configs.EphemeralMessageTime * 1000)
                })
                .catch((e) => {
                    log.debug(`Failed to send message, this is a discord internal error! \n${e.stack}`)
                })

            return
        }

        let processedContent = /^s([0-9])([^\s]+)\s*(.*)/gm.exec(message.content)

        if (processedContent !== null) {
            if (parseInt(processedContent[1]) !== parseInt(global.dataState.botID)) return

            const cmd = processedContent[2]
            const args = [processedContent[3]]

            const command = client.commands.get(cmd) || client.aliases.get(cmd)

            if (command) {
                await (command as Command).run(client, message, args)

                setTimeout(async () => {
                    try {
                        await message.delete()
                    } catch (e) {
                        log.debug(`Failed to delete message, this is a discord internal error!`)
                    }
                }, Configs.EphemeralMessageTime * 1000)
            } else {
                await sendEphemeralEmbed(message.channel, {
                    color: Color.error,
                    author: {
                        name: `Command not found`,
                    },
                })
            }

            if (message.system === false && message.channelId === global.dataState.threadID) {
                try {
                    await message.delete()
                } catch (e) {
                    log.debug(`Failed to deleted message while play command, this is a discord internal issue`)
                }
            }
        } else {
            if (processedContent === null) {
                if (message.channelId === global.dataState.threadID && !message.content.includes('tenor.com')) {
                    const thread = message.channel as ThreadChannel

                    if (thread.isThread() && global.dataState.threadMembers.has(message.author.id)) global.musicState.taskQueue.enqueueTask('Enqueue', [message.content, `${message.author.username}#${message.author.discriminator}`])

                    if (message.system === false) {
                        await message.delete().catch((e) => {
                            log.debug(`Failed to delete message, this is a discord internal error\n${e.stack}`)
                        })
                    }
                }

                return
            }
        }
    },
}
