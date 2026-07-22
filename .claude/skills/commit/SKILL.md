# Skill: commit

Cria commits convencionais com checagens obrigatorias pre-commit.

## Workflow

### 1. Inspecionar Arvore de Trabalho

```bash
git status
git diff --stat
git log --oneline -5
```

### 2. Filtrar Arquivos Protegidos

Se algum dos arquivos abaixo estiver modificado, **NAO** incluir no commit:
- `_config.yml`
- `LICENSE`
- `Gemfile`
- `Gemfile.lock`

Avisar o usuario se encontrar modificacoes nesses arquivos.

### 3. Executar Checagens Obrigatorias

Para cada arquivo `.md` em `_posts/` que sera commitado:

**Frontmatter:**
```bash
head -15 _posts/ARQUIVO.md
```
Verificar campos obrigatorios: `layout`, `title`, `date`, `categories`, `tags`, `image`.

**Nome de arquivo:**
Verificar formato `YYYY-MM-DD-slug.md`.

**Acentuacao:**
```bash
grep -inE '\b(codigo|voce|nao|tambem|alem|ate|pagina|unico|possivel|necessario|basico|metodo|titulo|topico|analise|numero|conteudo|seguranca|producao|informacao|aplicacao|integracao|solucao|funcao|execucao|configuracao|operacao|referencia|experiencia)\b' _posts/ARQUIVO.md
```

**Imagem:**
```bash
# extrair image path do frontmatter e verificar existencia
```

Se qualquer check falhar, reportar e **NAO** commitar.

### 4. Categorizar Mudancas

Determinar o tipo e escopo do commit:

**Tipos:**
- `feat` — novo post ou funcionalidade
- `fix` — correcoes em posts existentes
- `docs` — CLAUDE.md, AGENTS.md, README
- `style` — apenas formatacao
- `chore` — agents, skills, commands, settings
- `ci` — GitHub Actions workflows

**Escopos:**
- `posts` — arquivos em `_posts/`
- `assets` — imagens e media
- `config` — configuracoes
- `skills` — `.claude/skills/`
- `commands` — `.claude/commands/`
- `agents` — `.claude/agents/` e `AGENTS.md`
- `docs` — documentacao

### 5. Redigir Mensagem de Commit

Formato: `type(scope): descricao concisa`

Exemplos:
- `feat(posts): novo post sobre kubernetes observability`
- `fix(posts): corrigir acentuacao no post sobre TCP/IP`
- `chore(agents): adicionar skill de review`

### 6. Staging

Adicionar arquivos individualmente:

```bash
git add _posts/YYYY-MM-DD-slug.md
git add assets/img/headers/imagem.png
```

**NUNCA** usar `git add .` ou `git add -A`.

### 7. Commit

```bash
git commit -m "$(cat <<'EOF'
type(scope): descricao

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 8. Verificacao Pos-Commit

```bash
git status
git log --oneline -1
```

## Regras

- **NUNCA** executar `git push`
- **NUNCA** usar `git add .` ou `git add -A`
- **NUNCA** fazer amend a menos que explicitamente solicitado
- Se checagens falharem, reportar erros e parar — nao commitar
- Sempre incluir `Co-Authored-By: Claude <noreply@anthropic.com>`
