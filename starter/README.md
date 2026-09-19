# Buildmine personal-site starter

A small, portable personal website you can understand, edit, and host yourself.
Three visual directions, no runtime JavaScript, no framework, no tracking, and
no paid dependency. Home, About, and Hello pages are generated when their
content is present. Blank sections are omitted.

**Try the builder:** https://drewcleaver.com/buildmine/

**Fictional example:** https://drewcleaver.com/p/alex.rivera.example/

## Start here

1. Download your reviewed kit from Buildmine and unzip it. Or download the
   example kit at https://drewcleaver.com/buildmine/starter.zip.
2. Open `site/index.html` to inspect the ready-built site, if included.
3. Edit `site.json` with your own public text. Keep `version: 2`, choose
   `editorial`, `studio`, or `technical`, and set `credit` to true or false.
4. Install Node.js 22.13 or later; run `node generate.mjs` in this directory.
   No npm install is required. The command replaces only `site/`.
5. Preview `site/index.html`, then follow [DEPLOY.md](DEPLOY.md).

The source lives inside Drew's existing repository at
https://github.com/drewcleaver17/drewcleaver.com/tree/main/starter.
To use it from a clone, copy **only `starter/`** into a new directory/repository.
A fork of the parent repository includes Drew's unrelated site and is usually
not what you want. There is no separate GitHub template repository yet.

## Files you own

- `site.json`: your selected public copy and settings; no private answers.
- `styles.css`: local styles, system fonts, no external font requests.
- `core.mjs` and `generate.mjs`: dependency-free source and renderer.
- `site/`: generated HTML and CSS, safe to serve as a static site.
- `provenance.json` in exported kits: generator version and upstream source.
- `.github/workflows/pages.yml`: optional deployment in your own GitHub repo.

The browser's `.buildmine.json` project and `.txt` brief contain private
résumé/background answers. Never upload those files or your source résumé to
a public repository. The generated `site.json` is deliberately public.

## Customization and attribution

You own your content. You may remove the visible Buildmine footer by setting
`credit: false`. Preserve the MIT copyright and license notice when distributing
the software. The license applies to this starter directory and its generated
structure, **not** to Drew's personal photos, résumé, writing, brand assets, or
other files in the parent repository. No such assets are in this starter.

Raw HTML in text fields renders as text. Contact links accept http/https
scheduling URLs and email addresses; no forms, analytics, arbitrary scripts,
or databases are included. Do not place passwords or secrets in site.json.

See [CUSTOMIZE_WITH_AI.md](CUSTOMIZE_WITH_AI.md), [CONTRIBUTING.md](CONTRIBUTING.md),
and [CHANGELOG.md](CHANGELOG.md). Run `node --test core.test.mjs` to check the
renderer. This is a v1 release, not a promise of managed hosting or support.

## Public content schema (version 2)

| Field | Meaning |
| --- | --- |
| `name` | Required public display name |
| `headline` | Short introduction |
| `bio`, `experience` | About-page text; leave blank to omit |
| `highlights` | Selected work on the home page |
| `email` | Optional explicitly public email |
| `booking` | Optional complete http/https scheduling URL |
| `theme` | `editorial`, `studio`, or `technical` |
| `credit` | Boolean controlling optional visible attribution |

All copy fields are plain strings; HTML is displayed as text. Preserve newlines
inside JSON strings as `\n`. Every color, spacing and type rule lives in
`styles.css`; no site text belongs in that file. Do not edit generated files
unless you are happy for `node generate.mjs` to replace them next time.

## Troubleshooting and moving hosts

- **Workflow does not run:** confirm the workflow file is at the exact hidden
  path, Actions is enabled, and your branch is named main; then run it manually.
- **Deploy asks for a Pages site:** select GitHub Actions in Settings → Pages.
- **404 or missing styles:** upload the contents of site/, preserve directories,
  and use the exact URL from your host. Do not flatten about/ or assets/.
- **Invalid JSON:** check quotation marks, commas and escaped newlines. Your old
  generated site is retained when input validation fails.
- **Missing About/Hello:** fill the related text/contact fields and regenerate.
- **Move hosts:** retain your source kit, regenerate, upload site/ to the new
  static host, then connect your domain there. No Buildmine account is needed.

If a separate template repository is created later, **Use this template** makes
an independent repository; a fork retains the upstream relationship. Template
copies do not increase the original fork count. This release is provided as a
scoped source directory and ZIP, so create a new repository using the kit.
