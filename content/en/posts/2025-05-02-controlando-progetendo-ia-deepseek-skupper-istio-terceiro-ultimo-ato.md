---
title: "Skupper + InstructLab: controlling and protecting AI (act 3)"
description: "Finish the series: deploy the InstructLab chatbot on Kubernetes and link a private DeepSeek model to a public UI with Skupper."
date: 2025-05-05
slug: "controlando-progetendo-ia-deepseek-skupper-istio-terceiro-ultimo-ato"
tags: [ai, skupper, instructlab, openshift, nginx, ingress, loadbalancer]
toc: true
images:
  - "/assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt3.png"
---

![](/assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt3.png)

## See the Solution in Action

In this article we deploy the InstructLab chatbot on Kubernetes step by step, using Skupper to securely connect a private AI model to a public interface. This is the hands-on continuation of the solution pattern from the previous article.

### Concepts and Commands Used in the Demo

> NOTE: The following commands configure the environment and deploy the InstructLab chatbot. They are taken from the InstructLab project and adapted for this demo.
> 
> **`kubectl apply -f <manifest>`**: Applies YAML manifests to the cluster.
> 
> **`kubectl create namespace <namespace>`**: Creates a new namespace in Kubernetes.
> 
> **`kubectl get pods -n <namespace>`**: Lists pods in a specific namespace.
> 
> **`kubectl get services -n <namespace>`**: Lists services in a namespace.
> 
> **`kubectl port-forward service/<service-name> <local-port>:<service-port> -n <namespace>`**: Forwards a local port to a service in the cluster.

### Run the demo

#### Before you start

To set up the demo you need:

- Access to a Kubernetes cluster with Skupper installed.

- A server running the InstructLab chat model.

- A terminal to run the commands.

- A web browser to interact with the chatbot.

- The kubectl client installed and configured for the Kubernetes cluster.

- The Skupper client installed and configured for the Kubernetes cluster.

- Podman installed to run private Skupper.

### Deploying the InstructLab Chatbot

Before running the chatbot, let's cover the last piece of this solution: the frontend app. It will be deployed on an OpenShift cluster and will send user input to the InstructLab chat model and display the response. The app runs in the same namespace as public Skupper.

We will deploy the application directly on Kubernetes.

The `manifests/` directory holds the required Kubernetes resources:

- `deployment.yaml` - Application Deployment with health checks
- `service.yaml` - ClusterIP Service for internal access
- `ingress.yaml` - NGINX Ingress for external exposure
- `loadbalancer-service.yaml` - LoadBalancer Service for external access


#### Cloning the repository

Before deploying, clone the repository with the required manifests:

```bash
# Clonar o repositório ilab-client
git clone https://github.com/rafaelvzago/ilab-client.git
cd ilab-client
```

#### Installing the NGINX Ingress Controller

First, install the NGINX Ingress Controller on the cluster:

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

> NOTE:
>
> The NGINX Ingress Controller routes external HTTP/HTTPS traffic to services inside the cluster. It automatically creates a LoadBalancer service that exposes the cluster externally.

#### Deploying the application

```bash
# Implantar aplicação
kubectl apply -f manifests/deployment.yaml -n ilab-chat
kubectl apply -f manifests/service.yaml -n ilab-chat
```

#### Configuring the LoadBalancer Service

Create a `loadbalancer-service.yaml` file or apply it directly:

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

#### Configuring NGINX Ingress

Create an `ingress.yaml` file or apply it directly:

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

> NOTE:
>
> The command `kubectl apply -f manifests/deployment.yaml -n ilab-chat` deploys the InstructLab application Deployment in the `ilab-chat` namespace. The Deployment defines how the app runs, including replica count and container settings.
>
> The command `kubectl apply -f manifests/service.yaml -n ilab-chat` creates a ClusterIP service for the app so other pods in the cluster can reach it by service name.
>
> The **LoadBalancer Service** gets an external IP from the cloud provider (AWS ELB, GCP Load Balancer, Azure Load Balancer) for direct access to the app on port 8080.
>
> **NGINX Ingress** provides HTTP/HTTPS access through the Ingress Controller, with advanced features such as path-based routing, SSL/TLS termination, and load balancing.


#### Verifying the deployment

To verify the app deployed correctly, run a curl pod in the `ilab-chat` namespace and request the InstructLab service. That request is routed to the Skupper `connector` running on the private site.

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

Expected output:
```
{"s{"message":"Hello from InstructLab! Visit us at https://instructlab.ai"}pod "curl" deleted
```

> NOTE:
>
> The command `kubectl run curl` creates a temporary pod with the `quay.io/skupper/lanyard` image, which includes `curl`. The pod runs in the `ilab-chat` namespace and is removed automatically after it exits (`--rm`).


### Accessing the application

You have three options to reach the deployed application:

#### Option 1: Port-forward (local development)

```bash
# Port-forward para a aplicação
kubectl port-forward service/ilab-client 8080:8080 -n ilab-chat
```

You can then open the app at `http://localhost:8080`.

#### Option 2: LoadBalancer Service (direct access)

```bash
# Obter o IP externo do LoadBalancer
kubectl get service ilab-client-lb -n ilab-chat

# Aguardar até que EXTERNAL-IP não seja <pending>
# Em seguida, acesse: http://<EXTERNAL-IP>:8080
```

#### Option 3: NGINX Ingress (recommended for production)

```bash
# Obter o IP do Ingress Controller
kubectl get service ingress-nginx-controller -n ingress-nginx

# Verificar o status do Ingress
kubectl get ingress ilab-client-ingress -n ilab-chat

# Acessar via Ingress (substitua <INGRESS-IP> pelo IP obtido):
# http://<INGRESS-IP>/
# ou configure DNS para apontar para o IP do Ingress
```

> NOTE:
>
> **Port-forward**: Best for local development and testing.
>
> **LoadBalancer**: Direct access with an external IP — good for simple environments.
>
> **Ingress**: The more robust production option — SSL/TLS, multiple domains, and advanced routing.

## Conclusion

Congratulations! You successfully deployed an InstructLab chatbot on Kubernetes using Skupper to securely connect a private AI model to a public interface. Organizations can keep AI models in secure, controlled environments while still giving end users access through a scalable web UI.

InstructLab plus Skupper gives you a solid architecture that meets the security and scalability needs of enterprise AI applications.

References:

- [Commands extracted from the InstructLab project](https://github.com/instructlab)
- [InstructLab installation guide](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)
- [Chatbot ILAB Frontend](https://github.com/rafaelvzago/ilab-client)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Skupper Documentation](https://skupper.io/docs/)
