---
layout: post
title: "Controlando e progetendo modelos de IA com segurança usando Deepseek, Skupper e InstructLab e Istio - Terciero e Último Ato"
description: "Neste artigo, vamos implementar conectar o modelo de IA DeepSeek com o InstructLab no OpenShift usando Skupper para conectar de forma segura um modelo de IA privado com uma interface pública."
date: 2025-05-05
categories: [AI, OpenShift, instructlab]
tags: [ai, deepseek, skupper, instructlab, istio, service-mesh, openshift, final-implementation]
image:
  path: /assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt3.png
  alt: Instructlab with Skupper
---

## Veja a Solução em Ação

Neste artigo, vamos implementar passo a passo o chatbot InstructLab no OpenShift usando Skupper para conectar de forma segura um modelo de IA privado com uma interface pública. Esta é a continuação prática do padrão de solução apresentado no artigo anterior.

### Conceitos e Comandos Usados na Demonstração

> NOTA: Os comandos a seguir são utilizados para configurar o ambiente e implantar o chatbot InstructLab. Eles são extraídos do projeto InstructLab e adaptados para esta demonstração.
> **`curl -L https://istio.io/downloadIstio | sh -`**: Baixa e instala o istioctl CLI.
> 
> **`istioctl version`**: Verifica a versão instalada do istioctl.
> 
> **`istioctl install --set values.defaultRevision=default`**: Instala o Istio no cluster Kubernetes.
> 
> **`kubectl label namespace <namespace> istio-injection=enabled`**: Habilita injeção automática de sidecar Istio no namespace.
> 
> **`kubectl get pods -n istio-system`**: Verifica os pods do sistema Istio.
> 
> **`kubectl apply -f <manifest>`**: Aplica manifests YAML no cluster.
> 
> **`kubectl get service istio-ingressgateway -n istio-system`**: Obtém informações do serviço de ingress gateway.
> 
> **`kubectl patch service istio-ingressgateway -n istio-system -p '{"spec":{"type":"LoadBalancer"}}'`**: Configura o serviço como LoadBalancer.
> 
> **`oc new-project <project-name>`**: Cria um novo projeto no OpenShift.
> 
> **`oc project <project-name>`**: Muda para um projeto específico.
> 
> **`oc apply -f <manifest>`**: Aplica manifests YAML no cluster OpenShift.
> 
> **`oc wait --for condition=Ready -n istio-system smcp/basic --timeout=300s`**: Aguarda o Service Mesh Control Plane ficar pronto.
> 
> **`oc get smcp -n istio-system`**: Verifica o status do Service Mesh Control Plane.
> 
> **`oc get route <route-name> -n <namespace>`**: Obtém informações de uma rota do OpenShift.
> 
> 
> **`kubectl get gateway,virtualservice -n <namespace>`**: Verifica configurações do Istio Gateway e VirtualService.
> 
> **`oc get pods -n <namespace>`**: Verifica se os pods estão rodando com sidecar Istio injetado.
> 
> **`export ROUTE_URL=$(oc get route istio-gateway -n ilab-chat -o jsonpath='{.spec.host}')`**: Obtém a URL da rota para acesso externo.

### Executar a demonstração

#### Antes de começar

Para configurar a demonstração, você precisa ter os seguintes pré-requisitos:

- Acesso a um cluster OpenShift com o Skupper e o InstructLab instalados.

- Um servidor executando o modelo de chat do InstructLab.

- Acesso a um terminal para executar os comandos.

- Acesso a um navegador da web para interagir com o chatbot.

- Cliente oc instalado e configurado para acessar o cluster OpenShift.

- Cliente skupper instalado e configurado para acessar o cluster OpenShift.

- Podman instalado para executar o Skupper privado.

### Implantando o Chatbot InstructLab

Antes de executar o chatbot, vamos entender a parte final desta solução, o aplicativo Frontend. Este aplicativo será implantado em um cluster OpenShift e será responsável por enviar a entrada do usuário para o modelo de chat do InstructLab e exibir a resposta para o usuário. O aplicativo será implantado no mesmo namespace onde o Skupper público está em execução.

Apresentaremos duas abordagens para a implantação: uma usando Kubernetes com Istio instalado via istioctl CLI, e outra usando OpenShift com operadores para facilitar o gerenciamento.

## Abordagem 1: Kubernetes com Istio (istioctl CLI)

Esta abordagem utiliza o Istio instalado diretamente em um cluster Kubernetes público usando a ferramenta de linha de comando istioctl.

### Pré-requisitos

- Istio instalado no cluster
- Istio ingress gateway configurado

O diretório `manifests/` contém os recursos Kubernetes necessários:

- `deployment.yaml` - Deployment da aplicação com health checks
- `service.yaml` - Service ClusterIP para acesso interno  
- `gateway.yaml` - Istio Gateway para ingress (apenas Istio)
- `virtualservice.yaml` - Istio VirtualService para roteamento (apenas Istio)

### Deployment Padrão Kubernetes


## Instalação do Istio e componentes

Esta abordagem usa manifests YAML para instalar o Istio e seus componentes no Kubernetes.

1. **Instalar Istio**
   
   ```bash
   # Baixar e instalar istioctl
   curl -L https://istio.io/downloadIstio | sh -
   
   # Adicionar istioctl ao PATH
   export PATH=$PWD/istio-*/bin:$PATH
   
   # Instalar Istio no cluster
    istioctl install --set profile=demo -y
   ```

2. **Instalar Kiali**
   
   ```bash
   # Aplicar manifests do Kiali
   kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
   ```

3. **Instalar Jaeger**
   
   ```bash
   # Aplicar manifests do Jaeger
   kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml
   ```

4. **Instalar Grafana**
   
   ```bash
   # Aplicar manifests do Grafana
   kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
   ```

> NOTA:
>
> O comando `istioctl install --set profile=demo -y` instala o Istio com o perfil demo, que inclui os componentes de observabilidade como Kiali, Jaeger e Grafana. Esses componentes são úteis para monitorar e visualizar o tráfego na malha de serviços.
>
> O comando `kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml` aplica os manifests do Kiali, que é uma ferramenta de observabilidade para Istio. O Kiali fornece uma interface web para visualizar a topologia da malha de serviços, monitorar métricas e gerenciar configurações do Istio.
>
> O comando `kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml` aplica os manifests do Jaeger, que é uma ferramenta de rastreamento distribuído. O Jaeger permite visualizar o fluxo de requisições entre serviços na malha de serviços, ajudando a identificar gargalos e problemas de latência.
>
> O comando `kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml` aplica os manifests do Grafana, que é uma plataforma de visualização de métricas. O Grafana permite criar dashboards personalizados para monitorar o desempenho dos serviços na malha de serviços.

### Verificação da instalação

1. **Verificar se todos os componentes estão rodando**
   ```bash
   # Verificar pods do sistema Istio
   kubectl get pods -n istio-system
   
   # Verificar se o Istio está funcionando
   istioctl version
   ```

2. **Aguardar todos os componentes ficarem prontos**
   ```bash
   # Aguardar pods ficarem prontos
   kubectl wait --for=condition=Ready pods --all -n istio-system --timeout=300s
   ```

> NOTA:
>
> O comando `kubectl get pods -n istio-system` lista todos os pods no namespace `istio-system`, onde os componentes do Istio são executados. É importante verificar se todos os pods estão no estado `Running` ou `Completed`.
>
> O comando `istioctl version` exibe a versão do Istio instalada no cluster. Isso ajuda a garantir que você está usando a versão correta do Istio.


#### Clonando o repositório

Antes de começar a implantação, clone o repositório com os manifests necessários:

```bash
# Clonar o repositório ilab-client
git clone https://github.com/rafaelvzago/ilab-client.git
cd ilab-client
```

#### Implantando a aplicação

```bash
# Habilitar injeção Istio para o namespace
kubectl label namespace ilab-chat istio-injection=enabled

# Implantar aplicação
kubectl apply -f manifests/deployment.yaml -n ilab-chat
kubectl apply -f manifests/service.yaml -n ilab-chat

# Implantar recursos Istio (Gateway e VirtualService)
kubectl apply -f manifests/gateway.yaml -n ilab-chat
kubectl apply -f manifests/virtualservice.yaml -n ilab-chat

# Verificar deployment
kubectl get pods -n ilab-chat
kubectl get services -n ilab-chat
kubectl get gateway,virtualservice -n ilab-chat

# Anotar o pod do skupper-router para não injetar sidecar do Istio
kubectl annotate pod -n ilab-chat -l application=skupper-router sidecar.istio.io/inject=false

# Rollout restart para aplicar sidecar injection
kubectl rollout restart deployment ilab-client -n ilab-chat 
```

> NOTA:
>
> O comando `kubectl label namespace ilab-chat istio-injection=enabled` habilita a injeção automática de sidecar Istio no namespace `ilab-chat`. Isso permite que os pods nesse namespace sejam gerenciados pelo Istio.
>
> O comando `kubectl apply -f manifests/deployment.yaml -n ilab-chat` implanta o deployment da aplicação InstructLab no namespace `ilab-chat`. O deployment define como a aplicação será executada, incluindo o número de réplicas e as configurações do container.
>
> O comando `kubectl apply -f manifests/service.yaml -n ilab-chat` cria um serviço ClusterIP para a aplicação, permitindo que outros pods no cluster acessem a aplicação pelo nome do serviço.
>
> O comando `kubectl apply -f manifests/gateway.yaml -n ilab-chat` implanta o Istio Gateway, que define como o tráfego externo pode acessar a aplicação. O Gateway escuta na porta 80 e direciona o tráfego para o serviço da aplicação.
>
> O comando `kubectl apply -f manifests/virtualservice.yaml -n ilab-chat` cria um VirtualService que define as regras de roteamento para o tráfego que chega ao Gateway. Ele direciona o tráfego com o prefixo `/ilabchat` para o serviço da aplicação.
>
> O comando `kubectl annotate pod -n ilab-chat -l application=skupper-router sidecar.istio.io/inject=false` anota o pod do Skupper Router para não injetar o sidecar do Istio. Isso é necessário porque o Skupper já gerencia o tráfego e não precisa do sidecar do Istio.
>
> O comando `kubectl rollout restart deployment ilab-client -n ilab-chat` reinicia o deployment da aplicação InstructLab para aplicar as alterações de sidecar injection. Isso garante que o sidecar do Istio seja injetado corretamente nos pods da aplicação.


#### Verifficando a implantação

Para verificar se a aplicação foi implantada corretamente, vamos rodar um pod com o curl no namespace `ilab-chat` e fazer uma requisição para o serviço do InstructLab que vai ser roteado para o `connector` do Skupper que está rodando no site privado.

```bash
# Rodar um pod temporário com curl
kubectl run curl \
    --image=quay.io/skupper/lanyard \
    -n ilab-chat \
    --restart=Never \
    --rm \
    -i \
    --tty \
    --overrides='{"metadata":{"annotations":{"sidecar.istio.io/inject":"false"}}}' \
    -- \
    curl instructlab:8000
```

Saída esperada:
```
{"s{"message":"Hello from InstructLab! Visit us at https://instructlab.ai"}pod "curl" deleted
```

> NOTA:
>
> O comando `kubectl run curl` cria um pod temporário com a imagem `quay.io/skupper/lanyard`, que contém o utilitário `curl`. O pod é executado no namespace `ilab-chat` e é removido automaticamente após a execução (`--rm`).
>
> O parâmetro `--overrides='{"metadata":{"annotations":{"sidecar.istio.io/inject":"false"}}}'` garante que o sidecar do Istio não seja injetado nesse pod temporário, pois ele não é necessário para a requisição de teste.


### Acesso via Istio Ingress

Para acessar a aplicação implantada, você precisa configurar o Istio Ingress Gateway. Isso pode ser feito da seguinte forma:

```bash
# Obter o endereço do Istio Ingress Gateway

# Obter o endereço IP externo do Istio Ingress Gateway
kubectl get service istio-ingressgateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

> NOTA
>
> **Diferenças entre as abordagens**:
> 
> **Abordagem 1 (Kubernetes + istioctl)**:
> - Instalação mais direta usando ferramentas upstream do Istio
> - Controle total sobre configurações
> - Requer configuração manual de LoadBalancer/NodePort para acesso externo
> - Melhor para ambientes Kubernetes puros
> 
> **Abordagem 2 (OpenShift + Operadores)**:
> - Gerenciamento simplificado através de operadores
> - Integração nativa com recursos do OpenShift (Routes)
> - Interface web para configuração e monitoramento
> - Suporte empresarial e atualizações automáticas
> - Observabilidade integrada com Kiali, Jaeger e Grafana
> 
> **Service Mesh** fornece recursos avançados de gerenciamento de tráfego, segurança e observabilidade:
> - **Gateway**: Define pontos de entrada para tráfego externo na malha de serviços
> - **VirtualService**: Configura regras de roteamento de tráfego para serviços na malha
> - **Sidecar Injection**: Automaticamente injeta proxies Envoy nos pods para interceptar tráfego
> - **Observabilidade**: Integração com ferramentas de monitoramento e rastreamento
> - **mTLS**: Comunicação segura automática entre serviços

## Conclusão

Parabéns! Você implementou com sucesso um chatbot InstructLab no OpenShift usando Skupper para conectar de forma segura um modelo de IA privado com uma interface pública. Esta solução permite que organizações mantenham seus modelos de IA em ambientes seguros e controlados, enquanto ainda fornecem acesso aos usuários finais através de uma interface web escalável.

A combinação de InstructLab, Skupper e OpenShift Service Mesh fornece uma arquitetura robusta que atende aos requisitos de segurança, observabilidade e escalabilidade necessários para aplicações de IA empresariais.

Referências:

- [Comandos extraídos do projeto InstructLab](https://github.com/instructlab)
- [Primeiros passos com o InstructLab: Ajuste de modelo de IA generativo](https://developers.redhat.com/blog/2024/06/12/getting-started-instructlab-generative-ai-model-tuning#model_alignment_and_training_with_instructlab)
- [Guia de instalação do InstructLab](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)
- [Chatbot ILAB Frontend](https://github.com/rafaelvzago/ilab-client)
- [Red Hat Developer](https://developers.redhat.com)
- [Hugging Face Token](https://huggingface.co/docs/hub/en/security-tokens)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
