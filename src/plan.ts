// 5-month gifted stage-B practice plan (21 weeks), adaptive to weak types from the log
import type { ExerciseLog } from './storage'
import { GTYPES, type GType } from './gifted'

export const PLAN_WEEKS = 21
export type Phase = { name: string; from: number; to: number; days: number[]; goal: string }
// days: 0=Sunday … 6=Saturday. Friday/Saturday always rest.
export const PHASES: Phase[] = [
  { name: 'היכרות', from: 1, to: 4, days: [0, 2, 4], goal: 'מכירים את 5 סוגי השאלות. שאלות קלות, בלי שעון ובלי לחץ.' },
  { name: 'בנייה', from: 5, to: 10, days: [0, 1, 3, 4], goal: 'תרגול של כל הסוגים לסירוגין, ועוד תרגול של מה שקשה.' },
  { name: 'חיזוק', from: 11, to: 16, days: [0, 1, 3, 4], goal: 'מתמקדים בסוגים הקשים. מבחן דמה מלא אחת לשבועיים.' },
  { name: 'מבחני דמה', from: 17, to: 20, days: [0, 1, 3, 4], goal: 'מבחן דמה מלא פעם בשבוע, ותרגול של רשימת העזרה.' },
  { name: 'מנוחה לפני המבחן', from: 21, to: 21, days: [0, 2], goal: 'רק תרגול קל וקצר. בלי מבחני דמה. ישנים טוב.' },
]
export type Task =
  | { kind: 'rest'; text: string }
  | { kind: 'practice'; type: GType | 'mixed'; text: string; minutes: number }
  | { kind: 'mock'; text: string; minutes: number }
  | { kind: 'done'; text: string }

const TYPE_HE: Record<GType, string> = { analogy: 'מה הקשר בין המילים', sentence: 'השלמת משפטים', word: 'בעיות מילוליות', numshape: 'מספר חסר בצורה', figural: 'צורות' }
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export function weekOf(start: Date, d: Date): number {
  return Math.floor((startOfDay(d).getTime() - startOfDay(start).getTime()) / (7 * 86400000)) + 1
}
export function phaseOf(week: number): Phase | null {
  return PHASES.find((p) => week >= p.from && week <= p.to) || null
}

/** Weakest gifted types, by first-try rate over the last 21 days (needs 5+ answers per type). */
export function weakTypes(log: ExerciseLog[], now: number): GType[] {
  const rs = log.filter((r) => r.area === 'gifted' && r.at >= now - 21 * 86400000)
  const st = GTYPES.map((t) => {
    const x = rs.filter((r) => r.type === 'g:' + t)
    return { t, n: x.length, p: x.length ? x.filter((r) => r.outcome === 'first').length / x.length : 1 }
  }).filter((s) => s.n >= 5)
  return st.sort((a, b) => a.p - b.p).map((s) => s.t)
}

function sessionIndex(start: Date, d: Date): number {
  let n = 0
  for (let x = startOfDay(start); x < startOfDay(d); x = new Date(x.getFullYear(), x.getMonth(), x.getDate() + 1)) {
    if (isPracticeDay(start, x)) n++
  }
  return n
}

export function isPracticeDay(start: Date, d: Date): boolean {
  const ph = phaseOf(weekOf(start, d))
  if (!ph) return false
  // the first day of the plan is always a practice day, so she can start right away
  if (startOfDay(d).getTime() === startOfDay(start).getTime()) return true
  return ph.days.includes(d.getDay())
}

export function taskFor(start: Date, d: Date, log: ExerciseLog[]): Task {
  const week = weekOf(start, d)
  const ph = phaseOf(week)
  if (week > PLAN_WEEKS) return { kind: 'done', text: 'התוכנית הסתיימה. בהצלחה במבחן! 🌟' }
  if (!ph || week < 1) return { kind: 'rest', text: 'התוכנית עוד לא התחילה.' }
  if (!isPracticeDay(start, d)) return { kind: 'rest', text: 'היום יום מנוחה 😊 משחקים, קוראים ספר, הולכים לישון בזמן.' }
  const idx = sessionIndex(start, d)
  const weak = weakTypes(log, d.getTime())
  const rot = GTYPES[idx % GTYPES.length]
  const isMockDay = d.getDay() === 4 && ((ph.name === 'חיזוק' && week % 2 === 0) || ph.name === 'מבחני דמה')
  if (isMockDay) return { kind: 'mock', text: 'מבחן דמה מלא: 5 חלקים עם שעון. אפשר לעשות הפסקה קצרה בין החלקים.', minutes: 70 }
  if (ph.name === 'היכרות') return { kind: 'practice', type: rot, minutes: 15, text: `תרגול: ${TYPE_HE[rot]}. רק 15 דקות, ואפשר לעצור קודם.` }
  if (ph.name === 'בנייה') {
    if (idx % 3 === 2 && weak[0]) return { kind: 'practice', type: weak[0], minutes: 20, text: `תרגול של מה שקשה: ${TYPE_HE[weak[0]]}.` }
    if (idx % 4 === 3) return { kind: 'practice', type: 'mixed', minutes: 20, text: 'תרגול מעורב מכל הסוגים.' }
    return { kind: 'practice', type: rot, minutes: 20, text: `תרגול: ${TYPE_HE[rot]}.` }
  }
  if (ph.name === 'מנוחה לפני המבחן') return { kind: 'practice', type: 'mixed', minutes: 10, text: 'תרגול מעורב קל, 10 דקות. בלי לחץ.' }
  const w = weak[idx % Math.max(1, Math.min(2, weak.length))] || rot
  if (idx % 3 === 0) return { kind: 'practice', type: 'mixed', minutes: 20, text: 'תרגול מעורב מכל הסוגים.' }
  return { kind: 'practice', type: w, minutes: 20, text: `מתמקדים במה שקשה: ${TYPE_HE[w]}.` }
}

/** A practice day counts as done with 10+ gifted answers that day (or a mock). */
export function progress(start: Date, today: Date, log: ExerciseLog[]): { planned: number; done: number; todayDone: boolean } {
  const cnt: Record<string, number> = {}
  log.filter((r) => r.area === 'gifted').forEach((r) => (cnt[r.date] = (cnt[r.date] || 0) + 1))
  let planned = 0, done = 0
  for (let x = startOfDay(start); x <= startOfDay(today); x = new Date(x.getFullYear(), x.getMonth(), x.getDate() + 1)) {
    if (!isPracticeDay(start, x)) continue
    planned++
    if ((cnt[dayKey(x)] || 0) >= 10) done++
  }
  return { planned, done, todayDone: (cnt[dayKey(today)] || 0) >= 10 }
}
