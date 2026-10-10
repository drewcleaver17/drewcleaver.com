# Lab R01 review and release evidence

Originally prepared on `feat/lab-r01`, based on `main` at
`c128727f0c74e06005537597d3c382564e708baf`. Drew approved publication on
October 10, 2026, superseding the review-only restriction. PR #58 is merged and
R01’s deployment and live responses are verified below. No domain or hosting
change was made. See `README.md` in this directory for future edits.

## Implemented

- `/lab/`, `/lab/healthcare/`, `/lab/work/`, `/lab/updates/`, all unlisted/noindex.
- Existing green/ivory design tokens, serif typography, restrained cards/buttons,
  persistent contextual header, active local navigation, main-site return and
  mobile bottom navigation with safe-area clearance. Reading needs no JavaScript.
- Data-backed topic sections and proposal summaries; imported source revision
  badges; fixed R01 timestamp using America/Chicago; separate content,
  implementation and publication statuses with a decision record.
- Healthcare funding alternatives and pilot questions; ProofPath as an initial
  proposed experiment; broader work questions without adopted policy claims.
- Lab-only manifest and existing-brand DC initials icons; no service worker,
  offline cache, push, accounts, private submissions or invented community UI.
- Production-output release safeguards and a self-contained review generator.

## Verification completed

- `npm test`: 20 tests passed.
- `npm run build`: passed, including 94 DPC model tests, 9 Buildmine/core tests,
  2 Buildmine UI tests, 6 DPC worksheet UI tests, UFO source validation, existing
  release/privacy guards and the new Lab production-output gate.
- `node --test scripts/public-contact.test.mjs`: 7 tests passed.
- Total: 138 existing tests plus the new Lab output assertions.
- Lab assertions check all four rendered routes, one H1/main, unique IDs,
  working local links and section anchors, accessible referenced labels,
  native anchor navigation, active states and absence of script/forms/pretend
  controls. They also check noindex, canonical URLs, no discovery/inbound links
  from other site routes, fixed timestamps, CDT/CST formatting, original source
  revision agreement, scoped manifest fields, actual PNG dimensions and both
  PDF aliases. These are structural checks, not observed keyboard operation.
- Responsive source safeguards checked: mobile target heights, focus outlines,
  safe-area padding, footer clearance and scroll margins. No pixel claim.
- Production DPC/PDF paths and retained worksheet regression gates pass. DPC,
  ProofPath, their revision metadata, calculator/historical engines, PDF files,
  homepage, `/hello`, shared layout/styles and deployment workflow are unchanged
  from the base. Only the existing release checker is amended to allow Lab-only
  links to the two proposals; all other exclusion rules remain.
- `git diff --check` passed.
- Review artifact generated from the actual four built pages and their CSS.
  DOM checks exercise its page selector and 320/390/768/1440 width controls.
  The wrapper is a review tool, not production code or an installation test.

## Unverified / blocked

The managed environment has no available `control-browser` skill/capability.
Its supported preview guidance prohibits starting a preview server or using a
substitute browser in that case. No browser server was started and no browser
was installed. The concrete alternative is `Lab-R01-Review.html`, generated with:

```sh
node scripts/build-lab-review.mjs /absolute/path/Lab-R01-Review.html
```

Browser pixel inspection and representative screenshots at 320, 390, 768 and
1440px are **not available**. Actual keyboard focus scrolling, sticky-header and
bottom-navigation overlap, horizontal overflow, long-text layout and rendered
contrast remain unverified. Source and DOM checks do not establish these.
The review supports those widths for reviewer inspection; it is not fabricated
screenshot evidence. No public or private preview deployment was created.

Real iOS/Android installation, standalone-app scope-exit behavior and icon
presentation are untested. Installation availability depends on the browser;
no successful installation or offline support is claimed. The four live Lab
routes are now verified. Both final PR CI workflows passed; the approved
production build also passed.

## Release procedure (completed through initial deployment verification)

1. Drew reviews the preview, content and draft PR; approves this scoped release.
2. Resolve any review defects; refresh `main`, rerun changed-input checks and
   confirm PR CI. Perform available browser checks and disclose remaining limits.
3. Mark content final while publication remains pending. Merge the approved PR
   using the existing GitHub Pages workflow; observe deployment success.
4. Verify all four live routes, anchors, navigation, noindex, sitemap exclusion,
   stable revision time, manifest/icons, DPC calculator and both PDF download
   paths, and ProofPath. Check phone/desktop appearance where available.
5. Record actual publication time and verified deployment evidence in R01,
   preserving content-finalization timestamps; verify the record confirmation
   deployment. This does not increment R01 to R02.

Do not publish just to obtain a preview or bypass disabled-writing protections.

## Verified R01 publication — October 10, 2026

- Owner approved the scoped release; approved content is final and all proposals
  remain exploratory. [PR #58](https://github.com/drewcleaver17/drewcleaver.com/pull/58)
  merged as `3c8d39586854247145d32ab26b9efe0709d160fc`.
- [GitHub Pages run 38060212767](https://github.com/drewcleaver17/drewcleaver.com/actions/runs/38060212767)
  completed successfully; Deploy finished `2026-10-10T14:36:44Z`
  (October 10, 2026, 9:36:44 a.m. CDT). This is R01’s publication time.
- Content `updatedAt` and entry `finalizedAt` remain `2026-10-10T14:19:47Z`
  (9:19:47 a.m. CDT). Publication-record confirmation is part of R01, not R02.
- Initial live verification completed `2026-10-10T14:37:50Z`. All four Lab pages,
  manifest, three PNG icons, sitemap, robots.txt and linked stylesheet assets
  returned HTTP 200 and matched the locally built production bytes.
- Live DOM checks confirm noindex/nofollow, fixed content time, active navigation,
  section anchors, no Lab scripts/forms, sitemap and main-site link exclusions,
  manifest identity/start URL/scope `/lab/` and retained DPC worksheet markup.
- Existing homepage, `/hello/`, DPC, ProofPath, `/dpc-deck.pdf` and
  `/metsicare-deck.pdf` responses match their captured pre-release hashes exactly.
  The two PDFs remain byte-identical. Saved worksheets and historical engines
  are unchanged; all six worksheet DOM regression tests passed before release.
- Browser pixel/keyboard tests and actual device installation remain unavailable.
  Live HTTP/DOM evidence is not a claim of live calculator interaction.
- The publication-record confirmation must also be successfully deployed and its
  live published-status/evidence link checked before the release task is complete.


## R02 category placeholders — approved release

Prepared on `feat/lab-r02-categories` from published `main` at
`eb19ac25d505ea0e597479f05eecdd101021629a`. Drew approved publication on October 10, 2026.
The reviewed category-placeholder release is authorized for merge and deployment. Live R01 and its successful confirmation
workflow 38060520323 were checked before editing.

- Homepage order: Healthcare, Housing, Work, Education, Taxes.
- Housing, Education and Taxes contain only their titles and “To explore” status.
  Stable homepage anchors support future growth; they have no generated routes,
  links to nonexistent pages, substantive content or inactive controls.
- Healthcare/Work content, proposal cards and persistent navigation are retained.
- R02 content is final with publication pending verification and a fixed
  America/Chicago content time. R01's entire published metadata entry remains unchanged.
- Category display records are separate from populated topics. Updates link to
  placeholder anchors; the review generator uses the actual current revision.

### R02 verification

- `npm test`: 20 passed.
- `npm run build`: passed, including 94 DPC model, 9 Buildmine/core,
  2 Buildmine UI and 6 DPC worksheet UI tests, UFO validation and release gates.
- `node --test scripts/public-contact.test.mjs`: 7 passed (138 tests total).
- Lab output assertions pass for category order, labels, absence of placeholder
  controls/pages, existing links/navigation, noindex/discovery exclusions,
  fixed timestamps, preserved R01 evidence and scoped manifest/icons.
- Self-contained `Lab-R02-Review.html` generated from all four built pages/CSS;
  page switching and 320/390/768/1440 width controls passed DOM checks.
- `git diff --check` passed. Diff is limited to nine Lab data/rendering/style,
  verification/review-generator and maintainer-documentation files. Populated
  topic content, DPC/ProofPath source, calculators, revisions, saved-worksheet
  engines, PDF/download paths, public pages and deployment workflow are unchanged.

Browser visual/keyboard inspection and
screenshots at 320, 390, 768 and 1440 px remain unavailable in the managed
runtime. The supported Sites guidance prohibits a substitute browser path.
Real-device installation remains unverified. A standalone review HTML generated
from production output provides those four width controls for owner inspection.

After approval, follow the maintainer guide's finalization, merge, Pages/live
verification and publication-evidence steps. Preserve R02's fixed content time
and all R01 evidence. Do not mark R02 published before verified deployment.
