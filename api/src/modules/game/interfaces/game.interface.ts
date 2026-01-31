import {
    PlayerColor,
    BoardSizeKey,
    BoardSize,
    GameStatus
} from '../constants/game.constants'

export interface Position {
    row: number
    col: number
}

export interface Player {
    id: string
    name: string
    color: PlayerColor
    joinedAt: Date
}

export interface GameBoardState {
    board: unknown[][]
    currentPlayer: PlayerColor
    moveHistory: unknown[]
    capturedPieces: { white: unknown[]; black: unknown[] }
    lastMove: unknown | null
    gameOver: boolean
    winner: PlayerColor | null
}

export interface GameSession {
    code: string
    boardSizeKey: BoardSizeKey
    boardSize: BoardSize
    status: GameStatus
    players: Player[]
    createdAt: Date
    hostPlayerId: string
    gameState?: GameBoardState
}

export interface GetGamePayload {
    code: string
    playerId?: string
}
