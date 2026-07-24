---
layout: post
title: "OpenShift Service Mesh 3 multi-cluster com ACM, Kiali, Perses e Tempo"
description: "Guia operacional para mesh multi-primary em dois clusters OpenShift, métricas no ACM e integração com Kiali, Perses, Tempo e alertas."
date: 2026-07-23
categories: [OpenShift, Service Mesh, Kubernetes]
tags: [openshift, service-mesh, istio, kiali, acm, multicluster, observability, ambient-mode, redhat, tempo, perses, opentelemetry]
image:
  path: /assets/img/headers/openshift-service-mesh-3-multicluster-acm-kiali.png
  alt: OpenShift Service Mesh 3 multi-cluster com ACM, Kiali, Perses e Tempo
---

Multi-cluster com service mesh costuma falhar no detalhe chato: `meshID`, `clusterName` e `network` precisam bater em todo lugar. Se um diverge, o Kiali mostra topologia pela metade ou o tráfego entre clusters não completa o handshake. Instalar o control plane duas vezes não resolve isso.

No [post sobre OpenShift Service Mesh 3](/posts/openshift-service-mesh-3/) falei da mudança do Maistra para o Istio upstream. Aqui é o passo seguinte: dois spokes no mesmo mesh multi-primary, com ACM no hub.

Foi o ambiente que montei:

- Hub só com Red Hat Advanced Cluster Management (ACM), Observatorium e Thanos.
- Dois spokes, cada um com Istio primary via OpenShift Service Mesh 3 e Sail Operator.
- Um mesh em duas redes, misturando ambient e sidecar.
- Kiali no spoke 1, enxergando a API do spoke 2 e puxando métricas do hub.
- Perses para dashboard, Tempo para traces.
- Alertas a partir de `kiali_health_status`.

Lab de referência: OpenShift 4.22.5, ACM no canal `release-2.17`, Istio 1.30.1 via OSSM 3. Onde dá, os comandos descobrem a versão; mesmo assim confira o catálogo de Operators antes de sair aplicando.

## Hands-on

Quer montar o lab em vez de só ler? O [acm-ossm-flow](https://github.com/rafaelvzago/acm-ossm-flow/tree/main) tem o Ansible para os três clusters (`hub`, `spoke`, `spoke-two`) no mesmo caminho deste post.

Entre por `poc/`: faça `oc login`, exporte os `KUBECONFIG_*` e rode `ansible-playbook playbooks/site.yml`. O README em pt-BR está em [`poc/README.md`](https://github.com/rafaelvzago/acm-ossm-flow/blob/main/poc/README.md). O que eu apliquei comando a comando no lab fica em [`docs/OSSM-ACM-FULL-DEPLOYMENT.md`](https://github.com/rafaelvzago/acm-ossm-flow/blob/main/docs/OSSM-ACM-FULL-DEPLOYMENT.md). Tem um fluxo interativo em [ossm.rafaelvzago.com](https://ossm.rafaelvzago.com).

![Arquitetura final do ambiente multi-cluster](/assets/img/ossm-acm-multicluster/architecture.svg)

*Hub cuida da frota e da telemetria. Control plane e workload ficam nos spokes.*

## Decisões de arquitetura

Algumas escolhas precisam ficar quietas o lab inteiro. Se você mudar no meio, o resto deste texto para de bater com o cluster:

| Decisão | Valor de exemplo | Por que importa |
|---|---|---|
| Mesh ID | `mesh1` | Identifica o mesmo mesh nos dois clusters. |
| Cluster 1 | `spoke` | Deve ser igual no Istio, ZTunnel, Kiali, ACM e credenciais remotas. |
| Cluster 2 | `spoke-two` | Mesma regra de consistência do cluster 1. |
| Network 1 | `network1` | Permite ao Istio identificar quando precisa usar um gateway East-West. |
| Network 2 | `network2` | Precisa ser diferente da network 1 quando não há conectividade pod-to-pod direta. |
| Root CA | Compartilhada | Estabelece a confiança mTLS entre os clusters. |
| Intermediate CA | Uma por cluster | Evita reutilizar a chave intermediária entre domínios operacionais. |
| Kiali | Somente no spoke 1 | O spoke 2 recebe apenas ServiceAccount, RBAC e recursos de autenticação remota. |
| Hub | Sem OSSM | O hub permanece dedicado à gestão e à observabilidade. |

No fim, é multi-primary, multi-network e single-mesh: cada spoke tem o próprio `istiod`, mas os dois usam o mesmo `meshID` e a mesma Root CA.

## Pré-requisitos

Você precisa de:

- Três clusters OpenShift acessíveis.
- OpenShift 4.14 ou superior; valide também a versão mínima exigida pelo OSSM disponível no catálogo.
- Acesso ao catálogo `redhat-operators`.
- `oc`, `openssl`, `jq`, `curl` e `istioctl`.
- `istioctl` na mesma versão de Istio configurada no OSSM.
- LoadBalancers externos capazes de expor as portas `15008` e `15443` entre as redes dos spokes.
- Storage S3 compatível para Thanos e Tempo.

MinIO com `emptyDir`, senha fraca e imagem sem pin servem no lab. Em produção, storage persistente, tag fixa, credencial gerenciada e backup. Sem drama.

Kubeconfig, token, chave privada e senha ficam fora do Git. Arquivo temporário com permissão restrita, usa, apaga.

## Contextos e variáveis

Dê nome claro aos contextos antes de começar. Já apliquei recurso no cluster errado; não é o tipo de erro que você quer repetir:

```bash
oc config get-contexts

oc --context=ossm-kiali-hub whoami --show-server
oc --context=ossm-kiali-spoke whoami --show-server
oc --context=ossm-kiali-spoke-two whoami --show-server
```

Use um único bloco de variáveis durante toda a implantação:

```bash
export HUB_CONTEXT="ossm-kiali-hub"
export SPOKE_CONTEXT="ossm-kiali-spoke"
export SPOKE_TWO_CONTEXT="ossm-kiali-spoke-two"

export SPOKE_CLUSTER_NAME="spoke"
export SPOKE_TWO_CLUSTER_NAME="spoke-two"

export ISTIO_VERSION="1.30.1"
export MESH_ID="mesh1"
export SPOKE_NETWORK="network1"
export SPOKE_TWO_NETWORK="network2"

export KIALI_NAMESPACE="istio-system"
export TEMPO_NAMESPACE="tempo"
export TEMPO_STACK_NAME="istio"
export TEMPO_TENANT="${MESH_ID}"
```

Não escolha a versão de Istio só porque ela aparece aqui. Depois de instalar o Operator, consulte as versões aceitas pelo CRD:

```bash
oc --context="${SPOKE_CONTEXT}" get crd istios.sailoperator.io \
  -o jsonpath='{.spec.versions[0].schema.openAPIV3Schema.properties.spec.properties.version.enum}{"\n"}'
```

## Parte 1: hub, primeiro spoke e observabilidade

### 1. Instale o ACM no hub

No lab, pegar o canal mais recente economiza tempo. Em produção, fixe o canal que o processo de mudança aprovou:

```bash
ACM_CHANNEL="$(
  oc --context="${HUB_CONTEXT}" get packagemanifest advanced-cluster-management \
    -n openshift-marketplace \
    -o jsonpath='{.status.channels[*].name}' |
    tr ' ' '\n' |
    sort -V |
    tail -1
)"

printf 'ACM channel: %s\n' "${ACM_CHANNEL}"
```

Crie o namespace, o `OperatorGroup` e a `Subscription`:

```bash
oc --context="${HUB_CONTEXT}" create namespace open-cluster-management \
  --dry-run=client -o yaml |
  oc --context="${HUB_CONTEXT}" apply -f -

oc --context="${HUB_CONTEXT}" apply -f - <<EOF
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: open-cluster-management
  namespace: open-cluster-management
spec:
  targetNamespaces:
    - open-cluster-management
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: acm-operator-subscription
  namespace: open-cluster-management
spec:
  channel: ${ACM_CHANNEL}
  installPlanApproval: Automatic
  name: advanced-cluster-management
  source: redhat-operators
  sourceNamespace: openshift-marketplace
EOF
```

Aguarde o CRD e o webhook do Operator antes de criar o `MultiClusterHub`. Criar o CR cedo demais costuma resultar em rejeição pelo admission webhook:

```bash
oc --context="${HUB_CONTEXT}" wait \
  crd/multiclusterhubs.operator.open-cluster-management.io \
  --for=condition=Established \
  --timeout=300s

oc --context="${HUB_CONTEXT}" wait pod \
  -l name=multiclusterhub-operator \
  -n open-cluster-management \
  --for=condition=Ready \
  --timeout=300s

oc --context="${HUB_CONTEXT}" apply -f - <<'EOF'
apiVersion: operator.open-cluster-management.io/v1
kind: MultiClusterHub
metadata:
  name: multiclusterhub
  namespace: open-cluster-management
spec: {}
EOF
```

Valide a conclusão:

```bash
oc --context="${HUB_CONTEXT}" get multiclusterhub multiclusterhub \
  -n open-cluster-management \
  -o jsonpath='{.status.phase}{"\n"}'
```

O valor esperado é `Running`.

### 2. Ative ACM Observability

O `MultiClusterObservability` monta o pipeline: métricas dos managed clusters entram e caem no Thanos. Precisa de um backend S3-compatível.

No lab, MinIO no próprio hub resolve. Em produção, troque por object storage de verdade. O Secret que o ACM consome fica assim:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: thanos-object-storage
  namespace: open-cluster-management-observability
type: Opaque
stringData:
  thanos.yaml: |
    type: s3
    config:
      bucket: thanos
      endpoint: s3.example.internal
      insecure: false
      access_key: ${THANOS_ACCESS_KEY}
      secret_key: ${THANOS_SECRET_KEY}
```

Crie o `MultiClusterObservability` referenciando esse Secret:

```yaml
apiVersion: observability.open-cluster-management.io/v1beta2
kind: MultiClusterObservability
metadata:
  name: observability
spec:
  observabilityAddonSpec: {}
  storageConfig:
    metricObjectStorage:
      name: thanos-object-storage
      key: thanos.yaml
  advanced:
    retentionConfig:
      retentionResolutionRaw: 14d
      retentionResolution5m: 14d
      retentionResolution1h: 14d
```

Confirme que a condição `Ready` ficou verdadeira e que a rota do Observatorium existe:

```bash
oc --context="${HUB_CONTEXT}" wait mco/observability \
  --for=condition=Ready \
  --timeout=900s

oc --context="${HUB_CONTEXT}" get route observatorium-api \
  -n open-cluster-management-observability \
  -o jsonpath='https://{.spec.host}/api/metrics/v1/default{"\n"}'
```

### 3. Permita as métricas do Istio

O ACM não envia toda série encontrada no User Workload Monitoring. As métricas precisam aparecer no `observability-metrics-custom-allowlist`.

Comece pelo conjunto usado pelo Kiali:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: observability-metrics-custom-allowlist
  namespace: open-cluster-management-observability
data:
  uwl_metrics_list.yaml: |
    names:
    - istio_requests_total
    - istio_request_bytes_bucket
    - istio_request_bytes_count
    - istio_request_bytes_sum
    - istio_request_duration_milliseconds_bucket
    - istio_request_duration_milliseconds_count
    - istio_request_duration_milliseconds_sum
    - istio_response_bytes_bucket
    - istio_response_bytes_count
    - istio_response_bytes_sum
    - istio_tcp_connections_closed_total
    - istio_tcp_connections_opened_total
    - istio_tcp_received_bytes_total
    - istio_tcp_sent_bytes_total
    - pilot_proxy_convergence_time_sum
    - pilot_proxy_convergence_time_count
    - pilot_services
    - pilot_xds
    - pilot_xds_pushes
```

Não sobrescreva o allowlist com uma lista menor. Faça merge. Alguém da outra equipe vai agradecer depois.

### 4. Importe o primeiro spoke

No hub, crie o `ManagedCluster` e o `KlusterletAddonConfig`:

```bash
oc --context="${HUB_CONTEXT}" create namespace "${SPOKE_CLUSTER_NAME}" \
  --dry-run=client -o yaml |
  oc --context="${HUB_CONTEXT}" apply -f -

oc --context="${HUB_CONTEXT}" apply -f - <<EOF
apiVersion: cluster.open-cluster-management.io/v1
kind: ManagedCluster
metadata:
  name: ${SPOKE_CLUSTER_NAME}
  labels:
    cloud: auto-detect
    vendor: auto-detect
spec:
  hubAcceptsClient: true
---
apiVersion: agent.open-cluster-management.io/v1
kind: KlusterletAddonConfig
metadata:
  name: ${SPOKE_CLUSTER_NAME}
  namespace: ${SPOKE_CLUSTER_NAME}
spec:
  applicationManager:
    enabled: true
  certPolicyController:
    enabled: true
  policyController:
    enabled: true
  searchCollector:
    enabled: true
EOF
```

Para o auto-import, gere um kubeconfig mínimo em um arquivo temporário:

```bash
SPOKE_KUBECONFIG="$(mktemp)"
chmod 600 "${SPOKE_KUBECONFIG}"
trap 'rm -f "${SPOKE_KUBECONFIG}"' EXIT

oc config view \
  --context="${SPOKE_CONTEXT}" \
  --minify \
  --flatten > "${SPOKE_KUBECONFIG}"

oc --context="${HUB_CONTEXT}" create secret generic auto-import-secret \
  -n "${SPOKE_CLUSTER_NAME}" \
  --from-file="kubeconfig=${SPOKE_KUBECONFIG}"

rm -f "${SPOKE_KUBECONFIG}"
trap - EXIT
```

O ACM consome e remove esse Secret após instalar o klusterlet. Espere até que as duas condições estejam verdadeiras:

```bash
oc --context="${HUB_CONTEXT}" get managedcluster "${SPOKE_CLUSTER_NAME}" \
  -o jsonpath='{range .status.conditions[*]}{.type}={.status}{"\n"}{end}'
```

Procure por:

```text
ManagedClusterJoined=True
ManagedClusterConditionAvailable=True
```

### 5. Instale OSSM 3 no spoke

Ligue o User Workload Monitoring sem apagar o que já existe. Se o ConfigMap ainda não está lá:

```bash
oc --context="${SPOKE_CONTEXT}" create configmap cluster-monitoring-config \
  -n openshift-monitoring \
  --from-literal='config.yaml=enableUserWorkload: true'
```

Se já existe, leia, faça merge e reaplique. Substituir no escuro é o atalho para apagar o scrape de outra pessoa.

Instale o Operator:

```yaml
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: openshift-service-mesh-operator
  namespace: openshift-operators
spec:
  channel: stable
  installPlanApproval: Automatic
  name: servicemeshoperator3
  source: redhat-operators
  sourceNamespace: openshift-marketplace
```

Crie os namespaces necessários:

```bash
for namespace in istio-system istio-cni ztunnel; do
  oc --context="${SPOKE_CONTEXT}" create namespace "${namespace}" \
    --dry-run=client -o yaml |
    oc --context="${SPOKE_CONTEXT}" apply -f -
done

oc --context="${SPOKE_CONTEXT}" label namespace ztunnel \
  istio-discovery=enabled \
  --overwrite
```

#### Root CA e Intermediate CA

Crie uma Root CA exclusiva para o mesh e uma Intermediate CA para o spoke. A árvore final deve ser:

```text
istio-certs/
├── root-cert.pem
├── root-key.pem
├── spoke/
│   ├── ca-cert.pem
│   ├── ca-key.pem
│   ├── cert-chain.pem
│   └── root-cert.pem
└── spoke-two/
    ├── ca-cert.pem
    ├── ca-key.pem
    ├── cert-chain.pem
    └── root-cert.pem
```

As duas Intermediate CAs precisam sair da **mesma Root CA**. Guarde a raiz fora de `/tmp`, aperte a permissão e não jogue isso no repositório:

```bash
chmod 600 istio-certs/root-key.pem
chmod 600 istio-certs/spoke/ca-key.pem
```

Carregue o material do primeiro cluster no Secret `cacerts`:

```bash
oc --context="${SPOKE_CONTEXT}" create secret generic cacerts \
  -n istio-system \
  --from-file=ca-cert.pem=istio-certs/spoke/ca-cert.pem \
  --from-file=ca-key.pem=istio-certs/spoke/ca-key.pem \
  --from-file=root-cert.pem=istio-certs/spoke/root-cert.pem \
  --from-file=cert-chain.pem=istio-certs/spoke/cert-chain.pem
```

Se for automatizar, trate a PKI como peça própria: validade, rotação, quem acessa a chave e como recuperar. Faça isso antes de abrir tráfego de produção.

#### IstioCNI, Istio e ZTunnel

O perfil `openshift-ambient` deixa o cluster pronto para ambient e sidecar:

```yaml
apiVersion: sailoperator.io/v1
kind: IstioCNI
metadata:
  name: default
spec:
  namespace: istio-cni
  profile: openshift-ambient
  version: v1.30.1
---
apiVersion: sailoperator.io/v1
kind: Istio
metadata:
  name: default
spec:
  namespace: istio-system
  profile: openshift-ambient
  updateStrategy:
    type: InPlace
  values:
    global:
      meshID: mesh1
    meshConfig:
      discoverySelectors:
        - matchLabels:
            istio-discovery: enabled
    pilot:
      trustedZtunnelNamespace: ztunnel
  version: v1.30.1
---
apiVersion: sailoperator.io/v1
kind: ZTunnel
metadata:
  name: default
spec:
  namespace: ztunnel
  version: v1.30.1
```

Substitua `v1.30.1` e `mesh1` pelos valores validados no seu ambiente. Aguarde cada CR antes de seguir:

```bash
oc --context="${SPOKE_CONTEXT}" wait istiocni/default \
  --for=condition=Ready \
  --timeout=300s

oc --context="${SPOKE_CONTEXT}" wait istio/default \
  --for=condition=Ready \
  --timeout=300s

oc --context="${SPOKE_CONTEXT}" wait ztunnel/default \
  --for=condition=Ready \
  --timeout=300s
```

### 6. Colete métricas do data plane

Crie um `ServiceMonitor` para `istiod`, um `PodMonitor` para `ztunnel` e um `PodMonitor` em cada namespace que contém sidecars ou waypoints.

Com `discoverySelector` no CR do Istio, **todo namespace do mesh precisa de `istio-discovery=enabled`**. Só colocar sidecar ou ambient não basta: o control plane ignora o namespace.

Para o `istiod`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istiod-monitor
  namespace: istio-system
spec:
  selector:
    matchLabels:
      istio: pilot
  endpoints:
    - port: http-monitoring
      interval: 30s
```

Para proxies e waypoints, o `PodMonitor` precisa selecionar o container `istio-proxy`, usar `/stats/prometheus` e preservar os labels de `namespace`, `app`, `version` e `mesh_id`. No OpenShift User Workload Monitoring, crie esse recurso no mesmo namespace dos workloads.

### 7. Instale Kiali e aponte-o para o hub

O Kiali no spoke consulta o Observatorium por mTLS. Primeiro obtenha no hub:

- URL do Observatorium.
- Certificado e chave de cliente autorizados.
- CA que assinou o certificado da rota.

Use arquivos temporários protegidos:

```bash
CERT_DIR="$(mktemp -d)"
chmod 700 "${CERT_DIR}"
trap 'rm -rf "${CERT_DIR}"' EXIT

export OBSERVATORIUM_URL="$(
  oc --context="${HUB_CONTEXT}" get route observatorium-api \
    -n open-cluster-management-observability \
    -o jsonpath='https://{.spec.host}/api/metrics/v1/default'
)"

oc --context="${HUB_CONTEXT}" get secret observability-grafana-certs \
  -n open-cluster-management-observability \
  -o jsonpath='{.data.tls\.crt}' |
  base64 -d > "${CERT_DIR}/tls.crt"

oc --context="${HUB_CONTEXT}" get secret observability-grafana-certs \
  -n open-cluster-management-observability \
  -o jsonpath='{.data.tls\.key}' |
  base64 -d > "${CERT_DIR}/tls.key"

chmod 600 "${CERT_DIR}/tls.key"
```

Descubra qual CA assinou a rota em vez de assumir o nome do Secret:

```bash
OBSERVATORIUM_HOST="$(
  oc --context="${HUB_CONTEXT}" get route observatorium-api \
    -n open-cluster-management-observability \
    -o jsonpath='{.spec.host}'
)"

openssl s_client \
  -connect "${OBSERVATORIUM_HOST}:443" \
  -servername "${OBSERVATORIUM_HOST}" \
  -showcerts </dev/null 2>/dev/null |
  openssl x509 -noout -issuer
```

Depois de exportar a CA correta para `${CERT_DIR}/server-ca.crt`, crie os recursos no spoke:

```bash
oc --context="${SPOKE_CONTEXT}" create secret generic acm-observability-certs \
  -n "${KIALI_NAMESPACE}" \
  --from-file=tls.crt="${CERT_DIR}/tls.crt" \
  --from-file=tls.key="${CERT_DIR}/tls.key"

oc --context="${SPOKE_CONTEXT}" create configmap kiali-cabundle \
  -n "${KIALI_NAMESPACE}" \
  --from-file=additional-ca-bundle.pem="${CERT_DIR}/server-ca.crt"

rm -rf "${CERT_DIR}"
trap - EXIT
```

Instale o Kiali Operator e crie o CR:

```yaml
apiVersion: kiali.io/v1alpha1
kind: Kiali
metadata:
  name: kiali
  namespace: istio-system
spec:
  auth:
    strategy: openshift
  deployment:
    cluster_wide_access: true
    instance_name: kiali
    namespace: istio-system
    replicas: 1
  external_services:
    grafana:
      enabled: false
    prometheus:
      auth:
        cert_file: secret:acm-observability-certs:tls.crt
        key_file: secret:acm-observability-certs:tls.key
        type: none
        use_kiali_token: false
      thanos_proxy:
        enabled: true
        retention_period: 14d
        scrape_interval: 5m
      url: https://observatorium.example/api/metrics/v1/default
  version: default
```

Os cinco minutos do `scrape_interval` são do ACM, não do scrape local do UWM. Por isso o gráfico do Kiali às vezes demora de 5 a 15 minutos para mostrar tráfego novo. Eu já reiniciei coisa à toa por causa disso.

Finalize com o `OSSMConsole` para integrar a UI ao console do OpenShift:

```yaml
apiVersion: kiali.io/v1alpha1
kind: OSSMConsole
metadata:
  name: ossmconsole
  namespace: istio-system
spec: {}
```

### 8. Valide workloads ambient e sidecar

Use dois namespaces de demonstração:

```bash
oc --context="${SPOKE_CONTEXT}" create namespace ambient-demo \
  --dry-run=client -o yaml |
  oc --context="${SPOKE_CONTEXT}" apply -f -

oc --context="${SPOKE_CONTEXT}" label namespace ambient-demo \
  istio.io/dataplane-mode=ambient \
  istio-discovery=enabled \
  --overwrite

oc --context="${SPOKE_CONTEXT}" create namespace bookinfo \
  --dry-run=client -o yaml |
  oc --context="${SPOKE_CONTEXT}" apply -f -

oc --context="${SPOKE_CONTEXT}" label namespace bookinfo \
  istio-injection=enabled \
  istio-discovery=enabled \
  --overwrite
```

No namespace ambient, o `ztunnel` fornece mTLS L4 sem injetar sidecar. Para obter métricas HTTP, latência e códigos de resposta no Kiali, adicione um waypoint:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: waypoint
  namespace: ambient-demo
  labels:
    istio.io/waypoint-for: service
spec:
  gatewayClassName: istio-waypoint
  listeners:
    - name: mesh
      port: 15008
      protocol: HBONE
```

Depois:

```bash
oc --context="${SPOKE_CONTEXT}" wait gateway/waypoint \
  -n ambient-demo \
  --for=condition=Programmed=True \
  --timeout=120s

oc --context="${SPOKE_CONTEXT}" label namespace ambient-demo \
  istio.io/use-waypoint=waypoint \
  --overwrite
```

Não estranhe duas arestas no Kiali para tráfego ambient com waypoint: uma vem do `ztunnel` (L4), outra do waypoint (L7).

## Parte 2: spokes em mesh multi-primary

![Fluxo lógico do tráfego entre clusters](/assets/img/ossm-acm-multicluster/traffic-flow.svg)

*Remote Secret resolve endpoint. Gateway carrega o tráfego. São trabalhos diferentes; misturar os dois na cabeça é receita de debugging longo.*

### 1. Importe e prepare o segundo spoke

Repita a importação no ACM usando `${SPOKE_TWO_CLUSTER_NAME}` e `${SPOKE_TWO_CONTEXT}`. Instale o OSSM 3, habilite UWM e crie os mesmos namespaces de infraestrutura.

A Intermediate CA do segundo spoke deve ser assinada pela mesma Root CA do primeiro:

```bash
oc --context="${SPOKE_TWO_CONTEXT}" create secret generic cacerts \
  -n istio-system \
  --from-file=ca-cert.pem=istio-certs/spoke-two/ca-cert.pem \
  --from-file=ca-key.pem=istio-certs/spoke-two/ca-key.pem \
  --from-file=root-cert.pem=istio-certs/spoke-two/root-cert.pem \
  --from-file=cert-chain.pem=istio-certs/spoke-two/cert-chain.pem
```

O label em `istio-system` faz duas coisas: marca a network local e deixa o Gateway API controller processar gateway naquele namespace.

```bash
oc --context="${SPOKE_TWO_CONTEXT}" label namespace istio-system \
  "topology.istio.io/network=${SPOKE_TWO_NETWORK}" \
  istio-discovery=enabled \
  --overwrite
```

### 2. Defina identidade e network nos dois control planes

O segundo Istio primary precisa destes valores:

```yaml
apiVersion: sailoperator.io/v1
kind: Istio
metadata:
  name: default
spec:
  namespace: istio-system
  profile: openshift-ambient
  values:
    global:
      meshID: mesh1
      multiCluster:
        clusterName: spoke-two
      network: network2
    meshConfig:
      discoverySelectors:
        - matchLabels:
            istio-discovery: enabled
    pilot:
      trustedZtunnelNamespace: ztunnel
      env:
        AMBIENT_ENABLE_MULTI_NETWORK: "true"
  version: v1.30.1
```

O `ZTunnel` precisa repetir o mesmo `clusterName` e a mesma `network`:

```yaml
apiVersion: sailoperator.io/v1
kind: ZTunnel
metadata:
  name: default
spec:
  namespace: ztunnel
  version: v1.30.1
  values:
    ztunnel:
      multiCluster:
        clusterName: spoke-two
      network: network2
```

Atualize o primeiro spoke de forma equivalente:

```bash
oc --context="${SPOKE_CONTEXT}" label namespace istio-system \
  "topology.istio.io/network=${SPOKE_NETWORK}" \
  istio-discovery=enabled \
  --overwrite

oc --context="${SPOKE_CONTEXT}" patch istio default --type=merge -p "{
  \"spec\": {
    \"values\": {
      \"global\": {
        \"multiCluster\": {\"clusterName\": \"${SPOKE_CLUSTER_NAME}\"},
        \"network\": \"${SPOKE_NETWORK}\"
      },
      \"pilot\": {
        \"env\": {
          \"AMBIENT_ENABLE_MULTI_NETWORK\": \"true\"
        }
      }
    }
  }
}"

oc --context="${SPOKE_CONTEXT}" patch ztunnel default --type=merge -p "{
  \"spec\": {
    \"values\": {
      \"ztunnel\": {
        \"multiCluster\": {\"clusterName\": \"${SPOKE_CLUSTER_NAME}\"},
        \"network\": \"${SPOKE_NETWORK}\"
      }
    }
  }
}"
```

Também configure `spec.kubernetes_config.cluster_name` no Kiali com o nome do cluster home:

```bash
oc --context="${SPOKE_CONTEXT}" patch kiali kiali \
  -n "${KIALI_NAMESPACE}" \
  --type=merge \
  -p "{
    \"spec\": {
      \"kubernetes_config\": {
        \"cluster_name\": \"${SPOKE_CLUSTER_NAME}\"
      }
    }
  }"
```

No lab, se o certificado da API não valida, `spec.auth.openshift.insecure_skip_verify_tls: true` mata o loop de OAuth. Em produção, arrume a cadeia de confiança. Esse flag é atalho, não arquitetura.

### 3. Crie os gateways East-West

Ambient e sidecar usam protocolos diferentes:

| Data plane | Porta | GatewayClass | TLS |
|---|---:|---|---|
| Ambient | `15008` | `istio-east-west` | HBONE com `ISTIO_MUTUAL` |
| Sidecar | `15443` | `istio` | TLS passthrough |

Gateway ambient, aplicado nos dois clusters com o label de network correspondente:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: istio-eastwestgateway
  namespace: istio-system
  labels:
    topology.istio.io/network: network1
spec:
  gatewayClassName: istio-east-west
  listeners:
    - name: mesh
      port: 15008
      protocol: HBONE
      tls:
        mode: Terminate
        options:
          gateway.istio.io/tls-terminate-mode: ISTIO_MUTUAL
```

Gateway sidecar:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: istio-eastwestgateway-sidecar
  namespace: istio-system
  labels:
    topology.istio.io/network: network1
spec:
  gatewayClassName: istio
  listeners:
    - name: tls
      port: 15443
      protocol: TLS
      tls:
        mode: Passthrough
      allowedRoutes:
        namespaces:
          from: Same
```

No spoke 2, troque `network1` por `network2`. Espere `Programmed=True` e recupere os endereços dos Services criados pelo controller. Dependendo do provedor, o campo pode ser `ip` ou `hostname`; trate os dois casos na automação.

### 4. Configure `meshNetworks`

Cada `istiod` precisa conhecer:

- O registry associado a cada network.
- O endereço do gateway HBONE.
- O endereço do gateway sidecar.

O trecho lógico é:

```yaml
global:
  meshNetworks:
    network1:
      endpoints:
        - fromRegistry: spoke
      gateways:
        - address: ${SPOKE_HBONE_ADDRESS}
          port: 15008
        - address: ${SPOKE_SIDECAR_ADDRESS}
          port: 15443
    network2:
      endpoints:
        - fromRegistry: spoke-two
      gateways:
        - address: ${SPOKE_TWO_HBONE_ADDRESS}
          port: 15008
        - address: ${SPOKE_TWO_SIDECAR_ADDRESS}
          port: 15443
```

Os dois CRs `Istio` precisam ver o mesmo `meshNetworks`. Se cada control plane só conhece a própria network, o endpoint remoto fica sem rota.

### 5. Troque Remote Secrets

Remote Secrets só deixam cada `istiod` ler Services e endpoints no outro API server. Tráfego de aplicação não passa por eles.

Crie a ServiceAccount com `cluster-reader` no namespace correto:

```bash
for context in "${SPOKE_CONTEXT}" "${SPOKE_TWO_CONTEXT}"; do
  oc --context="${context}" create serviceaccount istio-reader-service-account \
    -n istio-system \
    --dry-run=client -o yaml |
    oc --context="${context}" apply -f -

  oc --context="${context}" adm policy add-cluster-role-to-user cluster-reader \
    -z istio-reader-service-account \
    -n istio-system
done
```

Gere e aplique os Secrets:

```bash
istioctl create-remote-secret \
  --context="${SPOKE_TWO_CONTEXT}" \
  --name="${SPOKE_TWO_CLUSTER_NAME}" \
  -n istio-system \
  --create-service-account=false |
  oc --context="${SPOKE_CONTEXT}" apply -f -

istioctl create-remote-secret \
  --context="${SPOKE_CONTEXT}" \
  --name="${SPOKE_CLUSTER_NAME}" \
  -n istio-system \
  --create-service-account=false |
  oc --context="${SPOKE_TWO_CONTEXT}" apply -f -
```

Não esqueça `-n istio-system`. Sem isso, o `istioctl` procura a ServiceAccount em `default` e você perde meia hora.

Valide:

```bash
oc --context="${SPOKE_CONTEXT}" get secrets \
  -n istio-system \
  -l istio/multiCluster=true

oc --context="${SPOKE_TWO_CONTEXT}" get secrets \
  -n istio-system \
  -l istio/multiCluster=true
```

### 6. Dê ao Kiali acesso ao segundo cluster

No spoke 2, instale o Kiali Operator e crie um CR apenas com recursos remotos:

```yaml
apiVersion: kiali.io/v1alpha1
kind: Kiali
metadata:
  name: kiali
  namespace: istio-system
spec:
  auth:
    openshift:
      redirect_uris:
        - https://kiali.example/api/auth/callback/spoke-two
  deployment:
    namespace: istio-system
    remote_cluster_resources_only: true
```

Isso cria a ServiceAccount e o RBAC necessários sem executar um segundo servidor Kiali.

No spoke 1, crie `kiali-multi-cluster-secret`. Cada chave deve usar exatamente o nome do cluster:

```text
kiali-multi-cluster-secret
└── data
    └── spoke-two: <kubeconfig restrito à ServiceAccount do Kiali>
```

Adicione o label para o Operator reconciliar automaticamente:

```bash
oc --context="${SPOKE_CONTEXT}" label secret kiali-multi-cluster-secret \
  -n "${KIALI_NAMESPACE}" \
  kiali.io/kiali-multi-cluster-secret=true \
  --overwrite
```

Use ServiceAccount dedicada, RBAC mínimo e rotação. Kubeconfig de admin aqui é preguiça cara.

### 7. Torne os Services globais

Um Service com o mesmo nome nos dois clusters continua local até receber:

```bash
oc --context="${SPOKE_CONTEXT}" label service ratings \
  -n bookinfo \
  istio.io/global=true \
  --overwrite

oc --context="${SPOKE_TWO_CONTEXT}" label service ratings \
  -n bookinfo \
  istio.io/global=true \
  --overwrite
```

Com endpoint local e remoto, o Istio balanceia entre clusters. Na demo, eu deixo `ratings-v1` no spoke 1 e `ratings-v2` no spoke 2: fica óbvio no grafo quando o tráfego cruza.

## Parte 3: Perses e Tempo

![Fluxos de métricas, traces e alertas](/assets/img/ossm-acm-multicluster/observability-flow.svg)

*Centralizar métrica não centraliza trace sozinho. São pipelines diferentes: auth, transporte e retenção próprios.*

### 1. Dashboards Perses sobre o Thanos do ACM

Instale o Cluster Observability Operator no spoke 1 e crie o `UIPlugin` de monitoring. O Perses será executado nesse cluster, mas seu datasource aponta para o Observatorium no hub.

O datasource precisa de:

- URL do Observatorium.
- Certificado e chave de cliente.
- CA da rota do hub.
- Proxy configurado para mTLS.

A topologia é:

```text
Perses no spoke 1
  └── PersesDatasource acm-thanos
      └── proxy mTLS
          └── Observatorium no hub
              └── Thanos com séries dos dois spokes
```

Crie dashboards separados para reduzir acoplamento:

- **Mesh overview**: taxa de requests, erros e latência por cluster.
- **Workload**: tráfego, CPU e memória filtrados por cluster, namespace e workload.
- **ZTunnel**: conexões, bytes e erros do data plane ambient.

No Kiali, habilite Perses com um merge que altere somente `spec.external_services.perses`. Não substitua `external_services` inteiro, pois isso removeria Prometheus e Tempo.

Use `url_format: openshift` para integração com o console. Quando o Perses é protegido pelo OAuth do OpenShift, não configure um `internal_url` arbitrário para contornar a autenticação.

### 2. Traces multi-cluster com Tempo

Instale:

- Tempo Operator e OpenTelemetry Operator no spoke 1.
- OpenTelemetry Operator no spoke 2.
- Um `TempoStack` no spoke 1, com storage S3.
- Um collector local no spoke 1.
- Um receiver remoto no spoke 1, exposto por Route passthrough e protegido por mTLS.
- Um forwarder no spoke 2.

O fluxo do spoke 2 é:

```text
Istio proxies
  → OTEL forwarder
  → Route passthrough mTLS
  → OTEL receiver no spoke 1
  → Tempo gateway
  → object storage
```

Nos dois collectors, defina `k8s.cluster.name` na mão. Sem isso, depois de uma trace cruzar clusters você não sabe de onde veio o span.

```yaml
processors:
  resource/cluster:
    attributes:
      - key: k8s.cluster.name
        action: upsert
        value: spoke-two
```

Configure o Istio de cada cluster para enviar OTLP ao collector local:

```yaml
meshConfig:
  defaultProviders:
    tracing:
      - otel
  extensionProviders:
    - name: otel
      opentelemetry:
        port: 4317
        service: otel-collector.istio-system.svc.cluster.local
  enableTracing: true
```

Ajuste o sampling ao custo e ao volume. `100%` no lab é ótimo. Em produção, a conta chega rápido.

Habilite o plugin de distributed tracing no console e faça merge apenas de `spec.external_services.tracing` no Kiali. Para validar a origem:

```traceql
{ resource.k8s.cluster.name = "spoke-two" }
```

Uma trace inter-cluster do Bookinfo deve mostrar spans do `reviews` no primeiro spoke e do `ratings` no segundo.

## Parte 4: alertas com a saúde do Kiali

O Kiali calcula saúde de aplicações, Services, workloads e namespaces. Ao habilitar a exportação, cada entidade vira uma série `kiali_health_status`:

| Valor | Estado |
|---:|---|
| `0` | Healthy |
| `1` | Not Ready |
| `2` | Degraded |
| `3` | Failure |

### 1. Exporte a métrica

Faça merge no CR:

```bash
oc --context="${SPOKE_CONTEXT}" patch kiali kiali \
  -n "${KIALI_NAMESPACE}" \
  --type=merge \
  -p '{
    "spec": {
      "server": {
        "observability": {
          "metrics": {
            "enabled": true,
            "health_status": {
              "enabled": true
            }
          }
        }
      }
    }
  }'
```

O listener de métricas sobe se as métricas gerais ou o `health_status` estiverem ligados. Eu deixo os dois `true` no CR para não depender de default.

### 2. Faça scrape com TLS

No OpenShift, o endpoint do Kiali usa service-serving certificate. Espere o ConfigMap `kiali-cabundle-openshift` receber `service-ca.crt` e referencie-o no `ServiceMonitor`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kiali
  namespace: istio-system
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: kiali
  namespaceSelector:
    matchNames:
      - istio-system
  endpoints:
    - port: tcp-metrics
      interval: 30s
      scheme: https
      tlsConfig:
        ca:
          configMap:
            name: kiali-cabundle-openshift
            key: service-ca.crt
        serverName: kiali.istio-system.svc
```

Evite `tlsConfig.caFile`. O UWM costuma barrar acesso solto ao filesystem no ServiceMonitor. ConfigMap funciona.

O health cache é atualizado em ciclos; espere até cinco minutos antes de concluir que a série não apareceu:

```promql
kiali_health_status
```

### 3. Crie recording rules e alertas locais

O UWM substitui o label Prometheus `namespace` pelo namespace do próprio monitor/rule. O namespace original do mesh passa a `exported_namespace`. Use esse label nas consultas.

{% raw %}
```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: kiali-health-status
  namespace: istio-system
  labels:
    openshift.io/prometheus-rule-evaluation-scope: leaf-prometheus
spec:
  groups:
    - name: kiali.health.recording
      rules:
        - record: kiali:health_status:max
          expr: |
            max by (cluster, exported_namespace, health_type, name) (
              kiali_health_status
            )
        - record: kiali:health_status:namespace_max
          expr: |
            max by (cluster, exported_namespace, name) (
              kiali_health_status{health_type="namespace"}
            )
    - name: kiali.health.alerts
      rules:
        - alert: KialiHealthFailure
          expr: |
            kiali:health_status:max{
              health_type=~"app|service|workload"
            } == 3
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: >-
              {{ $labels.health_type }} {{ $labels.name }} in
              {{ $labels.exported_namespace }} is in Failure
        - alert: KialiHealthDegraded
          expr: |
            kiali:health_status:max{
              health_type=~"app|service|workload"
            } == 2
          for: 10m
          labels:
            severity: warning
          annotations:
            summary: >-
              {{ $labels.health_type }} {{ $labels.name }} in
              {{ $labels.exported_namespace }} is Degraded
```
{% endraw %}

O `max` é de propósito: com mais de uma réplica do Kiali, o pior valor ganha. Mantenha `cluster` na agregação, senão você mistura entidades com o mesmo nome em clusters diferentes.

### 4. Envie saúde para o hub

Adicione `kiali_health_status` ao allowlist existente do ACM, sem apagar os nomes anteriores:

```yaml
data:
  uwl_metrics_list.yaml: |
    names:
    - istio_requests_total
    # demais métricas existentes
    - kiali_health_status
```

Depois de dois ciclos de coleta, consulte o Thanos no hub:

```bash
oc --context="${HUB_CONTEXT}" get --raw \
  "/api/v1/namespaces/open-cluster-management-observability/services/http:observability-thanos-query-frontend:9090/proxy/api/v1/query?query=kiali_health_status" |
  jq .
```

Para alertas globais, o `thanos-ruler-custom-rules` avalia a série bruta. Recording rules locais não são encaminhadas automaticamente ao hub:

{% raw %}
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: thanos-ruler-custom-rules
  namespace: open-cluster-management-observability
data:
  custom_rules.yaml: |
    groups:
      - name: kiali.health.hub.alerts
        rules:
          - alert: KialiHubHealthFailure
            expr: |
              max by (cluster, exported_namespace, health_type, name) (
                kiali_health_status{
                  health_type=~"app|service|workload"
                }
              ) == 3
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: >-
                {{ $labels.health_type }} {{ $labels.name }} in
                {{ $labels.exported_namespace }} on
                {{ $labels.cluster }} is in Failure
          - alert: KialiHubHealthDegraded
            expr: |
              max by (cluster, exported_namespace, health_type, name) (
                kiali_health_status{
                  health_type=~"app|service|workload"
                }
              ) == 2
            for: 10m
            labels:
              severity: warning
            annotations:
              summary: >-
                {{ $labels.health_type }} {{ $labels.name }} in
                {{ $labels.exported_namespace }} on
                {{ $labels.cluster }} is Degraded
```
{% endraw %}

Observe o operador `=~` no filtro de `health_type`. Usar `=` com a string `"app|service|workload"` procura um valor literal que não existe.

Faça merge no ConfigMap. Se você substituir `custom_rules.yaml` só com regra do Kiali, a regra da outra equipe some. Já vi isso acontecer.

## Como o tráfego fica protegido

Entre clusters, o que realmente segura a conversa:

1. Root CA compartilhada: os dois clusters confiam na mesma raiz.
2. Intermediate CA por cluster: cada um assina com a própria chave intermediária.
3. mTLS entre serviços: identidade e criptografia no caminho do workload.
4. Gateway East-West: HBONE ou TLS passthrough, sem terminar a identidade da app fora do modelo do mesh.

Remote Secret não está no canal de dados. Só autoriza descoberta no API server remoto. Por isso, RBAC mínimo e rotação própria.

## Checklist de verificação

### ACM

```bash
oc --context="${HUB_CONTEXT}" get managedclusters
oc --context="${HUB_CONTEXT}" get mco observability
oc --context="${HUB_CONTEXT}" get route observatorium-api \
  -n open-cluster-management-observability
```

Os dois spokes devem estar `JOINED=True` e `AVAILABLE=True`.

### OSSM

```bash
for context in "${SPOKE_CONTEXT}" "${SPOKE_TWO_CONTEXT}"; do
  oc --context="${context}" get istio,istiocni,ztunnel
  oc --context="${context}" get gateway -n istio-system
  oc --context="${context}" get secrets \
    -n istio-system \
    -l istio/multiCluster=true
done
```

### Descoberta e tráfego

```bash
oc --context="${SPOKE_CONTEXT}" get endpointslice \
  -n bookinfo \
  -l kubernetes.io/service-name=ratings \
  -o wide

oc --context="${SPOKE_CONTEXT}" logs \
  -n bookinfo \
  deployment/traffic-gen \
  --tail=20
```

O EndpointSlice precisa listar o cluster remoto. O teste que importa: remova o endpoint local na demo e veja se a chamada ainda passa.

### Métricas

```bash
oc --context="${HUB_CONTEXT}" get --raw \
  "/api/v1/namespaces/open-cluster-management-observability/services/http:observability-thanos-query-frontend:9090/proxy/api/v1/label/__name__/values" |
  jq -r '.data[]' |
  grep -E '^(istio_|kiali_health_status)'
```

Depois de gerar tráfego, espere de 5 a 15 minutos. O ACM é eventual. Série ausente no primeiro refresh quase nunca é "está quebrado".

### Traces

No OpenShift Console, abra **Observe → Traces** e use:

```traceql
{ resource.k8s.cluster.name = "spoke-two" }
```

### Kiali

Confira:

- Namespaces dos dois clusters no seletor.
- Dois control planes na página Mesh.
- Grafo Bookinfo atravessando os spokes.
- Métricas ambient separáveis por `Waypoint` e `ZTunnel`.
- Links para Perses e Tempo.

## Problemas que mais custam tempo

| Sintoma | Causa provável | Verificação |
|---|---|---|
| `istioctl create-remote-secret` não encontra a ServiceAccount | Namespace omitido | Passe `-n istio-system`. |
| `ztunnel` falha ao autenticar no `istiod` | `clusterName` diferente | Compare Istio e ZTunnel no mesmo spoke. |
| O Service existe nos dois clusters, mas não recebe tráfego remoto | Service não global | Confirme `istio.io/global=true` em ambos. |
| Gateway `Programmed`, mas sem tráfego | `meshNetworks` incompleto ou endereço errado | Valide IP/hostname e portas 15008/15443. |
| Kiali vê métricas, mas não recursos remotos | Secret do Kiali ausente ou chave com nome divergente | A chave deve ser exatamente o cluster name. |
| Kiali entra em loop de login | Redirect URI ou confiança TLS inválida | Revise OAuth do spoke remoto e a cadeia da API. |
| ServiceMonitor do Kiali não cria target | `caFile` bloqueado pelo UWM | Use `tlsConfig.ca.configMap`. |
| PromQL de saúde retorna namespace errado | UWM reescreveu `namespace` | Consulte `exported_namespace`. |
| Perses abre sem dashboard correto | Limitação de deep link ou variáveis | Selecione o dashboard e preencha cluster/namespace. |
| Traces do spoke 2 parecem vir do spoke 1 | Resource processor ausente | Defina `k8s.cluster.name` no collector de cada cluster. |
| Grafo demora a aparecer | Intervalo do ACM | Espere dois ciclos de coleta. |
| Um patch remove Prometheus, Perses ou Tempo | `external_services` substituído por inteiro | Faça merge somente da chave de destino. |

## Hardening antes de produção

Este texto privilegia fazer o lab funcionar. Antes de levar para produção:

- Fixe canais e versões dos Operators.
- Use object storage externo e persistente.
- Substitua credenciais estáticas por Secrets gerenciados e rotacionáveis.
- Defina validade e rotação da Root e das Intermediate CAs.
- Restrinja os security groups e firewalls às portas e origens necessárias.
- Use RBAC mínimo para Remote Secrets e para o acesso remoto do Kiali.
- Evite `insecure_skip_verify_tls`.
- Defina sampling e retenção de traces com base em volume e custo.
- Dimensione Thanos, Tempo, Perses, collectors e Kiali com testes de carga.
- Adicione PodDisruptionBudgets, requests, limits e estratégias de disponibilidade.
- Faça merge de ConfigMaps compartilhados; nunca os substitua sem ler o estado atual.
- Versione manifestos sem versionar material secreto.

## Ordem de remoção

Se precisar desmontar o ambiente, remova na ordem inversa:

1. Alertas e exportação de `kiali_health_status`.
2. Integrações Perses e Tempo.
3. Workloads de demonstração.
4. Acesso multi-cluster do Kiali e Remote Secrets.
5. Gateways East-West e configuração `meshNetworks`.
6. OSSM do segundo spoke.
7. OSSM e Kiali do primeiro spoke.
8. ManagedClusters, ACM Observability e ACM.

Não apague `kiali-cabundle-openshift` na mão: o Operator cuida dele. Se for só tirar a saúde do Kiali, deixe as métricas Istio no allowlist. No Thanos Ruler, remova o grupo certo e deixe o resto em paz.

## Conclusão

O truque não é uma ferramenta mágica. É não misturar papel:

- ACM cuida da frota e das métricas centralizadas.
- Istio descobre endpoint e carrega o tráfego com identidade.
- Gateway liga as redes sem fundir os clusters.
- Kiali mostra config, topologia e telemetria no mesmo lugar.
- Perses para explorar série; Tempo para a história da requisição.
- Prometheus e Thanos Ruler transformam saúde em alerta.

Quando `meshID`, `clusterName`, `network`, PKI e labels batem, o segundo cluster deixa de ser "mais um no painel" e passa a ser parte do mesmo mesh. Quando não batem, você volta a esse post, quase sempre na seção errada da primeira vez.

## Referências

- [acm-ossm-flow — hands-on Ansible + docs](https://github.com/rafaelvzago/acm-ossm-flow/tree/main)
- [Kiali — MultiCluster on OpenShift](https://kiali.io/docs/tutorials/ossm-multicluster/ossm-acm-hub-spoke/)
- [Kiali — Multi-Primary Mesh on OpenShift with ACM](https://kiali.io/docs/tutorials/ossm-multicluster/ossm-acm-multi-primary/)
- [Kiali — Dashboards and Tracing](https://kiali.io/docs/tutorials/ossm-multicluster/ossm-dashboards-tracing/)
- [Kiali staging — Health Status Alerts](https://staging.kiali.io/docs/tutorials/ossm-multicluster/ossm-health-status-alerts/)
- [Kiali CR Reference](https://kiali.io/docs/configuration/kialis.kiali.io/)
