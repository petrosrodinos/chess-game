import type { PieceColor, PieceType } from '../../types'
import { PIECE_SYMBOLS } from '../../constants'

interface PromotionModalProps {
  color: PieceColor
  onSelect: (type: PieceType) => void
}

export const PromotionModal = ({ color, onSelect }: PromotionModalProps) => {
  const pieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight']

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-stone-800 rounded-2xl p-6 border-2 border-amber-500 shadow-2xl shadow-amber-500/20">
        <h3 className="text-xl font-bold text-amber-100 mb-4 text-center">
          Promote Pawn
        </h3>
        <div className="flex gap-3">
          {pieces.map(type => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                color === 'white'
                  ? 'bg-amber-100 hover:bg-amber-200'
                  : 'bg-emerald-700 hover:bg-emerald-600'
              }`}
            >
              <span
                className={`text-5xl ${
                  color === 'white' ? 'text-amber-50' : 'text-stone-900'
                }`}
                style={{
                  textShadow:
                    color === 'white'
                      ? '1px 1px 2px rgba(0,0,0,0.5)'
                      : '1px 1px 2px rgba(255,255,255,0.3)'
                }}
              >
                {PIECE_SYMBOLS[color][type]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
