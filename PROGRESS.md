# Progress

## Hugo cutover + Jekyll rollback (PRD #33) — SHIPPED

- Merged to `main` @ `734a380` (2026-07-24); preview LGTM
- Deploy: Actions run [30120888331](https://github.com/rafaelvzago/rafaelvzago.github.io/actions/runs/30120888331) success → `gh-pages`
- Live: https://www.rafaelvzago.com (Hugo/Archie, bilingual)
- Baseline tag: `jekyll-baseline-2026-07-24` → `6955e18`
- Rollback runbook: [`docs/agents/rollback-jekyll.md`](docs/agents/rollback-jekyll.md) — **retire ~2026-08-07** if stable; **keep tag forever**
- Note: GitHub PR create API returned HTTP 500 for this repo; cutover merged to `main` after LGTM

## Multilingual pt-br + en

- Config: `hugo.toml` languages; content in `content/pt-br/` + `content/en/`
- Preview: `hugo server` → http://127.0.0.1:1313/ and `/en/`
