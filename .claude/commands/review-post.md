Revise um post do blog usando o skill `review-post`.

Siga o workflow completo definido em `.claude/skills/review-post/SKILL.md`:
1. Identifique o post alvo (argumento fornecido ou mais recente)
2. Valide frontmatter (todos os campos obrigatorios)
3. Valide nome de arquivo (formato YYYY-MM-DD-slug.md)
4. Verifique existencia da imagem de header
5. Cheque acentuacao portuguesa
6. Verifique estrutura (headings, introducao, conclusao)
7. Valide links internos e externos
8. Avalie SEO (titulo, description, keywords)
9. Compare categorias e tags com registros aprovados
10. Gere relatorio categorizado (ERROS, AVISOS, SUGESTOES)

**IMPORTANTE**: Nunca modifique o post. Apenas reporte findings.

Post alvo: $ARGUMENTS
