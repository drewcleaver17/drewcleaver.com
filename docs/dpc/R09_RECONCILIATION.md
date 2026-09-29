# R09 review — assigned physician panels and protected team access

Unpublished successor to R08, continuing draft PR #56. Live `/dpc/` was fetched and identified as R07. PR #56 was open, draft and unmerged at inspection, head `41aef8d7f8283790efd552d7acb54371d64931d1`. Seven published revisions remain; neither R08 nor R09 counts as published. Preserve the fixed Central timestamp in `src/data/dpc-revisions.json` when publication is later approved.

## Operating correction

One included monthly routine visit stays with the assigned physician on any of their clinic days. Owner Tue–Thu; A Sun–Thu (Fri/Sat off); B Tue–Sat (Sun/Mon off). Daily onsite totals are 1,1,3,3,3,1,1. Shared Tue–Thu time is intentional. Mentoring consumes entered management/training time, never free capacity. No assumed after-hours or off-day duty. Owner plus two associates is the base; junior Fri–Mon is separate.

R08's fixed pooled weekday demand and 0% routine flexibility did not represent this policy. R09 normalizes editable routine day weights only within each physician's clinic days. Uniform weights assume patients can spread bookings across those days, not freely choose another doctor. Appointment time-of-day preferences and dated leave are not simulated.

## Base assumptions and arithmetic

- 100% completed monthly routine attendance, 0% lost no-shows; 70% is an explicit comparison, not observed behavior.
- 25/45-minute routine visits; 75% long-visit mix gives 40 minutes per routine booking. Membership tier mix and visit mix remain separately editable.
- Owner six routine slots/day, plus one separate reserve encounter, within 10–7. Associates 9–6, less one hour each for breaks, admin and reserve: six routine hours or nine weighted visits, under the 12 total encounter ceiling.
- 46 working weeks annually. Six absent weeks per doctor have no scheduled relief. Budgeting relief does not create a roster.
- 85% routine target protects scheduling variability once, after explicit protected work is removed. Short-notice reserve is separate, not reduced by another 15%.
- 1% monthly attrition; a separate 45-minute onboarding visit for each new member, including replacements.
- Starting panel weights 69:172.5:172.5 are capacity-proportional planning allocations, not measured preference. Weights are editable. Whole members use largest-remainder allocation.

| Doctor | Raw routine slots/month | Standalone routine panel limit | Base assigned panel |
|---|---:|---:|---:|
| Owner | 69 | 57 | 57 |
| A | 172.5 | 144 | 144 |
| B | 172.5 | 144 | 144 |
| Total | 414 | 345 | 345 |

Each role's limit checks both available routine minutes and remaining encounter count on each clinic weekday, with replacement onboarding. Whole-person flooring matters: the owner continuous time limit is just below 58; the model does not round it upward. The practice also checks team reserve by day. Capacity is not evidence that those panels can be sold.

## Short-notice access and unresolved fees

One hour per scheduled doctor is held away from routine work. Expected demand is 5 encounters/100 members/month at 60 minutes, with weekday/weekend weights 2/1. At 345 members this is 17.25 requests/month. The reserve holds 49.83 encounter-hours/month averaged over working weeks. Sunday/Mon/Fri/Sat have one doctor; Tuesday–Thursday have three. Same-day/next-day service requires observed arrival timing, triage, acuity, absence and appointment data.

The daily outputs distinguish held reserve, expected requests, completed encounters, unused reserve and excess. Extra paid visits consume both reserve minutes and reserved encounter limits; they are additional encounters, not the same urgent requests billed twice. Owner escalation defaults to 0 because no commitment is agreed. Entered escalation is tested on the request day, with no off-day shifting.

Whether short-notice encounters are included or subject to the existing $60 short/$100 long extra-visit prices is unresolved. Base short-notice revenue is $0; additional paid-visit volume is also 0. No unlimited included care, new fee or response guarantee is invented. The preserved 24-business-hour field is a discussion target, not a capacity rule. Refund and final membership contract terms, bonus payout/true-up and reserve gates remain unresolved.

## Reconciled annual economics

Prices $250/$350; 25%/75% tier mix; 20% annual discount; 50% annual take-up. Net earned dues $292.50/member/month. Owner salary $180,000; associates $150,000 each; 20% employer burden; existing local expenses and platform fee retained. Base costs including provisional $60,000 coverage allowances: $906,000. None are quotes or agreed compensation.

| Basis | Modeled members | Revenue | Expenses incl. bonus | Surplus |
|---|---:|---:|---:|---:|
| R07 published | 360 | $1,263,600 | $977,520 | $286,080 |
| R08 review | 247 | $866,970 | $906,000 | -$39,030 |
| R09 review, 100% attendance | 345 | $1,210,950 | $966,990 | $243,960 |

R09 margin is 20.15%. Break-even 259 members; 15% margin requires 318. The 20% employer-cost pool is $60,990: $50,825 gross bonuses plus $10,165 burden. Gross bonus per associate $25,412.50; total cash compensation $175,412.50. Full quality award and zero hurdle remain illustrative. Bonus basis excludes ancillary and extra-visit revenue; awards currently do not wait for cumulative losses to recover.

| Sensitivity | Modeled members | Annual surplus |
|---|---:|---:|
| Downside: 250, 100% annual prepay | 250 | -$126,000 |
| Base: 100% attendance, 50% annual prepay | 345 | $243,960 |
| Upside: 70% attendance, 360 paid members | 360 | $286,080 |
| 40% owner / 30% A / 30% B demand | 143 | -$404,070 |
| Base with all annual prepay | 345 | $136,320 |
| Base with $200,000 associate salaries | 345 | $147,960 |

Optional junior: 360 modeled members, $142,080 surplus before incremental rooms/support. It adds a separate proposed panel, not consent to reassign existing members. The same base remains economically stronger at these requested enrollments.

## Launch and cash

Owner/A/B start months 2/5/11. Applicants: 30 opening, 25/month later, under the same fixed panel preferences. At opening only 5 join the owner's panel; 25 wait for their assigned associates. Separate role ledgers retain members under attrition. New admissions need both routine/onboarding capacity and team reserve. Departures do not transfer patients; unmet retained obligations make constrained earned revenue and cash incomplete.

Expected fractional launch panels are capped at whole-person mature limits. The mature stress selector never disables launch assignment protections. Ending expected members 345; sustained monthly operating break-even month 12; cumulative operating-loss recovery month 32; total 36-month operating result $99,532.87. The waitlist has no abandonment and is not traction.

Annual dues arrive at joining and 12-month renewal; earned revenue is recognized monthly; cancellations refund unused prepaid months. Each launch row reconciles receipts minus revenue to the change in deferred dues. Funding/financing and opening cash never enter operating surplus. Startup costs, opening cash and reserve remain unknown, so complete funding requirements and investment recovery remain incomplete.

## Preservation

Model/schema v9 dispatches unmodified prior worksheets to their historical engines. V8 source and its snapshot/PDF-content source remain unchanged. Storage keys v9 read earlier keys without overwriting them. Explicit Start R09 retains the active worksheet, names, notes, custom rows and feedback. JSON round trips preserve all earlier worksheets; CSV/readable exports include panel allocation, daily access and monthly assigned ledgers. Unknown/damaged storage remains protected.

## Verification and limits

- Production build, unlisted/noindex release guards, 94 model tests, 6 DPC UI tests, 11 existing Buildmine/model-renderer tests, and 20 repository tests pass (131 total).
- New tests cover exact roster/off days, integer panel limits, uneven preferences, routine-only assigned days, team cross-coverage, reserve separation, 70/100% attendance, excess requests, leave/mentoring, onboarding/staffing transitions, no reassignment, bonuses, cash/deferred reconciliation, legacy import and explicit migration.
- Standalone production-markup preview initializes at 345 / $243,960; 100% annual-prepay input recalculates to $136,320. Three panels, seven access days and 108 launch-panel rows render in DOM.
- Both PDF aliases are byte-identical, use the same reference snapshot, have 20 pages and no text-fit errors. All pages rendered and visually inspected; final changed comparison slide re-inspected.
- Mobile/desktop candidate pixel inspection is unverified: no installed Chromium, and browser download returned invalid/truncated archives. DOM checks and responsive source inspection are not pixel or physical-device tests. Tables have contained horizontal scrolling; allocation inputs use full-width controls.
- No production deployment, merge or external message. Review is draft PR #56; publish only after approval.
