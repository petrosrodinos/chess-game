import { Medal } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'

interface LeaderboardEntry {
    id: string
    username: string
    points: number
    rank: number
}

const mockLeaderboard: LeaderboardEntry[] = [
    { id: '1', username: 'DragonKing', points: 12450, rank: 1 },
    { id: '2', username: 'ChessMaster', points: 11200, rank: 2 },
    { id: '3', username: 'StrategyPro', points: 10800, rank: 3 },
    { id: '4', username: 'GameWarrior', points: 9500, rank: 4 },
    { id: '5', username: 'TacticalGenius', points: 8900, rank: 5 },
]

export const Leaderboard = () => {
    const username = useAuthStore(state => state.username)
    return (
        <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-700/50 h-full">
            <div className="flex items-center gap-2 mb-4">
                <Medal className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold text-amber-200">Leaderboard</h3>
            </div>
            <div className="space-y-3">
                {mockLeaderboard.map((entry) => (
                    <div
                        key={entry.id}
                        className={`rounded-lg p-3 border transition-colors ${
                            entry.username === username
                                ? 'bg-amber-900/30 border-amber-600/50'
                                : 'bg-stone-900/50 border-stone-700/30 hover:border-stone-600/50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                entry.rank === 1 ? 'bg-amber-500 text-stone-900' :
                                entry.rank === 2 ? 'bg-stone-400 text-stone-900' :
                                entry.rank === 3 ? 'bg-orange-600 text-white' :
                                'bg-stone-700 text-stone-300'
                            }`}>
                                #{entry.rank}
                            </div>
                            <div className="flex-1">
                                <p className="text-stone-200 font-medium text-sm">{entry.username}</p>
                                <p className="text-amber-400 text-xs font-bold">{entry.points.toLocaleString()} pts</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
