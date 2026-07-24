---
title: "Como eu uso IA no desenvolvimento (Cursor e Claude)"
description: "Como organizo skills, AGENTS.md, agentes e regras no Cursor e Claude Code para desenvolver e escrever o blog, com humano no loop e sem prometer mágica."
date: 2026-07-22
slug: "como-eu-uso-ia-no-desenvolvimento"
tags: [ai, devops, automacao, workflow, produtividade, opensource, desenvolvimento, productivity]
toc: true
images:
  - "/assets/img/headers/como-eu-uso-ia-no-desenvolvimento.png"
---

![](/assets/img/headers/como-eu-uso-ia-no-desenvolvimento.png)

A pergunta que mais ouço sobre IA no dia a dia não é "qual modelo você usa?". É "como você organiza isso para não virar bagunça?".

Eu uso IA o tempo todo, no código e neste blog. O que mudou a minha rotina não foi um prompt milagroso. Foi tratar o agente como alguém que entra no projeto sem contexto: se a regra não está em arquivo, ela não existe. Skills, `AGENTS.md`, agentes com papéis estreitos e eu revisando o resultado. Sem mágica.

Em outro post falei do [Claude Code no fluxo de PRD a PR](/posts/claude-code-automatizando-workflow-prd-pr/). Aqui o assunto é outro: o sistema de arquivos e papéis que montei neste repositório, e por que eu gastei tempo nisso.

## O contrato, não o chat

A conversa com o modelo some. O repositório fica.

Quando abro uma sessão no Cursor ou no Claude Code, o agente precisa descobrir sozinho o que pode fazer, o que não pode e como o trabalho é entregue. Se isso depender da minha memória em cada chat, eu falho na segunda semana. Já falhei. Por isso o "contrato" vive em arquivos versionados:

| Arquivo / pasta | Papel |
| :--- | :--- |
| `AGENTS.md` | Regras do domínio: português, frontmatter, categorias, tags, arquivos protegidos |
| `CLAUDE.md` | Comandos Jekyll, estrutura do site, visão geral |
| `docs/agents/sdlc.md` | Playbook de processo: grill, spec, tickets, implement, preview, ship |
| `.claude/agents/` | Personas (Writer, Reviewer, Content Analyst, Committer) |
| `.claude/skills/` | Runbooks passo a passo que os agentes executam |
| `.claude/commands/` | Atalhos de slash command que disparam os skills |
| Regras do Cursor (`~/.cursor/rules/`) | Comportamento global: processo agentic e minimalismo |

O modelo lê. Eu reviso. O Git guarda. Parece óbvio escrito assim. Na prática, a maioria das pessoas ainda guarda a regra na cabeça ou num prompt favorito que ninguém mais encontra.

## Duas camadas: processo e domínio

Misturar "como planejamos trabalho" com "como um post do blog deve ser" vira confusão. Separei em duas camadas porque já vi o agente tentar as duas coisas no mesmo turno.

### Processo (SDLC agentic)

Para mudança de site, plugin, automação ou refactor que não é typo, o fluxo é explícito:

1. Clarificar: entrevistar decisões abertas antes de travar desenho
2. Especificar: PRD com problema, solução, histórias, decisões de teste e fora de escopo
3. Fatiar tickets: fatias verticais demoáveis, com critérios de aceite e bloqueios
4. Implementar: um ticket por vez, com TDD nos seams combinados
5. Revisar com humano: diff e review, não merge silencioso
6. Preview local: o agente sobe o Jekyll e espera aprovação antes de abrir PR
7. Ship: só depois do meu "ok"

Skills de processo ficam no nível do usuário (`~/.claude/skills/`, `~/.cursor/skills/`), não copiados para dentro de cada app. O playbook do projeto aponta para eles. O corpo do skill não fica duplicado no repo.

### Domínio (conteúdo do blog)

Writer, Reviewer, Content Analyst e Committer seguem `AGENTS.md` e os skills em `.claude/`. Eles não inventam SDLC paralelo. Se o pedido de post vira mudança de tema ou CI, a gente muda de trilha e volta ao playbook de processo.

Essa divisão existe por um motivo bem concreto: já peguei agente "melhorando" o `_config.yml` no meio de um post. Nego isso em arquivo e em hook.

## Skills: runbooks, não prompts soltos

Skill, para mim, não é um texto genérico de "seja um especialista". É procedimento: entradas, passos, checagens, saída esperada.

Boa parte dessa forma de pensar veio do trabalho do [Matt Pocock](https://github.com/mattpocock) com [skills para engenheiros](https://github.com/mattpocock/skills): skills como arquivos reais no disco, pensados para o agente executar, não como prompt favorito perdido no chat. Eu adaptei a ideia ao blog e ao meu fluxo; o crédito da abordagem original é dele.

Neste blog, quatro skills cobrem o ciclo editorial.

### `write-post`

Lê os três posts mais recentes para calibrar tom. Propõe título, slug, categorias, tags e description. Gera frontmatter canônico. Escreve o corpo em pt-BR. Valida acentuação, estrutura e tamanho. Se eu pedir, encadeia o Reviewer.

### `review-post`

Somente leitura. Checklist de frontmatter, nome de arquivo, existência da imagem de header, acentuação portuguesa, headings, links e SEO. Relatório em ERROS, AVISOS e SUGESTÕES. Nunca edita o post. Isso importa: se o revisor também "conserta", eu perco o rastro do que era achado e do que era edição.

### `analyze-content`

Inventário de `_posts/`, gaps de publicação, cobertura por categoria e tag versus o foco do site, e sugestões concretas de temas. Também só leitura. Uso quando estou sem ideia e não quero inventar tema no vazio.

### `commit`

Inspeciona a árvore, filtra arquivos protegidos, roda as checagens obrigatórias e cria commit convencional. Não faz push. Nunca usa `git add .`. Eu ainda escolho o que entra.

Os commands em `.claude/commands/` são wrappers finos: `/write-post`, `/review-post`, `/analyze-content`, `/commit`. A inteligência está no skill. O command só dispara o fluxo.

## Agentes com papéis estreitos

Um único agente "faz tudo" mistura escrita com commit e com refactor. Prefiro personas pequenas:

- Writer cria o post e pode chamar o Reviewer depois
- Reviewer só reporta e não toca no arquivo
- Content Analyst olha inventário e lacunas
- Committer faz o commit depois das checagens

O Writer declara no próprio arquivo quais tools e skills usa. O Reviewer declara que é read-only. Não acho isso burocracia. Acho API humana para o modelo. Se a fronteira não está escrita, o modelo improvisa.

## Arquivos protegidos e ganchos

Confiança sem freio quebra o site. Em `.claude/settings.json` nego edição de `_config.yml`, `LICENSE`, `Gemfile` e `Gemfile.lock`. Um hook `PreToolUse` bloqueia Write e Edit nesses paths.

No `AGENTS.md` a regra aparece de novo, em texto: não alterar esses arquivos, não mexer em `_plugins/` sem pedido explícito, não push direto em `main`.

O skill de commit reforça a mesma coisa. Se algum protegido estiver sujo na árvore, avisa e não inclui no commit. Redundância de propósito. Uma camada falha, outra segura.

## Minimalismo: escrever menos código certo

Processo sozinho vira fábrica de abstrações. A outra regra que carrego é o oposto do hype de "gerar mais":

1. Precisa existir?
2. Já existe neste codebase?
3. A stdlib resolve?
4. Uma linha resolve?
5. Só então: o mínimo que funciona

Corrigir o sintoma em cinco call sites é pior que um guard na função compartilhada. Abstração que ninguém pediu não entra. Atalho consciente ganha um comentário `ponytail:` com o teto conhecido e o caminho de upgrade.

IA útil, neste modo, é a que deleta e reusa. Não a que inventa um framework no meio do post porque "ficou mais limpo".

## Um dia típico no blog

Quando vou publicar aqui, o fluxo costuma ser este:

```text
/analyze-content          → "o que falta cobrir?"
/write-post <tema>        → rascunho + frontmatter
/review-post <arquivo>    → ERROS / AVISOS
(humano edita voz e fatos)
bundle exec jekyll serve  → preview em http://localhost:4000
/commit                   → commit convencional, sem push
(humano aprova) → PR → merge
```

O preview é onde eu corto o romantismo. O agente sobe o servidor (ou reusa um que já está saudável), passa a URL e para. Sem o meu "ok", não tem PR. Se for só docs, mostrar o diff e esperar também conta.

## Um dia típico em código ou no site

Para feature ou refactor:

```text
grill (decisões abertas)
  → PRD (issue + cópia em .scratch/)
  → tickets verticais (cada um demoável)
  → implement + tdd no seam combinado
  → code-review com humano
  → jekyll serve / build + htmlproofer
  → só então PR
```

Tickets pequenos cabem melhor numa janela de contexto fresca. Prefactors entram primeiro. Refactors largos usam expand-contract. Se o desenho ainda está em aberto, a gente grila antes de travar. Parece lento. Na prática, evita o retrabalho de três PRs que resolvem o problema errado.

## O que os arquivos realmente dizem ao agente

Trecho típico do contrato de domínio, o tipo de coisa que evita post sem `description` ou categoria inventada:

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

E regras que economizam retrabalho:

- Conteúdo novo em pt-BR com acentuação correta
- Heading de conteúdo começa em `##` (o Chirpy já usa o título do frontmatter como `<h1>`)
- Categorias e tags contra um registro aprovado; valor novo precisa de confirmação humana
- Checagem de acentuação com `grep` de palavras comuns sem acento antes do commit

Nada disso é sofisticado. É repetível. Agente sem registro inventa tag. Com registro, pergunta. Eu prefiro a pergunta.

## Onde eu fico no loop

HITL aqui não é slogan de palestra. São pontos em que eu paro o fluxo de propósito:

- Antes de travar desenho, quando há trade-off real
- Depois do diff, porque review humano pega o que o lint do modelo não pega
- No preview, olhando a página renderizada
- Antes do ship, com aprovação explícita para PR ou merge
- No Reviewer de conteúdo: o agente não "conserta" sozinho; eu decido o que aceitar

O modelo erra com confiança. Já vi frontmatter bonito com fato errado, YAML de exemplo que nunca rodou e tom de artigo genérico que eu não escreveria. O contrato reduz a superfície de erro. Não elimina a obrigação de ler.

Se você leu [o que acontece quando você conversa com uma IA](/posts/o-que-acontece-quando-voce-conversa-com-uma-ia/), sabe o ponto: o sistema otimiza fluência, não verdade. Arquivo, skill e humano é a minha resposta prática a isso no desenvolvimento.

## O que eu deliberadamente não faço

Não deixo o agente dar push em `main`. Não confio em "gere um PRD" sem olhar o código e o histórico. Não meço sucesso por linhas geradas. Não escondo o custo de setup: escrever skills e `AGENTS.md` leva tempo, e o tempo volta na forma de menos retrabalho, não de mágica. Também não trato MCP, plugins e hype de ferramenta como substituto de processo.

Ferramenta ajuda. Contrato escala. Processo sem disciplina vira teatro.

## Como começar sem copiar meu setup inteiro

Se quiser o mínimo útil:

1. Um `AGENTS.md` (ou equivalente) com linguagem, arquivos protegidos e formato de entrega
2. Um skill de "fazer a coisa principal do repo" com checagens no final
3. Um skill de review somente leitura
4. Uma regra: preview ou demo antes de PR
5. Uma regra: menor mudança correta, sem abstração pedida pelo ego do modelo

Para ver skills prontos e o formato que eu usei de referência, comece pelo repositório do Matt: [github.com/mattpocock/skills](https://github.com/mattpocock/skills). Depois você especializa. Writer, Reviewer e Analyst só fazem sentido quando o volume de conteúdo ou o risco de inconsistência justifica. No começo, um skill bom e um humano atento vencem um organograma de agentes vazios.

## O que ainda falha

Este setup continua sendo trabalho. Skills desatualizam. Registro de tags drift. Branch de bootstrap de docs pode estar à frente do que está em `main`. O agente às vezes ignora o playbook se o meu prompt for ambíguo. Aí a culpa é minha por não apontar o arquivo certo.

Também não resolve produto ruim, requisito confuso ou falta de testes. Só torna o caminho do chat até o merge mais auditável. Isso já me basta na maior parte dos dias.

## Fechando

Uso IA no desenvolvimento mais ou menos como uso CI: com pipeline, gates e artefatos. A diferença é que os artefatos são markdown (skills, agentes, `AGENTS.md`, playbook) e o gate final continua sendo uma pessoa olhando a página ou o diff.

Se você já tem Claude Code ou Cursor e sente que cada sessão começa do zero, pare de colecionar prompts. Escreva o contrato. Transforme o fluxo que você já faz bem em skill. Separe processo de domínio. Exija preview. Delete o que o modelo inventou sem pedido.

O restante é prática. E um `grep` de acentuação antes do commit, porque eu já publiquei a palavra sem til mais vezes do que admito.
