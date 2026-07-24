# Skill: write-post

Cria um novo post para o blog seguindo os padroes estabelecidos. Suporta **pt-BR** (padrao) e **en**.

## Workflow

### 1. Definir Locale

- Padrao: `pt-br` → `content/pt-br/posts/`
- Se o usuario pedir ingles / `en` / bilingual pair: escrever em `content/en/posts/`
- Para escopo bilingue, criar o par com o **mesmo filename** nos dois `contentDir`s (ou escrever um e sinalizar o irmao pendente)

### 2. Calibracao de Estilo

Leia os 3 posts mais recentes **do mesmo locale**:

```bash
ls -t content/pt-br/posts/*.md | head -3   # ou content/en/posts/
```

Leia o frontmatter e as primeiras 50 linhas de cada um.

### 3. Definir Metadados

- **titulo** no idioma do post (max 60 caracteres)
- **slug** a partir do titulo: lowercase, sem acentos, hifens (compartilhado entre locales quando for par)
- **tags** comparando com AGENTS.md
- **description** SEO 150-160 caracteres **no idioma do post**
- Header sugerido: `assets/img/headers/{slug}.png` (ou `.webp`/`.jpg` se o padrao do tema exigir)

Sinalizar tags novas para confirmacao.

### 4. Gerar Frontmatter

Formato canonico em AGENTS.md. Data = hoje (ou a pedida, ate +7 dias).

### 5. Escrever Conteudo

- **pt-BR:** portugues com acentuacao correta
- **en:** ingles natural; evitar calques do portugues
- Usar `##` como heading de nivel mais alto (nunca `#`)
- Estrutura: introducao, secoes `##`, sub-secoes `###`, conclusao
- Code blocks com language tags
- Links internos no locale correto (`/posts/...` ou `/en/posts/...`)
- Minimo 150 linhas de conteudo substantivo
- Rodar `/humanizer` no rascunho final

### 6. Criar Arquivo

```text
content/pt-br/posts/YYYY-MM-DD-slug.md
# ou
content/en/posts/YYYY-MM-DD-slug.md
```

### 7. Validacao (locale-aware)

```bash
head -15 CONTENT_PATH
wc -l CONTENT_PATH
```

**Se pt-BR:**

```bash
grep -inE '\b(codigo|voce|nao|tambem|alem|ate|pagina|unico|possivel|necessario|basico|metodo|titulo|topico|analise|numero|conteudo|seguranca|producao|informacao|aplicacao|integracao|solucao|funcao|execucao|configuracao|operacao|referencia|experiencia)\b' CONTENT_PATH
```

**Se en:**

```bash
grep -inE '\b(teh|recieve|seperate|occured|definately|accomodate|untill|wich|becuase|alot|could of|should of|would of)\b' CONTENT_PATH
```

Corrigir ERRORS antes de reportar como pronto. Revisar gramatica EN manualmente (artigos, concordancia, calques).

### 8. Reportar

- Path completo + locale
- Header image sugerida
- Tags novas
- Resultado das validacoes
- Se so um locale foi escrito: lembrar o irmao em falta

### 9. Encadeamento (opcional)

Com `--review` ou pedido do usuario, spawnar Reviewer no path criado (o Reviewer detecta o locale).

## Regras

- Locale explicito do usuario vence; padrao pt-BR
- Nunca criar posts com datas futuras alem de 7 dias
- Nunca usar `git add .`
- Nunca modificar `hugo.toml` sem pedido explicito
