# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Serve locally with incremental builds
bundle exec jekyll serve --incremental

# Shortcut
./serve.sh
```

No build step, linter, or test suite — this is a pure Jekyll/GitHub Pages static site.

## Architecture

### Stack
- **Jekyll** (via `github-pages` gem) — static site generator; deployed automatically on push to `master` via GitHub Pages
- **MailerLite** — email list and form submissions for the JaVers Pro waitlist
- **Cloudflare Turnstile** — CAPTCHA on the waitlist form, verified by a Cloudflare Worker before MailerLite submission
- **Bootstrap 3 + jQuery 3** — loaded from CDN; no local Node build

### Key files
| File | Purpose |
|------|---------|
| `_config.yml` | Site metadata, permalink structure, current version (`javers_version`) |
| `_layouts/main.html` | Base layout — wraps all pages with `<head>`, navbar, footer |
| `_layouts/page.html` | Content layout — adds optional sidebar and Disqus |
| `_includes/head.html` | CSS/JS imports; all CDN libs loaded here |
| `css/style.css` | Primary stylesheet |
| `css/waiting-list-form.css` | Styles for the MailerLite/Turnstile form card |
| `waiting-list.md` | JaVers Pro early-access funnel (form + inline success state) |
| `release-notes.md` | Full changelog (~108 KB) |

### JaVers Pro waitlist funnel
`waiting-list.md` implements a multi-step funnel entirely in a single page:

1. **Step 1 (`.row-form`)** — MailerLite subscribe form with Cloudflare Turnstile CAPTCHA
2. **Step 2 (`.row-success`)** — inline success div shown after submission; hides `.row-form`, displays confirmation message with the submitted email address populated via JS
3. **Step 3** — MailerLite sends a confirmation email with a link to Step 4
4. **Step 4** — `waiting-list-confirmed.md` (not yet created) — survey + discount code reveal

### Content structure
- `documentation/` — 11 sections of product docs, each a `.md` file with `page` layout and `sidebar: docs` front matter
- `blog/` and `_posts/` — blog articles; Disqus comments enabled on `page` layout when `comments: true`
- `index.html` — homepage; pulls `javers_version` from `_config.yml` for display
