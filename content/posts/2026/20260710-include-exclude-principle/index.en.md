---
title: A Simple Proof of the Inclusion–Exclusion Principle
date: 2026-07-10
category: Mathematics
tags:
  - AtCoder
  - Competitive Programming
draft: false
---

This is a port of the following article, with the lengthy explanations for beginners omitted.

https://qiita.com/monipy/items/fe44cd8d7c172c6a1a50

## 1. The Inclusion–Exclusion Principle

### 1.1 Proof

Let $U$ be the universal set, and consider $n$ subsets $A_1, \dots, A_n \subset U$. The sets $A_i$ partition $U$ into at most $2^n$ subsets of the form $\displaystyle \left(\bigcap_{i \in I} A_i \right) \cap \left(\bigcap_{i \notin I} A_i^c \right)$, where $I \subset \lbrace1, \dots, n \rbrace$. We will consider how to find the cardinality $|(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)|$ of each such subset.

For a set $A$, define its [indicator function](https://en.wikipedia.org/wiki/Indicator_function) $\mathbf 1_A$ by

$$
\mathbf 1_A(x) = 
\begin{cases}
1 \quad & \text{if } x \in A \\
0 \quad & \text{if } x \notin A
\end{cases}
$$

Noting that $\mathbf 1_{A \cap B}(x) = \mathbf 1_A(x) \mathbf 1_B(x)$ and $\mathbf 1_{A^c}(x) = 1 - \mathbf 1_A(x)$, for any $x \in U$ we have

$$
\begin{aligned}

\mathbf 1_{(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)}(x) &= \prod_{i \in I} \mathbf 1_{A_i}(x) \prod_{i \notin I} \mathbf 1_{A_i^c}(x) \\
&= \prod_{i \in I} \mathbf 1_{A_i}(x) \prod_{i \notin I} (1 - \mathbf 1_{A_i}(x)) \\
&= \prod_{i \in I} \mathbf 1_{A_i}(x) \sum_{J: J \cap I = \emptyset} (-1)^{|J|} \prod_{j \in J} \mathbf 1_{A_j}(x) \\
&= \sum_{J: J \supset I} (-1)^{|J \setminus I|} \prod_{j \in J} \mathbf 1_{A_j}(x) \\
&= \sum_{J: J \supset I} (-1)^{|J \setminus I|} \mathbf 1_{\cap_{j \in J} A_j}(x)

\end{aligned}
$$

Summing both sides over $x \in U$ gives

$$
|(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)| = \sum_{J: J \supset I} (-1)^{|J\setminus I|} |\cap_{j \in J} A_j| \tag{$\star$}
$$

In particular, setting $I = \emptyset$ gives

$$
|\cap_{i=1}^n A_i^c| = \sum_{I} (-1)^{|I|} |\cap_{i\in I} A_i|
$$

and

$$
\begin{aligned}
|\cap_{i=1}^n A_i^c| &= |U| - |\cup_{i=1}^n A_i| \\
\sum_{I} (-1)^{|I|} |\cap_{i\in I} A_i| &= |U| + \sum_{I \neq \emptyset} (-1)^{|I|} |\cap_{i \in I} A_i|.
\end{aligned}
$$

Eliminating $|U|$ yields the familiar inclusion–exclusion formula that expresses a union in terms of intersections:

$$
|\cup_{i=1}^n A_i| = \sum_{I \neq \emptyset} (-1)^{|I| - 1} |\cap_{i \in I} A_i|.
$$

However, this formula follows secondarily from the fact that a union can be expressed as the complement of an intersection of complements. As the discussion below will also show, the essence of the inclusion–exclusion principle is the equation $(\star)$.

Now write the left-hand side of $(\star)$ as $f(I) = |(\cap_{i \in I} A_i) \cap (\cap_{i \notin I} A_i^c)|$. Then

$$
|\cap_{i \in I} A_i| = \sum_{J: J \supset I} f(J) =: F(I),
$$

and $(\star)$ can be written as

$$
f(I) = \sum_{J: J \supset I} (-1)^{|J \setminus I|} F(J).
$$

In other words, the inclusion–exclusion principle can be interpreted as expressing each $f(I)$ in terms of its upper cumulative sum $F(I) = \displaystyle \sum_{J: J \supset I} f(J)$. As we will see in the example below, even when $f(I)$ is difficult to compute directly, its cumulative sum $F(I)$ may be easy to obtain. In that situation, inclusion–exclusion is one way to recover the original $f(I)$ from the cumulative sums.

We used upper cumulative sums above, but the analogous formula for lower cumulative sums can be derived in the same way:

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

In particular, setting $I = \lbrace 1, \dots, n \rbrace$ gives

$$
|\cap_{i = 1}^n A_i| = \sum_{I \neq \emptyset} (-1)^{|I| - 1} |\cup_{i \in I} A_i|,
$$

an inclusion–exclusion formula of rather unclear practical value that expresses an intersection in terms of unions.

### 1.2 Example

[ABC423-F Loud Cicada](https://atcoder.jp/contests/abc423/tasks/abc423_f)

The universal set is $U = \lbrace 1, \dots, Y \rbrace$, and the $N$ sets $A_i \subset U$ are, with a slight abuse of notation, $A_i = \lbrace x \in U : x \text{ is a multiple of } A_i \rbrace$. Using the function $f$ defined above, the value we seek is $s = \displaystyle \sum_{I: |I| = M} f(I)$.

Computing each $f(I)$ is difficult, but its cumulative sum is easy to find:

$$
F(I) = |\cap_{i \in I} A_i| = |\lbrace x \in U : \text{$x$ is a multiple of $ \displaystyle \operatorname*{LCM}_{i \in I}(A_i)$} \rbrace| = \left\lfloor \dfrac{Y}{\operatorname*{LCM}_{i \in I}(A_i)} \right\rfloor.
$$

If we use $(\star)$ to compute $f(I)$ for every $I$ such that $|I| = M$, the number of computations is $\displaystyle O\left(\binom{N}{M}2^{N-M} \right)$. This is already fast enough to receive AC in a fast language (I succeeded in C++, but not in Python). Taking the calculation a step further, however, gives

$$
\begin{aligned}
s &= \sum_{I: |I| = M} \sum_{J: J \supset I} (-1)^{|J| - M} F(J) \\
&= \sum_{J: |J| \ge M} (-1)^{|J| - M} F(J) \sum_{I: I \subset J, |I| = M}1 \\
&= \sum_{J: |J| \ge M} (-1)^{|J| - M} \binom{|J|}{M} F(J),
\end{aligned}
$$

reducing the number of terms in the sum to at most $O(2^N)$.

#### Sample Code (Inclusion–Exclusion)

It is acceptable to compute $\operatorname*{LCM}_{i \in I}(A_i)$ from scratch for each $I$, but the following code uses dynamic programming to improve the time complexity and reduce the amount of code.

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

#### Sample Code (Möbius Transform)

Instead of using inclusion–exclusion, we can also use the Möbius transform to find $f(I)$ for every $I$, then sum the values for which $|I| = M$.

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

## 2. Divisor Inclusion–Exclusion

### 2.1 The Möbius Inversion Formula

Let $\mathbb N$ denote the set of positive integers, and let $\mathbb N_0 = \mathbb N \cup \lbrace 0 \rbrace$. Consider the partially ordered set obtained by defining the order on $\mathbb N$ as $m \le n \overset{\mathrm{def}}{\iff} m \mid n$. This poset is isomorphic to $\ell_c := \lbrace (e_1, e_2, \dots) \in \mathbb N_0^{\mathbb N} : \exists i_0, \forall i \ge i_0, \, e_i = 0 \rbrace$, ordered by $e \le f \overset{\mathrm{def}}{\iff} \forall i \in \mathbb N, \, e_i \le f_i$. Prime factorization gives the correspondence $n = \displaystyle \prod_{i \in \mathbb N} p_i^{e_i} \in \mathbb N \leftrightarrow (e_i)_{i \in \mathbb N} \in \ell_c$.

Consider a function $f(n)$ on $\mathbb N$. For $n \in \mathbb N$ and a prime $p$, let $\operatorname*{ord}_p(n)$ be the multiplicity of the prime factor $p$ in $n$, and write $I_n = \lbrace i \in \mathbb N : p_i \mid n \rbrace$ (a finite set). Using the lower set $L_n := \lbrace d \in \mathbb N : d \mid n \rbrace$, we obtain the following identity of indicator functions:

$$
\begin{aligned}

\mathbf 1_{\lbrace n \rbrace}(x) &= \prod_{i \in \mathbb N} \mathbf 1_{\operatorname*{ord}_{p_i}(x) = e_i} \\
&= \prod_{i \notin I_n} \mathbf 1_{\operatorname*{ord}_{p_i}(x) = 0} \prod_{i \in I_n} (\mathbf 1_{\operatorname*{ord}_{p_i}(x) \le e_i} - \mathbf 1_{\operatorname*{ord}_{p_i}(x) \le e_i-1} ) \\
&= \sum_{I \subset I_n} (-1)^{|I|} \mathbf 1_{L_{n/\prod_{i \in I} p_i}}(x).

\end{aligned}
$$

Multiplying both sides by $f$ and summing over $x \in \mathbb N$—or, equivalently, integrating with respect to the counting measure on $\mathbb N$ weighted by $f$—gives

$$
f(n) = \sum_{I: I \subset I_n} (-1)^{|I|}F\left(\frac{n}{\prod_{i \in I} p_i}\right). \tag{$\star\star$}
$$

To see that this is the [Möbius inversion formula](https://en.wikipedia.org/wiki/M%C3%B6bius_inversion_formula), note from the definition of the [Möbius function](https://en.wikipedia.org/wiki/M%C3%B6bius_function) $\mu$ that the right-hand side of $(\star\star)$ equals the right-hand side of

$$
f(n) = \sum_{d \mid n} \mu \left(\dfrac{n}{d} \right) F(d) = \sum_{d \mid n} \mu(d) F\left( \frac{n}{d} \right).
$$

### 2.2 Example

[ABC304-F Shift Table](https://atcoder.jp/contests/abc304/tasks/abc304_f)

We are given a string $S$ of length $N$ consisting of `#` and `.`, and must count the strings $T$, also of length $N$ and consisting of `#` and `.`, whose minimum period $C(T)$ is less than $N$ and for which `S[i] == '.'` implies `T[i] == '#'`. If the desired count is $s$, then

$$
\begin{aligned}
s &= \sum_{d \mid N, d \neq N} \sum_{T: C(T) = d} \mathbf 1_{\forall i, \, \text{S[i] == '.'} \implies \text{T[i] == '\#'}} \\
&=: \sum_{d \mid N, d \neq N} f(d).
\end{aligned}
$$

The condition that the minimum period is $d$ is difficult to work with. By contrast, the condition that $d$ is a period—that the minimum period divides $d$—can be written simply as `T[0:d] == T[d:2d] == ... == T[N-d:N]`. Thus, here too, $F(d)$ is easier to compute than $f(d)$. Specifically,

$$
F(d) = 2^{| \lbrace 1 \le i \le d : \forall j \equiv i \mod d, \, \text{S[j] == '\#'} \rbrace|}.
$$

We can therefore find $s$ by using this expression to compute $f(d)$. Since $s = F(N) - f(N)$ and only one value of $f$ is needed, either the Möbius inversion formula or differencing the cumulative sums (computing $f(d)$ for every $d \mid N$) will work.

#### Sample Code (Enumerating Divisors and Prime Factors)

Whether we use Möbius inversion or cumulative-sum differencing, we need to enumerate not only the divisors of $N$, but also its prime factors. We could enumerate both using trial division in $O(\sqrt N)$, but the following code reconstructs the divisors from the prime factors after enumerating them. There are several reasons for writing it this way:

1. When enumerating prime factors and divisors simultaneously, it feels unnatural for each $i = 2, \dots, \lfloor \sqrt N\rfloor$ inside the loop to serve both as a possible divisor of $N$ and as a possible prime factor of $N$.
2. When $N$ is composite, the loop usually terminates in fewer than $\lfloor \sqrt N\rfloor$ iterations.
3. The ordering of the `divisors` array is convenient.

Regarding point 3, if $\displaystyle N = \prod_{i=1}^k p_i^{e_i}$, the divisor array $D$ is the flattened, in-order representation of the $k$-dimensional array $\displaystyle\left(\prod_{i=1}^k p_i^{f_i}\right)_{0 \le f_1 \le e_1, \dots, 0 \le f_k \le e_k}$ of size $(e_1 + 1) \times \dots \times (e_k + 1)$. The array $D$ is not sorted by the usual numerical order, but it preserves the divisibility order—$D_i \mid D_j \implies i \le j$—and is therefore topologically sorted in the [Hasse diagram](https://en.wikipedia.org/wiki/Hasse_diagram). As a result, its ordering causes no problems when taking differences of cumulative sums. The ordering can also be exploited; for example, with zero-based indexing, $D_i \mid D_j \implies \dfrac{D_j}{D_i} = D_{j-i}$. (Of course, the array can simply be sorted if needed, since its size is not especially large.)

```python
primes = []
divisors = [1]
p = 2
M = N
while p * p <= M:
    if M % p == 0:
        primes.append(p)  # Alternatively: primes.append((len(divisors), p))
        l = len(divisors)
        while M % p == 0:
            divisors += [d * p for d in divisors[-l:]]
            M //= p
    p += 1
if M > 1:
    primes.append(M)  # Likewise: primes.append((len(divisors), M))
    divisors += [d * M for d in divisors]
```

#### Sample Code (Divisor Inclusion–Exclusion)

Rather than using the general Möbius inversion formula, we use $(\star\star)$. If $\omega(N)$ denotes the number of distinct prime factors of $N$, the sum on the right-hand side of $(\star\star)$ has $2^{\omega(N)}$ terms—the number of divisors for which the Möbius function is nonzero—so we iterate over only those terms. Similarly, because $F(d)$ is not needed for every $d \mid N$, computing only the required values reduces the time complexity to $O(2^{\omega(N)}N)$.

The code below uses the identity $s = -\displaystyle \sum_{I \subset I_n, I \neq \emptyset} (-1)^{|I|} F\left(\dfrac{N}{\prod_{i \in I}p_i}\right)$.

```python
MOD = 119 << 23 | 1

N = int(input())
S = input()

divisors = [1]  # Enumerate only divisors of N for which the Möbius function is nonzero
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

#### Sample Code (Dynamic Programming Solution)

Above, we compute $F \left(\dfrac{N}{d} \right)$ naively for each required $d \mid N$, but as in the inclusion–exclusion example, these values can also be found by dynamic programming. The following code does so, although I feel that its operation is less transparent in the divisor inclusion–exclusion setting. Here, `F` is an array of length $2^{\omega(N)}$, and for $I \in 2^{I_n} \simeq [0, 2^{\omega(N)})$, `F[I]` equals $F \left(\dfrac{N}{\prod_{i \in I} p_i} \right)$.

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

The complexity analysis is somewhat difficult, and I am not entirely confident in it. The dynamic-programming portion appears to perform approximately $\displaystyle N \sum_{i=1}^{\omega(N)} \prod_{j < i} \left(1 + \dfrac{1}{p_j} \right)$ computations. Using the [prime number theorem](https://en.wikipedia.org/wiki/Prime_number_theorem),

$$
\begin{aligned}

\sum_{i=1}^{\omega(N)} \prod_{j < i} \left(1 + \dfrac{1}{p_j} \right) & \sim \sum_{i=1}^{\omega(N)} \prod_{j < i} \exp \left( \dfrac{1}{p_j} \right) \\
&= \sum_{i=1}^{\omega(N)} \exp \left( \sum_{j < i} \dfrac{1}{p_j} \right) \\
& \sim \sum_{i=1}^{\omega(N)} \exp( \log (\log (p_i))) \\
&= \sum_{i=1}^{\omega(N)} \log(p_i) \\
& \sim \sum_{i=1}^{\omega(N)} \log(i \log (i)) \\
& \sim \sum_{i=1}^{\omega(N)} \log(i) \\
& \sim \omega(N) \log(\omega(N)).

\end{aligned}
$$

Thus, the complexity appears to be $O(N \omega(N) \log (\omega(N)))$. The code performs the dynamic programming in ascending order of the primes $p$, but reversing that order should reduce the complexity to $O(N \omega(N))$. This follows because $\log (\log (p_i))$ in the calculation becomes $\log(\log(p_{\omega(N)})) - \log(\log(p_{\omega(N) - i}))$, together with $\displaystyle \sum_{i=1}^{n} \dfrac{1}{\log (i)} \sim \dfrac{n}{\log (n)}$. In fact, this implementation was the fastest among my own submissions ([example](https://atcoder.jp/contests/abc304/submissions/77328005)), and a [submission](https://atcoder.jp/contests/abc304/submissions/77291369) produced by having Gemini translate it into C++ earned the fastest time.

#### Sample Code (Möbius Transform)

We could store `f` in an associative array and difference the cumulative sums, but the following code keeps it as an array by taking advantage of the ordering of `divisors`. If $\sigma_0(N)$ denotes the number of divisors of $N$, the time complexity is $O(N \sigma_0 (N))$. Since $2^{\omega(N)} \le \sigma_0 (N)$, divisor inclusion–exclusion wins on time complexity for this example.

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

## 3. Generalization

I also considered extending the preceding discussion to a general partially ordered set $P$, although it is unclear how useful the resulting conclusion is. A poset structure alone is insufficient for the following argument; $P$ must be given the structure of a [lattice](https://en.wikipedia.org/wiki/Lattice_(order)). Even then, this does not achieve the same generality as an incidence algebra.

So far, we have expressed $f(x)$ in terms of its cumulative sum $F(x)$. We will now go further and express the interval sum $\displaystyle \sum_{x \in [y,z]} f(x)$ in terms of $F(x)$. For an interval $[y, z] \subset P$, define the set of all its predecessors by

$$
P_{[y,z]} = \lbrace x \in P \setminus [y,z) : x < z, \, (x,z) \subset [y,z) \rbrace.
$$

In particular, when $y=z$, this becomes $P_y := P_{[y,y]} = \lbrace x \in P : x < y , \, (x, y) = \emptyset \rbrace$, making the meaning of “predecessor” intuitive; $P_{[y,z]}$ extends this notion to intervals. When $P$ is locally finite,

$$
[y, z] = \displaystyle L_z \setminus \bigcup_{x \in P_{[y,z]}} L_x.
$$

<details><summary>Proof</summary>

For $\subset$, it is clear that $[y,z] \subset L_z$. If $\exists x \in P_{[y,z]}, \, \exists w \in [y,z], \, w \in L_x$, then $y \le w \le x < z$, so $x \in [y, z)$, contradicting $x \in P_{[y,z]}$. Hence $\forall x \in P_{[y,z]}, \, [y,z] \cap L_x = \emptyset$, proving the inclusion.

Suppose, toward a contradiction, that the right-hand side is strictly larger. Then $\exists w \notin [y,z], \, w < z, \, \forall x \in P_{[y,z]}, \, w \notin L_x$. We show by contradiction that $\exists u \in [w,z)\cap[y,z)^c, \, u \in P_{[y,z]}$. If this were false, then

$$
\forall u \in [w, z) \cap [y, z)^c, \, \exists u' \in (u, z) \cap [y,z)^c \subset [w,z) \cap [y,z)^c.
$$

Repeating this process would construct an ascending chain $w < u_1 < u_2 < \dots < u_n < z$ of arbitrary length, contradicting the finiteness of $[w,z]$ implied by the local finiteness of $P$. Therefore $\exists u \in [w,z)\cap[y,z)^c, \, u \in P_{[y,z]}$, and in particular $w \in L_u$. This contradicts the original assumption that $\forall x \in P_{[y,z]}, \, w \notin L_x$.

</details>

Now give $P$ a lattice structure and apply the indicator-function argument to the equality above:

$$
\begin{aligned}
\mathbf 1_{[y,z]} &= \mathbf 1_{L_z} \prod_{x \in P_{[y,z]}} (1 - \mathbf 1_{L_x}) \\
&= \mathbf 1_{L_z} + \sum_{S: S \subset P_{[y,z]}, S \neq \emptyset} (-1)^{|S|} \prod_{x \in S} \mathbf 1_{L_x} \\
&= \mathbf 1_{L_z} + \sum_{S: S \subset P_{[y,z]}, S \neq \emptyset} (-1)^{|S|} \mathbf 1_{L_{\wedge S}}.
\end{aligned}

$$

Integrating both sides with respect to the counting measure weighted by $f$ gives

$$
\begin{aligned}

\sum_{x \in [y,z]}f(x) &= F(z) + \sum_{S: S\subset P_{[y,z]}, S\neq \emptyset} (-1)^{|S|} F(\wedge S) \\
&= F(z) + \sum_{x \in [\wedge P_{[y,z]}, z)} \left( \sum_{S: S\subset P_{[y,z]}, S\neq \emptyset, \wedge S = x} (-1)^{|S|} \right) F(x).

\end{aligned}
$$

In particular, when $y=z$,

$$
f(y) = F(y) + \sum_{x \in [\wedge P_y, y)} \left( \sum_{S: S \subset P_y, S \neq \emptyset, \wedge S = x} (-1)^{|S|} \right) F(x),
$$

which gives the identity $\mu(x,y) = \displaystyle \sum_{S: S\subset P_y, S\neq \emptyset, \wedge S = x} (-1)^{|S|}$ for the Möbius function. For a fixed $y \in P$, if the meet operation $\wedge$ takes $O(1)$ time, all values of $\mu(x,y)$ can be found in $O(2^{|P_y|})$ time.

On the other hand, because the Möbius function is the inverse of the zeta function under convolution, we can use

$$
\mu(x,y) = \begin{cases}

1 \quad & \text{if } x=y \\
-\displaystyle \sum_{z \in (x, y]} \mu(z, y) \quad & \text{if } x < y \\
0 \quad & \text{otherwise}

\end{cases}
$$

to find all values of $\mu(x,y)$ for a fixed $y \in P$ in $O(|P|^2)$ time in general. Thus, unless $|P_y|$ is at most about $O(\log |P|)$, this approach does not improve the time complexity at all. The inclusion–exclusion principle, cumulative-sum differencing, and divisor inclusion–exclusion examined above do improve the complexity when expressed this way. However, since I know hardly any lattices other than these, the formula is probably best regarded as something ornamental, at least in the context of competitive programming.
