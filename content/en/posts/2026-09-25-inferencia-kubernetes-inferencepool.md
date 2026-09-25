---
title: "How an inference request finds a pod in Kubernetes"
description: "At KCD São Paulo 2026, I show how Istio, HTTPRoute, InferencePool, and EPP route inference to pods, with two simulated profiles, a 404 case, and no GPU."
date: 2026-09-25
slug: "inferencia-kubernetes-inferencepool"
tags: [ai, llm, kubernetes, networking, service-mesh]
toc: true
images:
  - "/assets/img/headers/openshift-service-mesh-3.png"
---

![Istio icon connected to a network of nodes](/assets/img/headers/openshift-service-mesh-3.png)

I built an inference demo for [Kubernetes Networking na era da Inteligência Artificial](https://kcd-sp-2026.kube.rip/), the talk I'm giving with Ricardo Katz at [KCD São Paulo 2026](https://community2.cncf.io/events/details/cncf-kcd-brasil-presents-kcd-sao-paulo-2026/). My part follows one request from an Istio Gateway through an `InferencePool` to a pod simulating a model.

In the demo, I separate two decisions: the Gateway selects a route using an HTTP header; the Endpoint Picker (EPP) selects a pod inside the pool. If the header matches no route, the request ends at the Gateway with a 404.

## One request, two decisions

The client runs inside a Kind cluster and sends `POST /v1/chat/completions` using an OpenAI-compatible API format. The body includes `model`, but that field does not select the pool in this demo. The `X-Demo-Pool` header does.

Here is the path:

```text
client (pod in Kind)
  -> Istio Gateway
  -> HTTPRoute (path + X-Demo-Pool)
  -> InferencePool
  -> Endpoint Picker (EPP)
  -> llm-d-inference-sim pod
```

There is one `HTTPRoute` for `fast` and another for `quality`. Each route's `backendRef` points to its `InferencePool`. This is an excerpt from [`fast-route`](https://github.com/rafaelvzago/kcd-ai-networking-demo/blob/main/k8s/model-routes.yaml):

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: fast-route
  namespace: ai-networking-demo
spec:
  parentRefs:
    - name: fast-inference-gateway
  rules:
    - matches:
        - path: {type: PathPrefix, value: /v1/chat/completions}
          headers:
            - name: x-demo-pool
              value: fast
      backendRefs:
        - group: inference.networking.k8s.io
          kind: InferencePool
          name: fast-router
```

With `X-Demo-Pool: fast`, the Gateway matches that route and uses `fast-router`. The EPP associated with the pool selects an eligible pod. For `quality`, the other route points to `quality-router` and its EPP.

There is no Inference Payload Processor (IPP) installed here. In this demo, the `HTTPRoute` rules choose between pools; the Gateway does not read the `model` field to make that choice.

The [interactive overview](https://kcd-sp-2026.kube.rip/diagrams/flow-inference-pool.html) lets you step through the path and inspect each resource.

## Two profiles, two paths

`fast` and `quality` are two simulator profiles. They share a Gateway but have separate routes, pools, and pods:

- `fast`: `fast-route` → `fast-router` → 3 `fast-simulator` pods; configured TTFT: 100 ms.
- `quality`: `quality-route` → `quality-router` → 1 `quality-simulator` pod; configured TTFT: 500 ms.

`llm-d-inference-sim` runs in `echo` mode. It accepts the request format, returns `usage`, and exposes the responding pod in the `x-inference-pod` header. No real LLM sits behind these names, so `quality` is not a measure of answer quality. It names the second profile, with a different configured delay.

A call from the client inside the cluster looks like this:

```bash
kubectl --context kind-kcd-ai-networking-demo -n ai-networking-demo \
  exec deployment/fast-client -- \
  curl -sS -i \
    -H 'Content-Type: application/json' \
    -H 'X-Demo-Pool: fast' \
    -d '{"model":"fast","messages":[{"role":"user","content":"Hello KCD"}]}' \
    http://fast-inference-gateway-istio.ai-networking-demo.svc.cluster.local/v1/chat/completions
```

I check `x-inference-pod` first. It tells me whether a `fast-simulator` or `quality-simulator` served the request. The response body contains `usage`, as expected for this API format. The [fast profile flow](https://kcd-sp-2026.kube.rip/diagrams/flow-fast.html) and [quality profile flow](https://kcd-sp-2026.kube.rip/diagrams/flow-quality.html) show the paths separately.

In the recording, I also send 12 concurrent requests to `fast`. They reach all three replicas, but the request counts differ between pods. This shows endpoint selection at work; it does not promise round-robin or an even split on every run.

## A header with no route

I send the same API request with `X-Demo-Pool: invalid`. Neither `HTTPRoute` matches that value. The Istio Gateway returns HTTP 404 before consulting an `InferencePool` or EPP, and the response has no `x-inference-pod` header.

That helps locate the failure. If the request never found a route, there is no reason to debug the model. The [invalid-pool flow](https://kcd-sp-2026.kube.rip/diagrams/flow-invalid.html) stops at the Gateway for the same reason.

## What the stopwatch measures

I configured the `fast` simulator with a 100 ms time to first token and `quality` with 500 ms. The demo script uses curl's `time_starttransfer` to compare the requests. That measures time to first byte as seen by the client, including the network and Gateway. It is a useful approximation here, not an isolated measurement of model TTFT.

The recorded responses include `usage`; the validation checks which pod replied and whether `fast` delivers its first byte before `quality`. It does not demonstrate GPU performance, real LLM throughput, token savings, or answer quality. The simulator makes routing visible without a GPU or an external provider.

The cluster is prepared before the recording. Images and charts are cached for offline installation; during the recorded run, I inspect the resources and send the requests. The [project README](https://github.com/rafaelvzago/kcd-ai-networking-demo#readme) has the prerequisites and setup commands if you want to run it yourself.

## Watch the demo

[The inference demo recording](https://kcd-sp-2026.kube.rip/inference-demo.html) pauses at each step so you can inspect the pods, routes, and responses without racing the terminal. The [demo code](https://github.com/rafaelvzago/kcd-ai-networking-demo) includes the manifests, validation scripts, and diagrams.
