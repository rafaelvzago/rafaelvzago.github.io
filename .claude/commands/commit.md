Crie um commit convencional usando o skill `commit`.

Siga o workflow completo definido em `.claude/skills/commit/SKILL.md`:
1. Inspecione a arvore de trabalho (git status, git diff)
2. Filtre arquivos protegidos (_config.yml, LICENSE, Gemfile, Gemfile.lock)
3. Execute checagens obrigatorias de AGENTS.md para arquivos em _posts/
4. Categorize mudancas por tipo e escopo
5. Redija mensagem de commit convencional
6. Adicione arquivos individualmente (nunca git add . ou git add -A)
7. Crie o commit com Co-Authored-By
8. Verifique pos-commit

**IMPORTANTE**: Nunca execute git push. Se checagens falharem, reporte e pare.
