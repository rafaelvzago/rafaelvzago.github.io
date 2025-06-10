---
layout: post
title: "Controlando e protegendo modelos de IA com segurança usando Deepseek, Skupper e InstructLab - Primeiro Ato"
description: "Descubra como implantar e operar modelos de IA com segurança em ambientes híbridos, usando Skupper e InstructLab para proteger dados sensíveis."
date: 2025-05-02
categories: [AI, Internet]
tags: [ai, deepseek, skupper, instructlab, kubernetes, security, hybrid-cloud, architecture, llm]
image:
  path: /assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt1.png
  alt: Instructlab with Skupper
---

## A história por trás deste padrão de solução

A crescente demanda por aplicações orientadas por IA traz um desafio importante: como implantar e operar modelos de IA com segurança em ambientes que exigem proteção rigorosa dos dados, ao mesmo tempo em que esses modelos precisam ser acessíveis por serviços públicos. Essa necessidade ficou clara durante o desenvolvimento de um chatbot de IA local, projetado para lidar com informações sensíveis e proprietárias, o que exigiu uma solução capaz de manter o modelo protegido dentro de um ambiente seguro.

Aproveitando o **Skupper**, a equipe criou um padrão em que os modelos de IA, servidos via **InstructLab**, permanecem isolados na infraestrutura privada, mas podem ser acessados de forma segura por meio de conexões protegidas em ambientes **OpenShift** públicos. O objetivo era garantir controle total sobre a segurança dos dados e do modelo, sem abrir mão da flexibilidade para escalar e atender às demandas dos usuários externos.

Esse padrão de solução surgiu justamente da busca por equilíbrio entre segurança, desempenho e acessibilidade — especialmente para organizações que desejam adotar estratégias de nuvem híbrida. Ao utilizar o **Skupper** para integrar a solução de IA, a equipe viabilizou uma comunicação contínua entre ambientes privados e públicos, sem comprometer a proteção dos dados nem a eficiência operacional.

Com essa arquitetura, as empresas podem continuar inovando em IA e aprendizado de máquina, mantendo a conformidade e a segurança exigidas por setores como saúde, finanças e qualquer área em que a proteção de dados seja fundamental.

Um ponto crucial para essa solução também será escolher um modelo de IA rápido e eficiente, como o deepseek, que é um modelo de IA de código aberto otimizado para desempenho e segurança. O deepseek é uma excelente escolha para aplicações que exigem respostas rápidas e precisas, mantendo a privacidade dos dados. O modelo que vamos usar é o **DeepSeek-R1-Distill-Qwen-1.5B** , que é um modelo de IA de código aberto otimizado para desempenho e segurança, ideal para aplicações que exigem respostas rápidas e precisas.

## A Solução

**Resumo da Solução**

Este padrão de solução mostra, na prática, como implantar e disponibilizar com segurança um chatbot de IA local usando **Skupper** e **InstructLab**. Com essa arquitetura, é possível treinar e servir modelos de IA em um ambiente protegido, garantindo que dados sensíveis fiquem sempre seguros — mesmo quando o serviço de chatbot precisa ser acessado por usuários externos via OpenShift.

Os principais componentes dessa solução são:

- **InstructLab**, responsável por gerenciar e servir os modelos de IA em uma infraestrutura privada e segura.
- **Skupper**, que estabelece uma comunicação segura e contínua entre ambientes isolados e públicos.
- Uma **Rede Virtual de Aplicações (VAN)**, conectando de forma protegida dois ambientes: um site privado, onde o modelo de IA fica hospedado, e um site OpenShift público, que expõe o serviço de chatbot para os usuários externos.
- Um modelo de IA otimizado, como o **DeepSeek-R1-Distill-Qwen-1.5B**, que oferece respostas rápidas e precisas, mantendo a privacidade dos dados.

## Arquitetura

Esta arquitetura propõe uma forma segura de implantar um chatbot de IA local, usando **InstructLab** e **Skupper** para garantir a privacidade dos dados e a comunicação contínua entre ambientes isolados. O modelo roda em um ambiente privado, enquanto o serviço é disponibilizado ao público por meio de uma implantação no OpenShift — assim, é possível oferecer acesso externo sem abrir mão da proteção dos dados e do próprio modelo.

Os principais pontos dessa arquitetura são:

- **InstructLab**: responsável por hospedar, treinar e servir o modelo de IA em um ambiente seguro.
- **DeepSeek-R1-Distill-Qwen-1.5B**: um modelo de IA otimizado para desempenho e segurança, ideal para aplicações que exigem respostas rápidas e precisas.
- **Skupper**: cria uma **Rede Virtual de Aplicações (VAN)** entre ambientes privados e públicos, permitindo uma comunicação segura.
- **OpenShift/Kubernetes**: usado para implantar o serviço de chatbot, garantindo que ele possa ser acessado por usuários externos de forma controlada.
- **Podman**: utilizado para gerenciar contêineres de forma leve e segura, facilitando a implantação do InstructLab e do chatbot.
**IMPORTANTE:** Essa abordagem permite que serviços hospedados em diferentes ambientes conversem de forma segura usando o **Skupper**, protegendo tanto os dados quanto o modelo de IA e garantindo que o acesso externo seja feito de maneira controlada e segura.

### Diagrama da Arquitetura

![Visão Geral da Arquitetura](/assets/implantando-chatbot-instructlab-openshift.png)

## Desafios Comuns

1. **Hospedagem Segura de Modelos**: Proteger modelos de IA sensíveis, permitindo ao mesmo tempo acesso externo controlado.

2. **Conectividade Híbrida**: Facilitar a comunicação entre ambientes privados e públicos sem comprometer a segurança.

3. **Privacidade de Dados**: Garantir que os dados privados permaneçam em um ambiente protegido, ao mesmo tempo em que fornece respostas de IA em tempo real para usuários externos.

4. **Escalabilidade**: Permitir que o serviço de chatbot escale conforme necessário, sem comprometer a segurança ou a privacidade dos dados.

5. **Visualização e Monitoramento**: Fornecer visibilidade sobre o tráfego e as interações entre os ambientes, garantindo que a comunicação seja segura e eficiente.


## Conjunto de Tecnologias

- **Plataformas e Ferramentas Utilizadas**:

    - [Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift)
          O Red Hat OpenShift é uma plataforma de contêineres baseada em Kubernetes que permite aos desenvolvedores construir, implantar e gerenciar aplicações em contêineres. Ele fornece uma plataforma robusta para escalar e automatizar aplicações em ambientes de nuvem híbrida, garantindo confiabilidade e segurança.
    - [InstructLab](https://instructlab.ai/)
          InstructLab é uma plataforma de modelo de IA que simplifica o processo de treinamento, serviço e gerenciamento de grandes modelos de linguagem. Ele foi projetado para ser flexível e seguro, tornando-o ideal para ambientes onde os modelos precisam permanecer privados, mas ainda atender a solicitações externas por meio de caminhos de acesso controlados.
      - [DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek/DeepSeek-R1-Distill-Qwen-1.5B)
          DeepSeek-R1-Distill-Qwen-1.5B é um modelo de IA de código aberto otimizado para desempenho e segurança, ideal para aplicações que exigem respostas rápidas e precisas. Ele é projetado para ser leve e eficiente, mantendo a privacidade dos dados enquanto oferece resultados de alta qualidade.
    - [Podman](https://www.podman.io/)
          Podman é um mecanismo de contêineres que permite aos usuários gerenciar contêineres sem a necessidade de um daemon. Ele fornece um ambiente seguro e leve para executar contêineres, tornando-o ideal para implantar modelos e serviços de IA em ambientes isolados.
    - [Skupper](https://skupper.io/)
          Skupper é uma plataforma de mensagens distribuídas e seguras que permite a comunicação entre serviços em diferentes ambientes. Ele cria uma sobreposição de rede segura que permite que os serviços interajam sem expor dados sensíveis diretamente, garantindo a privacidade dos dados e a comunicação segura. Usaremos a versão cli do Skupper para criar uma conexão segura entre os ambientes privado e público.
    - [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
            NGINX Ingress Controller é uma solução para expor serviços HTTP e HTTPS de dentro de um cluster Kubernetes. Ele fornece balanceamento de carga, terminação SSL e roteamento baseado em nome, tornando-o ideal para expor aplicações web de forma segura e eficiente.

# Uma visão detalhada da arquitetura da solução

Esta arquitetura é baseada em uma configuração híbrida onde o modelo de IA é treinado e servido via **InstructLab** em um ambiente privado (Ambiente Local Privado) e só pode ser acessado por usuários externos através de um site **Kubernetes** público, usando **Skupper** para comunicação segura. O **Skupper** garante que os dados trocados entre esses dois ambientes permaneçam seguros, criando uma **Rede Virtual de Aplicações (VAN)** entre os sites.

## Exposição de Serviços com NGINX Ingress

Para expor o chatbot de IA para usuários externos, utilizamos o **NGINX Ingress Controller**, que oferece:
- **Balanceamento de Carga**: Distribuição eficiente de tráfego entre múltiplas instâncias
- **Terminação SSL/TLS**: Criptografia segura das conexões
- **Roteamento Avançado**: Roteamento baseado em path e host
- **LoadBalancer Service**: Acesso direto com IP externo do provedor de nuvem

Essa abordagem fornece uma solução robusta e escalável para expor aplicações de IA de forma segura em ambientes Kubernetes.

## Visão Geral da Arquitetura

O **Ambiente Local Privado** hospeda o modelo de IA usando InstructLab e é responsável por:

- Receber a entrada do usuário exclusivamente do Openshift Cluster (OpenShift).

- Enviar a entrada para o modelo LLaMA3 para processamento.

- Retornar a resposta do modelo para o Openshift Cluster com segurança.

O **Cluster Kubernetes** público é responsável por:

- Expor o chatbot de IA para usuários externos via NGINX Ingress ou LoadBalancer.

- Enviar solicitações para o modelo InstructLab privado no Ambiente Local Privado.

- Exibir a resposta da IA do modelo hospedado no Ambiente Local Privado.

Por design, o modelo em execução no ambiente privado (Ambiente Local Privado) é isolado e não pode ser acessado diretamente por clientes externos. Todas as interações com o modelo são mediadas pelo cluster Kubernetes público, garantindo que o modelo permaneça protegido, enquanto ainda permite que os usuários externos interajam com o serviço de chatbot de forma segura.

## E o modelo de IA?

O modelo de IA utilizado nesta solução é o **DeepSeek-R1-Distill-Qwen-1.5B**, que é um modelo de IA de código aberto otimizado para desempenho e segurança, ideal para aplicações que exigem respostas rápidas e precisas. Ele é projetado para ser leve e eficiente, mantendo a privacidade dos dados enquanto oferece resultados de alta qualidade.

A vantagem de usar o instructlab é que ele permite treinar e servir modelos de IA de forma segura, garantindo que os dados sensíveis permaneçam protegidos. O InstructLab facilita o processo de treinamento e serviço de modelos de IA, tornando-o uma escolha ideal para ambientes onde a segurança e a privacidade dos dados são fundamentais. Nessa solução vamos baixar o modelo **DeepSeek-R1-Distill-Qwen-1.5B** do Hugging Face, converter para o formato necessário e treiná-lo usando o InstructLab.

## Sobre o Conjunto de Tecnologias

Esta solução usa o **Skupper** e o **InstructLab** para proteger a implantação do modelo de IA. O **Kubernetes** garante o dimensionamento flexível do serviço de chatbot com NGINX Ingress e LoadBalancer services, enquanto o **Skupper** permite uma comunicação contínua e segura entre os sites isolados, criando um ambiente de nuvem híbrida robusto para aplicações orientadas por IA.

## Próximos Passos

Para ver essa solução em ação e aprender como implementá-la passo a passo, continue lendo o próximo artigo: **"Controlando e protegendo modelos de IA com segurança usando Deepseek, Skupper e InstructLab - Segundo Ato"**, onde abordaremos todos os detalhes técnicos da implementação.

## Referências

- [Comandos extraídos do projeto InstructLab](https://github.com/instructlab)
- [Guia de instalação do InstructLab](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)
- [Chatbot ILAB Frontend](https://github.com/rafaelvzago/ilab-client)
- [DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek/DeepSeek-R1-Distill-Qwen-1.5B)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [Skupper Documentation](https://skupper.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Podman Documentation](https://docs.podman.io/)