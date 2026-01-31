import type { PlayerColor } from '../../types'
import { PlayerColors } from '../../types'

interface GameInfoProps {
  currentPlayer: PlayerColor
  gameOver: boolean
  winner: PlayerColor | null
}

export const GameInfo = ({
  currentPlayer,
  gameOver,
  winner
}: GameInfoProps) => {
  const getStatusText = () => {
    if (gameOver && winner) {
      return `Victory! ${winner === PlayerColors.WHITE ? 'White' : 'Black'} wins!`
    }
    if (gameOver) {
      return 'Game Over!'
    }
    return `${currentPlayer === PlayerColors.WHITE ? 'White' : 'Black'}'s turn`
  }

  return (
    <div className="bg-stone-800/80 backdrop-blur rounded-xl p-4 border border-stone-700">
      <h2 className="text-lg font-semibold text-amber-100 mb-2">Game Status</h2>
      <div
        className={`text-center py-2 px-4 rounded-lg font-medium ${
          gameOver
            ? 'bg-rose-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}
      >
        {getStatusText()}
      </div>
    </div>
  )
}
