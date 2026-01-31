export const SocketEvents = {
    CREATE_GAME: 'game:create',
    JOIN_GAME: 'game:join',
    PLAYER_JOINED: 'game:player_joined',
    GAME_START: 'game:start',
    ERROR: 'game:error'
} as const

export type SocketEvent = typeof SocketEvents[keyof typeof SocketEvents]
