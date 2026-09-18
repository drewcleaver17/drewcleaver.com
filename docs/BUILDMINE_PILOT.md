# Build mine — repeatable pilot procedure

## What is working

Direct route: `https://drewcleaver.com/buildmine/`. Unlisted from the homepage and normal navigation; noindex requested. These are discoverability choices, not access control.

1. Enter a public name and import a PDF/TXT résumé, or paste text. The file stays in the browser; no intake is sent automatically.
2. Answer any of seven open-ended questions, including none. These are direction notes, not approved public copy. There are no application text caps. The style question offers Drew's look or another direction.
3. Create an instant starter. Conservative section matching recognizes summary/profile and experience headings, omits common contact lines, and preserves source wording. It is not AI generation or reliable redaction. Unrecognized sections remain blank instead of inventing content. Every extracted field is editable.
4. Review public name, headline, about, experience, selected work, contact email, and scheduling URL. Switch between Editorial, Studio, and Technical compositions. Contact fields start blank; private brief answers never populate public content automatically. Only preset-related style keywords affect generation; other answers stay in the private brief for later tailoring.
5. Approve the public fields. Create a share link, download the site, or both. Editing a public field resets approval and hides the obsolete share link. A previously copied snapshot remains unchanged.
6. Save the private brief separately before leaving. It includes all original answers, résumé text, and any edited site draft. Nothing autosaves or persists to a backend.
7. If desired, email Drew to discuss a tailored build or launch. The pilot does not automatically notify Drew or promise a human follow-up.

## Share and export contracts

- `/preview/#<encoded-public-schema>` renders a full-page sandboxed preview of the approved site. It is a snapshot encoded in a URL, not a permanent named page or editable server record. Anyone with the link can read and forward it. It cannot be individually revoked. Links are not encrypted or suitable for private data.
- Only the allowlisted public schema is encoded. The private résumé, question answers, planning boundaries, and source file are not included unless the participant explicitly pastes that material into a public field and approves it.
- A 9,000-byte public JSON limit keeps encoded fragments at or below 12,000 characters. Messaging clients can impose tighter limits. The interface refuses oversized links and offers a full export; it never silently truncates text.
- `index.html` is a complete single-page site with inline CSS, working section navigation, email/scheduling links, and no external fonts, scripts, form service, or tracking. The approved export allows search indexing. Upload it to a suitable static host; no build process is required. It does not contain separate `/about` or `/hello` files yet.
- The renderer escapes every text value, allows only fixed theme identifiers, validates email and HTTP(S) booking URLs, and blocks embedded scripts/resources with CSP and iframe sandboxing. Embedded anchors explicitly target `about:srcdoc`; export anchors target the local document.
- Keep the schema/version and legacy viewer compatible when changing the renderer. Existing links otherwise break or change appearance. An owner can remove the viewer as a whole, but it cannot delete a snapshot from someone else's history or downloaded copy.

## Recommended business model

Start with a free usable preview and export. Offer an agreed one-time fee for bespoke refinement and launch. Sell the judgment, design, domain setup, and support, rather than relying on the idea that visible HTML cannot be copied. Add optional recurring managed hosting only after understanding support demand and ongoing cost.

No prices or checkout are published in this pilot. A future payment flow must verify payment on the server before granting paid entitlements; a browser checkbox or success redirect is not payment verification. Keep payment information with a payment provider, never this static site.

## The complete automatic product — next stage

Drew's original goal goes further than this static-host prototype. It needs:

1. A connected backend capable of private draft storage, owned records, rate limits, and background generation. Cloudflare installation was declined for this request. No replacement provider or paid account has been activated.
2. A server-side AI model producing a validated public site schema from résumé plus optional directions. Bound its cost and context size; retain full input and report capacity limits rather than silently truncating. Never put API credentials in a browser or a public repository, and never treat résumé text as executable model instructions.
3. An owner access mechanism and explicit publication approval. Start with an opaque private draft ID; reserve a collision-safe human-readable slug only when the owner publishes. Implement deletion, expiration, and abuse reporting before open public user hosting.
4. Named routes such as `/p/first-last/`, `/p/first-last/about/`, and `/p/first-last/hello/`. A namespace avoids conflicts with Drew's existing routes; names alone do not authenticate owners.
5. Optional domain connection: DNS targets a host, not a URL path. A domain redirect can send visitors to a Drew-hosted page but changes the visible address. Keeping the customer's domain visible requires host-based routing, verified domain ownership, and TLS certificates. Prefer customers registering and owning their own domains.
6. Optional payment-backed export or managed launch. Decide the offering, price, refund/support terms, and payment provider before enabling checkout. A paid export should include all pages/assets plus plain hosting instructions. Hosting subscriptions need an ongoing operating model.

Do not put a paid website-builder SaaS on GitHub Pages. Its published usage limits prohibit using Pages primarily for commercial transactions or commercial SaaS: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits. The current release is a free, browser-local experimental tool on Drew's personal site, with no payment processing or server-hosted participant records. Reassess hosting before commercialization.

## Human-assisted refinement SOP

When a participant explicitly asks for help:

1. Have them send their saved brief and/or share link. Do not assume preview creation submitted their details.
2. Confirm the goal, audience, visual direction, public contact fields, omissions, and scope. Resolve ambiguous résumé facts instead of inventing copy, achievements, or testimonials.
3. Use the résumé as source material and optional answers as instructions. Build a distinct design where requested; the three presets are starting points.
4. Present a real preview, test narrow and wide layouts, contact links, and downloads, and get approval for the exact public content.
5. Agree any fee, domain ownership, hosting responsibility, and ongoing support before buying services or publishing under a customer's identity.
6. Deliver the portable source and deployment notes or manage hosting under the agreed arrangement. Keep private source material outside the public repository.

## Verification for this revision

Production build and structural checks cover seven HTML pages, retained contact/vCard routes, no writing, and an unlisted/noindex pilot. Focused DOM and renderer checks cover resume-only generation, all seven optional questions, privacy separation, style selection, Unicode snapshots, malicious text/URLs, missing/malformed links, review gating, stale link invalidation, complete long-text exports, and no external submissions. Existing résumé import behavior remains in its unchanged module.

A browser check of the deployed route must verify rendering and real navigation within the sandboxed preview. Exact outer-page mobile viewport checks remain unverified when the available browser has no resize control. Do not claim those checks from CSS inspection or DOM simulations alone.
