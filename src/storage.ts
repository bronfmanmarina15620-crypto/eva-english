/** Versioned localStorage for Eva English */

export type SkillStat = {
  id: string
  type: 'letter' | 'cvc' | 'heart' | 'blend' | 'other'
  seen: number
  correct: number
  wrong: number
  streak: number
  lastSeen: number
  lastWrong: number
}

export type SessionRecord = {
  id: string
  module: string
  label: string
  at: number
  total: number
  correct: number
  firstTry: number
}

export type DayActivity = {
  date: string // YYYY-MM-DD
  answers: number
  correct: number
}

export type AppData = {
  version: 1
  pin: string
  skills: Record<string, SkillStat>
  sessions: SessionRecord[]
  days: DayActivity[]
  completedClusterSessions: string[] // e.g. m1, m2
  streakDays: number
  lastPracticeDate: string | null
  confusions: { pair: string; count: number }[]
}

const KEY = 'eva-english-v1'
const DEFAULT_PIN = '2607'

function blank(): AppData {
  return {
    version: 1,
    pin: DEFAULT_PIN,
    skills: {},
    sessions: [],
    days: [],
    completedClusterSessions: [],
    streakDays: 0,
    lastPracticeDate: null,
    confusions: [],
  }
}

let mem: AppData | null = null

export function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blank()
    const data = JSON.parse(raw) as AppData
    if (!data.version) return blank()
    return { ...blank(), ...data, version: 1 }
  } catch {
    return mem || (mem = blank())
  }
}

export function save(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    mem = data
  }
}

export function todayKey(d = new Date()): string {
  // Asia/Jerusalem approx: use local browser date (user device)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function ensureSkill(data: AppData, id: string, type: SkillStat['type']): SkillStat {
  if (!data.skills[id]) {
    data.skills[id] = { id, type, seen: 0, correct: 0, wrong: 0, streak: 0, lastSeen: 0, lastWrong: 0 }
  }
  return data.skills[id]
}

export function recordAnswer(
  data: AppData,
  skillId: string,
  type: SkillStat['type'],
  ok: boolean,
  confusionWith?: string,
): void {
  const s = ensureSkill(data, skillId, type)
  s.seen++
  s.lastSeen = Date.now()
  if (ok) {
    s.correct++
    s.streak++
  } else {
    s.wrong++
    s.streak = 0
    s.lastWrong = Date.now()
    if (confusionWith) {
      const pair = [skillId, confusionWith].sort().join('|')
      const row = data.confusions.find((c) => c.pair === pair)
      if (row) row.count++
      else data.confusions.push({ pair, count: 1 })
      data.confusions.sort((a, b) => b.count - a.count)
      data.confusions = data.confusions.slice(0, 20)
    }
  }
  const dk = todayKey()
  let day = data.days.find((d) => d.date === dk)
  if (!day) {
    day = { date: dk, answers: 0, correct: 0 }
    data.days.push(day)
  }
  day.answers++
  if (ok) day.correct++
  data.days = data.days.slice(-60)
}

export function finishSession(
  data: AppData,
  module: string,
  label: string,
  total: number,
  correct: number,
  firstTry: number,
): void {
  data.sessions.unshift({
    id: `${Date.now()}`,
    module,
    label,
    at: Date.now(),
    total,
    correct,
    firstTry,
  })
  data.sessions = data.sessions.slice(0, 50)

  if (['m1', 'm2', 'm3'].includes(module) && !data.completedClusterSessions.includes(module)) {
    data.completedClusterSessions.push(module)
  }

  const dk = todayKey()
  if (data.lastPracticeDate) {
    const prev = new Date(data.lastPracticeDate + 'T12:00:00')
    const cur = new Date(dk + 'T12:00:00')
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000)
    if (diff === 1) data.streakDays = (data.streakDays || 0) + 1
    else if (diff === 0) {
      /* same day */
    } else data.streakDays = 1
  } else {
    data.streakDays = 1
  }
  data.lastPracticeDate = dk
  save(data)
}

export function mixedUnlocked(data: AppData): boolean {
  return data.completedClusterSessions.filter((m) => ['m1', 'm2', 'm3'].includes(m)).length >= 2
}

export function skillWeight(s: SkillStat | undefined): number {
  if (!s || s.seen === 0) return 3
  const rate = s.wrong / Math.max(1, s.seen)
  let w = 1 + rate * 6
  if (Date.now() - s.lastWrong < 1000 * 60 * 60 * 24) w += 4
  if (s.streak >= 3) w *= 0.4
  return Math.max(0.2, w)
}

export function resetAll(): AppData {
  const d = blank()
  save(d)
  return d
}

export function getPin(data: AppData): string {
  return data.pin || DEFAULT_PIN
}

export function setPin(data: AppData, pin: string): void {
  data.pin = pin
  save(data)
}

export { DEFAULT_PIN, KEY }
