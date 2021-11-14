/**
 * Control roles has the power to use the bot even outside the Thread/VC
 */

import { Message, User } from 'discord.js'

export enum ControlRoles {
    Cosmos = '474774889778380820',
    Admin = '574265899801116673',
    Moderator = '497522510212890655',
    Dev = '876107010419073054',
    AstroSloth = '817761854880612363',
    SlothExplorer = '706635884090359899',
    SlothNapper = '706635836954902620',
    Teacher = '507298235766013981',
}

/**
 * Control roles has the power to use the bot even if they are not the current DJ, i.e, they need to be in Thread/VC
 */

export enum DJRoles {
    SlothNation = '706635763802046505',
    SlothSupporter = '817649706615177287',
    DJ = '586494128427106322',
}

/**
 * @Control
 * @DJRole
 * @CurrentDJ
 * @NoPermission
 */

export enum RoleLevel {
    ControlRole = 3,
    DJRole = 2,
    CurrentDJ = 1,
    NoPermission = 0,
}

/**
 * @threadMembers internal map for save the current thread members, avoid trolls in the thread music
 * @userPermissions check permissions of the user
 * @clear clears the state
 */

export interface BotState {
    botID: number
    teacherBot: boolean
    anchorUser: User
    isThreadCreated: boolean
    threadID: string
    threadMembers: Map<string, boolean>
    userPermissions(userID: string): Promise<[RoleLevel, boolean]>
    managerBotPermission(ctx: Message): Promise<boolean>
    controlRoles: ControlRoles[]
    djRoles: DJRoles[]
    clear(): void
}
