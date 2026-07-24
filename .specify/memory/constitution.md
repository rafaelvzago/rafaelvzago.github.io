# rafaelvzago.github.io Constitution

## Core Principles

### I. Content Language

The site is bilingual: Portuguese (`pt-br`, default) and English (`en`). User-facing content MAY be authored in either locale. Published posts SHOULD have a sibling translation under the other language's `contentDir`. Default-locale URLs stay at the site root; English content is served under `/en/`. All code, configuration files, commit messages, branch names, and technical documentation (CLAUDE.md, specs, README) MUST be written in English.

### II. Theme Integrity

The site uses the Archie Hugo theme as a git submodule (`themes/archie`). Prefer site-level overrides under `layouts/` and config in `hugo.toml` over forking the theme. Theme submodule updates should be intentional and verified with `make test`.

### III. Content Structure

Posts live under per-language content directories (`content/pt-br/posts/`, `content/en/posts/`) with the filename format `YYYY-MM-DD-slug.md`. Matching relative paths link translations. Every post MUST include frontmatter with: `title`, `date`, `slug`, and `tags` (array). New posts SHOULD also include `description` and `images`. Header images go in `static/assets/img/headers/` (URL `/assets/img/headers/...`). Lastmod uses Hugo `enableGitInfo`.

### IV. Quality Gates

Before any change is merged:
- `hugo --minify` MUST succeed with exit code 0
- `make test` MUST pass (run locally before push)
- All images MUST have alt text for accessibility
- Posts MUST have meaningful `description` in frontmatter or an opening paragraph for SEO
- `make test` MUST be executed and pass before any task, feature, or change is considered complete

### V. Code Style

Use 4 spaces for indentation everywhere (no tabs). Hugo config uses TOML (`hugo.toml`). Theme overrides live under `layouts/`.

### VI. Deployment Pipeline

The site deploys via GitHub Actions (`.github/workflows/pages-deploy.yml`). Pushes to `main` trigger a build that outputs to the `gh-pages` branch. A `CNAME` file with `www.rafaelvzago.com` is injected during build. Changes MUST NOT break this pipeline. The `development` branch is used for active development before merging to `main`.

### VII. Sub-Sites

The repository hosts standalone sub-sites under `static/`. They are NOT linked from the homepage navigation. They are accessed via direct URL only.

| Sub-site | Path | Purpose |
|----------|------|---------|
| QR Redirect | `static/qr/` | QR code generation and redirect system |
| Amigo Secreto | `static/amigo/` | Secret Santa reveal app (standalone HTML) |

Sub-sites MUST NOT be added to site navigation. Sub-sites MUST be plain static HTML (no theme wrapper). New sub-sites MUST be documented in this table and in the relevant spec.

## Commit Standard

All commits MUST follow the conventional format below. Non-compliant commits MUST be amended before merging to `main`.

Format: `<type>(<scope>): <short description>`.

| Type | Usage |
|------|-------|
| `post` | New blog post |
| `draft` | Draft post |
| `fix` | Typo, broken link, layout bug |
| `feat` | New site feature |
| `chore` | Dependency updates, Makefile |
| `config` | `hugo.toml` or Hugo/theme settings |
| `ci` | GitHub Actions changes |
| `style` | CSS, layout, visual-only |
| `docs` | README, CLAUDE.md, specs |
| `asset` | Images, favicons, static files |

Subject line: imperative mood, max 72 characters, English only.

## Technology Constraints

- **Runtime:** Hugo Extended static site generator + Archie theme (git submodule)
- **Hosting:** GitHub Pages (static files only, no server-side code at runtime)
- **Analytics:** Google Analytics (`G-9J3YRPN8EN`) and Google Tag Manager (`GTM-592PS4S2`)
- **No JavaScript frameworks:** The site is a static blog; avoid adding npm dependencies or JS build pipelines
- **No binary blobs:** Do not commit large binary files; use external hosting or Git LFS if needed
- **Version pinning:** Pin Hugo Extended version in GitHub Actions; keep the Archie submodule on a known commit

## Content Guidelines

Posts focus on: cloud, DevOps, infrastructure, automation, Linux, containers, Kubernetes, OpenShift, AI/ML, networking, CI/CD. TOC is enabled by default. Categories and tags should be consistent with existing taxonomy (check existing posts before creating new ones).

### Content Quality Gate

All user-facing text (blog posts, About page content) MUST be processed through the `/humanizer` skill before being finalized. This applies to both new content and significant edits to existing content. The `/humanizer` skill removes patterns characteristic of AI-generated writing to ensure natural, human-sounding prose. This does NOT apply to technical documentation (CLAUDE.md, specs, README) or configuration files.

## Governance

This constitution supersedes ad-hoc decisions. Amendments require updating this file with a rationale. All AI agents working on this project MUST read the constitution before making changes.

**Version**: 2.0.0 | **Ratified**: 2026-04-15 | **Last Amended**: 2026-07-23

