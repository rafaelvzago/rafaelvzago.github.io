---
layout: post
title: "Using Skupper and OpenShift AI/ML to Prevent Insurance Fraud"
date: 2024-06-17 00:00:00 -0300
categories: [AI, Skupper]
tags: [zago, rafael]
image:
  path: /assets/img/headers/AI-com-skupper-para-previnir-fraudes.webp
  alt: Zago
---

## Description

This workshop demonstrates how to use Skupper to connect local data services to cloud-based AI/ML environments. The workshop includes a Go application in a podman container that exposes internal data for Skupper connection. The AI/ML model training is performed in an OpenShift AI cluster on AWS using Openshift AI/ML services.


## Disclaimer

This lab uses the example from the [AI/ML Workshop](https://github.com/rh-aiservices-bu/insurance-claim-processing) created by the Red Hat AI Services team. The original workshop is available on GitHub and includes all the necessary information to run the lab. The lab was adapted to use Skupper to connect the local data services to the cloud-based AI/ML environment.

In order to faciliate the execution, for those who have access to the [demo.redhat.com](https://demo.redhat.com) environment, you can start the lab by clicking [here](https://demo.redhat.com/catalog?search=insurance&item=babylon-catalog-prod%2Fsandboxes-gpte.ocp-wksp-ai-insurance-claim.prod). If you don't have access to the demo environment, you can follow the steps at the gitub repository mentioned above.

## Workshop Overview

![Solution](/assets/ai-skupper-solution.png)

This lab demonstrates how AI/ML technologies can solve a business problem. The information, code, and techniques presented illustrate a prototype solution. Key steps include:

1. Storing raw claim data within the company.
2. Using a Go application in a podman container to expose internal data for Skupper connection.
3. Setting up AI/ML model training in an OpenShift AI cluster on AWS.
4. Connecting local data to cloud-based AI/ML services using Skupper.


## Skupper Role

![Skupper](/assets/ai-skupper.png)

Skupper provides secure, efficient connections between different environments. In this workshop, it connects local data services containing sensitive insurance claim information to a cloud-based AI/ML environment. This secure connection allows remote data access and processing while maintaining data integrity and security.

### Process Structure

- Context
- Connection and Setup
- LLM for Text Summarization
- LLM for Information Extraction
- LLM for Sentiment Analysis

## Scenario

We are a multinational insurance company undergoing digital transformation. A small team has analyzed the claims process and proposed improvements. The goal is to integrate the claims processing solution with text analysis using our API in a Kubernetes cluster on AWS.

## Challenges

### Using Skupper to Ensure Data Security and Integrity

1. Maintaining data integrity and security: Skupper encrypts all data traffic, ensuring sensitive data protection during transmission.
2. Processing emails with OpenShift AI in the on-premises datacenter.
3. Keeping applications with sensitive data within the company.
4. Ensuring secure connections between data services and datacenters.

## Prototyping Work Examples

### Using an LLM for Text Summarization

An LLM can summarize long emails, allowing insurance adjusters to quickly understand key details.

![text-summarization](/assets/ai-skupper-summarization.png)

### Using an LLM for Information Extraction

![information-extraction](/assets/ai-skupper-llm-info-extract.png)

An LLM extracts key information from emails and automatically populates structured forms.

### Using an LLM for Sentiment Analysis

An LLM identifies customer sentiment, allowing for prompt action based on text tone.

![sentiment-analysis](/assets/ai-skupper-sentiment.png)

## How to Use LLMs?

- [Notebook for using LLM](https://github.com/rh-aiservices-bu/insurance-claim-processing/blob/main/lab-materials/03/03-01-nb-llm-example.ipynb)
- [Notebook for text summarization with LLM](https://github.com/rh-aiservices-bu/insurance-claim-processing/blob/main/lab-materials/03/03-02-summarization.ipynb)
- [Notebook for information extraction with LLM](https://github.com/rh-aiservices-bu/insurance-claim-processing/blob/main/lab-materials/03/03-03-information-extraction.ipynb)
- [Notebook for comparing LLM models](https://github.com/rh-aiservices-bu/insurance-claim-processing/blob/main/lab-materials/03/03-04-comparing-models.ipynb)

## Part 2: Hands-On

### Activities

0. Install Skupper binary
1. Install Skupper locally
2. Install Skupper on the OpenShift Cluster
3. Linking the sites
4. Run the application inside the podman site and expose the service
5. Execute the workshop with modified examples

### Steps

0. Installing the Skupper binary
    ```sh
    curl https://skupper.io/install.sh | sh
    ```

1. Installing Skupper on the podman site
    ```sh
    export SKUPPER_PLATFORM=podman
    podman network create skupper
    skupper init --ingress none
    ```

2. Install Skupper on the OpenShift Cluster
    ```sh
    skupper init --enable-console --enable-flow-collector --console-user admin --console-password admin
    ```

3. Linking the sites

    - Creating the token on the most exposed cluster
        ```sh
        skupper token create /tmp/insurance-claim
        ```
    - Linking the podman site to the most exposed cluster
        ```sh
        skupper link create /tmp/insurance-claim --name ai
        ```

4. Running the application inside the podman site and exposing the service
    ```sh
    podman run -d --network skupper -p 8080:8080 -v /home/rzago/Code/go-flp/data:/app/data --name insurance-claim-data quay.io/rzago/insurance-claim-data:latest
    skupper service create backend 8080
    skupper service bind backend host insurance-claim-data --target-port 8080
    skupper service create backend 8080
    ```

### Successful Connection

![Console](/assets/ai-skupper-successful-connection.png)

### Final Topology

![Topology](/assets/ai-skupper-final-topology.png)

Testing the connection to the podman site service from the OpenShift cluster
    
```sh
oc exec deploy/skupper-router -c router -- curl http://backend:8080/claim/claim1.json
```

## Next Steps

Now you can continue with the workshop until generating the sentiments of the emails.

## Conclusion

This workshop demonstrates how to use Skupper to connect local data services to cloud-based AI/ML environments. The workshop includes a Go application in a podman container that exposes internal data for Skupper connection. The AI/ML model training is performed in an OpenShift AI cluster on AWS using Openshift AI/ML services.
