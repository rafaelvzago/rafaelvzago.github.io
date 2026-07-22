---
title: "OpenShift Service Mesh 3.0"
date: 2025-07-07
categories: [OpenShift, Service Mesh, Istio]
tags: [openshift, service-mesh, Istio, kiali, ambient-mode, devops, security, observability, redhat, migration]
image:
  path: /assets/img/headers/openshift-service-mesh-3.png
  alt: OpenShift Service Mesh 3 Overview
---

## Overview

O [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 (OSSM3) substitui o Maistra pelo Istio upstream como núcleo da solução. O Maistra era um fork customizado do Istio mantido pela Red Hat; com o OSSM3, a base passa a ser o Istio direto do projeto da comunidade — sem patches específicos, sem rebase.

Entre as mudanças concretas: upgrades do control plane podem ser feitos in-place ou via revisão (canary), o Kiali precisa ser instalado separadamente via Kiali Operator, e o suporte a multi-cluster usa as topologias padrão do Istio upstream.

No âmbito do Istio, o controle passa a ser realizado em nível de cluster, proporcionando visibilidade global. Mudanças importantes incluem a remoção do gerenciamento de gateways pelo operador (agora feito via injeção por rota ou serviço), a descontinuação do Istio Operator Resource (IOR) e o fim do suporte à federação de meshes, exigindo contato direto com a Red Hat para necessidades específicas.

Por fim, o OSSM3 traz o modo Istio Ambient Mode, com destaque para Zero Trust Tunnels (ztunnel), Waypoints (Envoy) para recursos avançados de camada 7 e a operação sidecarless, que reduz o consumo de recursos e simplifica a arquitetura.

---

## Comparação entre OpenShift Service Mesh 2 e 3

| [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2 | [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 |
| :--- | :--- |
| Istioctl não é suportado | Istioctl suportado - utilitários de diagnóstico |
| Gateways e Rotas criados automaticamente | Gateways e rotas criados pelos usuários |
| Componentes de observabilidade gerenciados pelo operador do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) | Componentes de observabilidade gerenciados independentemente |
| Políticas de Rede do Kubernetes isolam uma [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) por padrão | Políticas de rede do Kubernetes não são criadas, podem ser definidas pelos usuários |
| Múltiplos planos de controle por padrão | Cluster-wide (abrangendo todo o cluster) por padrão |
| Federação para múltiplos clusters | Topologias multi-cluster do Istio + federação (em breve) |

## Funcionalidades e Benefícios

![OpenShift Service Mesh Features](assets/openshift-service-mesh-3-features.png)

### Foco em Segurança

O mTLS é habilitado por padrão entre os serviços no mesh. Políticas de autorização permitem definir quem pode falar com quem usando seletores de namespace, service account ou labels de workload.

### Gerenciamento de Tráfego

VirtualServices e DestinationRules do Istio controlam balanceamento, retries, timeouts e injeção de falhas. A API de Gateway do Kubernetes também está suportada no OSSM3 no OCP 4.19+.

### Topologias Multicluster

O OSSM3 suporta os modelos multi-primary, primary-remote e external control plane do Istio upstream. Isso permite distribuir o mesh entre clusters em zonas ou regiões diferentes.

### Telemetria

O OpenShift Console exibe métricas do Istio via Console Plugin. Para rastreamento distribuído, a Red Hat recomenda migrar para OpenTelemetry + Tempo.

### Aplicação de Políticas

AuthorizationPolicies controlam o tráfego com base em source, destination e atributos do request. PeerAuthentication define o modo mTLS por namespace ou workload.

### Observabilidade

O Console Plugin do OpenShift Service Mesh mostra a saúde dos componentes, traces e logs. O Kiali, instalado separadamente, adiciona visualização de topologia e validação de configuração do Istio.

## Principais Mudanças e Recursos

### Istio substitui o Maistra

A principal mudança do OSSM 3 em relação à versão 2.x é a adoção do Istio upstream como núcleo da solução, substituindo o Maistra (que era uma distribuição customizada do Istio). Na prática, isso significa que o OSSM3 usa os CRDs, operadores e comportamentos padrão do projeto Istio — sem patches específicos do Maistra. Recursos e correções do upstream chegam sem necessidade de rebase, e a documentação da comunidade Istio se aplica diretamente ao OSSM3.

### Estratégias de Upgrade

O OSSM3 oferece duas estratégias de atualização do control plane do Istio, configuradas pelo campo `upgradeStrategy`:

- **InPlace**: Atualiza o control plane existente no cluster. Após a atualização, é necessário reiniciar os workloads para que passem a utilizar a nova versão do Istio. Essa abordagem é mais simples, porém envolve uma breve indisponibilidade durante o processo de reinício dos pods.
- **RevisionBased (Canary)**: Cria um novo control plane Istio ao lado do existente, permitindo uma migração gradual dos workloads da versão antiga para a nova. Essa estratégia reduz riscos, pois possibilita validar a nova versão com parte dos workloads antes de migrar todo o ambiente, garantindo maior controle e segurança durante o upgrade.

#### Exemplo de CR Istio para OSSM3

```yaml
apiVersion: sailoperator.io/v1
kind: Istio
metadata:
  name: default
spec:
  version: v1.24.3
  namespace: Istio-system
  updateStrategy:
    type: InPlace
  values:
    pilot:
      resources:
        requests:
          cpu: 100m
          memory: 1024Mi
```

### Observabilidade com Kiali Console

O OSSM3 oferece suporte ao **Kiali Console** através de operador separado para observabilidade. É importante notar que o Kiali não é uma novidade exclusiva da v3, pois também era suportado na v2. De fato, na v2 o Kiali era instalado por padrão, enquanto na v3 precisa ser instalado separadamente. Essa mudança reflete a ideia de que o OSSM 3 pode ser integrado com uma ampla gama de soluções; o operador sail gerencia apenas o Istio.

O Kiali exibe a topologia do mesh como grafo de serviços, com métricas de latência e taxa de erro por aresta. Ele valida configurações do Istio — VirtualServices mal formados, conflitos de PeerAuthentication, referências a hosts inexistentes — e mostra traces distribuídos quando integrado ao Jaeger ou Tempo.

### Request Authentication usando JWT

O OSSM3 oferece suporte robusto para autenticação de requests baseada em JSON Web Tokens (JWT), permitindo validação segura de identidades em comunicações entre serviços. Esta funcionalidade é essencial para implementar arquiteturas zero trust e garantir que apenas requests autenticados acessem recursos protegidos.

#### Recursos Principais

A `RequestAuthentication` do OSSM3 valida JWTs usando JWKS URI — as chaves públicas são buscadas automaticamente. É possível configurar múltiplos issuers simultaneamente, extrair claims específicos para uso em `AuthorizationPolicy`, validar o campo `aud` do token e propagar o token original para serviços de destino.

### Operators

#### OSSM3 Operator

O operador do [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 foi redesenhado com um escopo mais focado e especializado. Diferentemente das versões anteriores, o operador OSSM3 instala e gerencia exclusivamente o Istio, simplificando sua responsabilidade e melhorando a eficiência operacional.

#### Kiali Operator para Observabilidade

Para observabilidade, o OSSM3 usa o **Kiali Operator** como componente separado. O ponto central é simples: o Sail Operator gerencia o Istio, e o Kiali Operator gerencia o Kiali — cada um atualiza no próprio ciclo de release. Se uma nova versão do Kiali corrige um bug de visualização, você atualiza o Kiali Operator sem tocar no control plane do Istio.

### Gateways no OpenShift Service Mesh 3

Um gateway é usado para gerenciar o tráfego que entra e sai do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh).

Ele consiste em um proxy Envoy independente que é gerenciado pelo plano de controle do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh). Pode ser configurado usando um recurso Istio Gateway como:
- Um gateway de entrada (*ingress*) - um ponto de entrada para o mesh.
- Um gateway de saída (*egress*) - um ponto de saída do mesh.

A partir do [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2.6, também foi possível configurar gateways usando a API de Gateway do Kubernetes. Embora tecnicamente verdadeiro, em retrospectiva, a implementação era bastante imatura. Recomendamos fortemente que usuários interessados na API Gateway façam uso do OSSM v3 no OCP 4.19 ou superior, onde os CRDs são adequadamente gerenciados e suportados na plataforma OpenShift subjacente.

No [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3, os gateways não são mais gerenciados pelo operador. Isso proporciona maior simplicidade, flexibilidade e incentiva a prática recomendada de gateways gerenciados juntamente com as aplicações.

Os gateways podem ser criados com:
- Injeção de Gateway usando um `Deployment` do Kubernetes e expostos via:
  - Um recurso `Route` do OpenShift.
  - Um `Service` do Kubernetes do tipo `LoadBalancer`.
- Recursos da API de Gateway do Kubernetes.

## Escalabilidade & Multi-Tenancy no OpenShift Service Mesh

Antes de implementer o [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) em múltiplos clusters, é importante considerar a motivação.

As motivações podem incluir:
- Alta disponibilidade de serviços entre clusters, regiões, zonas, etc.
- Gerenciar políticas do Istio em múltiplos clusters a partir de um único plano de controle.
- Escalar políticas do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) em uma grande organização composta por múltiplas equipes.
- Gerenciar o compartilhamento de serviços entre clusters sem expô-los publicamente.

### Modelos de Multi-Cluster

| Modelo                  | Descrição                                                                                                                      | Características                                                                                               |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Multi-Primary** | Cada cluster possui um plano de controle Istio que gerencia tanto os serviços locais quanto os remotos.                          | Maior disponibilidade.<br>Mais configuração entre clusters e sincronização de estado.                         |
| **Primary-Remote** | Um único plano de controle gerencia toda a configuração, incluindo aquelas em clusters remotos.                                  | Sem redundância.<br>Menos configuração entre clusters e sincronização de estado necessária.                    |
| **External Control Plane** | Para maior isolamento, o plano de controle pode ser implantado em um cluster completamente independente dos clusters do plano de dados. | Isola os componentes de gerenciamento dos componentes do plano de dados.<br>Suporta um modelo de cluster *hub*. |

## Migrando para o Red Hat OpenShift Service Mesh 3

![Migration](assets/openshift-service-mesh-3-migration.png)

Existem várias coisas que os clientes podem fazer HOJE para se prepararem para a atualização para o [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3:

- Atualizar para a versão mais recente disponível do [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2.6
- Mover para a Injeção de Gateway (Gateway Injection) para criar e gerenciar todos os Gateways
- Desabilitar o IoR (Istio on Routes) e gerenciar explicitamente os Gateways com recursos de Rotas (Routes)
- Usar o monitoramento de projetos definido pelo usuário do OpenShift para métricas
- Migrar para OpenTelemetry e Tempo para rastreamento distribuído (*distributed tracing*)
- Configurar um recurso Kiali externo para gerenciar o Kiali
- Desabilitar o gerenciamento de políticas de rede (*network policy*) do [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2.6
- Procedimentos detalhados para todos os itens acima fazem parte do guia de migração.

### Migrando cargas de trabalho (workloads) para o OpenShift Service Mesh 3

Os procedimentos de migração documentados visam mover as cargas de trabalho para o Red Hat [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3, mantendo a conectividade da aplicação.

- Os planos de controle do [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2 e 3 são implantados em paralelo no mesmo *namespace* (por exemplo, `Istio-system`).
- Os rótulos (*labels*) das cargas de trabalho são então configurados para migrar para o plano de controle do [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 durante o próximo *rollout*.

## Istio Ambient Mode (Developer Preview) "Sidecar-less" [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh)

Uma das maiores desvantagens dos service meshes tradicionais tem sido a exigência de que cada pod de aplicação tenha um proxy *sidecar*.

![openshift-service-mesh-sidecars](assets/openshift-service-mesh-sidecars.png)

### Benefícios e Desafios dos proxies sidecar Envoy

| Benefícios | Desafios |
| :--- | :--- |
| Altamente customizável através das APIs do Istio, permitindo uma [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) rica em funcionalidades. | Com a flexibilidade do Envoy, vem a complexidade! |
| Um modelo de implantação simples - um pod por proxy. | Requer a modificação dos pods da aplicação para injetar os proxies. |
| Uso de recursos eficiente quando gerenciado cuidadosamente. | Um proxy por pod significa muitos proxies! |
| Adição de latência tolerável para a maioria das aplicações voltadas para o usuário. | Sem um gerenciamento cuidadoso, o uso de recursos pode sair do controle! |
| | Impactos de performance para aplicações de baixa latência e alta vazão podem ser inaceitáveis. |
| | Pode ser "pesado demais" se apenas algumas funcionalidades do mesh forem necessárias. |

### Componentes do modo Ambient do Istio

![Istio Ambient Mode](assets/openshift-service-mesh-ambient-mode.png)

- **Istio-cni**: É um *daemonset* que configura o redirecionamento do tráfego do pod com o ztunnel.
- **Ztunnel**: É um proxy por nó (*per node*) para lidar eficientemente com funcionalidades da Camada 4 (L4).
  - Um proxy leve, de alta performance, "escrito em Rust", e específico para o Istio.
  - Habilita funcionalidades do mesh como criptografia mTLS, políticas de L4 e telemetria.
- **(Opcional) Waypoint**: É um proxy escalável de forma independente para funcionalidades da Camada 7 (L7).
  - Habilita funcionalidades como políticas HTTP, telemetria e gerenciamento de tráfego.
  - Um proxy Envoy, similar a um gateway.
  - Implantado por *namespace* por padrão (modificado com *labels*).

### Escopo dos Proxies ZTunnel vs. Waypoint

Os **ZTunnels** operam em um escopo por nó (*per node*). Isso significa que uma única instância do proxy ZTunnel é executada como um `DaemonSet` em cada nó de trabalho do cluster. Esse design é altamente eficiente, pois uma única instância leve pode gerenciar todo o tráfego da Camada 4 (L4) — como criptografia mTLS, autenticação e políticas de autorização básicas — para todos os pods agendados naquele nó específico. Ao centralizar a funcionalidade L4 no nível do nó, o modelo Ambient Mode reduz significativamente o consumo de recursos e a complexidade de gerenciamento em comparação com o modelo tradicional de um proxy *sidecar* para cada pod.

Em contraste, os proxies **Waypoint** são, por padrão, implantados em um escopo por *namespace* ou, mais especificamente, por conta de serviço (*service account*). Quando funcionalidades avançadas da Camada 7 (L7), como balanceamento de carga, gerenciamento de tráfego complexo e políticas baseadas em HTTP, são necessárias para um serviço, um Waypoint proxy dedicado é implantado para aquele *namespace*. Esse proxy Envoy, que é mais robusto, intercepta o tráfego relevante e aplica as políticas L7 necessárias. Este modelo permite que as equipes ativem seletivamente as funcionalidades L7 apenas para as cargas de trabalho que precisam delas, isolando o consumo de recursos e a complexidade de configuração ao *namespace* correspondente, em vez de sobrecarregar todo o mesh.

### Túneis “Zero Trust“ (Ztunnels)

- Os proxies **“ztunnel”** rodam como um `DaemonSet` no nível do nó.
- Para pods que estão "no mesh" (*in mesh*), todo o tráfego (mesmo o tráfego local no nó) atravessa o proxy ztunnel local para que ele possa aplicar políticas e reportar telemetria.
- O diagrama comum do modo Ambient é uma simplificação do funcionamento do Ztunnel:
  - A interceptação de tráfego ocorre dentro do *namespace* de rede do pod (e não no *host*).
  - Isso garante que o tráfego não criptografado nunca saia do isolamento de rede do pod - exatamente como um *sidecar*!
  - Até mesmo o tráfego local do nó será processado pelo ZTunnel.

---

## Conclusao

A mudança mais relevante do OSSM3 é a base no Istio upstream — sem fork, sem patches específicos do Maistra. Isso reduz o delta entre o que a documentação da comunidade diz e o que o cluster faz de verdade. A migração exige trabalho: os planos de controle v2 e v3 rodam em paralelo durante a transição, e gateways precisam ser recriados via injeção manual. O Ambient Mode ainda está em Developer Preview — quem precisa de suporte de produção fica com o modelo de sidecars por enquanto.

---

## Referencias

- **[OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh)**
- **[Istio](https://Istio.io/)**
- **[Kiali](https://kiali.io/)**
- **[Argo Rollouts](https://github.com/gitops-examples/rollouts-demo-osm)**
- **[Envoy Proxy](https://www.envoyproxy.io/)**
- **[Kubernetes](https://kubernetes.io/)**
- **[OpenTelemetry](https://opentelemetry.io/)**
- **[Grafana Tempo](https://grafana.com/docs/tempo/latest/)**
- **[JSON Web Tokens (JWT)](https://jwt.io/)**
- **[Rust](https://www.rust-lang.org/)**

