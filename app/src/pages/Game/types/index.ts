export const PlayerColors = {
  WHITE: 'white',
  BLACK: 'black'
} as const

export type PlayerColor = typeof PlayerColors[keyof typeof PlayerColors]

export const PieceTypes = {
  HOPLITE: 'hoplite',
  RAM_TOWER: 'ramTower',
  CHARIOT: 'chariot',
  BOMBER: 'bomber',
  PALADIN: 'paladin',
  WARLOCK: 'warlock',
  MONARCH: 'monarch',
  DUCHESS: 'duchess',
  NECROMANCER: 'necromancer'
} as const

export type PieceType = typeof PieceTypes[keyof typeof PieceTypes]

export const MovePatterns = {
  ANY: 'any',
  SIDEWAYS: 'sideways',
  CROSS: 'cross'
} as const

export type MovePattern = typeof MovePatterns[keyof typeof MovePatterns]

export const ObstacleTypes = {
  CAVE: 'cave',
  TREE: 'tree',
  ROCK: 'rock',
  RIVER: 'river',
  LAKE: 'lake',
  CANYON: 'canyon',
  MYSTERY_BOX: 'mysteryBox'
} as const

export type ObstacleType = typeof ObstacleTypes[keyof typeof ObstacleTypes]

export const BotDifficulties = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const

export type BotDifficulty = typeof BotDifficulties[keyof typeof BotDifficulties]

export const BoardSizeKeys = {
  SMALL: '12x12',
  MEDIUM: '12x16',
  LARGE: '12x20'
} as const

export type BoardSizeKey = typeof BoardSizeKeys[keyof typeof BoardSizeKeys]

export interface PieceRules {
  move: MovePattern | number[][] | number[]
  attackRange: number
  canPass: ObstacleType[]
  canJumpPieces?: boolean
  points: number
  zombiePoints?: number
}

export interface Piece {
  id: string
  type: PieceType
  color: PlayerColor
  hasMoved?: boolean
  isZombie?: boolean
}

export interface Obstacle {
  type: ObstacleType
}

export type CellContent = Piece | Obstacle | null

export function isPiece(cell: CellContent): cell is Piece {
  return cell !== null && 'color' in cell
}

export function isObstacle(cell: CellContent): cell is Obstacle {
  return cell !== null && !('color' in cell) && 'type' in cell
}

export type BoardSize = { rows: number; cols: number }

export const BOARD_SIZES: Record<BoardSizeKey, BoardSize> = {
  [BoardSizeKeys.SMALL]: { rows: 12, cols: 12 },
  [BoardSizeKeys.MEDIUM]: { rows: 12, cols: 16 },
  [BoardSizeKeys.LARGE]: { rows: 12, cols: 20 }
} as const

export type Board = CellContent[][]

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  piece: Piece
  captured?: Piece
  isAttack?: boolean
}

export interface GameState {
  board: Board
  boardSize: BoardSize
  currentPlayer: PlayerColor
  selectedPosition: Position | null
  validMoves: Position[]
  validAttacks: Position[]
  moveHistory: Move[]
  capturedPieces: { white: Piece[]; black: Piece[] }
  lastMove: Move | null
  gameOver: boolean
  winner: PlayerColor | null
}

export interface HintMove {
  from: Position
  to: Position
  isAttack?: boolean
}
