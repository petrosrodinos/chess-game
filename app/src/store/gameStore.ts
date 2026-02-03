import { create } from 'zustand'
import { toast } from 'react-toastify'
import type { GameState, Position, BotDifficulty, HintMove, BoardSizeKey, PlayerColor, CellContent, SwapTarget, MysteryBoxState, Piece } from '../pages/Game/types'
import { isPiece, isObstacle, BOARD_SIZES, PlayerColors, BotDifficulties, BoardSizeKeys, PieceTypes, MysteryBoxOptions, MysteryBoxPhases, ObstacleTypes } from '../pages/Game/types'
import { DEFAULT_BOARD_SIZE } from '../pages/Game/constants'
import {
    createInitialBoard,
    getValidMoves,
    getValidAttacks,
    makeMove,
    hasLegalMoves,
    isMonarchCaptured,
    getBotMove,
    getHintMove,
    getValidSwapTargets,
    executeSwap,
    getInitialMysteryBoxState,
    rollDice,
    getRandomMysteryBoxOption,
    executeFigureSwap,
    executeHopliteSacrifice,
    executeRevivePiece,
    executeObstacleSwap,
    getRevivablePieces,
    getPhaseForOption,
    removeMysteryBoxFromBoard,
    isSelectableObstacle,
    isPositionInList
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
    mysteryBoxState: MysteryBoxState

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

    // MysteryBox Actions
    handleMysteryBoxSelection: (pos: Position) => void
    selectRevivePiece: (piece: Piece) => void
    confirmObstacleSelection: () => void
    cancelMysteryBox: () => void
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
            validSwaps: [],
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            lastMove: null,
            gameOver: false,
            winner: null,
            narcs: []
        }
    })(),
    boardSizeKey: BoardSizeKeys.SMALL,
    history: [],
    botEnabled: false,
    botThinking: false,
    botDifficulty: BotDifficulties.MEDIUM,
    hintMove: null,
    devModeSelected: null,
    mysteryBoxState: getInitialMysteryBoxState(),

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
        const { gameState, botEnabled, history, mysteryBoxState } = get()

        if (botEnabled && gameState.currentPlayer === PlayerColors.BLACK) return
        if (gameState.gameOver) return

        set({ hintMove: null })

        if (mysteryBoxState.isActive) {
            return
        }

        const cell = gameState.board[pos.row][pos.col]

        if (gameState.selectedPosition) {
            const isValidMoveTarget = gameState.validMoves.some(
                m => m.row === pos.row && m.col === pos.col
            )
            const isValidAttackTarget = gameState.validAttacks.some(
                a => a.row === pos.row && a.col === pos.col
            )
            const swapTarget = gameState.validSwaps.find(
                s => s.position.row === pos.row && s.position.col === pos.col
            )

            if (swapTarget) {
                const swapResult = executeSwap(gameState.board, gameState.selectedPosition, pos)

                if (swapResult.success) {
                    const newHistory = [...history, { gameState }]
                    const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                    const { gameOver, winner } = checkGameOver(swapResult.board, nextPlayer, gameState.boardSize)

                    set({
                        gameState: {
                            ...gameState,
                            board: swapResult.board,
                            currentPlayer: nextPlayer,
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            lastMove: null,
                            gameOver,
                            winner
                        },
                        history: newHistory
                    })
                    return
                }
            }

            if (isValidMoveTarget || isValidAttackTarget) {
                const targetCell = gameState.board[pos.row][pos.col]
                const isMysteryBox = targetCell && isObstacle(targetCell) && targetCell.type === ObstacleTypes.MYSTERY_BOX

                if (isMysteryBox && !isValidAttackTarget) {
                    const option = getRandomMysteryBoxOption(gameState.currentPlayer, gameState.capturedPieces)
                    const diceRoll = option === MysteryBoxOptions.OBSTACLE_SWAP ? rollDice() : null

                    const optionDescriptions = {
                        [MysteryBoxOptions.FIGURE_SWAP]: '✨ Swap positions of any two of your pieces!',
                        [MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE]: '⚔️ Sacrifice a Hoplite to revive an opponent piece as your own!',
                        [MysteryBoxOptions.OBSTACLE_SWAP]: `🎲 Roll: ${diceRoll}! Swap ${diceRoll} obstacle(s) with empty tiles!`
                    }

                    toast.info(`🎁 Mystery Box Activated!`, { autoClose: 2500 })
                    toast.success(`${optionDescriptions[option]}`, { autoClose: 5000 })

                    const boardWithoutMysteryBox = removeMysteryBoxFromBoard(gameState.board, pos)
                    const { newBoard: movedBoard, move, newNarcs } = makeMove(
                        boardWithoutMysteryBox,
                        gameState.selectedPosition,
                        pos,
                        gameState.boardSize,
                        false,
                        gameState.narcs
                    )

                    const newCaptured = { ...gameState.capturedPieces }
                    if (move.captured) {
                        if (move.captured.color === PlayerColors.WHITE) {
                            newCaptured.white = [...newCaptured.white, move.captured]
                        } else {
                            newCaptured.black = [...newCaptured.black, move.captured]
                        }
                    }

                    const revivablePieces = option === MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE
                        ? getRevivablePieces(gameState.currentPlayer, newCaptured)
                        : []

                    set({
                        gameState: {
                            ...gameState,
                            board: movedBoard,
                            selectedPosition: null,
                            validMoves: [],
                            validAttacks: [],
                            validSwaps: [],
                            moveHistory: [...gameState.moveHistory, move],
                            capturedPieces: newCaptured,
                            lastMove: move,
                            narcs: newNarcs
                        },
                        mysteryBoxState: {
                            isActive: true,
                            option,
                            phase: getPhaseForOption(option),
                            triggerPosition: pos,
                            diceRoll,
                            firstFigurePosition: null,
                            selectedObstacles: [],
                            selectedEmptyTiles: [],
                            revivablePieces,
                            selectedRevivePiece: null
                        }
                    })
                    return
                }

                const newHistory = [...history, { gameState }]

                const { newBoard, move, newNarcs } = makeMove(
                    gameState.board,
                    gameState.selectedPosition,
                    pos,
                    gameState.boardSize,
                    isValidAttackTarget,
                    gameState.narcs
                )

                let nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE

                if (move.terminatedByNarc) {
                    nextPlayer = gameState.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                }

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
                        validSwaps: [],
                        moveHistory: [...gameState.moveHistory, move],
                        capturedPieces: newCaptured,
                        lastMove: move,
                        gameOver,
                        winner,
                        narcs: newNarcs
                    },
                    history: newHistory
                })
                return
            }

            if (cell && isPiece(cell) && cell.color === gameState.currentPlayer) {
                const moves = getValidMoves(gameState.board, pos, gameState.boardSize)
                const attacks = getValidAttacks(gameState.board, pos, gameState.boardSize)
                const swaps: SwapTarget[] = cell.type === PieceTypes.WARLOCK
                    ? getValidSwapTargets(gameState.board, pos).map(s => ({
                        position: s.position,
                        swapType: s.swapType
                    }))
                    : []
                set({
                    gameState: {
                        ...gameState,
                        selectedPosition: pos,
                        validMoves: moves,
                        validAttacks: attacks,
                        validSwaps: swaps
                    }
                })
                return
            }

            set({
                gameState: {
                    ...gameState,
                    selectedPosition: null,
                    validMoves: [],
                    validAttacks: [],
                    validSwaps: []
                }
            })
            return
        }

        if (cell && isPiece(cell) && cell.color === gameState.currentPlayer) {
            const moves = getValidMoves(gameState.board, pos, gameState.boardSize)
            const attacks = getValidAttacks(gameState.board, pos, gameState.boardSize)
            const swaps: SwapTarget[] = cell.type === PieceTypes.WARLOCK
                ? getValidSwapTargets(gameState.board, pos).map(s => ({
                    position: s.position,
                    swapType: s.swapType
                }))
                : []
            set({
                gameState: {
                    ...gameState,
                    selectedPosition: pos,
                    validMoves: moves,
                    validAttacks: attacks,
                    validSwaps: swaps
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
                validSwaps: [],
                moveHistory: [],
                capturedPieces: { white: [], black: [] },
                lastMove: null,
                gameOver: false,
                winner: null,
                narcs: []
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
                    validAttacks: [],
                    validSwaps: []
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

        const { newBoard, move, newNarcs } = makeMove(
            gameState.board,
            botMove.from,
            botMove.to,
            gameState.boardSize,
            botMove.isAttack || false,
            gameState.narcs
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
                winner,
                narcs: newNarcs
            },
            botThinking: false
        })
    },

    handleMysteryBoxSelection: (pos: Position) => {
        const { gameState, mysteryBoxState } = get()
        if (!mysteryBoxState.isActive) return

        const { board, boardSize, capturedPieces, currentPlayer } = gameState
        const { option, phase, diceRoll, firstFigurePosition, selectedObstacles, selectedEmptyTiles, selectedRevivePiece } = mysteryBoxState

        if (option === MysteryBoxOptions.FIGURE_SWAP) {
            if (phase === MysteryBoxPhases.WAITING_FIRST_FIGURE) {
                const cell = board[pos.row][pos.col]
                if (!cell || !isPiece(cell) || cell.color !== currentPlayer) {
                    toast.warning('❌ Invalid Selection - Please click on one of YOUR pieces to begin the swap.', { autoClose: 3000 })
                    return
                }

                toast.success(`✅ First Piece Selected! Now click on ANOTHER piece of yours to swap positions with.`, { autoClose: 4000 })

                set({
                    mysteryBoxState: {
                        ...mysteryBoxState,
                        phase: MysteryBoxPhases.WAITING_SECOND_FIGURE,
                        firstFigurePosition: pos
                    }
                })
                return
            }

            if (phase === MysteryBoxPhases.WAITING_SECOND_FIGURE && firstFigurePosition) {
                const cell = board[pos.row][pos.col]
                if (!cell || !isPiece(cell) || cell.color !== currentPlayer) {
                    toast.warning('❌ Invalid Selection - Select a DIFFERENT piece of yours to complete the swap.', { autoClose: 3000 })
                    return
                }
                if (pos.row === firstFigurePosition.row && pos.col === firstFigurePosition.col) {
                    toast.warning('❌ Cannot swap a piece with itself! Select a DIFFERENT piece.', { autoClose: 3000 })
                    return
                }

                const { success, newBoard } = executeFigureSwap(board, firstFigurePosition, pos)
                if (!success) {
                    toast.error('❌ Swap failed! Please try again.', { autoClose: 2000 })
                    return
                }

                toast.success('🎉 Pieces swapped successfully! Your turn is complete.', { autoClose: 3000 })

                const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        currentPlayer: nextPlayer,
                        gameOver,
                        winner
                    },
                    mysteryBoxState: getInitialMysteryBoxState()
                })
                return
            }
        }

        if (option === MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE) {
            if (phase === MysteryBoxPhases.WAITING_HOPLITE_SACRIFICE) {
                const cell = board[pos.row][pos.col]
                if (!cell || !isPiece(cell) || cell.type !== PieceTypes.HOPLITE || cell.color !== currentPlayer) {
                    toast.warning('❌ Invalid Selection - You must select one of YOUR HOPLITES (⚔️) to sacrifice!', { autoClose: 3500 })
                    return
                }

                const { success, newBoard } = executeHopliteSacrifice(board, pos)
                if (!success) {
                    toast.error('❌ Sacrifice failed! Please try again.', { autoClose: 2000 })
                    return
                }

                const revivablePieces = getRevivablePieces(currentPlayer, capturedPieces)

                toast.success('⚔️ Hoplite sacrificed! A modal will appear - select an opponent piece you\'ve captured to revive as YOUR own!', { autoClose: 5000 })

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard
                    },
                    mysteryBoxState: {
                        ...mysteryBoxState,
                        phase: MysteryBoxPhases.WAITING_REVIVE_FIGURE,
                        firstFigurePosition: pos,
                        revivablePieces
                    }
                })
                return
            }

            if (phase === MysteryBoxPhases.WAITING_REVIVE_PLACEMENT && selectedRevivePiece && firstFigurePosition) {
                if (board[pos.row][pos.col] !== null) {
                    toast.warning('❌ Invalid Placement - You must select an EMPTY tile to place the revived piece!', { autoClose: 3000 })
                    return
                }

                const { success, newBoard } = executeRevivePiece(board, selectedRevivePiece, pos)
                if (!success) {
                    toast.error('❌ Revival failed! Please try again.', { autoClose: 2000 })
                    return
                }

                const newCaptured = { ...capturedPieces }
                const opponentColor = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE

                newCaptured[opponentColor] = newCaptured[opponentColor].filter(
                    p => !(p.id === selectedRevivePiece.id && p.type === selectedRevivePiece.type && p.color === selectedRevivePiece.color)
                )

                toast.success('🎉 Enemy piece revived as yours! Your turn is complete.', { autoClose: 3000 })

                const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                set({
                    gameState: {
                        ...gameState,
                        board: newBoard,
                        currentPlayer: nextPlayer,
                        capturedPieces: newCaptured,
                        gameOver,
                        winner
                    },
                    mysteryBoxState: getInitialMysteryBoxState()
                })
                return
            }
        }

        if (option === MysteryBoxOptions.OBSTACLE_SWAP && diceRoll) {
            if (phase === MysteryBoxPhases.WAITING_OBSTACLE_SELECTION) {
                if (!isSelectableObstacle(board, pos)) {
                    toast.warning('❌ Invalid Selection - You can select any OBSTACLE except Mystery Boxes (❓)!', { autoClose: 3500 })
                    return
                }
                if (isPositionInList(pos, selectedObstacles)) {
                    const newSelectedObstacles = selectedObstacles.filter(p => p.row !== pos.row || p.col !== pos.col)
                    toast.info(`🔄 Obstacle deselected. ${newSelectedObstacles.length}/${diceRoll} obstacles selected.`, { autoClose: 2500 })
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedObstacles: newSelectedObstacles
                        }
                    })
                    return
                }

                if (selectedObstacles.length >= diceRoll) {
                    toast.warning(`❌ Maximum ${diceRoll} obstacles already selected! Deselect one first or proceed to empty tile selection.`, { autoClose: 3500 })
                    return
                }

                const newSelectedObstacles = [...selectedObstacles, pos]

                if (newSelectedObstacles.length === diceRoll) {
                    toast.success(`✅ Selected ${diceRoll}/${diceRoll} obstacles! Now click on ${diceRoll} EMPTY tiles where you want to move these obstacles.`, { autoClose: 5000 })
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedObstacles: newSelectedObstacles,
                            phase: MysteryBoxPhases.WAITING_EMPTY_TILE_SELECTION
                        }
                    })
                } else {
                    toast.info(`📍 Obstacle selected! ${newSelectedObstacles.length}/${diceRoll} selected. Select ${diceRoll - newSelectedObstacles.length} more obstacle(s).`, { autoClose: 3000 })
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedObstacles: newSelectedObstacles
                        }
                    })
                }
                return
            }

            if (phase === MysteryBoxPhases.WAITING_EMPTY_TILE_SELECTION) {
                if (board[pos.row][pos.col] !== null) {
                    toast.warning('❌ Invalid Selection - You must select EMPTY tiles (no pieces or obstacles)!', { autoClose: 3000 })
                    return
                }
                if (isPositionInList(pos, selectedEmptyTiles)) {
                    const newSelectedEmptyTiles = selectedEmptyTiles.filter(p => p.row !== pos.row || p.col !== pos.col)
                    toast.info(`🔄 Empty tile deselected. ${newSelectedEmptyTiles.length}/${selectedObstacles.length} selected.`, { autoClose: 2500 })
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedEmptyTiles: newSelectedEmptyTiles
                        }
                    })
                    return
                }

                if (selectedEmptyTiles.length >= selectedObstacles.length) {
                    toast.warning(`❌ Maximum ${selectedObstacles.length} empty tiles already selected! Deselect one first.`, { autoClose: 3000 })
                    return
                }

                const newSelectedEmptyTiles = [...selectedEmptyTiles, pos]

                if (newSelectedEmptyTiles.length === selectedObstacles.length) {
                    const { success, newBoard } = executeObstacleSwap(board, selectedObstacles, newSelectedEmptyTiles)
                    if (!success) {
                        toast.error('❌ Obstacle swap failed! Please try again.', { autoClose: 2000 })
                        return
                    }

                    toast.success('🎉 Obstacles swapped with empty tiles! Your turn is complete.', { autoClose: 3000 })

                    const nextPlayer = currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                    const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

                    set({
                        gameState: {
                            ...gameState,
                            board: newBoard,
                            currentPlayer: nextPlayer,
                            gameOver,
                            winner
                        },
                        mysteryBoxState: getInitialMysteryBoxState()
                    })
                    return
                } else {
                    toast.info(`📍 Empty tile selected! ${newSelectedEmptyTiles.length}/${selectedObstacles.length} selected. Select ${selectedObstacles.length - newSelectedEmptyTiles.length} more.`, { autoClose: 3000 })
                    set({
                        mysteryBoxState: {
                            ...mysteryBoxState,
                            selectedEmptyTiles: newSelectedEmptyTiles
                        }
                    })
                }
                return
            }
        }
    },

    selectRevivePiece: (piece: Piece) => {
        const { mysteryBoxState } = get()
        if (!mysteryBoxState.isActive) return
        if (mysteryBoxState.phase !== MysteryBoxPhases.WAITING_REVIVE_FIGURE) return

        toast.info(`✅ Piece selected! Now click on an EMPTY tile on the board to place your revived ${piece.type}.`, { autoClose: 4000 })

        set({
            mysteryBoxState: {
                ...mysteryBoxState,
                phase: MysteryBoxPhases.WAITING_REVIVE_PLACEMENT,
                selectedRevivePiece: piece
            }
        })
    },

    confirmObstacleSelection: () => {
        const { mysteryBoxState } = get()
        if (!mysteryBoxState.isActive) return
        if (mysteryBoxState.phase !== MysteryBoxPhases.WAITING_OBSTACLE_SELECTION) return
        if (mysteryBoxState.selectedObstacles.length === 0) return

        set({
            mysteryBoxState: {
                ...mysteryBoxState,
                phase: MysteryBoxPhases.WAITING_EMPTY_TILE_SELECTION
            }
        })
    },

    cancelMysteryBox: () => {
        toast.info('❌ Mystery Box action cancelled.', { autoClose: 2000 })
        set({
            mysteryBoxState: getInitialMysteryBoxState()
        })
    }
}))

// Bot effect hook - needs to be called from a component
export const useBotEffect = () => {
    const { botEnabled, botDifficulty, gameState, processBotMove } = useGameStore()

    // This will be handled by useEffect in a component
    return { botEnabled, botDifficulty, gameState, processBotMove }
}
