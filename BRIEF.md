# Personal homepage and digital calling card

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
