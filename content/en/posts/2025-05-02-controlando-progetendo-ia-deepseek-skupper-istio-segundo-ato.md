---
title: "Skupper + InstructLab: controlling and protecting AI (act 2)"
description: "Step-by-step guide to serve DeepSeek with InstructLab and expose the chatbot securely with Skupper across private and public sites."
date: 2025-05-04
slug: "controlando-progetendo-ia-deepseek-skupper-istio-segundo-ato"
tags: [ai, deepseek, skupper, instructlab, openshift, podman, llama-cpp, gguf]
toc: true
images:
  - "/assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt2.png"
---

![](/assets/img/headers/controlando-e-protegendo-modelos-de-ia-pt2.png)

## See the Solution in Action

In this article we prepare the full environment to serve the generative DeepSeek AI model with InstructLab: download the model, convert it to GGUF, and deploy the InstructLab chatbot. We also expose the service securely with Skupper.

### Concepts and Commands Used in the Demo

> NOTE Make sure you explain what each Skupper command does the first time you use it, especially for people new to Skupper. The following commands should be explained:
>
> **`skupper init`**: Initializes the Skupper network, setting up the components needed for secure communication between services.
>
> **`skupper expose`**: Exposes a local service through the Skupper network so it can be reached from other sites connected to Skupper.
>
> **`skupper token`**: Generates a connection token that other sites can use to join the Skupper network securely.
>
> **`skupper link`**: Establishes a secure link between two Skupper sites using the token created by `skupper token`.
>
> **`skupper service status`**: Shows the status of services exposed through Skupper — what is reachable and how it is connected in the network.
>
> **`ilab download`**: Downloads the model used by the chatbot.
>
> **`ilab model serve`**: Starts the server that receives user input, sends it to the LLaMA3 model, and returns the response.
>
> **`ilab model chat`**: Starts the chatbot so the user can interact with it.

### Run the demo

#### Before you start

To set up the demo you need:

- Access to a Kubernetes cluster with Skupper and InstructLab installed.

- A server running the InstructLab chat model.

- A terminal to run the commands.

- A web browser to interact with the chatbot.

- The Skupper client installed and configured for the Kubernetes cluster.

- Podman installed to run the private Skupper site.

#### Deploying the AI Model with InstructLab

The first step is to deploy the InstructLab chat model on the InstructLab site. That model receives user input and sends it to LLaMA3; the LLaMA3 response is sent back to the user. This is based on: <https://developers.redhat.com/blog/2024/06/12/getting-started-instructlab-generative-ai-model-tuning#model_alignment_and_training_with_instructlab> [Getting started with InstructLab for generative AI model tuning].

```bash
mkdir instructlab && cd instructlab
sudo dnf install gcc gcc-c++ make git python3.11 python3.11-devel
python3.11 -m venv --upgrade-deps venv
source venv/bin/activate
pip install instructlab
```

> NOTE
>
> The command `mkdir instructlab && cd instructlab` creates a directory named `instructlab` and changes into it.
>
> The command `sudo dnf install gcc gcc-c++ make git python3.11 python3.11-devel` installs the dependencies InstructLab needs.
>
> The command `python3.11 -m venv --upgrade-deps venv` creates a virtual environment named `venv` for InstructLab.
>
> The command `source venv/bin/activate` activates the virtual environment.
>
> The command `pip install instructlab` installs InstructLab in the virtual environment.

#### Initialize InstructLab Configuration

Next, initialize InstructLab configuration. The command `ilab config init` creates `config.yaml` with the default settings. Run:

```bash
ilab config init
```

The output will look similar to the following, prompting you for values to initialize the environment:

```bash
Welcome to InstructLab CLI.
This guide will help you to setup your environment.
Please provide the following values to initiate the environment [press Enter for defaults]:
Path to taxonomy repo [/home/user/.local/share/instructlab/taxonomy]:
Path to your model [/home/user/.cache/instructlab/models/merlinite-7b-lab-Q4_K_M.gguf]:
Generating `/home/user/.config/instructlab/config.yaml` and `/home/user/.local/share/instructlab/internal/train_configuration/profiles`...
Please choose a train profile to use.
Train profiles assist with the complexity of configuring specific GPU hardware with the InstructLab Training library.
You can still take advantage of hardware acceleration for training even if your hardware is not listed.
[0] No profile (CPU, Apple Metal, AMD ROCm)
[1] Nvidia A100\/H100 x2 (A100_H100_x2.yaml)
[2] Nvidia A100\/H100 x4 (A100_H100_x4.yaml)
[3] Nvidia A100\/H100 x8 (A100_H100_x8.yaml)
[4] Nvidia L40 x4 (L40_x4.yaml)
[5] Nvidia L40 x8 (L40_x8.yaml)
[6] Nvidia L4 x8 (L4_x8.yaml)
Enter the number of your choice [hit enter for no profile] [0]:
No profile selected - any hardware acceleration for training must be configured manually.
Initialization completed successfully, you're ready to start using `ilab`.
Enjoy!
```

> NOTE
>
> The command `ilab config init` initializes InstructLab configuration and creates `config.yaml` with defaults.
>
> You are prompted for values such as the taxonomy repository path and the model path.
>
> After `ilab config init`, your directories on a Linux system look similar to:

##### Files and directories created

```bash
 ~/.cache/instructlab/models/           # Directory where models are stored. 
 ~/.local/share/instructlab/datasets    # Directory where datasets are stored. 
 ~/.local/share/instructlab/taxonomy    # Directory where the taxonomy is stored.
 ~/.local/share/instructlab/checkpoints # Directory where checkpoints are stored. 
```

To enable external access to your model, edit `config.yaml` in your InstructLab config directory: ~/.config/instructlab/config.yaml. Change the `serve` section as shown below:

```yaml
host_port: 0.0.0.0:8000
```

> NOTE
>
> The `host_port:` IP address and port where the model will be exposed.
>
> In this case, the model is exposed on all interfaces.

### Downloading and Converting the DEEPSEEK Model for InstructLab

Next, download the model the chatbot will use and convert it to GGUF. InstructLab supports several models; for this demo we use DEEPSEEK. The command `ilab model download` downloads the model for the chatbot.

#### Creating a Hugging Face token

To download the model you need a Hugging Face token. If you do not have one, create a Hugging Face account and generate an access token. Then run:

```bash
export HF_TOKEN=<seu_token>
```

> NOTE
> The command `export HF_TOKEN=<seu_token>` sets the `HF_TOKEN` environment variable to your Hugging Face token. That is required to download the model from Hugging Face.

#### Downloading the DEEPSEEK model

Before starting the server, download the model. The command `ilab download` downloads the model for the chatbot. Run:

```bash
ilab model download --repository deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
```

> NOTE
>
> The command `ilab download` downloads the model used by the chatbot.

#### Converting the model to GGUF format

After downloading, convert the model to GGUF with llama.cpp. First clone the llama.cpp repository:

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
```

Follow the llama.cpp install instructions in the repository. After installation, run the conversion:

```bash
python ./convert_hf_to_gguf.py /home/rzago/.cache/instructlab/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B --outfile deepseek_f16.gguf --outtype f16
```

Move the converted file into the InstructLab models directory:

```bash
mv deepseek_f16.gguf $HOME/.cache/instructlab/models/DeepSeek-R1-Distill-Qwen-1.5B.gguf
```

> NOTE
>
> The command `git clone https://github.com/ggerganov/llama.cpp` downloads the llama.cpp repository.
>
> The command `python ./convert_hf_to_gguf.py` converts the downloaded Hugging Face model to GGUF.
>
> The `--outtype f16` flag converts to float16 to keep the file size reasonable.
>
> The `mv` command moves the converted file to the default directory where InstructLab looks for models.
>
> Now start the server that receives user input, sends it to the model, and returns the response. The command `ilab model serve` starts that server. Run:

```bash
ilab model serve --model-path ~/.cache/instructlab/models/DeepSeek-R1-Distill-Qwen-1.5B.gguf
```

> NOTE
>
> The command `ilab model serve --model-path` starts the server with the converted model path so it can receive user input, send it to the model, and return the response.

### Deploying Public Skupper

To expose the InstructLab service to the internet, deploy public Skupper in the Public Local Environment. Public Skupper exposes InstructLab so the Ollama Pilot application can send requests to the InstructLab chat model.

In this demo we use Kubernetes as the platform for public Skupper. Public Skupper exposes InstructLab so Ollama Pilot can reach the chat model. To install Skupper we use the `skupper` CLI.

#### Install Public Skupper

To install public Skupper, use the `skupper` CLI. The Skupper CLI creates and manages Skupper sites, exposes services, and establishes links between sites.

1. **Install the Skupper CLI**

   Run the following command to install the Skupper CLI:

   ```bash
   curl https://skupper.io/v2/install.sh | sh
   ```

  > NOTE
  >
  > The command `curl https://skupper.io/v2/install.sh | sh` downloads and installs the Skupper CLI locally. You need it to interact with Skupper and deploy the InstructLab service.

2. **Install Skupper on the Kubernetes cluster**

   After installing the CLI, install Skupper on the Kubernetes cluster:

   ```bash
   kubectl create ns skupper
   kubectl apply -f https://skupper.io/v2/install.yaml -n skupper
   ```

   > NOTE
   >
   > The command `kubectl create ns skupper` creates a namespace named `skupper` on the Kubernetes cluster to isolate Skupper and InstructLab resources.
   > The command `kubectl apply -f https://skupper.io/v2/install.yaml -n skupper` applies the Skupper install manifest, creating the resources Skupper needs, including the `skupper-router` pod that routes traffic between sites.

3. **Create the namespace and initialize Skupper on the Kubernetes cluster**

    After installing the CLI, create a namespace where Skupper will run. Create a namespace named `ilab-chat` and initialize Skupper:

    ```bash

    kubectl create ns ilab-chat
    export SKUPPER_PLATFORM=kubernetes
    skupper site create ilab-chat -n ilab-chat --enable-link-access
    ```

    > NOTE
    > The command `kubectl create ns ilab-chat` creates a new namespace named `ilab-chat` on the Kubernetes cluster to isolate Skupper and InstructLab resources.
    > The command `export SKUPPER_PLATFORM=kubernetes` sets the platform to Kubernetes, which Skupper needs.
    > The command `skupper site create ilab-chat -n ilab-chat --enable-link-access` initializes Skupper in the `ilab-chat` namespace and creates the resources needed for secure communication between services.
    > The `--enable-link-access` option lets other Skupper sites connect to this site, which makes cross-environment communication easier.

4. **Verify the Skupper install**

    After creating the namespace, check that Skupper installed correctly:

    ```bash
    kubectl get pods -n ilab-chat
    ```

    The output should show the skupper-router pod running, which means Skupper installed successfully.

    ```bash
    NAME                            READY   STATUS    RESTARTS   AGE
    skupper-router-cfc4c58f-pmhqv   2/2     Running   0          47s
    ```

  > NOTE
  >
  > The command `kubectl get pods -n ilab-chat` checks pod status in the `ilab-chat` namespace. The output should show `skupper-router` running.
  > The skupper-router pod is Skupper's main component for routing traffic between sites.

### Deploying Private Skupper

The second step is to deploy private Skupper in the Private Local Environment. Private Skupper creates a secure connection between the two sites so Ollama Pilot can send requests to the InstructLab chat model.

#### Install Skupper

To install Skupper on site A with Podman as the platform, open a new terminal for all private Skupper commands. We create a Skupper site using Podman, so enable the Podman service before running skupper init:

```bash
systemctl --user enable --now podman.socket
```

> NOTE
>
> `systemctl --user enable --now podman.socket` enables and starts the Podman service at the user level.

Now run the following commands to install Skupper:

```bash
export SKUPPER_PLATFORM=podman
skupper site create ilab-podman
skupper connector create instructlab 8000 --host localhost
```

> NOTE
>
> `SKUPPER_PLATFORM=podman` sets the platform to Podman. That is required because private Skupper runs in a Podman container.
>
> `skupper site create ilab-podman` creates a Skupper site named `ilab-podman` and configures the components needed for secure communication between services.
>
> `skupper connector create instructlab 8000 --host localhost` creates a connector that attaches the local InstructLab service (running on port 8000) to the Skupper network so remote sites can reach it.

### Secure Communication Between the Two Sites with Skupper

Now establish a secure connection between the two sites. First, on the public site (Kubernetes), generate the link:

```bash
skupper link generate -n ilab-chat > /tmp/link.yaml
```

> NOTE
>
> `skupper link generate` generates a link configuration file with the credentials needed for a secure connection between Skupper sites.

Then, on the private site (Podman), prepare the resources directory and move the link file:

```bash
mkdir -p $HOME/.local/share/skupper/namespaces/default/input/resources
mv /tmp/link.yaml $HOME/.local/share/skupper/namespaces/default/input/resources/link.yaml
skupper system setup --force
```

> NOTE
>
> The `mkdir -p` command creates the directory structure Skupper uses for input resources.
>
> The `link.yaml` file is moved to the resources directory where Skupper can pick it up automatically.
>
> `skupper system setup --force` forces Skupper to reconfigure and apply the new link.

Check the Skupper link status:

```bash
skupper link status link-ilab-chat

Name:           link-ilab-chat
Status:         Ok
Cost:           1
TlsCredentials: link-ilab-chat
Endpoint:       skupper-router-inter-router-ilab-chat.apps.*********.com:443
```

> NOTE
>
> `skupper link status` shows the status of a specific link in the Skupper network.
>
> Status "Ok" means the connection was established successfully.
>
> The endpoint shows the public URL where the link is active (masked for security).

> NOTE
>
> The `instructlab` parameter is the service name to expose, and `8000` is the port where the service runs.
> The `--host localhost` parameter tells the connector to connect to the local service on the loopback interface so it can be reached inside the private environment.

#### Creating the Listener on the Public Site

The last step is to create a listener on the public site to receive connections from the connector on the private site. That is what lets the app on the public cluster reach the AI model in the private environment.

- Still in the terminal where **public** Skupper is running, create the listener — this is the site that will consume the service:

```bash
skupper listener create instructlab 8000 -n ilab-chat
```

> NOTE
>
> The command `skupper listener create instructlab 8000` creates a listener that exposes the `instructlab` service on port `8000` of the public site so connected Skupper sites can reach it.
> The listener is an entry point on the Skupper network: it receives connections from other sites and forwards them to the `instructlab` service on the private site.
>

> **Connector and Listener relationship in Skupper:**
>
> - **Listener** (public site): `skupper listener create instructlab 8000` — creates an entry point on the Skupper network to receive connections
>
> The **connector** "pushes" the local service onto the Skupper network, while the **listener** "pulls" that service onto the remote site. Together they create a secure tunnel so apps on the public site can reach services on the private site as if they were local.

## Starting the Model Service on the Private Site

Now start the service in the terminal where the private site is running. This is the final step to bring the AI model up and make it available for requests over the Skupper network.

### Configuring the Server for External Access

Before starting the server, edit the InstructLab config so it accepts external connections. By default InstructLab listens only on the local interface (127.0.0.1); for Skupper it must accept connections on any interface.

Edit `~/.config/instructlab/config.yaml` and change the `server` section:

```yaml
# Server configuration including host and port.
...
  host: 0.0.0.0
  # Port to serve on.
  # Default: 8000
  port: 8000
```

> NOTE
>
> **`host: 0.0.0.0`**: Lets the server accept connections on all network interfaces, not only localhost. That is required for Skupper to reach the service.
>
> **`port: 8000`**: Keeps the default port 8000, matching the Skupper connector created earlier.
>
> **`backend_type: llama-cpp`**: Specifies the llama-cpp backend to serve the model.

With that config, the server is ready for connections through the Skupper network.

In the terminal where you configured private Skupper (Podman), make sure the InstructLab virtual environment is active and run:

```bash
cd instructlab
source venv/bin/activate
ilab model serve --model-path ~/.cache/instructlab/models/DeepSeek-R1-Distill-Qwen-1.5B.gguf
```

> NOTE
>
> **`ilab model serve`**: Starts the server that receives user input, sends it to the DeepSeek model, and returns the response.
>
> **`--model-path`**: Path to the GGUF model the server will load.
>
> The model will be available on port 8000 (configured earlier in `config.yaml`) and reachable through the Skupper network that connects the two sites.

After you run this command, you should see output similar to this:

```bash
INFO 2025-01-15 10:30:45,123 Starting server on http://0.0.0.0:8000
INFO 2025-01-15 10:30:45,124 Model loaded successfully
INFO 2025-01-15 10:30:45,125 Server ready to accept connections
```

The DeepSeek model is now running in the private environment and available through the secure Skupper connection to apps on the public site.

### Testing Connectivity through Skupper from the Public Site

With the AI model running on the private site and the Skupper connection in place, test that communication works from the public site (OpenShift).

To test connectivity from inside the Kubernetes cluster, create a temporary pod that can make HTTP requests to the InstructLab service:

```bash
kubectl run curl --image=quay.io/skupper/lanyard -n ilab-chat --restart=Never --rm -i --tty --  curl instructlab:8000
Warning: would violate PodSecurity "restricted:latest": allowPrivilegeEscalation != false (container "curl" must set securityContext.allowPrivilegeEscalation=false), unrestricted capabilities (container "curl" must set securityContext.capabilities.drop=["ALL"]), runAsNonRoot != true (pod or container "curl" must set securityContext.runAsNonRoot=true), seccompProfile (pod or container "curl" must set securityContext.seccompProfile.type to "RuntimeDefault" or "Localhost")
{"message":"Hello from InstructLab! Visit us at https://instructlab.ai"}pod "curl" deleted

```

> NOTE
>
> **`kubectl run curl --image=quay.io/skupper/lanyard -n ilab-chat --restart=Never --rm -i --tty --`**: Creates a temporary pod using the `quay.io/skupper/lanyard` image, a lightweight image for network commands. The pod is created in the `ilab-chat` namespace and removed automatically after the command finishes.
>
> **`--restart=Never`**: Ensures the pod is not restarted after it exits — a one-shot pod.
>
> **`curl -v http://instructlab:8000/`**: Inside the pod, issues an HTTP request to the InstructLab service on port 8000. `-v` enables verbose mode for request and response details.

## Conclusion

In this second act of the series, we laid the foundation for a secure AI architecture with Skupper. We implemented:

### What we accomplished

- **InstructLab environment setup**: Prepared the full environment to serve the DeepSeek model, including conversion to GGUF
- **Hybrid Skupper infrastructure**: Built a secure network connecting a public site (Kubernetes) with a private environment (Podman)
- **Secure links**: Used the new Skupper v2 commands (`skupper link generate` and `skupper system setup`) to create an encrypted connection
- **Connector/Listener architecture**: Implemented the pattern where the connector "pushes" the private service onto the Skupper network and the listener "pulls" it onto the public site
- **Connectivity test**: Validated that the AI model in the private environment is reachable through the Skupper network

### Architecture benefits

- **Security by design**: The AI model stays in a controlled private environment
- **Zero trust network**: Skupper creates secure tunnels without direct exposure to the internet
- **Scalability**: Ready for web UI deployment on the public cluster
- **Observability**: Foundation in place for monitoring traffic between sites

### Next steps

In the **third and final act**, we will:

- Deploy the chatbot web UI on Kubernetes
- Configure NGINX Ingress and LoadBalancer for external access
- Integrate the full solution with InstructLab
- Finish the end-to-end solution

This architecture gives organizations a solid base to keep AI models secure while still offering accessible interfaces to end users.

## References

- [Commands extracted from the InstructLab project](https://github.com/instructlab)
- [Getting started with InstructLab: Generative AI model tuning](https://developers.redhat.com/blog/2024/06/12/getting-started-instructlab-generative-ai-model-tuning#model_alignment_and_training_with_instructlab)
- [InstructLab installation guide](https://github.com/instructlab/instructlab/blob/main/README.md#-installing-ilab)
- [Chatbot ILAB Frontend](https://github.com/rafaelvzago/ilab-client)
- [Hugging Face Token](https://huggingface.co/docs/hub/en/security-tokens)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [Skupper Documentation](https://skupper.io/docs/)
- [DeepSeek Model](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Podman Documentation](https://docs.podman.io/)
