/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Float, ContactShadows } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * Generates a high-fidelity dynamic texture for the Auditor Badge.
 */
function createBadgeTexture(name, agency, clearanceId) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1536;
  const ctx = canvas.getContext('2d');

  // 1. Dark Background with subtle grid
  ctx.fillStyle = '#08080C';
  ctx.fillRect(0, 0, 1024, 1536);
  
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 1024; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1536); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }

  // 2. Agency Header Block
  const headerColor = '#10B981'; // Anchor Emerald
  ctx.fillStyle = headerColor;
  ctx.fillRect(0, 0, 1024, 200);

  // 3. Agency Text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 90px Courier New, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(agency.toUpperCase(), 512, 130);

  // 4. "OFFICIAL AUDITOR" label
  ctx.fillStyle = '#64748B';
  ctx.font = '40px monospace';
  ctx.letterSpacing = '10px';
  ctx.fillText('IDENTITY VERIFIED // AUTHORIZED', 512, 300);

  // 5. Photo Area / Shield Icon
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(312, 400, 400, 500);
  
  // Abstract "User" Icon
  ctx.fillStyle = '#111827';
  ctx.fillRect(314, 402, 396, 496);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.arc(512, 580, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(512, 950, 240, Math.PI, 0);
  ctx.fill();

  // 6. Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 80px monospace';
  ctx.fillText(name.toUpperCase(), 512, 1050);

  // 7. Clearance ID (The Star of the Show)
  ctx.fillStyle = headerColor;
  ctx.font = 'bold 110px Courier New, monospace';
  ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
  ctx.shadowBlur = 20;
  ctx.fillText(clearanceId, 512, 1200);
  ctx.shadowBlur = 0;

  // 8. Footer
  ctx.fillStyle = '#334155';
  ctx.font = '30px monospace';
  ctx.fillText('ANCHOR GOVERNANCE MESH // v5.1 Protocol', 512, 1450);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export default function AuditorBadge({ name = "Unknown", agency = "PENDING", clearanceId = "ID_PENDING", active = true }) {
  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      <Canvas
        style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 15], fov: 25 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        <Physics gravity={[0, -20, 0]}>
          <Lanyard name={name} agency={agency} clearanceId={clearanceId} />
        </Physics>

        <Environment preset="city" />
        <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
}

function Lanyard({ name, agency, clearanceId }) {
  const { viewport } = useThree();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const band = useRef();

  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => createBadgeTexture(name, agency, clearanceId), [name, agency, clearanceId]);
  const lanyardTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#10B981'; // Emerald glow
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ]));

  const segmentProps = { type: 'dynamic', canSleep: false, colliders: false, angularDamping: 2, linearDamping: 2 };

  // Physics Joints
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.8]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.8]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.8]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.4, 0]]);

  useFrame((state, delta) => {
    if (dragged) {
        const vec = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
        const dir = vec.clone().sub(state.camera.position).normalize();
        vec.add(dir.multiplyScalar(state.camera.position.length()));
        card.current?.wakeUp();
        card.current?.setNextKinematicTranslation({ x: vec.x, y: vec.y, z: vec.z });
    }

    if (fixed.current && j1.current && j2.current && j3.current) {
        curve.points[0].copy(j3.current.translation());
        curve.points[1].copy(j2.current.translation());
        curve.points[2].copy(j1.current.translation());
        curve.points[3].copy(fixed.current.translation());
        band.current.geometry.setPoints(curve.getPoints(32));
    }
  });

  return (
    <>
      <group position={[viewport.width / 4, 4, 0]}>
        <RigidBody ref={fixed} type="fixed" />
        <RigidBody position={[0.2, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.05]} />
        </RigidBody>
        <RigidBody position={[0.4, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.05]} />
        </RigidBody>
        <RigidBody position={[0.6, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.05]} />
        </RigidBody>

        <RigidBody 
          ref={card} 
          {...segmentProps} 
          type={dragged ? 'kinematicPosition' : 'dynamic'}
          colliders={false}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={() => setDragged(true)}
          onPointerUp={() => setDragged(false)}
        >
          <CuboidCollider args={[0.8, 1.2, 0.05]} />
          
          {/* Card Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 2.4, 0.08]} />
            <meshPhysicalMaterial 
              map={texture} 
              clearcoat={1} 
              clearcoatRoughness={0.1} 
              metalness={0.2} 
              roughness={0.5} 
            />
          </mesh>

          {/* Metal Clip */}
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
          </mesh>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial 
          transparent 
          lineWidth={0.15} 
          color="#10B981" 
          map={lanyardTexture} 
          repeat={[-20, 1]} 
          depthTest={false}
        />
      </mesh>
    </>
  );
}
