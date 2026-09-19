# Personal homepage and digital calling card

## YouTube library addition

Drew requested `/youtube` as a browsable library of his saved favorite videos with TL;DW summaries, personal context, native YouTube links, and embedded viewing when allowed. Build within the existing Astro/GitHub Pages site. On September 19, 2026, Drew supplied seven Watch Later screenshots containing 48 distinct selections to share with friends and family. Preserve their order and variety. Keep the route unlinked from the homepage and noindex. Search, topic/length filters, sorting, expandable notes, and click-to-load privacy-enhanced playback are implemented. Do not represent this as a connected or automatically synchronized YouTube account. Summary source and Drew's personal reason for saving a video are separate fields.

The populated release has 47 verified original upload links and one clearly marked Karlous Miller selection awaiting its exact URL. Two TL;DW summaries use complete TED transcripts; the other notes are labeled overviews with description, chapter, or listing provenance. Do not infer individual reasons for saving videos or quote the private wording of the collection's motivation on the page.

Source: DrewCleaver_Website_Release_SOP.md, version 1, followed by Drew's approval of the preview and instruction to remove public writing, emphasize contact and scheduling, retain writing infrastructure, and deploy.

## Audience and purpose

A personal homepage for curious Reddit readers, with a clear path into founder advisory and open-ended inquiry. Introduce Drew as a person with a real background; let readers learn his background, reach out, schedule a conversation, or discuss working together.

Communicate curiosity, experience building Higher Hangers, enterprise sales background, and practical interest in AI. Preserve the green and ivory palette. Avoid a corporate consulting pitch, employment-first framing, fabricated claims, or placeholder testimonials.

## Required outcomes

- `/`: personal introduction, background, founder advisory, scheduling, and an open door to other inquiries.
- `/hello`: warm mobile calling card with a real contact download, email, background, and work links.
- `/contact`: free-form inquiry with optional category and budget. Pay-what-you-want proposals are welcome; scope and price are agreed before work begins.
- Writing templates and the MDX collection remain available for future work. No writing index, article URL, sample, or public writing navigation is deployed. The services route becomes a coherent work-with-me page.
- Public identity and contact settings live in one shared profile. No phone number, résumé download, or new social profile is invented.

## Boundaries

The preview was approved; publication is authorized after removing public writing and focusing on contact and scheduling. No DNS changes, card printing, marketplace, ProofPath platform, hiring platform, login, payments, or custom backend in this release.

Use `drew@drewcleaver.com`, the existing Formspree endpoint, and the existing Calendly link. Actual inbox delivery, calendar availability, and device contact import remain checks for the owner. Experience facts now follow Drew's supplied September 2026 résumé; the homepage keeps its personal introduction and avoids numerical claims.

## Stable printed link

QR payload: `https://drewcleaver.com/hello`. Keep this address working permanently so printed cards remain useful as the page changes.

## Writing privacy

Do not commit unpublished drafts to this public repository. The AI sample is removed from current source, but past public commits are not erased. Writing publication requires a later explicit instruction; the site launch approval does not authorize publishing samples or drafts.

## Résumé and contact exchange update

Publish a downloadable résumé and align the experience page with the September 2026 source. Keep the phone number private by removing it from the public PDF copy; preserve the original outside the public repository. Download links belong on About, `/hello`, and the shared footer. Preserve the contact/advisory focus.

Only implement SMS verification if it requires no paid service. Twilio Verify charges for production use and Firebase SMS requires a billing-enabled plan, so the phone exchange is skipped for this release.

## Build mine pilot

Drew requested a directly accessible `/buildmine` pilot without a homepage link: seven open-ended questions, résumé input, individual creative direction with an easy option to start from Drew’s style, a domain discussion, and optional scheduling. Answers have no application word/character cap. Use the existing Formspree inquiry endpoint, local PDF/TXT-to-text import, and a complete text export instead of adding paid file storage. Explain that Drew reviews submissions and creates previews using his AI workflow; this version does not promise instant automatic generation. Request participant approval before public launch. Keep the route out of navigation and add noindex metadata. Keep all submitted personal information out of this public repository.

## Instant starter revision

Drew asked for automatic previews, optional questions, shareable pages, and an eventual domain/export purchase flow. Cloudflare installation was declined; continue with connected capabilities. The current GitHub Pages pilot therefore creates an instant browser-local starter using conservative résumé section extraction and three distinct preset layouts. It does not call an AI model or interpret arbitrary directions. All seven questions are optional and preserved in the private downloadable brief.

Only the reviewed public site schema enters a share URL at `/preview/#...` or a standalone HTML export. Preview links carry immutable snapshots, are not authenticated, can be forwarded, cannot be individually revoked, and have a length limit; inputs and full exports have no application text cap. Private answers and original files are not sent to Formspree or committed. Contact details are explicitly added in the public editor. The homepage stays unlinked to the pilot, writing remains disabled, and `/hello` stays permanent.

This is the connected-capability pilot, not the complete requested hosted AI service. Permanent named paths, accounts/ownership, AI generation, custom-domain routing/TLS, payment verification, and ongoing hosting need a separately connected backend and product decisions. No provider, billing plan, price, or payment account is activated.

## Social links and saved contact update

Drew explicitly approved building and publishing LinkedIn and Instagram links on `/hello`, using `https://www.linkedin.com/in/drewcleaver` and `https://www.instagram.com/drew.cleaver/`. Place them together below the main contact actions, using the existing site styling. Display Austin, Texas, USA on this calling card.

The saved contact must retain the public email and include the website, both social profiles, scheduling, and other useful `/hello` links. Use vCard 4.0 for a July 17 birthday with no year (`BDAY:--0717`). Store city/state/country without inventing a street or postal code. The birthday belongs in the downloadable card, not the visible page. Keep the permanent QR/contact URLs intact. Native Apple/Google contact import remains a device check; successful file validation is not proof of native import behavior.

## Contact card polish

Drew requested four revisions after reviewing the live page and imported contact: label the green button exactly “Save My Contact Card”; remove the explanatory text under the email button; make Instagram and scheduling part of one continuously spaced link list; and remove the résumé from the downloadable contact. Keep the résumé available on the website and preserve the card's birthday, location, email, and other links. Publish these revisions through the existing release process.

## Uniform /hello buttons

Drew approved replacing the mixed buttons/text links with one stack of matching green buttons. Priority: Save My Contact Card, Schedule a conversation, Send an inquiry, Send me an email, Connect on LinkedIn, Follow on Instagram, A little about me, Download my résumé (PDF). Keep the established green button appearance, consistent spacing and full-width touch targets. This changes the page presentation only; the downloaded contact continues to exclude the résumé. Publish live.

September 19 update: Drew supplied `https://github.com/drewcleaver17` and asked to add GitHub first or last using editorial judgment. Add “Explore my GitHub” as the last matching green button, preserving contact and scheduling priority. Keep its URL in the shared profile and include it in the downloadable contact per the standing request to retain social links there.

## Free analytics and search visibility

Drew requested Google Analytics and useful free additions, and clarified that the earlier Cloudflare connection attempt encountered approval errors. Use GA4 standard and Google Search Console, with the existing host and DNS. Keep analytics optional and exclude private builder inputs and shared drafts. Add a public sitemap, privacy information, and an owner-supplied Search Console verification tag. Do not invent property IDs, activate a paid plan, or claim data collection before a real Google property is connected. Account setup and verification status are recorded in `docs/ANALYTICS_SETUP.md`.

## Unlisted motorsport story pilot

Drew requested a personal motorsport page based on his supplied history, from his family's 1995 IMSA outing at Texas World Speedway through karting, amateur endurance racing, time attack, sponsorship, and hospitality. Publish the directly accessible pilot at `/motorsport/` without inbound site links or a sitemap entry, and with noindex/nofollow metadata. Unlisted is not password protected. This is an explicitly requested biographical page, not a launch of the disabled writing section.

Use a first-person narrative, the existing green/ivory palette, and a readable mobile layout. No photography or empty image placeholders in the pilot. Keep independent chapters so real photos and captions can be inserted later. Treat Drew's account as the source; avoid inventing dates, results, team names, car models, sponsorship terms, or driver roles. Approximate 2001 dates stay approximate. Publication does not claim independent archival verification of the supplied racing results or historic-first claim. See `docs/MOTORSPORT_PILOT.md` for source and photo-expansion notes.

Google Analytics setup is paused at Drew's request; leave the inactive integration intact for him to resume from his computer later.

## Unlisted ProofPath concept brief

Drew approved the revised 12-slide ProofPath pitch and requested a mobile-optimized, continuously scrollable version at `/proofpath`, published live without homepage or navigation links. The September 19 visual revision brings the approved narrative into the main site's forest-green and ivory palette, Georgia serif headings, restrained bronze accents, and shared button styling. Keep large readable type, continuous sections, and the headline about demonstrated work, competency, and technical aptitude. This replaces the original deck-derived white/navy/teal appearance for `/proofpath` only. Keep it out of the sitemap, use noindex/nofollow, and exclude analytics through the existing unlisted-page handling. The direct link is public, not password protected.

The current concept uses a fixed employer-funded recruiting mandate, paid assessments of at least $100 on agreed completion, a 48–72 hour return window with a defined effort cap, a supplied and disclosed recorded workspace, AI use, and a free reusable candidate passport. Employers retain final hiring decisions. Evidence reuse and research require permission. Preserve the illustrative economics and proposed pilot as assumptions; do not imply traction or a HiringCafe partnership. This page is a concept brief, not a working hiring platform. Use the shared public email for the invitation to discuss a pilot or partnership.

## Unlisted Tekmetric pilot proposal

Drew explicitly requested a separate, live `/tekmetric` adaptation of ProofPath for a Tekmetric pilot, retaining HiringCafe in the proposed partnership. Use the approved continuous white/navy/teal reading layout. Keep the new route unlinked from all site pages and navigation, out of the sitemap, noindex/nofollow, and excluded from analytics. Preserve `/proofpath` as published. Direct access is public, not authenticated.

Pitch a proposed four-week engagement for one sales enablement requisition, selected with Tekmetric, and up to ten paid assessments. Use realistic shop-owner questions, approved product material, a two-hour total effort cap, a 48–72 hour written-work window, permitted AI use, and a brief live coaching exercise. Deliver a human-reviewed evidence packet and shortlist; Tekmetric retains the final decision. The free passport, research loop, managed workspace, and future infrastructure stay accurately distinguished from an existing platform.

The current Tekmetric compensation approach leads with paid work and terms agreed upfront. The proposed minimum is $100, with higher compensation for deeper or specialized assignments and no implied ceiling. Compensation reflects expected effort, complexity, specialization, and agreed reuse. State scope, effort cap, amount, and payment timing before participation; pay the same agreed amount for the same assignment and terms on completion regardless of score or hiring outcome. More extensive work requires its own scope and compensation. The submission window is not the expected workload.

The initial illustrative fixed pilot price and allocation have been withdrawn from the Tekmetric page. Agree on the role, candidate count, assignment depth, sourcing, review responsibilities, and permitted uses before approving a written scope and capped budget. Identify candidate pay separately and reserve it; distinguish ProofPath's delivery fee from tools and other direct costs. Candidates pay no participation fee. The scorecard measures spend against the agreed cap.

Each assessment produces a deliverable and evidence of judgment, even with a simulated customer. Hiring evidence is the first pilot's primary purpose; potential training, onboarding, and research benefits require validation and appropriate permission. Planned reuse is agreed before participation and reflected in compensation, and additional uses require permission. Preserve candidate control over sharing and Tekmetric confidentiality. This is a refinement of `/tekmetric` only; `/proofpath` retains its approved illustrative model.

Tekmetric product, FAQ, careers, and partnership pages and HiringCafe's about page supply the linked company context. No current vacancy, customer pain metric, partnership, endorsement, or technical integration is asserted. HiringCafe participation is optional for the first pilot; future service-advisor use by shop customers is a separate hypothesis. This is a proposal from Drew, not a Tekmetric publication or commitment. Contact uses the shared public email.

### Story-led Tekmetric opening

Drew requested an opening story and executive synthesis explaining his interview experience: struggling to demonstrate ability in roles where he believes he could deliver exceptional results, and identifying a mismatch between live, on-camera answers and the research, thought, drafting, editing, and AI use available for written work. Publish that account in first person as his working explanation, without claiming to know why particular employers rejected him. Explain the solution before the pilot mechanics: paid realistic work, visible AI judgment, and consented research into patterns that could improve assessments, training, and onboarding. Retain the Tekmetric pilot and HiringCafe proposal. The feedback loop is a hypothesis to test, not an established predictive model.

## Tesloco and Spec Tesla Cup website preservation — September 19, 2026

Drew requested live memory/portfolio pages at `/tesloco/` and `/specteslacup/` showing the original websites and their working vision/versions. Preserve the original branding, copy and imagery using surviving WordPress and dated Internet Archive captures. Use a small wrapper in the existing green/ivory visual style with a version/page selector and a full-page preserved-view link. Do not replace source copy with an invented new business pitch. Identify capture dates separately from content revision dates and keep historic commercial claims contextualized. Disable original scripts, analytics, forms, booking, checkout and account actions; store recovered assets locally. Keep homepage/nav untouched and initially noindex. Preserve GitHub Pages hosting. Publication is authorized by the current request to make these pages on drewcleaver.com.

## Independent Direct Primary Care concept

Drew authorized revision and live publication of `/dpc/` as “Direct Primary Care: A Physician-Owned Growth Model.” Preserve his authorship and the green/ivory design, remove practice affiliation, and leave founder roles and ownership undecided. Keep the page unlisted/noindex and out of navigation/sitemap. Forward `/metsicare/` and its PDF readers to the revised material. The original 56 assumptions remain as a labeled reference; the 70-input tool adds launch cash timing and validated legacy migration. No automatic transmission, backend or patient data. See `docs/DPC_CONCEPT.md` and `docs/dpc/SOURCES.md`.
