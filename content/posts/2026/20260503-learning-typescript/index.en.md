---
title: Getting Started with TypeScript
date: 2026-05-03
category: Programming
tags:
  - typescript
  - learning
draft: false
image: cat.png
---

This sample article verifies that the site's content loading works correctly.

## The First Type

We will begin with a small example. Shiki also highlights inline code such as `const answer = 42{:ts}`.

```ts
type Answer = {
  value: number;
  label: string;
};

const answer: Answer = {
  value: 42,
  label: "the answer",
};
```

## Mathematics

Euler's identity $e^{i\pi}+1=0$ is displayed as inline mathematics.

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

The expression above is a block equation rendered with KaTeX.

## Link Card

The standalone URL below becomes a link card using metadata fetched at build time.

https://github.com/microsoft/TypeScript

## Article Image

Images placed in the same directory as the Markdown file can also be displayed.

![Sample image of a cat](cat.png "A sample image included with the article")
