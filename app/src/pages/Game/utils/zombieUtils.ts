import type { Board, BoardSize, Piece, PieceType, PlayerColor, Position } from '../types'
import { isPiece, PieceTypes, PlayerColors } from '../types'
import { cloneBoard, getBackRowForBoardSize } from './boardUtils'

const ZOMBIE_ELIGIBLE_TYPES: PieceType[] = [
  PieceTypes.RAM_TOWER,
  PieceTypes.CHARIOT,
  PieceTypes.BOMBER,
  PieceTypes.PALADIN
]

export const isZombieEligibleType = (pieceType: PieceType): boolean => {
  return ZOMBIE_ELIGIBLE_TYPES.includes(pieceType)
}

export const filterZombieRevivablePieces = (pieces: Piece[]): Piece[] => {
  return pieces.filter(piece => isZombieEligibleType(piece.type))
}

export const getNightModeFromBoard = (board: Board): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.isZombie) {
        return true
      }
    }
  }
  return false
}

export const getAdjustedAttackRange = (piece: Piece, baseRange: number): number => {
  let range = baseRange

  if (piece.type === PieceTypes.NECROMANCER) {
    const reviveCount = piece.reviveCount ?? 0
    range = Math.max(0, range - reviveCount * 2)
  }

  if (piece.isZombie && piece.type === PieceTypes.BOMBER) {
    return 1
  }

  if (piece.isZombie && piece.type !== PieceTypes.BOMBER) {
    range = Math.min(range, 1)
  }

  return range
}

export const getStartingPositionForPieceType = (
  boardSize: BoardSize,
  pieceType: PieceType,
  color: PlayerColor
): Position | null => {
  const backRow = getBackRowForBoardSize(boardSize.cols)
  const col = backRow.indexOf(pieceType)
  if (col === -1) return null
  const row = color === PlayerColors.WHITE ? boardSize.rows - 1 : 0
  return { row, col }
}

export const areRevivalGuardsInPlace = (board: Board, boardSize: BoardSize, color: PlayerColor): boolean => {
  const required = [PieceTypes.WARLOCK, PieceTypes.MONARCH, PieceTypes.DUCHESS]
  for (const type of required) {
    const pos = getStartingPositionForPieceType(boardSize, type, color)
    if (!pos) return false
    const cell = board[pos.row][pos.col]
    if (!cell || !isPiece(cell)) return false
    if (cell.type !== type || cell.color !== color) return false
  }
  return true
}

export const findPiecePosition = (board: Board, pieceType: PieceType, color: PlayerColor): Position | null => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col]
      if (cell && isPiece(cell) && cell.type === pieceType && cell.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

export const reviveZombiePiece = (
  board: Board,
  necromancerPosition: Position,
  revivePiece: Piece,
  target: Position,
  currentPlayer: PlayerColor
): Board => {
  const newBoard = cloneBoard(board)
  const necromancer = newBoard[necromancerPosition.row][necromancerPosition.col]
  if (necromancer && isPiece(necromancer) && necromancer.type === PieceTypes.NECROMANCER) {
    newBoard[necromancerPosition.row][necromancerPosition.col] = {
      ...necromancer,
      reviveCount: (necromancer.reviveCount ?? 0) + 1
    }
  }
  newBoard[target.row][target.col] = {
    ...revivePiece,
    color: currentPlayer,
    isZombie: true,
    hasMoved: false
  }
  return newBoard
}

export const getZombieRevivePieces = (
  capturedPieces: { white: Piece[]; black: Piece[] },
  currentPlayer: PlayerColor
): Piece[] => {
  const pieces = capturedPieces?.[currentPlayer] || []
  return filterZombieRevivablePieces(pieces)
}

export const isZombieReviveTargetEmpty = (board: Board, target: Position | null): boolean => {
  if (!target) return false
  return board[target.row][target.col] === null
}

export const getZombieReviveOpenState = (params: {
  gameOver: boolean
  mysteryBoxActive: boolean
  revivableCount: number
  necromancerPosition: Position | null
  isOnline: boolean
  isMyTurn: boolean
}): boolean => {
  const { gameOver, mysteryBoxActive, revivableCount, necromancerPosition, isOnline, isMyTurn } = params
  if (gameOver || mysteryBoxActive) return false
  if (revivableCount === 0) return false
  if (!necromancerPosition) return false
  if (isOnline && !isMyTurn) return false
  return true
}

export const getZombieReviveConfirmState = (params: {
  necromancerPosition: Position | null
  selectedZombiePiece: Piece | null
  selectedZombieTarget: Position | null
  targetIsEmpty: boolean
  guardsInPlace: boolean
  isOnline: boolean
  isMyTurn: boolean
}): boolean => {
  const {
    necromancerPosition,
    selectedZombiePiece,
    selectedZombieTarget,
    targetIsEmpty,
    guardsInPlace,
    isOnline,
    isMyTurn
  } = params

  if (!necromancerPosition || !selectedZombiePiece || !selectedZombieTarget) return false
  if (!targetIsEmpty || !guardsInPlace) return false
  if (isOnline && !isMyTurn) return false
  return true
}

export const getZombieReviveStatusMessage = (params: {
  isOnline: boolean
  isMyTurn: boolean
  necromancerPosition: Position | null
  guardsInPlace: boolean
  revivableCount: number
  selectedZombiePiece: Piece | null
  selectedZombieTarget: Position | null
  targetIsEmpty: boolean
}): string | null => {
  const {
    isOnline,
    isMyTurn,
    necromancerPosition,
    guardsInPlace,
    revivableCount,
    selectedZombiePiece,
    selectedZombieTarget,
    targetIsEmpty
  } = params

  if (isOnline && !isMyTurn) return 'Wait for your turn to revive a Zombie.'
  if (!necromancerPosition) return 'Your Necromancer must be on the board.'
  if (!guardsInPlace) return 'Warlock, Monarch, and Duchess must be in their starting positions.'
  if (revivableCount === 0) return 'No eligible captured pieces available.'
  if (selectedZombiePiece && !selectedZombieTarget) return 'Select an empty tile to place the Zombie.'
  if (selectedZombieTarget && !targetIsEmpty) return 'The selected tile is not empty.'
  return null
}
