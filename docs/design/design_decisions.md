# Purpose

This document records important visual decisions made during the project's evolution.

Unlike DESIGN.md, which explains philosophy, this document explains *why* concrete design choices were made.

---

## DD-001 — Progressive Quietness

The visual richness intentionally decreases as visitors move deeper into the site.

Reason

The homepage expresses personality, while articles prioritize reading.

---

## DD-002 — Homepage Uses Portrait

The homepage features a portrait of the author.

Reason

The site is primarily a personal website rather than a company or product page.

---

## DD-003 — Motion Communicates Quality

Animations should reinforce craftsmanship and polish rather than attract attention.

Reason

Motion is part of the user experience, not the primary content.

---

## DD-004 — Single Accent Color

The site uses one signature accent color consistently.

Reason

Creates a recognizable visual identity while maintaining simplicity.

---

## DD-005 — Progressive Reduction of Decoration

Homepage:

Richest visual treatment.

Blog:

Moderate visual treatment.

Articles:

Minimal interface.

Reason

Each page has a different primary purpose.

---

## DD-006 — Timeless Over Trendy

Design decisions should favor longevity over current trends.

Reason

The website is intended to evolve over many years.

---

## DD-007 — Reading Comes First

Typography, whitespace, mathematics, and code presentation take precedence over decorative elements on article pages.

Reason

The blog is the long-term core of monipy.org.

---

## DD-008 — Deep Green Signature Color

The signature accent is a restrained deep green in light mode and a softer,
lighter green in dark mode. The rest of the palette uses warm-neutral paper,
ink, and surface colors.

Reason

The green complements the natural tones of the homepage portrait, feels calm
enough for long-form reading, and gives the site a recognizable identity
without making article pages visually loud.

---

## DD-009 — System Font Stack

The site uses a system serif stack for display typography and a system sans
serif stack for interface and body text. Metadata uses a system monospace
stack.

Reason

This creates expressive hierarchy without adding a remote font dependency,
layout shift, or third-party request. Japanese fallbacks are specified for
each role.

---

## DD-010 — Portrait-Led Hero

The homepage pairs the primary statement with a large, vertically cropped
portrait. The image keeps a natural photographic treatment and uses only a
small saturation adjustment so it belongs to both themes without appearing
heavily stylized.

Reason

The portrait provides the human presence required by the design intent while
the asymmetric composition makes the homepage memorable. Blog and article
pages do not repeat this visual treatment.

---

## DD-011 — Motion Respects Page Depth

Only the homepage hero receives an automatic entrance animation. Other motion
is limited to short hover and focus feedback, and all motion collapses when
the visitor requests reduced motion.

Reason

This communicates polish at the introduction while preserving progressive
quietness and accessibility deeper in the site.
