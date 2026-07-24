---
title: "Skupper workshop: Patient Portal on Kubernetes"
description: "Hands-on workshop: connect a Podman database to OpenShift apps with Red Hat Service Interconnect (Skupper)—sandbox, VM, tokens, and a working Patient Portal."
date: 2024-07-02
slug: "workshop-skupper-patient-portal"
tags: [skupper, workshop, kubernetes, openshift, networking, database, tutorial, hands-on, multi, cloud, network, redhat]
toc: true
images:
  - "/assets/img/headers/workshop-skupper-patient-portal.jpg"
---

![](/assets/img/headers/workshop-skupper-patient-portal.jpg)

## Description

This workshop introduces Red Hat Service Interconnect, an application integration solution that lets different systems communicate efficiently and securely.

## Solution architecture

![Architecture](assets/workshop_skupper_arquitetura.png)

## Service topology

![Topology](assets/workshop_skupper_solution-topology.png)

## Workshop outline

1. Sign in to Red Hat Developer.
2. Create an OpenShift cluster.
4. Access the OpenShift cluster.
5. In the Red Hat OpenShift Sandbox project, open your project.
6. Create a virtual machine with OpenShift Virtualization.
7. Install packages on the virtual machine:
    - podman
    - kubernetes-client
    - skupper
    - oc
    - wget
8. Deploy the database with Podman.
9. Deploy the application frontend and backend.
10. Configure Service Interconnect (Skupper) so the database running under Podman can talk to the app on OpenShift.
13. Access the application and confirm communication works.
14. Closing notes.
    
## Links

| Resource                                      | Link                                                                 |
|-----------------------------------------------|----------------------------------------------------------------------|
| [1] Red Hat Developer                             | [https://developers.redhat.com/](https://developers.redhat.com/)                               |
| [2] OC                                            | [https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/getting-started-cli.html](https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/getting-started-cli.html) |
| [3] Skupper                                       | [https://skupper.io/](https://skupper.io/)                                          |

## Prerequisites

- A Red Hat Developer account
- Basic Kubernetes knowledge
- Basic Red Hat OpenShift knowledge
- Basic Podman knowledge
- Google Chrome preferred—it lets you paste commands into the VM console over browser VNC.

## Step by step

### 1. Sign in to Red Hat Developer

Go to [Red Hat Developer](https://developers.redhat.com/) and sign in with your account.

![Red Hat Developer](assets/workshop_skupper_img1.png)

### 2. Create an OpenShift Sandbox cluster

#### 2.1. Open the [Red Hat OpenShift Sandbox](https://learn.openshift.com/sandbox) and click "Start Cluster".

![Red Hat OpenShift Sandbox](assets/workshop_skupper_img2.png)

#### 2.2. Start the OpenShift Sandbox cluster.

![Red Hat OpenShift Sandbox](assets/workshop_skupper_img3.png)


### 4. Access the OpenShift cluster

Open the OpenShift Sandbox cluster and click "Open Console".

### 5. In the Red Hat OpenShift Sandbox project, open your project

Click your project and switch to the "Administrator" view.

![Red Hat OpenShift Sandbox](assets/workshop_skupper_img4.png)

### 6. Create a virtual machine with OpenShift Virtualization

1. Open Virtualization in the OpenShift cluster menu and click _Virtual Machines_.
2. Click _Create Virtual Machine_.
3. Choose _From Template_ and select the *Fedora VM* template.
4. Click _Create VirtualMachine_.

### 7. Install packages on the virtual machine

1. Open the virtual machine and click _Console_. (Prefer Google Chrome—it supports pasting commands into the VM console over browser VNC.)
2. Sign in with the credentials shown in the console.
3. Run the commands below to install the required packages:
```bash
sudo dnf install -y podman kubernetes-client wget
# Instalar o oc
wget -qO- https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-linux.tar.gz | tar xz -C ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
# Instalar o skupper
curl https://skupper.io/install.sh | sh
```

### 8. Deploy the database with Podman

> Run the command below to deploy the database:

```bash
podman network create skupper
podman run --name database-target --network skupper --detach --rm -p 5432:5432 quay.io/skupper/patient-portal-database
```

### 9. Deploy the application frontend and backend

> In your OpenShift console, deploy the following YAML for the frontend:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: frontend
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: quay.io/skupper/patient-portal-frontend
          env:
            - name: DATABASE_SERVICE_HOST
              value: database
            - name: DATABASE_SERVICE_PORT
              value: "5432"
            - name: PAYMENT_PROCESSOR_SERVICE_HOST
              value: payment-processor
            - name: PAYMENT_PROCESSOR_SERVICE_PORT
              value: "8080"
          ports:
            - containerPort: 8080
```

> In your OpenShift console, deploy the following YAML for the backend:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: payment-processor
  name: payment-processor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-processor
  template:
    metadata:
      labels:
        app: payment-processor
    spec:
      containers:
        - name: payment-processor
          image: quay.io/skupper/patient-portal-payment-processor
          ports:
            - containerPort: 8080
```

### 10. Configure Service Interconnect (Skupper) so the Podman database can talk to the OpenShift application

We'll split this into three stages:

1. Kubernetes cluster setup
2. Podman site setup
3. Expose the database service onto the Skupper VAN

> Kubernetes cluster setup:

1. Start Skupper on the OpenShift cluster with the console enabled
```bash
skupper init --enable-console --enable-flow-collector --console-user admin --console-password admin
```
2. Open the Skupper console—check your OpenShift routes for the URL.
3. Create a token to connect the Podman site to the OpenShift cluster
```bash
skupper token create ./skupper-token.yaml
```

> Podman site setup:

1. On the virtual machine, run the commands below to connect the Podman site to the OpenShift cluster
2. Start Skupper on the Podman site, without ingress.
```bash
skupper switch podman # para mudar o contexto para podman o padrão é kubernetes
```
3. Connect the Podman site to the OpenShift cluster
```bash
skupper link create ./skupper-token.yaml
```
Open the Skupper console on the OpenShift cluster and confirm the Podman site is connected.

> Expose the database service onto the Skupper VAN:

1. Expose the database service onto the Skupper VAN
```bash
systemctl --user enable --now podman.socket
skupper service create database 5432
skupper service bind database host database-target --target-port 5432
```
2. On the OpenShift cluster, create a Skupper service for the database. That service points at the database running on the Podman site, through the Skupper VAN.
```bash
skupper service create database 5432
```

Now the frontend and backend talk to the database running on a Podman site through the Skupper VAN.

![Skupper](assets/workshop_skupper_img6.png)

### 13. Access the application and confirm communication works

Expose the frontend on the OpenShift cluster with a few more steps.

> Create a Service for the frontend that points at its Deployment using this YAML:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: SEU-NAME-SPACE
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
```

> Create a Route that points at the frontend Service.

```yaml
kind: Route
apiVersion: route.openshift.io/v1
metadata:
  name: frontend
  namespace: SEU-NAME-SPACE
  labels: {}
spec:
  to:
    kind: Service
    name: frontend
  tls: {}
  port:
    targetPort: 8080
  alternateBackends: []
```


### 14. Closing notes

> Red Hat Service Interconnect (Skupper):

Gives you a solid way to integrate applications across environments. It simplifies service-to-service communication and adds flexibility and scale. By abstracting the underlying network, Skupper lets developers focus on business logic instead of connectivity details.

> With features such as automatic service discovery:

Intelligent routing and built-in security help applications talk efficiently and securely, wherever they run. That approach eases infrastructure management, cuts down on manual wiring, and speeds development and deployment of distributed apps.

> Skupper also ships an intuitive UI and strong CLI tools for configuring and monitoring service communication. With an extensible architecture and support for multiple protocols, it fits integration scenarios of many sizes.

## Summary

In this workshop you used Red Hat Service Interconnect (Skupper) to connect a database to a Kubernetes cluster so distributed applications can communicate efficiently and securely. Skupper simplifies service integration in heterogeneous environments and makes modern application development and deployment easier. Hope the workshop was useful—and that you can take these ideas into your own projects. Thanks for joining!
