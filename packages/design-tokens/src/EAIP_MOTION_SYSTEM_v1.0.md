# EAIP Motion Design System v1.0

**Effective Date:** 2026-07-30  
**Status:** Active  
**Scope:** All EAIP frontend applications and components  
**Owner:** Enterprise Design Systems  

---

## 1. Motion Philosophy

### Core Principle

**Motion is information, not decoration.** Every animation in EAIP communicates state, relationship, or hierarchy. Motion should feel like the interface is thinking — responsive, deliberate, and intelligent.

### Emotional Goals

| Animation Context | Emotional Goal |
|---|---|
| **Page transitions** | Seamless continuity; the system is ready |
| **Button hover** | Tactile invitation; the element is alive |
| **Loading states** | Patient confidence; work is happening |
| **Success feedback** | Satisfying confirmation; trust reinforced |
| **Error feedback** | Clear urgency; help is available |
| **Focus transitions** | Guided attention; precision available |
| **Modal appearance** | Layered depth; context preserved |

### Prohibited Motion

| Anti-Pattern | Why Prohibited |
|---|---|
| **Bouncy / elastic overshoot** | Feels playful, not enterprise |
| **Shake on error** | Feels punitive, not helpful |
| **Spinning loaders for >3s** | Feels frozen, not working |
| **Parallax scrolling** | Distracts from mission-critical information |
| **3D flips / rotations** | Feels gimmicky, reduces trust |
| **Infinite pulsing** | Creates anxiety, implies unresolved state |
| **Spring physics with high bounce** | Feels uncontrolled, unpredictable |

---

## 2. Duration Tokens

All animations must use one of the following durations. No arbitrary durations.

| Token | Duration | Usage |
|---|---|---|
| **instant** | 0ms | State changes without visual transition (rare) |
| **micro** | 100ms | Hover color changes, opacity shifts, border transitions |
| **fast** | 150ms | Button press feedback, small element transitions |
| **normal** | 250ms | Standard transitions, hover lifts, shadow changes |
| **medium** | 350ms | Panel expansions, sidebar toggles, dropdowns |
| **slow** | 450ms | Page transitions, modal appearances, toast entrances |
| **deliberate** | 600ms | Hero animations, entrance sequences, emphasis |

### Duration Rules

1. **Exit is faster than enter** — Elements leaving: 200ms. Elements arriving: 300ms.
2. **Small is faster than large** — Icons: 150ms. Panels: 350ms. Pages: 450ms.
3. **Feedback is fastest** — Press feedback: 100ms. Success checkmark: 200ms.
4. **Loading is slowest** — Skeleton shimmer: 1.6s. Progress loops must be seamless.

---

## 3. Easing Tokens

All animations must use one of the following easing curves. No arbitrary easings.

| Token | Curve | Character | Usage |
|---|---|---|---|
| **linear** | `linear` | Mechanical | Progress indicators, continuous loops |
| **ease** | `ease` | Natural | Standard transitions, hover states |
| **ease-out** | `ease-out` | Decelerating | Elements arriving (gentle stop) |
| **ease-in** | `ease-in` | Accelerating | Elements leaving (gentle start) |
| **ease-in-out** | `ease-in-out` | Smooth | Symmetric transitions (expand/collapse) |
| **premium** | `cubic-bezier(0.16, 1, 0.3, 1)` | Exponential deceleration | Page transitions, modal appearances, premium effects |
| **snappy** | `cubic-bezier(0.4, 0, 0.2, 1)` | Quick, responsive | Button interactions, toggles, micro-interactions |
| **bounce** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Subtle overshoot | Card hover lift (small, controlled) |

### Easing Rules

1. **Enter = premium or ease-out** — Elements should feel like they glide into place
2. **Exit = ease-in** — Elements should feel like they gently depart
3. **Hover = snappy** — Response should feel immediate
4. **Emphasis = premium** — Important moments deserve luxurious easing

---

## 4. Spring Behavior

Springs are used sparingly for physical-feeling interactions. When springs are used, they must follow these parameters:

| Property | Value | Notes |
|---|---|---|
| **Stiffness** | 300 | Quick response without feeling rigid |
| **Damping** | 30 | Controlled settle without overshoot |
| **Mass** | 1 | Standard weight |

**Permitted spring usage:**
- Card hover lift (translateY)
- Button press feedback (scale)
- Toggle switches (translateX)

**Prohibited spring usage:**
- Page transitions (use CSS transitions)
- Modal animations (use CSS transitions)
- Loading indicators (use CSS animations)

---

## 5. Hover Motion

### Button Hover

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **TranslateY** | 0 | -2px | 200ms | snappy |
| **Shadow** | shadow-sm | shadow-md | 200ms | ease |
| **Background** | resting | hover | 150ms | ease |
| **Border** | resting | hover | 150ms | ease |

**Glass Button Hover:**
- Inner light gradient brightens
- No translateY (glass feels solid)
- Shadow elevates subtly

### Card Hover

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **TranslateY** | 0 | -3px | 300ms | premium |
| **Shadow** | shadow-card | shadow-elevated | 300ms | ease |
| **Border** | border | border-strong | 200ms | ease |

### Navigation Item Hover

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Background** | transparent | surface-tertiary/70 | 150ms | ease |
| **Text color** | text-muted | text | 150ms | ease |
| **Icon color** | text-muted | text | 150ms | ease |

### Input Hover

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Border color** | border | border-strong | 150ms | ease |
| **Shadow** | inset subtle | inset subtle + glow | 200ms | ease |

---

## 6. Focus Motion

### Focus Transition

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Ring** | none | ring-2 | 150ms | ease-out |
| **Ring offset** | none | 2px | 150ms | ease-out |
| **Border** | resting | primary | 150ms | ease-out |

**Rules:**
- Focus ring must animate in (150ms ease-out)
- Focus ring must not animate out (instant disappearance acceptable)
- Never animate border + ring simultaneously with different timings

### Focus-Within (Parent Containers)

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Container border** | border | border-primary | 200ms | ease |
| **Container shadow** | inset subtle | inset subtle + glow | 200ms | ease |

---

## 7. Pressed / Active Motion

### Button Press

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Scale** | 1.0 | 0.97 | 80ms | ease-in |
| **Shadow** | hover | resting | 80ms | ease-in |
| **TranslateY** | -2px | 0 | 80ms | ease-in |

**Release:**
- Scale returns to 1.0 over 150ms ease-out
- Shadow returns to hover state over 150ms ease-out

### Card Press

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Scale** | 1.0 | 0.98 | 100ms | ease-in |
| **Shadow** | elevated | card | 100ms | ease-in |

### Navigation Item Press

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Background** | hover | surface-tertiary | 80ms | ease |
| **Scale** | 1.0 | 0.98 | 80ms | ease-in |

---

## 8. Dialog Motion

### Dialog Appearance

| Element | Animation | Duration | Easing | Delay |
|---|---|---|---|---|
| **Overlay** | Opacity 0 → 0.4 | 200ms | ease-out | 0ms |
| **Container** | Scale 0.95 → 1.0, Opacity 0 → 1 | 350ms | premium | 50ms |
| **Content** | Opacity 0 → 1 | 250ms | ease-out | 150ms |

### Dialog Disappearance

| Element | Animation | Duration | Easing | Delay |
|---|---|---|---|---|
| **Content** | Opacity 1 → 0 | 150ms | ease-in | 0ms |
| **Container** | Scale 1.0 → 0.95, Opacity 1 → 0 | 250ms | ease-in | 50ms |
| **Overlay** | Opacity 0.4 → 0 | 200ms | ease-in | 100ms |

**Rule:** Exit is faster than enter. Container leaves before overlay fully fades.

---

## 9. Page Transitions

### Page Entrance

| Element | Animation | Duration | Easing |
|---|---|---|---|
| **Page content** | Opacity 0 → 1, TranslateY 12px → 0 | 450ms | premium |
| **Hero section** | Opacity 0 → 1, TranslateY 16px → 0 | 500ms | premium |
| **Metric cards** | Staggered: opacity + translateY | 300ms each | premium |
| **Stagger delay** | 50ms between items | — | — |

### Page Exit

| Element | Animation | Duration | Easing |
|---|---|---|---|
| **Page content** | Opacity 1 → 0 | 150ms | ease-in |

**Rule:** Exit is instant and minimal. The next page's entrance is where effort belongs.

---

## 10. Sidebar Transitions

### Sidebar Open

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Width** | 0 or collapsed | 256px | 300ms | premium |
| **Opacity** | 0 | 1 | 250ms | ease-out |
| **Backdrop blur** | 0 | 24px | 300ms | ease |

### Sidebar Close

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Width** | 256px | 0 or collapsed | 250ms | ease-in |
| **Opacity** | 1 | 0 | 200ms | ease-in |

### Mobile Sidebar (Overlay)

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Overlay** | Opacity 0 → 0.4 | 200ms | ease-out |
| **Panel** | TranslateX -100% → 0 | 350ms | premium |

---

## 11. Drawer Motion

### Drawer Open (Slide from Right)

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Overlay** | Opacity 0 → 0.4 | 200ms | ease-out |
| **Drawer** | TranslateX 100% → 0 | 350ms | premium |
| **Content inside** | Opacity 0 → 1 | 250ms | ease-out | 100ms delay |

### Drawer Close

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Content inside** | Opacity 1 → 0 | 150ms | ease-in |
| **Drawer** | TranslateX 0 → 100% | 300ms | ease-in |
| **Overlay** | Opacity 0.4 → 0 | 200ms | ease-in | 100ms delay |

---

## 12. Notification Motion

### Toast Entrance (Slide from Right)

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Container** | TranslateX 100%, Scale 0.95, Opacity 0 | TranslateX 0, Scale 1.0, Opacity 1 | 350ms | premium |
| **Icon** | Scale 0 → 1 | 250ms | bounce | 100ms delay |

### Toast Exit (Slide Right + Fade)

| Property | From | To | Duration | Easing |
|---|---|---|---|---|
| **Container** | TranslateX 0, Opacity 1 | TranslateX 100%, Opacity 0 | 300ms | ease-in |

### Toast Auto-Dismiss

- Minimum visible duration: 4 seconds
- Progress indicator: optional subtle bottom border that shrinks
- Hover pauses dismiss timer

---

## 13. Command Palette Motion

### Open

| Element | Animation | Duration | Easing |
|---|---|---|---|
| **Overlay** | Opacity 0 → 0.4 | 200ms | ease-out |
| **Container** | Scale 0.95 → 1.0, Opacity 0 → 1 | 300ms | premium |
| **Search input** | Opacity 0 → 1 | 200ms | ease-out | 100ms delay |
| **Results list** | Opacity 0 → 1, TranslateY 8px → 0 | 250ms | ease-out | 150ms delay |

### Close

| Element | Animation | Duration | Easing |
|---|---|---|---|
| **Results list** | Opacity 1 → 0 | 100ms | ease-in |
| **Container** | Scale 1.0 → 0.95, Opacity 1 → 0 | 200ms | ease-in |
| **Overlay** | Opacity 0.4 → 0 | 150ms | ease-in |

---

## 14. Skeleton Loading

### Skeleton Shimmer

| Property | Value |
|---|---|
| **Animation** | Gradient position shift |
| **Duration** | 1.6s |
| **Easing** | ease-in-out |
| **Iteration** | Infinite |
| **Gradient** | surface-tertiary → surface-secondary → surface-tertiary |

### Skeleton Appearance

| Element | Animation | Duration | Easing |
|---|---|---|---|
| **Skeleton blocks** | Opacity 0 → 1 | 200ms | ease-out |
| **Stagger** | 50ms between elements | — | — |

### Skeleton Disappearance (Content Loaded)

| Element | Animation | Duration | Easing |
|---|---|---|---|
| **Skeleton blocks** | Opacity 1 → 0 | 150ms | ease-in |
| **Real content** | Opacity 0 → 1, TranslateY 4px → 0 | 200ms | ease-out | 100ms delay |

---

## 15. Progress Indicators

### Spinner (Loading)

| Property | Value |
|---|---|
| **Type** | Rotating SVG stroke |
| **Duration** | 1s per rotation |
| **Easing** | linear |
| **Size** | 16px (small), 20px (medium), 24px (large) |

### Progress Bar

| Property | Value |
|---|---|
| **Height** | 4px |
| **Fill animation** | Width 0% → N% |
| **Duration** | 400ms |
| **Easing** | ease-out |
| **Color** | primary |

### Indeterminate Progress

| Property | Value |
|---|---|
| **Animation** | Gradient sliding horizontally |
| **Duration** | 1.5s |
| **Easing** | ease-in-out |
| **Iteration** | Infinite |

---

## 16. Success / Error Feedback

### Success Animation

| Element | Animation | Duration | Easing |
|---|---|---|---|
| **Checkmark** | Stroke draw (SVG path) | 300ms | ease-out |
| **Button** | Background transitions to success-subtle | 200ms | ease |
| **Text** | Changes to "Done" or fades | 150ms | ease |

### Error Animation

| Element | Animation | Duration | Easing |
|---|---|---|---|
| **Input border** | Border color transitions to danger | 200ms | ease |
| **Error message** | Opacity 0 → 1, TranslateY -4px → 0 | 250ms | ease-out |
| **Shake** | ❌ **PROHIBITED** — Use color + message instead |

---

## 17. Reduced Motion Support

### Rules

1. **Always respect `prefers-reduced-motion: reduce`**
2. **Essential motion may continue:**
   - Loading spinners (required for understanding state)
   - Progress indicators (required for understanding state)
   - Focus rings (required for accessibility)
3. **Decorative motion must stop:**
   - Page entrance animations
   - Card hover lifts
   - Toast slide animations
   - Skeleton shimmer
   - Ambient background animations
4. **Reduced motion fallback:**
   - All opacity transitions: instant or 100ms
   - All translate/scale transitions: instant
   - Skeleton: static color, no shimmer
   - Background: static gradient, no animation

### Implementation

```css
@media (prefers-reduced-motion: reduce) {
  .page-enter,
  .toast-enter,
  .card-hover-lift,
  .skeleton,
  .bg-atmosphere {
    animation: none !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
  }
}
```

---

## 18. Animation Inventory

| Animation | Token | Duration | Easing | Used By |
|---|---|---|---|---|
| **page-enter** | `.page-enter` | 450ms | premium | All page content |
| **toast-enter** | `.toast-enter` | 350ms | premium | Toast notifications |
| **skeleton-shimmer** | `.skeleton` | 1.6s | ease-in-out | Loading skeletons |
| **card-hover-lift** | `.card-hover-lift` | 300ms | premium | Cards, panels |
| **press-feedback** | `.press-feedback` | 80ms | ease-in | Buttons, interactive elements |
| **dialog-enter** | inline | 350ms | premium | Dialog containers |
| **dialog-exit** | inline | 250ms | ease-in | Dialog containers |
| **sidebar-toggle** | inline | 300ms | premium | Sidebar open/close |
| **drawer-slide** | inline | 350ms | premium | Drawer panels |
| **dropdown-open** | inline | 200ms | ease-out | Dropdown menus |
| **dropdown-close** | inline | 150ms | ease-in | Dropdown menus |
| **tooltip-appear** | inline | 150ms | ease-out | Tooltips |
| **modal-backdrop** | inline | 200ms | ease-out | Modal overlays |
| **command-palette-open** | inline | 300ms | premium | Command palette |
| **notification-slide** | inline | 350ms | premium | Notifications |
| **focus-ring** | inline | 150ms | ease-out | All interactive elements |

---

## 19. Cross-Reference

```
EAIP Brand & Product Identity Guide
    ↓ Defines emotional experience, personality, voice
EAIP Material Design Specification v1.0
    ↓ Defines materials, elevation, colors, lighting, textures
EAIP Motion Design System v1.0 (this document)
    ↓ Defines timing, easing, transitions, animations
Design Tokens (theme.css)
    ↓ Implements colors, shadows, radius, typography
Component Library
    ↓ Implements buttons, cards, dialogs, tables with motion
Applications (5 apps)
    ↓ Compose components into user experiences with motion
```

**Rule:** No future UI work may bypass any layer without a formal design review.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-07-30 | Initial motion design system |

---

*This system is the permanent source of truth for EAIP motion, animation, and interaction timing. All future animations must comply with this system.*
