import { useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSocket } from './useSocket'
import { useOnlineGameStore } from '../store/onlineGameStore'
import { useAuthStore } from '../store/authStore'
import { SocketEvents } from '../constants'
import type { GameSession } from '../features/game/interfaces'
import type { Position } from '../pages/Game/types'

export const useOnlineGame = () => {
    const [searchParams] = useSearchParams()
    const gameCode = searchParams.get('code')
    const { emit, on, off, isConnected, socket } = useSocket()
    const userId = useAuthStore(state => state.userId)
    const hasJoinedRef = useRef(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const {
        gameSession,
        gameState,
        selectedPosition,
        validMoves,
        validAttacks,
        isLoading,
        error,
        setGameSession,
        setCurrentPlayerId,
        initializeBoard,
        selectSquare,
        syncFromServer,
        setLoading,
        setError,
        reset,
        getCurrentPlayer,
        getCurrentTurnPlayer,
        isMyTurn,
        getGameStateForSync
    } = useOnlineGameStore()

    useEffect(() => {
        if (!gameCode) {
            setLoading(false)
            return
        }

        if (!isConnected) {
            setLoading(true)
            return
        }

        if (hasJoinedRef.current) return

        setLoading(true)
        hasJoinedRef.current = true

        const clearTimeoutIfExists = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }

        const handleGameState = (data: GameSession) => {
            clearTimeoutIfExists()
            setGameSession(data)
            setLoading(false)

            if (userId) {
                const myPlayer = data.players.find(p => p.id === userId)
                if (myPlayer) {
                    setCurrentPlayerId(userId)
                }
            }
        }

        const handleGameUpdate = (data: GameSession) => {
            syncFromServer(data)
        }

        const handlePlayerJoined = (data: GameSession) => {
            clearTimeoutIfExists()
            setGameSession(data)
            setLoading(false)
            const newPlayer = data.players[data.players.length - 1]
            if (newPlayer && newPlayer.id !== userId) {
                toast.info(`${newPlayer.name} joined the game`)
            }
        }

        const handleGameStart = (data: GameSession) => {
            clearTimeoutIfExists()
            setGameSession(data)
            setLoading(false)
            toast.success('Game started!')
        }

        const handleError = (data: { message: string }) => {
            clearTimeoutIfExists()
            setError(data.message)
            setLoading(false)
            toast.error(data.message)
        }

        on<GameSession>(SocketEvents.GAME_STATE, handleGameState)
        on<GameSession>(SocketEvents.GAME_UPDATE, handleGameUpdate)
        on<GameSession>(SocketEvents.PLAYER_JOINED, handlePlayerJoined)
        on<GameSession>(SocketEvents.GAME_START, handleGameStart)
        on<{ message: string }>(SocketEvents.ERROR, handleError)

        emit(SocketEvents.GET_GAME, { code: gameCode, playerId: userId })

        timeoutRef.current = setTimeout(() => {
            setError('Server did not respond. Please try again.')
            setLoading(false)
            toast.error('Connection timeout. Server did not respond.')
        }, 10000)

        return () => {
            clearTimeoutIfExists()
            off(SocketEvents.GAME_STATE)
            off(SocketEvents.GAME_UPDATE)
            off(SocketEvents.PLAYER_JOINED)
            off(SocketEvents.GAME_START)
            off(SocketEvents.ERROR)
        }
    }, [gameCode, isConnected, userId, emit, on, off, socket, setGameSession, setCurrentPlayerId, syncFromServer, setLoading, setError])

    useEffect(() => {
        if (gameSession && !gameState) {
            initializeBoard()
        }
    }, [gameSession, gameState, initializeBoard])

    useEffect(() => {
        return () => {
            hasJoinedRef.current = false
            reset()
        }
    }, [reset])

    const handleSquareClick = useCallback((pos: Position) => {
        if (!gameCode) return

        const moveMade = selectSquare(pos)

        if (!moveMade) return

        const currentGameState = getGameStateForSync()
        if (!currentGameState) return

        emit(SocketEvents.SYNC_GAME, {
            code: gameCode,
            gameState: {
                board: currentGameState.board,
                currentPlayer: currentGameState.currentPlayer,
                moveHistory: currentGameState.moveHistory,
                capturedPieces: currentGameState.capturedPieces,
                lastMove: currentGameState.lastMove,
                gameOver: currentGameState.gameOver,
                winner: currentGameState.winner
            }
        })
    }, [gameCode, selectSquare, getGameStateForSync, emit])

    const board = gameState?.board ?? []
    const boardSize = gameState?.boardSize ?? gameSession?.boardSize ?? { rows: 12, cols: 12 }
    const lastMove = gameState?.lastMove ?? null
    const capturedPieces = gameState?.capturedPieces ?? { white: [], black: [] }
    const gameOver = gameState?.gameOver ?? false
    const winner = gameState?.winner ?? null
    const moveHistory = gameState?.moveHistory ?? []

    return {
        gameSession,
        gameCode,
        board,
        boardSize,
        selectedPosition,
        validMoves,
        validAttacks,
        lastMove,
        capturedPieces,
        gameOver,
        winner,
        moveHistory,
        currentPlayer: getCurrentPlayer(),
        currentTurnPlayer: getCurrentTurnPlayer(),
        isMyTurn: isMyTurn(),
        isLoading: gameCode ? isLoading : false,
        error,
        handleSquareClick
    }
}
