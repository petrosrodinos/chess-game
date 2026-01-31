import { useGameStore } from '../../../../store/gameStore'

export const BottomMenu = () => {
  const { canUndo, canHint, undoMove, showHint, resetGame } = useGameStore()
  return (
    <div className="bg-stone-800/80 backdrop-blur rounded-xl p-4 border border-stone-700 mt-4">
      <div className="flex gap-3 justify-center">
        <button
          onClick={showHint}
          disabled={!canHint()}
          className={`py-2 px-6 font-medium rounded-lg transition-all duration-200 ${
            canHint()
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
              : 'bg-stone-700 text-stone-500 cursor-not-allowed'
          }`}
        >
          Hint
        </button>
        <button
          onClick={undoMove}
          disabled={!canUndo()}
          className={`py-2 px-6 font-medium rounded-lg transition-all duration-200 ${
            canUndo()
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-stone-700 text-stone-500 cursor-not-allowed'
          }`}
        >
          Undo
        </button>
        <button
          onClick={() => resetGame()}
          className="py-2 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-rose-500/25"
        >
          New Game
        </button>
      </div>
    </div>
  )
}
