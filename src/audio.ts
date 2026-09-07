/** TTS + soft Web Audio feedback beeps */

let audioCtx: AudioContext | null = null

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

export function speak(text: string, opts: { rate?: number; lang?: string } = {}): void {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = opts.lang ?? 'en-US'
    u.rate = opts.rate ?? 0.85
    const voices = window.speechSynthesis.getVoices()
    const en = voices.find((v) => /en(-|_)US/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang))
    if (en) u.voice = en
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

/** Prefer phoneme-like elongated consonants; short vowels */
export function speakLetterSound(sound: string, keyword?: string): void {
  if (keyword && Math.random() < 0.25) {
    speak(keyword, { rate: 0.9 })
  } else {
    speak(sound, { rate: 0.7 })
  }
}

export function speakLetterName(name: string): void {
  speak(name, { rate: 0.9 })
}

export function beep(kind: 'ok' | 'no' | 'tap' = 'tap'): void {
  try {
    const c = ctx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    const now = c.currentTime
    if (kind === 'ok') {
      o.type = 'sine'
      o.frequency.setValueAtTime(523, now)
      o.frequency.setValueAtTime(659, now + 0.08)
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
      o.start(now)
      o.stop(now + 0.3)
    } else if (kind === 'no') {
      o.type = 'triangle'
      o.frequency.setValueAtTime(220, now)
      o.frequency.setValueAtTime(180, now + 0.12)
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
      o.start(now)
      o.stop(now + 0.28)
    } else {
      o.type = 'sine'
      o.frequency.setValueAtTime(440, now)
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.05, now + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
      o.start(now)
      o.stop(now + 0.1)
    }
  } catch {
    /* ignore */
  }
}

/** Warm up voices list (Chrome loads async) */
export function warmVoices(): void {
  try {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
  } catch {
    /* ignore */
  }
}
