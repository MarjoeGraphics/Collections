# Marjoe M. Salto | Senior Multidisciplinary Designer

A high-impact, modern portfolio showcasing over a decade of design leadership, strategic thinking, and production-ready visual communication.

## 🚀 The Vision
This portfolio is built with a **"Minimalist + Technical Bento"** aesthetic, emphasizing the bridge between traditional print production expertise and modern digital motion design. It utilizes advanced scroll-triggered animations to create a premium, immersive user experience.

## ✨ Key Features
- **Modern Technical Bento Layout:** A responsive 12-column grid system that presents work as a curated editorial experience.
- **Scroll-Triggered Parallax Overlap:** Complex GSAP-driven hero animations where text elements physicaly overlap on scroll, creating visual depth.
- **Dual-Project Case Study Modals:** A unique interaction pattern where each bento card opens a shared modal featuring two distinct but related case studies.
- **Context-Aware Custom Cursor:** A dual-element smooth-follow cursor that scales and reacts to interactive UI elements.
- **Senior Persona-Driven Copy:** Professional narratives focused on design thinking, strategic problem solving, and real-world impact.

## 🛠 Tech Stack
- **Frontend:** Semantic HTML5, CSS3 (Modern features: Grid, Flexbox, Backdrop-blur, Clamp)
- **Animation:** GSAP 3 (GreenSock Animation Platform) + ScrollTrigger Plugin
- **Typography:** Archivo Narrow (Headings/Branding) & Plus Jakarta Sans (UI/Body)
- **Icons:** Lucide Icons
- **Performance:** Optimized for smooth 60fps animations with minimal dependency overhead.

## 📂 Repository Structure
- `index.html`: Main portfolio entry point.
- `css/styles.css`: Centralized luxury design system and layout logic.
- `js/script.js`: Core animation engine, project data, and interactive modal logic.

---

## 🎯 Targeted Portfolio System
This portfolio features a dynamic personalization engine that adapts the content and design based on the company you are applying to.

### How to create a targeted URL
The most reliable way to generate a tailored view for a specific company is using the following URL formats.

Based on your URL `https://marjoegraphics.github.io/Collections/`, you can use:

1. **Clean Hash Method (Recommended):**
   `https://marjoegraphics.github.io/Collections/#nike`

2. **Query Parameter Method:**
   `https://marjoegraphics.github.io/Collections/?for=apple`

3. **Explicit Method:**
   `https://marjoegraphics.github.io/Collections/index.html?for=adobe`

### How to add a new company profile
1. Open `data/profiles.json`.
2. Add a new object with the company's identifier (e.g., `"google": { ... }`).
3. Define the overrides for `portfolioTitle`, `role`, `description`, `introLead`, `philosophy`, and `cta`.
4. (Optional) Define a `themeClass` and add corresponding CSS in `styles.css` to adjust brand colors or typography.

---

## 🛠 Maintenance & Customization
This portfolio is refactored to separate content from layout. You can update your site without touching the HTML/CSS.

### How to add/edit projects
1. Open `data/projects.json`.
2. Add a new object to the array following the existing structure.
3. If you want a "Dual" case study (showing two projects in one modal), set `"isDual": true` and provide two objects in the `"projects"` array.
4. Update `"tags"` to control how the project is filtered.

### How to change site settings
1. Open `data/config.json`.
2. Update the fields like `portfolioTitle`, `role`, `description`, or `contact` info.
3. The site branding, hero section, and contact links will update automatically.

### How to update images
1. Place your new image files in `assets/images/`.
2. Update the image paths in `data/projects.json` (e.g., `"assets/images/my-new-project.jpg"`).

### GitHub Pages Compatibility
The site is purely static (HTML/JS/CSS/JSON). Simply push your changes to your GitHub repository and it will serve automatically via GitHub Pages.

---
© 2024 Marjoe M. Salto. Designed with intentionality and precision.
