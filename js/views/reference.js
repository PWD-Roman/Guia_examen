/* Cheat Sheet & Term Encyclopedia: a full page plus a slide-in drawer
   available from anywhere (press "/"). Bookmarks persist in LocalStorage. */
(function () {
  const SH = window.SH;
  SH.views = SH.views || {};

  const filterTerms = ({ q = '', topic = 'all', starred = false }) => {
    const needle = q.trim().toLowerCase();
    return SH.glossary.filter(
      (g) =>
        (topic === 'all' || g.topic === topic) &&
        (!starred || SH.store.isBookmarked(g.id)) &&
        (!needle || g.term.toLowerCase().includes(needle) || g.def.toLowerCase().includes(needle))
    );
  };

  const termCard = (g) => `
    <div class="term" id="${g.id}">
      <div class="term-head">
        <span class="dot" style="background:${SH.topic(g.topic).color}"></span>
        <strong>${SH.esc(g.term)}</strong>
        <span class="badge">${SH.esc(SH.topic(g.topic).short)}</span>
        <button class="star ${SH.store.isBookmarked(g.id) ? 'on' : ''}" data-star="${g.id}" title="Bookmark" aria-label="Bookmark ${SH.esc(g.term)}">${SH.store.isBookmarked(g.id) ? '★' : '☆'}</button>
      </div>
      <p>${SH.md(g.def)}</p>
      ${g.code ? SH.codeBlock(g.code, g.lang || 'js') : ''}
    </div>`;

  const bindStars = (root, onChange) =>
    SH.$$('[data-star]', root).forEach((b) =>
      b.addEventListener('click', () => {
        const on = SH.store.toggleBookmark(b.dataset.star);
        b.classList.toggle('on', on);
        b.textContent = on ? '★' : '☆';
        SH.toast(on ? 'Bookmarked' : 'Bookmark removed');
        onChange && onChange();
      })
    );

  const topicSelect = (id, value) =>
    `<select id="${id}" class="inline-input"><option value="all">All topics</option>${SH.topics
      .map((t) => `<option value="${t.id}" ${value === t.id ? 'selected' : ''}>${SH.esc(t.short)}</option>`)
      .join('')}</select>`;

  /* ---------------- Drawer ---------------- */
  const dstate = { tab: 'terms', q: '', topic: 'all', starred: false, sheet: SH.cheatsheets[0].id };

  function renderDrawer() {
    const body = document.getElementById('drawerBody');
    body.innerHTML = `
      <div class="tabs" style="margin-bottom:12px">
        <button class="tab ${dstate.tab === 'terms' ? 'on' : ''}" data-dt="terms">Encyclopedia</button>
        <button class="tab ${dstate.tab === 'sheets' ? 'on' : ''}" data-dt="sheets">Cheat sheets</button>
      </div>
      <div id="drawerInner"></div>`;
    SH.$$('[data-dt]', body).forEach((b) => b.addEventListener('click', () => { dstate.tab = b.dataset.dt; renderDrawer(); }));
    const inner = SH.$('#drawerInner', body);

    if (dstate.tab === 'terms') {
      inner.innerHTML = `
        <input type="search" id="dq" placeholder="Search ${SH.glossary.length} terms..." value="${SH.esc(dstate.q)}">
        <div class="row mt-sm">${topicSelect('dtopic', dstate.topic)}
          <label class="row small" style="gap:6px"><input type="checkbox" id="dstar" ${dstate.starred ? 'checked' : ''}> ★ Bookmarked only</label></div>
        <div id="dlist" class="mt"></div>`;
      const list = SH.$('#dlist', inner);
      const draw = () => {
        const items = filterTerms(dstate);
        list.innerHTML = items.length ? items.map(termCard).join('') : `<p class="muted">${dstate.starred ? 'No bookmarks yet. Click ☆ on a term to save it.' : 'No terms match your search.'}</p>`;
        bindStars(list, () => dstate.starred && draw());
      };
      SH.$('#dq', inner).addEventListener('input', (e) => { dstate.q = e.target.value; draw(); });
      SH.$('#dtopic', inner).addEventListener('change', (e) => { dstate.topic = e.target.value; draw(); });
      SH.$('#dstar', inner).addEventListener('change', (e) => { dstate.starred = e.target.checked; draw(); });
      draw();
      setTimeout(() => SH.$('#dq', inner) && SH.$('#dq', inner).focus(), 50);
    } else {
      const sheet = SH.cheatsheets.find((s) => s.id === dstate.sheet) || SH.cheatsheets[0];
      inner.innerHTML = `
        <select id="dsheet">${SH.cheatsheets.map((s) => `<option value="${s.id}" ${s.id === sheet.id ? 'selected' : ''}>${SH.esc(s.title)}</option>`).join('')}</select>
        <div class="sheet mt"><h2>${SH.esc(sheet.title)}</h2>${sheet.html}</div>`;
      SH.$('#dsheet', inner).addEventListener('change', (e) => { dstate.sheet = e.target.value; renderDrawer(); });
    }
  }

  SH.drawer = {
    open(opts = {}) {
      if (opts.topic) { dstate.topic = opts.topic; dstate.tab = 'terms'; dstate.q = ''; }
      if (opts.sheet) { dstate.sheet = opts.sheet; dstate.tab = 'sheets'; }
      renderDrawer();
      document.getElementById('drawer').classList.add('open');
      document.getElementById('drawer').setAttribute('aria-hidden', 'false');
      document.getElementById('drawerBackdrop').classList.add('open');
    },
    close() {
      document.getElementById('drawer').classList.remove('open');
      document.getElementById('drawer').setAttribute('aria-hidden', 'true');
      document.getElementById('drawerBackdrop').classList.remove('open');
    },
  };

  /* ---------------- Full page ---------------- */
  const pstate = { tab: 'sheets', sheet: SH.cheatsheets[0].id, q: '', topic: 'all', starred: false };

  SH.views.reference = {
    title: 'Reference & Cheat Sheets',
    render(el, params) {
      if (params.sheet) { pstate.sheet = params.sheet; pstate.tab = 'sheets'; SH.cleanHash('reference'); }
      const draw = () => {
        el.innerHTML = `
          <div class="page-head"><div><h1>Reference &amp; cheat sheets</h1><p>Formulas, syntax, protocols and tricky concepts. Press <kbd>/</kbd> anywhere to open the quick-reference drawer.</p></div></div>
          <div class="tabs">
            <button class="tab ${pstate.tab === 'sheets' ? 'on' : ''}" data-pt="sheets">Cheat sheets (${SH.cheatsheets.length})</button>
            <button class="tab ${pstate.tab === 'terms' ? 'on' : ''}" data-pt="terms">Term encyclopedia (${SH.glossary.length})</button>
            <button class="tab ${pstate.tab === 'bookmarks' ? 'on' : ''}" data-pt="bookmarks">★ Bookmarks (${SH.store.data.bookmarks.length})</button>
          </div>
          <div id="refBody"></div>`;
        SH.$$('[data-pt]', el).forEach((b) => b.addEventListener('click', () => { pstate.tab = b.dataset.pt; draw(); }));
        const body = SH.$('#refBody', el);

        if (pstate.tab === 'sheets') {
          const sheet = SH.cheatsheets.find((s) => s.id === pstate.sheet) || SH.cheatsheets[0];
          body.innerHTML = `<div class="ref-layout">
            <div class="ref-list card" style="padding:8px">${SH.cheatsheets
              .map((s) => `<button class="${s.id === sheet.id ? 'on' : ''}" data-sheet="${s.id}"><span class="dot" style="background:${SH.topic(s.topic).color};margin-right:8px"></span>${SH.esc(s.title)}</button>`)
              .join('')}</div>
            <div class="card sheet"><div class="card-head"><h2>${SH.esc(sheet.title)}</h2>${SH.topicBadge(sheet.topic)}</div>${sheet.html}</div>
          </div>`;
          SH.$$('[data-sheet]', body).forEach((b) => b.addEventListener('click', () => { pstate.sheet = b.dataset.sheet; draw(); }));
        } else {
          const starred = pstate.tab === 'bookmarks';
          body.innerHTML = `
            <div class="card">
              <div class="row">
                <input type="search" id="pq" placeholder="Search terms and definitions..." value="${SH.esc(pstate.q)}" style="flex:1;min-width:200px">
                ${topicSelect('ptopic', pstate.topic)}
              </div>
            </div>
            <div id="plist" class="grid grid-2 mt" style="align-items:start"></div>`;
          const list = SH.$('#plist', body);
          const drawList = () => {
            const items = filterTerms({ q: pstate.q, topic: pstate.topic, starred });
            list.innerHTML = items.length
              ? items.map(termCard).join('')
              : `<p class="muted">${starred ? 'No bookmarks yet. Star terms in the encyclopedia to build your personal review list.' : 'No terms match your search.'}</p>`;
            SH.$$('.term', list).forEach((t) => (t.style.marginTop = '0'));
            bindStars(list, () => starred && drawList());
          };
          SH.$('#pq', body).addEventListener('input', (e) => { pstate.q = e.target.value; drawList(); });
          SH.$('#ptopic', body).addEventListener('change', (e) => { pstate.topic = e.target.value; drawList(); });
          drawList();
        }
      };
      draw();
    },
  };
})();
