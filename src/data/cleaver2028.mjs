// Drew explicitly approved the reviewed R03 release and three project links on October 10, 2026.
// Status and filing evidence belong here, never in independent page/FAQ strings.
export const campaign = {
  releaseApproved: true,
  labLinksApproved: true,
  disclaimer: 'Paid for by Drew Cleaver.',
  compliance: {
    // This records documented scope-specific research, not election-counsel clearance.
    reviewed: true,
    disclaimerRequired: false,
    reviewNote: 'R03 scope-specific research completed October 10, 2026 using current 11 CFR 100.26 and 110.11 and FEC website/testing-the-waters guidance. On the stated personal-payer facts, this organic page on Drew\'s existing personal site introduces no political committee, solicitation, paid placement or promotion. No additional mandatory disclaimer was identified for that limited scope; retain Paid for by Drew Cleaver. This is a limited research assessment, not legal clearance or a determination of candidate/committee status. Actual decisions, activities and spending, including candidate-style branding, require qualified review; pre-filing and noindex are not exemptions. See the R03 release addendum in docs/cleaver2028/R03-REVIEW.md. Reassess before financing, committee, fundraising or promotion changes.'
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
  description: 'Meet Drew Cleaver, inventor and founder of Higher Hangers in Austin. Explore seven visions and examine the work behind a possible 2028 presidential campaign.',
  purpose: 'I’m an inventor and the founder of Higher Hangers in Austin. I want to bring that instinct to public life: imagine an alternative, build something we can learn from, and take responsibility for what happens next.',
  biography: 'Higher Hangers grew from a space-saving hanger idea into a consumer-products business. I launched it on Kickstarter in 2016 and ran its sales and operations. Before that, I worked in technical sales in oil and gas.',
  biographySources: [
    { label: 'My background and career account', href: '/about/', basis: 'First-person biography' },
    { label: 'The original Higher Hangers launch', href: 'https://www.kickstarter.com/projects/higherhangers/higher-hangers-space-saving-closet-organization-re', basis: '2016 Kickstarter campaign' },
    { label: 'Reporting on Higher Hangers', href: 'https://www.washingtonpost.com/business/2025/05/12/trump-china-tariffs-prices-deal/', basis: 'The Washington Post · 2025' },
  ],
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
  workIntro: 'Start with one practical question: what would it take to give people a doctor they can return to, with room in the schedule when something cannot wait?',
  workLimit: 'Published concepts are not implemented programs. No funded pilots, partnerships, staffing, or measured outcomes are claimed.',
  dpc: {
    premise: 'My Direct Primary Care model explores a physician-owned practice: routine visits with an assigned doctor, plus protected time for short-notice care from the team.',
    controls: 'Change membership prices, physician schedules, visit lengths, attendance and patient allocation. Examine the effects on capacity, operating finances and the opening cash plan.',
    scope: 'The worksheet helps investigate whether a proposed practice can fit its workload and costs. Clinical assumptions and patient demand remain unvalidated; startup costs and required funding are incomplete.',
    extension: 'Public funding is a separate proposal. This practice calculator does not establish the cost or feasibility of universal coverage or Medicare for All.',
    question: 'Who covers the practice when a physician is away?',
    questionContext: 'R09 budgets for coverage but does not schedule a relief roster or simulate dated leave. What staffing arrangement would preserve continuity and seven-day team access through real absences?',
    href: '/dpc/#model',
    contextHref: '/dpc/#concept',
  },
  proofpath: {
    copy: 'An employer-funded hiring proposal built around paid work samples. Inspect the proposed one-employer, five-candidate pilot, its effort and payment terms, and what it would measure. The first experiment would be run manually; no funded pilot, partnership or results are claimed.',
    href: '/proofpath/#pilot',
  },
  accessByRequest: 'For access to these unlisted concepts, email me and mention DPC or ProofPath.',
  ai: 'AI helps me research, draft, and build tools. I check the work and take responsibility for what I publish. Public decisions remain with accountable people acting within their authority.',
  labFAQ: 'No. These are proposals under development. Housing, Education, and Taxes remain “To explore” in my Lab; housing access here is part of the community-care vision.',
  contact: 'Ask a question, challenge an assumption, or share relevant experience. If you know how a practice handles coverage, how public services work on the ground, or what a fair hiring trial needs, I’d like to hear what I’ve missed.',
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
