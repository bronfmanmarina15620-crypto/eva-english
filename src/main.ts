import './style.css'
import { warmVoices, beep, unlock, stopAudio, speakAlphabetChant } from './audio'
import {
  load,
  save,
  recordAnswer,
  finishSession,
  mixedUnlocked,
  resetAll,
  getPin,
  setPin,
  todayKey,
  getShowAdvanced,
  setShowAdvanced,
  logExercise,
  type ExerciseLog,
} from './storage'
import {
  generateSession,
  MODULE_META,
  ABC_HOME_MODULES,
  ADVANCED_HOME_MODULES,
  type ModuleId,
  type Question,
  type ModuleOpts,
} from './session'
import { renderQuestion, type AnswerResult } from './questions'
import { openMath, MTOPIC_META, MATH_TIPS, type MTopic } from './math'
import { GTYPE_META, GTYPES, GIFTED_TIPS, pickGiftedItems, pickExamChapter, type GType, type GItem, type GStats } from './gifted'
import { CVC_WORDS, HEART_WORDS, PARENT_TIPS, PHONICS_TIPS, lettersAZ, shuffle } from './content'

warmVoices()

// Unlock audio on first user gesture anywhere in the app (mobile Chrome)
document.addEventListener(
  'pointerdown',
  () => {
    unlock()
  },
  { once: true, capture: true },
)

const app = document.querySelector<HTMLDivElement>('#app')!

type Screen = 'gate' | 'home' | 'gifted-home' | 'exam' | 'practice' | 'end' | 'pin' | 'parent' | 'cvc-pick'

let data = load()
let screen: Screen = 'gate'
let questions: Question[] = []
let qi = 0
let correctCount = 0
let firstTryCount = 0
let streak = 0
let currentModule: ModuleId = 'm1'
let currentLabel = ''
let moduleOpts: ModuleOpts = {}
let songPlaying = false
// shared attempt state (standing rules: up to 3 attempts, never reveal)
let area: 'english' | 'gifted' = 'english'
let attempts = 0
let answersGiven: string[] = []
let itemStart = 0
let helpList: string[] = []
let gItems: GItem[] = []
let gType: GType | 'mixed' = 'mixed'
let sessionStart = 0
let timerId: number | undefined
const GIFTED_MS = 20 * 60 * 1000
const CODING_URL = 'https://bronfmanmarina15620-crypto.github.io/evelyn-code/'
const HELP_MSG = 'כדאי לבקש מאמא, מאבא או מהמורה להסביר את התרגיל הזה'

const EN_TYPE_HE: Record<string, string> = {
  'hear-letter': 'אנגלית · שמיעת צליל ובחירת אות',
  'hear-name': 'אנגלית · שמיעת שם אות ובחירה',
  'see-name': 'אנגלית · זיהוי שם אות',
  'next-letter': 'אנגלית · האות הבאה ב־ABC',
  'match-case': 'אנגלית · אות גדולה↔קטנה',
  trace: 'אנגלית · כתיבת אות',
  'starts-with': 'אנגלית · במה המילה מתחילה',
  'name-vs-sound': 'אנגלית · שם מול צליל',
  'oral-blend': 'אנגלית · חיבור צלילים',
  'build-cvc': 'אנגלית · בניית מילה',
  'read-cvc': 'אנגלית · קריאת מילה',
  segment: 'אנגלית · פירוק מילה',
  heart: 'אנגלית · מילות לב',
  'odd-one-out': 'אנגלית · יוצא דופן',
  'arrange-ltr': 'אנגלית · סידור אותיות',
  direction: 'אנגלית · כיוון כתיבה',
}
function typeLabel(t: string): string {
  if (t.startsWith('m:')) return 'חשבון · ' + MTOPIC_META[t.slice(2) as MTopic].title
  if (t.startsWith('g:')) return 'מחוננים · ' + GTYPE_META[t.slice(2) as GType].title
  return EN_TYPE_HE[t] || t
}

function englishPlain(q: Question): string {
  const visual = ['see-name', 'next-letter', 'match-case', 'name-vs-sound'].includes(q.type)
  const shown = q.type === 'match-case' ? (q.askSound ? q.letter?.upper : q.letter?.lower) : q.letter?.upper
  if (visual && shown) return `${q.promptHe} (האות שהוצגה: ${shown})`
  if ((q.type === 'read-cvc' || q.type === 'segment') && q.word) return `${q.promptHe} (המילה: ${q.word.word})`
  return `${q.promptHe} (תרגיל שמיעה)`
}

function pct(a: number, b: number): string {
  if (!b) return '—'
  return Math.round((a / b) * 100) + '%'
}

function render(): void {
  data = load()
  if (screen === 'gate') renderGate()
  else if (screen === 'gifted-home') renderGiftedHome()
  else if (screen === 'exam') renderExam()
  else if (screen === 'home') renderHome()
  else if (screen === 'practice') renderPractice()
  else if (screen === 'end') renderEnd()
  else if (screen === 'pin') renderPin()
  else if (screen === 'parent') renderParent()
  else if (screen === 'cvc-pick') renderCvcPick()
}

function shell(inner: string, topRight?: string): void {
  app.innerHTML = `
    <div class="wrap">
      <div class="top">
        <div class="hello">היי <span>אווה</span>! 🌟</div>
        <div class="top-actions">${topRight || ''}</div>
      </div>
      ${inner}
    </div>`
}

function renderHome(): void {
  const unlocked = mixedUnlocked(data)
  const showAdv = getShowAdvanced(data)
  const abcMods = ABC_HOME_MODULES.map((id) => ({ id, ...MODULE_META[id] }))
  const advMods = showAdv
    ? ADVANCED_HOME_MODULES.map((id) => ({
        id,
        ...MODULE_META[id],
        locked: id === 'm6' && !unlocked,
      }))
    : []

  const az = lettersAZ()
  const strip = az
    .map((l) => {
      const st = letterStrength(l.id)
      return `<span class="${st}" title="${l.upper}">${l.upper}</span>`
    })
    .join('')

  shell(
    `
    <p class="lead">עכשיו מתרגלים <strong>שם האות</strong> — איך קוראים לאות (A, B, C). אחר כך נוסיף מה האות אומרת במילה.</p>
    <button class="song-btn${songPlaying ? ' playing' : ''}" id="abcSong" type="button">${songPlaying ? '■ עצרי שיר' : '🎶 שירי ABC'}</button>
    <p class="note">השיר עוזר לזכור את הרצף — אחריו כדאי סשן 15 שאלות</p>
    <div class="abc-strip" dir="ltr">${strip}</div>
    <div class="mod-grid" id="mods"></div>
    ${
      showAdv
        ? `<h3 class="adv-heading">עוד נושאים</h3><div class="mod-grid" id="advMods"></div>`
        : ''
    }
    <button class="ghost" id="btnGate">→ חזרה לעולם של אווה</button>
    <p class="note">כל תרגול = 15 שאלות · שם האות בלבד (לא הצליל)</p>
    `,
    '',
  )

  const bindMod = (m: { id: ModuleId; title: string; subtitle: string; emoji: string; locked?: boolean }, grid: Element) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'mod-card' + (m.locked ? ' locked' : '')
    b.innerHTML = `<div class="mod-emoji">${m.emoji}</div><div class="mod-title">${m.title}</div><div class="mod-sub" dir="ltr">${m.subtitle}</div>${m.locked ? '<div class="lock">🔒 אחרי 2 אשכולות</div>' : ''}`
    b.addEventListener('click', () => {
      if (m.locked) {
        alert('המשימות המעורבות נפתחות אחרי שמסיימים לפחות שני אשכולות (1–3).')
        return
      }
      if (m.id === 'm4') {
        screen = 'cvc-pick'
        render()
        return
      }
      startModule(m.id)
    })
    grid.appendChild(b)
  }

  const grid = app.querySelector('#mods')!
  abcMods.forEach((m) => bindMod(m, grid))
  if (showAdv) {
    const ag = app.querySelector('#advMods')!
    advMods.forEach((m) => bindMod(m, ag))
  }

  app.querySelector('#abcSong')!.addEventListener('click', () => {
    const btn = app.querySelector<HTMLButtonElement>('#abcSong')!
    if (songPlaying) {
      stopAudio()
      songPlaying = false
      btn.textContent = '🎶 שירי ABC'
      btn.classList.remove('playing')
      return
    }
    unlock()
    songPlaying = true
    btn.textContent = '■ עצרי שיר'
    btn.classList.add('playing')
    speakAlphabetChant(() => {
      songPlaying = false
      if (btn.isConnected) {
        btn.textContent = '🎶 שירי ABC'
        btn.classList.remove('playing')
      }
    })
  })

  app.querySelector('#btnGate')!.addEventListener('click', () => {
    stopAudio()
    songPlaying = false
    screen = 'gate'
    render()
  })
}

function renderGate(): void {
  shell(`
    <h2 class="gate-title">העולם של אווה 🌍</h2>
    <p class="lead">מה מתרגלים היום?</p>
    <button class="gate-tile mt" id="tMt" type="button"><span class="gate-emoji">🧮</span><b>חשבון – הכנה למבדק</b><small>מספרים עד 10,000 · דף החזרה של המורה</small></button>
    <div class="gate-grid">
      <button class="gate-tile en" id="tEn" type="button"><span class="gate-emoji">🔤</span><b>אנגלית</b><small>ABC ושמות האותיות</small></button>
      <button class="gate-tile gf" id="tGf" type="button"><span class="gate-emoji">🧠</span><b>הכנה למבחן המחוננים</b><small>חשיבה, מילים, מספרים וצורות</small></button>
      <a class="gate-tile cd" href="${CODING_URL}" target="_blank" rel="noopener"><span class="gate-emoji">🧩</span><b>תכנות</b><small>נפתח באפליקציה נפרדת</small></a>
    </div>
    <button class="ghost parent-btn" id="btnParent">הורים / התקדמות</button>
  `)
  app.querySelector('#tMt')!.addEventListener('click', () => openMath(app, () => { screen = 'gate'; render() }))
  app.querySelector('#tEn')!.addEventListener('click', () => { screen = 'home'; render() })
  app.querySelector('#tGf')!.addEventListener('click', () => { screen = 'gifted-home'; render() })
  app.querySelector('#btnParent')!.addEventListener('click', () => { screen = 'pin'; render() })
}

function giftedStats(): { stats: GStats; typeErr: Record<string, number> } {
  const stats: GStats = {}
  const agg: Record<string, { n: number; bad: number }> = {}
  for (const r of data.log || []) {
    if (r.area !== 'gifted') continue
    const s = (stats[r.itemId] ||= { tries: 0, fails: 0, firstOk: 0, last: 0, lastFail: 0 })
    s.tries++
    s.last = Math.max(s.last, r.at)
    if (r.outcome === 'first') s.firstOk++
    else { s.fails++; s.lastFail = Math.max(s.lastFail, r.at) }
    const t = r.type.slice(2)
    const a = (agg[t] ||= { n: 0, bad: 0 })
    a.n++
    if (r.outcome !== 'first') a.bad++
  }
  const typeErr: Record<string, number> = {}
  for (const t of GTYPES) typeErr[t] = agg[t] ? agg[t].bad / agg[t].n : 0.5
  return { stats, typeErr }
}

function renderGiftedHome(): void {
  shell(`
    <h2>הכנה למבחן המחוננים 🧠</h2>
    <p class="lead">תרגול קצר, עד 20 דקות. לא ממהרים, חושבים ובודקים.</p>
    <button class="primary exam-btn" id="gExam" type="button">📝 מבחן דמה כמו במבחן האמיתי</button>
    <p class="note">5 פרקים לפי הסדר של מבחן ההדגמה הרשמי, 10 שאלות בכל פרק, שעון לכל פרק. תשובה אחת לכל שאלה.</p>
    <a class="ghost pdf-link" href="${OFFICIAL_PDF}" target="_blank" rel="noopener">📄 מבחן ההדגמה הרשמי של משרד החינוך (PDF)</a>
    <h3>תרגול</h3>
    <button class="primary" id="gMixed" type="button">🎲 תרגול מעורב</button>
    <div class="mod-grid" id="gmods"></div>
    <button class="ghost" id="btnGate">→ חזרה לעולם של אווה</button>
    <p class="note">עד 3 ניסיונות לכל שאלה. התרגול חוזר יותר על מה שקשה לך.</p>
  `)
  const g = app.querySelector('#gmods')!
  GTYPES.forEach((t) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'mod-card'
    b.innerHTML = `<div class="mod-emoji">${GTYPE_META[t].emoji}</div><div class="mod-title">${GTYPE_META[t].title}</div>`
    b.addEventListener('click', () => startGifted(t))
    g.appendChild(b)
  })
  app.querySelector('#gMixed')!.addEventListener('click', () => startGifted('mixed'))
  app.querySelector('#gExam')!.addEventListener('click', startExam)
  app.querySelector('#btnGate')!.addEventListener('click', () => { screen = 'gate'; render() })
}

// ---------- Exam simulation (official demo structure) ----------
const OFFICIAL_PDF = 'https://meyda.education.gov.il/files/gifted/test-shlav2-example.pdf'
const EXAM_ORDER: GType[] = ['analogy', 'sentence', 'word', 'numshape', 'figural']
const EXAM_PER_CHAPTER = 10
const EXAM_CHAPTER_MS = 14 * 60 * 1000 // 70 min total (official) / 5 chapters; per-chapter split not published
const EXAM_TITLES: Record<GType, string> = {
  analogy: 'חלק 1: מה הקשר בין המילים?',
  sentence: 'חלק 2: מהן המילים החסרות במשפט?',
  word: 'חלק 3: מה הפתרון לבעיה?',
  numshape: 'חלק 4: מה המספר החסר בצורה?',
  figural: 'חלק 5: מה הצורה הבאה?',
}
const EXAM_INSTR: Record<GType, string> = {
  analogy: 'בכל שאלה בחלק זה מופיע זוג מילים מודגשות. עליכם לגלות מה הקשר בין זוג המילים המודגשות, ואז לבחור מבין האפשרויות את זוג המילים שהקשר ביניהן הוא הדומה ביותר לקשר שגיליתם. חשוב לשים לב גם לסדר בין המילים בכל זוג.',
  sentence: 'בכל שאלה מופיע משפט שחסרה בו מילה אחת או כמה מילים, ובמקום המילים החסרות מופיעים קווים. מתחת למשפט יש 4 אפשרויות להשלמת החסר במשפט, ועליכם לבחור מביניהן את התשובה המתאימה ביותר.',
  word: 'בחלק זה שאלות מילוליות. קראו כל שאלה בתשומת לב ובחרו את התשובה הנכונה מבין 4 אפשרויות התשובה.',
  numshape: 'בשאלות בחלק זה מופיעים מספרים שמסודרים בתוך צורות. בכל צורה המספרים מסודרים לפי כלל מסוים. הכלל מתבסס על פעולות חשבון (חיבור, חיסור, כפל או חילוק, ולפעמים יותר מפעולה אחת) וגם על המקום של המספרים בצורה. גלו את הכלל, ובעזרתו מצאו איזה מספר צריך להופיע במקום סימן השאלה.',
  figural: 'בחלק זה שאלות משלושה סוגים: צורות בשורה, צורות בשלוש שורות, והחתיכה החסרה בשטיח. בכל שאלה גלו את הכלל ובחרו את הצורה החסרה מבין 4 האפשרויות.',
}
const EXAM_GENERAL = 'במבחן חמישה חלקים. בכל השאלות עליכם לבחור את התשובה הנכונה מבין 4 אפשרויות. כדאי לענות על כל השאלות, ואם לא יודעים – לנחש. לכל חלק יש זמן משלו.'
type ExamCh = { type: GType; items: GItem[]; answers: (number | null)[]; start: number }
let exam: ExamCh[] = []
let examCh = 0
let examQ = 0
let examPhase: 'intro' | 'chapter-intro' | 'q' | 'results' = 'intro'

function startExam(): void {
  exam = EXAM_ORDER.map((t) => {
    const items = pickExamChapter(t, EXAM_PER_CHAPTER)
    return { type: t, items, answers: items.map(() => null), start: 0 }
  })
  examCh = 0
  examQ = 0
  examPhase = 'intro'
  area = 'gifted'
  screen = 'exam'
  render()
}

function examLeft(): number {
  return Math.max(0, EXAM_CHAPTER_MS - (Date.now() - exam[examCh].start))
}

function examTick(): void {
  stopTimer()
  timerId = window.setInterval(() => {
    const el = document.querySelector<HTMLElement>('#gtimer')
    const left = examLeft()
    if (el) el.textContent = `⏱ ${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')} לחלק הזה`
    if (left === 0) {
      stopTimer()
      alert('הזמן של החלק הזה נגמר. עוברים לחלק הבא.')
      nextChapter()
    }
  }, 1000)
}

function nextChapter(): void {
  stopTimer()
  examCh++
  examQ = 0
  if (examCh >= exam.length) finishExam()
  else {
    examPhase = 'chapter-intro'
    render()
  }
}

function finishExam(): void {
  stopTimer()
  examCh = exam.length - 1
  let total = 0
  let ok = 0
  helpList = []
  exam.forEach((ch) =>
    ch.items.forEach((it, i) => {
      const a = ch.answers[i]
      const good = a === it.correct
      total++
      if (good) ok++
      else helpList.push(it.plain)
      logExercise(data, {
        at: Date.now(), date: todayKey(), area: 'gifted', type: 'g:' + it.type, itemId: it.id,
        answers: a == null ? [] : ['אבגד'[a]], attempts: a == null ? 0 : 1, ms: 0,
        outcome: good ? 'first' : 'help', plain: it.plain,
      })
    }),
  )
  finishSession(data, 'gifted-exam', 'מחוננים · מבחן דמה', total, ok, ok)
  data = load()
  examPhase = 'results'
  render()
}

function renderExam(): void {
  if (examPhase === 'intro') {
    shell(`
      <h2>מבחן דמה 📝</h2>
      <div class="panel exam-instr"><p>${EXAM_GENERAL}</p><p class="note">אורך המבחן הרשמי: 70 דקות. בדמה: 14 דקות לכל חלק (חלוקה שלנו – משרד החינוך לא פרסם זמן לכל חלק).</p></div>
      <button class="primary" id="go">מתחילים</button>
      <button class="ghost" id="back">חזרה</button>`)
    app.querySelector('#go')!.addEventListener('click', () => { examPhase = 'chapter-intro'; render() })
    app.querySelector('#back')!.addEventListener('click', () => { screen = 'gifted-home'; render() })
    return
  }
  if (examPhase === 'chapter-intro') {
    const t = exam[examCh].type
    shell(`
      <h2>${EXAM_TITLES[t]}</h2>
      <div class="panel exam-instr"><strong>הוראות</strong><p>${EXAM_INSTR[t]}</p><p class="note">${EXAM_PER_CHAPTER} שאלות · ${EXAM_CHAPTER_MS / 60000} דקות</p></div>
      <button class="primary" id="go">התחילי את החלק</button>`)
    app.querySelector('#go')!.addEventListener('click', () => {
      exam[examCh].start = Date.now()
      examPhase = 'q'
      examTick()
      render()
    })
    return
  }
  if (examPhase === 'q') {
    const ch = exam[examCh]
    shell(`
      <div class="g-timer" id="gtimer">⏱ …</div>
      <p class="note">${EXAM_TITLES[ch.type]} · שאלה ${examQ + 1} מתוך ${ch.items.length}</p>
      <div id="qhost"></div>
      <button class="ghost" id="skip">דלגי (אפשר לחזור בסוף החלק)</button>`,
      `<button class="ghost" id="btnExit">✕</button>`)
    const host = app.querySelector<HTMLElement>('#qhost')!
    renderGiftedItem(ch.items[examQ], host, () => {})
    host.querySelectorAll<HTMLButtonElement>('.g-opt').forEach((b, i) => {
      if (ch.answers[examQ] === i) b.classList.add('chosen')
      b.addEventListener('click', () => {
        ch.answers[examQ] = i
        advanceExam()
      })
    })
    app.querySelector('#skip')!.addEventListener('click', advanceExam)
    app.querySelector('#btnExit')!.addEventListener('click', () => {
      if (confirm('לסיים את מבחן הדמה עכשיו? שאלות שלא נענו ייחשבו כטעות.')) finishExam()
    })
    return
  }
  // results per chapter (no answers revealed)
  const rows = exam
    .map((ch) => {
      const ok = ch.items.filter((it, i) => ch.answers[i] === it.correct).length
      const skipped = ch.answers.filter((a) => a == null).length
      return `<div class="kv"><span>${EXAM_TITLES[ch.type]}</span> <b dir="ltr">${ok}/${ch.items.length}</b>${skipped ? ` <small>(${skipped} בלי תשובה)</small>` : ''}</div>`
    })
    .join('')
  const help = helpList.length
    ? `<div class="panel help-list"><strong>${HELP_MSG}:</strong><ol>${helpList.map((h) => `<li>${h}</li>`).join('')}</ol></div>`
    : ''
  shell(`
    <div class="celebrate">
      <h2>סיימת את מבחן הדמה! 🌟</h2>
      <div class="panel">${rows}</div>
      ${help}
      <button class="primary" id="home">חזרה</button>
    </div>`)
  app.querySelector('#home')!.addEventListener('click', () => { screen = 'gifted-home'; render() })
}

function advanceExam(): void {
  const ch = exam[examCh]
  // move to next unanswered question in this chapter; finish chapter when all answered
  for (let k = 1; k <= ch.items.length; k++) {
    const j = (examQ + k) % ch.items.length
    if (ch.answers[j] == null) {
      examQ = j
      render()
      return
    }
  }
  nextChapter()
}

function resetSessionState(): void {
  qi = 0
  correctCount = 0
  firstTryCount = 0
  streak = 0
  attempts = 0
  answersGiven = []
  helpList = []
  itemStart = Date.now()
  sessionStart = Date.now()
}

function startGifted(t: GType | 'mixed'): void {
  area = 'gifted'
  gType = t
  currentModule = ('gifted-' + t) as ModuleId
  currentLabel = 'מחוננים · ' + (t === 'mixed' ? 'מעורב' : GTYPE_META[t].title)
  const { stats, typeErr } = giftedStats()
  gItems = pickGiftedItems(t, stats, typeErr, 40)
  resetSessionState()
  screen = 'practice'
  startTimer()
  render()
}

function startTimer(): void {
  stopTimer()
  timerId = window.setInterval(() => {
    const el = document.querySelector<HTMLElement>('#gtimer')
    if (el) el.textContent = timerText()
  }, 1000)
}
function stopTimer(): void {
  if (timerId) window.clearInterval(timerId)
  timerId = undefined
}
function timerText(): string {
  const left = Math.max(0, GIFTED_MS - (Date.now() - sessionStart))
  const m = Math.floor(left / 60000)
  const sec = Math.floor((left % 60000) / 1000)
  return left === 0 ? 'הזמן נגמר – מסיימים את השאלה הזו 🌙' : `⏱ ${m}:${String(sec).padStart(2, '0')}`
}

function renderCvcPick(): void {
  shell(
    `
    <h2>מעבדת CVC</h2>
    <p class="lead">בחרי תנועה קצרה לתרגול</p>
    <div class="mod-grid" id="vowels"></div>
    <button class="ghost" id="back">חזרה</button>
    `,
    '',
  )
  const vowels: { v: ModuleOpts['vowel']; label: string }[] = [
    { v: undefined, label: 'הכל' },
    { v: 'a', label: 'a · cat' },
    { v: 'e', label: 'e · hen' },
    { v: 'i', label: 'i · pin' },
    { v: 'o', label: 'o · dog' },
    { v: 'u', label: 'u · cup' },
  ]
  const g = app.querySelector('#vowels')!
  vowels.forEach((x) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'mod-card'
    b.innerHTML = `<div class="mod-title" dir="ltr">${x.label}</div>`
    b.addEventListener('click', () => {
      moduleOpts = { vowel: x.v }
      startModule('m4')
    })
    g.appendChild(b)
  })
  app.querySelector('#back')!.addEventListener('click', () => {
    screen = 'home'
    render()
  })
}

function startModule(id: ModuleId): void {
  stopAudio()
  songPlaying = false
  area = 'english'
  currentModule = id
  currentLabel = MODULE_META[id].title
  questions = generateSession(id, moduleOpts)
  resetSessionState()
  stopTimer()
  screen = 'practice'
  render()
}

function sessionTotal(): number {
  return area === 'english' ? questions.length : gItems.length
}

function renderPractice(): void {
  const acc = pct(correctCount, qi)
  const top =
    area === 'english'
      ? `<div class="chip"><b>${qi + 1}/${questions.length}</b><small>תרגילים</small></div>`
      : `<div class="chip"><b>${qi + 1}</b><small>שאלה</small></div>`
  const progress =
    area === 'english'
      ? ((qi / questions.length) * 100)
      : Math.min(100, ((Date.now() - sessionStart) / GIFTED_MS) * 100)
  shell(
    `
    ${area === 'gifted' ? `<div class="g-timer" id="gtimer">${timerText()}</div>` : ''}
    <div class="stats">
      ${top}
      <div class="chip"><b>${streak}</b><small>ברצף</small></div>
      <div class="chip"><b>${acc}</b><small>הצלחה</small></div>
    </div>
    <div class="progress"><div class="bar" style="width:${progress}%"></div></div>
    ${attempts > 0 ? `<p class="note">ניסיון ${attempts + 1} מתוך 3</p>` : ''}
    <div id="qhost"></div>
    <div class="msg" id="msg"></div>
    <button class="ghost" id="btnHome">סיום וחזרה</button>
    `,
    `<button class="ghost" id="btnExit">✕</button>`,
  )
  const exit = () => {
    if (confirm('לסיים את התרגול עכשיו?')) {
      if (qi >= 1) finishCurrent(true)
      else {
        stopTimer()
        screen = area === 'english' ? 'home' : 'gifted-home'
        render()
      }
    }
  }
  app.querySelector('#btnExit')!.addEventListener('click', exit)
  app.querySelector('#btnHome')!.addEventListener('click', exit)

  const host = app.querySelector<HTMLElement>('#qhost')!
  const msg = app.querySelector<HTMLElement>('#msg')!
  const onAnswer = (r: AnswerResult) => handleAnswer(r, msg, host)
  if (area === 'english') renderQuestion(questions[qi], { root: host, onAnswer })
  else renderGiftedItem(gItems[qi], host, onAnswer)
}

function renderGiftedItem(it: GItem, host: HTMLElement, onAnswer: (r: AnswerResult) => void): void {
  host.innerHTML = ''
  const card = document.createElement('div')
  card.className = 'qcard gcard'
  card.innerHTML = `<div class="name-badge">${GTYPE_META[it.type].title}</div><div class="prompt">${GTYPE_META[it.type].promptHe}</div><div class="g-stem">${it.stem}</div>`
  const grid = document.createElement('div')
  grid.className = 'opt-grid g-opts'
  const letters = ['א', 'ב', 'ג', 'ד']
  it.options.forEach((o, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'opt g-opt'
    b.innerHTML = `<span class="g-letter">${letters[i]}.</span> <span class="g-optbody">${o}</span>`
    b.addEventListener('click', () => onAnswer({ ok: i === it.correct, chosen: letters[i] }))
    grid.appendChild(b)
  })
  card.appendChild(grid)
  host.appendChild(card)
}

function currentMeta(): { type: string; itemId: string; plain: string } {
  if (area === 'english') {
    const q = questions[qi]
    return { type: q.type, itemId: q.skillId + ':' + q.type, plain: englishPlain(q) }
  }
  const it = gItems[qi]
  return { type: 'g:' + it.type, itemId: it.id, plain: it.plain }
}

function writeLog(outcome: ExerciseLog['outcome']): void {
  const m = currentMeta()
  logExercise(data, {
    at: Date.now(),
    date: todayKey(),
    area,
    type: m.type,
    itemId: m.itemId,
    answers: [...answersGiven],
    attempts,
    ms: Date.now() - itemStart,
    outcome,
    plain: m.plain,
  })
}

function skillOf(): { id: string; type: 'letter' | 'cvc' | 'heart' | 'blend' | 'other' } {
  if (area === 'english') return { id: questions[qi].skillId, type: questions[qi].skillType }
  return { id: 'gifted:' + gItems[qi].type, type: 'other' }
}

function handleAnswer(r: AnswerResult, msg: HTMLElement, host: HTMLElement): void {
  host.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true))
  attempts++
  answersGiven.push(r.chosen ?? '')
  const sk = skillOf()

  if (r.ok) {
    beep('ok')
    msg.className = 'msg ok'
    msg.textContent = attempts > 1 ? 'יופי! עכשיו נכון ⭐' : 'כל הכבוד! ⭐'
    recordAnswer(data, sk.id, sk.type, true)
    save(data)
    correctCount++
    if (attempts === 1) firstTryCount++
    streak++
    writeLog(attempts === 1 ? 'first' : 'solved')
    setTimeout(advance, 700)
    return
  }

  beep('no')
  recordAnswer(data, sk.id, sk.type, false, r.confusionWith)
  save(data)
  streak = 0
  msg.className = 'msg no'
  if (attempts < 3) {
    msg.textContent = attempts === 1 ? 'כמעט... נסי שוב 💛' : 'עוד ניסיון אחד. חשבי בשקט ובדקי שוב 💛'
    setTimeout(() => render(), 1000)
    return
  }
  // 3rd miss: never reveal the answer
  msg.textContent = HELP_MSG + ' 💛'
  helpList.push(currentMeta().plain)
  writeLog('help')
  setTimeout(advance, 2600)
}

function advance(): void {
  qi++
  attempts = 0
  answersGiven = []
  itemStart = Date.now()
  const timeUp = area === 'gifted' && Date.now() - sessionStart >= GIFTED_MS
  if (qi >= sessionTotal() || timeUp) finishCurrent(false)
  else render()
}

function finishCurrent(partial: boolean): void {
  stopTimer()
  finishSession(data, currentModule, currentLabel + (partial ? ' (חלקי)' : ''), qi, correctCount, firstTryCount)
  data = load()
  screen = 'end'
  render()
}

function renderEnd(): void {
  const tipPool = getShowAdvanced(data) ? [...PARENT_TIPS, ...PHONICS_TIPS] : PARENT_TIPS
  const tip = area === 'english' ? shuffle(tipPool)[0] : 'לשבת יחד על שאלה אחת מהרשימה, ולבקש מאווה להסביר בקול איך חשבה. לא לתת את התשובה.'
  const total = Math.max(1, qi)
  const stars = Math.max(1, Math.round((correctCount / total) * 5))
  const help = helpList.length
    ? `<div class="panel help-list"><strong>${HELP_MSG}:</strong><ol>${helpList.map((h) => `<li>${h}</li>`).join('')}</ol></div>`
    : ''
  shell(
    `
    <div class="celebrate">
      <div class="stars">${'⭐'.repeat(stars)}</div>
      <h2>סיימת תרגול!</h2>
      <p class="lead">${correctCount} מתוך ${qi} נכון · ${firstTryCount} בניסיון ראשון</p>
      ${help}
      <div class="panel tip"><strong>טיפ להורים:</strong><br>${tip}</div>
      <button class="primary" id="again">עוד סבב באותו נושא</button>
      <button class="ghost" id="home">חזרה לתפריט</button>
    </div>
    `,
  )
  app.querySelector('#again')!.addEventListener('click', () => (area === 'english' ? startModule(currentModule) : startGifted(gType)))
  app.querySelector('#home')!.addEventListener('click', () => {
    screen = area === 'english' ? 'home' : 'gifted-home'
    render()
  })
}

function renderPin(): void {
  shell(
    `
    <div class="panel">
      <h2>מסך הורים</h2>
      <input class="pin" id="pinInput" type="tel" inputmode="numeric" maxlength="4" placeholder="••••" />
      <div class="note" id="pinNote">קוד ברירת מחדל: 2607</div>
      <button class="primary" id="pinGo">כניסה</button>
      <button class="ghost" id="pinBack">חזרה</button>
    </div>
    `,
  )
  const input = app.querySelector<HTMLInputElement>('#pinInput')!
  const go = () => {
    if (input.value === getPin(data)) {
      screen = 'parent'
      render()
    } else {
      app.querySelector('#pinNote')!.textContent = 'קוד שגוי'
    }
  }
  app.querySelector('#pinGo')!.addEventListener('click', go)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') go()
  })
  app.querySelector('#pinBack')!.addEventListener('click', () => {
    screen = 'gate'
    render()
  })
  setTimeout(() => input.focus(), 100)
}

function letterStrength(id: string): 'g' | 'y' | 'r' | 'n' {
  const s = data.skills[`letter:${id}`]
  if (!s || s.seen === 0) return 'n'
  const rate = s.correct / s.seen
  if (rate >= 0.75 && s.seen >= 2) return 'g'
  if (rate >= 0.45) return 'y'
  return 'r'
}

function renderParent(): void {
  const last14 = [...Array(14)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return todayKey(d)
  })
  const dayMap = Object.fromEntries(data.days.map((d) => [d.date, d]))

  const vowels = ['a', 'e', 'i', 'o', 'u'] as const
  const vowelAcc = vowels.map((v) => {
    const words = CVC_WORDS.filter((w) => w.vowel === v)
    let c = 0,
      t = 0
    words.forEach((w) => {
      const s = data.skills[`cvc:${w.id}`]
      if (s) {
        c += s.correct
        t += s.seen
      }
    })
    return { v, pct: t ? Math.round((c / t) * 100) : null, t }
  })

  const heartRows = HEART_WORDS.map((h) => {
    const s = data.skills[`heart:${h.id}`]
    return { w: h.word, seen: s?.seen || 0, ok: s ? pct(s.correct, s.seen) : '—' }
  })

  const conf = data.confusions.slice(0, 5)
  const sessions = data.sessions.slice(0, 10)

  const azLetters = lettersAZ()
  const mastered = azLetters.filter((l) => letterStrength(l.id) === 'g').length
  // strengths / weaknesses — A–Z name map
  const letterStats = azLetters
    .map((l) => {
      const s = data.skills[`letter:${l.id}`]
      const rate = s && s.seen ? s.correct / s.seen : -1
      return { id: l.upper, rate, seen: s?.seen || 0 }
    })
    .filter((x) => x.seen > 0)
  const strong = letterStats.filter((x) => x.rate >= 0.75).map((x) => x.id)
  const weak = letterStats.filter((x) => x.rate < 0.5).map((x) => x.id)

  shell(
    `
    <div class="top-row">
      <h2>ההתקדמות של אווה</h2>
      <button class="ghost" id="back">חזרה</button>
    </div>
    <div class="panel">
      <div class="stats">
        <div class="chip"><b>${data.streakDays || 0}</b><small>רצף ימים</small></div>
        <div class="chip"><b>${data.sessions.length}</b><small>סשנים</small></div>
        <div class="chip"><b>${mastered}/26</b><small>שמות חזקים</small></div>
      </div>
    </div>

    <div class="panel tip"><strong>טיפים למבחן המחוננים (ממנהלת קבוצת ההורים):</strong>
      <ul><li>לתרגל עם שעון (מבחן הדמה) רק אחרי שאווה מרגישה בטוחה בחומר. קודם תרגול רגיל, בלי לחץ זמן.</li>
      <li>להסביר לה שבשלב ב׳ אף אחד לא מצפה שתענה נכון על הכול. זה בסדר לטעות ולנחש.</li></ul></div>

    <h3>מה הכי קשה לאווה (מהקשה לקל)</h3>
    <div id="rank"></div>

    <h3>סיכום שבועי (7 ימים)</h3>
    <div class="panel" id="weekly"></div>
    <button class="primary" id="copyWeek">העתיקי סיכום שבועי</button>

    <h3>14 הימים האחרונים</h3>
    <div class="days" id="days"></div>

    <h3>מפת שמות אותיות A–Z</h3>
    <div class="alpha-map" id="amap" dir="ltr"></div>
    <p class="note">ירוק=חזק · צהוב=בינוני · אדום=לתרגל · אפור=עדיין לא · שם האות</p>

    <div class="panel">
      <label class="toggle-row">
        <input type="checkbox" id="advToggle" ${getShowAdvanced(data) ? 'checked' : ''} />
        <span><strong>הצג נושאים מתקדמים</strong><br><small>צלילים, SATPIN, CVC, מילות לב — כבוי כברירת מחדל. אווה רואה רק ABC.</small></span>
      </label>
    </div>

    <h3>דיוק CVC לפי תנועה</h3>
    <div id="vow"></div>

    <h3>מילות לב</h3>
    <div id="hearts"></div>

    <h3>בלבולים</h3>
    <div id="conf"></div>

    <h3>חוזקות וחולשות</h3>
    <div class="panel" id="sw"></div>

    <h3>סשנים אחרונים</h3>
    <div class="table-wrap"><table id="sess"><thead><tr><th>תאריך</th><th>מודול</th><th>נכון</th></tr></thead><tbody></tbody></table></div>

    <button class="primary" id="wa">העתיקי דוח לוואטסאפ</button>
    <button class="ghost" id="chgPin">שני קוד PIN</button>
    <button class="danger" id="reset">איפוס כל הנתונים</button>
    `,
  )

  const daysEl = app.querySelector('#days')!
  last14.forEach((dk) => {
    const cell = document.createElement('div')
    const d = dayMap[dk]
    const n = d?.answers || 0
    cell.className = 'day' + (n ? ' on' : '')
    cell.title = dk
    cell.innerHTML = `<b>${n || ''}</b><small>${dk.slice(8)}</small>`
    daysEl.appendChild(cell)
  })

  const amap = app.querySelector('#amap')!
  lettersAZ().forEach((l) => {
    const c = document.createElement('div')
    const st = letterStrength(l.id)
    c.className = 'acell ' + st
    c.textContent = l.upper
    c.title = `${l.upper} ${l.lower}`
    amap.appendChild(c)
  })

  app.querySelector('#advToggle')!.addEventListener('change', (e) => {
    const on = (e.target as HTMLInputElement).checked
    setShowAdvanced(data, on)
    data = load()
  })

  app.querySelector('#vow')!.innerHTML = vowelAcc
    .map((x) => `<div class="kv"><span dir="ltr">/${x.v}/</span> <b>${x.pct == null ? '—' : x.pct + '%'}</b> <small>(${x.t})</small></div>`)
    .join('')

  app.querySelector('#hearts')!.innerHTML = heartRows
    .map((h) => `<span class="tag" dir="ltr">${h.w} · ${h.ok}</span>`)
    .join(' ')

  app.querySelector('#conf')!.innerHTML = conf.length
    ? conf.map((c) => `<div class="kv">${c.pair.replace('|', ' ↔ ')} ×${c.count}</div>`).join('')
    : '<p class="note">עדיין אין מספיק נתונים</p>'

  app.querySelector('#sw')!.innerHTML = `
    <p><strong>חזק:</strong> ${strong.length ? strong.join(', ') : 'עוד מוקדם'}</p>
    <p><strong>לתרגל:</strong> ${weak.length ? weak.join(', ') : 'מצוין — אין חולשה בולטת'}</p>
    <p class="note">מצב נוכחי: שם האות (ABC). נושאים מתקדמים ${getShowAdvanced(data) ? 'גלויים' : 'מוסתרים'} בבית.</p>
  `

  const tb = app.querySelector('#sess tbody')!
  sessions.forEach((s) => {
    const tr = document.createElement('tr')
    const dt = new Date(s.at)
    // show Asia/Jerusalem-ish via locale
    const label = dt.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    tr.innerHTML = `<td>${label}</td><td>${s.label}</td><td dir="ltr">${s.correct}/${s.total}</td>`
    tb.appendChild(tr)
  })

  app.querySelector('#back')!.addEventListener('click', () => {
    screen = 'gate'
    render()
  })

  const rank = rankTypes(data.log || [])
  app.querySelector('#rank')!.innerHTML = rank.length
    ? rank
        .map(
          (r, i) =>
            `<div class="panel rank-row"><b>${i + 1}. ${typeLabel(r.type)}</b> · ${r.n} תרגילים · בניסיון ראשון ${r.firstPct}% · נעזרה במבוגר ${r.help} · ממוצע ניסיונות ${r.avgAtt}<br><small>למחר: ${suggestFor(r.type)}</small></div>`,
        )
        .join('')
    : '<p class="note">עדיין אין מספיק נתונים</p>'
  app.querySelector('#weekly')!.innerHTML = weeklySummary().replace(/\n/g, '<br>')
  app.querySelector('#copyWeek')!.addEventListener('click', async () => {
    const t = weeklySummary()
    try {
      await navigator.clipboard.writeText(t)
      alert('הסיכום הועתק')
    } catch {
      prompt('העתיקי ידנית:', t)
    }
  })

  app.querySelector('#wa')!.addEventListener('click', async () => {
    const report = buildWhatsAppReport()
    try {
      await navigator.clipboard.writeText(report)
      alert('הדוח הועתק! אפשר להדביק בוואטסאפ.')
    } catch {
      prompt('העתיקי ידנית:', report)
    }
  })

  app.querySelector('#chgPin')!.addEventListener('click', () => {
    const n = prompt('קוד חדש (4 ספרות):', getPin(data))
    if (n && /^\d{4}$/.test(n)) {
      setPin(data, n)
      data = load()
      alert('הקוד עודכן')
    } else if (n != null) alert('צריך בדיוק 4 ספרות')
  })

  app.querySelector('#reset')!.addEventListener('click', () => {
    if (confirm('לאפס את כל הנתונים? לא ניתן לשחזר.')) {
      if (confirm('בטוח בטוח?')) {
        data = resetAll()
        alert('אופס')
        render()
      }
    }
  })
}

type RankRow = { type: string; n: number; firstPct: number; help: number; avgAtt: string; score: number; okPct: number }
export function rankTypes(log: ExerciseLog[]): RankRow[] {
  const by: Record<string, ExerciseLog[]> = {}
  for (const r of log) (by[r.type] ||= []).push(r)
  return Object.entries(by)
    .map(([type, rows]) => {
      const n = rows.length
      const first = rows.filter((r) => r.outcome === 'first').length
      const help = rows.filter((r) => r.outcome === 'help').length
      const att = rows.reduce((a, r) => a + r.attempts, 0) / n
      return {
        type,
        n,
        firstPct: Math.round((first / n) * 100),
        okPct: Math.round(((n - help) / n) * 100),
        help,
        avgAtt: att.toFixed(1),
        score: (help / n) * 2 + (1 - first / n) + (att - 1) / 2,
      }
    })
    .sort((a, b) => b.score - a.score)
}

function suggestFor(type: string): string {
  if (type.startsWith('m:')) return MATH_TIPS[type.slice(2) as MTopic]
  if (type.startsWith('g:')) return GIFTED_TIPS[type.slice(2) as GType]
  return 'סבב קצר של 15 שאלות באותו נושא. לפני כן לשיר יחד את שיר ה־ABC, ולבקש מאווה לומר בקול את שם האות לפני שהיא בוחרת.'
}

function weeklySummary(): string {
  const d = load()
  const since = Date.now() - 7 * 86400000
  const rows = (d.log || []).filter((r) => r.at >= since)
  const days = new Set(rows.map((r) => r.date)).size
  const minutes = Math.round(rows.reduce((a, r) => a + Math.min(r.ms, 5 * 60000), 0) / 60000)
  const rank = rankTypes(rows)
  const lines = [
    '📅 סיכום שבועי – אווה',
    `ימי תרגול: ${days} מתוך 7`,
    `דקות תרגול (בערך): ${minutes}`,
    `תרגילים: ${rows.length}`,
    '',
    'דיוק לפי סוג (נפתר עד 3 ניסיונות / בניסיון ראשון):',
    ...rank.map((r) => `• ${typeLabel(r.type)}: ${r.okPct}% / ${r.firstPct}% (${r.n})`),
    '',
    'שלושת הסוגים הכי קשים:',
    ...(rank.slice(0, 3).map((r, i) => `${i + 1}. ${typeLabel(r.type)}`)),
  ]
  if (!rows.length) lines.push('אין עדיין תרגול השבוע')
  return lines.join('\n')
}

function buildWhatsAppReport(): string {
  const d = load()
  const lines = [
    '📊 דוח אווה אנגלית',
    `רצף ימים: ${d.streakDays || 0}`,
    `סשנים: ${d.sessions.length}`,
    `שמות אותיות חזקים: ${lettersAZ().filter((l) => letterStrength(l.id) === 'g').map((l) => l.upper).join(' ') || '—'}`,
    '',
    'אחרונים:',
    ...d.sessions.slice(0, 5).map((s) => {
      const dt = new Date(s.at).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
      return `• ${dt} — ${s.label}: ${s.correct}/${s.total}`
    }),
    '',
    'לינק: https://bronfmanmarina15620-crypto.github.io/eva-english/',
  ]
  return lines.join('\n')
}

render()
