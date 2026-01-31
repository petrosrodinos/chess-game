import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { generateFiles, generateRanks } from '../../constants'
import { Square } from '../Square'
import { AnimatedPiece } from '../Piece/AnimatedPiece'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'
import { getValidMoves, getValidAttacks } from '../../utils'
import { isPiece } from '../../types'

export const Board = () => {
  const { gameState, hintMove, selectSquare, devModeSelectSquare, devModeSelected } = useGameStore()
  const { board, boardSize, selectedPosition, validMoves, validAttacks, lastMove } = gameState
  const { helpEnabled, devMode } = useUIStore()
  
  // Help mode: show moves for any clicked piece
  const [helpPosition, setHelpPosition] = useState<{ row: number; col: number } | null>(null)
  const helpMoves = helpPosition && helpEnabled
    ? getValidMoves(board, helpPosition, boardSize)
    : []
  const helpAttacks = helpPosition && helpEnabled
    ? getValidAttacks(board, helpPosition, boardSize)
    : []
  const files = generateFiles(boardSize.cols)
  const ranks = generateRanks(boardSize.rows)

  const isSelected = (row: number, col: number) => {
    if (devMode && devModeSelected) {
      return devModeSelected.row === row && devModeSelected.col === col
    }
    return selectedPosition?.row === row && selectedPosition?.col === col
  }

  const isDevModeTarget = (row: number, col: number) => {
    if (!devMode || !devModeSelected) return false
    const cell = board[row][col]
    return cell === null
  }

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
    hintMove !== null && hintMove.isAttack === true &&
    ((hintMove.from.row === row && hintMove.from.col === col) ||
      (hintMove.to.row === row && hintMove.to.col === col))

  const isHelpMove = (row: number, col: number) =>
    helpEnabled && helpMoves.some(m => m.row === row && m.col === col)

  const isHelpAttack = (row: number, col: number) =>
    helpEnabled && helpAttacks.some(a => a.row === row && a.col === col)

  const handleSquareClick = (row: number, col: number) => {
    if (devMode) {
      devModeSelectSquare({ row, col })
      return
    }
    if (helpEnabled) {
      const cell = board[row][col]
      if (cell && isPiece(cell)) {
        setHelpPosition({ row, col })
      } else {
        setHelpPosition(null)
      }
    }
    selectSquare({ row, col })
  }

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

        <div className="border-2 border-stone-800 rounded shadow-2xl relative">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  position={{ row: rowIndex, col: colIndex }}
                  isSelected={isSelected(rowIndex, colIndex) || (helpEnabled && helpPosition?.row === rowIndex && helpPosition?.col === colIndex)}
                  isValidMove={isValidMove(rowIndex, colIndex) || isHelpMove(rowIndex, colIndex) || isDevModeTarget(rowIndex, colIndex)}
                  isValidAttack={isValidAttack(rowIndex, colIndex) || isHelpAttack(rowIndex, colIndex)}
                  isLastMove={isLastMove(rowIndex, colIndex)}
                  isHint={isHint(rowIndex, colIndex)}
                  isHintAttack={isHintAttack(rowIndex, colIndex)}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                />
              ))}
            </div>
          ))}
          <AnimatePresence>
            {board.map((row, rowIndex) =>
              row.map((c, colIndex) => {
                if (c && isPiece(c)) {
                  const squareSize = 48
                  return (
                    <AnimatedPiece
                      key={c.id}
                      piece={c}
                      position={{ row: rowIndex, col: colIndex }}
                      squareSize={squareSize}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                    />
                  )
                }
                return null
              })
            )}
          </AnimatePresence>
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
