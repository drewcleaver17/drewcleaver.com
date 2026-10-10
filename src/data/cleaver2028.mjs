// Owner-authorized personal-site release. Reassess disclosures when filing or funding changes.
// Status and filing evidence belong here, never in independent page/FAQ strings.
export const campaign = {
  releaseApproved: true,
  labLinksApproved: false,
  disclaimer: 'Paid for by Drew Cleaver.',
  compliance: {
    reviewed: true,
    disclaimerRequired: false,
    reviewNote: 'Owner authorized publication and confirmed personal payment and no FEC registration on October 10, 2026. This is an organic page on his existing personal website, with no committee represented, fundraising, solicitation or paid third-party placement. FEC guidance distinguishes committee websites and paid internet public communications. A voluntary factual payer disclosure is included. This scope-specific research assessment is not a legal opinion; reassess upon committee formation, filing, fundraising or paid promotion.',
  },
  status: {
    stage: 'pre-filing',
    label: 'Pre-filing planning',
    detail: 'I’m preparing a possible 2028 campaign seeking the Democratic nomination for President.',
    faq: 'This is pre-filing planning. I’m developing ideas and considering a possible campaign. No FEC filing is represented on this page.',
    filingDate: null,
    recordUrl: null,
  },
  title: 'Drew Cleaver / 2028 — A possible presidential campaign',
  description: 'Meet Drew Cleaver, an Austin inventor and founder preparing a possible 2028 presidential campaign. Inspect his proposals, approach, and open questions.',
  purpose: 'I want to help turn better ways of living and working into proposals people can inspect, question, and test.',
  why: [
    'I’m an inventor and the founder of Higher Hangers, based in Austin, Texas. Building a physical product taught me to look closely at a problem, develop an alternative, and find out whether it works for the people using it.',
    'That is the habit I want to bring to policy: make assumptions visible, invite criticism, and take responsibility for results. Business experience is part of my background; presidential readiness requires much more—public trust, sound judgment, and a serious understanding of government.',
  ],
  method: [
    ['Define the problem', 'Name who is affected, what needs to improve, and what we still don’t know.'],
    ['Compare alternatives', 'Include the current approach. Explain costs, tradeoffs, and whose experience informs the choice.'],
    ['Run a bounded pilot', 'Set a scope, budget, safeguards, consent where relevant, and stopping rules. Establish legal authority first.'],
    ['Publish the evidence', 'Share measures, results, methods, and limitations—including harms and findings that challenge the idea.'],
    ['Gather public input', 'Listen to affected people and invite scrutiny. Feedback is advisory; it does not replace legally binding votes or decisions.'],
    ['Make an accountable decision', 'The responsible officials decide whether to scale, revise, or stop, and explain why.'],
  ],
  workIntro: 'The Lab is my policy-development workspace: working ideas, assumptions, unanswered questions, and revision records. Healthcare and Work have developed entries; Housing, Education, and Taxes are marked “To explore.”',
  workLimit: 'These are published concept pages, not implemented programs. Publication and calculators are evidence of work on an idea, not proof of funded pilots, partnerships, participants, or measured outcomes.',
  examples: [
    { name: 'Direct Primary Care', href: '/dpc/', revisionSource: 'dpc', copy: 'A proposed physician-owned primary-care operating model, with an editable calculator for staffing, capacity, and economics. Its assumptions still need clinical and operational validation.' },
    { name: 'ProofPath', href: '/proofpath/', revisionSource: 'proofpath', copy: 'A proposed employer-funded hiring service using paid, bounded work assessments. The first experiment would be delivered manually; the broader platform remains a proposal.' },
  ],
  ai: 'AI helps me research, compare alternatives, draft, and build tools. I’m responsible for checking the work and deciding what I publish. Public decisions must remain with accountable people acting within their authority.',
  labFAQ: 'Proposals and questions you can inspect, including DPC and ProofPath. It is a developing workspace, not a complete platform or a public voting system.',
  contact: 'A thoughtful objection, relevant expertise, or a question is a useful place to start. Send me a few sentences about what you see and what you think deserves a closer look.',
};

export function validateCampaign(value = campaign) {
  const status = value.status;
  if (status.stage === 'pre-filing') {
    if (status.filingDate || status.recordUrl) throw Error('Pre-filing status cannot contain filing evidence.');
  } else if (status.stage === 'filed') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(status.filingDate || '') || !Number.isFinite(Date.parse(status.filingDate))) throw Error('A verified filing date is required.');
    const url = new URL(status.recordUrl);
    if (url.protocol !== 'https:' || !(url.hostname === 'fec.gov' || url.hostname.endsWith('.fec.gov'))) throw Error('An official FEC record link is required.');
  } else throw Error('Unknown candidacy status.');
  if (value.releaseApproved) {
    if (!value.compliance.reviewed || typeof value.compliance.disclaimerRequired !== 'boolean' || !value.compliance.reviewNote?.trim()) throw Error('Release requires a documented compliance determination.');
    if (value.compliance.disclaimerRequired && !value.disclaimer?.trim()) throw Error('Release requires the approved factual disclaimer.');
  }
}

export const isLocalReview = process.env.CLEAVER2028_REVIEW === '1';
export const includeCampaign = campaign.releaseApproved || isLocalReview;
validateCampaign();
