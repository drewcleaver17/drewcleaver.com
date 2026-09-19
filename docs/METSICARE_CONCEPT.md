# METSI Care concept page

Drew requested a consulting-style PDF deck, followed by a mobile-first single-scroll adaptation at `/metsicare`, unlinked from the homepage and navigation. This is an independent proposal, not an approved clinical offering or franchise solicitation.

## Content and source boundaries

- Based on Drew's proposed memberships, schedule, small physician-owned locations and associate-to-owner pathway.
- The published METSI plans already use $200/$300 prices but have different benefits. The concept explicitly distinguishes them.
- All operating figures are planning assumptions. No actual patient census, retention, practice costs, or acquisition metrics were supplied.
- Excludes Drew's personal care arrangements and private commentary about the physician.
- Local costs total $1.110m/year including owner compensation and $60k platform fees. 360 members at $275/month generate $1.188m/year and $78k operating surplus.
- Six visits/day × 13 clinician-days/week × 46 weeks/year ÷ 12 = 299 routine visits/month. At 70% attendance, 360 members use 252 visits.
- Annual prepay sensitivity, recruitment standards, clinical safeguards and professional legal review remain explicit.

## Delivery

- PDF: `/metsicare-deck.pdf`, 16 slides with clickable primary sources.
- Page: `src/pages/metsicare.astro`, continuous HTML and responsive tables rather than embedded slide images.
- Shared Base layout with `compact noindex`, no analytics initialization, no sitemap inclusion, no inbound links.
- Unlisted means publicly reachable by direct URL. It is not authentication or confidentiality.
- No forms, patient data, external outreach, paid services or DNS changes.

## Release verification

Run `npm run build`, then inspect `/metsicare/` at 320, 390, 768 and 1440px. Verify no horizontal overflow, the expandable cost assumptions, PDF download, source links, noindex/nofollow and absent inbound links. Verify deployment and PDF bytes separately after release. Simulated browser widths are not physical-device testing.

Build and unlisted-route checks passed. The recovered deck was checked across all 16 slides. The PDF was re-exported with searchable vector text to preserve clarity while reducing the download size. The cloud browser cannot open the local preview; live browser verification follows publication. Physical-device verification is not claimed.

## Interactive comparison (September 2026 revision)

The page and deck now use the website's forest green and ivory palette. The original narrative and PDF remain the reference proposal. The working model above the narrative provides a fixed reference alongside two independently editable scenarios, initially named Garrick’s inputs and Proposed scenario. Both begin as reference assumptions; no actual practice data is implied.

- 56 inputs per scenario cover pricing, membership, attendance, extra visits, appointment blocks, protected time, physician schedules and compensation, local costs, startup capital, platform costs and decision targets.
- Capacity respects both the daily visit cap and available hours. Extra visits consume the same appointment capacity. Annual salaries do not automatically prorate with hours.
- Break-even and margin targets round enrollment up; the utilization target rounds the enrollment limit down. The model flags conflicts between financial targets and appointment capacity.
- Startup and platform costs default to blank. Dependent results remain unavailable until supplied. Combined practice/platform surplus eliminates the internal service-fee transfer.
- Inputs autosave locally in this browser/device, with up to 20 named comparisons. There is no server storage or automatic transmission.
- JSON review files carry both scenarios, reference values, recalculated results, sources/notes and feedback. Import validates the version and all inputs before replacing the open comparison. CSV and plain-text exports support review; Email Drew opens an email draft with instructions to attach the JSON file.
- No patient information should be entered. The page remains public by direct URL and unlisted; it is not a secure practice-data portal.

The calculation module is `src/lib/metsi-model.mjs`; the component and client controller are `src/components/MetsiModel.astro` and `src/scripts/metsi-calculator.js`. Run `node --test tests/metsi-model.test.mjs` for arithmetic, boundary, transfer-elimination and exchange-format checks. DOM interaction verification covered independent edits, incomplete input, local reload, named copies, all download formats, Unicode feedback, malformed and valid import, recalculation, reset/copy and storage failure. The matching PDF retains all 16 slides and six source links.
