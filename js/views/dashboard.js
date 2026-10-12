(function () {
  const SH = window.SH;
  SH.views = SH.views || {};

  const ring = (pct, size = 132, stroke = 11) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    return `<svg width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" style="transition:stroke-dashoffset .6s"/>
    </svg>`;
  };

  SH.views.dashboard = {
    title: 'Dashboard',
    render(el) {
      const o = SH.stats.overall();
      const readiness = SH.stats.readiness();
      const recs = SH.advisor.recommendations().slice(0, 3);
      const recent = SH.store.data.quizzes.slice(-4).reverse();
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

      el.innerHTML = `
        <section class="card hero">
          <div class="ring">${ring(o.mastery)}<div class="ring-label"><div><strong>${o.mastery}%</strong><span>overall mastery</span></div></div></div>
          <div>
            <h1>${greet}. Ready to study?</h1>
            <p class="muted">Mastery counts the questions you currently answer correctly plus the flashcards you have learned. Exam readiness also factors in recent accuracy and topic coverage.</p>
            <div class="row" style="gap:14px;align-items:center">
              <div style="flex:1;min-width:200px">
                <div class="row small"><span>Exam readiness</span><span class="spacer"></span><strong>${readiness}%</strong></div>
                <div class="progress mt-sm"><span style="width:${readiness}%"></span></div>
              </div>
              <a class="btn btn-primary" href="#/quiz?mode=practice&count=10&autostart=1">▶ Quick 10-question quiz</a>
              <a class="btn" href="#/quiz?mode=exam&count=20&autostart=1">◷ Timed mock exam</a>
            </div>
            <div class="stats">
              <div class="stat"><div class="stat-label">Questions answered</div><div class="stat-value">${o.attempts}</div></div>
              <div class="stat"><div class="stat-label">Overall accuracy</div><div class="stat-value">${o.attempts ? o.accuracy + '%' : '—'}</div></div>
              <div class="stat"><div class="stat-label">Flashcards due</div><div class="stat-value">${o.flashDue}</div></div>
              <div class="stat"><div class="stat-label">Study streak</div><div class="stat-value">${o.streak} ${o.streak === 1 ? 'day' : 'days'}</div></div>
              <div class="stat"><div class="stat-label">Mock interviews</div><div class="stat-value">${o.interviews}</div></div>
            </div>
          </div>
        </section>

        <section class="grid grid-2 mt">
          <div class="card">
            <div class="card-head"><h2>🤖 Study advisor</h2><a href="#/analytics" class="small">Full analytics →</a></div>
            ${SH.renderAdvice(recs)}
          </div>
          <div class="card">
            <div class="card-head"><h2>Workspace</h2></div>
            <div class="grid grid-2" style="gap:10px">
              ${[
                ['#/boolean', '∧', 'Boolean solver', 'Truth tables, K-maps, minimization'],
                ['#/simulator', '▤', 'Algorithm simulator', 'Sorting, searching, stacks & queues'],
                ['#/flashcards', '❐', 'Flashcards', 'Spaced repetition by topic'],
                ['#/interview', '◷', 'Interview simulator', 'Timed theory and coding rounds'],
              ]
                .map(
                  ([href, icon, t, d]) => `<a href="${href}" class="stat" style="display:block;color:inherit;text-decoration:none">
                    <div style="font-size:1.2rem">${icon}</div><strong>${t}</strong><div class="small muted">${d}</div></a>`
                )
                .join('')}
            </div>
            ${
              recent.length
                ? `<h3 class="mt">Recent quizzes</h3>
                   <table class="data"><tbody>${recent
                     .map((q) => `<tr><td>${SH.fmtDate(q.ts)}</td><td>${q.mode === 'exam' ? 'Exam' : q.mode === 'weak' ? 'Weak spots' : 'Practice'}</td><td style="text-align:right"><strong>${SH.pct(q.correct, q.total)}%</strong> <span class="muted small">(${q.correct}/${q.total})</span></td></tr>`)
                     .join('')}</tbody></table>`
                : ''
            }
          </div>
        </section>

        <div class="page-head mt" style="margin-top:28px"><div><h2 style="margin:0">Topics</h2><p>${SH.questions.length} questions · ${SH.flashcards.length} flashcards · ${SH.glossary.length} glossary terms</p></div></div>
        <section class="grid grid-4">
          ${o.topics
            .map((ts) => {
              const t = SH.topic(ts.id);
              return `<div class="card topic-card" style="--tc:${t.color}">
                <div class="row"><div class="topic-icon">${SH.esc(t.icon)}</div><span class="spacer"></span>
                  ${ts.score !== null ? `<span class="badge ${ts.score < 60 ? 'badge-bad' : ts.score < 75 ? 'badge-warn' : 'badge-ok'}" title="Recent accuracy">${ts.score}%</span>` : '<span class="badge">New</span>'}</div>
                <h3>${SH.esc(t.name)}</h3>
                <p>${SH.esc(t.desc)}</p>
                <div>
                  <div class="row small"><span class="muted">Mastery</span><span class="spacer"></span><strong>${ts.mastery}%</strong></div>
                  <div class="progress mt-sm"><span style="width:${ts.mastery}%"></span></div>
                </div>
                <div class="row">
                  <a class="btn btn-sm" href="#/quiz?topics=${t.id}&autostart=1">Quiz</a>
                  <a class="btn btn-sm btn-ghost" href="#/flashcards?topic=${t.id}">Cards</a>
                  <button class="btn btn-sm btn-ghost" data-ref="${t.id}">Terms</button>
                </div>
              </div>`;
            })
            .join('')}
        </section>`;

      SH.$$('[data-ref]', el).forEach((b) => b.addEventListener('click', () => SH.drawer.open({ topic: b.dataset.ref })));
    },
  };
})();
