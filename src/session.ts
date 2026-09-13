/** Adaptive 15-question session generator */

import {
  LETTERS,
  CVC_WORDS,
  HEART_WORDS,
  lettersInCluster,
  lettersUpToCluster,
  cvcByCluster,
  cvcByVowel,
  lettersAZ,
  lettersInAbcGroup,
  lettersBeforeGroup,
  nextLetterId,
  prevLetterId,
  isLookalike,
  pickN,
  shuffle,
  weightedPick,
  type Letter,
  type CvcWord,
  type HeartWord,
  type AbcGroupId,
} from './content'
import { load, skillWeight, type AppData } from './storage'

export type QType =
  | 'hear-letter'
  | 'match-case'
  | 'trace'
  | 'starts-with'
  | 'name-vs-sound'
  | 'oral-blend'
  | 'build-cvc'
  | 'read-cvc'
  | 'segment'
  | 'heart'
  | 'odd-one-out'
  | 'arrange-ltr'
  | 'direction' // M0
  | 'hear-name'
  | 'see-name'
  | 'next-letter'

export type Question = {
  id: string
  type: QType
  promptHe: string
  skillId: string
  skillType: 'letter' | 'cvc' | 'heart' | 'blend' | 'other'
  // payloads
  letter?: Letter
  letters?: Letter[]
  word?: CvcWord
  words?: CvcWord[]
  heart?: HeartWord
  hearts?: HeartWord[]
  options?: string[]
  correct?: string
  sounds?: string[]
  emojis?: { emoji: string; id: string }[]
  askSound?: boolean // name-vs-sound
  arrange?: string[]
  nameMode?: boolean
  seqHint?: string
  askBefore?: boolean
}

export type ModuleId =
  | 'abc-af'
  | 'abc-gl'
  | 'abc-mr'
  | 'abc-sz'
  | 'abc-review'
  | 'abc-case'
  | 'm0'
  | 'm1'
  | 'm2'
  | 'm3'
  | 'm4'
  | 'm5'
  | 'm6'
export type ModuleOpts = { vowel?: 'a' | 'e' | 'i' | 'o' | 'u' }

const SESSION_LEN = 15

function skillOf(data: AppData, id: string) {
  return data.skills[id]
}

function pickLetter(pool: Letter[], data: AppData): Letter {
  return weightedPick(pool, (l) => skillWeight(skillOf(data, `letter:${l.id}`)))
}

function pickWord(pool: CvcWord[], data: AppData): CvcWord {
  return weightedPick(pool, (w) => skillWeight(skillOf(data, `cvc:${w.id}`)))
}

function distractorsLetters(correct: Letter, pool: Letter[], n: number, avoidLooks = false): Letter[] {
  let others = pool.filter((l) => l.id !== correct.id)
  if (avoidLooks) {
    const safe = others.filter((l) => !isLookalike(correct.id, l.id))
    if (safe.length >= n) others = safe
  }
  others = shuffle(others).slice(0, n)
  return shuffle([correct, ...others])
}

function makeHearLetter(letter: Letter, pool: Letter[]): Question {
  const opts = distractorsLetters(letter, pool, 3)
  return {
    id: `hear-${letter.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'hear-letter',
    promptHe: 'הקישי על האות שאת שומעת',
    skillId: `letter:${letter.id}`,
    skillType: 'letter',
    letter,
    letters: opts,
    correct: letter.id,
  }
}

function makeMatchCase(letter: Letter, pool: Letter[]): Question {
  const showUpper = Math.random() < 0.5
  const opts = distractorsLetters(letter, pool, 3)
  return {
    id: `case-${letter.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'match-case',
    promptHe: showUpper ? `מצאי את האות הקטנה של ${letter.upper}` : `מצאי את האות הגדולה של ${letter.lower}`,
    skillId: `letter:${letter.id}`,
    skillType: 'letter',
    letter,
    letters: opts,
    correct: letter.id,
    askSound: showUpper,
  }
}

function makeTrace(letter: Letter): Question {
  return {
    id: `trace-${letter.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'trace',
    promptHe: `ציירי את האות ${letter.upper} / ${letter.lower}`,
    skillId: `letter:${letter.id}`,
    skillType: 'letter',
    letter,
    correct: letter.id,
  }
}

function makeStartsWith(letter: Letter, pool: Letter[]): Question {
  const correct = { emoji: letter.emoji, id: letter.id }
  const wrong = shuffle(pool.filter((l) => l.id !== letter.id))
    .slice(0, 3)
    .map((l) => ({ emoji: l.emoji, id: l.id }))
  return {
    id: `start-${letter.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'starts-with',
    promptHe: `איזו תמונה מתחילה בצליל /${letter.sound}/?`,
    skillId: `letter:${letter.id}`,
    skillType: 'letter',
    letter,
    emojis: shuffle([correct, ...wrong]),
    correct: letter.id,
  }
}

function makeNameVsSound(letter: Letter): Question {
  const askSound = Math.random() < 0.5
  return {
    id: `nvs-${letter.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'name-vs-sound',
    promptHe: askSound ? 'מה הצליל של האות?' : 'מה השם של האות?',
    skillId: `letter:${letter.id}`,
    skillType: 'letter',
    letter,
    askSound,
    options: askSound
      ? shuffle([letter.sound, letter.name, letter.keyword])
      : shuffle([letter.name, letter.sound, letter.upper]),
    correct: askSound ? letter.sound : letter.name,
  }
}

function makeOralBlend(word: CvcWord, pool: CvcWord[]): Question {
  const opts = shuffle([word, ...shuffle(pool.filter((w) => w.id !== word.id)).slice(0, 3)])
  return {
    id: `blend-${word.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'oral-blend',
    promptHe: 'שמעי את הצלילים — איזו מילה?',
    skillId: `cvc:${word.id}`,
    skillType: 'cvc',
    word,
    words: opts,
    sounds: word.letters.map((id) => {
      const L = LETTERS.find((l) => l.id === id)!
      return L.sound
    }),
    correct: word.id,
  }
}

function makeBuildCvc(word: CvcWord, letterPool: Letter[]): Question {
  const needed = word.letters.map((id) => LETTERS.find((l) => l.id === id)!)
  const pool = [...letterPool]
  for (const L of needed) if (!pool.some((x) => x.id === L.id)) pool.push(L)
  const extras = shuffle(pool.filter((l) => !word.letters.includes(l.id))).slice(0, 3)
  return {
    id: `build-${word.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'build-cvc',
    promptHe: `בני את המילה ${word.emoji}`,
    skillId: `cvc:${word.id}`,
    skillType: 'cvc',
    word,
    letters: shuffle([...needed, ...extras]),
    correct: word.word,
  }
}

function makeReadCvc(word: CvcWord, pool: CvcWord[]): Question {
  const opts = shuffle([word, ...shuffle(pool.filter((w) => w.id !== word.id)).slice(0, 3)])
  return {
    id: `read-${word.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'read-cvc',
    promptHe: 'קראי את המילה — בחרי תמונה',
    skillId: `cvc:${word.id}`,
    skillType: 'cvc',
    word,
    words: opts,
    correct: word.id,
  }
}

function makeSegment(word: CvcWord, letterPool: Letter[]): Question {
  const needed = word.letters.map((id) => LETTERS.find((l) => l.id === id)!)
  const pool = [...letterPool]
  for (const L of needed) if (!pool.some((x) => x.id === L.id)) pool.push(L)
  const extras = shuffle(pool.filter((l) => !word.letters.includes(l.id))).slice(0, 3)
  return {
    id: `seg-${word.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'segment',
    promptHe: `פרקי את ${word.word} ${word.emoji} לשלושה צלילים`,
    skillId: `cvc:${word.id}`,
    skillType: 'cvc',
    word,
    letters: shuffle([...needed, ...extras]),
    correct: word.letters.join(''),
  }
}

function makeHeart(h: HeartWord, pool: HeartWord[]): Question {
  const opts = shuffle([h, ...shuffle(pool.filter((x) => x.id !== h.id)).slice(0, 3)])
  return {
    id: `heart-${h.id}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'heart',
    promptHe: 'איזו מילת לב שמעת?',
    skillId: `heart:${h.id}`,
    skillType: 'heart',
    heart: h,
    hearts: opts,
    correct: h.id,
  }
}

function makeOddOneOut(pool: Letter[]): Question {
  const target = pickN(pool, 1)[0]
  // pick 2 that share starting approach: use same cluster random + 1 odd
  // Ensure we have a clear odd: three from same cluster, one from elsewhere
  const cluster = target.cluster
  const same = pickN(
    pool.filter((l) => l.cluster === cluster),
    3,
  )
  const other =
    pickN(
      LETTERS.filter((l) => l.cluster !== cluster),
      1,
    )[0] || pickN(pool, 1)[0]
  const letters = shuffle([...same, other])
  return {
    id: `odd-${Math.random().toString(36).slice(2, 7)}`,
    type: 'odd-one-out',
    promptHe: 'מי לא שייכת לקבוצה? (צליל/אשכול)',
    skillId: `letter:${other.id}`,
    skillType: 'letter',
    letters,
    correct: other.id,
    letter: other,
  }
}

function makeArrange(pool: Letter[]): Question {
  const three = pickN(pool, 3)
  return {
    id: `arr-${Math.random().toString(36).slice(2, 7)}`,
    type: 'arrange-ltr',
    promptHe: 'סדרי את האותיות משמאל לימין (LTR)',
    skillId: `other:ltr`,
    skillType: 'other',
    letters: shuffle(three),
    arrange: three.map((l) => l.lower),
    correct: three.map((l) => l.lower).join(''),
  }
}

function makeDirection(): Question {
  const order = pickN(
    lettersInCluster(1),
    3,
  )
  return {
    id: `dir-${Math.random().toString(36).slice(2, 7)}`,
    type: 'direction',
    promptHe: 'באנגלית קוראים משמאל לימין — סדרי את האותיות',
    skillId: `other:ltr`,
    skillType: 'other',
    letters: shuffle(order),
    arrange: order.map((l) => l.lower),
    correct: order.map((l) => l.lower).join(''),
  }
}

function warmupFromMistakes(data: AppData, letterPool: Letter[], wordPool: CvcWord[]): Question[] {
  const recent = Object.values(data.skills)
    .filter((s) => s.wrong > 0)
    .sort((a, b) => b.lastWrong - a.lastWrong)
    .slice(0, 6)
  const qs: Question[] = []
  for (const s of recent) {
    if (qs.length >= 3) break
    if (s.type === 'letter' && s.id.startsWith('letter:')) {
      const id = s.id.slice(7)
      const L = letterPool.find((l) => l.id === id) || LETTERS.find((l) => l.id === id)
      if (L) qs.push(makeHearLetter(L, letterPool.length ? letterPool : lettersInCluster(1)))
    } else if (s.type === 'cvc' && s.id.startsWith('cvc:')) {
      const id = s.id.slice(4)
      const W = wordPool.find((w) => w.id === id) || CVC_WORDS.find((w) => w.id === id)
      if (W) qs.push(makeReadCvc(W, wordPool.length ? wordPool : CVC_WORDS))
    } else if (s.type === 'heart') {
      const id = s.id.slice(6)
      const H = HEART_WORDS.find((h) => h.id === id)
      if (H) qs.push(makeHeart(H, HEART_WORDS))
    }
  }
  return qs
}

function buildersForCluster(cluster: 1 | 2 | 3, data: AppData): (() => Question)[] {
  const letters = lettersInCluster(cluster)
  const words = cvcByCluster(cluster)
  return [
    () => makeHearLetter(pickLetter(letters, data), letters),
    () => makeMatchCase(pickLetter(letters, data), letters),
    () => makeTrace(pickLetter(letters, data)),
    () => makeStartsWith(pickLetter(letters, data), letters),
    () => makeNameVsSound(pickLetter(letters, data)),
    () => makeOralBlend(pickWord(words, data), words),
    () => makeBuildCvc(pickWord(words, data), letters),
    () => makeReadCvc(pickWord(words, data), words),
    () => makeSegment(pickWord(words, data), letters),
    () => makeOddOneOut(letters),
    () => makeArrange(letters),
  ]
}


function rid(): string {
  return Math.random().toString(36).slice(2, 7)
}

function makeHearName(letter: Letter, pool: Letter[]): Question {
  const opts = distractorsLetters(letter, pool, 3, true)
  return {
    id: `hname-${letter.id}-${rid()}`,
    type: 'hear-name',
    promptHe: 'הקישי על האות שאת שומעת',
    skillId: `letter:${letter.id}`,
    skillType: 'letter',
    letter,
    letters: opts,
    correct: letter.id,
    nameMode: true,
  }
}

function makeSeeName(letter: Letter, pool: Letter[]): Question {
  const opts = distractorsLetters(letter, pool, 3, true)
  return {
    id: `sname-${letter.id}-${rid()}`,
    type: 'see-name',
    promptHe: 'מה שם האות?',
    skillId: `letter:${letter.id}`,
    skillType: 'letter',
    letter,
    letters: opts,
    correct: letter.id,
    nameMode: true,
  }
}

function makeNextLetter(letter: Letter, az: Letter[], before = false): Question {
  const nextId = before ? prevLetterId(letter.id) : nextLetterId(letter.id)
  const target = az.find((l) => l.id === nextId) || az.find((l) => l.id === (before ? 'a' : 'z'))!
  const near: Letter[] = []
  const add = (id: string | null) => {
    if (!id || id === target.id || id === letter.id) return
    const L = az.find((l) => l.id === id)
    if (L && !near.some((x) => x.id === L.id)) near.push(L)
  }
  add(before ? nextLetterId(letter.id) : prevLetterId(letter.id))
  add(before ? prevLetterId(target.id) : nextLetterId(target.id))
  add(letter.id)
  const extras = shuffle(az.filter((l) => l.id !== target.id && l.id !== letter.id && !near.some((x) => x.id === l.id)))
  while (near.length < 3 && extras.length) near.push(extras.pop()!)
  const opts = shuffle([target, ...near.slice(0, 3)])
  const i = 'abcdefghijklmnopqrstuvwxyz'.indexOf(letter.id)
  let hint = ''
  if (!before && i >= 0) {
    const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const start = Math.max(0, i - 2)
    hint = `${a.slice(start, i + 1)} ?`
  } else if (before && i >= 0) {
    const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    hint = `? ${a.slice(i, Math.min(26, i + 3))}`
  }
  return {
    id: `next-${letter.id}-${rid()}`,
    type: 'next-letter',
    promptHe: before ? 'איזו אות באה לפני?' : 'מה האות הבאה?',
    skillId: `letter:${target.id}`,
    skillType: 'letter',
    letter,
    letters: opts,
    correct: target.id,
    nameMode: true,
    seqHint: hint,
    askBefore: before,
  }
}

function makeAbcOrder(az: Letter[]): Question {
  const start = Math.floor(Math.random() * 24)
  const three = az.slice(start, start + 3)
  return {
    id: `abcord-${rid()}`,
    type: 'arrange-ltr',
    promptHe: 'סדרי לפי סדר האלפבית',
    skillId: `letter:${three[1].id}`,
    skillType: 'letter',
    letters: shuffle(three),
    arrange: three.map((l) => l.lower),
    correct: three.map((l) => l.lower).join(''),
    nameMode: true,
  }
}

function makeAbcOdd(az: Letter[]): Question {
  const start = Math.floor(Math.random() * 24)
  const consec = az.slice(start, start + 3)
  let odd = az[Math.floor(Math.random() * az.length)]
  let guard = 0
  while ((Math.abs(az.indexOf(odd) - start) < 4 || consec.some((l) => l.id === odd.id)) && guard++ < 30) {
    odd = az[Math.floor(Math.random() * az.length)]
  }
  return {
    id: `abcodd-${rid()}`,
    type: 'odd-one-out',
    promptHe: 'מי לא שייכת לרצף ABC?',
    skillId: `letter:${odd.id}`,
    skillType: 'letter',
    letters: shuffle([...consec, odd]),
    correct: odd.id,
    letter: odd,
    nameMode: true,
  }
}

function activeAbcPool(group: AbcGroupId, data: AppData): Letter[] {
  const core = lettersInAbcGroup(group)
  const prev = lettersBeforeGroup(group)
  const extra: Letter[] = []
  const seen = new Set(core.map((l) => l.id))
  const candidates = [...prev]
  for (let i = 0; i < 3 && candidates.length; i++) {
    const L = weightedPick(
      candidates.filter((c) => !extra.some((e) => e.id === c.id)),
      (l) => skillWeight(skillOf(data, `letter:${l.id}`)),
    )
    if (L && !seen.has(L.id)) {
      extra.push(L)
      seen.add(L.id)
    }
  }
  return [...core, ...extra]
}

function warmupAbc(data: AppData, pool: Letter[]): Question[] {
  const recent = Object.values(data.skills)
    .filter((s) => s.wrong > 0 && s.type === 'letter')
    .sort((a, b) => b.lastWrong - a.lastWrong)
    .slice(0, 8)
  const qs: Question[] = []
  for (const s of recent) {
    if (qs.length >= 3) break
    const id = s.id.startsWith('letter:') ? s.id.slice(7) : ''
    const L = pool.find((l) => l.id === id) || LETTERS.find((l) => l.id === id)
    if (L) qs.push(makeHearName(L, pool.length ? pool : lettersAZ()))
  }
  return qs
}

function pickSeqLetter(pool: Letter[]): Letter {
  const cands = pool.filter((l) => l.id !== 'z')
  return cands.length ? pickN(cands, 1)[0] : pool[0]
}

function generateAbcSession(kind: 'group' | 'review' | 'case', group: AbcGroupId | null, data: AppData): Question[] {
  const az = lettersAZ()
  const pool = kind === 'group' && group ? activeAbcPool(group, data) : az
  const used = new Set<string>()
  const out: Question[] = []
  const push = (q: Question) => {
    const key = `${q.type}:${q.skillId}:${q.correct}`
    if (used.has(key) && out.length < SESSION_LEN - 1) return
    used.add(key)
    out.push(q)
  }
  warmupAbc(data, pool).forEach(push)

  type Kind = 'hear' | 'see' | 'case' | 'next' | 'before' | 'order' | 'odd'
  let recipe: Kind[]
  if (kind === 'case') {
    recipe = [
      ...Array(8).fill('case'),
      ...Array(3).fill('hear'),
      ...Array(2).fill('see'),
      ...Array(2).fill('next'),
    ]
  } else if (kind === 'review') {
    recipe = [
      ...Array(3).fill('hear'),
      ...Array(2).fill('see'),
      ...Array(2).fill('case'),
      ...Array(4).fill('next'),
      ...Array(2).fill('before'),
      ...Array(2).fill('order'),
    ]
  } else {
    recipe = [
      ...Array(5).fill('hear'),
      ...Array(4).fill('see'),
      ...Array(2).fill('case'),
      ...Array(2).fill('next'),
      ...Array(1).fill('odd'),
      ...Array(1).fill('order'),
    ]
  }
  recipe = shuffle(recipe as Kind[])

  const build = (k: Kind): Question => {
    const L = pickLetter(pool, data)
    if (k === 'hear') return makeHearName(L, pool)
    if (k === 'see') return makeSeeName(L, pool)
    if (k === 'case') return { ...makeMatchCase(L, pool), nameMode: true }
    if (k === 'next') return makeNextLetter(pickSeqLetter(pool), az, false)
    if (k === 'before') {
      const bp = pool.filter((x) => x.id !== 'a')
      return makeNextLetter(pickLetter(bp.length ? bp : pool, data), az, true)
    }
    if (k === 'order') return makeAbcOrder(az)
    return makeAbcOdd(az)
  }

  let i = 0
  while (out.length < SESSION_LEN) {
    push(build(recipe[i % recipe.length]))
    i++
    if (i > 40) break
  }
  return out.slice(0, SESSION_LEN)
}

export function generateSession(module: ModuleId, opts: ModuleOpts = {}): Question[] {
  const data = load()
  const used = new Set<string>()
  const out: Question[] = []

  const push = (q: Question) => {
    const key = `${q.type}:${q.skillId}:${q.correct}`
    if (used.has(key) && out.length < SESSION_LEN - 1) {
      // allow soft dup avoidance
    }
    used.add(key)
    out.push(q)
  }

  if (module === 'abc-af' || module === 'abc-gl' || module === 'abc-mr' || module === 'abc-sz') {
    const g = module.slice(4) as AbcGroupId
    return generateAbcSession('group', g, data)
  } else if (module === 'abc-review') {
    return generateAbcSession('review', null, data)
  } else if (module === 'abc-case') {
    return generateAbcSession('case', null, data)
  } else if (module === 'm0') {
    const letters = lettersInCluster(1)
    const words = cvcByCluster(1)
    const warm = warmupFromMistakes(data, letters, words)
    warm.forEach(push)
    while (out.length < SESSION_LEN) {
      const r = Math.random()
      if (r < 0.35) push(makeDirection())
      else if (r < 0.6) push(makeArrange(letters))
      else if (r < 0.85) push(makeOralBlend(pickWord(words, data), words))
      else push(makeHearLetter(pickLetter(letters, data), letters))
    }
  } else if (module === 'm1' || module === 'm2' || module === 'm3') {
    const cluster = Number(module[1]) as 1 | 2 | 3
    const letters = lettersInCluster(cluster)
    const words = cvcByCluster(cluster)
    warmupFromMistakes(data, letters, words).forEach(push)
    const builders = buildersForCluster(cluster, data)
    while (out.length < SESSION_LEN) {
      const q = builders[Math.floor(Math.random() * builders.length)]()
      push(q)
    }
  } else if (module === 'm4') {
    const vowel = opts.vowel
    const words = vowel ? cvcByVowel(vowel) : CVC_WORDS.filter((w) => w.cluster <= 3)
    const letterIds = new Set(words.flatMap((w) => w.letters))
    const letters = LETTERS.filter((l) => letterIds.has(l.id))
    warmupFromMistakes(data, letters, words).forEach(push)
    const builders: (() => Question)[] = [
      () => makeOralBlend(pickWord(words, data), words),
      () => makeBuildCvc(pickWord(words, data), letters),
      () => makeReadCvc(pickWord(words, data), words),
      () => makeSegment(pickWord(words, data), letters),
    ]
    while (out.length < SESSION_LEN) push(builders[Math.floor(Math.random() * builders.length)]())
  } else if (module === 'm5') {
    warmupFromMistakes(data, lettersInCluster(1), cvcByCluster(1)).forEach(push)
    while (out.length < SESSION_LEN) {
      const h = weightedPick(HEART_WORDS, (x) => skillWeight(skillOf(data, `heart:${x.id}`)))
      const r = Math.random()
      if (r < 0.7) push(makeHeart(h, HEART_WORDS))
      else {
        // recognition variant: show word, pick hint — reuse heart type
        push(makeHeart(h, HEART_WORDS))
      }
    }
  } else if (module === 'm6') {
    const letters = lettersUpToCluster(3)
    const words = CVC_WORDS.filter((w) => w.cluster <= 3)
    warmupFromMistakes(data, letters, words).forEach(push)
    while (out.length < SESSION_LEN) {
      const r = Math.random()
      if (r < 0.4) {
        // letters/sounds
        const b = pickN(
          [
            () => makeHearLetter(pickLetter(letters, data), letters),
            () => makeMatchCase(pickLetter(letters, data), letters),
            () => makeStartsWith(pickLetter(letters, data), letters),
            () => makeNameVsSound(pickLetter(letters, data)),
            () => makeTrace(pickLetter(letters, data)),
            () => makeOddOneOut(letters),
          ],
          1,
        )[0]
        push(b())
      } else if (r < 0.8) {
        const b = pickN(
          [
            () => makeOralBlend(pickWord(words, data), words),
            () => makeBuildCvc(pickWord(words, data), letters),
            () => makeReadCvc(pickWord(words, data), words),
            () => makeSegment(pickWord(words, data), letters),
          ],
          1,
        )[0]
        push(b())
      } else {
        const h = weightedPick(HEART_WORDS, (x) => skillWeight(skillOf(data, `heart:${x.id}`)))
        if (Math.random() < 0.5) push(makeHeart(h, HEART_WORDS))
        else push(makeStartsWith(pickLetter(letters, data), letters))
      }
    }
  }

  return out.slice(0, SESSION_LEN)
}

export const MODULE_META: Record<
  ModuleId,
  { title: string; subtitle: string; emoji: string }
> = {
  'abc-af': { title: 'A–F', subtitle: 'שם האות · A B C D E F', emoji: '🅰️' },
  'abc-gl': { title: 'G–L', subtitle: 'שם האות · G H I J K L', emoji: '🔤' },
  'abc-mr': { title: 'M–R', subtitle: 'שם האות · M N O P Q R', emoji: '📗' },
  'abc-sz': { title: 'S–Z', subtitle: 'שם האות · S T U V W X Y Z', emoji: '📘' },
  'abc-review': { title: 'כל האלפבית', subtitle: 'מה האות הבאה · A–Z', emoji: '🎶' },
  'abc-case': { title: 'גדולה ↔ קטנה', subtitle: 'A↔a  B↔b', emoji: '🔠' },
  m0: { title: 'מתחילים', subtitle: 'כיוון LTR + חיבור צלילים', emoji: '🌱' },
  m1: { title: 'אשכול 1', subtitle: 's a t i p n', emoji: '🔤' },
  m2: { title: 'אשכול 2', subtitle: 'c k e h r m d', emoji: '📗' },
  m3: { title: 'אשכול 3', subtitle: 'g o u l f b', emoji: '📘' },
  m4: { title: 'מעבדת CVC', subtitle: 'מילים קצרות לפי תנועה', emoji: '🔬' },
  m5: { title: 'מילות לב', subtitle: 'I a the to my is you', emoji: '💛' },
  m6: { title: 'משימות מעורבות', subtitle: 'ערבוב חכם', emoji: '🚀' },
}

export const ABC_HOME_MODULES: ModuleId[] = [
  'abc-af',
  'abc-gl',
  'abc-mr',
  'abc-sz',
  'abc-review',
  'abc-case',
]

export const ADVANCED_HOME_MODULES: ModuleId[] = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6']
