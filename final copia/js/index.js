/* =============================================
   INDEX.JS — NODO Home
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ── SCROLL REVEAL ── */
    const revealEls = document.querySelectorAll('.scroll-reveal');
    if (revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(el => observer.observe(el));
    }

    /* ── COUNTER ANIMATO ── */
    function animateCounter(el, target, duration = 1200) {
        let start = null;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    }

    const statNums = document.querySelectorAll('[data-count]');
    if (statNums.length) {
        const statsObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    animateCounter(e.target, parseInt(e.target.dataset.count));
                    statsObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });
        statNums.forEach(el => statsObs.observe(el));
    }

    /* ── HERO TAG CLICK ── */
    document.querySelectorAll('.hero-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.hero-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
        });
    });

    /* ── SALVATI ── */
    renderSaved();
});

/* ── GESTIONE SALVATI (localStorage) ── */
function getSaved() {
    try { return JSON.parse(localStorage.getItem('nodo_saved') || '[]'); }
    catch { return []; }
}

function renderSaved() {
    const container = document.getElementById('saved-grid');
    if (!container) return;
    const saved = getSaved();
    const emptyMsg = document.getElementById('saved-empty');
    if (!saved.length) {
        container.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';
    container.innerHTML = saved.map(spot => `
        <article class="brutal-card">
            <div class="card-content">
                <span class="card-tag">${spot.category || 'SPOT'}</span>
                <h3 class="card-title">${spot.name}</h3>
                <p class="card-desc">${spot.neighborhood || ''}</p>
                <button class="btn-remove-saved" onclick="removeSaved('${spot.id}')">✕ Rimuovi</button>
            </div>
        </article>
    `).join('');
}

function removeSaved(id) {
    const saved = getSaved().filter(s => String(s.id) !== String(id));
    localStorage.setItem('nodo_saved', JSON.stringify(saved));
    renderSaved();
}

window.addToSaved = function(spot) {
    const saved = getSaved();
    if (!saved.find(s => s.id === spot.id)) {
        saved.push(spot);
        localStorage.setItem('nodo_saved', JSON.stringify(saved));
        renderSaved();
    }
};

/* ── REVEAL ON SCROLL (landing) ── */
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), i * 80);
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
});
