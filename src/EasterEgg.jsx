import { useEffect } from 'react'
import { whisper, playSparkle } from './sound.js'
import './EasterEgg.css'

// Hidden surprises keyed by the exact display value.
export const EGGS = {
  '420': {
    emojis: ['🌿', '🍃', '💨', '🌿', '🍃'],
    banner: 'Blaze it 🌿',
    tint: 'rgba(60, 165, 75, 0.16)',
    count: 22,
  },
  '80085': {
    emojis: ['🍈', '🍈'],
    banner: '( • ) ( • )',
    whisper: 'boobs',
    whisperOpts: { pitch: 0.55, rate: 0.8, volume: 0.32 },
    count: 8,
  },
  '69': {
    banner: 'nice 😎',
    big: true,
    count: 0,
  },
  '666': {
    emojis: ['😈', '🔥', '👹', '💀'],
    banner: '😈 666 😈',
    tint: 'rgba(190, 20, 20, 0.18)',
    shake: true,
    whisper: 'evil',
    whisperOpts: { pitch: 0.2, rate: 0.7, volume: 0.4 },
    count: 18,
  },
  '1337': {
    emojis: ['1', '0', '1', '0', '1'],
    banner: 'L33T H4X0R 💻',
    tint: 'rgba(0, 35, 0, 0.55)',
    matrix: true,
    whisper: 'elite',
    whisperOpts: { pitch: 0.4, rate: 0.95, volume: 0.3 },
    count: 40,
  },
  '42': {
    emojis: ['✨', '🌌', '🐬', '⭐', '🌠'],
    banner: 'The Answer to Life,\nthe Universe & Everything',
    tint: 'rgba(25, 12, 55, 0.28)',
    whisper: 'forty two',
    whisperOpts: { pitch: 0.6, rate: 0.85, volume: 0.3 },
    count: 20,
  },
  '314': {
    emojis: ['🥧', '🥧', '🍰'],
    banner: 'mmm… pie 🥧  (π)',
    count: 16,
  },
  '3.14': {
    emojis: ['🥧', '🥧', '🍰'],
    banner: 'mmm… pie 🥧  (π)',
    count: 16,
  },
}

export default function EasterEgg({ cfg }) {
  useEffect(() => {
    if (cfg.whisper) whisper(cfg.whisper, cfg.whisperOpts)
    else playSparkle()
  }, [cfg])

  const count = cfg.count ?? 16
  const items = cfg.emojis
    ? Array.from({ length: count }, (_, i) => ({
        id: i,
        ch: cfg.emojis[i % cfg.emojis.length],
        left: Math.random() * 100,
        delay: Math.random() * 1.1,
        dur: 2.6 + Math.random() * 2,
        size: 20 + Math.random() * 24,
        drift: (Math.random() - 0.5) * 80,
        rot: (Math.random() - 0.5) * 160,
      }))
    : []

  return (
    <div className={`egg ${cfg.matrix ? 'egg--matrix' : ''}`} aria-hidden="true">
      {cfg.tint && <div className="egg-tint" style={{ background: cfg.tint }} />}
      {items.map((it) => (
        <span
          key={it.id}
          className="egg-emoji"
          style={{
            left: `${it.left}%`,
            fontSize: `${it.size}px`,
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.dur}s`,
            '--drift': `${it.drift}px`,
            '--rot': `${it.rot}deg`,
          }}
        >
          {it.ch}
        </span>
      ))}
      {cfg.banner && (
        <div className={`egg-banner ${cfg.big ? 'egg-banner--big' : ''} ${cfg.shake ? 'egg-banner--shake' : ''}`}>
          {cfg.banner}
        </div>
      )}
    </div>
  )
}
