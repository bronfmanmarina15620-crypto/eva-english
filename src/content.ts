/** Content bank: letters, CVC, heart words, tips */

export type Letter = {
  id: string
  upper: string
  lower: string
  cluster: 1 | 2 | 3 | 4
  sound: string
  name: string
  keyword: string
  emoji: string
}

export type CvcWord = {
  id: string
  word: string
  letters: [string, string, string]
  vowel: 'a' | 'e' | 'i' | 'o' | 'u'
  emoji: string
  cluster: 1 | 2 | 3
}

export type HeartWord = {
  id: string
  word: string
  heHint: string
}

export const LETTERS: Letter[] = [
  // Cluster 1 SATPIN
  { id: 's', upper: 'S', lower: 's', cluster: 1, sound: 'sss', name: 'S', keyword: 'sun', emoji: '☀️' },
  { id: 'a', upper: 'A', lower: 'a', cluster: 1, sound: 'a', name: 'A', keyword: 'apple', emoji: '🍎' },
  { id: 't', upper: 'T', lower: 't', cluster: 1, sound: 'ttt', name: 'T', keyword: 'tiger', emoji: '🐯' },
  { id: 'i', upper: 'I', lower: 'i', cluster: 1, sound: 'i', name: 'I', keyword: 'igloo', emoji: '🛖' },
  { id: 'p', upper: 'P', lower: 'p', cluster: 1, sound: 'ppp', name: 'P', keyword: 'pen', emoji: '🖊️' },
  { id: 'n', upper: 'N', lower: 'n', cluster: 1, sound: 'nnn', name: 'N', keyword: 'nest', emoji: '🪺' },
  // Cluster 2
  { id: 'c', upper: 'C', lower: 'c', cluster: 2, sound: 'kkk', name: 'C', keyword: 'cat', emoji: '🐱' },
  { id: 'k', upper: 'K', lower: 'k', cluster: 2, sound: 'kkk', name: 'K', keyword: 'kite', emoji: '🪁' },
  { id: 'e', upper: 'E', lower: 'e', cluster: 2, sound: 'e', name: 'E', keyword: 'egg', emoji: '🥚' },
  { id: 'h', upper: 'H', lower: 'h', cluster: 2, sound: 'hhh', name: 'H', keyword: 'hat', emoji: '🎩' },
  { id: 'r', upper: 'R', lower: 'r', cluster: 2, sound: 'rrr', name: 'R', keyword: 'rabbit', emoji: '🐰' },
  { id: 'm', upper: 'M', lower: 'm', cluster: 2, sound: 'mmm', name: 'M', keyword: 'moon', emoji: '🌙' },
  { id: 'd', upper: 'D', lower: 'd', cluster: 2, sound: 'ddd', name: 'D', keyword: 'dog', emoji: '🐶' },
  // Cluster 3
  { id: 'g', upper: 'G', lower: 'g', cluster: 3, sound: 'ggg', name: 'G', keyword: 'goat', emoji: '🐐' },
  { id: 'o', upper: 'O', lower: 'o', cluster: 3, sound: 'o', name: 'O', keyword: 'octopus', emoji: '🐙' },
  { id: 'u', upper: 'U', lower: 'u', cluster: 3, sound: 'u', name: 'U', keyword: 'umbrella', emoji: '☂️' },
  { id: 'l', upper: 'L', lower: 'l', cluster: 3, sound: 'lll', name: 'L', keyword: 'leaf', emoji: '🍃' },
  { id: 'f', upper: 'F', lower: 'f', cluster: 3, sound: 'fff', name: 'F', keyword: 'fish', emoji: '🐟' },
  { id: 'b', upper: 'B', lower: 'b', cluster: 3, sound: 'bbb', name: 'B', keyword: 'ball', emoji: '⚽' },
  // Cluster 4 later
  { id: 'j', upper: 'J', lower: 'j', cluster: 4, sound: 'jjj', name: 'J', keyword: 'jam', emoji: '🫙' },
  { id: 'v', upper: 'V', lower: 'v', cluster: 4, sound: 'vvv', name: 'V', keyword: 'van', emoji: '🚐' },
  { id: 'w', upper: 'W', lower: 'w', cluster: 4, sound: 'www', name: 'W', keyword: 'web', emoji: '🕸️' },
  { id: 'x', upper: 'X', lower: 'x', cluster: 4, sound: 'ks', name: 'X', keyword: 'box', emoji: '📦' },
  { id: 'y', upper: 'Y', lower: 'y', cluster: 4, sound: 'yyy', name: 'Y', keyword: 'yellow', emoji: '💛' },
  { id: 'z', upper: 'Z', lower: 'z', cluster: 4, sound: 'zzz', name: 'Z', keyword: 'zoo', emoji: '🦓' },
  { id: 'q', upper: 'Q', lower: 'q', cluster: 4, sound: 'kw', name: 'Q', keyword: 'queen', emoji: '👑' },
]

export const CVC_WORDS: CvcWord[] = [
  // Cluster 1
  { id: 'sat', word: 'sat', letters: ['s', 'a', 't'], vowel: 'a', emoji: '🪑', cluster: 1 },
  { id: 'pin', word: 'pin', letters: ['p', 'i', 'n'], vowel: 'i', emoji: '📌', cluster: 1 },
  { id: 'tip', word: 'tip', letters: ['t', 'i', 'p'], vowel: 'i', emoji: '👆', cluster: 1 },
  { id: 'nap', word: 'nap', letters: ['n', 'a', 'p'], vowel: 'a', emoji: '😴', cluster: 1 },
  { id: 'sit', word: 'sit', letters: ['s', 'i', 't'], vowel: 'i', emoji: '🪑', cluster: 1 },
  { id: 'pan', word: 'pan', letters: ['p', 'a', 'n'], vowel: 'a', emoji: '🍳', cluster: 1 },
  { id: 'tin', word: 'tin', letters: ['t', 'i', 'n'], vowel: 'i', emoji: '🥫', cluster: 1 },
  { id: 'tap', word: 'tap', letters: ['t', 'a', 'p'], vowel: 'a', emoji: '🚰', cluster: 1 },
  { id: 'pat', word: 'pat', letters: ['p', 'a', 't'], vowel: 'a', emoji: '🤚', cluster: 1 },
  { id: 'pit', word: 'pit', letters: ['p', 'i', 't'], vowel: 'i', emoji: '🕳️', cluster: 1 },
  { id: 'sip', word: 'sip', letters: ['s', 'i', 'p'], vowel: 'i', emoji: '🥤', cluster: 1 },
  { id: 'tan', word: 'tan', letters: ['t', 'a', 'n'], vowel: 'a', emoji: '🟤', cluster: 1 },
  // Cluster 2
  { id: 'cat', word: 'cat', letters: ['c', 'a', 't'], vowel: 'a', emoji: '🐱', cluster: 2 },
  { id: 'hen', word: 'hen', letters: ['h', 'e', 'n'], vowel: 'e', emoji: '🐔', cluster: 2 },
  { id: 'red', word: 'red', letters: ['r', 'e', 'd'], vowel: 'e', emoji: '🔴', cluster: 2 },
  { id: 'mad', word: 'mad', letters: ['m', 'a', 'd'], vowel: 'a', emoji: '😠', cluster: 2 },
  { id: 'him', word: 'him', letters: ['h', 'i', 'm'], vowel: 'i', emoji: '👦', cluster: 2 },
  { id: 'net', word: 'net', letters: ['n', 'e', 't'], vowel: 'e', emoji: '🥅', cluster: 2 },
  { id: 'cap', word: 'cap', letters: ['c', 'a', 'p'], vowel: 'a', emoji: '🧢', cluster: 2 },
  { id: 'map', word: 'map', letters: ['m', 'a', 'p'], vowel: 'a', emoji: '🗺️', cluster: 2 },
  { id: 'hid', word: 'hid', letters: ['h', 'i', 'd'], vowel: 'i', emoji: '🙈', cluster: 2 },
  { id: 'ten', word: 'ten', letters: ['t', 'e', 'n'], vowel: 'e', emoji: '🔟', cluster: 2 },
  { id: 'men', word: 'men', letters: ['m', 'e', 'n'], vowel: 'e', emoji: '👥', cluster: 2 },
  { id: 'rid', word: 'rid', letters: ['r', 'i', 'd'], vowel: 'i', emoji: '🧹', cluster: 2 },
  { id: 'kit', word: 'kit', letters: ['k', 'i', 't'], vowel: 'i', emoji: '🧰', cluster: 2 },
  { id: 'can', word: 'can', letters: ['c', 'a', 'n'], vowel: 'a', emoji: '🥫', cluster: 2 },
  // Cluster 3
  { id: 'dog', word: 'dog', letters: ['d', 'o', 'g'], vowel: 'o', emoji: '🐶', cluster: 3 },
  { id: 'bus', word: 'bus', letters: ['b', 'u', 's'], vowel: 'u', emoji: '🚌', cluster: 3 },
  { id: 'fog', word: 'fog', letters: ['f', 'o', 'g'], vowel: 'o', emoji: '🌫️', cluster: 3 },
  { id: 'log', word: 'log', letters: ['l', 'o', 'g'], vowel: 'o', emoji: '🪵', cluster: 3 },
  { id: 'big', word: 'big', letters: ['b', 'i', 'g'], vowel: 'i', emoji: '🐘', cluster: 3 },
  { id: 'cup', word: 'cup', letters: ['c', 'u', 'p'], vowel: 'u', emoji: '☕', cluster: 3 },
  { id: 'bug', word: 'bug', letters: ['b', 'u', 'g'], vowel: 'u', emoji: '🐛', cluster: 3 },
  { id: 'fun', word: 'fun', letters: ['f', 'u', 'n'], vowel: 'u', emoji: '🎉', cluster: 3 },
  { id: 'sun', word: 'sun', letters: ['s', 'u', 'n'], vowel: 'u', emoji: '☀️', cluster: 3 },
  { id: 'fox', word: 'fox', letters: ['f', 'o', 'x'], vowel: 'o', emoji: '🦊', cluster: 3 },
  { id: 'mug', word: 'mug', letters: ['m', 'u', 'g'], vowel: 'u', emoji: '🫖', cluster: 3 },
  { id: 'lot', word: 'lot', letters: ['l', 'o', 't'], vowel: 'o', emoji: '📦', cluster: 3 },
  { id: 'got', word: 'got', letters: ['g', 'o', 't'], vowel: 'o', emoji: '✅', cluster: 3 },
  { id: 'bag', word: 'bag', letters: ['b', 'a', 'g'], vowel: 'a', emoji: '👜', cluster: 3 },
]


export const HEART_WORDS: HeartWord[] = [
  { id: 'I', word: 'I', heHint: 'אני' },
  { id: 'a', word: 'a', heHint: 'א' },
  { id: 'the', word: 'the', heHint: 'ה־' },
  { id: 'to', word: 'to', heHint: 'ל־' },
  { id: 'my', word: 'my', heHint: 'שלי' },
  { id: 'is', word: 'is', heHint: 'הוא/היא' },
  { id: 'you', word: 'you', heHint: 'את/אתה' },
]

export const PARENT_TIPS = [
  'כללי זהב: שמעו יחד את צליל האות — לא רק את השם שלה.',
  'תרגלו בקצרה: 10–15 דקות ביום עדיפות על שעה אחת בשבוע.',
  'חגגו ניסיונות, לא רק תשובות נכונות — אווה לומדת לבטוח בעצמה.',
  'כשאווה קוראת מילה, בקשו ממנה "לשבור" אותה לצלילים: /c/ /a/ /t/.',
  'אל תמהרו לאלפבית A→Z. הסדר SATPIN בונה מילים מהר יותר.',
  'Heart words (I, the, to…) לומדים כתמונה שלמה — לא תמיד אפשר לבטא.',
  'שחקו "מצאי אות שמתחילה ב…" בבית עם חפצים אמיתיים.',
  'אם יש בלבול בין b ל־d — תרגלו כל אחת בנפרד עם תנועה גדולה.',
  'שלחו לה הודעה קצרה באנגלית פשוטה: Hi Eva! 🌟',
  'המפה בצבעים במסך ההורים מראה מה כבר חזק ומה לתרגל שוב.',
]

export function lettersInCluster(c: 1 | 2 | 3 | 4): Letter[] {
  return LETTERS.filter((l) => l.cluster === c)
}

export function lettersUpToCluster(c: 1 | 2 | 3): Letter[] {
  return LETTERS.filter((l) => l.cluster <= c)
}

export function cvcByCluster(c: 1 | 2 | 3): CvcWord[] {
  return CVC_WORDS.filter((w) => w.cluster === c)
}

export function cvcByVowel(v: 'a' | 'e' | 'i' | 'o' | 'u'): CvcWord[] {
  return CVC_WORDS.filter((w) => w.vowel === v)
}

export function getLetter(id: string): Letter | undefined {
  return LETTERS.find((l) => l.id === id)
}

export function getCvc(id: string): CvcWord | undefined {
  return CVC_WORDS.find((w) => w.id === id)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length))
}

export function weightedPick<T>(items: T[], weight: (t: T) => number): T {
  const weights = items.map(weight)
  const sum = weights.reduce((a, b) => a + Math.max(0.01, b), 0)
  let r = Math.random() * sum
  for (let i = 0; i < items.length; i++) {
    r -= Math.max(0.01, weights[i])
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}
