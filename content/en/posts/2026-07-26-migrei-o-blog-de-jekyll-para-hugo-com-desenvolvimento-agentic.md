---
title: "I moved the blog from Jekyll to Hugo with agentic SDLC"
description: "How I moved this blog from Jekyll/Chirpy to Hugo/Archie with an agentic SDLC: PRD, tickets, local preview, cutover, and rollback, with no push before LGTM."
date: 2026-07-26
slug: "migrei-o-blog-de-jekyll-para-hugo-com-desenvolvimento-agentic"
tags: [ai, devops, automacao, hugo, jekyll, migration, produtividade, opensource]
toc: true
images:
  - "/assets/img/headers/migrei-o-blog-de-jekyll-para-hugo-com-desenvolvimento-agentic.png"
---

![Illustration of migrating from Jekyll to Hugo](/assets/img/headers/migrei-o-blog-de-jekyll-para-hugo-com-desenvolvimento-agentic.png)

On 24 July 2026 this blog stopped being Jekyll + Chirpy and became Hugo + Archie. I could have treated that as "swap the theme and hope." I did not. It was a cutover with a PRD, vertical tickets, a mandatory local preview, and an immutable rollback tag.

I already wrote about [how I organize skills and agents](/en/posts/como-eu-uso-ia-no-desenvolvimento/) and about a [generic PRD-to-PR workflow](/en/posts/claude-code-automatizando-workflow-prd-pr/). This post is the case study: the same playbook on a real migration in this repository. Process as the spine, reproducible steps in the middle. Full multilingual is the next chapter. Here the subject is the Jekyll → Hugo toolchain cutover.

## Why leave Jekyll

I liked Chirpy. The problem was not the theme. It was the toolchain: Ruby, Bundler, Gemfile, a dependency bump that breaks the build on the wrong day. For a static blog I wanted a binary, a fast build, and less gem surface area.

Hugo Extended covers that. Archie is minimal on purpose: no Chirpy PWA, no category archive as a product. I accepted the visual loss. I did not accept losing post URLs, the custom domain, production analytics, or the static sub-sites `qr/` and `amigo/`.

## Constraints that became a PRD

Before touching files, I locked what could not break:

- Permalinks `/posts/<slug>/` identical to before (bookmarks and search)
- Deploy still on `gh-pages` with CNAME `www.rafaelvzago.com`
- Trackers only on production builds (`hugo server` must not pollute analytics)
- Assets under `/assets/...`
- `qr/` and `amigo/` off-nav, but alive
- Docs and agents updated for the new paths
- No push until I approved the local preview

That became issue [#33](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/33). Local copy at `.scratch/prd-hugo-migration.md`. The playbook lives in `docs/agents/sdlc.md`: grill → spec → tickets → implement → preview → ship.

## Clarify → PRD

The grill was not theater. Decisions I almost deferred and that mattered:

- Keep JamesIves → `gh-pages` instead of moving to artifact-based Pages in the same PR
- Archie as a submodule, not a fork
- No visual parity with Chirpy
- Tracking: snippets on production builds, omitted on the local server

Problem statement from the PRD (measurement IDs omitted):

```markdown
## Problem Statement

The blog is built with Jekyll and the Chirpy theme (Ruby/Bundler).
The author wants a faster, simpler static toolchain with Hugo and the
minimal Archie theme, while keeping post URLs, custom-domain GitHub
Pages deploy, and Google tracking (GA4 + GTM). Local testing must work
before any push.
```

Solution, also from the PRD:

```markdown
## Solution

Migrate the site to Hugo with the Archie theme on a local `hugo` branch:
port content and assets, inject GA4 via Hugo services and GTM via custom
partials, rewrite GitHub Actions and Makefile for Hugo → `public/` →
`gh-pages` with CNAME, update agent/docs specs, then preview locally.
No push/PR until the author asks.
```

Implementation decisions that actually steered the agent:

```markdown
## Implementation Decisions

- Theme: Archie as git submodule under `themes/archie`.
- Config: `hugo.toml` with languageCode pt-br, timezone America/Sao_Paulo,
  menus, social links, enableGitInfo.
- Permalinks: posts at `/posts/:contentbasename/` (slug / basename).
- Tracking: Hugo services + site partials gated on `not hugo.IsServer`.
- Content: `_posts` → `content/posts`; about → `content/about.md`;
  assets → `static/assets`; qr/amigo → `static/`.
- Feature scope: minimal Archie (no Chirpy PWA, no category archive pages).
- CI: keep JamesIves → `gh-pages`; replace Ruby/Jekyll with Hugo Extended
  + submodule checkout `fetch-depth: 0`.
- Remote: no push/PR during implementation; GitHub Issues OK for tracker.
```

Out of scope, on purpose:

```markdown
## Out of Scope

- Chirpy visual/PWA/category archive parity
- Switching off `gh-pages` to artifact-based Pages
- Deduplicating GA4 tags inside the GTM container admin
- Push/PR/merge until author explicitly requests
```

## Tickets as vertical slices

A PRD alone does not ship. I split child issues, each demoable on its own. Copies under `.scratch/hugo-migration/issues/`.

| Ticket | Issue | Delivers |
| :--- | :--- | :--- |
| T1 Scaffold | [#34](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/34) | Hugo + Archie + prod trackers |
| T2 Content | [#35](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/35) | Posts, About, assets, qr/amigo |
| T3 CI/Makefile | [#36](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/36) | Actions + `make test` on `public/` |
| T4 Docs/agents | [#37](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/37) | CLAUDE/AGENTS/specs on Hugo |
| T5 Local cutover | [#38](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/38) | Remove Jekyll, smoke, no push |
| T6 Baseline | [#39](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/39) | Tag `jekyll-baseline-2026-07-24` + runbook |
| T7 Cleanup | [#40](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/40) | Branch ready for cutover |
| T8 Smoke | [#41](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/41) | Local URL/analytics checklist |
| T9 Ship | [#42](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/42) | Merge + post-deploy smoke |

T1 acceptance criteria, nearly literal:

```markdown
# 01 — Scaffold Hugo + Archie + GA4/GTM

**What to build:** A runnable Hugo site with Archie theme, site identity
config, and GA4 + GTM wired for production builds only.

**Blocked by:** None

- [ ] `hugo.toml` exists with title, menus, social, theme=archie, enableGitInfo
- [ ] Archie present as git submodule under `themes/archie`
- [ ] GA4 via services.googleAnalytics
- [ ] GTM via site partials, skipped when `hugo.IsServer`
- [ ] `hugo server` serves a home page locally
```

T5, the ticket that stops the agent from "just going live":

```markdown
# 05 — Local cutover prep (no push)

**What to build:** Remove Jekyll-only cruft after Hugo path works; leave a
local preview URL and smoke checklist. Stop before push/PR.

**Blocked by:** 02, 03, 04

- [ ] Jekyll cruft removed (`_config.yml`, `_posts/`, `_tabs/`, Gemfile*,
      `_plugins/`, Chirpy submodule refs as applicable)
- [ ] `hugo server` runs and URL shared with author
- [ ] Smoke checklist covered (posts, about, tags, assets, qr/amigo,
      GA/GTM in production HTML)
- [ ] No git push / PR created
```

## Phase by phase (reproducible)

Below is the path the agent followed. Adjust versions; the shape matters more than the magic number of the day.

### T1: Scaffold

```bash
git submodule add https://github.com/athul/archie.git themes/archie
git submodule update --init --recursive
```

Minimal `hugo.toml` at cutover time (before today's multilingual layout):

- `theme = "archie"`
- `languageCode` / timezone `America/Sao_Paulo`
- menus: Home, Posts, About, Tags
- `enableGitInfo = true` (CI with `fetch-depth: 0`)
- post permalinks at `/posts/<slug>/`

Tracking: Hugo's native GA4 service; GTM partials in head/body. Both gated on `not hugo.IsServer`. On `hugo server`, the local page does not load the snippet. On production `hugo --minify`, it does.

Quick validation:

```bash
hugo server
# open http://127.0.0.1:1313/
hugo --minify
# grep public/ HTML for the public measurement IDs — and confirm
# development-server HTML does not contain them
```

### T2: Content and statics

Mapping I used:

| Before (Jekyll) | After (Hugo, cutover) |
| :--- | :--- |
| `_posts/*.md` | `content/posts/*.md` |
| `_tabs/about.md` (or equivalent) | `content/about.md` |
| theme/post assets | `static/assets/` → URL `/assets/...` |
| `qr/`, `amigo/` | `static/qr/`, `static/amigo/` |

Frontmatter: Chirpy used `categories` + `image.path`. Archie/Hugo on this site uses `tags`, `slug`, `description`, `images` (list). The agent ported posts one by one and checked permalinks with basename/slug, not the dated filename.

`qr/` had Liquid under Jekyll. Under Hugo it became pure static: generator in `scripts/qr/`, published under `static/qr/`. `amigo/` was already standalone HTML; it only moved folders.

### T3: GitHub Actions and Makefile

Same deploy destination, different build shape:

1. Checkout with `submodules: recursive` and `fetch-depth: 0`
2. Hugo Extended (version pinned in the workflow)
3. `hugo --minify --gc`
4. `touch public/.nojekyll` (GitHub Pages must not reprocess with Jekyll)
5. Write `CNAME` with `www.rafaelvzago.com` into `public/`
6. JamesIves → `gh-pages` branch, `folder: public`

Makefile aligned: `serve` / `build` / `test` point at Hugo and htmlproofer on `./public` (was `./_site`).

Local ticket acceptance:

```bash
make test
# or at least:
hugo --minify
```

I am not pasting secret values here. If a workflow uses `${{ secrets.* }}`, the YAML shows the placeholder, never the resolved value. In this deploy, JamesIves uses the job's default token with `contents: write`; there is no custom secret in the build steps shown above.

### T4: Docs and agents

Without this, the next `/write-post` would still talk about `_posts/` and `bundle exec jekyll serve`. I updated:

- `CLAUDE.md` / `AGENTS.md`: Hugo commands, `content/...` paths
- `specs/site-core`, `content-workflow`, `deployment`
- Writer/Reviewer skills wherever Jekyll paths were hardcoded

Domain contract still lives in `AGENTS.md`. Process still lives in `docs/agents/sdlc.md`. Mixing both in one file was the mistake I had already fixed; the migration only changed the target.

### T5: Local cutover

Only after T2–T4 were green:

- Remove `_config.yml`, `Gemfile*`, `_posts/`, `_tabs/`, `_plugins/`, Chirpy leftovers
- Start `hugo server`, share the URL, stop
- Smoke: home, a known post, About, Tags, one `/assets/` image, `/qr/`, `/amigo/`
- Production build: trackers present in generated HTML; absent from server HTML

No push. No PR. The ticket closes with "human looked."

## Preview as a gate

In this repo's SDLC, preview is not "run this yourself." The agent starts the server (or reuses a healthy one), sends the URL, and waits. Without my ok, no PR and no ship.

```text
grill → PRD (#33) → tickets (#34–#42)
  → implement one ticket at a time
  → review with human
  → hugo server (agent starts) → URL → wait for LGTM
  → only then ship
```

I have failed this on other projects: excited agent, early push, production broken at 11pm. Here the rule is in a file and in the T5 text. It works because the acceptance criteria say "No git push / PR created."

## Cutover numbers

I measured from tag `jekyll-baseline-2026-07-24` (`6955e18`) to cutover merge `734a380`. Times in America/Sao_Paulo.

![Jekyll to Hugo cutover timeline, 23–24 July 2026](/assets/img/jekyll-hugo-cutover-timeline.png)

| Milestone | When |
| :--- | :--- |
| PRD [#33](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/33) opened | 2026-07-23 23:56 |
| Tickets T1–T5 published | ~00:03 on the 24th |
| Archie submodule + Jekyll cleanup commit | 2026-07-24 14:52 |
| Hugo site commit (content + CI + layouts) | 2026-07-24 16:16 |
| Rollback runbook | 2026-07-24 16:24 |
| Merge to `main` (`734a380`) | 2026-07-24 16:31 |
| PRD and T9 closed | 2026-07-24 16:33 |

**Wall clock (PRD → merge):** about 16h35min. That was not 16 hours of continuous typing: overnight we got the PRD and tickets; then I slept. The gap from late night to mid-afternoon is sleep, not a build running on its own. The afternoon concentrated the work that landed on `main`.

**Landing-commit window:** 14:52 → 16:31, about **1h39min** from the Archie submodule commit to the merge.

**Diff `jekyll-baseline-2026-07-24` → `734a380`:**

- 180 files touched
- +7217 / −1148 lines
- ~117 added, ~25 modified, ~24 renames, 10 deleted

Biggest churn: `content/` (most lines), `static/`, `layouts/`, and the exit from `_posts/` / Jekyll leftovers. The cutover merge already carried the bilingual work that landed the same day; the multilingual story is a later post, but these numbers are the real cutover.

### What was fastest (and clean)

No ugly rework on the path:

1. **Baseline + rollback runbook** — immutable tag and `docs/agents/rollback-jekyll.md` landed in minutes, with no follow-up fixup commit.
2. **Archie scaffold** — submodule + drop Jekyll leftovers in one commit (`76923a4`), no fixup.
3. **Post-merge deploy** — Actions run [30120888331](https://github.com/rafaelvzago/rafaelvzago.github.io/actions/runs/30120888331) finished success in ~20 seconds.

The heavy slice was content and layouts (thousands of lines under `content/` and overrides). Process does not erase volume; it erases the blind push in the middle of the volume.

## Ship and rollback

Cutover landed on `main` at `734a380` (2026-07-24). Deploy: Actions run [30120888331](https://github.com/rafaelvzago/rafaelvzago.github.io/actions/runs/30120888331) → `gh-pages`. Live: [www.rafaelvzago.com](https://www.rafaelvzago.com).

Before the merge, I froze Jekyll:

- Immutable tag: `jekyll-baseline-2026-07-24` → commit `6955e18`
- Runbook: `docs/agents/rollback-jekyll.md`

Two exits if Hugo regresses production:

Option A, revert the merge (preferred):

```bash
git fetch origin
git checkout main
git pull origin main
git revert -m 1 <hugo-merge-sha>
git push origin main
```

Option B, hard restore to the tag (only with explicit force-push approval):

```bash
git fetch origin --tags
git checkout main
git reset --hard jekyll-baseline-2026-07-24
# ONLY with explicit human approval:
git push --force-with-lease origin main
```

The tag stays forever. The runbook can retire a couple of weeks after a stable cutover; the tag does not.

## What nearly went wrong

The GitHub "create PR" API returned HTTP 500 for this repository on ship day. Not a process failure: it merged to `main` after local LGTM, noted in `PROGRESS.md`. Human in the loop. The agent did not invent a token workaround.

## What I left out on purpose

- Chirpy visual/PWA/category-archive parity
- Switching `gh-pages` to artifact-based Pages in the same effort
- Deduplicating GA4 inside the GTM container (ops, not migration)
- Full bilingual site: that landed next and deserves its own post. This one is the toolchain cutover only

## What I would take to another repo

1. Constraints become a PRD before the first `hugo new`
2. Vertical ticket with an explicit "no push" in acceptance
3. Baseline tag before the merge that deletes the old world
4. Local preview is a gate, not a courtesy
5. Contracts in git (`AGENTS.md`, `docs/agents/sdlc.md`) beat a favorite prompt in chat

If you only want a file list, this post is too long. If you want to see an agent walk a migration without burning production, the path was this: issue [#33](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/33), tickets [#34](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/34)–[#42](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/42), tag `jekyll-baseline-2026-07-24`, and a human who said "ok" on the preview before ship.
