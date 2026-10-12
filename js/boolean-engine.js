/* Boolean expression engine: tokenizer → recursive-descent parser → AST,
   truth tables with intermediate columns, canonical forms and
   Quine–McCluskey minimization.

   Precedence (high → low): NOT / postfix '  >  AND NAND  >  XOR XNOR  >  OR NOR  >  →  >  ↔ */
(function () {
  const SH = window.SH;

  const KEYWORDS = {
    and: 'AND', or: 'OR', not: 'NOT', xor: 'XOR', nand: 'NAND', nor: 'NOR', xnor: 'XNOR',
    implies: 'IMP', iff: 'IFF', true: 1, false: 0,
  };
  const SYMBOLS = [
    ['<->', 'IFF'], ['<=>', 'IFF'], ['->', 'IMP'], ['=>', 'IMP'], ['&&', 'AND'], ['||', 'OR'],
    ['↔', 'IFF'], ['→', 'IMP'], ['&', 'AND'], ['*', 'AND'], ['·', 'AND'], ['∧', 'AND'], ['.', 'AND'],
    ['|', 'OR'], ['+', 'OR'], ['∨', 'OR'], ['^', 'XOR'], ['⊕', 'XOR'], ['⊙', 'XNOR'],
    ['↑', 'NAND'], ['↓', 'NOR'], ['!', 'NOT'], ['~', 'NOT'], ['¬', 'NOT'], ["'", 'PRIME'], ['’', 'PRIME'],
  ];
  const SYM = { AND: '∧', OR: '∨', XOR: '⊕', NAND: '↑', NOR: '↓', XNOR: '⊙', IMP: '→', IFF: '↔' };
  const OP_NAME = { AND: 'AND', OR: 'OR', XOR: 'XOR', NAND: 'NAND', NOR: 'NOR', XNOR: 'XNOR', IMP: 'IMPLIES', IFF: 'IFF (biconditional)' };

  class BoolError extends Error {
    constructor(msg, pos) { super(msg); this.pos = pos; }
  }

  function tokenize(src, singleLetter) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '(' || ch === '[') { tokens.push({ type: 'lparen', text: '(', pos: i }); i++; continue; }
      if (ch === ')' || ch === ']') { tokens.push({ type: 'rparen', text: ')', pos: i }); i++; continue; }
      if (ch === '0' || ch === '1') { tokens.push({ type: 'const', value: +ch, text: ch, pos: i }); i++; continue; }
      const sym = SYMBOLS.find(([s]) => src.startsWith(s, i));
      if (sym) {
        tokens.push({ type: 'op', op: sym[1], text: sym[0], pos: i });
        i += sym[0].length;
        continue;
      }
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
      if (m) {
        const word = m[0];
        const kw = KEYWORDS[word.toLowerCase()];
        if (kw === 0 || kw === 1) tokens.push({ type: 'const', value: kw, text: word, pos: i });
        else if (kw) tokens.push({ type: 'op', op: kw, text: word, pos: i });
        else if (singleLetter) {
          // "AB" → A, B (implicit AND); digits stay attached to their letter: "x1y2" → x1, y2
          let off = 0;
          (word.match(/[A-Za-z_]\d*/g) || []).forEach((v) => {
            tokens.push({ type: 'var', name: v, text: v, pos: i + off });
            off += v.length;
          });
        } else tokens.push({ type: 'var', name: word, text: word, pos: i });
        i += word.length;
        continue;
      }
      throw new BoolError(`Unexpected character "${ch}" at position ${i + 1}`, i);
    }
    return tokens;
  }

  function parse(tokens) {
    let p = 0;
    const peek = () => tokens[p];
    const isOp = (...ops) => peek() && peek().type === 'op' && ops.includes(peek().op);
    const startsOperand = () => {
      const t = peek();
      return t && (t.type === 'var' || t.type === 'const' || t.type === 'lparen' || (t.type === 'op' && t.op === 'NOT'));
    };

    const binLeft = (next, ops) => () => {
      let left = next();
      while (isOp(...ops)) {
        const op = tokens[p++].op;
        left = { type: 'bin', op, a: left, b: next() };
      }
      return left;
    };

    function primary() {
      const t = peek();
      if (!t) throw new BoolError('Unexpected end of expression: an operand is missing', tokens.length ? tokens[tokens.length - 1].pos + 1 : 0);
      if (t.type === 'var') { p++; return { type: 'var', name: t.name }; }
      if (t.type === 'const') { p++; return { type: 'const', value: t.value }; }
      if (t.type === 'lparen') {
        p++;
        const e = iff();
        if (!peek() || peek().type !== 'rparen') throw new BoolError('Missing closing parenthesis ")"', t.pos);
        p++;
        return e;
      }
      throw new BoolError(`Unexpected "${t.text}" at position ${t.pos + 1}`, t.pos);
    }
    function postfix() {
      let e = primary();
      while (isOp('PRIME')) { p++; e = { type: 'not', a: e }; }
      return e;
    }
    function unary() {
      if (isOp('NOT')) { p++; return { type: 'not', a: unary() }; }
      return postfix();
    }
    function and() {
      let left = unary();
      for (;;) {
        if (isOp('AND', 'NAND')) {
          const op = tokens[p++].op;
          left = { type: 'bin', op, a: left, b: unary() };
        } else if (startsOperand()) {
          left = { type: 'bin', op: 'AND', a: left, b: unary(), implicit: true };
        } else break;
      }
      return left;
    }
    const xor = binLeft(and, ['XOR', 'XNOR']);
    const or = binLeft(xor, ['OR', 'NOR']);
    function imp() {
      const left = or();
      if (isOp('IMP')) { p++; return { type: 'bin', op: 'IMP', a: left, b: imp() }; } // right-associative
      return left;
    }
    function iff() {
      let left = imp();
      while (isOp('IFF')) { p++; left = { type: 'bin', op: 'IFF', a: left, b: imp() }; }
      return left;
    }

    if (!tokens.length) throw new BoolError('Enter an expression', 0);
    const ast = iff();
    if (p < tokens.length) {
      const t = tokens[p];
      throw new BoolError(t.type === 'rparen' ? `Unmatched ")" at position ${t.pos + 1}` : `Unexpected "${t.text}" at position ${t.pos + 1}`, t.pos);
    }
    return ast;
  }

  function evaluate(n, env) {
    switch (n.type) {
      case 'var': return env[n.name];
      case 'const': return n.value;
      case 'not': return evaluate(n.a, env) ? 0 : 1;
      default: return applyOp(n.op, evaluate(n.a, env), evaluate(n.b, env));
    }
  }
  function applyOp(op, a, b) {
    switch (op) {
      case 'AND': return a & b;
      case 'OR': return a | b;
      case 'XOR': return a ^ b;
      case 'NAND': return (a & b) ^ 1;
      case 'NOR': return (a | b) ^ 1;
      case 'XNOR': return (a ^ b) ^ 1;
      case 'IMP': return (a ^ 1) | b;
      case 'IFF': return (a ^ b) ^ 1;
    }
    return 0;
  }

  const isLeaf = (n) => n.type === 'var' || n.type === 'const';
  function toStr(n) {
    if (n.type === 'var') return n.name;
    if (n.type === 'const') return String(n.value);
    if (n.type === 'not') return isLeaf(n.a) || n.a.type === 'not' ? '¬' + toStr(n.a) : '¬(' + toStr(n.a) + ')';
    const wrap = (x) => (x.type === 'bin' ? '(' + toStr(x) + ')' : toStr(x));
    return `${wrap(n.a)} ${SYM[n.op]} ${wrap(n.b)}`;
  }
  /* The node's own operation with its direct children replaced by their values, e.g. "1 ∧ 0". */
  function substituted(n, env) {
    const v = (x) => String(evaluate(x, env));
    if (n.type === 'not') return '¬' + v(n.a);
    if (n.type === 'bin') return `${v(n.a)} ${SYM[n.op]} ${v(n.b)}`;
    return v(n);
  }

  function collectVars(n, set = new Set()) {
    if (n.type === 'var') set.add(n.name);
    if (n.a) collectVars(n.a, set);
    if (n.b) collectVars(n.b, set);
    return set;
  }
  /* Post-order list of distinct non-leaf sub-expressions: the "steps" of the truth table. */
  function subexpressions(ast) {
    const out = [];
    const seen = new Set();
    (function walk(n) {
      if (n.a) walk(n.a);
      if (n.b) walk(n.b);
      if (isLeaf(n)) return;
      const key = toStr(n);
      if (!seen.has(key)) { seen.add(key); out.push({ label: key, node: n }); }
    })(ast);
    return out;
  }

  function describe(n) {
    if (n.type === 'not') return 'NOT: inverts the value';
    if (n.type === 'bin') {
      const d = {
        AND: '1 only if both operands are 1', OR: '1 if at least one operand is 1', XOR: '1 if the operands differ',
        NAND: 'NOT AND: 0 only if both are 1', NOR: 'NOT OR: 1 only if both are 0', XNOR: '1 if the operands are equal',
        IMP: '0 only when the left is 1 and the right is 0', IFF: '1 if both sides have the same value',
      };
      return `${OP_NAME[n.op]}: ${d[n.op]}`;
    }
    return '';
  }

  /* ---------- Quine–McCluskey ---------- */
  function qm(minterms, n) {
    if (!minterms.length) return { primes: [], chosen: [], essential: [] };
    if (minterms.length === 1 << n) {
      const all = { bits: '-'.repeat(n), terms: minterms.slice() };
      return { primes: [all], chosen: [all], essential: [all] };
    }
    const primes = [];
    let current = minterms.map((m) => ({ bits: m.toString(2).padStart(n, '0'), terms: [m] }));
    while (current.length) {
      const next = new Map();
      const used = new Set();
      for (let i = 0; i < current.length; i++) {
        for (let j = i + 1; j < current.length; j++) {
          const a = current[i].bits, b = current[j].bits;
          let diff = -1, cnt = 0;
          for (let k = 0; k < n; k++) {
            if (a[k] !== b[k]) {
              if (a[k] === '-' || b[k] === '-') { cnt = 2; break; }
              cnt++; diff = k;
              if (cnt > 1) break;
            }
          }
          if (cnt === 1) {
            used.add(i); used.add(j);
            const bits = a.slice(0, diff) + '-' + a.slice(diff + 1);
            if (!next.has(bits)) next.set(bits, { bits, terms: Array.from(new Set(current[i].terms.concat(current[j].terms))).sort((x, y) => x - y) });
          }
        }
      }
      current.forEach((c, i) => {
        if (!used.has(i) && !primes.some((p) => p.bits === c.bits)) primes.push(c);
      });
      current = Array.from(next.values());
    }
    // Cover: essential prime implicants first, then greedy by coverage (ties → fewer literals).
    const chosen = [];
    const essential = [];
    minterms.forEach((m) => {
      const cov = primes.filter((p) => p.terms.includes(m));
      if (cov.length === 1 && !chosen.includes(cov[0])) { chosen.push(cov[0]); essential.push(cov[0]); }
    });
    const uncovered = new Set(minterms);
    chosen.forEach((p) => p.terms.forEach((t) => uncovered.delete(t)));
    while (uncovered.size) {
      let best = null, bestScore = -1;
      primes.forEach((p) => {
        if (chosen.includes(p)) return;
        const c = p.terms.filter((t) => uncovered.has(t)).length;
        const score = c * 100 + (p.bits.split('-').length - 1);
        if (c && score > bestScore) { best = p; bestScore = score; }
      });
      chosen.push(best);
      best.terms.forEach((t) => uncovered.delete(t));
    }
    return { primes, chosen, essential };
  }

  function implicantToSOP(bits, vars) {
    const single = vars.every((v) => v.length === 1);
    const lits = [];
    for (let k = 0; k < bits.length; k++) {
      if (bits[k] === '1') lits.push(vars[k]);
      else if (bits[k] === '0') lits.push(vars[k] + "'");
    }
    return lits.length ? lits.join(single ? '' : '·') : '1';
  }
  function implicantToPOSTerm(bits, vars) {
    // implicant of F' → sum term of F (complemented literals)
    const lits = [];
    for (let k = 0; k < bits.length; k++) {
      if (bits[k] === '1') lits.push(vars[k] + "'");
      else if (bits[k] === '0') lits.push(vars[k]);
    }
    return lits.length > 1 ? '(' + lits.join(' + ') + ')' : lits[0] || '0';
  }

  const MAX_VARS = 10;

  function analyze(src, opts = {}) {
    const tokens = tokenize(src, opts.singleLetter);
    const ast = parse(tokens);
    const vars = Array.from(collectVars(ast)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (vars.length > MAX_VARS) throw new BoolError(`Too many variables (${vars.length}). The limit is ${MAX_VARS} (${1 << MAX_VARS} rows).`, 0);
    const n = vars.length;
    const steps = subexpressions(ast);
    const rows = [];
    const minterms = [];
    const maxterms = [];
    for (let i = 0; i < 1 << n; i++) {
      const env = {};
      vars.forEach((v, j) => (env[v] = (i >> (n - 1 - j)) & 1));
      const values = steps.map((s) => evaluate(s.node, env));
      const out = evaluate(ast, env);
      rows.push({ index: i, env, values, out });
      (out ? minterms : maxterms).push(i);
    }
    const total = 1 << n;
    const classification = minterms.length === total ? 'Tautology' : minterms.length === 0 ? 'Contradiction' : 'Contingency';

    let minimalSOP = null, minimalPOS = null, qmResult = null;
    if (n <= 8) {
      qmResult = qm(minterms, n);
      minimalSOP = !minterms.length ? '0' : qmResult.chosen.map((p) => implicantToSOP(p.bits, vars)).join(' + ');
      const qmPos = qm(maxterms, n);
      minimalPOS = !maxterms.length ? '1' : qmPos.chosen.map((p) => implicantToPOSTerm(p.bits, vars)).join('');
    }
    const canonicalSOP = minterms.map((m) => implicantToSOP(m.toString(2).padStart(n, '0'), vars)).join(' + ') || '0';
    const canonicalPOS = maxterms.map((m) => implicantToPOSTerm(m.toString(2).padStart(n, '0'), vars)).join('') || '1';

    return { src, tokens, ast, vars, steps, rows, minterms, maxterms, classification, canonicalSOP, canonicalPOS, minimalSOP, minimalPOS, qm: qmResult, parenthesized: toStr(ast) };
  }

  function equivalent(srcA, srcB, opts) {
    const a = parse(tokenize(srcA, opts.singleLetter));
    const b = parse(tokenize(srcB, opts.singleLetter));
    const vars = Array.from(new Set([...collectVars(a), ...collectVars(b)])).sort();
    if (vars.length > MAX_VARS) throw new BoolError('Too many variables to compare.', 0);
    const n = vars.length;
    const counter = [];
    for (let i = 0; i < 1 << n; i++) {
      const env = {};
      vars.forEach((v, j) => (env[v] = (i >> (n - 1 - j)) & 1));
      const va = evaluate(a, env), vb = evaluate(b, env);
      if (va !== vb) counter.push({ env, va, vb });
    }
    return { equivalent: counter.length === 0, counter, vars, a: toStr(a), b: toStr(b) };
  }

  SH.bool = { tokenize, parse, evaluate, toStr, substituted, describe, analyze, equivalent, qm, implicantToSOP, BoolError, SYM, MAX_VARS };
})();
