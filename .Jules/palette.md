## 2025-03-12 - [Robust Icon Toggling with Lucide]
**Learning:** When using icon libraries like Lucide that replace DOM elements (e.g., `<i>` to `<svg>`), storing references to the original elements in JavaScript can lead to "detached node" issues if the replacement happens after the script runs.
**Action:** Use CSS-based toggling (e.g., targeting siblings or children of a state-carrying parent like `button[aria-expanded="true"]`) instead of direct DOM manipulation of the icon elements themselves.

## 2025-03-12 - [Accessibility-First Micro-UX]
**Learning:** Micro-UX isn't just about animations; it's about making the site usable for everyone. A "Skip to content" link and proper ARIA states are essential "touches of delight" for screen reader and keyboard users.
**Action:** Always include basic a11y scaffolding (skip links, focus states, ARIA roles) when performing UX audits.
