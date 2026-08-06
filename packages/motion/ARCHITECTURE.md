# @eaip/motion Architecture

## Architectural Principles

1. **Information, Not Decoration**: Motion communicates state, relationship, or hierarchy.
2. **Tokenized Precision**: Durations, easings, and spring parameters are strictly defined tokens; inline magic values are prohibited.
3. **Accessibility First**: Full compliance with `prefers-reduced-motion: reduce`. All animation utilities degrade gracefully to static or immediate visual states.
4. **Tree-Shakeable & Side-Effect-Free**: Modular ESM exports allowing applications to import only what is required.
5. **No Circular Dependencies**: Reuses `@eaip/design-tokens` for base token definitions without creating circular imports.

## Token Hierarchy

```
EAIP Motion Design System v1.0
  ├── duration.ts (instant, micro, fast, normal, medium, slow, deliberate)
  ├── easing.ts (linear, ease, ease-in, ease-out, ease-in-out, premium, snappy, bounce)
  └── spring.ts (stiffness: 300, damping: 30, mass: 1)
```
