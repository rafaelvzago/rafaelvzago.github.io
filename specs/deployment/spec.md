# Feature Specification: Deployment Pipeline

**Created**: 2026-04-15
**Updated**: 2026-07-23
**Status**: Baseline (Hugo)
**Type**: Existing system documentation

## User Scenarios & Testing

### User Story 1 - Author publishes a post by pushing to main (Priority: P1)

The author merges changes into the `main` branch. GitHub Actions automatically builds the Hugo site and deploys to GitHub Pages.

**Why this priority**: Automated deployment is the only way content reaches readers.

**Independent Test**: Push a commit to `main` and verify the GitHub Actions workflow succeeds and the site updates at `www.rafaelvzago.com`.

**Acceptance Scenarios**:

1. **Given** a commit is pushed to `main`, **When** the GitHub Actions workflow triggers, **Then** it builds the site with Hugo Extended and deploys `public/` to the `gh-pages` branch
2. **Given** the build succeeds, **When** deployment completes, **Then** the `CNAME` file containing `www.rafaelvzago.com` exists in `public/`
3. **Given** the `public/` directory contains `.nojekyll`, **When** GitHub Pages serves the files, **Then** files starting with underscores are served correctly

---

### User Story 2 - Author triggers a manual rebuild (Priority: P2)

The author uses the GitHub Actions `workflow_dispatch` trigger to manually rebuild the site without a new commit.

**Why this priority**: Useful for rebuilding after dependency updates or theme changes.

**Independent Test**: Go to Actions tab in GitHub, select the workflow, click "Run workflow".

**Acceptance Scenarios**:

1. **Given** the author triggers `workflow_dispatch`, **When** the workflow runs, **Then** it produces the same result as a push-triggered build

---

### Edge Cases

- What happens when `public/index.html` is missing after build? The workflow fails before deploy.
- What happens when the Hugo build fails? The workflow exits with error before attempting deployment.

## Requirements

### Functional Requirements

- **FR-001**: Pushes to `main` branch MUST trigger the build-and-deploy workflow
- **FR-002**: The workflow MUST install Hugo Extended (pinned version) with theme submodule checkout
- **FR-003**: The workflow MUST build with `hugo --minify --gc` and `fetch-depth: 0` for gitinfo
- **FR-004**: The workflow MUST create `.nojekyll` in `public/` to prevent GitHub Pages from re-processing with Jekyll
- **FR-005**: The workflow MUST inject `CNAME` file with `www.rafaelvzago.com` into `public/`
- **FR-006**: Deployment MUST use `JamesIves/github-pages-deploy-action@v4.7.3` targeting the `gh-pages` branch with `clean: true` and `folder: public`
- **FR-007**: `workflow_dispatch` MUST be available for manual triggers
- **FR-008**: Spec-kit files (`.specify/`, `specs/`, `.claude/`) MUST NOT appear in `public/`
- **FR-009**: All commits merged to `main` MUST follow the conventional commit format defined in the constitution (`<type>(<scope>): <description>`)

## Current Implementation

| Concern | File(s) |
|---------|---------|
| CI/CD workflow | `.github/workflows/pages-deploy.yml` |
| Hugo config | `hugo.toml` |
| Custom domain | `CNAME` injected at build time into `public/` |

### Workflow Steps

1. `actions/checkout@v4` (`submodules: recursive`, `fetch-depth: 0`)
2. `peaceiris/actions-hugo` (Hugo Extended)
3. `hugo --minify --gc`
4. `touch public/.nojekyll` and write `CNAME`
5. Verify `public/index.html` exists
6. `JamesIves/github-pages-deploy-action@v4.7.3` (folder: `public`, branch: `gh-pages`, clean: true)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every push to `main` results in a successful workflow run (green check)
- **SC-002**: The live site at `www.rafaelvzago.com` reflects the latest `main` content within 5 minutes of push
- **SC-003**: The `gh-pages` branch contains only the built output (no source files)

## Assumptions

- GitHub Pages is configured to serve from the `gh-pages` branch
- The custom domain DNS (CNAME) is configured at the DNS provider level
- The repository has `contents: write` permission for the workflow
