---
layout: post
title: "CI/CD Upstream vs Downstream"
date: 2023-06-02 00:00:00 -0300
categories: [pipeline]
tags: [ci-cd, pipeline, devops, automation, upstream-downstream, redhat, skupper]
image:
  path: /assets/img/headers/ci-cd-downstream-upstream-hero.webp
  alt: Opensource
---

# Integrando Skupper com Skupper: Uma abordagem upstream e downstream

Quando se trata de desenvolvimento de software, integrar projetos upstream e downstream pode ser um desafio. Neste artigo, vamos explorar uma abordagem eficaz para integrar o Skupper e o Skupper, utilizando ferramentas populares para cada lado do desenvolvimento.

## Introdução

O Skupper é um projeto de software livre que fornece uma solução de rede de serviço para Kubernetes. O Skupper é desenvolvido pela Red Hat e está disponível sob a licença Apache 2.0. Essa é a versão upstream do Skupper, o que significa que é a versão que está sendo desenvolvida ativamente pela Red Hat.

Para os usuários que desejam implantar o Skupper em um ambiente de produção, a Red Hat oferece o Skupper, uma versão comercial do Skupper que é fornecida pela Red Hat sob o nome de Red Hat AMQ Interconnect. Essa é a versão downstream do Skupper, o que significa que é a versão portada para o Red Hat Enterprise Linux e como Opera com o Red Hat OpenShift.

>Apesar de serem projetos diferentes, o Skupper e o Skupper compartilham uma base de código comum e, portanto, é importante que as alterações feitas no Skupper sejam integradas ao RHSI (Red HaT Application Interconnect). Para isso, é necessário estabelecer um fluxo de trabalho eficiente que permita a integração contínua entre o Skupper e o RHSI.


## Definindo o ambiente e as ferramentas

Antes de começarmos, vamos configurar nosso ambiente de desenvolvimento. Para o lado downstream, faremos uso das seguintes ferramentas:

- Jira: uma ferramenta de gerenciamento de projetos que nos ajudará a rastrear e organizar as tarefas relacionadas ao desenvolvimento downstream.
- Confluence: uma plataforma de colaboração que usaremos para documentar informações importantes sobre o projeto.
- Git: um sistema de controle de versão que nos permitirá gerenciar nosso código fonte e colaborar com outros desenvolvedores.
- Quay.io: um registro de contêineres que nos ajudará a armazenar e distribuir nossas imagens de contêineres.
- Jenkins: uma ferramenta de automação de integração contínua que nos permitirá construir, testar e implantar nosso software de forma automatizada.

Por outro lado, para o desenvolvimento upstream, faremos uso das seguintes ferramentas:

- GitHub Issues: um recurso do GitHub que nos ajudará a rastrear e gerenciar problemas e solicitações de recursos relacionados ao desenvolvimento upstream.
- CircleCI: uma plataforma de integração contínua que nos permitirá construir, testar e validar nosso código de forma automatizada.

## Fluxo de trabalho

Agora que nosso ambiente está configurado, vamos explorar um fluxo de trabalho básico para a integração contínua entre o Skupper e o Skupper.

1. **Desenvolvimento Upstream**

   - Utilize o GitHub Issues para rastrear e gerenciar problemas e solicitações de recursos.
   - Faça uso do CircleCI para construir e testar o código do Skupper de forma automatizada.

2. **Integração Upstream-Downstream**

   - Após o desenvolvimento upstream estar pronto, abra uma solicitação de pull no repositório do Skupper.
   - Uma vez que a solicitação de pull seja aprovada, uma nova versão do Skupper é criada e publicada no Quay.io.

3. **Desenvolvimento Downstream**

   - Utilize o Jira para criar tarefas relacionadas às funcionalidades downstream.
   - Utilize o Git para clonar o código fonte do Skupper e iniciar o desenvolvimento downstream.
   - Use o Jenkins para automatizar a construção, teste e implantação do Skupper.

4. **Integração Downstream-Upstream**

   - Quando necessário, faça alterações no código do Skupper e abra uma solicitação de pull no repositório.
   - Após a aprovação da solicitação de pull, uma nova versão do Skupper é publicada.

## Exemplo prático

Para ilustrar o fluxo de trabalho descrito acima, vamos considerar um cenário em que estamos adicionando suporte para um novo protocolo de comunicação no Skupper e integrando essa funcionalidade ao Skupper.

1. **Desenvolvimento Upstream**

   - Abra um problema no GitHub Issues para rastrear a solicitação de suporte ao novo protocolo.
   - Escreva o código necessário para adicionar o suporte no Skupper.
   - Utilize o CircleCI para construir e testar o código automaticamente.

2. **Integração Upstream-Downstream**

   - Abra uma solicitação de pull no repositório do Skupper para incorporar as alterações.
   - Após a aprovação da solicitação de pull, uma nova versão do Skupper é publicada no Quay.io.

3. **Desenvolvimento Downstream**

   - No Jira, crie uma tarefa para adicionar suporte ao novo protocolo no Skupper.
   - Clone o repositório do Skupper usando o Git.
   - Adicione o suporte ao novo protocolo no código do Skupper.
   - Use o Jenkins para automatizar a construção, teste e implantação do Skupper com as novas alterações.

4. **Integração Downstream-Upstream**

   - Se necessário, faça alterações adicionais no código do Skupper e abra uma solicitação de pull.
   - Após a aprovação da solicitação de pull, uma nova versão do Skupper é publicada.

## Conclusão

A integração contínua entre o Skupper e o Skupper é essencial para garantir que as atualizações do software cheguem aos usuários de forma eficiente, mantendo a viabilidade comercial. Utilizando ferramentas como Jira, Confluence, Git, Quay.io, Jenkins, GitHub Issues e CircleCI, é possível estabelecer um fluxo de trabalho robusto e automatizado que agiliza o desenvolvimento upstream e downstream, permitindo a entrega contínua de software de alta qualidade.

Esperamos que este artigo tenha fornecido insights valiosos sobre a integração upstream e downstream e tenha demonstrado como essas ferramentas podem ser usadas em conjunto para um processo de desenvolvimento mais eficiente.

Obrigado por ler e continue explorando as possibilidades de integração contínua entre projetos de software livre e produtos comerciais!
