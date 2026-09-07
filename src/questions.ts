/** Render + handle all question types */

import type { Question } from './session'
import {
  speak,
  speakLetterSound,
  speakLetterName,
  speakSequence,
  beep,
  unlock,
  canAutoSpeak,
  AUDIO_FAIL_HE,
} from './audio'
import { getLetter } from './content'

export type AnswerResult = {
  ok: boolean
  chosen?: string
  confusionWith?: string
}

type Host = {
  root: HTMLElement
  onAnswer: (r: AnswerResult) => void
  allowSkip?: boolean
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (text != null) n.textContent = text
  return n
}

function showAudioToast(near: HTMLElement, msg: string): void {
  let toast = near.parentElement?.querySelector<HTMLElement>('.audio-toast')
  if (!toast) {
    toast = el('p', 'audio-toast', msg)
    near.insertAdjacentElement('afterend', toast)
  } else {
    toast.textContent = msg
  }
  toast.classList.add('show')
  window.setTimeout(() => toast?.classList.remove('show'), 4000)
}

function bindSpeakPulse(btn: HTMLButtonElement): void {
  const onStart = () => btn.classList.add('playing')
  const onEnd = () => btn.classList.remove('playing')
  const onFail = (ev: Event) => {
    btn.classList.remove('playing')
    const detail = (ev as CustomEvent).detail as { message?: string } | undefined
    showAudioToast(btn, detail?.message || AUDIO_FAIL_HE)
  }
  window.addEventListener('eva-audio-start', onStart)
  window.addEventListener('eva-audio-end', onEnd)
  window.addEventListener('eva-audio-fail', onFail)
  // Clean up when card is replaced (next render clears DOM; listeners linger — use AbortController via dataset flag)
  const obs = new MutationObserver(() => {
    if (!document.body.contains(btn)) {
      window.removeEventListener('eva-audio-start', onStart)
      window.removeEventListener('eva-audio-end', onEnd)
      window.removeEventListener('eva-audio-fail', onFail)
      obs.disconnect()
    }
  })
  obs.observe(document.body, { childList: true, subtree: true })
}

function speakBtn(label: string, fn: () => void): HTMLButtonElement {
  const b = el('button', 'speak-btn', '🔊 ' + label)
  b.type = 'button'
  bindSpeakPulse(b)
  b.addEventListener('click', (e) => {
    e.preventDefault()
    // Unlock + play synchronously within the user gesture
    unlock()
    b.classList.add('playing')
    fn()
  })
  return b
}

/** Auto-speak only after audio has been unlocked by a prior tap (mobile-safe). */
function maybeAutoSpeak(fn: () => void, delay = 300): void {
  if (!canAutoSpeak()) return
  window.setTimeout(fn, delay)
}

function optionGrid(children: HTMLElement[]): HTMLElement {
  const g = el('div', 'opt-grid')
  children.forEach((c) => g.appendChild(c))
  return g
}

function bigOpt(content: string, ltr = true): HTMLButtonElement {
  const b = el('button', 'opt', content)
  b.type = 'button'
  if (ltr) b.dir = 'ltr'
  return b
}

export function renderQuestion(q: Question, host: Host): void {
  host.root.innerHTML = ''
  const card = el('div', 'qcard')
  const prompt = el('div', 'prompt', q.promptHe)
  card.appendChild(prompt)

  const body = el('div', 'qbody')
  card.appendChild(body)
  host.root.appendChild(card)

  switch (q.type) {
    case 'hear-letter':
      renderHearLetter(q, body, host)
      break
    case 'match-case':
      renderMatchCase(q, body, host)
      break
    case 'trace':
      renderTrace(q, body, host)
      break
    case 'starts-with':
      renderStartsWith(q, body, host)
      break
    case 'name-vs-sound':
      renderNameVsSound(q, body, host)
      break
    case 'oral-blend':
      renderOralBlend(q, body, host)
      break
    case 'build-cvc':
      renderBuildCvc(q, body, host)
      break
    case 'read-cvc':
      renderReadCvc(q, body, host)
      break
    case 'segment':
      renderSegment(q, body, host)
      break
    case 'heart':
      renderHeart(q, body, host)
      break
    case 'odd-one-out':
      renderOdd(q, body, host)
      break
    case 'arrange-ltr':
    case 'direction':
      renderArrange(q, body, host)
      break
  }
}

function renderHearLetter(q: Question, body: HTMLElement, host: Host) {
  const L = q.letter!
  body.appendChild(
    speakBtn('השמיעי צליל', () => speakLetterSound(L.sound, L.keyword)),
  )
  maybeAutoSpeak(() => speakLetterSound(L.sound))
  const btns = (q.letters || []).map((l) => {
    const b = bigOpt(l.upper + ' ' + l.lower)
    b.addEventListener('click', () => {
      unlock()
      const ok = l.id === q.correct
      host.onAnswer({ ok, chosen: l.id, confusionWith: ok ? undefined : q.correct })
    })
    return b
  })
  body.appendChild(optionGrid(btns))
}

function renderMatchCase(q: Question, body: HTMLElement, host: Host) {
  const L = q.letter!
  const showUpper = !!q.askSound
  const preview = el('div', 'preview-letter', showUpper ? L.upper : L.lower)
  preview.dir = 'ltr'
  body.appendChild(preview)
  body.appendChild(speakBtn('השמיעי', () => speakLetterName(L.name)))
  const btns = (q.letters || []).map((l) => {
    const b = bigOpt(showUpper ? l.lower : l.upper)
    b.addEventListener('click', () => {
      unlock()
      const ok = l.id === q.correct
      host.onAnswer({ ok, chosen: l.id, confusionWith: ok ? undefined : q.correct })
    })
    return b
  })
  body.appendChild(optionGrid(btns))
}

function renderTrace(q: Question, body: HTMLElement, host: Host) {
  const L = q.letter!
  const hint = el('div', 'preview-letter soft', L.upper)
  hint.dir = 'ltr'
  body.appendChild(hint)
  body.appendChild(speakBtn('צליל', () => speakLetterSound(L.sound, L.keyword)))

  const wrap = el('div', 'canvas-wrap')
  const canvas = document.createElement('canvas')
  canvas.width = 280
  canvas.height = 280
  canvas.className = 'trace-canvas'
  wrap.appendChild(canvas)
  body.appendChild(wrap)

  const ctx = canvas.getContext('2d')!
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#5aa9f7'
  // ghost letter
  ctx.save()
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#333'
  ctx.font = 'bold 180px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(L.upper, 140, 150)
  ctx.restore()

  let drawing = false
  let ink = 0
  const pos = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    }
  }
  canvas.addEventListener('pointerdown', (e) => {
    drawing = true
    canvas.setPointerCapture(e.pointerId)
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  })
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ink++
  })
  canvas.addEventListener('pointerup', () => {
    drawing = false
  })

  const row = el('div', 'row-actions')
  const clear = el('button', 'ghost', 'נקה')
  clear.type = 'button'
  clear.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.globalAlpha = 0.12
    ctx.fillStyle = '#333'
    ctx.font = 'bold 180px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(L.upper, 140, 150)
    ctx.restore()
    ink = 0
  })
  const done = el('button', 'primary', 'סיימתי ✓')
  done.type = 'button'
  done.addEventListener('click', () => {
    // generous: any decent stroke counts; or skip allowed
    const ok = ink > 8
    host.onAnswer({ ok: ok || true, chosen: L.id }) // always continue kindly; mark ok if drew
  })
  const skip = el('button', 'ghost', 'דלגי והמשיכי')
  skip.type = 'button'
  skip.addEventListener('click', () => host.onAnswer({ ok: true, chosen: L.id }))
  row.append(clear, done, skip)
  body.appendChild(row)
  const tip = el('p', 'note', 'ציירי מעל האות השקופה — ואז סיימתי')
  body.appendChild(tip)
}

function renderStartsWith(q: Question, body: HTMLElement, host: Host) {
  const L = q.letter!
  body.appendChild(speakBtn('השמיעי צליל', () => speakLetterSound(L.sound, L.keyword)))
  maybeAutoSpeak(() => speakLetterSound(L.sound), 250)
  const btns = (q.emojis || []).map((e) => {
    const b = bigOpt(e.emoji)
    b.classList.add('emoji-opt')
    b.addEventListener('click', () => {
      unlock()
      const ok = e.id === q.correct
      host.onAnswer({ ok, chosen: e.id, confusionWith: ok ? undefined : q.correct })
    })
    return b
  })
  body.appendChild(optionGrid(btns))
}

function renderNameVsSound(q: Question, body: HTMLElement, host: Host) {
  const L = q.letter!
  const preview = el('div', 'preview-letter', L.upper + ' ' + L.lower)
  preview.dir = 'ltr'
  body.appendChild(preview)
  body.appendChild(
    speakBtn(q.askSound ? 'השמיעי שם' : 'השמיעי צליל', () => {
      if (q.askSound) speakLetterName(L.name)
      else speakLetterSound(L.sound)
    }),
  )
  const btns = (q.options || []).map((opt) => {
    const b = bigOpt(opt)
    b.addEventListener('click', () => {
      unlock()
      const ok = opt === q.correct
      host.onAnswer({ ok, chosen: opt })
    })
    return b
  })
  body.appendChild(optionGrid(btns))
}

function renderOralBlend(q: Question, body: HTMLElement, host: Host) {
  const play = () => {
    const sounds = q.sounds || []
    speakSequence(sounds, 650, q.word?.word)
  }
  body.appendChild(speakBtn('השמיעי צלילים', play))
  maybeAutoSpeak(play, 350)
  const btns = (q.words || []).map((w) => {
    const b = bigOpt(`${w.emoji} ${w.word}`)
    b.addEventListener('click', () => {
      unlock()
      const ok = w.id === q.correct
      host.onAnswer({ ok, chosen: w.id, confusionWith: ok ? undefined : q.correct })
    })
    return b
  })
  body.appendChild(optionGrid(btns))
}

function renderBuildCvc(q: Question, body: HTMLElement, host: Host) {
  const W = q.word!
  const emoji = el('div', 'preview-emoji', W.emoji)
  body.appendChild(emoji)
  body.appendChild(speakBtn('השמיעי מילה', () => speak(W.word, { rate: 0.85 })))
  maybeAutoSpeak(() => speak(W.word, { rate: 0.85 }))

  const slots = el('div', 'slots')
  slots.dir = 'ltr'
  const chosen: string[] = []
  const slotEls: HTMLElement[] = [0, 1, 2].map(() => {
    const s = el('div', 'slot', '')
    slots.appendChild(s)
    return s
  })
  body.appendChild(slots)

  const refresh = () => {
    slotEls.forEach((s, i) => {
      s.textContent = chosen[i] ? chosen[i].toUpperCase() : ''
      s.classList.toggle('filled', !!chosen[i])
    })
  }

  const bank = el('div', 'opt-grid')
  bank.dir = 'ltr'
  ;(q.letters || []).forEach((l) => {
    const b = bigOpt(l.lower)
    b.addEventListener('click', () => {
      if (chosen.length >= 3) return
      unlock()
      beep('tap')
      chosen.push(l.lower)
      refresh()
      if (chosen.length === 3) {
        const ok = chosen.join('') === q.correct
        setTimeout(() => host.onAnswer({ ok, chosen: chosen.join(''), confusionWith: ok ? undefined : q.correct }), 200)
      }
    })
    bank.appendChild(b)
  })
  body.appendChild(bank)
  const clear = el('button', 'ghost', 'נקה')
  clear.type = 'button'
  clear.addEventListener('click', () => {
    chosen.length = 0
    refresh()
  })
  body.appendChild(clear)
}

function renderReadCvc(q: Question, body: HTMLElement, host: Host) {
  const W = q.word!
  const preview = el('div', 'preview-word', W.word)
  preview.dir = 'ltr'
  body.appendChild(preview)
  body.appendChild(speakBtn('השמיעי', () => speak(W.word, { rate: 0.85 })))
  const btns = (q.words || []).map((w) => {
    const b = bigOpt(w.emoji)
    b.classList.add('emoji-opt')
    b.addEventListener('click', () => {
      unlock()
      const ok = w.id === q.correct
      host.onAnswer({ ok, chosen: w.id, confusionWith: ok ? undefined : q.correct })
    })
    return b
  })
  body.appendChild(optionGrid(btns))
}

function renderSegment(q: Question, body: HTMLElement, host: Host) {
  const W = q.word!
  const preview = el('div', 'preview-word', `${W.emoji} ${W.word}`)
  preview.dir = 'ltr'
  body.appendChild(preview)
  body.appendChild(speakBtn('השמיעי', () => speak(W.word, { rate: 0.85 })))

  const slots = el('div', 'slots')
  slots.dir = 'ltr'
  const chosen: string[] = []
  const slotEls: HTMLElement[] = [0, 1, 2].map((i) => {
    const s = el('div', 'slot', '')
    s.dataset.i = String(i)
    slots.appendChild(s)
    return s
  })
  body.appendChild(slots)
  const refresh = () => {
    slotEls.forEach((s, i) => {
      const id = chosen[i]
      const L = id ? getLetter(id) : undefined
      s.textContent = L ? L.lower : '·'
      s.classList.toggle('filled', !!id)
    })
  }
  refresh()

  const bank = el('div', 'opt-grid')
  bank.dir = 'ltr'
  ;(q.letters || []).forEach((l) => {
    const b = bigOpt(l.lower)
    b.addEventListener('click', () => {
      if (chosen.length >= 3) return
      unlock()
      beep('tap')
      chosen.push(l.id)
      refresh()
      if (chosen.length === 3) {
        const ok = chosen.join('') === q.correct
        setTimeout(() => host.onAnswer({ ok, chosen: chosen.join(''), confusionWith: ok ? undefined : q.correct }), 200)
      }
    })
    bank.appendChild(b)
  })
  body.appendChild(bank)
  const clear = el('button', 'ghost', 'נקה')
  clear.type = 'button'
  clear.addEventListener('click', () => {
    chosen.length = 0
    refresh()
  })
  body.appendChild(clear)
}

function renderHeart(q: Question, body: HTMLElement, host: Host) {
  const H = q.heart!
  body.appendChild(speakBtn('השמיעי מילת לב', () => speak(H.word, { rate: 0.9 })))
  maybeAutoSpeak(() => speak(H.word, { rate: 0.9 }))
  const btns = (q.hearts || []).map((h) => {
    const b = bigOpt(h.word)
    b.addEventListener('click', () => {
      unlock()
      const ok = h.id === q.correct
      host.onAnswer({ ok, chosen: h.id, confusionWith: ok ? undefined : q.correct })
    })
    return b
  })
  body.appendChild(optionGrid(btns))
}

function renderOdd(q: Question, body: HTMLElement, host: Host) {
  body.appendChild(
    speakBtn('השמיעי רמז', () => {
      const letters = q.letters || []
      speakSequence(letters.map((l) => l.sound), 600)
    }),
  )
  const btns = (q.letters || []).map((l) => {
    const b = bigOpt(`${l.upper}${l.lower} ${l.emoji}`)
    b.addEventListener('click', () => {
      unlock()
      const ok = l.id === q.correct
      host.onAnswer({ ok, chosen: l.id, confusionWith: ok ? undefined : q.correct })
    })
    return b
  })
  body.appendChild(optionGrid(btns))
}

function renderArrange(q: Question, body: HTMLElement, host: Host) {
  const target = q.arrange || []
  const hint = el('p', 'note', 'לחצי על האותיות בסדר הנכון →')
  hint.dir = 'rtl'
  body.appendChild(hint)
  const preview = el('div', 'slots')
  preview.dir = 'ltr'
  const chosen: string[] = []
  const slotEls = target.map(() => {
    const s = el('div', 'slot', '')
    preview.appendChild(s)
    return s
  })
  body.appendChild(preview)
  const refresh = () => {
    slotEls.forEach((s, i) => {
      s.textContent = chosen[i] || ''
      s.classList.toggle('filled', !!chosen[i])
    })
  }
  const bank = el('div', 'opt-grid')
  bank.dir = 'ltr'
  const remaining = new Map<string, HTMLButtonElement>()
  ;(q.letters || []).forEach((l) => {
    const b = bigOpt(l.lower)
    remaining.set(l.lower, b)
    b.addEventListener('click', () => {
      if (b.disabled) return
      unlock()
      beep('tap')
      chosen.push(l.lower)
      b.disabled = true
      b.classList.add('used')
      refresh()
      if (chosen.length === target.length) {
        const ok = chosen.join('') === q.correct
        setTimeout(() => host.onAnswer({ ok, chosen: chosen.join('') }), 200)
      }
    })
    bank.appendChild(b)
  })
  body.appendChild(bank)
  const clear = el('button', 'ghost', 'נקה')
  clear.type = 'button'
  clear.addEventListener('click', () => {
    chosen.length = 0
    remaining.forEach((b) => {
      b.disabled = false
      b.classList.remove('used')
    })
    refresh()
  })
  body.appendChild(clear)
}

export function revealCorrect(q: Question): string {
  if (q.type === 'build-cvc' || q.type === 'arrange-ltr' || q.type === 'direction') return q.correct || ''
  if (q.letter) return `${q.letter.upper}/${q.letter.lower}`
  if (q.word) return q.word.word
  if (q.heart) return q.heart.word
  return q.correct || ''
}

export function speakCorrect(q: Question): void {
  unlock()
  if (q.letter) speakLetterSound(q.letter.sound, q.letter.keyword)
  else if (q.word) speak(q.word.word, { rate: 0.85 })
  else if (q.heart) speak(q.heart.word, { rate: 0.9 })
  else if (q.correct) speak(q.correct, { rate: 0.85 })
}
