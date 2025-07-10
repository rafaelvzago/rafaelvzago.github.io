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

O [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 (OSSM3) marca uma nova era na gestão de service meshes no ecossistema Red Hat, trazendo mudanças significativas e recursos avançados para ambientes corporativos. A principal novidade é a adoção do Istio como núcleo da solução, substituindo o Maistra e alinhando o OSSM3 com as tendências globais de [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh).

Entre os destaques, o OSSM3 oferece integração aprimorada com virtualização, suporte robusto a upgrades (tanto in-place quanto revisados), e uma experiência de gerenciamento mais rica com a inclusão do Kiali Console como operador padrão e um console dedicado para administração do mesh. A solução também amplia o suporte a ambientes multi-cluster, promovendo alta disponibilidade e resiliência.

No âmbito do Istio, o controle passa a ser realizado em nível de cluster, proporcionando visibilidade global. Mudanças importantes incluem a remoção do gerenciamento de gateways pelo operador (agora feito via injeção por rota ou serviço), a descontinuação do Istio Operator Resource (IOR) e o fim do suporte à federação de meshes, exigindo contato direto com a Red Hat para necessidades específicas.

Por fim, o OSSM3 traz o modo Istio Ambient Mode, com destaque para Zero Trust Tunnels (ztunnel), Waypoints (Envoy) para recursos avançados de camada 7 e a operação sidecarless, que reduz o consumo de recursos e simplifica a arquitetura.

Essas inovações posicionam o OSSM3 como uma solução moderna, escalável e alinhada às demandas de segurança, observabilidade e flexibilidade das organizações que utilizam o OpenShift.

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

Aproveite segurança abrangente no networking de aplicações com criptografia mTLS transparente e políticas granulares, facilitando a implementação de redes zero trust.

### Gerenciamento de Tráfego

Controle o fluxo de tráfego e chamadas de API entre serviços, tornando as comunicações mais confiáveis e a rede mais resiliente.

### Topologias Multicluster

Implemente um único [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) em múltiplos clusters OpenShift, garantindo alta disponibilidade entre clusters, zonas e regiões, com gestão unificada.

### Telemetria

Compreenda as dependências entre serviços e o fluxo de tráfego via OpenShift Console, permitindo rápida identificação de problemas.

### Aplicação de Políticas

Implemente políticas organizacionais nas interações entre serviços, garantindo o cumprimento de regras de acesso e distribuição justa de recursos.

### Observabilidade

Visualize, valide e solucione problemas do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) com o [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) Console Plugin. Monitore a saúde dos componentes e inspecione traces e logs em uma interface unificada.

## Principais Mudanças e Recursos

### Istio substitui o Maistra

A principal mudança do OSSM 3 em relação à versão 2.x é a adoção do Istio upstream como núcleo da solução, substituindo o Maistra (que era uma distribuição customizada do Istio). Essa transição alinha o [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) com o Istio padrão da comunidade, trazendo maior compatibilidade com o ecossistema Istio e acesso mais rápido a novos recursos e correções. Com o Istio upstream, o OSSM3 oferece uma base tecnológica mais alinhada com o projeto original, maior flexibilidade e suporte ampliado para integrações, além de simplificar operações e atualizações futuras.

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

O OSSM3 inclui o **Kiali Console** como operador padrão, oferecendo uma experiência de observabilidade nativa e integrada para service meshes. O Kiali proporciona:

- **Visualização da Topologia**: Interface gráfica intuitiva para mapear dependências entre serviços e compreender o fluxo de tráfego em tempo real.
- **Métricas Integradas**: Acesso direto às métricas do Istio com dashboards pré-configurados para monitoramento de performance e latência.
- **Gestão de Configurações**: Interface centralizada para validar e gerenciar políticas de tráfego, segurança e configurações do Istio.
- **Troubleshooting Avançado**: Ferramentas para identificar rapidamente problemas de conectividade, erros de configuração e gargalos de performance.
- **Console Dedicado**: Um console específico para administração do mesh, separado do OpenShift Console principal, permitindo foco exclusivo na gestão do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh).

A integração nativa do Kiali elimina a necessidade de configurações adicionais complexas, proporcionando observabilidade completa desde o primeiro momento de implantação do OSSM3.

### Request Authentication usando JWT

O OSSM3 oferece suporte robusto para autenticação de requests baseada em JSON Web Tokens (JWT), permitindo validação segura de identidades em comunicações entre serviços. Esta funcionalidade é essencial para implementar arquiteturas zero trust e garantir que apenas requests autenticados acessem recursos protegidos.

#### Recursos Principais

- **Múltiplos Issuers**: Suporte a diferentes provedores de JWT simultaneamente
- **Validação JWKS**: Recuperação automática de chaves públicas via JWKS URI
- **Claims Customizados**: Acesso a claims específicos para decisões de autorização
- **Audience Validation**: Verificação de audiência para garantir que tokens sejam destinados ao serviço correto
- **Token Forwarding**: Propagação segura de tokens JWT através do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh)

A implementação JWT no OSSM3 garante autenticação forte e flexível, integrando-se nativamente com provedores de identidade externos e oferecendo controle detalhado sobre pol��ticas de acesso.

### Operators

#### OSSM3 Operator

O operador do [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 foi redesenhado com um escopo mais focado e especializado. Diferentemente das versões anteriores, o operador OSSM3 instala e gerencia exclusivamente o Istio, simplificando sua responsabilidade e melhorando a eficiência operacional.

#### Kiali Operator para Observabilidade

Para funcionalidades de observabilidade, o OSSM3 utiliza o **Kiali Operator** como componente separado e dedicado. Esta separação de responsabilidades oferece:

- **Especialização**: Cada operador foca em sua área específica de expertise
- **Flexibilidade**: Permite atualizações independentes do Kiali sem afetar o núcleo do Istio
- **Modularidade**: Facilita a manutenção e troubleshooting de componentes específicos
- **Escalabilidade**: Possibilita configurações personalizadas de observabilidade conforme necessidades do ambiente

Esta arquitetura modular resulta em uma solução mais robusta, onde o operador OSSM3 mantém foco total no gerenciamento do Istio, enquanto o Kiali Operator oferece toda a stack de observabilidade necessária para monitoramento e análise do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh).

### Gateways no OpenShift Service Mesh 3

Um gateway é usado para gerenciar o tráfego que entra e sai do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh).

Ele consiste em um proxy Envoy independente que é gerenciado pelo plano de controle do [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh). Pode ser configurado usando um recurso Istio Gateway como:
- Um gateway de entrada (*ingress*) - um ponto de entrada para o mesh.
- Um gateway de saída (*egress*) - um ponto de saída do mesh.

A partir do [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2.6, também é possível configurar gateways usando a API de Gateway do Kubernetes.

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

O [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 representa um avanço significativo na forma como as organizações gerenciam, protegem e observam suas aplicações baseadas em microserviços no OpenShift. A transição para o Istio como núcleo não apenas alinha a solução com o padrão de mercado, mas também oferece uma base mais sólida, flexível e preparada para o futuro.

As melhorias na observabilidade com o Kiali, as estratégias de upgrade flexíveis e o gerenciamento simplificado de operadores e gateways capacitam as equipes de DevOps a operar com mais agilidade e segurança. A introdução do Istio Ambient Mode, mesmo em Developer Preview, sinaliza um futuro promissor com uma arquitetura "sidecar-less" que promete reduzir a sobrecarga de recursos e simplificar ainda mais a malha de serviços.

Em suma, o OSSM3 é uma atualização crucial que fortalece o ecossistema do OpenShift, fornecendo as ferramentas necessárias para construir e operar aplicações resilientes, seguras e escaláveis, ao mesmo tempo em que estabelece um caminho claro para a inovação contínua no gerenciamento de [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh).

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

