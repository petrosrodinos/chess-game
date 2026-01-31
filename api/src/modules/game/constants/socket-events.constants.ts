export const SocketEvents = {
    CREATE_GAME: 'game:create',
    JOIN_GAME: 'game:join',
    GET_GAME: 'game:get',
    PLAYER_JOINED: 'game:player_joined',
    GAME_START: 'game:start',
    GAME_STATE: 'game:state',
    SYNC_GAME: 'game:sync',
    GAME_UPDATE: 'game:update',
    ERROR: 'game:error'
} as const

export type SocketEvent = typeof SocketEvents[keyof typeof SocketEvents]
