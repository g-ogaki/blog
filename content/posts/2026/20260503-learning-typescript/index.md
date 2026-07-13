---
title: TypeScriptを学び始めました
date: 2026-05-03
category: Programming
tags:
  - typescript
  - learning
summary: TypeScriptの型を試しながら学ぶためのサンプル記事です。
draft: false
image: cat.png
---

このサイトのコンテンツ読み込みを確認するためのサンプル記事です。

## 最初の型

小さな例から始めます。インラインコードの `const answer = 42{:ts}` も Shiki で色付けされます。

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

## 数式

オイラーの等式 $e^{i\pi}+1=0$ は、インライン数式として表示されます。

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

上の式は KaTeX を使ったブロック数式です。

## リンクカード

次の単独 URL は、ビルド時に取得したメタデータを使ってリンクカードになります。

https://github.com/microsoft/TypeScript

## 記事内画像

Markdown ファイルと同じディレクトリに置いた画像も表示できます。

![猫のサンプル画像](cat.png "記事に同梱したサンプル画像")
