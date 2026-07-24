# Progress

## Hugo cutover + Jekyll rollback (PRD #33)

- Baseline tag: `jekyll-baseline-2026-07-24` → `6955e18` (Jekyll/Chirpy on `origin/main`)
- Rollback runbook: [`docs/agents/rollback-jekyll.md`](docs/agents/rollback-jekyll.md)
- Cutover branch: `feat/multilingual` (Hugo + Archie + pt-BR/en)
- Tickets: [#39](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/39) T6, [#40](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/40) T7, [#41](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/41) T8, [#42](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/42) T9
- Content freeze: no new posts on `main` until cutover merges
- Ship gate: local preview at http://127.0.0.1:1313/ — agent smoke passed; awaiting human OK before PR (#41 → #42)
- Post-cutover: retire [`docs/agents/rollback-jekyll.md`](docs/agents/rollback-jekyll.md) ~2 weeks after stable live Hugo (keep tag `jekyll-baseline-2026-07-24` forever)

## Multilingual pt-br + en (branch `feat/multilingual`)

- Config: `hugo.toml` languages; content in `content/pt-br/` + `content/en/`
- UI: `i18n/{pt-br,en}.toml`, language switcher, localized chrome
- Preview: http://127.0.0.1:1313/ and http://127.0.0.1:1313/en/
