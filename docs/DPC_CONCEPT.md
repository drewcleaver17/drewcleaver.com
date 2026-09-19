# Independent DPC concept — September 19, 2026

The single-worksheet revision below supersedes the original comparison UI and schema notes. The narrative, 70 default values and dated PDF remain the same.

Drew explicitly authorized implementation and live publication at `/dpc/`. This supersedes the affiliated framing of `/metsicare/`. It is a discussion proposal by Drew, not a company launch, investment offering, named physician's participation, or a finalized ownership arrangement.

## Assets and continuity

- `/dpc/`: canonical, unlisted, noindex/nofollow, no analytics initialization, no homepage/navigation/sitemap link.
- `/metsicare/`: forwarding HTML with canonical, JavaScript preserving query/hash, a two-second meta refresh and a visible fallback link.
- `/dpc-deck.pdf`: 18-slide reference dated September 19, 2026. The former PDF path serves identical revised bytes. Browser edits do not revise the PDF.
- `src/lib/metsi-model.mjs`: retained as the original-format validator. Historical narrative/PDF versions remain in git history.
- `src/lib/dpc-model.mjs`: all 56 original reference values plus 14 launch inputs. `src/lib/dpc-launch.mjs` contains the cohort/cash model.
- `docs/dpc/reference-results.json`: the numeric snapshot used by `scripts/build-dpc-deck.py`. Update the snapshot and regenerate/inspect the PDF together when revising the reference.

## Material changes and business implications

The independent framing removes practice branding and any implication of a named physician's endorsement. Founder roles, equity, compensation, partnerships and ownership financing remain open. Practice cash flow and support-company earnings are separate potential return mechanisms; no investor multiple, exit or venture readiness is claimed.

Original numbers remain visible as an explicit reference, not as endorsed recommendations. The reference produces $78,000 annual operating surplus (6.6%), but 396 members are required for a 15% margin while only 363 fit the selected 85% access target. The 20% prepayment discount further weakens earned revenue. Premium pricing, service scope, staffing and fees need joint validation.

The new reference opens in month 2, enrolls 30 members initially, adds up to 25 each following month after 1% monthly attrition, and targets 360 members. Owner pay starts in month 2, associates in months 5 and 11, and full local costs/platform fees in month 1. Sustained monthly operating break-even begins in month 16. Peak operating cash deficit is $295,940.67 in month 15 before startup spending; cumulative operating result remains negative $161,036.26 at month 36. Full funding requirements remain incomplete because startup costs and opening cash are unknown.

## Calculation definitions

- Annual compensation is independent of hours. Calendar weeks are averaged across months. Hiring starts full monthly compensation; capacity starts only when open and the physician is active.
- Later enrollment follows attrition and is limited by the mature membership target. Capacity violations are flagged without silently reducing demand or claiming care can be delivered.
- Annual members pay on joining and every twelfth month. Revenue is earned monthly. Departing annual members receive all unused dues at the next monthly boundary. Net receipts less earned revenue reconcile to deferred dues.
- Startup capital is spent once; opening cash and the financing draw are funding sources. The working-capital reserve is a target balance, not an expense or duplicated source.
- Gross funding need excludes opening cash, financing and reserve. Additional funding reflects the worst month-end balance after entered sources. Reserve top-up is an alternative total gap to maintain that buffer, not an amount to add again to additional funding.
- Operating break-even and cumulative cash recovery must remain nonnegative through the remaining horizon. Recovery excludes opening cash/financing and includes startup and entered debt payments. Prepayment can advance recovery while leaving service/refund obligations.
- Network figures multiply equally mature practices. Combined surplus eliminates service-fee transfers. Platform profit remains unknown until both fixed and per-location support costs are supplied.
- Monthly aggregation does not prove daily liquidity or clinically safe care. Taxes, distributions, replacement equipment, inflation and unentered working-capital changes are excluded. Debt payments are entered cash amounts; loan amortization is not inferred.

## Saved-data compatibility

Schema 2 / model `dpc-2026-09-v2` uses `dpc:model:v2:draft` and `dpc:model:v2:saves`. If absent, the controller reads legacy `metsi:model:v1` keys, validates their original schema and explicitly migrates. Legacy keys are untouched. All 56 values, custom names, reporting periods, sources and feedback survive. Fourteen launch defaults are disclosed; launch basis remains “Reference assumptions” even if the mature figures were labeled actuals.

Exports are recomputed from validated inputs; imported derived results are ignored. New files use neutral names. JSON round-trips the editable state; CSV and text include monthly rows. No automatic transmission, backend or account exists. The mailto action opens a draft and tells the reviewer to attach the review file. Patient information is excluded from the intended workflow.

Unreadable drafts pause autosave; unreadable named-copy collections remain untouched. Invalid imports do not replace the open state. Copy/reset actions preserve user-entered scenario names. Browser storage is device/browser local and is not a durable backup; export for exchange and retention.

## Verification

`node --test tests/dpc-model.test.mjs tests/metsi-model.test.mjs`: 27 passing tests cover independent mature reconciliation, capacity, ramp/attrition, hires, renewal/refund timing, deferred revenue, funding, zero/missing values, transfer elimination, strict migration, export round trips and CSV safety.

An isolated JSDOM exercise using production HTML passed all 140 editable inputs, independent columns, invalid-input handling, autosave/reload, named comparisons, preserved legacy keys, custom-name preservation, migration notices, monthly tables/charts, JSON/CSV/text export, import failure/recalculation, Unicode/markup feedback, and storage-failure fallbacks. No external message was sent.

The 18 PDF slides were rendered and visually inspected, with searchable text on every page and six clickable links. The PDF is approximately 94 KB. Production build and release checks pass. Responsive source uses stacking tables/cards, wrapping actions and contained monthly-table scrolling. Exact mobile viewport and physical-device checks must not be inferred from source inspection; record live browser findings after deployment.

Rollback: revert this feature's publication commit and use the existing GitHub Pages workflow. Do not alter DNS, deployment infrastructure or unrelated site changes.


## Single-worksheet revision

Drew requested one editable value per assumption, all sections openly visible, zero or blank in every numeric input, and addable rows for missing categories and optional values. The page contains no collapsed or collapsible narrative/model sections. All 70 inputs and all calculated results remain present. This change does not turn the earlier scheduling discussion into new default staffing assumptions.

Schema 3 / model `dpc-2026-09-v3` stores one active worksheet and an array of preserved earlier worksheets. When loading a v1/v2 comparison, the first column opens and the second is retained with a visible explanation and an “Earlier inputs” selector. Switching swaps them without discarding edits. Every original label, value, reporting period, source note and shared feedback is preserved. Named copies migrate too. Earlier storage keys remain untouched. New keys are `dpc:worksheet:v3:draft` and `dpc:worksheet:v3:saves`.

Every numeric assumption accepts null and zero. Missing operands produce incomplete dependent results, while unrelated known results still calculate. A blank payroll expense leaves revenue/capacity available but costs/surplus incomplete. Missing pilot fields do not invalidate practice economics. Zero appointment duration or timing values are preserved but cannot define a usable launch schedule. Incomplete worksheets can autosave, save named copies and export/import; out-of-range or malformed numeric values still pause saving until corrected.

Custom rows contain category, description, optional value, unit, calculation treatment and notes. The default treatment is reference-only. Financial treatments explicitly use USD and cover monthly/annual practice income/expense, once-only startup expense, and whole-network annual platform income/expense. Practice recurring expenses begin in the existing local-cost month, revenues at opening and startup expenses at the selected startup month. A blank financial value keeps affected results incomplete. Negative financial values are explicit reversing adjustments with a warning. Custom rows do not infer clinical capacity or internal fee transfers.

JSON includes the active and preserved worksheets, custom rows, all review text, recalculated results and model definitions. CSV/text include active and preserved inputs plus calculated monthly rows. Import validation is atomic and ignores supplied derived results. Unknown or damaged storage is never silently overwritten. No backend or automatic communication was added.

Validation: 42 model tests (including the original 27) and three production-markup UI tests pass. They cover every input individually set to zero and null, independent dependent-result propagation, custom revenue/cost timing, unknown custom values, startup counting, platform fee elimination, reference-only rows, migration and switching, round trips, custom-name/feedback preservation, malformed imports, storage failure, and CSV/HTML injection handling. Build now runs these checks alongside the existing Buildmine/release checks. The original PDF bytes are unchanged. Exact mobile viewport/device inspection remains limited by the managed browser's available controls; inspect live desktop behavior after publication.
