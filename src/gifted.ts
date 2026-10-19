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
  ['לטרוף : לאכול', ['לזעוק', 'לקרוא'], [['ללמוד', 'לדעת'], ['לחשוב', 'לנחש'], ['לתת', 'לקחת']]],
  ['לרוץ : ללכת', ['לשאוג', 'לדבר'], [['לראות', 'להסתכל'], ['לקום', 'לשבת'], ['לבנות', 'להרוס']]],
  ['לבכות : להתייפח', ['לחייך', 'לצחוק'], [['לשיר', 'לרקוד'], ['לשמוע', 'לראות'], ['לכתוב', 'למחוק']]],
  ['מכתב : מעטפה', ['נעל', 'קופסה'], [['עיפרון', 'דף'], ['כובע', 'ראש'], ['ספר', 'סופר']]],
  ['עץ : קרש', ['ענבים', 'צימוקים'], [['עלה', 'ענף'], ['פרח', 'גינה'], ['שורש', 'אדמה']]],
  ['צמר : סוודר', ['קמח', 'עוגה'], [['כבשה', 'צמר'], ['חולצה', 'כפתור'], ['ארון', 'מדף']]],
  ['גדי : עז', ['סייח', 'סוסה'], [['פרה', 'שור'], ['כלב', 'חתול'], ['ארנב', 'גזר']]],
  ['ספרן : ספרייה', ['גנן', 'גינה'], [['מורה', 'מחברת'], ['שליח', 'חבילה'], ['טבח', 'סיר']]],
  ['תרנגול : קרקור', ['סוס', 'צהלה'], [['חתול', 'זנב'], ['כבשה', 'צמר'], ['פרה', 'רפת']]],
  ['מטבע : ארנק', ['כרית', 'מיטה'], [['שקל', 'כסף'], ['כוס', 'מים'], ['מפתח', 'דלת']]],
  ['ירקן : ירקות', ['אופה', 'לחם'], [['רופא', 'חולה'], ['נהג', 'כביש'], ['צלם', 'מצלמה']]],
  ['לחש : צעקה', ['טפטוף', 'מבול'], [['שמש', 'חום'], ['רוח', 'עננים'], ['גשם', 'מטרייה']]],
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
  ['עידו קנה בחנות ______ של ______ מפני שהוא מאוד אוהב ______.', 'ערכה / חוטים / לסרוג', ['ערכה / קוביות / לשחות', 'שקית / סוכריות / לרוץ', 'קופסה / מסמרים / לקרוא']],
  ['שירה אמרה: "______ שיחקתי בגינה, כי ______ ירד גשם."', 'היום / אתמול', ['אתמול / מחר', 'מחר / היום', 'שלשום / מחר']],
  ['הצלחתי לסיים את כל ______ אף על פי ש______.', 'הפאזל / חסרו בו כמה חלקים בהתחלה', ['העוגה / היא הייתה טעימה', 'השיעורים / היו לי מעט שיעורים', 'הספר / הוא היה קצר מאוד']],
  ['נגה לומדת לשחות ______ בבריכה ______ בים.', 'גם / וגם', ['רק / וגם', 'גם / ורק', 'רק / ורק']],
  ['דני ______ לחבר שלו את הכדור, אבל החבר ______ אותו ולא החזיר.', 'השאיל / איבד', ['השאיל / החזיר', 'לקח / נתן', 'מכר / שמר']],
  ['כשהגענו לתחנה, האוטובוס כבר ______, ולכן ______ לחכות לאוטובוס הבא.', 'נסע / נאלצנו', ['הגיע / נאלצנו', 'נסע / לא היינו צריכים', 'עמד / רצינו']],
  ['______ שתמר הייתה חולה, היא ______ לבית הספר.', 'מכיוון / לא הלכה', ['מכיוון / הלכה מוקדם', 'למרות / לא הלכה', 'כדי / הלכה']],
  ['הדייג ______ כל הבוקר, אך ______ לא דג אף דג.', 'ישב ליד המים / בסוף', ['ישן בבית / בסוף', 'ישב ליד המים / לכן', 'שחה בים / תמיד']],
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
  // official-style extras: division into groups, unit ratio, missing number, digit riddles
  const extras: [string, number, number[]][] = []
  for (let i = 0; i < 6; i++) {
    const per = ri(2, 4), people = ri(5, 9)
    extras.push([`כל אחד מהילדים במסיבה קיבל ${per} בלונים. בסך הכול חילקו ${per * people} בלונים. כמה ילדים היו במסיבה?`, people, [people - 1, per * people - per, people * 2]])
    const rows = ri(12, 19), seats = ri(11, 13)
    extras.push([`בתיאטרון יש ${rows} שורות. בכל שורה ${seats} כיסאות. כמה כיסאות יש בתיאטרון בסך הכול?`, rows * seats, [rows + seats, rows * 10, rows * seats - 10]])
    const boxes = ri(4, 6), per2 = ri(5, 9), sold = ri(2, 3)
    extras.push([`בחנות יש ${boxes * per2} כדורים. המוכר חילק אותם שווה בשווה ל־${boxes} ארגזים. הוא מכר ${sold} ארגזים. כמה כדורים מכר?`, per2 * sold, [per2, sold * boxes, per2 * sold + per2]])
    const n = ri(10, 20), m = ri(3, 6)
    extras.push([`${n} קוביות שוקלות ק״ג אחד. כמה קילוגרמים שוקלות ${n * m} קוביות כאלה?`, m, [m + 1, m * 2, n]])
    const a = ri(3, 6), b = ri(4, 8), c = ri(5, 12)
    if (a * b > c) extras.push([`לפניכם תרגיל שחסר בו מספר: ${c} + ? = ${a} × ${b}. מהו המספר החסר?`, a * b - c, [a * b, a * b + c, a + b]])
  }
  extras
    .filter((e) => e[1] > 0)
    .forEach(([q, ans, w], k) => items.push(pack(`wx${k}`, 'word', `<div class="g-sent">${q}</div>`, String(ans), nums(ans, w), `בעיה מילולית: ${q}`, r)))
  // digit riddles (odd, units greater by d)
  ;[[2, 5], [2, 3], [4, 1], [1, 2], [3, 4], [5, 2], [1, 6], [3, 2]].forEach(([tens, d], k) => {
    const num = tens * 10 + tens + d
    if ((tens + d) % 2 === 0) return
    const q = `אני מספר אי־זוגי בן 2 ספרות. סכום הספרות שלי הוא ${tens + tens + d}. ספרת האחדות שלי גדולה ב־${d} מספרת העשרות. מי אני?`
    items.push(pack(`wd${k}`, 'word', `<div class="g-sent">${q}</div>`, String(num), nums(num, [(tens + d) * 10 + tens, num + 10, num - 2]), `חידת ספרות: ${q}`, r))
  })
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
  // circles: two numbers on top, one below (official style)
  const circ = (a: number | string, b: number | string, c: number | string) =>
    `<svg viewBox="0 0 100 100" width="96" height="96" class="g-svg"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#223" stroke-width="2.5"/><line x1="6" y1="50" x2="94" y2="50" stroke="#223" stroke-width="2"/><line x1="50" y1="4" x2="50" y2="50" stroke="#223" stroke-width="2"/>${[[a, 28, 36], [b, 72, 36], [c, 50, 80]].map(([v, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="20" font-weight="700" fill="${v === '?' ? '#e5533d' : '#223'}">${v}</text>`).join('')}</svg>`
  const crules: ((a: number, b: number) => number)[] = [(a, b) => a + b, (a, b) => a + b + 1, (a, b) => a * b, (a, b) => a * b - 1, (a, b) => (a + b) * 2, (a, b) => a * 2 + b]
  for (let i = 0; i < 18; i++) {
    const f = crules[i % crules.length]
    const tr = [0, 1, 2].map(() => [ri(2, 9), ri(1, 6)])
    const ans = f(tr[2][0], tr[2][1])
    const [a, b] = tr[2]
    const stem = `<div class="g-row" dir="ltr">${circ(tr[0][0], tr[0][1], f(tr[0][0], tr[0][1]))}${circ(tr[1][0], tr[1][1], f(tr[1][0], tr[1][1]))}${circ(a, b, '?')}</div>`
    items.push(pack(`nc${i}`, 'numshape', stem, String(ans), nums(ans, [a + b, a * b, a + b + 1, ans + 2]), `מספר חסר בעיגולים (תרגיל ${i + 1})`, r))
  }
  // arrow chains: left <- [center] -> right, same multipliers in both rows
  for (let i = 0; i < 12; i++) {
    const m1 = ri(2, 5), m2 = ri(2, 4) + (i % 2)
    const c1 = ri(2, 5), c2 = ri(2, 6)
    const row = (c: number, l: number | string, rr: number | string) =>
      `<div class="g-chain" dir="ltr"><span class="g-node">${l}</span><span>⟵</span><span class="g-box">${c}</span><span>⟶</span><span class="g-node">${rr}</span></div>`
    const ans = c2 * m1
    const stem = `<div>${row(c1, c1 * m1, c1 * m2)}${row(c2, '?', c2 * m2)}</div>`
    items.push(pack(`na${i}`, 'numshape', stem, String(ans), nums(ans, [c2 * m2, c2 + m1, ans * 2, ans + c2]), `שרשרת חצים עם מספר חסר (תרגיל ${i + 1})`, r))
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
  // polygon sides +1 (official sample type A)
  const poly = (n: number, fill = '#fff') => {
    if (n < 3) return `<svg viewBox="0 0 64 64" width="64" height="64" class="g-svg"><circle cx="32" cy="32" r="24" fill="${fill}" stroke="#223" stroke-width="2.5"/></svg>`
    const pts = [...Array(n)].map((_, k) => {
      const a = -Math.PI / 2 + (2 * Math.PI * k) / n
      return `${(32 + 24 * Math.cos(a)).toFixed(1)},${(32 + 24 * Math.sin(a)).toFixed(1)}`
    })
    return `<svg viewBox="0 0 64 64" width="64" height="64" class="g-svg"><polygon points="${pts.join(' ')}" fill="${fill}" stroke="#223" stroke-width="2.5"/></svg>`
  }
  for (let i = 0; i < 8; i++) {
    const start = 3 + (i % 3), step = i < 5 ? 1 : 2
    const seq = [0, 1, 2, 3].map((k) => poly(start + step * k, COLORS[i % 4] + '33'))
    const n = start + step * 4
    const fill = COLORS[i % 4] + '33'
    items.push(pack(`fp${i}`, 'figural', `<div class="g-row" dir="ltr">${seq.join('')}${Q_BOX}</div>`, poly(n, fill), [poly(n - 1, fill), poly(n + 1, fill), poly(2, fill)], `סדרת מצולעים (תרגיל ${i + 1})`, r))
  }
  // 3 rows, rule restarts every row (official sample type B)
  const dotsBox = (n: number) => {
    let d = ''
    for (let k = 0; k < n; k++) d += `<circle cx="${14 + (k % 3) * 18}" cy="${16 + Math.floor(k / 3) * 18}" r="5" fill="#223"/>`
    return `<svg viewBox="0 0 64 64" width="64" height="64" class="g-svg"><rect x="3" y="3" width="58" height="58" rx="6" fill="#fff" stroke="#223" stroke-width="2"/>${d}</svg>`
  }
  for (let i = 0; i < 8; i++) {
    const step = 1 + (i % 2)
    const starts = [ri(1, 2), ri(1, 3), ri(1, 3)]
    let grid = ''
    starts.forEach((st, row) => [0, 1, 2].forEach((col) => (grid += row === 2 && col === 2 ? Q_BOX : dotsBox(st + step * col))))
    const n = starts[2] + step * 2
    items.push(pack(`fr${i}`, 'figural', `<div class="g-matrix" dir="ltr">${grid}</div>`, dotsBox(n), [dotsBox(n - 1), dotsBox(n + 1), dotsBox(starts[2])], `שלוש שורות של נקודות (תרגיל ${i + 1})`, r))
  }
  // carpet with a missing piece (official sample type C)
  for (let i = 0; i < 10; i++) {
    const c1 = COLORS[i % 4], c2 = COLORS[(i + 1) % 4]
    const kind = i % 3
    const cell = (row: number, col: number, x: number, y: number, sz: number, swap = false) => {
      const A = swap ? c2 : c1, B = swap ? c1 : c2
      if (kind === 0) return (row + col) % 2 ? `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="${A}"/>` : `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="#fff"/><circle cx="${x + sz / 2}" cy="${y + sz / 2}" r="${sz / 3}" fill="${B}"/>`
      if (kind === 1) return `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="#fff"/>` + (col % 2 ? `<polygon points="${x},${y + sz} ${x + sz / 2},${y} ${x + sz},${y + sz}" fill="${row % 2 ? A : B}"/>` : `<polygon points="${x},${y} ${x + sz},${y} ${x + sz / 2},${y + sz}" fill="${row % 2 ? B : A}"/>`)
      return `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="${row % 3 === 0 ? A : '#fff'}"/>` + (row % 3 !== 0 ? `<polygon points="${x + sz / 2},${y + 3} ${x + sz - 3},${y + sz / 2} ${x + sz / 2},${y + sz - 3} ${x + 3},${y + sz / 2}" fill="${(col + row) % 2 ? B : A}"/>` : '')
    }
    const R = 6, C = 8, S = 24
    const mr = 1 + ri(0, 2), mc = 2 + ri(0, 3)
    let svg = `<svg viewBox="0 0 ${C * S} ${R * S}" width="${C * S}" height="${R * S}" class="g-svg carpet">`
    for (let row = 0; row < R; row++) for (let col = 0; col < C; col++) svg += cell(row, col, col * S, row * S, S)
    svg += `<rect x="${mc * S}" y="${mr * S}" width="${2 * S}" height="${2 * S}" fill="#fff" stroke="#e5533d" stroke-width="2"/><text x="${mc * S + S}" y="${mr * S + S + 9}" text-anchor="middle" font-size="26" font-weight="700" fill="#e5533d">?</text></svg>`
    const piece = (dr: number, dc: number, swap = false) => {
      let p = `<svg viewBox="0 0 ${2 * S} ${2 * S}" width="${2 * S + 16}" height="${2 * S + 16}" class="g-svg">`
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) p += cell(mr + a + dr, mc + b + dc, b * S, a * S, S, swap)
      return p + `<rect x="0" y="0" width="${2 * S}" height="${2 * S}" fill="none" stroke="#223" stroke-width="1.5"/></svg>`
    }
    const right = piece(0, 0)
    const cands = [piece(0, 1), piece(1, 0), piece(0, 0, true), piece(1, 1), piece(0, -1)].filter((x) => x !== right)
    const uniq = [...new Set(cands)].slice(0, 3)
    if (uniq.length === 3) items.push(pack(`fc${i}`, 'figural', `<div class="g-row">${svg}</div>`, right, uniq, `שטיח שחסרה בו חתיכה (תרגיל ${i + 1})`, r))
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
