import type { Piece, Move } from '../../types'
import { BOARD_SIZES, PieceTypes } from '../../types'
import { generateFiles, PIECE_SYMBOLS, PIECE_RULES } from '../../constants'
import { useGameStore } from '../../../../store/gameStore'

export const RightSidebar = () => {
  const { gameState, boardSizeKey } = useGameStore()
  const { capturedPieces, moveHistory } = gameState
  const boardSize = BOARD_SIZES[boardSizeKey as keyof typeof BOARD_SIZES]
  const files = generateFiles(boardSize.cols)

  const formatMove = (move: Move, _index: number) => {
    const from = `${files[move.from.col]}${boardSize.rows - move.from.row}`
    const to = `${files[move.to.col]}${boardSize.rows - move.to.row}`
    const piece = move.piece.type === PieceTypes.HOPLITE ? '' : move.piece.type[0].toUpperCase()
    const action = move.isAttack ? '⚔' : (move.captured ? 'x' : '-')
    
    return `${piece}${from}${action}${to}`
  }

  const pieceOrder = [
    PieceTypes.MONARCH,
    PieceTypes.DUCHESS,
    PieceTypes.RAM_TOWER,
    PieceTypes.CHARIOT,
    PieceTypes.PALADIN,
    PieceTypes.NECROMANCER,
    PieceTypes.WARLOCK,
    PieceTypes.BOMBER,
    PieceTypes.HOPLITE
  ] as const

  const sortedCaptured = (pieces: Piece[]) => {
    return [...pieces].sort((a, b) => {
      const aIndex = pieceOrder.indexOf(a.type as typeof pieceOrder[number])
      const bIndex = pieceOrder.indexOf(b.type as typeof pieceOrder[number])
      return aIndex - bIndex
    })
  }

  const getTotalPoints = (pieces: Piece[]) => {
    return pieces.reduce((total, piece) => {
      const rules = PIECE_RULES[piece.type]
      return total + (piece.isZombie && rules.zombiePoints ? rules.zombiePoints : rules.points)
    }, 0)
  }

  return (
    <div className="bg-stone-800/80 backdrop-blur rounded-xl p-4 border border-stone-700 w-full max-w-xs lg:max-w-xs max-w-full">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-amber-200 mb-2">Captured Pieces</h3>
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-stone-400">White ({getTotalPoints(capturedPieces.white)}pts):</span>
            </div>
            <div className="flex flex-wrap gap-0.5 min-h-[28px]">
              {sortedCaptured(capturedPieces.white).map((piece, i) => (
                <span key={i} className="text-lg">
                  {PIECE_SYMBOLS[piece.color][piece.type]}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-stone-400">Black ({getTotalPoints(capturedPieces.black)}pts):</span>
            </div>
            <div className="flex flex-wrap gap-0.5 min-h-[28px]">
              {sortedCaptured(capturedPieces.black).map((piece, i) => (
                <span key={i} className="text-lg">
                  {PIECE_SYMBOLS[piece.color][piece.type]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-amber-200 mb-2">
          Action History ({moveHistory.length})
        </h3>
        <div className="bg-stone-900/50 rounded-lg p-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-600">
          {moveHistory.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-2">No actions yet</p>
          ) : (
            <div className="space-y-1">
              {moveHistory.map((move, index) => (
                <div
                  key={index}
                  className={`px-2 py-1 rounded text-sm font-mono ${
                    index === moveHistory.length - 1
                      ? 'bg-amber-600/30 text-amber-200'
                      : 'text-stone-300'
                  }`}
                >
                  <span className="text-stone-500 mr-1">{index + 1}.</span>
                  {formatMove(move, index)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
