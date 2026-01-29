import type { Piece as PieceType } from '../../types'
import { PIECE_SYMBOLS } from '../../constants'

interface PieceProps {
  piece: PieceType
}

export const Piece = ({ piece }: PieceProps) => {
  return (
    <span
      className={`text-5xl md:text-6xl select-none drop-shadow-lg transition-transform duration-150 hover:scale-110 ${
        piece.color === 'white' ? 'text-amber-50' : 'text-stone-900'
      }`}
      style={{ textShadow: piece.color === 'white' ? '1px 1px 2px rgba(0,0,0,0.5)' : '1px 1px 2px rgba(255,255,255,0.3)' }}
    >
      {PIECE_SYMBOLS[piece.color][piece.type]}
    </span>
  )
}
