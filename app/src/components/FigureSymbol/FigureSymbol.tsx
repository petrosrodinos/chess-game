import type { PieceType } from '../../pages/Game/types'
import { PlayerColors } from '../../pages/Game/types'
import { PIECE_SYMBOLS } from '../../pages/Game/constants'

type FigureSymbolProps = {
  pieceType: PieceType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-5xl'
} as const

export const FigureSymbol = ({ pieceType, size = 'md', className = '' }: FigureSymbolProps) => {
  const symbol = PIECE_SYMBOLS[PlayerColors.WHITE][pieceType]
  return (
    <span
      className={`inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      {symbol}
    </span>
  )
}
