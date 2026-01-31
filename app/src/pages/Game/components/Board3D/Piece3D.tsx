import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import * as THREE from 'three'
import type { PieceType, PlayerColor } from '../../types'
import { PlayerColors, PieceTypes } from '../../types'

interface Piece3DProps {
  type: PieceType
  color: PlayerColor
  position: [number, number, number]
  isSelected: boolean
  isHint: boolean
  isTargeted: boolean
  onClick: () => void
}

const pieceColorMap = {
  [PlayerColors.WHITE]: '#f0f0e8',
  [PlayerColors.BLACK]: '#2d2d3a'
} as const

const Hoplite = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.1, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.22, 0.2, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.28, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.16, 0.18, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.45, 0]} castShadow>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0.12, 0.35, 0]} rotation={[0, 0, -0.3]} castShadow>
      <boxGeometry args={[0.04, 0.25, 0.04]} />
      <meshStandardMaterial color="#8b4513" />
    </mesh>
  </group>
)

const RamTower = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.24, 0.28, 0.3, 8]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.45, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.22, 0.35, 8]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.72, 0]} castShadow>
      <cylinderGeometry args={[0.24, 0.2, 0.2, 8]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    {[0, 1, 2, 3].map(i => (
      <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.18, 0.85, Math.sin(i * Math.PI / 2) * 0.18]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshStandardMaterial color={pieceColorMap[color]} />
      </mesh>
    ))}
  </group>
)

const Chariot = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.24, 0.24, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.35, 0.05]} rotation={[-0.2, 0, 0]} castShadow>
      <boxGeometry args={[0.16, 0.3, 0.22]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.6, 0.1]} rotation={[-0.3, 0, 0]} castShadow>
      <boxGeometry args={[0.12, 0.18, 0.16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.75, 0.12]} castShadow>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial color="#8b4513" />
    </mesh>
  </group>
)

const Bomber = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshStandardMaterial color="#333333" />
    </mesh>
    <mesh position={[0, 0.32, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
      <meshStandardMaterial color="#444444" />
    </mesh>
    <mesh position={[0, 0.42, 0]} castShadow>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0, 0.02, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
  </group>
)

const Paladin = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.24, 0.24, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.36, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.18, 0.28, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.58, 0]} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[-0.18, 0.4, 0]} rotation={[0, 0, 0.2]} castShadow>
      <boxGeometry args={[0.18, 0.25, 0.02]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
)

const Warlock = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.22, 0.24, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.38, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.16, 0.32, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.68, 0]} castShadow>
      <coneGeometry args={[0.16, 0.3, 16]} />
      <meshStandardMaterial color="#4a0080" />
    </mesh>
    <mesh position={[0, 0.86, 0]} castShadow>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshStandardMaterial color="#9900ff" emissive="#6600cc" emissiveIntensity={0.5} />
    </mesh>
  </group>
)

const Monarch = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.26, 0.24, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.38, 0]} castShadow>
      <cylinderGeometry args={[0.14, 0.2, 0.32, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.62, 0]} castShadow>
      <cylinderGeometry args={[0.16, 0.14, 0.12, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.82, 0]} castShadow>
      <boxGeometry args={[0.06, 0.26, 0.06]} />
      <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.9, 0]} castShadow>
      <boxGeometry args={[0.18, 0.06, 0.06]} />
      <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
    </mesh>
  </group>
)

const Duchess = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.26, 0.24, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.38, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.2, 0.32, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.65, 0]} castShadow>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.88, 0]} castShadow>
      <coneGeometry args={[0.08, 0.12, 8]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.98, 0]} castShadow>
      <sphereGeometry args={[0.04, 12, 12]} />
      <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
    </mesh>
  </group>
)

const Necromancer = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.12, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.22, 0.24, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.38, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.16, 0.32, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
    <mesh position={[0, 0.65, 0]} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
    <mesh position={[0, 0.65, 0.08]} castShadow>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color="#00ff00" emissive="#00cc00" emissiveIntensity={0.8} />
    </mesh>
    <mesh position={[0.14, 0.45, 0]} rotation={[0, 0, -0.2]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
      <meshStandardMaterial color="#2a1a0a" />
    </mesh>
  </group>
)

const DefaultPiece = ({ color }: { color: PlayerColor }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.24, 0.3, 16]} />
      <meshStandardMaterial color={pieceColorMap[color]} />
    </mesh>
  </group>
)

export const Piece3D = ({ type, color, position, isSelected, isHint, isTargeted, onClick }: Piece3DProps) => {
  const groupRef = useRef<Group>(null)
  const currentPosRef = useRef<THREE.Vector3 | null>(null)
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...position))
  
  // Initialize current position on first render
  if (currentPosRef.current === null) {
    currentPosRef.current = new THREE.Vector3(...position)
  }
  
  // Update target when position changes
  if (targetPosRef.current.x !== position[0] || 
      targetPosRef.current.y !== position[1] || 
      targetPosRef.current.z !== position[2]) {
    targetPosRef.current.set(...position)
  }
  
  useFrame((state, delta) => {
    if (!groupRef.current || !currentPosRef.current) return
    
    // Smoothly lerp to target position
    const lerpFactor = 1 - Math.pow(0.001, delta)
    currentPosRef.current.lerp(targetPosRef.current, lerpFactor)
    
    groupRef.current.position.x = currentPosRef.current.x
    groupRef.current.position.z = currentPosRef.current.z
    
    // Animate Y position based on state (selection, hint, etc.)
    const baseY = currentPosRef.current.y
    if (isSelected) {
      groupRef.current.position.y = baseY + 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.08
      groupRef.current.rotation.y = state.clock.elapsedTime * 2
    } else if (isHint) {
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 4) * 0.05
      groupRef.current.rotation.y = 0
    } else if (isTargeted) {
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 5) * 0.03
      groupRef.current.rotation.y = 0
    } else {
      groupRef.current.position.y = baseY
      groupRef.current.rotation.y = 0
    }
  })

  const getPieceComponent = (): React.FC<{ color: PlayerColor }> => {
    switch (type) {
      case PieceTypes.HOPLITE:
        return Hoplite
      case PieceTypes.RAM_TOWER:
        return RamTower
      case PieceTypes.CHARIOT:
        return Chariot
      case PieceTypes.BOMBER:
        return Bomber
      case PieceTypes.PALADIN:
        return Paladin
      case PieceTypes.WARLOCK:
        return Warlock
      case PieceTypes.MONARCH:
        return Monarch
      case PieceTypes.DUCHESS:
        return Duchess
      case PieceTypes.NECROMANCER:
        return Necromancer
      default:
        console.warn(`Unknown piece type: ${type}, using default`)
        return DefaultPiece
    }
  }

  const PieceComponent = getPieceComponent()

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <PieceComponent color={color} />
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.38, 32]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.9} />
        </mesh>
      )}
      {isHint && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.38, 32]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.9} />
        </mesh>
      )}
      {isTargeted && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}
