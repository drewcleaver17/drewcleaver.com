# R06: trial pricing, incentives and readable coverage

Requested changes: $250/$350 monthly targets, 20% annual upfront discount, $150,000 base salary per associate with performance upside, ethical optional-service economics, and repair of the supplied schedule screenshots.

## Model decisions

- Core $250/month or $2,400/year upfront; Extended $350/month or $3,360/year upfront. Annual equivalents are $200/$280, not monthly installment prices.
- Owner base stays $180,000. Two associate bases total $300,000. The existing employer-burden assumption remains 20%; all are editable hypotheses.
- Proposed total employer-cost profit-share pool: 20% × quality-earned percentage × max(0, earned membership revenue − all pre-bonus operating costs − retained-surplus hurdle). The pool includes employer costs on cash bonuses. Default hurdle $0; quality 100% is an assumed full award, not an observed performance claim.
- Extra-visit/custom ancillary revenue is excluded from the bonus basis; all costs remain deducted. No per-test, prescription or product commissions. Active associates and replacements split gross bonuses equally; owner and relief roles do not participate. Awarding does not depend on sales volume or assigned patient profitability.
- Mature results are annual. Launch accrues and pays monthly, divides the annual hurdle by 12, and uses earned revenue rather than upfront collections. Actual contract terms, annual true-up, recovery of launch losses and any liquidity gate remain unresolved.
- All four additional coverage cost inputs remain unknown. Final costs, incentive amounts and profit stay incomplete until those inputs are supplied. The page separately shows a zero-increment sensitivity, not a forecast.
- No ancillary income is assumed. Optional receipts/costs use separate custom rows and require explicit workload budgets. Peptide therapy is product-specific diligence, not an assumed revenue source.

## Reference sensitivity

325 members; 25% Core / 75% Extended; coverage increments set to zero solely for this sensitivity; full quality achievement. Base operating costs are $846,000/year.

| Annual-pay share | Earned revenue | Bonus per associate | Practice surplus after bonuses |
| --- | ---: | ---: | ---: |
| 0% | $1,267,500 | $35,125 | $337,200 |
| 50% | $1,140,750 | $24,562.50 | $235,800 |
| 100% | $1,014,000 | $14,000 | $134,400 |

The all-annual sensitivity needs 334 members for a 15% margin after bonuses, above the 325-member access target. The zero-increment 36-month illustration reaches sustained monthly operating break-even in month 12; startup funding remains incomplete.

## Preservation and presentation

- R05 engine and its 25 tests remain as historical regression coverage. Schema 5 imports schemas 1–4 without changing values, names, notes, custom rows or schedules. Imported R05 worksheets have no incentive policy and retain their results. Starting R06 explicitly keeps the old worksheet.
- Browser storage uses new v5 keys and reads v4/v3/v2/v1 fallbacks. Old browser keys are untouched.
- Read-only reference, editable worksheet, exports and 20-slide PDF share the R06 calculation snapshot. Old/new PDF paths are byte-identical.
- Weekly table is now Day/A/B/Owner with explicit On/Off cells, fixed readable colors, and compact mobile spacing. Three callouts distinguish routine appointments, response availability and total encounter ceiling. Scope is `/dpc/`; unlisted status is preserved.

## Verification

- Production build, 75 model checks, four DPC worksheet UI checks, existing Buildmine UI checks and release guards passed locally.
- New checks cover actual annual dues, gross versus loaded incentives, annual mix, target-member crossings, ethical ancillary exclusion, quality/hurdle/null inputs, monthly cash/deferred-revenue reconciliation and R05 preservation.
- All 20 PDF slides rendered and visually reviewed; no layout fit errors. The changed rounding slide was rendered again. Both PDF routes contain the same bytes.
- Exact responsive-browser viewport and physical iPhone checks remain unverified: local preview was inaccessible to the supported cloud browser, and public navigation timed out. DOM behavior and scoped contrast are checked separately; they are not represented as device testing.
- Publication is verified separately through the GitHub Pages workflow and live responses.
