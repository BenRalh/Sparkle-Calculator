import { useEffect, useRef, useState } from 'react'
import House from './House.jsx'
import {
  climates,
  parts,
  cities,
  hemisphereOf,
  equatorDir,
  applyDir,
  findCity,
  demoProject,
  getLocationSpecs,
} from './passiveData.js'
import {
  unlockAudio, playHover, playClick, setSfxEnabled,
  startMusic, stopMusic, disposeAudio, startRain, stopRain,
  playSparkle, playParty,
} from './audio.js'
import './SolMate.css'

const QUICK = ['Singapore', 'Dubai', 'Barcelona', 'London', 'Reykjavik']

const TIMES = [
  { id: 'day', label: 'Day', icon: '☀️' },
  { id: 'sunset', label: 'Sunset', icon: '🌇' },
  { id: 'night', label: 'Night', icon: '🌙' },
]
const WEATHERS = [
  { id: 'clear', label: 'Clear', icon: '☀️' },
  { id: 'cloudy', label: 'Cloudy', icon: '☁️' },
  { id: 'rain', label: 'Rain', icon: '🌧️' },
  { id: 'snow', label: 'Snow', icon: '❄️' },
]

const PALETTE = [
  '#f0e6d2', '#e8d088', '#d8b06a', '#c98a4b', '#a86a3a', '#7a4a24', '#5a3a1e',
  '#f2a65a', '#e07a3a', '#b8442e', '#8b2828', '#e8788f', '#c85a72', '#8a3a52',
  '#b7d6a8', '#7ab89a', '#4f8a56', '#2a6a4a', '#1f4a38',
  '#9fc4e8', '#5b8cc4', '#3a6aa8', '#2a4a6a', '#22324a',
  '#c98bc0', '#8a5a86', '#6a3a6a',
  '#e6e6ea', '#b0b0b8', '#7a7a82', '#4a4a52', '#2a2a30', '#1d1d1f',
  '#d8d3cb', '#8fce6a', '#5aa03a',
]
const DEF = { wall: '#e8d088', roof: '#8b2828', door: '#5a3a1e', floor: '#a86a3a', ground: '#8fce6a' }

// fun facts shown when you tap an NPC's speech bubble
const FACTS = [
  'Passive design can cut a home’s heating & cooling energy by more than half — sometimes to nearly zero.',
  'The sun is your biggest free heater: a well-placed window gains more warmth in winter than it loses.',
  'Thermal mass — like a concrete floor — is a battery for heat: it soaks up warmth by day, releases it at night.',
  'A correctly-sized eave blocks the high summer sun yet welcomes the low winter sun — automatically.',
  'Light-coloured roofs can be 20–30°C cooler than dark ones on a hot day.',
  'Deciduous trees shade you in summer, then drop their leaves to let winter sun through.',
  'Warm air rises — high openings let it escape and pull cool air in below. That’s the “stack effect”.',
  'Double glazing traps a layer of air, roughly halving the heat lost through the glass.',
  'Cross-ventilation needs openings on two sides so a breeze can flow right through the room.',
  'Insulating the roof first usually buys the most comfort for the least money.',
  'Sealing gaps around doors and windows is one of the cheapest ways to save energy.',
  'Orientation is free while designing — but almost impossible to change once it’s built.',
  'In hot, humid climates, shade and airflow beat thermal mass (which just stores unwanted heat).',
  'The Romans used passive solar — sun-facing windows and sunrooms — over 2,000 years ago.',
]
const CUTE_FACES = ['😊', '🥰', '😎', '🌞', '✨']

// beginner "in plain terms" analogy per part
const BEGINNER = {
  sun: 'Like planting a garden — aim the house at the sun for free warmth and daylight.',
  roof: 'Like a hat and blanket for the house — the roof is the first thing to get right.',
  walls: 'Like a good jacket — insulated walls keep the indoor temperature steady.',
  windows: 'Like sunglasses — the right glass lets light in but keeps unwanted heat out.',
  eaves: "Like a cap's brim — shades the high summer sun, but lets the low winter sun in.",
  door: 'Like shutting the fridge — seal the gaps so your heated/cooled air stays inside.',
  floor: 'Like a hot-water bottle — a sunlit concrete floor soaks up warmth for the evening.',
  ground: 'Like grass vs. hot asphalt — soft, planted ground stays much cooler.',
  tree: 'Like a beach umbrella — a well-placed tree shades and cools the house for free.',
  zoning: 'Like only heating the room you’re in — group spaces by how they’re used.',
}

// small illustration per part
const PART_DIAGRAM = {
  sun: 'orientation', zoning: 'orientation',
  eaves: 'shading',
  windows: 'glazing',
  roof: 'insulation', walls: 'insulation', door: 'insulation',
  floor: 'mass',
  ground: 'landscape', tree: 'landscape',
}
const DIAGRAM_CAP = {
  orientation: 'Face living spaces toward the sun; the harsh side gets small, shaded openings.',
  shading: 'A correctly-sized overhang blocks the high summer sun and admits the low winter sun.',
  glazing: 'Double glazing traps a layer of air, so far less heat leaks through the glass.',
  insulation: 'Insulation in the roof and walls slows heat escaping in winter and entering in summer.',
  mass: 'Thermal mass (a sunlit slab) stores daytime warmth and releases it as the air cools.',
  landscape: 'Deciduous trees and soft ground shade and cool the site — nature’s free air-con.',
}

function Diagram({ type }) {
  const t = type
  return (
    <svg className="sm-diagram" viewBox="0 0 220 116" role="img">
      <rect x="0" y="98" width="220" height="18" fill="#cde6b4" />
      {t === 'orientation' && (
        <>
          <path d="M18 96 A 96 74 0 0 1 202 96" fill="none" stroke="#f2b45a" strokeWidth="2.5" strokeDasharray="5 5" />
          <circle cx="46" cy="70" r="10" fill="#ffcf33" />
          <rect x="92" y="60" width="52" height="38" fill="#e8d088" />
          <polygon points="86,60 150,60 118,36" fill="#b8442e" />
          <rect x="100" y="70" width="14" height="16" fill="#9fd6ff" />
          {[0, 1, 2].map((i) => <line key={i} x1={56 + i * 4} y1={74 - i * 3} x2={92} y2={72 - i * 6} stroke="#f2b45a" strokeWidth="2" />)}
        </>
      )}
      {t === 'shading' && (
        <>
          <rect x="70" y="52" width="70" height="46" fill="#e8d088" />
          <rect x="132" y="46" width="46" height="8" fill="#7a5a2a" />
          <rect x="80" y="62" width="22" height="26" fill="#9fd6ff" />
          <circle cx="196" cy="20" r="9" fill="#ffcf33" />
          <line x1="190" y1="26" x2="150" y2="52" stroke="#e07a3a" strokeWidth="2.5" />
          <circle cx="196" cy="66" r="8" fill="#ffd98a" />
          <line x1="189" y1="68" x2="104" y2="80" stroke="#f2c45a" strokeWidth="2.5" strokeDasharray="4 3" />
          <text x="150" y="18" fontSize="8" fill="#a86a3a">summer</text>
          <text x="152" y="98" fontSize="8" fill="#c98a4b">winter</text>
        </>
      )}
      {t === 'glazing' && (
        <>
          <rect x="70" y="24" width="80" height="68" fill="#eef4fb" stroke="#b0b0b8" strokeWidth="2" />
          <rect x="86" y="24" width="6" height="68" fill="#9fd6ff" />
          <rect x="128" y="24" width="6" height="68" fill="#9fd6ff" />
          <text x="103" y="60" fontSize="9" fill="#5b8cc4">air</text>
          <line x1="160" y1="40" x2="140" y2="40" stroke="#e07a3a" strokeWidth="2.5" markerEnd="" />
          <line x1="140" y1="40" x2="150" y2="35" stroke="#e07a3a" strokeWidth="2.5" />
          <line x1="140" y1="40" x2="150" y2="45" stroke="#e07a3a" strokeWidth="2.5" />
          <text x="158" y="80" fontSize="8" fill="#6e6e73">heat kept in</text>
        </>
      )}
      {t === 'insulation' && (
        <>
          <rect x="60" y="20" width="26" height="78" fill="#e8d088" />
          <rect x="86" y="20" width="20" height="78" fill="#f2cc8f" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="86" y1={22 + i * 10} x2="106" y2={28 + i * 10} stroke="#e0a24a" strokeWidth="2" />
          ))}
          <rect x="106" y="20" width="10" height="78" fill="#c98a4b" />
          {[38, 60, 82].map((y, i) => (
            <g key={i}>
              <line x1="150" y1={y} x2="120" y2={y} stroke="#b8442e" strokeWidth="2.5" />
              <line x1="120" y1={y} x2="130" y2={y - 5} stroke="#b8442e" strokeWidth="2.5" />
              <line x1="120" y1={y} x2="130" y2={y + 5} stroke="#b8442e" strokeWidth="2.5" />
            </g>
          ))}
          <text x="150" y="106" fontSize="8" fill="#6e6e73">heat blocked</text>
        </>
      )}
      {t === 'mass' && (
        <>
          <circle cx="40" cy="26" r="9" fill="#ffcf33" />
          <line x1="46" y1="32" x2="96" y2="72" stroke="#f2b45a" strokeWidth="2.5" />
          <rect x="70" y="76" width="110" height="18" fill="#9a9088" />
          <rect x="70" y="76" width="110" height="5" fill="#b0a89c" />
          <path d="M96 74 q6 -12 12 0 q6 -12 12 0" fill="none" stroke="#e07a3a" strokeWidth="2" />
          <text x="120" y="90" fontSize="8" fill="#3c2f22">stores heat</text>
        </>
      )}
      {t === 'landscape' && (
        <>
          <rect x="118" y="58" width="56" height="40" fill="#e8d088" />
          <polygon points="112,58 180,58 146,36" fill="#b8442e" />
          <rect x="52" y="60" width="10" height="38" fill="#7a4a24" />
          <circle cx="57" cy="52" r="26" fill="#4f8a56" />
          <circle cx="40" cy="58" r="16" fill="#5aa03a" />
          <circle cx="74" cy="58" r="16" fill="#5aa03a" />
          <circle cx="150" cy="18" r="8" fill="#ffcf33" />
          <line x1="145" y1="24" x2="80" y2="46" stroke="#f2c45a" strokeWidth="2" strokeDasharray="4 3" />
        </>
      )}
    </svg>
  )
}

// cute pixel-art sun logo (blocky rays + smiley)
const SUN_GRID = [
  '...........', '.....R.....', '..R.....R..', '....SSS....', '...SSSSS...',
  '.R.SDSDS.R.', '...SDDDS...', '....SSS....', '..R.....R..', '.....R.....', '...........',
]
const SUN_COLORS = { S: '#ffcf33', R: '#ff9e1b', D: '#7a4a12' }
function PixelSun({ size = 44 }) {
  const cells = []
  SUN_GRID.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch !== '.') cells.push(<rect key={`${x}-${y}`} x={x * 4} y={y * 4} width="4" height="4" fill={SUN_COLORS[ch]} />)
    }
  })
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" shapeRendering="crispEdges" className="sm-logo" aria-hidden="true">
      {cells}
    </svg>
  )
}

function skyGradient(tod, weather) {
  const base = { day: ['#a9e2ff', '#eaf7ff'], sunset: ['#ff8f5e', '#ffd9a8'], night: ['#0b1733', '#243a66'] }[tod]
  if (weather === 'rain' || weather === 'cloudy') return { day: ['#9aa7b3', '#cfd7de'], sunset: ['#8a6f70', '#c4a892'], night: ['#0a1020', '#1c2640'] }[tod]
  if (weather === 'snow') return { day: ['#cdd9e6', '#f0f5fb'], sunset: ['#b6a6b4', '#e6d8de'], night: ['#101a30', '#2a3550'] }[tod]
  return base
}

function Segmented({ items, value, onChange }) {
  return (
    <div className="sm-seg">
      {items.map((it) => (
        <button key={it.id} className={`sm-seg-btn${value === it.id ? ' on' : ''}`} onClick={() => onChange(it.id)}>
          {it.icon && <span className="sm-seg-ico">{it.icon}</span>}{it.label}
        </button>
      ))}
    </div>
  )
}

function Palette({ label, value, onChange }) {
  return (
    <div className="sm-pal">
      <span className="sm-field-label">{label}</span>
      <div className="sm-pal-grid">
        {PALETTE.map((c) => (
          <button key={c} className={`sm-pal-sw${value === c ? ' on' : ''}`} style={{ background: c }} onClick={() => onChange(c)} aria-label={`${label} ${c}`} />
        ))}
      </div>
    </div>
  )
}

function Toggle({ on, onChange, children }) {
  return (
    <button className="sm-toggle-row" onClick={() => onChange(!on)}>
      <span>{children}</span>
      <span className={`sm-switch${on ? ' on' : ''}`}><span className="sm-knob" /></span>
    </button>
  )
}

export default function SolMateApp() {
  const [intro, setIntro] = useState('logo')
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null) // 'time' | 'weather' | 'sound' | null

  const [cityName, setCityName] = useState('Melbourne')
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const [tod, setTod] = useState('day')
  const [weather, setWeather] = useState('clear')
  const [stories, setStories] = useState(2)
  const [windowDensity, setWindowDensity] = useState(2)
  const [wallColor, setWallColor] = useState(DEF.wall)
  const [roofColor, setRoofColor] = useState(DEF.roof)
  const [doorColor, setDoorColor] = useState(DEF.door)
  const [floorColor, setFloorColor] = useState(DEF.floor)
  const [groundColor, setGroundColor] = useState(DEF.ground)

  const [sfxOn, setSfxOn] = useState(true)
  const [musicOn, setMusicOn] = useState(true)

  // game juice: confetti, fun-fact toast, easter eggs
  const [confetti, setConfetti] = useState([])
  const [fact, setFact] = useState(null)
  const [logoSpin, setLogoSpin] = useState(false)
  const [rainbow, setRainbow] = useState(false)
  const confettiId = useRef(0)
  const factTimer = useRef(null)
  const bubbleCount = useRef(0)
  const demoClicks = useRef(0)

  const rootRef = useRef(null)

  const city = findCity(cityName) || cities[0]
  const climate = climates[city.climate]
  const hemi = hemisphereOf(city.lat)
  const absLat = Math.abs(city.lat)
  const sunHeight = absLat < 23.5 ? 'high overhead' : absLat < 45 ? 'at a moderate angle' : 'low in the sky'

  const results = query.trim()
    ? cities.filter((c) => (c.name + ' ' + c.country).toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : []

  const part = selected ? parts[selected] : null
  const rec = part ? part.byClimate[city.climate] : null
  const specs = part ? getLocationSpecs(selected, city.climate, absLat, hemi) : []
  const diagram = selected ? PART_DIAGRAM[selected] : null

  const sky = skyGradient(tod, weather)
  const cityQ = encodeURIComponent(`${city.name} ${city.country}`)

  // UI sounds via delegation across the whole app
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let last = null
    const onOver = (e) => { const b = e.target.closest('button, .sm-input'); if (b && b !== last) { last = b; playHover() } }
    const onDown = (e) => { unlockAudio(); const b = e.target.closest('button'); if (b) playClick() }
    el.addEventListener('mouseover', onOver)
    el.addEventListener('pointerdown', onDown)
    return () => { el.removeEventListener('mouseover', onOver); el.removeEventListener('pointerdown', onDown) }
  }, [])

  useEffect(() => () => disposeAudio(), [])
  useEffect(() => { setSfxEnabled(sfxOn) }, [sfxOn])
  useEffect(() => { if (weather === 'rain' && sfxOn) startRain(); else stopRain() }, [weather, sfxOn])

  // konami code → party 🎉
  useEffect(() => {
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let i = 0
    const onKey = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      i = (k === seq[i]) ? i + 1 : (k === seq[0] ? 1 : 0)
      if (i === seq.length) { i = 0; playParty(); celebrate('🎉', 40) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const celebrate = (emoji, count = 18) => {
    const pieces = Array.from({ length: count }, () => ({
      id: confettiId.current++, emoji,
      left: Math.random() * 100, delay: Math.random() * 0.35,
      dur: 1.7 + Math.random() * 1.3, rot: Math.random() * 100 - 50,
    }))
    setConfetti((c) => [...c, ...pieces])
    const ids = new Set(pieces.map((p) => p.id))
    setTimeout(() => setConfetti((c) => c.filter((p) => !ids.has(p.id))), 3400)
  }
  const showFact = (text, big = false) => {
    setFact({ text, big })
    if (factTimer.current) clearTimeout(factTimer.current)
    factTimer.current = setTimeout(() => setFact(null), big ? 2400 : 6500)
  }
  const onBubbleClick = () => {
    unlockAudio(); playClick()
    bubbleCount.current += 1
    if (bubbleCount.current % 3 === 0) showFact(CUTE_FACES[Math.floor(Math.random() * CUTE_FACES.length)], true)
    else showFact(FACTS[Math.floor(Math.random() * FACTS.length)])
  }
  const critterEgg = (emoji) => celebrate(emoji, 12)
  const popLogo = () => { playSparkle(); celebrate('☀️', 16); setLogoSpin(true); setTimeout(() => setLogoSpin(false), 700) }

  const pick = (name) => { setCityName(name); setQuery(''); setOpen(false) }
  const selectPart = (id) => {
    playClick(); setSelected(id)
    if (id === 'sun') { playSparkle(); celebrate('✨', 12) }
  }
  const onSearch = (v) => {
    setQuery(v); setOpen(true)
    const low = v.toLowerCase().trim()
    if (low === 'rainbow') { setRainbow(true); celebrate('🌈', 22); setTimeout(() => setRainbow(false), 4500) }
    else if (low === 'unicorn') celebrate('🦄', 20)
    else if (low === 'party') { playParty(); celebrate('🎉', 30) }
  }
  const toggleMenu = (name) => setOpenMenu((m) => (m === name ? null : name))
  const openCustomize = () => { setOpenMenu(null); setCustomizeOpen(true) }
  const toggleMusic = (n) => { setMusicOn(n); if (n) { unlockAudio(); startMusic() } else stopMusic() }

  const loadDemo = () => {
    setCityName(demoProject.cityName); setSelected(demoProject.part)
    setTod('day'); setWeather('clear'); setStories(2); setWindowDensity(2)
    setWallColor(DEF.wall); setRoofColor(DEF.roof); setDoorColor(DEF.door)
    setFloorColor(DEF.floor); setGroundColor(DEF.ground)
    setQuery(''); setOpen(false)
    demoClicks.current += 1
    if (demoClicks.current % 5 === 0) { playParty(); celebrate('🎉', 30) }
  }

  const startTutorial = () => { unlockAudio(); playClick(); startMusic(); setIntro('tutorial') }
  const startApp = () => { playClick(); setIntro('done') }

  return (
    <div className="sm-app" ref={rootRef}>
      <section className="sm-stage" style={{ background: `linear-gradient(170deg, ${sky[0]}, ${sky[1]})` }}>
        <div className={`sm-stars${tod !== 'day' ? ' on' : ''}`} />
        <div className="sm-project">📍 {city.name}, {city.country}</div>
        <House
          selected={selected} onSelect={selectPart} lat={city.lat}
          groundColor={groundColor} floorColor={floorColor}
          stories={stories} wallColor={wallColor} roofColor={roofColor} doorColor={doorColor}
          windowDensity={windowDensity} timeOfDay={tod} weather={weather}
          onEgg={critterEgg} onBubbleClick={onBubbleClick}
        />

        {rainbow && <div className="sm-rainbow" />}
        {fact && (
          <div className={`sm-fact${fact.big ? ' sm-fact-big' : ''}`} onClick={() => setFact(null)}>
            {!fact.big && <span className="sm-fact-ico">💡</span>}
            <span>{fact.text}</span>
          </div>
        )}

        {/* floating game controls */}
        <div className="sm-tools">
          <div className="sm-tool-wrap">
            {openMenu === 'time' && (
              <div className="sm-pop">
                {TIMES.map((o) => <button key={o.id} className={`sm-pop-item${tod === o.id ? ' on' : ''}`} onClick={() => { setTod(o.id); setOpenMenu(null) }}>{o.icon} {o.label}</button>)}
              </div>
            )}
            <button className={`sm-tool${openMenu === 'time' ? ' on' : ''}`} onClick={() => toggleMenu('time')}><span>🕘</span><em>Time</em></button>
          </div>
          <div className="sm-tool-wrap">
            {openMenu === 'weather' && (
              <div className="sm-pop">
                {WEATHERS.map((o) => <button key={o.id} className={`sm-pop-item${weather === o.id ? ' on' : ''}`} onClick={() => { setWeather(o.id); setOpenMenu(null) }}>{o.icon} {o.label}</button>)}
              </div>
            )}
            <button className={`sm-tool${openMenu === 'weather' ? ' on' : ''}`} onClick={() => toggleMenu('weather')}><span>🌦️</span><em>Weather</em></button>
          </div>
          <div className="sm-tool-wrap">
            <button className="sm-tool" onClick={openCustomize}><span>🎨</span><em>Customize</em></button>
          </div>
          <div className="sm-tool-wrap">
            {openMenu === 'sound' && (
              <div className="sm-pop sm-pop-sound">
                <Toggle on={sfxOn} onChange={setSfxOn}>🔊 Sound effects</Toggle>
                <Toggle on={musicOn} onChange={toggleMusic}>🎵 Music</Toggle>
              </div>
            )}
            <button className={`sm-tool${openMenu === 'sound' ? ' on' : ''}`} onClick={() => toggleMenu('sound')}><span>{sfxOn || musicOn ? '🔊' : '🔈'}</span><em>Sound</em></button>
          </div>
        </div>
      </section>

      {/* right panel — purely for learning */}
      <aside className="sm-panel">
        <header className="sm-brand">
          <button className={`sm-brand-row${logoSpin ? ' spin' : ''}`} onClick={popLogo} aria-label="Sol Mate"><PixelSun size={46} /><h1>Sol Mate</h1></button>
          <p className="sm-tag">Learn passive design by playing.</p>
        </header>

        <button className="sm-demo" onClick={loadDemo}>✨ Load demo project</button>

        <div className="sm-block">
          <div className="sm-block-title">Location</div>
          <div className="sm-search">
            <input className="sm-input" placeholder="Search any city…  e.g. Tokyo, Cairo" value={query}
              onChange={(e) => onSearch(e.target.value)} onFocus={() => setOpen(true)} />
            {open && results.length > 0 && (
              <ul className="sm-results">
                {results.map((c) => (
                  <li key={c.name}>
                    <button className="sm-result" onClick={() => pick(c.name)}>
                      <span>{c.name}<span className="sm-muted">, {c.country}</span></span>
                      <span className="sm-result-tag" style={{ color: climates[c.climate].accent }}>{climates[c.climate].name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="sm-quick">
            {QUICK.map((q) => <button key={q} className={`sm-qchip${cityName === q ? ' on' : ''}`} onClick={() => pick(q)}>{q}</button>)}
          </div>
          <div className="sm-loc">
            <p className="sm-climate-line">
              <strong style={{ color: climate.accent }}>{climate.name}</strong>
              <span className="sm-muted"> · {Math.round(absLat)}°{hemi} latitude</span>
            </p>
            <p className="sm-blurb">{climate.blurb}</p>
            <div className="sm-priorities">
              {climate.priorities.map((p, i) => <span className="sm-chip" key={p}><b style={{ color: climate.accent }}>{i + 1}</b> {p}</span>)}
            </div>
            <p className="sm-hemi">🧭 {hemi === 'S' ? 'Southern' : 'Northern'} hemisphere — face living spaces <strong>{equatorDir(hemi)}</strong>. At noon the sun sits <strong>{sunHeight}</strong> here.</p>
          </div>
        </div>

        <div className="sm-card">
          {part ? (
            <div className="sm-rec">
              <div className="sm-rec-head">
                <span className="sm-rec-emoji">{part.emoji}</span>
                <div><h2>{part.label}</h2><span className="sm-rec-tag">{part.tagline}</span></div>
              </div>

              {diagram && (
                <div className="sm-diagram-wrap">
                  <Diagram type={diagram} />
                  <p className="sm-diagram-cap">{DIAGRAM_CAP[diagram]}</p>
                </div>
              )}

              <div className="sm-rec-row sm-plain">
                <h3>🔰 In plain terms</h3>
                <p>{BEGINNER[selected]}</p>
              </div>
              <div className="sm-rec-row"><h3>✅ Do this</h3><p>{applyDir(rec.what, hemi)}</p></div>
              <div className="sm-rec-row"><h3>💡 Why it works</h3><p>{applyDir(part.why, hemi)}</p></div>
              <div className="sm-rec-row sm-here" style={{ borderColor: climate.accent }}>
                <h3 style={{ color: climate.accent }}>📍 In {city.name} ({climate.name})</h3>
                <p>{applyDir(rec.here, hemi)}</p>
              </div>
              {specs.length > 0 && (
                <div className="sm-rec-row sm-specs">
                  <h3>📐 Target specs — {city.name}</h3>
                  <ul className="sm-spec-list">
                    {specs.map((s, i) => <li key={i}><span className="sm-spec-label">{s.label}:</span> <strong>{s.value}</strong></li>)}
                  </ul>
                </div>
              )}
              <div className="sm-rec-row sm-human"><h3>🧑‍🔧 Where you still need a human</h3><p>{part.human}</p></div>

              <div className="sm-links">
                <h3>🔗 Learn more</h3>
                <a href={`https://www.google.com/search?q=passive+solar+house+design+${cityQ}`} target="_blank" rel="noopener noreferrer">Passive design for {city.name} ↗</a>
                <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(city.name)}#Climate`} target="_blank" rel="noopener noreferrer">{city.name} climate data ↗</a>
                <a href="https://www.yourhome.gov.au/passive-design" target="_blank" rel="noopener noreferrer">Passive design basics — Your Home ↗</a>
              </div>
            </div>
          ) : (
            <div className="sm-empty">
              <div className="sm-empty-big">👋</div>
              <p><strong>New to passive design?</strong> It's how a building stays comfy using sun, shade and airflow — instead of leaning on aircon and heating.</p>
              <p>Pick a city, then <strong>tap any part of the house</strong> — the sun, roof, windows, walls, ground — to learn what to do and why, right here in {city.name}.</p>
              <p className="sm-muted">New here? Hit ✨ Load demo project to see an example.</p>
            </div>
          )}
        </div>

        <footer className="sm-foot">
          Powered by the <strong className="sm-egg-foot" onClick={() => celebrate('💖', 16)}>Sol Mate</strong> passive-design skill. Advice is a starting point — not a substitute for a thermal model, local code, or your own design judgement.
        </footer>
      </aside>

      {/* confetti overlay */}
      {confetti.length > 0 && (
        <div className="sm-confetti">
          {confetti.map((p) => (
            <span key={p.id} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, '--rot': `${p.rot}deg` }}>{p.emoji}</span>
          ))}
        </div>
      )}

      {/* customize drawer */}
      {customizeOpen && (
        <>
          <div className="sm-drawer-backdrop" onClick={() => setCustomizeOpen(false)} />
          <div className="sm-drawer" role="dialog" aria-label="Customize the house">
            <div className="sm-drawer-head">
              <h2>🎨 Customize the house</h2>
              <button className="sm-drawer-close" onClick={() => setCustomizeOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="sm-drawer-body">
              <div className="sm-field">
                <span className="sm-field-label">Storeys</span>
                <Segmented items={[{ id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }]} value={stories} onChange={setStories} />
              </div>
              <div className="sm-field">
                <span className="sm-field-label">Windows</span>
                <Segmented items={[{ id: 1, label: 'Few' }, { id: 2, label: 'Some' }, { id: 3, label: 'Many' }]} value={windowDensity} onChange={setWindowDensity} />
              </div>
              <Palette label="Walls" value={wallColor} onChange={setWallColor} />
              <Palette label="Roof" value={roofColor} onChange={setRoofColor} />
              <Palette label="Door" value={doorColor} onChange={setDoorColor} />
              <Palette label="Floors" value={floorColor} onChange={setFloorColor} />
              <Palette label="Ground" value={groundColor} onChange={setGroundColor} />
            </div>
            <button className="sm-drawer-done" onClick={() => setCustomizeOpen(false)}>Done</button>
          </div>
        </>
      )}

      {/* intro: splash → tutorial → start */}
      {intro !== 'done' && (
        <div className="sm-intro">
          {intro === 'logo' ? (
            <button className="sm-splash" onClick={startTutorial} aria-label="Start Sol Mate">
              <div className="sm-splash-sun"><PixelSun size={150} /></div>
              <h1 className="sm-splash-title">Sol Mate</h1>
              <p className="sm-splash-sub">Learn passive design by playing</p>
              <span className="sm-splash-cta">▶ Click to start</span>
            </button>
          ) : (
            <div className="sm-tut">
              <div className="sm-tut-logo"><PixelSun size={64} /></div>
              <h2>How Sol Mate works</h2>
              <p className="sm-tut-lead"><strong>Passive design</strong> keeps a building comfy using the sun, shade and airflow — instead of leaning on aircon and heating. Here's how to explore it:</p>
              <ol className="sm-tut-steps">
                <li><span className="sm-tut-ico">🌍</span><div><strong>Pick a place</strong><span>Search any city — the sun and climate update to match it.</span></div></li>
                <li><span className="sm-tut-ico">👆</span><div><strong>Tap the house</strong><span>Click the sun, roof, windows or walls for tips made for that spot.</span></div></li>
                <li><span className="sm-tut-ico">💡</span><div><strong>Learn the why</strong><span>Each part shows a diagram, plain-English tips and the reasons.</span></div></li>
                <li><span className="sm-tut-ico">🎮</span><div><strong>Play around</strong><span>Use the on-screen buttons for time, weather, and to customize the house.</span></div></li>
              </ol>
              <div className="sm-tut-demo">
                <div className="sm-tut-house"><div className="sm-tut-roof" /><div className="sm-tut-body" /><span className="sm-tut-cursor">👆</span></div>
                <span className="sm-tut-demo-cap">…tap a part to learn about it</span>
              </div>
              <button className="sm-tut-next" onClick={startApp}>Start playing →</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
