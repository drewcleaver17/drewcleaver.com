# drewcleaver.com

Drew Cleaver's personal homepage, writing, founder advisory, and digital calling card.

Astro 6, Tailwind CSS 4, and MDX. Hosted on GitHub Pages using the existing GitHub Actions workflow.

## Develop and review

Use Node.js 22.12 or later.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The build generates static files in `dist/`. Work on a feature branch and review before merging. **A push to `main` deploys the public website automatically.** Do not manually run the deployment workflow for a preview.

## Where to edit

- `src/data/profile.ts`: public identity, contact email, booking URL, and inquiry endpoint.
- `src/pages/index.astro`: personal introduction, background, founder advisory, writing, open inquiry.
- `src/pages/hello.astro`: mobile calling card for the permanent QR destination.
- `src/pages/drew-cleaver.vcf.ts`: generated contact download from the shared profile.
- `src/pages/contact.astro`: inquiry form and submission states. Category and budget are optional.
- `src/pages/services.astro`: work-with-me page; the existing URL is retained.
- `src/layouts/Base.astro` and `src/styles/global.css`: shared navigation, metadata, responsive layout, and design.
- `src/content/writing/`: MDX posts. A post's filename becomes its URL; `draft: true` excludes it from the index and generated routes.

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
