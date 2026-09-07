/** Reliable mobile audio: unlock + HTMLAudioElement files + Web Audio beeps */

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')

let audioCtx: AudioContext | null = null
let unlocked = false
let hasPlayedMedia = false
let currentAudio: HTMLAudioElement | null = null
let voicesReady: Promise<void> | null = null

export type SpeakOpts = { rate?: number; lang?: string }

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function slug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Known phoneme keys used in content.ts */
const SOUND_KEYS = new Set([
  'sss',
  'a',
  'ttt',
  'i',
  'ppp',
  'nnn',
  'kkk',
  'e',
  'hhh',
  'rrr',
  'mmm',
  'ddd',
  'ggg',
  'o',
  'u',
  'lll',
  'fff',
  'bbb',
  'jjj',
  'vvv',
  'www',
  'ks',
  'yyy',
  'zzz',
  'kw',
])

function audioUrl(rel: string): string {
  return `${BASE}audio/${rel}`
}

function resolveFile(text: string): string | null {
  const t = text.trim()
  if (!t) return null
  if (SOUND_KEYS.has(t)) return audioUrl(`sound-${t}.mp3`)
  if (/^[A-Za-z]$/.test(t)) return audioUrl(`name-${t.toUpperCase()}.mp3`)
  const s = slug(t)
  if (s) return audioUrl(`word-${s}.mp3`)
  return null
}

function emit(name: string, detail?: unknown): void {
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }))
  } catch {
    /* ignore */
  }
}

function stopCurrent(): void {
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.removeAttribute('src')
      currentAudio.load()
    } catch {
      /* ignore */
    }
    currentAudio = null
  }
}

/** Tiny silent buffer to unlock HTMLAudio / AudioContext on first gesture */
function playSilentUnlock(): void {
  try {
    const a = new Audio(
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA==',
    )
    a.volume = 0.01
    void a.play().catch(() => {})
  } catch {
    /* ignore */
  }
}

/**
 * Call from the first user gesture (and every speak-button click).
 * Resumes AudioContext and unlocks media playback on mobile browsers.
 */
export function unlock(): void {
  try {
    const c = ctx()
    if (c.state === 'suspended') void c.resume()
  } catch {
    /* ignore */
  }
  playSilentUnlock()
  unlocked = true
}

export function isAudioUnlocked(): boolean {
  return unlocked
}

function isLikelyMobile(): boolean {
  try {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  } catch {
    return false
  }
}

/** Auto-speak only after unlock; skip on mobile (gesture-gated browsers). */
export function canAutoSpeak(): boolean {
  if (!unlocked) return false
  if (isLikelyMobile()) return false
  return hasPlayedMedia || unlocked
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    stopCurrent()
    const a = new Audio(url)
    a.preload = 'auto'
    currentAudio = a
    const done = () => {
      if (currentAudio === a) currentAudio = null
      emit('eva-audio-end')
      resolve()
    }
    a.addEventListener('ended', done)
    a.addEventListener('error', () => {
      if (currentAudio === a) currentAudio = null
      emit('eva-audio-end')
      reject(new Error('audio error'))
    })
    emit('eva-audio-start')
    const p = a.play()
    if (p && typeof p.then === 'function') {
      p.then(() => {
        hasPlayedMedia = true
      }).catch((err) => {
        if (currentAudio === a) currentAudio = null
        emit('eva-audio-end')
        reject(err)
      })
    } else {
      hasPlayedMedia = true
    }
  })
}

async function playFileThenFallback(text: string, opts: SpeakOpts): Promise<void> {
  const url = resolveFile(text)
  if (url) {
    try {
      await playUrl(url)
      return
    } catch {
      /* fall through */
    }
  }
  await speakSynth(text, opts)
}

function ensureVoices(): Promise<void> {
  if (voicesReady) return voicesReady
  voicesReady = new Promise((resolve) => {
    try {
      const syn = window.speechSynthesis
      const ready = () => {
        const v = syn.getVoices()
        if (v.length) {
          resolve()
          return true
        }
        return false
      }
      if (ready()) return
      syn.addEventListener('voiceschanged', () => ready() && resolve(), { once: true })
      setTimeout(() => resolve(), 800)
    } catch {
      resolve()
    }
  })
  return voicesReady
}

async function speakSynth(text: string, opts: SpeakOpts): Promise<void> {
  await ensureVoices()
  return new Promise((resolve) => {
    try {
      const syn = window.speechSynthesis
      // Avoid cancel()-then-immediate-speak race on Chrome Android
      try {
        if (syn.speaking || syn.pending) syn.pause()
        syn.resume()
      } catch {
        /* ignore */
      }
      const u = new SpeechSynthesisUtterance(text)
      u.lang = opts.lang ?? 'en-US'
      u.rate = opts.rate ?? 0.85
      const voices = syn.getVoices()
      const en =
        voices.find((v) => /en(-|_)US/i.test(v.lang) && /female|jenny|aria|ana|samantha|zira/i.test(v.name)) ||
        voices.find((v) => /en(-|_)US/i.test(v.lang)) ||
        voices.find((v) => /^en/i.test(v.lang))
      if (en) u.voice = en
      u.onend = () => {
        emit('eva-audio-end')
        resolve()
      }
      u.onerror = () => {
        emit('eva-audio-end')
        resolve()
      }
      emit('eva-audio-start')
      // Small delay instead of cancel helps Chrome Android
      setTimeout(() => {
        try {
          syn.speak(u)
        } catch {
          emit('eva-audio-end')
          resolve()
        }
      }, 40)
    } catch {
      emit('eva-audio-end')
      resolve()
    }
  })
}

const FAIL_HE =
  'לא ניתן להשמיע — בדקי שהטלפון לא במצב שקט / נסי כרום'

/**
 * Primary speak API. Maps known content to shipped MP3s; falls back to speechSynthesis.
 * Invokes Audio.play() synchronously when a file exists (safe from click handlers).
 */
export function speak(text: string, opts: SpeakOpts = {}): void {
  const t = text.trim()
  if (!t) return
  const url = resolveFile(t)
  if (url) {
    // Synchronous play() from user gesture — critical for mobile
    stopCurrent()
    const a = new Audio(url)
    a.preload = 'auto'
    currentAudio = a
    emit('eva-audio-start')
    a.addEventListener('ended', () => {
      if (currentAudio === a) currentAudio = null
      emit('eva-audio-end')
    })
    a.addEventListener('error', () => {
      if (currentAudio === a) currentAudio = null
      emit('eva-audio-end')
      emit('eva-audio-fail', { message: FAIL_HE })
      void speakSynth(t, opts)
    })
    const p = a.play()
    if (p && typeof p.then === 'function') {
      p.then(() => {
        hasPlayedMedia = true
      }).catch(() => {
        if (currentAudio === a) currentAudio = null
        emit('eva-audio-end')
        emit('eva-audio-fail', { message: FAIL_HE })
        void speakSynth(t, opts)
      })
    } else {
      hasPlayedMedia = true
    }
    return
  }
  void playFileThenFallback(t, opts).catch(() => {
    emit('eva-audio-fail', { message: FAIL_HE })
  })
}

/** Play phoneme file, then optionally the keyword. Never silent when files exist. */
export function speakLetterSound(sound: string, keyword?: string): void {
  const soundUrl = SOUND_KEYS.has(sound) ? audioUrl(`sound-${sound}.mp3`) : null
  const wordUrl = keyword ? audioUrl(`word-${slug(keyword)}.mp3`) : null

  const playKeyword = () => {
    if (!keyword) return
    if (wordUrl) {
      const a = new Audio(wordUrl)
      currentAudio = a
      emit('eva-audio-start')
      a.addEventListener('ended', () => {
        if (currentAudio === a) currentAudio = null
        emit('eva-audio-end')
      })
      void a.play().catch(() => {
        speak(keyword, { rate: 0.9 })
      })
    } else {
      speak(keyword, { rate: 0.9 })
    }
  }

  if (soundUrl) {
    stopCurrent()
    const a = new Audio(soundUrl)
    a.preload = 'auto'
    currentAudio = a
    emit('eva-audio-start')
    a.addEventListener('ended', () => {
      if (currentAudio === a) currentAudio = null
      // After phoneme, play keyword ~30% of the time (or always if requested via second call)
      if (keyword && Math.random() < 0.35) {
        setTimeout(playKeyword, 180)
      } else {
        emit('eva-audio-end')
      }
    })
    a.addEventListener('error', () => {
      if (currentAudio === a) currentAudio = null
      emit('eva-audio-fail', { message: FAIL_HE })
      // fallback: keyword phrase
      if (keyword) speak(`${sound} … ${keyword}`, { rate: 0.75 })
      else speak(sound, { rate: 0.7 })
    })
    const p = a.play()
    if (p && typeof p.then === 'function') {
      p.then(() => {
        hasPlayedMedia = true
      }).catch(() => {
        if (currentAudio === a) currentAudio = null
        emit('eva-audio-fail', { message: FAIL_HE })
        if (keyword) speak(keyword, { rate: 0.9 })
        else void speakSynth(sound, { rate: 0.7 })
      })
    } else {
      hasPlayedMedia = true
    }
    return
  }

  // No file: prefer keyword phrase over short phoneme strings
  if (keyword) speak(`${sound} … ${keyword}`, { rate: 0.75 })
  else speak(sound, { rate: 0.7 })
}

export function speakLetterName(name: string): void {
  speak(name, { rate: 0.9 })
}

/** Play a sequence of texts with gaps (for oral blend). First item plays sync if from click. */
export function speakSequence(parts: string[], gapMs = 650, finalWord?: string): void {
  if (!parts.length) {
    if (finalWord) speak(finalWord)
    return
  }
  let i = 0
  const next = () => {
    if (i >= parts.length) {
      if (finalWord) setTimeout(() => speak(finalWord, { rate: 0.85 }), 350)
      return
    }
    const part = parts[i++]
    const url = resolveFile(part)
    if (url) {
      stopCurrent()
      const a = new Audio(url)
      currentAudio = a
      emit('eva-audio-start')
      a.addEventListener('ended', () => {
        if (currentAudio === a) currentAudio = null
        setTimeout(next, gapMs)
      })
      a.addEventListener('error', () => {
        if (currentAudio === a) currentAudio = null
        setTimeout(next, gapMs)
      })
      void a.play().catch(() => setTimeout(next, gapMs))
    } else {
      speak(part, { rate: 0.65 })
      setTimeout(next, gapMs + 200)
    }
  }
  next()
}

export function beep(kind: 'ok' | 'no' | 'tap' = 'tap'): void {
  try {
    unlock()
    const c = ctx()
    if (c.state === 'suspended') void c.resume()
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

/** Warm up voices list (Chrome loads async) — kept for fallback path */
export function warmVoices(): void {
  try {
    void ensureVoices()
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
  } catch {
    /* ignore */
  }
}

export const AUDIO_FAIL_HE = FAIL_HE
