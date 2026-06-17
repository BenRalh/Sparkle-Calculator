import { useState, useEffect, useRef, useCallback } from 'react'
import Unicorn from './Unicorn.jsx'
import EasterEgg, { EGGS } from './EasterEgg.jsx'
import { playSparkle, playClick, primeAudio } from './sound.js'
import './App.css'

const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? NaN : a / b),
}

// Cartoonish 4-point twinkle stars scattered around the calculator.
// Each: position (% of stage), size (px), color, and animation timing.
const SPARKLES = [
  { top: '4%', left: '8%', size: 34, color: '#fff1a8', delay: '0s', dur: '2.4s' },
  { top: '-3%', left: '46%', size: 22, color: '#ffc2dd', delay: '0.6s', dur: '2.0s' },
  { top: '2%', left: '88%', size: 40, color: '#bfe6ff', delay: '1.1s', dur: '2.8s' },
  { top: '22%', left: '-6%', size: 26, color: '#d6c7ff', delay: '0.3s', dur: '2.2s' },
  { top: '30%', left: '102%', size: 30, color: '#c6f7cf', delay: '1.4s', dur: '2.6s' },
  { top: '54%', left: '-8%', size: 20, color: '#ffd9b0', delay: '0.9s', dur: '1.9s' },
  { top: '60%', left: '104%', size: 36, color: '#fff1a8', delay: '0.2s', dur: '2.5s' },
  { top: '82%', left: '-4%', size: 28, color: '#ffc2dd', delay: '1.2s', dur: '2.3s' },
  { top: '90%', left: '40%', size: 24, color: '#bfe6ff', delay: '0.5s', dur: '2.1s' },
  { top: '96%', left: '84%', size: 38, color: '#d6c7ff', delay: '1.6s', dur: '2.7s' },
  { top: '14%', left: '70%', size: 18, color: '#ffffff', delay: '0.8s', dur: '1.7s' },
  { top: '74%', left: '20%', size: 16, color: '#ffffff', delay: '1.9s', dur: '1.6s' },
]

function Sparkle({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z"
        fill={color}
      />
    </svg>
  )
}

function Sparkles() {
  return (
    <div className="sparkles" aria-hidden="true">
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="sparkle"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        >
          <Sparkle size={s.size} color={s.color} />
        </span>
      ))}
    </div>
  )
}

export default function App() {
  // The value currently shown / being typed.
  const [display, setDisplay] = useState('0')
  // The stored left-hand operand (a number) once an operator is chosen.
  const [accumulator, setAccumulator] = useState(null)
  // The pending operator symbol.
  const [operator, setOperator] = useState(null)
  // True right after an operator is pressed, so the next digit starts fresh.
  const [waiting, setWaiting] = useState(false)

  const inputDigit = useCallback((digit) => {
    setDisplay((prev) => {
      if (waiting) {
        setWaiting(false)
        return digit
      }
      return prev === '0' ? digit : prev + digit
    })
  }, [waiting])

  const inputDot = useCallback(() => {
    setDisplay((prev) => {
      if (waiting) {
        setWaiting(false)
        return '0.'
      }
      return prev.includes('.') ? prev : prev + '.'
    })
  }, [waiting])

  const clearAll = useCallback(() => {
    setDisplay('0')
    setAccumulator(null)
    setOperator(null)
    setWaiting(false)
  }, [])

  const toggleSign = useCallback(() => {
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : prev === '0' ? prev : '-' + prev))
  }, [])

  const inputPercent = useCallback(() => {
    setDisplay((prev) => String(parseFloat(prev) / 100))
  }, [])

  const compute = useCallback((symbol) => {
    const current = parseFloat(display)

    if (operator && !waiting) {
      const result = OPERATORS[operator](accumulator, current)
      if (Number.isNaN(result)) {
        clearAll()
        setDisplay('Error')
        return
      }
      const rounded = Math.round((result + Number.EPSILON) * 1e10) / 1e10
      setAccumulator(rounded)
      setDisplay(String(rounded))
    } else {
      setAccumulator(current)
    }

    setOperator(symbol)
    setWaiting(true)
  }, [display, operator, accumulator, waiting, clearAll])

  const equals = useCallback(() => {
    if (operator == null || accumulator == null) return
    const current = parseFloat(display)
    const result = OPERATORS[operator](accumulator, current)
    if (Number.isNaN(result)) {
      clearAll()
      setDisplay('Error')
      return
    }
    const rounded = Math.round((result + Number.EPSILON) * 1e10) / 1e10
    setDisplay(String(rounded))
    setAccumulator(null)
    setOperator(null)
    setWaiting(true)
  }, [display, operator, accumulator, clearAll])

  // Keyboard support.
  useEffect(() => {
    const onKey = (e) => {
      const { key } = e
      let handled = true
      if (key >= '0' && key <= '9') inputDigit(key)
      else if (key === '.') inputDot()
      else if (key === '+') compute('+')
      else if (key === '-') compute('-')
      else if (key === '*') compute('×')
      else if (key === '/') { e.preventDefault(); compute('÷') }
      else if (key === 'Enter' || key === '=') { e.preventDefault(); equals() }
      else if (key === 'Escape') clearAll()
      else if (key === '%') inputPercent()
      else if (key === 'Backspace') {
        setDisplay((prev) => (prev.length > 1 && prev !== 'Error' ? prev.slice(0, -1) : '0'))
      } else handled = false
      if (handled) playClick()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inputDigit, inputDot, compute, equals, clearAll, inputPercent])

  // Unlock the audio context on the first user gesture (browser autoplay policy).
  useEffect(() => {
    window.addEventListener('pointerdown', primeAudio, { once: true })
    return () => window.removeEventListener('pointerdown', primeAudio)
  }, [])

  // Easter eggs — fire when the display settles on a magic value (debounced so
  // intermediate digits while typing don't trigger).
  const [egg, setEgg] = useState(null)
  const eggId = useRef(0)
  useEffect(() => {
    const t = setTimeout(() => {
      const cfg = EGGS[display]
      if (cfg) setEgg({ cfg, id: ++eggId.current })
    }, 650)
    return () => clearTimeout(t)
  }, [display])
  useEffect(() => {
    if (!egg) return
    const t = setTimeout(() => setEgg(null), 4000)
    return () => clearTimeout(t)
  }, [egg])

  const keys = [
    { label: 'AC', onClick: clearAll, variant: 'function' },
    { label: '±', onClick: toggleSign, variant: 'function' },
    { label: '%', onClick: inputPercent, variant: 'function' },
    { label: '÷', onClick: () => compute('÷'), variant: 'operator', active: operator === '÷' },
    { label: '7', onClick: () => inputDigit('7'), color: 'pink' },
    { label: '8', onClick: () => inputDigit('8'), color: 'peach' },
    { label: '9', onClick: () => inputDigit('9'), color: 'lemon' },
    { label: '×', onClick: () => compute('×'), variant: 'operator', active: operator === '×' },
    { label: '4', onClick: () => inputDigit('4'), color: 'peach' },
    { label: '5', onClick: () => inputDigit('5'), color: 'lemon' },
    { label: '6', onClick: () => inputDigit('6'), color: 'mint' },
    { label: '-', onClick: () => compute('-'), variant: 'operator', active: operator === '-' },
    { label: '1', onClick: () => inputDigit('1'), color: 'lemon' },
    { label: '2', onClick: () => inputDigit('2'), color: 'mint' },
    { label: '3', onClick: () => inputDigit('3'), color: 'sky' },
    { label: '+', onClick: () => compute('+'), variant: 'operator', active: operator === '+' },
    { label: '0', onClick: () => inputDigit('0'), variant: 'zero', color: 'lilac' },
    { label: '.', onClick: inputDot, color: 'rose' },
    { label: '=', onClick: equals, variant: 'operator' },
  ]

  return (
    <div className="stage">
      <Sparkles />
      <Unicorn />
      <div className="calculator">
      <div className="display" data-testid="display">{display}</div>
      <div className="keypad">
        {keys.map((k, i) => (
          <button
            key={i}
            className={[
              'key',
              k.variant ? `key--${k.variant}` : '',
              k.color ? `key--${k.color}` : '',
              k.active ? 'key--active' : '',
            ].filter(Boolean).join(' ')}
            onClick={k.onClick}
            onMouseEnter={playSparkle}
            onPointerDown={playClick}
          >
            {k.label}
          </button>
        ))}
      </div>
      </div>
      {egg && <EasterEgg key={egg.id} cfg={egg.cfg} />}
    </div>
  )
}
