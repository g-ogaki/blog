---
title: A Scientific Approach to Mixed Voice 1. Anatomy and Physiology
date: 2026-06-16
category: Music
tags:
  - Singing
  - Mix Voice
draft: false
image: mix-voice-thumbnail1.webp
---

This is a port of the following article.

https://note.com/moni0627/n/ndd664c8e73e8

---

## Introduction

When I asked an AI, “How can I learn to sing in mixed voice?”, it replied that I needed “a balance between the TA and CT muscles” and “formant tuning.” But I am a thoroughly STEM-minded person, so I cannot commit myself to vocal training until I have established a theory explaining why these things are necessary. When I investigated how they work, the subject turned out to be much deeper than I had imagined. By the time I had built a coherent theory in my own mind, I had researched enough to write an article. The motivation behind this article is therefore to convince myself.

Part 1 aims to explain the principles and mechanisms of voice production from anatomical and physiological perspectives. Parts 2 and 3 will then interpret phonation mathematically using physical models.

### Disclaimer

This series—and especially its approach using physical models—is based almost entirely on output from LLMs, mainly Gemini 3.1 Pro and Claude Opus 4.6. I checked the logical consistency of their arguments and organized the results. This field, known as vocology, was pioneered by the researcher Ingo Titze. His 1994 book *Principles of Voice Production* appears to be out of print, however, and its price has risen to an absurd level, putting it beyond my reach.

https://www.amazon.co.jp/dp/013717893X

I majored in mathematics and have little knowledge of physics, so I do not deeply understand the physical laws underlying the derivation of the partial differential equations. I also conduct all my conversations with LLMs in English. This is partly because their performance differs by language, but also because diagrams on Wikipedia are often in English and because learning the relevant terminology in English lets me research training methods on YouTube and elsewhere without being constrained by language. As a result, the original article may contain unnatural Japanese, and I included the original English wherever a Japanese translation felt forced. Finally, I wrote this without reading a single specialist book, so there is a substantial possibility that I have mistaken LLM hallucinations for facts. Corrections from knowledgeable readers are very welcome.

## 1. Principles of Voice Production

### 1-1. Acoustic Waves

Sound is the phenomenon in which changes in air pressure propagate as waves. Sound waves, however, are longitudinal waves, also known as compression waves, and differ from the surface waves people generally imagine when they hear the word “wave.” Gemini told me that it is easier to visualize by laying a Slinky horizontally on a desk and moving it back and forth, watching the compressed and expanded regions travel toward the other end. I must have learned this in high-school physics, but despite being a STEM person, I never liked physics very much and had forgotten it completely.

https://www.amazon.co.jp/dp/B09J54LLDF

### 1-2. Defining the Coordinate System

I relied heavily on Google Image Search to understand the arrangement of the cartilage and muscles around the neck discussed below. I found it extremely difficult to interpret a three-dimensional body from flat images when I could not initially tell which direction they were viewed from, so I will first introduce a spatial coordinate system. I cite Wikipedia images because of copyright restrictions, but some of them are not especially clear. Searching Google Images yourself may make the anatomy easier to understand.

Imagine a person standing upright, with the glottis as the origin. Introduce a right-handed coordinate system in which the person's line of sight—forward—is the positive $${y}$$-axis, their right side is the positive $${x}$$-axis, and vertically upward is the positive $${z}$$-axis.

### 1-3. Vocal Folds/Cords

The vocal folds are the nozzle that produces these waves of air pressure. The image below shows the vocal folds from above. The right side of the image is the positive $${x}$$ direction, and the top is the positive $${y}$$ direction.

![Vocal cords](vocal-cords.webp "Vocal cords (from Wikipedia)")

I will also introduce the relevant physiological terminology while explaining how the voice is produced. Air supplied by the lungs passes through the trachea, or windpipe, and vibrates the vocal folds at the glottis, producing waves of air pressure. These sounds resonate in the vocal tract and are emitted as the voice.

Using the coordinate system introduced above, the air from the lungs applies subglottal pressure to the glottis in the $${+z}$$ direction, causing the left and right vocal folds to vibrate along the $${x}$$-axis. Pressure along the $${z}$$-axis produces motion along the $${x}$$-axis because, as the GIF below shows, the vocal folds are vertically asymmetric. The lower portion opens first, forming a wedge $${\wedge}$$, which apparently causes aerodynamic forces to act laterally.

![Vocal folds in motion](vocal-folds-in-mortion.webp "The vocal folds in motion (from Wikipedia)")

## 2. Anatomy

### 2-1. Cartilage

Three cartilages are important in vocology:

- Thyroid cartilage
- Arytenoid cartilages
- Cricoid cartilage

The thyroid cartilage is the shield-shaped cartilage around the Adam's apple, and therefore lies in the positive $${y}$$ direction. On the opposite side of the Adam's apple, in the negative $${y}$$ direction, are the two small, pyramid-shaped arytenoid cartilages. As its name suggests, the cricoid cartilage forms a ring around the throat and lies below—in the negative $${z}$$ direction—the thyroid and arytenoid cartilages.

![Arytenoid cartilage](arytenoid-cartilage.webp "Arytenoid cartilage (from Wikipedia)")

This image appears to show the vocal folds from above. Under our definition, the left side of the image is the positive $${x}$$ direction, the bottom is the positive $${y}$$ direction, and the direction toward the viewer is the positive $${z}$$ direction. Honestly, I do not think it is easy to read at all, so this is one area where you would probably be better off searching for images yourself.

### 2-2. Muscles

We now come to the TA muscle (thyroarytenoid muscle) and CT muscle (cricothyroid muscle), the main topics of Part 2. Their names probably explain why the preceding subsection discussed cartilage. The TA muscle connects the thyroid and arytenoid cartilages, while the CT muscle connects the thyroid and cricoid cartilages. The TA muscle is the easier one to understand: it forms most of the folds that make up the vocal cords. See also the image in the preceding subsection. Because the thyroid cartilage is in the positive $${y}$$ direction and the arytenoid cartilages are a left–right pair in the negative $${y}$$ direction, the two TA muscles extend across the positive and negative sides of $${y}$$.

![Thyroid cartilage](thyroid-cartilage.webp "Thyroid cartilage (from Wikipedia)")

The CT muscle forms an arch between the upper front of the cricoid cartilage and the lower part of the thyroid cartilage. Unlike the TA muscle, it is therefore located at the front of the neck, in the positive $${y}$$ direction. It may look unrelated to the vocal folds, but when the CT muscle contracts, it tilts the thyroid cartilage in the positive $${y}$$ and negative $${z}$$ directions, like the visor of a Western suit of armor, stretching the vocal folds lengthwise.

These muscles are important because chest voice is produced under the control of the TA muscle, while head voice is produced under the control of the CT muscle. Mixed voice refers to the technique of transitioning smoothly from TA dominance to CT dominance, or vice versa. Balancing them is difficult because the two muscles work against each other: contracting the TA muscle makes the vocal folds thicker and shorter, whereas contracting the CT muscle makes them thinner and longer. For an inexperienced vocalist like me, producing high notes relies entirely on TA contraction to keep the vocal folds closed. At the point when the TA muscle can no longer maintain that closure, it gives up completely and suddenly hands the job to the CT muscle. The CT muscle then fails to keep the vocal folds closed, and the voice switches not to head voice but to falsetto. This is the mechanism behind a voice crack. Part 2 discusses the relationship between these muscles and vocal pitch and quality.

## 3. Physiology

### 3-1. Source–Filter Theory

The vocal tract refers to the spaces above the glottis in which sound resonates, including the larynx, oral cavity, and nasal cavity. Source–Filter Theory, proposed by Gunnar Fant in 1960, holds that the vocal folds act as a source producing sounds at many frequencies, while the vocal tract acts as a filter that amplifies or attenuates them according to frequency, producing the emitted voice. In this classical theory, the source and filter are treated as independent, and the model explains the low and middle ranges adequately.

In the high range, however—especially around the passaggio—phenomena occur that this model cannot explain, and the state of the vocal tract affects the vocal folds. This is called nonlinear source–filter coupling or interaction. Because the key to mixed voice is the transition between chest and head voice at the passaggio, we need to examine this effect more deeply.

### 3-2. Nonlinear Source–Filter Coupling

The primary cause of this interaction is aerodynamics arising from the air that fills the vocal tract. Oscillation of the air in the tract creates a localized vacuum that helps close the vocal folds, thereby affecting them. Depending on the phase relationship between the sound wave and the air, this vacuum pressure—supraglottal pressure—raises or lowers the phonation threshold pressure (PTP), the minimum pressure required to produce a voice, making singing easier or harder. The ideal condition is for the sound wave to lead the air. The following mechanism apparently reduces PTP and makes singing easier:

1. As the vocal folds open, the air in the vocal tract behaves like a mass because of inertance and remains in place instead of immediately moving upward.
1. When the vocal folds subsequently close, airflow from the lungs is cut off.
1. The air in the vocal tract, meanwhile, continues moving upward, creating a localized vacuum immediately above the glottis.
1. This vacuum creates suction that draws the vocal folds together and helps them close.

When the air instead leads the sound wave, precisely the opposite happens and PTP rises. Maintaining this ideal relationship is essential for singing without unnecessary force.

### 3-3. Formants

Formants are the resonant frequencies of the vocal tract. Independently of the frequencies of the sound waves produced by the vocal folds, they are determined solely by the shape of the vocal tract. In Source–Filter Theory, the vocal tract filters particular frequencies, and this is how we distinguish vowels, especially according to the shape of the mouth.

Formants matter because whether the interaction described above makes singing easier depends on the relationship between the frequency of the desired pitch and the formant frequencies. We cannot change the frequency of the note we want to sing, but we can adjust the formants by changing the shape of the vocal tract and thereby control the interaction. This is called formant tuning. The most commonly used technique is known as vowel modification, and searching for that term produces many more results on YouTube. Part 3 discusses the relationship between the two frequencies.

## Conclusion

Let us say that we now understand the basic mechanism of voice production. From here, we enter the part where we aggressively manipulate equations using physical models. I had a great deal of fun writing it and found the words flowing easily; I hope you will enjoy reading it as well.

Parts 2 and 3 are independent, so you may read them in either order. It may feel more natural to read Part 2, which discusses the vocal folds where the voice originates, followed by Part 3, which discusses the vocal tract where that voice resonates. Still, I hope you will read them in whichever order appeals to you.
