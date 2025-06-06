---
layout: post
title: "Workshop: Patient Portal, conectando um banco de dados a um cluster K8S com Skupper"
date: 2024-07-02
categories: [skupper, multi, cloud, network, redhat]
tags: [skupper, workshop, kubernetes, openshift, networking, database, tutorial, hands-on]
image:
  path: /assets/img/headers/workshop-skupper-patient-portal.jpg
  alt: Zago

---

## Descrição

Este workshop tem como objetivo apresentar o Red Hat Service Interconnect, uma solução de integração de aplicações que permite a comunicação entre diferentes sistemas de forma eficiente e segura.

## Arquitetura da Solução

![Arquitetura](assets/workshop_skupper_arquitetura.png)

## Topologia de Serviços

![Topologia](assets/workshop_skupper_solution-topology.png)

## Resumo do Workshop

1. Logar no Red Hat Developer.
2. Criar um cluster Openshift.
4. Acessar o cluster Openshift.
5. No projeto do Red Hat Openshift Sandbox, acessar o seu projeto.
6. Criar uma máquina virtual no Openshift Virtualization.
7. Instalar pacotes na máquina virtual:
    - podman
    - kubernetes-client
    - skupper
    - oc
    - wget
8. Fazer o deploy do banco de dados com o podman.
9. Fazer o deploy do frontend e do backend da aplicação.
10. Configurar o Service Interconnect (Skupper) para fazer a comunicação do banco de dados rodando em um podman com a aplicação rodando no Openshift.
13. Acessar a aplicação e verificar se a comunicação está funcionando.
14. Considerações.
    
## Links

| Recurso                                       | Link                                                                 |
|-----------------------------------------------|----------------------------------------------------------------------|
| [1] Red Hat Developer                             | [https://developers.redhat.com/](https://developers.redhat.com/)                               |
| [2] OC                                            | [https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/getting-started-cli.html](https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/getting-started-cli.html) |
| [3] Skupper                                       | [https://skupper.io/](https://skupper.io/)                                          |

## Pré-requisitos

- Conta no Red Hat Developer
- Conhecimento básico em Kubernetes
- Conhecimento básico em Red Hat OpenShift
- Conhecimento básico em Podman
- Google Chrome, a preferência por ele é pela funcionalidade de colar comandos no console da máquina virtual pelo VNC via browser.

## Passo a passo

### 1. Logar no Red Hat Developer

Acesse o site do [Red Hat Developer](https://developers.redhat.com/) e faça o login com a sua conta.

![Red Hat Developer](assets/workshop_skupper_img1.png)

### 2. Criar um cluster Openshift Sandbox

#### 2.1. Acesse o [Red Hat Openshift Sandbox](https://learn.openshift.com/sandbox) e clique em "Start Cluster".

![Red Hat Openshift Sandbox](assets/workshop_skupper_img2.png)

#### 2.2. Inicie o cluster Openshift Sandbox.

![Red Hat Openshift Sandbox](assets/workshop_skupper_img3.png)


### 4. Acessar o cluster Openshift

Acesse o cluster Openshift Sandbox e clique em "Open Console".

### 5. No projeto do Red Hat Openshift Sandbox, acessar o seu projeto

Clique no seu projeto e mude para a view "Administrator".

![Red Hat Openshift Sandbox](assets/workshop_skupper_img4.png)

### 6. Criar uma máquina virtual no Openshift Virtualization

1. Acesse Virtualization no menu do cluster Openshift e clique em _Virtual Machines_.
2. Clique em _Create Virtual Machine_.
3. Escolha _From Template_ e selecione o template *Fedora VM*.
4. Clique em _Create VirtualMachine_.

### 7. Instalar pacotes na máquina virtual

1. Acesse a máquina virtual e clique em _Console_. (Dê preferencia para o Google Chrome, pois ele tem a funcionalidade de colar comandos no console da máquina virtual pelo VNC via browser).
2. Logue com as credenciais que estão no console.
3. Execute os comandos abaixo para instalar os pacotes necessários:
```bash
sudo dnf install -y podman kubernetes-client wget
# Instalar o oc
wget -qO- https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-linux.tar.gz | tar xz -C ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
# Instalar o skupper
curl https://skupper.io/install.sh | sh
```

### 8. Fazer o deploy do banco de dados com o podman

> Execute o comando abaixo para fazer o deploy do banco de dados:

```bash
podman network create skupper
podman run --name database-target --network skupper --detach --rm -p 5432:5432 quay.io/skupper/patient-portal-database
```

### 9. Fazer o deploy do frontend e do backend da aplicação

> No seu console openshift, faça o deploy do seguinte yaml para o frontend:

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

> No seu console openshift, faça o deploy do seguinte yaml para o backend:

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

### 10. Configurar o Service Interconnect (Skupper) para fazer a comunicação do banco de dados rodando em um podman com a aplicação rodando no Openshift.

Para isso, vamos dividir em 3 etapas:

1. Configuração do Cluster Kubernetes
2. Configuração do Site Podman
3. Expor o serviço do banco de dados para a VAN do Skupper

> Configuração do Cluster Kubernetes:

1. Iniciar o skupper no cluster oenshift com o console habilitado
```bash
skupper init --enable-console --enable-flow-collector --console-user admin --console-password admin
```
2. Acessar o console do skupper, para isso acesse as rotas do seu cluster Openshift, a URL estará lá.
3. Criando um token para conectar o site podman com o cluster Openshift
```bash
skupper token create ./skupper-token.yaml
```

> Configuração do Site Podman:

1. Acesse a máquina virtual e execute o comando abaixo para conectar o site podman com o cluster Openshift
2. Ininie o skupper no site podman, sem ingress.
```bash
skupper switch podman # para mudar o contexto para podman o padrão é kubernetes
```
3. Conecte o site podman com o cluster Openshift
```bash
skupper link create ./skupper-token.yaml
```
Acesse o console do skupper no cluster Openshift e verifique se o site podman está conectado.

> Expor o serviço do banco de dados para a VAN do Skupper:

1. Expor o serviço do banco de dados para a VAN do Skupper
```bash
systemctl --user enable --now podman.socket
skupper service create database 5432
skupper service bind database host database-target --target-port 5432
```
2. No cluster Openshift, vamos criar um serviço *Skupper* para o banco de dados, esse serviço vai apontar para o serviço do banco de dados que está rodando no site podman, através da VAN do Skupper.
```bash
skupper service create database 5432
```

Agora, a aplicação frontend e backend estão se comunicando com o banco de dados que está rodando em um site podman, através da VAN do Skupper.

![Skupper](assets/workshop_skupper_img6.png)

### 13. Acessar a aplicação e verificar se a comunicação está funcionando

Para isso, vamos precisar executar algumas tarefas para expor o frontend no cluster Openshift.

> Criar um serviço para o fronend que aponte para o deployment dele use o seguinte YAML:

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

> Criar uma rota que aponte para o serviço do frontend.

```yaml
kind: Route
apiVersion: route.openshift.io/v1
metadata:
  name: fronted
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


### 14. Considerações

> O Red Hat Service Interconnect (Skupper): 

Oferece uma solução poderosa para integrar aplicações em diferentes ambientes, simplificando a comunicação entre serviços e proporcionando maior flexibilidade e escalabilidade. Ao abstrair a complexidade da rede subjacente, o Skupper permite que os desenvolvedores se concentrem na lógica de negócios de suas aplicações, sem se preocupar com os detalhes de conectividade.

> Com recursos como descoberta de serviços automática:

O roteamento inteligente e segurança integrada, o Skupper garante que as aplicações possam se comunicar de forma eficiente e segura, independentemente de sua localização. Essa abordagem simplifica a gestão da infraestrutura e reduz a necessidade de configurações manuais, agilizando o desenvolvimento e a implantação de aplicações distribuídas.

> Além disso, o Skupper oferece uma interface de usuário intuitiva e ferramentas de linha de comando poderosas, facilitando a configuração e o monitoramento da comunicação entre serviços. Com sua arquitetura extensível e suporte a diversos protocolos, o Skupper se adapta a diferentes cenários de integração, atendendo às necessidades de projetos de todos os portes.

## Resumo

Neste workshop, você aprendeu como usar o Red Hat Service Interconnect (Skupper) para conectar um banco de dados a um cluster Kubernetes, permitindo que aplicações distribuídas se comuniquem de forma eficiente e segura. Com o Skupper, você pode simplificar a integração de serviços em ambientes heterogêneos, facilitando o desenvolvimento e a implantação de aplicações modernas. Esperamos que este workshop tenha sido útil e que você possa aplicar esses conhecimentos em seus próprios projetos. Obrigado por participar!
