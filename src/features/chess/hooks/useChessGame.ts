import { useState, useCallback, useEffect } from 'react'
import type { GameState, Position, PieceType, BotDifficulty, HintMove, BoardSizeKey } from '../types'
import { isPiece, BOARD_SIZES, PieceColors, PieceTypes, BotDifficulties, BoardSizeKeys } from '../types'
import { BOT_DELAY, DEFAULT_BOARD_SIZE } from '../constants'
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

export const useChessGame = (initialBoardSizeKey: BoardSizeKey = BoardSizeKeys.SMALL) => {
    const [boardSizeKey, setBoardSizeKey] = useState<BoardSizeKey>(initialBoardSizeKey)
    const boardSize = BOARD_SIZES[boardSizeKey] || DEFAULT_BOARD_SIZE

    const [gameState, setGameState] = useState<GameState>(() => ({
        board: createInitialBoard(boardSize),
        boardSize: boardSize,
        currentPlayer: PieceColors.WHITE,
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
    const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>(BotDifficulties.MEDIUM)
    const [hintMove, setHintMove] = useState<HintMove | null>(null)

    useEffect(() => {
        if (!botEnabled) return
        if (gameState.currentPlayer !== PieceColors.BLACK) return
        if (gameState.isCheckmate || gameState.isStalemate) return

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
                gameState.lastMove,
                gameState.boardSize,
                PieceTypes.QUEEN
            )

            const check = isInCheck(newBoard, PieceColors.WHITE, gameState.boardSize)
            const hasLegal = hasLegalMoves(newBoard, PieceColors.WHITE, move, gameState.boardSize)

            const newCaptured = { ...gameState.capturedPieces }
            if (move.captured) {
                if (move.captured.color === PieceColors.WHITE) {
                    newCaptured.white = [...newCaptured.white, move.captured]
                } else {
                    newCaptured.black = [...newCaptured.black, move.captured]
                }
            }

            setGameState(prev => ({
                ...prev,
                board: newBoard,
                currentPlayer: PieceColors.WHITE,
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
    }, [botEnabled, botDifficulty, gameState.currentPlayer, gameState.board, gameState.lastMove, gameState.isCheckmate, gameState.isStalemate, gameState.capturedPieces, gameState.boardSize])

    const selectSquare = useCallback((pos: Position) => {
        if (botEnabled && gameState.currentPlayer === PieceColors.BLACK) return

        setHintMove(null)

        setGameState(prev => {
            if (prev.isCheckmate || prev.isStalemate) return prev

            const cell = prev.board[pos.row][pos.col]

            if (prev.selectedPosition) {
                const isValidMove = prev.validMoves.some(
                    m => m.row === pos.row && m.col === pos.col
                )

                if (isValidMove) {
                    const selectedCell = prev.board[prev.selectedPosition.row][prev.selectedPosition.col]

                    if (selectedCell && isPiece(selectedCell) && selectedCell.type === PieceTypes.PAWN) {
                        const promotionRow = selectedCell.color === PieceColors.WHITE ? 0 : prev.boardSize.rows - 1
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
                        prev.lastMove,
                        prev.boardSize
                    )

                    const nextPlayer = prev.currentPlayer === PieceColors.WHITE ? PieceColors.BLACK : PieceColors.WHITE
                    const check = isInCheck(newBoard, nextPlayer, prev.boardSize)
                    const hasLegal = hasLegalMoves(newBoard, nextPlayer, move, prev.boardSize)

                    const newCaptured = { ...prev.capturedPieces }
                    if (move.captured) {
                        if (move.captured.color === PieceColors.WHITE) {
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

                if (cell && isPiece(cell) && cell.color === prev.currentPlayer) {
                    const moves = getValidMoves(prev.board, pos, prev.lastMove, prev.boardSize)
                    return { ...prev, selectedPosition: pos, validMoves: moves }
                }

                return { ...prev, selectedPosition: null, validMoves: [] }
            }

            if (cell && isPiece(cell) && cell.color === prev.currentPlayer) {
                const moves = getValidMoves(prev.board, pos, prev.lastMove, prev.boardSize)
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
                prev.boardSize,
                pieceType
            )

            const nextPlayer = prev.currentPlayer === PieceColors.WHITE ? PieceColors.BLACK : PieceColors.WHITE
            const check = isInCheck(newBoard, nextPlayer, prev.boardSize)
            const hasLegal = hasLegalMoves(newBoard, nextPlayer, move, prev.boardSize)

            const newCaptured = { ...prev.capturedPieces }
            if (move.captured) {
                if (move.captured.color === PieceColors.WHITE) {
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

    const resetGame = useCallback((newBoardSizeKey?: BoardSizeKey) => {
        const sizeKey = newBoardSizeKey || boardSizeKey
        const newBoardSize = BOARD_SIZES[sizeKey] || DEFAULT_BOARD_SIZE
        
        if (newBoardSizeKey) {
            setBoardSizeKey(newBoardSizeKey)
        }

        setGameState({
            board: createInitialBoard(newBoardSize),
            boardSize: newBoardSize,
            currentPlayer: PieceColors.WHITE,
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
                setGameState({ ...lastEntry.gameState, selectedPosition: null, validMoves: [] })
            }
            return newHistory
        })
    }, [history.length, botThinking])

    const showHint = useCallback(() => {
        if (gameState.currentPlayer !== PieceColors.WHITE) return
        if (gameState.isCheckmate || gameState.isStalemate) return

        const hint = getHintMove(gameState.board, gameState.lastMove, gameState.boardSize)
        setHintMove(hint)
    }, [gameState.board, gameState.lastMove, gameState.currentPlayer, gameState.isCheckmate, gameState.isStalemate, gameState.boardSize])

    const canUndo = history.length > 0 && gameState.currentPlayer === PieceColors.WHITE && !botThinking
    const canHint = gameState.currentPlayer === PieceColors.WHITE && !gameState.isCheckmate && !gameState.isStalemate && !botThinking

    return {
        gameState,
        boardSizeKey,
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
