---
title: "TCP/IP: origins and evolution of the protocols"
description: "From ARPANET and packet switching to the TCP/IP application layer: origins, design choices, everyday protocols, and a hands-on Python HTTP request demo."
date: 2024-12-14
slug: "protocolos-TCP-IP-o-inicio"
tags: [networking, tcp-ip, protocolos, arpanet, internet, historia, tecnologia, redes, tcpip]
toc: true
images:
  - "/assets/img/headers/tcpip-protocols-hero.webp"
---

![](/assets/img/headers/tcpip-protocols-hero.webp)

## TCP/IP protocols: a complete introduction

## ARPANET and the origins of TCP/IP

The story of TCP/IP starts in the late 1950s, at the height of the Cold War. The U.S. Department of Defense (DoD) wanted a command-and-control network that could survive a nuclear attack. Military communications at the time relied on the public telephone network, which looked fragile: rigid hierarchy, little redundancy.

### Early research and Paul Baran's contributions

Around 1960, the DoD hired the RAND Corporation to look for a solution. Paul Baran proposed a highly fault-tolerant distributed design that used digital packet switching instead of analog signals. Large carriers like AT&T resisted at first, but Baran's idea laid the groundwork for modern resilient networks.

### ARPA's role

After the Soviet Union launched Sputnik in 1957, the U.S. government created ARPA (Advanced Research Projects Agency). ARPA started computer networking efforts to advance scientific and technological research. Larry Roberts, one of the ARPA managers, decided to build a packet-switched network, influenced by Paul Baran and Donald Davies.

### ARPANET structure

![ARPANET](/assets/introducao_tcp_arpanet.png)

ARPANET was designed as a packet-switched subnet made of minicomputers called IMPs (Interface Message Processors). Those IMPs, linked by 56 kbps lines, formed the first electronic packet-switched network that used store-and-forward to move data reliably.

Each network node had an IMP and a host, connected locally by short wires. Messages up to 8063 bits were split into smaller packets and sent independently, so routing could adapt if parts of the network were destroyed. The network was built for resilience: each IMP connected to at least two others for redundancy.

### Growth and impact

ARPANET went live in December 1969 with four initial nodes: UCLA, UCSB, SRI, and the University of Utah. Within a few years it grew quickly, linking more institutions and networks. Through the 1980s, new networks and the creation of DNS (Domain Name System) made host names and addresses easier to manage.

That expansion led to the TCP/IP protocols, designed to interconnect heterogeneous networks. Contracts with universities and companies put the protocols on different platforms and helped cement TCP/IP as the global standard for network communication.

---

## Introduction to the TCP/IP model

The TCP/IP protocols (Transmission Control Protocol/Internet Protocol) form the backbone of communication on the modern internet. This article reviews the protocols, their layers, and how they work together to move data across local and global networks.

---

## The TCP/IP model: introduction and the first layer

The TCP/IP model is a four-layer framework for data communication on modern networks. Each layer has a specific job so data can move efficiently and reliably. We'll start with a closer look at the first layer: the **Application Layer**.

### Application Layer: the user interface

In the TCP/IP model, the Application Layer is where users and applications meet the network. It provides the tools and protocols that apps and services need to talk to the communication stack. This layer turns application requests and responses into data the lower layers can handle.

It is also known as **Layer 7** in the OSI (Open Systems Interconnection) model, a related reference model. TCP/IP is more widely used in practice and maps more directly to how the internet is built.

#### Main functions

1. **Application interaction:** Services that let software use the network to send data.
2. **Data handling:** Shaping data so it fits transport protocols.
3. **Network services:** Enabling specific services such as file transfer, email, and web browsing.

#### Example protocols in the Application Layer

- **HTTP/HTTPS (Hypertext Transfer Protocol):** Communication between browsers and web servers—the core of web browsing.
- **FTP (File Transfer Protocol):** File transfer between computers.
- **SMTP (Simple Mail Transfer Protocol):** Sending email.
- **DNS (Domain Name System):** Resolving domain names to IP addresses.

#### Technical structure

Application-layer protocols do more than move messages; they often add authentication, compression, and encryption. HTTPS, for example, adds security to HTTP with SSL/TLS encryption.

#### Data model

Data at this layer is encapsulated and formatted as messages for the next layer. A typical application-layer data flow looks like this:

![Application Layer data flow](/assets/introducao_tcp_aplicacao.png)

#### Everyday uses

The Application Layer shows up in programs we use every day:

1. **Web browsers:** When you open a site like "www.example.com", the browser uses HTTP or HTTPS to send requests and receive responses from the web server.
2. **Email clients:** Programs such as Microsoft Outlook or Thunderbird use SMTP, IMAP, or POP3 to send and receive messages.
3. **Video streaming:** Services like Netflix and YouTube deliver video over HTTP/HTTPS, often through content delivery networks (CDNs).
4. **Messaging apps:** WhatsApp and Telegram use HTTP/HTTPS-based protocols and other application-layer services for instant messages and files.
5. **Online games:** Many games rely on HTTP/HTTPS APIs for authentication and data sync, plus other game-specific protocols.

#### Why it matters in network architecture

The Application Layer is critical because it grounds human–computer interaction on the network. Without it, practical internet use would fall apart—there would be no effective way to turn human intent into requests the network can process.

#### Testing the Application Layer with Python

To show the Application Layer in action, we can run a simple Python script that issues an HTTP request to a web server:

```python
# Importar a biblioteca de sockets para comunicação de rede
import socket

# Função para testar a camada de aplicação usando o protocolo HTTP
def test_application_layer(host: str, port: int):
  """Função para testar a camada de aplicação usando o protocolo HTTP."""
  try:
    # Criar um socket para comunicação com o servidor
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
      # Conectar ao servidor especificado pelo host e porta
      client_socket.connect((host, port))
      
      # Preparar uma solicitação HTTP GET simples
      http_request = f"GET / HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\n\r\n"
      
      # Enviar a solicitação HTTP para o servidor
      client_socket.sendall(http_request.encode())
      
      # Receber a resposta do servidor em partes (chunks)
      response = b""
      while True:
        # Receber um chunk de dados do servidor
        chunk = client_socket.recv(4096)
        # Se não houver mais dados, interromper o loop
        if not chunk:
          # Se não houver mais dados, interromper o loop
          break
        # Adicionar o chunk recebido à resposta completa
        response += chunk
      
      # Exibir a resposta completa do servidor no console
      print("Resposta do Servidor:")
      # Decodificar a resposta binária em texto
      print(response.decode())
  
  except Exception as e:
    # Capturar e exibir qualquer erro que ocorra durante o teste
    print(f"Erro ao testar a camada de aplicação: {e}")

# Testar a função com um servidor HTTP específico
test_application_layer("www.example.com", 80)
```

#### Expected output

When you run it, the script sends an HTTP request to `www.example.com` and prints the server response. The output looks roughly like this:

```bash
$ python aplicacao.py
Resposta do Servidor:
HTTP/1.1 200 OK
Age: 119377
Cache-Control: max-age=604800
Content-Type: text/html; charset=UTF-8
Date: Sat, 14 Dec 2024 03:53:09 GMT
Etag: "3147526947+ident"
Expires: Sat, 21 Dec 2024 03:53:09 GMT
Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
Server: ECAcc (mid/8790)
Vary: Accept-Encoding
X-Cache: HIT
Content-Length: 1256
Connection: close

<!doctype html>
<html>
.
.
.
```

This hands-on demo shows how Application Layer protocols such as HTTP enable client–server communication on modern networks. Without this layer, practical internet use would be impossible—there would be no effective way to turn human intent into requests the network can process.

---

## References

0. Tanenbaum, A. S., & Wetherall, D. J. (2011). *Computer Networks*.
1. Baran, P. (1964). *On Distributed Communications: Introduction to Distributed Communications Network*.
2. Roberts, L. (1967). *Multiple Computer Networks and Intercomputer Communication*.
3. Braden, R. (1989). RFC 1122: *Requirements for Internet Hosts - Communication Layers*.
4. Clark, D. D. (1988). *The Design Philosophy of the DARPA Internet Protocols*.
5. Cerf, V., & Kahn, R. E. (1974). *A Protocol for Packet Network Intercommunication*.

---

### Next steps

In upcoming articles we'll walk through the remaining TCP/IP layers and their protocols. Next up: the Transport Layer, where we'll look at TCP and UDP for reliable and efficient communication.
