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
