import { Modal } from '../../../../components/Modal/Modal'
import { Piece } from '../Piece/Piece'
import type { Piece as PieceType, Position } from '../../types'
import { PIECE_NAMES } from '../../constants'

interface ZombieReviveModalProps {
  isOpen: boolean
  onClose: () => void
  pieces: PieceType[]
  onSelectPiece: (piece: PieceType) => void
  selectedPieceId: string | null
  selectedTarget: Position | null
  onConfirm: () => void
  canConfirm: boolean
  statusMessage: string | null
}

export const ZombieReviveModal = ({
  isOpen,
  onClose,
  pieces,
  onSelectPiece,
  selectedPieceId,
  selectedTarget,
  onConfirm,
  canConfirm,
  statusMessage
}: ZombieReviveModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧟 Necromancer Revival">
      <div className="space-y-4">
        <div className="text-stone-300 text-sm bg-violet-900/20 border border-violet-700/30 rounded-lg p-3">
          <p className="font-semibold text-violet-200 mb-2">Instructions</p>
          <p className="text-violet-100">
            Pick one of your captured pieces to revive as a Zombie (only Ram-Tower, Chariot, Bomber, or Paladin), then confirm. It will be placed on its original tile, or the nearest empty tile if occupied.
          </p>
        </div>

        {statusMessage && (
          <div className="text-xs text-amber-200 bg-amber-900/20 border border-amber-700/30 rounded-lg p-2">
            {statusMessage}
          </div>
        )}

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
                      ? 'border-violet-500 bg-violet-900/30 ring-2 ring-violet-500 scale-105'
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

        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>
            {selectedTarget ? `Placement: ${selectedTarget.row + 1}, ${selectedTarget.col + 1}` : 'No valid placement available'}
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${
              canConfirm ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-stone-700 text-stone-400 cursor-not-allowed'
            }`}
          >
            Revive Zombie
          </button>
        </div>
      </div>
    </Modal>
  )
}
