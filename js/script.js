        // Lucide icons initialization
        lucide.createIcons();

        // Theme Toggle Logic
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;

        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.setAttribute('data-theme', savedTheme);
        }

        themeToggle.addEventListener('click', () => {
            const isDark = body.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';

            if (newTheme === 'dark') {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            }

            // GSAP rotation animation for the toggle
            gsap.to(themeToggle, {
                rotation: "+=360",
                duration: 0.5,
                ease: "back.out(1.7)"
            });

            // Update cached color for particles after theme change
            setTimeout(() => {
                cachedParticleColor = getComputedStyle(document.documentElement).getPropertyValue('--particle-color');
            }, 0);
        });

        // Mobile Menu Logic
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

        function toggleMobileMenu() {
            const isOpen = mobileMenu.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', isOpen);
            mobileMenu.setAttribute('aria-hidden', !isOpen);
            mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Open Menu');
        }

        mobileMenuToggle.addEventListener('click', toggleMobileMenu);

        // Close mobile menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        });

        // Particles Animation
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let cachedParticleColor = getComputedStyle(document.documentElement).getPropertyValue('--particle-color');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = cachedParticleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < 100; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();

        // Mesh Gradient Movement
        gsap.to(".mesh-gradient", {
            duration: 10,
            scale: 1.5,
            x: "10%",
            y: "10%",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Creative Intro Animations
        const tl = gsap.timeline({
            defaults: { ease: "power4.out" },
            onComplete: () => {
                console.log("Animation complete");
                document.body.classList.add("animation-done");
            }
        });

        tl.from(".hero-tagline", {
            y: 20,
            opacity: 0,
            duration: 0.8
        })
        .from(".hero-title", {
            y: 50,
            opacity: 0,
            duration: 1
        }, "-=0.4")
        .from(".hero-subtitle", {
            y: 20,
            opacity: 0,
            duration: 0.8
        }, "-=0.6")
        .from(".hero-location", {
            y: 10,
            opacity: 0,
            duration: 0.8
        }, "-=0.6")
        .from(".scroll-down", {
            y: 20,
            opacity: 0,
            duration: 0.8
        }, "-=0.4")
        .from(".navbar", {
            y: -100,
            opacity: 0,
            duration: 1
        }, "-=1");

        // Scroll-Triggered Parallax
        gsap.registerPlugin(ScrollTrigger);

        // Section Stacking + Text Overlap Parallax
        const heroTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true,
                pin: true,
                pinSpacing: false
            }
        });

        // Title moves faster than Subtitle to create overlap
        heroTimeline.to(".hero-title", {
            y: 300,
            ease: "none"
        }, 0);

        heroTimeline.to(".hero-subtitle", {
            y: 100,
            ease: "none"
        }, 0);

        heroTimeline.to(".hero-bg-container", {
            opacity: 0.5,
            scale: 1.1,
            ease: "none"
        }, 0);

        heroTimeline.to(".scroll-down", {
            opacity: 0,
            y: -20,
            duration: 0.2
        }, 0);

        // Modal Logic & Data
        const projectData = {
            "Visual Identity": {
                type: "Branding & Strategy",
                overview: "A comprehensive rebranding for a global energy firm transitioning towards sustainable power solutions.",
                problem: "The existing brand was tethered to legacy perception and failed to reflect the company's shift towards innovative, renewable tech.",
                process: "Strategic market positioning, stakeholder interviews, and an iterative design process focused on balancing heritage with future-readiness.",
                solution: "A modular visual identity system built for longevity, ensuring technical scalability across digital and large-format physical signage.",
                result: "30% increase in brand equity and a successful Series B funding round within six months of launch."
            },
            "Digital Experience": {
                type: "UI/UX Design",
                overview: "Architecting a high-performance project management ecosystem for global creative agencies.",
                problem: "Fragmented communication and redundant workflows were causing significant project delays and tool-fatigue.",
                process: "User-centric research, persona mapping, and high-fidelity prototyping with a focus on cognitive load reduction.",
                solution: "An intuitive digital platform that prioritizes deep-work states and contextual information management.",
                result: "45% improvement in operational efficiency and positive adoption rates from over 50 partner agencies."
            },
            "Motion Design": {
                type: "Multimedia & Motion",
                overview: "A high-impact cinematic launch for a premium automotive brand's flagship electric SUV.",
                problem: "The challenge was to communicate 'luxury' and 'silent power' through a digital-first visual narrative.",
                process: "Creative direction, storyboarding, and custom 3D motion design integrated with rhythmic sound design.",
                solution: "A 60-second visual experience that uses light, texture, and fluid motion to tell a story of sustainable luxury.",
                result: "1.2M engagement across social platforms and record-breaking pre-order inquiries."
            },
            "Brand Strategy": {
                type: "Strategic Planning",
                overview: "Repositioning a 50-year-old heritage retail brand for the digital-native Gen-Z market.",
                problem: "The brand was losing market share due to an 'out-of-touch' identity and lack of community engagement.",
                process: "Cultural trend analysis, competitive audit, and community-led strategic workshops.",
                solution: "A strategic pivot centered on 'radical transparency' and community-driven product co-creation.",
                result: "85% increase in Gen-Z audience engagement and a successful multi-city pop-up tour."
            }
        };

        const modal = document.getElementById('project-modal');
        const modalClose = document.querySelector('.modal-close');

        function openModal(projectName) {
            const data = projectData[projectName];
            if (!data) return;

            // Map data to modal elements
            document.getElementById('modal-project-name').textContent = projectName;
            document.getElementById('modal-project-type').textContent = data.type;
            document.getElementById('modal-project-overview').textContent = data.overview;
            document.getElementById('modal-project-problem').textContent = data.problem;
            document.getElementById('modal-project-process').textContent = data.process;
            document.getElementById('modal-project-solution').textContent = data.solution;
            document.getElementById('modal-project-result').textContent = data.result;

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Animation for modal contents
            gsap.from(".modal-header > *", { y: 20, opacity: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" });
            gsap.from(".modal-body section", { y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out", delay: 0.2 });
        }

        function closeModal() {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.getAttribute('data-project');
                openModal(title);
            });
        });

        modalClose.addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Custom Cursor Logic
        const cursor = document.getElementById('custom-cursor');
        const cursorDot = cursor.querySelector('.cursor-dot');
        const cursorCircle = cursor.querySelector('.cursor-circle');

        let mouseX = 0;
        let mouseY = 0;
        let dotX = 0;
        let dotY = 0;
        let circleX = 0;
        let circleY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            // Smooth follow (lerp)
            dotX += (mouseX - dotX) * 0.2;
            dotY += (mouseY - dotY) * 0.2;
            circleX += (mouseX - circleX) * 0.1;
            circleY += (mouseY - circleY) * 0.1;

            cursorDot.style.left = `${dotX}px`;
            cursorDot.style.top = `${dotY}px`;
            cursorCircle.style.left = `${circleX}px`;
            cursorCircle.style.top = `${circleY}px`;

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Cursor interactions
        const interactables = document.querySelectorAll('a, button, .project-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });

        // Magnetic Buttons Interaction (Limited to small elements)
        const magneticElements = document.querySelectorAll('.footer-btn, .scroll-down, .nav-links a, #theme-toggle');
        magneticElements.forEach(btn => {
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

        // Scroll Progress Indicator
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

        // Reveal Animations for New Sections
        gsap.from(".about-text", {
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 80%",
            },
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });

        gsap.from(".about-skills", {
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 80%",
            },
            x: 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });

        gsap.from(".contact-content > *", {
            scrollTrigger: {
                trigger: ".contact-section",
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out"
        });

        // Set Current Year in Footer
        document.getElementById('year').textContent = new Date().getFullYear();

        // Project Cards Reveal Animation
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 95%", // Adjusted start
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                delay: index * 0.05 // Reduced stagger for better responsive feel
            });
        });
