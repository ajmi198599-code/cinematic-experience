import { Canvas, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

function createLabelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#F5D27A");
  gradient.addColorStop(0.5, "#D6A84F");
  gradient.addColorStop(1, "#FFF0B8");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(214, 168, 79, 0.45)";
  ctx.lineWidth = 4;
  ctx.strokeRect(88, 88, 848, 1224);

  ctx.fillStyle = gradient;
  ctx.textAlign = "center";
  ctx.font = "76px Georgia";
  ctx.fillText("OE", 512, 282);
  ctx.beginPath();
  ctx.arc(512, 255, 92, 0, Math.PI * 2);
  ctx.strokeStyle = "#D6A84F";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.font = "86px Georgia";
  ctx.letterSpacing = "10px";
  ctx.fillText("OBSIDIAN", 512, 650);
  ctx.font = "42px Georgia";
  ctx.fillText("ESSENCE", 512, 724);

  ctx.font = "34px Arial";
  ctx.fillText("EXTRAIT DE PARFUM", 512, 1000);
  ctx.font = "26px Arial";
  ctx.fillText("100 ML  e  3.4 FL.OZ", 512, 1058);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function ObsidianMarbleShard({ position, scale = 1, rotation = [0, 0, 0] }) {
  const shardGeometry = useMemo(() => {
    const vertices = new Float32Array([
      0.02, 1.02, 0.02,
      -0.42, 0.42, 0.2,
      0.18, 0.5, 0.3,
      0.48, 0.28, -0.02,
      0.14, 0.24, -0.38,
      -0.48, 0.18, -0.22,
      -0.32, -0.82, 0.18,
      0.34, -0.76, 0.14,
      0.24, -0.92, -0.3,
      -0.38, -0.78, -0.24,
    ]);

    const indices = [
      0, 1, 2,
      0, 2, 3,
      0, 3, 4,
      0, 4, 5,
      0, 5, 1,
      1, 6, 7,
      1, 7, 2,
      2, 7, 3,
      3, 7, 8,
      3, 8, 4,
      4, 8, 9,
      4, 9, 5,
      5, 9, 6,
      5, 6, 1,
      6, 9, 8,
      6, 8, 7,
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const goldVeins = useMemo(
    () => [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.2, 0.68, 0.33),
        new THREE.Vector3(-0.08, 0.32, 0.38),
        new THREE.Vector3(0.14, 0.04, 0.32),
        new THREE.Vector3(0.04, -0.56, 0.26),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.12, 0.44, 0.34),
        new THREE.Vector3(0.3, 0.12, 0.24),
        new THREE.Vector3(0.18, -0.36, 0.22),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.34, 0.12, 0.22),
        new THREE.Vector3(-0.14, -0.08, 0.32),
        new THREE.Vector3(-0.28, -0.66, 0.22),
      ]),
    ],
    [],
  );

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh geometry={shardGeometry}>
        <meshPhysicalMaterial
          color="#030303"
          metalness={0.48}
          roughness={0.32}
          clearcoat={1}
          clearcoatRoughness={0.18}
          envMapIntensity={1.85}
        />
      </mesh>
      <mesh geometry={shardGeometry} scale={1.012}>
        <meshBasicMaterial color="#f5d27a" transparent opacity={0.055} depthWrite={false} />
      </mesh>
      {goldVeins.map((curve, index) => (
        <mesh key={index}>
          <tubeGeometry args={[curve, 28, index === 0 ? 0.008 : 0.006, 6, false]} />
          <meshStandardMaterial
            color={index === 0 ? "#f5d27a" : "#d6a84f"}
            emissive="#7a4d16"
            emissiveIntensity={0.18}
            metalness={0.72}
            roughness={0.24}
          />
        </mesh>
      ))}
    </group>
  );
}

function BottleModel({ locked = false, pointer = { x: 0, y: 0 }, active = true }) {
  const group = useRef(null);
  const labelTexture = useMemo(() => createLabelTexture(), []);

  useFrame(({ clock }) => {
    if (!active) return;
    if (!group.current) return;
    const elapsed = clock.getElapsedTime();
    const targetY = locked ? pointer.x * 0.8 : Math.sin(elapsed * 0.28) * 0.16;
    const targetX = locked ? -pointer.y * 0.42 : Math.sin(elapsed * 0.5) * 0.035;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.075);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.075);
    group.current.position.y = Math.sin(elapsed * 0.9) * 0.045;
  });

  return (
    <group ref={group} position={[0, -0.18, 0]} rotation={[0, -0.18, 0]} scale={0.86}>
      <ObsidianMarbleShard
        position={[1.1, -0.76, -0.68]}
        scale={[1.02, 1.34, 0.82]}
        rotation={[0.16, -0.56, -0.1]}
      />

      <mesh position={[0, -0.36, 0]}>
        <boxGeometry args={[1.46, 2.12, 0.56]} />
        <meshPhysicalMaterial
          color="#030303"
          metalness={0.52}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.7}
        />
      </mesh>

      <mesh position={[0, -0.36, 0.292]}>
        <planeGeometry args={[1.2, 1.56]} />
        <meshBasicMaterial map={labelTexture} transparent opacity={0.95} />
      </mesh>

      <mesh position={[0.78, -0.36, 0.04]}>
        <boxGeometry args={[0.045, 2.12, 0.61]} />
        <meshStandardMaterial color="#D6A84F" metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh position={[-0.78, -0.36, 0.04]}>
        <boxGeometry args={[0.045, 2.12, 0.61]} />
        <meshStandardMaterial color="#B77C2B" metalness={0.9} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0.72, 0.04]}>
        <boxGeometry args={[1.46, 0.045, 0.61]} />
        <meshStandardMaterial color="#F5D27A" metalness={0.92} roughness={0.18} />
      </mesh>

      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.28, 32]} />
        <meshStandardMaterial color="#D6A84F" metalness={1} roughness={0.18} />
      </mesh>
      <mesh position={[0, 1.16, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.16, 32]} />
        <meshStandardMaterial color="#080705" metalness={0.76} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.27, 0]}>
        <cylinderGeometry args={[0.46, 0.42, 0.16, 32]} />
        <meshStandardMaterial color="#D6A84F" metalness={1} roughness={0.2} />
      </mesh>

      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[1.26, 0.46, 0.72]} />
        <meshPhysicalMaterial
          color="#050505"
          metalness={0.66}
          roughness={0.13}
          clearcoat={1}
          clearcoatRoughness={0.07}
        />
      </mesh>
      <mesh position={[0, 1.86, 0]}>
        <boxGeometry args={[1.12, 0.055, 0.66]} />
        <meshStandardMaterial color="#F5D27A" metalness={0.95} roughness={0.16} />
      </mesh>
      <mesh position={[0, 1.38, 0]}>
        <boxGeometry args={[1.12, 0.04, 0.66]} />
        <meshStandardMaterial color="#B77C2B" metalness={0.95} roughness={0.22} />
      </mesh>
    </group>
  );
}

function FallbackBottle() {
  return (
    <div className="fallback-bottle">
      <img
        src="/assets/obsidian-reference-900.jpg"
        srcSet="/assets/obsidian-reference-560.jpg 560w, /assets/obsidian-reference-900.jpg 900w"
        sizes="(max-width: 720px) 70vw, 39vw"
        alt="Obsidian Essence perfume bottle"
        decoding="async"
      />
    </div>
  );
}

export function BottleStage({ locked = false, pointer = { x: 0, y: 0 }, active = true }) {
  const compactViewport = typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;
  const shouldAnimate = active && (locked || !compactViewport);

  return (
    <div className="bottle-stage">
      <div className="stage-halo" />
      <Canvas
        frameloop={shouldAnimate ? "always" : "demand"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, compactViewport ? 1.2 : 1.5]}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactViewport ? 1.2 : 1.5));
        }}
        camera={{ position: [0, 0.16, 6.15], fov: 34 }}
        fallback={<FallbackBottle />}
      >
        <ambientLight intensity={0.38} />
        <directionalLight position={[-3, 2.8, 4]} intensity={1.25} color="#f7e1a2" />
        <pointLight position={[2.6, 1.4, 1.4]} intensity={6.4} color="#D6A84F" distance={6} />
        <pointLight position={[-2, -1.5, 2]} intensity={2.2} color="#ffffff" distance={7} />
        <BottleModel locked={locked} pointer={pointer} active={shouldAnimate} />
      </Canvas>
      <div className="stage-reflection" />
    </div>
  );
}
