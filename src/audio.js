// Sol Mate — all sound is synthesized live with the Web Audio API.
// No audio files to host: soft UI clicks/hovers + a slow generative chill pad.

let ctx = null
let sfxBus = null
let sfxOn = true

let musicBus = null
let musicTimer = null
let musicPlaying = false
let chordStep = 0

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
    sfxBus = ctx.createGain()
    sfxBus.gain.value = 0.32
    sfxBus.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// For ambient/game sounds triggered from the render loop: never CREATE the
// context (that needs a gesture) — only play if it is already running.
function acRunning() {
  return ctx && ctx.state === 'running' ? ctx : null
}

// Call on the first user gesture so audio is unlocked for later SFX.
export function unlockAudio() {
  try { ac() } catch (e) { /* no audio support */ }
}

export function setSfxEnabled(on) {
  sfxOn = on
}

// Soft, short high blip when hovering an interactive element.
export function playHover() {
  if (!sfxOn) return
  let c
  try { c = ac() } catch (e) { return }
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(1100, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  o.connect(g)
  g.connect(sfxBus)
  o.start(t)
  o.stop(t + 0.08)
}

// Rounder two-note "pop" when actually clicking.
export function playClick() {
  if (!sfxOn) return
  let c
  try { c = ac() } catch (e) { return }
  const notes = [659.25, 987.77] // E5 -> B5
  notes.forEach((f, i) => {
    const t = c.currentTime + i * 0.045
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(f, t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
    o.connect(g)
    g.connect(sfxBus)
    o.start(t)
    o.stop(t + 0.17)
  })
}

// ---- Ambient chill music: slow overlapping pad chords on a soft scale ----
// Gentle Am9 / Fmaj7 / Cmaj7 / G6-ish voicings, lots of attack/release.
const CHORDS = [
  [220.0, 261.63, 329.63, 392.0],   // A minor add
  [174.61, 220.0, 261.63, 329.63],  // F major 7
  [130.81, 196.0, 246.94, 329.63],  // C major 7
  [196.0, 246.94, 293.66, 392.0],   // G 6
]

function playChord(c) {
  if (!musicPlaying) return
  const chord = CHORDS[chordStep % CHORDS.length]
  chordStep++
  const t = c.currentTime
  chord.forEach((f, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = i === 0 ? 'sine' : 'triangle'
    o.frequency.setValueAtTime(f, t)
    o.detune.setValueAtTime((i - 1.5) * 4, t) // subtle chorus spread
    const peak = i === 0 ? 0.26 : 0.13
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(peak, t + 1.6)
    g.gain.linearRampToValueAtTime(0.0001, t + 5.2)
    o.connect(g)
    g.connect(musicBus)
    o.start(t)
    o.stop(t + 5.4)
  })
}

export function startMusic() {
  if (musicPlaying) return
  let c
  try { c = ac() } catch (e) { return }
  musicPlaying = true
  musicBus = c.createGain()
  musicBus.gain.value = 0.0001
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 850
  lp.Q.value = 0.4
  musicBus.connect(lp)
  lp.connect(c.destination)
  musicBus.gain.linearRampToValueAtTime(0.16, c.currentTime + 2.5)
  playChord(c)
  musicTimer = setInterval(() => playChord(c), 4200)
}

export function stopMusic() {
  if (!musicPlaying) return
  musicPlaying = false
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null }
  if (musicBus && ctx) {
    const now = ctx.currentTime
    musicBus.gain.cancelScheduledValues(now)
    musicBus.gain.setValueAtTime(musicBus.gain.value, now)
    musicBus.gain.linearRampToValueAtTime(0.0001, now + 1.8)
  }
}

// ---- 8-bit game sound effects (triggered from the 3D scene) ----

// soft blip when hovering a house part
let lastTick = 0
export function playTick() {
  if (!sfxOn) return
  const c = acRunning()
  if (!c || c.currentTime - lastTick < 0.06) return
  lastTick = c.currentTime
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'square'
  o.frequency.setValueAtTime(1500, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.03, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  o.connect(g); g.connect(sfxBus)
  o.start(t); o.stop(t + 0.06)
}

// little chirp when a speech bubble pops (NPC chatter)
export function playBlip() {
  if (!sfxOn) return
  const c = acRunning()
  if (!c) return
  const t = c.currentTime
  const f = 480 + Math.random() * 420
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'square'
  o.frequency.setValueAtTime(f, t)
  o.frequency.setValueAtTime(f * 1.25, t + 0.05)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.045, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11)
  o.connect(g); g.connect(sfxBus)
  o.start(t); o.stop(t + 0.12)
}

// very soft footstep, globally throttled so a crowd doesn't machine-gun
let lastStep = 0
export function playFootstep() {
  if (!sfxOn) return
  const c = acRunning()
  if (!c || c.currentTime - lastStep < 0.17) return
  lastStep = c.currentTime
  const t = c.currentTime
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'triangle'
  o.frequency.setValueAtTime(150, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.02, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
  o.connect(g); g.connect(sfxBus)
  o.start(t); o.stop(t + 0.07)
}

// tiny helper: one short 8-bit note
function blip8(f, when, dur, type = 'square', peak = 0.05) {
  const c = acRunning()
  if (!c) return
  const t = c.currentTime + when
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(sfxBus)
  o.start(t); o.stop(t + dur + 0.02)
}

// critter noises + celebratory jingles (8-bit)
export function playBark() { if (!sfxOn) return; blip8(240, 0, 0.09, 'square', 0.06); blip8(180, 0.1, 0.12, 'square', 0.06) }
export function playMeow() { if (!sfxOn) return; blip8(620, 0, 0.12, 'sawtooth', 0.045); blip8(760, 0.06, 0.14, 'sawtooth', 0.045); blip8(560, 0.16, 0.16, 'sawtooth', 0.04) }
export function playChirp() { if (!sfxOn) return; blip8(1800, 0, 0.05, 'square', 0.035); blip8(2200, 0.05, 0.05, 'square', 0.03) }
export function playSparkle() { if (!sfxOn) return;[880, 1108, 1318, 1760].forEach((f, i) => blip8(f, i * 0.05, 0.12, 'triangle', 0.05)) }
export function playParty() { if (!sfxOn) return;[523, 659, 784, 1046, 784, 1046].forEach((f, i) => blip8(f, i * 0.09, 0.16, 'square', 0.05)) }

// looping rain: filtered white noise
let rainNodes = null
export function startRain() {
  if (!sfxOn) return
  const c = acRunning() || ac()
  if (!c || rainNodes) return
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 420
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700; lp.Q.value = 0.3
  const g = c.createGain(); g.gain.value = 0.0001
  src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(c.destination)
  src.start()
  g.gain.linearRampToValueAtTime(0.085, c.currentTime + 1.2)
  rainNodes = { src, g }
}
export function stopRain() {
  if (!rainNodes || !ctx) return
  const { src, g } = rainNodes
  rainNodes = null
  const now = ctx.currentTime
  try {
    g.gain.cancelScheduledValues(now)
    g.gain.setValueAtTime(g.gain.value, now)
    g.gain.linearRampToValueAtTime(0.0001, now + 0.7)
    src.stop(now + 0.8)
  } catch (e) { /* ignore */ }
}

export function disposeAudio() {
  stopMusic()
  stopRain()
  if (ctx) { try { ctx.close() } catch (e) { /* ignore */ } ctx = null }
}
