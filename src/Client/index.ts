import { Client, Collection, TextChannel, User } from 'discord.js'
import { Command, Event } from '../Interfaces'
import path from 'path'
import { readdirSync } from 'fs'
import Configs from '../config.json'
import Logger from '../Logger'
import { Manager, Player, Track } from 'erela.js'
import { updateMainEmbedMessage, updateQueueEmbedMessage } from '../VoiceHandler'
const Spotify = require('better-erela.js-spotify').default
const log = Logger(Configs.ClientLogLevel, 'client.ts')
import { sendEphemeralEmbed, Color } from '../Utils'

class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection()
    public aliases: Collection<string, Command> = new Collection()
    public events: Collection<string, Event> = new Collection()
    public manager: Manager = new Manager({
        nodes: [
            {
                host: process.env.LAVALINK_HOST,
                retryDelay: 5000,
                password: process.env.LAVALINK_PASSWORD,
                port: parseInt(process.env.LAVALINK_PORT),
            },
        ],
        trackPartial: ['title', 'duration', 'requester', 'displayThumbnail', 'isStream', 'uri'],
        send: (id, payload) => {
            const guild = this.guilds.cache.get(id)
            if (guild) guild.shard.send(payload)
        },
        plugins: [
            new Spotify({
                clientId: process.env.SPOTIFY_CLIENT_ID,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
                strategy: 'API',
                playlistPageLimit: 5,
                albumPageLimit: 5,
            }),
        ],
    })
        .on('nodeConnect', () => log.success(`Lavalink connected.`))
        .on('nodeError', (node, error) => {
            this.gracefullShutdown()

            log.error(`An error occuried on Lavalink\n${error.message}`)
        })
        .on('trackStart', async (player: Player, track: Track) => {
            await this.channels
                .fetch(player.textChannel)
                .then(async (textChannel: TextChannel) => {
                    let requester = track.requester as any as User

                    await updateMainEmbedMessage()
                    await updateQueueEmbedMessage()

                    if (global.dataState.isThreadCreated === false) {
                        await sendEphemeralEmbed(textChannel, {
                            color: Color.info,
                            author: {
                                name: global.musicState.mainEmbedMessageTitle(true, true),
                            },
                            description: `requested by <@${requester.id}>`,
                        })
                    }
                })
                .catch((e) => {
                    log.error(`Failed to fetch the the text channel, this is a discord internal error\n${e.stack}`)
                })
        })
        .on('trackStuck', async () => {
            global.musicState.taskQueue.enqueueTask('Unpause', [null, true])
        })
        .on('trackError', async (player: Player, track: Track) => {
            await this.channels
                .fetch(player.textChannel)
                .then(async (textChannel: TextChannel) => {
                    global.musicState.taskQueue.enqueueTask('Skip', [textChannel, true, true])
                })
                .catch((e) => {
                    log.error(`Failed to fetch the the text channel, this is a discord internal error\n${e.stack}`)
                })
        })
        .on('socketClosed', async (player: Player) => {
            try {
                player.destroy()
            } catch (e) {
                log.eror(`Failed to destroy the player\n${e.stack}`)
            }
            global.musicState.taskQueue.enqueueTask('Leave', [null, true])
        })

    public async init() {
        /* Commands setup */

        log.info('Loading commands...')
        const commandPath = path.join(__dirname, '..', 'Commands')
        readdirSync(commandPath).forEach((dir) => {
            const commands = readdirSync(`${commandPath}/${dir}`).filter((cmdFile) => cmdFile.endsWith(process.env.IS_DEV_VERSION === 'false' ? '.js' : '.ts'))

            for (const file of commands) {
                const { command } = require(`${commandPath}/${dir}/${file}`)
                this.commands.set(command.name, command)

                if (command?.aliases.length !== 0) {
                    command.aliases.forEach((alias) => {
                        this.aliases.set(alias, command)
                    })
                }
                log.info(`${command.name} loaded!`)
            }
        })

        /* Events setup */

        log.info('Loading events...')

        const eventPath = path.join(__dirname, '..', 'Events')
        readdirSync(eventPath).forEach(async (file) => {
            if (file.includes(process.env.IS_DEV_VERSION === 'false' ? '.js' : '.ts') === true) {
                const { event } = await import(`${eventPath}/${file}`)
                this.events.set(event.name, event)
                this.on(event.name, event.run.bind(null, this))

                log.info(`${event.name} loaded!`)
            }
        })

        this.once('ready', () => {
            this.manager.init(this.user.id)

            log.success(`Bot loaded, ${this.user.tag} is ready to go!`)

            this.user.setActivity(`s${global.dataState.botID}help`, {
                type: 'LISTENING',
            })
        })

        this.on('raw', (d) => this.manager.updateVoiceState(d))

        this.login(process.env.BOT_TOKEN)
    }

    public async gracefullShutdown(): Promise<void> {
        if (process.env.IS_DEV_VERSION === 'true') {
            log.info('Gracefull shutdown...\n')

            if (global.musicState.player !== null) {
                await this.channels.fetch(global.musicState.player.textChannel).then(async (channel: TextChannel) => {
                    if (channel) {
                        let findThread = channel.threads.cache.find((thread) => thread.id === global.dataState.threadID)

                        if (findThread !== undefined) {
                            log.info('Thread found! Deleting...')

                            try {
                                await findThread.delete()
                            } catch (e) {
                                log.error(`Failed to delete thread, this is a discord internal error\n${e.stack}`)
                            }
                        } else log.info('Thread not found...')

                        log.info('Removing voice connection...')

                        try {
                            await global.musicState.clear(true)

                            log.success('Done.')
                        } catch (e) {
                            log.error(new Error(`Failed to destroy client connection, this is a discord internal error ${e.stack}`))
                        }
                    } else log.warn(`Failed to fetch channel while gracefull shutdown`)
                })
            } else {
                log.info(`State is already clear...`)
                log.success('Done.')
            }
        } else {
            log.info('Soft stop triggered...')
            global.musicState.taskQueue.enqueueTask('Leave', [null, true])
        }
    }
}

export default ExtendedClient
