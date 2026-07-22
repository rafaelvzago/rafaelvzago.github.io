Crie um novo post para o blog usando o skill `write-post`.

Siga o workflow completo definido em `.claude/skills/write-post/SKILL.md`:
1. Calibre o estilo lendo os 3 posts mais recentes
2. Defina metadados (titulo, slug, categorias, tags, description)
3. Gere o frontmatter canonico conforme AGENTS.md
4. Escreva o conteudo em portugues (pt-BR) com minimo 150 linhas
5. Crie o arquivo em `_posts/YYYY-MM-DD-slug.md`
6. Execute validacoes (frontmatter, acentuacao, contagem de linhas)
7. Reporte o resultado e sugira proximos passos

Se o usuario forneceu um topico, use-o. Caso contrario, pergunte sobre o que escrever.

Topico: $ARGUMENTS
