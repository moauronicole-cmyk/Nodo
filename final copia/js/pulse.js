/* =============================================
   PULSE.JS — NODO Map
   Legge luoghi da Supabase
   ============================================= */

const NIGHT_CATEGORIES = ['club', 'centri sociali'];
const NIGHT_TAGS = ['24/7', 'Notte', 'Serata'];

const CAT_EMOJI = {
    'cinema':            '📽️',
    'caffè letterari':   '📖',
    'aule studio':       '📚',
    'centri sociali':    '✊',
    'club':              '🎵',
    'thrifting':         '👗',
    'parchi attrezzati': '🌿',
    'skatepark':         '🛹',
    'baretti':           '☕️',
    'schimico':          '🥌',
};

let allPlaces  = [];
let activeCat  = 'tutti';
let searchQ    = '';
let nightMode  = false;
let selectedId = null;
let mapReady   = false;
let leafletMap = null;
const markerMap = {};

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
    initMap();
    await loadPlaces();
    setupFilters();
    setupSearch();
    setupNightMode();
    setupOverlay();
});

/* ── CARICA DA SUPABASE ── */
async function loadPlaces() {
    try {
        const { data, error } = await sb
            .from('luoghi')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        allPlaces = data || [];
    } catch (err) {
        console.warn('Supabase error, uso fallback:', err.message);
        allPlaces = FALLBACK_PLACES;
    }

    renderCards(getFiltered());
    updateMapMarkers(getFiltered());
}

/* ── FILTRO ── */
function getFiltered() {
    return allPlaces.filter(p => {
        const catOk = activeCat === 'tutti' || p.category === activeCat;
        const q = searchQ.toLowerCase();
        const searchOk = !q
            || p.name.toLowerCase().includes(q)
            || p.neighborhood.toLowerCase().includes(q)
            || (p.tags || []).some(t => t.toLowerCase().includes(q));
        const nightOk = !nightMode || isNightPlace(p);
        return catOk && searchOk && nightOk;
    });
}

function isNightPlace(p) {
    return NIGHT_CATEGORIES.includes(p.category)
        || (p.tags || []).some(t => NIGHT_TAGS.includes(t));
}

function refresh() {
    const filtered = getFiltered();
    renderCards(filtered);
    updateMapMarkers(filtered);
}

/* ── RENDER CARDS ── */
function renderCards(places) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';

    if (!places.length) {
        sidebar.innerHTML = '<p class="empty-msg">Nessun posto trovato.</p>';
        return;
    }

    places.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'card' + (p.id === selectedId ? ' selected' : '');
        card.id = 'card-' + p.id;
        card.style.animationDelay = `${i * 40}ms`;

        const nightBadge = isNightPlace(p)
            ? '<span class="night-tag">🌙 APERTO DI NOTTE</span>' : '';

        card.innerHTML = `
            <div class="nbhd">${p.neighborhood}</div>
            <h3>${p.name}</h3>
            <p>${p.short_desc}</p>
            <div class="tags">
                ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            ${nightBadge}
        `;
        
        card.addEventListener('click', () => openDetail(p));
        sidebar.appendChild(card);
    });
}

/* ── MAPPA ── */
function initMap() {
    if (typeof L === 'undefined') return;
    leafletMap = L.map('map', { zoomControl: true }).setView([41.894, 12.502], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19
    }).addTo(leafletMap);
    mapReady = true;
}

function categoryIcon(category, active) {
    const emoji = CAT_EMOJI[category] || '📍';
    const bg     = active ? '#CCFF00' : '#1A1A1A';
    const border = active ? '#CCFF00' : '#F4F4F0';
    return L.divIcon({
        className: '',
        html: `<div style="
            display:flex;align-items:center;justify-content:center;
            width:34px;height:34px;
            background:${bg};border:2px solid ${border};
            box-shadow:3px 3px 0 #111;font-size:16px;
            transform:${active ? 'scale(1.25)' : 'scale(1)'};
            transition:transform 0.15s;
        ">${emoji}</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -22]
    });
}

function updateMapMarkers(places) {
    if (!mapReady) return;
    Object.values(markerMap).forEach(m => leafletMap.removeLayer(m));
    for (const k in markerMap) delete markerMap[k];

    places.forEach(p => {
        const m = L.marker([p.lat, p.lng], {
            icon: categoryIcon(p.category, p.id === selectedId)
        }).addTo(leafletMap);
        m.bindPopup(`<strong style="font-family:monospace;font-size:0.8rem;text-transform:uppercase">${p.name}</strong><br><small>${p.neighborhood}</small>`);
        m.on('click', () => openDetail(p));
        markerMap[p.id] = m;
    });
}

/* ── OVERLAY DETTAGLIO ── */
function openDetail(place) {
    selectedId = place.id;

    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    const el = document.getElementById('card-' + place.id);
    if (el) { el.classList.add('selected'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }

    Object.entries(markerMap).forEach(([id, m]) => {
        const p = allPlaces.find(p => p.id === +id);
        if (p) m.setIcon(categoryIcon(p.category, +id === place.id));
    });

    if (mapReady && markerMap[place.id]) {
        leafletMap.flyTo([place.lat, place.lng], 15, { duration: 0.8 });
    }

    const isSaved = (JSON.parse(localStorage.getItem('nodo_saved') || '[]'))
        .find(s => s.id === place.id);

    document.getElementById('overlayBody').innerHTML = `
    <div class="overlay-inner">
        ${place.image_url ? `
        <div class="overlay-img">
            <img src="${place.image_url}" alt="${place.name}">
        </div>` : ''}
        <div class="overlay-text">
            <h2>${place.name}</h2>
            <div class="nbhd">📍 ${place.neighborhood}</div>
            <div class="tag-row">
                ${(place.tags || []).map(t => `<span class="tag-chip">${t}</span>`).join('')}
                ${isNightPlace(place) ? '<span class="tag-chip" style="background:#FF6B35">🌙 NOTTE</span>' : ''}
            </div>
            <p>${place.long_desc}</p>
            <div style="display:flex;gap:0.8rem;flex-wrap:wrap;">
                <button class="btn-go" onclick="window.open('https://www.google.com/maps?q=${place.lat},${place.lng}','_blank')">
                    PORTAMI LÌ →
                </button>
                <button class="btn-go" id="saveBtn" style="background:transparent;color:var(--fg);"
                    onclick="toggleSave(${JSON.stringify(place).replace(/"/g, '&quot;')})">
                    ${isSaved ? '✓ SALVATO' : '+ SALVA'}
                </button>
            </div>
        </div>
    </div>
`;

    document.getElementById('overlay').classList.add('open');
    
}

function closeOverlay() {
    document.getElementById('overlay').classList.remove('open');
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    if (selectedId !== null && markerMap[selectedId]) {
        const p = allPlaces.find(p => p.id === selectedId);
        if (p) markerMap[selectedId].setIcon(categoryIcon(p.category, false));
    }
    selectedId = null;
}

function toggleSave(place) {
    const saved = JSON.parse(localStorage.getItem('nodo_saved') || '[]');
    const exists = saved.find(s => s.id === place.id);
    let newSaved;
    if (exists) {
        newSaved = saved.filter(s => s.id !== place.id);
    } else {
        newSaved = [...saved, place];
    }
    localStorage.setItem('nodo_saved', JSON.stringify(newSaved));
    const btn = document.getElementById('saveBtn');
    if (btn) btn.textContent = exists ? '+ SALVA' : '✓ SALVATO';
}

/* ── SETUP ── */
function setupFilters() {
    const cats = document.getElementById('cats');
    if (!cats) return;
    cats.addEventListener('click', e => {
        const btn = e.target.closest('.cat-btn');
        if (!btn) return;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.dataset.cat;
        closeOverlay();
        refresh();
    });
}

function setupSearch() {
    const q = document.getElementById('q');
    if (!q) return;
    q.addEventListener('input', e => {
        searchQ = e.target.value;
        closeOverlay();
        refresh();
    });
}

function setupNightMode() {
    const btn   = document.getElementById('btnNight');
    const badge = document.getElementById('mapNightBadge');
    if (!btn) return;
    btn.addEventListener('click', () => {
        nightMode = !nightMode;
        btn.setAttribute('aria-pressed', nightMode);
        document.body.classList.toggle('night-mode', nightMode);
        if (badge) badge.classList.toggle('visible', nightMode);
        if (nightMode) {
            activeCat = 'tutti';
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            const tuttiBtn = document.querySelector('[data-cat="tutti"]');
            if (tuttiBtn) tuttiBtn.classList.add('active');
        }
        closeOverlay();
        refresh();
    });
}

function setupOverlay() {
    const closeBtn = document.getElementById('overlayClose');
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.addEventListener('click', e => {
        if (e.target === overlay) closeOverlay();
    });
}

function mobileView(v) {
    const sidebar  = document.getElementById('sidebar');
    const mapPanel = document.getElementById('mapPanel');
    const btnList  = document.getElementById('btnList');
    const btnMap   = document.getElementById('btnMap');
    if (!sidebar || !mapPanel) return;
    if (v === 'list') {
        sidebar.style.display = 'block';
        mapPanel.style.display = 'none';
        if (btnList) btnList.classList.add('active');
        if (btnMap)  btnMap.classList.remove('active');
    } else {
        sidebar.style.display = 'none';
        mapPanel.style.display = 'block';
        if (btnMap)  btnMap.classList.add('active');
        if (btnList) btnList.classList.remove('active');
        if (mapReady) setTimeout(() => leafletMap.invalidateSize(), 150);
    }
}

