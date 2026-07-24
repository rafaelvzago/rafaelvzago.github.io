---
title: "How an AI works when you talk to it"
description: "What an LLM actually does when you chat: next-token prediction, temperature, pretraining, RLHF, Transformers, and why it isn't magic—just math at scale."
date: 2025-12-24
slug: "o-que-acontece-quando-voce-conversa-com-uma-ia"
tags: [ai, llm, machine-learning, transformers, deep-learning, chatbot, gpt, tecnologia, mlops]
toc: true
images:
  - "/assets/img/headers/o-que-acontece-quando-voce-conversa-com-uma-ia.png"
---

![](/assets/img/headers/o-que-acontece-quando-voce-conversa-com-uma-ia.png)

{{< youtube uhxG2B96k7Q >}}

## Unpacking large language models

When you type a message to ChatGPT or Claude, what happens on the other side is simpler than it looks—but it runs at a scale that is hard to picture.

## The essence: a digital football commentator

Picture this: World Cup final, Brazil vs Argentina, last minutes of the match. Galvão Bueno is calling the game, the ball reaches the Brazilian striker, he beats one defender, then another... and suddenly the audio cuts out. The broadcast keeps rolling, but the commentator's voice is gone.

Now imagine a machine that can analyze everything Galvão said up to that point—tone, rhythm, catchphrases, game context—and predict the next word he would say. *"Vai que é tua..."*, *"Haja coração..."*, *"GOOOOOL..."*?

With that machine you could finish the commentary word by word: feed in what was already said, get a prediction for the most likely next word, append it, and repeat until the whole broadcast is complete.

That is basically what an LLM does.

A large language model is essentially a sophisticated mathematical function that takes text as input and produces a probability distribution over every possible next word (or, more precisely, token). It is like having thousands of internal commentators voting on which next word fits best.

![Infographic: How LLMs work](/assets/o-que-acontece-quando-voce-conversa-com-uma-ia-infografico.png)

## Probabilities, not certainties

Worth noting: the model does not "decide" the next word. It assigns a probability to every word in its vocabulary. For example:

| Next word | Probability |
|-----------|-------------|
| "today"   | 32%         |
| "now"     | 18%         |
| "here"    | 12%         |
| "always"  | 8%          |
| ...       | ...         |

The system then picks a word based on those probabilities. That sampling process is controlled by a parameter called **temperature**:

- **Low temperature**: The model behaves like a restrained commentator—think Milton Leite: it picks the safest, most likely words and produces predictable, conservative answers
- **High temperature**: The model turns into Galvão hyped up for a World Cup final: it accepts less likely words, and answers get more creative and exciting (but potentially less coherent)

That is why you can ask the same question several times and get different answers. Two commentators never describe the same play the same way; the model introduces variation through sampling.

## Training: absorbing the internet

How does a model learn to make those predictions? The short answer is a huge volume of training data.

### Data at scale

For context: if you read 24 hours a day with no breaks, it would take roughly **2,600 years** to consume the amount of text used for GPT-3. GPT-4 used an estimated **10 to 20 times** more. Models such as Meta's Llama 3 were trained on more than 15 trillion tokens.

The model processes all that text with a simple objective: given a stretch of text, predict the next word. It sounds trivial, but that objective forces the model to build a deep grasp of language. Along the way it picks up:

- Grammar and syntax
- Context and coherence
- Factual knowledge
- Logical reasoning (to a point)

### Parameters: the model's controls

An LLM is defined by billions (sometimes trillions) of numeric values called **parameters** or **weights**. Think of them as the knobs on a mixing desk with billions of controls: each tweak slightly changes how the model behaves.

GPT-4 is estimated at about **1.7 trillion parameters**. Meta's Llama 3.1 ships in 8B, 70B, and 405B versions. Claude 3 Opus sits around 175 billion.

### Backpropagation: learning from mistakes

No human tunes those parameters by hand. They start random (the initial model mostly produces noise) and are refined through **backpropagation**:

1. The model gets a training text (minus the last word)
2. It predicts what the next word should be
3. It compares that prediction with the real word
4. An algorithm nudges all parameters so the model is *slightly* more likely to get it right next time

![Backpropagation flow](/assets/llm-retropropagacao.png)

Repeat that trillions of times and the model starts making solid predictions—even on text it has never seen.

## Pretraining vs. fine-tuning: two distinct stages

What I described above is **pretraining**. It teaches the model to be a strong text completer, but there is a catch: completing internet text is not the same as being a useful assistant.

A pretrained model can continue any text, but it will not necessarily answer questions helpfully or avoid problematic content.

### RLHF: reinforcement learning from human feedback

To turn a text completer into an assistant, developers run a second training stage called **RLHF** (Reinforcement Learning from Human Feedback):

1. Humans rate different model answers to the same question
2. Those ratings teach the model which kinds of answers are preferable
3. The model is adjusted to produce more of the "preferred" answers

That process aligns the model with human expectations around usefulness, safety, and accuracy.

## The Transformer architecture: the heart of modern LLMs

Before 2017, language models processed text sequentially, one word at a time. That was slow and made long-range dependencies hard to capture.

The paper "Attention Is All You Need" (Vaswani et al., 2017) introduced the **Transformer** architecture and changed the field.

### Embeddings: turning words into numbers

The first step in any language model is converting text into numbers. Each word (or token) is represented by a vector—a list of hundreds or thousands of numbers.

Those vectors are called **embeddings**. They encode word "meaning" so similar words end up with similar vectors.

### The attention mechanism

The Transformer's big difference is **attention**. Instead of processing words one by one, the model looks at all words at once and lets each word "consult" the others to refine its meaning.

In a sentence like "The bank was empty," the word "bank" needs to know whether we mean a financial institution or a seat. Attention lets "bank" consult "empty" and the rest of the context to resolve that ambiguity.

Mathematically, attention is:

```
Attention(Q, K, V) = softmax(QK^T / √d_k) V
```

Where Q (Query), K (Key), and V (Value) are learned projections of the input embeddings.

### Layers and depth

A typical Transformer stacks multiple layers, each with:

1. **Multi-Head Attention**: Several attention mechanisms in parallel
2. **Feed-Forward Network**: A dense neural net that processes each position independently
3. **Normalization and Residual Connections**: Techniques that stabilize training

GPT-4, for example, is estimated at about 120 of those stacked layers; Llama 3.1 405B has 126.

### Visualizing the architecture

![Transformer architecture](/assets/llm-transformer-arquitetura.png)

The diagram above shows data flowing through a Transformer. Text goes in, becomes embeddings, passes through multiple attention and feed-forward layers, and finally produces a probability distribution over the vocabulary.

## Compute at a scale that is hard to picture

Training a modern LLM takes absurd compute. To put it in perspective:

If you could do a billion math operations per second, how long would it take to run every operation needed to train one of the largest language models?

The answer: **more than 100 million years**.

That is only feasible because of:

- **GPUs**: Chips specialized for parallel processing
- **Clusters**: Thousands of GPUs working together
- **Parallelization**: The Transformer architecture lets a large share of the work happen at the same time

The cost of training a frontier model can easily run past tens of millions of dollars in compute alone.

## Trying it in practice with Python

We can explore some of these ideas in code. Here is an example using Google's **Gemini** in **Google Colab**:

```python
# Instalar/atualizar a biblioteca (Google Colab)
!pip install -q -U google-generativeai

import google.generativeai as genai
from google.colab import userdata

# Configurar API key usando secret do Colab
genai.configure(api_key=userdata.get('GEMINI_API_KEY'))

# Usar modelo Gemini
model = genai.GenerativeModel('gemini-2.0-flash')

def ver_probabilidades(texto: str):
    """Mostra possíveis continuações usando Gemini."""

    prompt = f"""Você é um especialista em modelos de linguagem. Dado o início da frase "{texto}", liste as 5 palavras mais prováveis que um modelo de linguagem escolheria como próxima palavra.

Responda APENAS neste formato exato, com porcentagens estimadas:
palavra1 - XX%
palavra2 - XX%
palavra3 - XX%
palavra4 - XX%
palavra5 - XX%
"""

    response = model.generate_content(prompt)

    print(f"Texto: '{texto}'")
    print(f"\nPróximas palavras mais prováveis:")
    print("-" * 40)
    print(response.text)

# Exemplo de uso
ver_probabilidades("O céu está")
```

> **Setup:** In Google Colab, add your Gemini API key as a secret named `GEMINI_API_KEY`. You can create a key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

**Expected output:**

```
Texto: 'O céu está'

Próximas palavras mais prováveis:
----------------------------------------
azul - 35%
claro - 22%
nublado - 18%
lindo - 12%
escuro - 8%
```

This code shows exactly what we discussed: the model looks at the context and estimates which words are most likely to continue the sentence.

## Connecting to other projects

If you want to run models locally, see my post on [InstructLab and Skupper](/en/posts/running-local-ai-with-instruct-lab/), where I explore building chatbots with protected data using secure connections across environments.

## Conclusion

At bottom, LLMs are text completers that learned patterns from enormous amounts of data. A simple objective (predict the next word), absurd scale (billions of parameters, trillions of tokens), an efficient architecture (Transformer with attention), and an alignment stage (RLHF). Together, that produces systems that seem to "understand" language, even though they are running large-scale math.

Understanding those fundamentals helps you use the tools better, spot limitations (hallucinations, bias), and judge more realistically what they actually do.

LLMs are useful tools. They are not magic, and they are not general intelligence. They are math at a scale that is hard to visualize.

---

## References

1. Vaswani, A. et al. (2017). [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762). NeurIPS.
2. Brown, T. et al. (2020). [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165). NeurIPS.
3. Ouyang, L. et al. (2022). [*Training language models to follow instructions with human feedback*](https://arxiv.org/abs/2203.02155). NeurIPS.
4. Radford, A. et al. (2019). [*Language Models are Unsupervised Multitask Learners*](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf). OpenAI.
5. 3Blue1Brown. (2024). [*How LLMs Work*](https://www.youtube.com/watch?v=LPZh9BOjkQs). YouTube.
