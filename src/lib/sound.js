/**
 * Web Audio ile üretilen kısa, telifsiz arayüz sesleri. Dosya yok.
 * AudioContext ilk kullanıcı jestinde lazy oluşur (autoplay politikası).
 * Sessize alma localStorage'da kalıcı.
 */

const STORAGE_KEY = 'sound-muted'

let ctx = null
let muted = readMuted()
const listeners = new Set()

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function ensureCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/**
 * Tek bir ton çalar.
 * @param {object} o {freq, dur, type, gain, attack, release, slideTo}
 */
function tone({
  freq = 440,
  dur = 0.12,
  type = 'sine',
  gain = 0.2,
  attack = 0.005,
  release = 0.08,
  slideTo = null,
  delay = 0,
}) {
  const ac = ensureCtx()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + release)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + release + 0.02)
}

function chord(freqs, opts = {}) {
  freqs.forEach((f, i) => tone({ freq: f, delay: i * 0.06, ...opts }))
}

export const sound = {
  get muted() {
    return muted
  },
  setMuted(v) {
    muted = !!v
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0')
    } catch {
      /* yoksay */
    }
    listeners.forEach((fn) => fn(muted))
  },
  toggleMuted() {
    this.setMuted(!muted)
    if (!muted) this.click() // açınca kısa bir onay sesi
    return muted
  },
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  // --- Efektler (muted ise sessiz) ---
  logon() {
    if (muted) return
    chord([523.25, 659.25, 783.99, 1046.5], {
      type: 'sine',
      dur: 0.18,
      gain: 0.16,
      release: 0.2,
    })
  },
  unlock() {
    if (muted) return
    tone({ freq: 660, slideTo: 990, dur: 0.14, type: 'sine', gain: 0.18 })
  },
  open() {
    if (muted) return
    tone({ freq: 380, slideTo: 620, dur: 0.1, type: 'triangle', gain: 0.16 })
  },
  close() {
    if (muted) return
    tone({ freq: 500, slideTo: 300, dur: 0.1, type: 'triangle', gain: 0.16 })
  },
  minimize() {
    if (muted) return
    tone({ freq: 520, slideTo: 260, dur: 0.12, type: 'sine', gain: 0.14 })
  },
  restore() {
    if (muted) return
    tone({ freq: 300, slideTo: 560, dur: 0.12, type: 'sine', gain: 0.14 })
  },
  click() {
    if (muted) return
    tone({ freq: 900, dur: 0.03, type: 'square', gain: 0.06, release: 0.03 })
  },
  error() {
    if (muted) return
    tone({ freq: 180, dur: 0.16, type: 'sawtooth', gain: 0.14 })
    tone({ freq: 140, dur: 0.18, type: 'sawtooth', gain: 0.14, delay: 0.12 })
  },
}
