export type PieceColor = 'white' | 'black'

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'

export interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

export type Square = Piece | null

export type Board = Square[][]

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

export type BotDifficulty = 'easy' | 'medium' | 'hard'

export interface HintMove {
  from: Position
  to: Position
}
