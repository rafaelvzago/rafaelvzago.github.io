---
title: "Vim motions: navegar e editar código mais rápido"
description: "Guia prático de Vim motions cobrindo modos Normal, Insert e Visual, navegação por buffers e atalhos no Neovim/AstroVim para editar código mais rápido."
date: 2024-07-02
slug: "vim-motions"
tags: [vim, neovim, astrovim, editor, produtividade, motions, desenvolvimento, tools]
toc: true
images:
  - "/assets/img/headers/vim-motions.jpg"
---

![](/assets/img/headers/vim-motions.jpg)

## Vim Motions: o poder dos atalhos no teclado

Vim motions são um conjunto de comandos que permitem navegar e editar código com fluidez. Este guia passa pelos principais motions e como usá-los no dia a dia.

## Minha jornada: de VSCode e IntelliJ ao Neovim e AstroVim

Depois de anos no VSCode e no IntelliJ, migrei o Neovim como ferramenta principal. Neovim é um editor baseado em Vim, bem mais extensível, com uma experiência moderna em relação ao Vim clássico. Recentemente passei a usar AstroVim, uma configuração de Neovim com plugins e recursos prontos que aceleram o fluxo de trabalho.

O AstroVim traz file explorer, busca e outros plugins embutidos que deixam o desenvolvimento mais direto. A troca veio da vontade de ter um ambiente mais integrado e usável sem montar tudo do zero.

Esta série registra essa jornada e compartilha dicas, truques e configurações que tornaram Neovim e AstroVim parte fixa do meu workflow.

Hoje começamos pela base: Vim motions. Dominar esses comandos é o que destrava o potencial de edição do Vim.

**Aviso:** isto não é uma guerra de editores. É só o que funcionou melhor *para mim* — e um convite para você testar se o Vim faz sentido no seu estilo de desenvolvimento.

## Plugins do Vim: meu arsenal de produtividade

O AstroVim vem com um conjunto curado de plugins. Alguns dos padrões incluídos:

* "nvim-treesitter" - Syntax highlighting e navegação de código
* "telescope.nvim" - Fuzzy finder e file explorer
* "nvim-lspconfig" - Configurações de Language Server Protocol
* "nvim-cmp" - Plugin de autocompletar
* "gitsigns.nvim" - Integração com Git
* "lualine.nvim" - Status line
* "which-key.nvim" - Ajuda de keybindings
* "nvim-tree.lua" - File explorer
* "bufferline.nvim" - Buffer line para arquivos abertos
* "plenary.nvim" - Funções Lua usadas por vários plugins
* "copilot.vim" - Autocompletar com IA
* "catppuccin/nvim" - Tema Catppuccin Macchiato para Neovim

*(Setup completo e detalhes dos plugins ficam para posts futuros.)*

## O editor Vim: mais do que parece

![Vim](/assets/vim-post1-img1.jpg)

Vim é um editor altamente customizável, conhecido pela natureza modal. Os modos — Normal, Insert e Visual — atendem tarefas distintas e permitem alternar entre comandos e edição de texto sem atrito.

## Plugins do Vim: ampliando a experiência

As capacidades do Vim vão além do núcleo. Com a quantidade de plugins mantidos pela comunidade, dá para transformar o Vim em um IDE completo.

## Vim Motions na prática

![motions](/assets/vim-post1-img2.jpg)

Com motions bem treinados, você escreve e navega código bem mais rápido. Até IDEs populares como o VS Code têm plugins de Vim, então dá para levar essa navegação para o ambiente que você já usa.

**Modos do Vim:**

* **Normal Mode:** central de comandos.
* **Insert Mode:** onde o código é escrito de fato.
* **Visual Mode:** seleção e manipulação visual de texto, inclusive seleção em bloco.

O Vim também tem uma leader key para atalhos customizados e um command mode para operações como salvar arquivos.

## Navegando no codebase

O AstroVim reforça a navegação com keybindings extras:

* **Navegação de janelas (Ctrl + h/j/k/l):** mude entre splits com `Ctrl` + `h`, `j`, `k` ou `l`.

* **Navegação de buffers (]b, [b):** `]b` vai para o próximo buffer e `[b` para o anterior.

* **Redimensionar janelas (Ctrl + setas):** ajuste o tamanho com `Ctrl` e as setas.

* **Toggle Neotree (Leader + e):** abre ou fecha o file explorer com `Leader + e`.

* **Toggle Comment (Leader + /):** comenta ou descomenta linhas com `Leader + /`.

* **Abrir terminal (Leader + tf):** abre um terminal flutuante com `Leader + tf`, sem sair do Neovim.

Vamos a um app React e ver como os motions enxugam a navegação:

* **Movimentos básicos (h, j, k, l):** esqueça as setas. Use para esquerda, baixo, cima e direita. Prefixo numérico (ex.: `5j`) move várias linhas.

* **Navegação por palavra (w, b, e):** avance (`w`), volte (`b`) ou vá ao fim (`e`) da palavra. Prefixo numérico para várias palavras.

* **Navegação na linha (0, ^, g, $, f, F):** início (`0`), primeiro caractere não em branco (`^`), fim (`$`), ou busca de caractere (`f` à frente, `F` para trás).

* **Navegação vertical ((), {}, Ctrl+D/U, Ctrl+F/B, G):** frases (`(` e `)`), parágrafos (`{` e `}`), meia página (`Ctrl+D`, `Ctrl+U`), página cheia (`Ctrl+F`, `Ctrl+B`), início do arquivo (`gg`) e fim (`G`).

## Entrando no Insert Mode: vários caminhos

O Vim oferece várias formas de entrar em insert mode, cada uma útil em um cenário:

* **Antes do cursor (`i`)**: inserir texto logo antes da posição atual. Útil para completar um caractere faltando no nome de uma variável.

* **Depois do cursor (`a`)**: acrescentar texto imediatamente após o cursor. Bom para colocar um ponto e vírgula no fim de um statement.

* **Início da linha (`I`)**: ir ao começo da linha para inserir texto. Prático para comentários ou anotações no início.

* **Fim da linha (`A`)**: ir ao fim da linha para acrescentar texto. Use quando precisar estender a linha com código ou comentário.

* **Abaixo da linha atual (`o`)**: abre uma linha nova abaixo e entra em insert. Ideal para acrescentar código em um bloco.

* **Acima da linha atual (`O`)**: como `o`, mas abre acima. Útil para inserir uma linha antes da atual, por exemplo uma nova definição de função.

Outros gatilhos incluem `c` (change), `s` (substitute), `y` (yank/copy) e `p` (paste). Dá para copiar linhas inteiras com `yy`.

## Para aprender mais

A curva do Vim é íngreme, mas o retorno é grande. Para aprofundar:

* **Vim Documentation:** [https://vimdoc.sourceforge.io/index.html](https://vimdoc.sourceforge.io/index.html)
* **Vim Tutorial:** [https://www.tutorialspoint.com/vim/vim_tutorial.htm](https://www.tutorialspoint.com/vim/vim_tutorial.htm)
* **Vim Cheat Sheet:** [https://www.vim.org/doc/vimtutor/vimtutor.pdf](https://www.vim.org/doc/vimtutor/vimtutor.pdf)

Bom Vimming!
