# Issue tracker

| Field | Value |
|-------|-------|
| Host | GitHub |
| Repo | `rafaelvzago/rafaelvzago.github.io` |
| Default branch | `main` |
| CLI | `gh` |
| Auth | `gh auth login` (user already authenticated in agent env when available) |

## Conventions

- PRDs and tickets are **GitHub Issues**.
- Parent/child: link tickets to the PRD issue in the body (`Parent: #N`) and with `gh issue develop` / issue references as available.
- Apply triage labels from [`triage-labels.md`](./triage-labels.md). Prefer `ready-for-agent` when a ticket is fully specified.
- Local scratch copies (not source of truth):
  - `.scratch/prd-<slug>.md`
  - `.scratch/<slug>/issues/NN-<slug>.md`

## Common commands

```bash
gh issue create --title "..." --body "$(cat <<'EOF'
...
EOF
)" --label ready-for-agent

gh issue list --label ready-for-agent
gh issue view <N>
gh issue close <N> --comment "Done in <sha / PR>"

gh pr create --base main --title "..." --body "$(cat <<'EOF'
...
EOF
)"
```

## Ship / push policy

- Do **not** push to `main` directly.
- Push feature branches and open PRs only after local preview approval (see [`sdlc.md`](./sdlc.md) §5).
- Content-agent commits (Writer/Committer) still require an explicit human ask to commit; Ship/PR still requires preview approval.
