import { useState, useCallback, useEffect } from 'react'
import type { GameState, Position, BotDifficulty, HintMove, BoardSizeKey } from '../types'
import { isPiece, BOARD_SIZES, PlayerColors, BotDifficulties, BoardSizeKeys } from '../types'
import { BOT_DELAY, DEFAULT_BOARD_SIZE } from '../constants'
import {
    createInitialBoard,
    getValidMoves,
    getValidAttacks,
    makeMove,
    hasLegalMoves,
    isMonarchCaptured,
    getBotMove,
    getHintMove
} from '../utils'

interface HistoryEntry {
    gameState: GameState
}

export const useGame = (initialBoardSizeKey: BoardSizeKey = BoardSizeKeys.SMALL) => {
    const [boardSizeKey, setBoardSizeKey] = useState<BoardSizeKey>(initialBoardSizeKey)
    const boardSize = BOARD_SIZES[boardSizeKey] || DEFAULT_BOARD_SIZE

    const [gameState, setGameState] = useState<GameState>(() => ({
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
    }))

    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [botEnabled, setBotEnabled] = useState(false)
    const [botThinking, setBotThinking] = useState(false)
    const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>(BotDifficulties.MEDIUM)
    const [hintMove, setHintMove] = useState<HintMove | null>(null)

    const checkGameOver = useCallback((board: typeof gameState.board, nextPlayer: typeof gameState.currentPlayer) => {
        if (isMonarchCaptured(board, nextPlayer)) {
            return {
                gameOver: true,
                winner: nextPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
            }
        }

        if (!hasLegalMoves(board, nextPlayer, gameState.boardSize)) {
            return {
                gameOver: true,
                winner: nextPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
            }
        }

        return { gameOver: false, winner: null }
    }, [gameState.boardSize])

    useEffect(() => {
        if (!botEnabled) return
        if (gameState.currentPlayer !== PlayerColors.BLACK) return
        if (gameState.gameOver) return

        setBotThinking(true)

        const timer = setTimeout(() => {
            const botMove = getBotMove(gameState.board, gameState.lastMove, botDifficulty, gameState.boardSize)

            if (!botMove) {
                setBotThinking(false)
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
            const { gameOver, winner } = checkGameOver(newBoard, nextPlayer)

            const newCaptured = { ...gameState.capturedPieces }
            if (move.captured) {
                if (move.captured.color === PlayerColors.WHITE) {
                    newCaptured.white = [...newCaptured.white, move.captured]
                } else {
                    newCaptured.black = [...newCaptured.black, move.captured]
                }
            }

            setGameState(prev => ({
                ...prev,
                board: newBoard,
                currentPlayer: nextPlayer,
                selectedPosition: null,
                validMoves: [],
                validAttacks: [],
                moveHistory: [...prev.moveHistory, move],
                capturedPieces: newCaptured,
                lastMove: move,
                gameOver,
                winner
            }))

            setBotThinking(false)
        }, BOT_DELAY[botDifficulty])

        return () => clearTimeout(timer)
    }, [botEnabled, botDifficulty, gameState.currentPlayer, gameState.board, gameState.lastMove, gameState.gameOver, gameState.capturedPieces, gameState.boardSize, checkGameOver])

    const selectSquare = useCallback((pos: Position) => {
        if (botEnabled && gameState.currentPlayer === PlayerColors.BLACK) return

        setHintMove(null)

        setGameState(prev => {
            if (prev.gameOver) return prev

            const cell = prev.board[pos.row][pos.col]

            if (prev.selectedPosition) {
                const isValidMoveTarget = prev.validMoves.some(
                    m => m.row === pos.row && m.col === pos.col
                )
                const isValidAttackTarget = prev.validAttacks.some(
                    a => a.row === pos.row && a.col === pos.col
                )

                if (isValidMoveTarget || isValidAttackTarget) {
                    setHistory(h => [...h, { gameState: prev }])

                    const { newBoard, move } = makeMove(
                        prev.board,
                        prev.selectedPosition,
                        pos,
                        prev.boardSize,
                        isValidAttackTarget
                    )

                    const nextPlayer = prev.currentPlayer === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE
                    const { gameOver, winner } = checkGameOver(newBoard, nextPlayer)

                    const newCaptured = { ...prev.capturedPieces }
                    if (move.captured) {
                        if (move.captured.color === PlayerColors.WHITE) {
                            newCaptured.white = [...newCaptured.white, move.captured]
                        } else {
                            newCaptured.black = [...newCaptured.black, move.captured]
                        }
                    }

                    return {
                        ...prev,
                        board: newBoard,
                        currentPlayer: nextPlayer,
                        selectedPosition: null,
                        validMoves: [],
                        validAttacks: [],
                        moveHistory: [...prev.moveHistory, move],
                        capturedPieces: newCaptured,
                        lastMove: move,
                        gameOver,
                        winner
                    }
                }

                if (cell && isPiece(cell) && cell.color === prev.currentPlayer) {
                    const moves = getValidMoves(prev.board, pos, prev.boardSize)
                    const attacks = getValidAttacks(prev.board, pos, prev.boardSize)
                    return { ...prev, selectedPosition: pos, validMoves: moves, validAttacks: attacks }
                }

                return { ...prev, selectedPosition: null, validMoves: [], validAttacks: [] }
            }

            if (cell && isPiece(cell) && cell.color === prev.currentPlayer) {
                const moves = getValidMoves(prev.board, pos, prev.boardSize)
                const attacks = getValidAttacks(prev.board, pos, prev.boardSize)
                return { ...prev, selectedPosition: pos, validMoves: moves, validAttacks: attacks }
            }

            return prev
        })
    }, [botEnabled, gameState.currentPlayer, checkGameOver])

    const resetGame = useCallback((newBoardSizeKey?: BoardSizeKey) => {
        const sizeKey = newBoardSizeKey || boardSizeKey
        const newBoardSize = BOARD_SIZES[sizeKey] || DEFAULT_BOARD_SIZE

        if (newBoardSizeKey) {
            setBoardSizeKey(newBoardSizeKey)
        }

        setGameState({
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
        })
        setHistory([])
        setBotThinking(false)
        setHintMove(null)
    }, [boardSizeKey])

    const toggleBot = useCallback(() => {
        setBotEnabled(prev => !prev)
        setBotThinking(false)
    }, [])

    const setDifficulty = useCallback((difficulty: BotDifficulty) => {
        setBotDifficulty(difficulty)
    }, [])

    const undoMove = useCallback(() => {
        if (history.length === 0 || botThinking) return

        setHistory(prev => {
            const newHistory = [...prev]
            const lastEntry = newHistory.pop()
            if (lastEntry) {
                setGameState({ ...lastEntry.gameState, selectedPosition: null, validMoves: [], validAttacks: [] })
            }
            return newHistory
        })
    }, [history.length, botThinking])

    const showHint = useCallback(() => {
        if (gameState.currentPlayer !== PlayerColors.WHITE) return
        if (gameState.gameOver) return

        const hint = getHintMove(gameState.board, gameState.lastMove, gameState.boardSize)
        setHintMove(hint)
    }, [gameState.board, gameState.lastMove, gameState.currentPlayer, gameState.gameOver, gameState.boardSize])

    const canUndo = history.length > 0 && gameState.currentPlayer === PlayerColors.WHITE && !botThinking
    const canHint = gameState.currentPlayer === PlayerColors.WHITE && !gameState.gameOver && !botThinking

    return {
        gameState,
        boardSizeKey,
        botEnabled,
        botThinking,
        botDifficulty,
        canUndo,
        hintMove,
        canHint,
        selectSquare,
        resetGame,
        toggleBot,
        setDifficulty,
        undoMove,
        showHint
    }
}
