/* Flashcards with Leitner-box spaced repetition. */
(function () {
  const SH = window.SH;
  SH.views = SH.views || {};

  let el, keyHandler;
  let opts = { topic: 'all', dueOnly: true };
  let session = null;

  const deckFor = () =>
    SH.flashcards.filter((c) => (opts.topic === 'all' || c.topic === opts.topic) && (!opts.dueOnly || SH.store.isDue(c.id)));

  function boxes(topic) {
    const counts = [0, 0, 0, 0, 0, 0];
    SH.flashcards.filter((c) => topic === 'all' || c.topic === topic).forEach((c) => counts[SH.store.cardState(c.id).box]++);
    return counts;
  }

  function render() {
    const dueCount = (t) => SH.flashcards.filter((c) => (t === 'all' || c.topic === t) && SH.store.isDue(c.id)).length;
    const b = boxes(opts.topic);
    el.innerHTML = `
      <div class="page-head"><div><h1>Flashcards</h1><p>Active recall with spaced repetition. Rate each card honestly: "Again" cards come back this session; "Easy" cards wait longer.</p></div></div>
      <div class="card">
        <div class="chips" id="fcTopics">
          <span class="chip ${opts.topic === 'all' ? 'on' : ''}" data-t="all">All topics <span class="muted small">${dueCount('all')} due</span></span>
          ${SH.topics.map((t) => `<span class="chip ${opts.topic === t.id ? 'on' : ''}" data-t="${t.id}"><span class="dot" style="background:${t.color}"></span>${SH.esc(t.short)} <span class="muted small">${dueCount(t.id)}</span></span>`).join('')}
        </div>
        <div class="row mt">
          <label class="row small" style="gap:6px"><input type="checkbox" id="dueOnly" ${opts.dueOnly ? 'checked' : ''}> Due cards only</label>
          <span class="spacer"></span>
          <div class="leitner" style="min-width:320px">
            ${['New', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Mastered'].map((l, i) => `<div class="box" title="${i === 0 ? 'Never reviewed' : i === 5 ? 'Reviewed every 16 days' : 'Leitner box ' + i}"><strong>${b[i]}</strong>${l}</div>`).join('')}
          </div>
        </div>
      </div>
      <div id="fcStage" class="mt"></div>`;

    el.querySelector('#fcTopics').addEventListener('click', (e) => {
      const c = e.target.closest('[data-t]');
      if (!c) return;
      opts.topic = c.dataset.t;
      startSession();
    });
    SH.$('#dueOnly', el).addEventListener('change', (e) => {
      opts.dueOnly = e.target.checked;
      startSession();
    });
    renderStage();
  }

  function startSession() {
    session = { cards: SH.shuffle(deckFor()), idx: 0, flipped: false, stats: { again: 0, good: 0, easy: 0 } };
    render();
  }

  function renderStage() {
    const stage = SH.$('#fcStage', el);
    if (!session.cards.length) {
      stage.innerHTML = `<div class="card" style="text-align:center;padding:40px">
        <div style="font-size:2rem">🎉</div><h2>Nothing due here</h2>
        <p class="muted">All cards in this selection are scheduled for later. Untick "Due cards only" to review anyway, or pick another topic.</p></div>`;
      return;
    }
    if (session.idx >= session.cards.length) {
      const s = session.stats;
      stage.innerHTML = `<div class="card" style="text-align:center;padding:40px">
        <div style="font-size:2rem">✅</div><h2>Session complete</h2>
        <p class="muted">${s.good + s.easy} recalled · ${s.again} to relearn</p>
        <div class="row" style="justify-content:center"><button class="btn btn-primary" id="restart">Start another session</button><a class="btn" href="#/quiz?autostart=1${opts.topic !== 'all' ? '&topics=' + opts.topic : ''}">Take a quiz on this</a></div></div>`;
      SH.$('#restart', stage).addEventListener('click', startSession);
      return;
    }
    const c = session.cards[session.idx];
    const st = SH.store.cardState(c.id);
    stage.innerHTML = `
      <div class="flash-wrap">
        <div class="row small muted" style="margin-bottom:8px">${SH.topicBadge(c.topic)}<span class="badge">${SH.esc(c.sub)}</span><span class="spacer"></span>
          Card ${session.idx + 1} / ${session.cards.length} · ${st.box ? 'Box ' + st.box : 'New'}</div>
        <div class="progress" style="margin-bottom:14px"><span style="width:${SH.pct(session.idx, session.cards.length)}%"></span></div>
        <div class="flash ${session.flipped ? 'flipped' : ''}" id="flash" role="button" tabindex="0" aria-label="Flip card">
          <div class="flash-face flash-front"><span class="ff-label">Question</span><div class="ff-text">${SH.esc(c.front)}</div>
            <div class="muted small" style="text-align:center;margin-top:20px">Recall the answer, then click or press <kbd>Space</kbd> to flip</div></div>
          <div class="flash-face flash-back"><span class="ff-label">Answer</span><div class="ff-text">${SH.md(c.back)}</div></div>
        </div>
        <div class="row mt" style="justify-content:center" id="fcBtns"></div>
      </div>`;
    SH.$('#flash', stage).addEventListener('click', flip);
    renderButtons();
  }

  function renderButtons() {
    const row = SH.$('#fcBtns', el);
    if (!row) return;
    row.innerHTML = session.flipped
      ? `<button class="btn btn-danger" data-rate="again">↺ Again <kbd>1</kbd></button>
         <button class="btn" data-rate="good">✓ Good <kbd>2</kbd></button>
         <button class="btn btn-ok" data-rate="easy">★ Easy <kbd>3</kbd></button>`
      : '<button class="btn btn-primary" id="flipBtn">Show answer <kbd>Space</kbd></button>';
    const fb = SH.$('#flipBtn', row);
    if (fb) fb.addEventListener('click', flip);
    SH.$$('[data-rate]', row).forEach((b) => b.addEventListener('click', () => rate(b.dataset.rate)));
  }

  function flip() {
    session.flipped = !session.flipped;
    const f = SH.$('#flash', el);
    if (f) f.classList.toggle('flipped', session.flipped);
    renderButtons();
  }

  function rate(r) {
    if (!session.flipped) return;
    const c = session.cards[session.idx];
    SH.store.reviewCard(c.id, r);
    session.stats[r]++;
    if (r === 'again') session.cards.push(c); // relearn later in this session
    session.idx++;
    session.flipped = false;
    SH.updateStreak();
    renderStage();
  }

  SH.views.flashcards = {
    title: 'Flashcards',
    render(root, params) {
      el = root;
      if (params.topic) opts.topic = params.topic;
      if (params.due) opts.dueOnly = true;
      if (params.topic || params.due) SH.cleanHash('flashcards');
      // If nothing is due for the chosen topic, show all cards instead of an empty deck.
      if (opts.dueOnly && !deckFor().length && params.topic) opts.dueOnly = false;
      startSession();
      keyHandler = (e) => {
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || !session || session.idx >= session.cards.length) return;
        if (e.key === ' ') { e.preventDefault(); flip(); }
        else if (session.flipped && e.key === '1') rate('again');
        else if (session.flipped && e.key === '2') rate('good');
        else if (session.flipped && e.key === '3') rate('easy');
      };
      document.addEventListener('keydown', keyHandler);
    },
    destroy() { document.removeEventListener('keydown', keyHandler); },
  };
})();
