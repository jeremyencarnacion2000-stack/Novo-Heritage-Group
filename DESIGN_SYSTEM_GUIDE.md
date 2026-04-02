# Novo Heritage Group - Premium Design System Guide

This document defines the visual language and implementation rules for the Novo Heritage Group platform. Adhering to these guidelines ensures a consistent, high-end "Architectural Premium" aesthetic across all interfaces.

---

## 1. Core Philosophy: "Architectural Premium"

The design system is built on four pillars:
- **Sharp Precision**: Zero-radius corners (`border-radius: 0`) to evoke architectural stability and modern minimalism.
- **Dynamic Depth**: Multi-layered glassmorphism and subtle shadows.
- **High Contrast**: A sophisticated play between Deep Obsidian and Premium Gold.
- **Fluid Motion**: Smooth, cinematic transitions using Framer Motion, GSAP, and custom CSS keyframes.

---

## 2. Color Palette

### Primary Colors
| Color | Hex | Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Premium Gold** | `#E6C15A` | `--primary` | Accents, primary buttons, focus states. |
| **Deep Obsidian** | `#050505` | `--background` (Dark) | Primary background in dark mode. |
| **Soft Parchment** | `#F5F5F0` | `--background` (Light) | Primary background in light mode. |

### Semantic Tokens
- **Foreground**: Deep charcoal (`#1A1A1A`) on light, Off-white (`#F5F5F0`) on dark.
- **Borders**: Translucent tints of the foreground (`10-15%` opacity).

---

## 3. Typography

The system uses a sophisticated mix of Sans-serif for clarity and Serif for luxury.

### Font Families
- **Sans-serif (Primary)**: `Montserrat` (Defined as `--font-sans`). Use for UI elements, labels, and body text.
- **Serif (Luxury)**: `Cormorant Garamond` (Defined as `--font-serif`). Use for headings, quotes, and emphasized accents.

### Typography Utilities
- `.text-massive`: Large viewport-relative text for hero sections (`clamp(3rem, 10vw, 10rem)`).
- `.heading-premium`: Thin weight (`200`), tight letter spacing, high-impact headings.
- `.text-accent-italic`: Italicized text with a Gold-to-Copper gradient.
- `.heading-luxury`: Italicized, extra-light serif tracking for a sophisticated feel.

---

## 4. Glassmorphism Levels

Use the appropriate level of glass based on the component's hierarchical position.

| Class | Blur | Saturation | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `.glass-premium` | `12px` | `200%` | `1px solid` | Main cards, primary navigation, hero overlays. |
| `.glass-soft` | `12px` | `100%` | `1px solid` | Secondary elements, tooltips, background layers. |
| `.glass-architectural` | `12px` | `180%` | `1px solid` | High-depth components with complex shadows. |

> [!NOTE]
> All glass utilities automatically reset `border-radius` to `0` to maintain the architectural theme.

---

## 5. Components & UI Elements

### Buttons
- **`.btn-premium`**: 
    - Base: Glass background with a subtle border.
    - Hover: Translation (`-2px`), gold glow, and increased border opacity.
    - Animation: Uses `cubic-bezier(0.34, 1.56, 0.64, 1)` for a "springy" premium feel.

### Depth & Effects
- **`.shadow-premium`**: Multi-layered shadow for realistic depth.
- **`.glow-gold`**: Subtle amber outer glow for active or featured items.
- **`.hover-lift`**: Smooth vertical lift on hover (`-8px`).
- **`.border-glow`**: A linear-gradient border that appears only on hover.

---

## 6. Animations

The system avoids "cheap" or fast animations. Everything should feel weighted and deliberate.

- **`.animate-marquee`**: Continuous horizontal scroll for logos or testimonials.
- **`.animate-shiny-text`**: A subtle diagonal shine passing over text (3s duration).
- **`.animate-subtle-pulse`**: Soft opacity breathing (3s duration).
- **`.animate-float`**: Gentle vertical loop for floating cards/images.

---

## 7. Layout Principles

- **12-Column Grid**: Use `.layout-grid-12` as the baseline for complex sections.
- **Asymmetry**: Use `.grid-asymmetric` (1.5fr / 1fr) for modern, non-linear storytelling sections.
- **Grain Overlay**: Every page should have the subtle noise grain (`body::before`) to add texture and break digital flatness.
- **Liquid Mesh**: Backgrounds should utilize `.mesh-gradient` for organic, slow-moving complexity.

---

## 8. Checklist for Polished Interfaces

1. [ ] **No Rounded Corners**: Are all `border-radius` values set to `0`?
2. [ ] **Typography Balance**: Is there a clear hierarchy between Montserrat (Sans) and Cormorant (Serif)?
3. [ ] **Glass Usage**: Does the component use a `.glass-` utility instead of a flat solid background?
4. [ ] **Interaction Feedback**: Does the element have a `.hover-lift` or `.btn-premium` effect?
5. [ ] **Micro-animations**: Is there a subtle motion (`animate-float` or `animate-fade-in-up`) as the user scrolls?

---

*Last Updated: April 2024*
