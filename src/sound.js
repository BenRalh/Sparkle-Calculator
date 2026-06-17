// Whimsical ASMR-style UI sounds — all synthesized live with the Web Audio
// API (no audio files). Soft sine "bells" run through a gentle low-pass and a
// short shimmer-delay so everything feels airy and twinkly rather than buzzy.

let ctx = null
let master = null
let lastSparkle = 0
let lastClick = 0

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  ensureChain(ctx)
  return ctx
}

// master -> low-pass -> destination, with a parallel feedback delay for shimmer.
function ensureChain(ac) {
  if (master) return
  master = ac.createGain()
  master.gain.value = 0.9

  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 7200

  master.connect(lp).connect(ac.destination)

  const delay = ac.createDelay()
  delay.delayTime.value = 0.11
  const fb = ac.createGain()
  fb.gain.value = 0.28
  const wet = ac.createGain()
  wet.gain.value = 0.32
  master.connect(delay)
  delay.connect(fb)
  fb.connect(delay)
  delay.connect(wet)
  wet.connect(lp)
}

// One soft sine bell with a smooth swell and long, gentle tail.
function bell(ac, at, freq, { peak = 0.07, attack = 0.012, dur = 0.5 } = {}) {
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(g).connect(master)
  osc.start(at)
  osc.stop(at + dur + 0.05)
}

export function primeAudio() {
  getCtx()
}

// Hover: an airy high twinkle — a soft bell plus a delayed octave shimmer.
const SPARKLE_NOTES = [1318.51, 1567.98, 1760.0, 2093.0, 2349.32]

export function playSparkle() {
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  if (now - lastSparkle < 0.03) return
  lastSparkle = now

  const base = SPARKLE_NOTES[Math.floor(Math.random() * SPARKLE_NOTES.length)]
  bell(ac, now, base, { peak: 0.05, dur: 0.55 })
  bell(ac, now + 0.005, base * 1.5, { peak: 0.025, dur: 0.45 })
  bell(ac, now + 0.06, base * 2, { peak: 0.02, dur: 0.4 })
}

// Press: a rounder, warmer "plink" with a little sparkle on top.
const CLICK_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0]

export function playClick() {
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  if (now - lastClick < 0.02) return
  lastClick = now

  const base = CLICK_NOTES[Math.floor(Math.random() * CLICK_NOTES.length)]
  bell(ac, now, base, { peak: 0.11, attack: 0.006, dur: 0.5 })
  bell(ac, now, base * 2, { peak: 0.035, dur: 0.32 })
  bell(ac, now + 0.035, base * 3, { peak: 0.018, dur: 0.28 }) // sparkle top
}

// Soft spoken/whispered phrase for certain easter eggs.
let lastWhisper = { text: '', at: 0 }
export function whisper(text, { pitch = 0.7, rate = 0.85, volume = 0.32 } = {}) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    // Swallow rapid duplicates (e.g. React StrictMode's double effect invoke).
    const now = (typeof performance !== 'undefined' ? performance.now() : 0)
    if (text === lastWhisper.text && now - lastWhisper.at < 600) return
    lastWhisper = { text, at: now }
    const u = new SpeechSynthesisUtterance(text)
    u.pitch = pitch
    u.rate = rate
    u.volume = volume
    synth.speak(u)
  } catch (e) { /* speech not available */ }
}
