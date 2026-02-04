import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { generateFiles, generateRanks } from '../../constants'
import { Square } from '../Square'
import { AnimatedPiece } from '../Piece/AnimatedPiece'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'
import { getValidMoves, getValidAttacks, getAllNarcNetPositions } from '../../utils'
import { isPiece } from '../../types'
import type { Board as BoardType, BoardSize, Position, Move, SwapTarget, MysteryBoxState } from '../../types'

interface BoardProps {
    isOnline?: boolean
    onlineBoard?: BoardType
    onlineBoardSize?: BoardSize
    onlineSelectedPosition?: Position | null
    onlineValidMoves?: Position[]
    onlineValidAttacks?: Position[]
    onlineValidSwaps?: SwapTarget[]
    onlineLastMove?: Move | null
    onlineMysteryBoxState?: MysteryBoxState
    onSquareClick?: (pos: Position) => void
}

export const Board = ({
    isOnline = false,
    onlineBoard,
    onlineBoardSize,
    onlineSelectedPosition,
    onlineValidMoves = [],
    onlineValidAttacks = [],
    onlineValidSwaps = [],
    onlineLastMove,
    onlineMysteryBoxState,
    onSquareClick
}: BoardProps) => {
    const { gameState, hintMove, devModeSelectSquare, devModeSelected, mysteryBoxState: offlineMysteryBoxState, handleMysteryBoxSelection } = useGameStore()
    const { helpEnabled, devMode } = useUIStore()
    
    const mysteryBoxState = isOnline && onlineMysteryBoxState ? onlineMysteryBoxState : offlineMysteryBoxState

    const board = isOnline && onlineBoard ? onlineBoard : gameState.board
    const boardSize = isOnline && onlineBoardSize ? onlineBoardSize : gameState.boardSize
    const selectedPosition = isOnline ? onlineSelectedPosition : gameState.selectedPosition
    const validMoves = isOnline ? onlineValidMoves : gameState.validMoves
    const validAttacks = isOnline ? onlineValidAttacks : gameState.validAttacks
    const validSwaps = isOnline ? onlineValidSwaps : gameState.validSwaps
    const lastMove = isOnline ? onlineLastMove : gameState.lastMove
    const currentHintMove = isOnline ? null : hintMove

    const narcNetPositions = useMemo(() => {
        if (!board || board.length === 0) return []
        return getAllNarcNetPositions(board, boardSize)
    }, [board, boardSize])

    const [helpPosition, setHelpPosition] = useState<{ row: number; col: number } | null>(null)
    const helpMoves = helpPosition && helpEnabled && !isOnline
        ? getValidMoves(board, helpPosition, boardSize)
        : []
    const helpAttacks = helpPosition && helpEnabled && !isOnline
        ? getValidAttacks(board, helpPosition, boardSize)
        : []

    const files = generateFiles(boardSize.cols)
    const ranks = generateRanks(boardSize.rows)

    const isSelected = (row: number, col: number) => {
        if (!isOnline && devMode && devModeSelected) {
            return devModeSelected.row === row && devModeSelected.col === col
        }
        return selectedPosition?.row === row && selectedPosition?.col === col
    }

    const isDevModeTarget = (row: number, col: number) => {
        if (isOnline || !devMode || !devModeSelected) return false
        const cell = board[row][col]
        return cell === null
    }

    const isValidMove = (row: number, col: number) =>
        validMoves.some(m => m.row === row && m.col === col)

    const isValidAttack = (row: number, col: number) =>
        validAttacks.some(a => a.row === row && a.col === col)

    const isValidSwap = (row: number, col: number) =>
        validSwaps.some(s => s.position.row === row && s.position.col === col)

    const isLastMoveSquare = (row: number, col: number) =>
        lastMove != null &&
        ((lastMove.from.row === row && lastMove.from.col === col) ||
            (lastMove.to.row === row && lastMove.to.col === col))

    const isHint = (row: number, col: number) =>
        currentHintMove !== null && !currentHintMove.isAttack &&
        ((currentHintMove.from.row === row && currentHintMove.from.col === col) ||
            (currentHintMove.to.row === row && currentHintMove.to.col === col))

    const isHintAttack = (row: number, col: number) =>
        currentHintMove !== null && currentHintMove.isAttack === true &&
        ((currentHintMove.from.row === row && currentHintMove.from.col === col) ||
            (currentHintMove.to.row === row && currentHintMove.to.col === col))

    const isHelpMove = (row: number, col: number) =>
        !isOnline && helpEnabled && helpMoves.some(m => m.row === row && m.col === col)

    const isHelpAttack = (row: number, col: number) =>
        !isOnline && helpEnabled && helpAttacks.some(a => a.row === row && a.col === col)

    const getNarcOwner = (row: number, col: number) => {
        const narcNet = narcNetPositions.find(n => n.position.row === row && n.position.col === col)
        return narcNet ? narcNet.ownerColor : null
    }

    const isMysteryBoxSelectedObstacle = (row: number, col: number) => {
        if (!mysteryBoxState.isActive) return false
        return mysteryBoxState.selectedObstacles.some(p => p.row === row && p.col === col)
    }

    const isMysteryBoxSelectedEmptyTile = (row: number, col: number) => {
        if (!mysteryBoxState.isActive) return false
        return mysteryBoxState.selectedEmptyTiles.some(p => p.row === row && p.col === col)
    }

    const isMysteryBoxSelectedFigure = (row: number, col: number) => {
        if (!mysteryBoxState.isActive) return false
        if (!mysteryBoxState.firstFigurePosition) return false
        return mysteryBoxState.firstFigurePosition.row === row && mysteryBoxState.firstFigurePosition.col === col
    }

    const handleSquareClick = (row: number, col: number) => {
        if (onSquareClick) {
            if (!isOnline && offlineMysteryBoxState.isActive) {
                handleMysteryBoxSelection({ row, col }, false)
                return
            }
            
            if (!isOnline && devMode) {
                devModeSelectSquare({ row, col })
                return
            }
            
            if (!isOnline && helpEnabled) {
                const cell = board[row][col]
                if (cell && isPiece(cell)) {
                    setHelpPosition({ row, col })
                } else {
                    setHelpPosition(null)
                }
            }
            
            onSquareClick({ row, col })
            return
        }
    }

    if (!board || board.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-amber-200 text-lg">Loading board...</div>
            </div>
        )
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
                                                    isSelected={isSelected(rowIndex, colIndex) || (!isOnline && helpEnabled && helpPosition?.row === rowIndex && helpPosition?.col === colIndex)}
                                                    isValidMove={isValidMove(rowIndex, colIndex) || isHelpMove(rowIndex, colIndex) || isDevModeTarget(rowIndex, colIndex)}
                                                    isValidAttack={isValidAttack(rowIndex, colIndex) || isHelpAttack(rowIndex, colIndex)}
                                                    isValidSwap={isValidSwap(rowIndex, colIndex)}
                                                    isLastMove={isLastMoveSquare(rowIndex, colIndex)}
                                                    isHint={isHint(rowIndex, colIndex)}
                                                    isHintAttack={isHintAttack(rowIndex, colIndex)}
                                                    hasNarc={getNarcOwner(rowIndex, colIndex)}
                                                    isMysteryBoxSelectedObstacle={isMysteryBoxSelectedObstacle(rowIndex, colIndex)}
                                                    isMysteryBoxSelectedEmptyTile={isMysteryBoxSelectedEmptyTile(rowIndex, colIndex)}
                                                    isMysteryBoxSelectedFigure={isMysteryBoxSelectedFigure(rowIndex, colIndex)}
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
