---
title: "How I use AI in development (Cursor and Claude)"
description: "How I organize skills, AGENTS.md, agents, and rules in Cursor and Claude Code for coding and this blog, with humans in the loop and no magic."
date: 2026-07-22
slug: "como-eu-uso-ia-no-desenvolvimento"
tags: [ai, devops, automacao, workflow, produtividade, opensource, desenvolvimento, productivity]
toc: true
images:
  - "/assets/img/headers/como-eu-uso-ia-no-desenvolvimento.png"
---

![](/assets/img/headers/como-eu-uso-ia-no-desenvolvimento.png)

The question I hear most about day-to-day AI is not "which model do you use?" It is "how do you organize this so it does not turn into a mess?"

I use AI constantly, in code and on this blog. What changed my routine was not a miracle prompt. It was treating the agent like someone who joins the project with no context: if the rule is not in a file, it does not exist. Skills, `AGENTS.md`, agents with narrow roles, and me reviewing the result. No magic.

In another post I covered [Claude Code in the PRD-to-PR flow](/en/posts/claude-code-automatizando-workflow-prd-pr/). Here the topic is different: the file and role system I built in this repository, and why I spent time on it.

## The contract, not the chat

The conversation with the model disappears. The repository stays.

When I open a session in Cursor or Claude Code, the agent has to discover on its own what it can do, what it cannot, and how work gets delivered. If that depends on my memory in every chat, I fail by week two. I already have. So the "contract" lives in versioned files:

| File / folder | Role |
| :--- | :--- |
| `AGENTS.md` | Domain rules: Portuguese, frontmatter, categories, tags, protected files |
| `CLAUDE.md` | Jekyll commands, site structure, overview |
| `docs/agents/sdlc.md` | Process playbook: grill, spec, tickets, implement, preview, ship |
| `.claude/agents/` | Personas (Writer, Reviewer, Content Analyst, Committer) |
| `.claude/skills/` | Step-by-step runbooks the agents execute |
| `.claude/commands/` | Slash-command shortcuts that trigger the skills |
| Cursor rules (`~/.cursor/rules/`) | Global behavior: agentic process and minimalism |

The model reads. I review. Git keeps it. It sounds obvious written like that. In practice, most people still keep the rule in their head or in a favorite prompt nobody else can find.

## Two layers: process and domain

Mixing "how we plan work" with "how a blog post should look" turns into confusion. I split them into two layers because I have already watched an agent try both in the same turn.

### Process (agentic SDLC)

For site changes, plugins, automation, or refactors that are not typos, the flow is explicit:

1. Clarify: interview open decisions before locking design
2. Specify: PRD with problem, solution, stories, testing decisions, and out of scope
3. Slice tickets: demoable vertical slices with acceptance criteria and blockers
4. Implement: one ticket at a time, with TDD at the agreed seams
5. Human review: diff and review, no silent merge
6. Local preview: the agent starts Jekyll and waits for approval before opening a PR
7. Ship: only after my "ok"

Process skills live at the user level (`~/.claude/skills/`, `~/.cursor/skills/`), not copied into every app. The project playbook points to them. The skill body is not duplicated in the repo.

### Domain (blog content)

Writer, Reviewer, Content Analyst, and Committer follow `AGENTS.md` and the skills under `.claude/`. They do not invent a parallel SDLC. If a post request turns into a theme or CI change, we switch tracks and go back to the process playbook.

That split exists for a concrete reason: I have already caught an agent "improving" `_config.yml` in the middle of a post. I deny that in a file and in a hook.

## Skills: runbooks, not loose prompts

A skill, for me, is not a generic "be an expert" blurb. It is a procedure: inputs, steps, checks, expected output.

A lot of that way of thinking came from [Matt Pocock](https://github.com/mattpocock)'s work on [skills for engineers](https://github.com/mattpocock/skills): skills as real files on disk, meant for the agent to execute, not a favorite prompt lost in chat. I adapted the idea to the blog and my flow; credit for the original approach is his.

On this blog, four skills cover the editorial cycle.

### `write-post`

Reads the three most recent posts to calibrate tone. Proposes title, slug, categories, tags, and description. Generates canonical frontmatter. Writes the body in pt-BR. Validates accentuation, structure, and length. If I ask, it chains the Reviewer.

### `review-post`

Read-only. Checklist for frontmatter, filename, header image existence, Portuguese accentuation, headings, links, and SEO. Report in ERRORS, WARNINGS, and SUGGESTIONS. Never edits the post. That matters: if the reviewer also "fixes" things, I lose the trail of what was a finding and what was an edit.

### `analyze-content`

Inventory of `_posts/`, publishing gaps, category and tag coverage versus the site focus, and concrete topic suggestions. Also read-only. I use it when I am out of ideas and do not want to invent a topic in a vacuum.

### `commit`

Inspects the tree, filters protected files, runs the required checks, and creates a conventional commit. Does not push. Never uses `git add .`. I still choose what goes in.

The commands in `.claude/commands/` are thin wrappers: `/write-post`, `/review-post`, `/analyze-content`, `/commit`. The intelligence is in the skill. The command only triggers the flow.

## Agents with narrow roles

A single "does everything" agent mixes writing with commits and refactors. I prefer small personas:

- Writer creates the post and can call the Reviewer afterward
- Reviewer only reports and does not touch the file
- Content Analyst looks at inventory and gaps
- Committer commits after the checks

The Writer declares in its own file which tools and skills it uses. The Reviewer declares it is read-only. I do not see that as bureaucracy. I see it as a human API for the model. If the boundary is not written down, the model improvises.

## Protected files and hooks

Trust without brakes breaks the site. In `.claude/settings.json` I deny edits to `_config.yml`, `LICENSE`, `Gemfile`, and `Gemfile.lock`. A `PreToolUse` hook blocks Write and Edit on those paths.

In `AGENTS.md` the rule shows up again in text: do not change those files, do not touch `_plugins/` without an explicit ask, no direct push to `main`.

The commit skill reinforces the same thing. If a protected file is dirty in the tree, it warns and does not include it in the commit. Redundancy on purpose. One layer fails, another holds.

## Minimalism: write less correct code

Process alone becomes an abstraction factory. The other rule I carry is the opposite of the "generate more" hype:

1. Does it need to exist?
2. Does it already exist in this codebase?
3. Does the stdlib solve it?
4. Does one line solve it?
5. Only then: the minimum that works

Fixing the symptom at five call sites is worse than one guard in the shared function. Abstractions nobody asked for do not land. Intentional shortcuts get a `ponytail:` comment with the known ceiling and the upgrade path.

Useful AI, in this mode, deletes and reuses. It does not invent a framework in the middle of a post because it "looked cleaner."

## A typical day on the blog

When I am about to publish here, the flow usually looks like this:

```text
/analyze-content          → "o que falta cobrir?"
/write-post <tema>        → rascunho + frontmatter
/review-post <arquivo>    → ERROS / AVISOS
(humano edita voz e fatos)
bundle exec jekyll serve  → preview em http://localhost:4000
/commit                   → commit convencional, sem push
(humano aprova) → PR → merge
```

Preview is where I cut the romanticism. The agent starts the server (or reuses one that is already healthy), gives me the URL, and stops. Without my "ok," there is no PR. If it is docs-only, showing the diff and waiting counts too.

## A typical day in code or on the site

For a feature or refactor:

```text
grill (decisões abertas)
  → PRD (issue + cópia em .scratch/)
  → tickets verticais (cada um demoável)
  → implement + tdd no seam combinado
  → code-review com humano
  → jekyll serve / build + htmlproofer
  → só então PR
```

Small tickets fit better in a fresh context window. Prefactors come first. Wide refactors use expand-contract. If the design is still open, we grill before locking. It looks slow. In practice it avoids the rework of three PRs that solve the wrong problem.

## What the files actually tell the agent

A typical slice of the domain contract — the kind of thing that prevents a post without `description` or an invented category:

```yaml
---
layout: post
title: "Título do Post em Português"
description: "Descrição para SEO com 150-160 caracteres"
date: YYYY-MM-DD
categories: [Categoria1, Categoria2]
tags: [tag1, tag2, tag3]
image:
  path: /assets/img/headers/nome-do-arquivo.ext
  alt: Descrição da imagem
---
```

And rules that save rework:

- New content in pt-BR with correct accentuation
- Content headings start at `##` (Chirpy already uses the frontmatter title as `<h1>`)
- Categories and tags against an approved registry; a new value needs human confirmation
- Accentuation check with `grep` for common unaccented words before commit

None of that is sophisticated. It is repeatable. An agent without a registry invents tags. With a registry, it asks. I prefer the question.

## Where I stay in the loop

HITL here is not a conference slogan. These are points where I deliberately stop the flow:

- Before locking design, when there is a real trade-off
- After the diff, because human review catches what the model's lint does not
- At preview, looking at the rendered page
- Before ship, with explicit approval for PR or merge
- On the content Reviewer: the agent does not "fix" on its own; I decide what to accept

The model errs with confidence. I have seen pretty frontmatter with wrong facts, example YAML that never ran, and a generic article tone I would not write. The contract shrinks the error surface. It does not remove the obligation to read.

If you read [what happens when you talk to an AI](/en/posts/o-que-acontece-quando-voce-conversa-com-uma-ia/), you know the point: the system optimizes for fluency, not truth. File, skill, and human is my practical answer to that in development.

## What I deliberately do not do

I do not let the agent push to `main`. I do not trust "generate a PRD" without looking at the code and history. I do not measure success by lines generated. I do not hide the setup cost: writing skills and `AGENTS.md` takes time, and that time comes back as less rework, not magic. I also do not treat MCP, plugins, and tool hype as a substitute for process.

Tools help. Contracts scale. Process without discipline becomes theater.

## How to start without copying my whole setup

If you want the useful minimum:

1. An `AGENTS.md` (or equivalent) with language, protected files, and delivery format
2. A skill for "do the main thing in this repo" with checks at the end
3. A read-only review skill
4. One rule: preview or demo before PR
5. One rule: smallest correct change, no abstraction requested by the model's ego

For ready-made skills and the format I used as reference, start with Matt's repo: [github.com/mattpocock/skills](https://github.com/mattpocock/skills). Then specialize. Writer, Reviewer, and Analyst only make sense when content volume or inconsistency risk justifies them. At the start, one good skill and an attentive human beat an org chart of empty agents.

## What still fails

This setup is still work. Skills go stale. The tag registry drifts. A docs bootstrap branch can be ahead of what is on `main`. The agent sometimes ignores the playbook if my prompt is ambiguous. Then the fault is mine for not pointing at the right file.

It also does not fix bad product, confused requirements, or missing tests. It only makes the path from chat to merge more auditable. That is enough for me most days.

## Closing

I use AI in development roughly the way I use CI: with a pipeline, gates, and artifacts. The difference is that the artifacts are markdown (skills, agents, `AGENTS.md`, playbook) and the final gate is still a person looking at the page or the diff.

If you already have Claude Code or Cursor and feel every session starts from zero, stop collecting prompts. Write the contract. Turn the flow you already do well into a skill. Separate process from domain. Require preview. Delete what the model invented without being asked.

The rest is practice. And a `grep` for accentuation before commit, because I have published the word without a tilde more times than I admit.
