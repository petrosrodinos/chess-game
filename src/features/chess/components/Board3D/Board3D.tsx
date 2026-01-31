import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Board as BoardType, Position, Move, HintMove, BoardSize } from '../../types'
import { isPiece, isObstacle } from '../../types'
import { ChessPiece3D } from './ChessPiece3D'
import { BoardSquare3D } from './BoardSquare3D'
import { Obstacle3D } from './Obstacle3D'

interface Board3DProps {
  board: BoardType
  boardSize: BoardSize
  selectedPosition: Position | null
  validMoves: Position[]
  lastMove: Move | null
  hintMove: HintMove | null
  onSquareClick: (pos: Position) => void
}

const ChessScene = ({
  board,
  boardSize,
  selectedPosition,
  validMoves,
  lastMove,
  hintMove,
  onSquareClick
}: Board3DProps) => {
  const { rows, cols } = boardSize
  const offsetX = (cols - 1) / 2
  const offsetZ = (rows - 1) / 2

  const cameraDistance = useMemo(() => {
    const maxDim = Math.max(rows, cols)
    return maxDim * 1.2
  }, [rows, cols])

  const isSelected = (row: number, col: number) =>
    selectedPosition?.row === row && selectedPosition?.col === col

  const isValidMove = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col)

  const isLastMove = (row: number, col: number) =>
    lastMove !== null &&
    ((lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col))

  const isHintSquare = (row: number, col: number) =>
    hintMove !== null &&
    ((hintMove.from.row === row && hintMove.from.col === col) ||
      (hintMove.to.row === row && hintMove.to.col === col))

  const isHintPiece = (row: number, col: number) =>
    hintMove !== null && hintMove.from.row === row && hintMove.from.col === col

  return (
    <>
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={cameraDistance * 0.8}
        maxDistance={cameraDistance * 1.8}
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
              isValidMove={isValidMove(rowIndex, colIndex)}
              isLastMove={isLastMove(rowIndex, colIndex)}
              isHint={isHintSquare(rowIndex, colIndex)}
              isObstacle={hasObstacle || false}
              onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
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
              <ChessPiece3D
                key={`piece-${rowIndex}-${colIndex}`}
                type={cell.type}
                color={cell.color}
                position={[x, 0.1, z]}
                isSelected={isSelected(rowIndex, colIndex)}
                isHint={isHintPiece(rowIndex, colIndex)}
                onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
              />
            )
          }

          return null
        })
      )}
    </>
  )
}

export const Board3D = (props: Board3DProps) => {
  const { boardSize } = props
  const maxDim = Math.max(boardSize.rows, boardSize.cols)
  const cameraY = maxDim * 1.1
  const cameraZ = maxDim * 0.9

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
          <ChessScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  )
}
