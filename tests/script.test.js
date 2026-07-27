import { describe, it, expect, afterEach, vi } from 'vitest';
import { bootPortfolio, readJson, $, $id } from './helpers/harness.js';

const config = readJson('data/config.json');
const projects = readJson('data/projects.json');
const profiles = readJson('data/profiles.json');

// config.featuredProjectIds acts as an allow-list for the grid; drop it when a test
// supplies its own project fixtures.
const { featuredProjectIds, ...unfeaturedConfig } = config;
const featuredIds = featuredProjectIds.filter(id => projects.some(p => p.id === id));

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    document.body.style.overflow = '';
});

describe('company detection from the URL', () => {
    it('uses the ?for= query parameter', async () => {
        await bootPortfolio({ url: '/?for=NIKE' });
        expect($id('hero-title').textContent).toBe(profiles.nike.heroTitle);
    });

    it('falls back to the hash identifier', async () => {
        await bootPortfolio({ url: '/#apple' });
        expect($id('hero-title').textContent).toBe(profiles.apple.heroTitle);
    });

    it('falls back to a /collections/<company> path segment', async () => {
        await bootPortfolio({ url: '/collections/spotify' });
        expect($id('hero-title').textContent).toBe(profiles.spotify.heroTitle);
    });

    it('prefers the query parameter over the hash', async () => {
        await bootPortfolio({ url: '/?for=adobe#nike' });
        expect($id('hero-title').textContent).toBe(profiles.adobe.heroTitle);
    });

    it('ignores unknown companies and renders the default profile', async () => {
        await bootPortfolio({ url: '/?for=unknown-co' });
        expect($id('hero-title').textContent).toBe('Where Strategic Design Meets Technical Precision.');
        expect(document.title).toBe(`${config.portfolioTitle} - Portfolio`);
    });
});

describe('config population', () => {
    it('fills branding, hero, about, contact and footer content', async () => {
        await bootPortfolio();

        expect($id('site-branding').textContent).toBe(config.name);
        expect($id('hero-role').textContent).toBe(config.role);
        expect($id('hero-description').textContent).toBe(config.description);
        expect($id('hero-location').textContent).toBe(config.location);
        expect($id('about-title').textContent).toBe(config.about.title);
        expect($id('about-bio').textContent).toBe(config.about.bio);
        expect($id('contact-email').textContent).toBe(config.contact.email);
        expect($id('contact-email').getAttribute('href')).toBe(`mailto:${config.contact.email}`);
        expect($id('social-instagram').getAttribute('href')).toBe(config.contact.social.instagram);
        expect($id('footer-name').textContent).toBe(config.name);
        expect($id('year').textContent).toBe(String(new Date().getFullYear()));
    });

    it('renders the default skill lists', async () => {
        await bootPortfolio();

        const expertise = [...$id('expertise-list').querySelectorAll('li')].map(li => li.textContent);
        const toolkit = [...$id('toolkit-list').querySelectorAll('li')].map(li => li.textContent);
        expect(expertise).toEqual(config.defaultExpertise);
        expect(toolkit).toEqual(config.defaultToolkit);
    });

    it('applies profile overrides to title, skills, cta and theme class', async () => {
        await bootPortfolio({ url: '/?for=nike' });
        const nike = profiles.nike;

        expect(document.title).toBe(`${nike.heroTitle} - Portfolio`);
        expect($id('hero-role').textContent).toBe(nike.role);
        expect($id('about-lead').textContent).toBe(nike.introLead);
        expect($id('about-philosophy').textContent).toBe(nike.philosophy);
        expect([...$id('expertise-list').querySelectorAll('li')].map(li => li.textContent)).toEqual(nike.expertise);
        expect($id('contact-description').textContent).toBe(nike.cta);
        expect(document.body.classList.contains(nike.themeClass)).toBe(true);
    });
});

describe('project grid rendering', () => {
    it('renders one card per global project with a numbered badge', async () => {
        await bootPortfolio();

        const cards = [...$id('project-grid').children];
        const first = projects.find(p => p.id === featuredIds[0]);
        expect(cards.map(c => c.getAttribute('data-project-id'))).toEqual(featuredIds);
        expect(cards[0].querySelector('.card-number').textContent).toBe('01');
        expect(cards[1].querySelector('.card-number').textContent).toBe('02');
        expect(cards[0].querySelector('h2').textContent).toBe(first.title);
        expect(cards[0].querySelector('.card-category').textContent).toBe(first.tags.join(' & '));
        expect(cards[0].querySelector('.card-bg').getAttribute('style')).toContain(first.thumbnail);
    });

    it('renders the profile card list when a profile defines cards', async () => {
        await bootPortfolio({ url: '/?for=nike' });

        const cards = [...$id('project-grid').children];
        expect(cards).toHaveLength(profiles.nike.cards.length);
        expect(cards[0].querySelector('h2').textContent).toBe(profiles.nike.cards[0].title);
        expect(cards[0].className).toContain(`bento-item-${profiles.nike.cards[0].bentoSize}`);
    });

    it('orders and filters cards by featuredProjectIds', async () => {
        const reversed = projects.map(p => p.id).slice(0, 2).reverse();
        await bootPortfolio({
            data: {
                config: { ...config, featuredProjectIds: [...reversed, 'does-not-exist'] },
                profiles: {}
            }
        });

        const rendered = [...$id('project-grid').children].map(c => c.getAttribute('data-project-id'));
        expect(rendered).toEqual(reversed);
    });

    it('marks dual case studies and defaults the bento size to medium', async () => {
        await bootPortfolio({
            data: {
                config: unfeaturedConfig,
                profiles: {},
                projects: [
                    { id: 'solo', title: 'Solo', shortDesc: 'One', tags: ['A'], projects: [{ id: 'p1', name: 'P1' }] },
                    { id: 'duo', title: 'Duo', shortDesc: 'Two', tags: ['A'], isDual: true, projects: [] }
                ]
            }
        });

        const [solo, duo] = [...$id('project-grid').children];
        expect(solo.className).toContain('bento-item-medium');
        expect(solo.querySelector('.card-split-indicator')).toBeNull();
        expect(solo.querySelector('.card-link').textContent).toContain('Explore Case Study');
        expect(duo.querySelector('.card-split-indicator')).not.toBeNull();
        expect(duo.querySelector('.card-link').textContent).toContain('Explore Dual Case Study');
    });

    it('falls back to the first project image when a card has no thumbnail', async () => {
        await bootPortfolio({
            data: {
                config: unfeaturedConfig,
                profiles: {},
                projects: [{
                    id: 'no-thumb',
                    title: 'No thumb',
                    shortDesc: 'Desc',
                    tags: [],
                    projects: [{ id: 'inner', name: 'Inner', images: { main: 'assets/images/fallback.jpg' } }]
                }]
            }
        });

        const style = $('.card-bg').getAttribute('style');
        expect(style).toContain('assets/images/fallback.jpg');
    });

    it('refreshes icons and triggers the reveal animation', async () => {
        const { lucide, gsap } = await bootPortfolio();
        expect(lucide.createIcons).toHaveBeenCalled();
        expect(gsap.from).toHaveBeenCalledWith('.project-card', expect.objectContaining({ stagger: 0.1 }));
    });
});

describe('project modal', () => {
    it('opens with a section per case study and separators in between', async () => {
        await bootPortfolio();
        const dual = projects.find(p => p.projects.length > 1);

        $(`[data-project-id="${dual.id}"]`).click();

        const modal = $id('project-modal');
        expect(modal.classList.contains('active')).toBe(true);
        expect(modal.getAttribute('aria-hidden')).toBe('false');
        expect(document.body.style.overflow).toBe('hidden');

        const sections = modal.querySelectorAll('.project-split-section');
        expect(sections).toHaveLength(dual.projects.length);
        expect(sections[0].querySelector('.project-name').textContent).toBe(dual.projects[0].name);
        expect(sections[0].querySelector('.project-type').textContent).toBe(dual.projects[0].type);
        expect(modal.querySelectorAll('.modal-separator')).toHaveLength(dual.projects.length - 1);
    });

    it('shows placeholder labels when a case study has no images', async () => {
        await bootPortfolio({
            data: {
                config: unfeaturedConfig,
                profiles: {},
                projects: [{
                    id: 'plain',
                    title: 'Plain',
                    shortDesc: 'Desc',
                    tags: [],
                    projects: [{ id: 'inner', name: 'Inner', type: 'Type', overview: 'O', details: 'D', result: 'R' }]
                }]
            }
        });

        $('[data-project-id="plain"]').click();

        const visuals = [...$id('project-modal').querySelectorAll('.visual-placeholder')].map(v => v.textContent.trim());
        expect(visuals).toEqual(['Visualizing: Inner', 'Mockup A', 'Mockup B', 'Mockup C']);
    });

    it('prefers profile-specific case studies over the global ones', async () => {
        await bootPortfolio({ url: '/?for=nike' });
        const cardId = profiles.nike.cards[0].id;

        $(`[data-project-id="${cardId}"]`).click();

        const names = [...$id('project-modal').querySelectorAll('.project-name')].map(n => n.textContent);
        expect(names).toEqual(profiles.nike.projects[cardId].map(p => p.name));
    });

    it('applies legacy projectOverrides to inner case studies', async () => {
        await bootPortfolio({
            url: '/?for=acme',
            data: {
                config: unfeaturedConfig,
                projects: [{
                    id: 'card',
                    title: 'Card',
                    shortDesc: 'Desc',
                    tags: [],
                    projects: [{ id: 'inner', name: 'Original', type: 'T', overview: 'O', details: 'D', result: 'R' }]
                }],
                profiles: {
                    acme: {
                        heroTitle: 'Marjoe + Acme',
                        projectOverrides: { inner: { name: 'Overridden', result: 'Overridden impact' } }
                    }
                }
            }
        });

        $('[data-project-id="card"]').click();

        const section = $('.project-split-section');
        expect(section.querySelector('.project-name').textContent).toBe('Overridden');
        expect(section.textContent).toContain('Overridden impact');
    });

    it('does nothing when the card has no matching case study data', async () => {
        await bootPortfolio({
            url: '/?for=acme',
            data: {
                config: unfeaturedConfig,
                projects: [],
                profiles: {
                    acme: {
                        heroTitle: 'Marjoe + Acme',
                        cards: [{ id: 'ghost', title: 'Ghost', shortDesc: 'No data', tags: [] }]
                    }
                }
            }
        });

        $('[data-project-id="ghost"]').click();

        expect($id('project-modal').classList.contains('active')).toBe(false);
    });

    it('closes via the close button, the overlay and the Escape key', async () => {
        await bootPortfolio();
        const modal = $id('project-modal');
        const open = () => $('.project-card').click();

        open();
        $('.modal-close').click();
        expect(modal.classList.contains('active')).toBe(false);
        expect(modal.getAttribute('aria-hidden')).toBe('true');
        expect(document.body.style.overflow).toBe('');

        open();
        $('.modal-overlay').click();
        expect(modal.classList.contains('active')).toBe(false);

        open();
        document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        expect(modal.classList.contains('active')).toBe(false);
    });

    it('ignores Escape while the modal is closed', async () => {
        await bootPortfolio();
        document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        expect($id('project-modal').classList.contains('active')).toBe(false);
    });
});

describe('common UI', () => {
    it('leaves the menu toggle collapsed while no #mobile-menu exists in the markup', async () => {
        await bootPortfolio();
        const toggle = $id('mobile-menu-toggle');
        expect($id('mobile-menu')).toBeNull();

        toggle.click();
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('toggles the menu and its aria-expanded state when #mobile-menu exists', async () => {
        await bootPortfolio({
            beforeBoot: () => {
                const menu = document.createElement('div');
                menu.id = 'mobile-menu';
                document.body.appendChild(menu);
            }
        });
        const toggle = $id('mobile-menu-toggle');

        toggle.click();
        expect($id('mobile-menu').classList.contains('active')).toBe(true);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');

        toggle.click();
        expect($id('mobile-menu').classList.contains('active')).toBe(false);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('animates magnetic buttons on mousemove and resets them on mouseleave', async () => {
        const { gsap } = await bootPortfolio();
        const scrollDown = $('.scroll-down');
        scrollDown.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 50 });

        scrollDown.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 100, clientY: 50 }));
        expect(gsap.to).toHaveBeenCalledWith(scrollDown, expect.objectContaining({ x: 20, y: 10, xPercent: -50 }));

        scrollDown.dispatchEvent(new window.MouseEvent('mouseleave'));
        expect(gsap.to).toHaveBeenCalledWith(scrollDown, expect.objectContaining({ x: 0, y: 0, xPercent: -50 }));
    });

    it('does not centre non-scroll-down magnetic buttons', async () => {
        const { gsap } = await bootPortfolio();
        const themeBtn = $id('theme-toggle');
        themeBtn.getBoundingClientRect = () => ({ left: 0, top: 0, width: 40, height: 40 });

        themeBtn.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 40 }));
        expect(gsap.to).toHaveBeenCalledWith(themeBtn, expect.objectContaining({ xPercent: 0 }));
    });
});

describe('theme handling', () => {
    it('restores a saved dark theme on load', async () => {
        localStorage.setItem('theme', 'dark');
        await bootPortfolio();
        expect(document.body.getAttribute('data-theme')).toBe('dark');
    });

    it('toggles between dark and light and persists the choice', async () => {
        await bootPortfolio();
        const themeBtn = $id('theme-toggle');

        themeBtn.click();
        expect(document.body.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('theme')).toBe('dark');

        themeBtn.click();
        expect(document.body.hasAttribute('data-theme')).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
    });
});

describe('particles canvas', () => {
    it('sizes the canvas to the viewport and redraws on resize', async () => {
        await bootPortfolio();
        const canvas = $id('particles');
        expect(canvas.width).toBe(window.innerWidth);
        expect(canvas.height).toBe(window.innerHeight);

        window.innerWidth = 500;
        window.innerHeight = 400;
        window.dispatchEvent(new window.Event('resize'));
        expect(canvas.width).toBe(500);
        expect(canvas.height).toBe(400);
    });

    it('draws every particle on the first animation frame', async () => {
        const { canvasContext } = await bootPortfolio();
        expect(canvasContext.clearRect).toHaveBeenCalled();
        expect(canvasContext.arc).toHaveBeenCalledTimes(80);
    });
});
