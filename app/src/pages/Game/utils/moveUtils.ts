import type { Board, Piece, Position, Move, PlayerColor, PieceType, BoardSize, ObstacleType } from '../types'
import { isPiece, isObstacle, PlayerColors, PieceTypes, ObstacleTypes, MovePatterns } from '../types'
import { isInBounds, cloneBoard, getObstacleType, findAllCaves } from './boardUtils'
import { PIECE_RULES } from '../constants'

const canPassObstacle = (pieceType: PieceType, obstacleType: ObstacleType): boolean => {
  const rules = PIECE_RULES[pieceType]
  return rules.canPass.includes(obstacleType)
}

const isPathClear = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  boardSize: BoardSize
): boolean => {
  const rules = PIECE_RULES[piece.type]

  if (rules.canJumpPieces) {
    const targetObstacle = getObstacleType(board, to.row, to.col)
    if (targetObstacle && !canPassObstacle(piece.type, targetObstacle)) {
      return false
    }
    return true
  }

  const rowDir = to.row === from.row ? 0 : (to.row > from.row ? 1 : -1)
  const colDir = to.col === from.col ? 0 : (to.col > from.col ? 1 : -1)

  let row = from.row + rowDir
  let col = from.col + colDir

  while (row !== to.row || col !== to.col) {
    if (!isInBounds(row, col, boardSize)) return false

    const cell = board[row][col]
    if (cell) {
      if (isPiece(cell)) return false
      if (isObstacle(cell) && !canPassObstacle(piece.type, cell.type)) return false
    }

    row += rowDir
    col += colDir
  }

  const targetCell = board[to.row][to.col]
  if (targetCell && isObstacle(targetCell)) {
    if (!canPassObstacle(piece.type, targetCell.type)) return false
  }

  return true
}

const getHopliteMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const rules = PIECE_RULES[PieceTypes.HOPLITE]
  const maxSteps = piece.hasMoved ? (rules.move as number[])[1] : (rules.move as number[])[0]
  const direction = piece.color === PlayerColors.WHITE ? -1 : 1

  for (let steps = 1; steps <= maxSteps; steps++) {
    const newRow = pos.row + (direction * steps)
    if (!isInBounds(newRow, pos.col, boardSize)) break

    const targetCell = board[newRow][pos.col]
    if (targetCell) {
      if (isPiece(targetCell)) break
      if (isObstacle(targetCell) && !canPassObstacle(piece.type, targetCell.type)) break
    }

    moves.push({ row: newRow, col: pos.col })
  }

  return moves
}

const getCrossMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  for (const [rowDir, colDir] of directions) {
    let row = pos.row + rowDir
    let col = pos.col + colDir

    while (isInBounds(row, col, boardSize)) {
      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) break
        if (isObstacle(cell)) {
          if (canPassObstacle(piece.type, cell.type)) {
            // Can pass through, continue to next square
            row += rowDir
            col += colDir
            continue
          } else {
            // Cannot pass, stop here
            break
          }
        }
      }

      // Only add empty squares as valid moves
      moves.push({ row, col })
      row += rowDir
      col += colDir
    }
  }

  return moves
}

const getSidewaysMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const directions = [[0, -1], [0, 1]]

  for (const [rowDir, colDir] of directions) {
    let row = pos.row + rowDir
    let col = pos.col + colDir

    while (isInBounds(row, col, boardSize)) {
      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) break
        if (isObstacle(cell)) {
          if (canPassObstacle(piece.type, cell.type)) {
            // Can pass through, continue to next square
            row += rowDir
            col += colDir
            continue
          } else {
            // Cannot pass, stop here
            break
          }
        }
      }

      // Only add empty squares as valid moves
      moves.push({ row, col })
      row += rowDir
      col += colDir
    }
  }

  return moves
}

const getAnyDirectionMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize, maxSteps: number = 1): Position[] => {
  const moves: Position[] = []
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  for (const [rowDir, colDir] of directions) {
    for (let step = 1; step <= maxSteps; step++) {
      const row = pos.row + (rowDir * step)
      const col = pos.col + (colDir * step)

      if (!isInBounds(row, col, boardSize)) break

      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) break
        if (isObstacle(cell)) {
          if (canPassObstacle(piece.type, cell.type)) {
            // Can pass through, continue to next step
            continue
          } else {
            // Cannot pass, stop here
            break
          }
        }
      }

      // Only add empty squares as valid moves
      moves.push({ row, col })
    }
  }

  return moves
}

const getPatternMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const rules = PIECE_RULES[piece.type]
  const patterns = rules.move as number[][]

  for (const pattern of patterns) {
    const [dx, dy] = pattern

    const variations = [
      [dx, dy], [dx, -dy], [-dx, dy], [-dx, -dy],
      [dy, dx], [dy, -dx], [-dy, dx], [-dy, -dx]
    ]

    for (const [rowOff, colOff] of variations) {
      const newRow = pos.row + rowOff
      const newCol = pos.col + colOff

      if (!isInBounds(newRow, newCol, boardSize)) continue

      if (!isPathClear(board, pos, { row: newRow, col: newCol }, piece, boardSize)) continue

      const targetCell = board[newRow][newCol]
      if (targetCell && isPiece(targetCell)) continue

      moves.push({ row: newRow, col: newCol })
    }
  }

  const uniqueMoves = moves.filter((move, index, self) =>
    index === self.findIndex(m => m.row === move.row && m.col === move.col)
  )

  return uniqueMoves
}

const getCaveTeleportMoves = (board: Board, pos: Position, piece: Piece): Position[] => {
  const moves: Position[] = []

  if (!PIECE_RULES[piece.type].canPass.includes(ObstacleTypes.CAVE)) {
    return moves
  }

  const currentCell = board[pos.row][pos.col]
  if (!currentCell || !isObstacle(currentCell) || currentCell.type !== ObstacleTypes.CAVE) {
    return moves
  }

  const caves = findAllCaves(board)
  for (const cave of caves) {
    if (cave.row !== pos.row || cave.col !== pos.col) {
      moves.push({ row: cave.row, col: cave.col })
    }
  }

  return moves
}

export const getPieceMoves = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  const cell = board[pos.row][pos.col]
  if (!cell || !isPiece(cell)) return []

  const rules = PIECE_RULES[cell.type]
  let moves: Position[] = []

  if (cell.type === PieceTypes.HOPLITE) {
    moves = getHopliteMoves(board, pos, cell, boardSize)
  } else if (rules.move === MovePatterns.CROSS) {
    moves = getCrossMoves(board, pos, cell, boardSize)
  } else if (rules.move === MovePatterns.SIDEWAYS) {
    moves = getSidewaysMoves(board, pos, cell, boardSize)
  } else if (rules.move === MovePatterns.ANY) {
    const maxSteps = cell.type === PieceTypes.MONARCH ? 1 : boardSize.rows
    moves = getAnyDirectionMoves(board, pos, cell, boardSize, maxSteps)
  } else if (Array.isArray(rules.move)) {
    moves = getPatternMoves(board, pos, cell, boardSize)
  }

  const caveMoves = getCaveTeleportMoves(board, pos, cell)
  moves = [...moves, ...caveMoves]

  return moves
}

const isInAttackRange = (from: Position, to: Position, attackRange: number): boolean => {
  const dx = Math.abs(to.row - from.row)
  const dy = Math.abs(to.col - from.col)
  return Math.max(dx, dy) <= attackRange
}

const isAttackPathClear = (
  board: Board,
  from: Position,
  to: Position,
  _piece: Piece,
  boardSize: BoardSize
): boolean => {
  const rowDir = to.row === from.row ? 0 : (to.row > from.row ? 1 : -1)
  const colDir = to.col === from.col ? 0 : (to.col > from.col ? 1 : -1)

  let row = from.row + rowDir
  let col = from.col + colDir

  while (row !== to.row || col !== to.col) {
    if (!isInBounds(row, col, boardSize)) return false

    const cell = board[row][col]
    if (cell) {
      if (isPiece(cell)) return false
      if (isObstacle(cell)) {
        if (cell.type === ObstacleTypes.TREE ||
          cell.type === ObstacleTypes.ROCK ||
          cell.type === ObstacleTypes.CANYON) {
          return false
        }
      }
    }

    row += rowDir
    col += colDir
  }

  return true
}

export const getValidAttacks = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  const cell = board[pos.row][pos.col]
  if (!cell || !isPiece(cell)) return []

  const rules = PIECE_RULES[cell.type]
  const attacks: Position[] = []

  if (rules.attackRange === 0) return []

  if (cell.type === PieceTypes.HOPLITE) {
    for (const colOff of [-1, 1]) {
      const newCol = pos.col + colOff
      if (!isInBounds(pos.row, newCol, boardSize)) continue

      const targetCell = board[pos.row][newCol]
      if (targetCell && isPiece(targetCell) && targetCell.color !== cell.color) {
        attacks.push({ row: pos.row, col: newCol })
      }
    }
    return attacks
  }

  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      if (row === pos.row && col === pos.col) continue

      const targetCell = board[row][col]
      if (!targetCell || !isPiece(targetCell)) continue
      if (targetCell.color === cell.color) continue

      if (!isInAttackRange(pos, { row, col }, rules.attackRange)) continue

      if (!isAttackPathClear(board, pos, { row, col }, cell, boardSize)) continue

      attacks.push({ row, col })
    }
  }

  return attacks
}

export const getValidMoves = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  return getPieceMoves(board, pos, boardSize)
}

export const isValidMove = (
  _piece: PieceType,
  start: Position,
  end: Position,
  board: Board,
  boardSize: BoardSize
): boolean => {
  const moves = getPieceMoves(board, start, boardSize)
  return moves.some(m => m.row === end.row && m.col === end.col)
}

export const canAttack = (
  _piece: PieceType,
  start: Position,
  target: Position,
  board: Board,
  boardSize: BoardSize
): boolean => {
  const attacks = getValidAttacks(board, start, boardSize)
  return attacks.some(a => a.row === target.row && a.col === target.col)
}

export const makeMove = (
  board: Board,
  from: Position,
  to: Position,
  _boardSize: BoardSize,
  isAttack: boolean = false
): { newBoard: Board; move: Move } => {
  const newBoard = cloneBoard(board)
  const cell = newBoard[from.row][from.col]

  if (!cell || !isPiece(cell)) {
    throw new Error('No piece at source position')
  }

  const piece = cell
  const targetCell = newBoard[to.row][to.col]
  const captured = targetCell && isPiece(targetCell) ? targetCell : undefined

  const move: Move = {
    from,
    to,
    piece: { ...piece },
    captured: captured ? { ...captured } : undefined,
    isAttack
  }

  if (isAttack && captured) {
    newBoard[to.row][to.col] = null
  } else {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true }
    newBoard[from.row][from.col] = null
  }

  if (!isAttack) {
    newBoard[from.row][from.col] = null
  }

  return { newBoard, move }
}

export const hasLegalMoves = (board: Board, color: PlayerColor, boardSize: BoardSize): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.color === color) {
        const moves = getValidMoves(board, { row, col }, boardSize)
        if (moves.length > 0) return true

        const attacks = getValidAttacks(board, { row, col }, boardSize)
        if (attacks.length > 0) return true
      }
    }
  }
  return false
}

export const findMonarch = (board: Board, color: PlayerColor): Position | null => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.type === PieceTypes.MONARCH && cell.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

export const isMonarchCaptured = (board: Board, color: PlayerColor): boolean => {
  return findMonarch(board, color) === null
}
