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
  diff: 1 | 2 | 3
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

function pack(id: string, type: GType, stem: string, right: string, wrongs: string[], plain: string, r: () => number, diff: 1 | 2 | 3 = 2): GItem {
  const opts = shuffleWith([right, ...wrongs.slice(0, 3)], r)
  return { id, type, stem, options: opts, correct: opts.indexOf(right), plain, diff }
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
  ['מזרק : הזרקה', ['מקדחה', 'קידוח'], [['פטיש', 'כלי'], ['מברשת', 'מסרק'], ['סיר', 'ארוחה']]],
  ['ציפור : גוזל', ['סוס', 'סייח'], [['סוס', 'עגלה'], ['סוס', 'חמור'], ['סוס', 'תבן']]],
  ['עייר : חמור', ['טלה', 'כבש'], [['כבש', 'צמר'], ['גמל', 'דבשת'], ['חמור', 'עגלה']]],
  ['חול : זכוכית', ['ענבים', 'יין'], [['ים', 'חוף'], ['זכוכית', 'חלון'], ['גפן', 'ענבים']]],
  ['אפודה : בגד', ['מברג', 'כלי עבודה'], [['גופייה', 'קיץ'], ['צמר', 'סוודר'], ['משפחה', 'בית']]],
  ['לעוף : נחליאלי', ['לזחול', 'נחש'], [['לצוד', 'אריה'], ['לאכול', 'כלב'], ['לישון', 'חתול']]],
  ['רעב : לאכול', ['עייף', 'לנוח'], [['שבע', 'לבשל'], ['שמח', 'לבכות'], ['צמא', 'מלח']]],
  ['ספר : פרק', ['שיר', 'בית'], [['ספר', 'ספרייה'], ['מכתב', 'בול'], ['מחברת', 'עט']]],
  ['תמים : לחשוד', ['שקט', 'להרעיש'], [['רגוע', 'לנוח'], ['שמח', 'לחייך'], ['חכם', 'ללמוד']]],
  ['להציץ : להסתכל', ['ללגום', 'לשתות'], [['לרוץ', 'ללכת'], ['לצעוק', 'לדבר'], ['לזרוק', 'לתפוס']]],
  ['מאה : שנה', ['עשור', 'שנה'], [['שבוע', 'חודש'], ['דקה', 'שנייה'], ['יום', 'לילה']]],
  ['סקרן : לשאול', ['נדיב', 'לתת'], [['עצלן', 'לעבוד'], ['פחדן', 'להעז'], ['קמצן', 'לחלק']]],
  ['נבון : שוטה', ['תמיר', 'ננס'], [['עליז', 'שמח'], ['סואן', 'רועש'], ['זעף', 'כעס']]],
  ['תבוסה : הפסד', ['זעף', 'כעס'], [['גדוש', 'ריק'], ['חד', 'קהה'], ['עמוק', 'רדוד']]],
  ['לקשור : להתיר', ['לגנוז', 'לחשוף'], [['לסייע', 'לעזור'], ['לבנות', 'לתכנן'], ['לשמור', 'לנצור']]],
  ['גדוש : ריק', ['זכאי', 'אשם'], [['אדיב', 'מנומס'], ['סואן', 'הומה'], ['נוגה', 'עצוב']]],
  ['התרברב : התפאר', ['סייע', 'עזר'], [['צם', 'סעד'], ['גנב', 'החזיר'], ['שתק', 'צעק']]],
  ['עלבון : מחמאה', ['תבוסה', 'ניצחון'], [['נחשול', 'גל'], ['שיבה', 'זקנה'], ['זעם', 'רוגז']]],
  ['ביולוג : חיים', ['אסטרונום', 'כוכבים'], [['רופא', 'בית חולים'], ['טבח', 'סכין'], ['מורה', 'כיתה']]],
  ['עגלון : עגלה', ['טייס', 'מטוס'], [['סוס', 'עגלה'], ['נוסע', 'כרטיס'], ['רכבת', 'פסים']]],
  ['צם : סועד', ['שותק', 'מדבר'], [['ישן', 'נם'], ['אוכל', 'לועס'], ['הולך', 'צועד']]],
  ['נחשול : גל', ['סערה', 'רוח'], [['טיפה', 'ים'], ['ענן', 'שמיים'], ['חול', 'חוף']]],
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
  ['______ הייתה מיכל ______, היא הסבירה לכל הכיתה את התרגיל הקשה.', 'אף על פי ש / הצעירה בכיתה', ['מפני ש / חולה', 'כי / עייפה מאוד', 'בגלל ש / הנמוכה בכיתה']],
  ['במאפייה שני סוגי לחם: האחד ______ והשני ______, ולכן כל אחד מצא מה שאהב.', 'מתוק / מלוח', ['טרי / טרי', 'מתוק / מתוק', 'גדול / ענק']],
  ['______ ידעתי שהמשחק בוטל, ______ נשארתי בבית ______ לנסוע סתם.', 'אילו / הייתי / במקום', ['כי / הייתי / כדי', 'אילו / לא הייתי / במקום', 'אחרי ש / הלכתי / כדי']],
  ['המורה ______ להכניס טלפונים לכיתה, כי היא ______ שהם מפריעים ללמידה.', 'אוסרת / חושבת', ['מרשה / חושבת', 'אוסרת / שוכחת', 'מבקשת / לא יודעת']],
  ['יואב ______ לבוא לטיול, אבל ברגע האחרון ______ ונשאר בבית.', 'הבטיח / חזר בו', ['סירב / חזר בו', 'הבטיח / התעקש', 'שכח / נזכר']],
  ['השבוע ירד גשם ______ ימים ברציפות, ולכן הנחל ______ מים לראשונה מזה שנים.', 'שלושה / התמלא', ['שלושה / התייבש', 'אפס / התמלא', 'מעט / נשפך']],
  ['______ שהכלב נבח בקול רם, התינוק ______ להמשיך לישון.', 'למרות / הצליח', ['כיוון / הצליח', 'למרות / התעורר ולא הצליח', 'כדי / ניסה']],
  ['הייתה לנועה ______ גדולה להיות רופאה, ולכן היא ______ שעות רבות בספרי מדע.', 'שאיפה / קראה', ['שאיפה / ויתרה', 'עייפות / קראה', 'סבלנות / ישנה']],
  ['השוק היה ______ ומלא אנשים, ולכן ______ לשמוע זה את זה.', 'סואן / התקשינו', ['שקט / התקשינו', 'סואן / הצלחנו בקלות', 'ריק / שמחנו']],
  ['המוכר היה ______ אלינו: הוא חייך, עזר ו______ בסבלנות על כל שאלה.', 'אדיב / ענה', ['גס / ענה', 'אדיב / צעק', 'עייף / סירב']],
  ['אחרי ה______ במשחק, השחקנים היו ______ וירדו מהמגרש בראש מורכן.', 'תבוסה / נוגים', ['תבוסה / עליזים', 'ניצחון / נוגים', 'הפסקה / רעבים']],
  ['הסל היה ______ בפירות עד הסוף, ו______ אפשר היה להכניס אליו עוד תפוח.', 'גדוש / לא', ['ריק / לא', 'גדוש / בקלות', 'קטן / תמיד']],
  ['דני ______ שהוא הכי מהיר בכיתה, אבל במרוץ הוא ______ במקום האחרון.', 'התרברב / הגיע', ['התרברב / ניצח', 'התבייש / ניצח', 'שתק / הגיע ראשון']],
  ['______ שהסכין הייתה ______, אבא הצליח לחתוך את הלחם הקשה.', 'אף על פי / קהה', ['מכיוון / קהה', 'אף על פי / חדה מאוד', 'כדי / חדשה']],
]

// ---------- builders ----------
const AN_EASY = new Set([0, 1, 2, 3, 6, 10, 16, 20, 22, 27])
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
      AN_EASY.has(i) ? 1 : i >= 32 && ![38, 39, 41, 42, 46].includes(i) ? 3 : 2,
    ),
  )
}

function sentDiff(s: string, right: string): 1 | 2 | 3 {
  const blanks = right.split('/').length
  if (blanks >= 3 || /אף על פי|למרות|ובכל זאת|שלשום|אתמול|במקום|לא רק/.test(s + right)) return 3
  if (/גם \/ וגם|קודם|זורחת|הם פירות|לובשים/.test(s + right)) return 1
  return 2
}
function buildSentences(): GItem[] {
  const r = rng(22)
  return SENTENCES.map(([s, right, wrongs], i) =>
    pack(`se${i}`, 'sentence', `<div class="g-sent">${s}</div>`, right, wrongs, `השלמת משפט: ${s}`, r, sentDiff(s, right)),
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
        [`${start + dur + 1}:${mins}`, `${start + dur}:00`, `${start + dur - 1}:${mins}`], `בעיה מילולית: ${q}`, r, 2))
      continue
    } else {
      const price = ri(3, 8), k = ri(3, 6)
      q = `${k} עפרונות עולים ${price * k} שקלים. כמה יעלו ${k * 2} עפרונות כאלה?`
      ans = price * k * 2; wrong = [price * k + 2, price * 2, price * k + k]
    }
    items.push(pack(`wp${i}`, 'word', `<div class="g-sent">${q}</div>`, String(ans), nums(ans, wrong), `בעיה מילולית: ${q}`, r, t === 4 || t === 7 ? 3 : 2))
  }
  // official-style extras: division into groups, unit ratio, missing number, digit riddles
  const extras: [string, number, number[], 1 | 2 | 3][] = []
  for (let i = 0; i < 6; i++) {
    const per = ri(2, 4), people = ri(5, 9)
    extras.push([`כל אחד מהילדים במסיבה קיבל ${per} בלונים. בסך הכול חילקו ${per * people} בלונים. כמה ילדים היו במסיבה?`, people, [people - 1, per * people - per, people * 2], 1])
    const rows = ri(12, 19), seats = ri(11, 13)
    extras.push([`בתיאטרון יש ${rows} שורות. בכל שורה ${seats} כיסאות. כמה כיסאות יש בתיאטרון בסך הכול?`, rows * seats, [rows + seats, rows * 10, rows * seats - 10], 2])
    const boxes = ri(4, 6), per2 = ri(5, 9), sold = ri(2, 3)
    extras.push([`בחנות יש ${boxes * per2} כדורים. המוכר חילק אותם שווה בשווה ל־${boxes} ארגזים. הוא מכר ${sold} ארגזים. כמה כדורים מכר?`, per2 * sold, [per2, sold * boxes, per2 * sold + per2], 3])
    const n = ri(10, 20), m = ri(3, 6)
    extras.push([`${n} קוביות שוקלות ק״ג אחד. כמה קילוגרמים שוקלות ${n * m} קוביות כאלה?`, m, [m + 1, m * 2, n], 3])
    const a = ri(3, 6), b = ri(4, 8), c = ri(5, 12)
    if (a * b > c) extras.push([`לפניכם תרגיל שחסר בו מספר: ${c} + ? = ${a} × ${b}. מהו המספר החסר?`, a * b - c, [a * b, a * b + c, a + b], 2])
  }
  extras
    .filter((e) => e[1] > 0)
    .forEach(([q, ans, w, d], k) => items.push(pack(`wx${k}`, 'word', `<div class="g-sent">${q}</div>`, String(ans), nums(ans, w), `בעיה מילולית: ${q}`, r, d)))
  // top-of-range: unit rate then scale, part of whole, ages, multi-step
  for (let i = 0; i < 8; i++) {
    const unit = ri(3, 7), k1 = ri(3, 5), k2 = ri(6, 9)
    const q1 = `${k1} מחברות עולות ${unit * k1} שקלים. כמה יעלו ${k2} מחברות כאלה?`
    items.push(pack(`wh${i}a`, 'word', `<div class="g-sent">${q1}</div>`, String(unit * k2), nums(unit * k2, [unit * k1 + k2, unit * (k2 - 1), unit * k1 * 2]), `בעיה מילולית: ${q1}`, r, 3))
    const g = ri(2, 4), tot = g * ri(3, 6), part = tot / g
    const q2 = `בסל ${tot} פירות. ${part} מהם תפוחים והשאר אגסים. כמה אגסים יותר מתפוחים יש בסל?`
    items.push(pack(`wh${i}b`, 'word', `<div class="g-sent">${q2}</div>`, String(tot - 2 * part), nums(tot - 2 * part, [tot - part, part, tot - part + 1]), `בעיה מילולית: ${q2}`, r, 3))
    const kid = ri(6, 9), dad = kid * ri(4, 5), yrs = ri(2, 5)
    const q3 = `היום אבא בן ${dad} ונועם בן ${kid}. בעוד ${yrs} שנים, בן כמה יהיה אבא יותר מנועם?`
    items.push(pack(`wh${i}c`, 'word', `<div class="g-sent">${q3}</div>`, String(dad - kid), nums(dad - kid, [dad - kid + yrs, dad - kid - yrs, dad + yrs - kid + yrs]), `בעיה מילולית: ${q3}`, r, 3))
  }
  // digit riddles (odd, units greater by d)
  ;[[2, 5], [2, 3], [4, 1], [1, 2], [3, 4], [5, 2], [1, 6], [3, 2]].forEach(([tens, d], k) => {
    const num = tens * 10 + tens + d
    if ((tens + d) % 2 === 0) return
    const q = `אני מספר אי־זוגי בן 2 ספרות. סכום הספרות שלי הוא ${tens + tens + d}. ספרת האחדות שלי גדולה ב־${d} מספרת העשרות. מי אני?`
    items.push(pack(`wd${k}`, 'word', `<div class="g-sent">${q}</div>`, String(num), nums(num, [(tens + d) * 10 + tens, num + 10, num - 2]), `חידת ספרות: ${q}`, r, 3))
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
    const [rname, f] = rules[i % rules.length]
    const nd: 1 | 2 | 3 = rname === 'sum' ? 1 : rname === 'prod' || rname === 'bcminusa' ? 2 : 3
    const triples: number[][] = []
    while (triples.length < 3) {
      const tr = [ri(1, 6), ri(1, 6), ri(1, 6)]
      if (f(tr[0], tr[1], tr[2]) > 0) triples.push(tr)
    }
    const ans = f(triples[2][0], triples[2][1], triples[2][2])
    const [a, b, c] = triples[2]
    const cands = [a + b + c, a * b * c, a * b + c, ans + 1, ans - 2, ans + 3]
    const stem = `<div class="g-row" dir="ltr">${triSvg(triples[0], f(triples[0][0], triples[0][1], triples[0][2]))}${triSvg(triples[1], f(triples[1][0], triples[1][1], triples[1][2]))}${triSvg(triples[2], '?')}</div>`
    items.push(pack(`ns${i}`, 'numshape', stem, String(ans), nums(ans, cands), `מספר חסר במשולשים (תרגיל ${i + 1})`, r, nd))
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
    items.push(pack(`nc${i}`, 'numshape', stem, String(ans), nums(ans, [a + b, a * b, a + b + 1, ans + 2]), `מספר חסר בעיגולים (תרגיל ${i + 1})`, r, ([1, 2, 2, 3, 3, 3] as const)[i % 6]))
  }
  // arrow chains: left <- [center] -> right, same multipliers in both rows
  for (let i = 0; i < 12; i++) {
    const m1 = ri(2, 5), m2 = ri(2, 4) + (i % 2)
    const c1 = ri(2, 5), c2 = ri(2, 6)
    const row = (c: number, l: number | string, rr: number | string) =>
      `<div class="g-chain" dir="ltr"><span class="g-node">${l}</span><span>⟵</span><span class="g-box">${c}</span><span>⟶</span><span class="g-node">${rr}</span></div>`
    const ans = c2 * m1
    const stem = `<div>${row(c1, c1 * m1, c1 * m2)}${row(c2, '?', c2 * m2)}</div>`
    items.push(pack(`na${i}`, 'numshape', stem, String(ans), nums(ans, [c2 * m2, c2 + m1, ans * 2, ans + c2]), `שרשרת חצים עם מספר חסר (תרגיל ${i + 1})`, r, 3))
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
      items.push(pack(`fg${i}`, 'figural', `<div class="g-row" dir="ltr">${seq.join('')}${Q_BOX}</div>`, right, wrongs, `סדרת חצים מסתובבים (תרגיל ${i + 1})`, r, step === 45 ? 3 : 2))
    } else if (kind === 1) {
      // growing dots
      const sh = ri(0, 3), a = ri(1, 2), d = ri(1, 2)
      const seq = [0, 1, 2].map((k) => shapeSvg(sh, { dots: a + d * k, size: 16 }))
      const n = a + d * 3
      const right = shapeSvg(sh, { dots: n, size: 16 })
      const wrongs = [shapeSvg(sh, { dots: n - 1, size: 16 }), shapeSvg(sh, { dots: n + 1, size: 16 }), shapeSvg((sh + 1) % 4, { dots: n, size: 16 })]
      items.push(pack(`fg${i}`, 'figural', `<div class="g-row" dir="ltr">${seq.join('')}${Q_BOX}</div>`, right, wrongs, `סדרת צורות עם נקודות (תרגיל ${i + 1})`, r, 1))
    } else if (kind === 2) {
      // size + shape cycle: small, medium, big then next shape
      const s1 = ri(0, 3), s2 = (s1 + 1 + ri(0, 2)) % 4
      const sizes = [10, 17, 24]
      const seq = [shapeSvg(s1, { size: sizes[0] }), shapeSvg(s1, { size: sizes[1] }), shapeSvg(s1, { size: sizes[2] }), shapeSvg(s2, { size: sizes[0] })]
      const right = shapeSvg(s2, { size: sizes[1] })
      const wrongs = [shapeSvg(s2, { size: sizes[2] }), shapeSvg(s1, { size: sizes[1] }), shapeSvg(s2, { size: sizes[0] })]
      void right; void wrongs; void seq // dropped: easier than official level
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
      items.push(pack(`fg${i}`, 'figural', `<div class="g-matrix" dir="ltr">${grid}</div>`, right, wrongs, `טבלת צורות 3×3 (תרגיל ${i + 1})`, r, 2))
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
    items.push(pack(`fp${i}`, 'figural', `<div class="g-row" dir="ltr">${seq.join('')}${Q_BOX}</div>`, poly(n, fill), [poly(n - 1, fill), poly(n + 1, fill), poly(2, fill)], `סדרת מצולעים (תרגיל ${i + 1})`, r, step === 1 ? 1 : 2))
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
    items.push(pack(`fr${i}`, 'figural', `<div class="g-matrix" dir="ltr">${grid}</div>`, dotsBox(n), [dotsBox(n - 1), dotsBox(n + 1), dotsBox(starts[2])], `שלוש שורות של נקודות (תרגיל ${i + 1})`, r, step === 1 ? 1 : 2))
  }
  // carpet with a missing piece (official sample type C): multi-band ornamental rugs
  const PALS = [['#222', '#9a9a9a', '#e6e6e6'], ['#7a1f2b', '#d9a441', '#f4ead5'], ['#1f3b73', '#5aa9f7', '#eaf2fb'], ['#1e5b3a', '#9bc53d', '#eef5e0']]
  const motif = (m: number, row: number, col: number, x: number, y: number, S: number, P: string[]) => {
    const [D, M, L] = P
    const h = S / 2
    switch (m) {
      case 0: // checker of diamonds
        return `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${(row + col) % 2 ? D : L}"/><polygon points="${x + h},${y + 2} ${x + S - 2},${y + h} ${x + h},${y + S - 2} ${x + 2},${y + h}" fill="${(row + col) % 2 ? M : D}"/>`
      case 1: // zigzag triangles alternating direction
        return `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${L}"/>` + (col % 2 === row % 2 ? `<polygon points="${x},${y + S} ${x + h},${y} ${x + S},${y + S}" fill="${D}"/>` : `<polygon points="${x},${y} ${x + S},${y} ${x + h},${y + S}" fill="${M}"/>`)
      case 2: // stripes band
        return `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${L}"/>` + [0, 1, 2, 3].map((k) => `<rect x="${x}" y="${y + (k * S) / 4}" width="${S}" height="${S / 8}" fill="${(k + col) % 2 ? D : M}"/>`).join('')
      case 3: // quarter circles (eye)
        return `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${M}"/><path d="M${x + ((col % 2) ? S : 0)} ${y + ((row % 2) ? S : 0)} m0 0 A${S} ${S} 0 0 ${((col + row) % 2) ? 1 : 0} ${x + ((col % 2) ? 0 : S)} ${y + ((row % 2) ? S : 0)}" fill="${D}" stroke="${D}"/>`
      default: // half-diagonal split with dot
        return `<polygon points="${x},${y} ${x + S},${y} ${(col + row) % 2 ? `${x + S},${y + S}` : `${x},${y + S}`}" fill="${D}"/><polygon points="${(col + row) % 2 ? `${x},${y} ${x},${y + S} ${x + S},${y + S}` : `${x + S},${y} ${x + S},${y + S} ${x},${y + S}`}" fill="${L}"/><circle cx="${x + h}" cy="${y + h}" r="${S / 7}" fill="${M}"/>`
    }
  }
  for (let i = 0; i < 26; i++) {
    const P = PALS[i % PALS.length]
    const bands = [i % 5, (i + 2) % 5, (i + 1) % 5, (i + 4) % 5].slice(0, 2 + (i % 3)) // 2-4 different bands
    const rowsPerBand = i % 2 ? 2 : 3
    const R = Math.min(8, bands.length * rowsPerBand), C = 9, S = 22
    const cellAt = (row: number, col: number, x: number, y: number, swap = false) => {
      const band = bands[Math.floor(((row % R) + R) % R / rowsPerBand) % bands.length]
      const pal = swap ? [P[1], P[0], P[2]] : P
      return motif(band, row, col, x, y, S, pal)
    }
    const pr = 2 // piece 2x2 cells
    const mr = ri(0, R - pr), mc = ri(1, C - pr - 1)
    let svg = `<svg viewBox="0 0 ${C * S} ${R * S}" width="${C * S}" height="${R * S}" class="g-svg carpet"><rect width="${C * S}" height="${R * S}" fill="${P[2]}"/>`
    for (let row = 0; row < R; row++) for (let col = 0; col < C; col++) svg += cellAt(row, col, col * S, row * S)
    svg += `<rect x="${mc * S}" y="${mr * S}" width="${pr * S}" height="${pr * S}" fill="#fff" stroke="#222" stroke-width="1.5"/><text x="${mc * S + S}" y="${mr * S + S + 8}" text-anchor="middle" font-size="22" font-weight="700" fill="#e5533d">?</text></svg>`
    const piece = (dr: number, dc: number, swap = false, mirror = false) => {
      let p = `<svg viewBox="0 0 ${pr * S} ${pr * S}" width="${pr * S + 20}" height="${pr * S + 20}" class="g-svg"><g${mirror ? ` transform="translate(${pr * S} 0) scale(-1 1)"` : ''}>`
      for (let a = 0; a < pr; a++) for (let b = 0; b < pr; b++) p += cellAt(mr + a + dr, mc + b + dc, b * S, a * S, swap)
      return p + `</g><rect x="0" y="0" width="${pr * S}" height="${pr * S}" fill="none" stroke="#222" stroke-width="1"/></svg>`
    }
    const right = piece(0, 0)
    const cands = [piece(0, 1), piece(0, 0, false, true), piece(0, 0, true), piece(1, 0), piece(0, -1), piece(-1, 0), piece(1, 1)].filter((x) => x !== right)
    const uniq = [...new Set(cands)].slice(0, 3)
    const d: 1 | 2 | 3 = bands.length >= 4 ? 3 : bands.length === 3 ? 3 : 2
    if (uniq.length === 3) items.push(pack(`fc${i}`, 'figural', `<div class="g-row">${svg}</div>`, right, uniq, `שטיח שחסרה בו חתיכה (תרגיל ${i + 1})`, r, d))
  }
  // harder rows: two rules at once (arrow turns AND dots grow)
  for (let i = 0; i < 10; i++) {
    const step = [45, 90, 135][i % 3], start = ri(0, 7) * 45, d0 = ri(0, 1), dd = 1 + (i % 2)
    const fill = COLORS[i % 4]
    const seq = [0, 1, 2, 3].map((k) => shapeSvg(4, { rot: start + step * k, fill, dots: d0 + dd * k, size: 13 }))
    const rot4 = start + step * 4, n = d0 + dd * 4
    const right = shapeSvg(4, { rot: rot4, fill, dots: n, size: 13 })
    const wrongs = [shapeSvg(4, { rot: rot4, fill, dots: n - 1, size: 13 }), shapeSvg(4, { rot: rot4 + 90, fill, dots: n, size: 13 }), shapeSvg(4, { rot: rot4 + 180, fill, dots: n + 1, size: 13 })]
    items.push(pack(`fx${i}`, 'figural', `<div class="g-row" dir="ltr">${seq.join('')}${Q_BOX}</div>`, right, wrongs, `סדרה עם שני כללים: כיוון ונקודות (תרגיל ${i + 1})`, r, 3))
  }
  // harder 3-row (like official q3): frame type per row; inner small square moves corner per column
  const frameBox = (frame: number, pos: number, inner: number) => {
    const corners = [[14, 14], [50, 14], [50, 50], [14, 50]]
    const [cx, cy] = corners[pos % 4]
    const fr = frame === 0 ? `<line x1="4" y1="4" x2="60" y2="60" stroke="#222" stroke-width="2"/>` : frame === 1 ? `<line x1="60" y1="4" x2="4" y2="60" stroke="#222" stroke-width="2"/>` : `<line x1="32" y1="4" x2="32" y2="60" stroke="#222" stroke-width="2"/>`
    const inn = inner === 0 ? `<rect x="${cx - 6}" y="${cy - 6}" width="12" height="12" fill="#fff" stroke="#222" stroke-width="2"/>` : `<circle cx="${cx}" cy="${cy}" r="6" fill="#222"/>`
    return `<svg viewBox="0 0 64 64" width="64" height="64" class="g-svg"><rect x="3" y="3" width="58" height="58" fill="#fff" stroke="#222" stroke-width="2"/><rect x="18" y="18" width="28" height="28" fill="none" stroke="#222" stroke-width="2"/>${fr}${inn}</svg>`
  }
  for (let i = 0; i < 10; i++) {
    const frames = shuffleWith([0, 1, 2], r)
    const inner = i % 2
    const p0 = [ri(0, 3), ri(0, 3), ri(0, 3)]
    const mv = i % 3 === 2 ? 2 : 1
    let grid = ''
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) grid += row === 2 && col === 2 ? Q_BOX : frameBox(frames[row], p0[row] + mv * col, inner)
    const pos = p0[2] + mv * 2
    const right = frameBox(frames[2], pos, inner)
    const wrongs = [frameBox(frames[2], pos + 1, inner), frameBox(frames[1], pos, inner), frameBox(frames[2], pos, 1 - inner)]
    items.push(pack(`fy${i}`, 'figural', `<div class="g-matrix" dir="ltr">${grid}</div>`, right, wrongs, `שלוש שורות: מסגרת ומיקום (תרגיל ${i + 1})`, r, 3))
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

/** Exam chapter: official-like easy→hard ordering (3 easy, 4 medium, 3 hard when available). */
export function pickExamChapter(type: GType, n = 10): GItem[] {
  const pool = GIFTED_BANK.filter((it) => it.type === type)
  const by = (d: number) => pool.filter((it) => it.diff === d).sort(() => Math.random() - 0.5)
  const want: [number, number][] = [[1, 3], [2, 4], [3, 3]]
  const out: GItem[] = []
  for (const [d, k] of want) out.push(...by(d).slice(0, k))
  const rest = pool.filter((it) => !out.includes(it)).sort(() => Math.random() - 0.5)
  while (out.length < n && rest.length) out.push(rest.pop()!)
  return out.sort((a, b) => a.diff - b.diff)
}
