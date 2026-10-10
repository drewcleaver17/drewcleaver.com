import dpcRevision from './dpc-revisions.json';
import proofpathRevision from './proofpath-revisions.json';

// Lab summaries live here. Detailed proposals and their revision records remain
// authoritative at their canonical routes; never copy their model assumptions.
export interface LabSection {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: { title: string; text: string }[];
}
export interface LabTopic {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  canonical: string;
  sections: LabSection[];
}
export const labMethod = [
  { title: 'Pilot', text: 'Develop alternatives and define a small, bounded test with the people affected.' },
  { title: 'Measure', text: 'Agree on outcomes, costs, safeguards and stopping conditions before the test.' },
  { title: 'Review', text: 'Gather public input and examine results, tradeoffs and failures openly.' },
  { title: 'Revise', text: 'Record an accountable decision: scale, change, test again or discontinue.' },
];
export const labProposals = [
  {
    id: 'dpc', category: 'healthcare', title: 'Direct Primary Care', status: 'Proposed operating model',
    summary: 'Continuity with an assigned physician, access to a small team and a potential path to physician ownership.',
    canonical: '/dpc/', sourceRevision: dpcRevision.pageRevision,
    sourceUpdatedAt: dpcRevision.updatedAt,
    sourceFiles: ['src/pages/dpc.astro', 'src/data/dpc-revisions.json', 'docs/dpc/R09_RECONCILIATION.md'],
  },
  {
    id: 'proofpath', category: 'work', title: 'ProofPath', status: 'Proposed hiring experiment',
    summary: 'Employer-funded assessments that pay candidates to demonstrate ability, judgment and responsible use of tools.',
    canonical: '/proofpath/', sourceRevision: proofpathRevision.pageRevision,
    sourceUpdatedAt: proofpathRevision.updatedAt,
    sourceFiles: ['src/pages/proofpath.astro', 'src/data/proofpath-revisions.json'],
  },
];
export const labTopics: LabTopic[] = [
  {
    id: 'healthcare', title: 'Healthcare', category: 'Healthcare', status: 'Exploration', canonical: '/lab/healthcare/',
    summary: 'How could primary care become easier to reach, more continuous and sustainable for the people delivering it?',
    sections: [
      { id: 'position', title: 'A relationship worth building around', paragraphs: [
        'My working hypothesis is that dependable access to a familiar primary-care physician could make care more useful to patients and create a sustainable local practice. The operating model, the way care is funded and the wider healthcare system are separate questions.',
        'The existing DPC concept proposes routine visits with an assigned physician on that physician’s clinic days, plus seven-day access to the team for short-notice needs. Its small practice combines a physician owner and up to two associates, protected clinical time, shared nonclinical support and a possible ownership pathway.',
        'That is a proposed primary-care operating model. It does not establish a complete healthcare policy or resolve access to specialists, hospitals, medicines or other care.',
      ] },
      { id: 'funding', title: 'Three funding alternatives to investigate', paragraphs: [
        'The current DPC worksheet models membership economics. These alternatives require separate eligibility, payment, governance and financial analysis; selecting one here would outrun the evidence.',
      ], items: [
        { title: 'Patient-paid', text: 'Test affordability, demand and retention at the proposed membership terms. Determine who would be left out and how patients would fund care beyond the membership.' },
        { title: 'Publicly funded', text: 'Investigate what a public payer could purchase, for whom and under which authority. Model budgets, procurement, accountability and effects on existing services before proposing an arrangement.' },
        { title: 'Blended', text: 'Explore a defined mix of patient payments and public support. Model eligibility, patient contributions, administrative cost and continuity when funding changes.' },
      ] },
      { id: 'evidence', title: 'What the model shows—and what it assumes', paragraphs: [
        'The canonical DPC page provides the calculator, source notes, assigned-panel model, launch projections and dated documents. Those outputs describe what follows from entered assumptions. They are not measured patient outcomes, demonstrated demand or clinical validation.',
        'Demand, utilization, staffing, pricing, coverage costs and compensation need validation. Startup spending and full funding requirements remain unresolved. A schedule with team availability does not itself establish a same-day or next-day service guarantee.',
      ] },
      { id: 'questions', title: 'Questions still open', items: [
        { title: 'Access and affordability', text: 'Who needs this most, who can afford it, and how would each funding alternative change enrollment and equitable access?' },
        { title: 'Clinical scope and continuity', text: 'What care is included, what needs escalation, and how will absences, weekend demand and care outside the practice be handled?' },
        { title: 'Delivery and accountability', text: 'Can clinicians deliver the proposed schedule without unsustainable workload? Which ownership, payment and support arrangements can be responsibly implemented?' },
      ] },
      { id: 'pilot', title: 'What a pilot would need to establish', paragraphs: [
        'The DPC source proposes observing 25 opt-in members for 90 days each. Its targets remain proposals. Before recruitment, a physician-led team would need a funded scope, inclusion criteria, care terms, coverage plan and an agreed evaluation protocol.',
      ], items: [
        { title: 'Patient experience', text: 'Observe continuity, access, care-plan follow-through, retention and reasons for leaving. Gather patient input, including barriers and unmet needs.' },
        { title: 'Clinical delivery', text: 'Measure routine and short-notice workload, messages, absence coverage and clinician time. Agree on safety escalation and stopping conditions with the clinical lead.' },
        { title: 'Full economics', text: 'Track actual delivery costs, patient payments or payer funding, startup cash and affordability. Compare results with the assumptions and a realistic alternative.' },
        { title: 'Decision', text: 'Review patient and clinician feedback alongside results. Record whether to revise the operating model, test a funding alternative, stop or consider a further pilot.' },
      ] },
      { id: 'decisions', title: 'Decision history', paragraphs: [
        'R01 separates the primary-care operating proposal from wider healthcare and funding questions. DPC remains the authoritative model; no funding alternative has been selected here. The Lab update record explains this decision.',
      ] },
      { id: 'next', title: 'The next question to resolve', paragraphs: [
        'What narrowly defined patient group and care promise could a physician-led team test with a credible budget and safe coverage plan?',
      ] },
    ],
  },
  {
    id: 'work', title: 'Work', category: 'Work', status: 'Exploration', canonical: '/lab/work/',
    summary: 'How could hiring reveal what people can do—and how should work change as AI changes what people can produce?',
    sections: [
      { id: 'position', title: 'Give ability a useful way to show up', paragraphs: [
        'My working hypothesis is that realistic, compensated work samples could help people demonstrate judgment that applications and live interviews sometimes miss. Tools, time to think and responsible AI use should be part of the conditions being evaluated.',
        'ProofPath is the first proposed experiment: one employer, one verified role and five paid candidates, delivered manually with a defined rubric and supplied tools. It would replace an agreed evaluation step, with employers retaining the hiring decision.',
        'The broader passport and connected hiring platform remain future proposals. ProofPath is not a proven hiring system or an operational nationwide service.',
      ] },
      { id: 'evidence', title: 'A premise to test, not a promised result', paragraphs: [
        'The canonical ProofPath brief defines the proposed effort cap, completion window, compensation, payment timing, consent and evidence-use boundaries. Those terms describe a proposed pilot, not an active assessment offer.',
        'Whether employers will fund the service, candidates find it worthwhile and the evidence improves decisions must be tested. There are no pilot outcomes or partnership commitments claimed here. A work sample or recorded process does not establish predictive validity on its own.',
      ] },
      { id: 'questions', title: 'Questions still open', items: [
        { title: 'Hiring evidence', text: 'Which assignment and rubric reveal role-relevant ability? How can the process reduce extra hurdles, protect confidentiality and accommodate different needs?' },
        { title: 'Productivity gains', text: 'When AI helps people produce more, how could the gains be measured and distributed among pay, time, prices and investment? These are questions, with no allocation rule selected.' },
        { title: 'Workweeks and employment', text: 'Which jobs could support different hours or workweeks while preserving service and income? How will changing tasks affect entry paths, training and employment? No workweek or employment policy is adopted here.' },
      ] },
      { id: 'pilot', title: 'Start with one funded hiring experiment', paragraphs: [
        'Use the ProofPath proposal to scope a verified role and one employer’s consenting shortlist. Agree which hiring step the pilot replaces, fund candidate payments before invitations become assignments and define permitted tools, effort and reuse terms.',
        'The initial task is to learn whether this service is useful and deliverable. Five candidates cannot establish broad predictive validity; any later outcome research needs separate permission and a suitable study design.',
      ], items: [
        { title: 'Candidate experience', text: 'Observe completion, actual effort, timely payment and whether participants regard the task and terms as clear, fair and useful.' },
        { title: 'Employer usefulness', text: 'Determine whether the evidence resolves role-specific questions and earns a willingness to fund another scoped engagement.' },
        { title: 'Delivery cost and learning', text: 'Track coordination, review, tools and founder labor against the agreed budget. Identify assignment or rubric changes, including where AI use needs clearer evaluation.' },
        { title: 'Decision', text: 'Review candidate and employer feedback, record limitations and decide whether to revise, repeat or discontinue before building platform infrastructure.' },
      ] },
      { id: 'decisions', title: 'Decision history', paragraphs: [
        'R01 uses ProofPath as a bounded starting experiment. Broader workweek, productivity and employment questions remain exploration areas rather than policy commitments. The Lab update record explains this decision.',
      ] },
      { id: 'next', title: 'The next question to resolve', paragraphs: [
        'Will one employer fund a scoped assessment that replaces an existing hiring step, with terms candidates would willingly accept?',
      ] },
    ],
  },
];
