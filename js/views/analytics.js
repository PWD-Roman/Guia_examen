/* Analytics & AI Study Advisor: per-category scores, subtopic drill-down,
   activity, history, personalized recommendations and data management. */
(function () {
  const SH = window.SH;
  SH.views = SH.views || {};

  let drillTopic = null;

  const statusBadge = (score) =>
    score === null ? '<span class="badge">No data</span>'
      : score < 60 ? '<span class="badge badge-bad">⚠ Weak</span>'
      : score < 75 ? '<span class="badge badge-warn">◐ Fair</span>'
      : '<span class="badge badge-ok">✓ Strong</span>';

  const hbar = (label, value, tip, extra = '', color = '') => `
    <div class="hbar-row" data-tip="${SH.esc(tip)}">
      <div class="hbar-label">${label}</div>
      <div class="hbar-track"><div class="hbar-fill" style="width:${value ?? 0}%;${color ? 'background:' + color : ''}"></div>${extra}</div>
      <div class="hbar-val">${value === null ? '—' : value + '%'}</div>
    </div>`;

  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  SH.views.analytics = {
    title: 'Analytics & Advisor',
    render(el) {
      const d = SH.store.data;
      const o = SH.stats.overall();
      const readiness = SH.stats.readiness();
      const recs = SH.advisor.recommendations();
      if (!drillTopic) {
        const scored = o.topics.filter((t) => t.score !== null).sort((a, b) => a.score - b.score);
        drillTopic = scored.length ? scored[0].id : SH.topics[0].id;
      }
      const drill = o.topics.find((t) => t.id === drillTopic);

      // Activity over the last 14 days
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const ts = Date.now() - i * 86400000;
        const k = SH.dayKey(ts);
        days.push({ k, label: new Date(ts).toLocaleDateString('en-US', { weekday: 'narrow' }), full: new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), n: d.activity[k] || 0 });
      }
      const maxDay = Math.max(1, ...days.map((x) => x.n));

      // Accuracy by question type
      const byType = {};
      d.history.filter((h) => h.type !== 'tool').forEach((h) => {
        byType[h.type] = byType[h.type] || { n: 0, c: 0 };
        byType[h.type].n++;
        if (h.correct) byType[h.type].c++;
      });
      const typeNames = { mcq: 'Multiple choice', scenario: 'Scenario-based', output: 'Code output' };

      el.innerHTML = `
        <div class="page-head"><div><h1>Analytics &amp; study advisor</h1><p>Topic scores use your last 40 answers per topic, so they reflect your current level.</p></div></div>
        <div class="stats" style="margin-top:0">
          <div class="stat"><div class="stat-label">Exam readiness</div><div class="stat-value">${readiness}%</div></div>
          <div class="stat"><div class="stat-label">Overall mastery</div><div class="stat-value">${o.mastery}%</div></div>
          <div class="stat"><div class="stat-label">Lifetime accuracy</div><div class="stat-value">${o.attempts ? o.accuracy + '%' : '—'}</div></div>
          <div class="stat"><div class="stat-label">Answers recorded</div><div class="stat-value">${o.attempts}</div></div>
          <div class="stat"><div class="stat-label">Unique questions seen</div><div class="stat-value">${o.answeredUnique} / ${SH.questions.length}</div></div>
        </div>

        <div class="card mt">
          <div class="card-head"><h2>🤖 AI study advisor</h2><span class="small muted">Personalized from your quiz, flashcard and interview data</span></div>
          ${SH.renderAdvice(recs)}
        </div>

        <div class="grid grid-2 mt">
          <div class="card">
            <div class="card-head"><h3>Score per category</h3><span class="small muted">Recent accuracy · line = 60% weak threshold</span></div>
            ${o.topics
              .map((t) => {
                const tp = SH.topic(t.id);
                return hbar(`<span class="dot" style="background:${tp.color}"></span>${SH.esc(tp.short)}`, t.score,
                  `<strong>${SH.esc(tp.name)}</strong><br>Recent accuracy: ${t.score === null ? 'no data' : t.score + '%'} (${t.recentAttempts} answers)<br>Mastery: ${t.mastery}%`,
                  '<div class="hbar-mark" style="left:60%"></div>');
              })
              .join('')}
          </div>
          <div class="card">
            <div class="card-head"><h3>Mastery per category</h3><span class="small muted">Questions currently correct + flashcards learned</span></div>
            ${o.topics
              .map((t) => {
                const tp = SH.topic(t.id);
                return hbar(`<span class="dot" style="background:${tp.color}"></span>${SH.esc(tp.short)}`, t.mastery,
                  `<strong>${SH.esc(tp.name)}</strong><br>${t.latestCorrect}/${t.questions} questions correct<br>${t.flashMastered}/${t.cards} flashcards in box 3+`, '', 'var(--violet)');
              })
              .join('')}
          </div>
        </div>

        <div class="card mt">
          <div class="card-head"><h3>Category table</h3></div>
          <div class="table-scroll"><table class="data">
            <thead><tr><th>Topic</th><th>Recent score</th><th>Status</th><th>Mastery</th><th>Answers</th><th>Review next</th><th></th></tr></thead>
            <tbody>${o.topics
              .map((t) => {
                const weak = SH.stats.weakSubs(t, 2);
                return `<tr><td><span class="dot" style="background:${SH.topic(t.id).color}"></span> ${SH.esc(SH.topic(t.id).short)}</td>
                  <td><strong>${t.score === null ? '—' : t.score + '%'}</strong></td><td>${statusBadge(t.score)}</td><td>${t.mastery}%</td><td>${t.attempts}</td>
                  <td class="small">${weak.map(SH.esc).join(', ') || '—'}</td>
                  <td><a class="btn btn-sm" href="#/quiz?topics=${t.id}&mode=weak&autostart=1">Practice</a></td></tr>`;
              })
              .join('')}</tbody></table></div>
        </div>

        <div class="grid grid-2 mt">
          <div class="card">
            <div class="card-head"><h3>Subtopic drill-down</h3>
              <select id="drill" class="inline-input">${SH.topics.map((t) => `<option value="${t.id}" ${t.id === drillTopic ? 'selected' : ''}>${SH.esc(t.short)}</option>`).join('')}</select></div>
            ${Object.entries(drill.subs)
              .map(([sub, v]) => hbar(SH.esc(sub), v.attempts ? SH.pct(v.correct, v.attempts) : null, `<strong>${SH.esc(sub)}</strong><br>${v.attempts ? `${v.correct}/${v.attempts} correct (recent)` : 'Not practiced yet'}`))
              .join('')}
          </div>
          <div class="card">
            <div class="card-head"><h3>Study activity</h3><span class="small muted">Actions per day, last 14 days</span></div>
            <div class="cols">${days
              .map((x) => `<div class="colw" data-tip="<strong>${x.full}</strong><br>${x.n} study action${x.n === 1 ? '' : 's'}"><div class="col" style="height:${(x.n / maxDay) * 100}%"></div></div>`)
              .join('')}</div>
            <div class="col-labels">${days.map((x) => `<span>${x.label}</span>`).join('')}</div>
            <h3 class="mt">Accuracy by question type</h3>
            ${['mcq', 'scenario', 'output']
              .map((k) => hbar(typeNames[k], byType[k] ? SH.pct(byType[k].c, byType[k].n) : null, `<strong>${typeNames[k]}</strong><br>${byType[k] ? `${byType[k].c}/${byType[k].n} correct` : 'No answers yet'}`))
              .join('')}
          </div>
        </div>

        <div class="grid grid-2 mt">
          <div class="card">
            <div class="card-head"><h3>Quiz history</h3></div>
            ${d.quizzes.length
              ? `<div class="table-scroll" style="max-height:320px"><table class="data"><thead><tr><th>Date</th><th>Mode</th><th>Score</th><th>Time</th></tr></thead><tbody>${d.quizzes
                  .slice()
                  .reverse()
                  .map((q) => `<tr><td>${SH.fmtDate(q.ts)}</td><td>${q.mode === 'exam' ? 'Exam' : q.mode === 'weak' ? 'Weak spots' : 'Practice'}</td><td><strong>${SH.pct(q.correct, q.total)}%</strong> <span class="muted small">${q.correct}/${q.total}</span></td><td class="mono small">${SH.fmtTime(q.durationSec)}</td></tr>`)
                  .join('')}</tbody></table></div>`
              : '<p class="muted">No quizzes completed yet.</p>'}
          </div>
          <div class="card">
            <div class="card-head"><h3>Interview history</h3></div>
            ${d.interviews.length
              ? `<div class="table-scroll" style="max-height:320px"><table class="data"><thead><tr><th>Date</th><th>Track</th><th>Score</th><th>Verdict</th></tr></thead><tbody>${d.interviews
                  .slice()
                  .reverse()
                  .map((h) => `<tr><td>${SH.fmtDate(h.ts)}</td><td>${SH.esc(h.trackLabel || h.track)}</td><td><strong>${h.score}%</strong></td><td>${SH.esc(h.verdict)}</td></tr>`)
                  .join('')}</tbody></table></div>`
              : '<p class="muted">No mock interviews yet.</p>'}
          </div>
        </div>

        <div class="card mt">
          <div class="card-head"><h3>Your data</h3><span class="small muted">Stored only in this browser's LocalStorage</span></div>
          <div class="row">
            <button class="btn" id="exportBtn">⬇ Export progress (JSON)</button>
            <label class="btn" style="cursor:pointer">⬆ Import backup<input type="file" id="importIn" accept="application/json,.json" class="hidden"></label>
            <span class="spacer"></span>
            <button class="btn btn-danger" id="resetBtn">Reset all progress</button>
          </div>
        </div>`;

      SH.bindTips(el);
      SH.$('#drill', el).addEventListener('change', (e) => { drillTopic = e.target.value; SH.views.analytics.render(el); });
      SH.$('#exportBtn', el).addEventListener('click', () => download(`se-study-hub-backup-${SH.dayKey()}.json`, SH.store.exportJSON()));
      SH.$('#importIn', el).addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        file.text().then((text) => {
          try {
            SH.store.importJSON(text);
            SH.toast('Progress imported.', 'ok');
            SH.views.analytics.render(el);
            SH.updateStreak();
          } catch (err) {
            SH.toast('Import failed: ' + err.message, 'bad');
          }
        });
      });
      SH.$('#resetBtn', el).addEventListener('click', () => {
        if (!confirm('This permanently deletes all progress, quiz results, flashcard boxes, bookmarks and interview history. Continue?')) return;
        const theme = SH.store.data.settings.theme;
        SH.store.reset();
        SH.store.setSetting('theme', theme);
        drillTopic = null;
        SH.toast('Progress reset.');
        SH.views.analytics.render(el);
        SH.updateStreak();
      });
    },
  };
})();
