import type { Board, PieceType } from '../types'

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null))
  
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: 'black', hasMoved: false }
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false }
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false }
    board[7][col] = { type: backRow[col], color: 'white', hasMoved: false }
  }
  
  return board
}

export const cloneBoard = (board: Board): Board => {
  return board.map(row => row.map(square => square ? { ...square } : null))
}

export const isInBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}
