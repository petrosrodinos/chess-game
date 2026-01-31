import type { GameState, BoardSize, PieceRules, ObstacleType } from '../types'
import { PlayerColors, PieceTypes, ObstacleTypes, BotDifficulties, BoardSizeKeys, MovePatterns } from '../types'

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

export const PIECE_RULES: Record<string, PieceRules> = {
  [PieceTypes.HOPLITE]: {
    move: [3, 2],
    attackRange: 1,
    canPass: [ObstacleTypes.CAVE],
    points: 3
  },
  [PieceTypes.RAM_TOWER]: {
    move: MovePatterns.CROSS,
    attackRange: 5,
    canPass: [],
    points: 20
  },
  [PieceTypes.CHARIOT]: {
    move: [[2, 1], [1, 2], [2, 2], [3, 1], [1, 3]],
    attackRange: 4,
    canPass: [ObstacleTypes.RIVER],
    canJumpPieces: true,
    points: 16,
    zombiePoints: 13
  },
  [PieceTypes.BOMBER]: {
    move: [[1, 0], [0, 1], [1, 1], [2, 0], [0, 2]],
    attackRange: 0,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.RIVER, ObstacleTypes.CANYON],
    points: 12,
    zombiePoints: 9
  },
  [PieceTypes.PALADIN]: {
    move: MovePatterns.SIDEWAYS,
    attackRange: 3,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.RIVER, ObstacleTypes.CANYON],
    points: 15,
    zombiePoints: 12
  },
  [PieceTypes.WARLOCK]: {
    move: [[2, 0], [0, 2], [2, 2]],
    attackRange: 2,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.LAKE],
    canJumpPieces: true,
    points: 11
  },
  [PieceTypes.MONARCH]: {
    move: MovePatterns.ANY,
    attackRange: 1,
    canPass: [ObstacleTypes.CAVE],
    points: 210
  },
  [PieceTypes.DUCHESS]: {
    move: MovePatterns.ANY,
    attackRange: 9,
    canPass: [ObstacleTypes.RIVER],
    points: 27
  },
  [PieceTypes.NECROMANCER]: {
    move: MovePatterns.ANY,
    attackRange: 1,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.LAKE],
    points: 13
  }
} as const

export const PIECE_SYMBOLS = {
  [PlayerColors.WHITE]: {
    [PieceTypes.HOPLITE]: '⚔️',
    [PieceTypes.RAM_TOWER]: '🏰',
    [PieceTypes.CHARIOT]: '🐴',
    [PieceTypes.BOMBER]: '💣',
    [PieceTypes.PALADIN]: '🛡️',
    [PieceTypes.WARLOCK]: '🧙',
    [PieceTypes.MONARCH]: '👑',
    [PieceTypes.DUCHESS]: '👸',
    [PieceTypes.NECROMANCER]: '💀'
  },
  [PlayerColors.BLACK]: {
    [PieceTypes.HOPLITE]: '⚔️',
    [PieceTypes.RAM_TOWER]: '🏰',
    [PieceTypes.CHARIOT]: '🐴',
    [PieceTypes.BOMBER]: '💣',
    [PieceTypes.PALADIN]: '🛡️',
    [PieceTypes.WARLOCK]: '🧙',
    [PieceTypes.MONARCH]: '👑',
    [PieceTypes.DUCHESS]: '👸',
    [PieceTypes.NECROMANCER]: '💀'
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

export const PIECE_NAMES = {
  [PieceTypes.HOPLITE]: 'Hoplite',
  [PieceTypes.RAM_TOWER]: 'Ram Tower',
  [PieceTypes.CHARIOT]: 'Chariot',
  [PieceTypes.BOMBER]: 'Bomber',
  [PieceTypes.PALADIN]: 'Paladin',
  [PieceTypes.WARLOCK]: 'Warlock',
  [PieceTypes.MONARCH]: 'Monarch',
  [PieceTypes.DUCHESS]: 'Duchess',
  [PieceTypes.NECROMANCER]: 'Necromancer'
} as const

export const OBSTACLE_NAMES = {
  [ObstacleTypes.CAVE]: 'Cave',
  [ObstacleTypes.TREE]: 'Tree',
  [ObstacleTypes.ROCK]: 'Rock',
  [ObstacleTypes.RIVER]: 'River',
  [ObstacleTypes.LAKE]: 'Lake',
  [ObstacleTypes.CANYON]: 'Canyon',
  [ObstacleTypes.MYSTERY_BOX]: 'Mystery Box'
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

export const OBSTACLE_COUNTS: Record<string, Record<ObstacleType, number>> = {
  [BoardSizeKeys.SMALL]: {
    [ObstacleTypes.CAVE]: 2,
    [ObstacleTypes.TREE]: 2,
    [ObstacleTypes.ROCK]: 2,
    [ObstacleTypes.LAKE]: 4,
    [ObstacleTypes.RIVER]: 3,
    [ObstacleTypes.CANYON]: 3,
    [ObstacleTypes.MYSTERY_BOX]: 2
  },
  [BoardSizeKeys.MEDIUM]: {
    [ObstacleTypes.CAVE]: 2,
    [ObstacleTypes.TREE]: 3,
    [ObstacleTypes.ROCK]: 3,
    [ObstacleTypes.LAKE]: 4,
    [ObstacleTypes.RIVER]: 3,
    [ObstacleTypes.CANYON]: 3,
    [ObstacleTypes.MYSTERY_BOX]: 2
  },
  [BoardSizeKeys.LARGE]: {
    [ObstacleTypes.CAVE]: 2,
    [ObstacleTypes.TREE]: 3,
    [ObstacleTypes.ROCK]: 3,
    [ObstacleTypes.LAKE]: 5,
    [ObstacleTypes.RIVER]: 4,
    [ObstacleTypes.CANYON]: 4,
    [ObstacleTypes.MYSTERY_BOX]: 3
  }
} as const

export const BACK_ROW_PIECES = [
  PieceTypes.RAM_TOWER,
  PieceTypes.CHARIOT,
  PieceTypes.BOMBER,
  PieceTypes.PALADIN,
  PieceTypes.WARLOCK,
  PieceTypes.MONARCH,
  PieceTypes.DUCHESS,
  PieceTypes.NECROMANCER,
  PieceTypes.PALADIN,
  PieceTypes.BOMBER,
  PieceTypes.CHARIOT,
  PieceTypes.RAM_TOWER
] as const

export const DEFAULT_BOARD_SIZE: BoardSize = { rows: 12, cols: 12 }

export const INITIAL_GAME_STATE: GameState = {
  board: [],
  boardSize: DEFAULT_BOARD_SIZE,
  currentPlayer: PlayerColors.WHITE,
  selectedPosition: null,
  validMoves: [],
  validAttacks: [],
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  lastMove: null,
  gameOver: false,
  winner: null
}

export const BOT_DELAY = {
  [BotDifficulties.EASY]: 400,
  [BotDifficulties.MEDIUM]: 400,
  [BotDifficulties.HARD]: 600
} as const
