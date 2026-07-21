---
title: 数学書「Brownian Motion, Martingales, and Stochastic Calculus (Le Gall)」を読んで
date: 2026-05-30
category: Mathematics
tags:
  - Probability Theory
  - Stochastic Calculus
draft: false
image: le-gall-thumbnail.webp
---

この記事の移植です。

https://note.com/moni0627/n/n175f0ea41638

---

掲題の本のレビューです。これに感化されてこの本を手に取る人間が存在するのかという話は一旦さておき、備忘録の意味も込めて書き残したいと思います。あと数学書に限らず、専門書は必ず複数回読むべき(オチを知った状態で読み返すことで目的意識がクリアになる)という信条に基づき、このレビューが 2 周目の役割を果たすことを期待しています。

https://link.springer.com/book/10.1007/978-3-319-31089-3

## まえがき

大学院を卒業してから久方ぶりに純粋数学の専門書を読みました。Springer の本のうち Graduate Texts in Mathematics に分類されているので、大学院生向けの内容となります。修士課程で偏微分方程式を専攻していたので、同じ解析系として知識の親和性がありサクサク読めることを期待していましたが、内容はかなり難しく非常に苦労しました。忘れてしまっている部分もあり、また学部時代にいい加減な勉強をしたツケもあり、LLM (Claude & Gemini) とひたすら壁打ちしながら行間を埋めて読み進めました。5/1 から読み始め、伸び悩む進捗を鑑みると 1 ヶ月丸々掛かると予想していましたが、5/25 に 1 周目を終えることができました(演習問題はほぼ全て飛ばしました)。今月の残りを宛てがい、復習兼本記事の執筆を行います。

なお、この本を読もうと思ったのは投資の文脈に依るものです。株価などの金融資産は以下の確率微分方程式の解である幾何 Brown 運動 (geometric Brownian motion) としてモデリングされています:

$$
dX_t = \sigma X_t \, dB_t + r X_t \, dt
$$

ここに登場する Brown 運動 $${(B_t)_{t \ge 0}}$$ が何なのか、この本を読むまで正確な定義を述べることもできませんでした。そして上記は記法の簡便であり、数学的な定義を述べているわけでもありません(実用上はとても便利な表記です)。確率過程 $${X = (X_t)_{t \ge 0}}$$ が上記の確率微分方程式を満たすとは、任意の $${t \ge 0}$$ について

$$
X_t = X_0 + \int_0^t \sigma X_s \, dB_s + \int_0^t r X_s \, ds \tag{$\ast$}
$$

を満たすものと定義されます(他にも付随する条件が多少あります)。右辺の 2 項目 $${\displaystyle \int_0^t \sigma X_s \, dB_s}$$ は確率積分と呼ばれるものですが、ほとんど至るところで ($${\text{a.s.}\omega \in \Omega}$$) Brown 運動のサンプルパス $${t \mapsto B_t(\omega)}$$ は有界変動でなく、Stieltjes 積分の意味でこの項を定義することはできません。従ってこれが確率微分方程式の解の定義だと言われても、得体の知れない項が残り続けています。

そして $${(\ast)}$$ を満たす幾何 Brown 運動 $${(X_t)_{t \ge 0}}$$ に対して、$${\log X_t}$$ に伊藤の公式 (Itô's formula) を適用することで

$$
X_t = X_0 \exp \left( \sigma B_t + \left(r - \dfrac{\sigma^2}{2} \right)t \right)
$$

と陽に解くことができます。ここで伊藤の公式の主張は、(1 次元の場合) 連続な半マルチンゲール (continuous semimartingale) $${X}$$ と 2 階連続微分可能関数 $${f \in C^2(\mathbb R)}$$ に対して、$${f(X)}$$ は再び連続な半マルチンゲールであり、以下の等式が成り立つことです:

$$
f(X_t) = f(X_0) + \int_0^t f'(X_s) \, dX_s + \dfrac{1}{2} \int_0^t f''(X_s) \, d \langle X, X \rangle_s
$$

従って幾何 Brown 運動 $${(\ast)}$$ を数学的に理解するためには、Brown 運動を定義し、(半)マルチンゲールが何を表すか解釈し、そして確率積分に数学的な意味付けを与える必要があります。そのような動機に対して "Brownian Motion, Martingales, and Stochastic Calculus" というタイトルは打って付けで惹きつけられたのがこの本を読む契機でした。なお第 8 章にて幾何 Brown 運動についても触れられているのですが、なんと 1 ページにも満たない量しか記載がありません(笑)。この章は(局所) Lipschitz 連続条件下における解の一意存在を議論することを主としており、陽に解けてしまう方程式には興味を示さないスタンスも、純粋数学の世界に立ち返ったことを想起させました。

## 総評

### 難易度

冒頭でもお伝えした通り難しいと思います。特に行間が広い。"obvious," "elementary," "straightforward," "easy to verify" などと書いておきながら全然明らかに見えないという数学書あるあるも幾度となく体験しました。「良い本だが、確率論の初学者が読むようなものではない」と Amazon のレビューにもある通り、Lebesgue 積分論と確率論(というか有限測度の議論)に精通する必要があると思います。例えば(Brown 運動 $${(B_t)_{t \ge 0}}$$ が特定の確率空間 $${(\Omega, \mathscr F, P)}$$ で定義された前提で) Wiener 測度 $${W}$$ について以下のように記述されています:

> $${C(\mathbb R_+, \mathbb R)}$$ ($${[0, \infty)}$$ から $${\mathbb R}$$ への連続関数全体)を考えます。$${\sigma}$$-加法族 $${\mathscr C}$$ を、すべての $${t \ge 0}$$ に対して座標対応 $${w \mapsto w(t)}$$ を可測とする最小の $${\sigma}$$-加法族と定義します(これは $${C(\mathbb R_+, \mathbb R)}$$ に局所一様収束の位相を定めたときの Borel 加法族に一致します)。Brown 運動 $${B = (B_t)_{t \ge 0}}$$ に対し、写像 $${\Omega \ni \omega \mapsto B_\cdot(\omega) \in C(\mathbb R_+, \mathbb R)}$$ は可測になります。Wiener 測度 (もしくは Brown 運動の法) $${W(dw)}$$ とは上記の写像における確率測度 $${P(d \omega)}$$ の像のことです。Wiener 測度は柱状集合 (cylinder set) の値によって特徴づけられます。$${0 = t_0 < t_1 < \cdots < t_n}$$ と $${A_0, \cdots A_n \in \mathscr B(\mathbb R) }$$ に対して $${A = \{ w \in C(\mathbb R_+, \mathbb R) : \forall i, \, w(t_i) \in A_i \}}$$ の Wiener 測度は$${ W(A) = P(\forall i, \, B_{t_i} \in A_i) = \mathbf{1}_{A_0}(0) \displaystyle \int_{A_1 \times \cdots \times A_n} \dfrac{dx_1 \dots dx_n}{\prod_{i=1}^n (2 \pi (t_i - t_{i-1}))^{1/2}} \exp \left(- \sum_{i=1}^n \dfrac{(x_i - x_{i-1})^2}{2(t_i - t_{i-1})} \right)}$$で与えられます($${x_0 = 0}$$ とします)。これにより Brown 運動の法が一意に定義されます。

これをある程度すんなり受け入れられるのであれば読み進める力はあると思いますし、もし私のように頭の中が疑問符だらけになってしまう場合は測度論をおさらいしたほうが賢明でしょう。明示されていない内容の補足の一例を記載します:

$${\pi_t: C(\mathbb R_+, \mathbb R) \ni w \mapsto w(t) \in \mathbb R}$$ を座標対応とします。$${\mathscr C}$$ は $${\pi_t}$$ の逆像 $${\pi_t^{-1}(A), \, A \in \mathscr B(\mathbb R)}$$ たち全てを含む最小の $${\sigma}$$-加法族です。他方 $${C(\mathbb R_+, \mathbb R)}$$ は可算個の半ノルム $${\displaystyle \|w \|_k = \sup_{0 \le t \le k} |w(t)|}$$ による Fréchet 空間を成し、その Borel 加法族が $${\mathscr C}$$ と一致します(証明は AI にでも聞いてください)。

写像 $${F: \Omega \to C(\mathbb R_+, \mathbb R)}$$ が可測であることはすべての $${t \ge 0}$$ に対して $${\pi_t \circ F}$$ が可測となることと同値です(証明は以下略)。これにより Brown 運動は可測となるため、測度の押し出し (pushforward measure) として Wiener 測度 $${W = P \circ B^{-1}}$$ が定義されます。

$${\mathscr D = \left\{ \displaystyle \bigcap_{i=0}^n \pi_{t_i}^{-1}(A_i) : 0 = t_0 < t_1 < \cdots < t_n,  A_i \in \mathscr B(\mathbb R) \right\}}$$ (柱状集合全体) とすると、これは $${\pi}$$-system かつ $${\sigma(\mathscr D) = \mathscr C}$$ となります。Dynkin の $${\pi}$$-$${\lambda}$$ 定理より、測度が $${\mathscr D}$$ 上で定義されると一意に定まります(以下略)。従って異なる確率空間上の異なる Brown 運動 $${B'}$$ に対して Wiener 測度を定義しても同じものとなります。

### 事前知識

上記の通り測度論と確率論は必須となります。微分積分学、線型代数学や集合位相論が必要なのも言わずもがな。あとは Hilbert 空間の議論も多用されるので関数解析学も必須です。複素関数の話もちょこっとだけ登場しますが、Cauchy-Riemann の関係式さえ知っていれば私のように他のことは忘れていても問題なさそうでした。

一つ残念だったのは、離散時間マルチンゲール (discrete martingale) の事前知識を要求していることです。連続時間マルチンゲール、特に Doob の不等式といった不等式評価ついては、$${\mathbb R_+}$$ が可分 (separable) であることと、サンプルパスの(右)連続性を用いて離散時間の議論に帰着させています。補遺 (appendix) に元となる離散時間の場合の評価が証明なしで記載されていますが、証明の伴わない命題を読むことが勉強だとは思いません。熱心な読者の場合はこの本を読む前でも後でも同氏が執筆した以下の本を読むとよいかもしれません。

### 評価

良い本だと思います。証明などの議論は数学的に厳格で、かつ誤植も少ない(無いわけではない)ため、確固たる理論を頭の中に構築できると思います。解析学の素地ができあがってる方にとって、確率解析の導入として役に立つのではないでしょうか。一度読み通せば、忘れた頃に reference book として活用できると思います。

惜しむらくは、やはり離散マルチンゲールで成り立つ命題を証明なしに用いている部分でしょうか。例えば他にも Kolmogorov の拡張定理などは証明を記載せずに用いておりますが、確率解析の本筋から外れた部分のため然程気にならない一方、マルチンゲールは離散時間であっても理論の中核の一端を担うものであるため、この本を "self-contained" と評することに抵抗があります。とはいえ既に 300 ページ近い分厚さとなっているため、他の本に託すというのも理解はできます。大学 3 年生で測度論と関数解析学の授業を受け、大学 4 年生で「Measure Theory, Probability, and Stochastic Processes」の後に「Brownian Motion, Martingales, and Stochastic Calculus」を読むという流れにすれば、確率解析を研究する前準備として一環した基礎が身につくのではないでしょうか。

## 各章のまとめ

### フローチャート

![フローチャート](flowchart.webp "フローチャート")

上記のフローチャートのように理論が展開されていきます(著者も Preface にフローチャートを記載していましたが、私が mermaid 図で書き直しました)。以降はそれぞれの章について、書き残したノートと睨めっこしながら自分なりの理解を書き下したいと思います。

### 第1章: Gauss 分布

(章題は私が適当に充てたもので、以降も本に準拠せず記載します。)

この本に必要な Gauss 分布関連のおさらいです。この辺は確率論と関数解析の知識があれば何てことはないと思いますし、私にとってはサクサク読み進められる唯一の章でした。ここで定義される Gauss ホワイトノイズ (Gaussian white noise) は、第 2 章で定義される Wiener 積分 $${\displaystyle \int_0^t f(s) \, dB_s}$$ という、確率積分の特別な場合(Brown 運動による積分かつ被積分関数 (integrand) が決定的 (deterministic))であり、この積分は再び Gauss 分布となります。

より一般の $${\sigma}$$-有限な測度空間 $${(E, \mathscr E, \mu)}$$ ($${E}$$ が可分であることすら仮定していない)に対してホワイトノイズが定義されていますが、この本を読むだけなら $${E = \mathbb R_+}$$ かつ $${\mu}$$ が Lebesgue 測度の場合だけで良い気がします。$${G: L^2(\mathbb R_+) \to L^2(\Omega)}$$ が Gauss ホワイトノイズとは平たく言えば(Gauss 空間の定義に触れずに述べると)、$${G}$$ が等長な線型写像(従って内積を保つ)で、$${G(f)}$$ が平均 0 の Gauss 分布に従うこと(つまり $${\displaystyle G(f) \sim \mathscr N \left(0, \int_0^\infty f(t)^2 \, dt \right)}$$)です。このような $${G}$$ は適切な $${(\Omega, \mathscr F, P)}$$ 上では必ず存在することが示されます。また等長性より $${0 \le s \le t}$$ において以下が成立します:

$$
\begin{aligned}E[G(\mathbf 1_{[0, s]}) G(\mathbf 1_{[0, t]})] & = E[G(\mathbb 1_{[0, s]})^2] + E[G(\mathbb 1_{[0, s]})G(1_{(s, t]})] \\&= \int_0^\infty \mathbf 1_{[0, s]}(r) \, dr + \int_0^\infty \mathbf 1_{[0, s]}(r) \mathbf 1_{(s, t]} (r) \, dr \\&= s\end{aligned}
$$

特に $${\operatorname{Cov}(G(\mathbf 1_{[0, s]}), G(\mathbf 1_{[0, t]})) = s \wedge t := \min(s, t)}$$ が成り立つことがわかります。

### 第2章: Brown 運動

Brown 運動 $${(B_t)_{t \ge 0}}$$ とは、Gauss ホワイトノイズ $${G}$$ を用いて $${B_t = G(\mathbf 1_{[0, t]})}$$ と定義される確率過程(かつサンプルパスが連続であるもの)と定義されます。実際のところは $${(B_t)_{t \ge 0}}$$ が(連続性を仮定しない) Brown 運動であることと、$${(B_t)_{t \ge 0}}$$ が $${\operatorname{Cov}(B_s, B_t) = s \wedge t}$$ を満たす平均 0 の Gauss 過程であることは同値なので、より大掛かりな $${L^2}$$-等長写像 $${G}$$ を導入せずとも定義できます。しかし Wiener 積分を

$$
\int_s^t f(r) \, dB_r := G(f \mathbf 1_{(s, t]})
$$

として自然に定義すること、及び Brown 運動の存在を自明にするために Gauss ホワイトノイズを先に導入したのだと思います。Wiener 積分は Brown 運動を先に定義したとしても、$${L^2(\mathbb R_+)}$$ において階段関数 (step function) 全体は稠密であり、$${\mathbf 1_{(s, t]} \to B_t - B_s}$$ が $${L^2}$$-等長なのと線型性および Gauss 空間が閉であることから $${L^2(\mathbb R_+)}$$ への拡張を持つことによっても確認できますので、どちらが先であるかは瑣末な問題です。

$${G}$$ の存在は既に示しましたが、Brown 運動であるためにはサンプルパスが連続である必要があります。これ以降も大切な概念として、確率過程 $${(X_t)_{t \in T}}$$ に対してその修正 (modification) $${(\tilde X_t)_ {t \in T}}$$ とは、すべての $${t \in T}$$ においてほとんど至るところで $${X_t = \tilde X_t}$$ となることです。そして Kolmogorov の連続性定理 (Kolmogorov's lemma) により、サンプルパスが連続となる修正を持つ十分条件として

$$
\exists q, \varepsilon, C > 0, \, E[d(X_s, X_t)^q] \le C|t - s|^{1 + \varepsilon}
$$

が挙げられます(実際は局所 Hölder 連続まで言えます)。$${G}$$ により定義された連続性の保証のない Brown 運動においては $${B_t - B_s \sim \mathscr N(0, t - s)}$$ よりすべての $${q > 0}$$ に対して

$$
E[|B_t - B_s|^q] = C_q (t-s)^{q/2}
$$

が言えますので、これで無事に Brown 運動(連続修正)の存在が言えました。

### 第3章: マルチンゲールと停止時間

この章で情報系 (filtration) $${(\mathscr F_t)_{t \in [0, \infty]}}$$ と停止時間 (stopping time) $${T}$$ が登場します。初めは停止時間の定義である $${\forall t \ge 0, \, \{ T \le t \} \in \mathscr F_t}$$ を見てもなんのこっちゃと思っていたのですが、今後の命題の証明で多用される非常に重要な概念でした。特に大事な命題は以下だと思います:

$${(X_t)_{t \ge 0}}$$ が連続なサンプルパスを持ち、距離空間 $${(E,d)}$$ に値を取る確率過程とする。$${F \subset E}$$ を閉集合とすると、$${T_F := \inf \{ t \ge 0 : X_t \in F \}}$$ は停止時間である。

証明に頻繁に使われる手法として、連続なサンプルパスを持つ確率過程 $${(X_t)_{t \ge 0}}$$ に対し、$${T_n := \inf \{t \ge 0 : |X_t| \ge n \}}$$ と定義し、停止過程 (stopped process) $${X^{T_n}}$$ を $${X^{T_n}_t = X_{t \wedge T_n}}$$ とします(つまりすべてのサンプルパスは連続性と中間値の定理より $${|X_t| = n}$$ となった後は止まり続ける)。定義より明らかに $${|X^{T_n}_t| \le n}$$ であり、$${n \to \infty}$$ の極限において $${T_n \nearrow \infty}$$ であることから $${X_{t \wedge T_n} \to X_t}$$ となり、議論する確率過程を有界な場合に帰着させています。ここで $${\displaystyle \lim_{n \to \infty} T_n = \infty}$$ であることについては、$${T_n}$$ が単調増加であることから極限 $${\displaystyle M = \lim_{n \to \infty} T_n \in [0, \infty]}$$ が存在し、仮に $${M < \infty}$$ を仮定すると $${\forall n \in \mathbb N, T_n \le M}$$ となり、これは $${\forall n \in \mathbb N, \exists t_n \in [0, M], |X_{t_n}| \ge n}$$ を意味します。他方サンプルパスの連続性と最大値の定理より $${\displaystyle \sup_{t \in [0, M]} |X_t| < \infty}$$ となり矛盾するためです。

マルチンゲールも初めて触れたのですが、定義である $${E[M_t \mid \mathscr F_s] = M_s}$$ を見ても、「公平な賭け」という AI の説明を受けた上で「それはそう」くらいの気持ちにしかなりませんでした。一方でこの性質は非常に強いものであり、それゆえ幅広い性質が導かれます。その 1 つとして、まず初めにマルチンゲール収束定理 (martingale convergence theorem) が挙げられます:

> $${(M_t)_{t \ge 0}}$$ を右連続なサンプルパスを持つマルチンゲールとする。以下の (1) ~ (3) は同値である:(1) $${\exists Z \in L^1(\Omega), \, \forall t \ge 0, \, M_t = E[Z \mid \mathscr F_t] }$$(2) $${\{M_t\}_{t \ge 0}}$$ は一様可積分 (uniformly integrable)(3) $${\displaystyle \exists Z \in L^1(\Omega), \, \lim_{t \to \infty} E[|Z - M_t|] = 0}$$また上記が成り立つときこの極限を $${M_\infty}$$ とすると $${M_t = E[M_\infty \mid \mathscr F_t]}$$ が成り立つ。

そしてもう 1 つは任意停止定理 (optional stopping theorem) より従う以下の系でしょうか:

> $${(M_t)_{t \ge 0}}$$ を右連続なサンプルパスを持つマルチンゲール、$${T}$$ を停止時間とすると、$${{M^T} = (M_{t \wedge T})_{t \ge 0}}$$ もマルチンゲールである。さらに $${(M_t)_{t \ge 0}}$$ が一様可積分のとき $${(M_{t \wedge T})_{t \ge 0}}$$ も一様可積分で $${M_{t \wedge T} = E[M_T \mid \mathscr F_t]}$$ が成り立つ。

Brown 運動もマルチンゲールの一種です(実際はそれよりも更に強い独立増分 (independent increments) が成り立ちます)。停止時間の説明でも述べた通り、仮に Brown 運動のようにマルチンゲール $${(M_t)_{t \ge 0}}$$ が一様可積分でなかったとしても、$${M_{t \wedge T_n}}$$ は一様可積分よりはるかに強く有界となるため、収束定理やこの後で述べる $${L^2}$$ での性質を仮定することができます。

偉そうに書いていますが、一様可積分性は確率論といった有限測度で有用な概念であり、基本的に Lebesgue 測度しか使わない偏微分方程式を専攻していた私はその定義すら言えず、AI に質問しまくって Vitali の収束定理などをおさらいしたりしていました。大学や院は人生で一番勉強していた期間だと自負していますが、どれだけ勉強しても「もっと勉強しておけばよかった」と思う日が来るのだと痛感します。

### 第4章: 有界変動過程と半マルチンゲール

「もっと勉強しておけばよかった」第 2 弾です。有界変動関数 (finite variation) と、それに付随する符号付き測度 (signed measure) が登場します。符号付き測度 $${\mu}$$ の Hahn 分解やそれに付随する Jordan 分解 $${\mu = \mu^+ - \mu^-}$$ が全変動測度 $${|\mu|}$$ の表現 $${|\mu| = \mu^+ + \mu^-}$$ を与えたり、有界変動関数 $${f}$$ が変動

$$
V_0^t(f) := \sup \left\{ \sum_{i=1}^n |f(t_i) - f(t_{i-1})| : 0 = t_0 < t_1 < \cdots < t_n = t  \right\}
$$

を用いて 2 つの単調増加関数の差

$$
f(t) = \dfrac{1}{2} (V_0^t(f) + f(t)) - \dfrac{1}{2}(V_0^t(f) - f(t)) =: f^+(t) - f^-(t)
$$

で表され、これらの Stieltjes 測度 $${df^{\pm}}$$ が Jordan 分解 $${\mu^{\pm}}$$ に一致するといった内容を理解していると読み進めやすいです。偏微分方程式には関係ないから雑な理解で良いという不真面目な態度のツケをここでも支払わされました。

対して連続半マルチンゲール自体は別に難しい概念ではなく、$${X}$$ が連続半マルチンゲールとは連続局所マルチンゲール $${M}$$ と連続有界変動過程 $${V}$$ を用いて $${X = M + V}$$ と表されるものです。そして連続局所マルチンゲールとはある停止時間列 $${(T_n)_{n \in \mathbb N}}$$ で $${T_n \nearrow \infty}$$ かつ、すべての $${n \in \mathbb N}$$ で $${M^{T_n}}$$ が一様可積分となるものが存在することと定義されます。更に $${M_0 \in L^1}$$ となる連続局所マルチンゲールに対しては先ほど定義した停止時間 $${T_n = \inf\{ t \ge 0 : |M_t| \ge n \}}$$ が条件を満たす停止時間列であることが示されるので、基本的にこの停止時間を常に取ればよいことがわかります。また驚くことに $${(M_t)_{t \ge 0}}$$ が局所マルチンゲールかつ有界変動となるのは $${M_t = M_0}$$ のときに限るため、この本のように有界変動過程の定義に $${V_0 = 0}$$ を加えると半マルチンゲールの表現 $${X = M + V}$$ が一意に定まります。

またこのことから Brown 運動を含む自明でない(局所)マルチンゲールは有界変動でないことがわかりますが、冒頭の伊藤の公式にも登場した二次変分 (quadratic variation) $${\langle M, M \rangle_t}$$ と呼ばれる変分の 2 乗和は収束することが示されます。具体的には以下の定理が成り立ちます:

> $${(M_t)_{t \ge 0}}$$ を連続局所マルチンゲールとする。このときすべての $${t > 0}$$ に対し $${0 = t_0^n < \cdots < t_{p_n}^n = t}$$ を $${[0, t]}$$ の細分の増加列 (つまり $${\forall n, \, \forall i, \, \exists j, \, t_i^n = t_j^{n+1}}$$) かつ $${\displaystyle \lim_{n \to \infty} \max_{1 \le i \le p_n} (t_i^n - t_{i-1}^n) = 0 }$$ とすると、$${\displaystyle \sum_{i=1}^{p_n} (M_{t_i^n} - M_{t_{i-1}^n})^2 }$$ は $${n \to \infty}$$ で確率収束する。これを $${\langle M, M \rangle_t}$$ と記述すると、$${\langle M, M \rangle_t}$$ は $${M_t^2 - \langle M, M \rangle_t}$$ を連続局所マルチンゲールにする唯一の連続増加過程として特徴づけられる。

特に Brown 運動 $${(B_t)_{t \ge 0}}$$ については $${\langle B, B \rangle_t = t}$$ となることがわかります。これは Brown 運動の独立増分性より

$$
\begin{aligned}E[B_t^2 \mid \mathscr F_s] &= E[\{ (B_t - B_s) + B_s \}^2 \mid \mathscr F_s] \\&= E[(B_t - B_s)^2] + 2E[B_t - B_s]B_s + B_s^2 \\&= t - s + B_s^2\end{aligned}
$$

となり、$${B_t^2 - t}$$ がマルチンゲールとなることから従います。

また、この変分の 2 乗和の極限は有界変動過程を足しても値が変わらないことが、以下のように展開し:

$$
\begin{aligned}& \sum_{i=1}^{p_n} \{ (M_{t_i^n} + V_{t_i^n}) - (M_{t_{i-1}^n} + V_{t_{i-1}^n}) \}^2 \\= & \sum_{i=1}^{p_n} (M_{t_i^n} - M_{t_{i-1}^n})^2 + 2\sum_{i=1}^{p_n}(M_{t_i^n} - M_{t_{i-1}^n})(V_{t_i^n} - V_{t^n_{i-1}}) + \sum_{i=1}^{p_n}(V_{t^n_i} - V_{t^n_{i-1}})^2\end{aligned}
$$

次にサンプルパスの $${[0, t]}$$ における一様連続性より $${n}$$ が十分大きいとき

$$
\begin{aligned}& \left| \sum_{i=1}^{p_n}(M_{t^n_i} - M_{t^n_{i-1}})(V_{t^n_i} - V_{t^n_{i-1}}) \right| \\\le & \max_{1 \le i \le p_n} | M_{t^n_i} - M_{t^n_{i-1}} | \sum_{i=1}^{p_n} |V_{t^n_i} - V_{t^n_{i-1}}| \\\le & \varepsilon V_0^t(f)\end{aligned}
$$

から従います(もう 1 つの項も同様です)。従って連続半マルチンゲール$${X = M + V}$$ に対し、その二次変分は $${ \langle X, X \rangle = \langle M, M \rangle }$$ と自然に定義されます。更に二次変分は双線型への拡張 $${\langle X, Y \rangle = \dfrac{1}{2} (\langle X+Y, X+Y \rangle - \langle X, X \rangle - \langle Y, Y \rangle) }$$ が可能であり、$${\langle M, M \rangle_t}$$ が連続増加過程であることから $${\langle X, Y \rangle_t}$$ は連続有界変動過程となります。

### 第5章: 確率積分

本書の肝となる章で、この章だけで 50 ページ以上あります。この章の目的の 1 つは半マルチンゲール(面倒臭いので「連続」を省略します) $${X = M + V}$$ と適当な被積分関数 (integrand) となる確率過程 $${(H_t)_{t \ge 0}}$$ に対して確率積分

$$
\int_0^t H_s \, dX_s = \int_0^t H_s \, dM_s + \int_0^t H_s \, dV_s
$$

を定義することです。ここで $${dV_s}$$ による積分は Stieltjes 積分なので、$${H_t}$$ が局所有界、つまりすべての $${t \ge 0}$$に対してほとんど至るところで $${\displaystyle \sup_{0 \le s \le t }|H_s| < \infty}$$ であれば $${\displaystyle \left| \int_0^t H_s \, dV_s \right| \le \int_0^t |H_s| \, |dV_s| < \infty}$$ により定義できます。従って局所マルチンゲールに対して確率積分を定義することを目指します。

Riemann-Stieltjes 積分の類推として

$$
\displaystyle \lim_{n \to \infty}  \sum_{i=1}^{p_n} f(c^n_i) (g(t^n_i) - g(t^n_{i-1})) = \int_0^t f(s) \, dg(s), \,\, \forall c^n_i \in [t^n_{i-1}, t^n_i]
$$

のような性質を期待します。実際にこれはある程度正しく、$${(X_t)_{t \ge 0}}$$ が連続半マルチンゲール、$${(H_t)_{t \ge 0}}$$ が連続の場合においては確率積分の大切な収束定理の 1 つとして

$$
\operatorname*{plim}_{n \to \infty} \sum_{i=1}^{p_n} H_{t^n_{i-1}} (X_{t^n_i} - X_{t^n_{i-1}}) = \int_0^t H_s \, dX_s
$$

が成り立ちます。ここで被積分関数について細分区間の左側 $${t^n_{i-1}}$$ を取らなければならない(取る位置によって確率収束先が異なる)ことが、$${H_t}$$ が半マルチンゲールの場合には以下の観察よりわかります:

$$
\begin{aligned}& \sum_{i=1}^{p_n} H_{t^n_{i}} (X_{t^n_i} - X_{t^n_{i-1}}) \\= & \sum_{i=1}^{p_n} H_{t^n_{i-1}} (X_{t^n_i} - X_{t^n_{i-1}}) + \sum_{i=1}^{p_n} (H_{t^n_i} - H_{t^n_{i-1}}) (X_{t^n_i} - X_{t^n_{i-1}}) \\\xrightarrow{p} & \int_0^t H_s \, dX_s + \langle H, X \rangle_t\end{aligned}
$$

第 4 章にて、二次変分 $${\langle H, X \rangle_t}$$ は片方が有界変動であれば恒等的に 0 に等しいことを確認しましたが、逆にそうでなければ 0 ではないため、有界変動でない確率過程の積分を考えている影響が二次変分として表出しています。

局所マルチンゲール $${(M_t)_{t \ge 0}}$$ による確率積分を定義したいですが、とても雑な言い方をすると停止過程に帰着させる(実際 $${\displaystyle \int_0^t H_s \, dM_s}$$ は定数の停止時間 $${T=t}$$ で止めていると見做せる上に、これは一般の停止時間に対しても $${\displaystyle \int_0^T H_s \, dM_s = \int_0^\infty H_s \, dM^T_s}$$ が成り立つ)ので、ある程度性質のよいものを仮定して構築できればよいです。またこれも正当化を伴わない雑な話ですが、上記の Riemann-Stieltjes 和の類推からも $${M_0 = 0}$$ の場合を考えればよいです。$${L^2}$$ の Hilbert 空間の構造を用いて定義するのですが、局所マルチンゲールがマルチンゲールへと昇華する以下の性質が非常に強力です:

$${(M_t)_{t \ge 0}}$$ を $${M_0 = 0}$$ の連続局所マルチンゲールとすると、以下の (1), (2) は同値である:(1) $${M}$$ はマルチンゲールで $${\displaystyle \sup_{t \ge 0} E[M_t^2] < \infty}$$ を満たす($${L^2}$$-有界)。(2) $${E[\langle M, M \rangle_\infty^2] < \infty}$$またこれらを満たすとき $${M_t^2 - \langle M, M \rangle_t}$$ は一様可積分なマルチンゲールとなり、特に $${E[M_\infty^2] = E[\langle M, M \rangle_\infty]}$$ が成り立つ。

さて、第 2 章で Gauss ホワイトノイズを用いて Wiener 積分を定義しましたが、これも結局のところ具体的な計算は $${\displaystyle \int_s^t dB_s = G(\mathbf 1_{(s, t]}) = B_t - B_s}$$ を使った階段関数でしか行えず、一般の $${f \in L^2(\mathbb R_+)}$$ に対しては稠密性を用いた階段関数近似による定義しか与えていません。Wiener 積分が確率積分の特別な場合であることからも、確率積分も同じように構成するしかないと諦めがつくと思います。

$${L^2}$$-有界かつ $${M_0 = 0}$$ なマルチンゲール $${(M_t)_{t \ge 0}}$$ 全体を $${\mathbb H^2}$$ とすると、これは内積 $${(M, N)_{\mathbb H^2} = E[\langle M, N \rangle_\infty] = E[M_\infty N_\infty]}$$ の元で Hilbert 空間を成します。$${M \in \mathbb H}$$ を 1 つとり、Hilbert 空間 $${L^2(M)}$$ を $${\displaystyle \|H\|_{L^2(M)} := E \left[\int_0^\infty H_s^2 \, \langle M, M \rangle_s \right]^{1/2} < \infty}$$ なる確率過程全体とします(この積分は Stieltjes 積分です)。そしてその稠密部分空間として

$$
H_s(\omega) = \sum_{i=1}^p H_{(i - 1)} (\omega) \mathbf 1_{(t_{i-1}, t_i]}(s)
$$

という形の確率過程全体(ただし $${H_{(i-1)}}$$ は有界かつ $${\mathscr F_{t_{i-1}}}$$-可測)が挙げられ、これに対して確率積分を

$$
\int_0^t H_s \, dM_s = (H \cdot M)_t = H_{(i-1)} (M_{t_i \wedge t} - M_{t_{i-1} \wedge t})
$$

と定義すると、

$$
\begin{aligned}\langle H \cdot M, H \cdot M \rangle_t &= \sum_{i, j = 1}^p \langle H_{(i-1)} (M_{t_i \wedge t} - M_{t_{i-1} \wedge t}), H_{(j-1)}(M_{t_j \wedge t} - M_{t_{j-1} \wedge t}) \rangle \\&= \sum_{i=1}^p \langle H_{(i-1)} (M_{t_i \wedge t} - M_{t_{i-1} \wedge t}), H_{(i-1)}(M_{t_i \wedge t} - M_{t_{i-1} \wedge t}) \rangle \\&= \sum_{i=1}^p H_{(i-1)}^2(\langle M, M \rangle_{t_i \wedge t} - \langle M, M \rangle_{t_{i-1} \wedge t}) \\&= \int_0^t H_s^2 \, d \langle M, M \rangle_s\end{aligned}
$$

となります(途中の式変形は $${\langle M, N \rangle_t}$$ の二次変分の近似を使えば示せます)。更に各 $${i}$$ に対して $${H_{(i-1)} (M_{t_i \wedge t} - M_{t_{i-1} \wedge t})}$$ はマルチンゲールなので $${H \cdot M}$$ は $${\mathbb H^2}$$ に属し、この対応 $${H \mapsto H \cdot M}$$ が等長であることもわかります。この写像の拡張により $${M \in \mathbb H^2}$$ に対する確率積分 $${H \cdot M \in \mathbb H^2}$$ がすべての $${H \in L^2(M)}$$ で定義できました。

これを局所マルチンゲールまで拡張すると確率積分が局所マルチンゲールであることは従う一方で、当然 $${\mathbb H^2}$$ に属するということは言えません。しかし仮にある $${t \in [0, \infty]}$$ に対して

$$
E\left[ \int_0^t H_s^2 \, d\langle M, M \rangle_s  \right] < \infty
$$

が成り立つとすると $${T=t}$$ による停止過程 $${M^t}$$ による積分と考えることで $${(H \cdot M)^t \in \mathbb H^2}$$ となり、特にマルチンゲール性と以下の等長性が従います:

$$
E \left[ \left( \int_0^t H_s \, dM_s \right)^2 \right] = E \left[ \int_0^t H_s^2 \, d \langle M, M \rangle_s \right]
$$

他にも重要な内容が盛りだくさんのこの章ですが、最後に冒頭でも登場した伊藤の公式、及び幾何 Brown 運動を陽に解く(解が存在する保証は現時点で無いが)ことを述べたいと思います。伊藤の公式の正式な記述は冒頭の通りですが、実計算を行う上では以下の形が有用かと思います:

$$
df(X_t) = f'(X_t) \, dX_t + \dfrac{1}{2} f''(X_t) \, d\langle X, X \rangle_t
$$

そして $${X_t}$$ が幾何 Brown 運動の確率微分方程式 $${dX_t = \sigma X_t \, dB_t + rX_t \, dt}$$ を満たすとして、$${\log X_t}$$ に伊藤の公式を適用すると

$$
\begin{aligned}d \log X_t &= \dfrac{dX_t}{X_t} - \dfrac{1}{2} \dfrac{d \langle X, X \rangle_t}{X_t^2} \\&= \dfrac{\sigma X_t \, dB_t + r X_t \, dt}{X_t} - \dfrac{1}{2} \dfrac{\sigma^2 X_t^2 \, d \langle B, B \rangle_t}{X_t^2} \\&= \sigma \, dB_t + r \, dt - \dfrac{1}{2} \sigma^2  \, d \langle B, B \rangle_t \\&= \sigma \, dB_t + \left(r - \dfrac{1}{2} \sigma^2 \right) dt\end{aligned}
$$

となることから解が得られます。このような形式的な計算が正当化されるのは、以下の 2 つの結合法則

- $${K \cdot (H \cdot X) = (HK) \cdot X}$$
- $${\langle H \cdot X, K \cdot Y \rangle = (HK) \cdot \langle X, Y \rangle}$$

が成り立つので、それぞれ $${\dfrac{1}{X} \cdot X}$$ 及び $${\dfrac{1}{X^2} \cdot \langle X, X \rangle}$$ に適用して、$${X_t = X_0 + ((\sigma X) \cdot B)_t + ((rX) \cdot \mathbf 1_\Omega\text{id})_t}$$ を代入すればよいです。

### 第6章: Markov 過程

これまでとは毛色の異なる章となります。Markov 性自体は第 2 章にて Brown 運動が満たすことを確認しているのですが、より広い確率過程で観察することが目的なのだと思います。特に Feller 半群という連続性の強い仮定を課したものについて議論します。この辺りは関数解析の Hille-Yosida の定理を彷彿とさせるなあと懐かしみつつ、その主張は綺麗さっぱり忘れていました。

Feller 半群 $${(Q_t)_{t \ge 0}}$$ とは各 $${x \in \mathbb R^d}$$ に対して $${Q_t(x, \cdot)}$$ が確率測度であり、

$$
Q_tf(x) = \int_{\mathbb R^d} f(y) \, Q_t(x, dy)
$$

という作用素で $${C_0(\mathbb R^d)}$$ 上の $${C_0}$$-半群をなすことです。そして $${\mathbb R^d}$$ に値を取る確率過程 $${X_t}$$ が $${(Q_t)_{t \ge 0}}$$ による Markov 過程であるとは、すべての $${f \in L^\infty(\mathbb R^d)}$$ と $${0 \le s \le t}$$ に対して

$$
E[f(X_t) \mid \mathscr F_s] = Q_{t-s}f(X_s) = \int_{\mathbb R^d} f(x) \, Q_{t-s}(X_s, dx)
$$

が成り立つこと、つまり $${\mathscr F_s}$$ まで情報を知っていても、$${X_t}$$ の分布は現在の値 $${X_s}$$ のみに依存して $${Q_{t-s}(X_s, \cdot)}$$ となることです。Markov 過程の存在を確認していません(必ず構成できることが示せます)が、もし $${X}$$ が Markov 過程であるとき、その有限次元周辺分布 (finite-dimensional marginal distribution) は、$${0 = t_0 < t_1 < \cdots < t_n}$$ と $${A_0, \cdots A_n \in \mathscr B(\mathbb R^d)}$$ に対し、

$$
\begin{aligned}& P(\forall i, \, X_{t_i} \in A_i) \\ =& \int_{A_0}\int_{A_1}\int_{A_2} \cdots \int_{A_n} Q_{t_n - t_{n-1}}(x_{n-1}, dx_n) \cdots Q_{t_2 - t_1}(x_1, dx_2)Q_{t_1}(x_0, dx_1) \gamma(dx_0)\end{aligned}
$$

となることが条件付き期待値をひたすら取ることで帰納的に示されます。ただし $${\gamma}$$ は $${X_0}$$ の法 $${\gamma = P \circ X_0^{-1}}$$ のことです。このことから Feller 半群 $${(Q_t)_{t \ge 0}}$$ による Markov 過程の分布は $${X_0}$$ の分布によって一意に特徴付けられることがわかります。$${d}$$ 次元 Brown 運動は Gauss 核 $${p_t(x) = \dfrac{1}{(2 \pi t)^{d/2}} \exp \left(- \dfrac{|x|^2}{2t} \right)}$$ を用いて $${Q_t(x, dy) = p_t(y - x) \, dy}$$ とすれば Feller 半群による Markov 過程となることが示されます。これを周辺分布の式に代入することによって、冒頭で紹介した Wiener 測度の柱状集合での値が確認されます。

弱 Markov 性をとても雑に説明すると、すべての $${s \ge 0}$$ に対して $${\mathscr F_s}$$ までの情報が与えられたときの Markov 過程 $${(X_{s + t})_{t \ge 0}}$$ の分布は、$${X'_0 = X_s}$$ となる Markov 過程 $${(X'_t)_{t \ge 0}}$$ の分布に等しいというものです。これを Brown 運動 $${(B_t)_{t \ge 0}}$$ に適用すると $${\mathscr F_s}$$ が与えられた下で $${B_{s+t} \overset{(d)} = \beta_t + B_s}$$ であり($${\beta_t}$$ は別の Brown 運動、$${\overset{(d)}{=}}$$ は分布が等しい)、独立増分性と $${B_{s+t} = (B_{s+t} - B_s) + B_s \overset{(d)}{=} \beta_t + B_s}$$ からもはや $${\mathscr F_s}$$ が与えられたことは $${B_s}$$ が確定する以外に何の情報もなく、結果として $${(B_{s+t} - B_s)_{t \ge 0}}$$ が $${\mathscr F_s}$$ と独立な Brown 運動となることがわかります。強 Markov 性は時刻 $${s}$$ を停止時間 $${T}$$ に変えても成り立つという主張で、Feller 半群による Markov 過程はこれを満たします。

### 第7章: 偏微分方程式

完全に独立した章なので、まあ別に飛ばしても大丈夫です…(著者も第 8 章にて、第 7 章とは独立していることを言及している)。Laplace 方程式を満たす調和関数を、Brown 運動の世界から観察して成り立つ性質を調べることが前半の目的です。とはいえこの辺りは確率過程に依らずとも通常の偏微分方程式によるアプローチで示されるものなので、観察自体は面白いものの特に真新しい結果が得られるとかではなく、主として後半への準備に充てられているのだと思います。

後半の方が面白く、$${d}$$ 次元 Brown 運動の再帰性 (transience) や漸近挙動について述べられています。特に離散時間におけるランダムウォークが 2 次元以下なら再帰的(必ず元々の場所に帰ってくる)、3 次元以上なら非再帰性であることの類推として、$${B_0 = x \in \mathbb R^d \setminus \{0\}}$$ なる Brown 運動と停止時間 $${U_r = \inf \{ t \ge 0 : |B_t| = r \}}$$ ($${0 \le r < |x|}$$) について、$${d \ge 2}$$ のとき $${P(U_0 < \infty) = 0}$$ かつ $${r > 0}$$ のときは

$$
P(U_r < \infty) = \begin{cases}1 \quad & d = 2 \\\left(\dfrac{r}{|x|}\right)^{d-2} \quad & d \ge 3\end{cases}
$$

が成り立ちます。2 次元のときは原点(従って $${x}$$ を除く任意の点)に到達する確率は 0 である一方でどれだけ小さな球についてもいつかは訪れますが、3 次元以上だとそのような保証はないことが見て取れます。

### 第8章: 確率微分方程式

私が書きたいことは既に冒頭と第 5 章で書いてしまいました。常微分方程式の解の一意存在の証明と同じように、確率微分方程式

$$
\begin{aligned}& dX_t = \sigma(t, X_t) \, dB_t + b(t, X_t) \, dt \\\overset{\text{def}}{\iff} & X_t = X_0 + \int_0^t \sigma(s, X_s) \, dB_s + \int_0^t b(s, X_s) \, ds\end{aligned} \tag{$\ast \ast$}
$$

に対して、$${\sigma, b}$$ に Lipschitz 連続性を仮定した上で Gronwall の不等式と Picard の逐次近似法を使ってゴリゴリと計算していくだけです。解の一意存在が示された後は、幾何 Brown 運動を含む 3 種類の確率微分方程式を、解ける場合には伊藤の公式を適用して陽に解を求め、解けない場合はその挙動を停止時間と共に観察しています。

Markov 性との関連として、Lipschitz 条件下においては $${(\ast \ast)}$$ の解は Feller 半群による Markov 過程であることがわかり、従って強 Markov 性が成り立ちます。また生成作用素 (generator) も具体的な形で求められるのですが、とはいえそれ以上発展的な話が載っているわけではないので、興味があればこの道に進もう！くらいの紹介に止まってるのでしょうか。

### 第9章: 局所時間

なんだか不思議な章というか、よくわからない局所時間と呼ばれる確率過程を考えるといろんな性質が導かれました(つまりあんまり理解していないということです)。伊藤の公式の一般化のために導入したのかなと最初は思っていたのですが、最終節の Kallianpur–Robbins law では 2 次元 Brown 運動の漸近挙動の観察に突如として局所時間が登場することで極限分布が計算できたりと、様々な応用があるのかもしれないです。紹介された例がこれだけなので真偽の程は謎です。

半マルチンゲール $${X}$$ と $${a \in \mathbb R}$$ に対して、極限

$$
L^a_t(X) = \lim_{\varepsilon \to 0^+} \dfrac{1}{\varepsilon} \int_0^t \mathbf 1_{\{a \le X_s \le a + \varepsilon \}} \, d \langle X, X \rangle_s
$$

によって特徴づけられる増加過程 $${L^a(X) = (L^a_t(X))_{t \ge 0}}$$ が局所時間です。これは $${t \ge 0}$$ について連続かつ $${a \in \mathbb R}$$ について càdlàg であることが示されます。そして伊藤の公式の一般化として、$${f}$$ が $${\mathbb R}$$ 上凸であれば $${f(X)}$$ は半マルチンゲールで

$$
f(X_t) = f(X_0) + \int_0^t f'_-(X_s) \, dX_s + \dfrac{1}{2} \int_{-\infty}^\infty L^a_t(X) \, df'_-(a)
$$

が成り立ちます。ここで $${f'_-}$$ は $${f}$$ の左側微分で、$${df'_-}$$ は増加関数 $${f'_-}$$ による Stieltjes 測度です。とはいいつつ $${L^a_t(X)}$$ がどのようなものなのかは少なくともこの本には詳しくは($${L^0_t(B) \overset{(d)} = |B_t|}$$ くらいしか)書いていないので、実用性の程はよくわからないです。基本的に 7 章から 9 章までは、6 章までで学んできたことをどのように応用するかの一端に触れることが目的なので、「もしかしたら役に立つのかもしれない…？」というモヤモヤ感が確率解析の研究への道を後押しするのかもしれません。