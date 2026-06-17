import { useState, useEffect, useRef, useCallback } from 'react'
import { playSparkle, playClick } from './sound.js'
import './Unicorn.css'

const UNICORN_SIZE = 104

// Six colour presets. Each supplies a 5-band mane palette plus body/horn/etc.
export const PRESETS = {
  rainbow: {
    label: 'Rainbow', emoji: '🌈',
    mane: ['#c9b8f0', '#a9dcef', '#bdeccb', '#ffe6a3', '#ffc1d8'],
    body: '#ffffff', bodyStroke: '#ecdff5', hoof: '#f8c4da', earInner: '#ffd1e0',
    hornTop: '#ffe49a', hornBottom: '#ffc637', hornStroke: '#f0b429',
    eye: '#3a2e44', blush: '#ffd1e0',
  },
  bubblegum: {
    label: 'Bubblegum', emoji: '🍬',
    mane: ['#ff9ec4', '#ffb3d9', '#ffc1e0', '#ff8fb8', '#ffd6ec'],
    body: '#fff0f6', bodyStroke: '#f6cfe2', hoof: '#ff9ec4', earInner: '#ffc1e0',
    hornTop: '#fff0a8', hornBottom: '#ffd24d', hornStroke: '#e8a93d',
    eye: '#5b2a44', blush: '#ff9ec4',
  },
  mint: {
    label: 'Mint', emoji: '🌿',
    mane: ['#9be7c4', '#7fd9b0', '#b6f0d2', '#c9f5a8', '#88dccb'],
    body: '#f1fff8', bodyStroke: '#cdeede', hoof: '#9be7c4', earInner: '#c6f5dd',
    hornTop: '#fff0a8', hornBottom: '#ffd24d', hornStroke: '#e8a93d',
    eye: '#2e4a40', blush: '#ffd1e0',
  },
  cosmic: {
    label: 'Cosmic', emoji: '🌌',
    mane: ['#8a6fe8', '#6f8ff0', '#b07ff0', '#5fc8e8', '#c9a8ff'],
    body: '#efeaff', bodyStroke: '#ccbef0', hoof: '#b07ff0', earInner: '#d6c7ff',
    hornTop: '#eef0ff', hornBottom: '#b9c2e8', hornStroke: '#8e9bd0',
    eye: '#2a2350', blush: '#c9a8ff',
  },
  sunset: {
    label: 'Sunset', emoji: '🌅',
    mane: ['#ff9a6c', '#ffb86b', '#ffd36b', '#ff7e9d', '#ffcf8f'],
    body: '#fff4ec', bodyStroke: '#f6d8c2', hoof: '#ff9a6c', earInner: '#ffd0b8',
    hornTop: '#fff0a8', hornBottom: '#ffc24d', hornStroke: '#e89a3d',
    eye: '#5b3324', blush: '#ffb39e',
  },
  ocean: {
    label: 'Ocean', emoji: '🌊',
    mane: ['#6fd6f0', '#5fb8e8', '#7fe8d6', '#88c8f0', '#aee6f5'],
    body: '#eefaff', bodyStroke: '#c2e6f2', hoof: '#7fd6e8', earInner: '#c6eefb',
    hornTop: '#fff0a8', hornBottom: '#ffd24d', hornStroke: '#e8a93d',
    eye: '#1f3a4a', blush: '#a9dcef',
  },
}
export const PRESET_ORDER = ['rainbow', 'bubblegum', 'mint', 'cosmic', 'sunset', 'ocean']

// Treats you can feed; each gives a little happiness boost.
const FOODS = [
  { emoji: '🍓', joy: 10 },
  { emoji: '🧁', joy: 12 },
  { emoji: '🍎', joy: 8 },
  { emoji: '🍪', joy: 10 },
  { emoji: '🍇', joy: 8 },
  { emoji: '🌈', joy: 20 },
]

function moodFace(h) {
  if (h >= 80) return '🤩'
  if (h >= 60) return '😀'
  if (h >= 40) return '🙂'
  if (h >= 20) return '😟'
  return '😢'
}

function UnicornArt({ palette: p }) {
  const m = p.mane
  return (
    <svg className="unicorn-svg" width={UNICORN_SIZE} height={UNICORN_SIZE} viewBox="0 0 120 120">
      <defs>
        <linearGradient id="uHorn" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={p.hornTop} />
          <stop offset="1" stopColor={p.hornBottom} />
        </linearGradient>
      </defs>

      <g className="u-fig">
        {/* Tail */}
        <g className="u-tail">
          <path d="M30 80 q-18 3 -20 24 q10 -7 14 -1 q-3 -13 10 -11 q-7 -6 -4 -13 z" fill={m[0]} />
          <path d="M30 82 q-14 3 -16 20 q8 -6 11 -1 q-2 -10 8 -9 q-6 -5 -3 -11 z" fill={m[1]} />
          <path d="M30 84 q-10 3 -12 16 q6 -4 9 -1 q-1 -8 7 -7 q-5 -4 -4 -8 z" fill={m[2]} />
          <path d="M30 86 q-7 2 -8 12 q4 -3 7 0 q-1 -6 5 -6 q-4 -3 -4 -6 z" fill={m[3]} />
          <path d="M30 88 q-4 2 -5 9 q3 -2 5 0 q0 -4 4 -4 q-3 -3 -4 -5 z" fill={m[4]} />
        </g>

        {/* Legs + hooves */}
        <rect x="44" y="92" width="11" height="21" rx="5.5" fill={p.body} stroke={p.bodyStroke} strokeWidth="1.8" />
        <rect x="65" y="92" width="11" height="21" rx="5.5" fill={p.body} stroke={p.bodyStroke} strokeWidth="1.8" />
        <rect x="44" y="105" width="11" height="8" rx="4" fill={p.hoof} />
        <rect x="65" y="105" width="11" height="8" rx="4" fill={p.hoof} />

        {/* Body */}
        <ellipse cx="60" cy="86" rx="29" ry="21" fill={p.body} stroke={p.bodyStroke} strokeWidth="1.8" />
        {/* Head */}
        <ellipse cx="60" cy="54" rx="35" ry="31" fill={p.body} stroke={p.bodyStroke} strokeWidth="1.8" />

        {/* Ears */}
        <path d="M36 30 q-5 -12 5 -16 q5 7 3 18 z" fill={p.body} stroke={p.bodyStroke} strokeWidth="1.6" />
        <path d="M84 30 q5 -12 -5 -16 q-5 7 -3 18 z" fill={p.body} stroke={p.bodyStroke} strokeWidth="1.6" />
        <path d="M38 27 q-2 -7 3 -10 q3 5 1 11 z" fill={p.earInner} />
        <path d="M82 27 q2 -7 -3 -10 q-3 5 -1 11 z" fill={p.earInner} />

        {/* Horn */}
        <path d="M54 20 L60 3 L66 20 z" fill="url(#uHorn)" stroke={p.hornStroke} strokeWidth="1.2" />
        <path d="M56.5 15 H63.5 M57.5 10.5 H62.5 M58.7 6.5 H61.3" stroke={p.hornStroke} strokeWidth="1" opacity=".55" />

        {/* Mane — forelock fringe */}
        <g className="u-mane">
          <path d="M61 22 q-24 1 -29 25 q11 -7 17 -2 q-5 -11 8 -13 q-7 -5 4 -10 z" fill={m[0]} />
          <path d="M61 22 q-19 1 -24 21 q9 -6 14 -2 q-4 -9 7 -11 q-6 -4 3 -8 z" fill={m[1]} />
          <path d="M61 22 q-15 1 -19 18 q7 -5 11 -1 q-3 -8 6 -9 q-5 -3 2 -8 z" fill={m[2]} />
          <path d="M61 22 q-11 1 -14 14 q6 -4 9 -1 q-2 -6 5 -7 q-4 -3 1 -6 z" fill={m[3]} />
          <path d="M61 22 q-6 1 -8 10 q4 -3 6 -1 q-1 -4 4 -5 q-3 -2 -2 -4 z" fill={m[4]} />
        </g>
        {/* Side mane */}
        <g className="u-mane">
          <path d="M88 40 q12 9 7 33 q-7 5 -12 1 q7 -10 -1 -17 q9 -7 6 -18 z" fill={m[0]} />
          <path d="M86 42 q9 8 5 27 q-5 4 -9 1 q6 -9 -1 -15 q7 -6 5 -14 z" fill={m[1]} />
          <path d="M84 44 q7 7 4 21 q-4 3 -7 1 q5 -8 -1 -12 q6 -5 4 -11 z" fill={m[4]} />
        </g>

        {/* Eyes */}
        <g className="u-eyes">
          <g className="eye eye--l">
            <g className="eye-open">
              <ellipse cx="49" cy="59" rx="7.5" ry="10" fill={p.eye} />
              <circle cx="46" cy="54" r="2.7" fill="#fff" />
              <circle cx="51.5" cy="62" r="1.4" fill="#fff" />
            </g>
            <path className="eye-sleep" d="M41 59 q8 7 16 0" fill="none" stroke={p.eye} strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <g className="eye eye--r">
            <g className="eye-open">
              <ellipse cx="73" cy="59" rx="7.5" ry="10" fill={p.eye} />
              <circle cx="70" cy="54" r="2.7" fill="#fff" />
              <circle cx="75.5" cy="62" r="1.4" fill="#fff" />
            </g>
            <path className="eye-sleep" d="M65 59 q8 7 16 0" fill="none" stroke={p.eye} strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </g>

        {/* Blush + smile */}
        <circle cx="37" cy="68" r="5" fill={p.blush} opacity=".85" />
        <circle cx="83" cy="68" r="5" fill={p.blush} opacity=".85" />
        <path d="M56 71 q4 4 8 0" fill="none" stroke="#caa6c0" strokeWidth="1.7" strokeLinecap="round" />

        {/* Wink sparkle */}
        <g className="wink-spark">
          <path d="M86 42 l1.6 3.6 3.6 1.6 -3.6 1.6 -1.6 3.6 -1.6 -3.6 -3.6 -1.6 3.6 -1.6 z" fill="#fff3a0" />
        </g>
      </g>
    </svg>
  )
}

const loadHappy = () => {
  const v = parseInt(localStorage.getItem('pet.happiness'), 10)
  return Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 70
}

export default function Unicorn({ name, setName, preset, setPreset }) {
  const palette = PRESETS[preset] || PRESETS.rainbow

  const [pos, setPos] = useState({ x: 80, y: 130 })
  const [facing, setFacing] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [mood, setMood] = useState('idle')
  const [eyeAnim, setEyeAnim] = useState(null)
  const [resting, setResting] = useState(false)
  const [treat, setTreat] = useState(null)        // emoji string while eating
  const [particles, setParticles] = useState([])
  const [happiness, setHappiness] = useState(loadHappy)
  const [showCustomize, setShowCustomize] = useState(false)

  const posRef = useRef(pos); posRef.current = pos
  const restingRef = useRef(resting); restingRef.current = resting
  const draggingRef = useRef(dragging); draggingRef.current = dragging

  const dragOffset = useRef({ x: 0, y: 0 })
  const downAt = useRef({ x: 0, y: 0 })
  const moved = useRef(false)
  const pid = useRef(0)
  const moodTimer = useRef(null)
  const lastActive = useRef(0)

  // Persist happiness.
  useEffect(() => {
    localStorage.setItem('pet.happiness', String(Math.round(happiness)))
  }, [happiness])

  const bumpHappy = useCallback((d) => {
    setHappiness((h) => Math.min(100, Math.max(0, h + d)))
  }, [])

  const touch = useCallback(() => {
    lastActive.current = performance.now()
    if (restingRef.current) setResting(false)
  }, [])

  const burst = useCallback((emojis, count = 7) => {
    const cx = posRef.current.x + UNICORN_SIZE / 2
    const cy = posRef.current.y + UNICORN_SIZE / 2
    const next = Array.from({ length: count }, () => ({
      id: pid.current++,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: cx + (Math.random() - 0.5) * 72,
      y: cy + (Math.random() - 0.5) * 44,
      rot: (Math.random() - 0.5) * 50,
    }))
    setParticles((p) => [...p, ...next])
    const ids = next.map((n) => n.id)
    setTimeout(() => setParticles((p) => p.filter((q) => !ids.includes(q.id))), 1200)
  }, [])

  const setTempMood = useCallback((m, ms) => {
    setMood(m)
    clearTimeout(moodTimer.current)
    moodTimer.current = setTimeout(() => setMood('idle'), ms)
  }, [])

  const goRest = useCallback(() => {
    const keys = document.querySelectorAll('.key')
    if (keys.length) {
      const k = keys[Math.floor(Math.random() * keys.length)]
      const r = k.getBoundingClientRect()
      const x = r.left + r.width / 2 - UNICORN_SIZE / 2
      const y = r.top - UNICORN_SIZE * 0.58
      setFacing(x >= posRef.current.x ? 1 : -1)
      setPos({ x, y })
    }
    setResting(true)
    lastActive.current = performance.now()
  }, [])

  // Blink / wink scheduler.
  useEffect(() => {
    lastActive.current = performance.now()
    let timer
    const schedule = () => {
      const delay = 2200 + Math.random() * 3200
      timer = setTimeout(() => {
        if (!restingRef.current && !document.hidden) {
          const wink = Math.random() < 0.28
          setEyeAnim(wink ? 'wink' : 'blink')
          setTimeout(() => setEyeAnim(null), wink ? 560 : 300)
        }
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  // Auto-rest after inactivity.
  useEffect(() => {
    const id = setInterval(() => {
      if (!restingRef.current && !draggingRef.current &&
          performance.now() - lastActive.current > 13000) {
        goRest()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [goRest])

  // Happiness slowly drifts down over time.
  useEffect(() => {
    const id = setInterval(() => bumpHappy(-1), 5000)
    return () => clearInterval(id)
  }, [bumpHappy])

  // Wandering.
  useEffect(() => {
    if (dragging || resting) return
    const wander = () => {
      const margin = UNICORN_SIZE + 10
      const x = Math.random() * Math.max(margin, window.innerWidth - margin)
      const y = Math.random() * Math.max(margin, window.innerHeight - margin)
      setFacing(x >= posRef.current.x ? 1 : -1)
      setPos({ x, y })
    }
    const id = setInterval(wander, 2900)
    return () => clearInterval(id)
  }, [dragging, resting])

  // Dragging.
  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const x = e.clientX - dragOffset.current.x
      const y = e.clientY - dragOffset.current.y
      if (Math.abs(e.clientX - downAt.current.x) + Math.abs(e.clientY - downAt.current.y) > 5) {
        moved.current = true
      }
      setFacing(x >= posRef.current.x ? 1 : -1)
      setPos({ x, y })
    }
    const onUp = () => {
      setDragging(false)
      if (!moved.current) {
        setTempMood('happy', 750)
        burst(['💕', '💖', '✨'], 5)
        bumpHappy(5)
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, burst, setTempMood, bumpHappy])

  const onPointerDown = (e) => {
    e.preventDefault()
    touch()
    moved.current = false
    downAt.current = { x: e.clientX, y: e.clientY }
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y }
    setDragging(true)
  }

  const feed = (food) => {
    touch()
    setTreat(food.emoji)
    setTempMood('eat', 1400)
    burst([food.emoji, '💕', '❤️'], 6)
    bumpHappy(food.joy)
    setTimeout(() => setTreat(null), 1300)
  }

  const play = () => {
    touch()
    setTempMood('play', 1200)
    burst(['✨', '🌈', '⭐', '💫'], 9)
    bumpHappy(15)
    const margin = UNICORN_SIZE + 10
    const x = Math.random() * Math.max(margin, window.innerWidth - margin)
    const y = Math.random() * Math.max(margin, window.innerHeight - margin)
    setFacing(x >= posRef.current.x ? 1 : -1)
    setPos({ x, y })
  }

  const toggleRest = () => {
    if (resting) touch()
    else goRest()
  }

  useEffect(() => () => { clearTimeout(moodTimer.current) }, [])

  const eyeState = resting ? 'state-sleep'
    : eyeAnim === 'blink' ? 'state-blink'
    : eyeAnim === 'wink' ? 'state-wink'
    : ''

  return (
    <>
      <div
        className={`unicorn ${dragging ? 'is-dragging' : ''} ${resting ? 'is-resting' : ''}`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        onPointerDown={onPointerDown}
        role="img"
        aria-label={`${name} the unicorn — drag, feed, or play with me!`}
      >
        <div className="unicorn-face" style={{ transform: `scaleX(${facing})` }}>
          <div className={`unicorn-bob mood-${mood} ${eyeState}`}>
            <UnicornArt palette={palette} />
            {treat && <span className="unicorn-treat">{treat}</span>}
          </div>
        </div>
        {resting && (
          <div className="unicorn-zzz" aria-hidden="true">
            <span>z</span><span>Z</span><span>z</span>
          </div>
        )}
      </div>

      {particles.map((p) => (
        <span
          key={p.id}
          className="unicorn-particle"
          style={{ left: p.x, top: p.y, transform: `rotate(${p.rot}deg)` }}
        >
          {p.emoji}
        </span>
      ))}

      {showCustomize && (
        <div className="pet-customize">
          <div className="pet-customize-head">
            <span>✨ Customize</span>
            <button className="pet-x" onClick={() => setShowCustomize(false)} aria-label="Close">✕</button>
          </div>
          <label className="pet-field">
            <span>Name</span>
            <input
              className="pet-name-input"
              value={name}
              maxLength={14}
              onChange={(e) => setName(e.target.value)}
              onMouseEnter={playSparkle}
              placeholder="Name your unicorn"
            />
          </label>
          <div className="pet-presets">
            {PRESET_ORDER.map((key) => {
              const pr = PRESETS[key]
              return (
                <button
                  key={key}
                  className={`pet-preset ${preset === key ? 'is-active' : ''}`}
                  onClick={() => { setPreset(key); playClick() }}
                  onMouseEnter={playSparkle}
                  title={pr.label}
                >
                  <span className="pet-swatch">
                    {pr.mane.slice(0, 5).map((c, i) => (
                      <span key={i} style={{ background: c }} />
                    ))}
                  </span>
                  <span className="pet-preset-label">{pr.emoji} {pr.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="pet-panel">
        <div className="pet-info">
          <span className="pet-name">{palette.emoji} {name}</span>
          <div className="pet-happy" title={`Happiness: ${Math.round(happiness)}%`}>
            <span className="pet-happy-face">{moodFace(happiness)}</span>
            <span className="pet-happy-bar">
              <span className="pet-happy-fill" style={{ width: `${happiness}%` }} />
            </span>
          </div>
        </div>

        <div className="pet-foods">
          {FOODS.map((f) => (
            <button
              key={f.emoji}
              className="pet-food"
              onClick={() => feed(f)}
              onMouseEnter={playSparkle}
              onPointerDown={playClick}
              title={`Feed ${f.emoji} (+${f.joy})`}
            >
              {f.emoji}
            </button>
          ))}
        </div>

        <div className="pet-actions">
          <button className="unicorn-btn" onClick={play} onMouseEnter={playSparkle} onPointerDown={playClick}>🎈 Play</button>
          <button className="unicorn-btn" onClick={toggleRest} onMouseEnter={playSparkle} onPointerDown={playClick}>{resting ? '☀️' : '😴'}</button>
          <button className="unicorn-btn" onClick={() => { setShowCustomize((s) => !s); playClick() }} onMouseEnter={playSparkle}>⚙️</button>
        </div>
      </div>
    </>
  )
}
