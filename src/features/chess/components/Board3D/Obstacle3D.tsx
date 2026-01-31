import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { ObstacleType } from '../../types'
import { ObstacleTypes } from '../../types'
import { OBSTACLE_COLORS } from '../../constants'

interface Obstacle3DProps {
  type: ObstacleType
  position: [number, number, number]
}

const Cave = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.2, 0]} castShadow>
      <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.05, 0.15]} rotation={[0.3, 0, 0]}>
      <circleGeometry args={[0.15, 16]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
  </group>
)

const Tree = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
      <meshStandardMaterial color="#5c4033" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <coneGeometry args={[0.25, 0.4, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.65, 0]} castShadow>
      <coneGeometry args={[0.18, 0.3, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </group>
)

const Rock = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <dodecahedronGeometry args={[0.25, 0]} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
    <mesh position={[0.15, 0.08, 0.1]} castShadow>
      <dodecahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
  </group>
)

const River = ({ color }: { color: string }) => {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        child.position.y = 0.05 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.02
      })
    }
  })
  return (
    <group ref={ref}>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.2, 0.08, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

const Lake = ({ color }: { color: string }) => {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  return (
    <group ref={ref}>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

const Canyon = ({ color }: { color: string }) => (
  <group>
    <mesh position={[-0.2, 0.1, 0]} castShadow>
      <boxGeometry args={[0.15, 0.25, 0.8]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    <mesh position={[0.2, 0.15, 0]} castShadow>
      <boxGeometry args={[0.15, 0.35, 0.8]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.25, 0.8]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  </group>
)

const MysteryBox = ({ color }: { color: string }) => {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 1.5
      ref.current.position.y = 0.25 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })
  return (
    <group ref={ref} position={[0, 0.25, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.31, 0.31, 0.31]} />
        <meshBasicMaterial color="#ffd700" wireframe />
      </mesh>
    </group>
  )
}

const obstacleComponents: Record<ObstacleType, React.FC<{ color: string }>> = {
  [ObstacleTypes.CAVE]: Cave,
  [ObstacleTypes.TREE]: Tree,
  [ObstacleTypes.ROCK]: Rock,
  [ObstacleTypes.RIVER]: River,
  [ObstacleTypes.LAKE]: Lake,
  [ObstacleTypes.CANYON]: Canyon,
  [ObstacleTypes.MYSTERY_BOX]: MysteryBox
}

export const Obstacle3D = ({ type, position }: Obstacle3DProps) => {
  const ObstacleComponent = obstacleComponents[type]
  const color = OBSTACLE_COLORS[type]

  return (
    <group position={position}>
      <ObstacleComponent color={color} />
    </group>
  )
}
