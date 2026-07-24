Crie um novo post para o blog usando o skill `write-post`.

Siga o workflow completo definido em `.claude/skills/write-post/SKILL.md`:
1. Defina o locale (`pt-br` padrao, ou `en` se o usuario pedir)
2. Calibre o estilo lendo os 3 posts mais recentes **do mesmo locale**
3. Defina metadados (titulo, slug, tags, description no idioma do post)
4. Gere o frontmatter canonico conforme AGENTS.md
5. Escreva o conteudo no idioma do locale (minimo 150 linhas) e passe `/humanizer`
6. Crie o arquivo em `content/<locale>/posts/YYYY-MM-DD-slug.md`
7. Execute validacoes de idioma:
   - pt-BR: acentuacao
   - en: typos + gramatica
8. Reporte o resultado; se o escopo for bilingue e so um lado foi escrito, sinalize o irmao

Se o usuario forneceu um topico, use-o. Caso contrario, pergunte sobre o que escrever.
Aceite flags implicitas: "in English", "en", "bilingual", "pt-BR".

Topico: $ARGUMENTS
