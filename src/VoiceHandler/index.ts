import { Message, TextChannel, ThreadChannel, User } from 'discord.js'
import { SearchResult, Track, UnresolvedTrack } from 'erela.js'
import { sendEphemeralEmbed, Color, Emojis, safeReact } from '../Utils'
import Configs from '../config.json'
import Logger from '../Logger'
const lyricsFinder = require('lyrics-finder')
const log = Logger(Configs.VoiceHandlerLogLevel, 'voicehandler.ts')

/**
 * Bass levels enum
 */

enum BassLevels {
    none = 0.0,
    low = 0.2,
    medium = 0.3,
    high = 0.35,
}

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

/**
 * Decide if the type is SearchResult or Track
 * @param {result} SearchResult or Track .
 */

function assertSearchResultType(result: SearchResult | Track): boolean {
    let check = result as SearchResult
    if (check.loadType) return true
    else return false
}

/**
 * Enqueue a song
 * @param {ctx} context of the message.
 * @param {result} track to be enqueued
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function enqueue(ctx: Message, result: SearchResult | Track, internalTrigger: boolean) {
    if (assertSearchResultType(result) === false) {
        result = result as Track

        global.musicState.player.queue.add(result)

        if (internalTrigger === false) {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.success,
                author: {
                    name: `${Emojis.song} Enqueued ${result.title}.`,
                },
            })
        }
    } else {
        result = result as SearchResult
        if (result.loadType === 'TRACK_LOADED' || result.loadType === 'SEARCH_RESULT') {
            global.musicState.player.queue.add(result.tracks[0])

            if (internalTrigger === false) {
                await sendEphemeralEmbed(ctx.channel, {
                    color: Color.success,
                    author: {
                        name: `${Emojis.song} Enqueued ${result.tracks[0].title}.`,
                    },
                })
            }
        } else {
            if (result.tracks.length > Configs.maxPagesInQueue * Configs.maxSongsPerPage - global.musicState.player.queue.totalSize) {
                let newTracksLength = Configs.maxPagesInQueue * Configs.maxSongsPerPage - global.musicState.player.queue.totalSize

                result.tracks = result.tracks.slice(0, newTracksLength)

                if (internalTrigger === false) {
                    await sendEphemeralEmbed(ctx.channel, {
                        color: Color.success,
                        author: {
                            name: `${Emojis.playlist} Enqueued only ${newTracksLength} songs from playlist ${result.playlist.name} due to queue limit.`,
                        },
                    })
                }
            } else {
                if (internalTrigger === false) {
                    await sendEphemeralEmbed(ctx.channel, {
                        color: Color.success,
                        author: {
                            name: `${Emojis.playlist} Enqueued playlist ${result.playlist.name} with ${result.tracks.length} songs.`,
                        },
                    })
                }
            }

            global.musicState.player.queue.add(result.tracks)
        }
    }

    await play()
}

/**
 * Plays the current song
 */

export async function play() {
    if (global.musicState.player.playing === false && global.musicState.player.paused === false) await global.musicState.player.play()
}

/**
 * Pauses the current song
 * @param {ctx} context of the message.
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function pause(ctx: Message, internalTrigger: boolean) {
    if (global.musicState.player.paused === false) {
        await global.musicState.player.pause(true)

        if (internalTrigger === false) await safeReact(ctx, Emojis.success)
    } else if (internalTrigger === true) {
        await safeReact(ctx, Emojis.error)
    }
}

/**
 * Resume the current song
 * @param {ctx} context of the message.
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function unpause(ctx: Message, internalTrigger: boolean) {
    if (global.musicState.player.paused === true) {
        await global.musicState.player.pause(false)
        if (internalTrigger === false) await safeReact(ctx, Emojis.success)
    } else if (internalTrigger === true) {
        await safeReact(ctx, Emojis.error)
    }
}

/**
 * Toggles the current song, i.e, pause and unpause in the same command
 * @param {ctx} context of the message.
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function toggle(ctx: Message, internalTrigger: boolean) {
    await global.musicState.player.pause(!global.musicState.player.paused)

    if (internalTrigger === false) await safeReact(ctx, Emojis.success)
}

/**
 * Stops the current song and clears the queue
 * @param {ctx} context of the message.
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function stop(ctx: Message, internalTrigger: boolean) {
    await global.musicState.player.setQueueRepeat(false)
    await global.musicState.player.setTrackRepeat(false)
    await global.musicState.player.queue.clear()
    await global.musicState.player.stop()
    global.musicState.player.queue.current = null
    global.musicState.player.queue.previous = null

    if (internalTrigger === false) await safeReact(ctx, Emojis.success)
}

/**
 * Skips the current song
 * @param {channel} context of the message.
 * @param {internalTrigger} boolean that indicates if this function was called internally.
 * @param {showMessage} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function skip(channel: TextChannel, internalTrigger: boolean, showMessage: boolean) {
    if (showMessage === true && channel.id !== global.dataState.threadID) {
        await sendEphemeralEmbed(channel, {
            color: internalTrigger === true ? Color.warn : Color.success,
            author: {
                name: internalTrigger === true ? `Something went wrong with that track skipping...` : `Skipping...`,
            },
        })
    }

    global.musicState.currentSkipVotes = 0
    global.musicState.votesByUser = new Map()

    if (global.musicState.player.queueRepeat === true || global.musicState.player.trackRepeat === true) global.musicState.player.queue.push(global.musicState.player.queue.current)

    if (global.musicState.player.trackRepeat === true) {
        global.musicState.player.setTrackRepeat(false), global.musicState.player.setQueueRepeat(true)
    }

    await global.musicState.player.stop()
}

/**
 * Change the repeat mode.
 * @param {channel} context of the message.
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function repeat(channel: TextChannel, internalTrigger: boolean) {
    if (global.musicState.player.queueRepeat === true) {
        global.musicState.player.setTrackRepeat(true)

        if (internalTrigger === false && channel.id !== global.dataState.threadID) {
            await sendEphemeralEmbed(channel, {
                color: Color.success,
                author: {
                    name: `Loop: Song.`,
                },
            })
        }
    } else if (global.musicState.player.trackRepeat === true) {
        global.musicState.player.setTrackRepeat(false)

        if (internalTrigger === false && channel.id !== global.dataState.threadID) {
            await sendEphemeralEmbed(channel, {
                color: Color.success,
                author: {
                    name: `Loop: No repeat.`,
                },
            })
        }
    } else {
        global.musicState.player.setQueueRepeat(true)

        if (internalTrigger === false && channel.id !== global.dataState.threadID) {
            await sendEphemeralEmbed(channel, {
                color: Color.success,
                author: {
                    name: `Loop: Queue.`,
                },
            })
        }
    }
}

/**
 * Shuffles the queue.
 * @param {ctx} context of the message.
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function shuffle(ctx: Message, internalTrigger: boolean) {
    if (global.musicState.player.queue.length > 0) {
        await global.musicState.player.queue.shuffle()

        if (internalTrigger === false) await safeReact(ctx, Emojis.success)
    } else if (internalTrigger === false) await safeReact(ctx, Emojis.error)
}

/**
 * Make the bot leave and clear the state.
 * @param {ctx} context of the message.
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function leave(ctx: Message, internalTrigger: boolean) {
    global.musicState.clear(true)

    if (internalTrigger === false) await safeReact(ctx, Emojis.success)
}

/**
 * Shuffles the queue in a fairway.
 * @param {ctx} context of the message.
 * @param {internalTrigger} boolean that indicates if we shoud send a message or react in the text channel or not.
 */

export async function fairShuffle(ctx: Message, internalTrigger: boolean) {
    if (global.musicState.player.queue.length > 0) {
        global.musicState.player.queue.fairShuffle()

        if (internalTrigger === false) await safeReact(ctx, Emojis.success)
    } else if (internalTrigger === false) await safeReact(ctx, Emojis.error)
}

/**
 * Jumps to a specific song in queue.
 * @param {ctx} context of the message.
 * @param {position} number that indicates the position to jump.
 */

export async function jump(ctx: Message, position: number) {
    if (global.musicState.player.queueRepeat === true || global.musicState.player.trackRepeat === true) {
        let jumpedTracks = [global.musicState.player.queue.current]

        for (let i = 0; i < position - 1; i++) jumpedTracks.push(global.musicState.player.queue[i])

        global.musicState.player.queue = global.musicState.player.queue.concat(jumpedTracks)
    }

    await global.musicState.player.stop(position)

    await safeReact(ctx, Emojis.success)
}

/**
 * Jumps to a specific song in queue.
 * @param {ctx} context of the message.
 * @param {position} number that indicates the position to remove.
 */

export async function remove(ctx: Message, position: number) {
    global.musicState.player.queue.remove(position)

    let pageCount: number = global.musicState.player.queue.pagesCount() === 0 ? 1 : global.musicState.player.queue.pagesCount()

    if (global.musicState.player.queue.currentPage > pageCount) global.musicState.player.queue.currentPage = pageCount

    await safeReact(ctx, Emojis.success)
}

/**
 * Function to cleanup the thread if something wrong happen during the thread creation.
 * @param {thread} ThreadChannel of the message.
 */

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

/**
 * Create a dedicated thread for the music bot
 * @param {ctx} context of the message.
 */

export async function thread(ctx: Message) {
    const channel = ctx.channel as TextChannel

    const checkForThread = channel.threads.cache.find((thread) => thread.name === `Music Thread-${global.musicState.player.voiceChannel}`)

    if (checkForThread === undefined) {
        /* Cria a thread */
        const channel = ctx.channel as TextChannel

        await channel.threads
            .create({
                name: `Music Thread-${global.musicState.player.voiceChannel}`,
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
                                        description: `Now you can just ** type the song name or url**, however you can use text commands as usual in this thread.`,
                                        fields: [
                                            {
                                                name: `Player Commands`,
                                                value: `Pause/Resume(⏯️) | Skip(⏭️) | Loop(🔁) | Stop(⏹️) | Leave(❌)`,
                                                inline: false,
                                            },
                                            {
                                                name: `Queue Commands`,
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

/**
 * Goes to the next page of the queue used in thread.
 */

export function nextQueuePage() {
    global.musicState.player.queue.nextPage()
}

/**
 * Goes to the previous page of the queue used in thread.
 */

export function previousQueuePage() {
    global.musicState.player.queue.previousPage()
}

/**
 * Seek to a specific position in song
 * @param {ctx} context of the message.
 * @param {position} number of the position.
 */

export async function seek(ctx: Message, position: number) {
    if (global.musicState.player.queue.current !== null && global.musicState.player.queue.current.isSeekable === true) {
        await global.musicState.player.seek(position)
        await safeReact(ctx, Emojis.success)
    } else {
        await sendEphemeralEmbed(ctx.channel, {
            color: Color.error,
            author: {
                name: `I'm not able to seek this song.`,
            },
        })
    }
}

/**
 * Change the bassboost level
 * @param {ctx} context of the message.
 * @param {level} leve of the bassboost
 */

export async function bassboost(ctx: Message, level: string) {
    if (global.musicState.player !== null && global.musicState.player.queue.current !== null) {
        if (level === 'high') {
            await global.musicState.player.setEQ(...new Array(3).fill(null).map((_, i) => ({ band: i, gain: BassLevels.high })))
        } else if (level === 'medium') {
            await global.musicState.player.setEQ(...new Array(3).fill(null).map((_, i) => ({ band: i, gain: BassLevels.medium })))
        } else if (level === 'low') {
            await global.musicState.player.setEQ(...new Array(3).fill(null).map((_, i) => ({ band: i, gain: BassLevels.low })))
        } else {
            await global.musicState.player.setEQ(...new Array(3).fill(null).map((_, i) => ({ band: i, gain: BassLevels.none })))
        }
        await safeReact(ctx, Emojis.success)
    } else {
        await safeReact(ctx, Emojis.error)
    }
}

/**
 * Try to get the lyrics for a song.
 * @param {ctx} context of the message.
 */

export async function lyrics(ctx: Message) {
    if (global.musicState.player !== null && global.musicState.player.queue.current !== null) {
        let currentSongTitle: string = global.musicState.player.queue.current.title

        currentSongTitle = currentSongTitle.replace(
            /lyrics|lyric|Official Video|\(Official Video\)|lyrical|official music video|\(official music video\)|audio|official|official video|official video hd|official hd video|offical video music|\(offical video music\)|extended|hd|(\[.+\])|\(.+\)/gi,
            ''
        )

        console.log(currentSongTitle)

        let lyrics = await lyricsFinder(currentSongTitle)

        if (!lyrics) {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.error,
                author: {
                    name: `No lyrics found for the current song.`,
                },
            })

            return
        }

        const chunk = (arr, size) => arr.reduce((chunks, el, i) => (i % size ? chunks[chunks.length - 1].push(el) : chunks.push([el])) && chunks, [])

        lyrics = lyrics.split('\n')

        lyrics = chunk(lyrics, 40) // Split in 40 lines

        if (lyrics[0].length > 0) {
            for (let i = 0; i < lyrics.length; i++) {
                await ctx.channel
                    .send({
                        embeds: [
                            {
                                color: Color.info,
                                title: i === 0 ? `Lyrics for ${global.musicState.player.queue.current.title}` : `Continuation of lyrics`,
                                description: lyrics[i].join('\n'),
                            },
                        ],
                    })
                    .then((message: Message) => {
                        setTimeout(() => {
                            message.delete().catch((e) => {
                                log.debug(`Failed to delete message, this is a discord internal error.`)
                            })
                        }, 5 * Configs.EphemeralMessageTime * 1000)
                    })
                    .catch((e) => {
                        log.debug(`Failed to send lyrics, this is a discord internal error.`)
                    })
            }
        } else {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.error,
                author: {
                    name: `No lyrics found for the current song.`,
                },
            })
        }
    } else {
        await safeReact(ctx, Emojis.error)
    }
}

/**
 * Jumps to a specific song in queue.
 * @param {ctx} context of the message.
 * @param {position} number that indicates the position to jump.
 */

export async function playnext(ctx: Message, position: number) {
    let playNextTack: Track | UnresolvedTrack = global.musicState.player.queue[position]

    global.musicState.player.queue.remove(position)

    let pageCount: number = global.musicState.player.queue.pagesCount() === 0 ? 1 : global.musicState.player.queue.pagesCount()

    if (global.musicState.player.queue.currentPage > pageCount) global.musicState.player.queue.currentPage = 1

    global.musicState.player.queue.unshift(playNextTack)

    await safeReact(ctx, Emojis.success)
}
