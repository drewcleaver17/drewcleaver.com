# FKL parent landing page · R01 review demo

Status: published as an independent unlisted pilot demo. No ads, messages, live leads, CRM, payment flow or tracking integrations. Owner: Drew Cleaver. Source verification date: October 10, 2026.

## Customer problem and hypothesis

A parent arriving from an ad or text needs to understand the first experience, equipment requirements, suitability and next step before considering a season. The page leads with Testing & Coaching, then offers an official hub handoff and a clearly simulated inquiry. Hypothesis: making this first step and its logistics understandable increases appropriate next-step actions. This has not been measured.

## Implementation

- Standalone Astro route `/fkl/`; independent FKL styling, local fonts/images and explicit independent-demo ownership. Shared navigation/layout is untouched.
- `src/data/fkl.mjs`: maintainable region options, official destinations, age guidance and FAQ text. Hub links replace time-sensitive event inventory. No dates, prices or availability guarantees.
- `src/scripts/fkl-client.mjs`: safe DOM updates, advisory finder, accessible errors, local-only demo/reset, lifecycle clearing, vendor-neutral `fkl:funnel` CustomEvents. No contact values are serialized or transmitted.
- Demo controls start disabled in static HTML. They become active only after the canceling submit listener can run synchronously; fields have no submission names or action endpoint. No JavaScript means no inquiry submission. Sample details are reset on successful demonstration and page exit.
- `readCampaign`: separately validates four UTM fields (ASCII campaign tokens, maximum 80 characters, rejects invalid values). No forwarding to FKL or event payloads, no query persistence, no raw query collection. A development-only inspector shows sanitized campaign context separately from bounded event records.
- Noindex/nofollow; excluded from the allowlist-based sitemap and public navigation. Tests check all built pages for inbound links. The public repository and any future direct URL are not confidential or access-controlled.

## Source and asset ledger

All sources below were inspected on October 10, 2026. The official site is a client-rendered application; its current JS bundle and design-system CSS were inspected directly in addition to web retrieval. HTTP checks are in `link-checks.json`; HTTP 200 alone does not establish available inventory.

| Source | What it supports |
| --- | --- |
| https://fat-kartingleague.com/ | First Testing experience, ages 5–17, provided kit, introductory process. |
| https://fat-kartingleague.com/blog/what-to-expect-at-a-fat-karting-league-testing-day | Briefing, equipment, repeated sessions and coaching. The guide states four nine-minute sessions while homepage states 40 minutes: precise track time is deliberately omitted pending specific event confirmation. |
| https://fat-kartingleague.com/faq | Eligibility and arrive-and-drive context; official questions/contact guidance. |
| https://fat-kartingleague.com/hubs | Active hub identifiers and official finder destination. |
| https://fat-kartingleague.com/hubs/texas-usa | Texas hub; current application also identifies KartMoto, Cresson, and North Texas Karters, Denton. Venue names are examples, not a promise of Testing inventory there. |
| https://fat-kartingleague.com/privacy | Official privacy/terms destination; event terms remain event-specific. |
| https://fat-kartingleague.com/design-system/styles.css | Brand blue #0000ff, blue hover #1414c3, ink #141414, pale gray #f0f0f0, future rose #ff9191 and yellow #ffff00; Rapid ST heading and FAT Camera body typography. Only scoped styles were authored; official site's scripts were not copied. |
| https://fat-kartingleague.com/assets/index-DcIh5E9S.js | Current official asset references and hub route identifiers (texas-usa, midwest-usa, socal-usa, norcal-usa, uk, de). |

### Local assets

| File | Official source | Treatment |
| --- | --- | --- |
| `public/fkl/logo.png` | https://fat-kartingleague.com/assets/fkl-logo-B8gykFLe.png | Original 380×180 FKL logo; proportions preserved. |
| `public/fkl/hero.webp`, `hero-mobile.webp` | https://fat-kartingleague.com/assets/homepage-hero-wlc8i4t6.jpg | Genuine outdoor grid photograph; downsampled WebP, smaller mobile variant. |
| `public/fkl/arrival.webp` | https://fat-kartingleague.com/__l5e/assets-v1/888a3d9d-ac88-438c-82a3-9648518d0e58/testing-day-arrival.jpg | Genuine paddock photograph; downsampled WebP. |
| `public/fkl/RapidST_Bold.woff2` | https://fat-kartingleague.com/design-system/fonts/RapidST_Bold.woff2 | Official heading font served locally for this review. |
| `public/fkl/FATCamera-Regular.woff2` | https://fat-kartingleague.com/design-system/fonts/FATCamera-Regular.woff2 | Official body font served locally for this review. |
| `public/fkl/share.jpg` | Derived from the above official grid photo/logo | Original independent-demo share composition, 1200×630. |

Public availability is not a grant of production-use rights. Before a live acquisition test, obtain FKL approval for brand use, image use (including relevant participant releases), font redistribution/use and share art. The demo never asserts FKL approval, employment authority, endorsement or affiliation. No generated racing/child imagery.

## Verification and review

Run `npm test` and `npm run build`. The production build includes the seven FKL tests: query sanitization; CTA events; all region handoffs/fallback and advisory age guidance; invalid form focus/errors; completion reset/privacy; page-exit reset and production inspector absence; output metadata, assets, labels, IDs, anchors, no-script form and discovery restrictions. Existing site/model/worksheet checks remain in the build.

Review the actual built markup/CSS/client with:

```sh
node scripts/build-fkl-review.mjs /absolute/path/FKL-Pilot-Review.html
```

The portable HTML embeds all page images/fonts/CSS and the client module. Width selector: 320, 390, 768, 1440. Official links remain external. This is a concrete local review artifact, not a hosted preview or screenshot.

Browser-control capability is unavailable in this environment. Following the managed preview instructions, no preview server or alternate browser was installed or started. Thus actual pixel QA, screenshots, real keyboard/touch use and measured overflow at the four widths remain **unverified**. Source and DOM inspection are not substitutes for those checks. Static image assets were visually inspected.

No route content, saved worksheet engines, PDFs or revision records in Lab/DPC/ProofPath were changed. The deployed release includes current main with Lab R02; Lab content and publication records are preserved.

## Pilot measurement contract

Events contain only the event name and allowlisted placement or selected hub. Age, experience, contact values, URLs and arbitrary queries never enter payloads. `official_booking_handoff` measures an outbound intent, not a booking. No analytics provider or advertising pixel was added.

| Proposed measure | Definition / prerequisite |
| --- | --- |
| Landing-page-to-CTA rate | Unique sessions with primary CTA / eligible landing sessions; requires an approved privacy-conscious session/page-view denominator. No denominator is currently collected. |
| Official handoff rate | Unique sessions with a hub handoff / eligible landing sessions. |
| Inquiry start rate | Unique sessions starting a live inquiry / eligible landing sessions. Demo start events are simulated behavior only. |
| Inquiry completion rate | Accepted live inquiries / live inquiry starts. Demo completion does not count as a lead. |
| Qualified inquiries | Live inquiries satisfying a written, FKL-approved region/eligibility/contactability definition, reviewed by the responsible team. |
| Confirmed bookings | Official booking records connected through an approved attribution mechanism; never infer from outbound clicks. |

Agree sample size, campaign scope, budget, traffic mix, deduplication, attribution window, baseline and decision thresholds before testing. No claimed uplift or invented KPI targets.

## Before a live funnel

FKL supplies/approves: the offer and geography; exact event eligibility, inclusions, schedule and terms; brand/asset permission; official booking destinations; ownership of lead follow-up and service expectations; privacy notice, purpose and retention/deletion controls; security and abuse protection; approved CRM/API and failure behavior; marketing/phone consent text with separate, unselected choices where needed; approved analytics and booking attribution. Parent inquiry permission must not imply recurring marketing or SMS consent. Collect the minimum parent data; no child identity profile in this phase.

Drew approved publication of this independent pilot on October 10, 2026. This approval does not authorize a live acquisition campaign, live lead collection, tracking pixels, CRM, payments, ads or contacting anyone. Future funnel activation needs its own approval and the FKL permissions listed above. `main` deploys through the existing Pages workflow; hosting and DNS were unchanged.

## R01 publication record — October 10, 2026

- Owner approval: Drew’s explicit instruction to publish draft PR #59 and proceed despite unavailable browser visual checks unless a demonstrated defect existed.
- PR: https://github.com/drewcleaver17/drewcleaver.com/pull/59 — marked ready, then squash merged after successful CI https://github.com/drewcleaver17/drewcleaver.com/actions/runs/38060598805.
- Published site-content commit: `abaff0627511a74e8913de79c78a0835d2105f1b`.
- Successful Pages workflow: https://github.com/drewcleaver17/drewcleaver.com/actions/runs/38064180254; Build and Deploy jobs both succeeded.
- Publication time: **2026-10-10 10:35:57 CDT (America/Chicago)**, corresponding to Deploy job completion at `2026-10-10T15:35:57Z`. This is distinct from the unchanged source-verification date above.
- Live URL: https://drewcleaver.com/fkl/.
- Live verification completed at `2026-10-10T15:36:38Z` (10:36:38 CDT). Nineteen page/asset endpoints returned HTTP 200 and matched the locally built bytes: FKL, four Lab routes, DPC, ProofPath, homepage, sitemap, both DPC PDF aliases, FKL stylesheet and all seven brand/image/font/share assets.
- Downloaded production HTML and its actual compiled inline JavaScript were exercised in JSDOM: both primary CTA events, all seven region handoffs, reset/fallback, outside-age advisory, seven native FAQ structures, invalid-form focus/accessible errors, successful demo confirmation/focus, clearing of sample details, no development inspector, no cookies/local/session storage and no personal values in event payloads. Network APIs were guarded against calls. This is DOM/runtime verification, not a real-browser network trace or device test.
- Noindex/nofollow and independent-demo disclosure are present; form has no endpoint or submission field names. Sitemap and public navigation remain free of FKL links; output tests also check all generated pages for inbound FKL links. No discovery feed/search route exists to update.
- `npm test` and `npm run build` passed (138 tests); the latest-main build and `scripts/check-lab.mjs` passed after Lab R02 was incorporated. R02 retains five ordered categories and three nonlinked placeholders without routes. Lab/DPC/ProofPath source, publication records, worksheets, calculators and PDF assets are unchanged by the FKL diff.
- Local logo proportions are 380×180; hero 1600×1060, mobile hero 780×520, arrival 800×1200 and share image 1200×630. Live bytes match those visually inspected source-derived assets.
- Remaining limitations: browser pixel QA, screenshots, real keyboard/touch use and measured overflow at 320/390/768/1440 remain unverified because browser control is unavailable. No demonstrated release defect was found. FKL permission for a future approved acquisition campaign remains separate from this independent pilot publication.

This evidence-only documentation update does not change customer-facing content. Its resulting Pages deployment is checked separately after the record is committed; the original publication time above remains fixed.
