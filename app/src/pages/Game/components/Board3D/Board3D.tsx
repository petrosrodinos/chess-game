import { Suspense, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { isPiece, isObstacle } from '../../types'
import type { Board as BoardType, BoardSize, Position, Move } from '../../types'
import { Piece3D } from './Piece3D'
import { BoardSquare3D } from './BoardSquare3D'
import { Obstacle3D } from './Obstacle3D'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'
import { getValidMoves, getValidAttacks } from '../../utils'

interface GameSceneProps {
  isOnline?: boolean
  onlineBoard?: BoardType
  onlineBoardSize?: BoardSize
  onlineSelectedPosition?: Position | null
  onlineValidMoves?: Position[]
  onlineValidAttacks?: Position[]
  onlineLastMove?: Move | null
  onSquareClick?: (pos: Position) => void
}

const GameScene = ({
  isOnline = false,
  onlineBoard,
  onlineBoardSize,
  onlineSelectedPosition,
  onlineValidMoves = [],
  onlineValidAttacks = [],
  onlineLastMove,
  onSquareClick
}: GameSceneProps) => {
  const { gameState, hintMove, selectSquare, devModeSelectSquare, devModeSelected } = useGameStore()
  const { helpEnabled, devMode } = useUIStore()

  const board = isOnline && onlineBoard ? onlineBoard : gameState.board
  const boardSize = isOnline && onlineBoardSize ? onlineBoardSize : gameState.boardSize
  const selectedPosition = isOnline ? onlineSelectedPosition : gameState.selectedPosition
  const validMoves = isOnline ? onlineValidMoves : gameState.validMoves
  const validAttacks = isOnline ? onlineValidAttacks : gameState.validAttacks
  const lastMove = isOnline ? onlineLastMove : gameState.lastMove
  const currentHintMove = isOnline ? null : hintMove
  
  const [helpPosition, setHelpPosition] = useState<{ row: number; col: number } | null>(null)
  const helpMoves = helpPosition && helpEnabled && !isOnline
    ? getValidMoves(board, helpPosition, boardSize)
    : []
  const helpAttacks = helpPosition && helpEnabled && !isOnline
    ? getValidAttacks(board, helpPosition, boardSize)
    : []
  const { rows, cols } = boardSize
  const offsetX = (cols - 1) / 2
  const offsetZ = (rows - 1) / 2

  const cameraDistance = useMemo(() => {
    const maxDim = Math.max(rows, cols)
    return maxDim * 1
  }, [rows, cols])

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

  const isLastMoveSquare = (row: number, col: number) =>
    lastMove != null &&
    ((lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col))

  const isHintSquare = (row: number, col: number) =>
    currentHintMove !== null && !currentHintMove.isAttack &&
    ((currentHintMove.from.row === row && currentHintMove.from.col === col) ||
      (currentHintMove.to.row === row && currentHintMove.to.col === col))

  const isHintAttackSquare = (row: number, col: number) =>
    currentHintMove !== null && currentHintMove.isAttack === true &&
    ((currentHintMove.from.row === row && currentHintMove.from.col === col) ||
      (currentHintMove.to.row === row && currentHintMove.to.col === col))

  const isHintPiece = (row: number, col: number) =>
    currentHintMove !== null && currentHintMove.from.row === row && currentHintMove.from.col === col

  const isHelpMove = (row: number, col: number) =>
    !isOnline && helpEnabled && helpMoves.some(m => m.row === row && m.col === col)

  const isHelpAttack = (row: number, col: number) =>
    !isOnline && helpEnabled && helpAttacks.some(a => a.row === row && a.col === col)

  const handleSquareClick = (row: number, col: number) => {
    if (isOnline && onSquareClick) {
      onSquareClick({ row, col })
      return
    }

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
    <>
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={cameraDistance * 0.2}
        maxDistance={cameraDistance * 1.5}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <planeGeometry args={[cols + 10, rows + 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[cols + 0.5, 0.2, rows + 0.5]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const x = colIndex - offsetX
          const z = rowIndex - offsetZ
          const isLight = (rowIndex + colIndex) % 2 === 0
          const hasObstacle = cell && isObstacle(cell)

          return (
            <BoardSquare3D
              key={`square-${rowIndex}-${colIndex}`}
              position={[x, 0, z]}
              isLight={isLight}
              isValidMove={isValidMove(rowIndex, colIndex) || isHelpMove(rowIndex, colIndex) || isDevModeTarget(rowIndex, colIndex)}
              isValidAttack={isValidAttack(rowIndex, colIndex) || isHelpAttack(rowIndex, colIndex)}
              isLastMove={isLastMoveSquare(rowIndex, colIndex)}
              isHint={isHintSquare(rowIndex, colIndex)}
              isHintAttack={isHintAttackSquare(rowIndex, colIndex)}
              isObstacle={!!hasObstacle}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            />
          )
        })
      )}

      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (!cell) return null
          const x = colIndex - offsetX
          const z = rowIndex - offsetZ

          if (isObstacle(cell)) {
            return (
              <Obstacle3D
                key={`obstacle-${rowIndex}-${colIndex}`}
                type={cell.type}
                position={[x, 0.1, z]}
              />
            )
          }

          if (isPiece(cell)) {
            return (
              <Piece3D
                key={cell.id}
                type={cell.type}
                color={cell.color}
                position={[x, 0.1, z]}
                isSelected={isSelected(rowIndex, colIndex) || (helpEnabled && helpPosition?.row === rowIndex && helpPosition?.col === colIndex)}
                isHint={isHintPiece(rowIndex, colIndex)}
                isTargeted={isValidAttack(rowIndex, colIndex) || isHelpAttack(rowIndex, colIndex)}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              />
            )
          }

          return null
        })
      )}
    </>
  )
}

interface Board3DProps {
  isOnline?: boolean
  onlineBoard?: BoardType
  onlineBoardSize?: BoardSize
  onlineSelectedPosition?: Position | null
  onlineValidMoves?: Position[]
  onlineValidAttacks?: Position[]
  onlineLastMove?: Move | null
  onSquareClick?: (pos: Position) => void
}

export const Board3D = ({
  isOnline = false,
  onlineBoard,
  onlineBoardSize,
  onlineSelectedPosition,
  onlineValidMoves = [],
  onlineValidAttacks = [],
  onlineLastMove,
  onSquareClick
}: Board3DProps) => {
  const { gameState } = useGameStore()
  const boardSize = isOnline && onlineBoardSize ? onlineBoardSize : gameState.boardSize
  const maxDim = Math.max(boardSize.rows, boardSize.cols)
  const cameraY = maxDim * 0.75
  const cameraZ = maxDim * 0.6

  return (
    <div className="w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-xl overflow-hidden shadow-2xl">
      <Canvas
        shadows
        camera={{ position: [0, cameraY, cameraZ], fov: 45 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1f2937']} />
        <Suspense fallback={null}>
          <GameScene
            isOnline={isOnline}
            onlineBoard={onlineBoard}
            onlineBoardSize={onlineBoardSize}
            onlineSelectedPosition={onlineSelectedPosition}
            onlineValidMoves={onlineValidMoves}
            onlineValidAttacks={onlineValidAttacks}
            onlineLastMove={onlineLastMove}
            onSquareClick={onSquareClick}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
