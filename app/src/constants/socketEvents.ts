export const SocketEvents = {
    CREATE_GAME: 'game:create',
    JOIN_GAME: 'game:join',
    GET_GAME: 'game:get',
    LEAVE_GAME: 'game:leave',
    PLAYER_JOINED: 'game:player_joined',
    PLAYER_LEFT: 'game:player_left',
    GAME_START: 'game:start',
    GAME_STATE: 'game:state',
    SYNC_GAME: 'game:sync',
    GAME_UPDATE: 'game:update',
    ERROR: 'game:error',
    MYSTERY_BOX_TRIGGERED: 'game:mystery_box_triggered',
    MYSTERY_BOX_COMPLETE: 'game:mystery_box_complete',
    NECROMANCER_REVIVE_STARTED: 'game:necromancer_revive_started',
    NECROMANCER_FREEZE: 'game:necromancer_freeze'
} as const

export type SocketEvent = typeof SocketEvents[keyof typeof SocketEvents]
