import { create } from 'zustand'
import type { GameState, Position, BotDifficulty, HintMove, BoardSizeKey, PlayerColor, CellContent } from '../pages/Game/types'
import { isPiece, isObstacle, BOARD_SIZES, PlayerColors, BotDifficulties, BoardSizeKeys } from '../pages/Game/types'
import { DEFAULT_BOARD_SIZE } from '../pages/Game/constants'
import {
    createInitialBoard,
    getValidMoves,
    getValidAttacks,
    makeMove,
    hasLegalMoves,
    isMonarchCaptured,
    getBotMove,
    getHintMove
} from '../pages/Game/utils'

interface HistoryEntry {
    gameState: GameState
}

interface GameStore {
    // State
    gameState: GameState
    boardSizeKey: BoardSizeKey
    history: HistoryEntry[]
    botEnabled: boolean
    botThinking: boolean
    botDifficulty: BotDifficulty
    hintMove: HintMove | null
    devModeSelected: Position | null

    // Computed
    canUndo: () => boolean
    canHint: () => boolean

    // Actions
    selectSquare: (pos: Position) => void
    devModeSelectSquare: (pos: Position) => void
    resetGame: (newBoardSizeKey?: BoardSizeKey) => void
    toggleBot: () => void
    setDifficulty: (difficulty: BotDifficulty) => void
    undoMove: () => void
    showHint: () => void
    processBotMove: () => void
}

const checkGameOver = (board: GameState['board'], nextPlayer: PlayerColor, boardSize: GameState['boardSize']) => {
    if (isMonarchCaptured(board, nextPlayer)) {
        return {
            gameOver: true,
            winner: nextPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
        }
    }

    if (!hasLegalMoves(board, nextPlayer, boardSize)) {
        return {
            gameOver: true,
            winner: nextPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
        }
    }

    return { gameOver: false, winner: null }
}

export const useGameStore = create<GameStore>((set, get) => ({
    // Initial state
    gameState: (() => {
        const boardSize = BOARD_SIZES[BoardSizeKeys.SMALL] || DEFAULT_BOARD_SIZE
        return {
            board: createInitialBoard(boardSize),
            boardSize: boardSize,
            currentPlayer: PlayerColors.WHITE,
            selectedPosition: null,
            validMoves: [],
            validAttacks: [],
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            lastMove: null,
            gameOver: false,
            winner: null
        }
    })(),
    boardSizeKey: BoardSizeKeys.SMALL,
    history: [],
    botEnabled: false,
    botThinking: false,
    botDifficulty: BotDifficulties.MEDIUM,
    hintMove: null,
    devModeSelected: null,

    // Computed values
    canUndo: () => {
        const { history, gameState, botThinking } = get()
        return history.length > 0 && gameState.currentPlayer === PlayerColors.WHITE && !botThinking
    },

    canHint: () => {
        const { gameState, botThinking } = get()
        return gameState.currentPlayer === PlayerColors.WHITE && !gameState.gameOver && !botThinking
    },

    // Actions
    selectSquare: (pos: Position) => {
        const { gameState, botEnabled, history } = get()

        if (botEnabled && gameState.currentPlayer === PlayerColors.BLACK) return
        if (gameState.gameOver) return

        set({ hintMove: null })

        const cell = gameState.board[pos.row][pos.col]

        if (gameState.selectedPosition) {
            const isValidMoveTarget = gameState.validMoves.some(
                m => m.row === pos.row && m.col === pos.col
            )
            const isValidAttackTarget = gameState.validAttacks.some(
                a => a.row === pos.row && a.col === pos.col
            )

            if (isValidMoveTarget || isValidAttackTarget) {
                const newHistory = [...history, { gameState }]

                const { newBoard, move } = makeMove(
                    gameState.board,
                    gameState.selectedPosition,
                    pos,
                    gameState.boardSize,
                    isValidAttackTarget
                )

                const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, gameState.boardSize)

                const newCaptured = { ...gameState.capturedPieces }
                if (move.captured) {
                    if (move.captured.color === PlayerColors.WHITE) {
                        newCaptured.white = [...newCaptured.white, move.captured]
                    } else {
                        newCaptured.black = [...newCaptured.black, move.captured]
                    }
                }

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        currentPlayer: nextPlayer,
                        selectedPosition: null,
                        validMoves: [],
                        validAttacks: [],
                        moveHistory: [...gameState.moveHistory, move],
                        capturedPieces: newCaptured,
                        lastMove: move,
                        gameOver,
                        winner
                    },
                    history: newHistory
                })
                return
            }

            if (cell && isPiece(cell) && cell.color === gameState.currentPlayer) {
                const moves = getValidMoves(gameState.board, pos, gameState.boardSize)
                const attacks = getValidAttacks(gameState.board, pos, gameState.boardSize)
                set({
                    gameState: {
                        ...gameState,
                        selectedPosition: pos,
                        validMoves: moves,
                        validAttacks: attacks
                    }
                })
                return
            }

            set({
                gameState: {
                    ...gameState,
                    selectedPosition: null,
                    validMoves: [],
                    validAttacks: []
                }
            })
            return
        }

        if (cell && isPiece(cell) && cell.color === gameState.currentPlayer) {
            const moves = getValidMoves(gameState.board, pos, gameState.boardSize)
            const attacks = getValidAttacks(gameState.board, pos, gameState.boardSize)
            set({
                gameState: {
                    ...gameState,
                    selectedPosition: pos,
                    validMoves: moves,
                    validAttacks: attacks
                }
            })
        }
    },

    devModeSelectSquare: (pos: Position) => {
        const { gameState, devModeSelected } = get()
        const cell = gameState.board[pos.row][pos.col]

        if (devModeSelected) {
            const selectedCell = gameState.board[devModeSelected.row][devModeSelected.col]

            if (cell === null && selectedCell !== null) {
                const newBoard = gameState.board.map(row => [...row])
                newBoard[pos.row][pos.col] = selectedCell
                newBoard[devModeSelected.row][devModeSelected.col] = null as CellContent

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        selectedPosition: null,
                        validMoves: [],
                        validAttacks: []
                    },
                    devModeSelected: null
                })
                return
            }

            if (cell !== null && (isPiece(cell) || isObstacle(cell))) {
                set({ devModeSelected: pos })
                return
            }

            set({ devModeSelected: null })
            return
        }

        if (cell !== null && (isPiece(cell) || isObstacle(cell))) {
            set({ devModeSelected: pos })
        }
    },

    resetGame: (newBoardSizeKey?: BoardSizeKey) => {
        const { boardSizeKey: currentSizeKey } = get()
        const sizeKey = newBoardSizeKey || currentSizeKey
        const newBoardSize = BOARD_SIZES[sizeKey] || DEFAULT_BOARD_SIZE

        set({
            gameState: {
                board: createInitialBoard(newBoardSize),
                boardSize: newBoardSize,
                currentPlayer: PlayerColors.WHITE,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                moveHistory: [],
                capturedPieces: { white: [], black: [] },
                lastMove: null,
                gameOver: false,
                winner: null
            },
            boardSizeKey: newBoardSizeKey ? newBoardSizeKey : currentSizeKey,
            history: [],
            botThinking: false,
            hintMove: null
        })
    },

    toggleBot: () => {
        set(state => ({
            botEnabled: !state.botEnabled,
            botThinking: false
        }))
    },

    setDifficulty: (difficulty: BotDifficulty) => {
        set({ botDifficulty: difficulty })
    },

    undoMove: () => {
        const { history, botThinking } = get()
        if (history.length === 0 || botThinking) return

        const newHistory = [...history]
        const lastEntry = newHistory.pop()
        if (lastEntry) {
            set({
                gameState: {
                    ...lastEntry.gameState,
                    selectedPosition: null,
                    validMoves: [],
                    validAttacks: []
                },
                history: newHistory
            })
        }
    },

    showHint: () => {
        const { gameState } = get()
        if (gameState.currentPlayer !== PlayerColors.WHITE) return
        if (gameState.gameOver) return

        const hint = getHintMove(gameState.board, gameState.lastMove, gameState.boardSize)
        set({ hintMove: hint })
    },

    processBotMove: () => {
        const { gameState, botDifficulty, botEnabled } = get()

        if (!botEnabled) return
        if (gameState.currentPlayer !== PlayerColors.BLACK) return
        if (gameState.gameOver) return

        set({ botThinking: true })

        const botMove = getBotMove(gameState.board, gameState.lastMove, botDifficulty, gameState.boardSize)

        if (!botMove) {
            set({ botThinking: false })
            return
        }

        const { newBoard, move } = makeMove(
            gameState.board,
            botMove.from,
            botMove.to,
            gameState.boardSize,
            botMove.isAttack || false
        )

        const nextPlayer = PlayerColors.WHITE
        const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, gameState.boardSize)

        const newCaptured = { ...gameState.capturedPieces }
        if (move.captured) {
            if (move.captured.color === PlayerColors.WHITE) {
                newCaptured.white = [...newCaptured.white, move.captured]
            } else {
                newCaptured.black = [...newCaptured.black, move.captured]
            }
        }

        set({
            gameState: {
                ...gameState,
                board: newBoard,
                currentPlayer: nextPlayer,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                moveHistory: [...gameState.moveHistory, move],
                capturedPieces: newCaptured,
                lastMove: move,
                gameOver,
                winner
            },
            botThinking: false
        })
    }
}))

// Bot effect hook - needs to be called from a component
export const useBotEffect = () => {
    const { botEnabled, botDifficulty, gameState, processBotMove } = useGameStore()

    // This will be handled by useEffect in a component
    return { botEnabled, botDifficulty, gameState, processBotMove }
}
