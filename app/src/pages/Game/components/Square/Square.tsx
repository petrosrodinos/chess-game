import type { CellContent, Position, PlayerColor } from '../../types'
import { isPiece, isObstacle, PlayerColors } from '../../types'
import { OBSTACLE_SYMBOLS, OBSTACLE_NAMES } from '../../constants'

interface SquareProps {
  cell: CellContent
  position: Position
  isSelected: boolean
  isValidMove: boolean
  isValidAttack: boolean
  isValidSwap: boolean
  isLastMove: boolean
  isHint: boolean
  isHintAttack: boolean
  hasNarc?: PlayerColor | null
  onClick: () => void
}

export const Square = ({
  cell,
  position,
  isSelected,
  isValidMove,
  isValidAttack,
  isValidSwap,
  isLastMove,
  isHint,
  isHintAttack,
  hasNarc = null,
  onClick
}: SquareProps) => {
  const isLight = (position.row + position.col) % 2 === 0

  const getSquareClasses = () => {
    const baseClasses = 'w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer relative transition-all duration-200'
    
    if (cell && isObstacle(cell)) {
      return `${baseClasses} bg-stone-600 cursor-default`
    }
    
    let colorClasses = isLight
      ? 'bg-amber-100 hover:bg-amber-200'
      : 'bg-emerald-700 hover:bg-emerald-600'

    if (isSelected) {
      colorClasses = 'bg-yellow-400 ring-4 ring-yellow-500 ring-inset'
    } else if (isHintAttack) {
      colorClasses = isLight ? 'bg-rose-300' : 'bg-rose-600'
    } else if (isHint) {
      colorClasses = isLight ? 'bg-cyan-300' : 'bg-cyan-600'
    } else if (isLastMove) {
      colorClasses = isLight ? 'bg-yellow-200' : 'bg-yellow-600'
    } else if (isValidSwap) {
      colorClasses = isLight ? 'bg-violet-200 hover:bg-violet-300' : 'bg-violet-700 hover:bg-violet-600'
    } else if (isValidAttack) {
      colorClasses = isLight ? 'bg-rose-200 hover:bg-rose-300' : 'bg-rose-700 hover:bg-rose-600'
    }

    return `${baseClasses} ${colorClasses}`
  }

  return (
    <div className={getSquareClasses()} onClick={onClick}>
      {cell && isObstacle(cell) && (
        <span 
          className="text-2xl md:text-3xl select-none"
          title={OBSTACLE_NAMES[cell.type]}
        >
          {OBSTACLE_SYMBOLS[cell.type]}
        </span>
      )}
      {isValidMove && (!cell || !isPiece(cell)) && (
        <div className="absolute w-3 h-3 bg-stone-800/40 rounded-full" />
      )}
      {isValidAttack && cell && isPiece(cell) && (
        <div className="absolute w-full h-full border-4 border-rose-500 rounded-sm animate-pulse" />
      )}
      {isValidSwap && cell && isPiece(cell) && (
        <div className="absolute w-full h-full border-4 border-violet-500 rounded-sm animate-pulse" />
      )}
      {(isHint || isHintAttack) && (
        <div className={`absolute inset-0 ring-4 ${isHintAttack ? 'ring-rose-400' : 'ring-cyan-400'} ring-inset animate-pulse`} />
      )}
      {hasNarc && !cell && (
        <div 
          className={`absolute w-2 h-2 rounded-full ${
            hasNarc === PlayerColors.WHITE 
              ? 'bg-amber-200/60' 
              : 'bg-stone-800/60'
          }`}
          title="Narc trap"
        />
      )}
    </div>
  )
}
