import { Trophy, Crown, Target, Award } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'

const mockUserPoints = 8250
const mockWins = 42
const mockLosses = 28
const mockWinRate = 60

export const UserStats = () => {
    const username = useAuthStore(state => state.username)
    return (
        <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-700/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-amber-400">{username}</h2>
                    <p className="text-stone-400 text-sm">Player Profile</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                        <Trophy className="w-6 h-6 text-amber-400" />
                        <span className="text-3xl font-bold text-amber-400">{mockUserPoints.toLocaleString()}</span>
                    </div>
                    <p className="text-stone-400 text-sm">Total Points</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-stone-900/50 rounded-xl p-4 text-center border border-stone-700/30">
                    <div className="flex items-center justify-center mb-2">
                        <Crown className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{mockWins}</p>
                    <p className="text-stone-400 text-xs">Wins</p>
                </div>
                <div className="bg-stone-900/50 rounded-xl p-4 text-center border border-stone-700/30">
                    <div className="flex items-center justify-center mb-2">
                        <Target className="w-5 h-5 text-rose-400" />
                    </div>
                    <p className="text-2xl font-bold text-rose-400">{mockLosses}</p>
                    <p className="text-stone-400 text-xs">Losses</p>
                </div>
                <div className="bg-stone-900/50 rounded-xl p-4 text-center border border-stone-700/30">
                    <div className="flex items-center justify-center mb-2">
                        <Award className="w-5 h-5 text-violet-400" />
                    </div>
                    <p className="text-2xl font-bold text-violet-400">{mockWinRate}%</p>
                    <p className="text-stone-400 text-xs">Win Rate</p>
                </div>
            </div>
        </div>
    )
}
