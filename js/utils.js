/**
 * Shared helpers used across the portfolio scripts.
 * Exposed on `window.PortfolioUtils` so classic scripts can consume them.
 */
(function (global) {
    'use strict';

    // --- DOM helpers ---

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? '';
        return el;
    }

    function setTexts(map) {
        Object.entries(map).forEach(([id, value]) => setText(id, value));
    }

    function setAttrs(map) {
        Object.entries(map).forEach(([id, attrs]) => {
            const el = document.getElementById(id);
            if (!el) return;
            Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
        });
    }

    function setListItems(id, items) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = (items || []).map(item => `<li>${item}</li>`).join('');
        return el;
    }

    // --- Markup helpers ---

    /** Inline style attribute that paints `url` as a covering background, or '' when absent. */
    function backgroundImageAttr(url) {
        return url ? `style="background-image: url('${url}'); background-size: cover;"` : '';
    }

    /** A `.visual-placeholder` tile that shows `url` when available and `fallbackLabel` otherwise. */
    function visualPlaceholder(url, fallbackLabel, extraClass = '') {
        const className = ['visual-placeholder', extraClass].filter(Boolean).join(' ');
        return `<div class="${className}" ${backgroundImageAttr(url)}>${url ? '' : fallbackLabel}</div>`;
    }

    // --- Data helpers ---

    /** Shallow merge that leaves `base` untouched when there is nothing to override. */
    function withOverride(base, override) {
        return override ? { ...base, ...override } : base;
    }

    global.PortfolioUtils = {
        setText,
        setTexts,
        setAttrs,
        setListItems,
        backgroundImageAttr,
        visualPlaceholder,
        withOverride
    };
})(window);
