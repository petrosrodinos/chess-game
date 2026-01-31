import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Users, Plus, LogIn, Copy, Check, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { GameModes, SocketEvents } from '../../constants'
import type { GameMode } from '../../constants'
import { environments } from '../../config/environments'
import { useSocket } from '../../hooks'
import { toast } from 'react-toastify'

interface GameSession {
    code: string
    players: Array<{ id: string; name: string }>
    status: string
}

export const Home = () => {
    const navigate = useNavigate()
    const username = useAuthStore(state => state.username)
    const logout = useAuthStore(state => state.logout)
    const [gameCode, setGameCode] = useState<string | null>(null)
    const [copiedLink, setCopiedLink] = useState(false)
    const [copiedCode, setCopiedCode] = useState(false)
    const [showJoinMenu, setShowJoinMenu] = useState(false)
    const [joinCode, setJoinCode] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [isWaiting, setIsWaiting] = useState(false)
    const { emit, on, off } = useSocket()

    const gameLink = gameCode ? `${environments.APP_URL}/game?code=${gameCode}` : null

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
        setIsCreating(true)
        emit(SocketEvents.CREATE_GAME, { playerName: username || '' })
    }, [emit, username])

    const handleToggleJoinMenu = useCallback(() => {
        setShowJoinMenu(prev => !prev)
        setGameCode(null)
        setIsWaiting(false)
    }, [])

    const handleJoinGame = useCallback(() => {
        if (!joinCode.trim()) return
        setIsJoining(true)
        emit(SocketEvents.JOIN_GAME, { code: joinCode.trim(), playerName: username || '' })
    }, [emit, joinCode, username])

    const handleCopyLink = useCallback(async () => {
        if (!gameLink) return
        await navigator.clipboard.writeText(gameLink)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }, [gameLink])

    const handleCopyCode = useCallback(async () => {
        if (!gameCode) return
        await navigator.clipboard.writeText(gameCode)
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
    }, [gameCode])

    const handleLogout = useCallback(() => {
        logout()
        navigate('/login')
    }, [logout, navigate])

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-stone-700/50">
                    <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
                        {environments.APP_NAME}
                    </h1>
                    <p className="text-stone-400 text-center mb-8">
                        Welcome, <span className="text-amber-400 font-medium">{username}</span>
                    </p>

                    <div className="space-y-4">
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

                        {gameLink && gameCode && (
                            <div className="mt-4 p-4 bg-stone-900/50 rounded-xl border border-stone-600/50">
                                {isWaiting && (
                                    <div className="flex items-center gap-2 mb-3 text-amber-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-medium">Waiting for opponent to join...</span>
                                    </div>
                                )}
                                <p className="text-stone-400 text-sm mb-2">Share this link with a friend:</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={gameLink}
                                        className="flex-1 px-3 py-2 bg-stone-800 border border-stone-600 rounded-lg text-amber-200 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                                    >
                                        {copiedLink ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <p className="text-stone-400 text-sm">or copy the code:</p>
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
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-700/50">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full py-2 px-4 text-stone-400 hover:text-stone-200 font-medium transition-colors text-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
