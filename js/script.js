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

    // Helper function to resolve inner project list for a card ID
    function getProjectsListForCard(cardId) {
        let projectsList = activeProfile?.projects?.[cardId];
        if (!projectsList) {
            const originalData = projectsData.find(p => p.id === cardId);
            if (!originalData) return [];
            const cardOverride = activeProfile?.projectOverrides?.[cardId];
            const data = cardOverride ? { ...originalData, ...cardOverride } : originalData;
            projectsList = data.projects || [];
        }
        return projectsList;
    }

    // Render Projects inline directly on the main page flow
    function renderProjects(filter) {
        const container = document.getElementById('project-grid');
        container.innerHTML = '';

        const groupedCategories = {};

        if (activeProfile?.cards && filter === 'all') {
            const categoryName = "Featured Work";
            groupedCategories[categoryName] = [];
            activeProfile.cards.forEach(cardData => {
                const baseProject = projectsData.find(p => p.id === cardData.id) || {};
                groupedCategories[categoryName].push({ ...baseProject, ...cardData });
            });
        } else {
            let filtered = [];
            if (filter === 'all') {
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

            filtered.forEach(proj => {
                const cat = proj.category || "Uncategorized";
                if (!groupedCategories[cat]) {
                    groupedCategories[cat] = [];
                }
                groupedCategories[cat].push(proj);
            });
        }

        Object.entries(groupedCategories).forEach(([categoryName, cards]) => {
            if (cards.length === 0) return;

            const catSection = document.createElement('div');
            catSection.className = 'project-category-section';

            const catHeader = document.createElement('div');
            catHeader.className = 'project-category-header';
            catHeader.innerHTML = `<h3>${categoryName}</h3><div class="category-line"></div>`;
            catSection.appendChild(catHeader);

            cards.forEach((displayCard, index) => {
                const cardBlock = document.createElement('div');
                cardBlock.className = 'inline-case-study-card';
                cardBlock.setAttribute('id', `case-study-${displayCard.id}`);

                const num = (index + 1).toString().padStart(2, '0');
                const projectsList = getProjectsListForCard(displayCard.id);

                let projectsHTML = '';
                projectsList.forEach((proj, i) => {
                    const override = activeProfile?.projectOverrides?.[proj.id];
                    const displayData = override ? { ...proj, ...override } : proj;

                    projectsHTML += `
                        <div class="case-study-inner-item">
                            <div class="case-study-sub-header">
                                <span class="project-type">${displayData.type}</span>
                                <h3 class="project-name">${displayData.name}</h3>
                            </div>
                            <div class="cs-intro">
                                <h4>Overview</h4>
                                <p>${displayData.overview}</p>
                            </div>
                            <div class="cs-details-grid">
                                <div class="cs-detail-item">
                                    <h4>Problem & Solution</h4>
                                    <p>${displayData.details}</p>
                                </div>
                                <div class="cs-detail-item highlight">
                                    <h4>Impact</h4>
                                    <p>${displayData.result}</p>
                                </div>
                            </div>
                            <div class="cs-visuals">
                                <div class="visual-placeholder main-visual" ${displayData.images?.main ? `style="background-image: url('${displayData.images.main}'); background-size: cover; background-position: center;"` : ''}>
                                    ${!displayData.images?.main ? `Visualizing: ${displayData.name}` : ''}
                                </div>
                                <div class="visual-grid">
                                    <div class="visual-placeholder" ${displayData.images?.mockupA ? `style="background-image: url('${displayData.images.mockupA}'); background-size: cover; background-position: center;"` : ''}>
                                        ${!displayData.images?.mockupA ? 'Mockup A' : ''}
                                    </div>
                                    <div class="visual-placeholder" ${displayData.images?.mockupB ? `style="background-image: url('${displayData.images.mockupB}'); background-size: cover; background-position: center;"` : ''}>
                                        ${!displayData.images?.mockupB ? 'Mockup B' : ''}
                                    </div>
                                    <div class="visual-placeholder" ${displayData.images?.mockupC ? `style="background-image: url('${displayData.images.mockupC}'); background-size: cover; background-position: center;"` : ''}>
                                        ${!displayData.images?.mockupC ? 'Mockup C' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${i < projectsList.length - 1 ? '<div class="case-study-inner-separator"></div>' : ''}
                    `;
                });

                cardBlock.innerHTML = `
                    <div class="case-study-main-header">
                        <div class="case-study-meta">
                            <span class="card-category">${displayCard.tags ? displayCard.tags.join(' & ') : ''}</span>
                            <span class="card-number">${num}</span>
                        </div>
                        <h2>${displayCard.title}</h2>
                        <p class="case-study-short-desc">${displayCard.shortDesc}</p>
                    </div>
                    <div class="case-study-body">
                        ${projectsHTML}
                    </div>
                `;

                catSection.appendChild(cardBlock);
            });

            container.appendChild(catSection);
        });

        lucide.createIcons();

        // Reveal animations per case study block
        gsap.from(".inline-case-study-card", {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#project-grid",
                start: "top 80%"
            }
        });
    }

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

            // Close mobile menu on link click
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                });
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
