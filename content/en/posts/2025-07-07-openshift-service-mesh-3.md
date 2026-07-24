---
title: "OpenShift Service Mesh 3: what changes with Istio"
description: "What changes in OpenShift Service Mesh 3: Istio upstream replaces Maistra, Ambient Mode, upgrades, gateways, multi-cluster, and migration prep."
date: 2025-07-07
slug: "openshift-service-mesh-3"
tags: [openshift, service-mesh, Istio, kiali, ambient-mode, devops, security, observability, redhat, migration]
toc: true
images:
  - "/assets/img/headers/openshift-service-mesh-3.png"
---

![](/assets/img/headers/openshift-service-mesh-3.png)

## Overview

[OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 (OSSM3) replaces Maistra with upstream Istio as the core of the solution. Maistra was a Red Hat-maintained custom fork of Istio; with OSSM3, the base is Istio straight from the community project — no custom patches, no rebase.

Concrete changes include: control plane upgrades can be in-place or revision-based (canary), Kiali must be installed separately via the Kiali Operator, and multi-cluster support uses the standard upstream Istio topologies.

At the Istio level, control becomes cluster-scoped, with global visibility. Important changes include removing gateway management from the operator (now done via route or service injection), discontinuing the Istio Operator Resource (IOR), and ending support for mesh federation — contact Red Hat directly for specific needs.

Finally, OSSM3 brings Istio Ambient Mode, highlighting Zero Trust Tunnels (ztunnel), Waypoints (Envoy) for advanced Layer 7 features, and sidecarless operation that reduces resource use and simplifies the architecture.

---

## Comparing OpenShift Service Mesh 2 and 3

| [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2 | [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 |
| :--- | :--- |
| Istioctl not supported | Istioctl supported - diagnostic utilities |
| Gateways and Routes created automatically | Gateways and routes created by users |
| Observability components managed by the [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) operator | Observability components managed independently |
| Kubernetes Network Policies isolate a [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) by default | Kubernetes network policies are not created; users can define them |
| Multiple control planes by default | Cluster-wide by default |
| Federation for multiple clusters | Istio multi-cluster topologies + federation (coming soon) |

## Features and Benefits

![OpenShift Service Mesh Features](assets/openshift-service-mesh-3-features.png)

### Security Focus

mTLS is enabled by default between services in the mesh. Authorization policies let you define who can talk to whom using namespace selectors, service accounts, or workload labels.

### Traffic Management

Istio VirtualServices and DestinationRules control load balancing, retries, timeouts, and fault injection. The Kubernetes Gateway API is also supported in OSSM3 on OCP 4.19+.

### Multicluster Topologies

OSSM3 supports the upstream Istio multi-primary, primary-remote, and external control plane models. That lets you spread the mesh across clusters in different zones or regions.

### Telemetry

The OpenShift Console shows Istio metrics via the Console Plugin. For distributed tracing, Red Hat recommends moving to OpenTelemetry + Tempo.

### Policy Enforcement

AuthorizationPolicies control traffic based on source, destination, and request attributes. PeerAuthentication sets the mTLS mode per namespace or workload.

### Observability

The OpenShift Service Mesh Console Plugin shows component health, traces, and logs. Kiali, installed separately, adds topology visualization and Istio configuration validation.

## Key Changes and Features

### Istio replaces Maistra

The main change from OSSM 2.x to 3 is adopting upstream Istio as the core, replacing Maistra (a customized Istio distribution). In practice, OSSM3 uses the CRDs, operators, and default behaviors from the Istio project — without Maistra-specific patches. Upstream features and fixes arrive without a rebase, and community Istio docs apply directly to OSSM3.

### Upgrade Strategies

OSSM3 offers two Istio control plane upgrade strategies, configured via the `upgradeStrategy` field:

- **InPlace**: Updates the existing control plane in the cluster. After the update, you must restart workloads so they use the new Istio version. Simpler, but involves brief unavailability while pods restart.
- **RevisionBased (Canary)**: Creates a new Istio control plane alongside the existing one, allowing gradual workload migration from the old version to the new one. Lower risk: you can validate the new version with a subset of workloads before migrating everything.

#### Example Istio CR for OSSM3

```yaml
apiVersion: sailoperator.io/v1
kind: Istio
metadata:
  name: default
spec:
  version: v1.24.3
  namespace: Istio-system
  updateStrategy:
    type: InPlace
  values:
    pilot:
      resources:
        requests:
          cpu: 100m
          memory: 1024Mi
```

### Observability with Kiali Console

OSSM3 supports the **Kiali Console** through a separate operator for observability. Kiali is not new to v3 — it was also supported in v2. In v2, Kiali was installed by default; in v3 you install it separately. That reflects the idea that OSSM 3 can integrate with a wide range of solutions; the Sail operator manages only Istio.

Kiali shows the mesh topology as a service graph, with latency and error-rate metrics per edge. It validates Istio configuration — malformed VirtualServices, PeerAuthentication conflicts, references to missing hosts — and shows distributed traces when integrated with Jaeger or Tempo.

### Request Authentication with JWT

OSSM3 provides solid support for request authentication based on JSON Web Tokens (JWT), enabling secure identity validation in service-to-service communication. This is essential for zero-trust architectures and ensuring only authenticated requests reach protected resources.

#### Main Features

OSSM3 `RequestAuthentication` validates JWTs using a JWKS URI — public keys are fetched automatically. You can configure multiple issuers at once, extract specific claims for use in `AuthorizationPolicy`, validate the token `aud` field, and propagate the original token to destination services.

### Operators

#### OSSM3 Operator

The [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 operator was redesigned with a narrower, more focused scope. Unlike earlier versions, the OSSM3 operator installs and manages only Istio, simplifying its responsibility and improving operational efficiency.

#### Kiali Operator for Observability

For observability, OSSM3 uses the **Kiali Operator** as a separate component. The core idea is simple: the Sail Operator manages Istio, and the Kiali Operator manages Kiali — each updates on its own release cycle. If a new Kiali version fixes a visualization bug, you update the Kiali Operator without touching the Istio control plane.

### Gateways in OpenShift Service Mesh 3

A gateway manages traffic entering and leaving the [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh).

It is a standalone Envoy proxy managed by the [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) control plane. You can configure it with an Istio Gateway resource as:

- An *ingress* gateway — an entry point into the mesh.
- An *egress* gateway — an exit point from the mesh.

Starting with [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2.6, you could also configure gateways with the Kubernetes Gateway API. That was technically true, but in hindsight the implementation was immature. We strongly recommend that users interested in the Gateway API use OSSM v3 on OCP 4.19 or later, where the CRDs are properly managed and supported on the underlying OpenShift platform.

In [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3, gateways are no longer managed by the operator. That brings more simplicity and flexibility, and encourages the recommended practice of managing gateways alongside applications.

Gateways can be created with:

- Gateway injection using a Kubernetes `Deployment`, exposed via:
  - An OpenShift `Route` resource.
  - A Kubernetes `Service` of type `LoadBalancer`.
- Kubernetes Gateway API resources.

## Scalability & Multi-Tenancy in OpenShift Service Mesh

Before implementing [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) across multiple clusters, consider the motivation.

Motivations can include:

- High availability of services across clusters, regions, zones, and so on.
- Managing Istio policies across multiple clusters from a single control plane.
- Scaling [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) policies in a large organization with multiple teams.
- Sharing services across clusters without exposing them publicly.

### Multi-Cluster Models

| Model                  | Description                                                                                                                      | Characteristics                                                                                               |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Multi-Primary** | Each cluster has an Istio control plane that manages both local and remote services.                          | Higher availability.<br>More cross-cluster configuration and state synchronization.                         |
| **Primary-Remote** | A single control plane manages all configuration, including remote clusters.                                  | No redundancy.<br>Less cross-cluster configuration and state sync required.                    |
| **External Control Plane** | For stronger isolation, the control plane can be deployed on a cluster completely separate from the data plane clusters. | Isolates management components from data plane components.<br>Supports a *hub* cluster model. |

## Migrating to Red Hat OpenShift Service Mesh 3

![Migration](assets/openshift-service-mesh-3-migration.png)

There are several things customers can do TODAY to prepare for the upgrade to [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3:

- Upgrade to the latest available [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2.6
- Move to Gateway Injection to create and manage all Gateways
- Disable IoR (Istio on Routes) and manage Gateways explicitly with Route resources
- Use OpenShift user-defined project monitoring for metrics
- Migrate to OpenTelemetry and Tempo for distributed tracing
- Configure an external Kiali resource to manage Kiali
- Disable [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2.6 network policy management
- Detailed procedures for all of the above are in the migration guide.

### Migrating workloads to OpenShift Service Mesh 3

The documented migration procedures aim to move workloads to Red Hat [OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 while keeping application connectivity.

- The [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 2 and 3 control planes are deployed in parallel in the same *namespace* (for example, `Istio-system`).
- Workload *labels* are then configured to migrate to the [Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh) 3 control plane on the next *rollout*.

## Istio Ambient Mode (Developer Preview) "Sidecar-less" [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh)

One of the biggest drawbacks of traditional service meshes has been the requirement that every application pod have a *sidecar* proxy.

![openshift-service-mesh-sidecars](assets/openshift-service-mesh-sidecars.png)

### Benefits and Challenges of Envoy Sidecar Proxies

| Benefits | Challenges |
| :--- | :--- |
| Highly customizable through Istio APIs, enabling a feature-rich [service mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh). | With Envoy's flexibility comes complexity! |
| A simple deployment model - one proxy per pod. | Requires modifying application pods to inject proxies. |
| Efficient resource use when carefully managed. | One proxy per pod means many proxies! |
| Acceptable latency for most user-facing applications. | Without careful management, resource use can get out of control! |
| | Performance impact for low-latency, high-throughput applications can be unacceptable. |
| | Can be "too heavy" if only a few mesh features are needed. |

### Istio Ambient Mode Components

![Istio Ambient Mode](assets/openshift-service-mesh-ambient-mode.png)

- **Istio-cni**: A *daemonset* that configures pod traffic redirection with ztunnel.
- **Ztunnel**: A per-node proxy to handle Layer 4 (L4) features efficiently.
  - A lightweight, high-performance proxy "written in Rust", specific to Istio.
  - Enables mesh features such as mTLS encryption, L4 policies, and telemetry.
- **(Optional) Waypoint**: An independently scalable proxy for Layer 7 (L7) features.
  - Enables features such as HTTP policies, telemetry, and traffic management.
  - An Envoy proxy, similar to a gateway.
  - Deployed per *namespace* by default (changed with *labels*).

### Scope of ZTunnel vs. Waypoint Proxies

**ZTunnels** operate at a per-node scope. A single ZTunnel proxy instance runs as a `DaemonSet` on each worker node. That design is highly efficient: one lightweight instance can manage all Layer 4 (L4) traffic — mTLS encryption, authentication, and basic authorization policies — for every pod scheduled on that node. By centralizing L4 at the node level, Ambient Mode significantly reduces resource consumption and management complexity compared with the traditional one-sidecar-per-pod model.

By contrast, **Waypoint** proxies are deployed by default at a per-*namespace* scope, or more specifically per service account. When advanced Layer 7 (L7) features such as load balancing, complex traffic management, and HTTP-based policies are needed for a service, a dedicated Waypoint proxy is deployed for that *namespace*. That more robust Envoy proxy intercepts the relevant traffic and applies the required L7 policies. Teams can selectively enable L7 features only for workloads that need them, isolating resource use and configuration complexity to the corresponding *namespace* instead of loading the entire mesh.

### Zero Trust Tunnels (Ztunnels)

- **"ztunnel"** proxies run as a `DaemonSet` at the node level.
- For pods that are "in the mesh", all traffic (even local traffic on the node) goes through the local ztunnel proxy so it can apply policies and report telemetry.
- The common Ambient Mode diagram simplifies how Ztunnel works:
  - Traffic interception happens inside the pod's network *namespace* (not on the *host*).
  - That ensures unencrypted traffic never leaves the pod's network isolation — exactly like a *sidecar*!
  - Even local node traffic is processed by ZTunnel.

---

## Conclusion

The most relevant change in OSSM3 is the upstream Istio base — no fork, no Maistra-specific patches. That shrinks the gap between what community docs say and what the cluster actually does. Migration takes work: the v2 and v3 control planes run in parallel during the transition, and gateways need to be recreated via manual injection. Ambient Mode is still Developer Preview — if you need production support, stick with the sidecar model for now.

---

## References

- **[OpenShift Service Mesh](https://www.redhat.com/en/technologies/cloud-computing/openshift/what-is-openshift-service-mesh)**
- **[Istio](https://Istio.io/)**
- **[Kiali](https://kiali.io/)**
- **[Argo Rollouts](https://github.com/gitops-examples/rollouts-demo-osm)**
- **[Envoy Proxy](https://www.envoyproxy.io/)**
- **[Kubernetes](https://kubernetes.io/)**
- **[OpenTelemetry](https://opentelemetry.io/)**
- **[Grafana Tempo](https://grafana.com/docs/tempo/latest/)**
- **[JSON Web Tokens (JWT)](https://jwt.io/)**
- **[Rust](https://www.rust-lang.org/)**
