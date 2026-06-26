import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, RoundedBox } from '@react-three/drei'
import { groundCovers } from './passiveData.js'

const HL = '#ffcf4d' // sunny gold highlight

// Pastel palette
const C = {
  wall: '#fbe9e1',
  roof: '#f3a79c',
  floor: '#ecd6ad',
  door: '#cc9270',
  glass: '#cfeaff',
  trim: '#fffdf8',
  plinth: '#e7e1d7',
  woodLt: '#e3c79a',
  islandBlue: '#c6d6e6',
  mustard: '#ecc46a',
  sage: '#bcd6c0',
  pink: '#f4c9d6',
  white: '#fbfbf7',
  rug: '#ecd7e6',
  pot: '#e0a890',
  leaf1: '#8fcf7e',
  leaf2: '#a6dd92',
  trunk: '#b98a5e',
  sun: '#ffd23f',
}

function Scene({ selected, onSelect, lat, ground }) {
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
  // reusable material with highlight glow
  const mat = (id, color, o = {}) => (
    <meshStandardMaterial
      color={color}
      roughness={o.r ?? 0.75}
      metalness={o.m ?? 0}
      transparent={o.transparent}
      opacity={o.opacity ?? 1}
      emissive={hl(id) ? HL : (o.base || '#000000')}
      emissiveIntensity={hl(id) ? 0.6 : (o.baseI || 0)}
    />
  )

  // --- Sun position from latitude / hemisphere (noon, equinox approximation) ---
  const L = typeof lat === 'number' ? lat : -37.8
  const hemiSouth = L < 0
  const absLat = Math.min(Math.abs(L), 70)
  const elev = (Math.max(90 - absLat, 14) * Math.PI) / 180
  const R = 8.5
  const horiz = R * Math.cos(elev)
  const sunY = Math.min(R * Math.sin(elev) + 1.2, 7.8)
  const zSign = hemiSouth ? -1 : 1 // equator side: S→north(−Z), N→south(+Z)
  const sunPos = [horiz * 0.5 + 0.6, sunY, zSign * horiz * 0.95]

  const groundColor = groundCovers[ground]?.color || groundCovers.lawn.color
  const W = 1.7 // half footprint

  return (
    <>
      <ambientLight intensity={0.72} />
      <hemisphereLight args={['#ffffff', '#cbd6e0', 0.45]} />
      <directionalLight position={sunPos} intensity={1.05} color="#fff4d8" />

      {/* Sun — click for orientation */}
      <group position={sunPos}>
        <pointLight intensity={0.5} distance={26} color="#fff0c2" />
        <mesh {...pp('sun')}>
          <sphereGeometry args={[hl('sun') ? 0.62 : 0.55, 32, 32]} />
          <meshStandardMaterial color={C.sun} emissive="#ffcf3a" emissiveIntensity={hl('sun') ? 1.7 : 1.05} />
        </mesh>
      </group>

      <Float speed={1} rotationIntensity={0} floatIntensity={0.4}>
        <group position={[0, 0, 0]}>
          {/* ---- Ground / site (plinth + customisable cover + steps) ---- */}
          <RoundedBox args={[6, 0.5, 6]} radius={0.18} smoothness={4} position={[0, -0.35, 0]} {...pp('ground')}>
            {mat('ground', C.plinth, { r: 0.95 })}
          </RoundedBox>
          <mesh position={[0, -0.04, 0]} {...pp('ground')}>
            <boxGeometry args={[5.5, 0.14, 5.5]} />
            {mat('ground', groundColor, { r: 0.95 })}
          </mesh>
          <mesh position={[0.4, -0.2, 3.05]} {...pp('ground')}>
            <boxGeometry args={[2.0, 0.2, 0.5]} />
            {mat('ground', '#dcd6cc', { r: 0.95 })}
          </mesh>
          <mesh position={[0.4, -0.36, 3.4]} {...pp('ground')}>
            <boxGeometry args={[1.6, 0.2, 0.4]} />
            {mat('ground', '#d4cec4', { r: 0.95 })}
          </mesh>

          {/* ---- Floors (ground plate + mid floor) ---- */}
          <mesh position={[0, 0.09, 0]} {...pp('floor')}>
            <boxGeometry args={[3.4, 0.12, 3.4]} />
            {mat('floor', C.floor)}
          </mesh>
          <mesh position={[0, 1.5, 0]} {...pp('floor')}>
            <boxGeometry args={[3.4, 0.14, 3.4]} />
            {mat('floor', C.floor)}
          </mesh>

          {/* ---- Kept walls (back −Z and left −X); front is cut away ---- */}
          <mesh position={[0, 1.5, -W]} {...pp('walls')}>
            <boxGeometry args={[3.4, 3.0, 0.14]} />
            {mat('walls', C.wall)}
          </mesh>
          <mesh position={[-W, 1.5, 0]} {...pp('walls')}>
            <boxGeometry args={[0.14, 3.0, 3.4]} />
            {mat('walls', C.wall)}
          </mesh>

          {/* ---- Windows (on the kept walls) ---- */}
          {[[-0.6, 0.95, -W], [0.7, 0.95, -W], [0.05, 2.25, -W]].map((p, i) => (
            <mesh key={'wb' + i} position={p} {...pp('windows')}>
              <boxGeometry args={[0.8, 0.95, 0.18]} />
              {mat('windows', C.glass, { transparent: true, opacity: 0.62, base: '#2a6f97', baseI: 0.12, r: 0.12, m: 0.1 })}
            </mesh>
          ))}
          {[[-W, 0.95, -0.4], [-W, 2.25, 0.35]].map((p, i) => (
            <mesh key={'wl' + i} position={p} {...pp('windows')}>
              <boxGeometry args={[0.18, 0.95, 0.8]} />
              {mat('windows', C.glass, { transparent: true, opacity: 0.62, base: '#2a6f97', baseI: 0.12, r: 0.12, m: 0.1 })}
            </mesh>
          ))}

          {/* ---- Door (left wall, toward the front) ---- */}
          <mesh position={[-W, 0.62, 1.05]} {...pp('door')}>
            <boxGeometry args={[0.2, 1.15, 0.75]} />
            {mat('door', C.door, { r: 0.6 })}
          </mesh>

          {/* ---- Gable roof (two slopes) ---- */}
          <mesh position={[0, 3.5, 0.95]} rotation={[0.545, 0, 0]} {...pp('roof')}>
            <boxGeometry args={[3.95, 0.13, 2.25]} />
            {mat('roof', C.roof, { r: 0.6 })}
          </mesh>
          <mesh position={[0, 3.5, -0.95]} rotation={[-0.545, 0, 0]} {...pp('roof')}>
            <boxGeometry args={[3.95, 0.13, 2.25]} />
            {mat('roof', C.roof, { r: 0.6 })}
          </mesh>
          {/* chimney */}
          <RoundedBox args={[0.34, 0.6, 0.34]} radius={0.05} position={[-1.0, 3.7, -0.5]} {...pp('roof')}>
            {mat('roof', '#e89086', { r: 0.7 })}
          </RoundedBox>

          {/* ---- Eaves / sun-shade pergola over the upper front ---- */}
          <mesh position={[0, 3.0, 1.55]} rotation={[0.12, 0, 0]} {...pp('eaves')}>
            <boxGeometry args={[3.7, 0.1, 1.0]} />
            {mat('eaves', C.trim, { r: 0.6 })}
          </mesh>

          {/* ---- Interior + outdoor furniture (zoning / layout) ---- */}
          <group {...pp('zoning')}>
            {/* kitchen island + stools (ground) */}
            <RoundedBox args={[1.3, 0.7, 0.55]} radius={0.06} position={[-0.55, 0.5, -1.0]}>{mat('zoning', C.islandBlue)}</RoundedBox>
            <mesh position={[-0.55, 0.88, -1.0]}><boxGeometry args={[1.36, 0.08, 0.6]} />{mat('zoning', C.woodLt)}</mesh>
            <mesh position={[-0.85, 0.34, -0.5]}><cylinderGeometry args={[0.13, 0.13, 0.46, 14]} />{mat('zoning', C.mustard)}</mesh>
            <mesh position={[-0.25, 0.34, -0.5]}><cylinderGeometry args={[0.13, 0.13, 0.46, 14]} />{mat('zoning', C.mustard)}</mesh>
            {/* dining table + chairs (ground) */}
            <mesh position={[0.95, 0.78, -0.45]}><boxGeometry args={[0.95, 0.1, 0.65]} />{mat('zoning', C.woodLt)}</mesh>
            <mesh position={[0.95, 0.42, -0.45]}><boxGeometry args={[0.14, 0.72, 0.14]} />{mat('zoning', C.woodLt)}</mesh>
            <RoundedBox args={[0.36, 0.6, 0.36]} radius={0.05} position={[0.95, 0.3, 0.05]}>{mat('zoning', C.sage)}</RoundedBox>
            <RoundedBox args={[0.36, 0.6, 0.36]} radius={0.05} position={[0.95, 0.3, -0.95]}>{mat('zoning', C.sage)}</RoundedBox>
            {/* bed (upper) */}
            <RoundedBox args={[1.5, 0.3, 1.05]} radius={0.06} position={[-0.55, 1.78, -0.95]}>{mat('zoning', C.woodLt)}</RoundedBox>
            <RoundedBox args={[1.42, 0.18, 0.98]} radius={0.05} position={[-0.55, 1.98, -0.85]}>{mat('zoning', C.pink)}</RoundedBox>
            <RoundedBox args={[0.42, 0.16, 0.3]} radius={0.05} position={[-0.85, 2.05, -1.3]}>{mat('zoning', C.white)}</RoundedBox>
            <RoundedBox args={[0.42, 0.16, 0.3]} radius={0.05} position={[-0.3, 2.05, -1.3]}>{mat('zoning', C.white)}</RoundedBox>
            <mesh position={[0.7, 1.6, 0.0]}><boxGeometry args={[1.5, 0.03, 1.2]} />{mat('zoning', C.rug)}</mesh>
            {/* outdoor sectional sofa + coffee table + rug (front deck) */}
            <mesh position={[0.5, 0.12, 2.15]}><boxGeometry args={[2.3, 0.04, 1.9]} />{mat('zoning', C.rug)}</mesh>
            <RoundedBox args={[1.7, 0.34, 0.75]} radius={0.08} position={[0.35, 0.3, 2.45]}>{mat('zoning', C.sage)}</RoundedBox>
            <RoundedBox args={[0.75, 0.34, 1.15]} radius={0.08} position={[1.35, 0.3, 1.95]}>{mat('zoning', C.sage)}</RoundedBox>
            <RoundedBox args={[1.7, 0.42, 0.2]} radius={0.06} position={[0.35, 0.55, 2.75]}>{mat('zoning', C.sage)}</RoundedBox>
            <RoundedBox args={[0.6, 0.18, 0.6]} radius={0.05} position={[0.3, 0.22, 1.7]}>{mat('zoning', C.woodLt)}</RoundedBox>
          </group>

          {/* ---- Tree + pot plants (landscaping) ---- */}
          <group position={[2.25, 0, 2.15]} {...pp('tree')}>
            <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.13, 0.16, 0.75, 10]} />{mat('tree', C.trunk, { r: 0.9 })}</mesh>
            <mesh position={[0, 1.15, 0]}><sphereGeometry args={[0.55, 18, 18]} />{mat('tree', C.leaf1, { r: 0.85 })}</mesh>
            <mesh position={[0.34, 0.95, 0.12]}><sphereGeometry args={[0.34, 14, 14]} />{mat('tree', C.leaf2, { r: 0.85 })}</mesh>
            <mesh position={[-0.3, 1.0, -0.08]}><sphereGeometry args={[0.3, 14, 14]} />{mat('tree', C.leaf1, { r: 0.85 })}</mesh>
          </group>
          {[[1.95, 0.16, -0.6], [-1.15, 0.16, 2.45]].map((p, i) => (
            <group key={'pl' + i} position={p} {...pp('tree')}>
              <mesh position={[0, 0.0, 0]}><cylinderGeometry args={[0.16, 0.12, 0.32, 12]} />{mat('tree', C.pot, { r: 0.8 })}</mesh>
              <mesh position={[0, 0.34, 0]}><sphereGeometry args={[0.28, 14, 14]} />{mat('tree', C.leaf2, { r: 0.85 })}</mesh>
            </group>
          ))}

          {/* ---- Glass railing on the open upper edges (decorative) ---- */}
          <mesh position={[W - 0.05, 1.85, 0]}>
            <boxGeometry args={[0.04, 0.5, 3.2]} />
            <meshStandardMaterial color="#dff1ff" transparent opacity={0.28} />
          </mesh>
          <mesh position={[0, 1.85, W - 0.05]}>
            <boxGeometry args={[3.2, 0.5, 0.04]} />
            <meshStandardMaterial color="#dff1ff" transparent opacity={0.28} />
          </mesh>
        </group>
      </Float>

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.45}
        minDistance={6}
        maxDistance={17}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.03}
        target={[0, 1.5, 0]}
      />
    </>
  )
}

export default function House({ selected, onSelect, lat, ground }) {
  return (
    <Canvas camera={{ position: [8, 5.5, 8.5], fov: 42 }} gl={{ alpha: true, antialias: true }}>
      <Scene selected={selected} onSelect={onSelect} lat={lat} ground={ground} />
    </Canvas>
  )
}
