import { useState } from "react";
import { Trophy, Crown, Target, Award } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { getStatsData, getPointsForLevel } from "../../../lib/level";
import { MAX_LEVEL } from "../../../constants/game";
import { Modal } from "../../../components/Modal";

const mockUserPoints = 826;
const mockWins = 42;
const mockLosses = 28;
const mockWinRate = 60;
const mockUserRank = 6;
const mockLevel = 8;

const { progress, tier, pointsToNextLevel } = getStatsData(mockUserPoints, mockLevel);

const LEVELS = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);

export const UserStats = () => {
  const username = useAuthStore((state) => state.username);
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  return (
    <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-stone-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setLevelModalOpen(true)}
            className="relative pb-5 cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg ring-2 ${tier.ring}`}>
              <span className="text-2xl font-black text-white drop-shadow-sm">{mockLevel}</span>
            </div>
          </button>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-amber-400">{username}</h2>
            <div className="w-24 h-1.5 bg-stone-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${tier.gradient} transition-all duration-500`} style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="text-stone-500 text-xs mt-0.5">
              {pointsToNextLevel} to level {mockLevel + 1}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900/50 rounded-lg border border-stone-700/30">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm">Rank #{mockUserRank}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span className="text-3xl font-bold text-amber-400">{mockUserPoints.toLocaleString()}</span>
          </div>
          <p className="text-stone-400 text-sm">Total SEL</p>
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

      <Modal isOpen={levelModalOpen} onClose={() => setLevelModalOpen(false)} title="Levels">
        <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
          {LEVELS.map((level) => {
            const points = getPointsForLevel(level);
            const isUserLevel = level === mockLevel;
            return (
              <li
                key={level}
                className={`flex items-center justify-between px-3 py-2 rounded-lg ${isUserLevel ? "bg-amber-500/20 border border-amber-400/50" : "bg-stone-900/50 border border-transparent"}`}
              >
                <span className={isUserLevel ? "font-bold text-amber-400" : "text-stone-300"}>
                  Level {level}{isUserLevel ? " (you)" : ""}
                </span>
                <span className={isUserLevel ? "font-semibold text-amber-400" : "text-stone-400"}>
                  {points.toLocaleString()} pts
                </span>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
};
