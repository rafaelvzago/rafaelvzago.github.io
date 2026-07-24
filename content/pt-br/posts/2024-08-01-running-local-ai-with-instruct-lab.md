---
title: "InstructLab e Skupper: IA local sem expor seus dados"
description: "Tutorial prático de como ligar um modelo InstructLab local a um cluster OpenShift com Skupper, criando um chatbot seguro com dados protegidos entre sites."
date: 2024-08-01
slug: "running-local-ai-with-instruct-lab"
tags: [ai, instructlab, skupper, llm, chatbot, machine-learning, openshift, local-ai, security]
toc: true
images:
  - "/assets/img/headers/instructlab_workshop-skupper-patient-portal.jpg"
---

![](/assets/img/headers/instructlab_workshop-skupper-patient-portal.jpg)

## Bem-vindo ao Ollama Pilot

## Problema a resolver

![contest](/assets/instructlab_banner.jpg)

O objetivo principal deste projeto é criar uma conexão segura entre dois sites, permitindo a comunicação entre a máquina do engenheiro e um modelo Instruct Lab. O modelo merlinite-7b-lab-Q4_K_M.gguf será usado no chatbot e está disponível no Instruct Lab. A licença do modelo está em [Instruct Labs](https://instructlab.ai/).

E por que o banner? Porque o engenheiro precisa saber quem é melhor: LeBron ou Jordan. O chatbot responde a essa pergunta: recebe o input do usuário, envia ao modelo e devolve a resposta do merlinite.

## Aviso

> Todos os modelos usados estão disponíveis no Hugging Face model hub. Eles não são hospedados neste projeto — ficam no Hugging Face. O uso aqui é apenas educacional.

## Por que InstructLab

Há muitos projetos abraçando e estendendo modelos de IA com licença permissiva, mas eles esbarram em três desafios principais:

- Não dá para contribuir diretamente nos LLMs. Surgem forks, e o consumidor precisa escolher um modelo “best-fit” que não é fácil de estender. Manter esses forks também é caro para quem cria o modelo.
- Contribuir ideias fica limitado pela falta de expertise em AI/ML. É preciso aprender a fazer fork, treinar e refinar modelos só para ver a ideia avançar. A barreira de entrada é alta.
- Não há governança comunitária direta nem boas práticas claras de review, curadoria e distribuição desses forks.

Este trecho veio do repositório [Instruct Labs](https://github.com/instructlab).

## Por que Skupper

![Skupper](/assets/instructlab_skupper.png)

Aqui a resposta é direta: Skupper habilita comunicação segura entre serviços em ambientes diferentes. Usamos Skupper para criar a conexão entre os dois sites — um deles com acesso restrito à internet — permitindo que a aplicação Ollama Pilot envie requests ao modelo via chat do Instruct Lab.

## Descrição

O projeto cria uma VAN (Virtual Application Network) ligando dois sites:

- Site A: servidor que hospeda o modelo de chat do Instruct Lab. Ele recebe o input do usuário, envia ao modelo e devolve a resposta.

- Site B: site OpenShift que expõe o chat do Instruct Lab. Envia o input do usuário ao modelo e recebe a resposta do Merlinite-7b-lab-Q4_K_M.gguf.

Para conectar os dois sites, usamos [Skupper](https://skupper.io/), que permite comunicação segura entre serviços em ambientes diferentes. Com isso, a aplicação Ollama Pilot consegue enviar requests ao modelo e receber a resposta do merlinite.

No fim do projeto, você terá seu próprio chatbot com dados protegidos.

## Arquitetura

![Architecture](/assets/instructlab_architecture.png)

## Resumo

1. Deploy do modelo de IA com InstructLab
2. Deploy privado do Skupper
3. Deploy público do Skupper
4. Comunicação segura entre os dois sites com Skupper
5. Chatbot com dados protegidos

## 1. Deploy do modelo de IA com InstructLab

O primeiro passo é fazer o deploy do modelo de chat do InstructLab no site InstructLab. Ele recebe o input do usuário, envia ao modelo e devolve a resposta. Baseado no artigo: [Getting started with InstructLab for generative AI model tuning](https://developers.redhat.com/blog/2024/06/12/getting-started-instructlab-generative-ai-model-tuning#model_alignment_and_training_with_instructlab)

```bash
mkdir instructlab && cd instructlab 
python3.11 -m venv venv 
source venv/bin/activate
pip install 'instructlab[cuda]' -C cmake.args="-DLLAMA_CUDA=on" -C cmake.args="-DLLAMA_NATIVE=off"
```

> IMPORTANTE: este método de instalação habilita a GPU Nvidia para o instructlab. Se você não tiver GPU Nvidia, veja outras opções em: [InstructLab 🐶 (ilab)](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)

```bash
ilab config init
```

Para habilitar acesso externo ao modelo, ajuste o arquivo `config.yaml`:

```yaml
chat:
  context: default
  greedy_mode: false
  logs_dir: data/chatlogs
  max_tokens: null
  model: models/merlinite-7b-lab-Q4_K_M.gguf
  session: null
  vi_mode: false
  visible_overflow: true
general:
  log_level: INFO
generate:
  chunk_word_count: 1000
  model: models/merlinite-7b-lab-Q4_K_M.gguf
  num_cpus: 10
  num_instructions: 100
  output_dir: generated
  prompt_file: prompt.txt
  seed_file: seed_tasks.json
  taxonomy_base: origin/main
  taxonomy_path: taxonomy
serve:
  gpu_layers: -1
  host_port: 0.0.0.0:8000 # HERE
  max_ctx_size: 4096
  model_path: models/merlinite-7b-lab-Q4_K_M.gguf
```

Agora baixe e inicie o servidor:

```bash
ilab model download
ilab model serve

# The output should be similar to:
INFO 2024-07-30 18:59:01,199 serve.py:51: serve Using model 'models/merlinite-7b-lab-Q4_K_M.gguf' with -1 gpu-layers and 4096 max context size.
INFO 2024-07-30 18:59:01,611 server.py:218: server Starting server process, press CTRL+C to shutdown server...
INFO 2024-07-30 18:59:01,612 server.py:219: server After application startup complete see http://0.0.0.0:8000/docs for API.
```

## 2. Deploy privado do Skupper

O segundo passo é fazer o deploy do Skupper privado no Site A. Ele cria a conexão segura entre os sites, permitindo que a aplicação Ollama Pilot envie requests ao modelo e receba a resposta do merlinite. Abra um novo terminal e rode:

### Instalar Skupper

```bash
export SKUPPER_PLATFORM=podman
skupper init --ingress none
```

### Expondo o modelo de chat do InstructLab

Vamos bindar o serviço local que roda o chat do InstructLab ao serviço Skupper.

```bash
skupper expose host host.containers.internal --address instructlab --port 8000
```

Conferindo o status do serviço Skupper:

```bash
skupper service status
Services exposed through Skupper:
╰─ instructlab:8000 (tcp)
```

Quase prontos para conectar os sites. O próximo passo é o Skupper público no Site B e a conexão entre eles.

## 3. Deploy público do Skupper

O terceiro passo é o deploy do Skupper público no Site B. Ele recebe a conexão do Skupper privado e monta a ligação segura. Abra um novo terminal e rode:

1. Criando o projeto e fazendo o deploy do Skupper público:

```bash
oc new-project ollama-pilot
skupper init --enable-console --enable-flow-collector --console-user admin --console-password admin 
```

2. Criando o token para o Skupper privado conectar ao público:

```bash
skupper token create token.yaml
```

Neste ponto você deve ter um `token.yaml` com o token de conexão. O próximo passo é linkar os sites. Volte ao terminal onde o Skupper privado está rodando.

## 4. Comunicação segura entre os dois sites com Skupper

O quarto passo é conectar os dois sites. No terminal do Skupper privado:

```bash
skupper link create token.yaml --name instructlab # Or any other name you want
```

Conferindo o status do link:

```bash
skupper link status

Links created from this site:

        Link instructlab is connected

Current links from other sites that are connected:

        There are no connected links
```

> Antes de seguir, volte ao terminal do Skupper público e confira o status do link:

```bash
skupper link status

Links created from this site:

       There are no links configured or connected

Current links from other sites that are connected:

       Incoming link from site b8ad86d5-9680-4fea-9c07-ea7ee394e0bd
```

## 5. Chatbot com dados protegidos

Por último, exponha o serviço no Skupper público e crie a aplicação Ollama Pilot.

1. Ainda no terminal do Skupper público, exponha o serviço. O comando abaixo cria um serviço Skupper correspondente ao serviço exposto pelo Skupper privado, o que resulta em um serviço Kubernetes usado pela aplicação Ollama Pilot.

```bash
skupper service create instructlab 8000
```

2. Expondo o serviço para a internet:

```bash
oc expose service instructlab
```

3. Pegando a URL pública:

```bash
oc get route instructlab
NAME          HOST/PORT                                                              PATH   SERVICES      PORT       TERMINATION   WILDCARD
instructlab   instructlab-ollama-pilot.apps.your-cluster-url          instructlab   port8000                 None
```

4. O último passo é criar a aplicação Ollama Pilot. Ela envia o input do usuário ao chat do Instruct Lab e recebe a resposta do Merlinite-7b-lab-Q4_K_M.gguf, usando a conexão segura criada pelo Skupper.

Você pode repetir as instruções do passo [1. Deploy do modelo de IA com InstructLab](#1-deploy-do-modelo-de-ia-com-instructlab) para instalar o chat do Instruct Lab no Site B. A diferença é que você não roda `ilab model serve`, porque o modelo já está no Site A.

```bash
ilab model chat --endpoint-url http://instructlab-ollama-pilot.apps.your-cluster-url/v1/
╭─────────────────────────────────────────────── system ────────────────────────────────────────────────
│ Welcome to InstructLab Chat w/ MODELS/MERLINITE-7B-LAB-Q4_K_M.GGUF (type /h for help)
╰──────────────────────────────────────────────────────────────────────────────────────────────────────
>>>                     [S][default]
```

### A pergunta:

> Pergunta de sim ou não. Não me enrola. O LeBron é melhor que o Jordan?

Divirta-se com o chatbot com dados protegidos. Se discordar da resposta, pergunte de novo e treine o modelo — mas King James é o melhor!
