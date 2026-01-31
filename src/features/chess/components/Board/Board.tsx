import type { Board as BoardType, Position, Move, HintMove, BoardSize } from '../../types'
import { generateFiles, generateRanks } from '../../constants'
import { Square } from '../Square'

interface BoardProps {
  board: BoardType
  boardSize: BoardSize
  selectedPosition: Position | null
  validMoves: Position[]
  validAttacks: Position[]
  lastMove: Move | null
  hintMove: HintMove | null
  onSquareClick: (pos: Position) => void
}

export const Board = ({
  board,
  boardSize,
  selectedPosition,
  validMoves,
  validAttacks,
  lastMove,
  hintMove,
  onSquareClick
}: BoardProps) => {
  const files = generateFiles(boardSize.cols)
  const ranks = generateRanks(boardSize.rows)

  const isSelected = (row: number, col: number) =>
    selectedPosition?.row === row && selectedPosition?.col === col

  const isValidMove = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col)

  const isValidAttack = (row: number, col: number) =>
    validAttacks.some(a => a.row === row && a.col === col)

  const isLastMove = (row: number, col: number) =>
    lastMove !== null &&
    ((lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col))

  const isHint = (row: number, col: number) =>
    hintMove !== null && !hintMove.isAttack &&
    ((hintMove.from.row === row && hintMove.from.col === col) ||
      (hintMove.to.row === row && hintMove.to.col === col))

  const isHintAttack = (row: number, col: number) =>
    hintMove !== null && hintMove.isAttack &&
    ((hintMove.from.row === row && hintMove.from.col === col) ||
      (hintMove.to.row === row && hintMove.to.col === col))

  return (
    <div className="flex flex-col items-center overflow-auto max-h-[80vh]">
      <div className="flex">
        <div className="w-5 md:w-6" />
        {files.map(file => (
          <div
            key={file}
            className="w-10 h-5 md:w-12 md:h-6 flex items-center justify-center text-amber-200 font-mono text-xs"
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
              className="w-5 h-10 md:w-6 md:h-12 flex items-center justify-center text-amber-200 font-mono text-xs"
            >
              {rank}
            </div>
          ))}
        </div>

        <div className="border-2 border-stone-800 rounded shadow-2xl">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  position={{ row: rowIndex, col: colIndex }}
                  isSelected={isSelected(rowIndex, colIndex)}
                  isValidMove={isValidMove(rowIndex, colIndex)}
                  isValidAttack={isValidAttack(rowIndex, colIndex)}
                  isLastMove={isLastMove(rowIndex, colIndex)}
                  isHint={isHint(rowIndex, colIndex)}
                  isHintAttack={isHintAttack(rowIndex, colIndex)}
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
              className="w-5 h-10 md:w-6 md:h-12 flex items-center justify-center text-amber-200 font-mono text-xs"
            >
              {rank}
            </div>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="w-5 md:w-6" />
        {files.map(file => (
          <div
            key={file}
            className="w-10 h-5 md:w-12 md:h-6 flex items-center justify-center text-amber-200 font-mono text-xs"
          >
            {file}
          </div>
        ))}
      </div>
    </div>
  )
}
