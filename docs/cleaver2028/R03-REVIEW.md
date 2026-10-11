# Cleaver2028 R03 — published and live verified

## Release authorization — October 10, 2026, America/Chicago

Drew explicitly approved this reviewed R03 copy/design, the existing COTA family
photograph, the original Reinventing Our Future logo and publication through the
existing GitHub Pages workflow, including public branch/PR and merge. He also
approved the precise /dpc/#model, /dpc/#concept and /proofpath/#pilot links,
acknowledging that these make unlisted concepts and linked material easier to
discover. No Lab hub link or navigation/sitemap/indexing changes are authorized.
The original draft review below is retained as historical evidence, not a
current approval prohibition. The source and content timestamp are preserved.

Current release state: published and live verified. Publication evidence below
was recorded only after the successful Pages deployment and live checks. The
original draft/pending state is retained in git history. No filing or declaration
is made.

### Disclosure research for this release

Fresh research used the current versions of 11 CFR 100.26 and 110.11 (eCFR
displayed Title 11 current through October 7, 2026), FEC advertising/disclaimer
guidance, committee-website guidance, and testing-the-waters guidance:

- https://www.fec.gov/regulations/100-26/CURRENT
- https://www.fec.gov/regulations/110-11/CURRENT
- https://www.fec.gov/help-candidates-and-committees/advertising-and-disclaimers/
- https://www.fec.gov/updates/understanding-committee-website-disclaimer-requirements/
- https://www.fec.gov/help-candidates-and-committees/registering-candidate/testing-the-waters-possible-candidacy/

The regulations cover political-committee websites and specified public
communications; the internet public-communication definition includes paid
placement/promotion on others' properties. The owner's stated personal-payer
facts and approved scope remain an organic page on his existing personal site,
with no committee represented, fundraising, paid placement/promotion or outreach.
R03 adds a personal photograph, grounded biography and links to existing concept
artifacts; it does not change the possible-campaign intention or introduce a
solicitation. Inference for this narrow scope: no additional mandatory disclaimer
was identified. Retain the existing factual line, “Paid for by Drew Cleaver.”

`compliance.reviewed=true` records this completed research, not qualified legal
review. `disclaimerRequired=false` records the limited assessment above, not a
general exemption or legal certification. The existing release gate is unchanged.
Pre-filing is represented status, not a legal safe harbor; neither noindex nor
lack of registration determines obligations. FEC guidance identifies campaign-
style candidate statements as relevant to whether testing the waters has ended.
Actual decisions, activities, spending and resulting candidate/committee duties
remain a material question for qualified election counsel, including whether a
committee disclaimer becomes necessary. No complete financial/activity ledger
or counsel opinion is available, and no claim is made that they were reviewed.
Reassess before broader promotion, financing, fundraising or committee changes.
No new language, committee name, filing date or official record is invented.

### Release verification

Main was refreshed and remained at 0b7f3bb26121d6fbb75726f66980f4f9e6068827;
the prior Pages deployment succeeded. Unrelated open DPC PR #49 and other local
work are untouched. All six inspected live routes returned 200 before release;
campaign R02 and the existing Lab/DPC/ProofPath noindex settings were retained.

- `env -u CLEAVER2028_REVIEW npm run build`: passed all 121 build tests and
  source/release/Lab/campaign gates with the production approval settings.
- `npm test`: 27 passed. Contact/campaign suite: 10 passed. Total: 158.
- Changed JavaScript syntax and both staged/working diff whitespace checks pass.
  No standalone lint/typecheck script is defined; no independent type audit is claimed.
- Every reviewed campaign-copy field is unchanged apart from approval/research
  settings. Built campaign DOM is identical to the approved review apart from
  its publication-status stamp. Original logo/photo source bytes are unchanged.
- All 233 pre-existing noncampaign output files remain byte-identical to the
  baseline. The sole removed baseline asset is the obsolete campaign-only CSS;
  its only referrer was /cleaver2028/index.html. The first ad-hoc comparison used
  an incorrect CSS filename pattern; checking actual references resolved it.
- Selected links/anchors, About/Hello/email, noindex/canonical/social metadata,
  absence of campaign scripts/forms, seven visions and three method steps pass.
- Browser limitations from the draft remain: no local Chromium executable and
  cloud-browser local-file access blocked. Prepublication pixel, mobile and
  physical-device checks are unverified; production build success is not visual QA.
  No test emails or live inquiry submissions were made.

### Verified publication receipt

- Release PR: https://github.com/drewcleaver17/drewcleaver.com/pull/65
- Reviewed source commit: 3e9016dff7faa41a52a3d27927813a7bac7830d0.
- Merge/publication commit: d077841842b7c5483c6c0cc2a97a9aa53706a3d4.
- GitHub CI: https://github.com/drewcleaver17/drewcleaver.com/actions/runs/38106554868
  passed its Node 22 install, tests and full production build.
- Pages: https://github.com/drewcleaver17/drewcleaver.com/actions/runs/38106635307
  Build and Deploy succeeded. Deploy completed 2026-10-11T02:55:24Z, displayed as
  October 10, 2026 at 9:55 PM CDT (UTC-05:00).
- Live URL: https://drewcleaver.com/cleaver2028/ . Both slash and nonslash routes
  returned 200 and matched the tested production page. Initial live HTML SHA-256:
  7860a675118a0077d8a3af4d94303c2aedcddc39d292a83e059cf732c0e9820d.
- All 17 HTTP checks returned 200 and matched tested output: both campaign paths,
  About, Hello, Lab, DPC, ProofPath, homepage, sitemap, robots, favicon, campaign
  CSS, original logo and all three responsive portrait derivatives. Selected
  #model/#concept/#pilot anchors, email/contact links, pre-filing status, payer
  line, noindex/nofollow, and discovery exclusions passed. No Lab hub link added.
- Live Chrome rendered the introduction, DPC section, method/disclosure and
  contact/footer at a 1363 x 936 window (1348px content width). Both images loaded,
  the crop shows Drew and his father, the original logo retains its proportions,
  and document scroll width equals content width: no horizontal overflow.
- Keyboard Tab reveals the skip link with a 3px focus outline; Enter followed by
  Tab reaches Email Drew with the same visible outline. Enter opens the native
  status/source disclosure and Space closes it; its focused outline was visually
  inspected. In-page work/contact navigation and the readable payer line passed.
  The first Playwright button-role locator did not match native summary; the
  observed text locator exercised the actual control successfully.
- Desktop screenshot: Cleaver2028-R03-Live-Desktop.jpg, captured from the live
  page and delivered separately. Exact 320/390/768/1440px geometry, physical
  devices, screen readers and reduced-motion emulation remain unverified because
  this browser API has no viewport/emulation setter. No mail was sent, forms
  submitted or calculator/saved-worksheet values changed.

This receipt changes only revision metadata and campaign release documentation.
The approved copy/design, release settings, fixed content timestamp, seven
visions, status and disclaimer remain unchanged. Its ordinary production build
passed all 121 build tests and release guards with the review flag unset; the
built HTML differs from the verified release only in its publication-status
stamp. Its CI and subsequent deployment must also be verified; it is not a new
content revision. The qualified legal-review question above remains open.

---

# Historical private draft review

Status: implemented locally; NOT approved for publication. No push, PR, merge,
public preview or deployment. Earlier publication approvals do not apply.
Local branch: feat/cleaver2028-r03-private-review.
Base: main 0b7f3bb26121d6fbb75726f66980f4f9e6068827.
Read src/data/cleaver2028-revisions.json for the fixed America/Chicago content
time. R03 remains draft/unpublished with null publication time and evidence.

## One design recommendation

Introduce a person, then give the reader a concrete piece of work to question.
The first screen balances name, real family photograph, intention, status and
contact. The original Reinventing Our Future logo remains byte-identical in a
smaller masthead. A short founder biography leads directly to About and sources.
DPC comes first, with an actual calculator link and one consequential unanswered
question. ProofPath has a smaller role. All seven approved visions retain their
exact R02 wording and four-category structure. The short method follows; status,
AI responsibility and source detail use a native disclosure. Three in-page
links help long-page readers reach work, visions or contact without fixed UI.

The introduction uses Drew's approved motivation. It does not invent a formative
political episode or explain why this particular office is necessary. A stronger
personal answer to “Why the presidency, and why now?” needs Drew's own account.
That is a copy opportunity, not a claim supplied by this revision.

## Photograph and logo

Reuse: src/assets/about/IMG_6020.jpeg, supplied by Drew for public use on his
About page (docs/ABOUT_PHOTOGRAPHY.md). The existing caption identifies Drew and
his dad on the COTA grid. A CSS display crop centers both people (source rectangle
x=500, y=420, width=520, height=520). Astro makes responsive WebP copies at
576/864/1152 pixels; no generated image, retouching or compositing. Source pixels
and the full-context About photograph are untouched. Caption identifies the
personal setting and expressly avoids implying endorsement by people or brands.
This is a candid family photograph, not a new studio portrait. A supplied solo
portrait could replace it later, but no new asset is needed for this draft.

Original logo: src/assets/cleaver2028/logo.jpeg, 1536 x 768.
SHA-256: a06badda7c8a6beea00f7679d9d49ab8060fccb244506028ac6e3be23e382e2b.
No substitute slogan, redraw or altered proportions.

## Inspected starting state

- Main matches the base above; its latest Pages deployment 38101671590 succeeded.
- Live /cleaver2028/, /about/, /hello/, /lab/, /dpc/ and /proofpath/ returned 200
  and substantive content. Campaign R02 has all seven visions, original logo,
  pre-filing status, personal payer line and no project links.
- R01 deployment 38069447783 completed at 2026-10-10T16:54:18Z. R02 deployment
  38085387106 completed at 2026-10-10T20:52:51Z. These are actual successful
  Deploy-job completion times, now recorded in the new campaign history.
- DPC R09 and ProofPath R04 are published concepts, not implemented programs.
  Lab R02 retains Healthcare, Housing, Work, Education, Taxes in that order;
  Housing, Education and Taxes remain nonlinked “To explore” placeholders.
- Only open PR returned at inspection: old DPC PR #49. It was not modified.
  Other local checkouts include unrelated UFO work; they were left untouched.
- Existing Pages workflow deploys pushes to main. The draft now explicitly
  refuses an ordinary build to prevent an accidental unapproved release or
  deletion of the currently published campaign page. A local review requires
  CLEAVER2028_REVIEW=1. Never publish that flagged build.

## The inspectable work and its limits

Selected links prepared in this private review:
- /dpc/#model — the current working calculator.
- /dpc/#concept — the original operating concept and its context.
- /proofpath/#pilot — the proposed one-employer, five-candidate pilot.

DPC controls actually include pricing, staffing/schedules, visit duration,
attendance, patient allocation and launch assumptions. The description points
to capacity, operating finances and cash planning, without copying calculated
outputs. R09 documents unknown startup inputs, unvalidated clinical/demand
assumptions, and unscheduled physician leave. The featured question is grounded
in docs/dpc/R09_RECONCILIATION.md: coverage allowances do not produce an actual
relief roster. The model does not resolve who covers real absences while
preserving continuity and team access. No clinical or national-budget conclusion
is attributed to this practice worksheet. Public funding is a separate proposal.

ProofPath's current R04 source describes a manually delivered proposed pilot,
including payment/effort terms and evaluation measures. It supplies no executed
pilot, committed employer, HiringCafe partnership or measured hiring outcomes.
The landing page preserves that distinction.

Exposure decision remains UNAPPROVED (campaign.labLinksApproved=false).
Publishing these three links would make the currently unlisted DPC and ProofPath
pages easier to discover from the campaign page. Their existing outgoing links
and downloads would also be reachable through them. No Lab hub link, Lab change,
public navigation, indexing or sitemap change is proposed. If exposure is
withheld, the same page uses an explicit email-for-access explanation instead of
promising direct inspection without a route. The private review displays links
because Drew specifically requested a concrete exposure decision.

## Biographical claim ledger

| Proposed claim | Source and classification | What is established / limit |
| --- | --- | --- |
| Drew is an inventor and Higher Hangers founder in Austin | Owner's current instruction; current profile and /about/; independent reporting below | Founder identity and location. No public-service credentials inferred. |
| A space-saving hanger idea became a consumer-products business | Owner's published About account; original Kickstarter; Higher Home's Story | Business/product history; no current customer count, sales ranking or financial outcome used. |
| Launched on Kickstarter in 2016 | Original Kickstarter campaign | Campaign creator Drew Cleaver and 2016 campaign dates. Campaign copy is creator-authored, not an independent audit. |
| Ran sales and operations; earlier technical sales in oil and gas | /about/ and existing resume-derived experience data | First-person career account, not independently audited employment or performance records. |
| Founder identity in Austin independently corroborated | Washington Post, May 12, 2025 | Identifies Drew as Higher Hangers' Austin-based founder. No endorsement implied. |
| Photograph depicts Drew and his dad at COTA | docs/ABOUT_PHOTOGRAPHY.md and existing public About caption | Owner-supplied image/context. No support from family, team or sponsors asserted. |

Sources inspected October 10, 2026, America/Chicago:
- https://drewcleaver.com/about/
- https://drewcleaver.com/hello/
- https://www.kickstarter.com/projects/higherhangers/higher-hangers-space-saving-closet-organization-re
- https://www.higherhome.com/pages/story (search-index text retrieved; direct fetch returned 402, so not used as the page's sole evidence or image source)
- https://www.washingtonpost.com/business/2025/05/12/trump-china-tariffs-prices-deal/ (retrieved text; reader access may be limited)
- https://patents.google.com/patent/US7404503B1/en (record lists Andrew Cleaver and Myron D. Osborn; no sole-inventor or current patent-status claim is added)

The landing page offers About, the original Kickstarter and independent reporting
in its source disclosure. Detailed patent, customer, revenue, country-count,
award and executive-performance claims are not added. No unsupported biography
has been inserted. The unresolved personal motivation is identified above.

## Status and qualified disclosure review

Preserved verbatim: “Paid for by Drew Cleaver.” Pre-filing planning, null filing
date and null official record URL remain in src/data/cleaver2028.mjs. No official
filing was supplied or verified; the draft makes no registration claim. The
central status/FAQ fields and official-FEC-domain validation remain maintainable.
Changing the date does not automatically change candidacy status.

Material question for qualified election counsel: given Drew's actual decisions,
activities, spending and campaign-style branding, what candidate/committee and
website-disclaimer obligations apply, and is the existing payer line sufficient?
The pre-filing label alone does not answer that. Official FEC testing-the-waters
and disclaimer guidance was read; this draft makes no legal determination.
compliance.reviewed=false and disclaimerRequired=null record the unresolved R03
review rather than carrying forward R02's assessment as new clearance.
- https://www.fec.gov/help-candidates-and-committees/registering-candidate/testing-the-waters-possible-candidacy/
- https://www.fec.gov/help-candidates-and-committees/advertising-and-disclaimers/
No filing, legal declaration, new committee, donor collection or outreach occurs.

## Changed files

- src/data/cleaver2028.mjs — copy, source links, model context, draft approval/status settings.
- src/data/cleaver2028-revisions.json — new R03 draft record and evidence-based R01/R02 history.
- src/pages/cleaver2028/[...path].astro — person-first layout, real photograph, project links, source disclosure, scoped styles and revision stamp.
- scripts/prepare-cleaver2028-build.mjs — refuse an ordinary build of the unapproved draft.
- scripts/check-cleaver2028.mjs — extend existing output guard to selected project anchors, biography links, photograph and draft metadata.
- tests/cleaver2028.test.mjs — existing authorization test now also checks the build refusal.
- scripts/build-cleaver2028-review.mjs — self-contained preview/copy/recovery patch using the current revision/base.
- docs/cleaver2028/REVIEW.md — point maintainers to this current draft without rewriting R02 records.
- docs/cleaver2028/R03-REVIEW.md — this review, evidence, limitations and release checklist.

No changes to DPC/ProofPath/Lab content, calculator code, historical engines,
saved worksheet keys, PDFs, their revision records, shared profile/styles,
deployment configuration or unrelated routes. No new application dependency,
form, donation, mailing list, CRM, tracking or contact backend.

## Verification

Final results are recorded below after the completed checks. Automated DOM
checks and model tests are not browser screenshots or physical-device tests.

## Release decisions and checklist

- Approve the concrete R03 copy/layout and reuse of the existing personal photo.
- Explicitly approve exposure of the three selected DPC/ProofPath links, or keep
  them withheld and use the implemented access-by-email wording.
- Resolve the qualified disclosure question above before broader promotion;
  retain the existing payer line pending that review. Do not guess a committee.
- Perform outstanding real desktop/mobile and keyboard QA when an allowed
  browser can load the private draft. No public deployment to obtain a preview.
- On later approval, refresh main and preserve concurrent unrelated work. Confirm
  that only the nine listed campaign/support files change. Set release approval
  deliberately, document disclosure review, and run ordinary production checks.
- Keep R03 publication pending until the actual Pages deployment and live route
  are verified. Then record the real publication time and evidence, preserving
  its content-finalization timestamp and prior history. Verify that receipt too.

Proposed later release instruction (not authorization from this document):

Publish the reviewed Cleaver2028 R03 revision in drewcleaver17/drewcleaver.com
through the existing GitHub Pages workflow after the documented disclosure
review and remaining visual checks. This approves the reviewed copy, the existing
COTA family photograph, the unchanged Reinventing Our Future logo, and links from
/cleaver2028/ to /dpc/#model, /dpc/#concept and /proofpath/#pilot. I understand that
those links make the currently unlisted concepts and their linked material easier
to discover. Keep the campaign and project pages noindex and excluded from public
navigation and sitemaps. Preserve pre-filing status unless an official filing is
separately verified; retain the existing payer disclosure pending qualified
review. Refresh current main, preserve unrelated changes and models, run the
required checks, publish only this reviewed scope, verify the live result, and
record R03 as published only after successful deployment verification. This does
not authorize a filing, donations, outreach, data collection or advertising.

## Completed verification results

- CLEAVER2028_REVIEW=1 npm run build passed all required gates: 94 DPC model,
  9 Buildmine/core, 3 UFO UI, 2 Buildmine UI, 6 DPC worksheet UI and 7 FKL tests
  (121 build tests), plus source validation and release/Lab/campaign checks.
- npm test: 27 passed. Contact/campaign suite: 10 passed. Total: 158 tests.
  The DPC UI suite exercised current R09 inputs, panel allocation and reserves,
  saved state and historical worksheets in DOM. No live user worksheet changed.
- JavaScript syntax checks for the changed data/build/review modules passed.
  The repository defines no separate lint or TypeScript-check command, and
  @astrojs/check is not installed. The Astro build generates types but is not a
  substitute for a standalone type audit; none is claimed.
- All 233 pre-existing noncampaign build files are byte-identical to baseline,
  including shared CSS, all Lab/DPC/ProofPath pages, public routes, vCard,
  both PDFs and other assets. Only campaign output and new image/CSS derivatives
  are added/changed; the obsolete campaign-only CSS bundle is removed. Seven visions, method, filing status and payer line compare
  exactly with R02. The original photograph and logo source files are unchanged.
- Selected project routes and #model/#concept/#pilot anchors resolve in actual
  production output. All campaign anchors/IDs, labels, source/email/About/contact
  destinations, noindex/canonical/social metadata and local images pass the
  extended existing output checks. Campaign markup has no scripts or forms.
- The actual ordinary prebuild fails for this unapproved draft before deleting
  any existing output; local-review generation succeeds. No preview build is
  allowed to stand in for release approval. git diff --check passed.
- Layout source covers 320/390/768/1440 widths, wrapped actions, readable line
  lengths, visible focus, descriptive links, a skip link, native disclosure and
  reduced-motion rules. These are implementation checks, not visual evidence.

Blocked browser checks: the local Playwright installation has no Chromium binary.
Its official download returned an empty/truncated ZIP and failed. The available
cloud browser explicitly rejected file:// preview access under its URL policy.
No workaround, alternate hosting or publication was used. Accordingly, real
rendered mobile/desktop layouts, photo framing, overflow, keyboard-focus behavior,
reduced-motion rendering and screenshots remain UNVERIFIED. No screenshot is
fabricated or offered as evidence. The review's width controls support owner
inspection, not completed browser QA. Native mail/contact import and screen-reader
use remain device checks. No email was sent and no live inquiry was submitted.

- Local HTTP verification on a temporary loopback-only server passed for both
  /cleaver2028 and /cleaver2028/, the original logo, DPC, ProofPath, About and
  Hello (all 200). R03 draft/noindex content is present. The server was stopped;
  no hosted preview was created. This is distinct from blocked browser access.
- The self-contained review's DOM checks passed: all five width controls,
  exact built page embedding, two embedded images, no external asset loads,
  selected project handoffs and R03 draft stamp. These are not pixel checks.
