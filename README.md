# Marjoe | Senior Multidisciplinary Designer

A high-impact, modern portfolio system showcasing over a decade of design leadership, strategic thinking, and production-ready visual communication.

## 🚀 The Vision
This portfolio is built with a **"Minimalist + Technical Bento"** aesthetic, emphasizing the bridge between traditional print production expertise and modern digital motion design. It utilizes advanced scroll-triggered animations (GSAP) to create a premium, immersive user experience.

## ✨ Key Features
- **Dynamic Personalization Engine:** Tailor the entire site (Hero, Bio, Skills, Work) for specific job applications using simple URL identifiers.
- **Modern Technical Bento Layout:** A responsive 12-column grid system that presents work as a curated editorial experience.
- **Modular Profile System:** Fully separate project cards from project content to allow ultimate tailoring for different companies.
- **Dual-Project Case Study Modals:** interaction pattern where a single card opens a shared modal featuring two distinct but related case studies.

---

## 🎯 Targeted Portfolio System (Recruiter UX)
This system allows you to send a recruiter a link that makes them feel like the portfolio was built specifically for them.

### How to share tailored links
Based on your URL: `https://marjoegraphics.github.io/Collections/`

| Company | Recommended Link (Clean Hash) | Alternative Link (Query Param) |
| :--- | :--- | :--- |
| **Nike** | `.../Collections/#nike` | `.../Collections/?for=nike` |
| **Apple** | `.../Collections/#apple` | `.../Collections/?for=apple` |

### Why use this?
When a recruiter clicks a tailored link:
1. The **Hero Title** changes to include their company name (e.g., "Marjoe + Nike").
2. The **Bio & Philosophy** update to reflect the specific values of that company.
3. The **Featured Work** is completely customized—showing specific cards and specific projects that match their needs.

---

## 🛠 Modular Profile Customization
Profiles are defined in `data/profiles.json`. Each profile now uses a modular structure to separate **Cards** (what you see on the home page) from **Projects** (what you see inside the modal).

### 1. The `cards` List
Define which Bento cards appear for this profile. You can override the title, description, tags, and size.
```json
"cards": [
  {
    "id": "visual-identity",
    "title": "Nike Brand Identity & Assets",
    "shortDesc": "Tailored description for Nike...",
    "tags": ["Branding", "Production"],
    "bentoSize": "large"
  }
]
```

### 2. The `projects` Library
Define the specific case studies that appear inside the modal when a card is clicked. Link them using the **Card ID**.
```json
"projects": {
  "visual-identity": [
    {
      "id": "nike-identity",
      "name": "Nike Brand Identity",
      "overview": "Custom overview text...",
      "result": "Success metrics for Nike...",
      "images": { ... }
    }
  ]
}
```

### 3. Linking them together
The system automatically links the `cards` to the `projects` list using the `id` field. If you define a card with `id: "visual-identity"`, the site will look for `projects["visual-identity"]` in the same profile to populate the modal.

---

## 🛠 General Maintenance
### Adding Global Projects
1. Open `data/projects.json`.
2. Add a new object to the array. This serves as the fallback if a profile doesn't have custom projects defined.

### Site Settings
Edit `data/config.json` to change your global email, default skills, or site title.

---
© 2024 Marjoe. Designed with intentionality and precision.
