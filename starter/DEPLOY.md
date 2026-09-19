# Publish your site

You can download and preview a complete site without an account. Publishing
requires a hosting account you control. A custom domain is optional and usually
costs money. Buildmine does not purchase domains, configure DNS, or hold your
tokens. Check your provider's current terms and quotas before publishing.

## GitHub Pages: your own public repository

GitHub Free supports Pages from public repositories. Pages is intended for
static project/personal sites; it is not a free platform for operating a
commercial SaaS, ecommerce business, or hosting arbitrary customers.

1. Create a **new public repository** in your GitHub account. Use any project
   name, or `YOUR-USERNAME.github.io` for your account's root site.
2. Put the kit's source files at the repository root (not inside another folder).
   Include `site.json`, `styles.css`, `core.mjs`, `generate.mjs`, `LICENSE`,
   `package.json`, `core.test.mjs`, and `.github/workflows/pages.yml`.
   GitHub's web file picker may hide dotfolders: use Git, or create the workflow
   with **Add file → Create new file** and its full path. The `site/` folder can
   remain uncommitted: the workflow regenerates it.
3. In **Settings → Pages → Build and deployment → Source**, select
   **GitHub Actions**. This setting is a manual step; the kit cannot enable it.
4. Run the included **Publish personal site** workflow from Actions, or push
   another change to `main`. If you use a different default branch, edit the
   workflow's branch and deploy condition first.
5. Wait for the Pages deployment to succeed and open the URL shown by GitHub:
   `https://YOUR-USERNAME.github.io/REPOSITORY/` or your root site URL.
6. Test Home, About, Hello, email/scheduling, and the mobile layout. Edit
   `site.json` and commit to publish subsequent changes.

Only the generated `site/` directory is uploaded as the Pages artifact. All
repository files are still publicly readable: never commit private projects,
briefs, résumés, tokens, or personal data that you do not want published.
Relative page and asset links support both a domain root and a repository
subpath. An optional custom domain must be configured using GitHub's current
Pages instructions; ownership of a domain alone does not connect it.

For Git beginners, GitHub's **Add file → Upload files** can upload the ordinary
files. Create `.github/workflows/pages.yml` separately, paste the kit's workflow,
and preserve the directory spelling. Then choose Actions as the Pages source.

## Any static host

Run `node generate.mjs` and upload the **contents of `site/`**, with index.html
at the hosting root. Choose a static hosting provider whose current free tier
and terms suit your use. Buildmine does not create these accounts or guarantee
free capacity forever. The site needs no server, npm dependencies, or secrets.

## Preview versus deployment

A `/preview/#...` link contains public data in the URL fragment. Anyone with
it can read/forward it. It is not a saved account, a revocable link, or a named
hosted page. Download the kit to keep a durable copy. A named path such as
`/p/alex.rivera.example/` is a static maintainer-published example, not an
available self-service account or proof of identity.

## Official references (checked 2026-09-19)

- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

The first-time account, repository creation, Pages setting, and provider terms
require you to act. The included workflow does the build and deployment after
that setup. Buildmine never asks you to paste a GitHub access token.
