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

export function disposeAudio() {
  stopMusic()
  if (ctx) { try { ctx.close() } catch (e) { /* ignore */ } ctx = null }
}
