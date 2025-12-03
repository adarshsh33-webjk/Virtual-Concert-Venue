// script.js — full rewrite (drop-in replacement)
// - Diagnostic logger
// - EVENTS (fixed image paths)
// - Robust DOM-based renderEvents (safe against malformed data)
// - Improved YouTube ID extractor + preloading thumbnail logic for highlights
// - Filters (genre + country), search, nav interactions, forms
// - Defensive init and nav hotfix to ensure navigation works

// -------------------- Diagnostic logger --------------------
window.addEventListener('error', function (ev) {
  console.error('[GLOBAL ERROR]', ev.message, 'at', `${ev.filename}:${ev.lineno}:${ev.colno}`);
});
window.addEventListener('unhandledrejection', function (ev) {
  console.error('[UNHANDLED PROMISE REJECTION]', ev.reason);
});
console.info('[script.js] diagnostic logger active');
// -------------------- DATA: EVENTS --------------------
const EVENTS = [
  {
    id: 'taylor-eras',
    name: "Taylor Swift – The Eras Tour",
    genre: "pop",
    country: "UK",
    img: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80",
    venue:"Wembley Stadium, London | Aug 22, 2025",
    map: "https://www.google.com/maps?q=Wembley%20Stadium%20London&output=embed",
    featured: true,
    tags: ['taylor', 'swift', 'eras', 'pop']
  },
  {
    id: 'tomorrowland',
    name: "Tomorrowland 2025",
    genre: "edm",
    country: "Belgium",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    venue: "Boom, Belgium | Jul 18–27, 2025",
    map: "https://www.google.com/maps?q=Boom%20Belgium&output=embed",
    featured: true,
    tags: ['tomorrowland', 'edm', 'festival']
  },
  {
    id: 'coachella',
    name: "Coachella 2025",
    genre: "rock",
    img: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=80",
    country: "USA",
    venue: "Indio, California | Apr 11–20, 2025",
    map: "https://www.google.com/maps?q=Indio%20California&output=embed",
    featured: true,
    tags: ['coachella', 'rock', 'festival']
  },
  {
    id: 'jazz-paris',
    name: "Jazz in Paris",
    genre: "jazz",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    country: "France",
    venue: "Paris, France | Sep 12, 2025",
    map: "https://www.google.com/maps?q=Paris%20France&output=embed",
    featured: false,
    tags: ['jazz', 'paris', 'france']
  },
  {
    id: 'indie-night',
    name: "Indie Night Live",
    genre: "rock",
    country: "USA",
    img: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=80",
    venue: "Brooklyn, NY | May 5, 2025",
    map: "https://www.google.com/maps?q=Brooklyn%20NY&output=embed",
    featured: false,
    tags: ['indie', 'rock', 'brooklyn']
  },
  {
    id: 'edm-rave',
    name: "Neon Rave – EDM Night",
    genre: "edm",
    country: "UK",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    venue: "Fabric, London | Jun 15, 2025",
    map: "https://www.google.com/maps?q=Fabric%20London&output=embed",
    featured: false,
    tags: ['edm', 'rave', 'fabric']
  },
  {
    id: 'nyc-hiphop-fest',
    name: "NYC Hip Hop Fest",
    genre: "hiphop",
    country: "USA",
    img: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?auto=format&fit=crop&w=800&q=80",
    venue: "Brooklyn Mirage, NY | Sep 10, 2025",
    map: "https://www.google.com/maps?q=Brooklyn+NY&output=embed",
    featured: false,
    tags: ['hiphop','rap','brooklyn']
  }
];

// -------------------- BACKGROUNDS --------------------
const BG = {
  edm: "linear-gradient(135deg, rgba(6,0,18,0.65), rgba(12,0,32,0.35)), url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1500&q=80')",
  pop: "linear-gradient(135deg, rgba(8,0,18,0.55), rgba(18,8,30,0.28)), url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1500&q=80')",
  rock: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(18,18,18,0.35)), url('https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=1500&q=80')",
  jazz: "linear-gradient(135deg, rgba(10,6,18,0.6), rgba(16,10,30,0.34)), url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1500&q=80')",
  hiphop: "linear-gradient(135deg, rgba(8,2,18,0.6), rgba(18,6,30,0.34)), url('https://images.unsplash.com/photo-1518972559570-7cc1309f3229?auto=format&fit=crop&w=1500&q=80')",
  all: "linear-gradient(135deg, rgba(8,2,20,0.6), rgba(10,4,30,0.5)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')"
};

function setPreferredGenre(genre) { try { localStorage.setItem('preferredGenre', genre); } catch (e) {} }
function getPreferredGenre() { try { return localStorage.getItem('preferredGenre') || 'all'; } catch (e) { return 'all'; } }

function applyThemeBackground(genre){
  const hero = document.getElementById('genreHero') || document.querySelector('.hero');
  const bg = BG[genre] || BG.all;

  if (document.body.classList.contains('events-page')) {
    if (genre === 'all') document.body.classList.add('default-events-bg');
    else document.body.classList.remove('default-events-bg');
  }

  try {
    document.body.style.backgroundImage = bg;
    document.body.style.backgroundSize = 'cover, cover';
    document.body.style.backgroundRepeat = 'no-repeat, no-repeat';
    document.body.style.backgroundPosition = 'center, center';
    document.body.style.backgroundAttachment = 'fixed, fixed';
  } catch (e) {
    document.body.style.background = BG.all;
  }

  if (hero) { hero.style.backgroundImage = 'none'; hero.style.background = 'transparent'; }
}

// -------------------- DOM-BASED EVENTS RENDERER (robust) --------------------
function renderEvents(list, containerId = 'eventGrid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (!Array.isArray(list) || list.length === 0) {
    const p = document.createElement('p');
    p.style.color = 'var(--muted)';
    p.style.textAlign = 'center';
    p.style.padding = '2rem';
    p.textContent = 'No events found.';
    container.appendChild(p);
    return;
  }

  list.forEach(ev => {
    const article = document.createElement('article');
    article.className = 'event-card';
    article.setAttribute('aria-labelledby', `${ev.id}-title`);

    // Image
    const img = document.createElement('img');
    img.alt = `${ev.name} image`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = ev.img || 'https://via.placeholder.com/800x450?text=No+Image';
    img.style.width = '100%';
    img.style.height = '180px';
    img.style.objectFit = 'cover';

    // Card body
    const body = document.createElement('div');
    body.className = 'card-body';

    const h3 = document.createElement('h3');
    h3.id = `${ev.id}-title`;
    h3.textContent = ev.name;

    const pVenue = document.createElement('p');
    pVenue.textContent = ev.venue || '';

    const pMeta = document.createElement('p');
    pMeta.style.color = 'var(--muted)';
    pMeta.style.marginBottom = '.5rem';
    pMeta.style.fontSize = '.9rem';
    pMeta.textContent = `${(ev.genre || '').toUpperCase()} • ${ev.country || ''}`;

    // Map iframe container
    const mapWrap = document.createElement('div');
    mapWrap.style.borderRadius = '10px';
    mapWrap.style.overflow = 'hidden';
    mapWrap.style.border = '1px solid rgba(255,255,255,0.04)';
    mapWrap.style.marginTop = '.6rem';

    if (ev.map) {
      const iframe = document.createElement('iframe');
      iframe.className = 'map';
      iframe.title = `Map for ${ev.name}`;
      iframe.src = ev.map;
      iframe.loading = 'lazy';
      mapWrap.appendChild(iframe);
    }

    // Assemble
    article.appendChild(img);
    body.appendChild(h3);
    body.appendChild(pVenue);
    body.appendChild(pMeta);
    body.appendChild(mapWrap);
    article.appendChild(body);
    container.appendChild(article);
  });
}

// -------------------- FEATURED HOME --------------------
function renderFeaturedHome() {
  const homeContainer = document.getElementById('homeEvents');
  if (!homeContainer) return;
  const featured = EVENTS.filter(e => e.featured);
  renderEvents(featured, 'homeEvents');
}

// -------------------- HIGHLIGHTS (YouTube thumbnails with preloader) --------------------
const HIGHLIGHTS = [
  { id: 'h1', title: 'Coachella Crowd', url: 'https://youtu.be/1Ys6JOBdBdA?si=M_UpbAXCVTTx916w' },
  { id: 'h2', title: 'Tomorrowland Fireworks', url: 'https://youtu.be/ryIz5jiT6Pc?si=nA9Q1FS2WZyV7gzs' },
  { id: 'h3', title: 'Lollapalooza Stage', url: 'https://youtu.be/R5aZcQG3DQk?si=s5AYEkaD8mhwVzE5' },
  { id: 'h4', title: 'Rock Moshpit', url: 'https://youtu.be/9NdiHe-aZUc?si=XFgZM61fmNeuGAYm' }
];

// improved YouTube ID extractor (handles youtu.be, watch?v=, embed, shorts)
function getYouTubeId(url) {
  if (!url) return null;
  try { url = String(url).trim(); } catch (e) { return null; }

  const patterns = [
    /youtu\.be\/([^\?&\/]+)/i,
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtube\.com\/embed\/([^?&\/]+)/i,
    /youtube\.com\/shorts\/([^?&\/]+)/i,
    /youtube\.com\/v\/([^?&\/]+)/i
  ];

  for (const re of patterns) {
    const m = url.match(re);
    if (m && m[1]) return m[1];
  }

  // fallback — last path segment before query
  const last = url.split('/').pop().split('?')[0].split('&')[0];
  return last && last.length >= 8 && last.length <= 32 ? last : null;
}

// helper: resolve first working thumbnail from candidates (preloads)
function findFirstWorkingThumbnail(urls = [], timeout = 3500) {
  return new Promise((resolve) => {
    if (!Array.isArray(urls) || urls.length === 0) return resolve(null);
    let settled = false;
    let remaining = urls.length;
    urls.forEach(u => {
      const img = new Image();
      let done = false;
      const t = setTimeout(() => {
        if (done) return;
        done = true;
        remaining--;
        if (!settled && remaining <= 0) { settled = true; resolve(null); }
      }, timeout);

      img.onload = () => {
        if (done) return;
        done = true;
        clearTimeout(t);
        if (!settled) { settled = true; resolve(u); }
      };
      img.onerror = () => {
        if (done) return;
        done = true;
        clearTimeout(t);
        remaining--;
        if (!settled && remaining <= 0) { settled = true; resolve(null); }
      };
      img.src = u;
    });
  });
}

async function renderHighlights(list) {
  const container = document.getElementById('highlightGrid');
  if (!container) {
    console.warn('[renderHighlights] #highlightGrid not found');
    return;
  }

  container.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = `<p style="color:var(--muted);text-align:center;padding:2rem">No highlights found.</p>`;
    return;
  }

  const placeholder = 'https://via.placeholder.com/1280x720?text=No+Thumbnail';

  for (const h of list) {
    const vid = getYouTubeId(h.url || '');
    const thumbs = vid ? [
      `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${vid}/sddefault.jpg`,
      `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${vid}/default.jpg`
    ] : [h.img || placeholder];

    // Create DOM structure first (stable layout)
    const figure = document.createElement('figure');
    figure.className = 'highlight-item';
    figure.tabIndex = 0;

    const a = document.createElement('a');
    a.href = h.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', `Open highlight: ${h.title || 'video'}`);

    const imgEl = document.createElement('img');
    imgEl.className = 'highlight-thumb';
    imgEl.alt = h.title || 'Highlight';
    imgEl.loading = 'lazy';
    imgEl.decoding = 'async';
    imgEl.style.width = '100%';
    imgEl.style.height = '220px';
    imgEl.style.objectFit = 'cover';
    imgEl.style.display = 'block';
    imgEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"></svg>';

    const overlay = document.createElement('span');
    overlay.className = 'play-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    a.appendChild(imgEl);
    a.appendChild(overlay);
    figure.appendChild(a);
    container.appendChild(figure);

    // Resolve working thumbnail and assign
    try {
      const good = await findFirstWorkingThumbnail(thumbs, 3500);
      imgEl.src = good || (h.img || placeholder);
    } catch (err) {
      imgEl.src = h.img || placeholder;
    }
  }

  console.info(`[renderHighlights] started rendering ${list.length} highlights (thumbnails loading)`);
}

// -------------------- FILTERS + DROPDOWNS --------------------
function initEventFilters() {
  const genreDropdown = document.getElementById('genreDropdown');
  const countryDropdown = document.getElementById('countryDropdown');

  const preferred = getPreferredGenre();
  applyThemeBackground(preferred);

  function filterAndRender(g = 'all', c = 'all') {
    setPreferredGenre(g);
    applyThemeBackground(g);
    const filtered = EVENTS.filter(e => {
      const okGenre = (g === 'all') ? true : e.genre === g;
      const okCountry = (c === 'all') ? true : e.country === c;
      return okGenre && okCountry;
    });
    renderEvents(filtered, 'eventGrid');
  }

  // Guard: only attach to dropdowns that exist
  document.querySelectorAll(".dropdown").forEach(drop => {
    const btn = drop.querySelector('.dropbtn');
    const content = drop.querySelector('.dropdown-content');
    if (!btn || !content) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = drop.classList.contains('active');
      document.querySelectorAll(".dropdown").forEach(d => {
        if (d !== drop) {
          d.classList.remove('active');
          const ob = d.querySelector('.dropbtn');
          if (ob) ob.setAttribute('aria-expanded', 'false');
        }
      });
      drop.classList.toggle('active');
      btn.setAttribute('aria-expanded', String(!isActive));
      if (!isActive) {
        const first = content.querySelector('[tabindex]') || content.querySelector('div');
        if (first) first.focus();
      }
    });

    // keyboard nav
    const items = Array.from(content.querySelectorAll('div'));
    content.addEventListener('keydown', (ev) => {
      const idx = items.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown') { ev.preventDefault(); items[(idx + 1) % items.length].focus(); }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
      if (ev.key === 'Home') { ev.preventDefault(); items[0].focus(); }
      if (ev.key === 'End') { ev.preventDefault(); items[items.length - 1].focus(); }
      if (ev.key === 'Escape') { drop.classList.remove('active'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });

    items.forEach(item => {
      item.addEventListener('click', () => {
        item.parentElement.querySelectorAll('div').forEach(d => d.classList.remove('selected'));
        item.classList.add('selected');

        const gVal = genreDropdown ? (genreDropdown.querySelector('.selected')?.dataset.genre || 'all') : 'all';
        const cVal = countryDropdown ? (countryDropdown.querySelector('.selected')?.dataset.country || 'all') : 'all';
        filterAndRender(gVal, cVal);

        drop.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown').forEach(d => {
        d.classList.remove('active');
        const b = d.querySelector('.dropbtn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // initial render using preferred genre
  filterAndRender(preferred, 'all');
}

// -------------------- SEARCH (HOME & HIGHLIGHTS) --------------------
function initHomeSearch() {
  const homeSearch = document.getElementById('homeSearch');
  if (!homeSearch) return;

  function doSearch() {
    const q = homeSearch.value.trim().toLowerCase();
    const featured = EVENTS.filter(e => e.featured);
    if (!q) { renderEvents(featured, 'homeEvents'); return; }

    const results = featured.filter(e => {
      return e.name.toLowerCase().includes(q) || e.tags.some(t => t.includes(q)) || (e.venue || '').toLowerCase().includes(q);
    });
    renderEvents(results, 'homeEvents');
  }

  homeSearch.addEventListener('input', debounce(doSearch, 200));
}

function initHighlightsSearch() {
  const inp = document.getElementById('highlightsSearch');
  if (!inp) { renderHighlights(HIGHLIGHTS); return; }

  function doSearch() {
    const q = inp.value.trim().toLowerCase();
    if (!q) { renderHighlights(HIGHLIGHTS); return; }
    const res = HIGHLIGHTS.filter(h => (h.title || '').toLowerCase().includes(q));
    renderHighlights(res);
  }

  inp.addEventListener('input', debounce(doSearch, 200));
}

// -------------------- NAV INTERACTIONS --------------------
function initNavInteractions() {
  const toggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('show');
      toggle.classList.toggle('active');
    });
  }

  // fallback account dropdowns
  document.querySelectorAll('.dropdown-btn').forEach(btn => {
    const parent = btn.closest('.account-dropdown');
    const dd = parent ? parent.querySelector('.dropdown') : null;
    if (!dd) return;
    btn.addEventListener('click', () => {
      const open = dd.style.display === 'block';
      document.querySelectorAll('.dropdown').forEach(el => { if (el !== dd) el.style.display = 'none'; });
      dd.style.display = open ? 'none' : 'block';
      btn.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('click', (ev) => {
      if (parent && !parent.contains(ev.target)) { dd.style.display = 'none'; btn.setAttribute('aria-expanded', 'false'); }
    });
  });
}

// -------------------- FORMS --------------------
function initForms() {
  const login = document.getElementById('loginForm');
  if (login) {
    login.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const pass = document.getElementById('loginPassword').value;
      if (!email || !pass || pass.length < 6) { alert('Please enter valid credentials (demo).'); return; }
      alert('Login demo success — no backend connected.');
      login.reset();
    });
  }

  const reg = document.getElementById('registerForm');
  if (reg) {
    reg.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fullname').value;
      const email = document.getElementById('regEmail').value;
      const pass = document.getElementById('regPassword').value;
      if (!name || !email || !pass || pass.length < 6) { alert('Please fill all fields. (demo)'); return; }
      alert('Register demo success — no backend connected.');
      reg.reset();
    });
  }
}

// -------------------- UTILITIES --------------------
function debounce(fn, wait = 200) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
function setFooterYears() {
  ['yearHome', 'yearEvents', 'yearHighlights'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = new Date().getFullYear(); });
}

// -------------------- Defensive INIT --------------------
document.addEventListener('DOMContentLoaded', () => {
  try {
    setFooterYears();

    const pref = getPreferredGenre();
    applyThemeBackground(pref);

    // Safe featured render
    try {
      const hc = document.getElementById('homeEvents');
      if (hc) renderFeaturedHome();
      else console.info('[init] #homeEvents not present — skipped featured render.');
    } catch (e) {
      console.error('[init] renderFeaturedHome error', e);
    }

    // Highlights
    try { renderHighlights(HIGHLIGHTS); } catch (e) { console.error('[init] renderHighlights failed', e); }

    // Page-specific inits
    if (document.getElementById('eventGrid')) {
      try { initEventFilters(); } catch (e) { console.error('[init] initEventFilters failed', e); }
    }

    try { initHomeSearch(); } catch (e) { console.error('[init] initHomeSearch failed', e); }
    try { initHighlightsSearch(); } catch (e) { console.error('[init] initHighlightsSearch failed', e); }

    try { initNavInteractions(); } catch (e) { console.error('[init] initNavInteractions failed', e); }
    try { initForms(); } catch (e) { console.error('[init] initForms failed', e); }

    console.info('[init] completed (defensive mode)');
  } catch (err) {
    console.error('[init] top-level init failed', err);
  }
});

// -------------------- NAV HOTFIX: force navigation if prevented --------------------
(function navNavigationHotfix(){
  function log(...args){ try{ console.info('[nav-hotfix]', ...args); } catch(e){} }

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', function (ev) {
      const href = this.getAttribute('href');
      log('clicked nav link', href, 'defaultPrevented=', ev.defaultPrevented);
      if (!href || href === '#') return;
      setTimeout(() => {
        try {
          const targetUrl = new URL(href, location.href);
          if (location.pathname !== targetUrl.pathname || location.search !== targetUrl.search || location.hash !== targetUrl.hash) {
            log('forcing navigation to', targetUrl.href);
            window.location.href = targetUrl.href;
          } else {
            log('navigation already occurred to', targetUrl.href);
          }
        } catch (err) { console.error('[nav-hotfix] invalid href', href, err); }
      }, 60);
    }, { passive: true });
  });

  document.querySelectorAll('.cta').forEach(el => {
    el.addEventListener('click', function (ev) {
      const href = this.getAttribute('href') || this.dataset.href;
      log('clicked CTA', href);
      if (!href) return;
      setTimeout(() => {
        try {
          const targetUrl = new URL(href, location.href);
          if (location.pathname !== targetUrl.pathname || location.search !== targetUrl.search || location.hash !== targetUrl.hash) {
            log('forcing CTA navigation to', targetUrl.href);
            window.location.href = targetUrl.href;
          }
        } catch (err) { console.error('[nav-hotfix] invalid CTA href', href, err); }
      }, 60);
    }, { passive: true });
  });

  document.addEventListener('click', (ev) => {
    const t = ev.target.closest && ev.target.closest('a');
    if (t) {
      log('global click on anchor', t.getAttribute('href'));
      if (ev.defaultPrevented) log('note: default prevented on this click');
    }
  }, true);
})();
