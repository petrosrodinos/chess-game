import type { Board, Piece, Position, Move, PlayerColor, PieceType, BoardSize, ObstacleType, Narc } from '../types'
import { isPiece, isObstacle, PlayerColors, PieceTypes, ObstacleTypes, MovePatterns } from '../types'
import { isInBounds, cloneBoard, getObstacleType, findAllCaves } from './boardUtils'
import { PIECE_RULES } from '../constants'
import { createNarcsForBomber, checkNarcNetTrigger, removeNarcsForBomber } from './narcUtils'
import { getAdjustedAttackRange } from './zombieUtils'

const canPassObstacle = (pieceType: PieceType, obstacleType: ObstacleType): boolean => {
  if (pieceType === PieceTypes.DUCHESS && obstacleType === ObstacleTypes.TREE) {
    return false
  }
  const rules = PIECE_RULES[pieceType]
  return rules.canPass.includes(obstacleType)
}

const canStopOnObstacle = (obstacleType: ObstacleType): boolean => {
  return obstacleType === ObstacleTypes.CAVE || obstacleType === ObstacleTypes.MYSTERY_BOX
}

const getMaxRiverWidth = (pieceType: PieceType): number => {
  const rules = PIECE_RULES[pieceType]
  return rules.maxRiverWidth ?? Infinity
}

const getAdjacentEmptyPositions = (board: Board, pos: Position, boardSize: BoardSize): Position[] => {
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ]
  const emptyPositions: Position[] = []

  for (const [rowDir, colDir] of directions) {
    const newRow = pos.row + rowDir
    const newCol = pos.col + colDir

    if (!isInBounds(newRow, newCol, boardSize)) continue

    const cell = board[newRow][newCol]
    if (cell === null) {
      emptyPositions.push({ row: newRow, col: newCol })
    }
  }

  return emptyPositions
}

const canEnterCave = (board: Board, cavePos: Position, boardSize: BoardSize): boolean => {
  const caves = findAllCaves(board)
  const otherCaves = caves.filter(c => c.row !== cavePos.row || c.col !== cavePos.col)

  for (const cave of otherCaves) {
    const adjacentEmpty = getAdjacentEmptyPositions(board, cave, boardSize)
    if (adjacentEmpty.length > 0) return true
  }

  return false
}

const isPathClear = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  boardSize: BoardSize
): boolean => {
  const rules = PIECE_RULES[piece.type]
  const maxRiver = getMaxRiverWidth(piece.type)

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
  let riverRun = 0

  while (row !== to.row || col !== to.col) {
    if (!isInBounds(row, col, boardSize)) return false

    const cell = board[row][col]
    if (cell) {
      if (isPiece(cell)) return false
      if (isObstacle(cell)) {
        if (!canPassObstacle(piece.type, cell.type)) return false
        if (cell.type === ObstacleTypes.RIVER) {
          if (riverRun >= maxRiver) return false
          riverRun++
        } else {
          riverRun = 0
        }
      }
    } else {
      riverRun = 0
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
      if (isObstacle(targetCell)) {
        if (canPassObstacle(piece.type, targetCell.type)) {
          if (canStopOnObstacle(targetCell.type)) {
            const obstaclePos = { row: newRow, col: pos.col }
            if (targetCell.type === ObstacleTypes.CAVE) {
              if (canEnterCave(board, obstaclePos, boardSize)) {
                moves.push(obstaclePos)
              }
            } else if (targetCell.type === ObstacleTypes.MYSTERY_BOX) {
              moves.push(obstaclePos)
            }
          }
          continue
        } else {
          break
        }
      }
    }

    moves.push({ row: newRow, col: pos.col })
  }

  return moves
}

const getCrossMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  const maxRiver = getMaxRiverWidth(piece.type)

  for (const [rowDir, colDir] of directions) {
    let row = pos.row + rowDir
    let col = pos.col + colDir
    let riverRun = 0

    while (isInBounds(row, col, boardSize)) {
      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) break
        if (isObstacle(cell)) {
          if (canPassObstacle(piece.type, cell.type)) {
            if (cell.type === ObstacleTypes.RIVER) {
              if (riverRun >= maxRiver) break
              riverRun++
            } else {
              riverRun = 0
            }
            if (canStopOnObstacle(cell.type)) {
              const obstaclePos = { row, col }
              if (cell.type === ObstacleTypes.CAVE) {
                if (canEnterCave(board, obstaclePos, boardSize)) {
                  moves.push(obstaclePos)
                }
              } else if (cell.type === ObstacleTypes.MYSTERY_BOX) {
                moves.push(obstaclePos)
              }
            }
            row += rowDir
            col += colDir
            continue
          } else {
            break
          }
        }
      } else {
        riverRun = 0
      }

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
  const maxRiver = getMaxRiverWidth(piece.type)

  for (const [rowDir, colDir] of directions) {
    let row = pos.row + rowDir
    let col = pos.col + colDir
    let riverRun = 0

    while (isInBounds(row, col, boardSize)) {
      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) break
        if (isObstacle(cell)) {
          if (canPassObstacle(piece.type, cell.type)) {
            if (cell.type === ObstacleTypes.RIVER) {
              if (riverRun >= maxRiver) break
              riverRun++
            } else {
              riverRun = 0
            }
            if (canStopOnObstacle(cell.type)) {
              const obstaclePos = { row, col }
              if (cell.type === ObstacleTypes.CAVE) {
                if (canEnterCave(board, obstaclePos, boardSize)) {
                  moves.push(obstaclePos)
                }
              } else if (cell.type === ObstacleTypes.MYSTERY_BOX) {
                moves.push(obstaclePos)
              }
            }
            row += rowDir
            col += colDir
            continue
          } else {
            break
          }
        }
      } else {
        riverRun = 0
      }

      moves.push({ row, col })
      row += rowDir
      col += colDir
    }
  }

  return moves
}

const getDiagonalMoves = (board: Board, pos: Position, piece: Piece, boardSize: BoardSize): Position[] => {
  const moves: Position[] = []
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  const maxRiver = getMaxRiverWidth(piece.type)

  for (const [rowDir, colDir] of directions) {
    let row = pos.row + rowDir
    let col = pos.col + colDir
    let riverRun = 0

    while (isInBounds(row, col, boardSize)) {
      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) break
        if (isObstacle(cell)) {
          if (canPassObstacle(piece.type, cell.type)) {
            if (cell.type === ObstacleTypes.RIVER) {
              if (riverRun >= maxRiver) break
              riverRun++
            } else {
              riverRun = 0
            }
            if (canStopOnObstacle(cell.type)) {
              const obstaclePos = { row, col }
              if (cell.type === ObstacleTypes.CAVE) {
                if (canEnterCave(board, obstaclePos, boardSize)) {
                  moves.push(obstaclePos)
                }
              } else if (cell.type === ObstacleTypes.MYSTERY_BOX) {
                moves.push(obstaclePos)
              }
            }
            row += rowDir
            col += colDir
            continue
          } else {
            break
          }
        }
      } else {
        riverRun = 0
      }

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
  const maxRiver = getMaxRiverWidth(piece.type)

  for (const [rowDir, colDir] of directions) {
    let riverRun = 0
    for (let step = 1; step <= maxSteps; step++) {
      const row = pos.row + (rowDir * step)
      const col = pos.col + (colDir * step)

      if (!isInBounds(row, col, boardSize)) break

      const cell = board[row][col]

      if (cell) {
        if (isPiece(cell)) break
        if (isObstacle(cell)) {
          if (canPassObstacle(piece.type, cell.type)) {
            if (cell.type === ObstacleTypes.RIVER) {
              if (riverRun >= maxRiver) break
              riverRun++
            } else {
              riverRun = 0
            }
            if (canStopOnObstacle(cell.type)) {
              const obstaclePos = { row, col }
              if (cell.type === ObstacleTypes.CAVE) {
                if (canEnterCave(board, obstaclePos, boardSize)) {
                  moves.push(obstaclePos)
                }
              } else if (cell.type === ObstacleTypes.MYSTERY_BOX) {
                moves.push(obstaclePos)
              }
            }
            continue
          } else {
            break
          }
        }
      } else {
        riverRun = 0
      }

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
  } else if (rules.move === MovePatterns.DIAGONAL) {
    moves = getDiagonalMoves(board, pos, cell, boardSize)
  } else if (rules.move === MovePatterns.ANY) {
    const maxSteps = cell.type === PieceTypes.MONARCH ? 1 : boardSize.rows
    moves = getAnyDirectionMoves(board, pos, cell, boardSize, maxSteps)
  } else if (Array.isArray(rules.move)) {
    moves = getPatternMoves(board, pos, cell, boardSize)
  }

  return moves
}

const isInAttackRange = (from: Position, to: Position, attackRange: number): boolean => {
  const dx = Math.abs(to.row - from.row)
  const dy = Math.abs(to.col - from.col)
  return Math.max(dx, dy) <= attackRange
}

const CHARIOT_GAMMA_OFFSETS: [number, number][] = [
  [3, 1], [3, -1], [-3, 1], [-3, -1],
  [1, 3], [1, -3], [-1, 3], [-1, -3],
  [4, 1], [4, -1], [-4, 1], [-4, -1],
  [1, 4], [1, -4], [-1, 4], [-1, -4]
]

const isChariotGammaAttack = (from: Position, to: Position): boolean => {
  const dr = to.row - from.row
  const dc = to.col - from.col
  return CHARIOT_GAMMA_OFFSETS.some(([or, oc]) => dr === or && dc === oc)
}

const isChariotRangedAttack = (from: Position, to: Position, maxRange: number): boolean => {
  const dr = to.row - from.row
  const dc = to.col - from.col
  if (dr !== 0 && dc !== 0) return false
  const dist = Math.abs(dr) + Math.abs(dc)
  return dist > 0 && dist <= maxRange
}

const getRamTowerValidAttacks = (board: Board, pos: Position, boardSize: BoardSize, cell: Piece): Position[] => {
  const attacks: Position[] = []
  const attackRange = getAdjustedAttackRange(cell, 5)

  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      if (row === pos.row && col === pos.col) continue

      const targetCell = board[row][col]
      if (!targetCell || !isPiece(targetCell)) continue
      if (targetCell.color === cell.color) continue

      const dr = row - pos.row
      const dc = col - pos.col
      if (dr !== 0 && dc !== 0) continue

      const dist = Math.abs(dr) + Math.abs(dc)
      if (dist > attackRange) continue

      if (!isAttackPathClear(board, pos, { row, col }, cell, boardSize)) continue

      attacks.push({ row, col })
    }
  }
  return attacks
}

const getPaladinValidAttacks = (board: Board, pos: Position, boardSize: BoardSize, cell: Piece): Position[] => {
  const attacks: Position[] = []
  const attackRange = getAdjustedAttackRange(cell, 3)
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

  for (const [rowDir, colDir] of directions) {
    for (let step = 1; step <= attackRange; step++) {
      const row = pos.row + rowDir * step
      const col = pos.col + colDir * step
      if (!isInBounds(row, col, boardSize)) break

      const targetCell = board[row][col]
      if (!targetCell) continue
      if (isObstacle(targetCell)) {
        if (!canPassObstacle(cell.type, targetCell.type)) break
        continue
      }
      if (targetCell.color === cell.color) break

      const target = { row, col }
      if (!isAttackPathClear(board, pos, target, cell, boardSize)) break

      attacks.push(target)
      break
    }
  }
  return attacks
}

const getChariotValidAttacks = (board: Board, pos: Position, boardSize: BoardSize, cell: Piece): Position[] => {
  const attacks: Position[] = []
  const attackRange = getAdjustedAttackRange(cell, 4)

  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      if (row === pos.row && col === pos.col) continue

      const targetCell = board[row][col]
      if (!targetCell || !isPiece(targetCell)) continue
      if (targetCell.color === cell.color) continue

      const target = { row, col }
      const isGamma = isChariotGammaAttack(pos, target)
      const isRanged = isChariotRangedAttack(pos, target, attackRange)

      if (isGamma) {
        attacks.push(target)
      } else if (isRanged && isAttackPathClear(board, pos, target, cell, boardSize)) {
        attacks.push(target)
      }
    }
  }
  return attacks
}

const isAttackPathClear = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
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
      if (isObstacle(cell) && !canPassObstacle(piece.type, cell.type)) return false
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
  const attackRange = getAdjustedAttackRange(cell, rules.attackRange)
  const attacks: Position[] = []

  if (attackRange === 0) return []

  if (cell.type === PieceTypes.RAM_TOWER) {
    return getRamTowerValidAttacks(board, pos, boardSize, cell)
  }

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

  if (cell.type === PieceTypes.CHARIOT) {
    return getChariotValidAttacks(board, pos, boardSize, cell)
  }

  if (cell.type === PieceTypes.PALADIN) {
    return getPaladinValidAttacks(board, pos, boardSize, cell)
  }

  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      if (row === pos.row && col === pos.col) continue

      const targetCell = board[row][col]
      if (!targetCell || !isPiece(targetCell)) continue
      if (targetCell.color === cell.color) continue

      if (!isInAttackRange(pos, { row, col }, attackRange)) continue

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

const getValidCaveExitPositions = (board: Board, enteredCavePos: Position, boardSize: BoardSize): Position[] => {
  const caves = findAllCaves(board)
  const otherCaves = caves.filter(c => c.row !== enteredCavePos.row || c.col !== enteredCavePos.col)
  const validExits: Position[] = []

  for (const cave of otherCaves) {
    const adjacentEmpty = getAdjacentEmptyPositions(board, cave, boardSize)
    validExits.push(...adjacentEmpty)
  }

  return validExits
}

const getRandomCaveExit = (board: Board, enteredCavePos: Position, boardSize: BoardSize): Position | null => {
  const validExits = getValidCaveExitPositions(board, enteredCavePos, boardSize)

  if (validExits.length === 0) return null

  const randomIndex = Math.floor(Math.random() * validExits.length)
  return validExits[randomIndex]
}

export const hasCaveExit = (board: Board, cavePos: Position, boardSize: BoardSize): boolean => {
  const validExits = getValidCaveExitPositions(board, cavePos, boardSize)
  return validExits.length > 0
}

export const makeMove = (
  board: Board,
  from: Position,
  to: Position,
  boardSize: BoardSize,
  isAttack: boolean = false,
  narcs: Narc[] = []
): { newBoard: Board; move: Move; newNarcs: Narc[] } => {
  const newBoard = cloneBoard(board)
  const cell = newBoard[from.row][from.col]

  if (!cell || !isPiece(cell)) {
    throw new Error('No piece at source position')
  }

  const piece = cell
  const targetCell = newBoard[to.row][to.col]
  const captured = targetCell && isPiece(targetCell) ? targetCell : undefined

  let finalPosition = to
  const isCaveDestination = targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.CAVE

  if (isCaveDestination && !isAttack) {
    const caveExit = getRandomCaveExit(newBoard, to, boardSize)
    if (caveExit) {
      finalPosition = caveExit
    }
  }

  let newNarcs = [...narcs]
  const triggeredNarcNet = checkNarcNetTrigger(board, boardSize, finalPosition, piece.color)

  if (triggeredNarcNet && !isAttack) {
    newBoard[from.row][from.col] = null

    const move: Move = {
      from,
      to: finalPosition,
      piece: { ...piece },
      captured: { ...piece },
      isAttack: false,
      terminatedByNarc: true
    }

    return { newBoard, move, newNarcs }
  }

  const move: Move = {
    from,
    to: finalPosition,
    piece: { ...piece },
    captured: captured ? { ...captured } : undefined,
    isAttack
  }

  if (isAttack && captured) {
    newBoard[to.row][to.col] = null
    if (captured.type === PieceTypes.BOMBER) {
      newNarcs = removeNarcsForBomber(newNarcs, captured.id)
    }
  } else {
    newBoard[finalPosition.row][finalPosition.col] = { ...piece, hasMoved: true }
    newBoard[from.row][from.col] = null
  }

  if (!isAttack) {
    newBoard[from.row][from.col] = null
  }

  if (piece.type === PieceTypes.BOMBER && !piece.isZombie && !isAttack) {
    newNarcs = removeNarcsForBomber(newNarcs, piece.id)
    const bomberNarcs = createNarcsForBomber(
      finalPosition,
      piece.color,
      piece.id,
      newBoard,
      boardSize,
      newNarcs
    )
    newNarcs = [...newNarcs, ...bomberNarcs]
  }

  return { newBoard, move, newNarcs }
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
