import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'
import { groundCovers } from './passiveData.js'

const HL = '#f8d030' // pixel gold highlight

// Stardew-ish pixel palette (fixed accents; main materials come from props)
const C = {
  floor: '#b07830',
  glass: '#9fd6ff',
  trim: '#d8c070',
  plinth: '#8a8270',
  woodLt: '#c07030',
  islandBlue: '#305888',
  mustard: '#d89020',
  sage: '#406830',
  pink: '#c86070',
  white: '#f0e0c0',
  rug: '#704890',
  pot: '#b85820',
  leaf1: '#188020',
  leaf2: '#289838',
  trunk: '#603818',
}

const SH = 1.5 // storey height
const W = 1.7 // half footprint
const BASE_Y = 0.15 // top of ground-floor slab

// time-of-day lighting presets
const TOD = {
  day: { amb: 0.95, dir: 1.3, dirCol: '#ffe870', hemiSky: '#ffe8a0', hemiGnd: '#3a2800', sunCol: '#f8d030', body: 'sun', glow: 0.0, lower: 0 },
  sunset: { amb: 0.72, dir: 1.0, dirCol: '#ff8a3a', hemiSky: '#ffb070', hemiGnd: '#2a1800', sunCol: '#ff7020', body: 'sun', glow: 0.35, lower: 0.55 },
  night: { amb: 0.5, dir: 0.42, dirCol: '#7a98c8', hemiSky: '#405880', hemiGnd: '#0a1020', sunCol: '#cfe0ff', body: 'moon', glow: 1.0, lower: 0 },
}

function evenSpread(n, span) {
  // returns n positions centred on 0 across +/- span
  if (n <= 1) return [0]
  const step = (2 * span) / (n - 1)
  return Array.from({ length: n }, (_, i) => -span + i * step)
}

// ---- falling rain / snow via one instanced mesh ----
function Precip({ type }) {
  const mesh = useRef()
  const count = type === 'rain' ? 110 : 70
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: Math.random() * 11 - 5.5,
        y: Math.random() * 8 + 0.5,
        z: Math.random() * 11 - 5.5,
        spd: type === 'rain' ? 7 + Math.random() * 4 : 1.1 + Math.random() * 0.9,
        ph: Math.random() * Math.PI * 2,
        sway: type === 'snow' ? 0.3 + Math.random() * 0.4 : 0,
      })),
    [count, type],
  )
  useFrame((state, dt) => {
    if (!mesh.current) return
    const d = Math.min(dt, 0.05)
    const tm = state.clock.elapsedTime
    for (let i = 0; i < drops.length; i++) {
      const p = drops[i]
      p.y -= p.spd * d
      if (type === 'snow') p.x += Math.sin(tm + p.ph) * p.sway * d
      if (p.y < -0.4) {
        p.y = 7.5 + Math.random() * 1.5
        p.x = Math.random() * 11 - 5.5
        p.z = Math.random() * 11 - 5.5
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      {type === 'rain' ? (
        <boxGeometry args={[0.04, 0.42, 0.04]} />
      ) : (
        <boxGeometry args={[0.13, 0.13, 0.13]} />
      )}
      <meshBasicMaterial
        color={type === 'rain' ? '#bfe0ff' : '#ffffff'}
        transparent
        opacity={type === 'rain' ? 0.55 : 0.92}
      />
    </instancedMesh>
  )
}

// ---- drifting pixel clouds ----
const CLOUD_DEFS = [
  { x: -5, y: 0.4, z: 0, s: 1.1, spd: 0.35 },
  { x: 0, y: -0.2, z: 1.5, s: 0.85, spd: 0.28 },
  { x: 4, y: 0.6, z: -1, s: 1.0, spd: 0.32 },
]
const CLOUD_SPAN = 24 // wrap width, wider than the visible sky so the loop happens off-screen

function Clouds() {
  const g = useRef()
  useFrame((state) => {
    if (!g.current) return
    const t = state.clock.elapsedTime
    g.current.children.forEach((c, i) => {
      const d = CLOUD_DEFS[i]
      if (!d) return
      // drift from each cloud's own base offset, wrapping past the edges of view
      const x = (((d.x + t * d.spd + CLOUD_SPAN / 2) % CLOUD_SPAN) + CLOUD_SPAN) % CLOUD_SPAN - CLOUD_SPAN / 2
      c.position.x = x
    })
  })
  const puff = (key, s) => (
    <group key={key} position={[0, 0, 0]}>
      <mesh><boxGeometry args={[1.4 * s, 0.5 * s, 0.9 * s]} /><meshBasicMaterial color="#f2f4f8" /></mesh>
      <mesh position={[0.7 * s, 0.12 * s, 0]}><boxGeometry args={[0.8 * s, 0.45 * s, 0.8 * s]} /><meshBasicMaterial color="#e6eaf0" /></mesh>
      <mesh position={[-0.7 * s, 0.05 * s, 0.1 * s]}><boxGeometry args={[0.7 * s, 0.4 * s, 0.7 * s]} /><meshBasicMaterial color="#e6eaf0" /></mesh>
    </group>
  )
  return (
    <group ref={g} position={[0, 5.4, -1.5]}>
      {CLOUD_DEFS.map((d, i) => (
        <group key={i} position={[d.x, d.y, d.z]}>{puff('c' + i, d.s)}</group>
      ))}
    </group>
  )
}

function Scene({ selected, onSelect, lat, ground, stories, wallColor, roofColor, doorColor, windowDensity, neighbors, neighborDist, timeOfDay, weather }) {
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
  const mat = (id, color, o = {}) => (
    <meshStandardMaterial
      color={color}
      roughness={o.r ?? 0.85}
      metalness={o.m ?? 0}
      transparent={o.transparent}
      opacity={o.opacity ?? 1}
      emissive={hl(id) ? HL : (o.base || '#000000')}
      emissiveIntensity={hl(id) ? 0.6 : (o.baseI || 0)}
    />
  )

  const tod = TOD[timeOfDay] || TOD.day
  const dim = weather === 'rain' ? 0.62 : weather === 'cloudy' ? 0.78 : weather === 'snow' ? 0.9 : 1
  const N = stories
  const H = N * SH // total wall height
  const floorTop = (i) => BASE_Y + i * SH

  // --- Sun / moon position from latitude + hemisphere, lowered at sunset ---
  const L = typeof lat === 'number' ? lat : -37.8
  const hemiSouth = L < 0
  const absLat = Math.min(Math.abs(L), 70)
  const elev = (Math.max(90 - absLat, 14) * Math.PI) / 180
  const R = 9
  const horiz = R * Math.cos(elev)
  const sunY = Math.max(Math.min(R * Math.sin(elev) + 1.2, 8.4) - tod.lower * 5, 1.2)
  const zSign = hemiSouth ? -1 : 1
  const sunPos = [horiz * 0.5 + 0.8, sunY, zSign * horiz * 0.95]
  const moonPos = [-horiz * 0.5 - 1, Math.min(sunY + 3, 8.6), -zSign * horiz * 0.7]
  const bodyPos = tod.body === 'moon' ? moonPos : sunPos

  const groundColor = groundCovers[ground]?.color || groundCovers.lawn.color
  const glowI = tod.glow

  // windows for one wall, one storey
  const winMat = (extraBaseI = 0) =>
    mat('windows', C.glass, { transparent: true, opacity: 0.7, base: glowI > 0 ? '#ffce7a' : '#2a6f97', baseI: glowI > 0 ? 0.25 + glowI * 0.55 : 0.12 + extraBaseI, r: 0.2, m: 0.1 })

  const backXs = evenSpread(windowDensity, 1.0)
  const leftZs = evenSpread(Math.max(1, windowDensity - 1), 0.7).map((z) => z - 0.3)

  // furniture sets per storey
  const furniture = []
  // ground floor (always): kitchen + dining + lounge
  {
    const fy = 0
    furniture.push(
      <group key="gf">
        <mesh position={[-0.7, fy + 0.5, -1.0]}><boxGeometry args={[1.2, 0.7, 0.5]} />{mat('zoning', C.islandBlue)}</mesh>
        <mesh position={[-0.7, fy + 0.88, -1.0]}><boxGeometry args={[1.26, 0.08, 0.56]} />{mat('zoning', C.woodLt)}</mesh>
        <mesh position={[-0.95, fy + 0.34, -0.5]}><cylinderGeometry args={[0.12, 0.12, 0.46, 8]} />{mat('zoning', C.mustard)}</mesh>
        <mesh position={[-0.45, fy + 0.34, -0.5]}><cylinderGeometry args={[0.12, 0.12, 0.46, 8]} />{mat('zoning', C.mustard)}</mesh>
        {/* lounge sofa (interior, front-right) */}
        <mesh position={[0.65, fy + 0.12, 0.75]}><boxGeometry args={[1.8, 0.04, 1.3]} />{mat('zoning', C.rug)}</mesh>
        <mesh position={[0.6, fy + 0.3, 1.2]}><boxGeometry args={[1.5, 0.34, 0.6]} />{mat('zoning', C.sage)}</mesh>
        <mesh position={[1.25, fy + 0.3, 0.7]}><boxGeometry args={[0.6, 0.34, 1.0]} />{mat('zoning', C.sage)}</mesh>
        <mesh position={[0.6, fy + 0.55, 1.47]}><boxGeometry args={[1.5, 0.42, 0.18]} />{mat('zoning', C.sage)}</mesh>
        <mesh position={[0.5, fy + 0.22, 0.52]}><boxGeometry args={[0.5, 0.18, 0.5]} />{mat('zoning', C.woodLt)}</mesh>
      </group>,
    )
  }
  // middle floor (only when 3 storeys): reading nook
  if (N === 3) {
    const fy = floorTop(1) - BASE_Y
    furniture.push(
      <group key="mf">
        <mesh position={[0.2, fy + 0.12, 0.2]}><boxGeometry args={[1.6, 0.04, 1.6]} />{mat('zoning', C.rug)}</mesh>
        <mesh position={[0.0, fy + 0.35, 0.0]}><boxGeometry args={[0.7, 0.6, 0.7]} />{mat('zoning', C.pink)}</mesh>
        <group position={[-1.0, fy, -1.0]}>
          <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.16, 0.12, 0.32, 8]} />{mat('zoning', C.pot)}</mesh>
          <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.3, 8, 8]} />{mat('zoning', C.leaf2)}</mesh>
        </group>
      </group>,
    )
  }
  // top floor (when >=2 storeys): bedroom
  if (N >= 2) {
    const fy = floorTop(N - 1) - BASE_Y
    furniture.push(
      <group key="tf">
        <mesh position={[-0.55, fy + 0.28, -0.95]}><boxGeometry args={[1.5, 0.3, 1.05]} />{mat('zoning', C.woodLt)}</mesh>
        <mesh position={[-0.55, fy + 0.48, -0.85]}><boxGeometry args={[1.42, 0.18, 0.98]} />{mat('zoning', C.pink)}</mesh>
        <mesh position={[-0.85, fy + 0.55, -1.3]}><boxGeometry args={[0.42, 0.16, 0.3]} />{mat('zoning', C.white)}</mesh>
        <mesh position={[-0.3, fy + 0.55, -1.3]}><boxGeometry args={[0.42, 0.16, 0.3]} />{mat('zoning', C.white)}</mesh>
        <mesh position={[0.7, fy + 0.1, 0.2]}><boxGeometry args={[1.5, 0.03, 1.2]} />{mat('zoning', C.rug)}</mesh>
      </group>,
    )
  }

  // neighbour buildings (pixel blocks at adjustable distance)
  const neighbourBlocks = []
  if (neighbors) {
    const d = neighborDist
    const spots = [
      { x: d, z: -0.5, h: 2.6, c: '#9a8d7a' },
      { x: -d, z: 0.8, h: 3.4, c: '#8a8470' },
      { x: 0.5, z: -d, h: 2.2, c: '#a09480' },
      { x: -0.8, z: d, h: 3.0, c: '#94886f' },
    ]
    spots.forEach((s, i) => {
      neighbourBlocks.push(
        <group key={'nb' + i} position={[s.x, 0, s.z]}>
          <mesh position={[0, s.h / 2 - 0.3, 0]}>
            <boxGeometry args={[1.6, s.h, 1.6]} />
            <meshStandardMaterial color={s.c} roughness={0.95} emissive={glowI > 0 ? '#3a3020' : '#000'} emissiveIntensity={glowI > 0 ? 0.15 : 0} />
          </mesh>
          {/* a couple of pixel windows */}
          {[0.4, -0.2].map((wy, j) => (
            <mesh key={j} position={[0, s.h * 0.5 + wy, 0.81]}>
              <boxGeometry args={[0.9, 0.4, 0.05]} />
              <meshStandardMaterial color={glowI > 0 ? '#ffce7a' : '#6f97b5'} emissive={glowI > 0 ? '#ffae40' : '#000'} emissiveIntensity={glowI > 0 ? 0.6 : 0} />
            </mesh>
          ))}
        </group>,
      )
    })
  }

  return (
    <>
      <ambientLight intensity={tod.amb * dim} />
      <hemisphereLight args={[tod.hemiSky, tod.hemiGnd, 0.5 * dim]} />
      <directionalLight position={bodyPos} intensity={tod.dir * dim} color={tod.dirCol} />

      {/* celestial body — click for orientation/sun advice */}
      <group position={bodyPos}>
        <pointLight intensity={tod.body === 'moon' ? 0.3 : 0.5} distance={28} color={tod.sunCol} />
        <mesh {...pp('sun')}>
          <boxGeometry args={hl('sun') ? [1.25, 1.25, 1.25] : [1.1, 1.1, 1.1]} />
          <meshStandardMaterial color={tod.sunCol} emissive={tod.sunCol} emissiveIntensity={hl('sun') ? 1.7 : (tod.body === 'moon' ? 0.7 : 1.2)} />
        </mesh>
      </group>

      {(weather === 'cloudy' || weather === 'rain' || weather === 'snow') && <Clouds />}
      {weather === 'rain' && <Precip type="rain" />}
      {weather === 'snow' && <Precip type="snow" />}

      <Float speed={1} rotationIntensity={0} floatIntensity={0.35}>
        <group position={[0, 0, 0]}>
          {/* ---- site: plinth + cover + steps ---- */}
          <mesh position={[0, -0.35, 0]} {...pp('ground')}>
            <boxGeometry args={[6, 0.5, 6]} />
            {mat('ground', C.plinth, { r: 0.95 })}
          </mesh>
          <mesh position={[0, -0.04, 0]} {...pp('ground')}>
            <boxGeometry args={[5.5, 0.14, 5.5]} />
            {mat('ground', groundColor, { r: 0.95 })}
          </mesh>
          <mesh position={[0.4, -0.2, 3.05]} {...pp('ground')}>
            <boxGeometry args={[2.0, 0.2, 0.5]} />
            {mat('ground', '#9a9080', { r: 0.95 })}
          </mesh>
          <mesh position={[0.4, -0.36, 3.4]} {...pp('ground')}>
            <boxGeometry args={[1.6, 0.2, 0.4]} />
            {mat('ground', '#8d8474', { r: 0.95 })}
          </mesh>

          {neighbourBlocks}

          {/* ---- floor slabs (one per storey) ---- */}
          <mesh position={[0, 0.09, 0]} {...pp('floor')}>
            <boxGeometry args={[3.4, 0.12, 3.4]} />
            {mat('floor', C.floor)}
          </mesh>
          {Array.from({ length: N - 1 }, (_, i) => (
            <mesh key={'fl' + i} position={[0, floorTop(i + 1) - 0.07, 0]} {...pp('floor')}>
              <boxGeometry args={[3.4, 0.14, 3.4]} />
              {mat('floor', C.floor)}
            </mesh>
          ))}

          {/* ---- kept walls (back -Z, left -X); front cut away ---- */}
          <mesh position={[0, BASE_Y + H / 2, -W]} {...pp('walls')}>
            <boxGeometry args={[3.4, H, 0.14]} />
            {mat('walls', wallColor)}
          </mesh>
          <mesh position={[-W, BASE_Y + H / 2, 0]} {...pp('walls')}>
            <boxGeometry args={[0.14, H, 3.4]} />
            {mat('walls', wallColor)}
          </mesh>

          {/* ---- windows per storey ---- */}
          {Array.from({ length: N }, (_, i) => {
            const yc = floorTop(i) + 0.8
            return (
              <group key={'win' + i}>
                {backXs.map((x, j) => (
                  <mesh key={'b' + j} position={[x, yc, -W]} {...pp('windows')}>
                    <boxGeometry args={[0.8, 0.95, 0.18]} />
                    {winMat()}
                  </mesh>
                ))}
                {leftZs.map((z, j) => (
                  // skip the spot the ground-floor door occupies
                  (i === 0 && z > 0.6) ? null : (
                    <mesh key={'l' + j} position={[-W, yc, z]} {...pp('windows')}>
                      <boxGeometry args={[0.18, 0.95, 0.8]} />
                      {winMat()}
                    </mesh>
                  )
                ))}
              </group>
            )
          })}

          {/* ---- door (ground storey, left wall, front) ---- */}
          <mesh position={[-W, BASE_Y + 0.6, 1.05]} {...pp('door')}>
            <boxGeometry args={[0.2, 1.15, 0.75]} />
            {mat('door', doorColor, { r: 0.7 })}
          </mesh>

          {/* ---- gable roof ---- */}
          <mesh position={[0, BASE_Y + H + 0.42, 0.95]} rotation={[0.545, 0, 0]} {...pp('roof')}>
            <boxGeometry args={[3.95, 0.14, 2.3]} />
            {mat('roof', roofColor, { r: 0.7 })}
          </mesh>
          <mesh position={[0, BASE_Y + H + 0.42, -0.95]} rotation={[-0.545, 0, 0]} {...pp('roof')}>
            <boxGeometry args={[3.95, 0.14, 2.3]} />
            {mat('roof', roofColor, { r: 0.7 })}
          </mesh>
          <mesh position={[-1.0, BASE_Y + H + 0.6, -0.5]} {...pp('roof')}>
            <boxGeometry args={[0.34, 0.6, 0.34]} />
            {mat('roof', roofColor, { r: 0.8 })}
          </mesh>

          {/* ---- eaves over upper front ---- */}
          <mesh position={[0, BASE_Y + H, 1.55]} rotation={[0.12, 0, 0]} {...pp('eaves')}>
            <boxGeometry args={[3.7, 0.1, 1.0]} />
            {mat('eaves', C.trim, { r: 0.7 })}
          </mesh>

          {/* ---- furniture (zoning) ---- */}
          <group {...pp('zoning')}>{furniture}</group>

          {/* ---- tree + pots (landscaping) ---- */}
          <group position={[2.25, 0, 2.15]} {...pp('tree')}>
            <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.13, 0.16, 0.75, 6]} />{mat('tree', C.trunk, { r: 0.95 })}</mesh>
            <mesh position={[0, 1.1, 0]}><boxGeometry args={[1.0, 0.9, 1.0]} />{mat('tree', C.leaf1, { r: 0.9 })}</mesh>
            <mesh position={[0.32, 1.45, 0.1]}><boxGeometry args={[0.55, 0.55, 0.55]} />{mat('tree', C.leaf2, { r: 0.9 })}</mesh>
            <mesh position={[-0.3, 1.4, -0.1]}><boxGeometry args={[0.5, 0.5, 0.5]} />{mat('tree', C.leaf1, { r: 0.9 })}</mesh>
          </group>
          {[[1.95, 0.16, -0.6], [-1.15, 0.16, 2.45]].map((p, i) => (
            <group key={'pl' + i} position={p} {...pp('tree')}>
              <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.16, 0.12, 0.32, 6]} />{mat('tree', C.pot, { r: 0.85 })}</mesh>
              <mesh position={[0, 0.34, 0]}><boxGeometry args={[0.5, 0.5, 0.5]} />{mat('tree', C.leaf2, { r: 0.9 })}</mesh>
            </group>
          ))}
        </group>
      </Float>

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.45}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.03}
        target={[0, 1.4, 0]}
      />
    </>
  )
}

export default function House(props) {
  return (
    <Canvas
      camera={{ position: [8, 5.5, 8.5], fov: 42 }}
      gl={{ alpha: true, antialias: false }}
      dpr={0.3}
    >
      <Scene {...props} />
    </Canvas>
  )
}
