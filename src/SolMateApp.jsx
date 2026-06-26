import { useState } from 'react'
import House from './House.jsx'
import {
  climates,
  climateOrder,
  parts,
  partOrder,
  demoProject,
  HEMISPHERE_NOTE,
} from './passiveData.js'
import './SolMate.css'

export default function SolMateApp() {
  const [climate, setClimate] = useState('temperate')
  const [selected, setSelected] = useState(null)
  const [demoName, setDemoName] = useState(null)

  const c = climates[climate]

  const loadDemo = () => {
    setClimate(demoProject.climate)
    setSelected(demoProject.part)
    setDemoName(demoProject.name)
  }

  const part = selected ? parts[selected] : null
  const rec = part ? part.byClimate[climate] : null

  return (
    <div className="sm-app">
      <section
        className="sm-stage"
        style={{ background: `linear-gradient(165deg, ${c.sky[0]}, ${c.sky[1]})` }}
      >
        <div className="sm-hint">🖐️ Drag to rotate · 👆 Click a part</div>
        {demoName && <div className="sm-project">📁 {demoName}</div>}
        <House selected={selected} onSelect={setSelected} climate={climate} />
      </section>

      <aside className="sm-panel">
        <header className="sm-brand">
          <h1>Sol&nbsp;Mate <span className="sm-sun">☀️</span></h1>
          <p className="sm-tag">Passive design, by touch.</p>
        </header>

        <button className="sm-demo" onClick={loadDemo}>✨ Load demo project</button>

        <div className="sm-block">
          <div className="sm-block-title">Climate</div>
          <div className="sm-climates">
            {climateOrder.map((id) => {
              const cc = climates[id]
              const on = climate === id
              return (
                <button
                  key={id}
                  className={`sm-pill${on ? ' on' : ''}`}
                  style={on ? { background: cc.accent, borderColor: cc.accent } : undefined}
                  onClick={() => { setClimate(id); setDemoName(null) }}
                >
                  {cc.name}
                </button>
              )
            })}
          </div>
          <p className="sm-climate-line">
            <strong>{c.name}</strong> <span className="sm-muted">· {c.location}</span>
          </p>
          <p className="sm-blurb">{c.blurb}</p>
          <div className="sm-priorities">
            {c.priorities.map((p, i) => (
              <span className="sm-chip" key={p} style={{ borderColor: c.accent }}>
                <b style={{ color: c.accent }}>{i + 1}</b> {p}
              </span>
            ))}
          </div>
          <p className="sm-hemi">🧭 {HEMISPHERE_NOTE}</p>
        </div>

        <div className="sm-block">
          <div className="sm-block-title">Building part</div>
          <div className="sm-parts">
            {partOrder.map((id) => (
              <button
                key={id}
                className={`sm-part${selected === id ? ' on' : ''}`}
                onClick={() => { setSelected(id); setDemoName(null) }}
              >
                <span className="sm-part-emoji">{parts[id].emoji}</span>
                <span>{parts[id].label}</span>
              </button>
            ))}
          </div>
        </div>

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
              <div className="sm-rec-row">
                <h3>✅ Do this</h3>
                <p>{rec.what}</p>
              </div>
              <div className="sm-rec-row">
                <h3>💡 Why</h3>
                <p>{part.why}</p>
              </div>
              <div className="sm-rec-row sm-here" style={{ borderColor: c.accent }}>
                <h3 style={{ color: c.accent }}>📍 In a {c.name.toLowerCase()} climate</h3>
                <p>{rec.here}</p>
              </div>
              <div className="sm-rec-row sm-human">
                <h3>🧑‍🔧 Where you still need a human</h3>
                <p>{part.human}</p>
              </div>
            </div>
          ) : (
            <div className="sm-empty">
              <div className="sm-empty-big">👆</div>
              <p>
                Tap a part of the house — <strong>roof, windows, walls, eaves…</strong> — for
                climate-smart passive design advice.
              </p>
              <p className="sm-muted">Or hit ✨ <em>Load demo project</em> to see it in action.</p>
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
