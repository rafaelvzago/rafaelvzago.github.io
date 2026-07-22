---
description: Spec-Driven Development workflow for AI agents working on this Jekyll blog
globs:
alwaysApply: true
---

# Spec-Driven Development Rules

## Before Making Changes

1. Read `.specify/memory/constitution.md` for project principles
2. Check `specs/` for existing specs related to the area you are modifying
3. If an existing spec covers the feature, follow its requirements and acceptance criteria

## When to Create a New Spec

Create a new spec (using the spec-kit workflow) when:
- Adding a new site feature, page, or integration
- Making structural changes to configuration, deployment, or theme
- Adding or modifying a subsystem (like the QR code system)

Do NOT create a spec for:
- Writing or editing blog posts (follow `specs/content-workflow/spec.md` directly)
- Fixing typos or broken links
- Updating dependency versions

## Existing Specs Reference

- `specs/site-core/spec.md` - Jekyll + Chirpy configuration, theme, analytics, PWA
- `specs/content-workflow/spec.md` - Blog post lifecycle, frontmatter rules, images, lastmod plugin
- `specs/deployment/spec.md` - GitHub Actions CI/CD, gh-pages branch, CNAME
- `specs/qr-system/spec.md` - QR code generation and redirect

## Constitution Key Rules

- Blog content in Portuguese (pt-BR); code/config/commits in English
- Theme: jekyll-theme-chirpy (do not vendor or override theme files)
- Posts: `_posts/YYYY-MM-DD-slug.md` with required frontmatter
- Indentation: 4 spaces, no tabs
- Quality: `bundle exec jekyll build` must succeed; images need alt text
- Commits: `<type>(<scope>): <description>` format (see CLAUDE.md)
