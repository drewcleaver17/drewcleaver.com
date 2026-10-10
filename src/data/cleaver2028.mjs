// R02 publication explicitly authorized by owner on October 10, 2026.
// Status and filing evidence belong here, never in independent page/FAQ strings.
export const campaign = {
  releaseApproved: true,
  labLinksApproved: false,
  disclaimer: 'Paid for by Drew Cleaver.',
  compliance: {
    reviewed: true,
    disclaimerRequired: false,
    reviewNote: 'R02 publication explicitly authorized October 10, 2026 after review of content, layout and public accessibility. Scope remains an organic, personally paid page on the existing personal website, with no committee represented, fundraising, solicitation or paid third-party placement. Official FEC disclaimer and testing-the-waters guidance was reassessed for the revised content. Retain the voluntary factual personal-payer line under this scope-specific research assessment; no additional committee-style wording is inferred. Reviewed means research reviewed, not election-counsel clearance. Actual intent, activities, financing and applicable obligations remain matters for case-specific assessment, not established by the pre-filing label. No filing or legal exemption is claimed. Reassess when those facts change; do not invent a committee or authorization statement.'
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
  description: 'Drew Cleaver explores possible futures for healthcare, public service, postal logistics, and paid hiring assessments. A possible 2028 campaign, in pre-filing planning.',
  purpose: 'I’m an inventor and the founder of Higher Hangers in Austin. I want to bring that instinct to public life: imagine an alternative, build something we can learn from, and take responsibility for what happens next.',
  futuresIntro: 'These are futures I want to explore—not programs already underway. They connect care, public service, infrastructure, and the chance to do meaningful work.',
  futures: [
    { id: 'care', category: 'Healthcare', ideas: [
      ['A doctor who knows you', 'Pilot publicly funded, physician-owned Direct Primary Care as one lane toward universal healthcare or Medicare for All. Imagine having a primary doctor you can return to, before a health concern becomes a crisis.'],
      ['A familiar front door to help', 'Imagine government-owned and operated community centers as familiar and widespread as military recruiting offices: urgent care, mental health crisis support, and a voluntary way into housing and support services. Different needs, one place to ask for help.'],
    ] },
    { id: 'service', category: 'Defense & public service', ideas: [
      ['National capacity, everyday care', 'Explore armed-forces participation or a new DoD department helping operate those centers, with optional recruiting across branches alongside care. Getting care or housing help would never depend on recruitment or military service.'],
      ['Help that can come to you', 'Imagine dispatchable de-escalation specialists assisting police, EMTs, and firefighters when a situation needs a calmer response. Civilian rights and accountable civilian authority would guide the design; this proposes no military policing powers.'],
    ] },
    { id: 'logistics', category: 'Infrastructure & logistics', ideas: [
      ['A postal network built for what’s next', 'Could the Army’s logistics expertise and the Corps of Engineers help reinvent USPS? Explore robotics, modern fulfillment, and a renewed nationwide delivery network—an institutional design idea to evaluate, with no assumed transfer of authority or promised efficiency gain.'],
    ] },
    { id: 'opportunity', category: 'Work & opportunity', ideas: [
      ['Work that builds the future', 'Imagine jobs and training connected to building and operating these care, infrastructure, and logistics systems. Public service could mean helping your community get care, receive a delivery, or keep essential systems working.'],
      ['Get paid to show what you can do', 'ProofPath proposes employer-funded, paid assessments with clear boundaries, so people can demonstrate ability, judgment, and responsible use of tools. A chance to show your work—and be paid for the agreed effort—rather than rely on an interview alone.'],
    ] },
  ],
  method: [
    ['Compare, then pilot', 'Develop alternatives, including the current approach. Establish legal authority, safeguards, a bounded scope, and stopping rules before testing.'],
    ['Measure and listen', 'Publish outcomes and limitations, including harms. Gather input from affected people and invite public scrutiny.'],
    ['Scale, revise, or stop', 'Accountable people make and explain the decision. Public input informs it; AI assists the work but never takes responsibility.'],
  ],
  workIntro: 'DPC and ProofPath have published concepts you can inspect. The community-care, defense, and postal visions above are newer directions for exploration.',
  workLimit: 'Published concepts are not implemented programs. No funded pilots, partnerships, staffing, or measured outcomes are claimed.',
  examples: [
    { name: 'Direct Primary Care', href: '/dpc/', revisionSource: 'dpc', copy: 'A proposed physician-owned primary-care operating model, with an editable calculator for staffing, capacity, and economics. Its assumptions still need clinical and operational validation.' },
    { name: 'ProofPath', href: '/proofpath/', revisionSource: 'proofpath', copy: 'A proposed employer-funded hiring service using paid, bounded work assessments. The first experiment would be delivered manually; the broader platform remains a proposal.' },
  ],
  ai: 'AI helps me research, draft, and build tools. I check the work and take responsibility for what I publish. Public decisions remain with accountable people acting within their authority.',
  labFAQ: 'No. These are proposals under development. Housing, Education, and Taxes remain “To explore” in my Lab; housing access here is part of the community-care vision.',
  contact: 'Have a question, an interview request, relevant experience, or a better idea? Tell me what you see and what deserves a closer look.',
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
    if (!value.compliance.reviewed || typeof value.compliance.disclaimerRequired !== 'boolean' || !value.compliance.reviewNote?.trim()) throw Error('Release requires documented compliance research.');
    if (value.compliance.disclaimerRequired && !value.disclaimer?.trim()) throw Error('Release requires the approved factual disclaimer.');
  }
}

export const isLocalReview = process.env.CLEAVER2028_REVIEW === '1';
export const includeCampaign = campaign.releaseApproved || isLocalReview;
validateCampaign();
