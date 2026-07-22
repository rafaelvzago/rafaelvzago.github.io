# AGENTS.md

Regras comportamentais e invariantes para todos os agentes que operam neste repositorio.

**Processo (SDLC):** ver [`docs/agents/sdlc.md`](docs/agents/sdlc.md). Este arquivo e `CLAUDE.md` cobrem comandos e dominio; nao sobrescrevem o playbook.

## Comandos de Setup

```bash
bundle exec jekyll serve          # servidor de desenvolvimento
bundle exec jekyll serve --drafts # incluindo rascunhos
bundle exec jekyll build          # build para producao
bundle exec htmlproofer ./_site   # validacao HTML
```

## Regras Globais

1. Todo conteudo novo deve ser escrito em portugues (pt-BR) com acentuacao correta, salvo quando o usuario pedir explicitamente em ingles.
2. Nunca fazer push direto em `main`. Push de feature branch / PR so apos preview local e aprovacao humana (ver `docs/agents/sdlc.md` §5). Fora do passo Ship, nao executar `git push`.
3. Nunca modificar arquivos protegidos: `_config.yml`, `LICENSE`, `Gemfile`, `Gemfile.lock`.
4. Nunca modificar arquivos em `_plugins/` a menos que explicitamente solicitado.
5. Nunca usar `git add .` ou `git add -A`. Sempre adicionar arquivos individualmente.
6. Posts devem usar `##` como heading de nivel mais alto (Chirpy renderiza o titulo do frontmatter como `<h1>`).
7. Nunca criar posts com datas no futuro alem de 7 dias.
8. Slugs de posts devem ser lowercase, sem acentos, separados por hifens.

## Formato Canonico de Frontmatter

Todo post novo deve seguir exatamente este formato:

```yaml
---
layout: post
title: "Titulo do Post em Portugues"
description: "Descricao para SEO com 150-160 caracteres"
date: YYYY-MM-DD
categories: [Categoria1, Categoria2]
tags: [tag1, tag2, tag3]
image:
  path: /assets/img/headers/nome-do-arquivo.ext
  alt: Descricao da imagem
---
```

Campos obrigatorios para posts novos: `layout`, `title`, `description`, `date`, `categories`, `tags`, `image.path`, `image.alt`.

Para posts existentes (pre-2025) que nao possuem `description`, o Reviewer deve emitir WARNING, nao ERROR.

## Registro de Categorias Aprovadas

```
AI, carreira, chatbot, CI/CD, cloud, DevOps, english, grafana,
instructlab, Internet, Istio, Jenkins, k8s, Kubernetes, linux,
MLOps, multi, network, networking, off-topic, OpenShift, opensource,
pipeline, productivity, raspberry, redhat, rtos, Service Mesh,
skupper, Skupper, sobre, tcpip, tecnologia, vim
```

Novas categorias podem ser adicionadas, mas o agente deve sinalizar para confirmacao do usuario.

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

Nome do arquivo deve seguir `YYYY-MM-DD-slug.md`. A data no nome deve ser consistente com o campo `date:` do frontmatter.

### 3. Referencia de Imagem

O caminho em `image.path` deve corresponder a um arquivo existente em `assets/img/headers/`.

### 4. Acentuacao Portuguesa

Nenhuma palavra portuguesa comum deve aparecer sem acento no conteudo:

```bash
grep -inE '\b(codigo|voce|nao|tambem|alem|ate|pagina|unico|possivel|necessario|basico|metodo|titulo|topico|analise|numero|conteudo|seguranca|producao|informacao|aplicacao|integracao|solucao|funcao|execucao|configuracao|operacao|referencia|experiencia)\b' _posts/ARQUIVO.md
```

Se encontrar ocorrencias, reportar como ERROR.

### 5. Categorias e Tags

Comparar categorias e tags propostas contra os registros aprovados. Sinalizar valores novos para confirmacao.

## Encadeamento de Subagentes

Os agentes suportam encadeamento via Agent tool:
- O Writer pode invocar o Reviewer como subagente apos criar um post.
- O Reviewer pode ser invocado standalone ou como parte de um chain.
- Cada skill verifica se foi invocado standalone ou como parte de um pipeline (via argumentos).

Exemplo de chain: `/write-post kubernetes observability` -> Writer cria post -> spawna Reviewer -> Reviewer reporta findings inline.
