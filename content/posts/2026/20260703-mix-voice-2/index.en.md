---
title: A Scientific Approach to Mixed Voice 2. TA and CT Muscles
date: 2026-07-03
category: Music
tags:
  - Singing
  - Mix Voice
draft: false
image: mix-voice-thumbnail2.webp
---

This is a port of the following article.

https://note.com/moni0627/n/n793a80a717b4

---

## Introduction

Part 2 discusses how the TA and CT muscles affect vocal frequency and quality. If you have not read Part 1, please read it first.

[A Scientific Approach to Mixed Voice 1. Anatomy and Physiology](/en/blog/2026/20260616-mix-voice-1)

This part uses mathematics at roughly the level of a first-year university course. It involves little more than ordinary differential equations and matrix calculations, so I think a high-school student who is comfortable with mathematics and physics should be able to follow it.

## 1. Mass–Spring–Damper Model

As preparation, we will briefly review the mass–spring–damper model. A spring obeys Hooke's law and exerts a force $-kx$ on the mass. A damper produces a resistive force proportional to the velocity of the mass and exerts a force $-c\dot{x}$.

![Mass–spring–damper model](mass-spring-damper-model.webp "Mass–spring–damper model (from Wikipedia)")

If the external force acting on this system is $F_\text{ext}$, its equation of motion is

$$
m \ddot{x} = -kx -c\dot{x} + F_\text{ext}.
$$

Rearranging gives the standard form

$$
\ddot{x} + 2\zeta \omega + \omega^2x = u,
$$

where

- $\omega = \sqrt{\dfrac{k}{m}}$ is the natural angular frequency in the undamped case,
- $\zeta = \dfrac{c}{2\sqrt{mk}}$ is the damping ratio, and
- $u = \dfrac{F_\text{ext}}{m}$.

In the homogeneous case $F_\text{ext}=0$, this ordinary differential equation can be solved explicitly, giving the general solution $x=x(t)$

$$
x(t) = Ae^{-\omega t \left( \zeta + \sqrt{\zeta^2 - 1} \right)} + Be^{-\omega t \left( \zeta - \sqrt{\zeta^2 - 1} \right)}.
$$

The behavior of $x(t)$ depends on how $\zeta$ compares with $1$. In the vocal-fold model, however, the effect of the damper is small enough to be treated as a perturbation—otherwise phonation could not continue—so we consider $\zeta \ll 1$. Then $\sqrt{\zeta^2-1}$ is imaginary and

$$
x(t) = Ce^{-\zeta\omega t} \cos(\sqrt{1-\zeta^2} \omega t + \phi).
$$

In particular, comparison with the unperturbed simple harmonic motion $x(t) = C \cos(\omega t + \phi)$ for $c=0$ shows that the perturbation reduces the frequency by a factor of $\sqrt{1 - \zeta^2}$ and introduces exponential decay $e^{-\zeta \omega t}$.

## 2. A Physical Model of the Vocal Folds

### 2-1. Cover–Body Model

One physical model of the vocal folds is the Cover–Body Model, proposed by Minoru Hirano in 1974. As shown below, it treats the vocal folds as two layers, the cover and body, connected by a spring, with each layer following a mass–spring–damper model.

![Cover–body model](cover-body-model.webp 'From B. Story, "An overview of the physiology, physics and modeling of the sound source for vowels"')

The equations of motion for the cover and body are

$$
\begin{aligned}
m_c\ddot{x}_c &= -r_c\dot{x}_c-k_cx_c-k_{cb}(x_c - x_b) = F_c(t) \\
m_b\ddot{x}_b &= -r_b\dot{x}_b-k_bx_b-k_{cb}(x_b - x_c) = F_b(t).
\end{aligned}
$$

Most of the notation should be self-explanatory, but $k_{cb}$ is the spring constant of the spring connecting the cover and body. Setting $x=\begin{pmatrix} x_c \\ x_b \end{pmatrix}$ and rewriting the equations using vectors and matrices gives the standard form

$$
M\ddot{x} + R\dot{x} + Kx = F(t),
$$

where

- $M=\begin{pmatrix} m_c & 0 \\ 0 & m_b \end{pmatrix}$,
- $R=\begin{pmatrix} r_c & 0 \\ 0 & r_b \end{pmatrix}$,
- $K=\begin{pmatrix} k_c + k_{cb} & -k_{cb} \\ -k_{cb} & k_b + k_{cb} \end{pmatrix}$, and
- $F(t)=\begin{pmatrix} F_c(t) \\ F_b(t) \end{pmatrix}$.

### 2-2. Natural Frequencies

As discussed above, $R$ has only a small enough effect to be regarded as a perturbation, so $R \approx 0$. In the homogeneous case $F(t)=0$, the natural frequencies are of interest as the most efficient pitches at which the system can continue oscillating without an external force. The equation of motion becomes

$$
M\ddot{x} + Kx = 0.
$$

Assuming that a Fourier transform lets us represent the motion as a superposition of waves with different angular frequencies, it is enough to ask whether each angular frequency satisfies this equation. Assume a harmonic oscillation $v(t) = v e^{i \omega t}, \, v \in \mathbb{C}^2 $ and substitute it into the equation:

$$
\begin{align*}-\omega^2Mv e^{i \omega t} +Kve^{i \omega t} &= 0 \\\therefore (K - \omega^2 M)v &= 0.\end{align*}
$$

Thus, $\omega^2$ and $v$ are respectively an eigenvalue and eigenvector of $M^{-1}K$. Setting $\lambda = \omega^2$, a nontrivial solution exists when $\det(K - \lambda M) = 0$, so

$$
\begin{align*}& \det \begin{pmatrix} k_c + k_{cb} - \lambda m_c & -k_{cb} \\ -k_{cb} & k_{b} + k_{cb} - \lambda m_b \end{pmatrix} = 0 \\\iff & \lambda^2 - (\omega_c^2 + \omega_b^2) \lambda + \omega_c^2 \omega_b^2 - \kappa^2 = 0 \\\iff & \lambda_\pm = \omega_\pm^2 = \dfrac{\omega_c^2 + \omega_b^2 \pm \sqrt{(\omega_c^2-\omega_b^2)^2 + 4 \kappa^2}}{2},\end{align*}
$$

where

- $\omega_c^2 = \dfrac{k_c + k_{cb}}{m_c}$,
- $\omega_b^2 = \dfrac{k_b + k_{cb}}{m_b}$, and
- $\kappa^2 = \dfrac{k_{cb}^2}{m_cm_b}$.

In particular, $0 < \omega_-^2 < \omega_+^2$. This means that the vocal folds produce sounds at two different pitches. Of these, $\omega_-$ corresponds to the fundamental frequency $f_0$ of the voice, multiplied by $2\pi$. We will verify this in the next subsection.

### 2-3. Eigenvectors

Let the corresponding eigenvector be $v = \begin{pmatrix} v_c \\ v_b \end{pmatrix}$. From $(K - \omega^2M)v=0$,

$$
\dfrac{v_b}{v_c} = \dfrac{k_c + k_{cb} - \omega^2m_c}{k_{cb}} = \dfrac{\omega_c^2 - \omega^2}{\kappa} \sqrt{\dfrac{m_c}{m_b}},
$$

and in particular $\dfrac{v_b}{v_c} \in \mathbb{R}$. Considering the sign of this value gives

$$
\begin{align*}\omega_c^2 - \omega_-^2 &= & \dfrac12 & \left\lbrace \sqrt{(\omega_c^2 - \omega_b^2)^2 + 4\kappa^2} + (\omega_c^2 - \omega_b^2) \right\rbrace & &> 0 \\\omega_c^2 - \omega_+ &= & - \dfrac12 &\left\lbrace \sqrt{(\omega_c^2 - \omega_b^2)^2 + 4\kappa^2} - (\omega_c^2 - \omega_b^2) \right\rbrace & &< 0. \\\end{align*}
$$

Therefore, when $\omega=\omega_-$, $v_c$ and $v_b$ are in phase: the cover and body oscillate in the same direction. When $\omega=\omega_+$, they are out of phase and oscillate in opposite directions. The frequency at which the cover and body oscillate together produces the greater amplitude, and therefore the louder sound, so it corresponds to the fundamental. Its value $f_0$ is


$$
f_0 = \dfrac{1}{2\pi}\sqrt{\dfrac{\omega_c^2 + \omega_b^2 - \sqrt{(\omega_c^2-\omega_b^2)^2 + 4 \kappa^2}}{2}}.
$$

### 2-4. Voice Quality

Define voice quality $Q \in \left(0, 1 \right]$ by

$$
Q := \dfrac{\omega_-}{\omega_+}.
$$

The following explains why this can be treated as a measure of voice quality.

Let $D = \sqrt{(\omega_c^2 - \omega_b^2)^2+4\kappa^2}$ be the discriminant of the characteristic equation. Since $\omega_+^2 = \omega_-^2+D$,

$$
Q = \dfrac{1}{\sqrt{1 + D / \omega_-^2}}.
$$

The value $\omega_-$ is the frequency of the pitch we want to sing, so it cannot be changed. Consequently, $Q$ is determined by the discriminant $D$ and decreases monotonically with $D$. The value $D$ is determined by the detuning $|\omega_c - \omega_b|$ and the cover–body coupling $\kappa^2 = \dfrac{k_{cb}^2}{m_cm_b}$. In particular, $D \ge 2\kappa$, with equality when $\omega_c = \omega_b$, giving the inequality

$$
Q \le Q_{\max} := \dfrac{1}{\sqrt{1 + 2\kappa/\omega_-^2}}.
$$

Finally, to see why less detuning improves voice quality, consider the interference between the two sounds with $\omega = \omega_\pm$:

$$
\begin{align*}& A\cos(\omega_-t) + B\cos(\omega_+t) \\ = & (A-B)\cos(\omega_-t) + B \left( \cos(\omega_-t) + \cos(\omega_+t) \right) \\= & (A-B)\cos(\omega_- t) + 2B\cos\left(\dfrac{\omega_+ - \omega_-}{2}t \right) \cos\left( \dfrac{\omega_++\omega_-}{2}t \right).\end{align*}
$$

Here $A \ge B$ because the pitch at which the cover and body move in phase sounds louder. In the second term, $\bar{\omega}=\dfrac{\omega_+ + \omega_-}{2}$ can be interpreted as the pitch, while $\Delta \omega = \dfrac{\omega_+ - \omega_-}{2}$—or more precisely, $2B\cos(\Delta \omega t)$—represents amplitude modulation. The smaller the difference between $\omega_-$ and $\omega_+$, the closer the sound is to a clean sine wave. Since $\omega_+^2 = \omega_-^2+D$, this is again achieved when the detuning $|\omega_c - \omega_b|$ is small.

Thus, $Q \in \left(0, 1 \right]$ can be interpreted as a physical measure of voice quality. More important than $Q$ itself, however, is the property that $Q$ increases as the detuning $|\omega_c - \omega_b|$ decreases.

## 3. TA and CT Muscles

After all that manipulation of equations, the physical quantities we can actually adjust during phonation are essentially limited to $k_c$ and $k_b$. These spring constants are determined by the stiffness, or strength of the restoring force, of the respective springs. Put simply:

- Contracting the TA muscle stiffens the body, increasing $k_b$.
- Contracting the CT muscle stiffens the cover, increasing $k_c$.

The correspondence between the adjusted vocal folds and the voice they produce can therefore be represented by the map $F:(k_c, k_b) \mapsto (f_0, Q)$. To review the physical quantities involved:

- $f_0 = \dfrac{1}{2\pi}\sqrt{\dfrac{\omega_c^2 + \omega_b^2 - \sqrt{(\omega_c^2-\omega_b^2)^2 + 4 \kappa^2}}{2}}$
- $Q = \dfrac{1}{\sqrt{1 + \dfrac{\sqrt{(\omega_c^2 - \omega_b^2)^2+4\kappa^2}}{(2 \pi f_0)^2}}}$
- $\omega_c = \sqrt{\dfrac{k_c + k_{cb}}{m_c}}$
- $\omega_b = \sqrt{\dfrac{k_b + k_{cb}}{m_b}}$
- $\kappa = \dfrac{k_{cb}}{\sqrt{m_cm_b}}$

A song is a function that assigns a pitch $f = f(t)$ to each time $t$. To sing well, then, is to choose a path $\gamma = \gamma(t)$ through the $(k_c, k_b)$ domain such that the first component of its image $F \circ \gamma(t)$ equals $f(t)$ and the second component is maximized, then control the contractions of the TA and CT muscles along $\gamma$.

Producing a higher voice—increasing $f_0$—means increasing at least one of $\omega_c$ and $\omega_b$. The ideal singing technique uses the TA and CT muscles in balance, raising both while maintaining $\omega_c \approx \omega_b$. Then

$$
Q \approx Q_{\max} = \dfrac{1}{\sqrt{1 + \dfrac{2\kappa}{(2 \pi f_0)^2}}} \to 1 \qquad (f_0 \to +\infty).
$$

Intuitively, compared with the cover–body coupling $\kappa$, the stiffness of each of the cover and body layers becomes dominant. As a result, the characteristic equation with two distinct natural frequencies becomes degenerate. This agrees with experience: when properly trained singers balance these muscles, their high notes resonate most strongly.

Now consider contracting only one of the muscles. If only the TA muscle contracts, the stiffened body resists the vibration of the cover, producing a constricted sound and reducing voice quality. If only the CT muscle contracts, the CT muscle oscillates rapidly while the TA muscle remains relaxed, producing a thin sound and again reducing voice quality.

In practice, voice quality also has aspects that $Q$ alone cannot measure. For example, trying to engage the CT muscle in a low chest voice causes the TA muscle to relax more than necessary, producing a weak, thin sound. It is therefore essential to maintain TA dominance, particularly at the low end of the chest register. The discussion here is a mathematical observation that, in the middle and high ranges around the passaggio, using both muscles in balance rather than relying on only one allows smoother, cleaner transitions between pitches.

## Conclusion

If you are not accustomed to mathematics, thank you especially for making it this far. Only Part 3, which discusses formants, remains. Unfortunately, it requires still more advanced mathematics. Once you have prepared yourself, take a look when you have some energy to spare.

[A Scientific Approach to Mixed Voice 3. Formant Tuning](/en/blog/2026/20260716-mix-voice-3)
