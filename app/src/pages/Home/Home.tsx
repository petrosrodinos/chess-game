import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Users, Plus, LogIn } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { GameModes } from '../../constants'
import type { GameMode } from '../../constants'
import { environments } from '../../config/environments'

export const Home = () => {
    const navigate = useNavigate()
    const username = useAuthStore(state => state.username)
    const logout = useAuthStore(state => state.logout)

    const handleModeSelect = useCallback((mode: GameMode) => {
        navigate(`/game?mode=${mode}`)
    }, [navigate])

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
                            onClick={() => handleModeSelect(GameModes.OFFLINE_2P)}
                            className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-violet-500/25 flex items-center justify-center gap-3"
                        >
                            <Users className="w-6 h-6" />
                            2 Players Offline
                        </button>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => handleModeSelect(GameModes.CREATE)}
                                className="py-4 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create Game
                            </button>

                            <button
                                type="button"
                                onClick={() => handleModeSelect(GameModes.JOIN)}
                                className="py-4 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-rose-500/25 flex items-center justify-center gap-2"
                            >
                                <LogIn className="w-5 h-5" />
                                Join Game
                            </button>
                        </div>
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
