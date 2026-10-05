---
title: "Inference Engineering: Models, Weights, Evals, and LLM Serving"
date: 2026-10-05
tags: [inference, llm, machine-learning]
draft: false
---

I found an interesting book by Philip Kiely called [*Inference Engineering*](https://x.com/philipkiely/status/2025994823891914795?s=20) and started reading it. Here are some notes so far.

## Models and weights

Models are fundamentally mathematical functions: they take an input and variable parameters, then produce an output in the form of a prediction. A simple example is linear regression:

```text
y = wx + b
```

Here, `x` is the input, `y` is the prediction, and `w` and `b` are learned weights or parameters.

- **Training** means adjusting `w` and `b` until the function produces useful predictions.
- A neural network is more complicated. It consists of functions that look like `y = f(Wx + b)`, where `W` may contain millions or billions of numbers.
- A **transformer** is an architecture that combines embeddings, attention mechanisms, MLPs, normalization, and other components into repeated processing blocks.

Some of those components are:

- **Embeddings** convert tokens—words or pieces of words—into numerical vectors the model can process.
- **Attention** lets each token examine other tokens and determine which are important in context. For example, in “The animal didn't cross the road because it was tired,” attention helps connect “it” with “animal.”
- **MLPs** (multilayer perceptrons), also called feed-forward networks, process and transform the information gathered by attention.
- **Normalization** rescales activations to keep computations stable and make training easier.
- Other structures usually include residual connections, positional information, and an output layer that converts the final representations into logits.

**Logits** are the raw scores a model produces before they are converted into probabilities. They can be transformed using functions such as sigmoid or softmax. Sigmoid estimates the probability of each choice independently; softmax distributes probability across a set of choices.

**Weights** are the numbers a model learned during training. For example, in a simple house-price model:

```text
house_price = bedrooms × 20,000
            + area × 500
            + 10,000
```

The values `20,000` and `500` are roughly analogous to weights. An LLM may instead have billions of parameters:

```text
8,000,000,000 parameters
```

Each individual number means almost nothing to a human. Collectively, the numbers encode the behavior learned during training.

An **open-weight model** lets you download the learned parameters and run the model yourself. With a **closed-weight model**, you typically access it through an API. Open weights do not necessarily mean fully open-source AI: a company might publish the weights while withholding the training data, training code, data-cleaning process, reinforcement-learning pipeline, architecture details, or certain licenses and rights.

## Layers of inference engineering

### Runtime

The runtime layer answers: How does the model actually execute? A simplified stack looks like this:

```text
Your application
      ↓
vLLM / SGLang / TensorRT-LLM
      ↓
PyTorch and GPU kernels
      ↓
CUDA
      ↓
NVIDIA GPU hardware
```

- **PyTorch** is a broad machine-learning framework used to build and train models.
- **CUDA** is NVIDIA's underlying GPU-computing platform.
- **vLLM** and **SGLang** are specialized LLM serving and inference engines.
- **TensorRT-LLM** is NVIDIA's specialized LLM inference-optimization and runtime stack.

Runtime engineering includes optimizing a model on a GPU-backed instance through techniques such as:

- **Batching:** Run incoming requests in parallel, interleaving their work token by token to increase throughput.
- **Caching:** Reuse key-value (KV) cache entries—cached attention results—when requests share prefixes.
- **Quantization:** Lower the precision of selected model values to reduce memory use and potentially improve compute efficiency.
- **Speculative decoding:** Generate and validate draft tokens to produce multiple tokens per forward pass during decoding.
- **Parallelism:** Use multiple GPUs to accelerate large models without introducing new bottlenecks.
- **Disaggregation:** Separate the two phases of LLM inference, prefill and decode, onto independently scaling workers.

### Infrastructure

The infrastructure layer asks where and under what operational conditions the model runs. It involves scaling across clusters, regions, and clouds without creating silos, while maintaining excellent uptime. It includes:

- GPUs
- Networking
- Storage
- Load balancing
- Routing
- Autoscaling
- Capacity management

### Tooling

Tooling is the control and engineering environment around runtime and infrastructure. It gives inference engineers the right level of abstraction to balance control with productivity. This includes:

- Deployment systems
- Model registries
- Observability
- Evaluation
- Benchmarking
- Profiling
- CI/CD
- Configuration
- Experimentation

## Shared versus dedicated inference

- **Shared inference:** Think hosted APIs. It's cheap and convenient, but you give up some control over latency, hardware, scaling, and isolation.
- **Dedicated inference:** It's more expensive, but offers greater predictability, customization, and operational control.

The right choice comes down to the application's needs and constraints.

## Evaluate before optimizing

Don't spend engineering effort making a bad model answer faster. First define your application's constraints and what counts as an acceptable result, then design around those requirements.

This is relatable to my experience building Retreev. At a certain point, we had to revisit a model we were serving. It wasn't the right fit on several counts, so we evaluated other options, settled on the one that came out on top, and then optimized it for serving.

## Fine-tuning and distillation

**Fine-tuning** modifies some of a model's parameters so it becomes better suited to a particular task, domain, or behavior. **Distillation** uses a larger model to teach a smaller one to approximate its behavior.

## Prefill, decode, and serving metrics

**Prefill** is when the model processes the complete input prompt. It influences time to first token (TTFT): a longer prompt requires more prefill work and can lead to higher TTFT.

**Decode** is the stage where the model generates output one token at a time after processing the prompt. It heavily influences the generation rate after the first token. The **KV cache** avoids recalculating the entire previous conversation every time a new token is generated.

Some useful serving metrics are:

- **Perceived TPS:** The observed tokens per second for an individual user after the first token; a measure of generation speed.
- **Total TPS:** The total number of tokens generated each second by the inference service; a measure of throughput.
- **Inter-token latency (ITL):** The time between successive tokens. An ITL of 10 milliseconds corresponds to 100 tokens per second for an individual user.

---