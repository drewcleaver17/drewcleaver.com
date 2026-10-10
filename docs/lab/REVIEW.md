# Lab R01 review and release evidence

Prepared on `feat/lab-r01`, based on `main` at
`c128727f0c74e06005537597d3c382564e708baf`. No merge, deployment, domain change
or hosting migration is authorized by this preparation. R01 is a draft and
unpublished. See `README.md` in this directory for future edits and release steps.

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
no successful installation or offline support is claimed. Live Lab routes do not
exist until an approved release. Remote PR CI status must be checked separately.

## Exact remaining approved release steps

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
