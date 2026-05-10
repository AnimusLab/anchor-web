import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * TacticalLattice: A 3D isometric mesh grid representing the enterprise fleet.
 * Branches nodes by department clusters.
 */
export default function TacticalLattice({ projects = [], department = "ROOT" }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400, background: '#05070A', position: 'relative' }}>
      <Canvas camera={{ position: [15, 15, 15], fov: 25 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#06B6D4" />
        <spotLight position={[-10, 20, 10]} angle={0.12} penumbra={1} intensity={1} castShadow />
        
        <LatticeGrid projects={projects} department={department} />
        
        <Environment preset="city" />
        <ContactShadows opacity={0.4} scale={20} blur={2.4} far={4.5} />
      </Canvas>

      {/* Tactical Overlay */}
      <div style={{ position: 'absolute', top: 20, right: 20, textAlign: 'right', pointerEvents: 'none' }}>
        <div style={{ fontSize: 10, color: '#06B6D4', letterSpacing: '0.3em', fontWeight: 700, textTransform: 'uppercase' }}>
          Mesh_Telemetry // Active
        </div>
        <div style={{ fontSize: 8, color: '#374151', fontFamily: 'monospace', marginTop: 4 }}>
          PROTOCOL_v5.2 // ENCRYPTED_LATTICE
        </div>
      </div>
    </div>
  );
}

function LatticeGrid({ projects, department }) {
  const group = useRef();
  
  // Calculate node positions in a tactical grid layout
  const nodes = useMemo(() => {
    return projects.map((p, i) => {
      const angle = (i / projects.length) * Math.PI * 2;
      const radius = 5 + Math.random() * 2;
      return {
        ...p,
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        color: p.status === 'COMPLIANT' ? '#06B6D4' : '#F59E0B',
      };
    });
  }, [projects]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={group}>
      {/* Central Hub Node */}
      <HubNode label={department} />

      {/* Project Spoke Nodes */}
      {nodes.map((node, i) => (
        <group key={i}>
          <ProjectNode node={node} />
          <ConnectionLine start={[0, 0, 0]} end={node.pos} color={node.color} />
        </group>
      ))}

      {/* Grid Floor */}
      <gridHelper args={[30, 30, '#111827', '#080B10']} position={[0, -2, 0]} />
    </group>
  );
}

function HubNode({ label }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={2} wireframe />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color="#06B6D4"
        font="monospace"
        anchorX="center"
        anchorY="middle"
      >
        {label}_CORE
      </Text>
    </Float>
  );
}

function ProjectNode({ node }) {
  return (
    <Float speed={3} rotationIntensity={2} floatIntensity={1}>
      <mesh position={node.pos}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={1} />
      </mesh>
      <Text
        position={[node.pos[0], node.pos[1] + 0.8, node.pos[2]]}
        fontSize={0.25}
        color="white"
        font="monospace"
        anchorX="center"
      >
        {node.name.toUpperCase()}
      </Text>
    </Float>
  );
}

function ConnectionLine({ start, end, color }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={0.2} />
    </line>
  );
}
