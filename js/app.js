/* Hash router + global chrome (sidebar, theme, drawer shortcuts). */
(function () {
  const SH = window.SH;
  const viewEl = document.getElementById('view');
  let current = null;

  const parseHash = () => {
    const raw = location.hash.replace(/^#\/?/, '') || 'dashboard';
    const [route, qs] = raw.split('?');
    return { route, params: Object.fromEntries(new URLSearchParams(qs || '')) };
  };

  /* Drop one-shot params (e.g. autostart) from the URL without re-rendering. */
  SH.cleanHash = (route) => history.replaceState(null, '', '#/' + route);

  SH.updateStreak = () => {
    const o = SH.stats.overall();
    document.getElementById('streakBadge').textContent = o.streak ? `🔥 ${o.streak}-day streak` : '';
  };

  function render() {
    if (current && current.destroy) current.destroy();
    SH.hideTip();
    const { route, params } = parseHash();
    const view = SH.views[route] || SH.views.dashboard;
    current = view;
    SH.$$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === (SH.views[route] ? route : 'dashboard')));
    document.getElementById('topbarTitle').textContent = view.title;
    document.title = `${view.title} · SE Study Hub`;
    viewEl.innerHTML = '';
    try {
      view.render(viewEl, params);
    } catch (err) {
      console.error(err);
      viewEl.innerHTML = `<div class="card"><h2>Something went wrong</h2><p class="muted">This page failed to render. Your progress is safe.</p>
        <pre class="code">${SH.esc(String(err && err.message ? err.name + ": " + err.message + "\n" + (err.stack || "") : err))}</pre><a class="btn" href="#/dashboard">Back to dashboard</a></div>`;
    }
    window.scrollTo(0, 0);
    document.getElementById('sidebar').classList.remove('open');
    SH.updateStreak();
  }

  window.addEventListener('hashchange', render);

  // Theme
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    SH.store.setSetting('theme', next);
  });

  // Mobile nav
  document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  viewEl.addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));

  // Drawer
  document.getElementById('drawerOpen').addEventListener('click', () => SH.drawer.open());
  document.getElementById('drawerClose').addEventListener('click', () => SH.drawer.close());
  document.getElementById('drawerBackdrop').addEventListener('click', () => SH.drawer.close());

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      SH.drawer.open();
    } else if (e.key === 'Escape') {
      SH.drawer.close();
    }
  });

  render();
})();
