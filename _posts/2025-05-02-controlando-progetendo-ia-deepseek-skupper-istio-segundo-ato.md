---
layout: post
title: "Controlando e protegendo modelos de IA com segurança usando Deepseek, Skupper e InstructLab - Segundo Ato"
description: "Neste artigo, vamos implementar passo a passo o chatbot com o Instructlab, além de expor o serviço de forma segura usando Skupper"
date: 2025-05-04
categories: [AI, Kubernetes, instructlab]
tags: [ai, deepseek, skupper, instructlab, kubernetes, podman, llama-cpp, gguf]
image:
  path: /assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt2.png
  alt: Instructlab with Skupper
---

## Veja a Solução em Ação

Neste artigo, vamos preparar todo o ambiente para servir o modelo de IA generativo Deepseek usando o InstructLab, baixando o modelo, convertendo-o para o formato GGUF e implantando o chatbot InstructLab. Além disso, vamos expor o serviço de forma segura usando Skupper.

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

- Acesso a um cluster Kubernetes com o Skupper e o InstructLab instalados.

- Um servidor executando o modelo de chat do InstructLab.

- Acesso a um terminal para executar os comandos.

- Acesso a um navegador da web para interagir com o chatbot.

- Cliente skupper instalado e configurado para acessar o cluster Kubernetes.

- Podman instalado para executar o Skupper privado.

#### Implantação do Modelo de IA com o InstructLab

O primeiro passo é implantar o modelo de chat do InstructLab no site do InstructLab. O modelo de chat do InstructLab será responsável por receber a entrada do usuário e enviá-la para o modelo LLaMA3. A resposta do modelo LLaMA3 será enviada de volta ao usuário. Isso é baseado no artigo: <https://developers.redhat.com/blog/2024/06/12/getting-started-instructlab-generative-ai-model-tuning#model_alignment_and_training_with_instructlab> \[Primeiros passos com o InstructLab para ajuste de modelo de IA generativo].

```bash
mkdir instructlab && cd instructlab
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

##### Arquivos e diretórios criados

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

### Baixando e Convertendo o modelo DEEPSEEK para o InstructLab

Agora, você precisa baixar o modelo que será usado pelo chatbot e convertê-lo para o formato GGUF.  O InstructLab suporta vários modelos, mas para esta demonstração, usaremos o modelo DEEPSEEK.  O comando `ilab model download` é usado para baixar o modelo a ser usado pelo chatbot.

#### Criando um token do hugginface

Para baixar o modelo, você precisa de um token do Hugging Face.  Se você não tiver um token, crie uma conta no Hugging Face e gere um token de acesso.  Depois de obter o token, execute o seguinte comando para configurá-lo:

```bash
export HF_TOKEN=<seu_token>
```

> NOTA
> O comando `export HF_TOKEN=<seu_token>` é usado para definir a variável de ambiente `HF_TOKEN` com o seu token do Hugging Face.  Isso é necessário para baixar o modelo do Hugging Face.

#### Baixando o modelo DEEPSEEK

Antes de iniciar o servidor, baixe o modelo a ser usado pelo chatbot.  O comando `ilab download` é usado para baixar o modelo a ser usado pelo chatbot.  Execute o seguinte comando:

```bash
ilab model download --repository deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
```

> NOTA
>
> O comando `ilab download` é usado para baixar o modelo a ser usado pelo chatbot.

#### Convertendo o modelo para formato GGUF

Após baixar o modelo, você precisa convertê-lo para o formato GGUF usando o llama.cpp. Primeiro, clone o repositório llama.cpp:

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
```

Siga as instruções de instalação do llama.cpp conforme descrito no repositório. Após a instalação, execute o comando de conversão:

```bash
python ./convert_hf_to_gguf.py /home/rzago/.cache/instructlab/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B --outfile deepseek_f16.gguf --outtype f16
```

Agora mova o arquivo convertido para o diretório de modelos do InstructLab:

```bash
mv deepseek_f16.gguf $HOME/.cache/instructlab/models/DeepSeek-R1-Distill-Qwen-1.5B.gguf
```

> NOTA
>
> O comando `git clone https://github.com/ggerganov/llama.cpp` é usado para baixar o repositório llama.cpp.
>
> O comando `python ./convert_hf_to_gguf.py` é usado para converter o modelo baixado do formato Hugging Face para o formato GGUF.
>
> O parâmetro `--outtype f16` especifica que a conversão será feita em formato float16 para otimizar o tamanho do arquivo.
>
> O comando `mv` move o arquivo convertido para o diretório padrão onde o InstructLab procura por modelos.
>
> Agora, inicie o servidor que será responsável por receber a entrada do usuário, enviá-la para o modelo e enviar a resposta de volta ao usuário.  O comando `ilab model serve` é usado para iniciar o servidor.  Execute o seguinte comando:

```bash
ilab model serve --model-path ~/.cache/instructlab/models/DeepSeek-R1-Distill-Qwen-1.5B.gguf
```

> NOTA
>
> O comando `ilab model serve --model-path` é usado para iniciar o servidor especificando o caminho do modelo convertido que será responsável por receber a entrada do usuário, enviá-la para o modelo e enviar a resposta de volta ao usuário.

### Implantação do Skupper Público

Para expor o serviço do InstructLab para a internet, você precisa implantar o Skupper público no Ambiente Local Público. O Skupper público será responsável por expor o serviço do InstructLab para a internet, permitindo que o aplicativo Ollama Pilot envie solicitações ao modelo de chat do InstructLab.

Nessa demonstração, estamos utilizando o Kubernetes como plataforma para implantar o Skupper público. O Skupper público será responsável por expor o serviço do InstructLab para a internet, permitindo que o aplicativo Ollama Pilot envie solicitações ao modelo de chat do InstructLab. Para instalar o skupper, vamos usar o `skupper` cli, que é uma ferramenta de linha de comando para interagir com o Skupper.

#### Instalar o Skupper Público

Para instalar o Skupper público, vamos usar o `skupper` cli, que é uma ferramenta de linha de comando para interagir com o Skupper. O Skupper CLI é usado para criar e gerenciar sites Skupper, além de expor serviços e estabelecer links entre sites.

1. **Instalar o Skupper CLI**

   Execute o seguinte comando para instalar o Skupper CLI:

   ```bash
   curl https://skupper.io/v2/install.sh | sh
   ```

  > NOTA
  >
  > O comando `curl https://skupper.io/v2/install.sh | sh` é usado para baixar e instalar o Skupper CLI no seu ambiente local. Isso é necessário para interagir com o Skupper e implantar o serviço do InstructLab.

2. **Instalar o Skupper no cluster Kubernetes**

   Após instalar o Skupper CLI, você precisa instalar o Skupper no cluster Kubernetes. Execute o seguinte comando para instalar o Skupper no cluster Kubernetes:

   ```bash
   kubectl create ns skupper
   kubectl apply -f https://skupper.io/v2/install.yaml -n skupper
   ```

   > NOTA
   >
   > O comando `kubectl create ns skupper` cria um namespace chamado `skupper` no cluster Kubernetes. Isso é necessário para isolar os recursos do Skupper e do InstructLab em um namespace separado.
   > O comando `kubectl apply -f https://skupper.io/v2/install.yaml -n skupper` aplica o manifesto de instalação do Skupper no cluster Kubernetes, criando os recursos necessários para o Skupper funcionar. Isso inclui o pod `skupper-router`, que é responsável pelo roteamento de tráfego entre sites.

3. **Criar o namespace e inicializar o Skupper no cluster Kubernetes**

    Após instalar o Skupper CLI, você precisa criar um namespace no cluster Kubernetes onde o Skupper será implantado. Execute o seguinte comando para criar um namespace chamado `ilab-chat` e inicializar o Skupper:

    ```bash

    kubectl create ns ilab-chat
    export SKUPPER_PLATFORM=kubernetes
    skupper site create ilab-chat -n ilab-chat --enable-link-access
    ```

    > NOTA
    > O comando `kubectl create ns ilab-chat` cria um novo namespace chamado `ilab-chat` no cluster Kubernetes. Isso é necessário para isolar os recursos do Skupper e do InstructLab em um namespace separado.
    > O comando `export SKUPPER_PLATFORM=kubernetes` define a plataforma como Kubernetes, que é necessária para o Skupper funcionar corretamente.
    > O comando `skupper site create ilab-chat -n ilab-chat --enable-link-access` inicializa o Skupper no namespace `ilab-chat`, criando os recursos necessários para a comunicação segura entre os serviços.
    > A opção `--enable-link-access` permite que outros sites Skupper se conectem a este site, facilitando a comunicação entre diferentes ambientes.

4. **Verificar a instalação do Skupper**

    Após a criação do namespace, você pode verificar se o Skupper foi instalado corretamente executando o seguinte comando:

    ```bash
    kubectl get pods -n ilab-chat
    ```

    A saída deve mostrar que o pod skupper-router está em execução, o que indica que o Skupper foi instalado com sucesso.

    ```bash
    NAME                            READY   STATUS    RESTARTS   AGE
    skupper-router-cfc4c58f-pmhqv   2/2     Running   0          47s
    ```

  > NOTA
  >
  > O comando `kubectl get pods -n ilab-chat` é usado para verificar o status dos pods no namespace `ilab-chat`. A saída deve mostrar que o pod `skupper-router` está em execução, o que indica que o Skupper foi instalado com sucesso.
  > O pod skupper-router é o componente principal do Skupper, responsável pelo roteamento de tráfego entre sites.

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
skupper site create ilab-podman
skupper connector create instructlab 8000 --host localhost
```

> NOTA
>
> `SKUPPER_PLATFORM=podman` é usado para definir a plataforma como podman.  Isso é necessário porque o Skupper privado será executado em um contêiner podman.
>
> `skupper site create ilab-podman` é usado para criar um site Skupper chamado `ilab-podman`, configurando os componentes necessários para habilitar a comunicação segura entre os serviços.
>
> `skupper connector create instructlab 8000 --host localhost` é usado para criar um conector que conecta o serviço InstructLab local (executando na porta 8000) à rede Skupper, tornando-o disponível para sites remotos.

### Comunicação Segura Entre os Dois Sites com Skupper

Agora é hora de estabelecer uma conexão segura entre os dois sites. Primeiro, no site público (Kubernetes), gere o link para conexão:

```bash
skupper link generate -n ilab-chat > /tmp/link.yaml
```

> NOTA
>
> `skupper link generate` é usado para gerar um arquivo de configuração de link que contém as credenciais necessárias para estabelecer uma conexão segura entre sites Skupper.

Agora, no site privado (podman), prepare o diretório de recursos e mova o arquivo de link:

```bash
mkdir -p $HOME/.local/share/skupper/namespaces/default/input/resources
mv /tmp/link.yaml $HOME/.local/share/skupper/namespaces/default/input/resources/link.yaml
skupper system setup --force
```

> NOTA
>
> O comando `mkdir -p` cria a estrutura de diretórios necessária para o Skupper gerenciar recursos de entrada.
>
> O arquivo `link.yaml` é movido para o diretório de recursos onde o Skupper pode detectá-lo automaticamente.
>
> `skupper system setup --force` força a reconfiguração do sistema Skupper para aplicar o novo link.

Verifique o status do link Skupper:

```bash
skupper link status link-ilab-chat

Name:           link-ilab-chat
Status:         Ok
Cost:           1
TlsCredentials: link-ilab-chat
Endpoint:       skupper-router-inter-router-ilab-chat.apps.*********.com:443
```

> NOTA
>
> `skupper link status` é usado para exibir o status de um link específico na rede Skupper.
>
> O status "Ok" indica que a conexão foi estabelecida com sucesso.
>
> O endpoint mostra a URL pública onde o link está ativo (mascarado por segurança).

> NOTA
>
> O parâmetro `instructlab` é o nome do serviço que será exposto, e `8000` é a porta onde o serviço está sendo executado.
> O parâmetro `--host localhost` especifica que o conector deve se conectar ao serviço local na interface de loopback (localhost), permitindo que o serviço seja acessado dentro do ambiente privado.

#### Criando o Listener no Site Público

A última etapa é criar um listener no site público para receber as conexões do connector no site privado. Esta é a configuração que permite que o aplicativo no cluster público acesse o modelo de IA no ambiente privado.

- Ainda no terminal onde o Skupper **público** está em execução, execute o seguinte comando para criar o listener, já que é neste site o serviço será consumido:

```bash
skupper listener create instructlab 8000
```

> NOTA
>
> O comando `skupper listener create instructlab 8000` cria um listener que expõe o serviço `instructlab` na porta `8000` do site público, permitindo que ele seja acessado por outros sites conectados ao Skupper.
> O listener atua como um ponto de entrada na rede Skupper, recebendo conexões de outros sites e encaminhando-as para o serviço `instructlab` no site privado.
>

> **Relacionamento Connector e Listener no Skupper:**
>
> - **Listener** (site público): `skupper listener create instructlab 8000` - cria um ponto de entrada na rede Skupper para receber conexões
>
> O **connector** "empurra" o serviço local para a rede Skupper, enquanto o **listener** "puxa" esse serviço para o site remoto. Juntos, eles criam um túnel seguro que permite que aplicações no site público acessem serviços no site privado como se fossem locais.

## Iniciando o Serviço do Modelo no Site Privado

Agora é hora de iniciar o serviço no terminal onde o site privado está sendo executado. Este é o passo final para ativar o modelo de IA e torná-lo disponível para receber requisições através da rede Skupper.

### Configurando o Servidor para Acesso Externo

Antes de iniciar o servidor, você precisa modificar o arquivo de configuração do InstructLab para permitir acesso externo. Por padrão, o InstructLab serve apenas na interface local (127.0.0.1), mas para funcionar com o Skupper, precisamos configurá-lo para aceitar conexões de qualquer interface.

Edite o arquivo de configuração localizado em `~/.config/instructlab/config.yaml` e modifique a seção `server`:

```yaml
# Server configuration including host and port.
...
  host: 0.0.0.0
  # Port to serve on.
  # Default: 8000
  port: 8000
```

> NOTA
>
> **`host: 0.0.0.0`**: Esta configuração permite que o servidor aceite conexões de todas as interfaces de rede, não apenas da interface local (localhost). Isso é essencial para que o Skupper consiga acessar o serviço.
>
> **`port: 8000`**: Mantém a porta padrão 8000, que corresponde à configuração do connector Skupper criado anteriormente.
>
> **`backend_type: llama-cpp`**: Especifica que será usado o backend llama-cpp para servir o modelo.

Com essa configuração, o servidor estará pronto para receber conexões através da rede Skupper.

No terminal onde você configurou o Skupper privado (podman), certifique-se de que o ambiente virtual do InstructLab esteja ativado e execute o seguinte comando:

```bash
cd instructlab
source venv/bin/activate
ilab model serve --model-path ~/.cache/instructlab/models/DeepSeek-R1-Distill-Qwen-1.5B.gguf
```

> NOTA
>
> **`ilab model serve`**: Este comando inicia o servidor que será responsável por receber a entrada do usuário, enviá-la para o modelo DeepSeek e enviar a resposta de volta ao usuário.
>
> **`--model-path`**: Especifica o caminho para o modelo GGUF que será carregado pelo servidor.
>
> O modelo ficará disponível na porta 8000 (configurada anteriormente no arquivo `config.yaml`) e será acessível através da rede Skupper que conecta os dois sites.

Após executar este comando, você verá uma saída similar a esta indicando que o servidor está funcionando:

```bash
INFO 2025-01-15 10:30:45,123 Starting server on http://0.0.0.0:8000
INFO 2025-01-15 10:30:45,124 Model loaded successfully
INFO 2025-01-15 10:30:45,125 Server ready to accept connections
```

Agora o modelo DeepSeek está rodando no ambiente privado e disponível através da conexão segura Skupper para aplicações no site público.

### Testando a Conectividade através do Skupper do Site Público

Agora que temos o modelo de IA rodando no site privado e a conexão Skupper estabelecida, vamos testar se a comunicação está funcionando corretamente a partir do site público (OpenShift).

Para testar a conectividade de dentro do cluster Kubernetes, vamos criar um pod temporário que pode fazer requisições HTTP para o serviço do InstructLab:

```bash
kubectl run curl --image=quay.io/skupper/lanyard -n ilab-chat --restart=Never --rm -i --tty --  curl instructlab:8000
Warning: would violate PodSecurity "restricted:latest": allowPrivilegeEscalation != false (container "curl" must set securityContext.allowPrivilegeEscalation=false), unrestricted capabilities (container "curl" must set securityContext.capabilities.drop=["ALL"]), runAsNonRoot != true (pod or container "curl" must set securityContext.runAsNonRoot=true), seccompProfile (pod or container "curl" must set securityContext.seccompProfile.type to "RuntimeDefault" or "Localhost")
{"message":"Hello from InstructLab! Visit us at https://instructlab.ai"}pod "curl" deleted

```

> NOTA
>
> **`kubectl run curl --image=quay.io/skupper/lanyard -n ilab-chat --restart=Never --rm -i --tty --`**: Este comando cria um pod temporário usando a imagem `quay.io/skupper/lanyard`, que é uma imagem leve para executar comandos de rede. O pod é criado no namespace `ilab-chat` e será removido automaticamente após a execução.
>
> **`--restart=Never`**: Garante que o pod não será reiniciado após a execução, tornando-o um pod de uso único.
>
> **`curl -v http://instructlab:8000/`**: Este comando dentro do pod executa uma requisição HTTP para o serviço do InstructLab, que está rodando na porta 8000. O `-v` ativa o modo verbose, mostrando detalhes da requisição e resposta.

## Conclusão

Neste segundo ato da série, estabelecemos com sucesso a base fundamental para uma arquitetura segura de IA usando Skupper. Implementamos:

### O que foi Realizado

- **Configuração do Ambiente InstructLab**: Preparamos o ambiente completo para servir o modelo DeepSeek, incluindo a conversão para formato GGUF
- **Infraestrutura Skupper Híbrida**: Estabelecemos uma rede segura conectando um site público (Kubernetes) com um ambiente privado (Podman)
- **Conexão Segura com Links**: Utilizamos os novos comandos Skupper v2 (`skupper link generate` e `skupper system setup`) para criar uma conexão criptografada
- **Arquitetura Connector/Listener**: Implementamos o padrão onde o connector "empurra" o serviço privado para a rede Skupper e o listener "puxa" esse serviço para o site público
- **Teste de Conectividade**: Validamos que o modelo de IA no ambiente privado está acessível através da rede Skupper

### Benefícios da Arquitetura

- **Segurança por Design**: O modelo de IA permanece em ambiente controlado e privado
- **Zero Trust Network**: Skupper cria túneis seguros sem exposição direta à internet
- **Escalabilidade**: Preparação para implantação de interfaces web no cluster público
- **Observabilidade**: Base estabelecida para monitoramento de tráfego entre sites

### Próximos Passos

No **terceiro e último ato**, vamos:

- Implantar a interface web do chatbot no Kubernetes
- Configurar NGINX Ingress e LoadBalancer para acesso externo
- Integrar a solução completa com o InstructLab
- Finalizar a solução end-to-end

Esta arquitetura fornece a base sólida para organizações que precisam manter seus modelos de IA seguros enquanto oferecem interfaces acessíveis aos usuários finais.

## Referências

- [Comandos extraídos do projeto InstructLab](https://github.com/instructlab)
- [Primeiros passos com o InstructLab: Ajuste de modelo de IA generativo](https://developers.redhat.com/blog/2024/06/12/getting-started-instructlab-generative-ai-model-tuning#model_alignment_and_training_with_instructlab)
- [Guia de instalação do InstructLab](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)
- [Chatbot ILAB Frontend](https://github.com/rafaelvzago/ilab-client)
- [Hugging Face Token](https://huggingface.co/docs/hub/en/security-tokens)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [Skupper Documentation](https://skupper.io/docs/)
- [DeepSeek Model](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Podman Documentation](https://docs.podman.io/)

