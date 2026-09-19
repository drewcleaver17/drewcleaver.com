# Buildmine 1.0.0 — implementation and maintainer notes

## Shipped scope

`/buildmine/` is now public and appears in the site footer and sitemap. This
release's explicit authorization supersedes the earlier unlisted-only rule
for **Buildmine only**. `/preview/`, the fictional named demo, and unrelated
unlisted projects remain noindex. Writing remains disabled and Analytics
remains paused. Builder and publishing-guide routes never initialize Analytics.

Visitors can start blank or import/paste a résumé, answer seven optional
questions, edit public fields, choose one of three styles, review, download a
complete portable kit, and follow instructions to publish in their own account.
A private `.buildmine.json` project preserves complete résumé text, all answers,
style preference and public edits; it can be restored locally. Nothing autosaves
or uploads. The older readable `.txt` brief is not an importable project.

There is no AI-writing service, customer account, backend intake, payment flow,
or automated customer publishing. The résumé parser matches headings and keeps
source wording; it is not a privacy redactor. Public contact fields start blank.
Questions are private direction notes, not public copy or interpreted commands.
Only the style question's keywords choose a preset. Every extracted field must
be reviewed by the visitor. All seven questions remain optional and uncapped.

## Architecture

- `starter/core.mjs`: public schema v2, private project schema v1, strict field
  projection, safe renderer, complete static files, ZIP creation, snapshot codec.
- `starter/styles.css`: shared local styles for Editorial, Studio, Technical.
- `src/lib/buildmine-kit.ts`: explicit allowlist of redistributable source/docs.
- `src/scripts/buildmine.ts`: editor, save/import, review state, exports.
- `src/lib/site-preview.ts`: unchanged legacy public schema v1 renderer/codec.
- `/preview/`: recognizes v2 and falls back to v1. Snapshots stay in URL fragments.
- `/buildmine/starter.zip`: example kit; includes generator version/provenance.
- `/buildmine/buildmine-starter-1.0.0.zip`: versioned first-release download.
- `/p/alex.rivera.example/`: visibly fictional static example from the same
  public schema and renderer, with About, Hello, and local CSS.
- `/buildmine/publish/`: public publishing guide. Kit DEPLOY.md is portable.

The preview combines sections in one frame; the full kit creates separate
pages where content warrants them. Empty optional pages are absent. `site/`
contains only deployable output. The source generator has no runtime packages
and runs on Node 22.13+. The parent site remains Astro/Tailwind/MDX.

## Privacy and publication contracts

Editing a public field, layout or credit invalidates approval and hides the
previous share link. Import never restores approval. Review is required for
ZIP, single HTML, and snapshot exports. Only allowlisted public fields enter
site.json and generated pages; original files and answers never enter the kit.
Public text is escaped; themes are fixed; URL schemes and emails are validated.
Preview frames are sandboxed with no same-origin or script privileges. Exported
pages have a restrictive CSP, no tracking, no runtime script, no remote fonts,
and no external assets. Optional links only navigate when clicked.

Snapshot links can be forwarded and cannot be individually revoked. Their
9,000-byte JSON limit fails explicitly with a download alternative, never
truncation. Projects and ZIPs preserve long input. Local backups contain private
data; a visitor must store them accordingly. Names and paths prove no identity.
Do not commit participant résumés, projects, approvals or private contacts.

## Source, licensing and repository fallback

Only `starter/` and its generated structure are MIT-licensed. The extracted
code is the newly authored template/renderer and locally authored styles.
The kit includes no photographs, fonts, résumé, recovered archives, business
marks or copied personal writing. No third-party runtime assets/dependencies
are redistributed. The parent site's PDF parser remains its existing dependency
and is bundled only into the builder, not into users' kits. See the kit's license
and THIRD_PARTY_NOTICES.md; do not apply MIT to the entire personal repository.

The connected GitHub tools can update existing repositories but cannot create
or configure a repository/template. The release therefore uses `starter/` in
the existing repository plus a versioned ZIP. To establish the preferred
`personal-site-starter` repository later: create a new public repository in
Drew's account, copy **only** starter files to its root, set default branch main,
and optionally check Settings → General → Template repository. Update SOURCE,
the profile link, and documentation only after the real repository exists.
Template-created repositories have independent history; they do not increase
an upstream fork count. No star, fork, testimonial or referral is required.

## Named publishing: exact current boundary

Only a fictional fixture is hosted. `namedPath()` validates the dotted
namespace; generated relative links work under that prefix. No endpoint accepts
publication requests or lets a stranger reserve, edit or delete a page. There
is no live claim that a name is owned. Maintainers change/remove the fictional
fixture in source and deploy through a reviewed PR. Removing files does not
erase Git history, caches or downloaded copies.

Automatic customer hosting needs a connected, suitable hosting/backend account
with authenticated record ownership and permission to operate this service.
No such publishing service is connected for this release. GitHub Pages remains
the source/demo host, not a commercial multi-customer hosting platform. The
precise next stage is in [BUILDMINE_HOSTING_DESIGN.md](BUILDMINE_HOSTING_DESIGN.md).
Do not enable participant publication by merely adding a public GitHub write
credential or a Publish button. Self-publishing in a user's own account works
with the documented setup; automatic hosting here is future work.

## Verification and operations

`npm run build` runs schema/export tests, existing content validation, Astro,
release checks and production-bundle DOM tests. `npm test` keeps the existing
UFO tests. A PR workflow runs both. Coverage includes UTF-8, long inputs, escaping,
private/public projection, blank starts, all themes, approval invalidation,
invalid-file recovery, project restoration, TXT import, old snapshots, relative
links, ZIP CRCs and regeneration of the exported kit without dependencies.

The ZIP is independently checked with Python's standard zipfile reader. A local
publishing rehearsal follows DEPLOY.md and compares the regenerated files at a
domain root and repository subpath. This is not a claim that a new customer
GitHub account/repository was provisioned. Final live checks use the existing
Pages deployment and the actual downloaded kit.

Visual browser checks and their actual limits belong in the PR/release report;
DOM tests cannot establish pixel layout at 320/390/768/1440. Keep this distinction
when reporting validation. Any skipped visual sizes must be disclosed.

Merge through the existing Pages workflow, check the Actions result and live
routes. For rollback, revert the release's merge commit and let the same workflow
redeploy; preserve any subsequent unrelated edits. Increment starter VERSION,
package version, provenance, changelog and versioned download path together for
future releases; avoid changing the meaning of released snapshot schemas.

## Honest measurement and five-volunteer test

No analytics, counters or telemetry are added. Creation, export, successful
publication, and continued use are distinct outcomes. If measurement is later
authorized, record only aggregate event counts with consent where appropriate;
never résumé text, answers, public-field contents, contact details, slugs or
snapshot fragments. A file download is not proof of a published site or a user
helped. Template copies are not GitHub forks. Do not infer outcomes from either.

Use [BUILDMINE_USABILITY.md](BUILDMINE_USABILITY.md) with five consenting volunteers.
There has been no recruitment and no results are claimed. A showcase is opt-in:
the person sends an already-public URL and explicit permission to list name/link
through Drew's existing contact route; removal uses that same route.
