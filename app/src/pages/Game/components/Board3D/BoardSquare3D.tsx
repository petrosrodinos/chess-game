import { useState } from 'react'

interface BoardSquare3DProps {
  position: [number, number, number]
  isLight: boolean
  isValidMove: boolean
  isValidAttack: boolean
  isValidSwap: boolean
  isLastMove: boolean
  isHint: boolean
  isHintAttack: boolean
  isObstacle: boolean
  isMysteryBoxSelectedObstacle?: boolean
  isMysteryBoxSelectedEmptyTile?: boolean
  isMysteryBoxSelectedFigure?: boolean
  onClick: () => void
}

export const BoardSquare3D = ({
  position,
  isLight,
  isValidMove,
  isValidAttack,
  isValidSwap,
  isLastMove,
  isHint,
  isHintAttack,
  isObstacle,
  isMysteryBoxSelectedObstacle = false,
  isMysteryBoxSelectedEmptyTile = false,
  isMysteryBoxSelectedFigure = false,
  onClick
}: BoardSquare3DProps) => {
  const [hovered, setHovered] = useState(false)

  const getColor = () => {
    if (isMysteryBoxSelectedObstacle && isObstacle) return '#f97316'
    if (isMysteryBoxSelectedEmptyTile) return '#3b82f6'
    if (isMysteryBoxSelectedFigure) return '#a855f7'
    if (isObstacle) return '#3d3d3d'
    if (isHintAttack) return isLight ? '#fda4af' : '#be123c'
    if (isHint) return isLight ? '#67e8f9' : '#0891b2'
    if (isLastMove) return isLight ? '#fde047' : '#ca8a04'
    if (hovered && isValidSwap) return '#a78bfa'
    if (hovered && isValidAttack) return '#f87171'
    if (hovered && isValidMove) return '#4ade80'
    if (isValidSwap) return isLight ? '#ddd6fe' : '#7c3aed'
    if (isValidAttack) return isLight ? '#fecaca' : '#dc2626'
    if (isLight) return '#e8d5b5'
    return '#8b6914'
  }

  return (
    <group position={position}>
      <mesh
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.95, 0.15, 0.95]} />
        <meshStandardMaterial color={getColor()} />
      </mesh>
      
      {isValidMove && !isObstacle && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
        </mesh>
      )}

      {isValidAttack && !isObstacle && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.35, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
        </mesh>
      )}

      {isValidSwap && !isObstacle && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.35, 32]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.8} />
        </mesh>
      )}

      {isMysteryBoxSelectedObstacle && (
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 32]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
        </mesh>
      )}

      {isMysteryBoxSelectedEmptyTile && (
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.9} />
        </mesh>
      )}

      {isMysteryBoxSelectedFigure && (
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 32]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}
