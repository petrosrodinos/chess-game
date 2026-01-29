import type { Board as BoardType, Position, Move } from '../../types'
import { Square } from '../Square/Square'

interface BoardProps {
  board: BoardType
  selectedPosition: Position | null
  validMoves: Position[]
  lastMove: Move | null
  hintMove: { from: Position; to: Position } | null
  onSquareClick: (pos: Position) => void
}

export const Board = ({
  board,
  selectedPosition,
  validMoves,
  lastMove,
  hintMove,
  onSquareClick
}: BoardProps) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']

  const isSelected = (row: number, col: number) =>
    selectedPosition?.row === row && selectedPosition?.col === col

  const isValidMove = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col)

  const isLastMove = (row: number, col: number) =>
    lastMove !== null &&
    ((lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col))

  const isHint = (row: number, col: number) =>
    hintMove !== null &&
    ((hintMove.from.row === row && hintMove.from.col === col) ||
      (hintMove.to.row === row && hintMove.to.col === col))

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <div className="w-6 md:w-8" />
        {files.map(file => (
          <div
            key={file}
            className="w-12 h-6 md:w-16 md:h-8 flex items-center justify-center text-amber-200 font-mono text-sm"
          >
            {file}
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="flex flex-col">
          {ranks.map(rank => (
            <div
              key={rank}
              className="w-6 h-12 md:w-8 md:h-16 flex items-center justify-center text-amber-200 font-mono text-sm"
            >
              {rank}
            </div>
          ))}
        </div>

        <div className="border-4 border-stone-800 rounded shadow-2xl">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((square, colIndex) => (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  square={square}
                  position={{ row: rowIndex, col: colIndex }}
                  isSelected={isSelected(rowIndex, colIndex)}
                  isValidMove={isValidMove(rowIndex, colIndex)}
                  isLastMove={isLastMove(rowIndex, colIndex)}
                  isHint={isHint(rowIndex, colIndex)}
                  onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {ranks.map(rank => (
            <div
              key={rank}
              className="w-6 h-12 md:w-8 md:h-16 flex items-center justify-center text-amber-200 font-mono text-sm"
            >
              {rank}
            </div>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="w-6 md:w-8" />
        {files.map(file => (
          <div
            key={file}
            className="w-12 h-6 md:w-16 md:h-8 flex items-center justify-center text-amber-200 font-mono text-sm"
          >
            {file}
          </div>
        ))}
      </div>
    </div>
  )
}
