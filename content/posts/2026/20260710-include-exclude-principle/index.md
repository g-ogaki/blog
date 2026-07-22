---
title: 包除原理の簡単な証明
date: 2026-07-10
category: Mathematics
tags:
  - AtCoder
  - Competitive Programming
draft: false
---

この記事の移植ですが、初学者向けの冗長な説明は省きました。

https://qiita.com/monipy/items/fe44cd8d7c172c6a1a50

## 1. 包除原理
### 1.1 証明

全体集合を $U$ とし、$n$ 個の部分集合 $A_1, \dots, A_n \subset U$ を考えます。$U$ は $A_i$ たちによって(高々) $2^n$ 個の部分集合 $\displaystyle \left(\bigcap_{i \in I} A_i \right) \cap \left(\bigcap_{i \notin I} A_i^c \right)$ に分割されます。ただし $I \subset \lbrace1, \dots, n \rbrace$ です。これらの分割された集合に対して、その要素数 $|(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)|$ を求めることを考えます。

集合 $A$ に対しその[指示関数](https://ja.wikipedia.org/wiki/%E6%8C%87%E7%A4%BA%E9%96%A2%E6%95%B0) $\mathbf 1_A$ を

$$
\mathbf 1_A(x) = 
\begin{cases}
1 \quad & \text{if } x \in A \\
0 \quad & \text{if } x \notin A
\end{cases}
$$

とします。$\mathbf 1_{A \cap B}(x) = \mathbf 1_A(x) \mathbf 1_B(x)$ および $\mathbf 1_{A^c}(x) = 1 - \mathbf 1_A(x)$ が成り立つことに注意すると、任意の $x \in U$ に対して

$$
\begin{aligned}

\mathbf 1_{(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)}(x) &= \prod_{i \in I} \mathbf 1_{A_i}(x) \prod_{i \notin I} \mathbf 1_{A_i^c}(x) \\
&= \prod_{i \in I} \mathbf 1_{A_i}(x) \prod_{i \notin I} (1 - \mathbf 1_{A_i}(x)) \\
&= \prod_{i \in I} \mathbf 1_{A_i}(x) \sum_{J: J \cap I = \emptyset} (-1)^{|J|} \prod_{j \in J} \mathbf 1_{A_j}(x) \\
&= \sum_{J: J \supset I} (-1)^{|J \setminus I|} \prod_{j \in J} \mathbf 1_{A_j}(x) \\
&= \sum_{J: J \supset I} (-1)^{|J \setminus I|} \mathbf 1_{\cap_{j \in J} A_j}(x)

\end{aligned}
$$

が成り立ちます。この両辺を $x \in U$ について和をとることで

$$
|(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)| = \sum_{J: J \supset I} (-1)^{|J\setminus I|} |\cap_{j \in J} A_j| \tag{$\star$}
$$

が得られます。特に $I = \emptyset$ とすることで

$$
|\cap_{i=1}^n A_i^c| = \sum_{I} (-1)^{|I|} |\cap_{i\in I} A_i|
$$

および

$$
\begin{aligned}
|\cap_{i=1}^n A_i^c| &= |U| - |\cup_{i=1}^n A_i| \\
\sum_{I} (-1)^{|I|} |\cap_{i\in I} A_i| &= |U| + \sum_{I \neq \emptyset} (-1)^{|I|} |\cap_{i \in I} A_i|
\end{aligned}
$$

より $|U|$ を消去して

$$
|\cup_{i=1}^n A_i| = \sum_{I \neq \emptyset} (-1)^{|I| - 1} |\cap_{i \in I} A_i|
$$

という、和集合を積集合で表現するお馴染みの包除原理が得られます。しかしこれは和集合が「補集合の積集合の補集合」で表されるという性質から副次的に得られるものであり、包除原理の本質は $(\star)$ の式であることが後の議論からもわかると思います。

さて、$(\star)$ の左辺を $f(I) = |(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)|$ と記述すると

$$
|\cap_{i \in I} A_i| = \sum_{J: J \supset I} f(J) =: F(I)
$$

となり、$(\star)$ は

$$
f(I) = \sum_{J: J \supset I} (-1)^{|J \setminus I|} F(J)
$$

と記述できます。つまり各 $f(I)$ の値を、その(上側)累積和 $F(I) = \displaystyle \sum_{J: J \supset I} f(J)$ を用いて表現したものが包除原理であると解釈できます。以下の例題でも見るように、$f(I)$ の値を求めることは難しくても累積和 $F(I)$ の値は簡単に求まるとき、累積和から元の $f(I)$ を復元する方法の 1 つが包除原理となります。

上記では上側累積和を取りましたが、下側累積和を取る式も同様に考えることができます。

$$
\begin{aligned}

& \mathbf 1_{(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)}(x) \\
= & \prod_{i \in I} \mathbf 1_{A_i}(x) \prod_{i \notin I} \mathbf 1_{A_i^c}(x) \\
= & \prod_{i \in I} (1 - \mathbf 1_{A_i^c}(x)) \prod_{i \notin I} \mathbf 1_{A_i^c}(x) \\
= & \sum_{J: J \subset I} (-1)^{|J|} \prod_{j \in J} \mathbf 1_{A_j^c}(x) \prod_{i \notin I} \mathbf 1_{A_i^c}(x)   \\
= & \sum_{J: J \supset I^c} (-1)^{|J \setminus I^c|} \prod_{j \in J} \mathbf 1_{A_j^c}(x) \\
= & \sum_{J: J \supset I^c} (-1)^{|J \setminus I^c|} \mathbf 1_{\cap_{j \in J} A_j^c}(x) \\
= & \sum_{J: J \supset I^c} (-1)^{|J \setminus I^c|} (1 - \mathbf 1_{\cup_{j \in J} A_j}(x)) \\
= & \sum_{J: J \supset I^c} (-1)^{|J \setminus I^c| - 1} \mathbf 1_{\cup_{j \in J} A_j}(x) \quad (\because \sum_{J: J \supset I^c} (-1)^{|J \setminus I^c|} = 0)

\end{aligned}
$$

より、特に $I = \lbrace 1, \dots, n \rbrace$ としたとき

$$
|\cap_{i = 1}^n A_i| = \sum_{I \neq \emptyset} (-1)^{|I| - 1} |\cup_{i \in I} A_i|
$$

という、積集合を和集合で表現するという実用性のよくわからない包除原理の公式が得られます。

### 1.2 例題
[ABC423-F Loud Cicada](https://atcoder.jp/contests/abc423/tasks/abc423_f)

全体集合は $U = \lbrace 1, \dots, Y \rbrace$、$N$ 個の集合 $A_i \subset U$ は(記号の濫用ですが) $A_i = \lbrace x \in U : x \text{ は } A_i \text{ の倍数} \rbrace$ となります。上記の $f$ を用いると、求める値は $s = \displaystyle \sum_{I: |I| = M} f(I)$ となります。

個々の $f(I)$ を求めるのは困難ですが、その累積和 $F(I)$ については

$$
F(I) = |\cap_{i \in I} A_i| = |\lbrace x \in U : \text{$x$ は $ \displaystyle \operatorname*{LCM}_{i \in I}(A_i)$ の倍数 } \rbrace| = \left\lfloor \dfrac{Y}{\operatorname*{LCM}_{i \in I}(A_i)} \right\rfloor
$$

となり簡単に求まります。全ての $|I| = M$ なる $I$ に対して $(\star)$ を用いて $f(I)$ を計算しても計算回数は $\displaystyle O\left(\binom{N}{M}2^{N-M} \right)$ となり、このままでも高速な言語では AC できます(C++ なら通せたが Python では通せなかった)が、さらに計算を進めると

$$
\begin{aligned}
s &= \sum_{I: |I| = M} \sum_{J: J \supset I} (-1)^{|J| - M} F(J) \\
&= \sum_{J: |J| \ge M} (-1)^{|J| - M} F(J) \sum_{I: I \subset J, |I| = M}1 \\
&= \sum_{J: |J| \ge M} (-1)^{|J| - M} \binom{|J|}{M} F(J)
\end{aligned}
$$

となり、和の項数を高々 $O(2^N)$ にまで抑えることができます。

#### サンプルコード(包除原理)

各 $I$ ごとに $\operatorname*{LCM}_{i \in I}(A_i)$ の値をその都度求めても問題ないですが、以下では計算量改善および記述量減少のため動的計画法で求めています。

```python
from math import lcm, comb

N, M, Y = map(int, input().split())
A = list(map(int, input().split()))

LCM = [1]
for a in A:
    LCM += [min(lcm(l, a), Y + 1) for l in LCM]

F = [Y // l for l in LCM]
ans = sum(pow(-1, b - M & 1) * comb(b, M) * v for I, v in enumerate(F) if (b := I.bit_count()) >= M)
print(ans)
```

#### サンプルコード(メビウス変換)

包除原理ではなくメビウス変換を用いて全ての $I$ に対して $f(I)$ を求めることもできます。その後 $|I| = M$ なる $I$ について足し合わせれば良いです。

```python
from math import lcm

N, M, Y = map(int, input().split())
A = list(map(int, input().split()))

LCM = [1]
for a in A:
    LCM += [min(lcm(l, a), Y + 1) for l in LCM]

f = [Y // l for l in LCM]
for i in range(N):
    for I in range(1 << N):
        if I >> i & 1:
            f[I ^ 1 << i] -= f[I]

ans = sum(v for I, v in enumerate(f) if I.bit_count() == M)
print(ans)
```

## 2. 約数包除
### 2.1 メビウスの反転公式

正の整数全体を $\mathbb N$ で表し、$\mathbb N_0 = \mathbb N \cup \lbrace 0 \rbrace$ とします。$\mathbb N$ の順序を $m \le n \overset{\mathrm{def}}{\iff} m \mid n$ とした半順序集合を考えるのですが、これは $\ell_c := \lbrace (e_1, e_2, \dots) \in \mathbb N_0^{\mathbb N} : \exists i_0 \le \forall i, \, e_i = 0 \rbrace$ に、その順序を $e \le f \overset{\mathrm{def}}{\iff} \forall i \in \mathbb N, \, e_i \le f_i$ とした半順序集合と同型になります。そしてその対応は素因数分解を用いて $n = \displaystyle \prod_{i \in \mathbb N} p_i^{e_i} \in \mathbb N \leftrightarrow (e_i)_{i \in \mathbb N} \in \ell_c$ となります。

$\mathbb N$ 上の関数 $f(n)$ を考えます。$n \in \mathbb N$ と素数 $p$ に対して、$n$ に含まれる素因数 $p$ の個数を $\operatorname*{ord}_p(n)$ とし、$I_n = \lbrace i \in \mathbb N : p_i \mid n \rbrace$ と表すことにします(これは有限集合です)。下側集合 $L_n := \lbrace d \in \mathbb N : d \mid n \rbrace$ を使って指示関数を考えると

$$
\begin{aligned}

\mathbf 1_{\lbrace n \rbrace}(x) &= \prod_{i \in \mathbb N} \mathbf 1_{\operatorname*{ord}_{p_i}(x) = e_i} \\
&= \prod_{i \notin I_n} \mathbf 1_{\operatorname*{ord}_{p_i}(x) = 0} \prod_{i \in I_n} (\mathbf 1_{\operatorname*{ord}_{p_i}(x) \le e_i} - \mathbf 1_{\operatorname*{ord}_{p_i}(x) \le e_i-1} ) \\
&= \sum_{I \subset I_n} (-1)^{|I|} \mathbf 1_{L_{n/\prod_{i \in I} p_i}}(x)

\end{aligned}
$$

となります。辺々に $f$ を掛けて $x \in \mathbb N$ について和を取る(あるいは同じことですが $f$ の重みを持つ $\mathbb N$ 上の数え上げ測度で積分する)ことで

$$
f(n) = \sum_{I: I \subset I_n} (-1)^{|I|}F\left(\frac{n}{\prod_{i \in I} p_i}\right) \tag{$\star\star$}
$$

が得られます。これが[メビウスの反転公式](https://ja.wikipedia.org/wiki/%E3%83%A1%E3%83%93%E3%82%A6%E3%82%B9%E3%81%AE%E5%8F%8D%E8%BB%A2%E5%85%AC%E5%BC%8F)であることは、[メビウス関数](https://ja.wikipedia.org/wiki/%E3%83%A1%E3%83%93%E3%82%A6%E3%82%B9%E9%96%A2%E6%95%B0) $\mu$ の定義を考慮すると

$$
f(n) = \sum_{d \mid n} \mu \left(\dfrac{n}{d} \right) F(d) = \sum_{d \mid n} \mu(d) F\left( \frac{n}{d} \right)
$$

の右辺と $(\star\star)$ の右辺が等しいことがわかると思います。

### 2.2 例題

[ABC304-F Shift Table](https://atcoder.jp/contests/abc304/tasks/abc304_f)

`#` と `.` からなる長さ $N$ の文字列 $S$ が与えられるので、同じく `#` と `.` からなる長さ $N$ の文字列 $T$ であって、その最小周期 $C(T)$ が $N$ より小さく、かつ `S[i] == '.'` ならば `T[i] == '#'` となるものの個数を数える問題です。求める数を $s$ とすると、


$$
\begin{aligned}
s &= \sum_{d \mid N, d \neq N} \sum_{T: C(T) = d} \mathbf 1_{\forall i, \, \text{S[i] == '.'} \implies \text{T[i] == '\#'}} \\
&=: \sum_{d \mid N, d \neq N} f(d)
\end{aligned}
$$

となります。最小周期が $d$ であるという条件は扱いづらいですが、周期が $d$ である(最小周期が $d$ の約数である)という条件は `T[0:d] == T[d:2d] == ... == T[N-d:N]` と扱いやすく、ここでも $f(d)$ より $F(d)$ の方が求めやすいです。具体的には

$$
F(d) = 2^{| \lbrace 1 \le i \le d : \forall j \equiv i \mod d, \, \text{S[j] == '\#'} \rbrace|}
$$

なので、これを用いて $f(d)$ を計算することで $s$ が求まります。なお $s = F(N) - f(N)$ であり必要な $f$ の値は 1 つだけなので、メビウスの反転公式を用いる方法でも累積和の差分を取る(全ての $d \mid N$ に対して $f(d)$ を計算する)方法でも問題ありません。

#### サンプルコード(約数列挙と素因数列挙)

メビウスの反転公式でも累積和の差分でもそうなのですが、$N$ の約数を列挙するだけでなく、$N$ に含まれる素因数も列挙したいです。$O(\sqrt N)$ の試し割り法で素因数列挙と約数列挙を双方行うのでもよいのですが、以下のコードでは素因数を列挙した後にその素因数から約数を復元しています。このようなコードを書いた理由はいくつかあり:

1. 素因数列挙と約数列挙を同時に行う場合、ループの内部で $i = 2, \dots, \lfloor \sqrt N\rfloor$ に対して $N$ の約数の役割と $N$ の素因数の役割の両方を担わせることに違和感がある
2. $N$ が合成数の場合、大抵 $\lfloor \sqrt N\rfloor$ 回未満のループで停止する
3. `divisors` 配列の順序が扱いやすい

3 について、$\displaystyle N = \prod_{i=1}^k p_i^{e_i}$ とすると `divisors` 配列 $D$ は大きさ $(e_1 + 1) \times \dots \times (e_k + 1)$ の $k$ 次元配列 $\displaystyle\left(\prod_{i=1}^k p_i^{f_i}\right)_{0 \le f_1 \le e_1, \dots, 0 \le f_k \le e_k}$ をこの順序で 1 次元化 (flatten) したものになっています。$D$ は通常の大小関係でソートされていませんが、$D_i \mid D_j \implies i \le j$ と約数の順序を保っている([ハッセ図](https://ja.wikipedia.org/wiki/%E3%83%8F%E3%83%83%E3%82%BB%E5%9B%B3)においてトポロジカルソートされている)ため累積和の差分を考える上で順序が問題にならないだけでなく、例えば 0-indexed として  $D_i \mid D_j \implies \dfrac{D_j}{D_i} = D_{j-i}$ が成り立つなどこの順序を生かすこともできます(たいした計算量でもないので必要であればソートすればよいです)。

```python
primes = []
divisors = [1]
p = 2
M = N
while p * p <= M:
    if M % p == 0:
        primes.append(p)  # または primes.append((len(divisors), p))
        l = len(divisors)
        while M % p == 0:
            divisors += [d * p for d in divisors[-l:]]
            M //= p
    p += 1
if M > 1:
    primes.append(M)  # 同様に primes.append((len(divisors), M))
    divisors += [d * M for d in divisors]
```

#### サンプルコード(約数包除)

一般的なメビウスの反転公式ではなく $(\star\star)$ の方を使います。$N$ に含まれる素因数の種類数を $\omega(N)$ とすると、$(\star\star)$ の右辺の和は $2^{\omega(N)}$ 個(=メビウス関数が $0$ でない値を取る個数)なので、この部分だけをイテレートして和を計算します。同様に $F(d)$ の値も全ての $d \mid N$ で必要なわけではないので、必要な部分だけを計算することで計算量を $O(2^{\omega(N)}N)$ に抑えられます。
以下のコードでは $s = -\displaystyle \sum_{I \subset I_n, I \neq \emptyset} (-1)^{|I|} F\left(\dfrac{N}{\prod_{i \in I}p_i}\right)$ であることを利用して計算しています。

```python
MOD = 119 << 23 | 1

N = int(input())
S = input()

divisors = [1]  # メビウス関数が 0 でない N の約数のみを列挙
p = 2
_N = N
while p * p <= _N:
    if _N % p == 0:
        divisors += [d * p for d in divisors]
        while _N % p == 0:
            _N //= p
    p += 1
if _N > 1:
    divisors += [d * _N for d in divisors]

def F(d):
    count = sum(all(S[j] == '#' for j in range(i, N, d)) for i in range(d))
    return pow(2, count, MOD)

ans = -sum(pow(-1, I.bit_count() & 1) * F(N // d) for I, d in enumerate(divisors[1:], 1)) % MOD
print(ans)
```

#### サンプルコード(動的計画法解)

上記では必要な各 $d \mid N$ に対して愚直に $F \left(\dfrac{N}{d} \right)$ の値を計算していますが、包除原理の例題のように動的計画法でも求められます。以下のコードはそれを実現したものですが、約数包除だと何をしているのかわかりにくい気がします。コード内の `F` は長さ $2^{\omega(N)}$ の配列であり、$I \in 2^{I_n} \simeq [0, 2^{\omega(N)}) $ に対し、`F[I]` の値は $F \left(\dfrac{N}{\prod_{i \in I} p_i} \right)$ となります。

```python
MOD = 119 << 23 | 1

N = int(input())
S = input()

def split(t, d):
    l = len(t)
    return ''.join('#' if all(t[j] == '#' for j in range(i, l, l // d)) else '.' for i in range(l // d))

T = [S]
p = 2
_N = N
while p * p <= _N:
    if _N % p == 0:
        T += [split(t, p) for t in T]
        while _N % p == 0:
            _N //= p
    p += 1
if _N > 1:
    T += [split(t, _N) for t in T]

F = [pow(2, t.count('#'), MOD) for t in T]
ans = -sum(pow(-1, I.bit_count() & 1) * v for I, v in enumerate(F[1:], 1)) % MOD
print(ans)
```

計算量解析がちょっと大変で、あまり自信がありません。動的計画法の部分で $\displaystyle N \sum_{i=1}^{\omega(N)} \prod_{j < i} \left(1 + \dfrac{1}{p_j} \right)$ 回程度の計算を行っているように見受けられます。[素数定理](https://ja.wikipedia.org/wiki/%E7%B4%A0%E6%95%B0%E5%AE%9A%E7%90%86)を用いると

$$
\begin{aligned}

\sum_{i=1}^{\omega(N)} \prod_{j < i} \left(1 + \dfrac{1}{p_j} \right) & \sim \sum_{i=1}^{\omega(N)} \prod_{j < i} \exp \left( \dfrac{1}{p_j} \right) \\
&= \sum_{i=1}^{\omega(N)} \exp \left( \sum_{j < i} \dfrac{1}{p_j} \right) \\
& \sim \sum_{i=1}^{\omega(N)} \exp( \log (\log (p_i))) \\
&= \sum_{i=1}^{\omega(N)} \log(p_i) \\
& \sim \sum_{i=1}^{\omega(N)} \log(i \log (i)) \\
& \sim \sum_{i=1}^{\omega(N)} \log(i) \\
& \sim \omega(N) \log(\omega(N))

\end{aligned}
$$

なので $O(N \omega(N) \log (\omega(N)))$ となりそうです。そしてコードでは素数 $p$ の昇順で動的計画法を行なっていますが、$p$ の降順にすることで $O(N \omega(N))$ に落とせるはずです(計算内の $\log (\log (p_i))$ が $\log(\log(p_{\omega(N)})) - \log(\log(p_{\omega(N) - i}))$ に変わるのと $\displaystyle \sum_{i=1}^{n} \dfrac{1}{\log (i)} \sim \dfrac{n}{\log (n)}$ より)。実際に私の提出の中でもこの実装が最速で([実装例](https://atcoder.jp/contests/abc304/submissions/77328005))、これを Gemini に C++ へ変換してもらった[提出](https://atcoder.jp/contests/abc304/submissions/77291369)は fastest を獲得しました。

#### サンプルコード(メビウス変換)

`f` を連想配列にして累積和の差分を取ることもできますが、以下では `divisors` 配列の順序を利用して配列のまま行っています。計算量は $N$ の約数の個数を $\sigma_0(N)$ として $O(N \sigma_0 (N))$ となります。$2^{\omega(N)} \le \sigma_0 (N)$ なので計算量においてはこの例題では約数包除に軍配が上がります。

```python
MOD = 119 << 23 | 1

N = int(input())
S = input()

primes = []
divisors = [1]
p = 2
_N = N
while p * p <= _N:
    if _N % p == 0:
        primes.append((l := len(divisors), p))
        while _N % p == 0:
            divisors += [d * p for d in divisors[-l:]]
            _N //= p
    p += 1
if _N > 1:
    primes.append((len(divisors), _N))
    divisors += [d * _N for d in divisors]

def F(d):
    count = sum(all(S[j] == '#' for j in range(i, N, d)) for i in range(d))
    return pow(2, count, MOD)

f = [F(d) for d in divisors]
for i, p in primes:
    for j in range(len(divisors) - 1, -1, -1):
        if divisors[j] % p == 0:
            f[j] -= f[j - i]

ans = (F(N) - f[-1]) % MOD
print(ans)
```

## 3. 一般化

ここまでの議論を一般の半順序集合 $P$ に拡張することも考えたのですが、得られた帰結がどこまで有用なのかは謎です。以下の議論において $P$ は半順序集合では不十分のため[束](https://ja.wikipedia.org/wiki/%E6%9D%9F_(%E6%9D%9F%E8%AB%96)) (lattice) の構造を入れる必要があり、この時点で隣接代数ほどの一般性は得られておりません。

今までは $f(x)$ をその累積和 $F(x)$ で表現してきましたが、ここではさらに区間和 $\displaystyle \sum_{x \in [y,z]} f(x)$ を $F(x)$ で表すことを考えます。区間 $[y, z] \subset P$ に対し、その直前要素 (predecessor) 全体を

$$
P_{[y,z]} = \lbrace x \in P \setminus [y,z) : x < z, \, (x,z) \subset [y,z) \rbrace
$$

とします。特に $y=z$ のときは $P_y := P_{[y,y]} = \lbrace x \in P : x < y , \, (x, y) = \emptyset \rbrace$ となり直前の意味が直感的に理解でき、$P_{[y,z]}$ はこれを区間に拡張したものです。$P$ が局所有限のとき

$$
[y, z] = \displaystyle L_z \setminus \bigcup_{x \in P_{[y,z]}} L_x
$$

が成り立ちます。

<details><summary>証明</summary>

$\subset$ について、$[y,z] \subset L_z$ は明らか。$\exists x \in P_{[y,z]}, \, \exists w \in [y,z], \, w \in L_x$ とすると $y \le w \le x < z$ となり $x \in [y, z)$ となるが、これは $x \in P_{[y,z]}$ に矛盾する。よって $\forall x \in P_{[y,z]}, \, [y,z] \cap L_x = \emptyset $ より包含関係が成り立つ。

右辺が真に大きいとして矛盾を導く。仮定より $\exists w \notin [y,z], \, w < z, \, \forall x \in P_{[y,z]}, \, w \notin L_x$ となる。このとき $\exists u \in [w,z)\cap[y,z)^c, \, u \in P_{[y,z]}$ となることを背理法で示す。これが成り立たないとすると

$$
\forall u \in [w, z) \cap [y, z)^c, \, \exists u' \in (u, z) \cap [y,z)^c \subset [w,z) \cap [y,z)^c
$$

となり、これを繰り返すことで $w < u_1 < u_2 < \dots < u_n < z$ と任意の長さの昇鎖を作れることになるが、これは $P$ の局所有限性より $[w, z]$ が有限集合であることに矛盾。従って $\exists u \in [w,z)\cap[y,z)^c, \, u \in P_{[y,z]}$ であり、特に $w \in L_u$ となるが、これは最初の仮定であった $\forall x \in P_{[y,z]}, \, w \notin L_x$ に矛盾する。

</details>

ここで $P$ に束の構造を導入し、上記の等式に指示関数の議論を適用すると

$$
\begin{aligned}
\mathbf 1_{[y,z]} &= \mathbf 1_{L_z} \prod_{x \in P_{[y,z]}} \mathbf (1 - \mathbf 1_{L_x}) \\
&= \mathbf 1_{L_z} + \sum_{S: S \subset P_{[y,z]}, S \neq \emptyset} (-1)^{|S|} \prod_{x \in S} \mathbf 1_{L_x} \\
&= \mathbf 1_{L_z} + \sum_{S: S \subset P_{[y,z]}, S \neq \emptyset} (-1)^{|S|} \mathbf 1_{L_{\wedge S}}
\end{aligned}

$$

となり、辺々を $f$ の重みをつけた数え上げ測度で積分することで

$$
\begin{aligned}

\sum_{x \in [y,z]}f(x) &= F(z) + \sum_{S: S\subset P_{[y,z]}, S\neq \emptyset} (-1)^{|S|} F(\wedge S) \\
&= F(z) + \sum_{x \in [\wedge P_{[y,z]}, z)} \left( \sum_{S: S\subset P_{[y,z]}, S\neq \emptyset, \wedge S = x} (-1)^{|S|} \right) F(x)

\end{aligned}
$$

が得られます。特に $y=z$ のとき

$$
f(y) = F(y) + \sum_{x \in [\wedge P_y, y)} \left( \sum_{S: S \subset P_y, S \neq \emptyset, \wedge S = x} (-1)^{|S|} \right) F(x)
$$

となり、メビウス関数に関する等式 $\mu(x,y) = \displaystyle \sum_{S: S\subset P_y, S\neq \emptyset, \wedge S = x} (-1)^{|S|} $ が得られます。固定した $y \in P$ に対して全ての $\mu(x,y)$ の値を求める計算量は、$\wedge$ の計算量が $O(1)$ のとき $O(2^{|P_y|})$ です。

一方でメビウス関数が畳み込みにおけるゼータ関数の逆元であることから

$$
\mu(x,y) = \begin{cases}

1 \quad & \text{if } x=y \\
-\displaystyle \sum_{z \in (x, y]} \mu(z, y) \quad & \text{if } x < y \\
0 \quad & \text{otherwise}

\end{cases}
$$

を用いると、固定した $y \in P$ に対して全ての $\mu(x,y)$ の値を求める計算量は一般に $O(|P|^2)$ なので、少なくとも $|P_y| = O(\log |P|)$ 程度まで小さくないと何の計算量改善にもなっていないことがわかります。ここまでで確認した包除原理、累積和の差分、および約数包除はこれを用いることで計算量が改善されていますが、そもそもそれ以外の束を全然知らないので、少なくとも競技プログラミングの文脈においては観賞用の式なのでしょう。
