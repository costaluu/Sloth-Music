import { Queue, Player, Track } from 'erela.js'

export interface MusicState {
    currentSkipVotes: number
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
    clear()
}
