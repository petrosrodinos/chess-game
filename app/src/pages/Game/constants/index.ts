import type { GameState, BoardSize, PieceRules, ObstacleType, PieceType } from '../types'
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
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.MYSTERY_BOX],
    points: 3
  },
  [PieceTypes.RAM_TOWER]: {
    move: MovePatterns.CROSS,
    attackRange: 5,
    canPass: [ObstacleTypes.MYSTERY_BOX],
    points: 20
  },
  [PieceTypes.CHARIOT]: {
    move: [[2, 1], [1, 2], [2, 2], [3, 1], [1, 3]],
    attackRange: 4,
    canPass: [ObstacleTypes.RIVER, ObstacleTypes.MYSTERY_BOX],
    canJumpPieces: true,
    points: 16,
    zombiePoints: 13
  },
  [PieceTypes.BOMBER]: {
    move: [[1, 0], [0, 1], [1, 1], [2, 0], [0, 2], [2, 2]],
    attackRange: 0,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.RIVER, ObstacleTypes.CANYON, ObstacleTypes.MYSTERY_BOX],
    canJumpPieces: true,
    points: 12,
    zombiePoints: 9
  },
  [PieceTypes.PALADIN]: {
    move: MovePatterns.DIAGONAL,
    attackRange: 3,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.RIVER, ObstacleTypes.CANYON, ObstacleTypes.MYSTERY_BOX],
    points: 15,
    zombiePoints: 12
  },
  [PieceTypes.WARLOCK]: {
    move: [[2, 0], [0, 2], [2, 2]],
    attackRange: 2,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.LAKE, ObstacleTypes.MYSTERY_BOX],
    canJumpPieces: true,
    points: 11
  },
  [PieceTypes.MONARCH]: {
    move: MovePatterns.ANY,
    attackRange: 1,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.MYSTERY_BOX],
    points: 210
  },
  [PieceTypes.DUCHESS]: {
    move: MovePatterns.ANY,
    attackRange: 9,
    canPass: [ObstacleTypes.RIVER, ObstacleTypes.MYSTERY_BOX],
    points: 27
  },
  [PieceTypes.NECROMANCER]: {
    move: [[1, 0], [0, 1], [1, 1]],
    attackRange: 8,
    canPass: [ObstacleTypes.CAVE, ObstacleTypes.LAKE, ObstacleTypes.MYSTERY_BOX],
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

export const RULES_FIGURE_ORDER: readonly PieceType[] = [
  PieceTypes.HOPLITE,
  PieceTypes.RAM_TOWER,
  PieceTypes.CHARIOT,
  PieceTypes.BOMBER,
  PieceTypes.PALADIN,
  PieceTypes.WARLOCK,
  PieceTypes.MONARCH,
  PieceTypes.DUCHESS,
  PieceTypes.NECROMANCER
] as const

export const RULES_FIGURE_SECTION_TITLES: Record<PieceType, string> = {
  [PieceTypes.HOPLITE]: 'Hoplite',
  [PieceTypes.RAM_TOWER]: 'Ram-Tower',
  [PieceTypes.CHARIOT]: 'Chariot',
  [PieceTypes.BOMBER]: 'Bomber',
  [PieceTypes.PALADIN]: 'Paladin',
  [PieceTypes.WARLOCK]: 'Warlock (Vezier)',
  [PieceTypes.MONARCH]: 'Monarch',
  [PieceTypes.DUCHESS]: 'Duchess',
  [PieceTypes.NECROMANCER]: 'Necromancer (Druid)'
} as const

export const FIGURE_RULES_BULLETS: Record<PieceType, readonly string[]> = {
  [PieceTypes.HOPLITE]: [
    'Moves 3 steps forward on the first move; afterwards, moves 2 steps.',
    'Can shoot 1 step sideways (either direction).',
    'Can pass through caves.',
    'Cannot pass through river, lake, or canyon.'
  ],
  [PieceTypes.RAM_TOWER]: [
    'Moves in a cross-like pattern (orthogonal) any number of steps.',
    'Can shoot up to 5 steps in a cross pattern.'
  ],
  [PieceTypes.CHARIOT]: [
    'Moves in corner patterns: 2-1, 1-2, 2-2, 3-1, 1-3 steps.',
    'Can pass over other figures on its path.',
    'Units killed by Chariot cannot be revived until Chariot is destroyed.',
    'Shooting range: 4 steps in a corner pattern only.',
    'Can pass through rivers (up to 2 steps wide).',
    'Cannot pass through lake, canyon, cave.'
  ],
  [PieceTypes.BOMBER]: [
    'Moves 1 or 2 steps in cross or X patterns.',
    'Cannot attack or shoot directly.',
    'When placed, triggers a net of explosives within 2 steps. Same-type figures ignited if a figure enters the range.',
    'Can pass through river (1 step wide), cave, canyon.',
    'Cannot pass through lake.'
  ],
  [PieceTypes.PALADIN]: [
    'Moves sideways any number of steps.',
    'Shoots up to 3 steps sideways.',
    'Can pass through river (1 step wide), cave, canyon.',
    'Cannot pass through lake.'
  ],
  [PieceTypes.WARLOCK]: [
    'Moves in 2-step corner patterns.',
    'Can pass over figures in its path.',
    'Can swap positions with any Hoplite and the Monarch.',
    'Can pass through lake and cave.',
    'Cannot pass through river or canyon.'
  ],
  [PieceTypes.MONARCH]: [
    'Moves in any direction, 1 step at a time.',
    'Shoots 1 step in any direction.',
    'Can pass through cave.',
    'Cannot pass through river, lake, canyon.'
  ],
  [PieceTypes.DUCHESS]: [
    'Moves in any direction.',
    'Shoots up to 9 steps in any direction.',
    'Can pass through river.',
    'Cannot pass through lake, canyon, cave.'
  ],
  [PieceTypes.NECROMANCER]: [
    'Moves in any direction.',
    'Shoots 1 step in any direction.',
    'Can revive Ram, Chariot, Bomber, Paladin if Monarch, Duchess, and Warlock are in original positions.',
    'Can shoot freeze stuns within 8 steps (range decreases by 2 for each revival).',
    'Revived figures cannot use long-range attacks. Bomber attacks normally as Zompie.',
    'Can pass through lake and cave.',
    'Cannot pass through river or canyon.'
  ]
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
    [ObstacleTypes.RIVER]: 2,
    [ObstacleTypes.CANYON]: 2,
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
  validSwaps: [],
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  lastMove: null,
  gameOver: false,
  winner: null,
  narcs: [],
  nightMode: false
}

export const BOT_DELAY = {
  [BotDifficulties.EASY]: 400,
  [BotDifficulties.MEDIUM]: 400,
  [BotDifficulties.HARD]: 600
} as const
