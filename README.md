# Marjoe | Senior Multidisciplinary Designer

A high-impact, modern portfolio system showcasing over a decade of design leadership, strategic thinking, and production-ready visual communication.

## 🚀 The Vision
This portfolio is built with a **"Minimalist + Technical Bento"** aesthetic, emphasizing the bridge between traditional print production expertise and modern digital motion design. It utilizes advanced scroll-triggered animations (GSAP) to create a premium, immersive user experience.

## ✨ Key Features
- **Dynamic Personalization Engine:** Tailor the entire site (Hero, Bio, Skills, Work) for specific job applications using simple URL identifiers.
- **Modern Technical Bento Layout:** A responsive 12-column grid system that presents work as a curated editorial experience.
- **Scroll-Triggered Parallax Overlap:** Sophisticated hero animations where text elements physically overlap on scroll, creating visual depth.
- **Dual-Project Case Study Modals:** interaction pattern where a single card opens a shared modal featuring two distinct but related case studies.
- **Maintainable Architecture:** Content (JSON) is decoupled from logic (JS) and layout (HTML/CSS).

---

## 🎯 Targeted Portfolio System (Recruiter UX)
This system allows you to send a recruiter a link that makes them feel like the portfolio was built specifically for them.

### How to share tailored links
Based on your URL: `https://marjoegraphics.github.io/Collections/`

| Company | Recommended Link (Clean Hash) | Alternative Link (Query Param) |
| :--- | :--- | :--- |
| **Nike** | `.../Collections/#nike` | `.../Collections/?for=nike` |
| **Apple** | `.../Collections/#apple` | `.../Collections/?for=apple` |
| **Adobe** | `.../Collections/#adobe` | `.../Collections/?for=adobe` |

### Why use this?
When a recruiter clicks a tailored link:
1. The **Hero Title** changes to include their company name (e.g., "Marjoe + Apple").
2. The **Bio & Philosophy** update to reflect the specific values of that company.
3. The **Skills & Toolkit** prioritize the software they actually use.
4. The **Project Order** changes to show the most relevant work first.
5. The **Contact CTA** mentions them directly (e.g., "Let's build the next generation of products at Apple").

---

## 🛠 Step-by-Step: Customizing for a Company
Follow this guide to create a tailored experience for a new application.

### 1. Define the Profile
Open `data/profiles.json` and add a new entry (e.g., `"google": { ... }`).
Define overrides for `portfolioTitle`, `role`, `description`, `introLead`, `philosophy`, and `cta`.

### 2. Tailor Skills & Work
Set `featuredProjectIds` to reorder projects, and customize the `expertise` and `toolkit` arrays to match the job description.

### 3. Override Specific Projects (Ultimate Tailoring)
Use the `projectOverrides` object within a profile to customize what is displayed for each project card.
- **Card Overrides**: Change the `title`, `shortDesc`, and `tags` of the Bento grid cards.
- **Modal Overrides**: Completely replace the `projects` array within a card to show entirely different case studies (e.g., "Brand Identity" instead of "Energy Rebrand") for a specific company.
- **Inner Overrides**: Modify the `name`, `overview`, and `result` of specific sub-projects.

### 4. Apply Brand Styling
In `css/styles.css`, add a theme class:
```css
.theme-companyname {
  --accent-color: #YOURCOLOR;
}
```

---

## 🛠 General Maintenance
### Adding Projects
1. Open `data/projects.json`.
2. Add a new object to the array. Note the `id` for reordering in profiles.
3. Update `assets/images/` and link the paths in the JSON.

### Site Settings
Edit `data/config.json` to change your global email, default skills, or site title.

---
© 2024 Marjoe. Designed with intentionality and precision.
