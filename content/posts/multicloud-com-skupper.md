+++
author = "Rafael Zago"
title = "Multicloud com o Skupper"
date = "2022-10-08"
description = "Como conectar projetos usando o SKUPPER e k8S"
tags = [
    "k8s",
    "skupper",
    "could",
    "Red Hat"
]
categories = [
    "could",
    "k8s",
]
series = ["Skupper"]
aliases = ["conhecendo-o-skupper"]
+++

## Referências

1. [https://skupper.io](https://skupper.io)
2. [https://minikube.sigs.k8s.io](https://minikube.sigs.k8s.io)
3. [Repositório com os Códigos](https://github.com)
4. [Qpid-dispatch](https://qpid.apache.org/components/dispatch-router/index.html)
5. [ActiveMQ](https://activemq.apache.org/)
6. [Kubeclt](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
7. [Exemplo em inglês - Hello World](https://github.com/skupperproject/skupper-example-hello-world)

## Ferramentas

* Um computador com o minikube [2] instalado.
* Um terminal para executar os comandos.
* `kubectl` > 1.15 [6] ou mais nova.


## Descriçao da solução

O Skupper [1] é uma ferramenta que permite conectar dois ou mais ambientes de cloud, de uma maneira não intrusiva e segura. Tais ambientes podem ser diferentes de provedores de serviço em núvem como: AWS, GCP, AZURE entre outras, e inclusive clusters kubernetes nativos.

_tl;dr_

O skupper utiliza o _qpid_dispatch_ [4] como software para trocar as mensagens entre os _namespaces_ ou _clusters_ e para isso, utiliza uma solição que chamamos de _service-controller_ que provê interfaces TCP e HTTP para as aplicações, transforma as mensagens em _activemq messages_ [5] e na "outra ponta" reverte tal conversão para que os dados sejam interpretados e processados.

Este exemplo é um aplicativo HTTP multisserviço muito simples implantado em clusters Kubernetes usando o Skupper.

![Example image](/hello-world-entities.svg)

Contém dois serviços:

* Um serviço de _backend_ que expõe um endpoint /api/hello. Ele retorna saudações no formato Oi, `<seu-nome>`. Eu sou `<meu-nome> (<nome-pod>)`.

* Um serviço de _frontend_ que envia saudações ao back-end e busca novas saudações em resposta.

Com o Skupper, você pode colocar o back-end em um cluster e o front-end em outro e manter a conectividade entre os dois serviços sem expor o back-end à Internet pública.


_Detalhes:_
1. Não é necessário ter privilégios de administrador do cluster, já que a solução é no nível do _namespace_.
2. Não é intrusivo com a sua aplicação, pois não cria _side-cars_ ou outros containers dentro dos _Pods_.
3. É _open-source_.
4. Você pode conectar, em seu _cluster_, serviços externos como: Bancos de dados, aplicações legadas e ainda de alta criticidade.
5. Criptografado de ponta a ponta usando certificados digitais.
6. Baixa curva de aprenddizagem.


Agora vamos preparar nosso ambiente de teste, que consiste no seguinte:
* Um serviço de _backend_ que está rodando em um _namespace_ que vai prover a lógica para outro serviço de _frontend_ que obviamente está e outro _namespace_*.
    * Nesse caso, cada serviço está rodando em _namespaces_ diferentes, mas o mesmo exemplo pode (e deve) ser testado com provedores diferentes.


## Preparando o ambiente

#### 1. Nesse exemplo vamos utilizar dois _namespaces_ chamados: 
1.1. `config_oeste` onde ficará o _frontend_. Lembre-se de abrir uma aba do seu terminal para cada _namespace_
```bash
export KUBECONFIG=~/.kube/config-oeste
```  
1.2.  `config_leste` onde ficará o _backend_ agora, no outro terminal:
```bash
export KUBECONFIG=~/.kube/config-leste
```
#### 2. Configurando cada _namespace_:
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
#### 3. Instalando o Skupper:

Você possui algumas maneiras de instalar o skupper, como por exemplo:
* Compilar a partir do repositório
* Fazer o [_download_ do executável direto do repositório [1] do projeto](https://github.com/skupperproject/skupper-example-hello-world/archive/refs/heads/main.zip)
* Usar o _script_ de instalação disponibilizado pelo site [skupper.io](skupper.io) e vamos utilizar esse método, por ser mais fácil de fazer e você não precisará se preocupar com dependências.

#### 4. Instaçação

* É bem simples: 
    ```bash
    curl https://skupper.io/install.sh | sh
    ```

#### 5. Iniciando o skupper nos dois _namespaces_:
5.1.`config_oeste`:
```bash
skupper init
```
5.2.`config_leste`:
```bash
skupper init
```

#### 6. Conecando os namespaces:
A criação de um link requer o uso de dois comandos skupper em conjunto, skupper token create e skupper link create.

O comando skupper token create gera um token secreto que significa permissão para criar um link. O token também carrega os detalhes do link. Em seguida, em um namespace remoto, o comando skupper link create usa o token para criar um link para o namespace que o gerou.

Nota: O token de link é realmente um segredo. Qualquer pessoa que tenha o token pode vincular ao seu namespace. Certifique-se de que apenas aqueles em quem você confia tenham acesso a ele.

Primeiro, use `skupper token create` em um namespace para gerar o token. Em seguida, use `skupper link create` no outro para criar um link.
6.1.`config_oeste`:
```bash
skupper token create ~/secret.token
Token written to ~/secret.token
```
6.2.`config_leste`:
```bash
skupper link create ~/secret.token
```

#### 7. Fazendo o _deploy_ do _frontend_ e do _backend_:
7.1.`config_oeste`:
```bash
kubectl create deployment frontend --image quay.io/skupper/hello-world-frontend
deployment.apps/frontend created
```
7.2.`config_leste`:
```bash
kubectl create deployment backend --image quay.io/skupper/hello-world-backend --replicas 3
deployment.apps/backend created
```

#### 8. Expondo os serviços de _backend_:
8.1.`config_leste`:
```bash
skupper expose deployment/backend --port 8080
deployment backend exposed as backend
```

#### 9. Expondo os serviços de _frontend_:
9.1.`config_oeste`:
```bash
skupper expose deployment/backend --port 8080
service/frontend exposed
```

#### 10. Testando a aplicação:
10.1.`config_oeste`:
```bash
kubectl get service/frontend
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
frontend   LoadBalancer   10.103.232.28   <external-ip>   8080:30407/TCP   15s

curl http://<external-ip>:8080/api/health
OK
```

#### 11. Apagando tudo:
11.1.`config_oeste`:
```bash
skupper delete
kubectl delete service/frontend
kubectl delete deployment/frontend
```
11.2.`config_leste`:
```bash
skupper delete
kubectl delete deployment/backend
```

### Resumo
Este exemplo localiza os serviços de front-end e back-end em namespaces diferentes, em clusters diferentes. Normalmente, isso significa que eles não têm como se comunicar, a menos que sejam expostos à Internet pública.

A introdução do Skupper em cada namespace nos permite criar uma rede de aplicativos virtuais que pode conectar serviços em diferentes clusters. Qualquer serviço exposto na rede de aplicativos é representado como um serviço local em todos os namespaces vinculados.

O serviço de back-end está localizado no leste, mas o serviço de front-end no oeste pode "vê-lo" como se fosse local. Quando o front-end envia uma solicitação ao back-end, o Skupper encaminha a solicitação para o namespace em que o back-end está sendo executado e roteia a resposta de volta ao front-end.