# R08 review: consecutive associate schedules

Prepared September 29, 2026. Not published; R07 remains live. The user's explicit schedule supersedes R07's nonconsecutive default. All three physicians intentionally overlap Tuesday–Thursday for collaboration and development. No teaching hours or physician commitments are invented.

| Day | Owner | A | B | Onsite total |
|---|---|---|---|---:|
| Sunday | Off | On | Off | 1 |
| Monday | Off | On | Off | 1 |
| Tuesday | On | On | On | 3 |
| Wednesday | On | On | On | 3 |
| Thursday | On | On | On | 3 |
| Friday | Off | Off | On | 1 |
| Saturday | Off | Off | On | 1 |

A works Sunday–Thursday, Friday/Saturday off. B works Tuesday–Saturday, Sunday/Monday off. Onsite days do not imply twelve onsite hours. Associate routine window remains 9–6 with one hour each for breaks, admin and urgent reserve; outer 9–9 response terms remain unagreed. Days off carry no assumed on-call duty. Owner retains the 10–7 day, six routine visits and separate urgent/messages time.

## Same assumptions; different distribution of capacity

| Measure | Published R07 | R08 candidate |
|---|---:|---:|
| Requested members | 360 | 360 |
| Routine slots/month | 414 | 414 |
| Panel within access target | 412 | 247 |
| Members modeled for revenue | 360 | 247 |
| Earned revenue/year | $1,263,600 | $866,970 |
| Expenses including bonus/year | $977,520 | $906,000 |
| Gross bonus per associate | $29,800 | $0 |
| Annual operating surplus | $286,080 | -$39,030 |
| 36-month operating result | $278,783 | -$336,951 |
| Monthly break-even | Month 12 | Not reached |
| Cumulative operating-loss recovery | Month 25 | Not reached |

Monday and Friday bind: each has one physician and the unchanged weekday demand weight of two. At 247 members, peak physical load is 84.87%, or 99.85% of the selected 85% target. Tuesday–Thursday overlap cannot automatically service demand on other days. Mature membership is floored to whole people; launch rows remain fractional expected values (247.38 at month 36), an existing convention.

Preserved assumptions: $250/$350 dues; 25/45-minute blocks; 25%/75% tier and visit mix; 70% routine attendance; 1% monthly attrition; 45-minute onboarding; 5 urgent encounters per 100 members/month; 46 workweeks; weekday/weekend weights 2/1; 0% routine flexibility; 85% resource target. Owner base $180,000, associates $150,000 each, employer burden 20%, existing local/shared costs and $60,000 coverage allowances retained. Bonus rule unchanged: 20% of eligible positive surplus including employer burden, zero hurdle, full quality award assumed.

At 247 modeled members, annual-prepay shares of 0% / 50% / 100% produce earned revenue $963,300 / $866,970 / $770,640 and surplus $45,840 / -$39,030 / -$135,360. Upfront payments are earned monthly; unused prepaid months are refunded in the model. Opening-month base cash $51,675, earned revenue $8,775, deferred dues $42,900 remain unchanged. Funding needs remain incomplete without startup costs, opening cash and reserves.

Optional junior stays separate. It supports 494 members, modeling 360 requested and $142,080 surplus. At the same 247 members it produces -$219,030, before extra rooms/support. Optional 50%/100% routine flexibility supports 329/391 members; neither is applied to the base or assumed accepted by patients.

## Preservation and verification

Model/schema v8 preserves earlier worksheet inputs and results. New storage keys leave v7 drafts/copies untouched. Explicitly starting R08 retains the prior worksheet with its name, notes, feedback and schedules. Historical model tests stay pinned to v7; R08 has separate roster, economics, snapshot and migration tests, plus a browser-DOM test of loading v7 and explicitly starting v8.

Production build and release guards protect unlisted/noindex, PDF aliases, unrelated routes and disabled writing. PDF generated from reference-results-r08.json: 20 slides, 11 links, no text-fit errors; all slides inspected, with the revision slide shortened to avoid overlap. Exact mobile/desktop candidate browser visual inspection remains unverified: prior internal-preview access was blocked and the available browser exposes no viewport resize. Source checks and DOM tests do not prove pixel layout. No production deployment or external messages performed.

Validation: 84 model tests, 5 DPC UI tests, 11 existing build/renderer tests and 20 repository tests (120 total). Standalone preview initialized at 247 members / -$39,030, recalculated 100% annual-prepay surplus to -$135,360, and rendered the exact onsite totals in DOM.
