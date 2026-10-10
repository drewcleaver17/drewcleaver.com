# Drew Cleaver / Lab — maintainer guide

R01 is a draft implementation for review, unpublished. This document and all
Lab content are public-safe material in a public repository. Read the owner’s
current instruction before a release: pushing to `main` publishes automatically.

## Read first

1. Root `AGENTS.md`, `BRIEF.md` and `RELEASE_CHECKLIST.md`.
2. This guide, `docs/lab/REVIEW.md`, `src/data/lab-revisions.json` and `src/data/lab.ts`.
3. For healthcare: `src/pages/dpc.astro`, `src/data/dpc-revisions.json`,
   `docs/dpc/R09_RECONCILIATION.md`, then the current model documentation and
   source files before touching any calculator. Older general DPC documentation
   can describe earlier models; current source/revision metadata take precedence.
4. For work: `src/pages/proofpath.astro` and `src/data/proofpath-revisions.json`.
5. `src/layouts/Lab.astro`, `src/styles/lab.css`, the Lab components/routes,
   `scripts/check-lab.mjs` and `scripts/check-release.mjs`.

## Content ownership

`src/data/lab.ts` is the single source for topic introductions, section content,
the method and proposal summaries. Topics have a stable ID, title, summary,
category, exploratory status and canonical Lab route. Sections use durable IDs:
`position`, `evidence`, `questions`, `pilot`, `decisions`, `next`; healthcare also
has `funding`. Proposal records have stable IDs, categories, titles, summaries,
status and canonical **original** routes. Their source revision/time are imported
from the existing proposal records rather than maintained by hand.

Lab’s revision/time are shared across the four pages. The visible source revision
on a proposal card belongs to DPC or ProofPath; it is not Lab’s revision and it
does not mean a pilot operated. Updating a badge does not verify that its summary
is still accurate: reread the affected source and update Lab deliberately.

The dynamic `[topic].astro` route renders only populated topics. Reusable
`Proposal`, `Revision` and `Update` components provide cards and metadata.
Do not create a second calculator, economics table, PDF or proposal history in Lab.
Keep DPC worksheets/storage keys, historical engines and both PDF paths intact.

## Add a topic or proposal

- Add a populated topic to `labTopics` with a durable URL-safe ID, canonical
  `/lab/<id>/` URL and the core sections above. Category and source summaries
  should contain meaningful content rather than placeholders.
- Add a proposal to `labProposals`, linking its authoritative route. Keep the
  proposal ID stable for anchors. Include its source files for future review.
- Navigation derives topics from this data; a larger topic set will need a new
  mobile navigation decision, not an indefinitely shrinking bottom bar.
- Update the expected route/navigation inventory in `scripts/check-lab.mjs`.
  All generated Lab routes must remain noindex and isolated from public discovery.

## Revise content and record decisions

Edit the topic/summary data and record the actual decision, reason, affected
topics/proposals and next question in `src/data/lab-revisions.json`. Keep topic
decision sections aligned with that record. Create the next revision for a
substantive approved iteration; commits, build fixes and unrelated deployments
do not automatically increase the content revision. R01 starts as a draft.

Set a fixed UTC ISO `updatedAt` when content is finalized for review, plus the
entry’s `finalizedAt`. Reuse `centralTimestamp` from `src/lib/dpc-revision.mjs`:
America/Chicago determines CDT/CST. Never use runtime/build time for “Updated.”
Preserve prior entries and their fixed times. A substantive edit within a pending
draft may update its finalization time explicitly; document the reason in review.

Keep `contentStatus`, `implementationStatus` and `publicationStatus` separate.
Implementation fixes can change review evidence without pretending the ideas
were newly published. Until verified release, `publishedAt` and `evidenceUrl`
remain null. Neither website publication nor implementation proves the proposal.

## PWA and navigation

`public/lab/manifest.webmanifest` has stable identity `/lab/`, start URL and scope
`/lab/`, standalone display and green/ivory colors. PNG icons reuse the DC initials
treatment from `/hello`; they are typography, not a new campaign logo. All
icons are opaque, and the maskable icon keeps the initials inside the central
safe area. No manifest is added to the shared site layout.

There is **no service worker**, content cache, push integration or offline claim.
Installation depends on browser support and has not been device-tested. Browsers
that require additional install criteria may offer only a home-screen shortcut.
The normal website works without installation or JavaScript. Out-of-scope source
links and the main-site return open a labeled new tab with `noopener noreferrer`;
actual standalone-app handling remains a device check.

Mobile navigation has text labels, active state, 48px targets and safe-area
padding. Footer clearance and focus/section scroll margins account for fixed
navigation. Desktop uses header navigation. Do not claim source-level safeguards
are observed keyboard or pixel behavior.

## Visibility and future participation

All Lab pages use `noindex, nofollow`; none enters the public sitemap, global
navigation, footer, feeds or disabled writing feature. Crawlers may read noindex;
do not block `/lab/` in robots.txt. Unlisted content is public, not confidential.
The release gate permits Lab-to-DPC/ProofPath links **only inside `/lab/`** and
continues to prohibit inbound links from other site sections.

Future accounts, comments, suggestions and private replies require authenticated
storage, authorization, explicit permissions, consent/data retention and deletion
design, moderation and operating responsibilities. Only Drew would create
categories and publish posts under the proposed participation model. This release
has no participant records, private submissions, voting, recruitment profiles,
payments or AI API. Do not add browser-only pretend authentication or inactive
controls suggesting an existing community. Private political strategy and
participant information must never enter this public source or PR text.

## Verification and approved release

Run `npm test`, `npm run build` and `node --test scripts/public-contact.test.mjs`.
The build includes DPC/model/UI regressions, Buildmine tests, UFO validation,
existing privacy/release gates and the new production-output Lab checks.
Verify unrelated source/assets against the base; do not silently update models.
Use browser QA at 320, 390, 768 and 1440px when supported, including keyboard focus,
long text, overflow, contrast, header/bottom-nav overlap and no-JavaScript reading.
Document unavailable checks precisely.

After Drew approves the concrete review:

1. Refresh from `main`, resolve scoped conflicts and run the checks again if inputs
   change. Keep writing protections and unrelated PRs intact.
2. Mark approved content as final while leaving publication pending, then merge
   the reviewed PR. Observe the existing GitHub Pages deployment, not a new host.
3. Verify all four live routes, noindex, navigation, sitemap exclusion, manifest and
   icons, and both original proposals/PDF paths. Check the approved revision’s
   content and stable timestamp. Perform available desktop/mobile/browser checks.
4. Only after successful approved deployment and live verification, record its
   actual `publishedAt`, workflow evidence URL and published status in the same
   revision entry. Preserve `updatedAt` and `finalizedAt`. A publication-record
   confirmation does not create R02. Verify that confirmation deployment too.

Rollback is a scoped revert through the existing Pages workflow. No DNS, paid
service, domain, hosting migration or unrelated release is required.
