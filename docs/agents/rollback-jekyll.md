# Rollback: Hugo → Jekyll (Chirpy)

Use this only if the Hugo cutover regresses production and you need the previous Jekyll site live again.

**Immutable baseline tag:** `jekyll-baseline-2026-07-24` → commit `6955e18` on `main` (Jekyll + Chirpy + Actions → `gh-pages`).

Keep the tag forever. Retire this runbook ~2 weeks after a stable Hugo cutover (tag stays).

## Prerequisites

- `gh` authenticated for `rafaelvzago/rafaelvzago.github.io`
- Ability to push to `main` (or open a PR that restores the tag tip)
- Confirm live Pages still deploys from branch `gh-pages` via `.github/workflows/pages-deploy.yml`

## Restore `main` to the Jekyll baseline

Prefer a revert of the Hugo merge if history is linear and the merge is recent. Otherwise reset `main` to the tag (force-push only with explicit human approval).

### Option A — revert the Hugo merge (preferred)

```bash
git fetch origin
git checkout main
git pull origin main
# Find the Hugo cutover merge SHA, then:
git revert -m 1 <hugo-merge-sha>
git push origin main
```

### Option B — hard restore to tag (explicit human approval required)

```bash
git fetch origin --tags
git checkout main
git reset --hard jekyll-baseline-2026-07-24
# ONLY if the human explicitly approved a force-push to main:
git push --force-with-lease origin main
```

After either option, `main` must again contain:

- `_config.yml`, `Gemfile`, `Gemfile.lock`
- `_posts/`, Chirpy theme / `assets/lib` submodule as on the tag
- Jekyll workflow named **Build and deploy Jekyll site** (Ruby → `_site` → `gh-pages`)

## Redeploy

The Jekyll workflow runs on push to `main` and supports `workflow_dispatch`.

```bash
# After push, or to re-run without a new commit:
gh workflow run "Build and deploy Jekyll site" --repo rafaelvzago/rafaelvzago.github.io
gh run watch --repo rafaelvzago/rafaelvzago.github.io
```

Confirm the deploy action wrote to `gh-pages` with `folder: _site` (or the Jekyll output path from that tag’s workflow).

## Smoke checklist (live)

- [ ] https://www.rafaelvzago.com/ loads (Chirpy layout)
- [ ] One known post URL still works (e.g. a `/posts/<slug>/` from the baseline era)
- [ ] https://www.rafaelvzago.com/amigo/ (or path as on baseline)
- [ ] https://www.rafaelvzago.com/qr/ (or path as on baseline)
- [ ] Custom domain / CNAME still resolves to `www.rafaelvzago.com`

## After rollback

- Treat Hugo work as a feature branch again; do not delete `jekyll-baseline-2026-07-24`.
- Fix Hugo on a branch; re-cutover only after local preview approval (see [`sdlc.md`](./sdlc.md)).
