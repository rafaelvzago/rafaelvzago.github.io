# AGENTS.md

Regras comportamentais e invariantes para todos os agentes que operam neste repositorio.

**Processo (SDLC):** ver [`docs/agents/sdlc.md`](docs/agents/sdlc.md). Este arquivo e `CLAUDE.md` cobrem comandos e dominio; nao sobrescrevem o playbook.

## Comandos de Setup

```bash
git submodule update --init --recursive  # theme Archie
hugo server                               # servidor de desenvolvimento
hugo server --buildDrafts                 # incluindo rascunhos
hugo --minify                             # build para producao (public/)
make test                                 # build + validacao
```

## Regras Globais

1. O site e bilingue (`pt-br` padrao em `/`, `en` em `/en/`). Conteudo novo vai em `content/pt-br/` ou `content/en/` (mesmo caminho relativo liga traducoes). Posts em pt-BR exigem acentuacao correta; posts em ingles devem soar naturais. Posts publicados DEVEM ter irmao na outra lingua quando o escopo for bilingue.
2. Nunca fazer push direto em `main`. Push de feature branch / PR so apos preview local e aprovacao humana (ver `docs/agents/sdlc.md` §5). Fora do passo Ship, nao executar `git push`.
3. Nunca modificar arquivos protegidos: `hugo.toml` (sem pedido explicito), `LICENSE`.
4. Nunca modificar arquivos em `themes/archie/` diretamente — use overrides em `layouts/` ou atualize o submodule.
5. Nunca usar `git add .` ou `git add -A`. Sempre adicionar arquivos individualmente.
6. Posts devem usar `##` como heading de nivel mais alto (o titulo do frontmatter vira `<h1>`).
7. Nunca criar posts com datas no futuro alem de 7 dias.
8. Slugs de posts devem ser lowercase, sem acentos, separados por hifens.

## Formato Canonico de Frontmatter

Todo post novo deve seguir exatamente este formato:

```yaml
---
title: "Titulo do Post em Portugues"
description: "Descricao para SEO com 150-160 caracteres"
date: YYYY-MM-DD
slug: "titulo-do-post-em-portugues"
tags: [tag1, tag2, tag3]
toc: true
images:
  - "/assets/img/headers/nome-do-arquivo.ext"
---
```

Campos obrigatorios para posts novos: `title`, `description`, `date`, `slug`, `tags`, `images`.

Para posts existentes (pre-2025) que nao possuem `description`, o Reviewer deve emitir WARNING, nao ERROR.

## Registro de Categorias Aprovadas

(Categorias Chirpy foram fundidas em tags na migracao Hugo. Prefira tags.)

```
AI, carreira, chatbot, CI/CD, cloud, DevOps, english, grafana,
instructlab, Internet, Istio, Jenkins, k8s, Kubernetes, linux,
MLOps, multi, network, networking, off-topic, OpenShift, opensource,
pipeline, productivity, raspberry, redhat, rtos, Service Mesh,
skupper, Skupper, sobre, tcpip, tecnologia, vim
```

Novas categorias/tags podem ser adicionadas, mas o agente deve sinalizar para confirmacao do usuario.

## Registro de Tags Aprovadas

```
ai, ambient-mode, architecture, arpanet, automacao, casc, carreira,
chatbot, ci-cd, cicd, cloud, contribuicao, database, deep-learning,
deepseek, desenvolvimento, devops, editor, fraud-detection, gguf,
gitops, gpt, grafana, hands-on, historia, hybrid-cloud, ingress,
instructlab, insurance, instrutor, internet, iot, jenkins, kernel,
kiali, kubernetes, licencas, linux, llama-cpp, llm, loadbalancer,
local-ai, low-latency, machine-learning, migration, mlops,
monitoring, motions, multicloud, networking, neovim, nginx,
observability, openshift, opensource, palestrante, pessoal,
pipeline, podman, preempt-rt, produtividade, prometheus, protocolos,
rafael-zago, raspberry-pi, real-time, redes, redhat, rtos, security,
service-mesh, sistemas-embarcados, skupper, software-livre, sobre,
tcp-ip, tecnologia, temperature-sensor, tools, transformers,
tutorial, upstream-downstream, vim, workshop
```

Novas tags podem ser adicionadas, mas o agente deve sinalizar para confirmacao do usuario.

## Checagens Obrigatorias Pre-Commit

Antes de qualquer commit, TODOS os checks abaixo devem passar:

### 1. Validacao de Frontmatter

Verificar que todos os campos obrigatorios estao presentes no frontmatter de posts novos ou modificados.

### 2. Formato de Nome de Arquivo

Nome do arquivo deve seguir `YYYY-MM-DD-slug.md` em `content/pt-br/posts/` ou `content/en/posts/`. A data no nome deve ser consistente com o campo `date:` do frontmatter.

### 3. Referencia de Imagem

Caminhos em `images` devem corresponder a arquivos existentes em `static/assets/img/headers/` (URL `/assets/img/headers/...`).

### 4. Qualidade de idioma (pt-BR e en)

Detectar o locale pelo path: `content/pt-br/...` → pt-BR; `content/en/...` → en. Rodar o check do locale do arquivo (e o do irmao, se existir).

**pt-BR — acentuacao obrigatoria** (cada hit = ERROR):

```bash
grep -inE '\b(codigo|voce|nao|tambem|alem|ate|pagina|unico|possivel|necessario|basico|metodo|titulo|topico|analise|numero|conteudo|seguranca|producao|informacao|aplicacao|integracao|solucao|funcao|execucao|configuracao|operacao|referencia|experiencia)\b' content/pt-br/posts/ARQUIVO.md
```

**en — gramatica / typos comuns** (cada hit = ERROR, exceto dentro de code fences):

```bash
grep -inE '\b(teh|recieve|seperate|occured|definately|accomodate|untill|wich|becuase|alot|loose\b|their\s+is|there\s+are\s+a\b|could\s+of\b|should\s+of\b|would\s+of\b)\b' content/en/posts/ARQUIVO.md
```

Alem do grep, o Reviewer DEVE revisar o corpo EN para: concordancia verbal, artigos (a/an/the), tempo verbal inconsistente, e calques do portugues (ex.: "the same of", "depends of", "in the next"). Posts em qualquer idioma DEVEM passar pelo `/humanizer` antes de publicar.

### 5. Categorias e Tags

Comparar tags propostas contra o registro aprovado. Sinalizar valores novos para confirmacao.

## Encadeamento de Subagentes

Os agentes suportam encadeamento via Agent tool:
- O Writer pode invocar o Reviewer como subagente apos criar um post.
- O Reviewer pode ser invocado standalone ou como parte de um chain.
- Cada skill verifica se foi invocado standalone ou como parte de um pipeline (via argumentos).

Exemplo de chain: `/write-post kubernetes observability` -> Writer cria post -> spawna Reviewer -> Reviewer reporta findings inline.
