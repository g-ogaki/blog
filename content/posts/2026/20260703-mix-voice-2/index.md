---
title: 科学するミックスボイス 2. TA筋とCT筋
date: 2026-07-03
category: Music
tags:
  - Singing
  - Mix Voice
draft: false
image: mix-voice-thumbnail2.webp
---

この記事の移植です。

https://note.com/moni0627/n/n793a80a717b4

---

## はじめに

第 2 章では TA 筋と CT 筋が及ぼす声の周波数および声質について論じます。第 1 章を読んでいない方は先にご覧ください。

[科学するミックスボイス 1. 解剖生理学](/blog/2026/20260616-mix-voice-1)

この章では大学 1 年程度の数学を扱います。使うのは常微分方程式と行列計算くらいなので、数学や物理が得意な高校生であれば読めるくらいの内容かと思います。

## 1. 質量-ばね-ダンパー系 (Mass-spring-damper model)

まずは下準備として質量-ばね-ダンパー系について簡単に触れます。ばねはフックの法則に従い $-kx$ の力が質量に作用します。ダンパーは質量の速度に比例する抵抗力が生じ $-c\dot{x}$ の力が質量に作用します。

!["mass spring damper model"](mass-spring-damper-model.webp "mass spring damper model (Wikipedia より引用)")

この系にかかる外力を $F_\text{ext}$ とすると、運動方程式は以下のように記述されます:

$$
m \ddot{x} = -kx -c\dot{x} + F_\text{ext}
$$

これを式変形することで標準形

$$
\ddot{x} + 2\zeta \omega + \omega^2x = u
$$

を得ます。ただし

- $\omega = \sqrt{\dfrac{k}{m}}$: ダンパーが無い (undamped) 場合の固有角振動数
- $\zeta = \dfrac{c}{2\sqrt{mk}}$: 減衰比 (damping ratio)
- $u = \dfrac{F_\text{ext}}{m}$

です。$F_\text{ext}=0$ の斉次 (homogeneous) の場合にはこの常微分方程式は陽に解くことができ、一般解 $x=x(t)$ は

$$
x(t) = Ae^{-\omega t \left( \zeta + \sqrt{\zeta^2 - 1} \right)} + Be^{-\omega t \left( \zeta - \sqrt{\zeta^2 - 1} \right)}
$$

となります。$\zeta$ と $1$ の大小関係によって $x(t)$ の挙動は変わりますが、声帯のモデルにおいてはダンパーの効果は摂動 (perturbation) と考えられる程度に小さい(そうでないと発声し続けられない)ため、$\zeta \ll 1$ の場合を考えます。このとき $\sqrt{\zeta^2-1}$ は虚数となり、

$$
x(t) = Ce^{-\zeta\omega t} \cos(\sqrt{1-\zeta^2} \omega t + \phi)
$$

となります。特に摂動のない($c=0$)単振動 $x(t) = C \cos(\omega t + \phi)$ と比較することで、摂動は周波数を $\sqrt{1 - \zeta^2}$ の倍率で減少させ、さらに指数的な減衰 $e^{-\zeta \omega t}$ を生み出すことがわかります。

## 2. 声帯の物理モデル

### 2-1. カバーボディモデル (Cover-Body Model)

声帯の物理モデルの 1 つにカバーボディモデル (Cover-Body Model, by Minoru Hirano in 1974) があります。以下の画像のように声帯をカバーとボディの 2 つの層がばねで接合され、それぞれの層が質量-ばね-ダンパー系に従うというものです。

!["cover body model"](cover-body-model.webp 'B. Story "An overview of the physiology, physics and modeling of the sound source for vowels" より引用')

カバー、ボディそれぞれの運動方程式は以下のようになります:

$$
\begin{aligned}
m_c\ddot{x}_c &= -r_c\dot{x}_c-k_cx_c-k_{cb}(x_c - x_b) = F_c(t) \\
m_b\ddot{x}_b &= -r_b\dot{x}_b-k_bx_b-k_{cb}(x_b - x_c) = F_b(t)
\end{aligned}
$$

記法のほとんどは説明しなくても伝わると思いますが、$k_{cb}$ はカバーとボディを接合するばねのばね定数です。$x=\begin{pmatrix} x_c \\ x_b \end{pmatrix}$ としてベクトル・行列を用いて表現して式変形することで標準形

$$
M\ddot{x} + R\dot{x} + Kx = F(t)
$$

を得ます。ただし

- $M=\begin{pmatrix} m_c & 0 \\ 0 & m_b \end{pmatrix}$
- $R=\begin{pmatrix} r_c & 0 \\ 0 & r_b \end{pmatrix}$
- $K=\begin{pmatrix} k_c + k_{cb} & -k_{cb} \\ -k_{cb} & k_b + k_{cb} \end{pmatrix}$
- $F(t)=\begin{pmatrix} F_c(t) \\ F_b(t) \end{pmatrix}$

です。

### 2-2. 固有振動数

前述の通り $R$ は摂動と見做せる程度の微小な影響($R \approx 0$)なので、斉次の場合($F(t)=0$)における固有振動数は外力がなくても振動し続けられる最も効率のよい音程として興味があります。このとき運動方程式は

$$
M\ddot{x} + Kx = 0
$$

となります。フーリエ変換によって異なる角周波数の波の重ね合わせで表現できる前提に立つと、それぞれの角周波数がこの方程式を満たすかを考えればよいです。調和振動 $v(t) = v e^{i \omega t}, \, v \in \mathbb{C}^2 $ を仮定して代入すると、

$$
\begin{align*}-\omega^2Mv e^{i \omega t} +Kve^{i \omega t} &= 0 \\\therefore (K - \omega^2 M)v &= 0\end{align*}
$$

となり、$\omega^2, v$ はそれぞれ $M^{-1}K$ の固有値と固有ベクトルであることがわかります。$\lambda = \omega^2$ とすると、これが非自明な解を持つのは $\det(K - \lambda M) = 0$ のときなので、

$$
\begin{align*}& \det \begin{pmatrix} k_c + k_{cb} - \lambda m_c & -k_{cb} \\ -k_{cb} & k_{b} + k_{cb} - \lambda m_b \end{pmatrix} = 0 \\\iff & \lambda^2 - (\omega_c^2 + \omega_b^2) \lambda + \omega_c^2 \omega_b^2 - \kappa^2 = 0 \\\iff & \lambda_\pm = \omega_\pm^2 = \dfrac{\omega_c^2 + \omega_b^2 \pm \sqrt{(\omega_c^2-\omega_b^2)^2 + 4 \kappa^2}}{2}\end{align*}
$$

となります。ただし

- $\omega_c^2 = \dfrac{k_c + k_{cb}}{m_c}$
- $\omega_b^2 = \dfrac{k_b + k_{cb}}{m_b}$
- $\kappa^2 = \dfrac{k_{cb}^2}{m_cm_b}$

です。特に $0 < \omega_-^2 < \omega_+^2$ であることがわかります。声帯からは 2 種類の高さの音が生まれていることになりますが、このうち $\omega_-$ の方が声の基本振動数 $f_0$ (を $2\pi$ 倍したもの)に一致します。このことを次節で確認します。

### 2-3. 固有ベクトル

これらに対応する固有ベクトル $v = \begin{pmatrix} v_c \\ v_b \end{pmatrix}$ とすると、$(K - \omega^2M)v=0$ より

$$
\dfrac{v_b}{v_c} = \dfrac{k_c + k_{cb} - \omega^2m_c}{k_{cb}} = \dfrac{\omega_c^2 - \omega^2}{\kappa} \sqrt{\dfrac{m_c}{m_b}}
$$

となり、特に $\dfrac{v_b}{v_c} \in \mathbb{R}$ となります。この値の正負を考えると

$$
\begin{align*}\omega_c^2 - \omega_-^2 &= & \dfrac12 & \left\lbrace \sqrt{(\omega_c^2 - \omega_b^2)^2 + 4\kappa^2} + (\omega_c^2 - \omega_b^2) \right\rbrace & &> 0 \\\omega_c^2 - \omega_+ &= & - \dfrac12 &\left\lbrace \sqrt{(\omega_c^2 - \omega_b^2)^2 + 4\kappa^2} - (\omega_c^2 - \omega_b^2) \right\rbrace & &< 0 \\\end{align*}
$$

となるため、$\omega=\omega_-$ では $v_c, v_b$ は同位相 (in-phase)、つまりカバーとボディが同じ向きに振動するのに対し、$\omega=\omega_+$ では逆位相 (out-of-phase) となりカバーとボディは反対の向きに振動します。カバーとボディが一致して振動する周波数の方が振幅が大きくなる(声が大きくなる)ためこちらが基本振動に対応しており、その値 $f_0$ は

$$
f_0 = \dfrac{1}{2\pi}\sqrt{\dfrac{\omega_c^2 + \omega_b^2 - \sqrt{(\omega_c^2-\omega_b^2)^2 + 4 \kappa^2}}{2}}
$$

で与えられることがわかります。

### 2-4. 声質 (Voice quality)

声質 $Q \in \left(0, 1 \right]$ を

$$
Q := \dfrac{\omega_-}{\omega_+}
$$

と定義します。これが声質を表す指標であることを以下で説明します。

$D = \sqrt{(\omega_c^2 - \omega_b^2)^2+4\kappa^2}$ を固有方程式の判別式とすると、$\omega_+^2 = \omega_-^2+D$ より

$$
Q = \dfrac{1}{\sqrt{1 + D / \omega_-^2}}
$$

となります。 $\omega_-$ は歌いたい音程の周波数なので変化させることはできない値のため、判別式 $D$ によって $Q$ が定まり、$Q$ は $D$ に対して単調減少であることがわかります。$D$ は $\omega_c, \omega_b$ の調離 (detuning) $|\omega_c - \omega_b|$ と、カバー-ボディ結合 $\kappa^2 = \dfrac{k_{cb}^2}{m_cm_b}$ によって定まります。特に $D \ge 2\kappa$ かつ等号成立は $\omega_c = \omega_b$ のときなので、$Q$ に関する不等式

$$
Q \le Q_{\max} := \dfrac{1}{\sqrt{1 + 2\kappa/\omega_-^2}}
$$

が得られます。最後に調離が小さいことが声質を高める理由について、$\omega = \omega_\pm$ の 2 つの音の干渉を考えると、

$$
\begin{align*}& A\cos(\omega_-t) + B\cos(\omega_+t) \\ = & (A-B)\cos(\omega_-t) + B \left( \cos(\omega_-t) + \cos(\omega_+t) \right) \\= & (A-B)\cos(\omega_- t) + 2B\cos\left(\dfrac{\omega_+ - \omega_-}{2}t \right) \cos\left( \dfrac{\omega_++\omega_-}{2}t \right)\end{align*}
$$

となります。ただし $A \ge B$ であるのは、カバーとボディが同位相で動く音程の方が大きく聞こえるためです。第 2 項については、$\bar{\omega}=\dfrac{\omega_+ + \omega_-}{2}$ が音程を、$\Delta \omega = \dfrac{\omega_+ - \omega_-}{2}$ (というより $2B\cos(\Delta \omega t)$) が振幅の変調 (modulation) を表すと解釈できます。従って $\omega_-, \omega_+$ の差が小さいほど音は綺麗な正弦波に近づくわけで、再び $\omega_+^2 = \omega_-^2+D$ より、これは調離 $|\omega_c - \omega_b|$ が小さいときに達成します。

以上のことから $Q \in \left(0, 1 \right]$ が声質を表す物理量と解釈できるわけですが、大切なのは $Q$ そのものよりも、調離 $|\omega_c - \omega_b|$ が小さいほど $Q$ が大きくなるという性質です。

## 3. TA筋とCT筋

色々と数式を捏ね繰り回しましたが、発声においてできること、つまり調整可能な物理量というのは基本的に $k_c, k_b$ に限られます。これらのばね定数はばねの硬さ(反発力の強さ)によって決まるのですが、平たく言えば

- TA 筋の収縮: ボディを固くする( $k_b$ を上昇させる)
- CT 筋の収縮: カバーを固くする( $k_c$ を上昇させる)

ため、調整された声帯とその結果発せられる声の対応は写像 $F:(k_c, k_b) \mapsto (f_0, Q)$ で表現されます。これら物理量をおさらいします:

- $f_0 = \dfrac{1}{2\pi}\sqrt{\dfrac{\omega_c^2 + \omega_b^2 - \sqrt{(\omega_c^2-\omega_b^2)^2 + 4 \kappa^2}}{2}}$
- $Q = \dfrac{1}{\sqrt{1 + \dfrac{\sqrt{(\omega_c^2 - \omega_b^2)^2+4\kappa^2}}{(2 \pi f_0)^2}}}$
- $\omega_c = \sqrt{\dfrac{k_c + k_{cb}}{m_c}}$
- $\omega_b = \sqrt{\dfrac{k_b + k_{cb}}{m_b}}$
- $\kappa = \dfrac{k_{cb}}{\sqrt{m_cm_b}}$

歌とは時刻 $t$ に対して音程 $f = f(t)$ を対応させる関数のことなので、上手に歌うとは $(k_c, k_b)$ 領域の道 (path) $\gamma = \gamma(t)$ であって、その像 $F \circ \gamma(t)$ の第 1 成分が $f(t)$ に一致し且つ第 2 成分が最大となるものを取り、$\gamma$ に沿って TA 筋・CT 筋の収縮をコントロールすることだと言えます。

高い声を出す($f_0$ を上昇させる)ことは $\omega_c,\omega_b$ のうち少なくとも片方を上昇させることを意味します。理想的な歌い方は TA 筋・CT 筋をバランスよく活用して $\omega_c \approx \omega_b$ を保ちながら双方を上昇させることです。このとき

$$
Q \approx Q_{\max} = \dfrac{1}{\sqrt{1 + \dfrac{2\kappa}{(2 \pi f_0)^2}}} \to 1 \qquad (f_0 \to +\infty)
$$

となり、これは直感的にはカバー-ボディ結合 $\kappa$ に比べてカバー、ボディそれぞれの層の硬さが支配的となり、結果として相異なる 2 つの固有振動数を持つ固有方程式が退化する (degenerate) と解釈できます。これは経験則とも一貫しており、きちんとトレーニングした歌手はこれらの筋肉のバランスが取れている場合、高音域の発声が最も共鳴します。

反対に片方の筋肉のみを収縮させる場合を考えます。TA 筋のみが収縮する場合には固くなったボディがカバーの振動に抵抗するように働き、結果として締め付けたような発声となり声質が低下します。CT 筋のみが収縮する場合には CT 筋のみが高速で振動する一方 TA 筋は弛緩しているため、細い声となり再び声質が低下します。

実際には声質には $Q$ のみによって測れない要素もあります。例えば低めのチェストボイスで CT 筋を活用しようとすると TA 筋が必要以上に弛緩してか細い声となってしまうため、チェストボイスの中でも特に低音においては TA 支配を保ち続けることが肝要です。ここでの議論は換声点周辺の中-高音域において、片方の筋肉のみに依存するのではなく両方をバランスよく駆使するほうが音程を綺麗に推移できることを数学的に観察したものです。

## おわりに

数学に不慣れな方は特にお疲れ様でした。これでフォーマントを議論する第 3 章を残すのみとなりましたが、残念なことに更に高度な数学が要求されます。覚悟が決まった方は、余力のあるときに覗いてみてください。

[科学するミックスボイス 3. フォーマントチューニング](/blog/2026/20260716-mix-voice-3)
