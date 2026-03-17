document.addEventListener('DOMContentLoaded', () => {
    let projectsData = [];
    let configData = {};

    // Fetch Config and Projects
    async function loadData() {
        try {
            const [configRes, projectsRes] = await Promise.all([
                fetch('data/config.json'),
                fetch('data/projects.json')
            ]);
            configData = await configRes.json();
            projectsData = await projectsRes.json();

            initPortfolio();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    function initPortfolio() {
        populateConfig();
        renderProjects('all');
        initCommonUI();
        initTheme();
        initParticles();
        initAnimations();
        initCursor();
    }

    // Populate Config-based Content
    function populateConfig() {
        document.title = `${configData.portfolioTitle} - Portfolio`;
        document.getElementById('site-branding').textContent = configData.portfolioTitle;
        document.getElementById('hero-role').textContent = configData.role;
        document.getElementById('hero-title').textContent = configData.portfolioTitle === 'Marjoe' ? 'Where Strategic Design Meets Technical Precision.' : configData.portfolioTitle;
        document.getElementById('hero-description').textContent = configData.description;
        document.getElementById('hero-location').textContent = configData.location;

        document.getElementById('about-title').textContent = configData.about.title;
        document.getElementById('about-lead').textContent = configData.about.lead;
        document.getElementById('about-bio').textContent = configData.about.bio;
        document.getElementById('about-philosophy').textContent = configData.about.philosophy;

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

        const filtered = filter === 'all'
            ? projectsData
            : projectsData.filter(p => p.category === filter || p.tags.includes(filter));

        filtered.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = `project-card bento-item-${project.bentoSize}`;
            card.setAttribute('data-project-id', project.id);

            const num = (index + 1).toString().padStart(2, '0');

            card.innerHTML = `
                <div class="card-bg"></div>
                ${project.isDual ? '<div class="card-split-indicator"></div>' : ''}
                <div class="card-content">
                    <div class="card-header">
                        <span class="card-category">${project.tags.join(' & ')}</span>
                        <span class="card-number">${num}</span>
                    </div>
                    <h2>${project.title}</h2>
                    <p>${project.shortDesc}</p>
                    <span class="card-link">Explore ${project.isDual ? 'Dual ' : ''}Case Study <i data-lucide="arrow-right"></i></span>
                </div>
            `;

            card.addEventListener('click', () => openModal(project.id));
            grid.appendChild(card);
        });

        lucide.createIcons();

        // Re-init reveal animations for new cards
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

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProjects(btn.getAttribute('data-filter'));
        });
    });

    // Modal Logic
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');

    function openModal(projectId) {
        const data = projectsData.find(p => p.id === projectId);
        if (!data) return;

        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = '';

        data.projects.forEach((proj, i) => {
            const section = document.createElement('div');
            section.className = 'project-split-section';
            section.innerHTML = `
                <div class="modal-header">
                    <span class="project-type">${proj.type}</span>
                    <h2 class="project-name">${proj.name}</h2>
                </div>
                <section class="cs-intro">
                    <h3>Overview</h3>
                    <p>${proj.overview}</p>
                </section>
                <div class="cs-details-grid">
                    <section class="cs-detail-item">
                        <h3>Problem & Solution</h3>
                        <p>${proj.details}</p>
                    </section>
                    <section class="cs-detail-item highlight">
                        <h3>Impact</h3>
                        <p>${proj.result}</p>
                    </section>
                </div>
                <section class="cs-visuals">
                    <div class="visual-placeholder">Visualizing: ${proj.name}</div>
                    <div class="visual-grid">
                        <div class="visual-placeholder">Mockup A</div>
                        <div class="visual-placeholder">Mockup B</div>
                    </div>
                </section>
            `;
            modalBody.appendChild(section);

            if (i < data.projects.length - 1) {
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
        menuToggle.addEventListener('click', () => {
            const active = menu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', active);
        });

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

    function initParticles() {
        const canvas = document.getElementById('particles');
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

    function initCursor() {
        const cursor = document.getElementById('custom-cursor');
        const dot = cursor.querySelector('.cursor-dot');
        const circle = cursor.querySelector('.cursor-circle');
        let mx=0, my=0, dx=0, dy=0, cx=0, cy=0;

        window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        function loop() {
            dx += (mx - dx) * 0.2; dy += (my - dy) * 0.2;
            cx += (mx - cx) * 0.1; cy += (my - cy) * 0.1;
            dot.style.transform = `translate(${dx}px, ${dy}px)`;
            circle.style.transform = `translate(${cx}px, ${cy}px)`;
            requestAnimationFrame(loop);
        }
        loop();

        document.addEventListener('mouseover', e => {
            if (e.target.closest('a, button, .project-card')) cursor.classList.add('active');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest('a, button, .project-card')) cursor.classList.remove('active');
        });
    }

    loadData();
});
