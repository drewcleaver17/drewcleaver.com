# drewcleaver.com

Drew Cleaver's personal homepage, founder advisory, scheduling, and digital calling card.

Astro 6, Tailwind CSS 4, and MDX. Hosted on GitHub Pages using the existing GitHub Actions workflow.

## Develop and review

Use Node.js 22.13 or later.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The build generates static files in `dist/`. Work on a feature branch and review before merging. **A push to `main` deploys the public website automatically.** Do not manually run the deployment workflow for a preview.

## Where to edit

- `src/data/profile.ts`: public identity, contact email, booking URL, and inquiry endpoint.
- `src/data/experience.ts`: career highlights and dates, aligned with Drew's latest supplied résumé.
- `public/Drew-Cleaver-Resume.pdf`: public résumé download. The original supplied file contains a private phone number; only the public copy belongs in this repository.
- `src/pages/index.astro`: personal introduction, background, founder advisory, contact, scheduling, and open inquiry.
- `src/pages/hello.astro`: mobile calling card for the permanent QR destination.
- `src/pages/drew-cleaver.vcf.ts`: generated contact download from the shared profile.
- `src/pages/contact.astro`: inquiry form and submission states. Category and budget are optional.
- `src/pages/services.astro`: work-with-me page; the existing URL is retained.
- `src/pages/buildmine.astro`: unlisted seven-question website pilot, optional scheduling link, and local résumé text import.
- `src/data/buildmine.ts` and `src/scripts/buildmine.ts`: shared prompts, complete brief export, validation, and submission handling.
- `docs/BUILDMINE_PILOT.md`: operating procedure from intake to a reviewed client preview and approved launch.
- `src/layouts/Base.astro` and `src/styles/global.css`: shared navigation, metadata, responsive layout, and design.
- `src/features/writing/`: retained writing index and article templates.
- `src/pages/writing/[...path].astro`: optional writing routes, disabled through `src/config/features.ts`.
- `src/content/writing/`: approved posts only. New posts default to drafts. Working `.md` and `.mdx` files are ignored by Git.
- `scripts/check-release.mjs`: runs during every build and rejects public writing output or links for this release.

The public email, Calendly URL, and Formspree endpoint are retained from the existing site. There is no account system, payment collection, custom backend, or newsletter signup. The form sends directly to Formspree and works without JavaScript through its normal submission page. Confirm actual delivery with the owner before release.

## Repeatable release process

1. Record audience, outcomes, and verified content in `BRIEF.md`.
2. Update the public profile and copy. Never invent testimonials, metrics, photos, phone numbers, or social links.
3. Build on a feature branch; retain working routes and deployment configuration.
4. Check the build, routes, accessibility, narrow layouts, inquiry states, and contact file.
5. Present a preview and record the owner's feedback in the release checklist.
6. Obtain approval to publish, merge to `main`, check deployment, and verify the public site.
7. Print cards only after scanning a test QR to `https://drewcleaver.com/hello` and saving the contact on a real phone.

See `AGENTS.md` for implementation constraints and `RELEASE_CHECKLIST.md` for current verification status.

## Private writing and later publication

Writing is disabled at build time: neither `/writing` nor article URLs are generated. The AI sample has been removed from current source. This repository is public; a draft flag or hidden navigation does not make committed text private. Keep work in progress in private storage outside this repository. Previous public commits may still contain the removed sample; this release does not rewrite history.

When Drew explicitly approves publishing his own writing: copy only approved final posts into `src/content/writing/`, set their `draft` fields to `false`, intentionally add those files to Git, enable the writing flag, update the release check, and restore the desired navigation. Review the generated output before deployment. Do not change the flag just to preview private drafts on a public host.

## Updating the résumé

Use the latest file supplied by Drew as the source for role titles, dates, employers, and figures. Keep the original in private storage. Prepare and inspect a public PDF copy that removes the phone number from visible text, embedded text, and contact links while retaining the résumé's career content. Replace the stable public PDF, update the shared experience data, build, and check every download link. The current public résumé reflects the September 2026 source; its contact header uses `drew@drewcleaver.com`.

SMS contact exchange is deferred: Drew requested free-only implementation, and the checked SMS verification services require paid usage or a billing-enabled plan. Do not add a paid service without authorization.

## Build mine pilot

`/buildmine` is available by direct link and excluded from navigation and search indexing requests. It is publicly reachable, not password protected. It sends answers and reviewed résumé text through the existing Formspree endpoint; it does not upload the original PDF/TXT file or generate a website automatically. Drew handles review and preview creation with his existing AI workflow. The form’s saved brief provides a complete fallback for long submissions or provider failures. See the pilot procedure for privacy, consent, service limits, and launch handoff. Never commit participant data to this repository.
