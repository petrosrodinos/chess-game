import type { Board, Position, Piece, PlayerColor } from '../types'
import { isPiece, PieceTypes } from '../types'
import { cloneBoard } from './boardUtils'

export interface SwapTarget {
    position: Position
    piece: Piece
    swapType: 'warlock-monarch' | 'hoplite-monarch'
}

export interface SwapResult {
    success: boolean
    board: Board
    error?: string
}

const getPieceAt = (board: Board, pos: Position): Piece | null => {
    const cell = board[pos.row]?.[pos.col]
    if (cell && isPiece(cell)) {
        return cell
    }
    return null
}

export const canInitiateSwap = (board: Board, pos: Position): boolean => {
    const piece = getPieceAt(board, pos)
    if (!piece) return false
    return piece.type === PieceTypes.WARLOCK
}

const isWarlock = (piece: Piece): boolean => piece.type === PieceTypes.WARLOCK
const isMonarch = (piece: Piece): boolean => piece.type === PieceTypes.MONARCH
const isHoplite = (piece: Piece): boolean => piece.type === PieceTypes.HOPLITE

const findPiecesByType = (
    board: Board,
    pieceType: typeof PieceTypes[keyof typeof PieceTypes],
    color: PlayerColor
): { position: Position; piece: Piece }[] => {
    const results: { position: Position; piece: Piece }[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = board[row][col]
            if (cell && isPiece(cell) && cell.type === pieceType && cell.color === color) {
                results.push({ position: { row, col }, piece: cell })
            }
        }
    }
    return results
}

export const getValidSwapTargets = (
    board: Board,
    warlockPos: Position
): SwapTarget[] => {
    const warlock = getPieceAt(board, warlockPos)
    if (!warlock || !isWarlock(warlock)) {
        return []
    }

    const targets: SwapTarget[] = []
    const warlockColor = warlock.color

    const friendlyMonarchs = findPiecesByType(board, PieceTypes.MONARCH, warlockColor)
    for (const { position, piece } of friendlyMonarchs) {
        targets.push({
            position,
            piece,
            swapType: 'warlock-monarch'
        })
    }

    const friendlyHoplites = findPiecesByType(board, PieceTypes.HOPLITE, warlockColor)
    for (const { position, piece } of friendlyHoplites) {
        targets.push({
            position,
            piece,
            swapType: 'hoplite-monarch'
        })
    }

    return targets
}

export const isValidSwap = (
    board: Board,
    initiatorPos: Position,
    targetPos: Position
): { valid: boolean; swapType?: 'warlock-monarch' | 'hoplite-monarch'; error?: string } => {
    const initiator = getPieceAt(board, initiatorPos)
    const target = getPieceAt(board, targetPos)

    if (!initiator) {
        return { valid: false, error: 'No piece at initiator position' }
    }

    if (!target) {
        return { valid: false, error: 'No piece at target position' }
    }

    if (!isWarlock(initiator)) {
        return { valid: false, error: 'Only Warlock can initiate swaps' }
    }

    if (initiator.color !== target.color) {
        return { valid: false, error: 'Cannot swap with enemy pieces' }
    }

    if (isMonarch(target)) {
        return { valid: true, swapType: 'warlock-monarch' }
    }

    if (isHoplite(target)) {
        return { valid: true, swapType: 'hoplite-monarch' }
    }

    return { valid: false, error: 'Invalid swap target. Warlock can only swap with Monarch or select Hoplite for Monarch swap' }
}

const findMonarchPosition = (board: Board, color: PlayerColor): Position | null => {
    const monarchs = findPiecesByType(board, PieceTypes.MONARCH, color)
    if (monarchs.length === 0) return null
    return monarchs[0].position
}

export const executeSwap = (
    board: Board,
    initiatorPos: Position,
    targetPos: Position
): SwapResult => {
    const validation = isValidSwap(board, initiatorPos, targetPos)

    if (!validation.valid) {
        return { success: false, board, error: validation.error }
    }

    const newBoard = cloneBoard(board)
    const initiator = getPieceAt(newBoard, initiatorPos)
    const target = getPieceAt(newBoard, targetPos)

    if (!initiator || !target) {
        return { success: false, board, error: 'Pieces not found after validation' }
    }

    if (validation.swapType === 'warlock-monarch') {
        newBoard[initiatorPos.row][initiatorPos.col] = target
        newBoard[targetPos.row][targetPos.col] = initiator
        return { success: true, board: newBoard }
    }

    if (validation.swapType === 'hoplite-monarch') {
        const monarchPos = findMonarchPosition(newBoard, initiator.color)

        if (!monarchPos) {
            return { success: false, board, error: 'Monarch not found on board' }
        }

        const monarch = getPieceAt(newBoard, monarchPos)

        if (!monarch) {
            return { success: false, board, error: 'Monarch piece not found' }
        }

        newBoard[targetPos.row][targetPos.col] = monarch
        newBoard[monarchPos.row][monarchPos.col] = target

        return { success: true, board: newBoard }
    }

    return { success: false, board, error: 'Unknown swap type' }
}
