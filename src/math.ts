// Math quiz prep: numbers up to 10,000 (based on the teacher's review sheet, 20.10.2026)
import { load, logExercise, todayKey, type AppData } from './storage'

export type MTopic = 'seq' | 'cmp' | 'line' | 'series' | 'round' | 'think'
export const MTOPICS: MTopic[] = ['seq', 'cmp', 'line', 'series', 'round', 'think']
export const MTOPIC_META: Record<MTopic, { title: string; emoji: string }> = {
  seq: { title: 'רצף מספרים', emoji: '🔢' },
  cmp: { title: 'השוואה', emoji: '⚖️' },
  line: { title: 'ציר המספרים', emoji: '📏' },
  series: { title: 'סדרות', emoji: '🪜' },
  round: { title: 'עיגול לעשרות ולמאות', emoji: '🎯' },
  think: { title: 'אתגר חשיבה', emoji: '💡' },
}
export const MATH_TIPS: Record<MTopic, string> = {
  seq: 'לספור יחד בקול קדימה ואחורה מ־2,995 עד 3,005, ולשים לב מה קורה כשעוברים אלף.',
  cmp: 'לכתוב שני מספרים אחד מעל השני, ולהשוות ספרה־ספרה משמאל: קודם אלפים, אחר כך מאות.',
  line: 'לצייר ציר על דף, ולשאול "בכמה קופצים בין שני קווים?" לפני שממלאים.',
  series: 'לבדוק כמה עולים או יורדים בין שני מספרים, ולבדוק עוד פעם בזוג הבא.',
  round: 'לחזור על הכלל: מסתכלים על הספרה מימין למקום. 5 ומעלה מעלים, 4 ומטה משאירים.',
  think: 'לקרוא כל רמז לבד ולכתוב את הספרה שהוא נותן, לפני שמחברים הכול.',
}
export const ROUND_RULE = 'כלל העיגול: מסתכלים על הספרה שמימין למקום שמעגלים אליו. אם היא 5 ומעלה – מעלים. אם היא 4 ומטה – משאירים, ושמים אפסים מימין.'

export type Clue =
  | { k: 'digits'; n: number }
  | { k: 'place'; place: 1 | 10 | 100 | 1000; d: number }
  | { k: 'between'; a: number; b: number }
  | { k: 'roundTo'; to: 10 | 100; r: number }
  | { k: 'multiple'; m: number }
export type MSpec =
  | { k: 'seq'; terms: number[]; step: number; blanks: number[] }
  | { k: 'prevnext'; n: number }
  | { k: 'cmp'; a: number; b: number }
  | { k: 'line'; ticks: number[]; blanks: number[] }
  | { k: 'mid'; a: number; b: number }
  | { k: 'tap'; min: number; max: number; major: number; minor: number; target: number }
  | { k: 'series'; start: number; step: number; given: number; blanks: number }
  | { k: 'skip'; terms: number[] }
  | { k: 'round'; n: number; to: 10 | 100 }
  | { k: 'riddle'; clues: Clue[] }

export type MItem = {
  id: string
  topic: MTopic
  kind: 'num' | 'cmp' | 'tap'
  html: string // contains {b0},{b1}.. placeholders for number blanks
  blanks: number[][] // accepted values per blank
  cmp?: '<' | '>' | '='
  tap?: { min: number; max: number; major: number; minor: number; target: number }
  plain: string
  spec: MSpec
  hint?: string
}

export const fmt = (n: number): string => n.toLocaleString('en-US')
const N = (n: number): string => `<bdi class="mn" dir="ltr">${fmt(n)}</bdi>`
const LETTERS = ['א', 'ב', 'ג', 'ד']

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
let R = rng(Date.now() % 1e9)
const ri = (a: number, b: number) => a + Math.floor(R() * (b - a + 1))
const pick = <T,>(xs: T[]): T => xs[Math.floor(R() * xs.length)]
export function seedMath(s: number) { R = rng(s) }

// ---------- SVG number line ----------
export function lineSvg(ticks: number[], blanks: number[], minor = 0): string {
  const W = 340, L = 20, Rr = 320, y = 40
  const min = ticks[0], max = ticks[ticks.length - 1]
  const x = (v: number) => L + ((v - min) / (max - min)) * (Rr - L)
  let s = `<svg class="nline" viewBox="0 0 ${W} 80" width="100%" dir="ltr"><line x1="8" y1="${y}" x2="332" y2="${y}" stroke="#335" stroke-width="3"/>`
  s += `<path d="M332 ${y} l-8 -5 v10z M8 ${y} l8 -5 v10z" fill="#335"/>`
  if (minor) for (let v = min; v <= max; v += minor) s += `<line x1="${x(v)}" y1="${y - 5}" x2="${x(v)}" y2="${y + 5}" stroke="#889" stroke-width="1.5"/>`
  ticks.forEach((v, i) => {
    const bi = blanks.indexOf(i)
    s += `<line x1="${x(v)}" y1="${y - 11}" x2="${x(v)}" y2="${y + 11}" stroke="#335" stroke-width="2.5"/>`
    s += bi >= 0
      ? `<rect x="${x(v) - 13}" y="${y + 15}" width="26" height="22" rx="5" fill="#ffe9a8" stroke="#c90"/><text x="${x(v)}" y="${y + 31}" text-anchor="middle" font-size="15" font-weight="700">${LETTERS[bi]}</text>`
      : `<text x="${x(v)}" y="${y + 31}" text-anchor="middle" font-size="${ticks.length > 6 ? 11 : 13}" font-weight="600">${fmt(v)}</text>`
  })
  return s + '</svg>'
}

// ---------- builders (shared by sheet + generators) ----------
let uid = 0
const nid = (p: string) => `${p}${uid++}`
const blankRow = (k: number) => [...Array(k)].map((_, i) => `<div class="mb-row"><b>${LETTERS[i]}</b> = {b${i}}</div>`).join('')

export function mkSeq(terms: number[], blanks: number[], id = nid('sq')): MItem {
  const html = `<p>השלימי את המספרים החסרים:</p><div class="mseq" dir="ltr">${terms.map((t, i) => (blanks.includes(i) ? `{b${blanks.indexOf(i)}}` : N(t))).join('<span class="sep">,</span>')}</div>`
  return { id, topic: 'seq', kind: 'num', html, blanks: blanks.map((i) => [terms[i]]), plain: `רצף: ${terms.map((t, i) => (blanks.includes(i) ? '__' : fmt(t))).join(', ')}`, spec: { k: 'seq', terms, step: terms[1] - terms[0], blanks } }
}
export function mkPrevNext(n: number, id = nid('pn')): MItem {
  return { id, topic: 'seq', kind: 'num', html: `<p>מה המספר שבא <b>לפני</b> ומה המספר שבא <b>אחרי</b>?</p><div class="mseq" dir="ltr">{b0}<span class="sep">,</span>${N(n)}<span class="sep">,</span>{b1}</div>`, blanks: [[n - 1], [n + 1]], plain: `לפני ואחרי ${fmt(n)}`, spec: { k: 'prevnext', n } }
}
export function mkCmp(a: number, b: number, id = nid('cm')): MItem {
  const c = a < b ? '<' : a > b ? '>' : '='
  return { id, topic: 'cmp', kind: 'cmp', html: `<p>בחרי את הסימן המתאים:</p><div class="mcmp" dir="ltr">${N(a)}<span class="cmpbox">?</span>${N(b)}</div>`, blanks: [], cmp: c, plain: `השוואה: ${fmt(a)} ? ${fmt(b)}`, spec: { k: 'cmp', a, b } }
}
export function mkLine(ticks: number[], blanks: number[], id = nid('ln')): MItem {
  return { id, topic: 'line', kind: 'num', html: `<p>אילו מספרים חסרים על הציר?</p>${lineSvg(ticks, blanks)}${blankRow(blanks.length)}`, blanks: blanks.map((i) => [ticks[i]]), plain: `ציר: ${ticks.map((t, i) => (blanks.includes(i) ? '__' : fmt(t))).join(', ')}`, spec: { k: 'line', ticks, blanks } }
}
export function mkMid(a: number, b: number, id = nid('md')): MItem {
  return { id, topic: 'line', kind: 'num', html: `<p>איזה מספר נמצא בדיוק באמצע בין ${N(a)} ל־${N(b)}?</p>${lineSvg([a, (a + b) / 2, b], [1])}${blankRow(1)}`, blanks: [[(a + b) / 2]], plain: `האמצע בין ${fmt(a)} ל־${fmt(b)}`, spec: { k: 'mid', a, b } }
}
export function mkTap(min: number, max: number, major: number, minor: number, target: number, id = nid('tp')): MItem {
  const ticks: number[] = []
  for (let v = min; v <= max; v += major) ticks.push(v)
  return { id, topic: 'line', kind: 'tap', html: `<p>געי בציר במקום של המספר ${N(target)}</p>`, blanks: [], tap: { min, max, major, minor, target }, plain: `לסמן ${fmt(target)} על ציר ${fmt(min)}–${fmt(max)}`, spec: { k: 'tap', min, max, major, minor, target } }
}
export function mkSeries(start: number, step: number, given = 3, nb = 3, id = nid('sr')): MItem {
  const terms = [...Array(given + nb)].map((_, i) => start + i * step)
  return { id, topic: 'series', kind: 'num', html: `<p>המשיכי את הסדרה:</p><div class="mseq" dir="ltr">${terms.map((t, i) => (i < given ? N(t) : `{b${i - given}}`)).join('<span class="sep">,</span>')}</div>`, blanks: terms.slice(given).map((t) => [t]), plain: `סדרה: ${terms.slice(0, given).map(fmt).join(', ')}, __, __, __`, spec: { k: 'series', start, step, given, blanks: nb } }
}
export function mkSkip(terms: number[], id = nid('sk')): MItem {
  const up = terms[1] > terms[0]
  return { id, topic: 'series', kind: 'num', html: `<p>הסדרה ${up ? 'עולה ⬆' : 'יורדת ⬇'}. בכמה ${up ? 'עולים' : 'יורדים'} בכל צעד?</p><div class="mseq" dir="ltr">${terms.map(N).join('<span class="sep">,</span>')}</div><div class="mb-row">גודל הדילוג = {b0}</div>`, blanks: [[Math.abs(terms[1] - terms[0])]], plain: `גודל הדילוג: ${terms.map(fmt).join(', ')}`, spec: { k: 'skip', terms } }
}
export function mkRound(n: number, to: 10 | 100, id = nid('rd')): MItem {
  const r = Math.floor(n / to + 0.5) * to
  return { id, topic: 'round', kind: 'num', hint: ROUND_RULE, html: `<p>עגלי את ${N(n)} ${to === 10 ? '<b>לעשרות</b>' : '<b>למאות</b>'}:</p><div class="mseq" dir="ltr">${N(n)} <span class="sep">≈</span> {b0}</div>`, blanks: [[r]], plain: `לעגל ${fmt(n)} ${to === 10 ? 'לעשרות' : 'למאות'}`, spec: { k: 'round', n, to } }
}
const PLACE_HE: Record<number, string> = { 1: 'היחידות', 10: 'העשרות', 100: 'המאות', 1000: 'האלפים' }
export function clueText(c: Clue): string {
  if (c.k === 'digits') return `אני מספר בן ${c.n} ספרות.`
  if (c.k === 'place') return `ספרת ${PLACE_HE[c.place]} שלי היא ${c.d}.`
  if (c.k === 'between') return `אני גדול מ־${N(c.a)} וקטן מ־${N(c.b)}.`
  if (c.k === 'roundTo') return `כשמעגלים אותי ${c.to === 10 ? 'לעשרות' : 'למאות'} מקבלים ${N(c.r)}.`
  return `אני מספר עגול ב${c.m === 10 ? 'עשרות' : c.m === 100 ? 'מאות' : 'אלפים'} (נגמר ב־${c.m === 10 ? '0' : c.m === 100 ? '00' : '000'}).`
}
export function clueOk(c: Clue, n: number): boolean {
  if (c.k === 'digits') return String(n).length === c.n
  if (c.k === 'place') return Math.floor(n / c.place) % 10 === c.d
  if (c.k === 'between') return n > c.a && n < c.b
  if (c.k === 'roundTo') return Math.floor(n / c.to + 0.5) * c.to === c.r
  return n % c.m === 0
}
export function mkRiddle(clues: Clue[], id = nid('rq')): MItem {
  const acc: number[] = []
  for (let n = 0; n <= 10000; n++) if (clues.every((c) => clueOk(c, n))) acc.push(n)
  const many = acc.length > 1
  return { id, topic: 'think', kind: 'num', html: `<p><b>מי אני?</b>${many ? ' (יש כמה תשובות נכונות – מספיק אחת)' : ''}</p><ul class="clues">${clues.map((c) => `<li>${clueText(c)}</li>`).join('')}</ul><div class="mb-row">אני = {b0}</div>`, blanks: [acc], plain: `חידה: ${clues.map((c) => clueText(c).replace(/<[^>]+>/g, '')).join(' ')}`, spec: { k: 'riddle', clues } }
}

// ---------- (a) the teacher's sheet, item by item ----------
export function sheetItems(): MItem[] {
  uid = 0
  return [
    mkSeq([6345, 6346, 6347, 6348, 6349], [2, 3], 's1a'),
    mkSeq([2997, 2998, 2999, 3000, 3001], [1, 3], 's1b'),
    mkSeq([2200, 2300, 2400, 2500, 2600], [2, 3], 's1c'),
    mkSeq([1970, 1980, 1990, 2000, 2010], [2, 3], 's1d'),
    ...[4000, 4500, 6999, 8000].map((n, i) => mkPrevNext(n, 's1p' + i)),
    ...[[6450, 6540], [3808, 3808], [5220, 5202], [6999, 7000], [7650, 7570], [3100, 3099], [4080, 4800], [5999, 6000]].map(([a, b], i) => mkCmp(a, b, 's2' + i)),
    mkLine([2000, 2100, 2200, 2300, 2400, 2500], [2, 4], 's3a'),
    mkLine([9000, 9200, 9400, 9600, 9800, 10000], [2, 4], 's3b'),
    mkLine([2000, 3000, 4000, 5000, 6000], [0, 4], 's3c'),
    mkMid(4000, 5000, 's3m1'),
    mkMid(6000, 7000, 's3m2'),
    mkTap(3000, 5000, 1000, 100, 3500, 's3t1'),
    mkTap(3000, 5000, 1000, 100, 4500, 's3t2'),
    mkSeries(4150, 100, 3, 3, 's4a'),
    mkSeries(6800, -200, 3, 3, 's4b'),
    mkSeries(4000, 500, 3, 3, 's4c'),
    mkSeries(9000, -1000, 3, 3, 's4d'),
    mkSkip([5150, 5250, 5350, 5450], 's4k1'),
    mkSkip([7600, 7400, 7200, 7000], 's4k2'),
    mkSkip([2000, 2200, 2400, 2600], 's4k3'),
    ...[3436, 3648, 5995, 2441, 8834, 3999].map((n, i) => mkRound(n, 10, 's5t' + i)),
    ...[4349, 4850, 6481, 7750, 3949, 5502].map((n, i) => mkRound(n, 100, 's5h' + i)),
    mkRiddle([{ k: 'digits', n: 4 }, { k: 'place', place: 1000, d: 6 }, { k: 'between', a: 6400, b: 6500 }, { k: 'place', place: 10, d: 2 }, { k: 'place', place: 1, d: 8 }], 's6a'),
    mkRiddle([{ k: 'between', a: 4500, b: 4600 }, { k: 'roundTo', to: 10, r: 4570 }], 's6b'),
  ]
}

// ---------- (b) generators ----------
function genOne(t: MTopic): MItem {
  if (t === 'seq') {
    if (R() < 0.3) return mkPrevNext(pick([ri(1, 9) * 1000, ri(10, 99) * 100, ri(1, 9) * 1000 - 1, ri(1001, 9998), ri(100, 999) * 10]))
    const step = pick([1, 1, 10, 10, 100])
    // often cross a thousand / hundred boundary
    let start = step === 1 ? ri(1, 9) * 1000 - ri(1, 4) : step === 10 ? ri(10, 99) * 100 - 10 * ri(1, 4) : ri(1, 9) * 1000 - 100 * ri(1, 4)
    if (R() < 0.3) start = Math.floor(ri(1000, 9000) / step) * step
    const terms = [...Array(5)].map((_, i) => start + i * step)
    const a = ri(1, 3), b = pick([0, 1, 2, 3, 4].filter((x) => x !== a))
    return mkSeq(terms, [a, b].sort())
  }
  if (t === 'cmp') {
    const k = ri(0, 5), a = ri(1000, 9899)
    const d = String(a).split('')
    if (k === 0) return mkCmp(a, a)
    if (k === 1) { const [x, y] = pick([[1, 2], [2, 3]]); const e = [...d];[e[x], e[y]] = [e[y], e[x]]; return mkCmp(a, +e.join('') || a + 1) }
    if (k === 2) { const m = ri(2, 9) * 1000; return R() < 0.5 ? mkCmp(m - 1, m) : mkCmp(m, m - 1) }
    if (k === 3) { const h = ri(10, 99) * 100; return mkCmp(h, h - 1) }
    if (k === 4) { const b = a + pick([-90, -9, 9, 90, 900, -900]); return mkCmp(a, Math.min(9999, Math.max(1000, b))) }
    return mkCmp(a, ri(1000, 9999))
  }
  if (t === 'line') {
    const k = ri(0, 2)
    if (k === 0) {
      const step = pick([10, 50, 100, 100, 200, 500, 1000])
      const n = step === 1000 ? 5 : 6
      const start = step * ri(Math.ceil(1000 / step), Math.floor((10000 - step * (n - 1)) / step))
      const ticks = [...Array(n)].map((_, i) => start + i * step)
      const a = ri(0, n - 1); let b = ri(0, n - 1); while (b === a || Math.abs(b - a) === 0) b = ri(0, n - 1)
      return mkLine(ticks, [a, b].sort((x, y) => x - y))
    }
    if (k === 1) {
      const w = pick([1000, 1000, 200, 100, 2000])
      const a = w * ri(Math.ceil(1000 / w), Math.floor((10000 - w) / w))
      return mkMid(a, a + w)
    }
    const a = 1000 * ri(1, 8)
    let k2 = ri(1, 19); if (k2 === 10) k2 = 5
    return mkTap(a, a + 2000, 1000, 100, a + 100 * k2)
  }
  if (t === 'series') {
    const step = pick([10, 50, 100, 200, 250, 500, 1000]) * (R() < 0.5 ? 1 : -1)
    const lo = step > 0 ? 1000 : 1000 - 5 * step, hi = step > 0 ? 10000 - 5 * step : 10000
    const unit = Math.abs(step) >= 100 ? 50 : 10
    const start = unit * ri(Math.ceil(lo / unit), Math.floor(hi / unit))
    if (R() < 0.3) return mkSkip([0, 1, 2, 3].map((i) => start + i * step))
    return mkSeries(start, step)
  }
  if (t === 'round') {
    const to = pick([10, 100] as const)
    const k = ri(0, 3)
    let n = ri(1000, 9989)
    if (k === 0) n = Math.floor(n / to) * to + 5 * (to / 10) // exactly 5 at the deciding digit
    if (k === 1) n = to === 10 ? ri(100, 999) * 10 - ri(1, 4) : ri(10, 99) * 100 - ri(1, 49) // carries over
    if (k === 2) n = to === 10 ? ri(100, 999) * 10 - 1 : ri(10, 99) * 100 + ri(0, 9) * 10 + ri(0, 9)
    return mkRound(n, to)
  }
  const k = ri(0, 2)
  if (k === 0) {
    const th = ri(1, 9), h = ri(0, 9), te = ri(0, 9), u = ri(0, 9)
    const lo = th * 1000 + h * 100
    const cl: Clue[] = [{ k: 'digits', n: 4 }, { k: 'place', place: 1000, d: th }, { k: 'between', a: lo, b: lo + 100 }, { k: 'place', place: 10, d: te }, { k: 'place', place: 1, d: u }]
    return mkRiddle(cl)
  }
  if (k === 1) {
    const a = ri(10, 98) * 100, r = a + 10 * ri(1, 9)
    return mkRiddle([{ k: 'between', a, b: a + 100 }, { k: 'roundTo', to: 10, r }])
  }
  const a = ri(1000, 9800), b = a + ri(60, 140)
  const c: Clue[] = [{ k: 'multiple', m: 100 }, { k: 'between', a, b }]
  // ensure exactly one round hundred in range
  let cnt = 0; for (let n = a + 1; n < b; n++) if (n % 100 === 0) cnt++
  return cnt === 1 ? mkRiddle(c) : genOne('think')
}
export function genTopic(t: MTopic, n = 15): MItem[] {
  const out: MItem[] = [], seen = new Set<string>()
  let guard = 0
  while (out.length < n && guard++ < 500) {
    const it = genOne(t)
    if (it.blanks.some((b) => !b.length) || seen.has(it.plain)) continue
    seen.add(it.plain); out.push(it)
  }
  return out
}
export function genMock(): MItem[] {
  return MTOPICS.flatMap((t) => genTopic(t, 3))
}

// ---------- UI ----------
const HELP_MSG = 'כדאי לבקש מאמא, מאבא או מהמורה להסביר את התרגיל הזה'
type Mode = { kind: 'sheet' | 'topic' | 'mock'; topic?: MTopic; title: string }
let host: HTMLDivElement
let back: () => void
let items: MItem[] = []
let qi = 0, attempts = 0, firstOk = 0, solved = 0, t0 = 0
let vals: string[] = []
let active = 0
let given: string[] = []
let tapVal: number | null = null
let helpList: string[] = []
let mode: Mode = { kind: 'sheet', title: '' }
let mockRes: { topic: MTopic; ok: boolean }[] = []
let locked = false

function frame(inner: string): void {
  host.innerHTML = `<div class="wrap math"><div class="top"><div class="hello">היי <span>אווה</span>! 🌟</div><div class="top-actions"><button class="ghost" id="mBack">יציאה</button></div></div>${inner}</div>`
  host.querySelector('#mBack')!.addEventListener('click', () => (items.length && qi < items.length && mode.kind !== 'mock' && screenIs === 'q' ? endSession() : screenIs === 'home' ? back() : mathHome()))
}
let screenIs: 'home' | 'q' | 'end' = 'home'

export function openMath(el: HTMLDivElement, goBack: () => void): void {
  host = el; back = goBack; mathHome()
}

function mathHome(): void {
  screenIs = 'home'
  frame(`
    <h2>🧮 חשבון – הכנה למבדק</h2>
    <p class="lead">מספרים עד ${N(10000)}</p>
    <button class="big-btn m-sheet" id="mSheet">📄 דף החזרה של המורה<small>כל התרגילים מהדף, לפי הסדר</small></button>
    <h3>תרגול לפי נושא (15 שאלות)</h3>
    <div class="m-topics">${MTOPICS.map((t) => `<button class="m-topic" data-t="${t}"><span>${MTOPIC_META[t].emoji}</span>${MTOPIC_META[t].title}</button>`).join('')}</div>
    <button class="big-btn m-mock" id="mMock">📝 מבדק דמה<small>18 שאלות מכל הנושאים · תשובה אחת לכל שאלה</small></button>`)
  host.querySelector('#mSheet')!.addEventListener('click', () => start({ kind: 'sheet', title: 'דף החזרה של המורה' }, sheetItems()))
  host.querySelector('#mMock')!.addEventListener('click', () => start({ kind: 'mock', title: 'מבדק דמה' }, genMock()))
  host.querySelectorAll<HTMLButtonElement>('.m-topic').forEach((b) => b.addEventListener('click', () => { const t = b.dataset.t as MTopic; start({ kind: 'topic', topic: t, title: MTOPIC_META[t].title }, genTopic(t)) }))
}

function start(m: Mode, its: MItem[]): void {
  mode = m; items = its; qi = 0; firstOk = 0; solved = 0; helpList = []; mockRes = []
  showQ()
}

function showQ(): void {
  screenIs = 'q'
  const it = items[qi]
  attempts = 0; given = []; t0 = Date.now(); locked = false
  vals = it.blanks.map(() => ''); active = 0; tapVal = null
  const body = it.html.replace(/\{b(\d)\}/g, (_, i) => `<button class="mblank" data-b="${i}" dir="ltr"></button>`)
  const hint = it.hint ? `<div class="panel m-hint">💡 ${it.hint}</div>` : ''
  const ctrl =
    it.kind === 'cmp'
      ? `<div class="cmp-btns" dir="ltr">${['<', '=', '>'].map((s) => `<button class="cmp-b" data-s="${s}">${s}</button>`).join('')}</div>`
      : it.kind === 'tap'
        ? `<div id="tapHost" dir="ltr"></div><button class="big-btn" id="mCheck">בדיקה ✓</button>`
        : `<div class="keypad" dir="ltr">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-k="${d}">${d}</button>`).join('')}<button data-k="del" class="kdel">⌫</button><button data-k="0">0</button><button data-k="ok" class="kok">✓</button></div>`
  frame(`
    <div class="m-prog"><b>${mode.title}</b> · שאלה ${qi + 1} מתוך ${items.length}</div>
    ${hint}
    <div class="panel m-q">${body}</div>
    <div class="m-msg" id="mMsg"></div>
    ${ctrl}`)
  paintBlanks()
  host.querySelectorAll<HTMLButtonElement>('.mblank').forEach((b) => b.addEventListener('click', () => { active = +b.dataset.b!; paintBlanks() }))
  host.querySelectorAll<HTMLButtonElement>('.keypad button').forEach((b) => b.addEventListener('click', () => key(b.dataset.k!)))
  host.querySelectorAll<HTMLButtonElement>('.cmp-b').forEach((b) => b.addEventListener('click', () => answer(b.dataset.s!)))
  if (it.kind === 'tap') { drawTap(); host.querySelector('#mCheck')!.addEventListener('click', () => { if (tapVal === null) msg('קודם געי בציר 🙂', ''); else answer(String(tapVal)) }) }
}

function drawTap(): void {
  const tp = items[qi].tap!
  const ticks: number[] = []
  for (let v = tp.min; v <= tp.max; v += tp.major) ticks.push(v)
  const th = host.querySelector<HTMLDivElement>('#tapHost')!
  let svg = lineSvg(ticks, [], tp.minor)
  if (tapVal !== null) {
    const x = 20 + ((tapVal - tp.min) / (tp.max - tp.min)) * 300
    svg = svg.replace('</svg>', `<path d="M${x} 28 l-7 -14 h14z" fill="#e33"/></svg>`)
  }
  th.innerHTML = svg
  const el = th.querySelector('svg')!
  el.addEventListener('click', (e) => {
    if (locked) return
    const r = el.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * 340
    const v = tp.min + Math.round((((vx - 20) / 300) * (tp.max - tp.min)) / tp.minor) * tp.minor
    tapVal = Math.max(tp.min, Math.min(tp.max, v)); drawTap()
  })
}

function paintBlanks(): void {
  host.querySelectorAll<HTMLButtonElement>('.mblank').forEach((b) => {
    const i = +b.dataset.b!
    b.textContent = vals[i] ? fmt(+vals[i]) : '\u00a0'
    b.classList.toggle('on', i === active && !locked)
  })
}
function key(k: string): void {
  if (locked) return
  if (k === 'ok') {
    const empty = vals.findIndex((v) => v === '')
    if (empty >= 0) { active = empty; paintBlanks(); msg('יש עוד מקום ריק 🙂', ''); return }
    answer(vals.join('|')); return
  }
  if (k === 'del') vals[active] = vals[active].slice(0, -1)
  else if (vals[active].length < 5) vals[active] = (vals[active] + k).replace(/^0+(?=\d)/, '')
  paintBlanks()
}
function msg(t: string, cls: string): void {
  const m = host.querySelector('#mMsg')!
  m.className = 'm-msg ' + cls; m.innerHTML = t
}

export function isCorrect(it: MItem, ans: string): boolean[] {
  if (it.kind === 'cmp') return [ans === it.cmp]
  if (it.kind === 'tap') return [+ans === it.tap!.target]
  const parts = ans.split('|').map(Number)
  return it.blanks.map((acc, i) => acc.includes(parts[i]))
}

function log(outcome: 'first' | 'solved' | 'help'): void {
  const it = items[qi]
  const data: AppData = load()
  logExercise(data, { at: Date.now(), date: todayKey(), area: 'math', type: 'm:' + it.topic, itemId: it.id, answers: given, attempts, ms: Date.now() - t0, outcome, plain: it.plain })
}

function answer(ans: string): void {
  if (locked) return
  const it = items[qi]
  attempts++; given.push(ans)
  const res = isCorrect(it, ans)
  const ok = res.every(Boolean)
  if (mode.kind === 'mock') {
    locked = true
    mockRes.push({ topic: it.topic, ok })
    if (!ok) helpList.push(it.plain)
    log(ok ? 'first' : 'help')
    next(); return
  }
  if (ok) {
    locked = true; solved++; if (attempts === 1) firstOk++
    log(attempts === 1 ? 'first' : 'solved')
    paintBlanks(); msg('כל הכבוד! ⭐', 'ok')
    setTimeout(next, 900); return
  }
  if (attempts < 3) {
    if (it.kind === 'num') { res.forEach((r, i) => { if (!r) vals[i] = '' }); active = Math.max(0, res.findIndex((r) => !r)); paintBlanks() }
    if (it.kind === 'tap') { tapVal = null; drawTap() }
    const part = it.kind === 'num' && it.blanks.length > 1 && res.some(Boolean) ? 'חלק נכון! המקומות שנמחקו – נסי שוב.' : 'לא בדיוק. נסי שוב 💪'
    msg(`${part} (ניסיון ${attempts} מתוך 3)`, 'no'); return
  }
  locked = true
  helpList.push(it.plain); log('help'); paintBlanks()
  msg(`${HELP_MSG} 💛 <br><button class="big-btn" id="mNext">לשאלה הבאה</button>`, 'help')
  host.querySelector('#mNext')!.addEventListener('click', next)
}

function next(): void {
  qi++
  if (qi >= items.length) endSession()
  else showQ()
}

function endSession(): void {
  screenIs = 'end'
  const done = mode.kind === 'mock' ? mockRes.length : qi
  let summary = ''
  if (mode.kind === 'mock') {
    summary = `<div class="panel"><h3>תוצאות לפי נושא</h3>${MTOPICS.map((t) => { const r = mockRes.filter((x) => x.topic === t); return r.length ? `<div>${MTOPIC_META[t].emoji} ${MTOPIC_META[t].title}: <b dir="ltr">${r.filter((x) => x.ok).length}/${r.length}</b></div>` : '' }).join('')}</div>`
  } else summary = `<div class="panel">נפתרו <b>${solved}</b> מתוך ${done} · בניסיון ראשון <b>${firstOk}</b></div>`
  const help = helpList.length ? `<div class="panel help-list"><strong>${HELP_MSG}:</strong><ol>${helpList.map((h) => `<li>${h}</li>`).join('')}</ol></div>` : '<p>אין תרגילים לרשימת העזרה. מעולה! 🎉</p>'
  frame(`<h2>סיימת! 🎉</h2><p class="lead">${mode.title}</p>${summary}${help}<button class="big-btn" id="mHome">חזרה לחשבון</button>`)
  host.querySelector('#mHome')!.addEventListener('click', mathHome)
  items = []
}
