import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { PieceType, PieceColor } from '../../types'

interface ChessPiece3DProps {
  type: PieceType
  color: PieceColor
  position: [number, number, number]
  isSelected: boolean
  isHint: boolean
  onClick: () => void
}

const pieceColor = {
  white: '#f0f0e8',
  black: '#2d2d3a'
}

const Pawn = ({ color }: { color: PieceColor }) => (
  <group>
    <mesh position={[0, 0.1, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.25, 0.2, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.18, 0.2, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.5, 0]} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
  </group>
)

const Rook = ({ color }: { color: PieceColor }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.26, 0.3, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.45, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.2, 0.4, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.75, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.18, 0.2, 6]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
  </group>
)

const Knight = ({ color }: { color: PieceColor }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.25, 0.3, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.4, 0.03]} rotation={[-0.2, 0, 0]} castShadow>
      <boxGeometry args={[0.15, 0.35, 0.25]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.65, 0.1]} rotation={[-0.4, 0, 0]} castShadow>
      <boxGeometry args={[0.12, 0.2, 0.18]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
  </group>
)

const Bishop = ({ color }: { color: PieceColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.25, 0.24, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.18, 0.35, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.7, 0]} castShadow>
      <sphereGeometry args={[0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.82, 0]} castShadow>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
  </group>
)

const Queen = ({ color }: { color: PieceColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.26, 0.24, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.2, 0.35, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.7, 0]} castShadow>
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.95, 0]} castShadow>
      <coneGeometry args={[0.1, 0.15, 8]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 1.08, 0]} castShadow>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
    </mesh>
  </group>
)

const King = ({ color }: { color: PieceColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.26, 0.24, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.14, 0.2, 0.35, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.68, 0]} castShadow>
      <cylinderGeometry args={[0.16, 0.14, 0.15, 16]} />
      <meshStandardMaterial color={pieceColor[color]} />
    </mesh>
    <mesh position={[0, 0.92, 0]} castShadow>
      <boxGeometry args={[0.06, 0.3, 0.06]} />
      <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
    </mesh>
    <mesh position={[0, 1.0, 0]} castShadow>
      <boxGeometry args={[0.2, 0.06, 0.06]} />
      <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
    </mesh>
  </group>
)

const pieceComponents: Record<PieceType, React.FC<{ color: PieceColor }>> = {
  pawn: Pawn,
  rook: Rook,
  knight: Knight,
  bishop: Bishop,
  queen: Queen,
  king: King
}

export const ChessPiece3D = ({ type, color, position, isSelected, isHint, onClick }: ChessPiece3DProps) => {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (!groupRef.current) return
    
    if (isSelected) {
      groupRef.current.position.y = position[1] + 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.08
      groupRef.current.rotation.y = state.clock.elapsedTime * 2
    } else if (isHint) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.05
      groupRef.current.rotation.y = 0
    } else {
      groupRef.current.position.y = position[1]
      groupRef.current.rotation.y = 0
    }
  })

  const PieceComponent = pieceComponents[type]

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <PieceComponent color={color} />
      {(isSelected || isHint) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.38, 32]} />
          <meshBasicMaterial 
            color={isSelected ? '#ffd700' : '#00d4ff'} 
            transparent 
            opacity={0.9} 
          />
        </mesh>
      )}
    </group>
  )
}
