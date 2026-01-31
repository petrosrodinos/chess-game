import type { PieceColor, Piece, Move, BotDifficulty, BoardSizeKey } from '../../types'
import { BOARD_SIZES, PieceColors, PieceTypes, BotDifficulties, BoardSizeKeys } from '../../types'
import { generateFiles, PIECE_SYMBOLS } from '../../constants'

interface GameInfoProps {
  currentPlayer: PieceColor
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  capturedPieces: { white: Piece[]; black: Piece[] }
  moveHistory: Move[]
  botEnabled: boolean
  botThinking: boolean
  botDifficulty: BotDifficulty
  canUndo: boolean
  canHint: boolean
  is3D: boolean
  boardSizeKey: BoardSizeKey
  onReset: () => void
  onToggleBot: () => void
  onDifficultyChange: (difficulty: BotDifficulty) => void
  onUndo: () => void
  onHint: () => void
  onToggle3D: () => void
  onBoardSizeChange: (sizeKey: BoardSizeKey) => void
}

export const GameInfo = ({
  currentPlayer,
  isCheck,
  isCheckmate,
  isStalemate,
  capturedPieces,
  moveHistory,
  botEnabled,
  botThinking,
  botDifficulty,
  canUndo,
  canHint,
  is3D,
  boardSizeKey,
  onReset,
  onToggleBot,
  onDifficultyChange,
  onUndo,
  onHint,
  onToggle3D,
  onBoardSizeChange
}: GameInfoProps) => {
  const boardSize = BOARD_SIZES[boardSizeKey]
  const files = generateFiles(boardSize.cols)

  const formatMove = (move: Move, index: number) => {
    const from = `${files[move.from.col]}${boardSize.rows - move.from.row}`
    const to = `${files[move.to.col]}${boardSize.rows - move.to.row}`
    const piece = move.piece.type === PieceTypes.PAWN ? '' : move.piece.type[0].toUpperCase()
    const capture = move.captured ? 'x' : ''
    const check = index === moveHistory.length - 1 && isCheck ? '+' : ''
    const mate = index === moveHistory.length - 1 && isCheckmate ? '#' : ''
    
    return `${piece}${from}${capture}${to}${check || mate}`
  }

  const getStatusText = () => {
    if (isCheckmate) return `Checkmate! ${currentPlayer === PieceColors.WHITE ? 'Black' : 'White'} wins!`
    if (isStalemate) return 'Stalemate! Game is a draw.'
    if (isCheck) return `${currentPlayer === PieceColors.WHITE ? 'White' : 'Black'} is in check!`
    return `${currentPlayer === PieceColors.WHITE ? 'White' : 'Black'}'s turn`
  }

  const pieceOrder = [PieceTypes.QUEEN, PieceTypes.ROOK, PieceTypes.BISHOP, PieceTypes.KNIGHT, PieceTypes.PAWN] as const

  const sortedCaptured = (pieces: Piece[]) => {
    return [...pieces].sort((a, b) => 
      pieceOrder.indexOf(a.type as typeof pieceOrder[number]) - pieceOrder.indexOf(b.type as typeof pieceOrder[number])
    )
  }

  const boardSizeOptions: BoardSizeKey[] = [BoardSizeKeys.SMALL, BoardSizeKeys.MEDIUM, BoardSizeKeys.LARGE]

  return (
    <div className="bg-stone-800/80 backdrop-blur rounded-xl p-4 md:p-6 w-full max-w-xs border border-stone-700">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-amber-100 mb-2">Game Status</h2>
        <div
          className={`text-center py-2 px-4 rounded-lg font-medium ${
            isCheckmate
              ? 'bg-rose-600 text-white'
              : isStalemate
              ? 'bg-amber-600 text-white'
              : isCheck
              ? 'bg-orange-500 text-white animate-pulse'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {getStatusText()}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-amber-200 mb-2">Board Size</h3>
        <div className="flex gap-2">
          {boardSizeOptions.map((sizeKey) => (
            <button
              key={sizeKey}
              onClick={() => onBoardSizeChange(sizeKey)}
              className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                boardSizeKey === sizeKey
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
              }`}
            >
              {sizeKey}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-amber-200 mb-2">Current Turn</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full border-2 ${
              currentPlayer === PieceColors.WHITE
                ? 'bg-amber-50 border-amber-200'
                : 'bg-stone-900 border-stone-600'
            }`}
          />
          <span className="text-amber-100 capitalize">{currentPlayer}</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-amber-200 mb-2">Captured Pieces</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-1 min-h-[28px]">
            <span className="text-xs text-stone-400 w-12">White:</span>
            <div className="flex flex-wrap gap-0.5">
              {sortedCaptured(capturedPieces.white).map((piece, i) => (
                <span key={i} className="text-lg text-amber-50">
                  {PIECE_SYMBOLS[piece.color][piece.type]}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 min-h-[28px]">
            <span className="text-xs text-stone-400 w-12">Black:</span>
            <div className="flex flex-wrap gap-0.5">
              {sortedCaptured(capturedPieces.black).map((piece, i) => (
                <span key={i} className="text-lg text-stone-900">
                  {PIECE_SYMBOLS[piece.color][piece.type]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-amber-200 mb-2">
          Move History ({Math.ceil(moveHistory.length / 2)} moves)
        </h3>
        <div className="bg-stone-900/50 rounded-lg p-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-600">
          {moveHistory.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-2">No moves yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm font-mono">
              {moveHistory.map((move, index) => (
                <div
                  key={index}
                  className={`px-2 py-0.5 rounded ${
                    index === moveHistory.length - 1
                      ? 'bg-amber-600/30 text-amber-200'
                      : 'text-stone-300'
                  }`}
                >
                  {index % 2 === 0 && (
                    <span className="text-stone-500 mr-1">{Math.floor(index / 2) + 1}.</span>
                  )}
                  {formatMove(move, index)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-amber-200 mb-2">View Mode</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-stone-300 text-sm">{is3D ? '3D Board' : '2D Board'}</span>
          <button
            onClick={onToggle3D}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              is3D ? 'bg-violet-600' : 'bg-stone-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                is3D ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-amber-200 mb-2">Play vs Bot</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-stone-300 text-sm">
            {botEnabled ? (botThinking ? 'Bot thinking...' : 'Bot enabled') : 'Two players'}
          </span>
          <button
            onClick={onToggleBot}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              botEnabled ? 'bg-emerald-600' : 'bg-stone-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                botEnabled ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {botEnabled && (
          <div className="flex items-center justify-between">
            <span className="text-stone-300 text-sm">Difficulty</span>
            <select
              value={botDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value as BotDifficulty)}
              className="bg-stone-700 text-amber-100 text-sm rounded-lg px-3 py-1.5 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value={BotDifficulties.EASY}>Easy</option>
              <option value={BotDifficulties.MEDIUM}>Medium</option>
              <option value={BotDifficulties.HARD}>Hard</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-2">
        <button
          onClick={onHint}
          disabled={!canHint}
          className={`flex-1 py-2 px-4 font-medium rounded-lg transition-all duration-200 ${
            canHint
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
              : 'bg-stone-700 text-stone-500 cursor-not-allowed'
          }`}
        >
          Hint
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 py-2 px-4 font-medium rounded-lg transition-all duration-200 ${
            canUndo
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-stone-700 text-stone-500 cursor-not-allowed'
          }`}
        >
          Undo
        </button>
      </div>
      <button
        onClick={onReset}
        className="w-full py-2 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-rose-500/25"
      >
        New Game
      </button>
    </div>
  )
}
