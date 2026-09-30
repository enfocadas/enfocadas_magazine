/* ============================================================
   ENFOCADAS — índice de búsqueda, likes/share/repost, comentarios
   ============================================================ */

/* ---------- Índice de búsqueda global ---------- */
window.SEARCH_INDEX = [
  { title: 'Girls Just Get It — Faith Nguyen', section: 'Perfiles · Escrito', url: 'perfil-faith-nguyen.html', keywords: 'fotógrafa conciertos música foso festival mujeres arquitectura Boston' },
  { title: 'Perfiles', section: 'Sección', url: 'perfiles.html', keywords: 'escritos video fotógrafas' },
  { title: 'Análisis de imágenes', section: 'Sección', url: 'analisis-imagenes.html', keywords: 'composición fotografía análisis visual' },
  { title: 'Reportaje', section: 'Sección', url: 'reportaje.html', keywords: 'reportaje mujeres fotografía industria' },
  { title: 'Resultados de encuesta', section: 'Sección', url: 'encuesta.html', keywords: 'encuesta datos estadísticas resultados' },
  { title: 'Glosario', section: 'Sección', url: 'glosario.html', keywords: 'términos definiciones fotografía glosario' },
  { title: 'Conócenos', section: 'Sección', url: 'conocenos.html', keywords: 'equipo sobre nosotras misión' },
];

/* ---------- Toast ---------- */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Likes / Share / Repost ---------- */
function initSocialBar(slug) {
  const bar = document.querySelector('.social-bar');
  if (!bar) return;

  const likeKeyCount = `enfocadas_likes_${slug}`;
  const likeKeyState = `enfocadas_liked_${slug}`;
  const repostKeyCount = `enfocadas_reposts_${slug}`;
  const repostKeyState = `enfocadas_reposted_${slug}`;

  const likeBtn = bar.querySelector('[data-action="like"]');
  const likeCountEl = likeBtn.querySelector('.count');
  const repostBtn = bar.querySelector('[data-action="repost"]');
  const repostCountEl = repostBtn.querySelector('.count');
  const shareBtn = bar.querySelector('[data-action="share-toggle"]');
  const shareDropdown = bar.querySelector('.share-dropdown');

  let likeCount = parseInt(localStorage.getItem(likeKeyCount) || '0', 10);
  let liked = localStorage.getItem(likeKeyState) === '1';
  let repostCount = parseInt(localStorage.getItem(repostKeyCount) || '0', 10);
  let reposted = localStorage.getItem(repostKeyState) === '1';

  if (!localStorage.getItem(likeKeyCount)) {
    likeCount = 128 + Math.floor(Math.random() * 40);
  }
  if (!localStorage.getItem(repostKeyCount)) {
    repostCount = 32 + Math.floor(Math.random() * 15);
  }

  function paint() {
    likeCountEl.textContent = likeCount;
    likeBtn.classList.toggle('liked', liked);
    repostCountEl.textContent = repostCount;
    repostBtn.classList.toggle('reposted', reposted);
  }
  paint();

  likeBtn.addEventListener('click', () => {
    liked = !liked;
    likeCount += liked ? 1 : -1;
    localStorage.setItem(likeKeyCount, likeCount);
    localStorage.setItem(likeKeyState, liked ? '1' : '0');
    paint();
    if (liked) showToast('Te gusta este artículo ♡');
  });

  repostBtn.addEventListener('click', () => {
    reposted = !reposted;
    repostCount += reposted ? 1 : -1;
    localStorage.setItem(repostKeyCount, repostCount);
    localStorage.setItem(repostKeyState, reposted ? '1' : '0');
    paint();
    showToast(reposted ? 'Reposteado en tu perfil' : 'Repost eliminado');
  });

  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    shareDropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => shareDropdown.classList.remove('open'));

  const url = window.location.href;
  const title = document.title;

  shareDropdown.querySelector('[data-share="copy"]').addEventListener('click', () => {
    navigator.clipboard?.writeText(url).then(() => showToast('Enlace copiado'));
    shareDropdown.classList.remove('open');
  });
  shareDropdown.querySelector('[data-share="whatsapp"]').href =
    `https://wa.me/?text=${encodeURIComponent(title + ' — ' + url)}`;
  shareDropdown.querySelector('[data-share="x"]').href =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  shareDropdown.querySelector('[data-share="facebook"]').href =
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const nativeBtn = shareDropdown.querySelector('[data-share="native"]');
  if (navigator.share) {
    nativeBtn.style.display = 'block';
    nativeBtn.addEventListener('click', () => {
      navigator.share({ title, url }).catch(() => {});
      shareDropdown.classList.remove('open');
    });
  } else {
    nativeBtn.style.display = 'none';
  }
}

/* ---------- Comentarios estilo Google Docs (solo Reportaje) ---------- */
function initHighlightComments(slug) {
  const article = document.querySelector('.article-body[data-commentable]');
  const rail = document.getElementById('commentsRail');
  if (!article || !rail) return;

  const storageKey = `enfocadas_comments_${slug}`;
  const getComments = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  const saveComments = (list) => localStorage.setItem(storageKey, JSON.stringify(list));

  let toolbar = null;
  let popover = null;

  function removeFloaters() {
    if (toolbar) { toolbar.remove(); toolbar = null; }
    if (popover) { popover.remove(); popover = null; }
  }

  document.addEventListener('mouseup', (e) => {
    if (popover) return;
    if (toolbar && toolbar.contains(e.target)) return;
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        if (!(toolbar && toolbar.contains(e.target))) removeFloaters();
        return;
      }
      const range = sel.getRangeAt(0);
      if (!article.contains(range.commonAncestorContainer)) return;
      if (!range.commonAncestorContainer.parentElement ||
          !article.contains(range.commonAncestorContainer)) return;

      removeFloaters();
      const rect = range.getBoundingClientRect();
      toolbar = document.createElement('div');
      toolbar.className = 'selection-toolbar';
      toolbar.style.top = `${window.scrollY + rect.top - 44}px`;
      toolbar.style.left = `${window.scrollX + rect.left}px`;
      toolbar.innerHTML = `<button type="button">✎ Comentar</button>`;
      document.body.appendChild(toolbar);

      toolbar.querySelector('button').addEventListener('click', () => {
        openCommentPopover(range, rect);
      });
    }, 5);
  });

  function openCommentPopover(range, rect) {
    const quoteText = range.toString();
    let mark;
    try {
      mark = document.createElement('mark');
      mark.className = 'user-highlight';
      range.surroundContents(mark);
    } catch (err) {
      showToast('Selecciona texto dentro de un mismo párrafo');
      removeFloaters();
      return;
    }
    removeFloaters();
    window.getSelection().removeAllRanges();

    popover = document.createElement('div');
    popover.className = 'comment-popover';
    popover.style.top = `${window.scrollY + rect.bottom + 10}px`;
    popover.style.left = `${window.scrollX + rect.left}px`;
    popover.innerHTML = `
      <textarea placeholder="Escribe tu comentario…"></textarea>
      <div class="cp-actions">
        <button type="button" class="cp-cancel">Cancelar</button>
        <button type="button" class="cp-save">Guardar</button>
      </div>
    `;
    document.body.appendChild(popover);
    popover.querySelector('textarea').focus();

    popover.querySelector('.cp-cancel').addEventListener('click', () => {
      unwrapMark(mark);
      popover.remove();
      popover = null;
    });

    popover.querySelector('.cp-save').addEventListener('click', () => {
      const text = popover.querySelector('textarea').value.trim();
      if (!text) { unwrapMark(mark); popover.remove(); popover = null; return; }
      const id = 'c' + Date.now() + Math.floor(Math.random() * 1000);
      mark.dataset.commentId = id;
      const comments = getComments();
      comments.push({ id, quote: quoteText, text, date: new Date().toLocaleDateString('es-ES') });
      saveComments(comments);
      renderRail();
      popover.remove();
      popover = null;
      showToast('Comentario guardado');
    });
  }

  function unwrapMark(mark) {
    const parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  }

  function renderRail() {
    const comments = getComments();
    if (!comments.length) {
      rail.innerHTML = `<h4>Comentarios</h4><div class="comments-empty">Selecciona un fragmento del texto y pulsa "Comentar" para dejar el primero.</div>`;
      return;
    }
    rail.innerHTML = `<h4>Comentarios (${comments.length})</h4>` + comments.map(c => `
      <div class="comment-card" data-id="${c.id}">
        <div class="cc-quote">"${escapeHtml(c.quote)}"</div>
        <div>${escapeHtml(c.text)}</div>
        <button type="button" class="cc-delete" data-delete="${c.id}">eliminar · ${c.date}</button>
      </div>
    `).join('');

    rail.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.delete;
        const mark = article.querySelector(`mark[data-comment-id="${id}"]`);
        if (mark) unwrapMark(mark);
        saveComments(getComments().filter(c => c.id !== id));
        renderRail();
      });
    });

    rail.querySelectorAll('.comment-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const mark = article.querySelector(`mark[data-comment-id="${card.dataset.id}"]`);
        if (mark) mark.classList.add('active');
      });
      card.addEventListener('mouseleave', () => {
        const mark = article.querySelector(`mark[data-comment-id="${card.dataset.id}"]`);
        if (mark) mark.classList.remove('active');
      });
    });
  }

  // Re-hydrate existing marks isn't possible across reloads (DOM ranges aren't persisted),
  // so stored comments are shown in the rail even if their inline highlight can't be restored.
  renderRail();
}
