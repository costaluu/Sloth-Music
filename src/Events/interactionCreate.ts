import { Event } from '../Interfaces'
import { Interaction } from 'discord.js'
import Logger from '../Logger'
import { RoleLevel } from '../Interfaces'
import Configs from '../config.json'
import { Player } from 'erela.js'
const log = Logger(Configs.EventsLogLevel, 'interactionCreate.ts')

export const event: Event = {
    name: 'interactionCreate',
    run: async (client, interaction: Interaction) => {
        if (global.musicState.player === null || !interaction.isButton()) return

        /* userPermissions: RoleLevel, isUserInVC? */

        let userPermissions: [RoleLevel, boolean] = await global.dataState.userPermissions(interaction.user.id)

        await interaction.deferUpdate().finally(() => {
            return true
        })

        const Actions = {
            Toggle() {
                if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true))
                    global.musicState.taskQueue.enqueueTask('Toggle', [null, true])
            },
            Stop() {
                if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true))
                    global.musicState.taskQueue.enqueueTask('Stop', [null, true])
            },
            async Skip() {
                if (global.musicState.votesByUser.get(interaction.user.id) === undefined) {
                    if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true))
                        global.musicState.currentSkipVotes = await global.musicState.votesToSkip()
                    else {
                        global.musicState.currentSkipVotes = global.musicState.currentSkipVotes + 1
                        global.musicState.votesByUser.set(interaction.user.id, true) // Unique user vote
                    }

                    global.musicState.taskQueue.enqueueTask('Skip', [null, true, false])
                }
            },
            Repeat() {
                if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true))
                    global.musicState.taskQueue.enqueueTask('Repeat', [null, true])
            },
            Leave() {
                if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true))
                    global.musicState.taskQueue.enqueueTask('Leave', [null, true])
            },
            PreviousPage() {
                if (userPermissions[1]) global.musicState.taskQueue.enqueueTask('PreviousPage', null)
            },
            NextPage() {
                if (userPermissions[1]) global.musicState.taskQueue.enqueueTask('NextPage', null)
            },
            Shuffle() {
                if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true))
                    global.musicState.taskQueue.enqueueTask('Shuffle', [null, true])
            },
            FairShuffle() {
                if (userPermissions[0] === RoleLevel.ControlRole || (userPermissions[0] === RoleLevel.DJRole && userPermissions[1] === true) || (userPermissions[0] === RoleLevel.CurrentDJ && userPermissions[1] === true))
                    global.musicState.taskQueue.enqueueTask('FairShuffle', [null, true])
            },
        }

        let action = Actions[interaction.customId]

        if (action) action()
        else log.error(new Error(`Action not found!`))
    },
}
