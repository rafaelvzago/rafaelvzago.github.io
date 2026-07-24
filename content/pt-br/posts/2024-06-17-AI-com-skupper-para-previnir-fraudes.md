---
title: "OpenShift AI e Skupper: prevenção de fraude em seguros"
description: "Workshop hands-on que conecta dados locais sensíveis a ambientes de AI/ML na nuvem com Skupper e OpenShift AI, usando LLMs na análise de sinistros de seguros."
date: 2024-06-17
slug: "AI-com-skupper-para-previnir-fraudes"
tags: [ai, machine-learning, skupper, openshift, fraud-detection, insurance, networking, security]
toc: true
images:
  - "/assets/img/headers/AI-com-skupper-para-previnir-fraudes.webp"
---

![](/assets/img/headers/AI-com-skupper-para-previnir-fraudes.webp)

## Descrição

Este workshop mostra como usar Skupper para conectar serviços de dados locais a ambientes de AI/ML na nuvem. Inclui uma aplicação Go em um container podman que expõe dados internos para conexão via Skupper. O treinamento do modelo AI/ML roda em um cluster OpenShift AI na AWS, usando os serviços de OpenShift AI/ML.


## Aviso

Este lab usa o exemplo do [AI/ML Workshop](https://github.com/rh-aiservices-bu/insurance-claim-processing) criado pelo time Red Hat AI Services. O workshop original está no GitHub e traz tudo o que é preciso para rodar o lab. A adaptação aqui usa Skupper para ligar os serviços de dados locais ao ambiente de AI/ML na nuvem.

Para facilitar a execução, quem tem acesso ao ambiente [demo.redhat.com](https://demo.redhat.com) pode iniciar o lab [por aqui](https://demo.redhat.com/catalog?search=insurance&item=babylon-catalog-prod%2Fsandboxes-gpte.ocp-wksp-ai-insurance-claim.prod). Sem acesso ao demo, siga os passos no repositório do GitHub citado acima.


## Referências

- [Red Hat AI/ML Workshop](https://github.com/rh-aiservices-bu/insurance-claim-processing/tree/main)
- [GO Application to expose internal data](https://github.com/rafaelvzago/go-flp)
- [Modified examples for the workshop](https://github.com/rafaelvzago/insurance-claim-processing)
- [The Developers Conference Workshop Repository](https://github.com/rafaelvzago/tdc-floripa-2024)
- [Skupper](https://skupper.io/)



## Visão geral do workshop

![Solution](/assets/ai-skupper-solution.png)

Este lab mostra como tecnologias de AI/ML podem resolver um problema de negócio. As informações, o código e as técnicas ilustram uma solução protótipo. Os passos principais:

1. Guardar dados brutos de sinistros dentro da empresa.
2. Usar uma aplicação Go em um container podman para expor dados internos à conexão Skupper.
3. Configurar o treinamento do modelo AI/ML em um cluster OpenShift AI na AWS.
4. Conectar dados locais aos serviços de AI/ML na nuvem com Skupper.


## Papel do Skupper

![Skupper](/assets/ai-skupper.png)

Skupper oferece conexões seguras e eficientes entre ambientes diferentes. Neste workshop, ele liga serviços locais com informações sensíveis de sinistros a um ambiente de AI/ML na nuvem. Essa conexão permite acesso e processamento remotos sem abrir mão de integridade e segurança dos dados.

### Estrutura do processo

- Contexto
- Conexão e setup
- LLM para sumarização de texto
- LLM para extração de informação
- LLM para análise de sentimento

## Cenário

Somos uma seguradora multinacional em transformação digital. Um time pequeno analisou o processo de sinistros e propôs melhorias. O objetivo é integrar a solução de processamento de sinistros com análise de texto usando nossa API em um cluster Kubernetes na AWS.

## Desafios

### Usando Skupper para garantir segurança e integridade dos dados

1. Manter integridade e segurança: o Skupper criptografa todo o tráfego, protegendo dados sensíveis em trânsito.
2. Processar e-mails com OpenShift AI no datacenter on-premises.
3. Manter aplicações com dados sensíveis dentro da empresa.
4. Garantir conexões seguras entre serviços de dados e datacenters.

## Exemplos do trabalho de prototipagem

### Usando um LLM para sumarização de texto

Um LLM pode resumir e-mails longos, ajudando o regulador a entender rápido os pontos principais.

![text-summarization](/assets/ai-skupper-summarization.png)

### Usando um LLM para extração de informação

![information-extraction](/assets/ai-skupper-llm-info-extract.png)

Um LLM extrai informações-chave dos e-mails e preenche formulários estruturados automaticamente.

### Usando um LLM para análise de sentimento

Um LLM identifica o sentimento do cliente, permitindo ação rápida conforme o tom do texto.

![sentiment-analysis](/assets/ai-skupper-sentiment.png)

## Como usar LLMs?

- [Notebook for using LLM](https://github.com/rh-aiservices-bu/insurance-claim-processing/blob/main/lab-materials/03/03-01-nb-llm-example.ipynb)
- [Notebook for text summarization with LLM](https://github.com/rh-aiservices-bu/insurance-claim-processing/blob/main/lab-materials/03/03-02-summarization.ipynb)
- [Notebook for information extraction with LLM](https://github.com/rh-aiservices-bu/insurance-claim-processing/blob/main/lab-materials/03/03-03-information-extraction.ipynb)
- [Notebook for comparing LLM models](https://github.com/rh-aiservices-bu/insurance-claim-processing/blob/main/lab-materials/03/03-04-comparing-models.ipynb)

## Parte 2: Hands-on

### Atividades

0. Instalar o binário do Skupper
1. Instalar o Skupper localmente
2. Instalar o Skupper no cluster OpenShift
3. Linkar os sites
4. Rodar a aplicação no site podman e expor o serviço
5. Executar o workshop com os exemplos modificados

### Passos

0. Instalando o binário do Skupper
    ```sh
    curl https://skupper.io/install.sh | sh
    ```

1. Instalando Skupper no site podman
    ```sh
    export SKUPPER_PLATFORM=podman
    podman network create skupper
    skupper init --ingress none
    ```

2. Instalar Skupper no cluster OpenShift
    ```sh
    skupper init --enable-console --enable-flow-collector --console-user admin --console-password admin
    ```

3. Linkando os sites

    - Criando o token no cluster mais exposto
        ```sh
        skupper token create /tmp/insurance-claim
        ```
    - Linkando o site podman ao cluster mais exposto
        ```sh
        skupper link create /tmp/insurance-claim --name ai
        ```

4. Rodando a aplicação no site podman e expondo o serviço
    ```sh
    podman run -d --network skupper -p 8080:8080 -v /home/rzago/Code/go-flp/data:/app/data --name insurance-claim-data quay.io/rzago/insurance-claim-data:latest
    skupper service create backend 8080
    skupper service bind backend host insurance-claim-data --target-port 8080
    skupper service create backend 8080
    ```

### Conexão bem-sucedida

![Console](/assets/ai-skupper-successful-connection.png)

### Topologia final

![Topology](/assets/ai-skupper-final-topology.png)

Testando a conexão com o serviço do site podman a partir do cluster OpenShift
    
```sh
oc exec deploy/skupper-router -c router -- curl http://backend:8080/claim/claim1.json
```

## Próximos passos

Agora você pode seguir com o workshop até gerar os sentimentos dos e-mails.

## Conclusão

Este workshop mostra como usar Skupper para conectar serviços de dados locais a ambientes de AI/ML na nuvem. Inclui uma aplicação Go em um container podman que expõe dados internos para conexão via Skupper. O treinamento do modelo AI/ML roda em um cluster OpenShift AI na AWS, usando os serviços de OpenShift AI/ML.
