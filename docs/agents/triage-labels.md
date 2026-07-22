# Triage labels

Agentic triage roles for this repo. Create missing labels with `gh label create` if needed.

| Label | Meaning | Color (suggested) |
|-------|---------|-------------------|
| `needs-triage` | Maintainer must evaluate | `#fbca04` |
| `needs-info` | Waiting on reporter | `#d93f0b` |
| `ready-for-agent` | Fully specified; AFK agent can implement | `#0e8a16` |
| `ready-for-human` | Needs human implementation | `#1d76db` |
| `wontfix` | Will not be actioned (GitHub default) | `#ffffff` |

## Mapping from GitHub defaults

| GitHub default | Use for |
|----------------|---------|
| `bug` | Defects (still apply a triage role) |
| `enhancement` | Features (still apply a triage role) |
| `documentation` | Docs-only work |
| `question` | Often pairs with `needs-info` |

Agents implementing work should only pick up issues labeled `ready-for-agent` unless the human explicitly assigns something else.
