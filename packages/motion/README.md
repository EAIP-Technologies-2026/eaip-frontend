# @eaip/motion

The official foundation motion and animation system package for the Enterprise Autonomous Intelligence Platform (EAIP).

## Overview

`@eaip/motion` provides pure foundational motion primitives, token definitions (durations, easings, spring parameters), accessibility utilities (`useReducedMotion`), and CSS custom variables compliant with **EAIP Motion Design System v1.0**.

It contains **no product-specific screen animations or UI redesigns**. Product animation references are documented under `references/`.

## Installation

```json
{
  "dependencies": {
    "@eaip/motion": "workspace:*"
  }
}
```

## Structure

- `src/tokens/`: Pure duration, easing, and spring tokens.
- `src/hooks/`: React hooks for accessibility (`useReducedMotion`).
- `src/animations/`: Reusable primitive transition configurations (fade, slide, scale).
- `src/css/`: CSS custom properties and reduced-motion fallback declarations.
- `references/`: Architecture documentation for approved motion references (pending external asset linkage).
