import { useEffect, useRef, useState } from 'react'
import House from './House.jsx'
import {
  climates,
  parts,
  cities,
  groundCovers,
  groundCoverOrder,
  hemisphereOf,
  equatorDir,
  applyDir,
  findCity,
  demoProject,
  getLocationSpecs,
} from './passiveData.js'
import { unlockAudio, playHover, playClick, setSfxEnabled, startMusic, stopMusic, disposeAudio } from './audio.js'
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
const WALL_SWATCHES = ['#e8d088', '#f0e6d2', '#d88860', '#aeb6bf', '#c2d2b4']
const ROOF_SWATCHES = ['#8b2828', '#3a5a8b', '#4a4a52', '#2a6a4a', '#8a6a20']
const DOOR_SWATCHES = ['#6a3010', '#2a4a6a', '#3a6a2a', '#7a3a6a', '#222428']

// time-of-day + weather → stage sky gradient
function skyGradient(tod, weather) {
  const base = {
    day: ['#a9e2ff', '#eaf7ff'],
    sunset: ['#ff8f5e', '#ffd9a8'],
    night: ['#0b1733', '#243a66'],
  }[tod]
  if (weather === 'rain' || weather === 'cloudy') {
    return { day: ['#9aa7b3', '#cfd7de'], sunset: ['#8a6f70', '#c4a892'], night: ['#0a1020', '#1c2640'] }[tod]
  }
  if (weather === 'snow') {
    return { day: ['#cdd9e6', '#f0f5fb'], sunset: ['#b6a6b4', '#e6d8de'], night: ['#101a30', '#2a3550'] }[tod]
  }
  return base
}

function Segmented({ items, value, onChange }) {
  return (
    <div className="sm-seg">
      {items.map((it) => (
        <button
          key={it.id}
          className={`sm-seg-btn${value === it.id ? ' on' : ''}`}
          onClick={() => onChange(it.id)}
        >
          {it.icon && <span className="sm-seg-ico">{it.icon}</span>}
          {it.label}
        </button>
      ))}
    </div>
  )
}

function Swatches({ colors, value, onChange, label }) {
  return (
    <div className="sm-swatch-row">
      <span className="sm-swatch-label">{label}</span>
      <div className="sm-swatches">
        {colors.map((c) => (
          <button
            key={c}
            className={`sm-swatch${value === c ? ' on' : ''}`}
            style={{ background: c }}
            onClick={() => onChange(c)}
            aria-label={`${label} ${c}`}
          />
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
  const [cityName, setCityName] = useState('Melbourne')
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const [ground, setGround] = useState('lawn')
  const [tod, setTod] = useState('day')
  const [weather, setWeather] = useState('clear')
  const [stories, setStories] = useState(2)
  const [wallColor, setWallColor] = useState(WALL_SWATCHES[0])
  const [roofColor, setRoofColor] = useState(ROOF_SWATCHES[0])
  const [doorColor, setDoorColor] = useState(DOOR_SWATCHES[0])
  const [windowDensity, setWindowDensity] = useState(2)
  const [neighbors, setNeighbors] = useState(false)
  const [neighborDist, setNeighborDist] = useState(5)

  const [sfxOn, setSfxOn] = useState(true)
  const [musicOn, setMusicOn] = useState(false)

  const panelRef = useRef(null)

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

  const sky = skyGradient(tod, weather)

  // --- audio: unlock on first gesture, play UI sounds via delegation ---
  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    let last = null
    const onOver = (e) => {
      const b = e.target.closest('button, .sm-input')
      if (b && b !== last) { last = b; playHover() }
    }
    const onDown = (e) => {
      unlockAudio()
      const b = e.target.closest('button')
      if (b) playClick()
    }
    el.addEventListener('mouseover', onOver)
    el.addEventListener('pointerdown', onDown)
    const unlockOnce = () => unlockAudio()
    window.addEventListener('pointerdown', unlockOnce, { once: true })
    return () => {
      el.removeEventListener('mouseover', onOver)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerdown', unlockOnce)
    }
  }, [])

  useEffect(() => () => disposeAudio(), [])
  useEffect(() => { setSfxEnabled(sfxOn) }, [sfxOn])
  useEffect(() => { if (musicOn) startMusic(); else stopMusic() }, [musicOn])

  const pick = (name) => { setCityName(name); setQuery(''); setOpen(false) }
  const selectPart = (id) => { playClick(); setSelected(id) }
  const loadDemo = () => {
    setCityName(demoProject.cityName)
    setSelected(demoProject.part)
    setGround('lawn'); setTod('day'); setWeather('clear'); setStories(2)
    setWallColor(WALL_SWATCHES[0]); setRoofColor(ROOF_SWATCHES[0]); setDoorColor(DOOR_SWATCHES[0])
    setWindowDensity(2); setNeighbors(false)
    setQuery(''); setOpen(false)
  }

  return (
    <div className="sm-app">
      <section className="sm-stage" style={{ background: `linear-gradient(170deg, ${sky[0]}, ${sky[1]})` }}>
        <div className={`sm-stars${tod !== 'day' ? ' on' : ''}`} />
        <div className="sm-hint">🖐️ Drag to orbit · 👆 Tap any part of the house</div>
        <div className="sm-project">📍 {city.name}, {city.country}</div>
        <House
          selected={selected}
          onSelect={selectPart}
          lat={city.lat}
          ground={ground}
          stories={stories}
          wallColor={wallColor}
          roofColor={roofColor}
          doorColor={doorColor}
          windowDensity={windowDensity}
          neighbors={neighbors}
          neighborDist={neighborDist}
          timeOfDay={tod}
          weather={weather}
        />
      </section>

      <aside className="sm-panel" ref={panelRef}>
        <header className="sm-brand">
          <h1>Sol Mate <span className="sm-sun">☀️</span></h1>
          <p className="sm-tag">Passive design, anywhere on Earth.</p>
        </header>

        <button className="sm-demo" onClick={loadDemo}>✨ Load demo project</button>

        {/* ---- Location ---- */}
        <div className="sm-block">
          <div className="sm-block-title">Location</div>
          <div className="sm-search">
            <input
              className="sm-input"
              placeholder="Search any city…  e.g. Tokyo, Cairo"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
            />
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
            {QUICK.map((q) => (
              <button key={q} className={`sm-qchip${cityName === q ? ' on' : ''}`} onClick={() => pick(q)}>{q}</button>
            ))}
          </div>
          <div className="sm-loc">
            <p className="sm-climate-line">
              <strong style={{ color: climate.accent }}>{climate.name}</strong>
              <span className="sm-muted"> · {Math.round(absLat)}°{hemi} latitude</span>
            </p>
            <p className="sm-blurb">{climate.blurb}</p>
            <div className="sm-priorities">
              {climate.priorities.map((p, i) => (
                <span className="sm-chip" key={p}><b style={{ color: climate.accent }}>{i + 1}</b> {p}</span>
              ))}
            </div>
            <p className="sm-hemi">🧭 {hemi === 'S' ? 'Southern' : 'Northern'} hemisphere — face living spaces <strong>{equatorDir(hemi)}</strong>. At noon the sun sits <strong>{sunHeight}</strong> here.</p>
          </div>
        </div>

        {/* ---- Scene ---- */}
        <div className="sm-block">
          <div className="sm-block-title">Scene</div>
          <div className="sm-field"><span className="sm-field-label">Time of day</span><Segmented items={TIMES} value={tod} onChange={setTod} /></div>
          <div className="sm-field"><span className="sm-field-label">Weather</span><Segmented items={WEATHERS} value={weather} onChange={setWeather} /></div>
        </div>

        {/* ---- Customize ---- */}
        <div className="sm-block">
          <div className="sm-block-title">Customize the house</div>
          <div className="sm-field">
            <span className="sm-field-label">Storeys</span>
            <Segmented items={[{ id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }]} value={stories} onChange={setStories} />
          </div>
          <div className="sm-field">
            <span className="sm-field-label">Windows</span>
            <Segmented items={[{ id: 1, label: 'Few' }, { id: 2, label: 'Some' }, { id: 3, label: 'Many' }]} value={windowDensity} onChange={setWindowDensity} />
          </div>
          <Swatches colors={WALL_SWATCHES} value={wallColor} onChange={setWallColor} label="Walls" />
          <Swatches colors={ROOF_SWATCHES} value={roofColor} onChange={setRoofColor} label="Roof" />
          <Swatches colors={DOOR_SWATCHES} value={doorColor} onChange={setDoorColor} label="Door" />
          <div className="sm-field">
            <span className="sm-field-label">Ground</span>
            <Segmented items={groundCoverOrder.map((g) => ({ id: g, label: groundCovers[g].label }))} value={ground} onChange={setGround} />
          </div>
          <Toggle on={neighbors} onChange={setNeighbors}>Surrounding buildings</Toggle>
          {neighbors && (
            <div className="sm-slider-row">
              <span className="sm-field-label">Distance</span>
              <input
                className="sm-slider"
                type="range" min="3.5" max="7" step="0.5"
                value={neighborDist}
                onChange={(e) => setNeighborDist(parseFloat(e.target.value))}
              />
              <span className="sm-slider-val">{neighborDist <= 4 ? 'Close' : neighborDist >= 6.5 ? 'Far' : 'Mid'}</span>
            </div>
          )}
        </div>

        {/* ---- Sound ---- */}
        <div className="sm-block">
          <div className="sm-block-title">Sound</div>
          <Toggle on={sfxOn} onChange={setSfxOn}>🔊 Click sounds</Toggle>
          <Toggle on={musicOn} onChange={setMusicOn}>🎵 Ambient music</Toggle>
        </div>

        {/* ---- Recommendation ---- */}
        <div className="sm-card">
          {part ? (
            <div className="sm-rec">
              <div className="sm-rec-head">
                <span className="sm-rec-emoji">{part.emoji}</span>
                <div>
                  <h2>{part.label}</h2>
                  <span className="sm-rec-tag">{part.tagline}</span>
                </div>
              </div>
              <div className="sm-rec-row"><h3>✅ Do this</h3><p>{applyDir(rec.what, hemi)}</p></div>
              <div className="sm-rec-row"><h3>💡 Why</h3><p>{applyDir(part.why, hemi)}</p></div>
              <div className="sm-rec-row sm-here" style={{ borderColor: climate.accent }}>
                <h3 style={{ color: climate.accent }}>📍 In {city.name} ({climate.name})</h3>
                <p>{applyDir(rec.here, hemi)}</p>
              </div>
              {specs.length > 0 && (
                <div className="sm-rec-row sm-specs">
                  <h3>📐 Target specs — {city.name}</h3>
                  <ul className="sm-spec-list">
                    {specs.map((s, i) => (
                      <li key={i}><span className="sm-spec-label">{s.label}:</span> <strong>{s.value}</strong></li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="sm-rec-row sm-human"><h3>🧑‍🔧 Where you still need a human</h3><p>{part.human}</p></div>
            </div>
          ) : (
            <div className="sm-empty">
              <div className="sm-empty-big">👆</div>
              <p>Tap a part of the house — roof, windows, walls, the sun, the ground — for passive-design advice tuned to {city.name}.</p>
              <p className="sm-muted">Or hit ✨ Load demo project.</p>
            </div>
          )}
        </div>

        <footer className="sm-foot">
          Powered by the <strong>Sol Mate</strong> passive-design skill. Advice is a starting point — not a substitute for a thermal model, local code, or your own design judgement.
        </footer>
      </aside>
    </div>
  )
}
