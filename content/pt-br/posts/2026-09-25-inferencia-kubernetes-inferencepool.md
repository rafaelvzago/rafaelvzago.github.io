---
title: "Como uma chamada de inferência chega a um pod no Kubernetes"
description: "No KCD São Paulo 2026, mostro como Istio, HTTPRoute, InferencePool e EPP escolhem um pod para inferência: dois perfis, um erro 404 e uma demo sem GPU."
date: 2026-09-25
slug: "inferencia-kubernetes-inferencepool"
tags: [ai, llm, kubernetes, networking, service-mesh]
toc: true
images:
  - "/assets/img/headers/openshift-service-mesh-3.png"
---

![Ícone do Istio conectado a uma rede de nós](/assets/img/headers/openshift-service-mesh-3.png)

Preparei uma demo de inferência para a palestra [Kubernetes Networking na era da Inteligência Artificial](https://kcd-sp-2026.kube.rip/), que apresento com Ricardo Katz no [KCD São Paulo 2026](https://community2.cncf.io/events/details/cncf-kcd-brasil-presents-kcd-sao-paulo-2026/). Minha parte acompanha uma requisição: ela entra por um Gateway Istio, encontra um `InferencePool` e chega a um dos pods que simulam o modelo.

Na demo, separo duas decisões: o Gateway escolhe a rota pelo cabeçalho HTTP; o Endpoint Picker (EPP) escolhe o pod dentro do pool. Se o cabeçalho não bater em nenhuma rota, a requisição termina no Gateway com 404.

## Um pedido, duas decisões

O cliente roda dentro do cluster Kind e envia `POST /v1/chat/completions`, no formato de API compatível com OpenAI. O corpo contém `model`, mas, nesta demo, ele não escolhe o pool. Quem faz isso é o cabeçalho `X-Demo-Pool`.

O caminho fica assim:

```text
cliente (pod no Kind)
  -> Istio Gateway
  -> HTTPRoute (path + X-Demo-Pool)
  -> InferencePool
  -> Endpoint Picker (EPP)
  -> pod llm-d-inference-sim
```

Há uma `HTTPRoute` para `fast` e outra para `quality`. O `backendRef` de cada rota aponta para seu `InferencePool`. Este é o trecho de [`fast-route`](https://github.com/rafaelvzago/kcd-ai-networking-demo/blob/main/k8s/model-routes.yaml):

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: fast-route
  namespace: ai-networking-demo
spec:
  parentRefs:
    - name: fast-inference-gateway
  rules:
    - matches:
        - path: {type: PathPrefix, value: /v1/chat/completions}
          headers:
            - name: x-demo-pool
              value: fast
      backendRefs:
        - group: inference.networking.k8s.io
          kind: InferencePool
          name: fast-router
```

Quando chega `X-Demo-Pool: fast`, o Gateway encontra essa rota e usa `fast-router`. O EPP associado ao pool escolhe um dos pods elegíveis. Para `quality`, a outra rota aponta para `quality-router` e seu EPP.

Não há Inference Payload Processor (IPP) instalado aqui. Nesta demo, as regras da `HTTPRoute` escolhem entre os pools; o Gateway não lê o campo `model` para fazer essa escolha.

O [diagrama interativo](https://kcd-sp-2026.kube.rip/diagrams/flow-inference-pool.html) permite avançar por cada etapa e abrir os detalhes dos recursos.

## Dois perfis para comparar o caminho

Os nomes `fast` e `quality` representam dois perfis de simulador. Eles compartilham o Gateway, mas usam rotas, pools e pods diferentes:

- `fast`: `fast-route` → `fast-router` → 3 pods `fast-simulator`; TTFT configurado: 100 ms.
- `quality`: `quality-route` → `quality-router` → 1 pod `quality-simulator`; TTFT configurado: 500 ms.

O `llm-d-inference-sim` roda em modo `echo`. Ele aceita o formato da chamada, devolve `usage` e expõe o pod que respondeu no cabeçalho `x-inference-pod`. Não existe um LLM real por trás desses nomes, então `quality` não é uma nota de qualidade de resposta. É só o nome do segundo perfil, com outro atraso configurado.

Uma chamada feita pelo cliente dentro do cluster tem esta forma:

```bash
kubectl --context kind-kcd-ai-networking-demo -n ai-networking-demo \
  exec deployment/fast-client -- \
  curl -sS -i \
    -H 'Content-Type: application/json' \
    -H 'X-Demo-Pool: fast' \
    -d '{"model":"fast","messages":[{"role":"user","content":"Olá KCD"}]}' \
    http://fast-inference-gateway-istio.ai-networking-demo.svc.cluster.local/v1/chat/completions
```

Na resposta, eu olho primeiro para `x-inference-pod`. Ele mostra se a chamada chegou a um `fast-simulator` ou a um `quality-simulator`. O corpo traz `usage`, como se espera de uma resposta nesse formato de API. O [fluxo do modelo rápido](https://kcd-sp-2026.kube.rip/diagrams/flow-fast.html) e o [fluxo do modelo de qualidade](https://kcd-sp-2026.kube.rip/diagrams/flow-quality.html) mostram os dois caminhos separadamente.

Na gravação, envio também 12 chamadas concorrentes para `fast`. Elas chegam às três réplicas, mas a contagem entre pods não é igual. O teste mostra seleção de endpoints; não promete round-robin nem uma distribuição uniforme em toda execução.

## O valor que não tem rota

Envio a mesma API com `X-Demo-Pool: invalid`. Nenhuma das duas `HTTPRoutes` aceita esse valor. O Istio Gateway devolve HTTP 404 antes de consultar qualquer `InferencePool` ou EPP, e a resposta não tem `x-inference-pod`.

Esse caso ajuda a localizar a falha. Se não houve rota, não faz sentido procurar um problema no modelo. O [diagrama do pool inválido](https://kcd-sp-2026.kube.rip/diagrams/flow-invalid.html) para no Gateway pelo mesmo motivo.

## O que o cronômetro mede

Configurei 100 ms de tempo até o primeiro token no simulador `fast` e 500 ms no `quality`. O roteiro usa `curl` com `time_starttransfer` para comparar as chamadas. Esse número mede o tempo até o primeiro byte visto pelo cliente, incluindo a passagem pela rede e pelo Gateway. É uma aproximação útil nesta demo, não uma medição isolada do TTFT do modelo.

As respostas gravadas mostram `usage`; a validação confere o pod que respondeu e se o primeiro byte de `fast` chegou antes do de `quality`. Ela não demonstra desempenho de GPU, throughput de um LLM, economia de tokens ou qualidade da resposta. O simulador deixa o roteamento visível sem depender de GPU ou de um provedor externo.

O cluster é preparado antes da gravação. As imagens e os charts ficam em cache para a instalação offline; durante o roteiro gravado, eu inspeciono os recursos e faço as chamadas. Quem quiser montar o ambiente encontra os pré-requisitos e os comandos no [README do projeto](https://github.com/rafaelvzago/kcd-ai-networking-demo#readme).

## Veja a demo

A [gravação da minha parte](https://kcd-sp-2026.kube.rip/inference-demo.html) pausa em cada etapa, de modo que dá para conferir os pods, as rotas e as respostas sem acelerar o terminal. O [código da demo](https://github.com/rafaelvzago/kcd-ai-networking-demo) está aberto, incluindo os manifests, os scripts de validação e os diagramas.
