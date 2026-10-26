// Matches a typed question to the closest FAQ, entirely in the browser
// (instant, free, works offline). No AI: words are normalised and compared,
// with question words counting most, then keywords, then the answer text.

const STOP_WORDS = new Set(
  `a an and are as at be but by can could do does did for from get got had has have how i if in into is it its
  me my of on or our so than that the their them then there these they this to too us was we were what when where
  which who why will with would you your please hi hello hey thanks thank want need just`.split(/\s+/),
)

// Words that mean the same thing for our app.
const SYNONYMS = {
  issue: 'bug', issues: 'bug', ticket: 'bug', defect: 'bug', problem: 'bug', error: 'bug',
  mail: 'email', emails: 'email', 'e-mail': 'email',
  remove: 'delete', erase: 'delete',
  make: 'create', new: 'create', open: 'create', add: 'create', submit: 'create', report: 'create', file: 'create',
  invitation: 'invite', join: 'invite', code: 'invite',
  permission: 'role', promote: 'role', promotion: 'role',
  stop: 'off', disable: 'off', unsubscribe: 'off',
}

function stem(word) {
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3)
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

export function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word))
    .map((word) => stem(SYNONYMS[word] ?? word))
    .map((word) => SYNONYMS[word] ?? word)
}

// Words nearly every question here contains ("bug", "project"...). They can
// support a match but never create one on their own.
const GENERIC = new Set(['bug', 'project', 'app', 'page', 'tracker', 'system', 'list', 'thing'])
const GENERIC_WEIGHT = 0.25

const MIN_SCORE = 0.34

/**
 * Best FAQ for `query`, or null if nothing is a reasonable match.
 * Returns { faq, score, alternatives } where alternatives are the next
 * closest matches (for "Did you mean...?").
 */
export function findBestFaq(query, faqs = []) {
  const words = [...new Set(tokenize(query))]
  if (words.length === 0) return null

  const scored = faqs
    .map((faq) => {
      const question = new Set(tokenize(faq.question))
      const keywords = new Set(tokenize(faq.keywords))
      const answer = new Set(tokenize(faq.answer))
      let total = 0
      let strongHits = 0
      for (const word of words) {
        if (GENERIC.has(word)) {
          if (question.has(word) || keywords.has(word)) total += GENERIC_WEIGHT
        } else if (question.has(word)) {
          total += 1
          strongHits += 1
        } else if (keywords.has(word)) {
          total += 0.8
          strongHits += 1
        } else if (answer.has(word)) {
          total += 0.3
        }
      }
      return { faq, score: strongHits > 0 ? total / words.length : 0 }
    })
    .filter((entry) => entry.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || (b.faq.hits ?? 0) - (a.faq.hits ?? 0))

  if (scored.length === 0) return null
  const [best, ...rest] = scored
  return { faq: best.faq, score: best.score, alternatives: rest.slice(0, 2).map((entry) => entry.faq) }
}

// The "most asked" suggestions: highest hit count first.
export function topFaqs(faqs = [], count = 4) {
  return [...faqs].sort((a, b) => (b.hits ?? 0) - (a.hits ?? 0)).slice(0, count)
}
