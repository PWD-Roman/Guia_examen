/* Boolean Algebra Solver / Truth Table Generator + manual practice. */
(function () {
  const SH = window.SH;
  SH.views = SH.views || {};

  const EXAMPLES = [
    "A'B + AB'",
    '!(A & B) <-> (!A | !B)',
    '(A -> B) & (B -> C) -> (A -> C)',
    'A xor B xor C',
    '(A + B)(A + C)',
    'AB + A\'C + BC',
    'P and not P',
    '(A nand B) nor C',
  ];

  let el, result, revealed, selectedRow, debounce;
  let tab = 'solver';
  let practice = null;

  const settings = () => SH.store.data.settings;

  function render() {
    el.innerHTML = `
      <div class="page-head"><div><h1>Boolean algebra solver</h1><p>Type a logical expression to get a step-by-step truth table, canonical forms, a minimized expression and a K-map.</p></div></div>
      <div class="tabs">
        <button class="tab ${tab === 'solver' ? 'on' : ''}" data-tab="solver">Solver</button>
        <button class="tab ${tab === 'equiv' ? 'on' : ''}" data-tab="equiv">Equivalence checker</button>
        <button class="tab ${tab === 'practice' ? 'on' : ''}" data-tab="practice">Practice: fill the table</button>
      </div>
      <div id="boolBody"></div>`;
    SH.$$('[data-tab]', el).forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
    if (tab === 'solver') renderSolver();
    else if (tab === 'equiv') renderEquiv();
    else renderPractice();
  }

  const legend = `
    <details class="mt-sm"><summary class="small muted" style="cursor:pointer">Supported syntax &amp; precedence</summary>
      <div class="table-scroll"><table class="ref small">
        <tr><th>Operator</th><th>You can type</th><th>Precedence</th></tr>
        <tr><td>NOT</td><td><code>!A</code> <code>~A</code> <code>¬A</code> <code>not A</code> <code>A'</code></td><td>1 (highest)</td></tr>
        <tr><td>AND / NAND</td><td><code>A&amp;B</code> <code>A*B</code> <code>A·B</code> <code>A.B</code> <code>AB</code> (implicit) <code>and</code> · <code>nand</code> <code>↑</code></td><td>2</td></tr>
        <tr><td>XOR / XNOR</td><td><code>A^B</code> <code>A⊕B</code> <code>xor</code> · <code>xnor</code> <code>⊙</code></td><td>3</td></tr>
        <tr><td>OR / NOR</td><td><code>A|B</code> <code>A+B</code> <code>A||B</code> <code>or</code> · <code>nor</code> <code>↓</code></td><td>4</td></tr>
        <tr><td>IMPLIES</td><td><code>-&gt;</code> <code>=&gt;</code> <code>→</code> <code>implies</code> (right-associative)</td><td>5</td></tr>
        <tr><td>IFF</td><td><code>&lt;-&gt;</code> <code>&lt;=&gt;</code> <code>↔</code> <code>iff</code></td><td>6 (lowest)</td></tr>
        <tr><td>Constants</td><td><code>0</code> <code>1</code> <code>true</code> <code>false</code></td><td></td></tr>
      </table></div>
      <p class="small muted">With <strong>single-letter variables</strong> on, <code>AB</code> means <code>A·B</code>. Turn it off to use names like <code>rain</code> or <code>x1</code>. Note that <code>^</code> is XOR, while <code>∧</code> is AND.</p>
    </details>`;

  /* ---------------- Solver ---------------- */
  function renderSolver() {
    const body = SH.$('#boolBody', el);
    const last = SH.store.data.tools.lastExpr || "A'B + AB'";
    body.innerHTML = `
      <div class="card">
        <label class="field">Expression
          <input type="text" class="expr-input" id="expr" value="${SH.esc(last)}" spellcheck="false" autocomplete="off">
        </label>
        <div class="row mt-sm">
          <span class="small muted">Examples:</span>
          ${EXAMPLES.map((x) => `<button class="btn btn-sm btn-ghost mono" data-ex="${SH.esc(x)}">${SH.esc(x)}</button>`).join('')}
        </div>
        <div class="row mt-sm">
          <label class="row small" style="gap:6px"><input type="checkbox" id="single" ${settings().singleLetterVars ? 'checked' : ''}> Single-letter variables (AB = A·B)</label>
          <span class="spacer"></span>
          <span class="small muted">Insert:</span>
          ${['¬', '∧', '∨', '⊕', '→', '↔', '(', ')'].map((s) => `<button class="btn btn-sm mono" data-ins="${s}">${s}</button>`).join('')}
        </div>
        ${legend}
        <div id="exprError" class="feedback bad hidden"></div>
      </div>
      <div id="solveOut"></div>`;

    const input = SH.$('#expr', body);
    input.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(solve, 250); });
    SH.$$('[data-ex]', body).forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.ex; solve(); }));
    SH.$$('[data-ins]', body).forEach((b) =>
      b.addEventListener('click', () => {
        const s = input.selectionStart ?? input.value.length;
        input.value = input.value.slice(0, s) + b.dataset.ins + input.value.slice(input.selectionEnd ?? s);
        input.focus();
        input.selectionStart = input.selectionEnd = s + b.dataset.ins.length;
        solve();
      })
    );
    SH.$('#single', body).addEventListener('change', (e) => { SH.store.setSetting('singleLetterVars', e.target.checked); solve(); });
    solve();
  }

  function solve() {
    const input = SH.$('#expr', el);
    const errBox = SH.$('#exprError', el);
    const out = SH.$('#solveOut', el);
    try {
      result = SH.bool.analyze(input.value, { singleLetter: settings().singleLetterVars });
      errBox.classList.add('hidden');
      SH.store.data.tools.lastExpr = input.value;
      SH.store.save();
      revealed = result.steps.length;
      selectedRow = null;
      renderResult(out);
    } catch (e) {
      errBox.textContent = '⚠ ' + e.message;
      errBox.classList.remove('hidden');
      out.innerHTML = '';
    }
  }

  function renderResult(out) {
    const r = result;
    const n = r.vars.length;
    const clsBadge = r.classification === 'Tautology' ? 'badge-ok' : r.classification === 'Contradiction' ? 'badge-bad' : 'badge-accent';
    out.innerHTML = `
      <div class="card mt">
        <div class="row">
          <span class="badge ${clsBadge}">${r.classification}</span>
          <span class="badge">${n} variable${n === 1 ? '' : 's'}: ${r.vars.map(SH.esc).join(', ') || '—'}</span>
          <span class="badge">${r.rows.length} rows</span>
          <span class="badge">${r.minterms.length} true · ${r.maxterms.length} false</span>
        </div>
      </div>
      <div class="card mt steps">
        <div class="step-item">
          <h3>Tokenize</h3>
          <div>${r.tokens.map((t) => `<span class="token ${t.type === 'op' ? 'op' : t.type === 'var' ? 'var' : t.type.includes('paren') ? 'paren' : ''}" title="${t.type === 'op' ? t.op : t.type}">${SH.esc(t.text)}</span>`).join('')}</div>
        </div>
        <div class="step-item">
          <h3>Parse with operator precedence</h3>
          <p class="small muted">Fully parenthesized form (precedence: NOT, AND, XOR, OR, IMPLIES, IFF):</p>
          <div class="result-pill">${SH.esc(r.parenthesized)}</div>
          <p class="small muted mt">Evaluation order of sub-expressions (each becomes a truth-table column):</p>
          <ol class="small">${r.steps.map((s) => `<li><code>${SH.esc(s.label)}</code> <span class="muted">${SH.esc(SH.bool.describe(s.node))}</span></li>`).join('') || '<li class="muted">The expression is a single variable or constant.</li>'}</ol>
        </div>
        <div class="step-item">
          <div class="row"><h3 style="margin:0">Build the truth table</h3><span class="spacer"></span>
            <button class="btn btn-sm" id="revReset">⟲ Hide columns</button>
            <button class="btn btn-sm" id="revStep">Reveal next column ▶</button>
            <button class="btn btn-sm btn-ghost" id="revAll">Show all</button>
          </div>
          <p class="small muted">Rows are counted in binary: ${n} variables → 2<sup>${n}</sup> = ${r.rows.length} rows. Click a row to trace its evaluation. Green rows are the minterms (output = 1).</p>
          <div id="ttHost"></div>
          <div id="traceHost"></div>
        </div>
        <div class="step-item">
          <h3>Canonical forms</h3>
          <p class="small">Minterms (F = 1): <code>Σm(${r.minterms.join(', ')})</code> · Maxterms (F = 0): <code>ΠM(${r.maxterms.join(', ')})</code></p>
          ${n <= 5 ? `<p class="small muted">Canonical SOP:</p><div class="result-pill">${SH.esc(r.canonicalSOP)}</div>
          <p class="small muted mt">Canonical POS:</p><div class="result-pill">${SH.esc(r.canonicalPOS)}</div>` : '<p class="small muted">Canonical expansions are hidden for more than 5 variables (too long to read).</p>'}
        </div>
        <div class="step-item">
          <h3>Minimize (Quine–McCluskey)</h3>
          ${r.minimalSOP === null ? '<p class="muted small">Minimization is available for up to 8 variables.</p>' : `
            <p class="small muted">Merge minterms that differ in exactly one bit until nothing merges; the leftovers are the <strong>prime implicants</strong>. Take the essential ones, then cover the remaining minterms.</p>
            ${r.qm && r.qm.primes.length ? `<div class="table-scroll"><table class="ref small"><tr><th>Prime implicant</th><th>Pattern</th><th>Covers minterms</th><th></th></tr>
              ${r.qm.primes.map((p) => `<tr><td><code>${SH.esc(SH.bool.implicantToSOP(p.bits, r.vars))}</code></td><td class="mono">${p.bits}</td><td>${p.terms.join(', ')}</td><td>${r.qm.essential.includes(p) ? '<span class="badge badge-ok">essential</span>' : r.qm.chosen.includes(p) ? '<span class="badge badge-accent">selected</span>' : ''}</td></tr>`).join('')}
            </table></div>` : ''}
            <div class="grid grid-2 mt-sm">
              <div><p class="small muted">Minimal SOP</p><div class="result-pill">F = ${SH.esc(r.minimalSOP)}</div></div>
              <div><p class="small muted">Minimal POS</p><div class="result-pill">F = ${SH.esc(r.minimalPOS)}</div></div>
            </div>`}
        </div>
        ${n >= 2 && n <= 4 ? `<div class="step-item"><h3>Karnaugh map</h3><p class="small muted">Gray-code ordering: neighbouring cells differ in one variable. Small numbers are minterm indices.</p>${kmap(r)}</div>` : ''}
      </div>`;

    renderTable();
    const step = SH.$('#revStep', out);
    step.addEventListener('click', () => { revealed = Math.min(r.steps.length, revealed + 1); renderTable(); });
    SH.$('#revReset', out).addEventListener('click', () => { revealed = 0; renderTable(); });
    SH.$('#revAll', out).addEventListener('click', () => { revealed = r.steps.length; renderTable(); });
  }

  function renderTable() {
    const r = result;
    const host = SH.$('#ttHost', el);
    if (!host) return;
    const finalIsStep = r.steps.length && r.steps[r.steps.length - 1].node === r.ast;
    const showFinal = revealed >= r.steps.length;
    host.innerHTML = `<div class="truth-wrap"><table class="tt">
      <thead><tr>
        <th class="muted">#</th>
        ${r.vars.map((v) => `<th class="var">${SH.esc(v)}</th>`).join('')}
        ${r.steps.map((s, i) => {
          const isFinal = finalIsStep && i === r.steps.length - 1;
          return `<th class="step ${isFinal ? 'final' : ''} ${i >= revealed ? 'col-dim' : ''}" title="${SH.esc(SH.bool.describe(s.node))}">${SH.esc(s.label)}</th>`;
        }).join('')}
        ${!finalIsStep ? `<th class="final">F = ${SH.esc(r.parenthesized)}</th>` : ''}
      </tr></thead>
      <tbody>${r.rows
        .map((row) => `<tr data-row="${row.index}" class="${row.out && showFinal ? 'hl' : ''}" style="cursor:pointer;${selectedRow === row.index ? 'outline:2px solid var(--accent);outline-offset:-2px' : ''}">
          <td class="muted">${row.index}</td>
          ${r.vars.map((v) => `<td class="var v${row.env[v]}">${row.env[v]}</td>`).join('')}
          ${row.values.map((val, i) => {
            const isFinal = finalIsStep && i === r.steps.length - 1;
            return i < revealed ? `<td class="${isFinal ? 'final' : 'v' + val}">${val}</td>` : `<td class="muted">?</td>`;
          }).join('')}
          ${!finalIsStep ? `<td class="final">${row.out}</td>` : ''}
        </tr>`)
        .join('')}</tbody></table></div>`;
    SH.$$('[data-row]', host).forEach((tr) => tr.addEventListener('click', () => { selectedRow = +tr.dataset.row; renderTable(); renderTrace(); }));
    const btn = SH.$('#revStep', el);
    if (btn) btn.disabled = revealed >= r.steps.length;
  }

  function renderTrace() {
    const r = result;
    const row = r.rows[selectedRow];
    const host = SH.$('#traceHost', el);
    if (!row || !host) return;
    host.innerHTML = `<div class="card mt" style="background:var(--surface-2)">
      <div class="row"><strong>Trace of row ${row.index}</strong><span class="muted small">${r.vars.map((v) => `${SH.esc(v)} = ${row.env[v]}`).join(', ')}</span><span class="spacer"></span><button class="btn btn-sm btn-ghost" id="closeTrace">✕</button></div>
      <ol class="small mono" style="margin:10px 0 0">
        ${r.steps.map((s, i) => `<li>${SH.esc(s.label)} &nbsp;→&nbsp; ${SH.esc(SH.bool.substituted(s.node, row.env))} = <strong style="color:${row.values[i] ? 'var(--ok)' : 'var(--muted)'}">${row.values[i]}</strong></li>`).join('')}
      </ol>
      <div class="mt-sm small">Result: F = <strong>${row.out}</strong> ${row.out ? `(this row is minterm m${row.index})` : `(this row is maxterm M${row.index})`}</div>
    </div>`;
    SH.$('#closeTrace', host).addEventListener('click', () => { selectedRow = null; host.innerHTML = ''; renderTable(); });
  }

  function kmap(r) {
    const v = r.vars;
    const n = v.length;
    const gray = (bits) => (bits === 1 ? ['0', '1'] : ['00', '01', '11', '10']);
    const rowBits = n === 4 ? 2 : 1;
    const colBits = n - rowBits;
    const rows = gray(rowBits);
    const cols = gray(colBits);
    const rowLabel = v.slice(0, rowBits).join('');
    const colLabel = v.slice(rowBits).join('');
    const ones = new Set(r.minterms);
    return `<table class="kmap"><tr><th>${SH.esc(rowLabel)} \\ ${SH.esc(colLabel)}</th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
      ${rows.map((rb) => `<tr><th>${rb}</th>${cols.map((cb) => {
        const idx = parseInt(rb + cb, 2);
        return `<td class="${ones.has(idx) ? 'one' : ''}">${ones.has(idx) ? 1 : 0}<small>m${idx}</small></td>`;
      }).join('')}</tr>`).join('')}</table>`;
  }

  /* ---------------- Equivalence ---------------- */
  function renderEquiv() {
    const body = SH.$('#boolBody', el);
    body.innerHTML = `
      <div class="card">
        <p class="muted">Check whether two expressions are logically equivalent, e.g. to verify a simplification or a law such as De Morgan's.</p>
        <div class="grid grid-2">
          <label class="field">Expression 1<input type="text" class="expr-input" id="eqA" value="!(A & B)" spellcheck="false"></label>
          <label class="field">Expression 2<input type="text" class="expr-input" id="eqB" value="!A | !B" spellcheck="false"></label>
        </div>
        <div class="row mt-sm">
          <button class="btn btn-primary" id="eqBtn">Compare</button>
          <span class="small muted">Try:</span>
          <button class="btn btn-sm btn-ghost mono" data-pair="A + AB|A">Absorption</button>
          <button class="btn btn-sm btn-ghost mono" data-pair="A -> B|!B -> !A">Contrapositive</button>
          <button class="btn btn-sm btn-ghost mono" data-pair="A -> B|B -> A">Converse (not equivalent)</button>
          <button class="btn btn-sm btn-ghost mono" data-pair="A(B + C)|AB + AC">Distributive</button>
        </div>
        ${legend}
        <div id="eqOut" class="mt"></div>
      </div>`;
    const run = () => {
      const out = SH.$('#eqOut', body);
      try {
        const res = SH.bool.equivalent(SH.$('#eqA', body).value, SH.$('#eqB', body).value, { singleLetter: settings().singleLetterVars });
        out.innerHTML = res.equivalent
          ? `<div class="feedback ok"><div class="feedback-title">✓ Equivalent</div><code>${SH.esc(res.a)}</code> ≡ <code>${SH.esc(res.b)}</code> for all ${1 << res.vars.length} assignments of ${res.vars.map(SH.esc).join(', ') || 'no variables'}.</div>`
          : `<div class="feedback bad"><div class="feedback-title">✗ Not equivalent</div>They differ on ${res.counter.length} of ${1 << res.vars.length} assignments. Counterexamples:
              <div class="table-scroll mt-sm"><table class="tt" style="width:auto"><tr>${res.vars.map((v) => `<th>${SH.esc(v)}</th>`).join('')}<th>Expr 1</th><th>Expr 2</th></tr>
              ${res.counter.slice(0, 8).map((c) => `<tr>${res.vars.map((v) => `<td>${c.env[v]}</td>`).join('')}<td>${c.va}</td><td>${c.vb}</td></tr>`).join('')}</table></div></div>`;
      } catch (e) {
        out.innerHTML = `<div class="feedback bad">⚠ ${SH.esc(e.message)}</div>`;
      }
    };
    SH.$('#eqBtn', body).addEventListener('click', run);
    SH.$$('[data-pair]', body).forEach((b) => b.addEventListener('click', () => {
      const [a, c] = b.dataset.pair.split('|');
      SH.$('#eqA', body).value = a;
      SH.$('#eqB', body).value = c;
      run();
    }));
    run();
  }

  /* ---------------- Practice ---------------- */
  function randomExpr(vars, depth) {
    if (depth === 0 || (depth < 2 && Math.random() < 0.3)) {
      const v = { type: 'var', name: vars[Math.floor(Math.random() * vars.length)] };
      return Math.random() < 0.3 ? { type: 'not', a: v } : v;
    }
    const ops = ['AND', 'OR', 'XOR', 'IMP', 'AND', 'OR', 'NAND'];
    const node = { type: 'bin', op: ops[Math.floor(Math.random() * ops.length)], a: randomExpr(vars, depth - 1), b: randomExpr(vars, depth - 1) };
    return Math.random() < 0.15 ? { type: 'not', a: node } : node;
  }

  function newPractice(level) {
    const vars = level === 3 ? ['A', 'B', 'C'] : ['A', 'B', 'C'].slice(0, level === 1 ? 2 : 3);
    let expr, a;
    for (let tries = 0; tries < 30; tries++) {
      expr = SH.bool.toStr(randomExpr(vars, level === 3 ? 3 : 2));
      a = SH.bool.analyze(expr, { singleLetter: false });
      if (a.vars.length >= 2 && a.classification === 'Contingency') break;
    }
    practice = { level, analysis: a, guesses: a.rows.map(() => null), checked: false };
  }

  function renderPractice() {
    const body = SH.$('#boolBody', el);
    if (!practice) newPractice(2);
    const a = practice.analysis;
    const correct = practice.checked ? a.rows.filter((r, i) => practice.guesses[i] === r.out).length : 0;
    body.innerHTML = `
      <div class="card">
        <div class="row"><h3 style="margin:0">Evaluate the expression for every row</h3><span class="spacer"></span>
          <select id="lvl" class="inline-input">
            <option value="1" ${practice.level === 1 ? 'selected' : ''}>Easy (2 vars)</option>
            <option value="2" ${practice.level === 2 ? 'selected' : ''}>Medium (3 vars)</option>
            <option value="3" ${practice.level === 3 ? 'selected' : ''}>Hard (nested)</option>
          </select>
          <button class="btn" id="newP">↻ New expression</button></div>
        <div class="result-pill mt" style="font-size:1.15rem">F = ${SH.esc(a.parenthesized)}</div>
        <p class="small muted mt-sm">Click each F cell to cycle ? → 0 → 1. Work it out on paper first, then check. Hint: evaluate the innermost parentheses first.</p>
        <div class="truth-wrap" style="max-width:520px"><table class="tt">
          <thead><tr>${a.vars.map((v) => `<th class="var">${v}</th>`).join('')}<th class="final">F</th>${practice.checked ? '<th></th>' : ''}</tr></thead>
          <tbody>${a.rows.map((r, i) => {
            const g = practice.guesses[i];
            const ok = practice.checked && g === r.out;
            return `<tr>${a.vars.map((v) => `<td class="var">${r.env[v]}</td>`).join('')}
              <td><button class="btn btn-sm mono" data-g="${i}" style="min-width:44px" ${practice.checked ? 'disabled' : ''}>${g === null ? '?' : g}</button></td>
              ${practice.checked ? `<td>${ok ? '<span style="color:var(--ok)">✓</span>' : `<span style="color:var(--bad)">✗ ${r.out}</span>`}</td>` : ''}</tr>`;
          }).join('')}</tbody></table></div>
        <div class="row mt">
          ${practice.checked
            ? `<div class="feedback ${correct === a.rows.length ? 'ok' : 'bad'}" style="margin:0;flex:1"><strong>${correct} / ${a.rows.length} rows correct.</strong> ${correct === a.rows.length ? 'Perfect!' : 'Open it in the solver to see each intermediate column.'}</div>
               <button class="btn" id="openSolver">Open in solver</button>`
            : '<button class="btn btn-primary" id="checkP">Check answers</button>'}
        </div>
      </div>`;

    SH.$('#lvl', body).addEventListener('change', (e) => { newPractice(+e.target.value); renderPractice(); });
    SH.$('#newP', body).addEventListener('click', () => { newPractice(practice.level); renderPractice(); });
    SH.$$('[data-g]', body).forEach((b) => b.addEventListener('click', () => {
      const i = +b.dataset.g;
      const g = practice.guesses[i];
      practice.guesses[i] = g === null ? 0 : g === 0 ? 1 : null;
      b.textContent = practice.guesses[i] === null ? '?' : practice.guesses[i];
    }));
    const chk = SH.$('#checkP', body);
    if (chk) chk.addEventListener('click', () => {
      if (practice.guesses.some((g) => g === null)) return SH.toast('Fill in every row first.');
      practice.checked = true;
      const allOk = a.rows.every((r, i) => practice.guesses[i] === r.out);
      SH.store.recordAnswer({ id: 'tool-tt-practice', topic: 'logic', sub: 'Truth Tables', type: 'tool' }, allOk, 'tool');
      renderPractice();
    });
    const os = SH.$('#openSolver', body);
    if (os) os.addEventListener('click', () => {
      SH.store.data.tools.lastExpr = a.parenthesized;
      SH.store.save();
      tab = 'solver';
      render();
    });
  }

  SH.views.boolean = {
    title: 'Boolean Solver',
    render(root, params) {
      el = root;
      if (params.expr) {
        SH.store.data.tools.lastExpr = params.expr;
        tab = 'solver';
        SH.cleanHash('boolean');
      }
      render();
    },
  };
})();
