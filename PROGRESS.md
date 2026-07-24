# Progress

## Hugo migration (branch `hugo`)

- PRD: https://github.com/rafaelvzago/rafaelvzago.github.io/issues/33
- Tickets #34–#38 completed locally (no push)
- Local preview: `hugo server` → http://127.0.0.1:1313/
- Pending human: local testing, then explicit request to push/PR

## Multilingual pt-br + en (branch `feat/multilingual`)

- Local PRD: `.scratch/prd-multilingual.md` (no GitHub issues, no push)
- Config: `hugo.toml` languages; content in `content/pt-br/` + `content/en/`
- UI: `i18n/{pt-br,en}.toml`, language switcher, localized chrome
- Content: About + all 20 posts bilingual (matching filenames)
- Specs/constitution/AGENTS updated for bilingual
- Preview: http://127.0.0.1:1313/ and http://127.0.0.1:1313/en/
- `make test` passes locally
- Stop condition: local only — do not push / open PR unless asked
