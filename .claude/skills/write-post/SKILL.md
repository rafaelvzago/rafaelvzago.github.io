# Skill: write-post

Cria um novo post para o blog seguindo os padroes estabelecidos no repositorio.

## Workflow

### 1. Calibracao de Estilo

Leia os 3 posts mais recentes em `_posts/` para calibrar tom, estrutura e nivel de profundidade tecnica:

```bash
ls -t _posts/*.md | head -3
```

Leia o frontmatter e as primeiras 50 linhas de cada um.

### 2. Definir Metadados

Com base no topico fornecido pelo usuario (ou derivado do prompt):

- Propor **titulo** em portugues (max 60 caracteres para SEO)
- Gerar **slug** a partir do titulo: lowercase, sem acentos, hifens no lugar de espacos
- Propor **categorias** comparando com o registro em AGENTS.md
- Propor **tags** comparando com o registro em AGENTS.md
- Gerar **description** para SEO (150-160 caracteres)
- Sugerir nome para imagem de header: `assets/img/headers/{slug}.png`

Se categorias ou tags novas forem propostas, sinalizar para o usuario confirmar.

### 3. Gerar Frontmatter

Usar o formato canonico definido em AGENTS.md:

```yaml
---
layout: post
title: "Titulo"
description: "Descricao SEO 150-160 chars"
date: YYYY-MM-DD
categories: [Cat1, Cat2]
tags: [tag1, tag2, tag3]
image:
  path: /assets/img/headers/slug.png
  alt: Descricao da imagem
---
```

A data deve ser a data atual (hoje).

### 4. Escrever Conteudo

Regras de conteudo:
- Escrever em **portugues (pt-BR)** com acentuacao correta
- Se o topico foi fornecido em ingles, traduzir para portugues
- Usar `##` como heading de nivel mais alto (nunca `#`)
- Estrutura: introducao, secoes com `##`, sub-secoes com `###`, conclusao
- Negrito para termos tecnicos na primeira mencao
- Code blocks com language tags (```bash, ```yaml, ```python, etc.)
- Incluir links externos relevantes com URLs completas
- Minimo 150 linhas de conteudo substantivo
- Referenciar posts existentes sobre topicos relacionados quando relevante

### 5. Criar Arquivo

Escrever o arquivo em `_posts/YYYY-MM-DD-slug.md`.

### 6. Validacao

Executar as checagens obrigatorias:

```bash
# Verificar frontmatter
head -15 _posts/YYYY-MM-DD-slug.md

# Verificar acentuacao
grep -inE '\b(codigo|voce|nao|tambem|alem|ate|pagina|unico|possivel|necessario|basico|metodo|titulo|topico|analise|numero|conteudo|seguranca|producao|informacao|aplicacao|integracao|solucao|funcao|execucao|configuracao|operacao|referencia|experiencia)\b' _posts/YYYY-MM-DD-slug.md

# Contar linhas
wc -l _posts/YYYY-MM-DD-slug.md
```

### 7. Reportar

Informar ao usuario:
- Arquivo criado com path completo
- Nome sugerido para imagem de header (o usuario precisa fornece-la)
- Categorias/tags novas que precisam de confirmacao
- Resultado das validacoes

### 8. Encadeamento (opcional)

Se invocado com `--review` ou se o usuario solicitar, spawnar o Reviewer como subagente:

```
Agent(subagent_type="general-purpose", prompt="Execute the review-post skill on _posts/YYYY-MM-DD-slug.md")
```

## Regras

- Conteudo em portugues por padrao; aceitar override explicito para ingles
- Nunca criar posts com datas futuras alem de 7 dias
- Se o topico estiver fora do foco do blog (cloud, DevOps, infra, automacao, AI/ML), avisar o usuario
- Se o usuario fornecer URL de video YouTube, usar `{% raw %}{% include embed/youtube.html id='VIDEO_ID' %}{% endraw %}`
