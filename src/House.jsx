import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, RoundedBox } from '@react-three/drei'

const HL = '#ffcf4d' // sunny gold highlight

// emissive props for a standard material when highlighted / not
const glow = (on, base = '#000000', baseI = 0) => ({
  emissive: on ? HL : base,
  emissiveIntensity: on ? 0.6 : baseI,
})

function Scene({ selected, onSelect, climate }) {
  const [hover, setHover] = useState(null)

  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : 'auto'
    return () => { document.body.style.cursor = 'auto' }
  }, [hover])

  const pp = (id) => ({
    onPointerOver: (e) => { e.stopPropagation(); setHover(id) },
    onPointerOut: (e) => { e.stopPropagation(); setHover((h) => (h === id ? null : h)) },
    onClick: (e) => { e.stopPropagation(); onSelect(id) },
  })
  const hl = (id) => hover === id || selected === id

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 8, 4]} intensity={1.15} />
      <hemisphereLight args={['#ffffff', '#bcd', 0.4]} />

      {/* The sun — click for orientation advice */}
      <group position={[-2.6, 2.7, -0.6]}>
        <pointLight intensity={0.7} distance={14} color="#fff0c2" />
        <mesh {...pp('sun')}>
          <sphereGeometry args={[hl('sun') ? 0.55 : 0.5, 32, 32]} />
          <meshStandardMaterial color="#ffd23f" emissive="#ffcf3a" emissiveIntensity={hl('sun') ? 1.6 : 1.0} />
        </mesh>
      </group>

      {/* The floating, gently-bobbing house */}
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
        <group position={[0, 0, 0]}>
          {/* Floor / slab platform */}
          <RoundedBox args={[3.2, 0.4, 3.2]} radius={0.16} smoothness={4} position={[0, 0, 0]} {...pp('slab')}>
            <meshStandardMaterial color="#8ed081" roughness={0.9} {...glow(hl('slab'))} />
          </RoundedBox>

          {/* Walls / body */}
          <RoundedBox args={[1.9, 1.4, 1.9]} radius={0.12} smoothness={4} position={[0, 0.9, 0]} {...pp('walls')}>
            <meshStandardMaterial color="#fff0d6" roughness={0.7} {...glow(hl('walls'))} />
          </RoundedBox>

          {/* Eaves / overhang (shading) */}
          <mesh position={[0, 1.64, 0]} {...pp('eaves')}>
            <boxGeometry args={[2.4, 0.12, 2.4]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} {...glow(hl('eaves'))} />
          </mesh>

          {/* Roof (pyramid) */}
          <mesh position={[0, 2.32, 0]} rotation={[0, Math.PI / 4, 0]} {...pp('roof')}>
            <coneGeometry args={[1.72, 1.2, 4]} />
            <meshStandardMaterial color="#ff8a7a" roughness={0.6} {...glow(hl('roof'))} />
          </mesh>
          {/* Chimney (part of the roof group) */}
          <RoundedBox args={[0.28, 0.55, 0.28]} radius={0.05} smoothness={3} position={[0.5, 2.55, -0.35]} {...pp('roof')}>
            <meshStandardMaterial color="#e0796b" roughness={0.7} {...glow(hl('roof'))} />
          </RoundedBox>

          {/* Door */}
          <mesh position={[0, 0.62, 0.97]} {...pp('door')}>
            <boxGeometry args={[0.5, 0.85, 0.08]} />
            <meshStandardMaterial color="#b5774d" roughness={0.6} {...glow(hl('door'))} />
          </mesh>

          {/* Windows (all share the 'windows' part) */}
          {[
            { p: [-0.55, 1.05, 0.96], r: [0, 0, 0] },
            { p: [0.55, 1.05, 0.96], r: [0, 0, 0] },
            { p: [0.96, 1.0, 0], r: [0, Math.PI / 2, 0] },
            { p: [-0.96, 1.0, 0], r: [0, Math.PI / 2, 0] },
          ].map((w, i) => (
            <mesh key={i} position={w.p} rotation={w.r} {...pp('windows')}>
              <boxGeometry args={[0.5, 0.55, 0.06]} />
              <meshStandardMaterial
                color="#bfe6ff"
                roughness={0.2}
                metalness={0.1}
                {...glow(hl('windows'), '#1c5a86', 0.18)}
              />
            </mesh>
          ))}

          {/* Tree (landscaping) */}
          <group position={[1.25, 0, 0.55]} {...pp('tree')}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.11, 0.15, 0.6, 8]} />
              <meshStandardMaterial color="#9b6a43" roughness={0.9} {...glow(hl('tree'))} />
            </mesh>
            <mesh position={[0, 1.05, 0]}>
              <sphereGeometry args={[0.5, 20, 20]} />
              <meshStandardMaterial color="#6cc24a" roughness={0.85} {...glow(hl('tree'))} />
            </mesh>
            <mesh position={[0.32, 0.82, 0.1]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#7ace5b" roughness={0.85} {...glow(hl('tree'))} />
            </mesh>
            <mesh position={[-0.3, 0.85, -0.05]}>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color="#62b544" roughness={0.85} {...glow(hl('tree'))} />
            </mesh>
          </group>
        </group>
      </Float>

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.7}
        minDistance={4.5}
        maxDistance={11}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 - 0.04}
        target={[0, 1, 0]}
      />
    </>
  )
}

export default function House({ selected, onSelect, climate }) {
  return (
    <Canvas camera={{ position: [5.5, 3.6, 6], fov: 45 }} gl={{ alpha: true, antialias: true }}>
      <Scene selected={selected} onSelect={onSelect} climate={climate} />
    </Canvas>
  )
}
