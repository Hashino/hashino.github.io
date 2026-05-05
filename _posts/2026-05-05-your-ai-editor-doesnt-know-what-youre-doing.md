---
layout: post
title: "Your AI Editor Doesn't Know What You're Doing"
date: 2026-05-05 16:58:00 -0300
categories: jekyll update
---

# Your AI Editor Doesn't Know What You're Doing

Your editor knows your codebase. It doesn't know what you're doing.

This is a structural limitation of how AI tooling is currently built, and the distinction matters more than it seems. Knowing a codebase means having a model of state — the functions, the types, the call graph, what exists and how it connects. Knowing what a programmer is doing means having a model of process — the intent behind the current sequence of edits, the problem being solved, the direction of movement. State is a snapshot. Process is a vector.

Current tools are good at the snapshot. They index your codebase, retrieve relevant context, and generate suggestions calibrated to what's there. The Cursor-style approach has gotten remarkably far on this. But it consistently fails at a specific class of problem: situations where the right suggestion depends not on what the code looks like right now, but on what the programmer has been trying to do for the last twenty minutes.

The obvious fix is to send edit history as context. If the model sees the last hundred edits, it can infer intent. The problem is cost. Edit history is verbose, the context window fills fast, and most of what's in that history is noise — intermediate states, backtracking, exploratory deletions. Sending raw history to a remote model on every keystroke isn't a product, it's a billing catastrophe.

---

The architecture I want to propose inverts the problem.

Instead of sending more context up, you add a layer of compression locally. A small model runs inside the editor — lightweight enough to respond in real time, trained specifically to track edit sequences and produce structured summaries. Not natural language summaries. Embeddings. The local model watches every edit, maintains a running representation of programmer intent as a vector, and sends that vector upstream when the remote model needs it.

The remote model receives not a history of raw edits but a compressed semantic trace of what the programmer has been doing. It uses this to generate suggestions that are calibrated to process, not just state.

This is already an improvement. But the interesting part is what happens when you make the communication bidirectional.

The remote model doesn't just receive from the local model — it can dispatch to it. Before generating a suggestion, the remote model can send an investigation instruction: check whether this function is called anywhere else, find all implementations of this interface, trace how this variable is threaded through the codebase. The local model executes the investigation against the indexed codebase and returns the result. The remote model incorporates this into the suggestion.

Two cases where this matters concretely. First: the remote model is about to suggest a refactoring. Before suggesting it, it dispatches — verify this change won't break callers it can't see from the current file. Second: it recognizes a pattern in the edit trace that commonly leads to a specific class of bug. It dispatches — check whether the conditions for that bug are present here. The suggestion, if it comes, arrives with actual grounding.

The criterion for dispatch isn't general uncertainty — it's consequential uncertainty. The remote model investigates when the suggestion has implications it can't evaluate from the context it already has. This is partially mapped, not solved. There are more cases than the two above, and the boundary conditions between "investigate" and "suggest directly" aren't fully defined. I'm naming this as open.

---

The embedding layer is also open, and in a deeper way.

The premise is that the local model compresses edit sequences into vectors that the remote model can interpret. But these are different models, potentially different architectures, certainly trained on different data. Their embedding spaces aren't compatible by default. A vector that means "the programmer is decomposing a monolith" in the local model's geometry doesn't mean the same thing in the remote model's geometry.

The solution is probably a trained alignment layer between the two spaces — essentially, fine-tuning both models jointly on the specific task of intent communication. This requires data that doesn't quite exist yet: annotated edit sequences with ground-truth intent labels, enough of them to produce a local model worth running. This isn't an insurmountable problem. It's an expensive one.

What does exist is the architecture. The shape of what would need to be built. And the observation that the bottleneck in AI-assisted programming isn't intelligence — the remote models are already remarkable — it's the channel. What gets sent, when, how it's compressed, who decides what to investigate. That's the unsolved layer.

---

It's worth being concrete about what this unlocks, because it's a different category of tool than what exists today.

A model that tracks process — not just state — can tell you there's a better way to solve the problem you're currently solving. It can notice you're heading toward a race condition before you've written the code that introduces it. It can recognize that a library exists which would eliminate the pattern you've been manually implementing for the last forty minutes. It can see that the abstraction you're building in this file is going to collide with a decision made in another file three sessions ago.

None of this is next-line prediction. It's next-hour guidance. The difference between a tool that completes your sentences and one that understands what you're trying to say.

The editor sees your code. It should be able to see you working.
