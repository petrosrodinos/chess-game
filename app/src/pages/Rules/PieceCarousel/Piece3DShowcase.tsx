import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { PieceType } from "../../Game/types";
import { PlayerColors } from "../../Game/types";
import { Piece3D } from "../../Game/components/Board3D/Piece3D";

type Piece3DShowcaseProps = {
  pieceType: PieceType;
};

const Scene = ({ pieceType }: { pieceType: PieceType }) => (
  <>
    <ambientLight intensity={0.6} />
    <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
    <directionalLight position={[-2, 4, -1]} intensity={0.4} />
    <Piece3D type={pieceType} color={PlayerColors.WHITE} position={[0, 0, 0]} isSelected={false} isHint={false} isTargeted={false} isSwapTarget={false} onClick={() => {}} />
    <OrbitControls
      enableRotate={true}
      enableZoom={true}
      enablePan={false}
      minDistance={1.2}
      maxDistance={2.5}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      target={[0, 0.5, 0]}
    />
  </>
);

export const Piece3DShowcase = ({ pieceType }: Piece3DShowcaseProps) => {
  return (
    <div className="w-full h-[240px] rounded-xl overflow-hidden bg-black border border-stone-700/50 [&_canvas]:block">
      <Suspense fallback={<div className="w-full h-[240px] flex items-center justify-center text-stone-500 text-sm bg-black">Loading…</div>}>
        <Canvas camera={{ position: [0, 0.5, 1.6], fov: 45 }} gl={{ antialias: true, alpha: false }} shadows style={{ height: '100%', width: '100%', display: 'block' }}>
          <Scene pieceType={pieceType} />
        </Canvas>
      </Suspense>
    </div>
  );
};
