import { TextChannel, Message, TextBasedChannels } from 'discord.js'
import { SearchResult } from 'erela.js'
import { sendEphemeralEmbed, Color, Reactions, safeReact } from '../Utils'
import Logger from '../Logger'
import Configs from '../config.json'
const log = Logger(Configs.VoiceHandlerLogLevel, 'voicehandler.ts')

export async function enqueue(client, ctx, result: SearchResult) {
    if (result.loadType === 'TRACK_LOADED' || result.loadType === 'SEARCH_RESULT') {
        global.musicState.player.queue.add(result.tracks[0])

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.success,
            author: {
                name: `Enqueued ${result.tracks[0].title}.`,
            },
        })
    } else {
        if (result.tracks.length > Configs.maxPagesInQueue * Configs.maxSongsPerPage - global.musicState.player.queue.totalSize) {
            let newTracksLength = Configs.maxPagesInQueue * Configs.maxSongsPerPage - global.musicState.player.queue.totalSize

            result.tracks = result.tracks.slice(0, newTracksLength)

            await sendEphemeralEmbed(ctx.channel, {
                color: Color.success,
                author: {
                    name: `Enqueued only ${newTracksLength} songs from playlist ${result.playlist.name} due to queue limit.`,
                },
            })
        } else {
            await sendEphemeralEmbed(ctx.channel, {
                color: Color.success,
                author: {
                    name: `Enqueued playlist ${result.playlist.name} with ${result.tracks.length} songs.`,
                },
            })
        }

        global.musicState.player.queue.add(result.tracks)
    }

    global.musicState.player.queue.pagesGenerator()
    await play()
}

export async function play() {
    if (global.musicState.player.playing === false && global.musicState.player.paused === false) await global.musicState.player.play()
}

export async function pauseUnpause(ctx: Message) {
    await global.musicState.player.pause(!global.musicState.player.paused)

    await safeReact(ctx, Reactions.success)
}

export async function stop(ctx: Message) {
    await global.musicState.player.setQueueRepeat(false)
    await global.musicState.player.setTrackRepeat(false)
    await global.musicState.player.queue.clear()
    await global.musicState.player.stop()

    await safeReact(ctx, Reactions.success)
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

    global.musicState.player.queue.pagesGenerator()
}

export async function repeat(ctx: Message) {
    if (global.musicState.player.queueRepeat === true) {
        global.musicState.player.setTrackRepeat(true)

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.success,
            author: {
                name: `Repeat: Song.`,
            },
        })
    } else if (global.musicState.player.trackRepeat === true) {
        global.musicState.player.setTrackRepeat(false)

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.success,
            author: {
                name: `Repeat: No repeat.`,
            },
        })
    } else {
        global.musicState.player.setQueueRepeat(true)

        await sendEphemeralEmbed(ctx.channel, {
            color: Color.success,
            author: {
                name: `Repeat: Queue.`,
            },
        })
    }
}

export async function shuffle(ctx: Message) {
    await global.musicState.player.queue.shuffle()
    global.musicState.player.queue.pagesGenerator()

    await safeReact(ctx, Reactions.success)
}

export async function leave(ctx: Message) {
    await global.musicState.player.destroy()

    global.musicState.clear()
    global.dataState.clear()

    await safeReact(ctx, Reactions.success)
}

export async function fairShuffle(ctx: Message) {
    global.musicState.player.queue.fairShuffle()

    global.musicState.player.queue.pagesGenerator()

    await safeReact(ctx, Reactions.success)
}
