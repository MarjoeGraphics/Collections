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

        tl.from(".hero-title", {
            y: 100,
            opacity: 0,
            duration: 1,
            skewY: 7
        })
        .from(".hero-subtitle", {
            y: 20,
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

        // Move title and subtitle at different speeds for overlap parallax
        // Staying fully visible during the overlap as requested
        gsap.to(".hero-title", {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            },
            y: 350, // Faster
            ease: "none"
        });

        gsap.to(".hero-subtitle", {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            },
            y: 150, // Slower - will cause title to overlap it
            ease: "none"
        });

        gsap.to(".hero-bg-container", {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            },
            y: 100
        });

        // Modal Logic
        const modal = document.getElementById('project-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalClose = document.querySelector('.modal-close');
        const projectCards = document.querySelectorAll('.project-card');

        function openModal(projectTitle) {
            modalTitle.textContent = projectTitle;
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        }

        function closeModal() {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restore scrolling
        }

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

        // Magnetic Buttons Interaction
        const magneticElements = document.querySelectorAll('.cta-button, .scroll-down, .project-card');
        magneticElements.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const isCentered = btn.classList.contains('scroll-down') || btn.classList.contains('skip-link');

                gsap.to(btn, {
                    x: x * 0.3,
                    xPercent: isCentered ? -50 : 0,
                    y: y * 0.3,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });

            btn.addEventListener('mouseleave', () => {
                const isCentered = btn.classList.contains('scroll-down') || btn.classList.contains('skip-link');
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

        // Project Cards Stacking Effect Enhancement
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            // Slight scale down as you scroll past
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 15%",
                    end: "bottom 15%",
                    scrub: true
                },
                scale: 0.95,
                opacity: 0.9
            });

            // Reveal from bottom animation
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top bottom",
                    end: "top 15%",
                    scrub: true
                },
                y: 100,
                opacity: 0
            });
        });
