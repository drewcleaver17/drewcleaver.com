# DPC R07 review candidate — September 28, 2026

Status: prepared for review, not published. GitHub Pages publication remains a separate merge to main. Scope is the DPC page, calculator, linked PDFs and supporting source/tests only.

## Baseline and decision provenance

Inspected main at `eba45af2ae8031d296e72f9da08d51ac290303fb`, the live `/dpc/` response, R06 model/source and both live PDF paths. Both live PDFs matched the repository's R06 deck, SHA-256 `95957411d57880fdd616be88e52912c88393a58d765de8f1761bff86e37b222b`.

Retained the latest implemented $250 Core / $350 Extended pricing, 25/45-minute bookings, 20% annual discount, $150,000 associate bases, balanced two-associate roster, $180,000 owner compensation and $60,000 provisional additional coverage budget. The present request explicitly makes the balanced roster the base; the older consecutive roster is a sensitivity, not an instruction to replace it.

The prior owner-day source (`METSI-Care-Growth-Concept-v2.pptx`, slide 5) distinguishes six scheduled visits from a separate urgent hold: Tuesday–Thursday 10–1 visits, 1–2 lunch, 2–5 visits, 5–6 urgent, 6–7 messages. R06 instead implemented 9–6 and six **total** encounters less one urgent reserve, leaving five routine visits while narrative still said six. R07 restores the earlier six-slot cadence and 10–7 availability. Its explicitly labeled total ceiling is seven, including the held urgent encounter. This is a planning reconciliation, not any physician's commitment. Earlier supplied materials remain historical; no practice affiliation was restored.

$150,000 base plus a performance component and annual discount are supported by Drew's recent decisions. The **20% employer-cost pool, $0 profit hurdle, equal bonus allocation and fully earned quality award** are retained implementation assumptions, not agreed compensation. Awards currently accrue/pay monthly on earned profit, without a startup-loss-recovery or cash-reserve gate. Those terms remain unresolved.

## Corrected mature reference

All amounts USD. 360 members; 25% Core / 75% Extended; 50% annual prepay take-up; 70% completed routine attendance; 1% monthly attrition; 45-minute separate onboarding; 5 urgent encounters per 100 members/month; no no-shows; 0% routine scheduling flexibility. Weekdays carry twice weekend demand weight. 46 working weeks per physician. An 85% load target applies to each modeled weekday resource.

| Annual economics | Amount |
|---|---:|
| List dues, blended per member/month | $325.00 |
| Earned dues after annual discounts, per member/month | $292.50 |
| Membership earned revenue | $1,263,600 |
| Owner + two associate base salaries | $480,000 |
| Employer burden on base salaries, 20% | $96,000 |
| Local support | $90,000 |
| Occupancy/utilities | $60,000 |
| Technology/supplies | $18,000 |
| Marketing | $18,000 |
| Other administration/insurance | $24,000 |
| Shared support fee | $60,000 |
| Additional coverage allowances | $60,000 |
| Costs before bonus pool | $906,000 |
| Eligible earned operating surplus | $357,600 |
| Bonus pool, including employer burden | $71,520 |
| Gross bonuses / bonus employer burden | $59,600 / $11,920 |
| Total operating costs | $977,520 |
| Retained operating surplus | **$286,080 (22.64%)** |

Each associate: $150,000 base + $29,800 gross bonus = $179,800 cash compensation. Owner pay is already expensed. Surplus is before depreciation, interest, tax, startup investment and distributions. Extra visits and ancillary revenue default to zero and do not enter the bonus revenue basis; no clinical offering was added.

The $60,000 increment is $30,000 support, $20,000 leave relief, $5,000 recruiting and $5,000 extended operations. These are planning allowances, not quotes. Relief expense does not schedule substitute capacity. Blank costs remain unknown and prevent a complete surplus.

## Availability and capacity

| Role | Days | Availability | Routine capacity at reference mix |
|---|---|---|---:|
| Owner | Tue/Wed/Thu | 10–7 | 6/day; 69/month |
| Associate A | Sun/Mon/Tue/Wed/Fri | 9–9 | 9/day; 172.5/month |
| Associate B | Mon/Tue/Thu/Fri/Sat | 9–9 | 9/day; 172.5/month |

Associates finish routine visits by 6, with one hour each for lunch, messages and urgent reserve. Six routine hours / 40-minute blended block = nine routine slots. Twelve is the total encounter ceiling, not appointment inventory. Owner urgent/admin outside the booking window are explicit and counted once.

- Annual availability: 6,762 physician-hours; annual effective routine capacity: 3,312 hours.
- Routine inventory: **414/month**, before onboarding and other demand, versus R06's 402.5.
- Included routine bookings at 360 members: 252/month; replacement onboarding: 3.6/month; urgent encounters: 18/month.
- Highest weekday physical load: **74.22%**; this is **87.31% of the 85% access target**, not a pooled monthly attendance percentage.
- Panel limit: **412**, versus R06's 384. This is an arithmetic ceiling, not validated demand or clinical safety.
- Six weeks of leave per physician are averaged, not scheduled. Weekend sole-provider absence and owner off-day escalation remain unresolved.

## Prepayment and optional staffing

| Annual-prepay share | Earned revenue/year | Bonus/associate | Retained surplus |
|---|---:|---:|---:|
| 0% | $1,404,000 | $41,500 | $398,400 |
| 50% base | $1,263,600 | $29,800 | $286,080 |
| 100% | $1,123,200 | $18,100 | $173,760 |

Annual Core payment is $2,400; Extended is $3,360. Cash is received on joining/renewal, earned monthly, and unused months are refunded on modeled attrition. At opening, 30 members with 50% annual payment produce $51,675 receipts, $8,775 earned revenue and $42,900 deferred dues. Across the launch, prior deferred dues + net receipts − earned revenue = ending deferred dues.

Optional Fri–Mon junior: $150,000 base + $30,000 employer cost; total practice panel limit 494. At unchanged 360 members, retained surplus falls to $142,080. Filling 494 generates $518,352 surplus **before any incremental room/support costs**, held fixed in this sensitivity. The consecutive Sun–Thu/Tue–Sat two-associate schedule admits only 247 under these weights; its reported −$39,030 result is explicitly labeled at 247 modeled / 360 requested members.

## Launch and limits

36 months; opens month 2; physician starts 2/5/11; 30 opening applicants and 25 later applicants/month; no waitlist abandonment. Before full staffing, access is limited to staffed days. Capacity is constrained, and waitlisted applicants create no revenue.

The base includes coverage allowances and bonuses: $278,783 cumulative operating result at month 36; sustained monthly operating break-even month 12; accumulated operating-loss recovery month 25. Startup expense, opening cash and target reserve are unspecified. Complete funding need and investment recovery are therefore unknown. The narrative/PDF no longer substitute a zero-coverage-cost launch for this base.

## Corrections and compatibility

- New schema/model v7 adds explicit outside-booking-window admin and restored owner defaults. New draft/save keys preserve v6 storage.
- R06 imports retain prices, schedules, bonus terms, stages, notes and all earlier financial results for valid schedules. Newly explicit outside admin is zero for earlier records; only starting the revised proposal adopts new defaults.
- An active physician appointment that exceeds its calendar block, or has unknown physician time, now makes capacity incomplete instead of retaining a misleading feasible revenue forecast.
- Utilization labels identify the highest weekday physical load. Constrained scenario tables disclose actual revenue-bearing membership.
- Responsive sensitivity cells retain labels when table headers hide on narrow layouts.
- The page and both byte-identical PDF download paths use the same R07 model snapshot. PDF metadata now identifies the correct engine instead of v5.

## Verification and release boundary

Passed: 81 model tests, 4 DPC production-markup UI tests, 11 existing build/renderer tests and 20 existing repository tests (116 total), plus release guards. Targeted independent arithmetic, owner window/cap, optional junior, missing expense, old-file migration, prepayment/renewal/refund and invalid duration tests accompany the existing suite. A standalone HTML preview also initialized and recalculated the 100% annual-prepay surplus to $173,760 under JSDOM; this is behavior evidence, not pixel-layout evidence. Production-markup UI tests cover edits, zero/blank values, stages, custom rows, imports/exports, local saving, storage failures and preserved older worksheets. Build checks protect noindex, sitemap/navigation exclusions, forwarding and identical PDF aliases.

All 20 PDF slides rendered and visually inspected; searchable text and 11 clickable annotations retained; generator reported zero text-fit errors. Automated exact-viewport visual checks at 320/390/768/1440 were **not completed**: the cloud browser blocked the internal preview. Responsive source and DOM behavior were checked, but they do not prove visual layout. Review the standalone preview on phone/desktop before publication. No clinician, recipient or external form was contacted. No production deployment was performed.
