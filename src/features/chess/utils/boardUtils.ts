import type { Board, PieceType, BoardSize, ObstacleType, CellContent } from '../types'
import { isPiece, isObstacle, PieceColors, PieceTypes, ObstacleTypes } from '../types'
import { OBSTACLE_DENSITY } from '../constants'

const OBSTACLE_TYPE_VALUES: ObstacleType[] = Object.values(ObstacleTypes)

const getRandomObstacle = (): ObstacleType => {
  return OBSTACLE_TYPE_VALUES[Math.floor(Math.random() * OBSTACLE_TYPE_VALUES.length)]
}

const getObstacleCount = (rows: number, cols: number): number => {
  const key = `${cols}x${rows}` as keyof typeof OBSTACLE_DENSITY
  const config = OBSTACLE_DENSITY[key] || { min: 8, max: 14 }
  return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min
}

const isProtectedZone = (row: number, col: number, rows: number, cols: number): boolean => {
  const pieceRows = 2
  const kingCol = Math.floor(cols / 2)
  
  if (row < pieceRows || row >= rows - pieceRows) {
    return true
  }
  
  if (row >= pieceRows && row < pieceRows + 2) {
    if (col >= kingCol - 2 && col <= kingCol + 2) return true
  }
  if (row >= rows - pieceRows - 2 && row < rows - pieceRows) {
    if (col >= kingCol - 2 && col <= kingCol + 2) return true
  }
  
  return false
}

const placeObstacles = (board: Board, rows: number, cols: number): void => {
  const obstacleCount = getObstacleCount(rows, cols)
  let placed = 0
  let attempts = 0
  const maxAttempts = obstacleCount * 20
  
  while (placed < obstacleCount && attempts < maxAttempts) {
    attempts++
    const row = Math.floor(Math.random() * rows)
    const col = Math.floor(Math.random() * cols)
    
    if (isProtectedZone(row, col, rows, cols)) continue
    if (board[row][col] !== null) continue
    
    board[row][col] = { type: getRandomObstacle() }
    placed++
  }
}

export const createInitialBoard = (boardSize: BoardSize): Board => {
  const { rows, cols } = boardSize
  const board: Board = Array(rows).fill(null).map(() => Array(cols).fill(null))
  
  const backRow: PieceType[] = generateBackRow(cols)
  const pawnRow: PieceType[] = Array(cols).fill(PieceTypes.PAWN)
  
  for (let col = 0; col < cols; col++) {
    if (backRow[col]) {
      board[0][col] = { type: backRow[col], color: PieceColors.BLACK, hasMoved: false }
    }
    board[1][col] = { type: pawnRow[col], color: PieceColors.BLACK, hasMoved: false }
    board[rows - 2][col] = { type: pawnRow[col], color: PieceColors.WHITE, hasMoved: false }
    if (backRow[col]) {
      board[rows - 1][col] = { type: backRow[col], color: PieceColors.WHITE, hasMoved: false }
    }
  }
  
  placeObstacles(board, rows, cols)
  
  return board
}

const generateBackRow = (cols: number): PieceType[] => {
  const row: PieceType[] = Array(cols).fill(null as unknown as PieceType)
  
  const center = Math.floor(cols / 2)
  
  row[center - 1] = PieceTypes.QUEEN
  row[center] = PieceTypes.KING
  
  row[0] = PieceTypes.ROOK
  row[cols - 1] = PieceTypes.ROOK
  
  row[1] = PieceTypes.KNIGHT
  row[cols - 2] = PieceTypes.KNIGHT
  
  row[2] = PieceTypes.BISHOP
  row[cols - 3] = PieceTypes.BISHOP
  
  if (cols >= 10) {
    row[3] = PieceTypes.BISHOP
    row[cols - 4] = PieceTypes.BISHOP
  }
  
  if (cols >= 12) {
    row[4] = PieceTypes.KNIGHT
    row[cols - 5] = PieceTypes.KNIGHT
  }
  
  return row
}

export const cloneBoard = (board: Board): Board => {
  return board.map(row => row.map(cell => {
    if (cell === null) return null
    if (isPiece(cell)) return { ...cell }
    if (isObstacle(cell)) return { ...cell }
    return null
  }))
}

export const isInBounds = (row: number, col: number, boardSize: BoardSize): boolean => {
  return row >= 0 && row < boardSize.rows && col >= 0 && col < boardSize.cols
}

export const getCellContent = (board: Board, row: number, col: number): CellContent => {
  if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
    return null
  }
  return board[row][col]
}

export const isSquareBlockedByObstacle = (board: Board, row: number, col: number): boolean => {
  const cell = getCellContent(board, row, col)
  return isObstacle(cell)
}
