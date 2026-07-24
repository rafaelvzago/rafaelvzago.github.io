# Skill: review-post

Revisa um post do blog verificando qualidade, formatacao, SEO e consistencia. Operacao somente leitura — nunca modifica arquivos. Cobre **pt-BR e en**.

## Workflow

### 1. Identificar Alvo e Locale

Aceitar um nome de arquivo/path como argumento. Se nenhum for fornecido, usar o post mais recentemente modificado em qualquer locale:

```bash
ls -t content/pt-br/posts/*.md content/en/posts/*.md 2>/dev/null | head -1
```

Determinar locale:

| Path contem | Locale |
|-------------|--------|
| `content/pt-br/` | pt-BR |
| `content/en/` | en |

Se o path for legado `content/posts/`, tratar como pt-BR e emitir WARNING pedindo migracao para `content/<lang>/posts/`.

### 2. Validacao de Frontmatter

Ler o frontmatter do post e verificar:

- [ ] `title` presente e com menos de 60 caracteres
- [ ] `description` presente e com 150-160 caracteres (no idioma do post)
- [ ] `date` presente no formato `YYYY-MM-DD`
- [ ] `slug` presente (lowercase, hifens)
- [ ] `tags` presente em formato de array `[tag1, tag2]`
- [ ] `images` presente (array de paths `/assets/...`)

Para posts pre-2025 sem `description`: emitir WARNING, nao ERROR.

### 3. Validacao de Nome de Arquivo

- Nome segue formato `YYYY-MM-DD-slug.md`
- Data no nome eh consistente com `date:` no frontmatter
- Slug eh lowercase, sem acentos, sem caracteres especiais
- Path em `content/pt-br/posts/` ou `content/en/posts/`

### 4. Validacao de Imagem

```bash
ls static/assets/img/headers/IMAGEM 2>/dev/null
```

Verificar que os arquivos referenciados em `images` existem sob `static/`.

### 5. Qualidade de idioma (obrigatorio por locale)

#### 5a. Posts pt-BR — acentuacao

```bash
grep -inE '\b(codigo|voce|nao|tambem|alem|ate|pagina|unico|possivel|necessario|basico|metodo|titulo|topico|analise|numero|conteudo|seguranca|producao|informacao|aplicacao|integracao|solucao|funcao|execucao|configuracao|operacao|referencia|experiencia)\b' CONTENT_PATH
```

Cada ocorrencia eh um ERROR.

Revisao manual adicional: concordancia, crase onde obrigatoria, e mistura nao intencional de prosa em ingles (termos tecnicos OK).

#### 5b. Posts en — gramatica e typos

```bash
grep -inE '\b(teh|recieve|seperate|occured|definately|accomodate|untill|wich|becuase|alot|could of|should of|would of)\b' CONTENT_PATH
```

Cada hit fora de code fence eh ERROR.

Revisao manual obrigatoria (ERROR se claro; WARNING se duvidoso):

- [ ] Concordancia verbal / numero (subject-verb)
- [ ] Artigos (`a`/`an`/`the`) onde o ingles exige
- [ ] Tempo verbal consistente na narrativa
- [ ] Calques do portugues: "the same of", "depends of", "in the next", "resume" (quando quis dizer "summary"), "actual" (quando quis dizer "current")
- [ ] Prosa portuguesa vazando no corpo EN (exceto citacoes / nomes proprios)

#### 5c. Irmao de traducao

Se existir o mesmo filename relativo no outro `contentDir`, registrar INFO com o path do irmao. Se o escopo for bilingue e o irmao faltar, WARNING.

### 6. Verificacao de Estrutura

- [ ] Conteudo usa `##` como heading de nivel mais alto (nao `#`)
- [ ] Existe introducao antes da primeira secao
- [ ] Existe conclusao ou resumo no final
- [ ] Minimo de 3 secoes com `##`
- [ ] Code blocks possuem language tags

### 7. Validacao de Links

```bash
grep -oE '\[([^\]]+)\]\(([^)]+)\)' CONTENT_PATH
```

- Links internos: posts PT em `/posts/<slug>/`; posts EN em `/en/posts/<slug>/` (ou `relLangURL`-friendly paths)
- Verificar que o slug referenciado existe no `contentDir` do idioma do link
- Links externos: formato valido (`http`/`https`)

### 8. Verificacao SEO

- [ ] Titulo tem menos de 60 caracteres
- [ ] Description tem 150-160 caracteres **no idioma do post**
- [ ] Palavras-chave das tags aparecem no primeiro paragrafo
- [ ] Post tem pelo menos 150 linhas

### 9. Validacao de Categorias e Tags

Comparar tags contra os registros aprovados em AGENTS.md. Sinalizar valores nao registrados.

### 10. Gerar Relatorio

Incluir no topo: **Locale:** pt-BR | en e o path completo.

**ERROS** (devem ser corrigidos):
- Frontmatter incompleto
- Imagem nao encontrada
- Falhas de acentuacao (pt-BR) ou typos/gramatica clara (en)
- Heading `#` no lugar de `##`

**AVISOS** (devem ser considerados):
- Description ausente em post pre-2025
- Post com menos de 150 linhas
- Tags fora do registro
- Prosa misturada sem necessidade (alem de termos tecnicos)
- Irmao de traducao ausente

**SUGESTOES** (nice to have):
- Adicionar mais links internos (no locale correto)
- Expandir conclusao
- Adicionar code blocks com language tags
- Melhorar description para SEO
- Passar `/humanizer` de novo se o tom estiver artificial

## Regras

- **NUNCA** modificar o post revisado
- Reportar findings em portugues (mesmo ao revisar post EN)
- Incluir sugestoes acionaveis para cada finding
- Se invocado como subagente (chained), retornar o relatorio de forma concisa
- Sempre declarar qual locale foi validado
