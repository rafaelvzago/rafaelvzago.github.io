---
title: "Migrei de Jekyll para Hugo com desenvolvimento agentic"
description: "Como migrei o blog de Jekyll/Chirpy para Hugo/Archie com SDLC agentic: PRD, tickets, preview local obrigatório, cutover e rollback, sem push antes do ok."
date: 2026-07-26
slug: "migrei-o-blog-de-jekyll-para-hugo-com-desenvolvimento-agentic"
tags: [ai, devops, automacao, hugo, jekyll, migration, produtividade, opensource]
toc: true
images:
  - "/assets/img/headers/migrei-o-blog-de-jekyll-para-hugo-com-desenvolvimento-agentic.png"
---

![Ilustração da migração de Jekyll para Hugo](/assets/img/headers/migrei-o-blog-de-jekyll-para-hugo-com-desenvolvimento-agentic.png)

Em 24 de julho de 2026 este blog deixou de ser Jekyll + Chirpy e passou a ser Hugo + Archie. Eu podia ter tratado isso como "troca o tema e torce". Não tratei. Foi cutover com PRD, tickets verticais, preview local obrigatório e tag de rollback imutável.

Já escrevi sobre [como organizo skills e agentes](/posts/como-eu-uso-ia-no-desenvolvimento/) e sobre o [fluxo genérico de PRD a PR](/posts/claude-code-automatizando-workflow-prd-pr/). Este post é o estudo de caso: o mesmo playbook, numa migração real deste repositório. Processo na espinha, passos reproduzíveis no meio. Multilíngue fica para o próximo capítulo. Aqui o assunto é o cutover Jekyll → Hugo.

## Por que sair do Jekyll

Eu gostava do Chirpy. O problema não era o tema. Era a ferramenta: Ruby, Bundler, Gemfile, atualização de dependência que quebra o build no dia errado. Para um blog estático, eu queria um binário, build rápido e menos superfície de gem.

Hugo Extended resolve isso. Archie é minimalista de propósito: sem PWA do Chirpy, sem arquivo de categorias como produto. Aceitei a perda visual. Não aceitei perder URL de post, domínio customizado, analytics em produção, nem os sub-sites estáticos `qr/` e `amigo/`.

## Restrições que viraram PRD

Antes de tocar em arquivo, travei o que não podia quebrar:

- Permalinks `/posts/<slug>/` iguais aos de antes (bookmark e busca)
- Deploy ainda em `gh-pages` com CNAME `www.rafaelvzago.com`
- Trackers só no build de produção (`hugo server` sem poluir analytics)
- Assets em `/assets/...`
- `qr/` e `amigo/` fora da navegação, mas vivos
- Docs e agentes atualizados para os novos paths
- Nenhum push até eu aprovar o preview local

Isso virou a issue [#33](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/33). Cópia local em `.scratch/prd-hugo-migration.md`. O playbook está em `docs/agents/sdlc.md`: grill → spec → tickets → implement → preview → ship.

## Clarify → PRD

O grill não foi teatro. Decisões que eu quase adiei e que importavam:

- Manter JamesIves → `gh-pages` em vez de migrar para artifact-based Pages no mesmo PR
- Archie como submodule, não fork
- Sem paridade visual com Chirpy
- Tracker: snippets no build de produção, omitidos no servidor local

Trecho do problema no PRD (redigido sem IDs de medição):

```markdown
## Problem Statement

The blog is built with Jekyll and the Chirpy theme (Ruby/Bundler).
The author wants a faster, simpler static toolchain with Hugo and the
minimal Archie theme, while keeping post URLs, custom-domain GitHub
Pages deploy, and Google tracking (GA4 + GTM). Local testing must work
before any push.
```

Solução, também do PRD:

```markdown
## Solution

Migrate the site to Hugo with the Archie theme on a local `hugo` branch:
port content and assets, inject GA4 via Hugo services and GTM via custom
partials, rewrite GitHub Actions and Makefile for Hugo → `public/` →
`gh-pages` with CNAME, update agent/docs specs, then preview locally.
No push/PR until the author asks.
```

Decisões de implementação que realmente guiaram o agente:

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

Fora de escopo, de propósito:

```markdown
## Out of Scope

- Chirpy visual/PWA/category archive parity
- Switching off `gh-pages` to artifact-based Pages
- Deduplicating GA4 tags inside the GTM container admin
- Push/PR/merge until author explicitly requests
```

## Tickets como fatias verticais

O PRD sozinho não implementa. Fatiei em issues filhas, cada uma demoável sozinha. Cópias em `.scratch/hugo-migration/issues/`.

| Ticket | Issue | O que entrega |
| :--- | :--- | :--- |
| T1 Scaffold | [#34](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/34) | Hugo + Archie + trackers em prod |
| T2 Conteúdo | [#35](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/35) | Posts, About, assets, qr/amigo |
| T3 CI/Makefile | [#36](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/36) | Actions + `make test` no `public/` |
| T4 Docs/agentes | [#37](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/37) | CLAUDE/AGENTS/specs em Hugo |
| T5 Cutover local | [#38](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/38) | Remove Jekyll, smoke, sem push |
| T6 Baseline | [#39](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/39) | Tag `jekyll-baseline-2026-07-24` + runbook |
| T7 Limpeza | [#40](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/40) | Branch pronta para cutover |
| T8 Smoke | [#41](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/41) | Checklist URL/analytics local |
| T9 Ship | [#42](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/42) | Merge + smoke pós-deploy |

Critérios de aceite do T1, quase literais:

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

Do T5, o ticket que impede o agente de "já ir pro ar":

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

## Fase a fase (reproduzível)

Abaixo está o caminho que o agente seguiu. Ajuste versões; a forma importa mais que o número mágico do dia.

### T1: Scaffold

```bash
git submodule add https://github.com/athul/archie.git themes/archie
git submodule update --init --recursive
```

`hugo.toml` mínimo na época do cutover (antes do layout multilíngue atual):

- `theme = "archie"`
- `languageCode` / timezone `America/Sao_Paulo`
- menus: Home, Posts, About, Tags
- `enableGitInfo = true` (CI com `fetch-depth: 0`)
- permalinks de post em `/posts/<slug>/`

Trackers: serviço nativo do Hugo para GA4; partials de GTM no head/body. Ambos condicionados a `not hugo.IsServer`. Em `hugo server`, a página local não carrega o snippet. No `hugo --minify` de produção, sim.

Validação rápida:

```bash
hugo server
# abrir http://127.0.0.1:1313/
hugo --minify
# grep nos HTML de public/ pelos IDs públicos de medição — e confirmar
# que o HTML do servidor de desenvolvimento não os contém
```

### T2: Conteúdo e estáticos

Mapeamento que usei:

| Antes (Jekyll) | Depois (Hugo, cutover) |
| :--- | :--- |
| `_posts/*.md` | `content/posts/*.md` |
| `_tabs/about.md` (ou equivalente) | `content/about.md` |
| assets do tema/posts | `static/assets/` → URL `/assets/...` |
| `qr/`, `amigo/` | `static/qr/`, `static/amigo/` |

Frontmatter: Chirpy usava `categories` + `image.path`. Archie/Hugo neste site usa `tags`, `slug`, `description`, `images` (lista). O agente portou posts um a um e checou permalink com o basename/slug, não com o nome do arquivo datado.

`qr/` tinha Liquid no Jekyll. No Hugo virou estático puro: gerador em `scripts/qr/`, publicação em `static/qr/`. `amigo/` já era HTML standalone; só mudou de pasta.

### T3: GitHub Actions e Makefile

Troca de forma, não de destino de deploy:

1. Checkout com `submodules: recursive` e `fetch-depth: 0`
2. Hugo Extended (versão pinada no workflow)
3. `hugo --minify --gc`
4. `touch public/.nojekyll` (GitHub Pages não reprocessa com Jekyll)
5. Escrever `CNAME` com `www.rafaelvzago.com` em `public/`
6. JamesIves → branch `gh-pages`, `folder: public`

Makefile alinhado: `serve` / `build` / `test` apontam para Hugo e htmlproofer em `./public` (antes era `./_site`).

Localmente, aceite do ticket:

```bash
make test
# ou, no mínimo:
hugo --minify
```

Não colo valor de secret no post. Se o workflow usa `${{ secrets.* }}`, o YAML mostra o placeholder, nunca o valor resolvido. Neste deploy, o JamesIves usa o token padrão do job com `contents: write`; não há secret customizado no trecho de build.

### T4: Docs e agentes

Sem isso, o próximo `/write-post` ainda falaria de `_posts/` e `bundle exec jekyll serve`. Atualizei:

- `CLAUDE.md` / `AGENTS.md`: comandos Hugo, paths `content/...`
- `specs/site-core`, `content-workflow`, `deployment`
- skills Writer/Reviewer onde havia path hardcoded de Jekyll

O contrato de domínio continua em `AGENTS.md`. O processo continua em `docs/agents/sdlc.md`. Misturar os dois no mesmo arquivo foi o erro que eu já tinha corrigido antes; a migração só mudou o alvo.

### T5: Cutover local

Só depois de T2–T4 verdes:

- Remover `_config.yml`, `Gemfile*`, `_posts/`, `_tabs/`, `_plugins/`, restos do Chirpy
- Subir `hugo server`, passar a URL, parar
- Smoke: home, um post conhecido, About, Tags, uma imagem em `/assets/`, `/qr/`, `/amigo/`
- Build de produção: trackers presentes no HTML gerado; ausentes no HTML do server

Sem push. Sem PR. O ticket fecha com "humano olhou".

## Preview como gate

No SDLC deste repo, preview não é "rode você aí". O agente sobe o servidor (ou reusa um saudável), manda a URL e espera. Sem o meu ok, não abre PR e não faz ship.

```text
grill → PRD (#33) → tickets (#34–#42)
  → implement um ticket por vez
  → review com humano
  → hugo server (agente sobe) → URL → espera LGTM
  → só então ship
```

Eu falhei nisso em outros projetos: agente empolgado, push cedo, produção quebrada às 23h. Aqui a regra está em arquivo e no texto do T5. Funciona porque o critério de aceite diz "No git push / PR created".

## Números do cutover

Medi o intervalo entre a tag `jekyll-baseline-2026-07-24` (`6955e18`) e o merge de cutover `734a380`. Horários em America/Sao_Paulo.

![Timeline do cutover Jekyll para Hugo, de 23 a 24 de julho de 2026](/assets/img/jekyll-hugo-cutover-timeline.png)

| Marco | Quando |
| :--- | :--- |
| PRD [#33](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/33) aberto | 23/07/2026 23:56 |
| Tickets T1–T5 publicados | ~00:03 do dia 24 |
| Commit do submodule Archie + limpeza Jekyll | 24/07 14:52 |
| Commit do site Hugo (conteúdo + CI + layout) | 24/07 16:16 |
| Runbook de rollback | 24/07 16:24 |
| Merge no `main` (`734a380`) | 24/07 16:31 |
| PRD e T9 fechados | 24/07 16:33 |

**Tempo de parede (PRD → merge):** cerca de 16h35min. Não foram 16 horas de digitação contínua: à noite saiu o PRD e os tickets; eu dormi; o gap da madrugada até o início da tarde é sono, não build rodando sozinho. A tarde concentrou a implementação que entrou em `main`.

**Janela dos commits de aterrissagem:** 14:52 → 16:31, cerca de **1h39min** entre o submodule Archie e o merge.

**Diff `jekyll-baseline-2026-07-24` → `734a380`:**

- 180 arquivos tocados
- +7217 / −1148 linhas
- ~117 arquivos novos, ~25 modificados, ~24 renomes, 10 removidos

Onde mais mexeu: `content/` (maior volume de linhas), `static/`, `layouts/`, e a saída de `_posts/` / restos Jekyll. O merge de cutover já carregava o trabalho bilíngue que entrou no mesmo dia; o post sobre multilíngue fica para depois, mas estes números são do cutover real.

### O que foi mais rápido (e limpo)

Sem retrabalho feio na trilha:

1. **Baseline + runbook de rollback** — tag imutável e `docs/agents/rollback-jekyll.md` entraram em minutos, sem commit de correção em seguida.
2. **Scaffold Archie** — submodule + drop dos leftovers Jekyll num commit só (`76923a4`), sem fixup.
3. **Deploy pós-merge** — Actions run [30120888331](https://github.com/rafaelvzago/rafaelvzago.github.io/actions/runs/30120888331) concluiu success em ~20 segundos.

O pedaço pesado foi conteúdo e layouts (milhares de linhas em `content/` e overrides). Processo não elimina o volume; elimina o “push cego” no meio do volume.

## Ship e rollback

Cutover foi para `main` em `734a380` (2026-07-24). Deploy: Actions run [30120888331](https://github.com/rafaelvzago/rafaelvzago.github.io/actions/runs/30120888331) → `gh-pages`. Live: [www.rafaelvzago.com](https://www.rafaelvzago.com).

Antes do merge, congelei o Jekyll:

- Tag imutável: `jekyll-baseline-2026-07-24` → commit `6955e18`
- Runbook: `docs/agents/rollback-jekyll.md`

Duas saídas se o Hugo piorar produção:

Opção A, revert do merge (preferida):

```bash
git fetch origin
git checkout main
git pull origin main
git revert -m 1 <hugo-merge-sha>
git push origin main
```

Opção B, hard restore na tag (só com aprovação explícita de force-push):

```bash
git fetch origin --tags
git checkout main
git reset --hard jekyll-baseline-2026-07-24
# ONLY com aprovação humana explícita:
git push --force-with-lease origin main
```

A tag fica para sempre. O runbook pode ser aposentado umas duas semanas depois de estável; a tag não.

## O que raspou

A API de criar PR no GitHub devolveu HTTP 500 neste repositório no dia do ship. Não foi drama de processo: mergeou em `main` depois do LGTM local, documentado no `PROGRESS.md`. Humano no loop. Agente não inventou workaround com token.

## O que ficou de fora de propósito

- Paridade visual/PWA/arquivo de categorias do Chirpy
- Trocar `gh-pages` por Pages via artifact no mesmo esforço
- Deduplicar GA4 dentro do container GTM (ops, não migração)
- Site bilíngue completo: veio na sequência e merece post próprio. Aqui só o cutover de toolchain

## O que eu levaria para outro repo

1. Restrições viram PRD antes do primeiro `hugo new`
2. Ticket vertical com "sem push" explícito no aceite
3. Tag de baseline antes do merge que apaga o mundo antigo
4. Preview local é gate, não cortesia
5. Contrato em git (`AGENTS.md`, `docs/agents/sdlc.md`) vence prompt favorito no chat

Se você só quer a lista de arquivos, este post é longo demais. Se você quer ver um agente atravessar uma migração sem queimar produção, o caminho foi esse: issue [#33](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/33), tickets [#34](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/34)–[#42](https://github.com/rafaelvzago/rafaelvzago.github.io/issues/42), tag `jekyll-baseline-2026-07-24`, e um humano que disse "ok" no preview antes do ship.

{{< youtube X_LzAxnIvCI >}}

