import type { Square as SquareType, Position } from '../../types'
import { Piece } from '../Piece'

interface SquareProps {
  square: SquareType
  position: Position
  isSelected: boolean
  isValidMove: boolean
  isLastMove: boolean
  isHint: boolean
  onClick: () => void
}

export const Square = ({
  square,
  position,
  isSelected,
  isValidMove,
  isLastMove,
  isHint,
  onClick
}: SquareProps) => {
  const isLight = (position.row + position.col) % 2 === 0

  const getSquareClasses = () => {
    const baseClasses = 'w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer relative transition-all duration-200'
    
    let colorClasses = isLight
      ? 'bg-amber-100 hover:bg-amber-200'
      : 'bg-emerald-700 hover:bg-emerald-600'

    if (isSelected) {
      colorClasses = 'bg-yellow-400 ring-4 ring-yellow-500 ring-inset'
    } else if (isHint) {
      colorClasses = isLight ? 'bg-cyan-300' : 'bg-cyan-600'
    } else if (isLastMove) {
      colorClasses = isLight ? 'bg-yellow-200' : 'bg-yellow-600'
    }

    return `${baseClasses} ${colorClasses}`
  }

  return (
    <div className={getSquareClasses()} onClick={onClick}>
      {square && <Piece piece={square} />}
      {isValidMove && (
        <div
          className={`absolute rounded-full ${
            square
              ? 'w-full h-full border-4 border-rose-500/60'
              : 'w-4 h-4 bg-stone-800/40'
          }`}
        />
      )}
      {isHint && (
        <div className="absolute inset-0 ring-4 ring-cyan-400 ring-inset animate-pulse" />
      )}
    </div>
  )
}
