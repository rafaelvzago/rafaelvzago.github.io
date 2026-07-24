---
title: "Skupper: multicloud app network in a few commands"
description: "Connect Kubernetes services across clouds with Skupper: a hands-on Hello World using namespaces, tokens, and mTLS—without exposing the backend publicly."
date: 2022-10-01
slug: "multicloud-com-skupper"
tags: [kubernetes, skupper, cloud, redhat, multicloud, networking, devops, k8s]
toc: true
images:
  - "/assets/img/headers/multicloud-com-skupper-hero.webp"
---

![](/assets/img/headers/multicloud-com-skupper-hero.webp)

## References and technologies used

1. [https://skupper.io](https://skupper.io)
2. [https://minikube.sigs.k8s.io](https://minikube.sigs.k8s.io)
3. [Repository with the code](https://github.com/skupperproject/skupper-example-hello-world)
4. [Qpid-dispatch](https://qpid.apache.org/components/dispatch-router/index.html)
5. [ActiveMQ](https://activemq.apache.org/)
6. [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
7. [Kubernetes](https://kubernetes.io/docs/home/)
9. [MTLS](https://en.wikipedia.org/wiki/Transport_Layer_Security)
10. [Open-source](https://en.wikipedia.org/wiki/Open_source)
11. [Skupper-router](https://github.com/skupperproject/skupper-router)
12. [Skupper](https://github.com/skupperproject/skupper)

## Tools

- A computer with minikube [2] installed;
- A terminal to run the commands;
- `kubectl` > 1.15 [6] or newer.

## Solution overview

Skupper [1] lets you connect two or more cloud environments in a non-intrusive, secure way. Those environments can sit on different cloud providers—AWS, GCP, Azure, and others—or on native Kubernetes clusters.

_tl;dr_

### If you are just getting started with cloud

> Skupper connects different cloud environments securely and without much fuss. Picture two rooms, each with its own toolkit. Skupper is like a locked door that lets those rooms talk to each other and share tools when needed. That matters when parts of an application run in different places but still need to behave as if they were side by side.

### If you already know a bit of cloud

> Skupper is a Kubernetes service network that makes secure communication across clusters straightforward. It builds a virtual network layer that connects pods in different clusters as if they shared one local network. You do not need cluster-admin privileges, and you do not need to expose services to the public internet. It also stays out of your app: no sidecars or extra containers injected into your Pods. It is open source and provides end-to-end encryption with digital certificates.

### If you like to dig into the bits

> Skupper has two main pieces: the skupper-router and a control plane called skupper-service-controller. The skupper-router is a service-network router based on Qpid-dispatch [4] and ActiveMQ [5]. The skupper-service-controller is a Kubernetes controller that manages the skupper-router and exposes an API to configure the service network. There are other helper containers involved in setup and management, but they are not required for Skupper to run. That is a topic for another post.

---

## Solution

![Hello World](/assets/hello-world-entities.svg)

**This example has two services:**

**1. Frontend**
- A backend service that exposes an `/api/hello` endpoint. The response looks like: Hi, `<your-name>`. I am `<my-name> (<pod-name>)`. It is deployed in the `config_oeste` namespace;

**2. Backend**
- A frontend service that exposes an `/api/hello` endpoint, calls the backend service, and returns the response. In this case the backend runs in another namespace called `config_leste`, which may sit in another cluster or namespace.

### Why use Skupper?

> With Skupper you can put the backend in one cluster and the frontend in another, keep connectivity between them, and avoid exposing the backend to the public internet.

_Details:_

1. You do not need cluster-admin privileges, because the solution works at the namespace level;
2. It does not intrude on your application: no sidecars or extra containers inside the Pods;
3. It is open source;
4. You can connect external services into your cluster—databases, legacy apps, even high-criticality systems;
5. End-to-end encryption with digital certificates;
6. A low learning curve;
7. mTLS [9] by default. mTLS is a security protocol that keeps communication between two endpoints encrypted and authenticated;
8. You can use your own certificates when needed—company certs or the ones Skupper generates automatically (the default).

---
Let's prepare the test environment:

- A backend service running in one namespace that provides logic for a frontend service running in another namespace\*.
- Here each service runs in a different namespace, but the same example can (and should) be tested across different providers.


### 1. In this example we use two namespaces:

1.1. `config_oeste` for the frontend. Open one terminal tab per namespace:
```bash
export KUBECONFIG=~/.kube/config-oeste
```
1.2. `config_leste` for the backend. In the other terminal:
```bash
export KUBECONFIG=~/.kube/config-leste
```
Note: You can name the namespaces whatever you want, but keep the same names in your Skupper config.

### 2. Configuring each namespace:

2.1.`config_oeste`:
```bash
kubectl create namespace oeste
kubectl config set-context --current --namespace oeste
```
2.2.`config_leste`:
```bash
kubectl create namespace leste
kubectl config set-context --current --namespace leste
```

### 3. Installing Skupper:

You can install Skupper in a few ways:

- Build from the repository
- [Download the binary from the project repository [1]](https://github.com/skupperproject/skupper-example-hello-world/archive/refs/heads/main.zip)
- Use the install script from [skupper.io](https://skupper.io)—we'll use this one because it is simpler and you do not have to chase dependencies.

### 4. Installing the Skupper CLI:

 ```bash
 curl https://skupper.io/install.sh | sh
 ```

### 5. Starting Skupper in both namespaces:

5.1.`config_oeste`:
```bash
skupper init
```
5.2.`config_leste`:
```bash
skupper init
```

### 6. Linking the namespaces:

Creating a link uses two Skupper commands together: `skupper token create` and `skupper link create`.

`skupper token create` generates a secret token that grants permission to create a link. The token also carries the link details. Then, in a remote namespace, `skupper link create` uses that token to link back to the namespace that created it.

>Note: A link token is a secret. Anyone who has it can link to your namespace. Share it only with people you trust. You can also limit uses and lifetime—see the Skupper docs [1] for details.

#### 6.1. Creating the token in the `config_oeste` namespace:

```bash
skupper token create ~/secret.token
Token written to ~/secret.token
```

#### 6.2. Linking `config_leste` to `config_oeste` with the generated token:
```bash
skupper link create ~/secret.token
```

### 7. Deploying the frontend and the backend:

7.1. Applying the YAML to deploy the frontend in `config_oeste`:

```bash
kubectl create deployment frontend --image quay.io/skupper/hello-world-frontend
deployment.apps/frontend created
```

7.2. Applying the YAML to deploy the backend in `config_leste`:

```bash
kubectl create deployment backend --image quay.io/skupper/hello-world-backend --replicas 3
deployment.apps/backend created
```

### 8. Exposing the backend service:

With the services running, expose them so they can be reached. Here we expose the backend so the frontend can call it, no matter where it runs.

8.1. Exposing the backend in `config_leste`:

```bash
skupper expose deployment/backend --port 8080
deployment backend exposed as backend
```

### 9. Exposing the frontend service:

Now expose the frontend so we can reach it from outside.

9.1. Exposing the frontend in `config_oeste`:

```bash
kubectl expose deployment frontend --port 8080 --type LoadBalancer
service/frontend exposed
```

### 10. Testing the application:

Hit the frontend and check that it can reach the backend. Call the frontend `/api/health` endpoint and confirm the backend responds.

10.1.`config_oeste`:

```bash
kubectl get service/frontend
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
frontend   LoadBalancer   10.103.232.28   <external-ip>   8080:30407/TCP   15s

curl http://<external-ip>:8080/api/health
OK
```

### 11. Cleaning up:

Once you have tested Skupper, tear everything down so you can try again or run other experiments.

11.1. Cleaning up `config_oeste`:

```bash
skupper delete
kubectl delete service/frontend
kubectl delete deployment/frontend
```
11.2. Cleaning up `config_leste`:

```bash
skupper delete
kubectl delete deployment/backend
```

## Summary

This example puts the frontend and backend services in different namespaces, on different clusters. Normally they would have no path to talk unless you exposed them on the public internet.

Putting Skupper in each namespace lets you build a virtual application network that connects services across clusters. Any service exposed on that network shows up as a local service in every linked namespace.

The backend lives in the east, but the frontend in the west can see it as if it were local. When the frontend calls the backend, Skupper forwards the request to the namespace where the backend runs and routes the response back.

You did not have to expose the backend to the public internet. Skupper built an application network across clusters. The backend is in the east; the frontend in the west treats it as local. When the frontend sends a request, Skupper forwards it and returns the response.

No VPN or Layer 3 connection was required. Skupper creates the application network that stitches the services together across clusters—the backend stays private, and the frontend still reaches it as a local service.
