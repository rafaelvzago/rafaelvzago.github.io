Revise um post do blog usando o skill `review-post`.

Siga o workflow completo definido em `.claude/skills/review-post/SKILL.md`:
1. Identifique o post alvo (argumento ou mais recente em `content/pt-br/posts/` ou `content/en/posts/`)
2. Determine o locale pelo path (`pt-br` ou `en`)
3. Valide frontmatter (campos obrigatorios; description no idioma do post)
4. Valide nome de arquivo (`YYYY-MM-DD-slug.md`)
5. Verifique existencia da imagem de header
6. Cheque qualidade de idioma do locale:
   - pt-BR: acentuacao (grep + revisao)
   - en: typos comuns (grep) + gramatica/artigos/calques (revisao)
7. Verifique estrutura (headings, introducao, conclusao)
8. Valide links (PT → `/posts/`, EN → `/en/posts/`)
9. Avalie SEO
10. Compare tags com registros aprovados
11. Se existir irmao no outro locale, mencione; se faltar no escopo bilingue, WARNING
12. Gere relatorio categorizado (ERROS, AVISOS, SUGESTOES) declarando o locale

**IMPORTANTE**: Nunca modifique o post. Apenas reporte findings.

Post alvo: $ARGUMENTS
