document.addEventListener('DOMContentLoaded', () => {
    let projectsData = [];
    let configData = {};
    let profilesData = {};
    let activeProfile = null;

    // Escape text before interpolating into innerHTML to prevent HTML/script injection.
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Neutralize characters that could break out of a CSS url('...') context.
    function safeImageUrl(value) {
        return String(value ?? '').replace(/["'()\\<>\s]/g, encodeURIComponent);
    }

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

        // Use custom hero headline if profile exists, otherwise default
        const heroTitleElem = document.getElementById('hero-title');
        heroTitleElem.textContent = activeProfile
            ? activeProfile.heroTitle
            : "Where Strategic Design Meets Technical Precision.";

        document.getElementById('hero-description').textContent = configData.description;
        document.getElementById('hero-location').textContent = configData.location;

        document.getElementById('about-title').textContent = configData.about.title;
        document.getElementById('about-lead').textContent = configData.about.lead;
        document.getElementById('about-bio').textContent = configData.about.bio;
        document.getElementById('about-philosophy').textContent = configData.about.philosophy;

        // Populate Skills
        const expertiseList = document.getElementById('expertise-list');
        const toolkitList = document.getElementById('toolkit-list');
        const expertiseData = activeProfile?.expertise || configData.defaultExpertise;
        const toolkitData = activeProfile?.toolkit || configData.defaultToolkit;

        expertiseList.innerHTML = expertiseData.map(item => `<li>${escapeHtml(item)}</li>`).join('');
        toolkitList.innerHTML = toolkitData.map(item => `<li>${escapeHtml(item)}</li>`).join('');

        const contactDescElem = document.getElementById('contact-description');
        contactDescElem.textContent = activeProfile?.cta ? activeProfile.cta : "Ready to elevate your brand with intentional, production-ready design? I'm currently accepting new projects and creative collaborations.";

        document.getElementById('contact-email').textContent = configData.contact.email;
        document.getElementById('contact-email').href = `mailto:${configData.contact.email}`;

        document.getElementById('social-instagram').href = configData.contact.social.instagram;
        document.getElementById('social-linkedin').href = configData.contact.social.linkedin;
        document.getElementById('social-behance').href = configData.contact.social.behance;

        document.getElementById('footer-name').textContent = configData.name;
        document.getElementById('year').textContent = new Date().getFullYear();
    }

    // Render Projects Grid
    function renderProjects(filter) {
        const grid = document.getElementById('project-grid');
        grid.innerHTML = '';

        let filtered = [];

        // 1. Check if the active profile has a modular "cards" definition
        if (activeProfile?.cards && filter === 'all') {
            filtered = activeProfile.cards;
        } else {
            // Fallback to original filtering logic
            filtered = filter === 'all'
                ? projectsData
                : projectsData.filter(p => p.category === filter || p.tags.includes(filter));

            // Determine which featured project list to use
            const featuredIds = activeProfile?.featuredProjectIds || configData.featuredProjectIds;

            // Sort or filter based on featured IDs if they exist
            if (featuredIds) {
                if (filter === 'all') {
                    filtered = featuredIds
                        .map(id => projectsData.find(p => p.id === id))
                        .filter(p => p !== undefined);
                } else {
                    filtered.sort((a, b) => {
                        const indexA = featuredIds.indexOf(a.id);
                        const indexB = featuredIds.indexOf(b.id);
                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;
                        return 0;
                    });
                }
            }
        }

        filtered.forEach((cardData, index) => {
            // Look for a match in projectsData for defaults, but prioritize cardData
            const baseProject = projectsData.find(p => p.id === cardData.id) || {};
            const displayCard = { ...baseProject, ...cardData };

            const card = document.createElement('div');
            card.className = `project-card bento-item-${displayCard.bentoSize || 'medium'}`;
            card.setAttribute('data-project-id', displayCard.id);

            const num = (index + 1).toString().padStart(2, '0');

            // Determine if it should show as a Dual Case Study
            // If the profile has custom projects for this card, check that list.
            const customProjects = activeProfile?.projects?.[displayCard.id];
            const isDual = customProjects ? customProjects.length > 1 : displayCard.isDual;

            // Thumbnail support: use displayCard.thumbnail or the first project's main image as fallback
            // Prioritize custom profile projects, then base projectsData
            const firstProject = customProjects?.[0] || baseProject.projects?.[0];
            const thumbnail = displayCard.thumbnail || firstProject?.images?.main;

            card.innerHTML = `
                <div class="card-bg" ${thumbnail ? `style="background-image: url('${safeImageUrl(thumbnail)}'); background-size: cover;"` : ''}></div>
                ${isDual ? '<div class="card-split-indicator"></div>' : ''}
                <div class="card-content">
                    <div class="card-header">
                        <span class="card-category">${displayCard.tags ? escapeHtml(displayCard.tags.join(' & ')) : ''}</span>
                        <span class="card-number">${escapeHtml(num)}</span>
                    </div>
                    <h2>${escapeHtml(displayCard.title)}</h2>
                    <p>${escapeHtml(displayCard.shortDesc)}</p>
                    <span class="card-link">Explore ${isDual ? 'Dual ' : ''}Case Study <i data-lucide="arrow-right"></i></span>
                </div>
            `;

            card.addEventListener('click', () => openModal(displayCard.id));
            grid.appendChild(card);
        });

        lucide.createIcons();

        // Reveal animations
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
                    <span class="project-type">${escapeHtml(displayData.type)}</span>
                    <h2 class="project-name">${escapeHtml(displayData.name)}</h2>
                </div>
                <section class="cs-intro">
                    <h3>Overview</h3>
                    <p>${escapeHtml(displayData.overview)}</p>
                </section>
                <div class="cs-details-grid">
                    <section class="cs-detail-item">
                        <h3>Problem & Solution</h3>
                        <p>${escapeHtml(displayData.details)}</p>
                    </section>
                    <section class="cs-detail-item highlight">
                        <h3>Impact</h3>
                        <p>${escapeHtml(displayData.result)}</p>
                    </section>
                </div>
                <section class="cs-visuals">
                    <div class="visual-placeholder main-visual" ${displayData.images?.main ? `style="background-image: url('${safeImageUrl(displayData.images.main)}'); background-size: cover;"` : ''}>
                        ${!displayData.images?.main ? `Visualizing: ${escapeHtml(displayData.name)}` : ''}
                    </div>
                    <div class="visual-grid">
                        <div class="visual-placeholder" ${displayData.images?.mockupA ? `style="background-image: url('${safeImageUrl(displayData.images.mockupA)}'); background-size: cover;"` : ''}>
                            ${!displayData.images?.mockupA ? 'Mockup A' : ''}
                        </div>
                        <div class="visual-placeholder" ${displayData.images?.mockupB ? `style="background-image: url('${safeImageUrl(displayData.images.mockupB)}'); background-size: cover;"` : ''}>
                            ${!displayData.images?.mockupB ? 'Mockup B' : ''}
                        </div>
                        <div class="visual-placeholder" ${displayData.images?.mockupC ? `style="background-image: url('${safeImageUrl(displayData.images.mockupC)}'); background-size: cover;"` : ''}>
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
