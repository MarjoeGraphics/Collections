## 2025-03-12 - [Robust Icon Toggling with Lucide]
**Learning:** When using icon libraries like Lucide that replace DOM elements (e.g., `<i>` to `<svg>`), storing references to the original elements in JavaScript can lead to "detached node" issues if the replacement happens after the script runs.
**Action:** Use CSS-based toggling (e.g., targeting siblings or children of a state-carrying parent like `button[aria-expanded="true"]`) instead of direct DOM manipulation of the icon elements themselves.

## 2025-03-12 - [Accessibility-First Micro-UX]
**Learning:** Micro-UX isn't just about animations; it's about making the site usable for everyone. A "Skip to content" link and proper ARIA states are essential "touches of delight" for screen reader and keyboard users.
**Action:** Always include basic a11y scaffolding (skip links, focus states, ARIA roles) when performing UX audits.

## 2025-03-12 - [GSAP Animation vs. CSS Transitions]
**Learning:** When using GSAP to animate properties like `transform`, existing CSS `transition` rules on the same property can cause "jitter" or lag as the browser tries to interpolate between the JS-driven values.
**Action:** Explicitly remove or exclude the animated property from CSS `transition` rules when implementing JS-based interactions like magnetic effects.

## 2025-03-12 - [Gold Theme Accessibility]
**Learning:** The brand's Gold color (#c5a059) has poor contrast with white text (2.1:1). It requires a dark text color (#1a1a1a) to meet WCAG AA standards (5.5:1).
**Action:** Always check contrast for brand accent colors; don't assume white text is the default for "primary" buttons.
