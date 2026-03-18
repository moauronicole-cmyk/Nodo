/* =============================================
   NAVBAR.JS — NODO
   Gestisce comportamento navbar su tutte le pagine.
   Da includere PRIMA di qualsiasi altro script.
   ============================================= */

(function () {
    'use strict';

    /* ── CONFIGURAZIONE ──────────────────────────── */
    const PAGES = [
        { label: 'Home',  href: 'index.html' },
        { label: 'Esplora',   href: 'pulse.html' },
        { label: 'Aggiungi +', href:'segnala.html'},
        { label: 'Scene', href: 'scene.html' },
        { label: 'Profilo', href:'profilo.html'}
    ];

    /* ──────────────────────────────────────────────
       Determina la pagina corrente
    ────────────────────────────────────────────── */
    function getCurrentPage() {
        const path = window.location.pathname;
        const file = path.split('/').pop() || 'index.html';
        return file;
    }

    /* ──────────────────────────────────────────────
       Inietta la navbar desktop nell'elemento
       con id="nodo-navbar" (o crea l'elemento)
    ────────────────────────────────────────────── */
    function buildDesktopNav() {
        const current = getCurrentPage();
        
        // Determina se siamo nella landing page
        const isLanding = current === 'index.html' || current === '';

        const linksHTML = PAGES.map(p => {
            const isActive = current === p.href ? ' class="active"' : '';
            return `<li><a href="${p.href}"${isActive}>${p.label}</a></li>`;
        }).join('');

        const nav = document.createElement('nav');
        
        // Se è la landing, aggiunge la classe 'is-landing'
        nav.className = `nodo-nav${isLanding ? ' is-landing' : ''}`;
        
        nav.id = 'nodoNav';
        nav.innerHTML = `
            <a class="nodo-nav__logo" href="index.html">NO<span>DO</span></a>
            <ul class="nodo-nav__links">
                ${linksHTML}
            </ul>
            <div class="nodo-nav__right">
                <a class="nodo-nav__avatar nodo-nav__avatar--guest" href="profilo.html" aria-label="Profilo">
                    👤
                </a>
            </div>
        `;
        return nav;
    }

    /* ──────────────────────────────────────────────
       Inietta la bottom nav mobile
    ────────────────────────────────────────────── */
    function buildBottomNav() {
        const current = getCurrentPage();

        const itemsHTML = PAGES.map(p => {
            const isActive = current === p.href ? ' active' : '';
            return `
                <li>
                    <a class="nodo-bottom-nav__item${isActive}" href="${p.href}">
                        <span class="nodo-bottom-nav__label">${p.label}</span>
                    </a>
                </li>
            `;
        }).join('');

        const nav = document.createElement('nav');
        nav.className = 'nodo-bottom-nav';
        nav.id = 'nodoBottomNav';
        nav.setAttribute('aria-label', 'Navigazione principale');
        nav.innerHTML = `<ul class="nodo-bottom-nav__items">${itemsHTML}</ul>`;
        return nav;
    }

    /* ──────────────────────────────────────────────
       Scroll shadow sulla navbar desktop
    ────────────────────────────────────────────── */
    function initScrollShadow() {
        const nav = document.getElementById('nodoNav');
        if (!nav) return;

        const handler = () => {
            nav.classList.toggle('scrolled', window.scrollY > 30);
        };

        window.addEventListener('scroll', handler, { passive: true });
        handler();
    }

    /* ──────────────────────────────────────────────
       Rimuove la vecchia navbar esistente
       (per la transizione dalle pagine vecchie)
    ────────────────────────────────────────────── */
    function removeOldNav() {
        // Rimuove navbar vecchie con classe .navbar o header con logo
        const oldNavs = document.querySelectorAll('nav.navbar, header.navbar');
        oldNavs.forEach(el => el.remove());

        // Rimuove eventuali header che fanno da navbar in pulse.html
        const headers = document.querySelectorAll('header');
        headers.forEach(h => {
            if (h.querySelector('.logo') && h.querySelector('nav')) {
                // è un header-navbar ibrido — lo rimuoviamo
                h.remove();
            }
        });
    }

    /* ──────────────────────────────────────────────
       INIT — aspetta che il DOM sia pronto
    ────────────────────────────────────────────── */
    function init() {
        removeOldNav();

        const desktopNav = buildDesktopNav();
        const bottomNav  = buildBottomNav();

        // Inserisce in cima al body
        document.body.insertBefore(desktopNav, document.body.firstChild);
        // Inserisce in fondo al body
        document.body.appendChild(bottomNav);

        initScrollShadow();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
