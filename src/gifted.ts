/** Original Hebrew item bank for gifted stage-B style practice (not copied from official tests). */

export type GType = 'analogy' | 'sentence' | 'word' | 'numshape' | 'figural'

export const GTYPE_META: Record<GType, { title: string; emoji: string; promptHe: string }> = {
  analogy: { title: 'מה הקשר בין המילים?', emoji: '🔗', promptHe: 'איזה זוג מילים מתאים באותו קשר?' },
  sentence: { title: 'השלמת משפטים', emoji: '✍️', promptHe: 'אילו מילים משלימות את המשפט הכי טוב?' },
  word: { title: 'בעיות מילוליות', emoji: '🧮', promptHe: 'מה הפתרון לבעיה?' },
  numshape: { title: 'מספר חסר בצורה', emoji: '🔺', promptHe: 'איזה מספר חסר בצורה האחרונה?' },
  figural: { title: 'צורות', emoji: '🔷', promptHe: 'איזו צורה מתאימה במקום סימן השאלה?' },
}

export const GTYPES: GType[] = ['analogy', 'sentence', 'word', 'numshape', 'figural']

export type GItem = {
  id: string
  type: GType
  stem: string // html
  options: string[] // html, correct is options[correct]
  correct: number
  plain: string // short text description for the help list (does not include answer)
}

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleWith<T>(arr: T[], r: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pack(id: string, type: GType, stem: string, right: string, wrongs: string[], plain: string, r: () => number): GItem {
  const opts = shuffleWith([right, ...wrongs.slice(0, 3)], r)
  return { id, type, stem, options: opts, correct: opts.indexOf(right), plain }
}

// ---------- 1. Verbal analogies ----------
const ANALOGIES: [string, string[], string[][]][] = [
  ['סוס : אורווה', ['פרה', 'רפת'], [['חתול', 'חלב'], ['כלב', 'זנב'], ['תרנגולת', 'ביצה']]],
  ['ספר : ספרייה', ['תמונה', 'מוזיאון'], [['עט', 'כתיבה'], ['דף', 'מחברת'], ['מורה', 'כיתה']]],
  ['כבש : פועה', ['חמור', 'נוער'], [['סוס', 'דוהר'], ['דג', 'שוחה'], ['ציפור', 'עפה']]],
  ['טבח : מטבח', ['טייס', 'תא טייס'], [['רופא', 'תרופה'], ['נגר', 'עץ'], ['צייר', 'מכחול']]],
  ['אצבע : יד', ['ענף', 'עץ'], [['רגל', 'נעל'], ['פרח', 'אגרטל'], ['עין', 'משקפיים']]],
  ['חם : קר', ['גבוה', 'נמוך'], [['גדול', 'ענק'], ['מהיר', 'זריז'], ['שמח', 'צוחק']]],
  ['גור : כלב', ['עגל', 'פרה'], [['ביצה', 'קן'], ['חתול', 'עכבר'], ['סוס', 'אוכף']]],
  ['מספריים : גזירה', ['מטאטא', 'טאטוא'], [['סכין', 'מזלג'], ['צבע', 'קיר'], ['כפית', 'מרק']]],
  ['גשם : מטרייה', ['שמש', 'כובע'], [['שלג', 'חורף'], ['רוח', 'עננים'], ['ים', 'חול']]],
  ['רעב : אוכל', ['צמא', 'מים'], [['עייף', 'ערב'], ['חולה', 'בית חולים'], ['שמח', 'מסיבה']]],
  ['דג : ים', ['גמל', 'מדבר'], [['ציפור', 'נוצה'], ['נמלה', 'קטנה'], ['אריה', 'שאגה']]],
  ['חליל : מנגן', ['מברשת', 'מצחצח'], [['שיר', 'שר'], ['ספר', 'עמוד'], ['כדור', 'עגול']]],
  ['ענן : גשם', ['תרנגולת', 'ביצה'], [['שמש', 'ירח'], ['עץ', 'יער'], ['פרח', 'גינה']]],
  ['קטן : זעיר', ['גדול', 'ענק'], [['ארוך', 'קצר'], ['חם', 'קר'], ['יפה', 'מכוער']]],
  ['בוקר : ערב', ['קיץ', 'חורף'], [['יום', 'שבוע'], ['שעה', 'דקה'], ['אביב', 'פרחים']]],
  ['עיפרון : מחדד', ['סכין', 'משחזת'], [['מחק', 'טעות'], ['דף', 'כתיבה'], ['צבע', 'ציור']]],
  ['רגל : גרב', ['יד', 'כפפה'], [['ראש', 'שיער'], ['עין', 'ריס'], ['פה', 'שן']]],
  ['ספר : קורא', ['שיר', 'שומע'], [['עט', 'כותב'], ['מורה', 'מלמד'], ['כדור', 'משחק']]],
  ['זאב : להקה', ['דבורה', 'נחיל'], [['אריה', 'יער'], ['חתול', 'גור'], ['סוס', 'פרסה']]],
  ['מנעול : מפתח', ['בקבוק', 'פותחן'], [['דלת', 'חלון'], ['קופסה', 'מכסה'], ['שער', 'גדר']]],
  ['תלמיד : בית ספר', ['חולה', 'בית חולים'], [['מורה', 'לוח'], ['ספר', 'ספרייה'], ['שחקן', 'כדור']]],
  ['קמח : לחם', ['ענבים', 'מיץ'], [['תפוח', 'עץ'], ['חלב', 'פרה'], ['מים', 'כוס']]],
  ['צפרדע : קרקור', ['תרנגול', 'קריאה'], [['פרה', 'חלב'], ['דבורה', 'דבש'], ['נחש', 'זחילה']]],
  ['שעון : זמן', ['מדחום', 'חום'], [['סרגל', 'קו'], ['שולחן', 'כיסא'], ['טלפון', 'שיחה']]],
  ['אש : כבאי', ['מחלה', 'רופא'], [['גנב', 'כלא'], ['גשם', 'מטרייה'], ['בית', 'קבלן']]],
  ['ראשון : אחרון', ['התחלה', 'סוף'], [['אחד', 'שניים'], ['ראש', 'גוף'], ['תור', 'שורה']]],
  ['נמלה : חרק', ['כריש', 'דג'], [['חתול', 'כלב'], ['ורד', 'קוץ'], ['ציפור', 'קן']]],
  ['צייר : תמונה', ['סופר', 'ספר'], [['שחקן', 'במה'], ['זמר', 'מיקרופון'], ['רקדן', 'נעליים']]],
  ['גלגל : אופניים', ['כנף', 'מטוס'], [['רכבת', 'תחנה'], ['סירה', 'ים'], ['מכונית', 'כביש']]],
  ['ישן : ער', ['שותק', 'מדבר'], [['הולך', 'צועד'], ['אוכל', 'שבע'], ['רץ', 'מהיר']]],
  ['מים : צמא', ['שינה', 'עייפות'], [['אוכל', 'צלחת'], ['שמש', 'אור'], ['ספר', 'ידע']]],
  ['כוכב : שמיים', ['צדף', 'חוף'], [['ירח', 'לילה'], ['עץ', 'ענף'], ['דג', 'קשקש']]],
]

// ---------- 2. Sentence completion ----------
const SENTENCES: [string, string, string[]][] = [
  ['אף על פי ש___, נועה ___ לשחק בחוץ.', 'היה קר מאוד / יצאה', ['היה חם ונעים / יצאה', 'היה קר מאוד / לא יצאה', 'השמש זרחה / רצתה']],
  ['יוני היה עייף מאוד, ___ הוא ___ מוקדם.', 'לכן / הלך לישון', ['אבל / הלך לישון', 'לכן / נשאר ער', 'למרות זאת / נרדם']],
  ['___ קנינו עוגה, ו___ אכלנו אותה במסיבה.', 'אתמול / היום', ['מחר / אתמול', 'היום / שלשום', 'מחר / לפני שבוע']],
  ['הכלב לא רק ___ אלא גם ___.', 'נבח / נשך את הנעל', ['נבח / לא נבח', 'ישן / היה ער', 'קטן / גדול מאוד']],
  ['מכיוון ש___, המשחק ___.', 'ירד גשם חזק / נדחה', ['היה מזג אוויר נעים / נדחה', 'ירד גשם חזק / התקיים כרגיל', 'השמש זרחה / בוטל']],
  ['דנה התאמנה כל יום, ___ היא ___ בתחרות.', 'ולכן / ניצחה', ['אבל / ניצחה', 'ולכן / לא התאמנה', 'אף על פי כן / התאמנה']],
  ['למרות ש___ הייתה כבדה, עומר ___ אותה לבד.', 'התיבה / הרים', ['התיבה / לא הצליח להרים', 'הנוצה / הרים', 'הנוצה / לא הרים']],
  ['קודם ___ את הידיים, ואחר כך ___.', 'שוטפים / אוכלים', ['אוכלים / שוטפים', 'מלכלכים / ישנים', 'שוטפים / מלכלכים']],
  ['הספר היה ___ כל כך, ש___ לקרוא אותו בלילה אחד.', 'מרתק / סיימתי', ['משעמם / סיימתי', 'מרתק / הפסקתי', 'קצר / לא הצלחתי']],
  ['במקום ___ ברגל, החלטנו ___ באוטובוס.', 'ללכת / לנסוע', ['לנסוע / ללכת', 'לרוץ / לרוץ', 'לשבת / לעמוד']],
  ['אם ___ מחר, ___ לים.', 'יהיה חם / נלך', ['היה חם / הלכנו', 'יהיה קר / נשחה', 'יירד שלג / נשתזף']],
  ['הילדים ___ בשקט, ___ התינוק ישן.', 'דיברו / כי', ['צעקו / כי', 'דיברו / למרות ש', 'רקדו / אבל']],
  ['___ שהשעון צלצל, אורי ___ מהמיטה.', 'ברגע / קפץ', ['לפני / קפץ', 'ברגע / המשיך לישון ולא זז', 'אחרי שנה / ירד']],
  ['הפרח ___ כי ___ השקו אותו.', 'נבל / לא', ['פרח / לא', 'נבל / כל יום', 'גדל / לא']],
  ['גם ___ וגם ___ הם פירות.', 'תפוח / בננה', ['גזר / בננה', 'תפוח / מלפפון', 'לחם / גבינה']],
  ['שירה ___ לכתוב את שיעורי הבית, ___ המורה לא כעסה.', 'שכחה / ובכל זאת', ['שכחה / ולכן', 'זכרה / ובכל זאת', 'כתבה / למרות ש']],
  ['___ חיכינו בתור שעה, ___ לא נכנסנו.', 'אף על פי ש / בסוף', ['מכיוון ש / בסוף', 'אף על פי ש / ולכן', 'כי / תמיד']],
  ['השמש ___ במזרח ו___ במערב.', 'זורחת / שוקעת', ['שוקעת / זורחת', 'זורחת / זורחת', 'נעלמת / יורדת']],
  ['אבא ___ את המכונית, ___ היא הייתה מלוכלכת.', 'רחץ / כי', ['לכלך / כי', 'רחץ / למרות ש', 'מכר / ולכן']],
  ['הצב הולך ___, ו___ רץ מהר.', 'לאט / הארנב', ['מהר / הארנב', 'לאט / החילזון', 'מהר / הצב']],
  ['לא ___ לחופשה ___ שסיימנו את כל העבודה.', 'יצאנו / עד', ['יצאנו / כי', 'נשארנו / עד', 'רצינו / כדי']],
  ['למרות שהמבחן היה ___, רוב התלמידים ___.', 'קשה / הצליחו', ['קל / הצליחו', 'קשה / נכשלו', 'קצר / לא כתבו']],
  ['שלשום היה יום ראשון, ___ היה יום ___.', 'אתמול / שני', ['מחר / שני', 'אתמול / שבת', 'היום / ראשון']],
  ['החתול ___ על העץ, ___ לא הצליח לרדת.', 'טיפס / אבל', ['טיפס / ולכן', 'ירד / אבל', 'ישן / כי']],
  ['הגלידה ___ מהר, ___ היה חם מאוד.', 'נמסה / כי', ['קפאה / כי', 'נמסה / אף על פי ש', 'התקררה / ולכן']],
  ['מיכל ___ את חברתה, ___ שהיא נעלבה.', 'ביקשה סליחה מ / אחרי', ['צחקה על / אחרי', 'ביקשה סליחה מ / לפני', 'שכחה את / כדי']],
  ['___ התאמנו הרבה, הלהקה ניגנה ___.', 'מכיוון ש / נהדר', ['מכיוון ש / נורא', 'אף על פי ש / נהדר', 'כדי ש / לא']],
  ['הוא לא ___ את הסוד לאף אחד, ___ ביקשו ממנו.', 'גילה / כי', ['גילה / אף על פי ש', 'שמר / כי', 'סיפר / כי']],
  ['בחורף ___ מעיל, ובקיץ ___ חולצה קצרה.', 'לובשים / לובשים', ['פושטים / לובשים', 'לובשים / פושטים', 'קונים / זורקים']],
  ['האגם היה ___ מאוד, ___ אסור היה לשחות בו.', 'עמוק / ולכן', ['רדוד / ולכן', 'עמוק / אבל', 'נקי / כי']],
  ['___ שסיים לאכול, רון ___ את הצלחת לכיור.', 'אחרי / החזיר', ['לפני / החזיר', 'אחרי / שבר', 'בזמן / אכל']],
]

// ---------- builders ----------
function buildAnalogies(): GItem[] {
  const r = rng(11)
  return ANALOGIES.map(([pair, right, wrongs], i) =>
    pack(
      `an${i}`,
      'analogy',
      `<div class="g-big">${pair}</div>`,
      `${right[0]} : ${right[1]}`,
      wrongs.map((w) => `${w[0]} : ${w[1]}`),
      `קשר בין מילים: ${pair}`,
      r,
    ),
  )
}

function buildSentences(): GItem[] {
  const r = rng(22)
  return SENTENCES.map(([s, right, wrongs], i) =>
    pack(`se${i}`, 'sentence', `<div class="g-sent">${s}</div>`, right, wrongs, `השלמת משפט: ${s}`, r),
  )
}

function nums(right: number, cands: number[]): string[] {
  const out: number[] = []
  for (const c of cands) if (c !== right && c > 0 && !out.includes(c)) out.push(c)
  let k = 1
  while (out.length < 3) {
    const c = right + k * (k % 2 ? 1 : -1) * 2
    if (c > 0 && c !== right && !out.includes(c)) out.push(c)
    k++
  }
  return out.slice(0, 3).map(String)
}

function buildWordProblems(): GItem[] {
  const r = rng(33)
  const ri = (a: number, b: number) => a + Math.floor(r() * (b - a + 1))
  const names = ['נועה', 'איתי', 'מאיה', 'עומר', 'תמר', 'יואב', 'שירה', 'אלון', 'הילה', 'רועי']
  const fem = (k: number) => k % 2 === 0
  const items: GItem[] = []
  for (let i = 0; i < 40; i++) {
    const n = names[i % names.length]
    const f = fem(i % names.length)
    const g = (a: string, b: string) => (f ? a : b)
    const t = i % 8
    let q = ''
    let ans = 0
    let wrong: number[] = []
    if (t === 0) {
      const a = ri(11, 19), d = ri(3, 5), e = ri(4, 9)
      q = `${n} ${g('קראה', 'קרא')} ${a} עמודים בכל יום במשך ${d} ימים, ועוד ${e} עמודים ביום שאחריהם. כמה עמודים ${g('קראה', 'קרא')} בסך הכול?`
      ans = a * d + e; wrong = [a * d, a * (d + 1), a + d + e]
    } else if (t === 1) {
      const p = ri(3, 9), k = ri(3, 6), have = p * k + ri(5, 20)
      q = `ל${n} יש ${have} שקלים. ${g('היא קנתה', 'הוא קנה')} ${k} מחברות, כל אחת ב־${p} שקלים. כמה שקלים נשארו ${g('לה', 'לו')}?`
      ans = have - p * k; wrong = [have - p, p * k, have - p - k]
    } else if (t === 2) {
      const g = ri(3, 6), per = ri(4, 8), extra = ri(1, per - 1)
      q = `בכיתה ${g * per + extra} ילדים. רוצים לחלק אותם לקבוצות של ${per}. כמה קבוצות מלאות יהיו?`
      ans = g; wrong = [g + 1, g - 1, per]
    } else if (t === 3) {
      const x = ri(4, 12), m = ri(2, 4)
      q = `ל${n} יש ${x} גולות. ${g('לאח שלה', 'לאח שלו')} יש פי ${m} יותר. כמה גולות יש לשניהם יחד?`
      ans = x + x * m; wrong = [x * m, x + m, x * (m + 2)]
    } else if (t === 4) {
      const tens = ri(2, 8), ones = ri(1, 9)
      const num = tens * 10 + ones
      q = `חשבתי על מספר דו־ספרתי. ספרת העשרות שלו היא ${tens}, וסכום הספרות שלו הוא ${tens + ones}. מהו המספר?`
      ans = num; wrong = [ones * 10 + tens === num ? num + 10 : ones * 10 + tens, tens * 10 + ones + 1, (tens + 1) * 10 + ones - 1]
    } else if (t === 5) {
      const legsC = ri(2, 6), legsD = ri(2, 6)
      q = `בחצר יש ${legsC} כלבים ו־${legsD} תרנגולות. כמה רגליים יש לכולם יחד?`
      ans = legsC * 4 + legsD * 2; wrong = [(legsC + legsD) * 4, (legsC + legsD) * 2, legsC * 2 + legsD * 4]
    } else if (t === 6) {
      const start = ri(8, 10), dur = ri(2, 4), mins = [15, 30, 45][ri(0, 2)]
      q = `${n} ${g('יצאה', 'יצא')} לטיול בשעה ${start}:00. הטיול נמשך ${dur} שעות ו־${mins} דקות. באיזו שעה הסתיים הטיול?`
      const end = `${start + dur}:${mins}`
      items.push(pack(`wp${i}`, 'word', `<div class="g-sent">${q}</div>`, end,
        [`${start + dur + 1}:${mins}`, `${start + dur}:00`, `${start + dur - 1}:${mins}`], `בעיה מילולית: ${q}`, r))
      continue
    } else {
      const price = ri(3, 8), k = ri(3, 6)
      q = `${k} עפרונות עולים ${price * k} שקלים. כמה יעלו ${k * 2} עפרונות כאלה?`
      ans = price * k * 2; wrong = [price * k + 2, price * 2, price * k + k]
    }
    items.push(pack(`wp${i}`, 'word', `<div class="g-sent">${q}</div>`, String(ans), nums(ans, wrong), `בעיה מילולית: ${q}`, r))
  }
  return items
}

// ---------- 4. Number in shape (SVG triangles) ----------
function triSvg(c: (number | string)[], mid: number | string): string {
  const t = (s: number | string, x: number, y: number, big = false) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${big ? 22 : 18}" font-weight="700" fill="${s === '?' ? '#e5533d' : '#223'}">${s}</text>`
  return `<svg viewBox="0 0 120 110" width="110" height="100" class="g-svg"><polygon points="60,8 112,100 8,100" fill="#eef6ff" stroke="#5aa9f7" stroke-width="3"/>${t(c[0], 60, 30)}${t(c[1], 100, 94)}${t(c[2], 20, 94)}${t(mid, 60, 76, true)}</svg>`
}

function buildNumShapes(): GItem[] {
  const r = rng(44)
  const ri = (a: number, b: number) => a + Math.floor(r() * (b - a + 1))
  const rules: [string, (a: number, b: number, c: number) => number][] = [
    ['sum', (a, b, c) => a + b + c],
    ['prod', (a, b, c) => a * b * c],
    ['abminusc', (a, b, c) => a * b - c],
    ['abplusc', (a, b, c) => (a + b) * c],
    ['topdouble', (a, b, c) => a * 2 + b + c],
    ['bcminusa', (a, b, c) => b + c - a],
  ]
  const items: GItem[] = []
  for (let i = 0; i < 36; i++) {
    const [, f] = rules[i % rules.length]
    const triples: number[][] = []
    while (triples.length < 3) {
      const tr = [ri(1, 6), ri(1, 6), ri(1, 6)]
      if (f(tr[0], tr[1], tr[2]) > 0) triples.push(tr)
    }
    const ans = f(triples[2][0], triples[2][1], triples[2][2])
    const [a, b, c] = triples[2]
    const cands = [a + b + c, a * b * c, a * b + c, ans + 1, ans - 2, ans + 3]
    const stem = `<div class="g-row" dir="ltr">${triSvg(triples[0], f(triples[0][0], triples[0][1], triples[0][2]))}${triSvg(triples[1], f(triples[1][0], triples[1][1], triples[1][2]))}${triSvg(triples[2], '?')}</div>`
    items.push(pack(`ns${i}`, 'numshape', stem, String(ans), nums(ans, cands), `מספר חסר במשולשים (תרגיל ${i + 1})`, r))
  }
  return items
}

// ---------- 5. Figural (SVG) ----------
const COLORS = ['#5aa9f7', '#f59e0b', '#22a06b', '#e5533d']
function shapeSvg(kind: number, opts: { size?: number; fill?: string; rot?: number; dots?: number; box?: number } = {}): string {
  const box = opts.box ?? 64
  const s = opts.size ?? 22
  const c = box / 2
  const fill = opts.fill ?? '#5aa9f7'
  const rot = opts.rot ?? 0
  let body = ''
  if (kind === 0) body = `<circle cx="${c}" cy="${c}" r="${s}" fill="${fill}" stroke="#223" stroke-width="2"/>`
  else if (kind === 1) body = `<rect x="${c - s}" y="${c - s}" width="${2 * s}" height="${2 * s}" fill="${fill}" stroke="#223" stroke-width="2"/>`
  else if (kind === 2) body = `<polygon points="${c},${c - s} ${c + s},${c + s} ${c - s},${c + s}" fill="${fill}" stroke="#223" stroke-width="2"/>`
  else if (kind === 3) body = `<polygon points="${c},${c - s} ${c + s},${c} ${c},${c + s} ${c - s},${c}" fill="${fill}" stroke="#223" stroke-width="2"/>`
  else body = `<path d="M${c - s} ${c} L${c + s * 0.4} ${c} L${c + s * 0.4} ${c - s * 0.6} L${c + s} ${c} L${c + s * 0.4} ${c + s * 0.6} L${c + s * 0.4} ${c} Z" fill="${fill}" stroke="#223" stroke-width="3" stroke-linejoin="round"/>`
  let dots = ''
  for (let i = 0; i < (opts.dots ?? 0); i++) {
    dots += `<circle cx="${10 + (i % 4) * 14}" cy="${box - 8 - Math.floor(i / 4) * 12}" r="4" fill="#223"/>`
  }
  return `<svg viewBox="0 0 ${box} ${box}" width="${box}" height="${box}" class="g-svg"><g transform="rotate(${rot} ${c} ${c})">${body}</g>${dots}</svg>`
}
const Q_BOX = `<svg viewBox="0 0 64 64" width="64" height="64" class="g-svg"><rect x="4" y="4" width="56" height="56" rx="8" fill="#fff" stroke="#e5533d" stroke-dasharray="5 4" stroke-width="2"/><text x="32" y="42" text-anchor="middle" font-size="28" font-weight="700" fill="#e5533d">?</text></svg>`

function buildFigural(): GItem[] {
  const r = rng(55)
  const ri = (a: number, b: number) => a + Math.floor(r() * (b - a + 1))
  const items: GItem[] = []
  for (let i = 0; i < 36; i++) {
    const kind = i % 4
    if (kind === 0) {
      // rotation series
      const step = [45, 90][ri(0, 1)]
      const start = ri(0, 3) * 45
      const seq = [0, 1, 2, 3].map((k) => shapeSvg(4, { rot: start + step * k, fill: COLORS[i % 4] }))
      const right = shapeSvg(4, { rot: start + step * 4, fill: COLORS[i % 4] })
      const wrongs = [step * 4 + 180, step * 3, step * 4 + 90].map((d) => shapeSvg(4, { rot: start + (d % 360 === (step * 4) % 360 ? d + 45 : d), fill: COLORS[i % 4] }))
      items.push(pack(`fg${i}`, 'figural', `<div class="g-row" dir="ltr">${seq.join('')}${Q_BOX}</div>`, right, wrongs, `סדרת חצים מסתובבים (תרגיל ${i + 1})`, r))
    } else if (kind === 1) {
      // growing dots
      const sh = ri(0, 3), a = ri(1, 2), d = ri(1, 2)
      const seq = [0, 1, 2].map((k) => shapeSvg(sh, { dots: a + d * k, size: 16 }))
      const n = a + d * 3
      const right = shapeSvg(sh, { dots: n, size: 16 })
      const wrongs = [shapeSvg(sh, { dots: n - 1, size: 16 }), shapeSvg(sh, { dots: n + 1, size: 16 }), shapeSvg((sh + 1) % 4, { dots: n, size: 16 })]
      items.push(pack(`fg${i}`, 'figural', `<div class="g-row" dir="ltr">${seq.join('')}${Q_BOX}</div>`, right, wrongs, `סדרת צורות עם נקודות (תרגיל ${i + 1})`, r))
    } else if (kind === 2) {
      // size + shape cycle: small, medium, big then next shape
      const s1 = ri(0, 3), s2 = (s1 + 1 + ri(0, 2)) % 4
      const sizes = [10, 17, 24]
      const seq = [shapeSvg(s1, { size: sizes[0] }), shapeSvg(s1, { size: sizes[1] }), shapeSvg(s1, { size: sizes[2] }), shapeSvg(s2, { size: sizes[0] })]
      const right = shapeSvg(s2, { size: sizes[1] })
      const wrongs = [shapeSvg(s2, { size: sizes[2] }), shapeSvg(s1, { size: sizes[1] }), shapeSvg(s2, { size: sizes[0] })]
      items.push(pack(`fg${i}`, 'figural', `<div class="g-row" dir="ltr">${seq.join('')}${Q_BOX}</div>`, right, wrongs, `סדרת צורות שגדלות (תרגיל ${i + 1})`, r))
    } else {
      // 3x3 matrix: rows = shape, cols = color
      const shapes = shuffleWith([0, 1, 2, 3], r).slice(0, 3)
      const cols = shuffleWith(COLORS, r).slice(0, 3)
      let grid = ''
      for (let row = 0; row < 3; row++)
        for (let col = 0; col < 3; col++)
          grid += row === 2 && col === 2 ? Q_BOX : shapeSvg(shapes[row], { fill: cols[col], size: 18 })
      const right = shapeSvg(shapes[2], { fill: cols[2], size: 18 })
      const wrongs = [shapeSvg(shapes[2], { fill: cols[0], size: 18 }), shapeSvg(shapes[1], { fill: cols[2], size: 18 }), shapeSvg(shapes[0], { fill: cols[1], size: 18 })]
      items.push(pack(`fg${i}`, 'figural', `<div class="g-matrix" dir="ltr">${grid}</div>`, right, wrongs, `טבלת צורות 3×3 (תרגיל ${i + 1})`, r))
    }
  }
  return items
}

export const GIFTED_BANK: GItem[] = [
  ...buildAnalogies(),
  ...buildSentences(),
  ...buildWordProblems(),
  ...buildNumShapes(),
  ...buildFigural(),
]

export type GStats = Record<string, { tries: number; fails: number; firstOk: number; last: number; lastFail: number }>

/** Adaptive pick: weight types by error rate (mixed) and items by past failures / unseen. */
export function pickGiftedItems(type: GType | 'mixed', stats: GStats, typeErr: Record<string, number>, n = 40): GItem[] {
  const pool = GIFTED_BANK.filter((it) => type === 'mixed' || it.type === type)
  const w = (it: GItem) => {
    const s = stats[it.id]
    let x = 1
    if (!s) x = 2.5
    else {
      x = 0.6 + s.fails * 2.5 - s.firstOk * 0.4
      if (Date.now() - s.lastFail < 3 * 86400000) x += 3
      if (Date.now() - s.last < 3600000 && s.fails === 0) x *= 0.1
    }
    if (type === 'mixed') x *= 1 + 3 * (typeErr[it.type] ?? 0.5)
    return Math.max(0.05, x)
  }
  const left = [...pool]
  const out: GItem[] = []
  while (out.length < n && left.length) {
    const tot = left.reduce((a, it) => a + w(it), 0)
    let p = Math.random() * tot
    let k = 0
    for (; k < left.length - 1; k++) {
      p -= w(left[k])
      if (p <= 0) break
    }
    out.push(left.splice(k, 1)[0])
  }
  return out
}

export const GIFTED_TIPS: Record<GType, string> = {
  analogy: 'לפני שבוחרים, לומר במשפט מה הקשר בזוג הראשון («ציפור גרה בקן») ולבדוק אותו על כל תשובה. לתרגל גם בעל־פה בדרך.',
  sentence: 'לסמן את מילת המפתח (אף על פי ש / לכן / כי / אתמול) ולקרוא בקול את המשפט המלא עם כל תשובה.',
  word: 'לקרוא את הבעיה פעמיים, לכתוב את השלבים (קודם… ואז…), ולבדוק אם התשובה הגיונית.',
  numshape: 'למצוא כלל בצורה הראשונה ולבדוק שהוא עובד גם בשנייה, לפני שמחשבים את החסר.',
  figural: 'לשאול: מה משתנה מצורה לצורה (כיוון, גודל, מספר, צבע) ומה נשאר קבוע. לבדוק בטבלה גם את השורה וגם את העמודה.',
}
