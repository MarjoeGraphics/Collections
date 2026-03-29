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

## 💻 Local Development
To view the site locally and ensure all dynamic data (JSON) loads correctly, you must use a local web server due to browser security restrictions (CORS) with `file://` protocols.

### Using Python (Recommended)
If you have Python installed, run this command in the project root:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Using VS Code
Install the **Live Server** extension and click "Go Live" in the bottom status bar.

---

## 🌎 Deployment (GitHub Pages)
This portfolio is optimized for GitHub Pages.
1. Push your code to a GitHub repository.
2. Go to **Settings > Pages**.
3. Set the source to the `main` branch and folder to `/ (root)`.
4. Your site will be live at `https://<username>.github.io/<repository-name>/`.

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

## 🖼 Image Specifications & Assets
To maintain a high-end look and fast loading times, follow these guidelines for your project visuals.

### Recommended Dimensions
| Placement | Display Size (CSS) | Recommended Upload (2x for Retina) | Aspect Ratio |
| :--- | :--- | :--- | :--- |
| **Bento Card Thumbnail** | Varies (Bento Grid) | `1600 x 800px` | `2:1` |
| **Modal Main Image** | `872 x 400px` | `1744 x 800px` | `~2.18:1` |
| **Modal Mockup A/B/C** | `269 x 250px` | `540 x 500px` | `~1.08:1` |

### Pro-Tips for Assets
- **Formats:** Use `.webp` for the best balance of quality and file size. `.jpg` is a solid fallback.
- **Compression:** Run images through [TinyPNG](https://tinypng.com) or similar tools before uploading.
- **Consistency:** Use a consistent background color or style for mockups within the same project to maintain a cohesive "editorial" feel.

### Asset Organization
Place all images in the `assets/images/` directory. Organize them by project if needed:
```text
assets/
└── images/
    ├── project-a-main.webp
    ├── project-a-mockup-a.webp
    ├── energy-rebrand/
    │   ├── main.webp
    │   └── mockup-a.webp
    └── ...
```

---

## 🛠 Modular Profile Customization
Profiles are defined in `data/profiles.json`. Each profile now uses a modular structure to separate **Cards** (what you see on the home page) from **Projects** (what you see inside the modal).

### 1. The `cards` List
Define which Bento cards appear for this profile. You can override the title, description, tags, and size. You can also add a `thumbnail` path.
```json
"cards": [
  {
    "id": "visual-identity",
    "title": "Nike Brand Identity & Assets",
    "shortDesc": "Tailored description for Nike...",
    "tags": ["Branding", "Production"],
    "bentoSize": "large",
    "thumbnail": "assets/images/nike-thumb.webp"
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
      "type": "Branding & Strategy",
      "overview": "Custom overview text...",
      "details": "...",
      "result": "...",
      "images": {
        "main": "assets/images/nike-main.webp",
        "mockupA": "assets/images/nike-mock-a.webp",
        "mockupB": "assets/images/nike-mock-b.webp",
        "mockupC": "assets/images/nike-mock-c.webp"
      }
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
