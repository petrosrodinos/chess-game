import type { Board, Position, PlayerColor, Narc, BoardSize } from '../types'
import { isPiece, PieceTypes } from '../types'
import { isInBounds } from './boardUtils'

let narcIdCounter = 0
const generateNarcId = (): string => `narc-${++narcIdCounter}`

export const getNarcPositions = (bomberPos: Position): Position[] => {
    const { row, col } = bomberPos

    const diagonalPositions: Position[] = [
        { row: row - 1, col: col - 1 },
        { row: row - 1, col: col + 1 },
        { row: row + 1, col: col - 1 },
        { row: row + 1, col: col + 1 },
        { row: row - 2, col: col - 2 },
        { row: row - 2, col: col + 2 },
        { row: row + 2, col: col - 2 },
        { row: row + 2, col: col + 2 }
    ]

    const orthogonalPositions: Position[] = [
        { row: row - 2, col },
        { row: row + 2, col },
        { row, col: col - 2 },
        { row, col: col + 2 }
    ]

    return [...diagonalPositions, ...orthogonalPositions]
}

export interface NarcNetPosition {
    position: Position
    ownerColor: PlayerColor
}

export const getAllNarcNetPositions = (board: Board, boardSize: BoardSize): NarcNetPosition[] => {
    const netPositions: NarcNetPosition[] = []

    for (let row = 0; row < boardSize.rows; row++) {
        for (let col = 0; col < boardSize.cols; col++) {
            const cell = board[row][col]
            if (cell && isPiece(cell) && cell.type === PieceTypes.BOMBER && !cell.isZombie) {
                const bomberPos = { row, col }
                const narcPositions = getNarcPositions(bomberPos)

                for (const pos of narcPositions) {
                    if (!isInBounds(pos.row, pos.col, boardSize)) continue

                    const alreadyExists = netPositions.some(
                        n => n.position.row === pos.row && n.position.col === pos.col
                    )
                    if (!alreadyExists) {
                        netPositions.push({
                            position: pos,
                            ownerColor: cell.color
                        })
                    }
                }
            }
        }
    }

    return netPositions
}

export const createNarcsForBomber = (
    bomberPos: Position,
    ownerColor: PlayerColor,
    bomberId: string,
    board: Board,
    boardSize: BoardSize,
    existingNarcs: Narc[]
): Narc[] => {
    const narcPositions = getNarcPositions(bomberPos)
    const newNarcs: Narc[] = []

    for (const pos of narcPositions) {
        if (!isInBounds(pos.row, pos.col, boardSize)) continue

        const cellContent = board[pos.row][pos.col]
        if (cellContent !== null) continue

        const narcExists = existingNarcs.some(
            n => n.position.row === pos.row && n.position.col === pos.col
        )
        if (narcExists) continue

        newNarcs.push({
            id: generateNarcId(),
            position: pos,
            ownerColor,
            bomberId
        })
    }

    return newNarcs
}

export const findNarcAtPosition = (
    narcs: Narc[],
    pos: Position
): Narc | undefined => {
    return narcs.find(n => n.position.row === pos.row && n.position.col === pos.col)
}

export const removeNarcsForBomber = (narcs: Narc[], bomberId: string): Narc[] => {
    return narcs.filter(n => n.bomberId !== bomberId)
}

export const checkNarcTrigger = (
    narcs: Narc[],
    pos: Position,
    movingPieceColor: PlayerColor
): Narc | undefined => {
    const narc = findNarcAtPosition(narcs, pos)
    if (!narc) return undefined
    if (narc.ownerColor === movingPieceColor) return undefined
    return narc
}

export const checkNarcNetTrigger = (
    board: Board,
    boardSize: BoardSize,
    pos: Position,
    movingPieceColor: PlayerColor
): NarcNetPosition | undefined => {
    const narcNetPositions = getAllNarcNetPositions(board, boardSize)
    const narcNet = narcNetPositions.find(
        n => n.position.row === pos.row && n.position.col === pos.col
    )
    if (!narcNet) return undefined
    if (narcNet.ownerColor === movingPieceColor) return undefined
    return narcNet
}
