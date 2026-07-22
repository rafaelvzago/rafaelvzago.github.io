# Domain docs

How agents consume domain knowledge for this blog.

## Primary sources

| Doc | Role |
|-----|------|
| [`AGENTS.md`](../../AGENTS.md) | Content invariants: language, frontmatter, categories/tags, pre-commit checks, content-agent chaining |
| [`CLAUDE.md`](../../CLAUDE.md) | Project overview, Jekyll commands, content structure, agent system overview |
| [`.claude/agents/`](../../.claude/agents/) | Writer, Reviewer, Content Analyst, Committer definitions |
| [`.claude/skills/`](../../.claude/skills/) | Content workflows (`write-post`, `review-post`, `analyze-content`, `commit`) |

## Process vs domain

- **Process** (grill → spec → tickets → implement → preview → ship): [`sdlc.md`](./sdlc.md). Wins on conflicts about *how* work is planned and shipped.
- **Domain** (Portuguese content, Chirpy frontmatter, approved tags, protected files): `AGENTS.md` / `CLAUDE.md`. Wins on *what* valid blog content looks like.

## Protected files (domain)

Never modify unless the human explicitly requests: `_config.yml`, `LICENSE`, `Gemfile`, `Gemfile.lock`, and `_plugins/` (unless asked).

## Language

New content is pt-BR with correct accents, unless the human asks for English.
