import { Message } from 'discord.js'
import { SearchResult, Track } from 'erela.js'
import { sendEphemeralEmbed, Color, Emojis, safeReact } from '../Utils'
import Configs from '../config.json'
//import Logger from '../Logger'
//const log = Logger(Configs.VoiceHandlerLogLevel, 'voicehandler.ts')

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

export async function skip(ctx: Message) {
    await sendEphemeralEmbed(ctx.channel, {
        color: Color.success,
        author: {
            name: `Skipping...`,
        },
    })

    global.musicState.currentSkipVotes = 0
    global.musicState.votesByUser = new Map()

    if (global.musicState.player.queueRepeat === true || global.musicState.player.trackRepeat === true) global.musicState.player.queue.push(global.musicState.player.queue.current)

    await global.musicState.player.stop()
}

export async function repeat(ctx: Message) {
    if (global.musicState.player.queueRepeat === true) {
        global.musicState.player.setTrackRepeat(true)

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.success,
            author: {
                name: `Loop: Song.`,
            },
        })
    } else if (global.musicState.player.trackRepeat === true) {
        global.musicState.player.setTrackRepeat(false)

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.success,
            author: {
                name: `Loop: No repeat.`,
            },
        })
    } else {
        global.musicState.player.setQueueRepeat(true)

        await sendEphemeralEmbed(ctx.channel, {
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

export async function leave(ctx: Message) {
    await global.musicState.player.destroy()

    global.musicState.clear()
    global.dataState.clear()

    await safeReact(ctx, Emojis.success)
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
