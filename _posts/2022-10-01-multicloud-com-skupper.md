---
layout: post
title: "Criando uma rede de aplicativos multicloud com Skupper"
date: 2022-10-01 00:00:00 -0300
categories: [cloud, k8s, skupper]
tags: [k8s, skupper, could, RedHat]
image:
  path: /assets/img/posts/multicloud-com-skupper/header.webp
  alt: Skupper
---

## Referências e tecnologias utilizadas:

1. [https://skupper.io](https://skupper.io)
2. [https://minikube.sigs.k8s.io](https://minikube.sigs.k8s.io)
3. [Repositório com os Códigos](https://github.com/skupperproject/skupper-example-hello-world)
4. [Qpid-dispatch](https://qpid.apache.org/components/dispatch-router/index.html)
5. [ActiveMQ](https://activemq.apache.org/)
6. [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
7. [Kubernetes](https://kubernetes.io/pt-br/docs/home/)
9. [MTLS](https://pt.wikipedia.org/wiki/Transport_Layer_Security)
10. [Open-source](https://pt.wikipedia.org/wiki/C%C3%B3digo_aberto)
11. [Skupper-router](https://github.com/skupperproject/skupper-router)
12. [Skupper](https://github.com/skupperproject/skupper)

## Ferramentas

- Um computador com o minikube [2] instalado;
- Um terminal para executar os comandos;
- `kubectl` > 1.15 [6] ou mais nova.

## Descrição da solução

O Skupper [1] é uma ferramenta que permite conectar dois ou mais ambientes de cloud de uma maneira não intrusiva e segura. Tais ambientes podem ser de diferentes provedores de serviço em nuvem como: AWS, GCP, AZURE entre outras, e, inclusive, clusters kubernetes nativos.

_tl;dr_

### Para quem está começando com cloud:

> O Skupper é uma ferramenta que permite conectar diferentes ambientes de computação em nuvem de maneira segura e sem complicações. Imagine que você tem duas salas diferentes, cada uma com seu próprio conjunto de ferramentas. Skupper é como uma porta segura que permite que essas salas "conversem" entre si, compartilhando ferramentas conforme necessário. Isso é útil quando você tem diferentes partes de um aplicativo rodando em diferentes lugares, mas elas precisam trabalhar juntas como se estivessem no mesmo lugar.

### Para quem tem algum conheciemento de cloud:

> O Skupper é uma solução de rede de serviço para Kubernetes que permite a comunicação segura e fácil entre clusters. Ele cria uma camada de rede virtual que conecta pods em diferentes clusters como se estivessem na mesma rede local. Isso é feito sem a necessidade de privilégios de administrador do cluster e sem a necessidade de expor serviços à Internet pública. Além disso, o Skupper não é intrusivo com sua aplicação, pois não cria side-cars ou outros containers dentro dos Pods. Ele é open-source e oferece criptografia de ponta a ponta usando certificados digitais.


### Para quem gosta de escovar bits:

> O Skupper pode ser dividido em duas partes: o skupper-router e o control-plane chamado skupper-service-controller. O skupper-router é um roteador de rede de serviço baseado no Qpid-dispatch [4] e no ActiveMQ [5]. O skupper-service-controller é um controlador Kubernetes que gerencia o skupper-router e fornece uma API para configurar e gerenciar a rede de serviço. Existem outros containers que são usados para configurar e gerenciar o skupper-router, mas eles são apenas auxiliares e não são necessários para o funcionamento do Skupper.  Mas isso vai ficar para outro post.

---

## Solução

![Hello World](/assets/hello-world-entities.svg)

**Esse exemplo consiste em dois serviços:**

**1. Frontend**
- Um serviço de _backend_ que expõe um endpoint `/api/hello`. Que tem como resposta  Oi, `<seu-nome>`. Eu sou `<meu-nome> (<nome-pod>)`. O deploy será feito no _namespace_ `confi_oeste`;

**2. Backend**
- Um serviço de _frontend_ que expõe um endpoint `/api/hello` que faz uma chamada para o serviço de _backend_ e retorna a resposta, mas nesse caso o serviço esta rodando em outro _namespace_ chama `config_leste`, este por sua vez pode estar em outro cluster ou namespace.

### Por que usar o Skupper?

> Com o Skupper, você pode colocar o back-end em um cluster e o front-end em outro e manter a conectividade entre os dois serviços sem expor o back-end à Internet pública.

_Detalhes:_

1. Não é necessário ter privilégios de administrador do cluster, já que a solução é no nível do _namespace_;
2. Não é intrusivo com a sua aplicação, pois não cria _side-cars_ ou outros containers dentro dos _Pods_;
3. É _open-source_;
4. Você pode conectar, em seu _cluster_, serviços externos como: Bancos de dados, aplicações legadas e ainda de alta criticidade;
5. Criptografado de ponta a ponta usando certificados digitais;
6. Baixa curva de aprenddizagem.
7. MTLS [9] por padrão. MTLS é um protocolo de segurança que garante que a comunicação entre dois pontos seja feita de maneira segura e criptografada.
8. Utilização de certificados próprios caso necessário, ou seja, você pode usar os certificados da sua empresa ou gerar novos certificados para o Skupper ( que é o padrão e são criados automaticamente).

---
Agora vamos preparar nosso ambiente de teste, que consiste no seguinte:

- Um serviço de _backend_ que está rodando em um _namespace_ que vai prover a lógica para outro serviço de _frontend_ que obviamente está e outro _namespace_\*.
- Nesse caso, cada serviço está rodando em _namespaces_ diferentes, mas o mesmo exemplo pode (e deve) ser testado com provedores diferentes.


### 1. Nesse exemplo vamos utilizar dois _namespaces_ chamados:

1.1. `config_oeste` onde ficará o _frontend_. Lembre-se de abrir uma aba do seu terminal para cada _namespace_
```bash
export KUBECONFIG=~/.kube/config-oeste
```
1.2. `config_leste` onde ficará o _backend_ agora, no outro terminal:
```bash
export KUBECONFIG=~/.kube/config-leste
```
Obs: Você pode usar o nome que quiser para os _namespaces_, mas lembre-se de usar o mesmo nome no arquivo de configuração do skupper.

### 2. Configurando cada _namespace_:

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

### 3. Instalando o Skupper:

Você possui algumas maneiras de instalar o skupper, como por exemplo:

- Compilar a partir do repositório
- Fazer o [_download_ do executável direto do repositório [1] do projeto](https://github.com/skupperproject/skupper-example-hello-world/archive/refs/heads/main.zip)
- Usar o _script_ de instalação disponibilizado pelo site [skupper.io](https://skupper.io) e vamos utilizar esse método, por ser mais fácil de fazer e você não precisará se preocupar com dependências.

### 4. Instaçação do CLI do Skupper:

 ```bash
 curl https://skupper.io/install.sh | sh
 ```

### 5. Iniciando o skupper nos dois _namespaces_:

5.1.`config_oeste`:
```bash
skupper init
```
5.2.`config_leste`:
```bash
skupper init
```

### 6. Conectando os namespaces:

A criação de um link requer o uso de dois comandos skupper em conjunto: `skupper token create` e `skupper link create`.

O comando skupper token create gera um token secreto que significa permissão para criar um link. O token também carrega os detalhes do link. Em seguida, em um namespace remoto, o comando skupper link create usa o token para criar um link para o namespace que o gerou.

>Nota: O token de link é realmente um segredo. Qualquer pessoa que tenha o token pode vincular ao seu namespace. Certifique-se de que apenas aqueles em quem você confia tenham acesso a ele. Porém sua utilização pode ser controlada por número de usos e tempo de vida. Veja a documentação do skupper [1] para mais detalhes.

#### 6.1. Criando o token no _namespace_ `config_oeste`:

```bash
skupper token create ~/secret.token
Token written to ~/secret.token
```

#### 6.2. Fazendo o link no _namespace_ `config_leste` ao _namespace_ `config_oeste` com o token gerado:
```bash
skupper link create ~/secret.token
```

### 7. Fazendo o _deploy_ do _frontend_ e do _backend_:

7.1. Applicando o YAML para fazer o deploy do frontend no _namespace_ `config_oeste`:

```bash
kubectl create deployment frontend --image quay.io/skupper/hello-world-frontend
deployment.apps/frontend created
```

7.2. Applicando o YAML para fazer o deploy do backend no _namespace_ `config_leste`:

```bash
kubectl create deployment backend --image quay.io/skupper/hello-world-backend --replicas 3
deployment.apps/backend created
```

### 8. Expondo os serviços de _backend_:

Agora que os serviços estão rodando, vamos expor os serviços para que possamos acessá-los. Nesse caso, vamos expor o serviço de _backend_ para que o _frontend_ possa acessá-lo, independente de onde ele esteja rodando.

8.1. Expondo o serviço de _backend_ no _namespace_ `config_leste`:

```bash
skupper expose deployment/backend --port 8080
deployment backend exposed as backend
```

### 9. Expondo os serviços de _frontend_:

Agora que os serviços estão rodando, vamos expor os serviços para que possamos acessá-los. Nesse caso, vamos expor o serviço de _frontend_ para que possamos acessá-lo, independente de onde ele esteja rodando.

9.1. Expondo o serviço de _frontend_ no _namespace_ `config_oeste`:

```bash
skupper expose deployment/backend --port 8080
service/frontend exposed
```

### 10. Testando a aplicação:

Agora que os serviços estão rodando, vamos testar a aplicação. Nesse caso, vamos acessar o serviço de _frontend_ e verificar se ele consegue acessar o serviço de _backend_. Para isso, vamos fazer uma chamada para o endpoint `/api/health` do serviço de _frontend_ e verificar se ele consegue acessar o serviço de _backend_.

10.1.`config_oeste`:

```bash
kubectl get service/frontend
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
frontend   LoadBalancer   10.103.232.28   <external-ip>   8080:30407/TCP   15s

curl http://<external-ip>:8080/api/health
OK
```

### 11. Apagando tudo:

Pronto! Agora que você já testou o Skupper, vamos apagar tudo para que você possa testar novamente ou fazer outras experiências.

11.1. Apagando tudo no _namespace_ `config_oeste`:

```bash
skupper delete
kubectl delete service/frontend
kubectl delete deployment/frontend
```
11.2. Apagando tudo no _namespace_ `config_leste`:

```bash
skupper delete
kubectl delete deployment/backend
```

## Resumo

Este exemplo localiza os serviços de front-end e back-end em namespaces diferentes, em clusters diferentes. Normalmente isso significa que eles não tem como se comunicar, a menos que sejam expostos à Internet pública.

A introdução do Skupper em cada namespace nos permite criar uma rede de aplicativos virtuais que pode conectar serviços em diferentes clusters. Qualquer serviço exposto na rede de aplicativos é representado como um serviço local em todos os namespaces vinculados.

O serviço de back-end está localizado no leste, mas o serviço de front-end no oeste pode "vê-lo" como se fosse local. Quando o front-end envia uma solicitação ao back-end, o Skupper encaminha a solicitação para o namespace em que o back-end está sendo executado e roteia a resposta de volta ao front-end.

Nâo foi necessário expor o serviço de back-end à Internet pública. O Skupper criou uma rede de aplicativos que conecta os serviços em diferentes clusters. O serviço de back-end está localizado no leste, mas o serviço de front-end no oeste pode "vê-lo" como se fosse local. Quando o front-end envia uma solicitação ao back-end, o Skupper encaminha a solicitação para o namespace em que o back-end está sendo executado e roteia a resposta de volta ao front-end.

Nenhuma VPN ou conexão Layer 3 foi necessária. O Skupper cria uma rede de aplicativos que conecta os serviços em diferentes clusters. O serviço de back-end está localizado no leste, mas o serviço de front-end no oeste pode "vê-lo" como se fosse local. Quando o front-end envia uma solicitação ao back-end, o Skupper encaminha a solicitação para o namespace em que o back-end está sendo executado e roteia a resposta de volta ao front-end.
