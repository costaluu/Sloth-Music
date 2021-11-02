import { Player } from 'erela.js'
import AsyncTaskQueue from '../TaskQueue'

export interface MusicState {
    currentSkipVotes: number
    taskQueue: AsyncTaskQueue
    votesByUser: Map<string, boolean>
    player?: Player
    votesToSkip(): Promise<number>
    mainEmbedMessageID?: string
    mainEmbedMessageTimeStamp?: any
    mainEmbedMessageButtons(): any
    mainEmbedMessageTitle(showDuration: boolean, showNowPlaying: boolean): string
    mainEmbedMessageFooter(): string
    mainEmbedMessage(): Promise<object>
    queueEmbedMessageID?: string
    queueEmbedMessage(): any
    queueEmbedMessageButtons(): any
    clear(): Promise<void>
}
