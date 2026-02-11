import type { Board, PieceType, BoardSize, ObstacleType, CellContent, BoardSizeKey, Piece } from '../types'
import { isPiece, isObstacle, PlayerColors, PieceTypes, ObstacleTypes, BoardSizeKeys } from '../types'
import { OBSTACLE_COUNTS, BACK_ROW_PIECES } from '../constants'

let pieceIdCounter = 0
const generatePieceId = (): string => `piece-${++pieceIdCounter}`

const createPiece = (type: PieceType, color: typeof PlayerColors.WHITE | typeof PlayerColors.BLACK): Piece => {
  const piece: Piece = {
    id: generatePieceId(),
    type,
    color,
    hasMoved: false
  }

  if (type === PieceTypes.NECROMANCER) {
    piece.reviveCount = 0
  }

  return piece
}

const getObstacleCounts = (boardSizeKey: BoardSizeKey): Record<ObstacleType, number> => {
  return OBSTACLE_COUNTS[boardSizeKey] || OBSTACLE_COUNTS[BoardSizeKeys.SMALL]
}

const getBoardSizeKey = (_rows: number, cols: number): BoardSizeKey => {
  if (cols === 20) return BoardSizeKeys.LARGE
  if (cols === 16) return BoardSizeKeys.MEDIUM
  return BoardSizeKeys.SMALL
}

const FIGURE_LINE_MIN_DISTANCE = 4

const isProtectedZone = (row: number, _col: number, rows: number): boolean => {
  return row < 3 || row >= rows - 3
}

const isAtLeastNBlocksFromFigureLines = (row: number, rows: number, minBlocks: number): boolean => {
  const minRow = minBlocks + 1
  const maxRow = rows - 2 - minBlocks
  return row >= minRow && row <= maxRow
}

const getManhattanDistance = (r1: number, c1: number, r2: number, c2: number): number => {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2)
}

const placeCaves = (board: Board, rows: number, cols: number, count: number): void => {
  const placedPositions: { row: number; col: number }[] = []
  let attempts = 0
  const maxAttempts = count * 200

  while (placedPositions.length < count && attempts < maxAttempts) {
    attempts++
    const row = Math.floor(Math.random() * rows)
    const col = Math.floor(Math.random() * cols)

    if (!isAtLeastNBlocksFromFigureLines(row, rows, FIGURE_LINE_MIN_DISTANCE)) continue
    if (board[row][col] !== null) continue

    const tooCloseToOtherCave = placedPositions.some(
      pos => getManhattanDistance(row, col, pos.row, pos.col) < FIGURE_LINE_MIN_DISTANCE
    )
    if (tooCloseToOtherCave) continue

    board[row][col] = { type: ObstacleTypes.CAVE }
    placedPositions.push({ row, col })
  }
}

const GROUPED_OBSTACLES: ObstacleType[] = []

const LAKE_SHAPES: Record<number, { dr: number; dc: number }[]> = {
  4: [{ dr: 0, dc: 0 }, { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }],
  5: [{ dr: 0, dc: 0 }, { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }]
}

const placeLake = (board: Board, rows: number, cols: number, count: number): void => {
  const shape = LAKE_SHAPES[count] ?? LAKE_SHAPES[4]
  const minDr = Math.min(...shape.map(s => s.dr))
  const maxDr = Math.max(...shape.map(s => s.dr))
  const minDc = Math.min(...shape.map(s => s.dc))
  const maxDc = Math.max(...shape.map(s => s.dc))
  const rowRange = rows - 6 - (maxDr - minDr)
  const colRange = cols - (maxDc - minDc + 1)
  let attempts = 0
  const maxAttempts = 150

  while (attempts < maxAttempts) {
    attempts++
    const baseRow = 3 - minDr + Math.floor(Math.random() * Math.max(1, rowRange))
    const baseCol = 0 - minDc + Math.floor(Math.random() * Math.max(1, colRange))

    const cells: { row: number; col: number }[] = shape.map(({ dr, dc }) => ({
      row: baseRow + dr,
      col: baseCol + dc
    }))

    const allInBounds = cells.every(c => c.row >= 0 && c.row < rows && c.col >= 0 && c.col < cols)
    if (!allInBounds) continue

    const allInProtected = cells.every(c => !isProtectedZone(c.row, c.col, rows))
    if (!allInProtected) continue

    const allEmpty = cells.every(c => board[c.row][c.col] === null)
    if (!allEmpty) continue

    for (const c of cells) {
      board[c.row][c.col] = { type: ObstacleTypes.LAKE }
    }
    return
  }
}

type LinearObstacleShape = 'horizontal' | 'vertical' | 'gamma'

const placeLinearObstacle = (
  board: Board,
  obstacleType: ObstacleType,
  rows: number,
  cols: number,
  count: number
): void => {
  const shapes: LinearObstacleShape[] = ['horizontal', 'vertical', 'gamma']
  const shape = shapes[Math.floor(Math.random() * shapes.length)]
  let attempts = 0
  const maxAttempts = 150

  while (attempts < maxAttempts) {
    attempts++
    const cells: { row: number; col: number }[] = []

    if (shape === 'horizontal') {
      const row = 3 + Math.floor(Math.random() * (rows - 6))
      const startCol = Math.floor(Math.random() * (cols - count + 1))
      for (let i = 0; i < count; i++) {
        cells.push({ row, col: startCol + i })
      }
    } else if (shape === 'vertical') {
      const col = Math.floor(Math.random() * cols)
      const startRow = 3 + Math.floor(Math.random() * (rows - 6 - count + 1))
      for (let i = 0; i < count; i++) {
        cells.push({ row: startRow + i, col })
      }
    } else {
      const leg1 = Math.ceil(count / 2)
      const leg2 = count - leg1 + 1
      const vertFirst = Math.random() < 0.5
      const dir = Math.random() < 0.5 ? 1 : -1

      if (vertFirst) {
        const row = 3 + Math.floor(Math.random() * Math.max(1, rows - 6 - leg1 + 1))
        const colRange = cols - leg2 + 1
        const col = dir === 1 ? Math.floor(Math.random() * Math.max(1, colRange)) : (leg2 - 1) + Math.floor(Math.random() * Math.max(1, colRange))
        for (let i = 0; i < leg1; i++) cells.push({ row: row + i, col })
        for (let i = 1; i < leg2; i++) cells.push({ row: row + leg1 - 1, col: col + i * dir })
      } else {
        const rowRange = rows - 6 - leg2 + 1
        const row = dir === 1
          ? 3 + Math.floor(Math.random() * Math.max(1, rowRange))
          : (2 + leg2) + Math.floor(Math.random() * Math.max(1, rows - 6 - leg2 + 1))
        const col = Math.floor(Math.random() * Math.max(1, cols - leg1 + 1))
        for (let i = 0; i < leg1; i++) cells.push({ row, col: col + i })
        for (let i = 1; i < leg2; i++) cells.push({ row: row + i * dir, col: col + leg1 - 1 })
      }
    }

    const allInBounds = cells.every(c => c.row >= 0 && c.row < rows && c.col >= 0 && c.col < cols)
    if (!allInBounds) continue

    const allInProtected = cells.every(c => !isProtectedZone(c.row, c.col, rows))
    if (!allInProtected) continue

    const allEmpty = cells.every(c => board[c.row][c.col] === null)
    if (!allEmpty) continue

    for (const c of cells) {
      board[c.row][c.col] = { type: obstacleType }
    }
    return
  }
}

const CLUSTERED_OBSTACLES: ObstacleType[] = [
  ObstacleTypes.TREE,
  ObstacleTypes.ROCK
]

const placeClusteredObstacles = (
  board: Board,
  obstacleType: ObstacleType,
  rows: number,
  cols: number,
  count: number
): void => {
  const placedPositions: { row: number; col: number }[] = []
  let attempts = 0
  const maxAttempts = count * 200

  while (placedPositions.length < count && attempts < maxAttempts) {
    attempts++
    let row: number
    let col: number

    if (placedPositions.length === 0) {
      row = Math.floor(Math.random() * rows)
      col = Math.floor(Math.random() * cols)
    } else {
      const anchor = placedPositions[Math.floor(Math.random() * placedPositions.length)]
      const adjacents = getAdjacentPositions(anchor.row, anchor.col)
      const validAdjacents = adjacents.filter(pos => {
        if (pos.row < 0 || pos.row >= rows || pos.col < 0 || pos.col >= cols) return false
        if (isProtectedZone(pos.row, pos.col, rows)) return false
        if (board[pos.row][pos.col] !== null) return false
        return true
      })
      if (validAdjacents.length === 0) continue
      const pos = validAdjacents[Math.floor(Math.random() * validAdjacents.length)]
      row = pos.row
      col = pos.col
    }

    if (isProtectedZone(row, col, rows)) continue
    if (board[row][col] !== null) continue

    board[row][col] = { type: obstacleType }
    placedPositions.push({ row, col })
  }
}

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

    if (obstacleType === ObstacleTypes.CAVE) {
      placeCaves(board, rows, cols, count)
      continue
    }

    if (obstacleType === ObstacleTypes.LAKE) {
      placeLake(board, rows, cols, count)
      continue
    }

    if (obstacleType === ObstacleTypes.RIVER || obstacleType === ObstacleTypes.CANYON) {
      placeLinearObstacle(board, obstacleType, rows, cols, count)
      continue
    }

    if (CLUSTERED_OBSTACLES.includes(obstacleType)) {
      placeClusteredObstacles(board, obstacleType, rows, cols, count)
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

export const getBackRowForBoardSize = (cols: number): PieceType[] => {
  return generateBackRow(cols)
}

export const createInitialBoard = (boardSize: BoardSize): Board => {
  const { rows, cols } = boardSize
  const board: Board = Array(rows).fill(null).map(() => Array(cols).fill(null))

  const backRow = getBackRowForBoardSize(cols)

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
