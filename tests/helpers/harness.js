import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runInThisContext } from 'node:vm';
import { vi } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const scriptPath = resolve(root, 'js/script.js');
const scriptSource = readFileSync(scriptPath, 'utf8');

export const readJson = (relPath) => JSON.parse(readFileSync(resolve(root, relPath), 'utf8'));

function createGsapStub() {
    const gsap = {
        calls: [],
        to: vi.fn((target, vars) => gsap.calls.push({ method: 'to', target, vars })),
        from: vi.fn((target, vars) => gsap.calls.push({ method: 'from', target, vars })),
        registerPlugin: vi.fn(),
        timeline: vi.fn(() => {
            const tl = { to: vi.fn(() => tl) };
            return tl;
        })
    };
    return gsap;
}

function createCanvasStub() {
    return {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        fillStyle: ''
    };
}

/**
 * Boots js/script.js inside the jsdom document with stubbed third-party
 * globals and a fetch mock serving the provided data files.
 */
export async function bootPortfolio({ url = '/', data = {}, beforeBoot } = {}) {
    const config = data.config ?? readJson('data/config.json');
    const projects = data.projects ?? readJson('data/projects.json');
    const profiles = data.profiles ?? readJson('data/profiles.json');

    window.history.replaceState({}, '', new URL(url, window.location.origin).href);
    document.documentElement.innerHTML = html
        .replace(/<script[^>]*src="[^"]*"><\/script>/g, '');
    document.body.removeAttribute('data-theme');
    document.body.className = '';

    const gsap = createGsapStub();
    const lucide = { createIcons: vi.fn() };
    const canvasContext = createCanvasStub();

    vi.stubGlobal('gsap', gsap);
    vi.stubGlobal('ScrollTrigger', {});
    vi.stubGlobal('lucide', lucide);
    vi.stubGlobal('requestAnimationFrame', vi.fn());
    window.HTMLCanvasElement.prototype.getContext = vi.fn(() => canvasContext);

    const bodies = {
        'data/config.json': config,
        'data/projects.json': projects,
        'data/profiles.json': profiles
    };
    const fetchMock = vi.fn(async (path) => ({ json: async () => bodies[path] }));
    vi.stubGlobal('fetch', fetchMock);

    if (beforeBoot) beforeBoot();

    // Intercept the script's DOMContentLoaded registration so each boot runs exactly
    // one instance instead of re-running every instance booted by earlier tests.
    const nativeAddEventListener = document.addEventListener.bind(document);
    let boot;
    document.addEventListener = (type, listener, ...rest) => {
        if (type === 'DOMContentLoaded' && !boot) boot = listener;
        else nativeAddEventListener(type, listener, ...rest);
    };
    // Run with the real filename so coverage is attributed to js/script.js.
    runInThisContext(scriptSource, { filename: scriptPath });
    document.addEventListener = nativeAddEventListener;
    boot();
    // populateConfig() stamps the footer year last, so it marks a finished boot.
    await vi.waitFor(() => {
        if (!$id('year').textContent) throw new Error('portfolio not initialised yet');
    });

    return { gsap, lucide, canvasContext, fetchMock, config, projects, profiles };
}

export const $ = (selector) => document.querySelector(selector);
export const $id = (id) => document.getElementById(id);
