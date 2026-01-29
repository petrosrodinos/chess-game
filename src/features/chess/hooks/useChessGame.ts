import { useState, useCallback, useEffect } from 'react'
import type { GameState, Position, PieceType, BotDifficulty, HintMove } from '../types'
import { BOT_DELAY } from '../constants'
import {
    createInitialBoard,
    getValidMoves,
    makeMove,
    isInCheck,
    hasLegalMoves,
    getBotMove,
    getHintMove
} from '../utils'

interface HistoryEntry {
    gameState: GameState
}

export const useChessGame = () => {
    const [gameState, setGameState] = useState<GameState>(() => ({
        board: createInitialBoard(),
        currentPlayer: 'white',
        selectedPosition: null,
        validMoves: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        moveHistory: [],
        capturedPieces: { white: [], black: [] },
        lastMove: null
    }))

    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null)
    const [botEnabled, setBotEnabled] = useState(false)
    const [botThinking, setBotThinking] = useState(false)
    const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium')
    const [hintMove, setHintMove] = useState<HintMove | null>(null)

    useEffect(() => {
        if (!botEnabled) return
        if (gameState.currentPlayer !== 'black') return
        if (gameState.isCheckmate || gameState.isStalemate) return

        setBotThinking(true)

        const timer = setTimeout(() => {
            const botMove = getBotMove(gameState.board, gameState.lastMove, botDifficulty)

            if (!botMove) {
                setBotThinking(false)
                return
            }

            const { newBoard, move } = makeMove(
                gameState.board,
                botMove.from,
                botMove.to,
                gameState.lastMove,
                'queen'
            )

            const check = isInCheck(newBoard, 'white')
            const hasLegal = hasLegalMoves(newBoard, 'white', move)

            const newCaptured = { ...gameState.capturedPieces }
            if (move.captured) {
                if (move.captured.color === 'white') {
                    newCaptured.white = [...newCaptured.white, move.captured]
                } else {
                    newCaptured.black = [...newCaptured.black, move.captured]
                }
            }

            setGameState(prev => ({
                ...prev,
                board: newBoard,
                currentPlayer: 'white',
                selectedPosition: null,
                validMoves: [],
                isCheck: check,
                isCheckmate: check && !hasLegal,
                isStalemate: !check && !hasLegal,
                moveHistory: [...prev.moveHistory, move],
                capturedPieces: newCaptured,
                lastMove: move
            }))

            setBotThinking(false)
        }, BOT_DELAY[botDifficulty])

        return () => clearTimeout(timer)
    }, [botEnabled, botDifficulty, gameState.currentPlayer, gameState.board, gameState.lastMove, gameState.isCheckmate, gameState.isStalemate, gameState.capturedPieces])

    const selectSquare = useCallback((pos: Position) => {
        if (botEnabled && gameState.currentPlayer === 'black') return

        setHintMove(null)

        setGameState(prev => {
            if (prev.isCheckmate || prev.isStalemate) return prev

            const piece = prev.board[pos.row][pos.col]

            if (prev.selectedPosition) {
                const isValidMove = prev.validMoves.some(
                    m => m.row === pos.row && m.col === pos.col
                )

                if (isValidMove) {
                    const selectedPiece = prev.board[prev.selectedPosition.row][prev.selectedPosition.col]

                    if (selectedPiece?.type === 'pawn') {
                        const promotionRow = selectedPiece.color === 'white' ? 0 : 7
                        if (pos.row === promotionRow) {
                            setPendingPromotion({ from: prev.selectedPosition, to: pos })
                            return prev
                        }
                    }

                    setHistory(h => [...h, { gameState: prev }])

                    const { newBoard, move } = makeMove(
                        prev.board,
                        prev.selectedPosition,
                        pos,
                        prev.lastMove
                    )

                    const nextPlayer = prev.currentPlayer === 'white' ? 'black' : 'white'
                    const check = isInCheck(newBoard, nextPlayer)
                    const hasLegal = hasLegalMoves(newBoard, nextPlayer, move)

                    const newCaptured = { ...prev.capturedPieces }
                    if (move.captured) {
                        if (move.captured.color === 'white') {
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
                        isCheck: check,
                        isCheckmate: check && !hasLegal,
                        isStalemate: !check && !hasLegal,
                        moveHistory: [...prev.moveHistory, move],
                        capturedPieces: newCaptured,
                        lastMove: move
                    }
                }

                if (piece && piece.color === prev.currentPlayer) {
                    const moves = getValidMoves(prev.board, pos, prev.lastMove)
                    return { ...prev, selectedPosition: pos, validMoves: moves }
                }

                return { ...prev, selectedPosition: null, validMoves: [] }
            }

            if (piece && piece.color === prev.currentPlayer) {
                const moves = getValidMoves(prev.board, pos, prev.lastMove)
                return { ...prev, selectedPosition: pos, validMoves: moves }
            }

            return prev
        })
    }, [botEnabled, gameState.currentPlayer])

    const promotePawn = useCallback((pieceType: PieceType) => {
        if (!pendingPromotion) return

        setGameState(prev => {
            setHistory(h => [...h, { gameState: prev }])

            const { newBoard, move } = makeMove(
                prev.board,
                pendingPromotion.from,
                pendingPromotion.to,
                prev.lastMove,
                pieceType
            )

            const nextPlayer = prev.currentPlayer === 'white' ? 'black' : 'white'
            const check = isInCheck(newBoard, nextPlayer)
            const hasLegal = hasLegalMoves(newBoard, nextPlayer, move)

            const newCaptured = { ...prev.capturedPieces }
            if (move.captured) {
                if (move.captured.color === 'white') {
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
                isCheck: check,
                isCheckmate: check && !hasLegal,
                isStalemate: !check && !hasLegal,
                moveHistory: [...prev.moveHistory, move],
                capturedPieces: newCaptured,
                lastMove: move
            }
        })

        setPendingPromotion(null)
    }, [pendingPromotion])

    const resetGame = useCallback(() => {
        setGameState({
            board: createInitialBoard(),
            currentPlayer: 'white',
            selectedPosition: null,
            validMoves: [],
            isCheck: false,
            isCheckmate: false,
            isStalemate: false,
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            lastMove: null
        })
        setHistory([])
        setPendingPromotion(null)
        setBotThinking(false)
        setHintMove(null)
    }, [])

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
                setGameState({ ...lastEntry.gameState, selectedPosition: null, validMoves: [] })
            }
            return newHistory
        })
    }, [history.length, botThinking])

    const showHint = useCallback(() => {
        if (gameState.currentPlayer !== 'white') return
        if (gameState.isCheckmate || gameState.isStalemate) return

        const hint = getHintMove(gameState.board, gameState.lastMove)
        setHintMove(hint)
    }, [gameState.board, gameState.lastMove, gameState.currentPlayer, gameState.isCheckmate, gameState.isStalemate])

    const canUndo = history.length > 0 && gameState.currentPlayer === 'white' && !botThinking
    const canHint = gameState.currentPlayer === 'white' && !gameState.isCheckmate && !gameState.isStalemate && !botThinking

    return {
        gameState,
        pendingPromotion,
        botEnabled,
        botThinking,
        botDifficulty,
        canUndo,
        hintMove,
        canHint,
        selectSquare,
        promotePawn,
        resetGame,
        toggleBot,
        setDifficulty,
        undoMove,
        showHint
    }
}
