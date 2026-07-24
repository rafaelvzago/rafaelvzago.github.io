---
title: "Skupper + InstructLab: controlling and protecting AI (act 1)"
description: "How to deploy and operate AI models securely in hybrid environments, using Skupper and InstructLab to keep sensitive data protected end to end."
date: 2025-05-02
slug: "controlando-progetendo-ia-deepseek-skupper-istio-primeiro-ato"
tags: [ai, deepseek, skupper, instructlab, openshift, security, hybrid-cloud, architecture, llm, internet]
toc: true
images:
  - "/assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt1.png"
---

![](/assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt1.png)

## The story behind this solution pattern

Growing demand for AI-driven applications brings a hard problem: how do you deploy and operate AI models securely in environments that need strict data protection, while those models still have to be reachable by public services? That need became clear while building a local AI chatbot meant to handle sensitive and proprietary information — we needed a design that kept the model inside a protected environment.

Using **Skupper**, the team built a pattern where AI models served via **InstructLab** stay isolated on private infrastructure, yet remain reachable through secure connections from public **OpenShift** environments. The goal was full control over data and model security without giving up the flexibility to scale and serve external users.

This pattern came from the search for balance among security, performance, and accessibility — especially for organizations adopting hybrid cloud. With **Skupper** tying the AI stack together, the team enabled continuous communication between private and public environments without weakening data protection or operational efficiency.

With this architecture, companies can keep innovating with AI and machine learning while meeting the compliance and security bars that health, finance, and other data-sensitive domains require.

A fast, efficient model also matters. DeepSeek is an open-source model tuned for performance and security, a solid fit when you need quick, accurate answers while keeping data private. We will use **DeepSeek-R1-Distill-Qwen-1.5B**, an open-source model optimized for performance and security, well suited to apps that need fast, accurate responses.

## The Solution

**Solution summary**

This solution pattern shows, in practice, how to deploy and expose a local AI chatbot securely with **Skupper** and **InstructLab**. You can train and serve models in a protected environment so sensitive data stays safe — even when the chatbot must be reached by external users through OpenShift.

The main pieces are:

- **InstructLab**, which manages and serves AI models on private, secure infrastructure.
- **Skupper**, which sets up secure, continuous communication between isolated and public environments.
- A **Virtual Application Network (VAN)** that safely connects two sites: a private site hosting the AI model, and a public OpenShift site that exposes the chatbot to external users.
- An optimized model such as **DeepSeek-R1-Distill-Qwen-1.5B**, which delivers fast, accurate answers while preserving data privacy.

## Architecture

This architecture is a secure way to deploy a local AI chatbot, using **InstructLab** and **Skupper** for data privacy and continuous communication across isolated environments. The model runs privately; the service is published through an OpenShift deployment — external access without giving up protection of the data or the model itself.

Key points:

- **InstructLab**: hosts, trains, and serves the AI model in a secure environment.
- **DeepSeek-R1-Distill-Qwen-1.5B**: a model optimized for performance and security, ideal when you need fast, accurate answers.
- **Skupper**: builds a **Virtual Application Network (VAN)** between private and public environments for secure communication.
- **OpenShift/Kubernetes**: deploys the chatbot so external users can reach it in a controlled way.
- **Podman**: manages containers lightly and securely, simplifying InstructLab and chatbot deployment.

**IMPORTANT:** Services hosted in different environments can talk securely through **Skupper**, protecting both the data and the AI model and keeping external access controlled.

### Architecture diagram

![Architecture Overview](/assets/implantando-chatbot-instructlab-openshift.png)

## Common Challenges

1. **Secure model hosting**: Protect sensitive AI models while still allowing controlled external access.

2. **Hybrid connectivity**: Enable communication between private and public environments without weakening security.

3. **Data privacy**: Keep private data in a protected environment while still returning real-time AI answers to external users.

4. **Scalability**: Let the chatbot scale as needed without trading away security or privacy.

5. **Visibility and monitoring**: Provide visibility into traffic and interactions across environments so communication stays secure and efficient.

## Technology Stack

- **Platforms and tools**:

    - [Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift)
          Red Hat OpenShift is a Kubernetes-based container platform for building, deploying, and managing containerized applications. It gives you a solid base to scale and automate apps in hybrid cloud with reliability and security.
    - [InstructLab](https://instructlab.ai/)
          InstructLab is an AI model platform that simplifies training, serving, and managing large language models. It is designed to be flexible and secure — a good fit when models must stay private but still answer external requests over controlled access paths.
      - [DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek/DeepSeek-R1-Distill-Qwen-1.5B)
          DeepSeek-R1-Distill-Qwen-1.5B is an open-source AI model optimized for performance and security, ideal for apps that need fast, accurate answers. It is built to be light and efficient while keeping data private and delivering high-quality results.
    - [Podman](https://www.podman.io/)
          Podman is a container engine that lets you manage containers without a daemon. It provides a secure, lightweight runtime for AI models and services in isolated environments.
    - [Skupper](https://skupper.io/)
          Skupper is a distributed, secure messaging platform for communication between services across environments. It creates a secure network overlay so services can interact without exposing sensitive data directly. We will use the Skupper CLI to create a secure connection between the private and public sites.
    - [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
            NGINX Ingress Controller exposes HTTP and HTTPS services from inside a Kubernetes cluster. It provides load balancing, SSL termination, and name-based routing — a solid way to expose web apps securely and efficiently.

## A closer look at the solution architecture

This architecture is a hybrid setup where the AI model is trained and served via **InstructLab** in a private environment (Private Local Environment) and is only reachable by external users through a public **Kubernetes** site, with **Skupper** providing secure communication. **Skupper** keeps data exchanged between those sites safe by creating a **Virtual Application Network (VAN)** between them.

## Exposing Services with NGINX Ingress

To expose the AI chatbot to external users, we use the **NGINX Ingress Controller**, which provides:

- **Load balancing**: Efficient traffic distribution across multiple instances
- **SSL/TLS termination**: Encrypted connections
- **Advanced routing**: Path- and host-based routing
- **LoadBalancer Service**: Direct access with an external IP from the cloud provider

That gives you a robust, scalable way to expose AI applications securely on Kubernetes.

## Architecture Overview

The **Private Local Environment** hosts the AI model with InstructLab and is responsible for:

- Receiving user input exclusively from the OpenShift Cluster (OpenShift).

- Sending that input to the LLaMA3 model for processing.

- Returning the model response to the OpenShift Cluster securely.

The public **Kubernetes Cluster** is responsible for:

- Exposing the AI chatbot to external users via NGINX Ingress or LoadBalancer.

- Forwarding requests to the private InstructLab model in the Private Local Environment.

- Showing the AI response from the model hosted in the Private Local Environment.

By design, the model running in the private environment is isolated and cannot be reached directly by external clients. All interaction is mediated by the public Kubernetes cluster, so the model stays protected while external users can still use the chatbot safely.

## What about the AI model?

The model in this solution is **DeepSeek-R1-Distill-Qwen-1.5B**, an open-source AI model optimized for performance and security, ideal when you need fast, accurate answers. It is designed to be light and efficient while keeping data private and delivering high-quality results.

InstructLab's advantage is that it lets you train and serve models securely so sensitive data stays protected. It simplifies training and serving, which makes it a strong choice when security and privacy matter. In this solution we download **DeepSeek-R1-Distill-Qwen-1.5B** from Hugging Face, convert it to the required format, and train it with InstructLab.

## The Rise of DeepSeek: A Perfect Storm of Performance, Price, and Open Source

Excitement around DeepSeek's AI models comes from a strong mix of solid performance, disruptive cost efficiency, and a commitment to open-source principles. That combination helped the company carve out space in a market dominated by giants such as OpenAI, Google, and Meta.

### Key differentiators: What sets DeepSeek apart

The main differences between DeepSeek and other well-known models such as GPT, Llama, and Mistral lie in **architecture**, **performance-to-cost ratio**, and **open-source philosophy**.

#### Architectural efficiency: The Mixture of Experts (MoE) advantage

At the core of DeepSeek's efficiency is a **Mixture of Experts (MoE)** architecture. Unlike traditional models that activate all parameters for every task, an MoE model is made of many smaller "expert" networks. For any input, the model routes the work to the most relevant experts. That sparse activation means significantly lower compute cost and faster inference without a proportional drop in quality.

#### Disruptive economics: High performance at lower cost

A major driver of the DeepSeek buzz has been remarkable **cost efficiency**. The API for DeepSeek models is considerably cheaper than competitors such as OpenAI's GPT series. Reports also suggest DeepSeek models were trained on a fraction of the budget of other large-scale models. High performance — especially in demanding areas like programming and math — at a much lower price made it attractive to developers and companies.

#### The power of open source

In a landscape where many of the strongest models are proprietary and closed, DeepSeek took an **open-source** approach for many of its models. That strategy has several advantages:

* **Transparency and trust:** Opening the model lets the global research and development community analyze, understand, and build on the technology, which builds trust.
* **Faster innovation:** By making models accessible, DeepSeek encourages a collaborative environment where developers can improve them and adapt them to a wide range of applications.
* **Accessibility:** It lowers the barrier for smaller companies and individual developers who cannot afford expensive proprietary models.

### Why the hype: A confluence of factors

Excitement around DeepSeek comes from those factors lining up together:

* **Challenging the "bigger is better" narrative:** DeepSeek's success showed that strong performance can come from smarter architecture and training methods, not only from massive compute. That sparked a broader conversation about the future of AI development and the sustainability of ever-larger models.
* **Strong benchmark results:** DeepSeek models have consistently ranked at or near the top of several benchmarks, especially in **programming and math**. That drew serious attention from the technical community.
* **A viable alternative:** Low cost plus high performance positioned DeepSeek as a compelling alternative to more established — and often more expensive — models, especially for developers who want powerful, efficient models for specialized work.
* **Geopolitical and market dynamics:** As a prominent AI lab from China, DeepSeek's rise also introduced a new dynamic in the global AI landscape, challenging the dominance of US-based companies and fueling discussion about democratizing advanced AI technology.

## About the Technology Stack

This solution uses **Skupper** and **InstructLab** to secure the AI model deployment. **Kubernetes** handles flexible scaling of the chatbot with NGINX Ingress and LoadBalancer services, while **Skupper** enables continuous, secure communication between isolated sites — a solid hybrid cloud setup for AI-driven applications.

## Next Steps

To see this solution in action and learn how to implement it step by step, continue with the next article: **"Controlling and securing AI models with DeepSeek, Skupper, and InstructLab - Act Two"**, where we cover the technical implementation details.

## References

- [Commands extracted from the InstructLab project](https://github.com/instructlab)
- [InstructLab installation guide](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)
- [Chatbot ILAB Frontend](https://github.com/rafaelvzago/ilab-client)
- [DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek/DeepSeek-R1-Distill-Qwen-1.5B)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [Skupper Documentation](https://skupper.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Podman Documentation](https://docs.podman.io/)
