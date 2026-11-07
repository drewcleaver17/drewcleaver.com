export const ideaCode = id => String(id).padStart(3, '0');
export const signed = value => value > 0 ? '+' + value : String(value);
export const total = idea => idea.higher + idea.lower;

export function tally(idea) {
  if (!Number.isInteger(idea.higher) || !Number.isInteger(idea.lower)) return 'Totals unavailable';
  const count = total(idea);
  return count ? signed(idea.net) + ' · ' + count + (count === 1 ? ' vote' : ' votes') : 'No votes yet';
}

function words(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const common = new Set('a an and are as at be by can do for from how i in is it me my of on or our the this to we what when with would'.split(' '));
const tokens = s => words(s).split(' ').filter(w => w && !common.has(w));
const byRank = (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity) || a.id - b.id;

export function findIdeas(ideas, query) {
  const number = String(query).trim().match(/^(?:#?\s*|(?:idea|id)[\s#-]*)0*(\d+)$/i);
  if (number) return ideas.filter(idea => idea.id === Number(number[1]));
  const phrase = words(query);
  if (!phrase) return [...ideas].sort(byRank);
  const wanted = [...new Set(tokens(phrase))];
  const score = idea => {
    const primary = [idea.title, idea.topic, ...(idea.aliases || [])].map(words);
    if (primary.includes(phrase)) return 100;
    if (primary.some(text => (' ' + text + ' ').includes(' ' + phrase + ' '))) return 80;
    if (!wanted.length) return 0;
    const fields = [...primary, words(idea.action)].map(tokens);
    const all = new Set(fields.flat());
    const hits = wanted.filter(word => all.has(word) ||
      (word.length > 3 && [...all].some(t => t.length > 3 && (t.startsWith(word) || word.startsWith(t))))).length;
    if (!hits || hits / wanted.length < (wanted.length < 3 ? 1 : 0.65)) return 0;
    const close = fields.some(field => wanted.every(w => field.includes(w)));
    return (close ? 65 : 35) + hits / wanted.length * 10;
  };
  return ideas.map(idea => ({idea, weight: score(idea)})).filter(entry => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || byRank(a.idea, b.idea)).map(entry => entry.idea);
}

// Draw only when a card is actually shown. Early exits leave unseen cards in the deck.
export class VisitDeck {
  constructor(random = Math.random) {
    this.random = random;
    this.seen = new Set();
  }

  begin(ids) {
    let remaining = ids.filter(id => !this.seen.has(id));
    if (!remaining.length) {
      this.seen.clear();
      remaining = [...ids];
    }
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    return remaining.slice(0, 3);
  }

  show(id) { this.seen.add(id); }
}

export function voteMessage(result) {
  const direction = result.state === 1 ? 'upvote' : 'downvote';
  switch (result.outcome) {
    case 'recorded': return (result.state === 1 ? 'Upvote' : 'Downvote') + ' recorded.';
    case 'unchanged': return 'Already counted for this connection.';
    case 'changed': return 'Changed to ' + direction + '.';
    case 'removed': return 'Vote removed for this connection.';
    case 'empty': return 'There was no active vote for this connection.';
    default: return 'Vote confirmed.';
  }
}

export const statuses = {
  received: 'Received',
  reviewing: 'Under review',
  published: 'Published',
  merged: 'Combined with an existing idea',
  declined: 'Reviewed and set aside'
};
