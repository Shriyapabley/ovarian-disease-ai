import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface AnatomyModel3DProps {
  disease: string;
  affectedOvary: 'Left' | 'Right' | 'Both' | 'None';
  onOvaryClick?: (side: 'Left' | 'Right') => void;
}

// ─── Realistic Uterus ──────────────────────────────────────────────
// Pear-shaped body with cervix, built from a lathe geometry for organic shape
function RealisticUterus({ onHover }: { onHover: (label: string | null) => void }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  // Lathe geometry points for pear/pear-shaped uterus body
  const uterusPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // From top (fundus) to bottom (cervix)
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = 1.0 - t * 1.6; // height from fundus to cervix
      let r;
      if (t < 0.15) {
        // Fundus — wide top
        r = 0.75 - t * 0.3;
      } else if (t < 0.55) {
        // Body — tapering
        r = 0.7 - (t - 0.15) * 0.5;
      } else if (t < 0.85) {
        // Isthmus — narrow
        r = 0.5 - (t - 0.55) * 0.8;
      } else {
        // Cervix — slight bulge
        r = 0.26 + Math.sin((t - 0.85) / 0.15 * Math.PI) * 0.08;
      }
      pts.push(new THREE.Vector2(Math.max(r, 0.08), y));
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.05;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover('Uterus');
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <latheGeometry args={[uterusPoints, 48]} />
        <meshPhysicalMaterial
          color="#e8a0bf"
          roughness={0.45}
          metalness={0.05}
          clearcoat={0.3}
          clearcoatRoughness={0.6}
          sheen={0.5}
          sheenColor="#f9a8d4"
          sheenRoughness={0.5}
          transparent
          opacity={hovered ? 0.95 : 0.88}
          emissive={hovered ? '#f9a8d4' : '#3d1f2b'}
          emissiveIntensity={hovered ? 0.15 : 0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Uterine cavity highlight (inner glow) */}
      <mesh scale={[0.6, 0.7, 0.6]} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.08} />
      </mesh>

      {hovered && (
        <Html distanceFactor={10} position={[0, 1.3, 0]} center>
          <div className="px-3 py-1.5 bg-slate-900/90 text-white text-xs rounded-lg whitespace-nowrap backdrop-blur-md border border-white/10 pointer-events-none">
            Uterus
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Realistic Fallopian Tube ──────────────────────────────────────
// Curved tube from uterus to ovary, with fimbriae (fringed end)
function RealisticFallopianTube({
  side,
  onHover,
}: {
  side: 'left' | 'right';
  onHover: (label: string | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const dir = side === 'left' ? -1 : 1;

  // Build a curved tube geometry from uterus to ovary
  const tubeGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Start from uterine cornu
    const startX = dir * 0.65;
    const startY = 0.55;
    const endX = dir * 2.2;
    const endY = 0.45;

    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      // S-curve: goes up then arches over to ovary
      const x = startX + (endX - startX) * t;
      const y = startY + Math.sin(t * Math.PI) * 0.35 + (endY - startY) * t;
      const z = Math.sin(t * Math.PI * 1.5) * 0.15;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 40, 0.09, 12, false);
  }, [dir]);

  // Fimbriae — small finger-like projections at the ovarian end
  const fimbriae = useMemo(() => {
    const items: { pos: [number, number, number]; rot: [number, number, number]; len: number }[] = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const len = 0.12 + Math.random() * 0.08;
      items.push({
        pos: [dir * 2.15, 0.45 + Math.cos(angle) * 0.1, Math.sin(angle) * 0.1],
        rot: [angle * 0.5, 0, angle],
        len,
      });
    }
    return items;
  }, [dir]);

  return (
    <group ref={groupRef}>
      <mesh
        geometry={tubeGeometry}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(`${side === 'left' ? 'Left' : 'Right'} Fallopian Tube`);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshPhysicalMaterial
          color="#f0b6cb"
          roughness={0.5}
          metalness={0.05}
          clearcoat={0.2}
          sheen={0.4}
          sheenColor="#f9a8d4"
          transparent
          opacity={hovered ? 0.92 : 0.82}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Fimbriae (fringed ends) */}
      {fimbriae.map((fimb, i) => (
        <mesh key={`fimb-${i}`} position={fimb.pos} rotation={fimb.rot}>
          <capsuleGeometry args={[0.025, fimb.len, 4, 8]} />
          <meshStandardMaterial
            color="#f4c2d1"
            roughness={0.6}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}

      {hovered && (
        <Html distanceFactor={10} position={[dir * 1.4, 0.85, 0]} center>
          <div className="px-3 py-1.5 bg-slate-900/90 text-white text-xs rounded-lg whitespace-nowrap backdrop-blur-md border border-white/10 pointer-events-none">
            {side === 'left' ? 'Left' : 'Right'} Fallopian Tube
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Realistic Ovary ────────────────────────────────────────────────
// Almond-shaped organ with surface texture, follicles, cysts
function RealisticOvary({
  side,
  affected,
  disease,
  onClick,
  onHover,
}: {
  side: 'left' | 'right';
  affected: boolean;
  disease: string;
  onClick: () => void;
  onHover: (label: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const dir = side === 'left' ? -1 : 1;

  const isPCOS = disease.includes('PCOS') || disease.includes('Polycystic');
  const isCyst = disease.includes('Cyst');
  const isEndo = disease.includes('Endometri');

  // Follicle positions for PCOS — multiple small follicles on surface
  const follicles = useMemo(() => {
    if (!affected || !isPCOS) return [];
    const items: { pos: [number, number, number]; scale: number }[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const phi = (i / count) * Math.PI * 2;
      const theta = (i % 4) * (Math.PI / 4) - Math.PI / 3;
      const r = 0.42;
      items.push({
        pos: [
          Math.cos(phi) * Math.cos(theta) * r,
          Math.sin(theta) * r,
          Math.sin(phi) * Math.cos(theta) * r,
        ],
        scale: 0.07 + Math.random() * 0.04,
      });
    }
    return items;
  }, [affected, isPCOS]);

  // Cyst — larger fluid-filled sphere attached to ovary
  const cystData = useMemo(() => {
    if (!affected || !(isCyst || isEndo)) return null;
    return {
      pos: [dir * 0.35, -0.1, 0.15] as [number, number, number],
      radius: isEndo ? 0.32 : 0.28,
      color: isEndo ? '#7c2d12' : '#fca5a5',
    };
  }, [affected, isCyst, isEndo, dir]);

  useFrame((state) => {
    if (meshRef.current && affected && isPCOS) {
      const t = state.clock.getElapsedTime();
      const s = 1 + Math.sin(t * 1.5) * 0.04;
      meshRef.current.scale.set(s, s * 0.7, s);
    }
  });

  // Ovary color — healthy vs affected
  const ovaryColor = affected
    ? isEndo
      ? '#9d4e6b'
      : isCyst
      ? '#c4667f'
      : isPCOS
      ? '#b8526e'
      : '#d4667f'
    : '#d4708f';

  return (
    <group position={[dir * 2.35, 0.4, 0]}>
      {/* Main ovary body — almond/ellipsoid shape */}
      <mesh
        ref={meshRef}
        scale={[1, 0.65, 0.75]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(`${side === 'left' ? 'Left' : 'Right'} Ovary${affected ? ' — Affected' : ''}`);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.45, 48, 48]} />
        <meshPhysicalMaterial
          color={ovaryColor}
          roughness={0.35}
          metalness={0.08}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
          sheen={0.6}
          sheenColor={affected ? '#f9a8d4' : '#fbcfe8'}
          sheenRoughness={0.4}
          transparent
          opacity={hovered ? 0.95 : 0.9}
          emissive={affected ? '#be185d' : '#3d1f2b'}
          emissiveIntensity={affected ? (hovered ? 0.25 : 0.12) : hovered ? 0.1 : 0.03}
        />
      </mesh>

      {/* Surface follicles (normal — subtle) */}
      {!affected && (
        <>
          {[0, 1, 2].map((i) => {
            const angle = (i / 3) * Math.PI * 2;
            return (
              <mesh
                key={`norm-fol-${i}`}
                position={[
                  Math.cos(angle) * 0.3,
                  Math.sin(angle) * 0.15,
                  Math.sin(angle) * 0.25,
                ]}
                scale={0.06}
              >
                <sphereGeometry args={[1, 12, 12]} />
                <meshStandardMaterial
                  color="#f9d4e2"
                  roughness={0.3}
                  transparent
                  opacity={0.5}
                />
              </mesh>
            );
          })}
        </>
      )}

      {/* PCOS follicles — multiple enlarged, glowing */}
      {follicles.map((fol, i) => (
        <mesh key={`pcos-fol-${i}`} position={fol.pos} scale={fol.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshPhysicalMaterial
            color="#fbbf24"
            roughness={0.15}
            metalness={0.2}
            clearcoat={0.8}
            emissive="#f59e0b"
            emissiveIntensity={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Cyst — fluid-filled sphere with glow */}
      {cystData && (
        <group position={cystData.pos}>
          <mesh>
            <sphereGeometry args={[cystData.radius, 32, 32]} />
            <meshPhysicalMaterial
              color={cystData.color}
              roughness={0.1}
              metalness={0.15}
              clearcoat={0.9}
              clearcoatRoughness={0.1}
              transmission={0.3}
              transparent
              opacity={0.75}
              emissive={isEndo ? '#7c2d12' : '#ef4444'}
              emissiveIntensity={0.15}
            />
          </mesh>
          {/* Glowing outline */}
          <mesh scale={1.12}>
            <sphereGeometry args={[cystData.radius, 32, 32]} />
            <meshBasicMaterial
              color={isEndo ? '#a78bfa' : '#ef4444'}
              transparent
              opacity={0.12}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}

      {/* Affected indicator — pulsing ring */}
      {affected && (
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <ringGeometry args={[0.55, 0.6, 48]} />
          <meshBasicMaterial
            color="#ec4899"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {hovered && (
        <Html distanceFactor={10} position={[0, 0.55, 0]} center>
          <div className="px-3 py-1.5 bg-slate-900/90 text-white text-xs rounded-lg whitespace-nowrap backdrop-blur-md border border-white/10 pointer-events-none">
            {side === 'left' ? 'Left' : 'Right'} Ovary{affected ? ' — Affected' : ''}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Scene ─────────────────────────────────────────────────────────
function Scene({
  disease,
  affectedOvary,
  onOvaryClick,
  onHover,
}: {
  disease: string;
  affectedOvary: 'Left' | 'Right' | 'Both' | 'None';
  onOvaryClick: (side: 'Left' | 'Right') => void;
  onHover: (label: string | null) => void;
}) {
  const leftAffected = affectedOvary === 'Left' || affectedOvary === 'Both';
  const rightAffected = affectedOvary === 'Right' || affectedOvary === 'Both';

  return (
    <>
      {/* Lighting for realistic tissue appearance */}
      <ambientLight intensity={0.45} color="#fce7f3" />
      <directionalLight position={[5, 8, 5]} intensity={0.7} color="#ffffff" castShadow />
      <directionalLight position={[-5, 3, -3]} intensity={0.35} color="#fbcfe8" />
      <pointLight position={[0, 2, 4]} intensity={0.4} color="#f9a8d4" />
      <pointLight position={[0, -2, 3]} intensity={0.2} color="#e9d5ff" />
      <spotLight position={[0, 6, 0]} angle={0.5} penumbra={0.5} intensity={0.3} color="#ffffff" />

      <RealisticUterus onHover={onHover} />
      <RealisticFallopianTube side="left" onHover={onHover} />
      <RealisticFallopianTube side="right" onHover={onHover} />
      <RealisticOvary
        side="left"
        affected={leftAffected}
        disease={disease}
        onClick={() => onOvaryClick('Left')}
        onHover={onHover}
      />
      <RealisticOvary
        side="right"
        affected={rightAffected}
        disease={disease}
        onClick={() => onOvaryClick('Right')}
        onHover={onHover}
      />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={3.5}
        maxDistance={14}
        autoRotate
        autoRotateSpeed={0.4}
        target={[0, 0.2, 0]}
      />
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function AnatomyModel3D({
  disease,
  affectedOvary,
  onOvaryClick,
}: AnatomyModel3DProps) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`canvas-container relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 via-fuchsia-50/30 to-purple-50/30 ${
        isFullscreen ? 'h-screen' : 'h-[450px] lg:h-[550px]'
      }`}
    >
      <Canvas
        camera={{ position: [0, 0.5, 7.5], fov: 40 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene
          disease={disease}
          affectedOvary={affectedOvary}
          onOvaryClick={(side) => onOvaryClick?.(side)}
          onHover={setHoveredLabel}
        />
      </Canvas>

      {/* Hover label overlay */}
      {hoveredLabel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 glass rounded-xl text-sm font-medium text-slate-700 pointer-events-none animate-fade-in z-10">
          {hoveredLabel}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 no-print z-10">
        <button
          onClick={() => {
            if (containerRef.current) {
              const canvas = containerRef.current.querySelector('canvas');
              if (canvas) {
                // Reset camera by re-rendering
                window.location.reload();
              }
            }
          }}
          className="w-9 h-9 glass rounded-lg flex items-center justify-center text-slate-600 hover:bg-white/60 transition-colors"
          title="Reset view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-9 h-9 glass rounded-lg flex items-center justify-center text-slate-600 hover:bg-white/60 transition-colors"
          title="Toggle fullscreen"
        >
          {isFullscreen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8V5a2 2 0 0 1 2-2h3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
            </svg>
          )}
        </button>
      </div>

      {/* Info badge */}
      <div className="absolute top-4 left-4 glass rounded-xl px-3 py-1.5 text-xs text-slate-600 no-print z-10">
        <span className="font-medium">Interactive 3D Model</span>
        <span className="text-slate-400 mx-1.5">·</span>
        Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}
