/* Technical Interview Simulator.
   Tracks: theory (CS trivia + system design), coding (JS challenges run against
   tests in a Web Worker), or a full loop. Timed, with an evaluation report. */
(function () {
  const SH = window.SH;
  SH.views = SH.views || {};

  const TRACKS = {
    theory: { label: 'Theory & System Design', icon: '🧠', minutes: 25, desc: '3 CS-trivia questions and 1 system-design question. Answer in writing as if speaking to the interviewer, then self-assess against the key points.' },
    coding: { label: 'Coding Challenge', icon: '⌨', minutes: 40, desc: 'One easy and one medium LeetCode-style problem in JavaScript. Run the tests, use step-by-step hints (with a score penalty), optimize.' },
    full: { label: 'Full Loop', icon: '🏁', minutes: 50, desc: '2 trivia questions, 1 system-design question and 1 coding problem: the closest thing to a real onsite round.' },
  };
  const HINT_PENALTY = 10;
  const SOLUTION_CAP = 30;
  const RUN_TIMEOUT_MS = 3000;

  let el, session = null, timerId = null, cfg = { track: 'full', minutes: TRACKS.full.minutes };

  const pick = (arr, n) => SH.shuffle(arr).slice(0, n);

  function buildItems(track) {
    const { theory, coding } = SH.interview;
    const trivia = theory.filter((t) => t.kind === 'CS Trivia');
    const design = theory.filter((t) => t.kind === 'System Design');
    const easy = coding.filter((c) => c.difficulty === 1);
    const medium = coding.filter((c) => c.difficulty === 2);
    const T = (d) => ({ kind: 'theory', data: d, answer: '', submitted: false, checks: [], score: 0 });
    const C = (d) => ({ kind: 'coding', data: d, code: d.starter, hints: 0, solutionShown: false, results: null, passed: 0, score: 0, logs: [] });
    if (track === 'theory') return [...pick(trivia, 3).map(T), ...pick(design, 1).map(T)];
    if (track === 'coding') return [...pick(easy, 1).map(C), ...pick(medium, 1).map(C)];
    return [...pick(trivia, 2).map(T), ...pick(design, 1).map(T), ...pick(medium, 1).map(C)];
  }

  /* ---------------- Home ---------------- */
  function renderHome() {
    stopTimer();
    const hist = SH.store.data.interviews.slice().reverse();
    el.innerHTML = `
      <div class="page-head"><div><h1>Technical interview simulator</h1><p>Rehearse under realistic time pressure and get an evaluation score at the end.</p></div></div>
      <div class="grid grid-3" id="tracks">
        ${Object.entries(TRACKS)
          .map(([id, t]) => `<div class="card track-card ${cfg.track === id ? 'on' : ''}" data-track="${id}">
            <div style="font-size:1.6rem">${t.icon}</div><h3>${t.label}</h3><p class="small muted" style="margin:0">${t.desc}</p>
            <div class="small mt-sm"><span class="badge">Suggested: ${t.minutes} min</span></div></div>`)
          .join('')}
      </div>
      <div class="card mt">
        <div class="row">
          <label class="field" style="width:200px">Time limit
            <select id="mins">${[15, 20, 25, 30, 40, 45, 50, 60].map((m) => `<option value="${m}" ${cfg.minutes === m ? 'selected' : ''}>${m} minutes</option>`).join('')}</select></label>
          <div style="flex:1;min-width:240px" class="small muted">
            <strong>Tips:</strong> clarify requirements first · think out loud (write your reasoning) · state time and space complexity · test edge cases (empty input, duplicates, negatives) · discuss trade-offs.
          </div>
          <button class="btn btn-primary" id="startInt" style="align-self:flex-end">Start interview →</button>
        </div>
      </div>

      <div class="grid grid-2 mt">
        <div class="card">
          <div class="card-head"><h3>Untimed practice: coding problems</h3></div>
          <table class="data"><tbody>
            ${SH.interview.coding.map((c) => `<tr><td><strong>${SH.esc(c.title)}</strong></td><td>${SH.diffBadge(c.difficulty)}</td><td style="text-align:right"><button class="btn btn-sm" data-practice="${c.id}">Solve</button></td></tr>`).join('')}
          </tbody></table>
        </div>
        <div class="card">
          <div class="card-head"><h3>Interview history</h3></div>
          ${hist.length
            ? `<table class="data"><thead><tr><th>Date</th><th>Track</th><th>Score</th><th>Verdict</th></tr></thead><tbody>
                ${hist.slice(0, 10).map((h) => `<tr><td>${SH.fmtDate(h.ts)}</td><td>${SH.esc(h.trackLabel || h.track)}</td><td><strong>${h.score}%</strong></td><td>${SH.esc(h.verdict)}</td></tr>`).join('')}</tbody></table>`
            : '<p class="muted">No interviews yet. Your results will appear here.</p>'}
        </div>
      </div>`;

    SH.$$('[data-track]', el).forEach((c) =>
      c.addEventListener('click', () => {
        cfg.track = c.dataset.track;
        cfg.minutes = TRACKS[cfg.track].minutes;
        renderHome();
      })
    );
    SH.$('#mins', el).addEventListener('change', (e) => (cfg.minutes = +e.target.value));
    SH.$('#startInt', el).addEventListener('click', () => startSession(cfg.track, cfg.minutes));
    SH.$$('[data-practice]', el).forEach((b) =>
      b.addEventListener('click', () => {
        const d = SH.interview.coding.find((c) => c.id === b.dataset.practice);
        session = { track: 'practice', label: 'Practice: ' + d.title, items: [{ kind: 'coding', data: d, code: d.starter, hints: 0, solutionShown: false, results: null, passed: 0, score: 0, logs: [] }], idx: 0, start: Date.now(), limit: 0 };
        renderSession();
      })
    );
  }

  /* ---------------- Session ---------------- */
  function startSession(track, minutes) {
    session = { track, label: TRACKS[track].label, items: buildItems(track), idx: 0, start: Date.now(), limit: minutes * 60 };
    timerId = setInterval(tick, 1000);
    renderSession();
  }
  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }
  function tick() {
    if (!session || !session.limit) return;
    const left = session.limit - (Date.now() - session.start) / 1000;
    const t = SH.$('#intTimer', el);
    if (t) {
      t.textContent = '◷ ' + SH.fmtTime(left);
      t.classList.toggle('low', left < 120);
    }
    if (left <= 0) {
      SH.toast("Time's up! Generating your evaluation.", 'bad');
      finish();
    }
  }

  function renderSession() {
    const s = session;
    const item = s.items[s.idx];
    el.innerHTML = `
      <div class="row" style="margin-bottom:14px">
        <button class="btn btn-ghost btn-sm" id="abort">✕ Leave</button>
        <strong>${SH.esc(s.label)}</strong>
        <div class="row" style="gap:6px">${s.items
          .map((it, i) => `<button class="btn btn-sm ${i === s.idx ? 'btn-primary' : ''}" data-item="${i}" title="${SH.esc(it.kind === 'coding' ? it.data.title : it.data.kind)}">${i + 1}. ${it.kind === 'coding' ? '⌨' : it.data.kind === 'System Design' ? '🏗' : '🧠'}${(it.kind === 'theory' && it.submitted) || (it.kind === 'coding' && it.results) ? ' ✓' : ''}</button>`)
          .join('')}</div>
        <span class="spacer"></span>
        ${s.limit ? `<span class="timer" id="intTimer">◷ ${SH.fmtTime(s.limit - (Date.now() - s.start) / 1000)}</span>` : '<span class="badge">Untimed</span>'}
        <button class="btn btn-primary btn-sm" id="finish">Finish &amp; evaluate</button>
      </div>
      <div id="itemHost"></div>`;
    SH.$$('[data-item]', el).forEach((b) => b.addEventListener('click', () => { saveEditor(); s.idx = +b.dataset.item; renderSession(); }));
    SH.$('#finish', el).addEventListener('click', () => {
      saveEditor();
      const pending = s.items.filter((it) => (it.kind === 'theory' ? !it.submitted : !it.results)).length;
      if (pending && !confirm(`${pending} item(s) not attempted yet. Finish anyway?`)) return;
      finish();
    });
    SH.$('#abort', el).addEventListener('click', () => {
      if (confirm('Leave this interview? It will not be scored.')) { stopTimer(); session = null; renderHome(); }
    });
    const host = SH.$('#itemHost', el);
    if (item.kind === 'theory') renderTheory(host, item);
    else renderCoding(host, item);
  }

  function saveEditor() {
    const ed = SH.$('#editor', el);
    if (ed && session) session.items[session.idx].code = ed.value;
    const ta = SH.$('#theoryAnswer', el);
    if (ta && session) session.items[session.idx].answer = ta.value;
  }

  /* ---------- Theory item ---------- */
  function autoDetect(answer, points) {
    const a = answer.toLowerCase();
    return points.map((p) => p.kw.some((k) => a.includes(k.toLowerCase())));
  }

  function renderTheory(host, item) {
    const d = item.data;
    host.innerHTML = `
      <div class="card">
        <div class="q-meta"><span class="badge badge-accent">${SH.esc(d.kind)}</span>${SH.topicBadge(d.topic)}${SH.diffBadge(d.difficulty)}</div>
        <div class="q-text" style="font-size:1.15rem">${SH.esc(d.q)}</div>
        ${d.kind === 'System Design' ? '<p class="small muted">Structure: requirements → estimates → API → data model → high-level design → scaling and bottlenecks → trade-offs.</p>' : ''}
        <label class="field mt">Your answer (write it as you would explain it out loud)
          <textarea id="theoryAnswer" rows="10" placeholder="Start with a one-line summary, then go deeper..." ${item.submitted ? 'disabled' : ''}>${SH.esc(item.answer)}</textarea></label>
        <div class="row mt-sm"><span class="small muted" id="wc"></span><span class="spacer"></span>
          ${item.submitted ? '' : '<button class="btn btn-primary" id="submitTheory">Submit answer</button>'}</div>
        <div id="evalHost"></div>
      </div>`;
    const ta = SH.$('#theoryAnswer', host);
    const wc = () => (SH.$('#wc', host).textContent = `${(ta.value.match(/\S+/g) || []).length} words`);
    ta.addEventListener('input', () => { item.answer = ta.value; wc(); });
    wc();
    const sub = SH.$('#submitTheory', host);
    if (sub) sub.addEventListener('click', () => {
      if ((ta.value.match(/\S+/g) || []).length < 5) return SH.toast('Write at least a few sentences first.');
      item.answer = ta.value;
      item.submitted = true;
      item.checks = autoDetect(item.answer, d.points);
      item.score = SH.pct(item.checks.filter(Boolean).length, d.points.length);
      renderSession();
    });
    if (item.submitted) renderTheoryEval(SH.$('#evalHost', host), item);
  }

  function renderTheoryEval(host, item) {
    const d = item.data;
    host.innerHTML = `
      <div class="grid grid-2 mt">
        <div class="card" style="background:var(--surface-2)">
          <div class="card-head"><h3>Key points checklist</h3><span class="badge ${item.score >= 70 ? 'badge-ok' : item.score >= 40 ? 'badge-warn' : 'badge-bad'}" id="tScore">${item.score}%</span></div>
          <p class="small muted">Points detected in your answer are pre-checked. Adjust them honestly; you are the interviewer now.</p>
          <div class="checklist">${d.points.map((p, i) => `<label><input type="checkbox" data-chk="${i}" ${item.checks[i] ? 'checked' : ''}><span>${SH.esc(p.text)}</span></label>`).join('')}</div>
        </div>
        <div class="card" style="background:var(--surface-2)">
          <h3>Model answer</h3>
          <p class="small" style="color:var(--text-2)">${SH.md(d.model)}</p>
        </div>
      </div>`;
    SH.$$('[data-chk]', host).forEach((c) =>
      c.addEventListener('change', () => {
        item.checks[+c.dataset.chk] = c.checked;
        item.score = SH.pct(item.checks.filter(Boolean).length, d.points.length);
        const b = SH.$('#tScore', host);
        b.textContent = item.score + '%';
        b.className = `badge ${item.score >= 70 ? 'badge-ok' : item.score >= 40 ? 'badge-warn' : 'badge-bad'}`;
      })
    );
  }

  /* ---------- Coding item ---------- */
  function codingScore(item) {
    const total = item.data.tests.length;
    let score = Math.round((item.passed / total) * 100) - item.hints * HINT_PENALTY;
    if (item.solutionShown) score = Math.min(score, SOLUTION_CAP);
    return Math.max(0, score);
  }

  function renderCoding(host, item) {
    const d = item.data;
    host.innerHTML = `
      <div class="interview-layout">
        <div class="card">
          <div class="q-meta"><span class="badge badge-accent">Coding</span>${SH.diffBadge(d.difficulty)}<span class="badge">JavaScript</span></div>
          <h2>${SH.esc(d.title)}</h2>
          <p>${SH.md(d.prompt)}</p>
          <h3>Examples</h3>
          ${SH.codeBlock(d.examples.join('\n'), 'js')}
          <div class="card-head mt"><h3 style="margin:0">Step-by-step guidance</h3>
            <span class="small muted">−${HINT_PENALTY}% per hint</span></div>
          <div id="hints">${d.hints.slice(0, item.hints).map((h, i) => `<div class="hint"><strong>Hint ${i + 1}:</strong> ${SH.md(h)}</div>`).join('')}</div>
          <div class="row mt-sm">
            ${item.hints < d.hints.length ? `<button class="btn btn-sm" id="hintBtn">💡 Reveal hint ${item.hints + 1} of ${d.hints.length}</button>` : ''}
            ${item.solutionShown ? '' : `<button class="btn btn-sm btn-ghost" id="solBtn">Show solution (caps score at ${SOLUTION_CAP}%)</button>`}
          </div>
          ${item.solutionShown ? `<h3 class="mt">Reference solution</h3>${SH.codeBlock(d.solution, 'js')}<p class="small"><strong>Complexity:</strong> ${SH.esc(d.complexity)}</p>` : ''}
        </div>
        <div class="card">
          <div class="card-head"><h3 style="margin:0">Your solution</h3>
            <div class="row"><button class="btn btn-sm btn-ghost" id="resetCode">Reset</button><button class="btn btn-sm btn-primary" id="runBtn">▶ Run tests</button></div></div>
          <textarea id="editor" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off">${SH.esc(item.code)}</textarea>
          <p class="small muted mt-sm">Keep the function name <code>${d.fn}</code>. <kbd>Tab</kbd> indents · <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the tests · <code>console.log</code> output is shown below.</p>
          <div id="testOut"></div>
        </div>
      </div>`;

    const ed = SH.$('#editor', host);
    ed.addEventListener('input', () => (item.code = ed.value));
    ed.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ed.selectionStart;
        ed.value = ed.value.slice(0, s) + '  ' + ed.value.slice(ed.selectionEnd);
        ed.selectionStart = ed.selectionEnd = s + 2;
        item.code = ed.value;
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        run();
      }
    });
    const hb = SH.$('#hintBtn', host);
    if (hb) hb.addEventListener('click', () => { item.hints++; item.score = codingScore(item); renderSession(); });
    const sb = SH.$('#solBtn', host);
    if (sb) sb.addEventListener('click', () => {
      if (!confirm(`Revealing the solution caps this problem's score at ${SOLUTION_CAP}%. Continue?`)) return;
      item.solutionShown = true;
      item.score = codingScore(item);
      renderSession();
    });
    SH.$('#resetCode', host).addEventListener('click', () => { if (confirm('Reset your code to the starter template?')) { item.code = d.starter; ed.value = d.starter; } });
    const run = () => {
      item.code = ed.value;
      const out = SH.$('#testOut', host);
      out.innerHTML = '<p class="muted small mt">Running tests…</p>';
      runTests(item.code, d).then((res) => {
        item.results = res;
        item.passed = res.error ? 0 : res.rows.filter((r) => r.pass).length;
        item.logs = res.logs || [];
        item.score = codingScore(item);
        drawResults(out, item);
        // refresh the item nav ✓ without losing the editor
        const nav = SH.$(`[data-item="${session.idx}"]`, el);
        if (nav && !nav.textContent.includes('✓')) nav.textContent += ' ✓';
      });
    };
    SH.$('#runBtn', host).addEventListener('click', run);
    if (item.results) drawResults(SH.$('#testOut', host), item);
  }

  function drawResults(out, item) {
    const res = item.results;
    const total = item.data.tests.length;
    if (res.error) {
      out.innerHTML = `<div class="feedback bad"><div class="feedback-title">⚠ ${SH.esc(res.error)}</div></div>${logsHtml(res.logs)}`;
      return;
    }
    const all = item.passed === total;
    out.innerHTML = `
      <div class="feedback ${all ? 'ok' : 'bad'}"><div class="feedback-title">${all ? '✓ All tests passed!' : `${item.passed} / ${total} tests passed`}</div>
        Current score for this problem: <strong>${item.score}%</strong>${item.hints ? ` (−${item.hints * HINT_PENALTY}% for hints)` : ''}${item.solutionShown ? ` (capped at ${SOLUTION_CAP}%)` : ''}.
        ${all ? `<div class="small mt-sm">Now state the complexity out loud. Target: ${SH.esc(item.data.complexity)}.</div>` : ''}</div>
      <div class="mt-sm">${res.rows
        .map((r, i) => `<div class="test-row"><span>${r.pass ? '✅' : '❌'}</span><div class="tr-body">
          <div><span class="muted">Test ${i + 1}:</span> ${SH.esc(item.data.fn)}(${SH.esc(r.argsText)})</div>
          ${r.pass ? `<div class="muted">→ ${SH.esc(r.gotText)} <span style="opacity:.6">(${r.ms} ms)</span></div>` : `<div>Expected <span style="color:var(--ok)">${SH.esc(r.expText)}</span>, got <span style="color:var(--bad)">${SH.esc(r.gotText)}</span></div>`}
        </div></div>`)
        .join('')}</div>
      ${logsHtml(res.logs)}`;
  }

  const logsHtml = (logs) => (logs && logs.length ? `<h3 class="mt">Console</h3><div class="log">${logs.map((l) => `<div>${SH.esc(l)}</div>`).join('')}</div>` : '');

  /* ---------- Sandboxed test runner ---------- */
  const WORKER_SRC = `
    self.onmessage = function (e) {
      var d = e.data, logs = [];
      var fmt = function (v) { try { return typeof v === 'string' ? v : JSON.stringify(v); } catch (err) { return String(v); } };
      var con = { log: function () { if (logs.length < 200) logs.push([].slice.call(arguments).map(fmt).join(' ')); } };
      con.error = con.warn = con.info = con.log;
      var f;
      try {
        f = new Function('console', d.code + '\\n;return typeof ' + d.fn + ' === "function" ? ' + d.fn + ' : undefined;')(con);
      } catch (err) { self.postMessage({ error: (err.name || 'Error') + ': ' + err.message, logs: logs }); return; }
      if (!f) { self.postMessage({ error: 'Function "' + d.fn + '" not found. Keep the given function name.', logs: logs }); return; }
      var results = d.tests.map(function (t) {
        var args = JSON.parse(JSON.stringify(t.args));
        var t0 = performance.now();
        try { var out = f.apply(null, args); return { out: out === undefined ? '__undefined__' : out, ms: +(performance.now() - t0).toFixed(2) }; }
        catch (err) { return { thrown: (err.name || 'Error') + ': ' + err.message }; }
      });
      self.postMessage({ results: results, logs: logs });
    };`;

  const show = (v) => (v === '__undefined__' ? 'undefined' : JSON.stringify(v));
  const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const unorderedEqual = (a, b) => Array.isArray(a) && Array.isArray(b) && deepEqual(a.slice().sort((x, y) => x - y), b.slice().sort((x, y) => x - y));

  function grade(d, payload) {
    if (payload.error) return { error: payload.error, logs: payload.logs };
    const rows = d.tests.map((t, i) => {
      const r = payload.results[i];
      const got = r.thrown ? null : r.out;
      const pass = !r.thrown && (d.compare === 'unordered' ? unorderedEqual(got, t.expected) : deepEqual(got, t.expected));
      return { pass, ms: r.ms, argsText: t.args.map((a) => JSON.stringify(a)).join(', '), expText: JSON.stringify(t.expected), gotText: r.thrown ? r.thrown : show(got) };
    });
    return { rows, logs: payload.logs };
  }

  function runInline(code, d) {
    // Fallback when Workers are unavailable (no timeout protection).
    const logs = [];
    const con = { log: (...a) => logs.push(a.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ')) };
    con.error = con.warn = con.info = con.log;
    let f;
    try { f = new Function('console', code + `\n;return typeof ${d.fn} === "function" ? ${d.fn} : undefined;`)(con); }
    catch (err) { return { error: `${err.name}: ${err.message}`, logs }; }
    if (!f) return { error: `Function "${d.fn}" not found. Keep the given function name.`, logs };
    const results = d.tests.map((t) => {
      const t0 = performance.now();
      try { const out = f(...JSON.parse(JSON.stringify(t.args))); return { out: out === undefined ? '__undefined__' : JSON.parse(JSON.stringify(out)), ms: +(performance.now() - t0).toFixed(2) }; }
      catch (err) { return { thrown: `${err.name}: ${err.message}` }; }
    });
    return { results, logs };
  }

  function runTests(code, d) {
    return new Promise((resolve) => {
      let worker, url;
      try {
        url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
        worker = new Worker(url);
      } catch (e) {
        resolve(grade(d, runInline(code, d)));
        return;
      }
      const done = (payload) => {
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve(grade(d, payload));
      };
      const timer = setTimeout(() => done({ error: `Time limit exceeded (${RUN_TIMEOUT_MS / 1000}s). Check for an infinite loop or an inefficient algorithm.`, logs: [] }), RUN_TIMEOUT_MS);
      worker.onmessage = (e) => done(e.data);
      worker.onerror = (e) => {
        e.preventDefault();
        done({ error: e.message || 'Runtime error', logs: [] });
      };
      worker.postMessage({ code, fn: d.fn, tests: d.tests });
    });
  }

  /* ---------------- Evaluation report ---------------- */
  function finish() {
    stopTimer();
    saveEditor();
    const s = session;
    const durationSec = Math.round((Date.now() - s.start) / 1000);
    s.items.forEach((it) => { if (it.kind === 'coding') it.score = it.results ? codingScore(it) : 0; else if (!it.submitted) it.score = 0; });
    const score = Math.round(s.items.reduce((a, it) => a + it.score, 0) / s.items.length);
    const verdict = score >= 85 ? 'Strong Hire' : score >= 70 ? 'Hire' : score >= 55 ? 'Lean Hire' : score >= 35 ? 'Lean No Hire' : 'No Hire';
    const items = s.items.map((it) => ({ kind: it.kind, title: it.kind === 'coding' ? it.data.title : it.data.q, score: it.score }));
    SH.store.recordInterview({ track: s.track, trackLabel: s.label, score, verdict, durationSec, items });
    SH.updateStreak();

    const feedback = s.items.map((it) => {
      if (it.kind === 'theory') {
        if (!it.submitted) return 'Not answered. In a real interview, always attempt an answer and reason out loud.';
        const missed = it.data.points.filter((_, i) => !it.checks[i]).map((p) => p.text);
        return missed.length ? `Missing: ${missed.join('; ')}.` : 'Covered every key point. Excellent structure.';
      }
      if (!it.results) return 'Not attempted. Even a brute-force solution earns partial credit.';
      const t = it.data.tests.length;
      const parts = [`${it.passed}/${t} tests passed.`];
      if (it.hints) parts.push(`${it.hints} hint(s) used.`);
      if (it.solutionShown) parts.push('The solution was revealed: re-solve it from scratch tomorrow.');
      if (it.passed < t) parts.push('Check edge cases: empty input, duplicates, negatives, single element.');
      parts.push(`Target complexity: ${it.data.complexity}.`);
      return parts.join(' ');
    });

    el.innerHTML = `
      <div class="card" style="max-width:900px;margin:0 auto">
        <div class="row" style="gap:28px">
          <div><div class="result-score" style="color:${score >= 70 ? 'var(--ok)' : score >= 55 ? 'var(--warn)' : 'var(--bad)'}">${score}%</div><div class="muted small">Overall evaluation</div></div>
          <div style="flex:1;min-width:220px"><div class="verdict">${verdict}</div>
            <div class="muted small">${SH.esc(s.label)} · Time used: ${SH.fmtTime(durationSec)}${s.limit ? ' of ' + SH.fmtTime(s.limit) : ''}</div></div>
        </div>
        <h3 class="mt">Breakdown</h3>
        ${s.items
          .map((it, i) => `<div class="review-item">
            <div class="row"><strong>${i + 1}. ${SH.esc(it.kind === 'coding' ? it.data.title : it.data.q)}</strong><span class="spacer"></span>
              <span class="badge ${it.score >= 70 ? 'badge-ok' : it.score >= 40 ? 'badge-warn' : 'badge-bad'}">${it.score}%</span></div>
            <div class="small muted mt-sm">${it.kind === 'coding' ? 'Coding' : SH.esc(it.data.kind)} · ${SH.esc(feedback[i])}</div>
          </div>`)
          .join('')}
        <div class="advice info mt"><div class="advice-icon">🤖</div><div class="small">
          ${score >= 85 ? 'Interview-ready performance. Keep practicing medium and hard problems and timed system design.' : score >= 55 ? 'Solid foundation. Review the missing key points above, then redo this track in 2–3 days to lock it in.' : 'Focus on fundamentals first: use the quiz engine on the related topics, review the model answers, and practice the easy coding problems untimed.'}
        </div></div>
        <div class="row mt"><button class="btn btn-primary" id="again">New interview</button><a class="btn" href="#/analytics">View analytics</a></div>
      </div>`;
    session = null;
    SH.$('#again', el).addEventListener('click', renderHome);
  }

  SH.views.interview = {
    title: 'Interview Simulator',
    render(root) {
      el = root;
      if (session) {
        if (session.limit) timerId = setInterval(tick, 1000);
        renderSession();
      } else renderHome();
    },
    destroy() {
      saveEditor();
      stopTimer();
    },
  };
})();
