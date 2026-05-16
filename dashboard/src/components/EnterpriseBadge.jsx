/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Float, ContactShadows } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * Generates a high-fidelity dynamic texture for the Enterprise Badge.
 */
/**
 * Generates a high-fidelity dynamic texture for the Enterprise Badge.
 */
function createBadgeTexture(name, company, clearanceId) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600; 
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');

  const primaryColor = '#06B6D4'; // Cyan

  // 1. Base Layout (Dual Tone)
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, 1600, 1000);
  
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, 600, 1000);

  // Grid on Right Section
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 600; i < 1600; i += 50) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1000); ctx.stroke();
  }
  for (let i = 0; i < 1000; i += 50) {
    ctx.beginPath(); ctx.moveTo(600, i); ctx.lineTo(1600, i); ctx.stroke();
  }

  // 2. Left Identity Panel
  // Profile Photo
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(300, 350, 180, 0, Math.PI * 2); ctx.stroke();
  
  ctx.fillStyle = '#0F172A';
  ctx.beginPath(); ctx.arc(300, 350, 177, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.beginPath(); ctx.arc(300, 320, 80, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(300, 600, 160, Math.PI, 0); ctx.fill();

  // Identification Label
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '5px';
  ctx.fillText('TACTICAL CLEARANCE', 300, 650);

  // Clearance ID (With Safe Padding)
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 82px Courier New, monospace';
  ctx.fillText(clearanceId.toUpperCase(), 300, 780, 500); // 500px maxWidth for safety

  // Status Bar
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(80, 880, 440, 70); // Centered with padding
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 28px monospace';
  ctx.fillText('IDENTITY VERIFIED // ACTIVE', 300, 925);

  // 3. Right Registry Panel
  ctx.textAlign = 'left';
  
  // Organization Details
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 40px monospace';
  ctx.letterSpacing = '10px';
  ctx.fillText('ORGANIZATION', 700, 200);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 110px Courier New, monospace';
  ctx.fillText(company.toUpperCase(), 700, 330);

  // Personnel Details
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 40px monospace';
  ctx.fillText('PERSONNEL NAME', 700, 500);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 95px monospace';
  ctx.fillText(name.toUpperCase(), 700, 620);

  // Node Authority
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 40px monospace';
  ctx.fillText('GOVERNANCE LEVEL', 700, 780);
  
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 65px monospace';
  ctx.fillText('MASTER NODE OWNER', 700, 880);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export default function EnterpriseBadge({ name = "Unknown", company = "PENDING", clearanceId = "ID_PENDING", active = true }) {
  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      <Canvas style={{ pointerEvents: 'auto', width: '100%', height: '100%' }} camera={{ position: [0, 0, 15], fov: 25 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} />
        <Physics gravity={[0, -20, 0]}>
          <Lanyard name={name} company={company} clearanceId={clearanceId} />
        </Physics>
        <Environment preset="city" />
        <ContactShadows opacity={0.4} scale={10} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
}

function Lanyard({ name, company, clearanceId }) {
  const { viewport } = useThree();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const band = useRef();

  const [dragged, setDragged] = useState(false);

  const texture = useMemo(() => createBadgeTexture(name, company, clearanceId), [name, company, clearanceId]);
  
  // Back texture
  const backTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600; canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 1600, 1000);
    ctx.fillStyle = '#111';
    ctx.fillRect(50, 50, 1500, 900);
    ctx.fillStyle = '#06B6D4';
    ctx.font = 'bold 80px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SOVEREIGN GOVERNANCE RELAY', 800, 520);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Create Rounded Geometry (LANDSCAPE)
  const roundedCardGeometry = useMemo(() => {
    const width = 3.2;
    const height = 2.0;
    const radius = 0.2; // Smooth edges
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 + radius, -height / 2);
    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
    
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
    
    // Fix UVs for ExtrudeGeometry
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        uv.setXY(i, (x + width / 2) / width, (y + height / 2) / height);
    }
    return geometry;
  }, []);

  const lanyardTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 8; ctx.strokeRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ]));

  const segmentProps = { type: 'dynamic', canSleep: false, colliders: false, angularDamping: 2, linearDamping: 2 };

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.8]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.8]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.8]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.1, 0]]);

  useFrame((state) => {
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
        <RigidBody position={[0.2, 0, 0]} ref={j1} {...segmentProps}><BallCollider args={[0.05]} /></RigidBody>
        <RigidBody position={[0.4, 0, 0]} ref={j2} {...segmentProps}><BallCollider args={[0.05]} /></RigidBody>
        <RigidBody position={[0.6, 0, 0]} ref={j3} {...segmentProps}><BallCollider args={[0.05]} /></RigidBody>
        <RigidBody ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'} colliders={false} onPointerDown={() => setDragged(true)} onPointerUp={() => setDragged(false)}>
          <CuboidCollider args={[1.6, 1.0, 0.05]} />
          
          {/* Card Body - Extrude with custom UV mapping */}
          <mesh castShadow receiveShadow geometry={roundedCardGeometry}>
             <meshPhysicalMaterial map={texture} clearcoat={1} clearcoatRoughness={0.1} metalness={0.2} roughness={0.5} />
          </mesh>
          
          {/* Top Clip Hole Holder */}
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#444" metalness={1} roughness={0.1} />
          </mesh>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial transparent lineWidth={0.15} color="#06B6D4" map={lanyardTexture} repeat={[-20, 1]} depthTest={false} />
      </mesh>
    </>
  );
}
