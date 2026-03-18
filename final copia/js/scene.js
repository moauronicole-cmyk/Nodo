/* =========================================
   THEGRID.JS — Bacheca Urbana
   Carica eventi da eventi.json,
   renderizza i poster sul muro
   ========================================= */

let allEvents = [];
let activeCategory = 'tutti';

// =========================================
// INIT
// =========================================
async function init() {
    try {
        const res = await fetch('../data/eventi.json');
        allEvents = await res.json();
        renderPosters(allEvents);
    } catch (err) {
        console.error('Errore caricamento eventi:', err);
        // Fallback: mostra empty state
        document.getElementById('wallEmpty').style.display = 'flex';
    }

    setupFilters();
    setupNavbar();
    setupHamburger();
}

// =========================================
// RENDER POSTER
// =========================================
function renderPosters(events) {
    const stage = document.getElementById('postersStage');
    const empty = document.getElementById('wallEmpty');

    stage.innerHTML = '';

    if (!events.length) {
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';

    events.forEach((ev, i) => {
        const poster = createPoster(ev, i);
        stage.appendChild(poster);

        // Staggered reveal
        setTimeout(() => {
            poster.classList.add('visible');
        }, i * 80);
    });
}

function createPoster(ev, index) {
    const a = document.createElement('a');
    a.className = 'poster';
    a.href = ev.link || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    // Rotazione dal JSON, con piccola variazione casuale per naturalezza
    const baseRot = ev.rotation || 0;
    const jitter = (Math.random() - 0.5) * 1.5;
    const finalRot = baseRot + jitter;
    a.style.setProperty('--rot', `${finalRot}deg`);

    // Colore del poster dall'evento
    const color = ev.color || '#CCFF00';

    // Contrasto testo automatico sul colore
    const textColor = isLight(color) ? '#111' : '#F4F4F0';

    a.innerHTML = `
        <div class="poster-header" style="background:${color}">
            <span class="poster-category" style="color:${textColor}">${ev.category.toUpperCase()}</span>
            <div class="poster-name" style="color:${textColor}">${ev.name}</div>
        </div>
        <div class="poster-body">
            <span class="poster-date">${ev.date}</span>
            <span class="poster-time">H: ${ev.time}</span>
            <span class="poster-venue">${ev.venue}</span>
            <span class="poster-neighborhood">📍 ${ev.neighborhood}</span>
        </div>
        <div class="poster-footer">
            <span class="poster-cta" style="background:${color}; color:${textColor}">INFO →</span>
            <span class="poster-arrow">↗</span>
        </div>
    `;

    return a;
}

// Determina se un colore hex è chiaro o scuro
function isLight(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0,2), 16);
    const g = parseInt(c.substring(2,4), 16);
    const b = parseInt(c.substring(4,6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

// =========================================
// FILTRI CATEGORIA
// =========================================
function setupFilters() {
    const cats = document.querySelectorAll('.cat-btn');

    cats.forEach(btn => {
        btn.addEventListener('click', () => {
            cats.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeCategory = btn.dataset.cat;

            const filtered = activeCategory === 'tutti'
                ? allEvents
                : allEvents.filter(ev => ev.category === activeCategory);

            // Fade out veloce poi re-render
            const stage = document.getElementById('postersStage');
            stage.style.opacity = '0';
            stage.style.transition = 'opacity 0.2s ease';

            setTimeout(() => {
                renderPosters(filtered);
                stage.style.opacity = '1';
            }, 200);
        });
    });
}

// =========================================
// NAVBAR SCROLL
// =========================================
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

// =========================================
// HAMBURGER MOBILE
// =========================================
function setupHamburger() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });
}

// =========================================
// START
// =========================================
document.addEventListener('DOMContentLoaded', init);
