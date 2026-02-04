import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Users, Plus, LogIn, Copy, Check, Loader2, X } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { GameModes, SocketEvents } from '../../../constants'
import type { GameMode } from '../../../constants'
import { useSocket } from '../../../hooks'
import { toast } from 'react-toastify'
import { createInitialBoard } from '../../Game/utils'
import { BOARD_SIZES, BoardSizeKeys } from '../../Game/types'
import type { BoardSizeKey } from '../../Game/types'

interface GameSession {
    code: string
    players: Array<{ id: string; name: string }>
    status: string
}

export const PlayOptions = () => {
    const navigate = useNavigate()
    const userId = useAuthStore(state => state.userId)
    const username = useAuthStore(state => state.username)
    const [gameCode, setGameCode] = useState<string | null>(null)
    const [copiedCode, setCopiedCode] = useState(false)
    const [showJoinMenu, setShowJoinMenu] = useState(false)
    const [joinCode, setJoinCode] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [isWaiting, setIsWaiting] = useState(false)
    const { emit, on, off, connectionError } = useSocket()

    useEffect(() => {
        if (connectionError && (isCreating || isJoining)) {
            setIsCreating(false)
            setIsJoining(false)
            setIsWaiting(false)
            toast.error('Failed to connect to game server. Please try again.')
        }
    }, [connectionError, isCreating, isJoining])

    useEffect(() => {
        on<GameSession>(SocketEvents.CREATE_GAME, (data: GameSession) => {
            setGameCode(data.code)
            setShowJoinMenu(false)
            setIsCreating(false)
            setIsWaiting(true)
        })

        on<GameSession>(SocketEvents.PLAYER_JOINED, (data: GameSession) => {
            if (data.players.length === 2) {
                setIsWaiting(false)
            }
        })

        on<GameSession>(SocketEvents.GAME_START, (data: GameSession) => {
            navigate(`/game?code=${data.code}&mode=${GameModes.ONLINE}`)
        })

        on<{ message: string }>(SocketEvents.ERROR, (data: { message: string }) => {
            setIsCreating(false)
            setIsJoining(false)
            setIsWaiting(false)
            toast.error(data.message)
        })

        return () => {
            off(SocketEvents.CREATE_GAME)
            off(SocketEvents.PLAYER_JOINED)
            off(SocketEvents.GAME_START)
            off(SocketEvents.ERROR)
        }
    }, [on, off, navigate])

    const handleModeSelect = useCallback((mode: GameMode) => {
        navigate(`/game?mode=${mode}`)
    }, [navigate])

    const handleCreateGame = useCallback(() => {
        if (!userId) return
        setIsCreating(true)
        const boardSizeKey: BoardSizeKey = BoardSizeKeys.SMALL
        const boardSize = BOARD_SIZES[boardSizeKey]
        const board = createInitialBoard(boardSize)
        const gameState = {
            board
        }
        emit(SocketEvents.CREATE_GAME, { playerId: userId, playerName: username || '', gameState })
    }, [emit, userId, username])

    const handleToggleJoinMenu = useCallback(() => {
        setShowJoinMenu(prev => !prev)
        setGameCode(null)
        setIsWaiting(false)
    }, [])

    const handleJoinGame = useCallback(() => {
        if (!joinCode.trim() || !userId) return
        setIsJoining(true)
        emit(SocketEvents.JOIN_GAME, { code: joinCode.trim(), playerId: userId, playerName: username || '' })
    }, [emit, joinCode, userId, username])

    const handleCopyCode = useCallback(async () => {
        if (!gameCode) return
        await navigator.clipboard.writeText(gameCode)
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
    }, [gameCode])

    const handleCancelGame = useCallback(() => {
        if (!gameCode) return
        emit(SocketEvents.LEAVE_GAME, { code: gameCode })
        setGameCode(null)
        setIsWaiting(false)
    }, [emit, gameCode])
    return (
        <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-stone-700/50 h-full flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col justify-center">
                <button
                    type="button"
                    onClick={() => handleModeSelect(GameModes.SINGLE)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-3"
                >
                    <User className="w-6 h-6" />
                    Single Player
                </button>

                <button
                    type="button"
                    onClick={() => handleModeSelect(GameModes.OFFLINE)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-violet-500/25 flex items-center justify-center gap-3"
                >
                    <Users className="w-6 h-6" />
                    2 Players Offline
                </button>

                <div className="flex items-center gap-3 pt-4 pb-2">
                    <div className="flex-1 h-px bg-stone-600/50" />
                    <span className="text-stone-400 text-sm font-medium">Online Game</span>
                    <div className="flex-1 h-px bg-stone-600/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={handleCreateGame}
                        disabled={isCreating || isWaiting}
                        className="py-4 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        {isCreating ? 'Creating...' : 'Create Game'}
                    </button>

                    <button
                        type="button"
                        onClick={handleToggleJoinMenu}
                        className="py-4 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-rose-500/25 flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-5 h-5" />
                        Join Game
                    </button>
                </div>

                {showJoinMenu && (
                    <div className="mt-4 p-4 bg-stone-900/50 rounded-xl border border-stone-600/50">
                        <p className="text-stone-400 text-sm mb-2">Enter game code:</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                placeholder="Enter code..."
                                className="flex-1 px-3 py-2 bg-stone-800 border border-stone-600 rounded-lg text-amber-200 text-sm placeholder:text-stone-500"
                            />
                            <button
                                type="button"
                                onClick={handleJoinGame}
                                disabled={isJoining || !joinCode.trim()}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isJoining && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isJoining ? 'Joining...' : 'Join'}
                            </button>
                        </div>
                    </div>
                )}

                {gameCode && (
                    <div className="mt-4 p-4 bg-stone-900/50 rounded-xl border border-stone-600/50">
                        {isWaiting && (
                            <div className="flex items-center gap-2 mb-3 text-amber-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-medium">Waiting for opponent to join...</span>
                            </div>
                        )}
                       
                        <div className="flex items-center gap-2 mt-3">
                            <p className="text-stone-400 text-sm">Copy the code:</p>
                            <span className="px-3 py-1 bg-stone-800 border border-stone-600 rounded-lg text-amber-200 text-sm font-mono">
                                {gameCode}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                            >
                                {copiedCode ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleCancelGame}
                            className="w-full mt-4 py-2 px-4 bg-stone-700 hover:bg-stone-600 text-stone-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
