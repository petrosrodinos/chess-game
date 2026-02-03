import type { Board, Piece, Move, PlayerColor, Narc } from '../../../pages/Game/types'

export const PlayerColors = {
    WHITE: 'white',
    BLACK: 'black'
} as const

export type { PlayerColor }

export const BoardSizeKeys = {
    SMALL: '12x12',
    MEDIUM: '12x16',
    LARGE: '12x20'
} as const

export type BoardSizeKey = typeof BoardSizeKeys[keyof typeof BoardSizeKeys]

export const GameStatuses = {
    WAITING: 'waiting',
    IN_PROGRESS: 'in_progress',
    FINISHED: 'finished'
} as const

export type GameStatus = typeof GameStatuses[keyof typeof GameStatuses]

export interface BoardSize {
    rows: number
    cols: number
}

export const BOARD_SIZES: Record<BoardSizeKey, BoardSize> = {
    [BoardSizeKeys.SMALL]: { rows: 12, cols: 12 },
    [BoardSizeKeys.MEDIUM]: { rows: 12, cols: 16 },
    [BoardSizeKeys.LARGE]: { rows: 12, cols: 20 }
}

export interface Player {
    id: string
    name: string
    color: PlayerColor
    joinedAt: Date
}

export interface GameBoardState {
    board: Board
    currentPlayer: PlayerColor
    moveHistory: Move[]
    capturedPieces: { white: Piece[]; black: Piece[] }
    lastMove: Move | null
    gameOver: boolean
    winner: PlayerColor | null
    narcs: Narc[]
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

export interface CreateGameRequest {
    playerName: string
    boardSizeKey?: BoardSizeKey
}

export interface JoinGameRequest {
    code: string
    playerName: string
}

export interface GetGameRequest {
    code: string
    playerId?: string
}

export interface SyncGameRequest {
    code: string
    gameState: GameBoardState
}
