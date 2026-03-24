# drewcleaver.com

Personal site for Drew Cleaver — digital sovereignty consultant.

**Stack:** Astro 6 + Tailwind CSS 4 + MDX
**Hosting:** GitHub Pages via GitHub Actions
**DNS:** Cloudflare (recommended)

---

## Local development

**Prerequisites:** Node.js 22+

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project structure

```
drewcleaver.com/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions → GitHub Pages
├── public/
│   └── CNAME                   # Custom domain for GitHub Pages
├── src/
│   ├── components/
│   │   └── ServiceCard.astro   # Reusable service/pricing card
│   ├── content/
│   │   └── writing/            # MDX blog posts (.mdx files)
│   ├── layouts/
│   │   └── Base.astro          # Shared HTML shell, nav, footer
│   ├── pages/
│   │   ├── index.astro         # Home: hero, services, CTA
│   │   ├── services.astro      # Full pricing page
│   │   ├── about.astro         # Bio, CV, philosophy
│   │   ├── contact.astro       # Contact form + Cal.com link
│   │   └── writing/
│   │       ├── index.astro     # Blog post index
│   │       └── [slug].astro    # Individual post template
│   ├── styles/
│   │   └── global.css          # Tailwind + @theme tokens + prose
│   └── content.config.ts       # Content collection schema
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## Adding a blog post

Create a new `.mdx` file in `src/content/writing/`:

```mdx
---
title: "Your Post Title"
description: "One-sentence summary shown in the post list."
pubDate: 2024-06-01
draft: false
---

Your content here. Full Markdown + JSX supported.
```

The filename becomes the URL slug: `my-post-title.mdx` → `/writing/my-post-title`

Set `draft: true` to hide a post from the index without deleting it.

---

## Deploying to GitHub Pages

### First-time setup

1. **Create a GitHub repository** named `drewcleaver.com` (or any name).

2. **Push this repo:**
   ```bash
   git remote add origin git@github.com:USERNAME/drewcleaver.com.git
   git push -u origin main
   ```

3. **Enable GitHub Pages** in the repo settings:
   - Go to Settings → Pages
   - Source: **GitHub Actions**

4. **Configure your custom domain** in Settings → Pages → Custom domain:
   - Enter `drewcleaver.com`
   - Check "Enforce HTTPS" once DNS propagates

### DNS configuration (Cloudflare)

Add these DNS records in Cloudflare (proxy OFF — set to DNS only):

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | USERNAME.github.io     |

DNS propagation typically takes 5–30 minutes.

### Subsequent deploys

Every push to `main` triggers an automatic rebuild and deploy via GitHub Actions. No manual steps required.

---

## Design tokens

Configured in `src/styles/global.css` via Tailwind v4 `@theme`:

| Token               | Value     | Usage          |
|---------------------|-----------|----------------|
| `--color-teal`      | `#0f6e56` | Primary accent |
| `--color-teal-dark` | `#0a4f3e` | Hover states   |
| `--color-bg`        | `#faf9f7` | Background     |
| `--color-ink`       | `#1a1a1a` | Body text      |
| `--color-muted`     | `#6b7280` | Secondary text |
| `--color-border`    | `#e5e2de` | Borders        |

---

## Cal.com booking link

The discovery call link (`https://cal.com/drewcleaver`) appears in:
- `src/pages/index.astro` — hero and CTA section
- `src/pages/services.astro` — bottom CTA
- `src/pages/about.astro` — bottom CTA
- `src/pages/contact.astro` — booking section

---

Built sovereign on GitHub Pages.
