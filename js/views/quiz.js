/* Quiz engine: Practice (instant feedback), Exam (timed, graded at the end)
   and Weak-spot mode (prioritizes questions you missed or never answered). */
(function () {
  const SH = window.SH;
  SH.views = SH.views || {};

  const TYPES = [
    ['mcq', 'Multiple choice'],
    ['scenario', 'Scenario-based'],
    ['output', 'Code output prediction'],
  ];
  const SEC_PER_Q = 75;

  let el, state, timerId, keyHandler;
  let setup = { topics: [], types: ['mcq', 'scenario', 'output'], count: '10', mode: 'practice' };

  const normalize = (s) => String(s).trim().toLowerCase().replace(/^["'`]+|["'`]+$/g, '').replace(/\s+/g, ' ');
  const squash = (s) => normalize(s).replace(/\s/g, '');
  const checkOutput = (q, input) => q.accept.some((a) => normalize(a) === normalize(input) || squash(a) === squash(input));
  const isCorrect = (q, resp) => (resp == null || resp === '' ? false : q.type === 'output' ? checkOutput(q, resp) : resp === q.answer);

  function pickQuestions(opts) {
    let pool = SH.questions.filter(
      (q) => (!opts.topics.length || opts.topics.includes(q.topic)) && opts.types.includes(q.type) && (!opts.ids || opts.ids.includes(q.id))
    );
    const n = opts.count === 'all' ? pool.length : Math.min(+opts.count || 10, pool.length);
    if (opts.mode === 'weak') {
      const ans = SH.store.data.answers;
      const priority = (q) => {
        const a = ans[q.id];
        if (!a) return 1;                       // never seen
        if (a.last === false) return 0;         // last answer wrong
        return 2 + a.correct / a.attempts;      // seen; lower accuracy first
      };
      pool = SH.shuffle(pool).sort((a, b) => priority(a) - priority(b));
      return SH.shuffle(pool.slice(0, n));
    }
    return SH.shuffle(pool).slice(0, n);
  }

  /* ---------------- Setup screen ---------------- */
  function renderSetup() {
    stopTimer();
    const counts = {};
    SH.questions.forEach((q) => (counts[q.topic] = (counts[q.topic] || 0) + 1));
    el.innerHTML = `
      <div class="page-head"><div><h1>Quiz engine</h1><p>Multiple choice, scenario questions and code-output prediction, with an explanation for every answer.</p></div></div>
      <div class="card">
        <h3>1 · Topics <span class="muted small">(none selected = all topics)</span></h3>
        <div class="chips" id="topicChips">
          ${SH.topics.map((t) => `<span class="chip ${setup.topics.includes(t.id) ? 'on' : ''}" data-topic="${t.id}"><span class="dot" style="background:${t.color}"></span>${SH.esc(t.short)} <span class="muted small">${counts[t.id] || 0}</span></span>`).join('')}
        </div>
        <h3 class="mt">2 · Question types</h3>
        <div class="chips" id="typeChips">
          ${TYPES.map(([id, label]) => `<span class="chip ${setup.types.includes(id) ? 'on' : ''}" data-type="${id}">${label}</span>`).join('')}
        </div>
        <h3 class="mt">3 · Mode</h3>
        <div class="grid grid-3" id="modeCards">
          ${[
            ['practice', '🎯 Practice', 'Instant feedback and an explanation after every answer.'],
            ['exam', '◷ Exam', `Timed (${SEC_PER_Q}s per question). Navigate freely; graded at the end.`],
            ['weak', '🩹 Weak spots', 'Prioritizes questions you got wrong or have never seen.'],
          ]
            .map(([id, t, d]) => `<div class="card track-card ${setup.mode === id ? 'on' : ''}" data-mode="${id}" style="padding:14px"><strong>${t}</strong><div class="small muted">${d}</div></div>`)
            .join('')}
        </div>
        <h3 class="mt">4 · Number of questions</h3>
        <div class="chips" id="countChips">
          ${['5', '10', '20', '30', 'all'].map((c) => `<span class="chip ${setup.count === c ? 'on' : ''}" data-count="${c}">${c === 'all' ? 'All' : c}</span>`).join('')}
        </div>
        <div class="row mt">
          <span class="muted small" id="poolInfo"></span><span class="spacer"></span>
          <button class="btn btn-primary" id="startBtn">Start quiz →</button>
        </div>
      </div>`;

    const updatePool = () => {
      const pool = SH.questions.filter((q) => (!setup.topics.length || setup.topics.includes(q.topic)) && setup.types.includes(q.type)).length;
      SH.$('#poolInfo', el).textContent = `${pool} matching questions available`;
      SH.$('#startBtn', el).disabled = pool === 0;
    };
    const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v));

    el.querySelector('#topicChips').addEventListener('click', (e) => {
      const c = e.target.closest('[data-topic]');
      if (!c) return;
      setup.topics = toggle(setup.topics, c.dataset.topic);
      c.classList.toggle('on');
      updatePool();
    });
    el.querySelector('#typeChips').addEventListener('click', (e) => {
      const c = e.target.closest('[data-type]');
      if (!c) return;
      const next = toggle(setup.types, c.dataset.type);
      if (!next.length) return SH.toast('Select at least one question type.');
      setup.types = next;
      c.classList.toggle('on');
      updatePool();
    });
    el.querySelector('#modeCards').addEventListener('click', (e) => {
      const c = e.target.closest('[data-mode]');
      if (!c) return;
      setup.mode = c.dataset.mode;
      SH.$$('[data-mode]', el).forEach((x) => x.classList.toggle('on', x === c));
    });
    el.querySelector('#countChips').addEventListener('click', (e) => {
      const c = e.target.closest('[data-count]');
      if (!c) return;
      setup.count = c.dataset.count;
      SH.$$('[data-count]', el).forEach((x) => x.classList.toggle('on', x === c));
    });
    SH.$('#startBtn', el).addEventListener('click', () => start(setup));
    updatePool();
  }

  /* ---------------- Running ---------------- */
  function start(opts) {
    const questions = pickQuestions(opts);
    if (!questions.length) return SH.toast('No questions match your selection.', 'bad');
    state = {
      opts,
      mode: opts.mode,
      questions,
      idx: 0,
      responses: questions.map(() => ({ answer: null, submitted: false, correct: false })),
      startTs: Date.now(),
      timeLimit: opts.mode === 'exam' ? questions.length * SEC_PER_Q : null,
    };
    if (state.timeLimit) startTimer();
    renderQuestion();
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(() => {
      const left = state.timeLimit - (Date.now() - state.startTs) / 1000;
      const t = SH.$('#timer', el);
      if (t) {
        t.textContent = '◷ ' + SH.fmtTime(left);
        t.classList.toggle('low', left < 60);
      }
      if (left <= 0) {
        SH.toast('Time is up! Submitting your exam.', 'bad');
        finish();
      }
    }, 500);
  }
  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function renderQuestion() {
    const { questions, idx, responses, mode } = state;
    const q = questions[idx];
    const r = responses[idx];
    const exam = mode === 'exam';
    const answeredCount = responses.filter((x) => (exam ? x.answer !== null && x.answer !== '' : x.submitted)).length;
    const reveal = !exam && r.submitted;

    let body = '';
    if (q.type === 'output') {
      body = `
        <label class="field mt">Your answer (exact output)
          <input type="text" id="outInput" class="mono" autocomplete="off" spellcheck="false" placeholder="Type the output..." value="${SH.esc(r.answer || '')}" ${reveal ? 'disabled' : ''}>
        </label>
        ${!exam && !reveal ? '<div class="row mt-sm"><button class="btn btn-primary" id="checkBtn">Check answer</button><span class="muted small">Press Enter to check</span></div>' : ''}`;
    } else {
      body = `<div class="options">${q.options
        .map((opt, i) => {
          let cls = '';
          if (reveal) cls = i === q.answer ? 'correct' : i === r.answer ? 'wrong' : '';
          else if (r.answer === i) cls = 'selected';
          const rat = reveal && q.rationale && (i === q.answer || i === r.answer) ? `<span class="rationale">${SH.md(q.rationale[i])}</span>` : '';
          return `<button class="option ${cls}" data-opt="${i}" ${reveal ? 'disabled' : ''}><span class="letter">${'ABCD'[i]}</span><span>${SH.md(opt)}${rat}</span></button>`;
        })
        .join('')}</div>`;
    }

    let feedback = '';
    if (reveal) {
      const correctText = q.type === 'output' ? `<div class="mt-sm">Expected output: <code>${SH.esc(q.answer)}</code></div>` : '';
      feedback = `<div class="feedback ${r.correct ? 'ok' : 'bad'}">
        <div class="feedback-title">${r.correct ? '✓ Correct!' : '✗ Not quite.'}</div>
        ${!r.correct ? correctText : ''}
        <div class="mt-sm">${SH.md(q.explain)}</div>
      </div>`;
    }

    el.innerHTML = `
      <div class="q-card">
        <div class="row" style="margin-bottom:12px">
          <button class="btn btn-ghost btn-sm" id="quitBtn">✕ Quit</button>
          <span class="muted small">Question ${idx + 1} of ${questions.length}</span>
          <span class="spacer"></span>
          ${exam ? `<span class="timer" id="timer">◷ ${SH.fmtTime(state.timeLimit - (Date.now() - state.startTs) / 1000)}</span>` : `<span class="badge">${mode === 'weak' ? '🩹 Weak spots' : '🎯 Practice'}</span>`}
        </div>
        <div class="progress" style="margin-bottom:16px"><span style="width:${SH.pct(answeredCount, questions.length)}%"></span></div>
        <div class="card">
          <div class="q-meta">${SH.topicBadge(q.topic)}<span class="badge">${SH.esc(q.sub)}</span>${SH.diffBadge(q.difficulty)}
            <span class="badge badge-accent">${q.type === 'output' ? 'Predict the output' : q.type === 'scenario' ? 'Scenario' : 'Multiple choice'}</span></div>
          <div class="q-text">${SH.md(q.q)}</div>
          ${q.code ? SH.codeBlock(q.code, q.lang) : ''}
          ${body}
          ${feedback}
          <div class="row mt">
            ${exam ? `<button class="btn" id="prevBtn" ${idx === 0 ? 'disabled' : ''}>← Previous</button>` : ''}
            <span class="spacer"></span>
            ${!exam && !reveal ? '<button class="btn btn-ghost" id="skipBtn">Skip</button>' : ''}
            ${exam ? (idx < questions.length - 1 ? '<button class="btn" id="nextBtn">Next →</button>' : '') + '<button class="btn btn-primary" id="submitExam">Submit exam</button>' : ''}
            ${reveal ? `<button class="btn btn-primary" id="nextBtn">${idx < questions.length - 1 ? 'Next question →' : 'See results →'}</button>` : ''}
          </div>
          ${exam ? `<div class="q-nav">${questions.map((_, i) => `<button data-jump="${i}" class="${responses[i].answer !== null && responses[i].answer !== '' ? 'answered' : ''} ${i === idx ? 'current' : ''}">${i + 1}</button>`).join('')}</div>` : ''}
          <div class="muted small mt">${q.type === 'output' ? '' : 'Shortcuts: <kbd>1</kbd>–<kbd>4</kbd> to answer · '}<kbd>Enter</kbd> ${exam ? 'next' : 'continue'}</div>
        </div>
      </div>`;

    bindQuestion();
    const inp = SH.$('#outInput', el);
    if (inp && !inp.disabled) inp.focus();
  }

  function bindQuestion() {
    const q = state.questions[state.idx];
    const r = state.responses[state.idx];
    const exam = state.mode === 'exam';

    SH.$$('[data-opt]', el).forEach((b) =>
      b.addEventListener('click', () => {
        r.answer = +b.dataset.opt;
        if (exam) renderQuestion();
        else submitCurrent();
      })
    );
    const inp = SH.$('#outInput', el);
    if (inp) {
      inp.addEventListener('input', () => (r.answer = inp.value));
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          r.answer = inp.value;
          if (exam) go(1);
          else if (inp.value.trim()) submitCurrent();
        }
      });
    }
    const on = (id, fn) => SH.$(id, el) && SH.$(id, el).addEventListener('click', fn);
    on('#checkBtn', () => {
      if (!String(r.answer || '').trim()) return SH.toast('Type an answer first.');
      submitCurrent();
    });
    on('#nextBtn', () => (exam ? go(1) : advance()));
    on('#prevBtn', () => go(-1));
    on('#skipBtn', () => {
      r.submitted = true;
      r.correct = false;
      r.skipped = true;
      SH.store.recordAnswer(q, false, state.mode);
      renderQuestion();
    });
    on('#submitExam', () => {
      const unanswered = state.responses.filter((x) => x.answer === null || x.answer === '').length;
      if (unanswered && !confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
      finish();
    });
    on('#quitBtn', () => {
      if (confirm('Quit this quiz? Answers already submitted are saved.')) {
        stopTimer();
        state = null;
        renderSetup();
      }
    });
    SH.$$('[data-jump]', el).forEach((b) => b.addEventListener('click', () => { state.idx = +b.dataset.jump; renderQuestion(); }));
  }

  function submitCurrent() {
    const q = state.questions[state.idx];
    const r = state.responses[state.idx];
    r.submitted = true;
    r.correct = isCorrect(q, r.answer);
    SH.store.recordAnswer(q, r.correct, state.mode);
    renderQuestion();
  }

  function go(delta) {
    state.idx = SH.clamp(state.idx + delta, 0, state.questions.length - 1);
    renderQuestion();
  }

  function advance() {
    if (state.idx < state.questions.length - 1) {
      state.idx++;
      renderQuestion();
    } else finish();
  }

  /* ---------------- Results ---------------- */
  function finish() {
    stopTimer();
    const { questions, responses, mode } = state;
    if (mode === 'exam') {
      questions.forEach((q, i) => {
        responses[i].correct = isCorrect(q, responses[i].answer);
        responses[i].submitted = true;
        SH.store.recordAnswer(q, responses[i].correct, 'exam');
      });
    }
    const correct = responses.filter((r) => r.correct).length;
    const durationSec = Math.round((Date.now() - state.startTs) / 1000);
    const byTopic = {};
    questions.forEach((q, i) => {
      byTopic[q.topic] = byTopic[q.topic] || { total: 0, correct: 0 };
      byTopic[q.topic].total++;
      if (responses[i].correct) byTopic[q.topic].correct++;
    });
    SH.store.recordQuiz({ mode, total: questions.length, correct, durationSec, topics: Object.keys(byTopic), byTopic });
    SH.updateStreak();
    renderResults({ correct, durationSec, byTopic });
  }

  function renderResults({ correct, durationSec, byTopic }) {
    const { questions, responses, mode } = state;
    const score = SH.pct(correct, questions.length);
    const missedIds = questions.filter((_, i) => !responses[i].correct).map((q) => q.id);
    const verdict = score >= 85 ? ['Excellent!', 'You are exam-ready on this material.'] : score >= 70 ? ['Good job!', 'Review the explanations for the questions you missed.'] : score >= 50 ? ['Getting there', 'Focus on the weak topics below, then retry the missed questions.'] : ['Keep practicing', 'Read the explanations carefully and use flashcards for these topics.'];
    const fmtResp = (q, r) => (r.answer === null || r.answer === '' ? '<em class="muted">No answer</em>' : q.type === 'output' ? `<code>${SH.esc(r.answer)}</code>` : SH.md(q.options[r.answer]));
    const fmtCorrect = (q) => (q.type === 'output' ? `<code>${SH.esc(q.answer)}</code>` : SH.md(q.options[q.answer]));

    el.innerHTML = `
      <div class="q-card">
        <div class="card">
          <div class="row" style="gap:28px;align-items:center">
            <div><div class="result-score" style="color:${score >= 70 ? 'var(--ok)' : score >= 50 ? 'var(--warn)' : 'var(--bad)'}">${score}%</div><div class="muted small">${correct} / ${questions.length} correct</div></div>
            <div style="flex:1;min-width:220px"><h2 style="margin-bottom:4px">${verdict[0]}</h2><p class="muted" style="margin:0">${verdict[1]}</p>
              <div class="small muted mt-sm">Mode: ${mode === 'exam' ? 'Timed exam' : mode === 'weak' ? 'Weak spots' : 'Practice'} · Time: ${SH.fmtTime(durationSec)}</div></div>
          </div>
          <h3 class="mt">By topic</h3>
          ${Object.entries(byTopic)
            .map(([t, v]) => {
              const p = SH.pct(v.correct, v.total);
              return `<div class="hbar-row"><div class="hbar-label"><span class="dot" style="background:${SH.topic(t).color}"></span>${SH.esc(SH.topic(t).short)}</div>
                <div class="hbar-track"><div class="hbar-fill" style="width:${p}%"></div></div><div class="hbar-val">${v.correct}/${v.total}</div></div>`;
            })
            .join('')}
          <div class="row mt">
            ${missedIds.length ? '<button class="btn btn-primary" id="retryMissed">↻ Retry missed questions</button>' : ''}
            <button class="btn" id="again">New quiz</button>
            <a class="btn btn-ghost" href="#/analytics">View analytics</a>
            <span class="spacer"></span>
            <label class="small row" style="gap:6px"><input type="checkbox" id="onlyWrong" ${missedIds.length ? 'checked' : ''}> Show only incorrect</label>
          </div>
        </div>
        <div class="card mt">
          <h3>Review</h3>
          <div id="reviewList">
            ${questions
              .map((q, i) => {
                const r = responses[i];
                return `<div class="review-item" data-ok="${r.correct ? 1 : 0}">
                  <div class="q-meta"><span class="badge ${r.correct ? 'badge-ok' : 'badge-bad'}">${r.correct ? '✓ Correct' : '✗ Incorrect'}</span>${SH.topicBadge(q.topic)}<span class="badge">${SH.esc(q.sub)}</span></div>
                  <div class="q-text">${i + 1}. ${SH.md(q.q)}</div>
                  ${q.code ? SH.codeBlock(q.code, q.lang) : ''}
                  <div class="small">Your answer: ${fmtResp(q, r)}</div>
                  ${!r.correct ? `<div class="small">Correct answer: ${fmtCorrect(q)}</div>` : ''}
                  <div class="feedback ${r.correct ? 'ok' : 'bad'}" style="margin-top:8px">${SH.md(q.explain)}</div>
                </div>`;
              })
              .join('')}
          </div>
        </div>
      </div>`;

    const applyFilter = () => {
      const only = SH.$('#onlyWrong', el).checked;
      SH.$$('.review-item', el).forEach((it) => it.classList.toggle('hidden', only && it.dataset.ok === '1'));
    };
    SH.$('#onlyWrong', el).addEventListener('change', applyFilter);
    applyFilter();
    SH.$('#again', el).addEventListener('click', () => { state = null; renderSetup(); });
    const rm = SH.$('#retryMissed', el);
    if (rm) rm.addEventListener('click', () => start({ topics: [], types: ['mcq', 'scenario', 'output'], count: 'all', mode: 'practice', ids: missedIds }));
    state.finished = true;
  }

  SH.views.quiz = {
    title: 'Quiz Engine',
    render(root, params) {
      el = root;
      state = null;
      if (params.topics) setup.topics = params.topics.split(',').filter((t) => SH.topics.some((x) => x.id === t));
      else if (params.autostart) setup.topics = [];
      if (params.mode) setup.mode = params.mode;
      if (params.count) setup.count = params.count;
      if (params.autostart) {
        SH.cleanHash('quiz');
        start(setup);
      } else renderSetup();

      keyHandler = (e) => {
        if (!state || state.finished || /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
        // A focused button already handles Enter natively; avoid acting twice.
        if (e.key === 'Enter' && document.activeElement.tagName === 'BUTTON') return;
        const q = state.questions[state.idx];
        const r = state.responses[state.idx];
        const exam = state.mode === 'exam';
        const k = e.key.toLowerCase();
        const idx = ['1', '2', '3', '4'].indexOf(k) >= 0 ? +k - 1 : ['a', 'b', 'c', 'd'].indexOf(k);
        if (idx >= 0 && q.options && idx < q.options.length && (exam || !r.submitted)) {
          r.answer = idx;
          if (exam) renderQuestion();
          else submitCurrent();
        } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
          if (exam) go(1);
          else if (r.submitted) advance();
        } else if (e.key === 'ArrowLeft' && exam) go(-1);
      };
      document.addEventListener('keydown', keyHandler);
    },
    destroy() {
      stopTimer();
      document.removeEventListener('keydown', keyHandler);
    },
  };
})();
