import { Clock } from 'lucide-react'

interface RecentGame {
    id: string
    opponent: string
    result: 'win' | 'loss' | 'draw'
    points: number
    date: string
    mode: string
}

const mockRecentGames: RecentGame[] = [
    { id: '1', opponent: 'ChessMaster', result: 'win', points: 450, date: '2h ago', mode: 'Online' },
    { id: '2', opponent: 'StrategyPro', result: 'loss', points: 0, date: '5h ago', mode: 'Online' },
    { id: '3', opponent: 'GameWarrior', result: 'win', points: 380, date: '1d ago', mode: 'Online' },
    { id: '4', opponent: 'AI Medium', result: 'win', points: 250, date: '2d ago', mode: 'Single' },
    { id: '5', opponent: 'TacticalGenius', result: 'draw', points: 100, date: '3d ago', mode: 'Online' },
]

export const RecentGames = () => {
    return (
        <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-700/50">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold text-amber-200">Recent Games</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {mockRecentGames.map((game) => (
                    <div
                        key={game.id}
                        className="bg-stone-900/50 rounded-lg p-4 border border-stone-700/30 hover:border-stone-600/50 transition-colors"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    game.result === 'win' ? 'bg-emerald-400' :
                                    game.result === 'loss' ? 'bg-rose-400' : 'bg-amber-400'
                                }`} />
                                <p className={`font-bold text-sm ${
                                    game.result === 'win' ? 'text-emerald-400' :
                                    game.result === 'loss' ? 'text-rose-400' : 'text-amber-400'
                                }`}>
                                    {game.result.toUpperCase()}
                                </p>
                            </div>
                            <div>
                                <p className="text-stone-200 font-medium text-sm">{game.opponent}</p>
                                <p className="text-stone-500 text-xs">{game.mode} • {game.date}</p>
                            </div>
                            <p className="text-amber-400 text-sm font-bold">+{game.points} pts</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
