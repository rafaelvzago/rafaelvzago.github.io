# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Rafael Zago's personal blog built with Jekyll using the Chirpy theme. The site is written in Portuguese (pt-BR) and focuses on cloud, DevOps, infrastructure, automation, and AI-related topics. The site is deployed to GitHub Pages.

## Development Commands

### Basic Jekyll Operations
- `bundle install` - Install dependencies
- `bundle exec jekyll serve` - Run development server (usually at http://localhost:4000)
- `bundle exec jekyll serve --drafts` - Run development server including draft posts
- `bundle exec jekyll build` - Build the site for production
- `bundle exec jekyll clean` - Clean the build directory

### Testing
- `make test` - **MUST pass before any task is considered complete**. Runs `bundle exec jekyll build` followed by `bundle exec htmlproofer ./_site`
- `bundle exec htmlproofer ./_site` - Run HTML validation tests after building (included in `make test`)

## Content Structure

### Posts
- All blog posts are in `_posts/` with filename format `YYYY-MM-DD-title.md`
- Posts must include frontmatter with `layout: post`, `title`, `date`, `categories`, and `tags`
- Posts are written in Portuguese
- Post URLs follow the pattern `/posts/:title/`

### Static Pages
- Tab pages (About, Archives, Categories, Tags) are in `_tabs/`
- Each tab has a `layout: page` and permalink structure

### Assets
- Images are stored in `assets/` and `assets/img/`
- Header images for posts are in `assets/img/headers/`
- Favicons are in `assets/img/favicons/`

### Sub-Sites
- `qr/` - QR code redirect system (spec: `specs/qr-system/spec.md`). Accessed via direct URL only
- `amigo/` - Secret Santa (Amigo Secreto) reveal app. Standalone HTML file, no Jekyll frontmatter. Accessed via direct URL only
- Sub-sites are NOT linked from the homepage navigation and MUST NOT be added to `_tabs/`

### QR Code System
- QR code generation system in `qr/` directory
- `gerar_qrcodes.py` generates QR codes from URLs listed in `urls.txt`
- QR codes redirect to the site with ID parameters for tracking

## Key Configuration

- **Theme**: jekyll-theme-chirpy
- **Language**: Portuguese (pt-BR)
- **Timezone**: America/Sao_Paulo
- **Base URL**: https://rafaelvzago.github.io
- **Google Analytics**: G-9J3YRPN8EN

### Dependency Management
- All gems in `Gemfile` MUST have explicit version constraints (e.g., `~> 7.4.1`)
- Run `bundle update <gem>` to update a specific gem, then verify with `make test`
- Never remove version constraints from the Gemfile

## Git Workflow

- **Main branch**: `main` (for production/GitHub Pages)
- **Development branch**: `development` (for active development)
- Posts are automatically tagged with last modification dates via the `_plugins/posts-lastmod-hook.rb` plugin

## Content Guidelines

- Posts should focus on cloud, DevOps, infrastructure, automation, Linux, containers, Kubernetes, AI/ML topics
- All content is in Portuguese
- Use appropriate header images from `assets/img/headers/`
- Include relevant categories and tags in post frontmatter
- TOC is enabled by default for posts

## Content Quality

All user-facing content (blog posts, page text in `_tabs/`) MUST be processed through the `/humanizer` skill before being considered final. This includes:
- New blog posts
- Significant edits to existing posts
- About page or other tab page text updates

Run `/humanizer` on the content before committing. This does NOT apply to technical documentation (CLAUDE.md, specs, README) or configuration files.

## Spec-Driven Development (SDD)

This project uses [GitHub spec-kit](https://github.com/github/spec-kit) for Spec-Driven Development. Specs are structured, behavior-oriented documents that serve as the source of truth for AI-assisted changes.

### Directory Layout

- `.specify/memory/constitution.md` - Project principles (read this before any change)
- `.specify/templates/` - Templates for new specs, plans, and tasks
- `.specify/scripts/` - Automation scripts for the SDD workflow
- `.claude/skills/` - Spec-kit slash commands for Claude
- `specs/` - Feature specification directories (one folder per feature)

### Existing Baseline Specs

- `specs/site-core/` - Jekyll + Chirpy configuration, theme, analytics, PWA
- `specs/content-workflow/` - Blog post lifecycle, frontmatter, images, lastmod plugin
- `specs/deployment/` - GitHub Actions CI/CD pipeline, gh-pages, CNAME
- `specs/qr-system/` - QR code generation and redirect system

### Workflow (for new features or significant changes)

1. **Read the constitution** (`.specify/memory/constitution.md`) before starting
2. **Check existing specs** in `specs/` for related features
3. **Create a spec** using `/speckit-specify` for new features
4. **Plan implementation** using `/speckit-plan` with tech stack details
5. **Break into tasks** using `/speckit-tasks`
6. **Implement** using `/speckit-implement`

### When to use SDD

- Adding a new site feature (new page, widget, integration)
- Making structural changes (config, deployment, theme customization)
- Modifying the QR system or adding a new subsystem

### When NOT to use SDD

- Writing or editing a blog post (just follow the content-workflow spec)
- Fixing a typo or broken link
- Updating a dependency version

## Code Style

- **Indentation**: Use 4 spaces for indentation (no tabs)

## Commit Message Standard

### Format

```
<type>(<scope>): <short description>

[optional body]
```

**Rules:**
- All commits MUST follow this format. Non-compliant commits MUST be amended before merging
- Type and scope in English (conventional standard)
- Description in English (keeps history searchable and consistent)
- 72-character limit on the subject line
- Imperative mood: "add post about X", not "added post about X"

### Types

| Type | When to use |
|------|-------------|
| `post` | New blog post published |
| `draft` | New draft post (not yet published) |
| `fix` | Typo corrections, broken links, layout bugs |
| `feat` | New site feature (new page, new section, new widget) |
| `chore` | Dependency updates, Gemfile changes, Makefile |
| `config` | Changes to `_config.yml`, Jekyll or theme settings |
| `ci` | GitHub Actions, deployment workflow changes |
| `style` | CSS, layout, or visual-only changes |
| `docs` | Changes to README, CLAUDE.md, or meta-documentation |
| `asset` | New or updated images, favicons, static files |

### Scopes (optional but recommended)

| Scope | Meaning |
|-------|---------|
| `post/<slug>` | Specific post (e.g., `post(post/intro-k8s)`) |
| `about` | About page |
| `theme` | Chirpy theme customization |
| `deps` | Gem/bundler dependencies |
| `analytics` | Google Analytics config |
| `qr` | QR code system |

### Examples

```
post(post/intro-openshift): add new post about OpenShift service mesh
fix(post/deepseek): correct typos in first act section
chore(deps): update jekyll-theme-chirpy to 7.3.0
config: enable table of contents for all posts
asset: add header image for kubernetes post
feat: add tag cloud to sidebar
ci: update github pages deployment workflow
docs(claude): add commit message standard to CLAUDE.md
```