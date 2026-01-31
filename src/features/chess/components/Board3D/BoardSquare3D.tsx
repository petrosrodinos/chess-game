import { useState } from 'react'

interface BoardSquare3DProps {
  position: [number, number, number]
  isLight: boolean
  isValidMove: boolean
  isLastMove: boolean
  isHint: boolean
  isObstacle: boolean
  onClick: () => void
}

export const BoardSquare3D = ({
  position,
  isLight,
  isValidMove,
  isLastMove,
  isHint,
  isObstacle,
  onClick
}: BoardSquare3DProps) => {
  const [hovered, setHovered] = useState(false)

  const getColor = () => {
    if (isObstacle) return '#3d3d3d'
    if (isHint) return isLight ? '#67e8f9' : '#0891b2'
    if (isLastMove) return isLight ? '#fde047' : '#ca8a04'
    if (hovered && isValidMove) return '#4ade80'
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
    </group>
  )
}
