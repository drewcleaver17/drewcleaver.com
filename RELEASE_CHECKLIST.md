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
