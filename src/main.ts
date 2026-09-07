import './style.css'
import { warmVoices, beep } from './audio'
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
} from './storage'
import { generateSession, MODULE_META, type ModuleId, type Question, type ModuleOpts } from './session'
import { renderQuestion, revealCorrect, speakCorrect, type AnswerResult } from './questions'
import { LETTERS, CVC_WORDS, HEART_WORDS, PARENT_TIPS, shuffle } from './content'

warmVoices()

const app = document.querySelector<HTMLDivElement>('#app')!

type Screen = 'home' | 'practice' | 'end' | 'pin' | 'parent' | 'cvc-pick'

let data = load()
let screen: Screen = 'home'
let questions: Question[] = []
let qi = 0
let correctCount = 0
let firstTryCount = 0
let streak = 0
let triedOnce = false
let currentModule: ModuleId = 'm1'
let currentLabel = ''
let moduleOpts: ModuleOpts = {}

function pct(a: number, b: number): string {
  if (!b) return '—'
  return Math.round((a / b) * 100) + '%'
}

function render(): void {
  data = load()
  if (screen === 'home') renderHome()
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
  const mods: { id: ModuleId | 'parent'; title: string; subtitle: string; emoji: string; locked?: boolean; sub?: string }[] = [
    { id: 'm0', ...MODULE_META.m0 },
    { id: 'm1', ...MODULE_META.m1 },
    { id: 'm2', ...MODULE_META.m2 },
    { id: 'm3', ...MODULE_META.m3 },
    { id: 'm4', ...MODULE_META.m4 },
    { id: 'm5', ...MODULE_META.m5 },
    { id: 'm6', ...MODULE_META.m6, locked: !unlocked },
  ]
  shell(
    `
    <p class="lead">בואי נתרגל אנגלית — צלילים, אותיות ומילים קצרות</p>
    <div class="mod-grid" id="mods"></div>
    <button class="ghost parent-btn" id="btnParent">הורים / התקדמות</button>
    <p class="note">כל תרגול = 15 שאלות · אפשר לעצור ולחזור</p>
    `,
    '',
  )
  const grid = app.querySelector('#mods')!
  mods.forEach((m) => {
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
      startModule(m.id as ModuleId)
    })
    grid.appendChild(b)
  })
  app.querySelector('#btnParent')!.addEventListener('click', () => {
    screen = 'pin'
    render()
  })
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
  currentModule = id
  currentLabel = MODULE_META[id].title
  questions = generateSession(id, moduleOpts)
  qi = 0
  correctCount = 0
  firstTryCount = 0
  streak = 0
  triedOnce = false
  screen = 'practice'
  render()
}

function renderPractice(): void {
  const q = questions[qi]
  const acc = pct(correctCount, qi)
  shell(
    `
    <div class="stats">
      <div class="chip"><b>${qi + 1}/15</b><small>תרגילים</small></div>
      <div class="chip"><b>${streak}</b><small>ברצף</small></div>
      <div class="chip"><b>${acc}</b><small>הצלחה</small></div>
    </div>
    <div class="progress"><div class="bar" style="width:${((qi) / 15) * 100}%"></div></div>
    <div id="qhost"></div>
    <div class="msg" id="msg"></div>
    <button class="ghost" id="btnHome">חזרה לתפריט</button>
    `,
    `<button class="ghost" id="btnExit">✕</button>`,
  )
  const exit = () => {
    if (confirm('לצאת מהתרגול? ההתקדמות של השאלות עד כה תישמר חלקית.')) {
      // save partial as session if at least 3 answered
      if (qi >= 3) {
        finishSession(data, currentModule, currentLabel + ' (חלקי)', qi, correctCount, firstTryCount)
        data = load()
      }
      screen = 'home'
      render()
    }
  }
  app.querySelector('#btnExit')!.addEventListener('click', exit)
  app.querySelector('#btnHome')!.addEventListener('click', exit)

  const host = app.querySelector<HTMLElement>('#qhost')!
  const msg = app.querySelector<HTMLElement>('#msg')!

  renderQuestion(q, {
    root: host,
    onAnswer: (r) => handleAnswer(r, msg, host),
  })
}

function handleAnswer(r: AnswerResult, msg: HTMLElement, host: HTMLElement): void {
  const q = questions[qi]
  // disable further clicks
  host.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true))

  if (r.ok) {
    beep('ok')
    msg.className = 'msg ok'
    msg.textContent = triedOnce ? 'יופי! עכשיו נכון ⭐' : 'כל הכבוד! ⭐'
    recordAnswer(data, q.skillId, q.skillType, true)
    save(data)
    correctCount++
    if (!triedOnce) firstTryCount++
    streak++
    triedOnce = false
    setTimeout(() => {
      qi++
      if (qi >= questions.length) {
        finishSession(data, currentModule, currentLabel, 15, correctCount, firstTryCount)
        data = load()
        screen = 'end'
      }
      render()
    }, 700)
  } else {
    beep('no')
    if (!triedOnce) {
      triedOnce = true
      msg.className = 'msg no'
      msg.innerHTML = 'כמעט... נסי שוב 💛'
      recordAnswer(data, q.skillId, q.skillType, false, r.confusionWith)
      save(data)
      streak = 0
      setTimeout(() => {
        // re-enable / re-render same question
        render()
      }, 900)
    } else {
      msg.className = 'msg no'
      const ans = revealCorrect(q)
      msg.innerHTML = `בואי נזכור: <span dir="ltr">${ans}</span>`
      speakCorrect(q)
      recordAnswer(data, q.skillId, q.skillType, false, r.confusionWith)
      save(data)
      streak = 0
      triedOnce = false
      setTimeout(() => {
        qi++
        if (qi >= questions.length) {
          finishSession(data, currentModule, currentLabel, 15, correctCount, firstTryCount)
          data = load()
          screen = 'end'
        }
        render()
      }, 1600)
    }
  }
}

function renderEnd(): void {
  const tip = shuffle(PARENT_TIPS)[0]
  const stars = Math.max(1, Math.round((correctCount / 15) * 5))
  shell(
    `
    <div class="celebrate">
      <div class="stars">${'⭐'.repeat(stars)}</div>
      <h2>סיימת תרגול!</h2>
      <p class="lead">${correctCount} מתוך 15 נכון · ${firstTryCount} בניסיון ראשון</p>
      <div class="panel tip"><strong>טיפ להורים:</strong><br>${tip}</div>
      <button class="primary" id="again">עוד סבב באותו נושא</button>
      <button class="ghost" id="home">חזרה לתפריט</button>
    </div>
    `,
  )
  app.querySelector('#again')!.addEventListener('click', () => startModule(currentModule))
  app.querySelector('#home')!.addEventListener('click', () => {
    screen = 'home'
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
    screen = 'home'
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

  // strengths / weaknesses
  const letterStats = LETTERS.filter((l) => l.cluster <= 3)
    .map((l) => {
      const s = data.skills[`letter:${l.id}`]
      const rate = s && s.seen ? s.correct / s.seen : -1
      return { id: l.id, rate, seen: s?.seen || 0 }
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
        <div class="chip"><b>${data.completedClusterSessions.length}/3</b><small>אשכולות</small></div>
      </div>
    </div>

    <h3>14 הימים האחרונים</h3>
    <div class="days" id="days"></div>

    <h3>מפת אותיות</h3>
    <div class="alpha-map" id="amap" dir="ltr"></div>
    <p class="note">ירוק=חזק · צהוב=בינוני · אדום=לתרגל · אפור=עדיין לא</p>

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
  LETTERS.filter((l) => l.cluster <= 3).forEach((l) => {
    const c = document.createElement('div')
    const st = letterStrength(l.id)
    c.className = 'acell ' + st
    c.textContent = l.lower
    c.title = l.id
    amap.appendChild(c)
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
    <p class="note">Mixed נעול עד 2 אשכולות: כרגע ${data.completedClusterSessions.join(', ') || 'אין'}</p>
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
    screen = 'home'
    render()
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

function buildWhatsAppReport(): string {
  const d = load()
  const lines = [
    '📊 דוח אווה אנגלית',
    `רצף ימים: ${d.streakDays || 0}`,
    `סשנים: ${d.sessions.length}`,
    `אשכולות שהושלמו: ${d.completedClusterSessions.join(', ') || '—'}`,
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
