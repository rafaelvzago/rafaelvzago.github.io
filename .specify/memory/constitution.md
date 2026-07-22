# rafaelvzago.github.io Constitution

## Core Principles

### I. Content Language

All blog posts, page content, and user-facing text MUST be written in Portuguese (pt-BR). All code, configuration files, commit messages, branch names, and technical documentation (CLAUDE.md, specs, README) MUST be written in English.

### II. Theme Integrity

The site uses `jekyll-theme-chirpy`. Theme files MUST NOT be overridden or copied into the repository. Customizations are limited to `_config.yml` settings, `_data/` files (`contact.yml`, `share.yml`), and `_tabs/` pages. If a customization requires overriding a theme file, it must be documented in the spec with a justification.

### III. Content Structure

Posts live in `_posts/` with the filename format `YYYY-MM-DD-slug.md`. Every post MUST include frontmatter with: `layout: post`, `title`, `date`, `categories` (array), and `tags` (array). Header images go in `assets/img/headers/`. The `_plugins/posts-lastmod-hook.rb` automatically sets `last_modified_at` from git history; do not set this manually.

### IV. Quality Gates

Before any change is merged:
- `bundle exec jekyll build` MUST succeed with exit code 0
- `bundle exec htmlproofer ./_site` MUST pass (run locally before push)
- All images MUST have alt text for accessibility
- Posts MUST have meaningful `description` in frontmatter or an opening paragraph for SEO
- `make test` (build + htmlproofer) MUST be executed and pass before any task, feature, or change is considered complete

### V. Code Style

Use 4 spaces for indentation everywhere (no tabs). YAML files follow Jekyll/Chirpy conventions. Ruby plugin code follows standard Ruby style.

### VI. Deployment Pipeline

The site deploys via GitHub Actions (`.github/workflows/pages-deploy.yml`). Pushes to `main` trigger a build that outputs to the `gh-pages` branch. A `CNAME` file with `www.rafaelvzago.com` is injected during build. Changes MUST NOT break this pipeline. The `development` branch is used for active development before merging to `main`.

### VII. Sub-Sites

The repository hosts standalone sub-sites in top-level directories. These are served by Jekyll but are NOT linked from the homepage navigation. They are accessed via direct URL only.

| Sub-site | Path | Purpose |
|----------|------|---------|
| QR Redirect | `qr/` | QR code generation and redirect system |
| Amigo Secreto | `amigo/` | Secret Santa reveal app (standalone HTML) |

Sub-sites MUST NOT be added to `_tabs/` or any navigation component. Sub-sites MUST use `layout: none` or no Jekyll frontmatter to avoid the Chirpy theme wrapper. New sub-sites MUST be documented in this table and in the relevant spec.

## Commit Standard

All commits MUST follow the conventional format below. Non-compliant commits MUST be amended before merging to `main`.

Format: `<type>(<scope>): <short description>`.

| Type | Usage |
|------|-------|
| `post` | New blog post |
| `draft` | Draft post |
| `fix` | Typo, broken link, layout bug |
| `feat` | New site feature |
| `chore` | Dependency updates, Gemfile, Makefile |
| `config` | `_config.yml` or Jekyll settings |
| `ci` | GitHub Actions changes |
| `style` | CSS, layout, visual-only |
| `docs` | README, CLAUDE.md, specs |
| `asset` | Images, favicons, static files |

Subject line: imperative mood, max 72 characters, English only.

## Technology Constraints

- **Runtime:** Ruby (managed via mise), Jekyll static site generator
- **Hosting:** GitHub Pages (static files only, no server-side code at runtime)
- **Analytics:** Google Analytics (`G-9J3YRPN8EN`) and Google Tag Manager (`GTM-592PS4S2`)
- **PWA:** Enabled (`pwa.enabled: true`)
- **No JavaScript frameworks:** The site is a static blog; avoid adding npm dependencies or JS build pipelines
- **No binary blobs:** Do not commit large binary files; use external hosting or Git LFS if needed
- **Version pinning:** All gem dependencies in `Gemfile` MUST have explicit version constraints. Use pessimistic operator (`~>`) for patch-level flexibility (e.g., `~> 7.4.1`) or exact pinning for critical dependencies. Unpinned gems risk unexpected breakage on `bundle update`

## Content Guidelines

Posts focus on: cloud, DevOps, infrastructure, automation, Linux, containers, Kubernetes, OpenShift, AI/ML, networking, CI/CD. TOC is enabled by default. Categories and tags should be consistent with existing taxonomy (check existing posts before creating new ones).

### Content Quality Gate

All user-facing text (blog posts, page content, `_tabs/` pages) MUST be processed through the `/humanizer` skill before being finalized. This applies to both new content and significant edits to existing content. The `/humanizer` skill removes patterns characteristic of AI-generated writing to ensure natural, human-sounding prose. This does NOT apply to technical documentation (CLAUDE.md, specs, README) or configuration files.

## Governance

This constitution supersedes ad-hoc decisions. Amendments require updating this file with a rationale. All AI agents working on this project MUST read the constitution before making changes.

**Version**: 1.1.0 | **Ratified**: 2026-04-15 | **Last Amended**: 2026-04-15
