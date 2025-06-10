---
layout: post
title: "Controlando e protegendo modelos de IA com segurança usando Deepseek, Skupper e InstructLab - Terceiro e Último Ato"
description: "Neste artigo, vamos implementar e conectar o modelo de IA DeepSeek com o InstructLab usando Skupper para conectar de forma segura um modelo de IA privado com uma interface pública."
date: 2025-05-05
categories: [AI, Kubernetes, instructlab]
tags: [ai, skupper, instructlab, kubernetes, nginx, ingress, loadbalancer]
image:
  path: /assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt3.png
  alt: Instructlab with Skupper
---

## Veja a Solução em Ação

Neste artigo, vamos implementar passo a passo o chatbot InstructLab no Kubernetes usando Skupper para conectar de forma segura um modelo de IA privado com uma interface pública. Esta é a continuação prática do padrão de solução apresentado no artigo anterior.

### Conceitos e Comandos Usados na Demonstração

> NOTA: Os comandos a seguir são utilizados para configurar o ambiente e implantar o chatbot InstructLab. Eles são extraídos do projeto InstructLab e adaptados para esta demonstração.
> 
> **`kubectl apply -f <manifest>`**: Aplica manifests YAML no cluster.
> 
> **`kubectl create namespace <namespace>`**: Cria um novo namespace no Kubernetes.
> 
> **`kubectl get pods -n <namespace>`**: Verifica os pods em um namespace específico.
> 
> **`kubectl get services -n <namespace>`**: Lista os serviços em um namespace.
> 
> **`kubectl port-forward service/<service-name> <local-port>:<service-port> -n <namespace>`**: Redireciona uma porta local para um serviço no cluster.

### Executar a demonstração

#### Antes de começar

Para configurar a demonstração, você precisa ter os seguintes pré-requisitos:

- Acesso a um cluster Kubernetes com o Skupper instalado.

- Um servidor executando o modelo de chat do InstructLab.

- Acesso a um terminal para executar os comandos.

- Acesso a um navegador da web para interagir com o chatbot.

- Cliente kubectl instalado e configurado para acessar o cluster Kubernetes.

- Cliente skupper instalado e configurado para acessar o cluster Kubernetes.

- Podman instalado para executar o Skupper privado.

### Implantando o Chatbot InstructLab

Antes de executar o chatbot, vamos entender a parte final desta solução, o aplicativo Frontend. Este aplicativo será implantado em um cluster OpenShift e será responsável por enviar a entrada do usuário para o modelo de chat do InstructLab e exibir a resposta para o usuário. O aplicativo será implantado no mesmo namespace onde o Skupper público está em execução.

Vamos agora implementar a aplicação diretamente no Kubernetes.

O diretório `manifests/` contém os recursos Kubernetes necessários:

- `deployment.yaml` - Deployment da aplicação com health checks
- `service.yaml` - Service ClusterIP para acesso interno
- `ingress.yaml` - Ingress NGINX para exposição externa
- `loadbalancer-service.yaml` - Service LoadBalancer para acesso externo


#### Clonando o repositório

Antes de começar a implantação, clone o repositório com os manifests necessários:

```bash
# Clonar o repositório ilab-client
git clone https://github.com/rafaelvzago/ilab-client.git
cd ilab-client
```

#### Instalando o NGINX Ingress Controller

Primeiro, vamos instalar o NGINX Ingress Controller no cluster:

```bash
# Instalar NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Aguardar o controller estar pronto
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Verificar se o ingress controller está rodando
kubectl get pods -n ingress-nginx
kubectl get services -n ingress-nginx
```

> NOTA:
>
> O NGINX Ingress Controller é responsável por rotear o tráfego HTTP/HTTPS externo para os serviços dentro do cluster. Ele cria automaticamente um LoadBalancer service que expõe o cluster externamente.

#### Implantando a aplicação

```bash
# Implantar aplicação
kubectl apply -f manifests/deployment.yaml -n ilab-chat
kubectl apply -f manifests/service.yaml -n ilab-chat
```

#### Configurando LoadBalancer Service

Crie um arquivo `loadbalancer-service.yaml` ou aplique diretamente:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ilab-client-lb
  namespace: ilab-chat
  labels:
    app: ilab-client
spec:
  type: LoadBalancer
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: ilab-client
```

```bash
# Aplicar LoadBalancer service
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: ilab-client-lb
  namespace: ilab-chat
  labels:
    app: ilab-client
spec:
  type: LoadBalancer
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: ilab-client
EOF
```

#### Configurando NGINX Ingress

Crie um arquivo `ingress.yaml` ou aplique diretamente:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ilab-client-ingress
  namespace: ilab-chat
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ilab-client
            port:
              number: 8080
```

```bash
# Aplicar Ingress NGINX
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ilab-client-ingress
  namespace: ilab-chat
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ilab-client
            port:
              number: 8080
EOF
```

```bash
# Verificar deployment
kubectl get pods -n ilab-chat
kubectl get services -n ilab-chat
kubectl get ingress -n ilab-chat
```

> NOTA:
>
> O comando `kubectl apply -f manifests/deployment.yaml -n ilab-chat` implanta o deployment da aplicação InstructLab no namespace `ilab-chat`. O deployment define como a aplicação será executada, incluindo o número de réplicas e as configurações do container.
>
> O comando `kubectl apply -f manifests/service.yaml -n ilab-chat` cria um serviço ClusterIP para a aplicação, permitindo que outros pods no cluster acessem a aplicação pelo nome do serviço.
>
> O **LoadBalancer Service** obtém um IP externo do provedor de nuvem (AWS ELB, GCP Load Balancer, Azure Load Balancer) para acesso direto à aplicação na porta 8080.
>
> O **Ingress NGINX** permite acesso HTTP/HTTPS à aplicação através do Ingress Controller, oferecendo recursos avançados como roteamento baseado em path, SSL/TLS termination, e balanceamento de carga.


#### Verificando a implantação

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


### Acesso à aplicação

Você tem três opções para acessar a aplicação implantada:

#### Opção 1: Port-forward (desenvolvimento local)

```bash
# Port-forward para a aplicação
kubectl port-forward service/ilab-client 8080:8080 -n ilab-chat
```

Agora você pode acessar a aplicação em `http://localhost:8080`.

#### Opção 2: LoadBalancer Service (acesso direto)

```bash
# Obter o IP externo do LoadBalancer
kubectl get service ilab-client-lb -n ilab-chat

# Aguardar até que EXTERNAL-IP não seja <pending>
# Em seguida, acesse: http://<EXTERNAL-IP>:8080
```

#### Opção 3: NGINX Ingress (produção recomendada)

```bash
# Obter o IP do Ingress Controller
kubectl get service ingress-nginx-controller -n ingress-nginx

# Verificar o status do Ingress
kubectl get ingress ilab-client-ingress -n ilab-chat

# Acessar via Ingress (substitua <INGRESS-IP> pelo IP obtido):
# http://<INGRESS-IP>/
# ou configure DNS para apontar para o IP do Ingress
```

> NOTA:
>
> **Port-forward**: Ideal para desenvolvimento e testes locais.
>
> **LoadBalancer**: Fornece acesso direto com IP externo, ideal para ambientes simples.
>
> **Ingress**: Solução mais robusta para produção, permite configuração de SSL/TLS, múltiplos domínios e roteamento avançado.

## Conclusão

Parabéns! Você implementou com sucesso um chatbot InstructLab no Kubernetes usando Skupper para conectar de forma segura um modelo de IA privado com uma interface pública. Esta solução permite que organizações mantenham seus modelos de IA em ambientes seguros e controlados, enquanto ainda fornecem acesso aos usuários finais através de uma interface web escalável.

A combinação de InstructLab e Skupper fornece uma arquitetura robusta que atende aos requisitos de segurança e escalabilidade necessários para aplicações de IA empresariais.

Referências:

- [Comandos extraídos do projeto InstructLab](https://github.com/instructlab)
- [Guia de instalação do InstructLab](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)
- [Chatbot ILAB Frontend](https://github.com/rafaelvzago/ilab-client)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Skupper Documentation](https://skupper.io/docs/)
