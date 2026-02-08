import { useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSocket } from './useSocket'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { SocketEvents } from '../constants'
import { getSocket } from '../lib/socket'
import { SoundManager } from '../lib/soundManager'
import { SoundEvents } from '../config/audio'
import { getMoveSound, isValidSoundEvent } from '../utils/sound.utils'
import type { GameSession } from '../features/game/interfaces'
import type { Position, Piece } from '../pages/Game/types'

interface MysteryBoxTriggeredPayload {
    code: string
    playerName: string
    option: number
    optionName: string
    diceRoll: number | null
    gameState?: GameSession['gameState']
    soundKey?: unknown
}

interface MysteryBoxCompletePayload {
    code: string
    gameState: GameSession['gameState']
    soundKey?: unknown
}

interface ZombieRevivePayload {
    necromancerPosition: Position
    revivePiece: Piece
    target: Position
}

export const useOnlineGame = () => {
    const [searchParams] = useSearchParams()
    const gameCode = searchParams.get('code')
    const { emit, on, off, isConnected, socket, connectionError } = useSocket()
    const userId = useAuthStore(state => state.userId)
    const hasJoinedRef = useRef(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const gameCodeRef = useRef(gameCode)
    const resetRef = useRef<() => void>(() => { })

    const {
        gameSession,
        gameState,
        selectedPosition,
        validMoves,
        validAttacks,
        validSwaps,
        mysteryBoxState,
        isLoading,
        error,
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
        getGameStateForSync,
        handleMysteryBoxSelection,
        selectRevivePiece,
        cancelMysteryBox,
    } = useGameStore()

    useEffect(() => {
        if (connectionError && isLoading) {
            setLoading(false)
            setError('Failed to connect to game server.')
            toast.error('Failed to connect to game server. Please try again.')
        }
    }, [connectionError, isLoading, setLoading, setError])

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
            syncFromServer(data)
            setLoading(false)

            if (userId) {
                const myPlayer = data.players.find(p => p.id === userId)
                if (myPlayer) {
                    setCurrentPlayerId(userId)
                }
            }
        }

        const handleGameUpdate = (data: GameSession & { soundKey?: unknown }) => {
            const { soundKey, ...session } = data
            syncFromServer(session)
            if (isValidSoundEvent(soundKey)) {
                SoundManager.play(soundKey)
            }
        }

        const handlePlayerJoined = (data: GameSession & { joinedPlayerId?: string }) => {
            clearTimeoutIfExists()
            const { joinedPlayerId: _joinedPlayerId, ...session } = data
            syncFromServer(session)
            setLoading(false)
            const joinedPlayer = data.joinedPlayerId
                ? data.players.find(p => p.id === data.joinedPlayerId)
                : data.players[data.players.length - 1]
            if (joinedPlayer && joinedPlayer.id !== userId) {
                toast.success(`${joinedPlayer.name} joined the game!`)
            }
        }

        const handleGameStart = (data: GameSession) => {
            clearTimeoutIfExists()
            syncFromServer(data)
            setLoading(false)
            toast.success('Game started!')
        }

        const handleError = (data: { message: string }) => {
            clearTimeoutIfExists()
            setError(data.message)
            setLoading(false)
            toast.error(data.message)
        }

        const handlePlayerLeft = (data: { message: string }) => {
            toast.error(data.message)
        }

        const handleMysteryBoxTriggeredByOpponent = (data: MysteryBoxTriggeredPayload) => {
            if (data.gameState) {
                const currentSession = useGameStore.getState().gameSession
                if (currentSession) {
                    const updatedSession = { ...currentSession, gameState: data.gameState } as GameSession
                    syncFromServer(updatedSession)
                }
            }
            if (isValidSoundEvent(data.soundKey)) {
                SoundManager.play(data.soundKey)
            }
            toast.info(`🎁 ${data.playerName} triggered a Mystery Box!`, { autoClose: 3000 })

            const opponentOptionDescriptions: Record<number, string> = {
                1: `🔄 ${data.playerName} can swap two of their pieces!`,
                2: `⚔️ ${data.playerName} will sacrifice a Hoplite to revive one of your captured pieces!`,
                3: `🎲 ${data.playerName} rolled ${data.diceRoll}! They can swap ${data.diceRoll} obstacle(s) with empty tiles!`
            }

            if (data.option && opponentOptionDescriptions[data.option]) {
                toast.warning(opponentOptionDescriptions[data.option], { autoClose: 5000 })
            }
        }

        const handleMysteryBoxCompleteByOpponent = (data: MysteryBoxCompletePayload) => {
            if (data.gameState) {
                const currentSession = useGameStore.getState().gameSession
                if (currentSession) {
                    const updatedSession = { ...currentSession, gameState: data.gameState } as GameSession
                    syncFromServer(updatedSession)
                    toast.success('🎉 Mystery Box action completed!', { autoClose: 2000 })
                }
            }
            if (isValidSoundEvent(data.soundKey)) {
                SoundManager.play(data.soundKey)
            }
        }

        const handleNecromancerReviveStarted = (data: { playerName: string }) => {
            toast.info(`🧟 ${data.playerName} is reviving a piece.`, { autoClose: 4000 })
        }

        on<GameSession>(SocketEvents.GAME_STATE, handleGameState)
        on<GameSession>(SocketEvents.GAME_UPDATE, handleGameUpdate)
        on<GameSession>(SocketEvents.PLAYER_JOINED, handlePlayerJoined)
        on<GameSession>(SocketEvents.GAME_START, handleGameStart)
        on<{ message: string }>(SocketEvents.ERROR, handleError)
        on<{ message: string }>(SocketEvents.PLAYER_LEFT, handlePlayerLeft)
        on<MysteryBoxTriggeredPayload>(SocketEvents.MYSTERY_BOX_TRIGGERED, handleMysteryBoxTriggeredByOpponent)
        on<MysteryBoxCompletePayload>(SocketEvents.MYSTERY_BOX_COMPLETE, handleMysteryBoxCompleteByOpponent)
        on<{ playerName: string }>(SocketEvents.NECROMANCER_REVIVE_STARTED, handleNecromancerReviveStarted)

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
            off(SocketEvents.PLAYER_LEFT)
            off(SocketEvents.MYSTERY_BOX_TRIGGERED)
            off(SocketEvents.MYSTERY_BOX_COMPLETE)
            off(SocketEvents.NECROMANCER_REVIVE_STARTED)
        }
    }, [gameCode, isConnected, userId, emit, on, off, socket, setCurrentPlayerId, syncFromServer, setLoading, setError])

    useEffect(() => {
        if (gameSession && !gameState) {
            initializeBoard()
        }
    }, [gameSession, gameState, initializeBoard])

    useEffect(() => {
        gameCodeRef.current = gameCode
        resetRef.current = reset
    }, [gameCode, reset])

    useEffect(() => {
        return () => {
            if (gameCodeRef.current) {
                const socket = getSocket()
                if (socket.connected) {
                    socket.emit(SocketEvents.LEAVE_GAME, { code: gameCodeRef.current })
                }
            }
            hasJoinedRef.current = false
            resetRef.current()
        }
    }, [])

    const handleSquareClick = useCallback((pos: Position) => {
        if (!gameCode) return

        const currentMysteryBoxState = useGameStore.getState().mysteryBoxState

        if (currentMysteryBoxState.isActive) {
            const actionCompleted = handleMysteryBoxSelection(pos, true)

            if (actionCompleted) {
                const currentGameState = getGameStateForSync()
                if (!currentGameState) return

                SoundManager.play(SoundEvents.SWAP)
                emit(SocketEvents.MYSTERY_BOX_COMPLETE, {
                    code: gameCode,
                    soundKey: SoundEvents.SWAP,
                    gameState: {
                        board: currentGameState.board,
                        currentPlayer: currentGameState.currentPlayer,
                        moveHistory: currentGameState.moveHistory,
                        capturedPieces: currentGameState.capturedPieces,
                        lastMove: currentGameState.lastMove,
                        gameOver: currentGameState.gameOver,
                        winner: currentGameState.winner,
                        narcs: currentGameState.narcs,
                        nightMode: currentGameState.nightMode
                    }
                })

                toast.success('🎉 Mystery Box action completed!', { autoClose: 2000 })
            }
            return
        }

        const result = selectSquare(pos, true)

        if (typeof result === 'object' && result.triggered) {
            const myPlayer = getCurrentPlayer()
            const playerName = myPlayer?.name || 'Player'
            const currentGameState = getGameStateForSync()

            if (currentGameState) {
                emit(SocketEvents.MYSTERY_BOX_TRIGGERED, {
                    code: gameCode,
                    playerName,
                    option: result.option,
                    optionName: result.optionName,
                    diceRoll: result.diceRoll,
                    soundKey: SoundEvents.MYSTERY_BOX,
                    gameState: {
                        board: currentGameState.board,
                        currentPlayer: currentGameState.currentPlayer,
                        moveHistory: currentGameState.moveHistory,
                        capturedPieces: currentGameState.capturedPieces,
                        lastMove: currentGameState.lastMove,
                        gameOver: currentGameState.gameOver,
                        winner: currentGameState.winner,
                        narcs: currentGameState.narcs,
                        nightMode: currentGameState.nightMode
                    }
                })
            }

            const optionDescriptions: Record<number, string> = {
                1: '✨ Swap positions of any two of your pieces!',
                2: '⚔️ Sacrifice a Hoplite to revive an opponent piece as your own!',
                3: `🎲 Roll: ${result.diceRoll}! Swap ${result.diceRoll} obstacle(s) with empty tiles!`
            }

            toast.info(`🎁 Mystery Box Activated!`, { autoClose: 2500 })
            if (result.option) {
                toast.success(optionDescriptions[result.option], { autoClose: 5000 })
            }
            return
        }

        if (!result) return

        const currentGameState = getGameStateForSync()
        if (!currentGameState) return

        const soundKey = currentGameState.lastMove ? getMoveSound(currentGameState.lastMove) : undefined
        emit(SocketEvents.SYNC_GAME, {
            code: gameCode,
            gameState: {
                board: currentGameState.board,
                currentPlayer: currentGameState.currentPlayer,
                moveHistory: currentGameState.moveHistory,
                capturedPieces: currentGameState.capturedPieces,
                lastMove: currentGameState.lastMove,
                gameOver: currentGameState.gameOver,
                winner: currentGameState.winner,
                narcs: currentGameState.narcs,
                nightMode: currentGameState.nightMode
            },
            soundKey
        })
    }, [gameCode, selectSquare, getGameStateForSync, emit, handleMysteryBoxSelection, getCurrentPlayer])

    const requestZombieRevive = useCallback((payload: ZombieRevivePayload) => {
        if (!gameCode) return
        const revived = useGameStore.getState().reviveZombie({
            necromancerPosition: payload.necromancerPosition,
            revivePiece: payload.revivePiece,
            target: payload.target
        })
        if (!revived) return

        const currentGameState = getGameStateForSync()
        if (!currentGameState) return

        const soundKey = currentGameState.lastMove ? getMoveSound(currentGameState.lastMove) : undefined
        emit(SocketEvents.SYNC_GAME, {
            code: gameCode,
            gameState: {
                board: currentGameState.board,
                currentPlayer: currentGameState.currentPlayer,
                moveHistory: currentGameState.moveHistory,
                capturedPieces: currentGameState.capturedPieces,
                lastMove: currentGameState.lastMove,
                gameOver: currentGameState.gameOver,
                winner: currentGameState.winner,
                narcs: currentGameState.narcs,
                nightMode: currentGameState.nightMode
            },
            soundKey
        })
    }, [gameCode, emit, getGameStateForSync])

    const notifyReviveStarted = useCallback(() => {
        if (!gameCode) return
        const myPlayer = getCurrentPlayer()
        const playerName = myPlayer?.name || 'Opponent'
        emit(SocketEvents.NECROMANCER_REVIVE_STARTED, { code: gameCode, playerName })
    }, [gameCode, emit, getCurrentPlayer])

    const handleSelectRevivePiece = useCallback((piece: Parameters<typeof selectRevivePiece>[0]) => {
        selectRevivePiece(piece, true)
    }, [selectRevivePiece])

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
        validSwaps,
        lastMove,
        capturedPieces,
        gameOver,
        winner,
        moveHistory,
        mysteryBoxState,
        currentPlayer: getCurrentPlayer(),
        currentTurnPlayer: getCurrentTurnPlayer(),
        isMyTurn: isMyTurn(),
        isLoading: gameCode ? isLoading : false,
        error,
        handleSquareClick,
        selectRevivePiece: handleSelectRevivePiece,
        cancelMysteryBox,
        requestZombieRevive,
        notifyReviveStarted
    }
}
