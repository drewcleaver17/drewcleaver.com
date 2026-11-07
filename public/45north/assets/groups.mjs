// Permanent issue IDs define the launch comparison sets. The arrays describe membership only.
// A new set of five receives its own key so orders collected against different choices stay separate.
export const GROUPS = [
  { id: 'workplace', label: 'Work hours & protections', ids: [1, 4, 6, 33, 38] },
  { id: 'hiring', label: 'Hiring, training & pay', ids: [9, 11, 17, 29, 34] },
  { id: 'income', label: 'Income & job benefits', ids: [15, 23, 32, 37, 45] },
  { id: 'caregiving', label: 'Family caregiving', ids: [2, 12, 16, 21, 28] },
  { id: 'health', label: 'Health care access & costs', ids: [5, 14, 22, 26, 41] },
  { id: 'transport', label: 'Getting around', ids: [7, 18, 25, 30, 36] },
  { id: 'renting', label: 'Renting a home', ids: [8, 10, 19, 24, 35] },
  { id: 'homes', label: 'Homes & utilities', ids: [3, 20, 31, 40, 43] },
  { id: 'essentials', label: 'Food, benefits & tax help', ids: [13, 27, 39, 42, 44] },
];

const GROUP_SIZE = 5;
const LIMIT = GROUP_SIZE * GROUPS.length;
const launchGroup = new Map(GROUPS.flatMap(group => group.ids.map(id => [id, group.id])));
const ascending = (a, b) => a - b;

// The original topic names are deliberately retained in the source catalog. Some span two or
// more comparison groups. A precise title match can distinguish housing repairs from utility bills.
const signals = {
  workplace: {
    topics: ['Pay & hours'],
    words: /\b(?:schedul\w*|shift swaps?|sick (?:time|days?)|wage (?:claims?|theft)|underpay\w*|retaliat\w*|organi[sz]ing|unions?|heat breaks?|rest breaks?|overtime|worker safety|workplace safety)\b/gi,
  },
  hiring: {
    topics: ['Jobs & skills', 'Pay & hours'],
    words: /\b(?:apprentic\w*|vocational|training|credentials?|degree requirements?|technical education|hir(?:e|ed|ing)|job (?:listings?|postings?|applicants?)|minimum wage|salary ranges?|pay ranges?|trade exams?|starter tools?)\b/gi,
  },
  income: {
    topics: ['Money & services', 'Pay & hours'],
    words: /\b(?:unemployment|benefit cliffs?|pay raises?|income loss|job loss|job-based coverage|premiums?|retirement|payroll|pensions?|savings|profit[- ]sharing|employee ownership|stock ownership)\b/gi,
  },
  caregiving: {
    topics: ['Family care'],
    words: /\b(?:child[- ]?care|daycare|after[- ]school|caregiv\w*|respite|family leave|parental leave|medical leave|new parents?|eldercare|elder care)\b/gi,
  },
  health: {
    topics: ['Health'],
    words: /\b(?:clinics?|hospital\w*|medical care|health ?care|pharmac\w*|prescript\w*|dental|dentists?|counsel\w*|mental health|copays?|treatment|doctor\w*|patients?|primary care|urgent care|medicine)\b/gi,
  },
  transport: {
    topics: ['Getting around'],
    words: /\b(?:buses|bus|mobility|trains?|transit|transport\w*|commut\w*|fares?|pedestrian\w*|crosswalks?|crossings?|vanpools?|carpools?|car repairs?|bike lanes?|bicycl\w*)\b/gi,
  },
  renting: {
    topics: ['Housing'],
    words: /\b(?:rents?|rentals?|renters?|tenants?|landlords?|evict\w*|rental screening|leases?|security deposits?)\b/gi,
  },
  homes: {
    topics: ['Housing', 'Food & bills'],
    words: /\b(?:homes?|homeownership|homeowners?|mortgages?|duplex\w*|apartments?|zoning|land trusts?|utilities|utility|electricity|broadband|internet|insulat\w*|weatheriz\w*|energy bills?|shutoffs?|shut-offs?)\b/gi,
  },
  essentials: {
    topics: ['Food & bills', 'Money & services'],
    words: /\b(?:food|meals?|breakfast|lunch|grocer\w*|produce|nutrition|snap|benefit applications?|public assistance|tax(?:es)?|refundable credits?)\b/gi,
  },
};

function affinity(idea, group) {
  const rule = signals[group.id];
  if (idea.topic === group.label) return 100;
  const topic = rule.topics.includes(idea.topic) ? 4 : 0;
  const matches = field => new Set(String(field ?? '').toLowerCase().match(rule.words) ?? []).size;
  return topic + 4 * Math.min(4, matches(idea.title)) + Math.min(3, matches(idea.action));
}

// Reserve all selected launch issues first. For newly qualifying issues, handle the clearest
// topical fits before ambiguous ones. Equal fits resolve by permanent issue ID, then group ID.
function fillVacancies(groups, additions) {
  const open = groups.filter(group => group.ids.length < GROUP_SIZE);
  const candidates = additions.map(idea => ({
    id: idea.id,
    fits: open.map(group => ({ group, score: affinity(idea, group) }))
      .sort((a, b) => b.score - a.score || a.group.id.localeCompare(b.group.id, 'en')),
  }));
  while (candidates.length) {
    let selected = 0;
    let largestLead = -1;
    let bestScore = -1;
    for (let index = 0; index < candidates.length; index++) {
      const candidate = candidates[index];
      candidate.fits = candidate.fits.filter(fit => fit.group.ids.length < GROUP_SIZE);
      const [first, second] = candidate.fits;
      const lead = first.score - (second?.score ?? 0);
      if (lead > largestLead || (lead === largestLead && first.score > bestScore)) {
        selected = index;
        largestLead = lead;
        bestScore = first.score;
      }
    }
    const [candidate] = candidates.splice(selected, 1);
    candidate.fits[0].group.ids.push(candidate.id);
  }
}

export function makeGroups(ideas, landingIds) {
  const active = new Map();
  for (const idea of ideas) {
    if (Number.isSafeInteger(idea.id) && idea.id > 0 && idea.active !== false && idea.active !== 0) {
      active.set(idea.id, idea);
    }
  }
  const selected = [...new Set(landingIds ?? active.keys())]
    .filter(id => active.has(id))
    .sort(ascending)
    .slice(0, LIMIT);
  const groups = GROUPS.map(({ id, label }) => ({ id, label, ids: [] }));
  const byGroup = new Map(groups.map(group => [group.id, group]));
  const additions = [];
  for (const id of selected) {
    const group = byGroup.get(launchGroup.get(id));
    if (group) group.ids.push(id);
    else additions.push(active.get(id));
  }
  fillVacancies(groups, additions);
  return groups.filter(group => group.ids.length).map(group => {
    group.ids.sort(ascending);
    return { ...group, key: 'order-v1:' + group.id + ':' + group.ids.join('.') };
  });
}
