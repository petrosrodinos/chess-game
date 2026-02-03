import { Modal } from '../../../../components/Modal/Modal'
import { Piece } from '../Piece/Piece'
import type { Piece as PieceType } from '../../types'
import { PIECE_NAMES } from '../../constants'

interface MysteryBoxReviveModalProps {
  isOpen: boolean
  onClose: () => void
  pieces: PieceType[]
  onSelectPiece: (piece: PieceType) => void
  selectedPieceId: string | null
}

export const MysteryBoxReviveModal = ({
  isOpen,
  onClose,
  pieces,
  onSelectPiece,
  selectedPieceId
}: MysteryBoxReviveModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎁 Revive Captured Enemy Piece">
      <div className="space-y-4">
        <div className="text-stone-300 text-sm bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
          <p className="font-semibold text-amber-200 mb-2">📖 Instructions:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Select an <span className="text-amber-200 font-semibold">enemy piece</span> you have captured</li>
            <li>The piece will become <span className="text-green-400 font-semibold">yours</span> after revival</li>
            <li>Click the piece below, then click an <span className="text-blue-400 font-semibold">empty tile</span> on the board</li>
          </ul>
        </div>

        {pieces.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <p>No captured pieces available</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {pieces.map((piece, index) => (
              <button
                key={`${piece.id}-${index}`}
                onClick={() => onSelectPiece(piece)}
                className={`
                  flex flex-col items-center justify-center 
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${
                    selectedPieceId === piece.id
                      ? 'border-green-500 bg-green-900/30 ring-2 ring-green-500 scale-105'
                      : 'border-stone-600 bg-stone-700/50 hover:border-amber-500 hover:bg-stone-700 hover:scale-105'
                  }
                `}
                title={PIECE_NAMES[piece.type]}
              >
                <div className="transform scale-125">
                  <Piece piece={piece} />
                </div>
                <span className="text-xs text-stone-400 mt-2 font-medium">
                  {PIECE_NAMES[piece.type]}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
