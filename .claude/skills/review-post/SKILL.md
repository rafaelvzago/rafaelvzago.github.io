# Skill: review-post

Revisa um post do blog verificando qualidade, formatacao, SEO e consistencia. Operacao somente leitura — nunca modifica arquivos.

## Workflow

### 1. Identificar Alvo

Aceitar um nome de arquivo como argumento. Se nenhum for fornecido, usar o post mais recentemente modificado:

```bash
ls -t _posts/*.md | head -1
```

### 2. Validacao de Frontmatter

Ler o frontmatter do post e verificar:

- [ ] `layout: post` presente
- [ ] `title` presente e com menos de 60 caracteres
- [ ] `description` presente e com 150-160 caracteres
- [ ] `date` presente no formato `YYYY-MM-DD`
- [ ] `categories` presente em formato de array `[Cat1, Cat2]`
- [ ] `tags` presente em formato de array `[tag1, tag2]`
- [ ] `image.path` presente
- [ ] `image.alt` presente

Para posts pre-2025 sem `description`: emitir WARNING, nao ERROR.

### 3. Validacao de Nome de Arquivo

- Nome segue formato `YYYY-MM-DD-slug.md`
- Data no nome eh consistente com `date:` no frontmatter
- Slug eh lowercase, sem acentos, sem caracteres especiais

### 4. Validacao de Imagem

```bash
ls assets/img/headers/IMAGEM 2>/dev/null
```

Verificar que o arquivo referenciado em `image.path` existe.

### 5. Acentuacao Portuguesa

```bash
grep -inE '\b(codigo|voce|nao|tambem|alem|ate|pagina|unico|possivel|necessario|basico|metodo|titulo|topico|analise|numero|conteudo|seguranca|producao|informacao|aplicacao|integracao|solucao|funcao|execucao|configuracao|operacao|referencia|experiencia)\b' _posts/ARQUIVO.md
```

Cada ocorrencia eh um ERROR.

### 6. Verificacao de Estrutura

- [ ] Conteudo usa `##` como heading de nivel mais alto (nao `#`)
- [ ] Existe introducao antes da primeira secao
- [ ] Existe conclusao ou resumo no final
- [ ] Minimo de 3 secoes com `##`
- [ ] Code blocks possuem language tags

### 7. Validacao de Links

Extrair todos os links markdown do post:

```bash
grep -oE '\[([^\]]+)\]\(([^)]+)\)' _posts/ARQUIVO.md
```

- Links internos (`/posts/...`): verificar se o post referenciado existe em `_posts/`
- Links externos: verificar formato valido (comeca com http/https)

### 8. Verificacao SEO

- [ ] Titulo tem menos de 60 caracteres
- [ ] Description tem 150-160 caracteres
- [ ] Palavras-chave das tags aparecem no primeiro paragrafo
- [ ] Post tem pelo menos 150 linhas

### 9. Validacao de Categorias e Tags

Comparar categorias e tags contra os registros aprovados em AGENTS.md. Sinalizar valores nao registrados.

### 10. Gerar Relatorio

Categorizar todos os findings:

**ERROS** (devem ser corrigidos):
- Frontmatter incompleto
- Imagem nao encontrada
- Palavras sem acentuacao
- Heading `#` no lugar de `##`

**AVISOS** (devem ser considerados):
- Description ausente em post pre-2025
- Post com menos de 150 linhas
- Tags ou categorias fora do registro
- Idioma misto (portugues e ingles no mesmo post)

**SUGESTOES** (nice to have):
- Adicionar mais links internos
- Expandir conclusao
- Adicionar code blocks com language tags
- Melhorar description para SEO

## Regras

- **NUNCA** modificar o post revisado
- Reportar findings em portugues
- Incluir sugestoes acionaveis para cada finding
- Se invocado como subagente (chained), retornar o relatorio de forma concisa
