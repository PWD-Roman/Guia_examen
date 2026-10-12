/* Shared helpers. Everything hangs off a single global namespace (SH) so the
   app runs from file:// without a bundler or ES-module CORS issues. */
(function () {
  const SH = (window.SH = window.SH || {});

  SH.esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  SH.$ = (sel, root = document) => root.querySelector(sel);
  SH.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  SH.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  SH.pct = (num, den) => (den ? Math.round((num / den) * 100) : 0);
  SH.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  SH.fmtTime = (sec) => {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  SH.fmtDate = (ts) =>
    new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  SH.dayKey = (ts = Date.now()) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  /* Tiny inline markdown: `code`, **bold**, *italic*, line breaks. Input is escaped first. */
  SH.md = (text) =>
    SH.esc(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\n/g, '<br>');

  /* ---------- Minimal syntax highlighter ---------- */
  const KW = {
    js: 'const let var function return if else for while do break continue new class extends this typeof instanceof in of async await try catch finally throw switch case default null undefined true false import export from yield delete void static get set interface type implements number string boolean',
    python: 'def return if elif else for while in not and or is None True False class import from as with try except finally raise lambda yield pass break continue global nonlocal self',
    java: 'public private protected static final void int long double float boolean char byte short class interface extends implements new return if else for while do switch case default break continue try catch finally throw throws this super null true false import package abstract synchronized var',
    cpp: 'int long double float bool char void auto const static return if else for while do switch case break continue class struct public private protected virtual override new delete nullptr true false template typename namespace using unsigned sizeof',
    sql: 'select from where join inner left right outer full on group by order having insert into values update set delete create table index primary key foreign references and or not null is in as distinct count sum avg min max limit union all exists between like begin commit rollback transaction asc desc unique varchar int integer text default constraint check view drop alter add',
  };
  const KWSET = {};
  Object.keys(KW).forEach((k) => (KWSET[k] = new Set(KW[k].split(' '))));
  KWSET.ts = KWSET.js;
  KWSET.bash = new Set('if then else fi for do done echo export cd git npm'.split(' '));

  const BT = '\x60';
  const STR = String.raw`"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|` + BT + String.raw`(?:\\.|[^\\` + BT + String.raw`])*` + BT;
  const COMMENT = {
    python: String.raw`#[^\n]*`,
    bash: String.raw`#[^\n]*`,
    sql: String.raw`--[^\n]*`,
    cpp: String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/|#\w+`,
    default: String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`,
  };

  SH.highlight = (code, lang = 'js') => {
    const l = (lang || 'js').toLowerCase();
    if (l === 'text' || l === 'plain') return SH.esc(code);
    const kws = KWSET[l] || KWSET.js;
    const re = new RegExp(`(${COMMENT[l] || COMMENT.default})|(${STR})|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_$][\\w$]*)`, 'g');
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(code))) {
      out += SH.esc(code.slice(last, m.index));
      const tok = m[0];
      if (m[1]) out += `<span class="tk-com">${SH.esc(tok)}</span>`;
      else if (m[2]) out += `<span class="tk-str">${SH.esc(tok)}</span>`;
      else if (m[3]) out += `<span class="tk-num">${tok}</span>`;
      else {
        const key = l === 'sql' ? tok.toLowerCase() : tok;
        if (kws.has(key)) out += `<span class="tk-kw">${tok}</span>`;
        else if (code[re.lastIndex] === '(') out += `<span class="tk-fn">${tok}</span>`;
        else out += SH.esc(tok);
      }
      last = re.lastIndex;
    }
    return out + SH.esc(code.slice(last));
  };

  SH.codeBlock = (code, lang = 'js') =>
    `<pre class="code" data-lang="${SH.esc(lang)}"><code>${SH.highlight(code, lang)}</code></pre>`;

  /* ---------- Toasts ---------- */
  SH.toast = (msg, kind = '') => {
    const wrap = document.getElementById('toasts');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  };

  /* ---------- Shared hover tooltip for charts ---------- */
  let tipEl = null;
  SH.bindTips = (root) => {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'tip hidden';
      document.body.appendChild(tipEl);
    }
    SH.$$('[data-tip]', root).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        tipEl.innerHTML = el.dataset.tip;
        tipEl.classList.remove('hidden');
      });
      el.addEventListener('mousemove', (e) => {
        const x = Math.min(e.clientX + 14, window.innerWidth - tipEl.offsetWidth - 8);
        tipEl.style.left = x + 'px';
        tipEl.style.top = e.clientY + 14 + 'px';
      });
      el.addEventListener('mouseleave', () => tipEl.classList.add('hidden'));
    });
  };
  SH.hideTip = () => tipEl && tipEl.classList.add('hidden');

  /* Topic lookup helpers are filled once topics.js loads. */
  SH.topic = (id) => (SH.topics || []).find((t) => t.id === id) || { id, name: id, color: '#888', icon: '?' };
  SH.topicBadge = (id) => {
    const t = SH.topic(id);
    return `<span class="badge"><span class="dot" style="background:${t.color}"></span>${SH.esc(t.short || t.name)}</span>`;
  };
  SH.diffBadge = (d) => {
    const map = { 1: ['Easy', 'badge-ok'], 2: ['Medium', 'badge-warn'], 3: ['Hard', 'badge-bad'] };
    const [label, cls] = map[d] || map[1];
    return `<span class="badge ${cls}">${label}</span>`;
  };
})();
