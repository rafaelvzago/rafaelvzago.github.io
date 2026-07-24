# Agentic development playbook

Canonical process for Cursor / Claude work in this repository.
**Do not invent a parallel SDLC.** On conflicts, this file (on remote `main`) wins over local memory or a stale clone.

Skills live at user level (`~/.cursor/skills/` / `~/.claude/skills/`).
Read the skill file before using it. Do **not** vendor skill bodies into this repo.

| Skill | When |
|-------|------|
| `batch-grill-me` | Design is open — frontier interview before locking decisions |
| `to-spec` | Conversation → PRD → tracked issue |
| `to-tickets` | PRD → vertical-slice tickets with blockers |
| `implement` | Build one ticket |
| `tdd` | Red-green at pre-agreed seams |
| `code-review` | Standards + Spec review (HITL with the human) |
| `handoff` | Compact context for a fresh agent |
| `diagnosing-bugs` | Hard bugs / regressions |

Tracker binding: [`issue-tracker.md`](./issue-tracker.md).
Domain / content invariants: root [`AGENTS.md`](../../AGENTS.md) and [`domain.md`](./domain.md) — they do **not** override this playbook.

---

## When this playbook applies

- **Full flow (grill → spec → tickets → implement):** non-trivial site work — theme/layout changes, plugins, automation, tooling, multi-file refactors, new features.
- **Content agents (Writer / Reviewer / Content Analyst / Committer):** still valid for blog posts and content ops. They follow `AGENTS.md` + `.claude/` skills. If a post request expands into site/feature work, switch to this playbook.
- **Trivial one-liners** (typo, single-line fix with clear acceptance): may skip grill/spec/tickets when the human explicitly waives process.

---

## Flow (in order)

### 0. Source of truth

Load these docs first. Prefer remote `main` over a stale local clone.

- `docs/agents/sdlc.md` (this file)
- `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md`
- Root `AGENTS.md` / `CLAUDE.md` — commands and domain only

### 1. Clarify — `batch-grill-me`

If design is ambiguous or has real trade-offs, grill round-by-round before locking.
Prefer YAGNI / smallest correct change.

### 2. Spec — `to-spec`

Confirm testing seams with the user first. Publish a PRD as a tracked GitHub issue.
Save a local copy under `.scratch/prd-<slug>.md`. Apply triage label `ready-for-agent`.

PRD shape:

- Problem Statement
- Solution
- User Stories
- Implementation Decisions (modules/interfaces/API — no fragile file paths)
- Testing Decisions (external behavior, seams, prior art)
- Out of Scope
- Further Notes

### 3. Tickets — `to-tickets`

Break the PRD into **tracer-bullet vertical slices**:

- Narrow but complete path through every layer (content / Liquid / assets / CI / tests as applicable)
- Demoable alone; sized for one fresh context window
- Prefactors first; wide refactors use expand–contract

Quiz the user on granularity and blockers, then publish each ticket as its own issue (parent = PRD).
Local copies: `.scratch/<slug>/issues/NN-<slug>.md`. Apply triage label.
Do **not** close or rewrite the parent PRD when publishing tickets.

Every ticket body includes: What to build, Acceptance criteria, Blocked by.

### 4. Implement loop (frontier = unblocked tickets)

1. **Build** — `implement` + `tdd` at agreed seams only
2. **Review** — show the diff to the human; run `code-review` (HITL)
3. **Local preview (required)** — agent **starts** the preview server, gives the URL, **waits for explicit approval** before Ship. Reuse a healthy existing server when possible. Docs-only: show the diff and wait. Do **not** open a PR until they confirm.
4. **Track** — update repo-root `PROGRESS.md`; close the ticket issue
5. **Handoff** — at ~50% of tickets or end of a phase, run `handoff` → `/tmp/handoff-<slug>.md`
6. **Next** — next unblocked ticket

#### Local preview — agent must run the env

1. Check existing terminals; reuse if already serving this site.
2. Otherwise start the narrowest useful preview in the background, wait until ready, report the exact URL.
3. Ask the human to review at that URL and **stop** until they approve or request changes.

**Preview commands (this project):**

```bash
git submodule update --init --recursive   # Archie theme
hugo server                 # http://127.0.0.1:1313/
hugo server --buildDrafts  # including drafts
hugo --minify              # production build → public/
make test                  # build + htmlproofer/smoke on public/
```

Jekyll rollback (emergency only): [`rollback-jekyll.md`](./rollback-jekyll.md) and tag `jekyll-baseline-2026-07-24`.

Hard rules:

- Every ticket **must** be a tracker issue **before** coding starts
- Never push directly to `main` — feature branch → PR → merge
- **Never open a PR until the human has previewed locally and approved**
- **Agent runs the preview env**; do not leave “run this yourself” as the default
- If the user says proceed without approval between tickets, run the loop sequentially
  (local preview still required before Ship unless they explicitly waive it)
- Prefer the smallest correct change
- Do not invent process; do not skip grill/spec/tickets for non-trivial work

### 5. Ship

Only after local preview approval:

1. Open a PR against `main` (GitHub: `rafaelvzago/rafaelvzago.github.io`)
2. Merge when asked
3. Deploy path: GitHub Pages via the repo’s existing Pages/CI setup

Post-merge checklist:

- [ ] CI / Pages build succeeded
- [ ] Expected revision is live at https://rafaelvzago.github.io
- [ ] Smoke-check the change

---

## Tracker & triage

See [`issue-tracker.md`](./issue-tracker.md) and [`triage-labels.md`](./triage-labels.md).

Default roles:

| Role | Meaning |
|------|---------|
| `needs-triage` | Maintainer must evaluate |
| `needs-info` | Waiting on reporter |
| `ready-for-agent` | Fully specified; AFK agent can implement |
| `ready-for-human` | Needs human implementation |
| `wontfix` | Will not be actioned |
