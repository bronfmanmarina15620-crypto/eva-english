// Parent insights: per-exercise log view, automatic conclusions and a bottom line
import type { ExerciseLog } from './storage'

type Label = (t: string) => string
const AREA_HE: Record<string, string> = { math: 'חשבון', english: 'אנגלית' }
const OUT_HE: Record<string, string> = { first: '✅ נכון בניסיון ראשון', solved: '🟡 נכון אחרי כמה ניסיונות', help: '🔴 צריך עזרה של מבוגר' }
const DAY = 86400000

export function secs(ms: number): string {
  if (!ms) return '—'
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s} שנ׳` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} דק׳`
}
const esc = (s: string) => s.replace(/</g, '&lt;')
const median = (xs: number[]) => { const a = [...xs].sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0 }

type TStat = { type: string; n: number; first: number; help: number; firstPct: number }
function byType(rows: ExerciseLog[]): TStat[] {
  const m: Record<string, ExerciseLog[]> = {}
  rows.forEach((r) => (m[r.type] ||= []).push(r))
  return Object.entries(m).map(([type, rs]) => {
    const first = rs.filter((r) => r.outcome === 'first').length
    return { type, n: rs.length, first, help: rs.filter((r) => r.outcome === 'help').length, firstPct: Math.round((first / rs.length) * 100) }
  })
}

export function conclusions(log: ExerciseLog[], label: Label, now = Date.now()): { bottom: string; points: string[] } {
  const recent = log.filter((r) => r.at >= now - 14 * DAY)
  if (recent.length < 5) return { bottom: 'עדיין אין מספיק תרגול כדי להסיק מסקנות. כדאי לתרגל כמה ימים, ואז לחזור לכאן.', points: [] }
  const points: string[] = []
  const ts = byType(recent).filter((t) => t.n >= 5).sort((a, b) => a.firstPct - b.firstPct)
  const weak = ts[0], strong = ts[ts.length - 1]
  if (ts.length >= 2) {
    points.push(`💪 הכי חזקה ב: <b>${label(strong.type)}</b> (${strong.firstPct}% נכון בניסיון ראשון).`)
    points.push(`🎯 הכי קשה לה: <b>${label(weak.type)}</b> (${weak.firstPct}% בניסיון ראשון, ${weak.help} פעמים צריך עזרה).`)
  }
  // trend over days
  const days = [...new Set(recent.map((r) => r.date))].sort()
  if (days.length >= 4) {
    const pct = (ds: string[]) => { const rs = recent.filter((r) => ds.includes(r.date)); return Math.round((rs.filter((r) => r.outcome === 'first').length / rs.length) * 100) }
    const half = Math.floor(days.length / 2)
    const a = pct(days.slice(0, half)), b = pct(days.slice(half))
    points.push(b >= a + 8 ? `📈 משתפרת: בימים הראשונים ${a}% נכון בניסיון ראשון, בימים האחרונים ${b}%.` : b <= a - 8 ? `📉 ירידה: בימים הראשונים ${a}%, בימים האחרונים ${b}%. אולי היא עייפה או שהשאלות קשות יותר.` : `➖ יציבה: בערך ${b}% נכון בניסיון ראשון לאורך הימים.`)
  }
  // slow-but-correct / fast-wrong per type
  const slow: string[] = [], fast: string[] = []
  for (const t of ts) {
    const rs = recent.filter((r) => r.type === t.type && r.ms > 0)
    const med = median(rs.map((r) => r.ms))
    if (rs.length < 5 || !med) continue
    const sc = rs.filter((r) => r.outcome !== 'help' && r.ms > med * 2).length
    const fw = rs.filter((r) => r.outcome !== 'first' && r.ms < med * 0.5).length
    if (sc >= 2) slow.push(label(t.type))
    if (fw >= 2) fast.push(label(t.type))
  }
  if (slow.length) points.push(`🐢 לאט אבל נכון ב: ${slow.join(', ')}. היא יודעת, וצריכה עוד תרגול כדי לענות מהר יותר.`)
  if (fast.length) points.push(`⚡ עונה מהר מדי וטועה ב: ${fast.join(', ')}. כדאי לבקש ממנה לבדוק את כל 4 התשובות לפני שבוחרת.`)
  // repeated misses
  const miss: Record<string, number> = {}
  recent.filter((r) => r.outcome !== 'first').forEach((r) => (miss[r.plain || r.itemId] = (miss[r.plain || r.itemId] || 0) + 1))
  const rep = Object.entries(miss).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3)
  if (rep.length) points.push(`🔁 טעתה כמה פעמים באותו תרגיל: ${rep.map(([p, c]) => `«${esc(p)}» (${c} פעמים)`).join(' · ')}.`)
  const week = log.filter((r) => r.at >= now - 7 * DAY)
  const wp = week.length ? Math.round((week.filter((r) => r.outcome === 'first').length / week.length) * 100) : 0
  let bottom = week.length ? `השבוע אווה פתרה ${week.length} תרגילים, ו-${wp}% מהם נכון כבר בניסיון הראשון.` : 'השבוע עוד לא היה תרגול.'
  if (ts.length >= 2) bottom += ` הכי טוב לה: ${label(strong.type)}. כדאי לתרגל עכשיו: <b>${label(weak.type)}</b>.`
  if (fast.length) bottom += ' וחשוב לעודד אותה לא למהר.'
  return { bottom, points }
}

export function renderLogPanel(host: HTMLElement, log: ExerciseLog[], label: Label): void {
  const rows = [...log].sort((a, b) => b.at - a.at)
  const types = [...new Set(rows.map((r) => r.type))]
  const dates = [...new Set(rows.map((r) => r.date))]
  host.innerHTML = `
    <div class="log-filters">
      <select id="lgArea"><option value="">כל התחומים</option>${Object.entries(AREA_HE).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
      <select id="lgType"><option value="">כל הנושאים</option>${types.map((t) => `<option value="${t}">${label(t)}</option>`).join('')}</select>
      <select id="lgDate"><option value="">כל הימים</option>${dates.map((d) => `<option value="${d}">${d.split('-').reverse().join('/')}</option>`).join('')}</select>
    </div>
    <div id="lgList"></div>`
  const draw = () => {
    const a = (host.querySelector('#lgArea') as HTMLSelectElement).value
    const t = (host.querySelector('#lgType') as HTMLSelectElement).value
    const d = (host.querySelector('#lgDate') as HTMLSelectElement).value
    const f = rows.filter((r) => (!a || r.area === a) && (!t || r.type === t) && (!d || r.date === d))
    host.querySelector('#lgList')!.innerHTML = f.length
      ? `<p class="note">${f.length} תרגילים${f.length > 150 ? ' (מוצגים 150 האחרונים)' : ''}</p>` +
        f.slice(0, 150).map((r) => {
          const tm = new Date(r.at).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
          return `<div class="log-row ${r.outcome}"><div class="lr-top"><b>${label(r.type)}</b><small>${tm}</small></div>
            <div class="lr-q">${esc(r.plain || r.itemId)}</div>
            <div class="lr-meta">${OUT_HE[r.outcome]} · ניסיונות: ${r.attempts} · זמן: ${secs(r.ms)}${r.answers.length ? ` · ענתה: <span dir="auto">${r.answers.map(esc).join(' ← ')}</span>` : ''}</div></div>`
        }).join('')
      : '<p class="note">אין תרגילים לפי הסינון הזה</p>'
  }
  host.querySelectorAll('select').forEach((s) => s.addEventListener('change', draw))
  draw()
}

export function areaSummaryLines(log: ExerciseLog[], label: Label, now = Date.now()): string[] {
  const week = log.filter((r) => r.at >= now - 7 * DAY)
  const out: string[] = []
  for (const a of ['math'] as const) {
    const rs = week.filter((r) => r.area === a)
    if (!rs.length) { out.push(`${AREA_HE[a]}: אין תרגול השבוע`); continue }
    const ts = byType(rs).sort((x, y) => x.firstPct - y.firstPct)
    out.push(`${AREA_HE[a]}: ${rs.length} תרגילים, ${Math.round((rs.filter((r) => r.outcome === 'first').length / rs.length) * 100)}% בניסיון ראשון`)
    out.push(`  הכי קשה: ${label(ts[0].type)} (${ts[0].firstPct}%)`)
  }
  return out
}
