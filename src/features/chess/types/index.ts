export const PieceColors = {
  WHITE: 'white',
  BLACK: 'black'
} as const

export type PieceColor = typeof PieceColors[keyof typeof PieceColors]

export const PieceTypes = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  BISHOP: 'bishop',
  KNIGHT: 'knight',
  PAWN: 'pawn'
} as const

export type PieceType = typeof PieceTypes[keyof typeof PieceTypes]

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

export interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
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
  [BoardSizeKeys.MEDIUM]: { rows: 16, cols: 12 },
  [BoardSizeKeys.LARGE]: { rows: 20, cols: 12 }
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
  isEnPassant?: boolean
  isCastling?: boolean
  promotion?: PieceType
}

export interface GameState {
  board: Board
  boardSize: BoardSize
  currentPlayer: PieceColor
  selectedPosition: Position | null
  validMoves: Position[]
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  moveHistory: Move[]
  capturedPieces: { white: Piece[]; black: Piece[] }
  lastMove: Move | null
}

export interface HintMove {
  from: Position
  to: Position
}
