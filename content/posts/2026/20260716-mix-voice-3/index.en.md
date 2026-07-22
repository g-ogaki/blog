---
title: A Scientific Approach to Mixed Voice 3. Formant Tuning
date: 2026-07-16
category: Music
tags:
  - Singing
  - Mix Voice
draft: false
image: mix-voice-thumbnail3.webp
---

This is a port of the following article.

https://note.com/moni0627/n/na759440c793a

---

## Introduction

In this final part, we will interpret mathematically how formants and vocal frequency affect ease of singing, and how changes in the vocal tract alter the formants. This part is independent of Part 2, but if you have not read Part 1, please read it first.

[A Scientific Approach to Mixed Voice 1. Anatomy and Physiology](/en/blog/2026/20260616-mix-voice-1)

This part uses mathematics and physics at roughly the level of a second- or third-year university course. It involves partial differential equations, perturbation theory, and a concept equivalent to impedance in AC circuits, so please look them up as needed if they are unfamiliar.

## 1. The Wave Equation

### 1-1. Derivation

As I mentioned in the introduction to Part 1, I do not understand the physical laws underlying the derivation of the following wave equation very well. It apparently follows from conservation of mass and conservation of momentum, but the LLM's explanation involved topics such as adiabatic processes and went beyond my understanding. As a mathematician, I tend to begin by blindly trusting that an equation is correct, so I am prone to neglecting the physical laws behind it.

As the simplest physical model, treat the vocal tract as a one-dimensional tube with a uniform cross-sectional area. Part 2 also explained that the effect of damping is small enough to be treated as a perturbation. Here too, we assume that energy is conserved without loss and model the vocal tract as a lossless, uniform tube. In the coordinate system from Part 1, the tube extends along the $${z}$$-axis, but in this part we will use $${x}$$ rather than $${z}$$ for displacement. Define the physical quantities used below as follows:

- $${p(x, t)}$$: acoustic pressure, meaning the difference from atmospheric pressure (Pa)
- $${u(x, t)}$$: average particle velocity of the air in the vocal tract (m/s)
- $${A}$$: cross-sectional area of the vocal tract (m²)
- $${U(x, t) = Au(x,t)}$$: volume velocity of the air in the vocal tract (m³/s)
- $${\rho}$$: density of air (kg/m³)
- $${c}$$: speed of sound in air (m/s)

Considering conservation of mass over an infinitesimal change $${\Delta x}$$ apparently gives

$$
\dfrac{\partial u}{\partial x} + \dfrac{1}{\rho c^2} \dfrac{\partial p}{\partial t} = 0. \tag{1}
$$

Conservation of momentum similarly gives the linearized Euler equation

$$
\dfrac{\partial p}{\partial x} + \rho \dfrac{\partial u}{\partial t} = 0. \tag{2}
$$

Differentiating (1) with respect to $${t}$$ and (2) with respect to $${x}$$, then eliminating $${u}$$, gives the partial differential equation for $${p}$$

$$
\dfrac{\partial^2 p}{\partial x^2} - \dfrac{1}{c^2}\dfrac{\partial^2 p}{\partial t^2} = 0. \tag{3}
$$

These equations are the starting point for everything that follows.

### 1-2. Acoustic Impedance

Equations (1), (2), and (3) from the preceding subsection are all linear in $${p}$$ and $${u}$$. Therefore, if complex-valued functions $${\tilde{p}, \tilde{u}}$$ satisfying

$$
\begin{align*}p(x, t) &= \text{Re} \left[ \tilde{p}(x, t) \right] \\u(x, t) &= \text{Re} \left[ \tilde{u}(x, t) \right] \end{align*}
$$

solve the wave equation, then $${p, u}$$ are also solutions. This extends the wave equation to complex values. We then define the acoustic impedance $${Z=Z(x, t)}$$ by

$$
Z = \dfrac{\tilde{p}(x, t)}{\tilde{U}(x, t)} = \dfrac{\tilde{p}(x, t)}{A \tilde{u}(x, t)}.
$$

Impedance is complex-valued. Its magnitude $${|Z| \ge 0}$$ represents “resistance,” while its argument $${\arg(Z) \in \left(-\pi, \pi \right]}$$ represents the phase difference between pressure and airflow. As discussed in Part 1, the ideal phase relationship has pressure leading the air, particularly with $${\arg(Z) \approx \dfrac{\pi}{2}}$$. We will now consider when this condition is satisfied.

As we will also verify later, resistance is zero in the lossless case. Writing $${Z = R + iX}$$, $${R=0}$$ means that the argument of $${Z}$$ depends only on the sign of the reactance $${X}$$, so $${\arg(Z) = \pm \dfrac{\pi}{2}}$$. In reality, however, friction with the throat, air resistance, and other effects dissipate energy, so $${R>0}$$ and therefore $${\arg(Z) \in \left(-\dfrac{\pi}{2}, \dfrac{\pi}{2} \right)}$$. Note that $${\arg(Z) \approx \dfrac{\pi}{2}}$$ is achieved by making the reactance $${X}$$ approach $${+\infty}$$.

## 2. Formants

### 2-1. Deriving the Formants

Part 1 described formants as the frequencies that resonate in the vocal tract and are determined solely by its shape. Mathematically, they are frequencies that solve the boundary-value problem for the wave equation below even without an external force.

As in Part 2, assume harmonic oscillations $${\tilde{p}(x, t) = P(x)e^{i \omega t}}$$ and $${\tilde{u}(x, t) = \dfrac{U(x)}{A}e^{i \omega t}}$$. This notation is somewhat improper mathematically, but $${U(x)}$$ and $${U(x, t)}$$ are different functions. Let the length of the vocal tract be $${L}$$, and introduce coordinates with the glottis at the origin $${x=0}$$ and the lips at the endpoint $${x=L}$$. The boundary conditions are

- no external force and a closed glottis, together with (2), $${\implies \left. \dfrac{\partial p}{\partial x} \right|_{x=0} = 0}$$; and
- release into the atmosphere at the lips $${\implies p(L, t) = 0}$$.

This gives the boundary-value problem

$$
\begin{cases}\dfrac{\partial^2 p}{\partial x^2} - \dfrac{1}{c^2} \dfrac{\partial^2 p}{\partial t^2} = 0 \\\left. \dfrac{\partial p}{\partial x} \right|_{x=0} = 0, \quad p(L, t)=0.\end{cases}
$$

Substituting $${\tilde{p}(x, t) = P(x)e^{i \omega t}}$$ gives the boundary-value problem for the ordinary differential equation in $${P(x)}$$

$$
\begin{cases}P'' + k^2P = 0 \\P'(0) = 0, \quad P(L)=0,\end{cases}
$$

where $${k = \dfrac{\omega}{c}}$$ is the wavenumber. The general solution is $${P(x) = B \cos(kx) + C \sin(kx)}$$. The boundary conditions imply $${C=0}$$ and $${kL = \left( n - \dfrac{1}{2}\right)\pi, \quad n = 1, 2, 3, \dots}$$. Thus, the angular frequencies and solutions are

$$
\begin{align*}\omega &= \omega_n = \dfrac{(2n - 1) c\pi}{2L} & & \\P(x) &= P_n(x) = \cos\left(k_nx \right), & & \quad k_n = \dfrac{\omega_n}{c},\end{align*}
$$

and the formants $${F_n}$$ are

$$
F_n = \dfrac{\omega_n}{2\pi} = \dfrac{(2n - 1)c}{4L}. \tag{4}
$$

### 2-2. Deriving the Acoustic Impedance

The frequencies above resonate in the vocal tract without any external force. During actual phonation, however, the lungs supply air and create an external force at $${x=0}$$, allowing us to produce a voice at any pitch. In this case, we must reconsider the boundary condition $${\left. \dfrac{\partial p}{\partial x} \right|_{x=0} = 0}$$.

At $${x=0}$$, the external force acting on the air is proportional to $${\dfrac{\partial u}{\partial t}}$$. If $${U(0) = U_g \neq 0}$$ in $${\tilde{u}(x, t) = \dfrac{U(x)}{A}e^{i \omega t}}$$, then together with (2), the boundary condition becomes

$$
\left. \dfrac{\partial p}{\partial x} \right|_{x=0} = - \rho \left. \dfrac{\partial u}{\partial t} \right|_{x=0} = -\dfrac{i \rho \omega U_g}{A} e^{i\omega t}.
$$

This gives the boundary-value problem for $${P}$$

$$
\begin{cases}P'' + k^2P = 0 \\P'(0) = -\dfrac{i \rho \omega U_g}{A}, \quad P(L)=0.\end{cases}
$$

We now solve it.

The general solution is again $${P(x) = B \cos(kx) + C\sin(kx)}$$, and $${P(L)=0}$$ gives $${B \cos(kL) + C\sin(kL) = 0}$$. Suppose the angular frequency $${\omega}$$ equals one of the formant angular frequencies $${\omega_n}$$. Then $${\cos(kL) = 0}$$ implies $${C = 0}$$, which cannot satisfy the boundary condition on $${P'(0)}$$ because $${U_g \neq 0}$$. Therefore, $${\omega \neq \omega_n \implies \cos(kL) \neq 0}$$, and

$$
B = - C\tan(kL).
$$

Substituting this into the general solution gives

$$
P(x) = -C \left( \dfrac{\sin(kL)\cos(kx))}{\cos(kL)} - \sin(kx) \right) = -C \dfrac{\sin(k(L - x))}{\cos(kL)}.
$$

Differentiating gives $${P'(x) = kC \dfrac{\cos(k(L-x))}{\cos(kL)}}$$. The boundary condition on $${P'(0)}$$ then yields

$$
kC = -\dfrac{i \rho \omega U_g}{A} \implies C = -\dfrac{i \rho c U_g}{A},
$$

so the solution to the boundary-value problem is

$$
P(x) = \dfrac{i \rho c U_g}{A} \dfrac{\sin(k(L-x))}{\cos(kL)}.
$$

Now consider the impedance. Under the assumed harmonic solution,

$$
Z = \dfrac{\tilde{p}(x, t)}{A \tilde{u}(x, t)} = \dfrac{P(x)}{U(x)},
$$

which is independent of time $${t}$$. Substituting the harmonic solution into (2) gives

$$
\dfrac{\partial p}{\partial x} + \rho \dfrac{\partial u}{\partial t} = P'(x)e^{i\omega t} + \rho \dfrac{U(x)}{A} \cdot i \omega e^{i \omega t} =0,
$$

and hence $${U(x) = - \dfrac{A}{i \rho\omega} P'(x)}$$. Therefore,

$$
Z = -\dfrac{i \rho \omega}{A} \dfrac{P(x)}{P'(x)}.
$$

Finally, substituting $${P(x) \propto \sin(k(L - x))}$$ gives

$$
Z = -\dfrac{i \rho \omega}{A} \dfrac{\sin(k(L-x))}{-k \cos(k(L - x))} = i \dfrac{\rho c}{A} \tan(k(L-x)),
$$

and in particular, the impedance at the glottis $${x=0}$$ is

$$
Z_\text{in} = i \dfrac{\rho c}{A} \tan(kL).
$$

The impedance diverges when $${\omega = \omega_n}$$, at a formant angular frequency, and changes sign on either side. The calculation above shows that maximizing the reactance $${X}$$ means keeping the angular frequency $${\omega}$$ of the sung pitch slightly below the formant angular frequency $${\omega_n}$$.

## 3. Formant Tuning

### 3-1. Webster's Horn Equation

Equation (4) makes the formants appear to depend only on the length $${L}$$ of the vocal tract. In actual formant tuning, however, other factors matter, such as raising or lowering the jaw to adjust the size of the mouth. These factors do not appear in (4) because the “uniform” assumption made in 1-1—that the cross-sectional area is constant—is unrealistic. We must therefore treat the cross-sectional area $${A}$$ as a function $${A(x)}$$.

This leads to Webster's horn equation. When the cross-sectional area is not uniform, equation (1), derived from conservation of mass, becomes

$$
\dfrac{1}{A}\dfrac{\partial (Au)}{\partial x} + \dfrac{1}{\rho c^2} \dfrac{\partial p}{\partial t} = 0. \tag{5}
$$

Equation (2), derived from conservation of momentum, remains valid. Differentiating (5) with respect to $${t}$$—noting that $${A}$$ does not depend on $${t}$$—and then using (2) to eliminate $${u}$$ gives Webster's horn equation

$$
\dfrac{1}{A} \dfrac{\partial}{\partial x} \left( A \dfrac{\partial p}{\partial x}\right) - \dfrac{1}{c^2} \dfrac{\partial^2 p}{\partial t^2} = 0. \tag{6}
$$

Assuming a harmonic solution $${p(x, t) = P(x) e^{i\omega t}}$$ gives the ordinary differential equation for $${P}$$

$$
\dfrac{d}{dx} \left( A(x)\dfrac{dP}{dx} \right) + \dfrac{\omega^2}{c^2}A(x)P= 0. \tag{7}
$$

We will use this equation with the boundary conditions

$$
P'(0) = 0, \quad P(L)=0
$$

to determine how changes in $${A(x)}$$ affect the formants.

### 3-2. Perturbation Theory

Webster's horn equation cannot be solved explicitly for a general $${A(x)}$$. We therefore treat the uniform equation (3), with $${A(x) = A_0}$$, as the unperturbed case. A nonuniform tube $${A(x)}$$ is viewed as the uniform tube $${A_0}$$ with a perturbation $${\delta A(x)}$$, and we use (7) to determine how that perturbation affects the formants.

Let $${0 < \varepsilon \ll1}$$ control the magnitude of the perturbation, and write $${A(x)}$$ as

$$
A(x) = A_0 + \varepsilon \delta A(x).
$$

Similarly, expand $${\omega_n}$$ and $${P_n(x)}$$ as perturbations of their unperturbed solutions:

$$
\begin{align*}\omega_n &= \omega_n^{(0)} + \varepsilon \omega_n^{(1)} + O(\varepsilon^2), & \quad & \omega_n^{(0)} = ck_n^{(0)} = \dfrac{(2n - 1)c \pi}{2L} \\P_n(x) &= P_n^{(0)}(x) + \varepsilon P_n^{(1)}(x) + O(\varepsilon^2), & \quad & P_n^{(0)}(x) = \cos(k_n^{(0)}x).\end{align*}
$$

Substitute these into (7) and consider the coefficient of $${\varepsilon^1}$$. For completeness, the coefficient of $${\varepsilon^0}$$ agrees with the unperturbed equation:

$$
\dfrac{d^2P_n^{(0)}}{dx^2} + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 P_n^{(0)} = 0.
$$

We have already seen this boundary-value problem.

The coefficient of $${\varepsilon^1}$$ in (7) gives

$$
\begin{aligned}
& \dfrac{d}{dx} \left( \delta A(x) \dfrac{dP_n^{(0)}}{dx} \right) + A_0 \dfrac{d^2 P_n^{(1)}}{dx^2} \\
& \quad + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 A_0P_n^{(1)} + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \delta A(x) P_n^{(0)} + \dfrac{2\omega_n^{(0)} \omega_n^{(1)}}{c^2} A_0P_n^{(0)} =0.
\end{aligned}
$$

Multiply both sides by $${P_n^{(0)}}$$ and integrate over $${\left[0, L\right]}$$. Of the five terms above, the two containing $${P_n^{(1)}}$$ cancel. To verify this,

$$
\begin{align*}& \int_0^L P_n^{(0)} \dfrac{d^2 P_n^{(1)}}{dx^2} dx \\=& \left[ P_n^{(0)} \dfrac{dP_n^{(1)}}{dx} \right]_{x=0}^{x=L} - \int_0^L \dfrac{dP_n^{(0)}}{dx} \dfrac{dP_n^{(1)}}{dx} dx \\=& - \int_0^L \dfrac{dP_n^{(0)}}{dx} \dfrac{dP_n^{(1)}}{dx} dx \quad \left( \because \begin{cases} \left. \dfrac{dP_n}{dx} \right|_{x=0} = 0 &\implies \left. \dfrac{dP_n^{(m)}}{dx} \right|_{x=0} = 0 \\ P_n(L) = 0 &\implies P_n^{(m)}(L)=0 \end{cases} \right) \\=& - \left[ \dfrac{dP_n^{(0)}}{dx} P_n^{(1)} \right]_{x=0}^{x=L} + \int_0^L \dfrac{d^2 P_n^{(0)}}{dx^2} P_n^{(1)} dx \\=& - \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \int_0^L P_n^{(0)} P_n^{(1)} dx \quad \left( \because \dfrac{d^2P_n^{(0)}}{dx^2} + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 P_n^{(0)} = 0 \right).\end{align*}
$$

The remaining three terms therefore give

$$
\begin{aligned}
& \int_0^L P_n^{(0)} \dfrac{d}{dx} \left( \delta A(x) \dfrac{dP_n^{(0)}}{dx} \right) dx \\
& \quad + \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \int_0^L \delta A(x) \left\lbrace P_n^{(0)}\right\rbrace^2dx + \dfrac{2\omega_n^{(0)} \omega_n^{(1)}}{c^2} A_0 \int_0^L \left\lbrace P_n^{(0)}\right\rbrace^2 dx = 0.
\end{aligned}
$$

Integrating the first term by parts yields

$$
\begin{align*}& \int_0^L P_n^{(0)} \dfrac{d}{dx} \left( \delta A(x) \dfrac{dP_n^{(0)}}{dx} \right) dx \\= & \left[ P_n^{(0)} \delta A(x) \dfrac{dP_n^{(0)}}{dx} \right]_{x=0}^{x=L} - \int_0^L \delta A(x) \left( \dfrac{dP_n^{(0)}}{dx} \right)^2dx \\= & - \int_0^L \delta A(x) \left( \dfrac{dP_n^{(0)}}{dx} \right)^2dx.\end{align*}
$$

Substituting this and solving for $${\omega_n^{(1)}}$$ gives

$$
\omega_n^{(1)} = \dfrac{c^2}{2\omega_n^{(0)}A_0} \dfrac{\displaystyle \int_0^L \delta A(x) \left[ \left( \dfrac{dP_n^{(0)}}{dx}\right)^2 - \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \left\lbrace P_n^{(0)}\right\rbrace^2 \right]dx}{\displaystyle \int_0^L \left\lbrace P_n^{(0)}\right\rbrace^2 dx }.
$$

Finally, substituting $${P_n^{(0)}(x) = \cos(k_n^{(0)}x), \, k_n^{(0)}=\dfrac{\omega_n^{(0)}}{c}}$$ gives

$$
\begin{align*}\omega_n^{(1)} &= \dfrac{c^2}{2\omega_n^{(0)}A_0} \dfrac{\displaystyle \left( \dfrac{\omega_n^{(0)}}{c} \right)^2 \int_0^L \delta A(x) \left\lbrace \sin^2 \left( k_n^{(0)}x \right) - \cos^2 \left(k_n^{(0)}x\right) \right\rbrace dx}{\displaystyle \int_0^L \cos^2 \left(k_n^{(0)}x\right) dx} \\&= -\dfrac{\omega_n^{(0)}}{A_0L} \int_0^L \delta A(x) \cos\left(2 k_n^{(0)} x \right) dx.\end{align*}
$$

Thus, the relative change in the formant is

$$
\dfrac{\Delta F_n}{F_n} \approx - \dfrac{1}{A_0L} \int_0^L \delta A(x) \cos\left( \dfrac{(2n-1)\pi x}{L} \right) dx. \tag{8}
$$

### 3-3. Vowel Modification

At last, the part where we thoroughly abuse the equations is over. All that remains is to consider how changing the vocal tract changes the formants. The only physical quantities we can consciously alter are essentially the length $${L}$$ of the vocal tract—by raising or lowering the larynx, protruding the lips, and so on—and the perturbation $${\delta A(x)}$$ to its cross section.

The effect of $${L}$$ is straightforward. Recalling (4),

$$
F_n = \dfrac{(2n - 1)c}{4L}, \quad n=1,2,3,\dots,
$$

every formant $${F_n}$$ is inversely proportional to $${L}$$ and therefore decreases monotonically with it. In practice, singing with pursed lips is not realistic outside of training exercises, so it appears that $${L}$$ is adjusted by raising or lowering the larynx.

The effect of a cross-sectional change $${\delta A(x)}$$ is not so simple. Recalling (8),

$$
\dfrac{\Delta F_n}{F_n} \approx - \dfrac{1}{A_0L} \int_0^L \delta A(x) \cos\left( \dfrac{(2n-1)\pi x}{L} \right) dx, \quad n=1,2,3,\dots.
$$

The factor $${\cos\left( \dfrac{(2n-1)\pi x}{L} \right) }$$ in the integrand changes sign over $${\left[0, L\right]}$$, and its behavior also depends on $${n = 1, 2, 3, \dots}$$. We therefore cannot draw a simple conclusion that increasing $${A(x)}$$, meaning $${\delta A(x) > 0}$$, always raises or lowers a formant. One clear result, however, is that lowering the jaw and opening the mouth wide means $${\delta A(x) > 0}$$ near $${x \approx L}$$. In this region, $${\cos\left( \dfrac{(2n-1)\pi x}{L} \right) \approx -1 }$$ regardless of $${n}$$, so the formants rise. Conversely, closing the mouth somewhat lowers the formants.

This explains why inexperienced vocalists like me tend to open their mouths wide and shout when singing high notes. Vowel modification, the quintessential formant-tuning technique, instead teaches us to pronounce a wide-open “ah” slightly closer to “eh” or “oo,” with the mouth somewhat more closed. This lowers the formants. The LLM claims that “true” mixed voice is achieved by matching the second formant $${F_2}$$, rather than the first formant $${F_1}$$, to the fundamental frequency $${f_0}$$. Some LLMs explained that harmonics $${nf_0}$$ should be matched to $${F_2}$$ or $${F_3}$$, but I honestly do not know what is correct.

## Conclusion

Thank you to everyone who read this far. You have now reached the same point I occupied while writing: “I sort of understand the principles of mixed voice, but I still cannot actually sing anything.” The next step is to put the theory into practice and turn skillful maneuvers of the vocal organs into muscle memory. The necessary vocal training will presumably require steady daily practice. If this series can do even a little to keep someone from giving up before seeing results and wondering, “Why do I have to do this?”, I will be delighted.
