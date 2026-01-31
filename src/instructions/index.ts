export const BoardSizeKeys = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
} as const

export type BoardSizeKey = typeof BoardSizeKeys[keyof typeof BoardSizeKeys]

export const PieceTypes = {
    HOPLITE: 'Hoplite',
    RAM_TOWER: 'RamTower',
    CHARIOT: 'Chariot',
    BOMBER: 'Bomber',
    PALADIN: 'Paladin',
    WARLOCK: 'Warlock',
    MONARCH: 'Monarch',
    DUCHESS: 'Duchess',
    NECROMANCER: 'Necromancer',
    DRUID: 'Druid'
} as const

export type PieceType = typeof PieceTypes[keyof typeof PieceTypes]

export const ObstacleTypes = {
    CAVE: 'Cave',
    TREE: 'Tree',
    ROCK: 'Rock',
    LAKE: 'Lake',
    RIVER: 'River',
    CANYON: 'Canyon',
    MYSTERY_BOX: 'MysteryBox'
} as const

export type ObstacleType = typeof ObstacleTypes[keyof typeof ObstacleTypes]

export const MoveTypes = {
    ANY: 'any',
    SIDEWAYS: 'sideways',
    CROSS: 'cross'
} as const

export type MoveType = typeof MoveTypes[keyof typeof MoveTypes]

export type Position = [number, number]

export type PieceRules = {
    move: MoveType | Position[] | number[]
    attackRange: number
    canPass: ObstacleType[]
}

export const BOARD_SIZES: Record<BoardSizeKey, { rows: number; cols: number }> = {
    [BoardSizeKeys.SMALL]: { rows: 12, cols: 12 },
    [BoardSizeKeys.MEDIUM]: { rows: 12, cols: 16 },
    [BoardSizeKeys.LARGE]: { rows: 12, cols: 20 }
}

export const OBSTACLES: Record<BoardSizeKey, Record<ObstacleType, number>> = {
    [BoardSizeKeys.SMALL]: {
        [ObstacleTypes.CAVE]: 2,
        [ObstacleTypes.TREE]: 2,
        [ObstacleTypes.ROCK]: 2,
        [ObstacleTypes.LAKE]: 4,
        [ObstacleTypes.RIVER]: 3,
        [ObstacleTypes.CANYON]: 3,
        [ObstacleTypes.MYSTERY_BOX]: 2
    },
    [BoardSizeKeys.MEDIUM]: {
        [ObstacleTypes.CAVE]: 2,
        [ObstacleTypes.TREE]: 3,
        [ObstacleTypes.ROCK]: 3,
        [ObstacleTypes.LAKE]: 4,
        [ObstacleTypes.RIVER]: 3,
        [ObstacleTypes.CANYON]: 3,
        [ObstacleTypes.MYSTERY_BOX]: 2
    },
    [BoardSizeKeys.LARGE]: {
        [ObstacleTypes.CAVE]: 2,
        [ObstacleTypes.TREE]: 3,
        [ObstacleTypes.ROCK]: 3,
        [ObstacleTypes.LAKE]: 5,
        [ObstacleTypes.RIVER]: 4,
        [ObstacleTypes.CANYON]: 4,
        [ObstacleTypes.MYSTERY_BOX]: 3
    }
}

export type Board = (PieceType | ObstacleType | null)[][]

export function createBoard(sizeKey: BoardSizeKey = BoardSizeKeys.SMALL): Board {
    const { rows, cols } = BOARD_SIZES[sizeKey]
    return Array.from({ length: rows }, () => Array(cols).fill(null))
}

export const PIECES: Record<PieceType, PieceRules> = {
    [PieceTypes.HOPLITE]: { move: [3, 2], attackRange: 1, canPass: [ObstacleTypes.CAVE] },
    [PieceTypes.RAM_TOWER]: { move: MoveTypes.CROSS, attackRange: 5, canPass: [] },
    [PieceTypes.CHARIOT]: { move: [[2, 1], [1, 2], [2, 2], [3, 1], [1, 3]], attackRange: 4, canPass: [ObstacleTypes.RIVER] },
    [PieceTypes.BOMBER]: { move: [[1, 0], [0, 1], [1, 1]], attackRange: 0, canPass: [ObstacleTypes.CAVE, ObstacleTypes.RIVER] },
    [PieceTypes.PALADIN]: { move: MoveTypes.SIDEWAYS, attackRange: 3, canPass: [ObstacleTypes.CAVE, ObstacleTypes.RIVER] },
    [PieceTypes.WARLOCK]: { move: [[2, 0], [0, 2], [2, 2]], attackRange: 2, canPass: [ObstacleTypes.CAVE, ObstacleTypes.LAKE] },
    [PieceTypes.MONARCH]: { move: MoveTypes.ANY, attackRange: 1, canPass: [ObstacleTypes.CAVE] },
    [PieceTypes.DUCHESS]: { move: MoveTypes.ANY, attackRange: 9, canPass: [ObstacleTypes.RIVER] },
    [PieceTypes.NECROMANCER]: { move: MoveTypes.ANY, attackRange: 1, canPass: [ObstacleTypes.CAVE, ObstacleTypes.LAKE] },
    [PieceTypes.DRUID]: { move: MoveTypes.ANY, attackRange: 1, canPass: [] }
}

export const PIECE_POINTS: Record<PieceType, number> = {
    [PieceTypes.MONARCH]: 210,
    [PieceTypes.DUCHESS]: 27,
    [PieceTypes.RAM_TOWER]: 20,
    [PieceTypes.CHARIOT]: 16,
    [PieceTypes.PALADIN]: 15,
    [PieceTypes.BOMBER]: 12,
    [PieceTypes.DRUID]: 13,
    [PieceTypes.WARLOCK]: 11,
    [PieceTypes.HOPLITE]: 3,
    [PieceTypes.NECROMANCER]: 14
}

export function isValidMove(piece: PieceType, start: Position, end: Position, board: Board): boolean {
    const [x0, y0] = start
    const [x1, y1] = end
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const rules = PIECES[piece]

    const target = board[x1][y1]
    if (target && !rules.canPass.includes(target as ObstacleType)) return false

    if (rules.move === MoveTypes.ANY) return true
    if (rules.move === MoveTypes.SIDEWAYS) return dx === 0 || dy === 0
    if (rules.move === MoveTypes.CROSS) return dx === 0 || dy === 0
    if (piece === PieceTypes.HOPLITE) {
        const maxStep = board[x0][y0] === null ? (rules.move as number[])[0] : (rules.move as number[])[1]
        return dx + dy <= maxStep
    }
    if (Array.isArray(rules.move)) {
        return (rules.move as Position[]).some(([mx, my]) => mx === dx && my === dy)
    }

    return false
}

export function canAttack(piece: PieceType, start: Position, target: Position): boolean {
    const [x0, y0] = start
    const [x1, y1] = target
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    return Math.max(dx, dy) <= PIECES[piece].attackRange
}

export function placePiece(board: Board, piece: PieceType, position: Position): void {
    const [x, y] = position
    board[x][y] = piece
}

export function removePiece(board: Board, position: Position): void {
    const [x, y] = position
    board[x][y] = null
}

export function movePiece(board: Board, piece: PieceType, start: Position, end: Position): boolean {
    if (isValidMove(piece, start, end, board)) {
        removePiece(board, start)
        placePiece(board, piece, end)
        return true
    }
    return false
}

export function findPiecePositions(board: Board, pieceType: PieceType): Position[] {
    const positions: Position[] = []
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[0].length; y++) {
            if (board[x][y] === pieceType) positions.push([x, y])
        }
    }
    return positions
}
