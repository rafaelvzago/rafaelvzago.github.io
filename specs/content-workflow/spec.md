# Feature Specification: Content Workflow

**Created**: 2026-04-15
**Status**: Baseline (brownfield)
**Type**: Existing system documentation

## User Scenarios & Testing

### User Story 1 - Author creates a new blog post (Priority: P1)

The blog author creates a new markdown file in `_posts/` with the required frontmatter, writes the content in Portuguese, adds a header image, and previews locally before pushing.

**Why this priority**: Content creation is the core activity of the blog.

**Independent Test**: Create a post file, run `bundle exec jekyll serve --drafts`, and verify it appears on the index page and renders correctly.

**Acceptance Scenarios**:

1. **Given** a new file `_posts/2026-04-15-example-post.md` with valid frontmatter, **When** the site is built, **Then** the post appears at `/posts/example-post/`
2. **Given** the post frontmatter includes `image.path` and `image.alt`, **When** the post renders, **Then** the header image displays with the specified alt text
3. **Given** the post has `categories: [Cloud, Kubernetes]` and `tags: [k8s, devops]`, **When** the site is built, **Then** the post appears on the respective category and tag archive pages

---

### User Story 2 - Author edits an existing post (Priority: P2)

The author modifies an existing post. The `last_modified_at` date is automatically updated by the git hook plugin.

**Why this priority**: Posts evolve over time with corrections and additions.

**Independent Test**: Edit a post, commit, rebuild, and verify `last_modified_at` reflects the latest commit date.

**Acceptance Scenarios**:

1. **Given** a post with more than 1 git commit, **When** the site is built, **Then** `last_modified_at` is set to the date of the most recent commit touching that file
2. **Given** a brand new post with only 1 commit, **When** the site is built, **Then** `last_modified_at` is NOT set (only the publication date shows)

---

### Edge Cases

- What happens when a post filename does not follow `YYYY-MM-DD-slug.md`? Jekyll ignores it or fails to build.
- What happens when required frontmatter fields are missing? Jekyll may build but the post renders incorrectly (no title, wrong layout).
- What happens when an image path in frontmatter points to a non-existent file? The post renders with a broken image.

## Requirements

### Functional Requirements

- **FR-001**: Post files MUST be named `YYYY-MM-DD-slug.md` and placed in `_posts/`
- **FR-002**: Post frontmatter MUST include `title`, `date`, `categories` (array), and `tags` (array)
- **FR-003**: Post frontmatter SHOULD include `image.path` (header image) and `image.alt` (accessibility)
- **FR-004**: Posts MUST use `layout: post` (set by defaults in `_config.yml`)
- **FR-005**: The `posts-lastmod-hook.rb` plugin MUST automatically set `last_modified_at` from git history for posts with >1 commit
- **FR-006**: Blog content MUST be written in Portuguese (pt-BR)
- **FR-007**: Posts MUST have TOC enabled by default (configurable per-post via `toc: false`)
- **FR-008**: All post content MUST be processed through the `/humanizer` skill before the post is considered publish-ready. This removes AI-generated writing patterns and ensures natural prose

### Key Entities

- **Post**: Markdown file with YAML frontmatter, body content, optional header image reference
- **Header Image**: PNG/JPG file in `assets/img/headers/`, referenced by `image.path` in frontmatter
- **Last Modified Hook**: Ruby plugin (`_plugins/posts-lastmod-hook.rb`) that reads git log

## Current Implementation

| Concern | File(s) |
|---------|---------|
| Post defaults | `_config.yml` (lines 128-138) |
| Last-modified plugin | `_plugins/posts-lastmod-hook.rb` |
| Header images | `assets/img/headers/` |
| Example post frontmatter | Any file in `_posts/` |

### Post Frontmatter Template

```yaml
---
title: "Post Title in Portuguese"
date: YYYY-MM-DD
categories: [Category1, Category2]
tags: [tag1, tag2, tag3]
image:
    path: /assets/img/headers/image-name.png
    alt: Descriptive alt text
---
```

**Pre-publish checklist**: Before committing a new or significantly edited post, run `/humanizer` on the content body to ensure natural writing quality.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every post in `_posts/` builds without errors
- **SC-002**: Every post has at least `title`, `date`, `categories`, and `tags` in frontmatter
- **SC-003**: `htmlproofer` reports no broken image references from posts
- **SC-004**: Posts with multiple commits display the correct `last_modified_at` date
- **SC-005**: Post content has been processed through `/humanizer` before publication

## Assumptions

- Authors have git installed and commit their changes (required for the lastmod plugin)
- Header images are manually created/sourced by the author before publishing
- Draft posts can be placed in `_drafts/` and previewed with `--drafts` flag
