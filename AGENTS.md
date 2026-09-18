# Implementation guidance

- Read `BRIEF.md` and the release checklist before changing the site.
- Preserve Astro, Tailwind, MDX, public contact routes, and GitHub Pages deployment unless the owner requests a change.
- Work on a feature branch. A push to `main` publishes; preview work must not trigger deployment.
- Update `src/data/profile.ts` for shared public identity and contact settings. Never add secrets to the static site.
- Keep a permanent `/hello` route and generate the vCard from shared profile data.
- Design narrow screens first, with readable text, visible keyboard focus, labeled fields, and touch-friendly controls. Check 320, 390, 768, and 1440 px widths when browser access is available.
- Keep inquiry category and budget optional. Preserve the visitor's message after submission failures and allow direct email as an alternative.
- Use verified personal facts. Do not invent assets, metrics, booking links, social accounts, or testimonials.
- Run a production build and check changed routes and behaviors. Record unverified checks honestly; do not label simulated delivery as actual inbox delivery.
- Show a concrete preview before requesting publication approval. Do not send test inquiries to external recipients without authorization.
- Writing is disabled for this release. Keep its templates, but do not generate its routes, link to it, or commit private drafts to this public repository. Future writing publication requires an explicit owner instruction.
