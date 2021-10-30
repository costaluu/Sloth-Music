require('events').EventEmitter.defaultMaxListeners = 30
import { Intents, User } from 'discord.js'
import Client from './Client'
import Logger from './Logger'
import { VoiceChannel, Role, MessageActionRow, MessageButton } from 'discord.js'
import { BotState, MusicState, RoleLevel, ControlRoles, DJRoles } from './Interfaces'
import AsyncTaskQueue from './TaskQueue'
import Configs from './config.json'
const log = Logger(Configs.IndexLogLevel, 'index.ts')
import { Structure, Track } from 'erela.js'

Structure.extend(
    'Queue',
    (Queue) =>
        class extends Queue {
            public currentPage: number = 0
            public pages: [Track[]] | [] = null

            /**
             * Get the duration of the song in format HH:mm:ss
             * @param {duration} number of seconds to get the time string.
             * @param {isStream} boolean that indicates if it is a live stream.
             */

            getDurationString(duration: number, isStream: boolean): string {
                if (isStream === true) return 'Live'
                else if (duration >= 86400000) {
                    let days = Math.floor(duration / 86400000)
                    let mod = duration % 86400000

                    return `${days} day(s) and ${this.getDurationString(mod, false)}`
                } else if (duration >= 3600000) return new Date(duration).toISOString().substr(11, 8)
                else return new Date(duration).toISOString().substr(14, 5)
            }

            /**
             * Get the duration of the song in format HH:mm:ss
             */

            getTotalQueueDurationString(): string {
                if (this.length === 0 && this.current === null) return `--:--`

                let seconds: number = this.current?.isStream === true ? 0 : this.current?.duration

                for (let i = 0; i < this.length; i++) seconds = seconds + (this[i]?.isStream === true ? 0 : this[i]?.duration)

                return this.getDurationString(seconds, false)
            }

            /**
             * Generates a new pages array, its used when a song its deleted or first queue song
             */

            public pagesGenerator(): void {
                log.debug(`Generating pages structure...`)

                let pages = []
                let currentPage = -1

                for (let i = 0; i < this.length; i++) {
                    if (i % Configs.maxSongsPerPage === 0) {
                        pages.push([])
                        currentPage = currentPage + 1
                    }

                    pages[currentPage].push(this[i])
                }

                this.pages = pages as [Track[]] | []
            }

            /**
             * Generates a queue text to current page
             * @param {pageNumber} number of the page to be generated.
             */

            public pageTextGenerator(pageNumber: number): string {
                if (global.musicState.player === null || this.current === null) return '```js\n' + `No songs in queue 😔` + '\n```'

                let currentText = ''

                if (this.pages === null) this.pagesGenerator()

                if (this.current !== null) {
                    let requester: User = this.current?.requester as User
                    let live = this.current.isStream === true ? '🔴 ' : ''

                    currentText = `Now playing 🔊 ` + live + `[${this.getDurationString(this.current?.duration, this.current?.isStream)}] - ${this.current.title} requested by ${requester.username}#${requester.discriminator}`
                }

                let title = this.length === 0 ? '🎶 Queue List 🎶' : `🎶 Queue List 🎶 ${this.totalSize} songs`

                let footer =
                    `Page ${pageNumber + 1 === this.currentPage + 1 ? this.currentPage + 1 : pageNumber + 1}/${this.pages.length === 0 ? 1 : this.pages.length}  | Total duration: ${this.getTotalQueueDurationString()}` +
                    (global.musicState.player.trackRepeat === true ? ' | Repeat: 🔂' : global.musicState.player.queueRepeat === true ? ' | Repeat: 🔁' : '')

                let songs = ''

                if (this.pages !== null && this.pages.length > 0 && pageNumber >= 0 && pageNumber < this.pages.length) {
                    for (let i = 0; i < this.pages[pageNumber].length; i++) {
                        let requester: User = this.pages[pageNumber][i].requester as User

                        songs += `${pageNumber * Configs.maxSongsPerPage + (i + 1)}. ${this.pages[pageNumber][i].title} - [${this.getDurationString(this.pages[pageNumber][i].duration, this.pages[pageNumber][i].isStream)}] | requested by ${
                            requester.username
                        }#${requester.discriminator}`

                        if (i + 1 < this.pages[pageNumber].length) songs += '\n'
                    }
                }

                if (songs === '') songs = `No more songs in queue 😔`

                return '```js\n' + currentText + '\n\n' + title + '\n\n' + songs + '\n\n' + footer + '\n```'
            }

            /**
             * Shuffles the songs after the current song in a fairly way
             */

            public fairShuffle(): void {
                if (this.length > 0) {
                    log.debug(`Fair queueing...`)

                    let usersQueue = {}

                    for (let i = 0; i < this.length; i++) {
                        let requester: User = this[i].requester as any as User
                        if (usersQueue[requester.id] === undefined) usersQueue[requester.id] = [this[i]]
                        else usersQueue[requester.id].push(this[i])
                    }

                    let users: [string, Track[]][] = Object.entries(usersQueue)

                    let end = false

                    let fairQueue: Track[] = []

                    while (end === false) {
                        end = true

                        for (let i = 0; i < users.length; i++) {
                            if (users[i][1].length > 0) {
                                fairQueue.push(users[i][1].shift())

                                if (users[i][1].length > 0) end = false
                            }
                        }
                    }

                    for (let i = 0; i < fairQueue.length; i++) this[i] = fairQueue[i]

                    this.pagesGenerator()
                }
            }
        }
)

let dataState: BotState = {
    controlRoles: [ControlRoles.Admin, ControlRoles.AstroSloth, ControlRoles.Cosmos, ControlRoles.Dev, ControlRoles.Moderator, ControlRoles.SlothExplorer, ControlRoles.SlothNapper],
    djRoles: [DJRoles.SlothNation, DJRoles.SlothSupporter, DJRoles.DJ],
    botID: parseInt(process.argv[2]) /* Bot ID */,
    anchorUser: null,
    isThreadCreated: false,
    threadID: '',
    threadMembers: new Map(),
    async userPermissions(userID: string): Promise<[RoleLevel, boolean]> {
        let roleLevel: RoleLevel = RoleLevel.NoPermission
        let isUserInVC: boolean = false

        if (global.musicState.player !== null) {
            log.debug(`Checking user permissions...`)

            await this.anchorUser.client.channels
                .fetch(global.musicState.player.voiceChannel)
                .then(async (channel: VoiceChannel) => {
                    let find = channel.members.get(userID)

                    if (find !== undefined) isUserInVC = true

                    for (let i = 0; i < this.controlRoles.length; i++) {
                        let role = channel.guild.roles.cache.get(this.controlRoles[i]) as Role

                        if (role !== undefined) {
                            let find = role.members.get(userID)

                            if (find !== undefined) {
                                roleLevel = RoleLevel.ControlRole

                                break
                            }
                        }
                    }

                    if (roleLevel === RoleLevel.NoPermission) {
                        for (let i = 0; i < this.djRoles.length; i++) {
                            let role = channel.guild.roles.cache.get(this.djRoles[i]) as Role

                            if (role !== undefined) {
                                let find = role.members.get(userID)

                                if (find !== undefined) {
                                    roleLevel = RoleLevel.DJRole

                                    break
                                }
                            }
                        }

                        if (roleLevel === RoleLevel.NoPermission) {
                            if (userID === this.anchorUser.id) roleLevel = RoleLevel.CurrentDJ
                        }
                    }
                })
                .catch((e) => {
                    log.warn(`Failed to get voice channel during the checking of user permissions, this is a discord internal error ${e.stack}`)
                })
        } else {
            log.warn(`Channel was not registred while checking user permissions...`)
        }

        return [roleLevel, isUserInVC] as [RoleLevel, boolean]
    },
    clear() {
        this.anchorUser = null
        this.isThreadCreated = false
        this.threadID = ''
        this.threadMembers = new Map()
    },
}

global.dataState = dataState

let musicState: MusicState = {
    currentSkipVotes: 0,
    taskQueue: new AsyncTaskQueue(),
    votesByUser: new Map(),
    async votesToSkip() {
        if (global.dataState.anchorUser !== null && global.musicState.player !== null) {
            let result: number

            await global.dataState.anchorUser.client.channels
                .fetch(global.musicState.player.voiceChannel)
                .then((voiceChannel: VoiceChannel) => {
                    result = Math.ceil((voiceChannel.members.size - 1) * (2 / 3))
                })
                .catch((e) => {
                    log.warn(`Failed to fetch the channel, this is a discord internal error\n${e.stack}`)

                    result = 1
                })

            return result
        } else return 1
    },
    player: null,
    async mainEmbedMessage() {
        return {
            color: this.mainEmbedMessageColor(),
            author: {
                name: this.mainEmbedMessageTitle(true, false),
                icon_url: this.mainEmbedMessageIcon(),
            },
            description: `Skip votes: ${this.currentSkipVotes}/${await this.votesToSkip()}`,
            image: {
                url: '',
            },
            timestamp: this.mainEmbedMessageTimeStamp,
            footer: {
                text: this.mainEmbedMessageFooter(),
                icon_url: global.dataState.anchorUser.displayAvatarURL(),
            },
        }
    },
    mainEmbedMessageTitle(showDuration: boolean, showNowPlaying: boolean) {
        if (this.player.queue.current === null) return 'No song playing currently'
        else {
            let live = this.player.queue.current.isStream === true ? '🔴 ' : ''
            let duration = showDuration === true ? `[${this.player.queue.getDurationString(this.player.queue.current?.duration, this.player.queue.current?.isStream)}] |` : ''
            let nowPlaying = showNowPlaying === true ? 'Now Playing 🔊' : ''
            let title = this.player.queue.current?.title

            return live + duration + ' ' + nowPlaying + ' ' + title
        }
    },
    mainEmbedMessageFooter() {
        return ''
        /* let repeat = ''

        if(this.repeatLevel === RepeatLevel.RepeatQueue)
            repeat = ' | Repeat: 🔁'
        else if(this.repeatLevel === RepeatLevel.RepeatSong)
            repeat = ' | Repeat: 🔂'

        return `${global.dataState.anchorUser.username}#${global.dataState.anchorUser.discriminator} is the current DJ` + repeat */
    },
    mainEmbedMessageButtons() {
        return new MessageActionRow().addComponents([
            new MessageButton().setCustomId('PlayResume').setEmoji('⏯️').setStyle('PRIMARY'),
            new MessageButton().setCustomId('Skip').setEmoji('⏭️').setStyle('PRIMARY'),
            new MessageButton().setCustomId('Repeat').setEmoji('🔁').setStyle('PRIMARY'),
            new MessageButton().setCustomId('Stop').setEmoji('⏹️').setStyle('PRIMARY'),
            new MessageButton().setCustomId('TurnOff').setEmoji('❌').setStyle('DANGER'),
        ])
    },
    queueEmbedMessage() {
        return this.musicQueue.pageTextGenerator(this.musicQueue.currentPage)
    },
    queueEmbedMessageButtons() {
        return new MessageActionRow().addComponents([
            new MessageButton().setCustomId('PreviousPage').setEmoji('⬅️').setStyle('PRIMARY'),
            new MessageButton().setCustomId('NextPage').setEmoji('➡️').setStyle('PRIMARY'),
            new MessageButton().setCustomId('ShuffleQueue').setEmoji('🔀').setStyle('PRIMARY'),
            new MessageButton().setCustomId('FairQueue').setEmoji('🤝').setStyle('PRIMARY'),
        ])
    },
    clear() {
        this.currentSkipVotes = 0
        this.votesByUser = new Map()

        try {
            this.player.destroy()
        } catch (e) {
            log.warn(`Failed to destroy the player,${e.stack}`)
        }

        this.player = null
        this.mainEmbedMessageID = ''
        this.mainEmbedMessageTimeStamp = null
        this.queueEmbedMessageID = ''
    },
}

global.musicState = musicState

enum ExitStatus {
    Failure = 1,
    Success = 0,
}

try {
    console.clear()

    log.info('Inicializing bot...')

    let client = new Client({
        intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    })

    client.init()

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']

    exitSignals.map((signal) => {
        process.on(signal, async () => {
            await client.gracefullShutdown()
            if (process.env.IS_DEV_VERSION === 'true') process.exit(ExitStatus.Failure)
        })
    })

    /*     process.on('unhandledRejection', async (reason, promise) => {
        log.fatal(new Error(`Error: ${promise} and reason: ${reason}`))

        await client.gracefullShutdown()
        if (process.env.IS_DEV_VERSION === 'true') process.exit(ExitStatus.Failure)
    }) */

    process.on('uncaughtException', async (e) => {
        log.fatal(new Error(`Error: ${e.stack}`))

        await client.gracefullShutdown()
        if (process.env.IS_DEV_VERSION === 'true') process.exit(ExitStatus.Failure)
    })
} catch (e) {
    log.error(new Error(`Bot exited due to error \n${e.stack}`))
    process.exit(ExitStatus.Failure)
}
