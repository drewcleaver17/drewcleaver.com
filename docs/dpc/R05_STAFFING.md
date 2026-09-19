# R05 — staffing, progression and daily constraints

This supersedes the R03/R04 reference numbers and calculation descriptions in `docs/DPC_CONCEPT.md`; those records remain historical. Publication is explicitly authorized by Drew's executed staffing revision prompt.

## Operating basis

One owner (illustratively Monday/Wednesday/Friday), Associate A Sunday–Thursday and Associate B Tuesday–Saturday. Associates have a 9–21 outer availability window, an illustrative 9–18 routine window and a ceiling of 12 total encounters, including urgent/onboarding/repeated encounters. The owner's ceiling is separately six. Each role has 46 working weeks, independently entered compensation, protected time, appointment-block multipliers and future stages. Onsite/remote terms, leave coverage and off-day escalation remain unresolved.

All active inputs are openly visible in one editable column. Sixteen earlier shared schedule/pay inputs are replaced by role inputs in the new model, but retained with their original meanings in stored values and exports. They reappear when an earlier worksheet is opened. No accordion or advanced-input hiding is added.

## Capacity and economics

- Weekly demand weights are 1/2/2/2/2/2/1 (Sunday first), an editable hypothesis. Daily constraints—not only the monthly sum—limit membership.
- Six routine hours remain per associate day after the illustrative break, messages and urgent reserve. Twelve one-hour appointments do not fit. Actual urgent/escalation work consumes the protected pool once. Availability, bookable capacity, modeled active work and salary are separate.
- Core/Extended appointment multipliers independently alter each role's capacity. Work is pooled in proportion to capacity; patient acceptance of team cross-coverage is unvalidated. No-shows consume unreclaimed routine bookings.
- The reference adds a 60-minute onboarding encounter beyond ongoing attendance; set it to zero if the attendance figure already includes onboarding. Urgent use is separately five encounters per 100 members monthly. Replacement enrollment from 1% attrition also consumes onboarding capacity in the mature snapshot.
- Annual availability rises to 6,762 hours; monthly routine capacity is 320.357 weighted visits. The selected daily access target supports 325 whole mature members, versus 360 requested. Earned revenue is $1,072,500 and entered base costs are $1,110,000: a $37,500 shortfall **before** four unknown incremental coverage costs.
- Evening/weekend support, relief, recurring recruiting/development and extended-hours operating costs remain blank. Full cost, profit and funding outputs therefore remain incomplete. The old $78,000 surplus at 360 members is shown only as an explicit unconstrained sensitivity.
- Illustrative alternatives: 7 p.m. associate routine cutoff supports 357; shared 30-minute blocks (25 physician minutes) support 434; equal daily demand supports 219. These are sensitivities, not recommended care standards.

## Launch and progression

The 36-month forecast retains opening in month 2 and associate starts in months 5/11. It admits applicants only within daily access targets, includes onboarding, and accumulates an explicit waitlist with no modeled abandonment. Initial admission is 26.521 expected members rather than all 30 applicants. Limited launch access redistributes demand to staffed days; selecting seven-day access prevents enrollment until coverage exists. Existing members are never automatically transferred after capacity loss; physically undeliverable care makes constrained revenue/cash incomplete. Stress mode is explicitly labeled.

Annual prepayments, refunds, deferred dues, startup spending once, independent financing and reserve targets retain distinct definitions. Monthly operating break-even, cumulative operating-loss recovery and investment cash recovery are separate. A diagnostic setting only the four new coverage costs to zero loses $496,299.93 over 36 months before startup spending; it is not a funding estimate. Full funding requires the missing costs, startup budget and available cash.

Each role can have dated stages changing weekdays, booking/protected time and pay. A two-hour daily management block for Associate A from month 24 reduces the mature target to 251 if other assumptions remain unchanged. Add a paid replacement/relief role, its limited ramp and trainer time explicitly. Overlap above three physicians is flagged. Departure removes capacity/pay here; there is no second-location simulator or implicit patient transfer. Readiness gates remain human judgments about demand, retention, clinical/operating capability, sustained cash, financing and continuity.

## Saved work and artifacts

Schema 4 / model `dpc-2026-09-v4` uses `dpc:worksheet:v4:draft` and `dpc:worksheet:v4:saves`. All v1/v2/v3 files migrate through validated earlier parsers into `legacy-v3` mode. `src/lib/dpc-worksheet-v3.mjs` preserves the exact earlier calculation engine. Old local keys are untouched. Names, raw values, notes, feedback, custom rows and retained comparison worksheets survive. Starting a revised proposal retains the active earlier worksheet. Imports ignore supplied results and recalculate. JSON/CSV/readable exports include all retained worksheets and new roster/stage inputs. Nothing is automatically sent.

`scripts/export-dpc-reference.mjs` produces `docs/dpc/reference-results-r05.json`; the PDF builder and page consume that shared snapshot. The 18-slide PDF is a fixed reference, distinct from editable browser data. The neutral and historic download paths serve identical bytes.

`src/data/dpc-revisions.json` records page R05 separately from model v4, schema 4 and PDF DPC-R05. R01–R04 were verified against successful Pages runs. The current timestamp is frozen when content is finalized, not the visitor's clock or a claim of deployment time. America/Chicago formatting correctly selects CDT/CST and includes the offset. Successful publication evidence belongs in the PR/workflow record linked by R05.

## Verification and limits

The model suite covers roster days, independent caps/pay/blocks, protected time, invalid cutoffs, urgent escalation, weekday constraints, unknown/zero inputs, onboarding, attrition, staged leadership/departures/replacements, constrained vs stress revenue, cash reconciliation, prepayments/refunds, platform transfer elimination, migration and exchange. Production-markup UI tests cover open inputs, edits, custom rows, saves, retained worksheets, stage controls and export/import. Revision tests cover winter/summer and UTC date boundaries, and source/snapshot reconciliation.

Every PDF slide is rendered and visually inspected. Browser findings and deployment results are recorded in the release PR; automated DOM/source checks alone do not establish physical-device usability or clinical safety. Working-week averaging does not guarantee daily leave coverage. Intra-month liquidity, taxes, actual recruiting/patient demand and second-location costs remain outside the forecast.
