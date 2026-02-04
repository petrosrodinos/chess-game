import { Navigation, UserStats, Leaderboard, RecentGames, PlayOptions } from './components'

export const Home = () => {

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                <UserStats />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <PlayOptions />
                    </div>
                    <div>
                        <Leaderboard />
                    </div>
                </div>

                <RecentGames />
            </div>
        </div>
    )
}
