import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Board as BoardType, Position, Move, HintMove } from '../../types'
import { ChessPiece3D } from './ChessPiece3D'
import { BoardSquare3D } from './BoardSquare3D'

interface Board3DProps {
  board: BoardType
  selectedPosition: Position | null
  validMoves: Position[]
  lastMove: Move | null
  hintMove: HintMove | null
  onSquareClick: (pos: Position) => void
}

const ChessScene = ({
  board,
  selectedPosition,
  validMoves,
  lastMove,
  hintMove,
  onSquareClick
}: Board3DProps) => {
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
        minDistance={10}
        maxDistance={20}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[8.5, 0.2, 8.5]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {board.map((row, rowIndex) =>
        row.map((_, colIndex) => {
          const x = colIndex - 3.5
          const z = rowIndex - 3.5
          const isLight = (rowIndex + colIndex) % 2 === 0

          return (
            <BoardSquare3D
              key={`square-${rowIndex}-${colIndex}`}
              position={[x, 0, z]}
              isLight={isLight}
              isValidMove={isValidMove(rowIndex, colIndex)}
              isLastMove={isLastMove(rowIndex, colIndex)}
              isHint={isHintSquare(rowIndex, colIndex)}
              onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
            />
          )
        })
      )}

      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          if (!piece) return null
          const x = colIndex - 3.5
          const z = rowIndex - 3.5

          return (
            <ChessPiece3D
              key={`piece-${rowIndex}-${colIndex}`}
              type={piece.type}
              color={piece.color}
              position={[x, 0.1, z]}
              isSelected={isSelected(rowIndex, colIndex)}
              isHint={isHintPiece(rowIndex, colIndex)}
              onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
            />
          )
        })
      )}
    </>
  )
}

export const Board3D = (props: Board3DProps) => {
  return (
    <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl">
      <Canvas
        shadows
        camera={{ position: [0, 14, 12], fov: 40 }}
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
