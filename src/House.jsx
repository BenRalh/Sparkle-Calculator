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

// ---- little pixel NPCs (Stardew-ish) ----
const SKIN = '#f2c199'
const PEOPLE_PALETTE = [
  { shirt: '#e07a5f', pants: '#3d405b', hair: '#2a1a10' },
  { shirt: '#81b29a', pants: '#4a4033', hair: '#4a2a10' },
  { shirt: '#5b8cc4', pants: '#3d405b', hair: '#141414' },
  { shirt: '#f2cc8f', pants: '#5a4a3a', hair: '#3a2a1a' },
  { shirt: '#c98bb9', pants: '#3d405b', hair: '#2a1a10' },
]
// non-raycasting so clicks pass through to the house parts behind
const noRay = () => null

function Person({ pose = 'walk', x = 0, z = 0, baseY = 0, shirt = '#4a90d9', pants = '#3a4a5a', hair = '#3a2a1a', range = 0.8, axis = 'x', phase = 0, speed = 1 }) {
  const g = useRef()
  const ll = useRef(), rl = useRef(), la = useRef(), ra = useRef()
  useFrame((state) => {
    if (!g.current) return
    const t = state.clock.elapsedTime * speed + phase
    if (pose === 'walk') {
      const tri = Math.asin(Math.sin(t * 0.7)) / (Math.PI / 2) // smooth -1..1 triangle
      const along = tri * range
      const forward = Math.cos(t * 0.7) >= 0
      if (axis === 'x') {
        g.current.position.x = x + along
        g.current.position.z = z
        g.current.rotation.y = forward ? Math.PI / 2 : -Math.PI / 2
      } else {
        g.current.position.z = z + along
        g.current.position.x = x
        g.current.rotation.y = forward ? 0 : Math.PI
      }
      const sw = Math.sin(t * 7) * 0.55
      if (ll.current) ll.current.rotation.x = sw
      if (rl.current) rl.current.rotation.x = -sw
      if (la.current) la.current.rotation.x = -sw * 0.8
      if (ra.current) ra.current.rotation.x = sw * 0.8
      g.current.position.y = baseY + Math.abs(Math.sin(t * 7)) * 0.02
    } else if (pose === 'sit') {
      const idle = Math.sin(t * 1.6) * 0.06
      if (ll.current) ll.current.rotation.x = -1.4
      if (rl.current) rl.current.rotation.x = -1.4
      if (la.current) la.current.rotation.x = idle
      if (ra.current) ra.current.rotation.x = -idle
    } else if (pose === 'sleep') {
      const br = 1 + Math.sin(t * 1.3) * 0.045 // gentle breathing
      g.current.scale.set(1, 1, br)
    }
  })
  const staticRot = pose === 'sleep' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]
  const leg = (ref, px) => (
    <group ref={ref} position={[px, 0.2, 0]}>
      <mesh position={[0, -0.1, 0]} raycast={noRay}><boxGeometry args={[0.09, 0.2, 0.09]} /><meshStandardMaterial color={pants} roughness={0.9} /></mesh>
    </group>
  )
  const arm = (ref, px) => (
    <group ref={ref} position={[px, 0.44, 0]}>
      <mesh position={[0, -0.1, 0]} raycast={noRay}><boxGeometry args={[0.07, 0.2, 0.08]} /><meshStandardMaterial color={shirt} roughness={0.9} /></mesh>
    </group>
  )
  return (
    <group ref={g} position={[x, baseY, z]} rotation={staticRot}>
      {leg(ll, -0.06)}
      {leg(rl, 0.06)}
      <mesh position={[0, 0.34, 0]} raycast={noRay}><boxGeometry args={[0.26, 0.26, 0.15]} /><meshStandardMaterial color={shirt} roughness={0.9} /></mesh>
      {arm(la, -0.16)}
      {arm(ra, 0.16)}
      <mesh position={[0, 0.6, 0]} raycast={noRay}><boxGeometry args={[0.2, 0.2, 0.2]} /><meshStandardMaterial color={SKIN} roughness={0.85} /></mesh>
      <mesh position={[0, 0.69, -0.01]} raycast={noRay}><boxGeometry args={[0.22, 0.09, 0.22]} /><meshStandardMaterial color={hair} roughness={0.9} /></mesh>
    </group>
  )
}

function Scene({ selected, onSelect, lat, ground, stories, wallColor, roofColor, doorColor, windowDensity, timeOfDay, weather }) {
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

  // ---- little pixel people (NPCs) per floor: scale + life ----
  const people = []
  const addFloorPeople = (i) => {
    const fy = floorTop(i)
    const isTop = i === N - 1 && N >= 2
    const a = PEOPLE_PALETTE[(i * 3) % PEOPLE_PALETTE.length]
    const b = PEOPLE_PALETTE[(i * 3 + 1) % PEOPLE_PALETTE.length]
    const c = PEOPLE_PALETTE[(i * 3 + 2) % PEOPLE_PALETTE.length]
    if (i === 0) {
      // ground: two wandering, one on the sofa
      people.push(<Person key={`p${i}a`} pose="walk" axis="x" x={0.15} z={-0.15} range={0.9} baseY={fy} {...a} phase={0} />)
      people.push(<Person key={`p${i}b`} pose="walk" axis="z" x={-0.45} z={0.45} range={0.7} baseY={fy} {...b} phase={2.4} speed={0.9} />)
      people.push(<Person key={`p${i}c`} pose="sit" x={0.6} z={1.12} baseY={fy + 0.26} {...c} phase={1.2} />)
    } else if (isTop) {
      // bedroom: one asleep, one wandering, one sitting
      people.push(<Person key={`p${i}a`} pose="sleep" x={-0.55} z={-1.22} baseY={fy + 0.5} {...a} phase={0.5} />)
      people.push(<Person key={`p${i}b`} pose="walk" axis="x" x={0.5} z={0.4} range={0.7} baseY={fy} {...b} phase={1.8} />)
      people.push(<Person key={`p${i}c`} pose="sit" x={0.85} z={0.15} baseY={fy} {...c} phase={3} />)
    } else {
      // middle floor: reading + wandering
      people.push(<Person key={`p${i}a`} pose="sit" x={0.0} z={0.0} baseY={fy + 0.4} {...a} phase={0.7} />)
      people.push(<Person key={`p${i}b`} pose="walk" axis="x" x={0.3} z={-0.6} range={0.8} baseY={fy} {...b} phase={2.1} speed={1.05} />)
      people.push(<Person key={`p${i}c`} pose="walk" axis="z" x={-0.7} z={0.3} range={0.6} baseY={fy} {...c} phase={3.6} speed={0.85} />)
    }
  }
  for (let i = 0; i < N; i++) addFloorPeople(i)

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

          {/* ---- little pixel people (scale + life) ---- */}
          <group>{people}</group>

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
