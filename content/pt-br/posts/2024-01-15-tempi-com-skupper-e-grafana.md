---
title: "TemPy: IoT com Raspberry Pi, Skupper e Grafana"
description: "Prova de conceito IoT com Raspberry Pi, sensor de temperatura e API REST, integrada via Skupper para visualizar métricas de temperatura no Grafana e Prometheus."
date: 2024-02-15
slug: "tempi-com-skupper-e-grafana"
tags: [skupper, raspberry-pi, iot, grafana, prometheus, opensource, networking, monitoring, temperature-sensor, raspberry]
toc: true
images:
  - "/assets/img/headers/tempy-com-skupper-e-grafana.webp"
---

![](/assets/img/headers/tempy-com-skupper-e-grafana.webp)

## Descrição

Este projeto é uma prova de conceito de uma arquitetura IoT com Raspberry Pi e um sensor de temperatura que expõe os dados por uma API REST. Junto com a API, há integração com qualquer provedor de nuvem usando [Skupper](https://skupper.io/), para visualizar os dados em um dashboard Grafana.

> Clone o repositório e siga as instruções para rodar o projeto. [https://github.com/rafaelvzago/skupper-tempy](https://github.com/rafaelvzago/skupper-tempy)

```bash
git clone https://github.com/rafaelvzago/skupper-tempy.git
```


## Sumário

- [Hardware](#hardware)
- [Configuração do Raspberry](#configuração-do-raspberry)
- [Captura de temperatura](#captura-de-temperatura)
- [Papel do Skupper](#papel-do-skupper)
- [Conexão com o cluster via Skupper e armazenamento no Prometheus](#conexão-com-o-cluster-via-skupper-e-armazenamento-no-prometheus)
- [Prometheus](#prometheus)
- [Grafana](#grafana)
- [Repositório](#repositório)

## Arquitetura

![arch](/assets/tempy-arch.png)

A arquitetura do projeto se divide nestas partes:

### Hardware

Componentes físicos usados no projeto: Raspberry Pi e sensor de temperatura.

- Raspberry Pi 3 Model B+ [Raspberry Pi 3 Model B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/)
- DS18B20 Temperature Sensor [DS18B20 Temperature Sensor](https://www.adafruit.com/product/381)
- 4.7kΩ Resistor [4.7kΩ Resistor](https://www.adafruit.com/product/2784)
- Breadboard [Breadboard](https://www.adafruit.com/product/64)
- Jumper Wires [Jumper Wires](https://www.adafruit.com/product/1956)


### Configuração do Raspberry

Setup e configuração do Raspberry Pi, incluindo software e bibliotecas necessárias.

- Ubuntu 23.04 server for Raspberry Pi [Ubuntu Installation](https://ubuntu.com/download/raspberry-pi)
- GoLang 1.18+ [GoLang Installation](https://golang.org/doc/install)
- Skupper Main [Skupper Installation](https://skupper.io/start/install.html)
- Podman > 4.3 [Podman Installation](https://podman.io/getting-started/installation)


### Captura de temperatura

![schema](/assets/tempy-schema.png)
- Créditos: [Raspberry Pi DS18B20 Temperature Sensor Tutorial](https://www.circuitbasics.com/raspberry-pi-ds18b20-temperature-sensor-tutorial/)

Aqui o sensor é ligado ao Raspberry Pi e o código de captura das leituras é implementado.

#### Configuração:

* Pinos GPIO do Raspberry Pi:
   * Pin 1 (3.3V) conectado ao pino VDD do DS18B20.
   * Pin 7 (GPIO 4) conectado ao pino DQ do DS18B20.
   * Pin 9 (GND) conectado ao pino GND do DS18B20.
* DS18B20:
   * O pino VDD é alimentado com 3.3V do Raspberry Pi.
   * O pino DQ vai para o GPIO 4 com um resistor pull-up.
   * O pino GND fica aterrado no Raspberry Pi.

#### Conexões:

* Um resistor pull-up de 4.7kΩ (R1) fica entre as linhas VDD e DQ.
* A linha VDD do DS18B20 usa um fio vermelho representando 3.3V do Raspberry Pi.
* A linha DQ usa um fio branco (dados) ligado ao GPIO 4 do Raspberry Pi.
* A linha GND usa um fio preto (terra) do Raspberry Pi.

#### Funcionamento:

* O sensor DS18B20 reporta temperatura pela interface 1-Wire, que precisa de apenas uma linha de dados (e terra) para falar com o Raspberry Pi.
* O resistor pull-up é necessário para o protocolo 1-Wire do DS18B20 funcionar corretamente.

#### API REST:

* Para expor a temperatura, a API REST é implementada em GoLang. Ela captura os dados e os disponibiliza para o provedor de nuvem.

```
go build tempy/tempy.go
```

* Encontre um jeito de rodar o binário tempy no Raspberry Pi; neste exemplo uso um `nohup` simples para deixar o processo em background.

```
nohup ./tempy &
```

* A API REST fica na porta 5000/temperature. Dá para acessar assim:

```bash
curl localhost:5000/temperature
```

### Papel do Skupper

Usamos Skupper para estabelecer a comunicação entre o Raspberry Pi e o provedor de nuvem, e para expor a temperatura na nuvem. Esta parte cobre o setup e a configuração do Skupper.

Skupper é um service interconnect de camada 7 que permite comunicação segura entre clusters Kubernetes, cobrindo protocolos de rede e de aplicação. Foi pensado para conectar serviços em infraestruturas diferentes e se baseia na ideia de um service bus. [Skupper](https://skupper.io/)

> Neste exemplo usamos skupper gateway para expor a temperatura na nuvem. É preciso ter um site Skupper rodando na nuvem e um skupper gateway no Raspberry Pi. O skupper gateway permite expor serviços que não estão em Kubernetes na rede Skupper; aqui ele expõe a temperatura para a nuvem.


Site Skupper:

1. Um namespace rodando Skupper. Neste exemplo aproveitamos o serviço Prometheus para guardar a temperatura, então inicializamos o Skupper no cluster com:
```bash
skupper init --site-name site1 --enable-console --enable-flow-collector
```

Gateway Skupper no Raspberry Pi:

* Para expor a temperatura na nuvem, usamos um skupper gateway com o comando:

```bash
 skupper gateway expose tempy localhost 5000 --type podman
```
### Conexão com o cluster via Skupper e armazenamento no Prometheus

Os dados capturados pelo Raspberry Pi são armazenados na nuvem com o provedor escolhido. Esta parte explica como os dados são guardados e gerenciados.

Neste exemplo fazemos o deploy de um Prometheus para armazenar a temperatura e de um prometheus-adapter para fazer scrape da API REST e gravar no Prometheus. Para facilitar, configuramos o service discovery do Prometheus para coletar de qualquer serviço rotulado como `app=metric`. Assim dá para acrescentar mais sensores e o Prometheus passa a coletar sozinho.

O serviço fica com o label `app=metric`, e o prometheus-adapter adiciona a temperatura ao serviço para o Prometheus fazer o scrape.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: tempy-prometheus-adapter-service
spec:
  type: ClusterIP
  selector:
    app: metrics
```
#### Prometheus Adapter:
1. Build da imagem TemPy prometheus-adapter:
```bash
podman build -t quay.io/YOUR-USER/tempy-prometheus-adapter:0.1 -f prometheus-adapter/Dockerfile-TempyPrometheusAdapter .
```
2. Push da imagem para o registry quay.io:
```bash
podman push quay.io/YOUR-USER/tempy-prometheus-adapter:0.1
```
3. Deploy do prometheus-adapter:
```bash
kubectl apply -f prometheus-adapter/TempyPrometheusAdapter-deployment.yaml
```
4. Expor o prometheus-adapter:
```bash
kubectl apply -f prometheus-adapter/TempyPrometheusAdapter-service.yaml
```
5. Verificar se o prometheus-adapter está rodando:
```bash
kubectl run -i --tty --rm curl-pod --image=curlimages/curl -- sh
curl tempy-prometheus-adapter:9090/metrics
...
# TYPE temperature_celsius gauge
temperature_celsius 19.81
# HELP temperature_fahrenheit Current temperature in Fahrenheit
# TYPE temperature_fahrenheit gauge
temperature_fahrenheit 67.66
```
6. Conferir o service do prometheus-adapter e se os labels estão sendo aplicados:
```bash
kubectl get svc tempy-prometheus-adapter-service -o wide
NAME                               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE   SELECTOR
tempy-prometheus-adapter-service   ClusterIP   10.43.154.250   <none>        9090/TCP   11h   app=metrics
```

### Prometheus

A temperatura fica armazenada em um serviço Prometheus. Esta parte cobre o setup e a configuração. Precisamos persistir os dados, então usamos um PVC; no meu caso uso a storage class longhorn, mas você pode usar qualquer uma disponível no cluster.

Este trecho da configuração do Prometheus faz scrape de qualquer serviço com label `app=metrics`, então o Prometheus coleta do prometheus-adapter. Note que a config só olha serviços no namespace `skupper-pi`; se usar outro namespace, ajuste o arquivo.

```yaml
...
      - job_name: 'metrics-targets'
        scrape_interval: 5s
        kubernetes_sd_configs:
          - role: service
            namespaces:
              names: ['skupper-pi']
        relabel_configs:
          - source_labels: [__meta_kubernetes_service_label_app]
            regex: metrics
            action: keep
...
```
1. Criar o PVC do Prometheus:
```bash
kubectl apply -f prometheus/prometheus-pvc.yaml
```
2. Criar o deployment do Prometheus:
```bash
kubectl apply -f prometheus/prometheus-deployment.yaml
```
3. Configurar o service discovery para scrape de serviços com `app=metrics`:
```bash
kubectl apply -f prometheus/prometheus-cm.yaml
```
4. Deploy do Prometheus:
```bash
kubectl apply -f prometheus/prometheus-deployment.yaml
```
5. Criar o service do Prometheus:
```bash
kubectl apply -f prometheus/prometheus-service.yaml
```
6. Verificar se o Prometheus está rodando. A partir daqui ele deve estar coletando do prometheus-adapter ou de qualquer serviço com `app=metrics`. Vamos consultar os serviços descobertos:
```bash
kubectl run -i --tty --rm curl-pod --image=curlimages/curl -- sh -c 'curl -G --data-urlencode "query=up" http://prometheus:9090/api/v1/query' | jq .
If you don't see a command prompt, try pressing enter.
warning: couldn't attach to pod/curl-pod, falling back to streaming logs: Internal error occurred: error attaching to container: container is in CONTAINER_EXITED state
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {
          "__name__": "up",
          "instance": "localhost:9090",
          "job": "prometheus"
        },
        "value": [
          1708523706.121,
          "1"
        ]
      },
      {
        "metric": {
          "__name__": "up",
          "instance": "promock.skupper-pi.svc:80",
          "job": "metrics-targets"
        },
        "value": [
          1708523706.121,
          "1"
        ]
      },
      {
        "metric": {
          "__name__": "up",
          "instance": "tempy-prometheus-adapter-service.skupper-pi.svc:9090",
          "job": "metrics-targets"
        },
        "value": [
          1708523706.121,
          "1"
        ]
      }
    ]
  }
}
...
```

### Grafana

Os dados de temperatura são visualizados em um dashboard Grafana. Esta parte cobre o setup e a configuração do dashboard.

* Para visualizar a temperatura, usamos um dashboard Grafana configurado para puxar dados do Prometheus e mostrar em gráfico. O deploy do Grafana é feito com os comandos abaixo.

* Para persistência, usamos um PVC. No meu cluster tenho longhorn instalado e uso ele; você pode usar qualquer outra storage class disponível.

1. Criar o PVC do Grafana:
```bash
kubectl apply -f grafana/grafana-pvc.yaml
```
2. Criar o deployment do Grafana:
```bash
kubectl apply -f grafana/grafana-deployment.yaml
```
3. Criar o service do Grafana:
```bash
kubectl apply -f grafana/grafana-service.yaml
```
Importante: meu cluster usa ingress controller, então preciso criar um ingress para expor o Grafana. Se o seu não tiver ingress, exponha com nodeport ou loadbalancer.

4. Criar uma conexão de data source no Grafana apontando para o Prometheus:
```bash
http://skupper-prometheus:9090
```

5. Importar o dashboard:
```bash
grafana/dashboard.json
```

6. Por fim, você deve conseguir visualizar a temperatura no dashboard Grafana.

![grafana](/assets/grafana-dashboard.png)

### Repositório

O código completo do projeto está neste repositório no GitHub: [TemPy](https://github.com/rafaelvzago/skupper-tempy)
