import { Message, TextChannel, ThreadChannel, User } from 'discord.js'
import { SearchResult, Track } from 'erela.js'
import { sendEphemeralEmbed, Color, Emojis, safeReact } from '../Utils'
import Configs from '../config.json'
import Logger from '../Logger'
const log = Logger(Configs.VoiceHandlerLogLevel, 'voicehandler.ts')

/**
 * Updates the main thread message
 */

export async function updateMainEmbedMessage() {
    if (global.musicState.player !== null && global.dataState.threadID !== '' && global.dataState.isThreadCreated === true) {
        log.debug(`Updating main embed message...`)

        await (global.dataState.anchorUser as User).client.channels
            .fetch(global.dataState.threadID)
            .then(async (channel: TextChannel) => {
                if (channel) {
                    await channel.messages
                        .fetch(global.musicState.mainEmbedMessageID)
                        .then(async (mainEmbed: Message) => {
                            await mainEmbed.edit({ embeds: [await global.musicState.mainEmbedMessage()], components: [global.musicState.mainEmbedMessageButtons()] }).catch((e) => {
                                log.warn(`Failed to update main embed message, this is a discord internal warn!\n${e.stack}`)
                            })
                        })
                        .catch((e) => {
                            log.warn(`Failed to get the main embed message in thread, this is a discord internal error!\n${e.stack}`)
                        })
                } else log.warn(`Failed to get the channel, this is a discord internal error!`)
            })
            .catch((e) => {
                log.warn(`Failed to get the channel, this is a discord internal error!\n${e.stack}`)
            })
    } else log.debug(`Tried to update main embed message whitout thread`)
}

/**
 * Updates the queue thread message
 */

export async function updateQueueEmbedMessage() {
    if (global.musicState.player !== null && global.dataState.threadID !== '' && global.dataState.isThreadCreated === true) {
        log.debug(`Updating queue embed message...`)

        await global.dataState.anchorUser.client.channels
            .fetch(global.dataState.threadID)
            .then(async (channel: TextChannel) => {
                if (channel) {
                    await channel.messages
                        .fetch(global.musicState.queueEmbedMessageID)
                        .then(async (queueEmbed: Message) => {
                            if (queueEmbed) {
                                await queueEmbed.edit({ content: global.musicState.queueEmbedMessage(), components: [global.musicState.queueEmbedMessageButtons()] }).catch((e) => {
                                    log.warn(`Failed to update queue message, this is a discord internal warn! ${e.stack}`)
                                })
                            } else log.warn(`Failed to get the queue message in thread, this is a discord internal error!`)
                        })
                        .catch((e) => {
                            log.warn(`Failed to get the queue message in thread, this is a discord internal error!\n${e.stack}`)
                        })
                } else log.warn(`Failed to get the channel, this is a discord internal error!`)
            })
            .catch((e) => {
                log.warn(`Failed to get the channel, this is a discord internal error!\n${e.stack}`)
            })
    } else log.debug(`Tried to update queue message whitout thread`)
}

function assertSearchResultType(result: SearchResult | Track): boolean {
    let check = result as SearchResult
    if (check.loadType) return true
    else return false
}

export async function enqueue(ctx: Message, result: SearchResult | Track) {
    if (assertSearchResultType(result) === false) {
        result = result as Track

        global.musicState.player.queue.add(result)

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.success,
            author: {
                name: `${Emojis.song} Enqueued ${result.title}.`,
            },
        })
    } else {
        result = result as SearchResult
        if (result.loadType === 'TRACK_LOADED' || result.loadType === 'SEARCH_RESULT') {
            global.musicState.player.queue.add(result.tracks[0])

            await sendEphemeralEmbed(ctx.channel, {
                color: Color.success,
                author: {
                    name: `${Emojis.song} Enqueued ${result.tracks[0].title}.`,
                },
            })
        } else {
            if (result.tracks.length > Configs.maxPagesInQueue * Configs.maxSongsPerPage - global.musicState.player.queue.totalSize) {
                let newTracksLength = Configs.maxPagesInQueue * Configs.maxSongsPerPage - global.musicState.player.queue.totalSize

                result.tracks = result.tracks.slice(0, newTracksLength)

                await sendEphemeralEmbed(ctx.channel, {
                    color: Color.success,
                    author: {
                        name: `${Emojis.playlist} Enqueued only ${newTracksLength} songs from playlist ${result.playlist.name} due to queue limit.`,
                    },
                })
            } else {
                await sendEphemeralEmbed(ctx.channel, {
                    color: Color.success,
                    author: {
                        name: `${Emojis.playlist} Enqueued playlist ${result.playlist.name} with ${result.tracks.length} songs.`,
                    },
                })
            }

            global.musicState.player.queue.add(result.tracks)
        }
    }

    await play()
}

export async function play() {
    if (global.musicState.player.playing === false && global.musicState.player.paused === false) await global.musicState.player.play()
}

export async function pause(ctx: Message) {
    if (global.musicState.player.paused === false) {
        await global.musicState.player.pause(true)

        await safeReact(ctx, Emojis.success)
    } else {
        await safeReact(ctx, Emojis.error)
    }
}

export async function unpause(ctx: Message, internalTrigger: boolean) {
    if (global.musicState.player.paused === true) {
        await global.musicState.player.pause(false)
        if (internalTrigger === true) await safeReact(ctx, Emojis.success)
    } else if (internalTrigger === true) {
        await safeReact(ctx, Emojis.error)
    }
}

export async function toggle(ctx: Message) {
    await global.musicState.player.pause(!global.musicState.player.paused)

    await safeReact(ctx, Emojis.success)
}

export async function stop(ctx: Message) {
    await global.musicState.player.setQueueRepeat(false)
    await global.musicState.player.setTrackRepeat(false)
    await global.musicState.player.queue.clear()
    await global.musicState.player.stop()

    await safeReact(ctx, Emojis.success)
}

export async function skip(channel: TextChannel, internalTrigger: boolean) {
    await sendEphemeralEmbed(channel, {
        color: internalTrigger === true ? Color.warn : Color.success,
        author: {
            name: internalTrigger === true ? `Something went wrong with that track skipping...` : `Skipping...`,
        },
    })

    global.musicState.currentSkipVotes = 0
    global.musicState.votesByUser = new Map()

    if (global.musicState.player.queueRepeat === true || global.musicState.player.trackRepeat === true) global.musicState.player.queue.push(global.musicState.player.queue.current)

    await global.musicState.player.stop()
}

export async function repeat(channel: TextChannel) {
    if (global.musicState.player.queueRepeat === true) {
        global.musicState.player.setTrackRepeat(true)

        await sendEphemeralEmbed(channel, {
            color: Color.success,
            author: {
                name: `Loop: Song.`,
            },
        })
    } else if (global.musicState.player.trackRepeat === true) {
        global.musicState.player.setTrackRepeat(false)

        await sendEphemeralEmbed(channel, {
            color: Color.success,
            author: {
                name: `Loop: No repeat.`,
            },
        })
    } else {
        global.musicState.player.setQueueRepeat(true)

        await sendEphemeralEmbed(channel, {
            color: Color.success,
            author: {
                name: `Loop: Queue.`,
            },
        })
    }
}

export async function shuffle(ctx: Message) {
    await global.musicState.player.queue.shuffle()

    await safeReact(ctx, Emojis.success)
}

export async function leave(ctx: Message, internalTrigger: boolean) {
    await global.musicState.clear()
    global.dataState.clear()

    if (internalTrigger === false) await safeReact(ctx, Emojis.success)
}

export async function fairShuffle(ctx: Message) {
    global.musicState.player.queue.fairShuffle()

    await safeReact(ctx, Emojis.success)
}

export async function jump(ctx: Message, position: number) {
    if (global.musicState.player.queueRepeat === true || global.musicState.player.trackRepeat === true) {
        let jumpedTracks = [global.musicState.player.queue.current]

        for (let i = 0; i < position - 1; i++) jumpedTracks.push(global.musicState.player.queue[i])

        global.musicState.player.queue = global.musicState.player.queue.concat(jumpedTracks)
    }

    await global.musicState.player.stop(position)

    await safeReact(ctx, Emojis.success)
}

export async function remove(ctx: Message, position: number) {
    global.musicState.player.queue.remove(position)

    await safeReact(ctx, Emojis.success)
}

async function cleanupThread(thread: ThreadChannel | null) {
    if (thread !== null) {
        await thread.delete().catch((e) => {
            log.error(`Failed to delete thread, this is a discord internal error\n${e.stack}`)
            global.musicState.taskQueue.enqueueTask('Leave', [null, true])
        })
    }

    global.dataState.threadID = ''
    global.dataState.isThreadCreated = false
}

export async function thread(client, ctx: Message) {
    const channel = ctx.channel as TextChannel

    const checkForThread = channel.threads.cache.find((thread) => thread.name === `Music Thread-${global.dataState.voiceChannelID}`)

    if (checkForThread === undefined) {
        /* Cria a thread */
        const channel = ctx.channel as TextChannel

        await channel.threads
            .create({
                name: `Music Thread-${global.dataState.voiceChannelID}`,
                autoArchiveDuration: 'MAX',
                reason: `Music-Bot Thread created by User id: ${global.dataState.anchorUser.id}`,
            })
            .then(async (createdThread: ThreadChannel) => {
                await createdThread
                    .join()
                    .then(async (joinedThread: ThreadChannel) => {
                        global.dataState.threadID = joinedThread.id
                        global.musicState.mainEmbedMessageTimeStamp = new Date()

                        await joinedThread
                            .send({
                                embeds: [
                                    {
                                        color: parseInt(Configs.Colors.info),
                                        title: `Sloth Music Bot`,
                                        description: `Now you can just ** type the song name, link to music/video/playlist/album**, however you can use text commands as usual in this thread.`,
                                        fields: [
                                            {
                                                name: `Player Button Commands`,
                                                value: `Resume/Pause(⏯️) | Skip(⏭️) | Repeat(🔁) | Stop(⏹️) | Turn Off(❌)`,
                                                inline: false,
                                            },
                                            {
                                                name: `Queue Button Commands`,
                                                value: `Previous Page (⬅️) | Next Page (➡️) | Shuffle (🔀) | Fair Shuffle (🤝)`,
                                                inline: false,
                                            },
                                        ],
                                    },
                                ],
                            })
                            .catch((e) => {
                                log.error(`Failed to send message in thread this is a discord internal error\n${e.stack}`)
                                cleanupThread(createdThread)
                            })

                        await joinedThread
                            .send({ embeds: [await global.musicState.mainEmbedMessage()], components: [global.musicState.mainEmbedMessageButtons()] })
                            .then((message: Message) => {
                                global.musicState.mainEmbedMessageID = message.id
                            })
                            .catch((e) => {
                                log.error(`Failed to send message in thread this is a discord internal error\n${e.stack}`)
                                cleanupThread(createdThread)
                            })

                        await joinedThread
                            .send({ content: global.musicState.queueEmbedMessage(), components: [global.musicState.queueEmbedMessageButtons()] })
                            .then((message: Message) => {
                                global.musicState.queueEmbedMessageID = message.id
                            })
                            .catch((e) => {
                                log.error(`Failed to send message in thread this is a discord internal error\n${e.stack}`)
                                cleanupThread(createdThread)
                            })

                        await joinedThread.members.add(global.dataState.anchorUser.id).catch((e) => {
                            log.error(`Failed to send message in thread, this is a discord internal error\n${e.stack}`)
                            cleanupThread(createdThread)
                        })

                        global.dataState.isThreadCreated = true

                        await safeReact(ctx, Emojis.success)
                    })
                    .catch((e) => {
                        log.error(`Failed to join the thread this is a discord internal error\n${e.stack}`)
                        cleanupThread(createdThread)
                    })
            })
            .catch((e) => {
                log.error(`Failed to create the thread this is a discord internal error\n${e.stack}`)
                global.dataState.threadID = ''
            })
    } else {
        await sendEphemeralEmbed(ctx.channel, {
            color: Color.error,
            author: {
                name: `There is another thread linked to this voice channel!`,
            },
        })
    }
}
