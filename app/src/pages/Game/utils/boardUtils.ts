import type { Board, PieceType, BoardSize, ObstacleType, CellContent, BoardSizeKey, Piece } from '../types'
import { isPiece, isObstacle, PlayerColors, PieceTypes, ObstacleTypes, BoardSizeKeys } from '../types'
import { OBSTACLE_COUNTS, BACK_ROW_PIECES } from '../constants'

let pieceIdCounter = 0
const generatePieceId = (): string => `piece-${++pieceIdCounter}`

const createPiece = (type: PieceType, color: typeof PlayerColors.WHITE | typeof PlayerColors.BLACK): Piece => ({
  id: generatePieceId(),
  type,
  color,
  hasMoved: false
})

const getObstacleCounts = (boardSizeKey: BoardSizeKey): Record<ObstacleType, number> => {
  return OBSTACLE_COUNTS[boardSizeKey] || OBSTACLE_COUNTS[BoardSizeKeys.SMALL]
}

const getBoardSizeKey = (_rows: number, cols: number): BoardSizeKey => {
  if (cols === 20) return BoardSizeKeys.LARGE
  if (cols === 16) return BoardSizeKeys.MEDIUM
  return BoardSizeKeys.SMALL
}

const isProtectedZone = (row: number, _col: number, rows: number): boolean => {
  return row < 2 || row >= rows - 2
}

const placeObstacles = (board: Board, rows: number, cols: number): void => {
  const boardSizeKey = getBoardSizeKey(rows, cols)
  const obstacleCounts = getObstacleCounts(boardSizeKey)

  const obstacleTypes = Object.keys(obstacleCounts) as ObstacleType[]

  for (const obstacleType of obstacleTypes) {
    const count = obstacleCounts[obstacleType]
    let placed = 0
    let attempts = 0
    const maxAttempts = count * 50

    while (placed < count && attempts < maxAttempts) {
      attempts++
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)

      if (isProtectedZone(row, col, rows)) continue
      if (board[row][col] !== null) continue

      board[row][col] = { type: obstacleType }
      placed++
    }
  }
}

const generateBackRow = (cols: number): PieceType[] => {
  if (cols === 12) {
    return [...BACK_ROW_PIECES]
  }

  const row: PieceType[] = []
  const baseRow = [...BACK_ROW_PIECES]
  const extraCols = cols - 12
  const leftPad = Math.floor(extraCols / 2)

  for (let i = 0; i < leftPad; i++) {
    row.push(PieceTypes.HOPLITE)
  }

  row.push(...baseRow)

  for (let i = 0; i < cols - row.length; i++) {
    row.push(PieceTypes.HOPLITE)
  }

  return row
}

export const createInitialBoard = (boardSize: BoardSize): Board => {
  const { rows, cols } = boardSize
  const board: Board = Array(rows).fill(null).map(() => Array(cols).fill(null))

  const backRow = generateBackRow(cols)

  for (let col = 0; col < cols; col++) {
    board[0][col] = createPiece(backRow[col], PlayerColors.BLACK)
  }

  for (let col = 0; col < cols; col++) {
    board[1][col] = createPiece(PieceTypes.HOPLITE, PlayerColors.BLACK)
  }

  for (let col = 0; col < cols; col++) {
    board[rows - 2][col] = createPiece(PieceTypes.HOPLITE, PlayerColors.WHITE)
  }

  for (let col = 0; col < cols; col++) {
    board[rows - 1][col] = createPiece(backRow[col], PlayerColors.WHITE)
  }

  placeObstacles(board, rows, cols)

  return board
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

export const getObstacleType = (board: Board, row: number, col: number): ObstacleType | null => {
  const cell = getCellContent(board, row, col)
  if (isObstacle(cell)) {
    return cell.type
  }
  return null
}

export const findPiecePositions = (board: Board, pieceType: PieceType): { row: number; col: number }[] => {
  const positions: { row: number; col: number }[] = []
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.type === pieceType) {
        positions.push({ row, col })
      }
    }
  }
  return positions
}

export const findAllCaves = (board: Board): { row: number; col: number }[] => {
  const caves: { row: number; col: number }[] = []
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isObstacle(cell) && cell.type === ObstacleTypes.CAVE) {
        caves.push({ row, col })
      }
    }
  }
  return caves
}

export const movePiece = (board: Board, from: { row: number; col: number }, to: { row: number; col: number }): Board => {
  const newBoard = cloneBoard(board)
  const piece = newBoard[from.row][from.col]

  if (piece && isPiece(piece)) {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true }
    newBoard[from.row][from.col] = null
  }

  return newBoard
}

export const attackPiece = (board: Board, targetPos: { row: number; col: number }): Board => {
  const newBoard = cloneBoard(board)
  newBoard[targetPos.row][targetPos.col] = null
  return newBoard
}
