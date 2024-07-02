---
layout: post
title: "Workshop: Patient Portal, conectando um banco de dados a um cluster K8S com Skupper"
date: 2024-07-02
categories: [skupper, multi-cloud]
tags: [cloud, network, redhat]
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

1. Logar no Red Hat Developer [1].
2. Criar um cluster Openshift.
3. Criar uma chave SSH local no seu computador, que será usada para acessar a máquina virtual do cluster.
4. Acessar o cluster Openshift.
5. No projeto do Red Hat Openshift Sandbox, acessar o seu projeto.
6. Criar uma máquina virtual no Openshift Virtualization, ela será criada com a sua chave pública.
7. Acessar a máquina virtual do cluster Openshift usando a ferramenta virtctl [2].
8. Conectado na máquina, vamos habilitar o módulo do iptables, isso é necessário para o nosso banco de dados em podman.
9. Instalar o podman nessa máquina virtual.
10. Fazer o deploy do banco de dados com o podman (Como no exemplo do Skupper[4]).
11. Fazer o deploy do frontend e do backend da aplicação (Como no exemplo do Skupper[4]).
12. Configurar o Service Interconnect (Skupper[4]) para fazer a comunicação do banco de dados rodando em um podman com a aplicação rodando no Openshift.
13. Acessar a aplicação e verificar se a comunicação está funcionando.
14. Considerações.

## Links

| Recurso                                       | Link                                                                 |
|-----------------------------------------------|----------------------------------------------------------------------|
| [1] Red Hat Developer                             | [https://developers.redhat.com/](https://developers.redhat.com/)                               |
| [2] Virtctl                                       | [https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/](https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/) |
| [3] OC                                            | [https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/getting-started-cli.html](https://docs.openshift.com/container-platform/4.15/cli_reference/openshift_cli/getting-started-cli.html) |
| [4] Skupper                                       | [https://skupper.io/](https://skupper.io/)                                          |
| [5] Exemplo do Skupper                            | [https://github.com/skupperproject/skupper-example-patient-portal](https://github.com/skupperproject/skupper-example-patient-portal) |
| [6] Kubectl                                       | [https://kubernetes.io/docs/reference/kubectl/overview/](https://kubernetes.io/docs/reference/kubectl/overview/) |

## Pré-requisitos

- Conta no Red Hat Developer
- Conhecimento básico em Kubernetes
- Conhecimento básico em Red Hat OpenShift
- Conhecimento básico em Podman
- Um cliente SSH instalado no seu computador (ex. Putty, OpenSSH)
- Uma chave SSH gerada no seu computador
- Virtctl instalado no seu computador ou no computador que você vai usar para acessar a máquina virtual do cluster Openshift.
- OC instalado no seu computador ou no computador que você vai usar para acessar o cluster Openshift.
- Skupper instalado no seu computador ou no computador que você vai usar para acessar o cluster Openshift.
- Kubectl instalado no seu computador ou no computador que você vai usar para acessar o cluster Openshift.

## Passo a passo

### 1. Logar no Red Hat Developer

Acesse o site do [Red Hat Developer](https://developers.redhat.com/) e faça o login com a sua conta.

![Red Hat Developer](assets/workshop_skupper_img1.png)

### 2. Criar um cluster Openshift Sandbox

#### 2.1. Acesse o [Red Hat Openshift Sandbox](https://learn.openshift.com/sandbox) e clique em "Start Cluster".

![Red Hat Openshift Sandbox](assets/workshop_skupper_img2.png)

#### 2.2. Inicie o cluster Openshift Sandbox.

![Red Hat Openshift Sandbox](assets/workshop_skupper_img3.png)

### 3. Criar uma chave SSH local no seu computador

Abra o terminal do seu computador e execute o comando abaixo para criar uma chave SSH:

```bash
ssh-keygen -t rsa -b 4096 -C "voce@email.com"
```

### 4. Acessar o cluster Openshift

Acesse o cluster Openshift Sandbox e clique em "Open Console".

### 5. No projeto do Red Hat Openshift Sandbox, acessar o seu projeto

Clique no seu projeto e mude para a view "Administrator".

![Red Hat Openshift Sandbox](assets/workshop_skupper_img4.png)

### 6. Criar uma máquina virtual no Openshift Virtualization

1. Acesse Virtualization no menu do cluster Openshift e clique em _Virtual Machines_.
2. Clique em _Create Virtual Machine_.
3. Escolha _From Template_ e selecione o template *CentOS Fedora VM*.
4. Mude as especificações da máquina virtual para 4GB de memória e 2 CPUs.
5. Cadastre sua Chave Pública SSH.
6. Confira se ela será usada na criação da máquina virtual em _Quick create VirtualMachine_ a opção *Public SSH Key*.
7. Clique em _Customize VirtualMachine_ e depois em _Scrits_.
8. Adicione a sua chave SSH, escolha um nome e marque a opção _Automatically apply this key to any new VirtualMachine you create in this project_.

![Red Hat Openshift Sandbox](assets/workshop_skupper_img5.png)

9. Clique em _Create VirtualMachine_.

### 7. Acessar a máquina virtual do cluster Openshift usando a ferramenta virtctl

1. Para acessar a máquina virtual, primeiro precisamos logar no Cluster Openshift usando o binário oc.
2. Baixe o binário oc no seu computador.
3. Baixe o binário do virtctl no seu computador.
4. Copie o comando de login do cluster Openshift.

![Red Hat Openshift Sandbox](assets/workshop_skupper_img6.png)

5. Execute o comando de login no seu terminal.

### 8. Conectado na máquina, vamos habilitar o módulo do iptables, isso é necessário para o nosso banco de dados em podman

1. Copie o comando para logar na máquina virtual.

![Red Hat Openshift Sandbox](assets/workshop_skupper_img7.png)

2. Agora que estamos logados na máquina virtual, execute o comando abaixo para habilitar o módulo do iptables.

```bash
sudo modprobe iptable_nat
```

### 9. Instalar o podman nessa máquina virtual

Execute o comando abaixo para instalar o podman:

```bash
sudo yum install -y podman
```

### 10. Fazer o deploy do banco de dados com o podman na máquina virtual

Execute o comando abaixo para fazer o deploy do banco de dados:

```bash
podman run --name database-target --network skupper --detach --rm -p 5432:5432 quay.io/skupper/patient-portal-database
```

### 11. Fazer o deploy do frontend e do backend da aplicação

Neste passo, você pode usar a sua máquina local ou a máquina virtual.

1. Clone o repositório do exemplo do Skupper:

```bash
git clone git@github.com:skupperproject/skupper-example-patient-portal.git
```

2. Entre na pasta do repositório:

```bash
cd skupper-example-patient-portal
```

3. Execute os comandos abaixo para fazer o deploy do frontend e do backend:

```bash
kubectl apply -f frontend/kubernetes.yaml
kubectl apply -f backend/kubernetes.yaml
```

### 12. Configurar o Service Interconnect (Skupper) para fazer a comunicação do banco de dados rodando em um podman com a aplicação rodando no Openshift

1. Execute o comando abaixo para instalar o Skupper na máquina virtual e na máquina local (Linux). Se você estiver usando o Windows, baixe o binário no site do [Skupper](https://skupper.io/).

```bash
curl -L https://skupper.io/cli | sh
```

2. Execute o comando abaixo para criar o Skupper no cluster Openshift:

```bash
skupper init --enable-console --enable-flow-collector --console-user admin --console-password admin
```

3. Execute o comando abaixo para iniciar o Podman Site, que é o site que vai fazer a comunicação entre o banco de dados e a aplicação rodando no Openshift:

```bash
skupper init --ingress none
```

4. Execute o comando abaixo para criar o link entre o banco de dados e a aplicação. Esse comando deve ser executado na máquina que está conectada ao cluster Openshift:

```bash
skupper token create secret.token
```

5. Copie o arquivo secret.token para a máquina virtual.

6. Agora, faça a conexão entre o site que está rodando o banco de dados com a aplicação que está rodando no Openshift:

```bash
skupper link create secret.token
```

7. Execute os comandos para expor o serviço do banco de dados no cluster Openshift. Todos os comandos devem ser executados na máquina virtual:

```bash
skupper service create database 5432
skupper service bind database host database-target --target-port 5432 
```

8. Execute o comando abaixo para criar o serviço do banco de dados no cluster Openshift, que agora está conectado com o banco de dados rodando no podman:

```bash
skupper service create database 5432
```

### 13. Acessar a aplicação e verificar se a comunicação está funcionando

1. Execute o comando abaixo para expor a aplicação do Frontend:

```bash
kubectl expose deployment/frontend --port 8080 --type LoadBalancer
oc expose svc frontend
oc get routes
```

2. Acesse o console do Skupper e verifique se a comunicação entre o banco de dados e a aplicação está funcionando.

### 14. Considerações

> O Red Hat Service Interconnect (Skupper) oferece uma solução poderosa para integrar aplicações em diferentes ambientes, simplificando a comunicação entre serviços e proporcionando maior flexibilidade e escalabilidade. Ao abstrair a complexidade da rede subjacente, o Skupper permite que os desenvolvedores se concentrem na lógica de negócios de suas aplicações, sem se preocupar com os detalhes de conectividade.

> Com recursos como descoberta de serviços automática, roteamento inteligente e segurança integrada, o Skupper garante que as aplicações possam se comunicar de forma eficiente e segura, independentemente de sua localização. Essa abordagem simplifica a gestão da infraestrutura e reduz a necessidade de configurações manuais, agilizando o desenvolvimento e a implantação de aplicações distribuídas.

> Além disso, o Skupper oferece uma interface de usuário intuitiva e ferramentas de linha de comando poderosas, facilitando a configuração e o monitoramento da comunicação entre serviços. Com sua arquitetura extensível e suporte a diversos protocolos, o Skupper se adapta a diferentes cenários de integração, atendendo às necessidades de projetos de todos os portes.

> Em resumo, o Red Hat Service Interconnect (Skupper) é uma ferramenta essencial para empresas que buscam simplificar a integração de aplicações, melhorar a eficiência operacional e garantir a segurança da comunicação entre seus sistemas. Ao adotar o Skupper, as organizações podem acelerar a inovação, reduzir custos e impulsionar o crescimento de seus negócios.
