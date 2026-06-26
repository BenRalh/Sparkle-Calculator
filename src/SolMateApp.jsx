import { useState } from 'react'
import House from './House.jsx'
import {
  climates,
  parts,
  partOrder,
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
import './SolMate.css'

const QUICK = ['Singapore', 'Dubai', 'Barcelona', 'London', 'Reykjavik']

export default function SolMateApp() {
  const [cityName, setCityName] = useState('Melbourne')
  const [selected, setSelected] = useState(null)
  const [ground, setGround] = useState('lawn')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const city = findCity(cityName) || cities[0]
  const climate = climates[city.climate]
  const hemi = hemisphereOf(city.lat)
  const absLat = Math.abs(city.lat)
  const sunHeight = absLat < 23.5 ? 'high overhead' : absLat < 45 ? 'at a moderate angle' : 'low in the sky'

  const results = query.trim()
    ? cities
        .filter((c) => (c.name + ' ' + c.country).toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 8)
    : []

  const pick = (name) => {
    setCityName(name)
    setQuery('')
    setOpen(false)
  }
  const loadDemo = () => {
    setCityName(demoProject.cityName)
    setSelected(demoProject.part)
    setGround('lawn')
    setQuery('')
    setOpen(false)
  }

  const part = selected ? parts[selected] : null
  const rec = part ? part.byClimate[city.climate] : null
  const specs = part ? getLocationSpecs(selected, city.climate, absLat, hemi) : []

  return (
    <div className="sm-app">
      <section
        className="sm-stage"
        style={{ background: `linear-gradient(165deg, ${climate.sky[0]}, ${climate.sky[1]})` }}
      >
        <div className="sm-hint">🖐️ Drag · 👆 Click any part</div>
        <div className="sm-project">📍 {city.name}, {city.country}</div>
        <House selected={selected} onSelect={setSelected} lat={city.lat} ground={ground} />
      </section>

      <aside className="sm-panel">
        <header className="sm-brand">
          <h1>Sol&nbsp;Mate <span className="sm-sun">☀️</span></h1>
          <p className="sm-tag">Passive design, anywhere on Earth.</p>
        </header>

        <button className="sm-demo" onClick={loadDemo}>✨ Load demo project</button>

        {/* ---- Location ---- */}
        <div className="sm-block">
          <div className="sm-block-title">Location</div>
          <div className="sm-search">
            <input
              className="sm-input"
              placeholder="🔍 Search any city… (e.g. Tokyo, Cairo)"
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
                      <span className="sm-result-tag" style={{ color: climates[c.climate].accent }}>
                        {climates[c.climate].name}
                      </span>
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
                <span className="sm-chip" key={p} style={{ borderColor: climate.accent }}>
                  <b style={{ color: climate.accent }}>{i + 1}</b> {p}
                </span>
              ))}
            </div>
            <p className="sm-hemi">
              🧭 {hemi === 'S' ? 'Southern' : 'Northern'} hemisphere — face living spaces{' '}
              <strong>{equatorDir(hemi)}</strong> (harsh sun from the west).
            </p>
            <p className="sm-hemi">☀️ At noon the sun sits <strong>{sunHeight}</strong> here.</p>
          </div>
        </div>

        {/* ---- Building part ---- */}
        <div className="sm-block">
          <div className="sm-block-title">Building part</div>
          <div className="sm-parts">
            {partOrder.map((id) => (
              <button
                key={id}
                className={`sm-part${selected === id ? ' on' : ''}`}
                onClick={() => setSelected(id)}
              >
                <span className="sm-part-emoji">{parts[id].emoji}</span>
                <span>{parts[id].label}</span>
              </button>
            ))}
          </div>
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

              {selected === 'ground' && (
                <div className="sm-ground">
                  {groundCoverOrder.map((g) => (
                    <button
                      key={g}
                      className={`sm-gchip${ground === g ? ' on' : ''}`}
                      onClick={() => setGround(g)}
                    >
                      {groundCovers[g].label}
                    </button>
                  ))}
                </div>
              )}

              <div className="sm-rec-row">
                <h3>✅ Do this</h3>
                <p>{applyDir(rec.what, hemi)}</p>
              </div>
              <div className="sm-rec-row">
                <h3>💡 Why</h3>
                <p>{applyDir(part.why, hemi)}</p>
              </div>
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
              <div className="sm-rec-row sm-human">
                <h3>🧑‍🔧 Where you still need a human</h3>
                <p>{part.human}</p>
              </div>
            </div>
          ) : (
            <div className="sm-empty">
              <div className="sm-empty-big">👆</div>
              <p>
                Pick a <strong>location</strong>, then tap a part of the house — roof, windows, walls,
                the sun, the ground… — for advice tuned to that spot on Earth.
              </p>
              <p className="sm-muted">Or hit ✨ <em>Load demo project</em>.</p>
            </div>
          )}
        </div>

        <footer className="sm-foot">
          Powered by the <strong>Sol&nbsp;Mate</strong> passive-design skill. Advice is a starting
          point — not a substitute for a thermal model, local code, or your own design judgement.
        </footer>
      </aside>
    </div>
  )
}
