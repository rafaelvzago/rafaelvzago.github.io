# Feature Specification: Deployment Pipeline

**Created**: 2026-04-15
**Status**: Baseline (brownfield)
**Type**: Existing system documentation

## User Scenarios & Testing

### User Story 1 - Author publishes a post by pushing to main (Priority: P1)

The author merges changes into the `main` branch. GitHub Actions automatically builds the Jekyll site and deploys to GitHub Pages.

**Why this priority**: Automated deployment is the only way content reaches readers.

**Independent Test**: Push a commit to `main` and verify the GitHub Actions workflow succeeds and the site updates at `www.rafaelvzago.com`.

**Acceptance Scenarios**:

1. **Given** a commit is pushed to `main`, **When** the GitHub Actions workflow triggers, **Then** it builds the site with `JEKYLL_ENV=production` and deploys `_site/` to the `gh-pages` branch
2. **Given** the build succeeds, **When** deployment completes, **Then** the `CNAME` file containing `www.rafaelvzago.com` exists in `_site/`
3. **Given** the `_site/` directory contains `.nojekyll`, **When** GitHub Pages serves the files, **Then** files starting with underscores are served correctly

---

### User Story 2 - Author triggers a manual rebuild (Priority: P2)

The author uses the GitHub Actions `workflow_dispatch` trigger to manually rebuild the site without a new commit.

**Why this priority**: Useful for rebuilding after dependency updates or theme changes.

**Independent Test**: Go to Actions tab in GitHub, select the workflow, click "Run workflow".

**Acceptance Scenarios**:

1. **Given** the author triggers `workflow_dispatch`, **When** the workflow runs, **Then** it produces the same result as a push-triggered build

---

### Edge Cases

- What happens when `_site/` directory is not created? The workflow creates a fallback `index.html` with a "Site is being built" message.
- What happens when the Jekyll build fails? The workflow exits with error before attempting deployment.

## Requirements

### Functional Requirements

- **FR-001**: Pushes to `main` branch MUST trigger the build-and-deploy workflow
- **FR-002**: The workflow MUST use Ruby 3.4 with bundler cache
- **FR-003**: The workflow MUST build with `JEKYLL_ENV=production`
- **FR-004**: The workflow MUST create `.nojekyll` in `_site/` to prevent GitHub Pages from re-processing with Jekyll
- **FR-005**: The workflow MUST inject `CNAME` file with `www.rafaelvzago.com` into `_site/`
- **FR-006**: Deployment MUST use `JamesIves/github-pages-deploy-action@v4.7.3` targeting the `gh-pages` branch with `clean: true`
- **FR-007**: `workflow_dispatch` MUST be available for manual triggers
- **FR-008**: Spec-kit files (`.specify/`, `specs/`, `.claude/`) MUST NOT appear in `_site/`
- **FR-009**: All commits merged to `main` MUST follow the conventional commit format defined in the constitution (`<type>(<scope>): <description>`)

## Current Implementation

| Concern | File(s) |
|---------|---------|
| CI/CD workflow | `.github/workflows/pages-deploy.yml` |
| Jekyll config | `_config.yml` (exclude list) |
| Custom domain | `CNAME` injected at build time (line 37 of workflow) |

### Workflow Steps

1. `actions/checkout@v4`
2. `ruby/setup-ruby@v1` (Ruby 3.4, bundler cache)
3. `bundle exec jekyll build` with `JEKYLL_ENV=production`
4. `touch _site/.nojekyll`
5. Verify `_site/` exists, write `CNAME`
6. `JamesIves/github-pages-deploy-action@v4.7.3` (folder: `_site`, branch: `gh-pages`, clean: true)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every push to `main` results in a successful workflow run (green check)
- **SC-002**: The live site at `www.rafaelvzago.com` reflects the latest `main` content within 5 minutes of push
- **SC-003**: The `gh-pages` branch contains only the built output (no source files)

## Assumptions

- GitHub Pages is configured to serve from the `gh-pages` branch
- The custom domain DNS (CNAME) is configured at the DNS provider level
- The repository has `contents: write` permission for the workflow
