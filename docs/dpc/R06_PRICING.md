# R06 — trial pricing, compensation and readable coverage

Drew requested live refinement of the existing model: Core/Extended prices of $250/$350 monthly, a 20% annual upfront discount, $150,000 base salary per associate plus a proposed performance component, and review of two mobile screenshots. Publication authorization continues from the executed implementation prompt and this requested revision.

## Reference changes

- Annual prices are $2,400/$3,360, equivalent to $200/$280 monthly. The annual-payment adoption share remains independently editable, default 0%; a discount offer does not establish adoption. The narrative compares 0%, 50% and 100% adoption.
- Owner base pay remains illustrative $180,000. Associate base salaries become $150,000 each. Availability, booking windows, care workload and the 325-member daily capacity limit are unchanged.
- Each associate has an illustrative 10% share of eligible positive practice operating surplus **allocated to total bonus cost**, including employer burden. Owner share defaults to zero. This is a proposed compensation budget, not an equity percentage, guarantee, market benchmark or signed offer.
- All operating costs and base compensation are deducted first. An editable retained-profit hurdle is subtracted before allocation; it is not an extra expense or cash reserve. Gross bonus equals allocated cost divided by one plus the employment-burden rate. Shares are independent per role and stage; total active shares above 100% invalidate affected results.
- Launch bonuses first recover accumulated operating losses, then expense/pay qualified bonuses monthly. Startup-investment recovery is separate. The model does not certify quality, employment/legal terms, cash reserves or actual payout qualification.
- Potential qualification criteria: appropriate care, agreed response/access service, continuity, retention and mentoring. No per-lab, prescription, peptide or referral commission is modeled. Additional services require patient need, evidence, transparent pricing, explicit delivery costs and workload. Existing custom financial rows remain available; unspecified ancillary revenue is not invented.

## Economics

At 325 members, 75% Extended mix and monthly billing, annual dues are $1,267,500. Entered base costs are $846,000, leaving $421,500 **before four unknown coverage increments and bonuses**. Full bonus and operating results remain incomplete until those amounts are supplied.

For sensitivity only, setting all four coverage increments to zero yields $84,300 total bonus cost ($70,250 gross pay plus $14,050 employer costs), $337,200 operating surplus, and $185,125 total cash compensation per associate. With all members paying annually, revenue is $1,014,000, surplus after bonuses is $134,400, and each associate receives $164,000 total cash pay. Neither illustration proves willingness to pay or recruiting feasibility for the proposed availability schedule.

The zero-added-cost, monthly-billing launch diagnostic reaches sustained monthly operating break-even in month 12 and cumulative operating-loss recovery in month 20. Its 36-month operating result is $469,970.98 after bonuses, before unknown startup spending, financing and taxes. It is not a full funding estimate.

Combined practice/platform results cancel internal fees. If a fee change affects bonuses, combined results move by that external compensation change, not by counting the fee twice.

## Screenshot correction

The mobile screenshots showed ivory text on ivory alternating rows inside a green section. The weekly roster now uses a compact two-column table at all widths, with explicit green backgrounds and ivory text. Alternating green rows have contrast above 7:1. Other tables inside green sections receive the same contrast correction. This also eliminates the tall stacked day/physician cards that obscured the weekly pattern.

## Preservation and evidence

Model `dpc-2026-09-v5`, schema 5, page/PDF R06. R05's engine and staffing definitions remain reproducible in versioned modules. Validated R05 imports retain all inputs, stages, custom rows, names and feedback, with new bonus shares/hurdle initialized to zero. Mature and launch outputs reconcile with R05; no saved salary or price is overwritten. The explicit “Start revised trial defaults” action retains the current worksheet before opening new defaults. Earlier formats still follow their preserved calculation mode. Browser keys move to v5 with untouched v4/v3/v2/v1 fallbacks.

The revised reference snapshot, dated PDF and page are generated together. All 18 PDF pages are rendered and visually inspected. Tests cover price/discount adoption, bonus/payroll reconciliation, losses and unknown inputs, share limits, stage/departure changes, launch cash and loss recovery, target margins, transfer elimination, saved-data migration, round trips and the contrast fix. The managed browser still times out; source/DOM/contrast checks do not establish physical-device layout testing. Deployment evidence is recorded in the release PR.
