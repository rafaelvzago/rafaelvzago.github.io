# Feature Specification: Site Core Configuration

**Created**: 2026-04-15
**Status**: Baseline (brownfield)
**Type**: Existing system documentation

## User Scenarios & Testing

### User Story 1 - Visitor reads a blog post (Priority: P1)

A visitor arrives at the site (via search engine, direct link, or QR code) and reads a blog post in Portuguese. The page loads quickly, displays correctly on mobile and desktop, and shows the table of contents for navigation.

**Why this priority**: This is the primary use case of the entire site.

**Independent Test**: Navigate to any post URL and verify it renders with title, content, TOC, categories, tags, and header image.

**Acceptance Scenarios**:

1. **Given** a published post exists in `_posts/`, **When** a visitor navigates to `/posts/<slug>/`, **Then** the post renders with Chirpy theme layout, TOC sidebar, and correct metadata
2. **Given** the site is accessed on a mobile device, **When** the visitor reads a post, **Then** the layout is responsive and readable without horizontal scrolling
3. **Given** PWA is enabled, **When** a visitor has previously loaded the site, **Then** cached assets enable faster subsequent loads

---

### User Story 2 - Visitor browses by category or tag (Priority: P2)

A visitor explores the site by clicking on categories or tags to find related content.

**Why this priority**: Content discovery drives repeat visits and engagement.

**Independent Test**: Click a category or tag link and verify the archive page lists the correct filtered posts.

**Acceptance Scenarios**:

1. **Given** posts tagged with `[openshift]`, **When** a visitor navigates to `/tags/openshift/`, **Then** all posts with that tag are listed
2. **Given** posts categorized under `[DevOps]`, **When** a visitor navigates to `/categories/DevOps/`, **Then** all posts in that category are listed

---

### Edge Cases

- What happens when a post has no header image? The Chirpy theme renders a default layout without the image block.
- What happens when a category or tag has no posts? The archive page renders with an empty list.

## Requirements

### Functional Requirements

- **FR-001**: Site MUST use `jekyll-theme-chirpy` as the theme gem (not vendored files)
- **FR-002**: Site MUST render in Portuguese (`lang: pt-BR`) with `America/Sao_Paulo` timezone
- **FR-003**: Site MUST include Google Analytics (`G-9J3YRPN8EN`) and Google Tag Manager (`GTM-592PS4S2`)
- **FR-004**: Site MUST have PWA enabled for offline-capable asset caching
- **FR-005**: Site MUST paginate the index at 10 posts per page
- **FR-006**: Site MUST generate archive pages for categories and tags via `jekyll-archives`
- **FR-007**: TOC MUST be enabled by default on all posts
- **FR-008**: Sub-sites (`qr/`, `amigo/`) MUST NOT appear in site navigation (`_tabs/`). They are accessed via direct URL only
- **FR-009**: All gem dependencies in `Gemfile` MUST specify version constraints (e.g., `~> 7.4.1`)

### Key Entities

- **Post**: A markdown file in `_posts/` with frontmatter (title, date, categories, tags, image)
- **Tab Page**: A markdown file in `_tabs/` (About, Archives, Categories, Tags) with order and layout
- **Data File**: YAML files in `_data/` (`contact.yml`, `share.yml`) configuring sidebar/footer links
- **Sub-site**: A standalone directory (`qr/`, `amigo/`) served by Jekyll but not linked from navigation

## Current Implementation

| Concern | File(s) |
|---------|---------|
| Theme & locale | `_config.yml` (lines 1-8) |
| Analytics | `_config.yml` (lines 39-47) |
| PWA | `_config.yml` (line 103) |
| Pagination | `_config.yml` (line 105) |
| Archives | `_config.yml` (lines 180-187) |
| Tab pages | `_tabs/about.md`, `_tabs/archives.md`, `_tabs/categories.md`, `_tabs/tags.md` |
| Data files | `_data/contact.yml`, `_data/share.yml` |

## Success Criteria

### Measurable Outcomes

- **SC-001**: All pages render without Jekyll build errors (exit code 0)
- **SC-002**: `htmlproofer` reports no broken internal links
- **SC-003**: Google PageSpeed Insights scores above 90 for mobile and desktop
- **SC-004**: PWA manifest and service worker are correctly served

## Assumptions

- The Chirpy theme gem handles all layout, styling, and JavaScript
- Static assets (JS libraries) are provided by the `assets/lib` git submodule (chirpy-static-assets)
- No custom Liquid templates are needed beyond what the theme provides
