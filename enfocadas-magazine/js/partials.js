/* ============================================================
   ENFOCADAS — header, footer y buscador (inyectados en cada página)
   ============================================================ */

const NAV_ITEMS = [
  { label: 'Home', href: 'index.html', page: 'home' },
  { label: 'Perfiles', href: 'perfiles.html', page: 'perfiles' },
  { label: 'Análisis de imágenes', href: 'analisis-imagenes.html', page: 'analisis' },
  { label: 'Reportaje', href: 'reportaje.html', page: 'reportaje' },
  { label: 'Encuesta', href: 'encuesta.html', page: 'encuesta' },
  { label: 'Glosario', href: 'glosario.html', page: 'glosario' },
  { label: 'Conócenos', href: 'conocenos.html', page: 'conocenos' },
];

function renderHeader() {
  const mount = document.getElementById('site-header');
  if (!mount) return;
  const current = document.body.dataset.page || '';

  const navLinks = NAV_ITEMS.map(item => {
    const active = item.page === current ? ' active' : '';
    return `<a href="${item.href}" class="${active.trim()}">${item.label}</a>`;
  }).join('');

  mount.innerHTML = `
    <div class="bar">
      <div class="nav-left">
        <button class="back-btn" id="backBtn" aria-label="Volver">←</button>
        <a href="index.html" class="logo">Enfocadas<span class="dot">.</span></a>
      </div>
      <nav class="main-nav" id="mainNav">${navLinks}</nav>
      <div class="nav-right">
        <button class="icon-btn" id="searchBtn" aria-label="Buscar">⌕</button>
        <button class="nav-toggle" id="navToggle" aria-label="Menú">☰</button>
      </div>
    </div>
  `;

  document.getElementById('backBtn').addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });

  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('mainNav').classList.toggle('open');
  });

  document.getElementById('searchBtn').addEventListener('click', openSearch);
}

function renderFooter() {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  mount.innerHTML = `
    <div class="foot-logo">Enfocadas<span style="color:var(--pink)">.</span></div>
    <p>Revista digital sobre mujeres detrás y frente al lente.</p>
    <p style="margin-top:10px; opacity:0.6;">© ${new Date().getFullYear()} Enfocadas — proyecto en desarrollo.</p>
  `;
}

function renderSearchOverlay() {
  const mount = document.getElementById('search-overlay-root');
  if (!mount) return;
  mount.innerHTML = `
    <div class="search-overlay" id="searchOverlay">
      <div class="search-box">
        <div class="search-meta">
          <span class="eyebrow subtitle-font">Buscar en Enfocadas</span>
          <button class="search-close" id="searchClose" aria-label="Cerrar">✕</button>
        </div>
        <input type="text" id="searchInput" placeholder="Busca un perfil, artículo o término..." autocomplete="off">
        <div class="search-results" id="searchResults"></div>
      </div>
    </div>
  `;

  document.getElementById('searchClose').addEventListener('click', closeSearch);
  document.getElementById('searchOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'searchOverlay') closeSearch();
  });
  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
    if ((e.key === '/' || (e.metaKey && e.key.toLowerCase() === 'k')) && !isSearchOpen()) {
      const tag = document.activeElement.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        openSearch();
      }
    }
  });
}

function isSearchOpen() {
  const el = document.getElementById('searchOverlay');
  return el && el.classList.contains('open');
}

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  overlay.classList.add('open');
  const input = document.getElementById('searchInput');
  input.value = '';
  renderSearchResults('');
  setTimeout(() => input.focus(), 50);
}

function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
}

function renderSearchResults(query) {
  const box = document.getElementById('searchResults');
  const q = query.trim().toLowerCase();
  if (!q) {
    box.innerHTML = `<div class="search-empty">Escribe para buscar en perfiles, reportajes, glosario y más…</div>`;
    return;
  }
  const results = (window.SEARCH_INDEX || []).filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.section.toLowerCase().includes(q) ||
    (item.keywords || '').toLowerCase().includes(q)
  );
  if (!results.length) {
    box.innerHTML = `<div class="search-empty">Sin resultados para "${escapeHtml(query)}"</div>`;
    return;
  }
  box.innerHTML = results.map(r => `
    <a class="search-result" href="${r.url}">
      <div class="sr-section">${r.section}</div>
      <div class="sr-title">${r.title}</div>
    </a>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  renderSearchOverlay();
});
