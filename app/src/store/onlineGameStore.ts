import { create } from 'zustand'
import type { Position, GameState, PlayerColor, SwapTarget } from '../pages/Game/types'
import { isPiece, PlayerColors, PieceTypes } from '../pages/Game/types'
import type { GameSession, Player } from '../features/game/interfaces'
import {
    getValidMoves,
    getValidAttacks,
    makeMove,
    isMonarchCaptured,
    hasLegalMoves,
    getValidSwapTargets,
    executeSwap
} from '../pages/Game/utils'

interface OnlineGameStore {
    gameSession: GameSession | null
    gameState: GameState | null
    currentPlayerId: string | null
    selectedPosition: Position | null
    validMoves: Position[]
    validAttacks: Position[]
    validSwaps: SwapTarget[]
    isLoading: boolean
    error: string | null

    setGameSession: (session: GameSession) => void
    setCurrentPlayerId: (playerId: string) => void
    initializeBoard: () => void
    selectSquare: (pos: Position) => boolean
    syncFromServer: (session: GameSession) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    reset: () => void

    getCurrentPlayer: () => Player | undefined
    getCurrentTurnPlayer: () => Player | undefined
    isMyTurn: () => boolean
    getGameStateForSync: () => GameState | null
}

const initialState = {
    gameSession: null,
    gameState: null,
    currentPlayerId: null,
    selectedPosition: null,
    validMoves: [] as Position[],
    validAttacks: [] as Position[],
    validSwaps: [] as SwapTarget[],
    isLoading: false,
    error: null
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

export const useOnlineGameStore = create<OnlineGameStore>((set, get) => ({
    ...initialState,

    setGameSession: (session: GameSession) => {
        set({ gameSession: session, error: null })
    },

    setCurrentPlayerId: (playerId: string) => {
        set({ currentPlayerId: playerId })
    },

    initializeBoard: () => {
        const { gameSession } = get()
        if (!gameSession || !gameSession.gameState) return

        set({
            gameState: {
                board: gameSession.gameState.board,
                boardSize: gameSession.boardSize,
                currentPlayer: gameSession.gameState.currentPlayer,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                validSwaps: [],
                moveHistory: gameSession.gameState.moveHistory || [],
                capturedPieces: gameSession.gameState.capturedPieces || { white: [], black: [] },
                lastMove: gameSession.gameState.lastMove || null,
                gameOver: gameSession.gameState.gameOver || false,
                winner: gameSession.gameState.winner || null,
                narcs: gameSession.gameState.narcs || []
            }
        })
    },

    selectSquare: (pos: Position): boolean => {
        const { gameSession, gameState, currentPlayerId, selectedPosition, validMoves, validAttacks, validSwaps } = get()

        if (!gameSession || !gameState) return false
        if (!currentPlayerId) return false

        const myPlayer = gameSession.players.find(p => p.id === currentPlayerId)
        if (!myPlayer) return false

        if (myPlayer.color !== gameState.currentPlayer) return false
        if (gameState.gameOver) return false

        const { board, boardSize } = gameState
        const cell = board[pos.row][pos.col]

        if (selectedPosition) {
            const isValidMoveTarget = validMoves.some(
                m => m.row === pos.row && m.col === pos.col
            )
            const isValidAttackTarget = validAttacks.some(
                a => a.row === pos.row && a.col === pos.col
            )
            const swapTarget = validSwaps.find(
                s => s.position.row === pos.row && s.position.col === pos.col
            )

            if (swapTarget) {
                const swapResult = executeSwap(board, selectedPosition, pos)

                if (swapResult.success) {
                    const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE
                        ? PlayerColors.BLACK
                        : PlayerColors.WHITE
                    const { gameOver, winner } = checkGameOver(swapResult.board, nextPlayer, boardSize)

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
                        selectedPosition: null,
                        validMoves: [],
                        validAttacks: [],
                        validSwaps: []
                    })

                    return true
                }
            }

            if (isValidMoveTarget || isValidAttackTarget) {
                const { newBoard, move, newNarcs } = makeMove(
                    board,
                    selectedPosition,
                    pos,
                    boardSize,
                    isValidAttackTarget,
                    gameState.narcs
                )

                const nextPlayer = gameState.currentPlayer === PlayerColors.WHITE
                    ? PlayerColors.BLACK
                    : PlayerColors.WHITE
                const { gameOver, winner } = checkGameOver(newBoard, nextPlayer, boardSize)

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
                    selectedPosition: null,
                    validMoves: [],
                    validAttacks: [],
                    validSwaps: []
                })

                return true
            }

            if (cell && isPiece(cell) && cell.color === myPlayer.color) {
                const moves = getValidMoves(board, pos, boardSize)
                const attacks = getValidAttacks(board, pos, boardSize)
                const swaps: SwapTarget[] = cell.type === PieceTypes.WARLOCK
                    ? getValidSwapTargets(board, pos).map(s => ({
                        position: s.position,
                        swapType: s.swapType
                    }))
                    : []
                set({
                    selectedPosition: pos,
                    validMoves: moves,
                    validAttacks: attacks,
                    validSwaps: swaps
                })
                return false
            }

            set({
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                validSwaps: []
            })
            return false
        }

        if (cell && isPiece(cell) && cell.color === myPlayer.color) {
            const moves = getValidMoves(board, pos, boardSize)
            const attacks = getValidAttacks(board, pos, boardSize)
            const swaps: SwapTarget[] = cell.type === PieceTypes.WARLOCK
                ? getValidSwapTargets(board, pos).map(s => ({
                    position: s.position,
                    swapType: s.swapType
                }))
                : []
            set({
                selectedPosition: pos,
                validMoves: moves,
                validAttacks: attacks,
                validSwaps: swaps
            })
        }

        return false
    },

    syncFromServer: (session: GameSession) => {
        if (!session.gameState) return

        set({
            gameSession: session,
            gameState: {
                board: session.gameState.board,
                boardSize: session.boardSize,
                currentPlayer: session.gameState.currentPlayer,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                validSwaps: [],
                moveHistory: session.gameState.moveHistory || [],
                capturedPieces: session.gameState.capturedPieces || { white: [], black: [] },
                lastMove: session.gameState.lastMove || null,
                gameOver: session.gameState.gameOver || false,
                winner: session.gameState.winner || null,
                narcs: session.gameState.narcs || []
            },
            selectedPosition: null,
            validMoves: [],
            validAttacks: [],
            validSwaps: []
        })
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading })
    },

    setError: (error: string | null) => {
        set({ error })
    },

    reset: () => {
        set(initialState)
    },

    getCurrentPlayer: () => {
        const { gameSession, currentPlayerId } = get()
        if (!gameSession || !currentPlayerId) return undefined
        return gameSession.players.find(p => p.id === currentPlayerId)
    },

    getCurrentTurnPlayer: () => {
        const { gameSession, gameState } = get()
        if (!gameSession || !gameState) return undefined
        return gameSession.players.find(p => p.color === gameState.currentPlayer)
    },

    isMyTurn: () => {
        const { gameSession, gameState, currentPlayerId } = get()
        if (!gameSession || !gameState || !currentPlayerId) return false
        const myPlayer = gameSession.players.find(p => p.id === currentPlayerId)
        if (!myPlayer) return false
        return myPlayer.color === gameState.currentPlayer
    },

    getGameStateForSync: () => {
        const { gameState } = get()
        return gameState
    }
}))
