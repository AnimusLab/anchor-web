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

  // 1. Sleek Dark Background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, 1600, 1000);
  
  // Grid
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 1600; i += 50) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1000); ctx.stroke();
  }
  for (let i = 0; i < 1000; i += 50) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1600, i); ctx.stroke();
  }

  // 2. Left Accent Bar
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, 60, 1000);
  
  // Vertical Text on bar
  ctx.save();
  ctx.translate(40, 500);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SOVEREIGN IDENTITY VERIFIED // MESH v5.8', 0, 0);
  ctx.restore();

  // 3. Photo Area (Left Side)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(120, 150, 450, 550);
  
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(124, 154, 442, 542);
  ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.beginPath(); ctx.arc(345, 350, 110, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(345, 750, 220, Math.PI, 0); ctx.fill();

  // 4. Clearance ID (Below Photo)
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 85px Courier New, monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
  ctx.shadowBlur = 15;
  ctx.fillText(clearanceId.toUpperCase(), 345, 850);
  ctx.shadowBlur = 0;

  // 5. Right Section: Details
  ctx.textAlign = 'left';
  
  // Organization Header
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 45px monospace';
  ctx.letterSpacing = '5px';
  ctx.fillText('ORGANIZATION', 650, 180);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 110px Courier New, monospace';
  ctx.fillText(company.toUpperCase(), 650, 300);

  // User Name
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 40px monospace';
  ctx.fillText('PERSONNEL NAME', 650, 450);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 90px monospace';
  ctx.fillText(name.toUpperCase(), 650, 550);

  // Role / Status
  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 40px monospace';
  ctx.fillText('CLEARANCE LEVEL', 650, 700);
  
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 60px monospace';
  ctx.fillText('MASTER NODE OWNER // LVL_01', 650, 780);

  // Footer / Mesh Metadata
  ctx.fillStyle = '#374151';
  ctx.font = '28px monospace';
  ctx.fillText('ANCHOR GOVERNANCE RELAY // REGIONAL HUB: AUTH_ACTIVE', 650, 930);

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
  
  // Create Rounded Geometry (LANDSCAPE)
  const roundedCardGeometry = useMemo(() => {
    const width = 3.2; // Wider for landscape
    const height = 2.0;
    const radius = 0.15;
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
    
    return new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
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
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.1, 0]]); // Adjusted connection point for landscape

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
