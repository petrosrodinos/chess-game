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
  return row < 3 || row >= rows - 3
}

const GROUPED_OBSTACLES: ObstacleType[] = [
  ObstacleTypes.RIVER,
  ObstacleTypes.LAKE,
  ObstacleTypes.CAVE,
  ObstacleTypes.CANYON,
  ObstacleTypes.ROCK,
  ObstacleTypes.TREE
]

const getAdjacentPositions = (row: number, col: number): { row: number; col: number }[] => {
  return [
    { row: row, col: col + 1 },
    { row: row + 1, col: col },
    { row: row, col: col - 1 },
    { row: row - 1, col: col }
  ]
}

const placeMysteryBoxes = (
  board: Board,
  rows: number,
  cols: number,
  count: number
): void => {
  const centerCol = Math.floor(cols / 2)
  const leftHalfEnd = centerCol - 1
  const rightHalfStart = centerCol + 1

  const boxesPerHalf = Math.floor(count / 2)
  const extraBox = count % 2

  let placedLeft = 0
  let placedRight = 0
  let attempts = 0
  const maxAttempts = count * 100

  while ((placedLeft < boxesPerHalf || placedRight < boxesPerHalf + extraBox) && attempts < maxAttempts) {
    attempts++

    const targetLeft = placedLeft < boxesPerHalf
    const targetRight = placedRight < boxesPerHalf + extraBox

    let col: number
    if (targetLeft && (!targetRight || Math.random() < 0.5)) {
      col = Math.floor(Math.random() * (leftHalfEnd + 1))
    } else if (targetRight) {
      col = rightHalfStart + Math.floor(Math.random() * (cols - rightHalfStart))
    } else {
      continue
    }

    const row = Math.floor(Math.random() * rows)

    if (isProtectedZone(row, col, rows)) continue
    if (board[row][col] !== null) continue

    board[row][col] = { type: ObstacleTypes.MYSTERY_BOX }

    if (col <= leftHalfEnd) {
      placedLeft++
    } else {
      placedRight++
    }
  }
}

const placeGroupedObstacle = (
  board: Board,
  obstacleType: ObstacleType,
  rows: number,
  cols: number,
  groupSize: number
): number => {
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    attempts++
    const row = Math.floor(Math.random() * rows)
    const col = Math.floor(Math.random() * cols)

    if (isProtectedZone(row, 0, rows)) continue
    if (board[row][col] !== null) continue

    const adjacents = getAdjacentPositions(row, col)
    const validAdjacents = adjacents.filter(pos => {
      if (pos.row < 0 || pos.row >= rows || pos.col < 0 || pos.col >= cols) return false
      if (isProtectedZone(pos.row, 0, rows)) return false
      if (board[pos.row][pos.col] !== null) return false
      return true
    })

    if (validAdjacents.length === 0) continue

    const adjacentPos = validAdjacents[Math.floor(Math.random() * validAdjacents.length)]

    board[row][col] = { type: obstacleType }
    board[adjacentPos.row][adjacentPos.col] = { type: obstacleType }

    return groupSize
  }

  return 0
}

const placeObstacles = (board: Board, rows: number, cols: number): void => {
  const boardSizeKey = getBoardSizeKey(rows, cols)
  const obstacleCounts = getObstacleCounts(boardSizeKey)
  const isSmallBoard = boardSizeKey === BoardSizeKeys.SMALL

  const obstacleTypes = Object.keys(obstacleCounts) as ObstacleType[]

  for (const obstacleType of obstacleTypes) {
    const count = obstacleCounts[obstacleType]
    let placed = 0

    if (obstacleType === ObstacleTypes.MYSTERY_BOX) {
      placeMysteryBoxes(board, rows, cols, count)
      continue
    }

    const shouldGroup = isSmallBoard && GROUPED_OBSTACLES.includes(obstacleType)

    if (shouldGroup) {
      const groupSize = 2
      const numGroups = Math.floor(count / groupSize)

      for (let g = 0; g < numGroups; g++) {
        const placedInGroup = placeGroupedObstacle(board, obstacleType, rows, cols, groupSize)
        placed += placedInGroup
      }
    } else {
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
