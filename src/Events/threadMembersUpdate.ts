import { Event } from '../Interfaces'
import { Collection, Snowflake, ThreadMember, ThreadChannel, VoiceChannel } from 'discord.js'
import { updateMainEmbedMessage } from '../VoiceHandler'
import Configs from '../config.json'
import Logger from '../Logger'
const log = Logger(Configs.EventsLogLevel, 'threadMembersUpdate.ts')

export const event: Event = {
    name: 'threadMembersUpdate',
    run: async (client, oldMembers: Collection<Snowflake, ThreadMember>, newMembers: Collection<Snowflake, ThreadMember>) => {
        if (global.musicState.player === null) return

        if (newMembers.size !== 0 && newMembers.first().thread.id === global.dataState.threadID) {
            log.debug(`Checking members in thread...`)

            await client.channels.fetch(global.musicState.player.voiceChannel).then(async (voiceChannel: VoiceChannel) => {
                if (voiceChannel) {
                    await client.channels.fetch(global.dataState.threadID).then(async (thread: ThreadChannel) => {
                        if (thread.isThread()) {
                            log.debug(`Building new thread presence map...`)

                            let newMap = new Map()

                            thread.members.cache.forEach(async (threadMember: ThreadMember, id: string) => {
                                if (voiceChannel.members.get(id) === undefined) {
                                    log.debug(`Found member, removing from thread...`)

                                    try {
                                        await threadMember.remove()

                                        log.success({ message: 'Member removed', level: 4 })
                                    } catch (e) {
                                        log.error(new Error(`Failed to remove thread member, this is a discord internal error ${e.stack}`))
                                    }
                                } else newMap.set(id, true)
                            })

                            global.dataState.threadMembers = newMap

                            if (global.dataState.isThreadCreated === true) global.musicState.taskQueue.enqueueTask('updateMainMessage', [null])

                            log.debug(`New presence map create with ${newMap.size} members`)
                        } else log.warn(`Failed to get thread from voice channel while checking`)
                    })
                } else log.warn(`Failed to fetch voice channel while checking`)
            })
        }
    },
}
