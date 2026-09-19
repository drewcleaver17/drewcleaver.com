# Homepage and /hello release

Status: Drew approved publication after removing public writing and focusing on contact and scheduling. Revised build is ready for deployment.

## Implemented

- [x] Personal homepage with founder advisory and an open-ended inquiry path.
- [x] Pay-what-you-want proposals with scope and price agreed before work starts.
- [x] Mobile-first `/hello` with contact download, email, and background links.
- [x] Shared public profile and generated vCard.
- [x] Optional inquiry category and budget; pending, success, and failure states.
- [x] Writing templates retained; AI sample removed from current source; writing routes and links excluded from the public build.
- [x] Homepage, navigation, and `/hello` emphasize inquiry and scheduling.
- [x] Shared mobile menu, keyboard focus, labeled controls, metadata, and desktop layouts.

## Verification

- [x] Production build passes.
- [x] All 5 public pages and their internal links/assets checked; anchors, metadata, heading uniqueness, and vCard fields pass.
- [x] DOM tests pass for native validation, optional category/budget, inquiry prefill, pending/duplicate prevention, successful reset, and message retention after HTTP/network/abort failures. No external messages sent.
- [ ] Actual browser rendering at 320, 390, 768, and 1440 px.
- [ ] Real iPhone/Android contact save, QR scan, and email action.
- [ ] Authorized live inquiry received in the intended inbox.
- [ ] Current Calendly scheduling availability verified by owner.
- [x] Owner approved the preview and authorized deployment after the specified writing/contact revisions.

Cloud browser access to the local build was blocked by its URL policy. No visual or device checks are claimed. The in-conversation preview is generated from production markup and CSS; navigation is local and form submission is disabled there. The revised site is authorized for public deployment.

## After approval

- [ ] Merge reviewed changes to `main`; observe the existing Pages deployment.
- [ ] Verify `https://drewcleaver.com`, `/hello`, contact download, and inquiry flow.
- [ ] Scan a sample QR containing `https://drewcleaver.com/hello` from a printed proof before ordering cards.

Rollback: revert the release commit on `main` and let the same deployment workflow rebuild. Do not change DNS for this release.

Writing privacy: the repository is public. Current source no longer includes the AI sample, but old commits can still contain it. Future private drafts stay outside the public repository until approved for publication.

## Build mine pilot — September 18, 2026

- [x] `/buildmine/` has exactly seven open-ended prompts, a bespoke aesthetic answer and optional Drew-style checkbox, optional scheduling URL, domain/privacy question, name and private reply email.
- [x] No application character/word caps on answers or résumé text. A 240,018-character answer remains complete in simulated submission and downloaded exports, including during an in-flight request.
- [x] PDF/TXT import reads locally and fills editable résumé text; the file control has no submission name and no original file is sent. Actual PDF extraction and empty, corrupt, unsupported, oversize, blank, and locked-document fallbacks checked.
- [x] Required fields, whitespace, consent, visual-style alternatives, scheduling URL, pending/duplicate prevention, successful retention, and server/network/abort failure retention checked with simulated requests. No external messages sent.
- [x] Existing inquiry form, vCard, and all six HTML pages / 83 local links and assets pass structural checks.
- [x] Production build passes. Release checks keep writing absent and the pilot out of navigation with noindex metadata.
- [x] Hands-on preview workflow and original-file handling are accurately described. No automatic site generation, account creation, domain purchase, or paid upload integration is claimed.
- [x] Repeatable intake-to-preview and approval-to-launch process recorded in `docs/BUILDMINE_PILOT.md` without client data.
- [ ] Browser rendering at 320, 390, 768, and 1440 px; current browser API has no viewport-resize control. Source uses a single-column form, fluid widths, 16px inputs, wrapping actions, and mobile breakpoints.
- [ ] An authorized participant submission received in the intended inbox; provider acceptance alone is not delivery verification.
- [ ] Confirm live deployment, direct route, noindex, and loaded client/worker assets after merging.

## Instant starter revision — September 18, 2026

Supersedes the manual submission behavior documented above.

- [x] All seven questions optional; name and résumé alone create an editable starter.
- [x] Three distinct preset layouts; no claims of live AI generation or arbitrary aesthetic interpretation.
- [x] No automatic submission to Drew; original résumé import remains local and unchanged.
- [x] Explicit public-content review gates share/export. Edits invalidate approval and the displayed share link.
- [x] Public-only snapshot links round-trip Unicode; malformed/oversize links fail without truncation. Input and full exports preserve a 240,018-character answer.
- [x] Escaped text, validated contact URLs, script-free output, sandboxed frames, and no external submissions checked.
- [x] Standalone HTML export includes styling, local section navigation, and indexing enabled only for reviewed export.
- [x] Full build and retained contact/vCard checks pass; seven routes, no writing, no homepage pilot link.
- [ ] Live browser generation, style switching, shared preview, and embedded anchor navigation after deployment.
- [ ] Outer-page rendering at 320, 390, 768, and 1440 px. Browser viewport resize is unavailable; do not claim physical mobile testing.
- [ ] Permanent named hosted pages, AI generation, owned accounts, custom-domain routing, payments, and managed customer hosting. These require a connected backend and product setup; they are not live in this pilot.

## /hello social links and contact details

- [x] Owner explicitly approved the supplied LinkedIn/Instagram URLs and live publication.
- [x] Social links grouped below main contact actions with existing mobile-friendly styles.
- [x] Saved contact includes all seven website/social/scheduling/background/inquiry/résumé links and the existing email.
- [x] vCard 4.0 birthday contains month/day only; city/state/country is Austin, Texas, USA, without street or postal code.
- [x] Production build and generated contact validation: vCard 4.0, exact yearless birthday, structured location, all seven links, UTF-8/CRLF/line lengths, and agreement with /hello. Existing page/link/inquiry checks pass.
- [ ] Successful deployment and live page/contact-file checks.
- [ ] Actual import into Apple and Google Contacts, including yearless birthday and URL labels.

## Contact card polish after device screenshots

- [x] Green action reads “Save My Contact Card”; explanatory subtext removed.
- [x] One navigation list eliminates the extra margin and duplicate divider between Instagram and scheduling.
- [x] Downloaded contact omits the résumé URL and label; website résumé access is retained.
- [x] Production build and focused page/contact inspection: exact button text, no subtext, one continuous six-link list, six saved contact URLs with no résumé, birthday/location preserved.
- [ ] Successful deployment and live spacing/contact-file checks.

## Uniform /hello button stack

- [x] All eight actions use the same existing green button style in one responsive column.
- [x] Priority is contact download, scheduling, inquiry, email, LinkedIn, Instagram, about, résumé.
- [x] Existing destinations, download behavior, social-link handling, and saved contact content retained.
- [x] Production build and generated-page inspection: eight matching button classes, requested order, original destinations/download attributes, and résumé still excluded from saved contact.
- [ ] Live order, shared styling, touch targets, and deployment verification.

## Google Analytics and search foundation

- [x] GA4 integration prepared with blank public identifiers until Drew's properties are connected.
- [x] Consent defaults to no Google loading or collection; equal accept/decline controls, preference expiry, withdrawal, and privacy-signal handling implemented.
- [x] Public-page action events contain no inquiry values, résumé text, draft data, or arbitrary query strings. Accepted inquiry event occurs only after a successful provider response.
- [x] Builder and shared-preview routes cannot initialize analytics, including with previously saved consent.
- [x] Public sitemap, robots.txt, homepage verification-token support, privacy page, and repeatable account setup procedure added.
- [x] Production builds checked with inactive settings and simulated public test identifiers. Focused DOM checks pass for consent, attribution sanitization, event classification, privacy exclusions, failed/successful inquiry handling, and token placement. No Google requests or real test inquiries sent.
- [ ] Owner Google account access, actual GA4 web stream ID, enhanced-measurement settings, and Search Console ownership verification.
- [ ] Actual GA4 Realtime event receipt, key-event designation, and Search Console sitemap submission.

Browser secure sign-in did not complete. A deployed scaffold, local test ID, or public sitemap must not be described as an activated analytics property or verified Search Console account.

## Unlisted motorsport story pilot

- [x] Seven-chapter first-person page at `/motorsport/` follows Drew's supplied account, with approximate dates retained and driving, sponsorship, and hospitality roles distinguished.
- [x] No photography, empty media placeholders, or invented race imagery. Chapters accept inline real photos later without reserving blank space.
- [x] Route has noindex/nofollow metadata, no inbound site links, no sitemap entry, and no analytics initialization. Unlisted does not mean access-controlled.
- [x] Production build and release checks pass. Generated page has one H1, seven working chapter anchors, unique IDs, valid local contact/asset links, and no media or tracking scripts.
- [x] Scoped styling uses fluid heading sizes, a single-column narrow layout, 44px navigation targets, and wider chapter grids from 800px. Existing shared layouts and identity are unchanged.
- [x] Google account setup paused by owner; public IDs remain blank and Analytics inactive.
- [ ] Post-deployment browser render and live route verification.
- [ ] Actual rendering at 320, 390, 768, and 1440px. Current browser surface has no viewport-resize control; source-level responsive inspection is not physical device testing.
- [ ] Archival evidence for newspaper feature, dated results, and historic-first claim before a broader launch. Pilot copy is based on the owner's account, not independent results verification.

## Unlisted ProofPath concept brief

- [x] Owner approved the deck and explicitly requested live publication at `/proofpath`.
- [x] Continuous reading layout covers the work-sample premise, connected process, candidate passport, paid assessments, employer-funded mandate, learning model, launch path, existing competitors, proposed HiringCafe relationship, pilot, and invitation.
- [x] Scoped, responsive styling preserves the deck's readable white/navy/teal visual direction. No embedded slide frames, decorative artwork, new forms, or backend.
- [x] Existing public contact data supplies the email action. Assumptions, research permissions, and the lack of an existing HiringCafe deal remain explicit.
- [x] Production build succeeds. Release checks enforce no inbound site links, no sitemap entry, noindex/nofollow, and no analytics initialization for this page.
- [ ] Browser verification after publication; local preview is unavailable to the cloud browser. Source-level responsive checks are not physical mobile-device tests.

## Unlisted Tekmetric ProofPath pilot

- [x] Owner explicitly requested the tailored `/tekmetric` page and live publication, with direct-link access only.
- [x] Proposed one-role, four-week trial includes up to ten paid assessments, realistic shop-owner questions, sales enablement deliverables, a defined rubric, budget, responsibilities, schedule, and success measures.
- [x] HiringCafe remains in the proposed partnership and future shop-customer opportunity. No affiliation, integration, vacancy, or traction is implied; the first trial does not depend on a HiringCafe agreement.
- [x] Pilot economics, role choice, timings, and thresholds are labeled proposals. Candidate payment, consent, evidence reuse, and the distinction between managed service and future platform are clear.
- [x] Public company context links to Tekmetric's product, FAQ, careers, and partner pages and HiringCafe's about page, reviewed September 2026. The later story revision includes Drew's explicitly supplied general interview experience; no particular employer rejection details are published.
- [x] Production build and release checks pass: required route, no inbound site links, no sitemap entry, noindex/nofollow, and no analytics initialization. Original ProofPath page and shared navigation are unchanged.
- [x] Narrow-screen source retains readable fluid typography, single-column layout, wrapping content, and large contact targets from the approved ProofPath design.
- [ ] Post-deployment live route, browser rendering, and pilot anchor verification.
- [ ] Actual rendering at 320, 390, 768, and 1440px. Current browser surface has no viewport-resize control; source checks are not physical device tests.

### Tekmetric story and executive synthesis revision

- [x] Opening now leads with Drew's interview experience and the live/on-camera versus written-work mismatch as his working explanation.
- [x] Executive synthesis explains paid work samples, demonstrated AI aptitude, and a consented learning loop for better assessments, training, and onboarding before introducing pilot details.
- [x] Evidence-reuse section connects observed patterns to specific improvements and testing in later cohorts; no predictive validity is asserted.
- [x] Pilot terms, HiringCafe content, shared navigation, and unlisted-route protections are preserved.
- [x] Production build, release privacy checks, unique heading/ID structure, and new synthesis/pilot anchors pass.
- [ ] Post-deployment live revision verification.

### Tekmetric compensation and budget refinement

- [x] Owner authorized live publication of scope-based candidate compensation and a capped pilot budget agreed after scoping.
- [x] Paid work leads the compensation section. The proposed minimum, higher compensation for deeper work, equal payment for equal assignments/terms, completion-based payment, advance disclosure, and bounded effort are explicit.
- [x] Fixed employer price and associated allocations are removed from the page; budget components now separate reserved candidate pay, service delivery, and tools/direct costs.
- [x] Work-sample value includes deliverables and judgment evidence from simulated scenarios, with hiring as the primary purpose and agreed terms for reuse.
- [x] First-person story, executive synthesis, pilot scope, candidate passport, research hypothesis, and HiringCafe proposal are retained.
- [x] Production build, release checks, obsolete-price scan, anchors, and contact verification pass. Original ProofPath source is unchanged.
- [ ] Live publication and browser verification. Exact mobile viewport checks remain subject to browser capabilities.

## Unlisted UFO timeline

- `/ufos/` must remain direct-link only, noindex, excluded from the sitemap and site navigation/search. No analytics initialization.
- Run `npm test` and `npm run build`; inspect `docs/ufos-research-audit.md` and the source-ledger limits.
- Test search, combined filters, date precision, oldest/newest, recently revised, clear/reset, anchors and restored URL state.
- Verify a successful Pages deployment and the actual live route separately from any automation claim.
- Scheduled publication must follow `docs/ufos-updates.md`; no automatic writes outside the dataset.

## YouTube library — September 19, 2026

- [x] `/youtube/` uses the existing visual design and an honest empty state; no saved-video source has been supplied or favorites inferred.
- [x] Data-backed cards support native YouTube links, optional source-grounded TL;DW summaries, takeaways, and separately supplied personal context.
- [x] Search, topic/length filters, sorting, empty results, and reset were exercised in an isolated build with clearly labelled synthetic entries. No fixture entries enter production.
- [x] Chromium checks passed at 320, 390, 768, and 1440px for empty/populated layouts and player sizing; no horizontal overflow. Desktop/mobile empty-page screenshots inspected.
- [x] Case/accent search, combined filters, 10/30-minute duration boundaries, unknown duration handling, sorting, escaped content, and no-JavaScript links passed.
- [x] Click-to-load privacy-enhanced iframe, direct fallback link, minimum player height, referrer policy, Escape/close teardown, and returned keyboard focus passed. No autoplay requested.
- [x] The initial route is noindex, excluded from the sitemap, and unlinked from the homepage. Existing site routes and release exclusions are preserved.
- [ ] Supply the actual public/unlisted playlist, selected links, or export; verify video content before writing summaries and confirm personal reasons before attribution.
- [ ] Real YouTube playback and per-video restrictions: external video requests were blocked during browser QA, so no actual playback is claimed.
- [ ] Live route verification after the GitHub Pages release.

## Tesla project archives — September 19, 2026

- [x] Owner requested the two live memory/portfolio pages; no additional publication confirmation needed.
- [x] Original public source recovered: Tesloco WordPress home plus 3 pages, Spec Tesla Cup home captures from 2022 and 2026 plus 19 supporting pages.
- [x] Local archival replay retains source copy, branding, images and styles with explicit historical/capture-date context.
- [x] All 25 preserved documents have no scripts, active forms or remote image loads; all rewritten local links/assets resolve. Original commerce/account/booking widgets are inert. Video destinations use original IDs.
- [x] Both routes compile and the existing release gates pass. Navigation, other routes and hosting stay intact.
- [x] Live desktop browser rendering inspected, recovered images load, Tesloco service-page selection works, and Spec Tesla Cup version selection updates the destination. Fixed the original theme’s viewport growth and inactive menu overlay. Exact 320/390/768/1440 viewport resizing is unavailable in this browser; no physical mobile test is claimed.
- [x] Successful GitHub Pages deployments and both live URLs verified. Raw-source backup separately retained.

### Screenshot collection import — September 19, 2026

This supersedes the initial empty-collection status above.

- [x] 48 unique screenshot selections represented in their supplied order; 47 original YouTube upload links matched by title, channel, and duration.
- [x] The four YouTube Movies editions are preserved. One Karlous Miller selection remains clearly pending with a search link, without an invented video ID or substituted upload.
- [x] Two TL;DW summaries use complete TED transcripts; 45 overviews identify creator-description, chapter, or listing provenance. Source links are visible in expandable notes. No personal per-video reasons were invented.
- [x] Public player metadata allows embedding for 43 entries. Four verified entries use native links because embedding is disabled or sign-in is required; the pending entry also has no embed.
- [x] Production build and release checks pass; existing UFO tests pass. Latest unrelated METSI, ProofPath, and UFO changes are retained.
- [x] Chromium verification with all 48 real selections: mobile topic dropdown and desktop topic buttons, combined search/topic/length filters, five short / seven medium / 36 long videos, shortest-first sorting, no results/reset, source notes, no-JavaScript links, and pending-link behavior.
- [x] Layout and player sizing checked at 320, 390, 768, and 1440px without horizontal overflow. Escape/close removes the iframe and restores focus. No iframe loads before a watch action.
- [x] Noindex, sitemap exclusion, and absence of inbound homepage/navigation links are preserved.
- [ ] Actual video playback across devices and regions. QA checks the player integration and metadata; it does not claim media playback. The test environment blocks some external media requests.
- [ ] Exact saved URL for Karlous Miller: “That's Funny” / LOL Network Stand-Up! / 31:19.
- [ ] Successful Pages deployment and independent live-route verification.

## ProofPath site-brand refinement — September 19, 2026

- [x] Replaced the page's white/navy/teal overrides with shared forest-green and ivory colors, Georgia serif display type, bronze numbering, and the site's button treatment.
- [x] Preserved the full proposal, current headline, contact destinations, and section anchors. Typography and layout changes are scoped to `/proofpath`; shared styles and `/tekmetric` are unchanged.
- [x] Production build and release checks pass. Text contrast is at least 4.5:1 for body, muted, accent, and reversed closing-panel text. No homepage/navigation links, sitemap entry, or analytics were added; noindex/nofollow remains.
- [x] Fluid typography, automatic headline wrapping, single-column narrow layout, and touch-friendly links retained; closing panel includes a readable print fallback.
- [ ] Post-deployment browser rendering and live asset verification. Exact 320/390/768/1440px viewport testing is unavailable through the current browser surface.
