# Skill: analyze-content

Analisa o inventario de conteudo do blog, identifica lacunas e sugere novos topicos. Operacao somente leitura.

## Workflow

### 1. Construir Inventario

Ler todos os posts em `content/pt-br/posts/` e `content/en/posts/` e extrair metadados:

```bash
for f in content/pt-br/posts/*.md content/en/posts/*.md; do echo "=== $f ==="; head -12 "$f"; echo; done
```

Para cada post, registrar: data, titulo, tags, idioma (pelo path: pt-BR ou en), e se existe irmao no outro locale.

### 2. Analise de Linha do Tempo

- Contar posts por ano e por mes
- Calcular frequencia media de publicacao
- Identificar os maiores gaps entre publicacoes
- Identificar meses sem publicacao

### 3. Analise de Categorias

- Contar posts por categoria
- Identificar categorias com apenas 1 post
- Identificar categorias/tags subrepresentadas vs a descricao do blog em `hugo.toml` (`params.description` por idioma)
- Listar tags que poderiam ser consolidadas (ex: `k8s` vs `kubernetes`)

### 4. Analise de Tags

- Contar posts por tag (por locale e agregado)
- Identificar tags orfas (usadas apenas 1 vez)
- Encontrar tags ausentes que deveriam existir baseado nas keywords do site:
  - Skupper, OpenShift, Containers, Kubernetes, Ansible, Terraform
  - AWS, Azure, GCP, CI/CD, Python, Go, GitOps
  - Helm, Istio, Serverless, Prometheus

### 5. Matriz de Cobertura

Cruzar keywords da descricao do blog (`hugo.toml`) com cobertura real nos posts:

| Keyword | Posts | Cobertura |
|---------|-------|-----------|
| Skupper | N     | Alta/Baixa|
| ...     | ...   | ...       |

Para cada keyword, contar quantos posts a cobrem direta ou indiretamente.

### 6. Identificacao de Lacunas

- Topicos mencionados no site mas com zero ou poucos posts
- Pares bilingues incompletos (existe em um locale e falta no outro)
- Posts que poderiam virar series (topicos com 1 post que merecem expansao)
- Conteudo desatualizado (posts com mais de 18 meses que podem precisar de atualizacao)
- Topicos emergentes no espaco cloud/DevOps/AI que o autor poderia cobrir

### 7. Sugestoes de Topicos

Sugerir pelo menos 5 topicos concretos com:
- Titulo proposto (pt-BR e, se fizer sentido, en)
- Locale sugerido ou par bilingue
- Tags sugeridas
- Justificativa (por que este topico e relevante)
- Prioridade (alta/media/baixa)

Priorizar topicos que combinam areas de expertise existentes:
- AI + Kubernetes
- Service Mesh + Security
- DevOps + MLOps
- Automacao + Cloud

### 8. Gerar Relatorio

Estrutura do relatorio em portugues:

```
## Inventario de Conteudo
[contagem total, idiomas, periodo coberto]

## Linha do Tempo de Publicacoes
[frequencia, gaps, tendencias]

## Analise de Categorias e Tags
[distribuicao, duplicatas, orfas]

## Matriz de Cobertura
[tabela keyword vs posts]

## Lacunas de Cobertura
[topicos ausentes, conteudo desatualizado, series potenciais]

## Sugestoes de Topicos
[5+ topicos com titulo, categorias, tags, justificativa]
```

## Regras

- **NUNCA** modificar qualquer arquivo
- Todo output em portugues
- Usar WebSearch se disponivel para identificar topicos trending em cloud/DevOps/AI
- Se invocado como subagente, retornar versao resumida do relatorio
