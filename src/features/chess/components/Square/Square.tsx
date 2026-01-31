import type { CellContent, Position } from '../../types'
import { isPiece, isObstacle } from '../../types'
import { OBSTACLE_SYMBOLS } from '../../constants'
import { Piece } from '../Piece'

interface SquareProps {
  cell: CellContent
  position: Position
  isSelected: boolean
  isValidMove: boolean
  isLastMove: boolean
  isHint: boolean
  onClick: () => void
}

export const Square = ({
  cell,
  position,
  isSelected,
  isValidMove,
  isLastMove,
  isHint,
  onClick
}: SquareProps) => {
  const isLight = (position.row + position.col) % 2 === 0

  const getSquareClasses = () => {
    const baseClasses = 'w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer relative transition-all duration-200'
    
    if (cell && isObstacle(cell)) {
      return `${baseClasses} bg-stone-600 cursor-not-allowed`
    }
    
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
      {cell && isPiece(cell) && <Piece piece={cell} />}
      {cell && isObstacle(cell) && (
        <span className="text-2xl md:text-3xl select-none">
          {OBSTACLE_SYMBOLS[cell.type]}
        </span>
      )}
      {isValidMove && !cell && (
        <div className="absolute w-3 h-3 bg-stone-800/40 rounded-full" />
      )}
      {isValidMove && cell && isPiece(cell) && (
        <div className="absolute w-full h-full border-4 border-rose-500/60 rounded-full" />
      )}
      {isHint && (
        <div className="absolute inset-0 ring-4 ring-cyan-400 ring-inset animate-pulse" />
      )}
    </div>
  )
}
