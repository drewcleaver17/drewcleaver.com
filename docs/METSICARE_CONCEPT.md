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
