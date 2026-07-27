document.addEventListener('DOMContentLoaded', () => {
    let projectsData = [];
    let configData = {};
    let profilesData = {};
    let activeProfile = null;

    // URL Parsing for Company Detection
    function getCompanyFromURL() {
        // Prioritize query parameter "?for=company" as it is most reliable for GitHub Pages
        const search = new URLSearchParams(window.location.search).get('for');

        // Secondary: check for hash-based identifier "#company" (clean and static-friendly)
        const hash = window.location.hash.substring(1);

        // Tertiary: check for path-based identifier in case of custom routing
        const path = window.location.pathname.toLowerCase();
        const pathMatch = path.match(/\/(?:collections|for)\/([^\/]+)/);

        const company = search || hash || (pathMatch ? pathMatch[1] : null);

        console.log('Detected Company Identifier:', company);
        return company?.toLowerCase();
    }

    // Free-form company query param detection (?company=Acme)
    function getFreeFormCompanyFromURL() {
        const companyParam = new URLSearchParams(window.location.search).get('company');
        if (companyParam) {
            // Capitalize each word of the company name
            return companyParam
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
        return null;
    }

    // Fetch All Data
    async function loadData() {
        try {
            const [configRes, projectsRes, profilesRes] = await Promise.all([
                fetch('data/config.json'),
                fetch('data/projects.json'),
                fetch('data/profiles.json')
            ]);

            configData = await configRes.json();
            projectsData = await projectsRes.json();
            profilesData = await profilesRes.json();

            const company = getCompanyFromURL();
            if (company && profilesData[company]) {
                activeProfile = profilesData[company];
                applyProfileOverrides();
            }

            initPortfolio();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to basic init if any data fails
            initPortfolio();
        }
    }

    // Personalization Overrides
    function applyProfileOverrides() {
        console.log('Applying profile overrides for:', activeProfile.heroTitle);

        // Merge profile into config
        configData.portfolioTitle = activeProfile.heroTitle;
        configData.role = activeProfile.role;
        configData.description = activeProfile.description;
        configData.about.lead = activeProfile.introLead || configData.about.lead;
        configData.about.philosophy = activeProfile.philosophy || configData.about.philosophy;

        // Add specific theme class to body
        if (activeProfile.themeClass) document.body.classList.add(activeProfile.themeClass);
    }

    function initPortfolio() {
        populateConfig();
        // Since the filter bar is removed, we always render the main project set.
        // Profiles still handle prioritization internally in renderProjects.
        renderProjects('all');
        initCommonUI();
        initTheme();
        initParticles();
        initAnimations();
    }

    // Populate Config-based Content
    function populateConfig() {
        // Browser tab title
        document.title = activeProfile
            ? `${activeProfile.heroTitle} - Portfolio`
            : `${configData.portfolioTitle} - Portfolio`;

        // Navbar branding - Always "Marjoe" or the name from config
        document.getElementById('site-branding').textContent = configData.name;
        document.getElementById('hero-role').textContent = configData.role;

        // Use custom hero headline if profile exists, otherwise check free-form company param
        const heroTitleElem = document.getElementById('hero-title');
        const heroDescElem = document.getElementById('hero-description');
        const freeFormCompany = getFreeFormCompanyFromURL();

        if (activeProfile) {
            heroTitleElem.textContent = activeProfile.heroTitle;
            heroDescElem.textContent = configData.description;
        } else if (freeFormCompany) {
            heroTitleElem.textContent = `Hey ${freeFormCompany} Team, I'm ${configData.name}`;
            heroDescElem.textContent = `Let's collaborate to bring ${freeFormCompany}'s vision to life with strategic, production-ready design.`;
        } else {
            heroTitleElem.textContent = "Where Strategic Design Meets Technical Precision.";
            heroDescElem.textContent = configData.description;
        }
        document.getElementById('hero-location').textContent = configData.location;

        document.getElementById('about-title').textContent = configData.about.title;
        document.getElementById('about-lead').textContent = configData.about.lead;
        document.getElementById('about-bio').textContent = configData.about.bio;
        document.getElementById('about-philosophy').textContent = configData.about.philosophy;

        // Populate Skills as glass cards (divs) instead of <li> pills
        const expertiseList = document.getElementById('expertise-list');
        const toolkitList = document.getElementById('toolkit-list');
        const expertiseData = activeProfile?.expertise || configData.defaultExpertise;
        const toolkitData = activeProfile?.toolkit || configData.defaultToolkit;

        expertiseList.innerHTML = expertiseData.map(item => `<div class="skill-card">${item}</div>`).join('');
        toolkitList.innerHTML = toolkitData.map(item => `<div class="skill-card">${item}</div>`).join('');

        const contactDescElem = document.getElementById('contact-description');
        contactDescElem.textContent = activeProfile?.cta ? activeProfile.cta : "Ready to elevate your brand with intentional, production-ready design? I'm currently accepting new projects and creative collaborations.";

        document.getElementById('contact-email').textContent = configData.contact.email;
        document.getElementById('contact-email').href = `mailto:${configData.contact.email}`;

        document.getElementById('social-instagram').href = configData.contact.social.instagram;
        document.getElementById('social-linkedin').href = configData.contact.social.linkedin;
        document.getElementById('social-behance').href = configData.contact.social.behance;

        document.getElementById('footer-name').textContent = configData.name;
        document.getElementById('year').textContent = new Date().getFullYear();

        initContactFormAndCopy();
    }

    // Initialize Copy Email & Contact Form Handler
    function initContactFormAndCopy() {
        const copyBtn = document.getElementById('copy-email-btn');
        const tooltip = document.getElementById('copy-tooltip');

        if (copyBtn && !copyBtn.dataset.listenerAdded) {
            copyBtn.dataset.listenerAdded = 'true';
            copyBtn.addEventListener('click', () => {
                const emailText = configData.contact?.email || 'marjoegraphics@gmail.com';
                navigator.clipboard.writeText(emailText).then(() => {
                    // Visual feedback
                    const iconElem = copyBtn.querySelector('[data-lucide]') || copyBtn.querySelector('svg');
                    if (iconElem) {
                        iconElem.setAttribute('data-lucide', 'check');
                        lucide.createIcons();
                    }
                    if (tooltip) {
                        tooltip.textContent = 'Copied!';
                        tooltip.classList.add('visible');
                    }

                    setTimeout(() => {
                        const activeIcon = copyBtn.querySelector('[data-lucide]') || copyBtn.querySelector('svg');
                        if (activeIcon) {
                            activeIcon.setAttribute('data-lucide', 'copy');
                            lucide.createIcons();
                        }
                        if (tooltip) {
                            tooltip.textContent = 'Copy email';
                            tooltip.classList.remove('visible');
                        }
                    }, 2000);
                }).catch(err => {
                    console.error('Could not copy email: ', err);
                });
            });
        }

        const contactForm = document.getElementById('contact-form');
        if (contactForm && !contactForm.dataset.listenerAdded) {
            contactForm.dataset.listenerAdded = 'true';
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('form-name').value;
                const email = document.getElementById('form-email').value;
                const message = document.getElementById('form-message').value;
                const targetEmail = configData.contact?.email || 'marjoegraphics@gmail.com';

                const subject = encodeURIComponent(`Inquiry from ${name}`);
                const body = encodeURIComponent(
                    `Name: ${name}\n` +
                    `Email: ${email}\n\n` +
                    `Message:\n${message}`
                );

                window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
            });
        }
    }

    // Render Projects with category groupings and horizontal scrolling tracks
    function renderProjects(filter) {
        const container = document.getElementById('project-grid');
        container.innerHTML = '';

        // We group into categories:
        // Key is category name, Value is list of card display objects
        const groupedCategories = {};

        if (activeProfile?.cards && filter === 'all') {
            // Under active profile, all cards go under a single "Featured Work" category
            const categoryName = "Featured Work";
            groupedCategories[categoryName] = [];
            activeProfile.cards.forEach(cardData => {
                const baseProject = projectsData.find(p => p.id === cardData.id) || {};
                groupedCategories[categoryName].push({ ...baseProject, ...cardData });
            });
        } else {
            // Default (or backup) filtering/rendering
            let filtered = [];
            if (filter === 'all') {
                // Respect featuredProjectIds ordering if exists
                const featuredIds = activeProfile?.featuredProjectIds || configData.featuredProjectIds;
                if (featuredIds) {
                    filtered = featuredIds
                        .map(id => projectsData.find(p => p.id === id))
                        .filter(p => p !== undefined);
                } else {
                    filtered = [...projectsData];
                }
            } else {
                filtered = projectsData.filter(p => p.category === filter || p.tags.includes(filter));
            }

            // Group by category field
            filtered.forEach(proj => {
                const cat = proj.category || "Uncategorized";
                if (!groupedCategories[cat]) {
                    groupedCategories[cat] = [];
                }
                groupedCategories[cat].push(proj);
            });
        }

        // Now render each category
        Object.entries(groupedCategories).forEach(([categoryName, cards]) => {
            if (cards.length === 0) return;

            // Create Category Section Block
            const catSection = document.createElement('div');
            catSection.className = 'project-category-section';

            // Create Category Header
            const catHeader = document.createElement('div');
            catHeader.className = 'project-category-header';
            catHeader.innerHTML = `<h3>${categoryName}</h3><div class="category-line"></div>`;
            catSection.appendChild(catHeader);

            // Create Horizontal Track
            const track = document.createElement('div');
            track.className = 'project-track';

            cards.forEach((displayCard, index) => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.setAttribute('data-project-id', displayCard.id);

                const num = (index + 1).toString().padStart(2, '0');

                const customProjects = activeProfile?.projects?.[displayCard.id];
                const isDual = customProjects ? customProjects.length > 1 : displayCard.isDual;

                const baseProject = projectsData.find(p => p.id === displayCard.id) || {};
                const firstProject = customProjects?.[0] || baseProject.projects?.[0];
                const thumbnail = displayCard.thumbnail || firstProject?.images?.main;

                card.innerHTML = `
                    <div class="card-bg" ${thumbnail ? `style="background-image: url('${thumbnail}'); background-size: cover;"` : ''}></div>
                    ${isDual ? '<div class="card-split-indicator"></div>' : ''}
                    <div class="card-content">
                        <div class="card-header">
                            <span class="card-category">${displayCard.tags ? displayCard.tags.join(' & ') : ''}</span>
                            <span class="card-number">${num}</span>
                        </div>
                        <h2>${displayCard.title}</h2>
                        <p>${displayCard.shortDesc}</p>
                        <span class="card-link">Explore ${isDual ? 'Dual ' : ''}Case Study <i data-lucide="arrow-right"></i></span>
                    </div>
                `;

                card.addEventListener('click', () => openModal(displayCard.id));
                track.appendChild(card);
            });

            catSection.appendChild(track);
            container.appendChild(catSection);
        });

        lucide.createIcons();

        // Reveal animations per track/card
        gsap.from(".project-card", {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#project-grid",
                start: "top 80%"
            }
        });
    }

    // Modal Logic
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');

    function openModal(projectId) {
        // 1. Check for custom project list in the new modular structure
        let projectsList = activeProfile?.projects?.[projectId];

        // 2. Fallback to original project data
        if (!projectsList) {
            const originalData = projectsData.find(p => p.id === projectId);
            if (!originalData) return;

            // Apply legacy Card-Level Overrides if they exist
            const cardOverride = activeProfile?.projectOverrides?.[projectId];
            const data = cardOverride ? { ...originalData, ...cardOverride } : originalData;
            projectsList = data.projects;
        }

        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = '';

        projectsList.forEach((proj, i) => {
            // Apply legacy Inner Project Overrides from Active Profile (by inner project id)
            const override = activeProfile?.projectOverrides?.[proj.id];
            const displayData = override ? { ...proj, ...override } : proj;

            const section = document.createElement('div');
            section.className = 'project-split-section';
            section.innerHTML = `
                <div class="modal-header">
                    <span class="project-type">${displayData.type}</span>
                    <h2 class="project-name">${displayData.name}</h2>
                </div>
                <section class="cs-intro">
                    <h3>Overview</h3>
                    <p>${displayData.overview}</p>
                </section>
                <div class="cs-details-grid">
                    <section class="cs-detail-item">
                        <h3>Problem & Solution</h3>
                        <p>${displayData.details}</p>
                    </section>
                    <section class="cs-detail-item highlight">
                        <h3>Impact</h3>
                        <p>${displayData.result}</p>
                    </section>
                </div>
                <section class="cs-visuals">
                    <div class="visual-placeholder main-visual" ${displayData.images?.main ? `style="background-image: url('${displayData.images.main}'); background-size: cover;"` : ''}>
                        ${!displayData.images?.main ? `Visualizing: ${displayData.name}` : ''}
                    </div>
                    <div class="visual-grid">
                        <div class="visual-placeholder" ${displayData.images?.mockupA ? `style="background-image: url('${displayData.images.mockupA}'); background-size: cover;"` : ''}>
                            ${!displayData.images?.mockupA ? 'Mockup A' : ''}
                        </div>
                        <div class="visual-placeholder" ${displayData.images?.mockupB ? `style="background-image: url('${displayData.images.mockupB}'); background-size: cover;"` : ''}>
                            ${!displayData.images?.mockupB ? 'Mockup B' : ''}
                        </div>
                        <div class="visual-placeholder" ${displayData.images?.mockupC ? `style="background-image: url('${displayData.images.mockupC}'); background-size: cover;"` : ''}>
                            ${!displayData.images?.mockupC ? 'Mockup C' : ''}
                        </div>
                    </div>
                </section>
            `;
            modalBody.appendChild(section);

            if (i < projectsList.length - 1) {
                const sep = document.createElement('div');
                sep.className = 'modal-separator';
                modalBody.appendChild(sep);
            }
        });

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        gsap.from(".project-split-section", { y: 30, opacity: 0, stagger: 0.2, duration: 0.8, ease: "power2.out" });
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // --- RE-INTEGRATED COMMON UI LOGIC ---

    function initCommonUI() {
        // Mobile Menu
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-menu');
        if (menuToggle && menu) {
            menuToggle.addEventListener('click', () => {
                const active = menu.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', active);
            });
        }

        // Magnetic Effect
        const magnetic = document.querySelectorAll('.footer-btn, .scroll-down, .nav-links a, #theme-toggle, .filter-btn');
        magnetic.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const isCentered = btn.classList.contains('scroll-down');
                gsap.to(btn, {
                    x: x * 0.4,
                    xPercent: isCentered ? -50 : 0,
                    y: y * 0.4,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });
            btn.addEventListener('mouseleave', () => {
                const isCentered = btn.classList.contains('scroll-down');
                gsap.to(btn, {
                    x: 0,
                    xPercent: isCentered ? -50 : 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.5)"
                });
            });
        });

        // Scroll Progress
        gsap.to("#scroll-progress", {
            width: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3
            }
        });
    }

    function initTheme() {
        const themeBtn = document.getElementById('theme-toggle');
        const body = document.body;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') body.setAttribute('data-theme', 'dark');

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const isDark = body.hasAttribute('data-theme');
                if (isDark) {
                    body.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                } else {
                    body.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                }
                gsap.to(themeBtn, { rotation: "+=360", duration: 0.5 });
            });
        }
    }

    function initParticles() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class P {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.vx = Math.random() * 0.5 - 0.25;
                this.vy = Math.random() * 0.5 - 0.25;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x > canvas.width) this.x = 0; else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0; else if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = 'rgba(197, 160, 89, 0.2)';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
            }
        }

        for(let i=0; i<80; i++) particles.push(new P());
        function anim() {
            ctx.clearRect(0,0,canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(anim);
        }
        anim();
    }

    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Parallax
        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero", start: "top top", end: "bottom top", scrub: true, pin: true, pinSpacing: false
            }
        });
        heroTl.to("#hero-title", { y: 300, ease: "none" }, 0);
        heroTl.to("#hero-description", { y: 100, ease: "none" }, 0);
        heroTl.to(".hero-bg-container", { opacity: 0.5, scale: 1.1, ease: "none" }, 0);

        // Sections reveal
        gsap.from(".about-text, .contact-content", {
            scrollTrigger: { trigger: ".about-section", start: "top 80%" },
            y: 30, opacity: 0, duration: 1, stagger: 0.2
        });
    }

    loadData();
});
