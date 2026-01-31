import type { GameState, BoardSize } from '../types'
import { PieceColors, PieceTypes, ObstacleTypes, BotDifficulties, BoardSizeKeys } from '../types'

export const generateFiles = (cols: number): string[] => {
  const files: string[] = []
  for (let i = 0; i < cols; i++) {
    files.push(String.fromCharCode(97 + i))
  }
  return files
}

export const generateRanks = (rows: number): string[] => {
  const ranks: string[] = []
  for (let i = rows; i > 0; i--) {
    ranks.push(String(i))
  }
  return ranks
}

export const PIECE_VALUES = {
  [PieceTypes.PAWN]: 100,
  [PieceTypes.KNIGHT]: 320,
  [PieceTypes.BISHOP]: 330,
  [PieceTypes.ROOK]: 500,
  [PieceTypes.QUEEN]: 900,
  [PieceTypes.KING]: 20000
} as const

export const PIECE_SYMBOLS = {
  [PieceColors.WHITE]: {
    [PieceTypes.KING]: '♔',
    [PieceTypes.QUEEN]: '♕',
    [PieceTypes.ROOK]: '♖',
    [PieceTypes.BISHOP]: '♗',
    [PieceTypes.KNIGHT]: '♘',
    [PieceTypes.PAWN]: '♙'
  },
  [PieceColors.BLACK]: {
    [PieceTypes.KING]: '♚',
    [PieceTypes.QUEEN]: '♛',
    [PieceTypes.ROOK]: '♜',
    [PieceTypes.BISHOP]: '♝',
    [PieceTypes.KNIGHT]: '♞',
    [PieceTypes.PAWN]: '♟'
  }
} as const

export const OBSTACLE_SYMBOLS = {
  [ObstacleTypes.CAVE]: '🕳️',
  [ObstacleTypes.TREE]: '🌲',
  [ObstacleTypes.ROCK]: '🪨',
  [ObstacleTypes.RIVER]: '🌊',
  [ObstacleTypes.LAKE]: '💧',
  [ObstacleTypes.CANYON]: '🏜️',
  [ObstacleTypes.MYSTERY_BOX]: '❓'
} as const

export const OBSTACLE_COLORS = {
  [ObstacleTypes.CAVE]: '#2d2d2d',
  [ObstacleTypes.TREE]: '#228b22',
  [ObstacleTypes.ROCK]: '#808080',
  [ObstacleTypes.RIVER]: '#4169e1',
  [ObstacleTypes.LAKE]: '#1e90ff',
  [ObstacleTypes.CANYON]: '#cd853f',
  [ObstacleTypes.MYSTERY_BOX]: '#9932cc'
} as const

export const OBSTACLE_DENSITY = {
  [BoardSizeKeys.SMALL]: { min: 8, max: 14 },
  [BoardSizeKeys.MEDIUM]: { min: 12, max: 20 },
  [BoardSizeKeys.LARGE]: { min: 16, max: 28 }
} as const

export const DEFAULT_BOARD_SIZE: BoardSize = { rows: 12, cols: 12 }

export const INITIAL_GAME_STATE: GameState = {
  board: [],
  boardSize: DEFAULT_BOARD_SIZE,
  currentPlayer: PieceColors.WHITE,
  selectedPosition: null,
  validMoves: [],
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  lastMove: null
}

export const BOT_DELAY = {
  [BotDifficulties.EASY]: 400,
  [BotDifficulties.MEDIUM]: 400,
  [BotDifficulties.HARD]: 600
} as const
