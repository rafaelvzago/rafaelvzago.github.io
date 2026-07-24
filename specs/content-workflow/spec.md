# Feature Specification: Content Workflow

**Created**: 2026-04-15
**Updated**: 2026-07-23
**Status**: Baseline (Hugo)
**Type**: Existing system documentation

## User Scenarios & Testing

### User Story 1 - Author creates a new blog post (Priority: P1)

The blog author creates a new markdown file in `content/pt-br/posts/` and/or `content/en/posts/` with the required frontmatter, writes the content in the target locale, adds a header image, and previews locally before pushing.

**Why this priority**: Content creation is the core activity of the blog.

**Independent Test**: Create a post file, run `hugo server`, and verify it appears on the index page and renders correctly.

**Acceptance Scenarios**:

1. **Given** a new file `content/pt-br/posts/2026-04-15-example-post.md` with valid frontmatter and `slug: example-post`, **When** the site is built, **Then** the post appears at `/posts/example-post/`
2. **Given** a matching file under `content/en/posts/` with the same relative path, **When** the site is built, **Then** the English post appears at `/en/posts/example-post/` and is linked as a translation
3. **Given** the post frontmatter includes `images`, **When** the post renders, **Then** linked images resolve under `/assets/...`
4. **Given** the post has `tags: [k8s, devops]`, **When** the site is built, **Then** the post appears on the respective tag archive pages for that language

---

### User Story 2 - Author edits an existing post (Priority: P2)

The author modifies an existing post. Lastmod comes from git when `enableGitInfo` is true.

**Why this priority**: Posts evolve over time with corrections and additions.

**Independent Test**: Edit a post, commit, rebuild with full git history, and verify gitinfo lastmod when used by templates.

**Acceptance Scenarios**:

1. **Given** `enableGitInfo = true` and full git history, **When** the site is built, **Then** Hugo can resolve `.GitInfo` / lastmod for content files

---

### Edge Cases

- What happens when a post filename does not follow `YYYY-MM-DD-slug.md`? Hugo may still build if frontmatter provides date/slug; prefer the canonical naming.
- What happens when required frontmatter fields are missing? Hugo may build but the post renders incorrectly.
- What happens when an image path points to a non-existent file? The post renders with a broken image.

## Requirements

### Functional Requirements

- **FR-001**: Post files MUST be named `YYYY-MM-DD-slug.md` and placed in `content/pt-br/posts/` and/or `content/en/posts/`
- **FR-002**: Post frontmatter MUST include `title`, `date`, `slug`, and `tags` (array)
- **FR-003**: Post frontmatter SHOULD include `description` and `images` (header/OG image paths under `/assets/...`)
- **FR-004**: Portuguese permalinks MUST resolve to `/posts/<slug>/`; English permalinks MUST resolve to `/en/posts/<slug>/`
- **FR-005**: `enableGitInfo` MUST be enabled for lastmod from git in CI (`fetch-depth: 0`)
- **FR-006**: Blog content MUST be written in the locale of its `contentDir` (pt-BR or English); published posts SHOULD have a sibling translation with the same relative path
- **FR-007**: Posts SHOULD set `toc: true` when a table of contents is desired
- **FR-008**: All post content MUST be processed through the `/humanizer` skill before the post is considered publish-ready

### Key Entities

- **Post**: Markdown file with YAML frontmatter, body content, optional header image reference
- **Header Image**: PNG/JPG/SVG file in `static/assets/img/headers/`, referenced as `/assets/img/headers/...`

## Current Implementation

| Concern | File(s) |
|---------|---------|
| Site config | `hugo.toml` |
| Posts | `content/pt-br/posts/`, `content/en/posts/` |
| Header images | `static/assets/img/headers/` |

### Post Frontmatter Template

```yaml
---
title: "Post Title in Portuguese"
description: "SEO description 150-160 characters"
date: YYYY-MM-DD
slug: "example-post"
tags: [tag1, tag2, tag3]
toc: true
images:
  - "/assets/img/headers/image-name.png"
---
```

**Pre-publish checklist**: Before committing a new or significantly edited post, run `/humanizer` on the content body to ensure natural writing quality.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every post in `content/pt-br/posts/` and `content/en/posts/` builds without errors
- **SC-002**: Every new post has at least `title`, `date`, `slug`, and `tags` in frontmatter
- **SC-003**: Image paths under `/assets/` resolve from `static/assets/`
- **SC-004**: Post content has been processed through `/humanizer` before publication

## Assumptions

- Authors have git installed and commit their changes (required for gitinfo)
- Header images are manually created/sourced by the author before publishing
- Draft posts use `draft: true` in frontmatter
