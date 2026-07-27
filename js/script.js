document.addEventListener('DOMContentLoaded', () => {
    let projectsData = [];
    let configData = {};
    let profilesData = {};
    let activeProfile = null;

    // --- Error Reporting ---

    function logError(context, error) {
        console.error(`[portfolio] ${context}`, error);
    }

    function logWarning(context) {
        console.warn(`[portfolio] ${context}`);
    }

    function showErrorBanner(message) {
        let banner = document.getElementById('site-error');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'site-error';
            banner.className = 'site-error';
            banner.setAttribute('role', 'alert');

            const text = document.createElement('span');
            text.className = 'site-error-text';
            banner.appendChild(text);

            const dismiss = document.createElement('button');
            dismiss.type = 'button';
            dismiss.className = 'site-error-dismiss';
            dismiss.setAttribute('aria-label', 'Dismiss message');
            dismiss.textContent = '\u00d7';
            dismiss.addEventListener('click', () => banner.remove());
            banner.appendChild(dismiss);

            document.body.appendChild(banner);
        }
        banner.querySelector('.site-error-text').textContent = message;
    }

    // Runs an initialization step in isolation so one failure cannot abort the rest.
    function runStep(name, step) {
        try {
            step();
            return true;
        } catch (error) {
            logError(`Step "${name}" failed:`, error);
            return false;
        }
    }

    window.addEventListener('error', (event) => {
        logError('Uncaught error:', event.error || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
        logError('Unhandled promise rejection:', event.reason);
    });

    // --- Third-party Library Guards ---

    function withLucide(action) {
        if (typeof lucide === 'undefined' || typeof lucide.createIcons !== 'function') {
            logWarning('Lucide is unavailable (CDN blocked or failed); icons will not render.');
            return;
        }
        try {
            action(lucide);
        } catch (error) {
            logError('Lucide call failed:', error);
        }
    }

    function withGsap(action) {
        if (typeof gsap === 'undefined') {
            logWarning('GSAP is unavailable (CDN blocked or failed); animations are disabled.');
            return;
        }
        try {
            action(gsap);
        } catch (error) {
            logError('GSAP call failed:', error);
        }
    }

    // --- Safe DOM Helpers ---

    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) logWarning(`Expected element #${id} is missing from the document.`);
        return element;
    }

    function setText(id, value) {
        const element = getElement(id);
        if (!element) return;
        if (value === undefined || value === null) {
            logWarning(`No content available for #${id}; keeping the markup default.`);
            return;
        }
        element.textContent = value;
    }

    function setAttribute(id, name, value) {
        const element = getElement(id);
        if (!element) return;
        if (value === undefined || value === null) {
            logWarning(`No "${name}" value available for #${id}; keeping the markup default.`);
            return;
        }
        element.setAttribute(name, value);
    }

    function setList(id, items, label) {
        const element = getElement(id);
        if (!element) return;
        if (!Array.isArray(items)) {
            logWarning(`${label} is missing or not a list; keeping the markup default.`);
            return;
        }
        element.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    }

    // --- Storage Helpers ---
    // localStorage throws in private browsing modes and when storage is disabled.

    function readStoredValue(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            logError(`Unable to read "${key}" from localStorage:`, error);
            return null;
        }
    }

    function writeStoredValue(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            logError(`Unable to persist "${key}" to localStorage:`, error);
        }
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

        return company?.toLowerCase();
    }

    // --- Data Loading ---

    async function fetchJSON(url) {
        let response;
        try {
            response = await fetch(url);
        } catch (error) {
            throw new Error(`Network request for ${url} failed: ${error.message}`, { cause: error });
        }

        if (!response.ok) {
            throw new Error(`Request for ${url} failed with HTTP ${response.status} ${response.statusText}`);
        }

        try {
            return await response.json();
        } catch (error) {
            // A 200 response serving HTML (e.g. a SPA fallback page) lands here.
            throw new Error(`Response for ${url} is not valid JSON: ${error.message}`, { cause: error });
        }
    }

    // Resolves to the parsed value, or null after reporting why the source is unusable.
    async function loadSource(promise, url, validate, describe) {
        try {
            const value = await promise;
            if (!validate(value)) {
                throw new Error(`${url} did not contain ${describe}.`);
            }
            return value;
        } catch (error) {
            logError(`Unable to load ${url}:`, error);
            return null;
        }
    }

    const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

    async function loadData() {
        const requests = [
            fetchJSON('data/config.json'),
            fetchJSON('data/projects.json'),
            fetchJSON('data/profiles.json')
        ];
        // Prevent an early rejection from surfacing as an unhandled rejection while
        // the other requests are still in flight.
        requests.forEach(request => request.catch(() => {}));

        const [config, projects, profiles] = await Promise.all([
            loadSource(requests[0], 'data/config.json', isObject, 'a configuration object'),
            loadSource(requests[1], 'data/projects.json', Array.isArray, 'an array of projects'),
            loadSource(requests[2], 'data/profiles.json', isObject, 'a map of profiles')
        ]);

        configData = config || {};
        projectsData = projects || [];
        profilesData = profiles || {};

        const failed = [
            config ? null : 'site settings',
            projects ? null : 'projects',
            profiles ? null : 'tailored profiles'
        ].filter(Boolean);

        if (failed.length) {
            showErrorBanner(`Some content could not be loaded (${failed.join(', ')}). Showing what is available — please refresh or check your connection.`);
        }

        const company = getCompanyFromURL();
        if (company) {
            if (profilesData[company]) {
                activeProfile = profilesData[company];
                runStep('applyProfileOverrides', applyProfileOverrides);
            } else {
                logWarning(`No profile named "${company}" exists in data/profiles.json; falling back to the default portfolio.`);
            }
        }

        initPortfolio();
    }

    // Personalization Overrides
    function applyProfileOverrides() {
        // Merge profile into config
        configData.portfolioTitle = activeProfile.heroTitle ?? configData.portfolioTitle;
        configData.role = activeProfile.role ?? configData.role;
        configData.description = activeProfile.description ?? configData.description;

        if (activeProfile.introLead || activeProfile.philosophy) {
            configData.about = { ...configData.about };
            configData.about.lead = activeProfile.introLead || configData.about.lead;
            configData.about.philosophy = activeProfile.philosophy || configData.about.philosophy;
        }

        // Add specific theme class to body
        if (activeProfile.themeClass) document.body.classList.add(activeProfile.themeClass);
    }

    function initPortfolio() {
        runStep('populateConfig', populateConfig);
        // Since the filter bar is removed, we always render the main project set.
        // Profiles still handle prioritization internally in renderProjects.
        runStep('renderProjects', () => renderProjects('all'));
        runStep('initCommonUI', initCommonUI);
        runStep('initTheme', initTheme);
        runStep('initParticles', initParticles);
        runStep('initAnimations', initAnimations);
    }

    // Populate Config-based Content
    function populateConfig() {
        const about = configData.about || {};
        const contact = configData.contact || {};
        const social = contact.social || {};

        // Browser tab title
        const title = activeProfile?.heroTitle || configData.portfolioTitle;
        if (title) document.title = `${title} - Portfolio`;

        // Navbar branding - Always "Marjoe" or the name from config
        setText('site-branding', configData.name);
        setText('hero-role', configData.role);

        // Use custom hero headline if profile exists, otherwise default
        setText('hero-title', activeProfile
            ? activeProfile.heroTitle
            : "Where Strategic Design Meets Technical Precision.");

        setText('hero-description', configData.description);
        setText('hero-location', configData.location);

        setText('about-title', about.title);
        setText('about-lead', about.lead);
        setText('about-bio', about.bio);
        setText('about-philosophy', about.philosophy);

        // Populate Skills
        setList('expertise-list', activeProfile?.expertise || configData.defaultExpertise, 'Expertise list');
        setList('toolkit-list', activeProfile?.toolkit || configData.defaultToolkit, 'Toolkit list');

        setText('contact-description', activeProfile?.cta ? activeProfile.cta : "Ready to elevate your brand with intentional, production-ready design? I'm currently accepting new projects and creative collaborations.");

        setText('contact-email', contact.email);
        if (contact.email) setAttribute('contact-email', 'href', `mailto:${contact.email}`);

        setAttribute('social-instagram', 'href', social.instagram);
        setAttribute('social-linkedin', 'href', social.linkedin);
        setAttribute('social-behance', 'href', social.behance);

        setText('footer-name', configData.name);
        setText('year', new Date().getFullYear());
    }

    // Render Projects Grid
    function renderProjects(filter) {
        const grid = getElement('project-grid');
        if (!grid) return;
        grid.innerHTML = '';

        let filtered = [];

        // 1. Check if the active profile has a modular "cards" definition
        if (activeProfile?.cards && filter === 'all') {
            filtered = activeProfile.cards;
        } else {
            // Fallback to original filtering logic
            filtered = filter === 'all'
                ? projectsData
                : projectsData.filter(p => p.category === filter || p.tags?.includes(filter));

            // Determine which featured project list to use
            const featuredIds = activeProfile?.featuredProjectIds || configData.featuredProjectIds;

            // Sort or filter based on featured IDs if they exist
            if (featuredIds) {
                if (filter === 'all') {
                    filtered = featuredIds
                        .map(id => {
                            const project = projectsData.find(p => p.id === id);
                            if (!project) logWarning(`Featured project id "${id}" has no entry in data/projects.json.`);
                            return project;
                        })
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

        if (!filtered.length) {
            logWarning('No project cards are available to render.');
            const empty = document.createElement('p');
            empty.className = 'grid-empty-state';
            empty.textContent = 'Selected work is unavailable right now. Please refresh the page or get in touch directly.';
            grid.appendChild(empty);
            return;
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
                <div class="card-bg" ${thumbnail ? `style="background-image: url('${thumbnail}'); background-size: cover;"` : ''}></div>
                ${isDual ? '<div class="card-split-indicator"></div>' : ''}
                <div class="card-content">
                    <div class="card-header">
                        <span class="card-category">${displayCard.tags ? displayCard.tags.join(' & ') : ''}</span>
                        <span class="card-number">${num}</span>
                    </div>
                    <h2>${displayCard.title || 'Untitled project'}</h2>
                    <p>${displayCard.shortDesc || ''}</p>
                    <span class="card-link">Explore ${isDual ? 'Dual ' : ''}Case Study <i data-lucide="arrow-right"></i></span>
                </div>
            `;

            card.addEventListener('click', () => openModal(displayCard.id));
            grid.appendChild(card);
        });

        withLucide(icons => icons.createIcons());

        // Reveal animations
        withGsap(animation => animation.from(".project-card", {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#project-grid",
                start: "top 80%"
            }
        }));
    }

    // Modal Logic
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = modal?.querySelector('.modal-overlay');
    const modalBody = modal?.querySelector('.modal-body');

    if (!modal || !modalBody) {
        logError('Modal markup is missing:', new Error('#project-modal or .modal-body was not found; case studies cannot open.'));
    }

    // Returns the case studies for a card, or null when none can be resolved.
    function resolveProjectsList(projectId) {
        // 1. Check for custom project list in the new modular structure
        const customList = activeProfile?.projects?.[projectId];
        if (Array.isArray(customList) && customList.length) return customList;

        // 2. Fallback to original project data
        const originalData = projectsData.find(p => p.id === projectId);
        if (!originalData) {
            logError('Cannot open case study:', new Error(`No project with id "${projectId}" exists in the active profile or data/projects.json.`));
            return null;
        }

        // Apply legacy Card-Level Overrides if they exist
        const cardOverride = activeProfile?.projectOverrides?.[projectId];
        const data = cardOverride ? { ...originalData, ...cardOverride } : originalData;

        if (!Array.isArray(data.projects) || !data.projects.length) {
            logError('Cannot open case study:', new Error(`Project "${projectId}" has no case studies defined.`));
            return null;
        }

        return data.projects;
    }

    function openModal(projectId) {
        if (!modal || !modalBody) {
            showErrorBanner('This case study cannot be opened right now. Please refresh the page.');
            return;
        }

        const projectsList = resolveProjectsList(projectId);
        if (!projectsList) {
            showErrorBanner('This case study is unavailable right now. Please refresh the page or get in touch directly.');
            return;
        }

        modalBody.innerHTML = '';

        projectsList.forEach((proj, i) => {
            // Apply legacy Inner Project Overrides from Active Profile (by inner project id)
            const override = activeProfile?.projectOverrides?.[proj.id];
            const displayData = override ? { ...proj, ...override } : proj;

            const section = document.createElement('div');
            section.className = 'project-split-section';
            section.innerHTML = `
                <div class="modal-header">
                    <span class="project-type">${displayData.type || ''}</span>
                    <h2 class="project-name">${displayData.name || 'Untitled case study'}</h2>
                </div>
                <section class="cs-intro">
                    <h3>Overview</h3>
                    <p>${displayData.overview || ''}</p>
                </section>
                <div class="cs-details-grid">
                    <section class="cs-detail-item">
                        <h3>Problem & Solution</h3>
                        <p>${displayData.details || ''}</p>
                    </section>
                    <section class="cs-detail-item highlight">
                        <h3>Impact</h3>
                        <p>${displayData.result || ''}</p>
                    </section>
                </div>
                <section class="cs-visuals">
                    <div class="visual-placeholder main-visual" ${displayData.images?.main ? `style="background-image: url('${displayData.images.main}'); background-size: cover;"` : ''}>
                        ${!displayData.images?.main ? `Visualizing: ${displayData.name || 'case study'}` : ''}
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

        withGsap(animation => animation.from(".project-split-section", { y: 30, opacity: 0, stagger: 0.2, duration: 0.8, ease: "power2.out" }));
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    } else {
        logWarning('.modal-close is missing; the modal cannot be closed with the button.');
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    } else {
        logWarning('.modal-overlay is missing; clicking outside the modal will not close it.');
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
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
        } else {
            logWarning('Mobile menu markup is incomplete; the menu toggle is inactive.');
        }

        // Magnetic Effect
        const magnetic = document.querySelectorAll('.footer-btn, .scroll-down, .nav-links a, #theme-toggle, .filter-btn');
        magnetic.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const isCentered = btn.classList.contains('scroll-down');
                withGsap(animation => animation.to(btn, {
                    x: x * 0.4,
                    xPercent: isCentered ? -50 : 0,
                    y: y * 0.4,
                    duration: 0.4,
                    ease: "power2.out"
                }));
            });
            btn.addEventListener('mouseleave', () => {
                const isCentered = btn.classList.contains('scroll-down');
                withGsap(animation => animation.to(btn, {
                    x: 0,
                    xPercent: isCentered ? -50 : 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.5)"
                }));
            });
        });

        // Scroll Progress
        withGsap(animation => animation.to("#scroll-progress", {
            width: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3
            }
        }));
    }

    function initTheme() {
        const themeBtn = document.getElementById('theme-toggle');
        const body = document.body;
        if (readStoredValue('theme') === 'dark') body.setAttribute('data-theme', 'dark');

        if (!themeBtn) {
            logWarning('#theme-toggle is missing; theme switching is unavailable.');
            return;
        }

        themeBtn.addEventListener('click', () => {
            const isDark = body.hasAttribute('data-theme');
            if (isDark) {
                body.removeAttribute('data-theme');
                writeStoredValue('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                writeStoredValue('theme', 'dark');
            }
            withGsap(animation => animation.to(themeBtn, { rotation: "+=360", duration: 0.5 }));
        });
    }

    function initParticles() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            logWarning('2D canvas context is unavailable; the particle background is disabled.');
            return;
        }
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
            try {
                ctx.clearRect(0,0,canvas.width, canvas.height);
                particles.forEach(p => { p.update(); p.draw(); });
            } catch (error) {
                // Stop the loop instead of throwing on every animation frame.
                logError('Particle animation stopped after an error:', error);
                return;
            }
            requestAnimationFrame(anim);
        }
        anim();
    }

    function initAnimations() {
        if (typeof gsap === 'undefined') {
            logWarning('GSAP is unavailable (CDN blocked or failed); scroll animations are disabled.');
            return;
        }

        if (typeof ScrollTrigger === 'undefined') {
            logWarning('The GSAP ScrollTrigger plugin is unavailable; scroll animations are disabled.');
            return;
        }

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

    loadData().catch(error => {
        logError('Portfolio failed to initialize:', error);
        showErrorBanner('Something went wrong while loading this portfolio. Please refresh the page.');
    });
});
