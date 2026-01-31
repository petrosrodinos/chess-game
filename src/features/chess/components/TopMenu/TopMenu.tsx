import type { BoardSizeKey } from '../../types'
import { BotDifficulties, BoardSizeKeys, PlayerColors } from '../../types'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'

export const TopMenu = () => {
  const {
    gameState,
    boardSizeKey,
    botEnabled,
    botThinking,
    botDifficulty,
    resetGame,
    toggleBot,
    setDifficulty
  } = useGameStore()

  const { is3D, toggle3D, helpEnabled, toggleHelp, devMode, toggleDevMode, closeTopMenu } = useUIStore()

  const handleBoardSizeChange = (sizeKey: BoardSizeKey) => {
    resetGame(sizeKey)
    closeTopMenu()
  }

  const getStatusText = () => {
    if (gameState.gameOver && gameState.winner) {
      return `${gameState.winner === PlayerColors.WHITE ? 'White' : 'Black'} Wins!`
    }
    if (gameState.gameOver) {
      return 'Game Over'
    }
    return `${gameState.currentPlayer === PlayerColors.WHITE ? 'White' : 'Black'}'s Turn`
  }

  return (
    <div className="bg-stone-800/80 backdrop-blur rounded-xl p-3 border border-stone-700">
      <div className="flex flex-wrap items-end gap-4 justify-center">
        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
          gameState.gameOver
            ? 'bg-rose-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}>
          {getStatusText()}
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-amber-200">Size</span>
          <select
            value={boardSizeKey}
            onChange={(e) => handleBoardSizeChange(e.target.value as BoardSizeKey)}
            className="bg-stone-700 text-amber-100 text-xs rounded px-2 py-1.5 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value={BoardSizeKeys.SMALL}>Small (12×12)</option>
            <option value={BoardSizeKeys.MEDIUM}>Medium (12×16)</option>
            <option value={BoardSizeKeys.LARGE}>Large (12×20)</option>
          </select>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-amber-200">View</span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle3D}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${
                is3D ? 'bg-violet-600' : 'bg-stone-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                  is3D ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs text-stone-300">{is3D ? '3D' : '2D'}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-amber-200">Help</span>
          <button
            onClick={toggleHelp}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${
              helpEnabled ? 'bg-blue-600' : 'bg-stone-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                helpEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-amber-200">Bot</span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBot}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${
                botEnabled ? 'bg-emerald-600' : 'bg-stone-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                  botEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            {botEnabled && (
              <select
                value={botDifficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof botDifficulty)}
                className="bg-stone-700 text-amber-100 text-xs rounded px-2 py-1 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value={BotDifficulties.EASY}>Easy</option>
                <option value={BotDifficulties.MEDIUM}>Medium</option>
                <option value={BotDifficulties.HARD}>Hard</option>
              </select>
            )}
            {botThinking && (
              <span className="text-xs text-stone-400">Thinking...</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-orange-400">Dev</span>
          <button
            onClick={toggleDevMode}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${
              devMode ? 'bg-orange-600' : 'bg-stone-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                devMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
