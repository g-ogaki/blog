---
title: 科学するミックスボイス 3. フォーマントチューニング
date: 2026-07-16
category: Music
tags:
  - Singing
  - Mix Voice
draft: false
image: mix-voice-thumbnail3.webp
---

この記事の移植です。

https://note.com/moni0627/n/na759440c793a

---

## はじめに

最終章である本章では、フォーマントと声の周波数がどのように歌いやすさに影響するのか、および声道の変化がどのようにフォーマントを変化させるかを数理的に解釈していきます。第 2 章とは独立していますが、第 1 章を読んでいない方は先にご覧ください。

[科学するミックスボイス 1. 解剖生理学](/blog/2026/20260616-mix-voice-1)

この章では大学 2-3 年程度の数学および物理学を扱います。偏微分方程式や摂動法 (perturbation theory)、また交流回路におけるインピーダンス (impedance) と同等な概念が登場するため、未学習の場合は必要に応じて調べてみてください。

## 1. 波動方程式

### 1-1. 導出

第 1 章の「はじめに」でも記載した通り、以下の波動方程式の導出の根拠となる物理法則を私はあまり理解していません。「質量保存の法則」と「運動量保存則」によって導き出されるようなのですが、LLM の説明では断熱変化 (adiabatic process) などに言及されていて私の理解を超えているのと、数学者の立場としては方程式は正しいと盲信するところが出発点なので、物理法則への理解を蔑ろにしがちです。

最も単純な物理モデルとして、声道を断面積が均一の 1 次元の管とみなします。また第 2 章にてダンパーの影響は摂動と見做せる程度に微小であるとお話ししました。この章でも同様にエネルギーが損失することなく保存されるとし、声道は無損失の (lossless) 一様な (uniform) 管であると考えます。第 1 章の座標系だと $z$ 軸方向に伸びているのですが、本章では変位を $z$ ではなく $x$ で表すことにします。以下で登場する物理量を定義します:

- $p(x, t)$: 音圧(大気圧との差) (Pa)
- $u(x, t)$: 声道内の空気の粒子の平均的な速度 (m/s)
- $A$: 声道の断面積 (m^2)
- $U(x, t) = Au(x,t)$: 声道内の空気の速度 (m^3/s)
- $\rho$: 空気の密度 (kg/m^3)
- $c$: 空気中の音速 (m/s)

質量保存の法則を $x$ の微小変化分 $\Delta x$ について考えることで

$$
\dfrac{\partial u}{\partial x} + \dfrac{1}{\rho c^2} \dfrac{\partial p}{\partial t} = 0 \tag{1}
$$

が得られるようです。また運動量保存則を考えることによって、線形化オイラー方程式 (linearized Euler equation)

$$
\dfrac{\partial p}{\partial x} + \rho \dfrac{\partial u}{\partial t} = 0 \tag{2}
$$

が得られるようです。(1) を $t$、(2) を $x$ でそれぞれ偏微分して $u$ を消去することで $p$ に関する偏微分方程式

$$
\dfrac{\partial^2 p}{\partial x^2} - \dfrac{1}{c^2}\dfrac{\partial^2 p}{\partial t^2} = 0 \tag{3}
$$

が得られます。これらの方程式が全ての出発点となります。

### 1-2. 音響インピーダンス (Acoustic impedance)

前節で登場した方程式 (1), (2), (3) は全て $p, u$ について線形であるため、

$$
\begin{align*}p(x, t) &= \text{Re} \left[ \tilde{p}(x, t) \right] \\u(x, t) &= \text{Re} \left[ \tilde{u}(x, t) \right] \end{align*}
$$

となるような複素数値関数 $\tilde{p}, \tilde{u}$ が波動方程式の解ならば $p, u$ も解となります。これにより波動方程式を複素数に拡張します。この元で音響インピーダンス $Z=Z(x, t)$ を

$$
Z = \dfrac{\tilde{p}(x, t)}{\tilde{U}(x, t)} = \dfrac{\tilde{p}(x, t)}{A \tilde{u}(x, t)}
$$

と定義します。インピーダンスは複素数の値を取り、その絶対値 $|Z| \ge 0$ が「抵抗」を表し、偏角 $\arg(Z) \in \left(-\pi, \pi \right]$ が圧力と空気の位相差を表します。第 1 章で言及したように、理想的な位相は圧力が空気に対して先行し、特に $\arg(Z) \approx \dfrac{\pi}{2}$ となるような状態です。以降、どのようなときにこの条件が満たされるのかを考えていきます。

なお後でも確認しますが、非損失の場合は抵抗 (resistance) が 0 となります。$Z = R + iX$ とすると抵抗 $R=0$ より、$Z$ の偏角はリアクタンス (reactance) $X$ の符号のみによって決まり、従って $\arg(Z) = \pm \dfrac{\pi}{2}$ となります。しかし現実には喉との摩擦や空気抵抗などでエネルギーは損失するため $R>0$、従って $\arg(Z) \in \left(-\dfrac{\pi}{2}, \dfrac{\pi}{2} \right)$ であり、$\arg(Z) \approx \dfrac{\pi}{2}$ はリアクタンス $X$ を $+\infty$ に近づけることで達成されることに注意してください。

## 2. フォーマント (Formants)

### 2-1. フォーマントの導出

第 1 章にて、フォーマントとは声道の形のみによって決まる、声道内の空間で反響する周波数であるとお話ししました。数学的に記述すると、後述する波動方程式の境界値問題において外力が存在しなくても解となる周波数を意味します。

第 2 章と同様に調和振動 $\tilde{p}(x, t) = P(x)e^{i \omega t}$ および $\tilde{u}(x, t) = \dfrac{U(x)}{A}e^{i \omega t}$ を仮定します(数学においてはあまり行儀がよくないのですが、$U(x)$ と $U(x, t)$ は別の関数です)。声道の長さを $L$ として、声門を原点 ($x=0$)、唇を端点 ($x=L$) とする座標を導入します。境界条件として、

- 外力がなく声門が閉じている(+ (2)) $\implies \left. \dfrac{\partial p}{\partial x} \right|_{x=0} = 0$
- 唇から大気に放出される $\implies p(L, t) = 0$

となり、境界値問題

$$
\begin{cases}\dfrac{\partial^2 p}{\partial x^2} - \dfrac{1}{c^2} \dfrac{\partial^2 p}{\partial t^2} = 0 \\\left. \dfrac{\partial p}{\partial x} \right|_{x=0} = 0, \quad p(L, t)=0\end{cases}
$$

が得られます。$\tilde{p}(x, t) = P(x)e^{i \omega t}$ を代入することで $P(x)$ に関する常微分方程式の初期値問題

$$
\begin{cases}P'' + k^2P = 0 \\P'(0) = 0, \quad P(L)=0\end{cases}
$$

を得ます。ただし $k = \dfrac{\omega}{c}$ は波数 (wavenumber) と呼ばれる物理量です。この常備分方程式の一般解は $P(x) = B \cos(kx) + C \sin(kx)$ であり、境界条件を考えると $C=0$ かつ $kL = \left( n - \dfrac{1}{2}\right)\pi, \quad n = 1, 2, 3, \dots$ であることがわかります。従って角周波数と解について

$$
\begin{align*}\omega &= \omega_n = \dfrac{(2n - 1) c\pi}{2L} & & \\P(x) &= P_n(x) = \cos\left(k_nx \right), & & \quad k_n = \dfrac{\omega_n}{c}\end{align*}
$$

が得られ、フォーマント (formants) $F_n$ は以下の値だとわかります:

$$
F_n = \dfrac{\omega_n}{2\pi} = \dfrac{(2n - 1)c}{4L} \tag{4}
$$

### 2-2. 音響インピーダンスの導出

上記は外力を要さずに声道で反響する周波数ですが、実際の発声では肺が空気を送ることにより $x=0$ において生じる外力のおかげで、どのような声の高さも発声することができます。このケースにおいては $\left. \dfrac{\partial p}{\partial x} \right|_{x=0} = 0$ の境界条件を見直す必要があります。

$x=0$ において空気に働く外力は $\dfrac{\partial u}{\partial t}$ に比例しています。$\tilde{u}(x, t) = \dfrac{U(x)}{A}e^{i \omega t}$ において $U(0) = U_g \neq 0$ とすると、(2) と併せて境界条件は

$$
\left. \dfrac{\partial p}{\partial x} \right|_{x=0} = - \rho \left. \dfrac{\partial u}{\partial t} \right|_{x=0} = -\dfrac{i \rho \omega U_g}{A} e^{i\omega t}
$$

となり、$P$ に関する境界値問題として

$$
\begin{cases}P'' + k^2P = 0 \\P'(0) = -\dfrac{i \rho \omega U_g}{A}, \quad P(L)=0\end{cases}
$$

が得られます。この解を求めます。

一般解は再び $P(x) = B \cos(kx) + C\sin(kx)$ であり、$P(L)=0$ より $B \cos(kL) + C\sin(kL) = 0$と なります。角周波数 $\omega$ がフォーマントの角周波数 $\omega_n$ のいずれかに一致していると仮定すると $\cos(kL) = 0$ より $C = 0$ となり、$U_g \neq 0$ より $P'(0)$ の境界条件を満たさなくなります。従って $\omega \neq \omega_n \implies \cos(kL) \neq 0$ より

$$
B = - C\tan(kL)
$$

となるので、これを一般解に代入することで

$$
P(x) = -C \left( \dfrac{\sin(kL)\cos(kx))}{\cos(kL)} - \sin(kx) \right) = -C \dfrac{\sin(k(L - x))}{\cos(kL)}
$$

を得ます。微分すると $P'(x) = kC \dfrac{\cos(k(L-x))}{\cos(kL)}$を得るので、$P'(0)$ の境界条件より

$$
kC = -\dfrac{i \rho \omega U_g}{A} \implies C = -\dfrac{i \rho c U_g}{A}
$$

となり、境界値問題の解として

$$
P(x) = \dfrac{i \rho c U_g}{A} \dfrac{\sin(k(L-x))}{\cos(kL)}
$$

が得られます。

インピーダンスを考えます。調和振動解を仮定すると、

$$
Z = \dfrac{\tilde{p}(x, t)}{A \tilde{u}(x, t)} = \dfrac{P(x)}{U(x)}
$$

となり、時刻 $t$ に依存しないことがわかります。また (2) に調和振動解を代入すると

$$
\dfrac{\partial p}{\partial x} + \rho \dfrac{\partial u}{\partial t} = P'(x)e^{i\omega t} + \rho \dfrac{U(x)}{A} \cdot i \omega e^{i \omega t} =0
$$

より $U(x) = - \dfrac{A}{i \rho\omega} P'(x)$ が得られ、

$$
Z = -\dfrac{i \rho \omega}{A} \dfrac{P(x)}{P'(x)}
$$

となります。最後に $P(x) \propto \sin(k(L - x))$ を用いて代入すると

$$
Z = -\dfrac{i \rho \omega}{A} \dfrac{\sin(k(L-x))}{-k \cos(k(L - x))} = i \dfrac{\rho c}{A} \tan(k(L-x))
$$

となり、特に声門 ($x=0$) におけるインピーダンスとして

$$
Z_\text{in} = i \dfrac{\rho c}{A} \tan(kL)
$$

が得られます。

インピーダンスは $\omega = \omega_n$、つまりフォーマントの角周波数において発散し、その前後で符号が反転します。上記の計算から、リアクタンス $X$ を最大化するというのは、発声する音程の角周波数 $\omega$ がフォーマントの角周波数 $\omega_n$ よりも僅かに低い状態に保つことだとわかります。

## 3. フォーマントチューニング (Formant tuning)

### 3-1. ウェブスターのホルン方程式 (Webster horn equation)

フォーマントは (4) を鑑みると、声道の長さ $L$ のみに依存して決まるように見えます。しかし実際のフォーマントチューニングでは顎を上げ下げして口の大きさを調整するなど、$L$ 以外の要素が影響します。(4) の式に表れていないのは、1-1 で仮定した「一様」、つまり断面積が一定であるという条件が現実に即していないことから生じています。従って断面積 $A$ は $x$ の関数 $A(x)$ として扱う必要があります。

ここで登場するのがウェブスターのホルン方程式です。質量保存の法則から得られた (1) の式は、断面積が一様でない場合は以下のようになります:

$$
\dfrac{1}{A}\dfrac{\partial (Au)}{\partial x} + \dfrac{1}{\rho c^2} \dfrac{\partial p}{\partial t} = 0 \tag{5}
$$

運動量保存則から得られた (2) の式は同様に成り立つため、(5) を $t$ で偏微分した($A$ が $t$ に依らないことに注意)のちに (2) を用いて $u$ を消去することでウェブスターのホルン方程式

$$
\dfrac{1}{A} \dfrac{\partial}{\partial x} \left( A \dfrac{\partial p}{\partial x}\right) - \dfrac{1}{c^2} \dfrac{\partial^2 p}{\partial t^2} = 0 \tag{6}
$$

が得られます。調和振動解 $p(x, t) = P(x) e^{i\omega t}$ を仮定することで $P$ に関する常微分方程式

$$
\dfrac{d}{dx} \left( A(x)\dfrac{dP}{dx} \right) + \dfrac{\omega^2}{c^2}A(x)P= 0 \tag{7}
$$

が得られます。以降この方程式と境界条件

$$
P'(0) = 0, \quad P(L)=0
$$

を用いて、$A(x)$ の変化がフォーマントに対してどのように影響するかを考えます。

### 3-2. 摂動法 (Perturbation theory)

ウェブスターのホルン方程式は一般の $A(x)$ に対して陽に解くことができません。よって (3) の一様な場合の方程式を非摂動 ($A(x) = A_0$) とし、これを元に一様でない管 $A(x)$ を一様な管 $A_0$ へ摂動 $\delta A(x)$ を与えたものと考え、(7) を元に摂動がフォーマントに与える影響を考えます。

$0 < \varepsilon \ll1$ を摂動の大きさを司るパラメータとし、$A(x)$ を

$$
A(x) = A_0 + \varepsilon \delta A(x)
$$

と表します。同様に $\omega_n, P_n(x)$ についても非摂動における解に対する摂動として展開し、

$$
\begin{align*}\omega_n &= \omega_n^{(0)} + \varepsilon \omega_n^{(1)} + O(\varepsilon^2), & \quad & \omega_n^{(0)} = ck_n^{(0)} = \dfrac{(2n - 1)c \pi}{2L} \\P_n(x) &= P_n^{(0)}(x) + \varepsilon P_n^{(1)}(x) + O(\varepsilon^2), & \quad & P_n^{(0)}(x) = \cos(k_n^{(0)}x)\end{align*}
$$

と表します。これを (7) に代入し、$\varepsilon^1$ の係数を考えます。念のため $\varepsilon^0$ の係数について先に言及すると、これは非摂動の方程式に一致し、$\omega_n^{(0)}, P_n^{(0)}(x)$ について

$$
\dfrac{d^2P_n^{(0)}}{dx^2} + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 P_n^{(0)} = 0
$$

となり、この境界値問題は既に見た通りです。

(7) について $\varepsilon^1$ の係数を考えると

$$
\begin{aligned}
& \dfrac{d}{dx} \left( \delta A(x) \dfrac{dP_n^{(0)}}{dx} \right) + A_0 \dfrac{d^2 P_n^{(1)}}{dx^2} \\
& \quad + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 A_0P_n^{(1)} + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \delta A(x) P_n^{(0)} + \dfrac{2\omega_n^{(0)} \omega_n^{(1)}}{c^2} A_0P_n^{(0)} =0
\end{aligned}
$$

が得られます。辺々に $P_n^{(0)}$ を掛けて $\left[0, L\right]$ で定積分することを考えます。上記の 5 つの項のうち、 $P_n^{(1)}$ を含む 2 項が打ち消し合うことを確認します。

$$
\begin{align*}& \int_0^L P_n^{(0)} \dfrac{d^2 P_n^{(1)}}{dx^2} dx \\=& \left[ P_n^{(0)} \dfrac{dP_n^{(1)}}{dx} \right]_{x=0}^{x=L} - \int_0^L \dfrac{dP_n^{(0)}}{dx} \dfrac{dP_n^{(1)}}{dx} dx \\=& - \int_0^L \dfrac{dP_n^{(0)}}{dx} \dfrac{dP_n^{(1)}}{dx} dx \quad \left( \because \begin{cases} \left. \dfrac{dP_n}{dx} \right|_{x=0} = 0 &\implies \left. \dfrac{dP_n^{(m)}}{dx} \right|_{x=0} = 0 \\ P_n(L) = 0 &\implies P_n^{(m)}(L)=0 \end{cases} \right) \\=& - \left[ \dfrac{dP_n^{(0)}}{dx} P_n^{(1)} \right]_{x=0}^{x=L} + \int_0^L \dfrac{d^2 P_n^{(0)}}{dx^2} P_n^{(1)} dx \\=& - \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \int_0^L P_n^{(0)} P_n^{(1)} dx \quad \left( \because \dfrac{d^2P_n^{(0)}}{dx^2} + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 P_n^{(0)} = 0 \right)\end{align*}
$$

従って残りの 3 項について

$$
\begin{aligned}
& \int_0^L P_n^{(0)} \dfrac{d}{dx} \left( \delta A(x) \dfrac{dP_n^{(0)}}{dx} \right) dx \\
& \quad + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \int_0^L \delta A(x) \left\lbrace P_n^{(0)}\right\rbrace^2dx + \dfrac{2\omega_n^{(0)} \omega_n^{(1)}}{c^2} A_0 \int_0^L \left\lbrace P_n^{(0)}\right\rbrace^2 dx = 0
\end{aligned}
$$

となります。第 1 項を部分積分することで

$$
\begin{align*}& \int_0^L P_n^{(0)} \dfrac{d}{dx} \left( \delta A(x) \dfrac{dP_n^{(0)}}{dx} \right) dx \\= & \left[ P_n^{(0)} \delta A(x) \dfrac{dP_n^{(0)}}{dx} \right]_{x=0}^{x=L} - \int_0^L \delta A(x) \left( \dfrac{dP_n^{(0)}}{dx} \right)^2dx \\= & - \int_0^L \delta A(x) \left( \dfrac{dP_n^{(0)}}{dx} \right)^2dx\end{align*}
$$

となるので、これを代入して $\omega_n^{(1)}$ について解くことで

$$
\omega_n^{(1)} = \dfrac{c^2}{2\omega_n^{(0)}A_0} \dfrac{\displaystyle \int_0^L \delta A(x) \left[ \left( \dfrac{dP_n^{(0)}}{dx}\right)^2 - \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \left\lbrace P_n^{(0)}\right\rbrace^2 \right]dx }{\displaystyle \int_0^L \left\lbrace P_n^{(0)}\right\rbrace^2 dx }
$$

が得られます。最後に $P_n^{(0)}(x) = \cos(k_n^{(0)}x), \, k_n^{(0)}=\dfrac{\omega_n^{(0)}}{c}$ を代入することで

$$
\begin{align*}\omega_n^{(1)} &= \dfrac{c^2}{2\omega_n^{(0)}A_0} \dfrac{\displaystyle \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \int_0^L \delta A(x) \left\lbrace \sin^2 \left( k_n^{(0)}x \right) - \cos^2 \left(k_n^{(0)}x\right) \right\rbrace dx}{\displaystyle \int_0^L \cos^2 \left(k_n^{(0)}x\right) dx} \\&= -\dfrac{\omega_n^{(0)}}{A_0L} \int_0^L \delta A(x) \cos\left(2 k_n^{(0)} x \right) dx\end{align*}
$$

となり、フォーマントの変化率として

$$
\dfrac{\Delta F_n}{F_n} \approx - \dfrac{1}{A_0L} \int_0^L \delta A(x) \cos\left( \dfrac{(2n-1)\pi x}{L} \right) dx \tag{8}
$$

が得られます。

### 3-3. 母音修正 (Vowel modification)

数式を弄り倒すパートが漸く終わりました。あとは声門を変化させたときにフォーマントがどのように変化するのかを考えていきます。とはいっても意識的に変化させられる物理量は声門の長さ $L$ (咽頭を上げ下げする、唇を突き出すなど)と、声門の断面への摂動 $\delta A(x)$ くらいしかありません。

簡単なのは $L$ による影響です。(4) を再び記載します:

$$
F_n = \dfrac{(2n - 1)c}{4L}, \quad n=1,2,3,\dots
$$

全てのフォーマント $F_n$ は $L$ と反比例、従って $L$ について単調減少となります。実際のところトレーニング以外で唇を尖らせて歌うのは現実的ではないため、咽頭を上げ下げして $L$ を調整することになるようです。

反対に断面の変化 $\delta A(x)$ の影響は簡単ではありません。(8) を再び記載します:

$$
\dfrac{\Delta F_n}{F_n} \approx - \dfrac{1}{A_0L} \int_0^L \delta A(x) \cos\left( \dfrac{(2n-1)\pi x}{L} \right) dx, \quad n=1,2,3,\dots
$$

非積分関数に含まれる $\cos\left( \dfrac{(2n-1)\pi x}{L} \right) $ は積分区間 $\left[0, L\right]$ において符号が入れ替わり、加えてその挙動は $n = 1, 2, 3, \dots$ に依存しているため、単純に $A(x)$ を大きくすれば ($\delta A(x) > 0$) フォーマントが上がる/下がるといった帰結は得られません。しかしわかりやすい結果として、顎を下げて口を大きく開くことは $x \approx L$ において $\delta A(x) > 0$ となることを意味し、この領域では $n$ に依らず $\cos\left( \dfrac{(2n-1)\pi x}{L} \right) \approx -1 $ となり、従ってフォーマントは上昇します。反対に口を小さめに閉じる場合にはフォーマントは下降します。

私のような未熟なボーカルが高音を歌う際に、口を大きく開けて声を張り上げる傾向にあるのは上記により説明されます。一方でフォーマントチューニングの際たるテクニックである母音修正においては、口を大きく開く「あ」を、「え」や「う」にやや寄せて少し口を閉じた形で発音すると指導します。これは逆にフォーマントを下げる効果があるのですが、これにより第 1 フォーマント $F_1$ ではなく第 2 フォーマント $F_2$ を基本振動数 $f_0$ に対応させるのが「真の」ミックスボイスだと LLM は主張しています。一部の LLM は倍音 (harmonics) $nf_0$ を $F_2$ や $F_3$ に対応させると説明していましたが、実際のところ正しいのかよくわかっていません。

## おわりに

ここまで読んでくださった方、ありがとうございました。これであなたも「ミックスボイスの原理はなんとなくわかったけれど、実際には何も歌えない」という執筆時点の私と同じ地点に立ちました。これからやるべきことは理論を実践に移し、発声器官に対する巧みな操作 (maneuver) を筋肉の記憶 (muscle memory) となるまで落とし込むことです。それに必要なボイストレーニングは毎日コツコツとやることになるのでしょうけれど、効果が出ないうちに「なんでこんなことやらないといけないんだろう」と離脱してしまうことを少しでも防ぐことができれば本望です。
