---
layout: post
title: "Expondo seu modelo local de AI para Internet"
date: 2025-05-02
categories: [AI, Internet]
tags: [AI, Internet, Exposição, Modelo Local]
---

## A história por trás deste padrão de solução

A crescente demanda por aplicações orientadas por IA apresenta um desafio único: como implantar e operar modelos de IA com segurança em ambientes que exigem proteção estrita de dados, ao mesmo tempo em que expõe esses modelos a serviços voltados para o público. Essa necessidade tornou-se evidente durante o desenvolvimento de um chatbot de IA local que lidaria com dados sensíveis e proprietários, exigindo uma solução onde o modelo pudesse ser mantido dentro de um ambiente protegido.

Aproveitando o **Red Hat Service Interconnect (RHSI)**, a equipe desenvolveu um padrão onde os modelos de IA, servidos via **InstructLab**, são isolados dentro da infraestrutura privada, mas expostos através de conexões seguras em ambientes **OpenShift** públicos. O objetivo era manter um controle estrito sobre a segurança dos dados e do modelo, ao mesmo tempo em que fornecia a flexibilidade para escalar e atender às solicitações dos usuários externamente.

Este padrão de solução nasceu da necessidade de equilibrar segurança, desempenho e acessibilidade, particularmente para organizações que buscam adotar estratégias de nuvem híbrida. Ao usar o \*Red Hat Service Interconnect** para integrar a solução de IA, a equipe permitiu uma comunicação contínua entre ambientes privados e públicos sem sacrificar a proteção de dados ou a eficiência operacional.

Essa arquitetura garante que as empresas possam continuar a inovar em IA e aprendizado de máquina, ao mesmo tempo em que aderem aos padrões de conformidade e segurança, tornando-a ideal para setores como saúde, finanças e qualquer domínio onde a segurança de dados é fundamental.

# A Solução

**Resumo da Solução**

Este padrão de solução demonstra como implantar e servir com segurança um chatbot de IA local usando o **Red Hat Service Interconnect** e o **InstructLab**. A arquitetura permite o treinamento e a veiculação de modelos de IA em um ambiente protegido, garantindo que os dados confidenciais permaneçam seguros, ao mesmo tempo em que expõe o serviço de chatbot para usuários públicos por meio de um ambiente OpenShift.

Os principais componentes da solução incluem:

-   **InstructLab** para gerenciar e servir modelos de IA dentro de uma infraestrutura segura e privada.
    
-   **Red Hat Service Interconnect (RHSI)** e **Skupper** para estabelecer uma comunicação segura e contínua entre sites isolados e ambientes públicos.
    
-   Uma **Rede Virtual de Aplicações (VAN)** que conecta com segurança dois sites: um site privado que hospeda o modelo de IA e um site OpenShift público que expõe o serviço de chatbot para usuários externos.

## Arquitetura

Esta arquitetura descreve uma solução para implantar com segurança um chatbot de IA local usando o **InstructLab** e o **Skupper**, garantindo a privacidade dos dados e a comunicação contínua entre ambientes isolados. O modelo é hospedado em um ambiente privado, e o serviço é exposto por meio de uma implantação pública do OpenShift, permitindo o acesso externo enquanto protege os dados e modelos subjacentes.

Os principais elementos incluem:

-   **InstructLab** para hospedar, treinar e servir o modelo de IA em um ambiente seguro.
    
-   **Red Hat Service Interconnect (RHSI)** combinado com **Skupper** para criar uma **Rede Virtual de Aplicações (VAN)** entre sites privados e públicos, permitindo uma comunicação segura.
    
-   **OpenShift** para expor o chatbot a usuários externos, mantendo a escalabilidade e a conectividade segura ao modelo.
    

**IMPORTANTE:** Esta solução permite a comunicação segura entre serviços hospedados em diferentes ambientes usando o **Skupper** e o **Red Hat Service Interconnect**, garantindo a privacidade dos dados e a veiculação segura do modelo.

### Diagrama da Arquitetura

![Visão Geral da Arquitetura](instructlab_architecture.jpg)

## Desafios Comuns

1.  **Hospedagem Segura de Modelos**: Proteger modelos de IA sensíveis, permitindo ao mesmo tempo acesso externo controlado.
    
2.  **Conectividade Híbrida**: Facilitar a comunicação entre ambientes privados e públicos sem comprometer a segurança.
    
3.  **Privacidade de Dados**: Garantir que os dados privados permaneçam em um ambiente protegido, ao mesmo tempo em que fornece respostas de IA em tempo real para usuários externos.

## Conjunto de Tecnologias

-   **Produtos suportados pela Red Hat**
    
    -   [Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift)
        
        O Red Hat OpenShift é uma plataforma de contêineres baseada em Kubernetes que permite aos desenvolvedores construir, implantar e gerenciar aplicações em contêineres. Ele fornece uma plataforma robusta para escalar e automatizar aplicações em ambientes de nuvem híbrida, garantindo confiabilidade e segurança.
        
    -   [Red Hat Service Interconnect (RHSI)](https://www.redhat.com/en/technologies/cloud-computing/service-interconnect)
        
        O Red Hat Service Interconnect (RHSI) permite a comunicação segura entre serviços em diferentes ambientes. Usando uma Rede Virtual de Aplicações (VAN), ele garante que os serviços em ambientes de nuvem privada, pública e híbrida possam interagir perfeitamente sem expor dados sensíveis diretamente.
        
    -   [InstructLab](https://instructlab.ai/)
        
        InstructLab é uma plataforma de modelo de IA que simplifica o processo de treinamento, serviço e gerenciamento de grandes modelos de linguagem. Ele foi projetado para ser flexível e seguro, tornando-o ideal para ambientes onde os modelos precisam permanecer privados, mas ainda atender a solicitações externas por meio de caminhos de acesso controlados.
        
    -   [Podman](https://www.podman.io/)
        
        Podman é um mecanismo de contêineres que permite aos usuários gerenciar contêineres sem a necessidade de um daemon. Ele fornece um ambiente seguro e leve para executar contêineres, tornando-o ideal para implantar modelos e serviços de IA em ambientes isolados.
        
    -   [Skupper](https://skupper.io/)
        
        Skupper é uma plataforma de mensagens distribuídas e seguras que permite a comunicação entre serviços em diferentes ambientes. Ele cria uma sobreposição de rede segura que permite que os serviços interajam sem expor dados sensíveis diretamente, garantindo a privacidade dos dados e a comunicação segura. Usaremos a versão cli do Skupper para criar uma conexão segura entre os ambientes privado e público.

## Uma visão detalhada da arquitetura da solução

Esta arquitetura é baseada em uma configuração híbrida onde o modelo de IA é treinado e servido via **InstructLab** em um ambiente privado (Ambiente Local Privado) e só pode ser acessado por usuários externos através de um site **OpenShift** público (Openshift Cluster), usando **Skupper** para comunicação segura. O **Red Hat Service Interconnect (RHSI)** garante que os dados trocados entre esses dois ambientes permaneçam seguros, criando uma **Rede Virtual de Aplicações (VAN)** entre os sites.

O **Ambiente Local Privado** hospeda o modelo de IA usando InstructLab e é responsável por:

-   Receber a entrada do usuário exclusivamente do Openshift Cluster (OpenShift).
    
-   Enviar a entrada para o modelo LLaMA3 para processamento.
    
-   Retornar a resposta do modelo para o Openshift Cluster com segurança.
    

O **Openshift Cluster** (OpenShift) serve como o único ponto de acesso para clientes externos e é responsável por:

-   Expor o chatbot de IA para usuários externos.
    
-   Enviar solicitações para o modelo InstructLab privado no Ambiente Local Privado.
    
-   Exibir a resposta da IA do modelo hospedado no Ambiente Local Privado.
    

Por design, o modelo em execução no ambiente privado (Ambiente Local Privado) é isolado e não pode ser acessado diretamente por clientes externos. Todas as interações com o modelo são mediadas pelo **OpenShift** (Openshift Cluster), garantindo um caminho de acesso seguro e controlado.

## Sobre o Conjunto de Tecnologias

Esta solução usa o **Red Hat Service Interconnect (RHSI)** e o **InstructLab** para proteger a implantação do modelo de IA. O **OpenShift** garante o dimensionamento flexível do serviço de chatbot, enquanto o **Skupper** permite uma comunicação contínua e segura entre os sites isolados, criando um ambiente de nuvem híbrida robusto para aplicações orientadas por IA.

= Veja a Solução em Ação

## Demonstração

Referências:

* [Comandos extraídos do projeto InstructLab](https://github.com/instructlab)
* [Primeiros passos com o InstructLab: Ajuste de modelo de IA generativo](https://developers.redhat.com/blog/2024/06/12/getting-started-instructlab-generative-ai-model-tuning#model_alignment_and_training_with_instructlab)
* [Guia de instalação do InstructLab](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)
* [Chatbot ILAB Frontend](https://github.com/rafaelvzago/ilab-client)
* [Red Hat Developer](https://developers.redhat.com)

### Conceitos e Comandos Usados na Demonstração

> NOTA Certifique-se de explicar o que cada comando Skupper faz na primeira vez que você o usa, especialmente para pessoas não familiarizadas com o Skupper. Os seguintes comandos devem ser explicados:
>
> **`skupper init`**: Inicializa a rede Skupper, configurando os componentes necessários para habilitar a comunicação segura entre os serviços. 
>   
> **`skupper expose`**: Expõe um serviço local através da rede Skupper, permitindo que ele seja acessado a partir de outros sites conectados ao Skupper. 
>   
> **`skupper token`**: Gera um token de conexão que pode ser usado por outros sites para se conectar à rede Skupper, garantindo uma comunicação segura. 
>   
> **`skupper link`**: Estabelece um link seguro entre dois sites Skupper usando o token criado por `skupper token`. 
>   
> **`skupper service status`**: Exibe o status dos serviços expostos através do Skupper, mostrando o que está acessível e como está conectado dentro da rede. 
>   
> **`ilab download`**: Baixa o modelo a ser usado pelo chatbot. 
>   
> **`ilab model serve`**: Inicia o servidor que será responsável por receber a entrada do usuário, enviá-la para o modelo LLaMA3 e enviar a resposta de volta ao usuário. 
>   
> **`ilab model chat`**: Inicia o chatbot, permitindo que o usuário interaja com ele. 

### Executar a demonstração

#### Antes de começar

Para configurar a demonstração, você precisa ter os seguintes pré-requisitos:

* Acesso a um cluster OpenShift com o Skupper e o InstructLab instalados.     

* Um servidor executando o modelo de chat do InstructLab.     

* Acesso a um terminal para executar os comandos. 
    
* Acesso a um navegador da web para interagir com o chatbot. 
    
* Cliente oc instalado e configurado para acessar o cluster OpenShift.     

* Cliente skupper instalado e configurado para acessar o cluster OpenShift. 
    
* Podman instalado para executar o Skupper privado. 

#### Implantação do Modelo de IA com o InstructLab

O primeiro passo é implantar o modelo de chat do InstructLab no site do InstructLab. O modelo de chat do InstructLab será responsável por receber a entrada do usuário e enviá-la para o modelo LLaMA3. A resposta do modelo LLaMA3 será enviada de volta ao usuário. Isso é baseado no artigo: https://developers.redhat.com/blog/2024/06/12/getting-started-instructlab-generative-ai-model-tuning#model_alignment_and_training_with_instructlab \[Primeiros passos com o InstructLab para ajuste de modelo de IA generativo]. 

```bash
mkdir instructlab \&\& cd instructlab
sudo dnf install gcc gcc-c++ make git python3.11 python3.11-devel
python3.11 -m venv --upgrade-deps venv
source venv/bin/activate
pip install instructlab
```

> NOTA
> 
> O comando `mkdir instructlab && cd instructlab` é usado para criar um diretório chamado `instructlab` e navegar até ele.
>   
> O comando `sudo dnf install gcc gcc-c++ make git python3.11 python3.11-devel` é usado para instalar as dependências necessárias para o InstructLab.
>   
> O comando `python3.11 -m venv --upgrade-deps venv` é usado para criar um ambiente virtual chamado `venv` para o InstructLab.
>   
> O comando `source venv/bin/activate` é usado para ativar o ambiente virtual.
>   
> O comando `pip install instructlab` é usado para instalar o InstructLab no ambiente virtual.

#### Inicializar a Configuração do InstructLab

Agora é hora de inicializar a configuração do InstructLab. O comando `ilab config init` é usado para inicializar a configuração do InstructLab, criando o arquivo `config.yaml` com a configuração padrão. Execute o seguinte comando:

```bash
ilab config init
```

A saída será semelhante à seguinte, com o usuário sendo solicitado a fornecer os valores necessários para inicializar o ambiente:

```bash
Welcome to InstructLab CLI.
This guide will help you to setup your environment.
Please provide the following values to initiate the environment \[press Enter for defaults]:
Path to taxonomy repo \[\/home\/user\/.local\/share\/instructlab\/taxonomy]:
Path to your model \[\/home\/user\/.cache\/instructlab\/models\/merlinite-7b-lab-Q4_K_M.gguf]:
Generating \`\/home\/user\/.config\/instructlab\/config.yaml\` and \`\/home\/user\/.local\/share\/instructlab\/internal\/train_configuration\/profiles\`...
Please choose a train profile to use.
Train profiles assist with the complexity of configuring specific GPU hardware with the InstructLab Training library.
You can still take advantage of hardware acceleration for training even if your hardware is not listed.
\[0] No profile (CPU, Apple Metal, AMD ROCm)
\[1] Nvidia A100\/H100 x2 (A100_H100_x2.yaml)
\[2] Nvidia A100\/H100 x4 (A100_H100_x4.yaml)
\[3] Nvidia A100\/H100 x8 (A100_H100_x8.yaml)
\[4] Nvidia L40 x4 (L40_x4.yaml)
\[5] Nvidia L40 x8 (L40_x8.yaml)
\[6] Nvidia L4 x8 (L4_x8.yaml)
Enter the number of your choice \[hit enter for no profile] \[0]:
No profile selected - any hardware acceleration for training must be configured manually.
Initialization completed successfully, you're ready to start using \`ilab\`.
Enjoy!
```

> NOTA
> 
> O comando `ilab config init` é usado para inicializar a configuração do InstructLab, criando o arquivo `config.yaml` com a configuração padrão.
>   
> O usuário é solicitado a fornecer os valores necessários para inicializar o ambiente, como o caminho para o repositório de taxonomia e o caminho para o modelo.
>   
> Após executar o `ilab config init`, seus diretórios serão semelhantes aos seguintes em um sistema Linux:


##### Arquivos e diretórios criados:

```bash
 ~/.cache/instructlab/models/           # Diretório onde os modelos são armazenados. 
 ~/.local/share/instructlab/datasets    # Diretório onde os conjuntos de dados são armazenados. 
 ~/.local/share/instructlab/taxonomy    # Diretório onde a taxonomia é armazenada.
 ~/.local/share/instructlab/checkpoints # Diretório onde os checkpoints são armazenados. 
```

Para habilitar o acesso externo ao seu modelo, modifique o arquivo `config.yaml`, localizado no seu diretório `instructlab`: ~/.config/instructlab/config.yaml.  Essa alteração precisa ser feita na seção `serve`, conforme mostrado abaixo: 

```yaml
host_port: 0.0.0.0:8000
```

> NOTA
> 
> O `host_port:` O endereço IP e a porta onde o modelo será exposto. 
>     
> Neste caso, o modelo será exposto em todas as interfaces. 

Antes de iniciar o servidor, baixe o modelo a ser usado pelo chatbot.  O comando `ilab download` é usado para baixar o modelo a ser usado pelo chatbot.  Execute o seguinte comando: 

```bash
ilab model download
```

> NOTA
> 
> O comando `ilab download` é usado para baixar o modelo a ser usado pelo chatbot. 
> 
> Agora, inicie o servidor que será responsável por receber a entrada do usuário, enviá-la para o modelo e enviar a resposta de volta ao usuário.  O comando `ilab model serve` é usado para iniciar o servidor.  Execute o seguinte comando: 

```bash
ilab model serve
```

> NOTA
> 
> O comando `ilab model serve` é usado para iniciar o servidor que será responsável por receber a entrada do usuário, enviá-la para o modelo e enviar a resposta de volta ao usuário. 

### Implantação do Skupper Público

Implante o Skupper público no Openshift Cluster.  O Skupper público receberá a conexão do Skupper privado e criará uma conexão segura entre os dois sites. 

#### Criando o projeto e implantando o Skupper público:

Esta é a etapa em que você cria o projeto e implanta o Skupper público.  O Skupper público será responsável por receber a conexão do Skupper privado e criar uma conexão segura entre os dois sites.  Abra um novo terminal e execute os seguintes comandos: 

```bash
export SKUPPER_PLATFORM=kubernetes
oc new-project ilab-pilot
skupper init --enable-console --enable-flow-collector --console-user admin --console-password admin
```

**IMPORTANTE:**

* Execute este comando em um novo terminal e mantenha-o aberto, porque a plataforma padrão é `kubernetes` e o terminal privado está usando `podman`. 

> NOTA
> 
> `SKUPPER_PLATFORM=kubernetes` é usado para definir a plataforma como Kubernetes.  Isso é necessário porque o Skupper público será executado em um cluster Kubernetes. 
>   
> `oc new-project ilab-pilot` é usado para criar um novo projeto chamado `ilab-pilot` no cluster OpenShift. 
>   
> `skupper init` é usado para inicializar a rede Skupper, configurando os componentes necessários para habilitar a comunicação segura entre os serviços. 
>   
> O sinalizador `--enable-console` é usado para habilitar o console Skupper, que fornece uma interface web para gerenciar a rede Skupper. 
>   
> O sinalizador `--enable-flow-collector` é usado para habilitar o coletor de fluxo, que coleta e exibe informações sobre o tráfego que flui através da rede Skupper. 
>   
> O sinalizador `--console-user admin` é usado para definir o nome de usuário do console Skupper como `admin`. 
>   
> O sinalizador `--console-password admin` é usado para definir a senha do console Skupper como `admin`. 

#### Criando o token para permitir que o Skupper privado se conecte ao Skupper público:

Esta é a etapa em que você cria o token para permitir que o Skupper privado se conecte ao Skupper público.  No mesmo terminal, execute o seguinte comando: 

```bash
skupper token create token.yaml
```

> NOTA
> 
> `skupper token create token.yaml` é usado para gerar um token de conexão que pode ser usado por outros sites para se conectar à rede Skupper, garantindo uma comunicação segura. 
>   
> O arquivo `token.yaml` conterá o token para conectar os dois sites. 

Agora, você terá um arquivo `token.yaml` com o token para conectar os dois sites. 

### Implantação do Skupper Privado

O segundo passo é implantar o Skupper privado no Ambiente Local Privado.  O Skupper privado será responsável por criar uma conexão segura entre os dois sites, permitindo que o aplicativo Ollama Pilot envie solicitações ao modelo de chat do InstructLab. 

#### Instalar o Skupper

Para instalar o skupper no site A, com o podman como plataforma, abra um novo terminal para lidar com todos os comandos relacionados ao Skupper privado.  Aqui, criaremos um site Skupper usando o podman como plataforma, precisamos habilitar o serviço podman antes de executar o comando skupper init: 

```bash
systemctl --user enable --now podman.socket
```

> NOTA
> 
> `systemctl --user enable --now podman.socket` é usado para habilitar e iniciar o serviço podman no nível do usuário. 

Agora, execute os seguintes comandos para instalar o Skupper: 

```bash
export SKUPPER_PLATFORM=podman
skupper init --ingress none
```

> NOTA
> 
> `SKUPPER_PLATFORM=podman` é usado para definir a plataforma como podman.  Isso é necessário porque o Skupper privado será executado em um contêiner podman. 
>   
> `skupper init` é usado para inicializar a rede Skupper, configurando os componentes necessários para habilitar a comunicação segura entre os serviços. 
>   
> O sinalizador `--ingress none` é usado para desabilitar a criação automática de um controlador de entrada.  Isso é necessário porque o Skupper público será responsável por expor o serviço à internet. 

#### Expondo o Modelo de Chat do InstructLab

Para vincular o serviço local que executa o modelo de chat do InstructLab ao serviço Skupper: 

```bash
skupper expose host host.containers.internal --address instructlab --port 8000
```

> NOTA
> 
> `skupper expose` é usado para expor um serviço local através da rede Skupper, permitindo que ele seja acessado a partir de outros sites conectados ao Skupper. 
>   
> `host.containers.internal` é usado para vincular o serviço local ao serviço Skupper. 
>   
> `--address instructlab` é usado para especificar o endereço do serviço. 
>   
> `--port 8000` é usado para especificar a porta do serviço. 

Verifique o status do serviço Skupper: 

```bash
skupper service status

Services exposed through Skupper:
╰─ instructlab:8000 (tcp)
```

> NOTA
> 
> `skupper service status` é usado para exibir o status dos serviços expostos através do Skupper, mostrando o que está acessível e como está conectado dentro da rede. 

### Comunicação Segura Entre os Dois Sites com Skupper

Agora é hora de estabelecer uma conexão segura entre os dois sites usando o token criado pelo Skupper público.  Usando o token criado pelo Skupper público, execute o seguinte comando no terminal onde o Skupper privado está em execução: 

```bash
skupper link create token.yaml --name instructlab
```

> NOTA
> 
> `skupper link create token.yaml --name instructlab` é usado para estabelecer um link seguro entre dois sites Skupper usando o token criado por `skupper token`. 

Verifique o status do link Skupper: 

```bash
skupper link status

Links created from this site:

        Link instructlab is connected

Current links from other sites that are connected:

        There are no connected links
```

> NOTA
> 
> `skupper link status` é usado para exibir o status dos links criados pela rede Skupper, mostrando quais sites estão conectados e como estão conectados. 

Verifique o status no terminal do Skupper público: 

```bash
skupper link status

Links created from this site:

       There are no links configured or connected

Current links from other sites that are connected:

       Incoming link from site b8ad86d5-9680-4fea-9c07-ea7ee394e0bd
```

> NOTA
>
> `skupper link status` é usado para exibir o status dos links criados pela rede Skupper, mostrando quais sites estão conectados e como estão conectados. 

### Chatbot com Dados Protegidos

A última etapa é expor o serviço no Skupper público e criar o aplicativo Ollama Pilot. 

* Ainda no terminal onde o Skupper **público** está em execução, execute o seguinte comando para expor o serviço: 

```bash
skupper service create instructlab 8000
```

> NOTA
>
> `skupper service create instructlab 8000` é usado para criar o serviço no Skupper público, permitindo que ele seja acessado a partir do Skupper privado. 

### Implantando o Chatbot InstructLab

Antes de executar o chatbot, vamos entender a parte final desta solução, o aplicativo Frontend.  Este aplicativo será implantado em um cluster OpenShift e será responsável por enviar a entrada do usuário para o modelo de chat do InstructLab e exibir a resposta para o usuário.  O aplicativo será implantado no mesmo namespace onde o Skupper público está em execução. 

**IMPORTANTE:**

* O aplicativo frontend chamado ILAB Frontend chatbot usará o serviço local no cluster público para enviar a entrada do usuário para o modelo de chat do InstructLab e exibir a resposta para o usuário.  Veja a linha 23 do arquivo `ilab-client-deployment.yaml`. 

#### Implantar o chatbot ILAB Frontend

Para implantar o chatbot ILAB Frontend, vamos usar o seguinte arquivo de implantação yaml, neste caso o arquivo está localizado em `~/instructlab/ilab-client-deployment.yaml`: 

```yaml
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: ilab-client
spec:
  replicas: 1
  selector:
    app: ilab-client
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: ilab-client
    spec:
      containers:
      - name: ilab-client-container
        image: quay.io\/rzago\/ilab-client:latest
        ports:
        - containerPort: 5000
        env:
        - name: ADDRESS
          value: "http:\/\/instructlab:8000" # O endereço do modelo de chat do InstructLab conectado ao Skupper privado
  triggers:
  - type: ConfigChange
```

Aplique o arquivo de implantação: 

```bash
oc apply -f ~\/\/instructlab\/ilab-client-deployment.yaml
```

> NOTA
> 
> O arquivo `ilab-client-deployment.yaml` é usado para implantar o chatbot ILAB Frontend, que será responsável por enviar a entrada do usuário para o modelo de chat do InstructLab e exibir a resposta para o usuário. 
>   
> A variável de ambiente `ADDRESS` é usada para especificar o endereço do modelo de chat do InstructLab conectado ao Skupper privado. 
>   
> O comando `oc apply -f ~/instructlab/ilab-client-deployment.yaml` é usado para aplicar o arquivo de implantação e implantar o chatbot ILAB Frontend. 

#### Criando o serviço da implantação do chatbot ILAB Frontend

Agora, vamos criar o serviço para a implantação do chatbot ILAB Frontend, o arquivo está localizado em `~/instructlab/ilab-client-service.yaml`: 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ilab-client-service
spec:
  selector:
    app: ilab-client
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
```

Aplique o arquivo de serviço: 

```bash
oc apply -f ~/instructlab/ilab-client-service.yaml
```

> NOTA
> 
> O arquivo `ilab-client-service.yaml` é usado para criar o serviço para a implantação do chatbot ILAB Frontend. 
>     
> O comando `oc apply -f ~/instructlab/ilab-client-service.yaml` é usado para aplicar o arquivo de serviço e criar o serviço para a implantação do chatbot ILAB Frontend. 

### Expondo o serviço da implantação do chatbot ILAB Frontend

Estamos quase lá, agora vamos expor o serviço da implantação do chatbot ILAB Frontend, o arquivo está localizado em `~/instructlab/ilab-client-route.yaml`: 

```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: ilab-client-route
spec:
  to:
    kind: Service
    name: ilab-client-service
  port:
    targetPort: 5000
```

Aplique o arquivo de rota: 

```bash
oc apply -f ~/instructlab/ilab-client-route.yaml
```

> NOTA
> 
> O arquivo `ilab-client-route.yaml` é usado para expor o serviço da implantação do chatbot ILAB Frontend. 
>   
> O comando `oc apply -f ~/instructlab/ilab-client-route.yaml` é usado para aplicar o arquivo de rota e expor o serviço da implantação do chatbot ILAB Frontend. 

#### Acessando o chatbot ILAB Frontend

Finalmente, para acessar o chatbot ILAB Frontend, você pode usar o seguinte comando para obter o URL público: 

```bash
oc get route ilab-client-route
```

> NOTA
>
> O comando `oc get route ilab-client-route` é usado para obter o URL público do chatbot ILAB Frontend, que será usado para acessar o chatbot a partir do aplicativo Ollama Pilot.
