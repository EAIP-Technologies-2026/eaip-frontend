# EAIP Material Design Specification v1.0

**Effective Date:** 2026-07-30  
**Status:** Active  
**Scope:** eaip-frontend (all 5 apps, all 51 packages)  
**Owner:** Enterprise Design Systems  

---

## 1. Introduction

The EAIP Material Design Specification v1.0 defines the permanent visual identity of the Enterprise Autonomous Intelligence Platform. This specification establishes a coherent, premium enterprise material language that distinguishes EAIP from generic SaaS styling.

**Principles:**
1. **Calm Confidence** — Every surface communicates quality, trust, precision, and maturity
2. **Material Honesty** — Surfaces have physical properties: opacity, blur, depth, light
3. **Semantic Consistency** — Every token has a purpose; no arbitrary values
4. **Enterprise Gravity** — Professional, restrained, authoritative
5. **Accessibility First** — Materials must never reduce readability or contrast

---

## 2. Material Library

### 2.1 Frosted Glass

The signature EAIP material. Used for navigation overlays, floating panels, and context menus.

| Property | Value | Notes |
|---|---|---|
| **Opacity** | 0.78 (light) / 0.72 (dark) | Translucent but readable |
| **Blur** | 24px | Sufficient to blur background content |
| **Saturate** | 160% | Maintains color vibrancy through blur |
| **Border** | 1px solid rgba(255,255,255,0.18) light / rgba(255,255,255,0.06) dark | Subtle edge definition |
| **Shadow** | inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(17,24,39,0.05) | Inner light + outer depth |
| **Background** | CSS variable `--color-surface-glass` | Theme-aware |
| **Use Cases** | Sidebar, dropdown menus, floating panels, context menus |
| **Accessibility** | Always paired with semantic background behind it; never used on unknown backgrounds |

**Implementation:** `.glass`

---

### 2.2 Acrylic Glass (Glass Panel)

Thicker, more present glass. Used for top navigation and primary headers.

| Property | Value | Notes |
|---|---|---|
| **Opacity** | Gradient from 0.78 to 0.62 (light) / 0.72 to 0.55 (dark) | Layered depth |
| **Blur** | 32px | Deeper blur for emphasis |
| **Saturate** | 180% | Higher saturation for presence |
| **Border** | 1px solid rgba(255,255,255,0.22) light / rgba(255,255,255,0.06) dark | Stronger edge |
| **Shadow** | inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 32px rgba(17,24,39,0.06) | Stronger inner light + depth |
| **Background** | Linear gradient from surface-glass to semi-transparent | Layered translucency |
| **Use Cases** | Top header bar, primary navigation, modal headers |
| **Accessibility** | Higher opacity than Frosted Glass; maintains readability on all backgrounds |

**Implementation:** `.glass-panel`

---

### 2.3 Pearl Surface

The primary application surface. Warm, inviting, premium.

| Property | Value | Notes |
|---|---|---|
| **Color** | #fafbfc (light) / #0a0e17 (dark) | Warm pearl white / Deep obsidian |
| **Border** | 1px solid #e5e7eb (light) / #1e293b (dark) | Subtle definition |
| **Shadow** | --shadow-card | Three-layer subtle depth |
| **Texture** | None | Clean, pure surface |
| **Use Cases** | Cards, panels, content areas, primary containers |
| **Accessibility** | 15.5:1 contrast ratio with text on light; 8.4:1 on dark |

**Implementation:** `.surface-card`

---

### 2.4 Titanium Surface

Secondary surface with metallic warmth. Used for elevated cards and highlighted sections.

| Property | Value | Notes |
|---|---|---|
| **Color** | Linear gradient from surface to surface-secondary | Subtle depth through gradient |
| **Border** | 1px solid border token | Standard definition |
| **Shadow** | --shadow-card | Standard card shadow |
| **Texture** | None | Clean gradient surface |
| **Use Cases** | Metric cards, status widgets, highlighted panels |
| **Accessibility** | Contrast maintained through gradient range |

**Implementation:** `.surface-titanium`

---

### 2.5 Elevated Surface

Surfaces that float above the content plane. Used for dialogs, modals, and toasts.

| Property | Value | Notes |
|---|---|---|
| **Color** | #ffffff (light) / #0f1525 (dark) | Pure surface color |
| **Border** | None or subtle | Minimal edge |
| **Shadow** | --shadow-elevated | Deep three-layer shadow |
| **Elevation** | 4 | High separation from base plane |
| **Use Cases** | Dialogs, modals, dropdown menus, toasts, command palette |
| **Accessibility** | Always includes focus ring; never blends with background |

**Implementation:** `.surface-elevated`

---

### 2.6 Hero Surface

Special surface for dashboard heroes and overview sections.

| Property | Value | Notes |
|---|---|---|
| **Color** | Linear gradient 135deg from surface to surface-secondary | Diagonal depth |
| **Border** | 1px solid border-subtle | Minimal edge |
| **Shadow** | --shadow-elevated | Elevated presence |
| **Use Cases** | Dashboard hero sections, overview panels, welcome banners |
| **Accessibility** | Text always uses text-primary for maximum contrast |

**Implementation:** `.surface-hero`

---

### 2.7 Modal Surface

Dark overlay surface for modal backgrounds.

| Property | Value | Notes |
|---|---|---|
| **Color** | rgba(0,0,0,0.40) | Darkens content behind |
| **Blur** | None on overlay | Background elements may have blur |
| **Use Cases** | Dialog overlays, command palette backdrop, search overlay |
| **Accessibility** | Sufficient contrast to indicate non-interactivity of background |

**Implementation:** `bg-black/40` on overlay container

---

### 2.8 Input Surface

Specialized surface for form inputs and controls.

| Property | Value | Notes |
|---|---|---|
| **Color** | --color-surface | Standard surface |
| **Border** | 1px solid --color-border | Standard border |
| **Shadow** | inset 0 1px 2px rgba(17,24,39,0.03) | Inner depth |
| **Focus** | Border changes to primary; outer glow ring | Clear focus indication |
| **Use Cases** | Text inputs, dropdowns, textareas |
| **Accessibility** | Focus state visible with 3px glow ring |

**Implementation:** `.input-surface`

---

## 3. Elevation System

Elevation defines visual hierarchy through shadow depth. EAIP uses a strict 6-level elevation system. No arbitrary elevation values are permitted.

| Level | Name | Shadow | Blur | Use Cases |
|---|---|---|---|---|
| **0** | Base | None | None | Page background, body |
| **1** | Resting | --shadow-card | 0px | Cards, panels, content blocks |
| **2** | Raised | --shadow-elevated | 0px | Dialogs, modals, dropdowns |
| **3** | Floating | --shadow-depth | 0px | Toasts, notifications, tooltips |
| **4** | Ambient | --shadow-ambient | 0px | Hero sections, featured content |
| **5** | Focus | --shadow-glow | 0px | Focus rings, active states |

### Elevation Rules

1. **Never skip levels** — A card (Level 1) cannot have Level 3 shadow
2. **Hover raises by one level** — Cards hover from Level 1 to Level 2
3. **Modal overlay is separate** — Modal content at Level 2 sits on overlay at Level 0
4. **Only one element at Level 4** — Only hero sections may use ambient glow
5. **Level 5 is for focus only** — Never used for static elevation

---

## 4. Color System

### 4.1 Design Principles

- **No generic Tailwind colors** — Every color is custom-selected for EAIP
- **Semantic naming** — Colors describe purpose, not appearance
- **Theme-aware** — All colors have light and dark variants
- **WCAG compliant** — Minimum 4.5:1 contrast for text, 3:1 for UI elements

### 4.2 Core Palette

#### Surfaces

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-surface` | #fafbfc | #0a0e17 | Primary surface |
| `--color-surface-secondary` | #f5f6f8 | #0d1220 | Secondary surface |
| `--color-surface-tertiary` | #eef0f3 | #131a2e | Tertiary surface |
| `--color-surface-elevated` | #ffffff | #0f1525 | Elevated surface |
| `--color-surface-glass` | rgba(250,251,252,0.78) | rgba(10,14,23,0.72) | Glass surface |

#### Text

| Token | Light | Dark | Contrast Ratio |
|---|---|---|---|
| `--color-text` | #111827 | #f1f5f9 | 15.5:1 / 8.4:1 |
| `--color-text-secondary` | #4b5563 | #94a3b8 | 7.2:1 / 6.1:1 |
| `--color-text-muted` | #9ca3af | #64748b | 3.8:1 / 4.2:1 |
| `--color-text-inverse` | #ffffff | #0a0e17 | — |

#### Borders

| Token | Light | Dark |
|---|---|---|
| `--color-border` | #e5e7eb | #1e293b |
| `--color-border-subtle` | #f3f4f6 | #0f172a |
| `--color-border-strong` | #d1d5db | #334155 |

#### Brand / Status

| Token | Light | Dark | Emotion |
|---|---|---|---|
| `--color-primary` | #4338ca | #818cf8 | Calm authority |
| `--color-primary-hover` | #3730a3 | #a5b4fc | Deeper authority |
| `--color-primary-subtle` | rgba(67,56,202,0.08) | rgba(129,140,248,0.12) | Subtle highlight |
| `--color-success` | #15803d | #4ade80 | Achievement |
| `--color-success-subtle` | rgba(21,128,61,0.08) | rgba(74,222,128,0.12) | Subtle success |
| `--color-warning` | #a16207 | #fbbf24 | Caution |
| `--color-warning-subtle` | rgba(161,98,7,0.08) | rgba(251,191,36,0.12) | Subtle warning |
| `--color-danger` | #b91c1c | #f87171 | Alert |
| `--color-danger-subtle` | rgba(185,28,28,0.08) | rgba(248,113,113,0.12) | Subtle alert |

#### Atmosphere

| Token | Light | Dark |
|---|---|---|
| `--color-accent-glow` | rgba(67,56,202,0.10) | rgba(129,140,248,0.12) |
| `--color-ambient-light` | rgba(255,255,255,0.7) | rgba(255,255,255,0.03) |
| `--color-depth-shadow` | rgba(17,24,39,0.04) | rgba(0,0,0,0.4) |

### 4.3 Color Usage Rules

1. **Primary color** — Actions, active states, links, focus rings
2. **Success** — Positive feedback, healthy status, completed tasks
3. **Warning** — Cautionary states, attention needed, pending
4. **Danger** — Errors, destructive actions, critical alerts
5. **Text** — Body copy, headings, labels (never use surface colors for text)
6. **Text-secondary** — Descriptions, metadata, timestamps
7. **Text-muted** — Placeholders, disabled hints, decorative text
8. **Border** — Card edges, dividers, input borders
9. **Border-subtle** — Section separators, inner dividers
10. **Border-strong** — Focus indicators, active tabs, selected items

---

## 5. Lighting System

Lighting creates depth, hierarchy, and atmosphere. All lighting is subtle and purposeful.

### 5.1 Ambient Light

Soft radial illumination that creates atmosphere without distraction.

| Element | Implementation |
|---|---|
| **Page background** | `bg-atmosphere` — radial gradient at 10% 10% and 90% 80% |
| **Hero sections** | `--color-accent-glow` with 10-12% opacity |
| **Cards** | No ambient light; use shadow for depth |

### 5.2 Panel Glow

Inner edge highlight that defines glass surfaces.

| Material | Glow |
|---|---|
| Frosted Glass | inset 0 1px 0 rgba(255,255,255,0.12) |
| Acrylic Glass | inset 0 1px 0 rgba(255,255,255,0.14) |
| Dark Frosted | inset 0 1px 0 rgba(255,255,255,0.04) |
| Dark Acrylic | inset 0 1px 0 rgba(255,255,255,0.03) |

### 5.3 Edge Highlights

Active state indication through edge lighting.

| Element | Implementation |
|---|---|
| **Active navigation** | `nav-glow-edge` — 3px left inset + ambient glow |
| **Selected tab** | Bottom border 2px primary + subtle glow |
| **Focused input** | 3px outer glow ring in primary-subtle |

### 5.4 Button Lighting

| Variant | Hover Effect |
|---|---|
| Primary | `hover:shadow-primary/10` — colored ambient glow |
| Destructive | `hover:shadow-danger/10` — colored ambient glow |
| Secondary | Standard shadow elevation |
| Glass | Brighter inner light gradient |

### 5.5 Loading Glow

| Element | Implementation |
|---|---|
| **Skeleton shimmer** | `skeleton` utility — animated gradient |
| **Spinner** | Standard rotating SVG |

---

## 6. Texture System

Textures are used sparingly to add premium feel without reducing readability.

| Texture | Implementation | Usage | Intensity |
|---|---|---|---|
| **Micro Dot** | `texture-subtle` | Background decoration | 0.03 opacity |
| **Titanium Gradient** | `surface-titanium` | Metric cards, widgets | Subtle gradient |
| **Acrylic Layering** | `surface-acrylic` | Floating panels | 70% to 40% opacity gradient |
| **Paper Finish** | `surface-card` | Standard cards | Clean, no texture |
| **Pearl Finish** | `surface-hero` | Hero sections | Diagonal gradient |

**Rules:**
1. Never use texture on text-bearing surfaces without ensuring contrast
2. Never combine multiple textures on the same element
3. Dark theme textures must be darker and more subtle
4. `texture-subtle` should only be used as a background layer, never on interactive elements

---

## 7. Typography System

### 7.1 Font Family

| Purpose | Family | Fallback |
|---|---|---|
| **Primary (Sans)** | Inter | ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif |
| **Monospace** | JetBrains Mono | ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace |

### 7.2 Type Scale

| Token | Size | Weight | Letter Spacing | Line Height | Usage |
|---|---|---|---|---|---|
| **Hero** | text-3xl / 30px | 600 | -0.02em | 1.2 | Page titles |
| **H1** | text-2xl / 24px | 600 | -0.02em | 1.2 | Section headings |
| **H2** | text-xl / 20px | 600 | -0.01em | 1.3 | Card titles |
| **H3** | text-lg / 18px | 600 | -0.01em | 1.3 | Sub-sections |
| **Body** | text-base / 16px | 400 | 0 | 1.5 | Body text |
| **Label** | text-sm / 14px | 500 | 0 | 1.4 | Labels, buttons |
| **Caption** | text-xs / 12px | 500 | 0.01em | 1.4 | Metadata, timestamps |
| **Micro** | text-[11px] / 11px | 600 | 0.12em | 1.2 | Uppercase labels |

### 7.3 Typography Utilities

| Utility | Purpose |
|---|---|
| `.heading-executive` | Large headings with tight letter-spacing |
| `.heading-section` | Section headings with slight letter-spacing |
| `.text-balance` | Balanced text wrapping |

---

## 8. Component Mapping Matrix

Every reusable component must adhere to the following material, elevation, color, and interaction specifications.

### 8.1 Button

| Aspect | Specification |
|---|---|
| **Material** | Varies by variant: solid (primary/secondary/destructive), glass (ghost/glass) |
| **Elevation** | Resting: Level 1 (`shadow-sm`); Hover: Level 2 (`shadow-md`) |
| **Border** | 1px with 20% opacity of base color |
| **Shadow** | `shadow-sm` resting, `shadow-md` hover + colored glow for primary/destructive |
| **Lighting** | Primary/destructive: colored glow on hover; Glass: brighter inner light |
| **Hover** | `-translate-y-[1px]` lift + shadow elevation |
| **Pressed** | `translate-y-0` + reduced shadow |
| **Focus** | `focus-visible:ring-2` with primary color |
| **Disabled** | `opacity-50`, no shadow, no transform |
| **Loading** | Spinner replaces content; `aria-busy="true"` |

### 8.2 Card

| Aspect | Specification |
|---|---|
| **Material** | Pearl Surface (`.surface-card`) |
| **Elevation** | Resting: Level 1; Hover: Level 2 |
| **Border** | 1px solid `--color-border` |
| **Radius** | `--radius-card` (1rem) |
| **Shadow** | `--shadow-card` resting, `--shadow-elevated` hover |
| **Hover** | `card-hover-lift` — translateY(-3px) + elevated shadow |
| **Padding** | sm: 12px, md: 16px, lg: 24px |

### 8.3 Sidebar

| Aspect | Specification |
|---|---|
| **Material** | Frosted Glass (`.glass`) |
| **Elevation** | Level 0 (no shadow; blur creates depth) |
| **Border** | Right border 1px `--color-border` at 50% opacity |
| **Background** | `--color-surface-glass` with blur |
| **Active Item** | Primary subtle background + `nav-glow-edge` |
| **Hover** | `bg-surface-tertiary/70` |

### 8.4 Header (Top Bar)

| Aspect | Specification |
|---|---|
| **Material** | Acrylic Glass (`.glass-panel`) |
| **Elevation** | Level 0 |
| **Border** | Bottom border 1px `--color-border` at 50% opacity |
| **Height** | 64px (h-16) |
| **Background** | Gradient glass with stronger blur |
| **Position** | Sticky top |

### 8.5 Dialog / Modal

| Aspect | Specification |
|---|---|
| **Overlay** | Modal Surface — `bg-black/40` |
| **Content** | Elevated Surface (`.surface-elevated`) |
| **Elevation** | Content: Level 2 |
| **Border** | 1px solid `--color-border` |
| **Radius** | `--radius-card` |
| **Shadow** | `--shadow-elevated` |
| **Focus** | `focus-visible:ring-2` on close button |

### 8.6 Input

| Aspect | Specification |
|---|---|
| **Material** | Input Surface (`.input-surface`) |
| **Elevation** | Level 0 |
| **Border** | 1px solid `--color-border` |
| **Shadow** | Inner shadow `inset 0 1px 2px` |
| **Focus** | Border changes to primary + 3px glow ring |
| **Radius** | `--radius-input` |
| **Disabled** | `opacity-60`, `bg-surface-secondary` |

### 8.7 Table

| Aspect | Specification |
|---|---|
| **Material** | Pearl Surface |
| **Elevation** | Level 1 (cards) or Level 0 (embedded) |
| **Border** | Row borders 1px `--color-border-subtle` |
| **Header** | `bg-surface-secondary`, uppercase micro text |
| **Hover Row** | `bg-surface-secondary/50` |
| **Selected Row** | `bg-primary-subtle` |

### 8.8 Toast / Notification

| Aspect | Specification |
|---|---|
| **Material** | Elevated Surface |
| **Elevation** | Level 3 (`--shadow-depth`) |
| **Border** | Left 3px border colored by type |
| **Shadow** | `--shadow-depth` |
| **Animation** | `toast-enter` — slide from right |

### 8.9 Command Palette / Search

| Aspect | Specification |
|---|---|
| **Overlay** | Modal Surface |
| **Container** | Elevated Surface with max-w-2xl |
| **Elevation** | Level 2 |
| **Border** | 1px solid `--color-border` |
| **Shadow** | `--shadow-elevated` |
| **Input** | No border bottom, large text |

### 8.10 Dropdown / Popover

| Aspect | Specification |
|---|---|
| **Material** | Elevated Surface |
| **Elevation** | Level 2 |
| **Border** | 1px solid `--color-border` |
| **Radius** | `--radius-card` |
| **Shadow** | `--shadow-elevated` |

---

## 9. Animation System

### 9.1 Timing

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `transition-micro` | 150ms | ease | Hover states, micro interactions |
| `transition-smooth` | 250ms | ease | Standard transitions |
| `transition-premium` | 400ms | cubic-bezier(0.16, 1, 0.3, 1) | Page transitions, premium effects |

### 9.2 Page Transitions

| Animation | Duration | Easing |
|---|---|---|
| `page-enter` | 450ms | cubic-bezier(0.16, 1, 0.3, 1) |

### 9.3 Component Transitions

| Animation | Duration | Easing |
|---|---|---|
| `toast-enter` | 350ms | cubic-bezier(0.16, 1, 0.3, 1) |
| `skeleton-shimmer` | 1.6s | ease-in-out (infinite) |

### 9.4 Press Feedback

All interactive elements should use `.press-feedback`:
- Active: `transform: scale(0.97)`
- Duration: 80ms

---

## 10. Accessibility Requirements

### 10.1 Contrast

| Element | Minimum Ratio |
|---|---|
| Body text | 4.5:1 (AA) |
| Large text (>18px) | 3:1 |
| UI components | 3:1 |
| Focus indicators | 3:1 against adjacent colors |

### 10.2 Focus Visibility

- All interactive elements must have visible focus states
- Focus ring: `focus-visible:ring-2` + offset
- Never use `outline: none` without providing an alternative

### 10.3 Motion

- Respect `prefers-reduced-motion`
- Essential animations (loading spinners) may continue
- Decorative animations should pause

### 10.4 Glass Readability

- Glass materials must only be used over known, controlled backgrounds
- Text on glass must use `--color-text` (not text-inverse unless on dark glass)
- Always test glass readability in both themes

---

## 11. Compliance Rules

### 11.1 Forbidden Patterns

The following are **strictly prohibited** in EAIP:

1. ❌ Hardcoded Tailwind colors (`text-gray-500`, `bg-red-50`, etc.)
2. ❌ Arbitrary elevation values (use only Levels 0-5)
3. ❌ Raw HTML buttons (always use `<Button>` component)
4. ❌ Custom shadows outside the system (use only `--shadow-*` tokens)
5. ❌ Custom borders outside the system (use only `--color-border*` tokens)
6. ❌ Custom colors outside the system (use only `--color-*` tokens)
7. ❌ Custom fonts outside the system (use only `--font-sans`, `--font-mono`)
8. ❌ Arbitrary radius values (use only `--radius-*` tokens)

### 11.2 Required Patterns

The following are **required** in all components:

1. ✅ All surfaces use a defined material
2. ✅ All interactive elements have hover states
3. ✅ All interactive elements have focus-visible states
4. ✅ All interactive elements have disabled states
5. ✅ All loading states are visually indicated
6. ✅ All animations use system timing tokens
7. ✅ All text uses system type scale

---

## 12. Version History

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-07-30 | Initial specification |

---

*This specification is the permanent source of truth for EAIP visual design. All future UI work must comply with this specification. No visual changes should bypass this specification.*
