import type { Board, Position, Piece, PlayerColor, MysteryBoxState, MysteryBoxOption, MysteryBoxPhase } from '../types'
import { PieceTypes, ObstacleTypes, MysteryBoxOptions, MysteryBoxPhases } from '../types'
import { isPiece, isObstacle } from '../types'

export const getInitialMysteryBoxState = (): MysteryBoxState => ({
    isActive: false,
    option: null,
    phase: null,
    triggerPosition: null,
    diceRoll: null,
    firstFigurePosition: null,
    selectedObstacles: [],
    selectedEmptyTiles: [],
    revivablePieces: [],
    selectedRevivePiece: null
})

export const rollDice = (): number => {
    return Math.floor(Math.random() * 6) + 1
}

export const getRandomMysteryBoxOption = (
    currentPlayerColor: PlayerColor,
    capturedPieces: { white: Piece[]; black: Piece[] }
): MysteryBoxOption => {
    const options: MysteryBoxOption[] = [
        MysteryBoxOptions.FIGURE_SWAP,
        MysteryBoxOptions.OBSTACLE_SWAP
    ]

    if (capturedPieces[currentPlayerColor] && capturedPieces[currentPlayerColor].length > 0) {
        options.push(MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE)
    }
    return options[1]

    return options[Math.floor(Math.random() * options.length)]
}

export const isMysteryBoxTile = (board: Board, pos: Position): boolean => {
    const cell = board[pos.row][pos.col]
    return cell !== null && isObstacle(cell) && cell.type === ObstacleTypes.MYSTERY_BOX
}

export const getPlayerFigures = (board: Board, playerColor: PlayerColor): Position[] => {
    const figures: Position[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = board[row][col]
            if (cell && isPiece(cell) && cell.color === playerColor) {
                figures.push({ row, col })
            }
        }
    }
    return figures
}

export const getPlayerHoplites = (board: Board, playerColor: PlayerColor): Position[] => {
    const hoplites: Position[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = board[row][col]
            if (cell && isPiece(cell) && cell.color === playerColor && cell.type === PieceTypes.HOPLITE) {
                hoplites.push({ row, col })
            }
        }
    }
    return hoplites
}

export const getEmptyTiles = (board: Board): Position[] => {
    const emptyTiles: Position[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === null) {
                emptyTiles.push({ row, col })
            }
        }
    }
    return emptyTiles
}

export const getAllObstacles = (board: Board, types: string[]): Position[] => {
    const obstacles: Position[] = []
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const cell = board[row][col]
            if (cell && isObstacle(cell) && types.includes(cell.type)) {
                obstacles.push({ row, col })
            }
        }
    }
    return obstacles
}

export const isSelectableObstacle = (board: Board, pos: Position): boolean => {
    const cell = board[pos.row][pos.col]
    if (!cell || !isObstacle(cell)) return false
    return cell.type !== ObstacleTypes.MYSTERY_BOX
}

export const executeFigureSwap = (
    board: Board,
    pos1: Position,
    pos2: Position
): { success: boolean; newBoard: Board } => {
    const newBoard = board.map(row => [...row])
    const temp = newBoard[pos1.row][pos1.col]
    newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col]
    newBoard[pos2.row][pos2.col] = temp
    return { success: true, newBoard }
}

export const executeHopliteSacrifice = (
    board: Board,
    hoplitePos: Position
): { success: boolean; newBoard: Board } => {
    const newBoard = board.map(row => [...row])
    newBoard[hoplitePos.row][hoplitePos.col] = null
    return { success: true, newBoard }
}

export const executeRevivePiece = (
    board: Board,
    piece: Piece,
    position: Position
): { success: boolean; newBoard: Board } => {
    const newBoard = board.map(row => [...row])
    newBoard[position.row][position.col] = { ...piece }
    return { success: true, newBoard }
}

export const executeObstacleSwap = (
    board: Board,
    obstaclePositions: Position[],
    emptyPositions: Position[]
): { success: boolean; newBoard: Board } => {
    if (obstaclePositions.length !== emptyPositions.length) {
        return { success: false, newBoard: board }
    }
    const rows = board.length
    const hasDisabledPlacement = emptyPositions.some(pos => isObstacleSwapPlacementRowDisabled(pos.row, rows))
    if (hasDisabledPlacement) {
        return { success: false, newBoard: board }
    }

    const newBoard = board.map(row => [...row])

    for (let i = 0; i < obstaclePositions.length; i++) {
        const obstaclePos = obstaclePositions[i]
        const emptyPos = emptyPositions[i]

        const temp = newBoard[obstaclePos.row][obstaclePos.col]
        newBoard[obstaclePos.row][obstaclePos.col] = newBoard[emptyPos.row][emptyPos.col]
        newBoard[emptyPos.row][emptyPos.col] = temp
    }

    return { success: true, newBoard }
}

export const canPlayerUseMysteryBoxOption1 = (board: Board, playerColor: PlayerColor): boolean => {
    return getPlayerFigures(board, playerColor).length >= 2
}

export const canPlayerUseMysteryBoxOption2 = (board: Board, playerColor: PlayerColor, capturedPieces: { white: Piece[]; black: Piece[] }): boolean => {
    const hasHoplite = getPlayerHoplites(board, playerColor).length > 0
    const hasRevivable = capturedPieces[playerColor] && capturedPieces[playerColor].length > 0
    return hasHoplite && hasRevivable
}

export const canPlayerUseMysteryBoxOption3 = (board: Board): boolean => {
    const selectableObstacles = getAllObstacles(board, [
        ObstacleTypes.TREE,
        ObstacleTypes.ROCK,
        ObstacleTypes.CAVE,
        ObstacleTypes.RIVER,
        ObstacleTypes.LAKE,
        ObstacleTypes.CANYON
    ])
    const rows = board.length
    const hasAllowedEmptyTiles = getEmptyTiles(board).some(pos => !isObstacleSwapPlacementRowDisabled(pos.row, rows))
    return selectableObstacles.length > 0 && hasAllowedEmptyTiles
}

export const isObstacleSwapPlacementRowDisabled = (row: number, rows: number): boolean => {
    return row === 2 || row === rows - 3
}

export const isObstacleSwapPlacementAllowed = (board: Board, pos: Position): boolean => {
    return !isObstacleSwapPlacementRowDisabled(pos.row, board.length)
}

export const getRevivablePieces = (
    color: PlayerColor,
    capturedPieces: { white: Piece[]; black: Piece[] }
): Piece[] => {
    return capturedPieces[color] || []
}

export const getPhaseForOption = (option: MysteryBoxOption): MysteryBoxPhase => {
    switch (option) {
        case MysteryBoxOptions.FIGURE_SWAP:
            return MysteryBoxPhases.WAITING_FIRST_FIGURE
        case MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE:
            return MysteryBoxPhases.WAITING_HOPLITE_SACRIFICE
        case MysteryBoxOptions.OBSTACLE_SWAP:
            return MysteryBoxPhases.WAITING_OBSTACLE_SELECTION
        default:
            return MysteryBoxPhases.WAITING_FIRST_FIGURE
    }
}

export const getMysteryBoxOptionName = (option: MysteryBoxOption): string => {
    switch (option) {
        case MysteryBoxOptions.FIGURE_SWAP:
            return 'Figure Swap'
        case MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE:
            return 'Hoplite Sacrifice & Revive'
        case MysteryBoxOptions.OBSTACLE_SWAP:
            return 'Obstacle Swap'
        default:
            return 'Unknown'
    }
}

export const removeMysteryBoxFromBoard = (board: Board, pos: Position): Board => {
    const newBoard = board.map(row => [...row])
    newBoard[pos.row][pos.col] = null
    return newBoard
}

export const isPositionInList = (pos: Position, list: Position[]): boolean => {
    return list.some(p => p.row === pos.row && p.col === pos.col)
}
