# Feature Specification: Site Core Configuration

**Created**: 2026-04-15
**Updated**: 2026-07-27
**Status**: Baseline (Hugo)
**Type**: Existing system documentation

## User Scenarios & Testing

### User Story 1 - Visitor reads a blog post (Priority: P1)

A visitor arrives at the site (via search engine, direct link, or QR code) and reads a blog post in Portuguese (default) or English (`/en/`). The page loads quickly, displays correctly on mobile and desktop, and shows post metadata.

**Why this priority**: This is the primary use case of the entire site.

**Independent Test**: Navigate to any post URL and verify it renders with title, content, tags, and images.

**Acceptance Scenarios**:

1. **Given** a published Portuguese post exists in `content/pt-br/posts/`, **When** a visitor navigates to `/posts/<slug>/`, **Then** the post renders with the Archie theme layout and correct metadata
2. **Given** a published English post exists in `content/en/posts/`, **When** a visitor navigates to `/en/posts/<slug>/`, **Then** the English post renders
3. **Given** the site is accessed on a mobile device, **When** the visitor reads a post, **Then** the layout is responsive and readable without horizontal scrolling
4. **Given** a page has a translation sibling, **When** the visitor uses the language switcher, **Then** they land on the matching translation (otherwise the other language's home)
5. **Given** the language switcher is visible, **When** the visitor views the navigation, **Then** each language is shown as a flag emoji (Brazil for `pt-br`, USA for `en`) with the language name available via `aria-label`

---

### User Story 2 - Visitor browses by tag (Priority: P2)

A visitor explores the site by clicking on tags to find related content.

**Why this priority**: Content discovery drives repeat visits and engagement.

**Independent Test**: Click a tag link and verify the archive page lists the correct filtered posts.

**Acceptance Scenarios**:

1. **Given** posts tagged with `[openshift]`, **When** a visitor navigates to `/tags/openshift/`, **Then** all posts with that tag are listed

---

### Edge Cases

- What happens when a post has no header image? The post renders without a leading image.
- What happens when a tag has no posts? The archive page renders with an empty list.

## Requirements

### Functional Requirements

- **FR-001**: Site MUST use the Archie Hugo theme as a git submodule under `themes/archie`
- **FR-002**: Site MUST be multilingual with default language `pt-br` at root URLs and `en` under `/en/`, timezone `America/Sao_Paulo`
- **FR-002a**: Site MUST provide per-language menus/params and a language switcher in the navigation
- **FR-002b**: Language switcher MUST use flag emoji (Brazil for `pt-br`, USA for `en`) instead of visible language names; language names MUST remain available via `aria-label`
- **FR-003**: Site MUST include Google Analytics (`G-9J3YRPN8EN`) and Google Tag Manager (`GTM-592PS4S2`) on production builds (not during `hugo server`)
- **FR-004**: Site MUST paginate the index at 10 posts per page
- **FR-005**: Site MUST generate tag archive pages
- **FR-006**: TOC SHOULD be available on posts via frontmatter `toc: true`
- **FR-007**: Sub-sites (`static/qr/`, `static/amigo/`) MUST NOT appear in site navigation. They are accessed via direct URL only
- **FR-008**: Site config lives in `hugo.toml`
- **FR-009**: Site MUST publish `/llms.txt` (static Markdown index per llmstxt.org) with absolute HTTPS links to primary pages and feeds

### Key Entities

- **Post**: A markdown file in `content/<lang>/posts/` with frontmatter (title, date, slug, tags, images)
- **Page**: A markdown file in `content/<lang>/` (e.g. About)
- **Sub-site**: A standalone directory under `static/` (`qr/`, `amigo/`) not linked from navigation

## Current Implementation

| Concern | File(s) |
|---------|---------|
| Theme & locale | `hugo.toml` |
| Language switcher | `layouts/partials/lang-switcher.html`, `assets/css/post-layout.css` |
| LLM index | `static/llms.txt` → `/llms.txt` |
| Analytics | `hugo.toml` (`services.googleAnalytics`, `params.gtm`) + `layouts/partials/gtm-*.html` |
| Pagination | `hugo.toml` `[pagination]` |
| Theme | `themes/archie` (submodule) |
| About | `content/pt-br/about.md`, `content/en/about.md` |

## Success Criteria

### Measurable Outcomes

- **SC-001**: All pages render without Hugo build errors (exit code 0)
- **SC-002**: Production HTML includes GA4 and GTM IDs
- **SC-003**: `make test` succeeds
- **SC-004**: `/llms.txt` is present in the build output and starts with `# Rafael Zago`

## Assumptions

- The Archie theme handles layout, styling, and navigation chrome
- Static assets are served from `static/assets/` preserving `/assets/...` URLs
