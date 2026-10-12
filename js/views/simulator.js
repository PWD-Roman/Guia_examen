/* Interactive Code / Logic Simulator: step-through visualizations of sorting,
   searching and stack/queue operations, plus tracing exercises. */
(function () {
  const SH = window.SH;
  SH.views = SH.views || {};

  let el, tab = 'sorting', playTimer = null;
  const sim = { algo: 'bubble', arr: [38, 27, 43, 3, 9, 82, 10, 55], frames: [], i: 0, speed: 600 };
  const search = { algo: 'binary', arr: [3, 9, 10, 27, 38, 43, 55, 82, 91], target: 43, frames: [], i: 0 };
  const ds = { stack: [], queue: [], log: [], next: 1 };
  let sortQuiz = null, dsQuiz = null;

  /* ================= Sorting frame generators ================= */
  const PSEUDO = {
    bubble: ['for i = 0 to n-2:', '  swapped = false', '  for j = 0 to n-2-i:', '    if a[j] > a[j+1]:', '      swap(a[j], a[j+1]); swapped = true', '  if not swapped: break  // already sorted'],
    selection: ['for i = 0 to n-2:', '  min = i', '  for j = i+1 to n-1:', '    if a[j] < a[min]: min = j', '  swap(a[i], a[min])'],
    insertion: ['for i = 1 to n-1:', '  key = a[i]; j = i - 1', '  while j >= 0 and a[j] > key:', '    a[j+1] = a[j]; j = j - 1   // shift right', '  a[j+1] = key'],
    merge: ['mergeSort(lo, hi):', '  if lo >= hi: return', '  mid = (lo + hi) / 2', '  mergeSort(lo, mid); mergeSort(mid+1, hi)', '  merge: compare left[i] with right[j]', '  write the smaller value into a[k]'],
    quick: ['quickSort(lo, hi):', '  if lo >= hi: return', '  pivot = a[hi]; i = lo', '  for j = lo to hi-1:', '    if a[j] < pivot: swap(a[i], a[j]); i++', '  swap(a[i], a[hi])  // pivot in final place', '  quickSort(lo, i-1); quickSort(i+1, hi)'],
  };
  const INFO = {
    bubble: 'Bubble sort · O(n²) average/worst, O(n) best (early exit) · O(1) space · stable',
    selection: 'Selection sort · O(n²) always · O(1) space · not stable · at most n−1 swaps',
    insertion: 'Insertion sort · O(n²) worst, O(n) best on sorted input · O(1) space · stable',
    merge: 'Merge sort · O(n log n) always · O(n) extra space · stable',
    quick: 'Quicksort (Lomuto partition) · O(n log n) average, O(n²) worst · O(log n) stack · not stable',
  };

  function makeRecorder(input) {
    const a = input.slice();
    const frames = [];
    const sorted = new Set();
    const st = { comps: 0, swaps: 0 };
    const snap = (o) =>
      frames.push({ arr: a.slice(), cmp: o.cmp || [], swp: o.swp || [], act: o.act || [], pivot: o.pivot ?? null, range: o.range || null, sorted: Array.from(sorted), line: o.line ?? -1, msg: o.msg, comps: st.comps, swaps: st.swaps });
    const allSorted = () => a.forEach((_, k) => sorted.add(k));
    return { a, frames, sorted, st, snap, allSorted };
  }

  const GEN = {
    bubble(input) {
      const { a, frames, sorted, st, snap, allSorted } = makeRecorder(input);
      const n = a.length;
      snap({ line: 0, msg: 'Repeatedly compare adjacent pairs and swap them if they are out of order. Each pass moves the largest remaining value to the end.' });
      for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        snap({ line: 1, msg: `Pass ${i + 1}: swapped = false` });
        for (let j = 0; j < n - 1 - i; j++) {
          st.comps++;
          snap({ cmp: [j, j + 1], line: 3, msg: `Compare a[${j}] = ${a[j]} with a[${j + 1}] = ${a[j + 1]}` });
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            st.swaps++;
            swapped = true;
            snap({ swp: [j, j + 1], line: 4, msg: `${a[j + 1]} > ${a[j]}, so swap them` });
          }
        }
        sorted.add(n - 1 - i);
        snap({ line: 2, msg: `End of pass ${i + 1}: ${a[n - 1 - i]} is now in its final position.` });
        if (!swapped) {
          allSorted();
          snap({ line: 5, msg: 'No swaps in this pass, so the array is sorted. Exit early (this is why the best case is O(n)).' });
          break;
        }
      }
      allSorted();
      snap({ msg: `Done! ${st.comps} comparisons, ${st.swaps} swaps.` });
      return frames;
    },
    selection(input) {
      const { a, frames, sorted, st, snap, allSorted } = makeRecorder(input);
      const n = a.length;
      snap({ line: 0, msg: 'Find the minimum of the unsorted part and swap it into position i.' });
      for (let i = 0; i < n - 1; i++) {
        let min = i;
        snap({ act: [min], line: 1, msg: `Pass ${i + 1}: assume the minimum is a[${i}] = ${a[i]}` });
        for (let j = i + 1; j < n; j++) {
          st.comps++;
          snap({ cmp: [j], act: [min], line: 3, msg: `Is a[${j}] = ${a[j]} < current min ${a[min]}?` });
          if (a[j] < a[min]) {
            min = j;
            snap({ act: [min], line: 3, msg: `Yes, so the new minimum is a[${min}] = ${a[min]}` });
          }
        }
        if (min !== i) {
          [a[i], a[min]] = [a[min], a[i]];
          st.swaps++;
          snap({ swp: [i, min], line: 4, msg: `Swap a[${i}] and a[${min}]: ${a[i]} goes to index ${i}` });
        } else snap({ act: [i], line: 4, msg: `a[${i}] is already the minimum; no swap needed` });
        sorted.add(i);
      }
      allSorted();
      snap({ msg: `Done! ${st.comps} comparisons, ${st.swaps} swaps.` });
      return frames;
    },
    insertion(input) {
      const { a, frames, sorted, st, snap, allSorted } = makeRecorder(input);
      const n = a.length;
      sorted.add(0);
      snap({ line: 0, msg: 'Grow a sorted prefix: take the next element (the key) and insert it into place by shifting larger elements right.' });
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        snap({ act: [i], line: 1, msg: `key = a[${i}] = ${key}` });
        while (j >= 0) {
          st.comps++;
          snap({ cmp: [j], act: [j + 1], line: 2, msg: `Is a[${j}] = ${a[j]} > key ${key}?` });
          if (a[j] <= key) break;
          a[j + 1] = a[j];
          st.swaps++;
          snap({ swp: [j, j + 1], line: 3, msg: `Yes, so shift ${a[j]} right to index ${j + 1}` });
          j--;
        }
        a[j + 1] = key;
        for (let k = 0; k <= i; k++) sorted.add(k);
        snap({ act: [j + 1], line: 4, msg: `Place key ${key} at index ${j + 1}. Indices 0..${i} are now sorted (relative to each other).` });
      }
      allSorted();
      snap({ msg: `Done! ${st.comps} comparisons, ${st.swaps} shifts.` });
      return frames;
    },
    merge(input) {
      const { a, frames, st, snap, allSorted } = makeRecorder(input);
      snap({ line: 0, msg: 'Divide the array in halves recursively, then merge the sorted halves.' });
      const rec = (lo, hi) => {
        if (lo >= hi) return;
        const mid = (lo + hi) >> 1;
        snap({ range: [lo, hi], line: 2, msg: `Split [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}]` });
        rec(lo, mid);
        rec(mid + 1, hi);
        const left = a.slice(lo, mid + 1);
        const right = a.slice(mid + 1, hi + 1);
        let i = 0, j = 0, k = lo;
        snap({ range: [lo, hi], line: 4, msg: `Merge [${left.join(', ')}] and [${right.join(', ')}]` });
        while (i < left.length && j < right.length) {
          st.comps++;
          const takeLeft = left[i] <= right[j];
          a[k] = takeLeft ? left[i++] : right[j++];
          st.swaps++;
          snap({ range: [lo, hi], swp: [k], line: 5, msg: `${takeLeft ? left[i - 1] + ' ≤ ' + right[j] : right[j - 1] + ' < ' + left[i]}: write ${a[k]} to a[${k}]` });
          k++;
        }
        while (i < left.length) { a[k] = left[i++]; st.swaps++; snap({ range: [lo, hi], swp: [k], line: 5, msg: `Copy remaining left value ${a[k]} to a[${k}]` }); k++; }
        while (j < right.length) { a[k] = right[j++]; st.swaps++; snap({ range: [lo, hi], swp: [k], line: 5, msg: `Copy remaining right value ${a[k]} to a[${k}]` }); k++; }
      };
      rec(0, a.length - 1);
      allSorted();
      snap({ msg: `Done! ${st.comps} comparisons, ${st.swaps} writes.` });
      return frames;
    },
    quick(input) {
      const { a, frames, sorted, st, snap, allSorted } = makeRecorder(input);
      snap({ line: 0, msg: 'Pick a pivot (the last element), partition smaller values to its left, then recurse on both sides.' });
      const rec = (lo, hi) => {
        if (lo > hi) return;
        if (lo === hi) { sorted.add(lo); snap({ range: [lo, hi], line: 1, msg: `Single element a[${lo}] = ${a[lo]} is in place` }); return; }
        const pivot = a[hi];
        let i = lo;
        snap({ range: [lo, hi], pivot: hi, line: 2, msg: `Partition [${lo}..${hi}] with pivot ${pivot}` });
        for (let j = lo; j < hi; j++) {
          st.comps++;
          snap({ range: [lo, hi], pivot: hi, cmp: [j], act: [i], line: 4, msg: `Is a[${j}] = ${a[j]} < pivot ${pivot}?  (i = ${i})` });
          if (a[j] < pivot) {
            if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; st.swaps++; snap({ range: [lo, hi], pivot: hi, swp: [i, j], line: 4, msg: `Yes: swap a[${i}] and a[${j}], then i = ${i + 1}` }); }
            else snap({ range: [lo, hi], pivot: hi, act: [i], line: 4, msg: `Yes: it is already at index i; i = ${i + 1}` });
            i++;
          }
        }
        [a[i], a[hi]] = [a[hi], a[i]];
        st.swaps++;
        sorted.add(i);
        snap({ range: [lo, hi], swp: [i, hi], line: 5, msg: `Place pivot ${pivot} at index ${i} (its final position)` });
        snap({ line: 6, msg: `Recurse on [${lo}..${i - 1}] and [${i + 1}..${hi}]` });
        rec(lo, i - 1);
        rec(i + 1, hi);
      };
      rec(0, a.length - 1);
      allSorted();
      snap({ msg: `Done! ${st.comps} comparisons, ${st.swaps} swaps.` });
      return frames;
    },
  };

  /* State after k outer passes (for the "predict the pass" exercise). */
  function afterPasses(algo, input, k) {
    const a = input.slice();
    const n = a.length;
    if (algo === 'bubble') {
      for (let i = 0; i < k; i++) for (let j = 0; j < n - 1 - i; j++) if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    } else if (algo === 'selection') {
      for (let i = 0; i < k; i++) {
        let m = i;
        for (let j = i + 1; j < n; j++) if (a[j] < a[m]) m = j;
        [a[i], a[m]] = [a[m], a[i]];
      }
    } else {
      for (let i = 1; i <= k; i++) {
        const key = a[i];
        let j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
      }
    }
    return a;
  }

  /* ================= Rendering ================= */
  function render() {
    stop();
    el.innerHTML = `
      <div class="page-head"><div><h1>Algorithm simulator</h1><p>Step through algorithms one operation at a time, then test yourself with tracing exercises.</p></div></div>
      <div class="tabs">
        <button class="tab ${tab === 'sorting' ? 'on' : ''}" data-tab="sorting">Sorting</button>
        <button class="tab ${tab === 'searching' ? 'on' : ''}" data-tab="searching">Array search</button>
        <button class="tab ${tab === 'ds' ? 'on' : ''}" data-tab="ds">Stack &amp; queue</button>
      </div>
      <div id="simBody"></div>`;
    SH.$$('[data-tab]', el).forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
    if (tab === 'sorting') renderSorting();
    else if (tab === 'searching') renderSearching();
    else renderDS();
  }

  const parseArray = (text) => {
    const nums = text.split(/[\s,;]+/).filter(Boolean).map(Number);
    if (nums.some((x) => !Number.isFinite(x))) throw new Error('Use numbers separated by commas.');
    if (nums.length < 2 || nums.length > 20) throw new Error('Use between 2 and 20 numbers.');
    return nums.map((x) => Math.round(x));
  };
  const randomArray = (n, sortedOut = false) => {
    const a = SH.shuffle(Array.from({ length: 99 }, (_, i) => i + 1)).slice(0, n);
    return sortedOut ? a.sort((x, y) => x - y) : a;
  };

  const controls = (prefix) => `
    <div class="row mt">
      <button class="btn btn-sm" id="${prefix}Reset" title="Back to start">⟲ Reset</button>
      <button class="btn btn-sm" id="${prefix}Back" title="Step back">◀ Step</button>
      <button class="btn btn-sm btn-primary" id="${prefix}Play">▶ Play</button>
      <button class="btn btn-sm" id="${prefix}Fwd" title="Step forward">Step ▶</button>
      <input type="range" id="${prefix}Scrub" min="0" max="0" value="0" style="flex:1;min-width:120px">
      <span class="small muted mono" id="${prefix}Count"></span>
      <label class="small row" style="gap:6px">Speed <input type="range" id="${prefix}Speed" min="80" max="1500" step="20" value="${1580 - sim.speed}" style="width:90px"></label>
    </div>`;

  function bindControls(prefix, state, draw) {
    const q = (id) => SH.$('#' + prefix + id, el);
    const update = () => {
      q('Scrub').max = state.frames.length - 1;
      q('Scrub').value = state.i;
      q('Count').textContent = `${state.i + 1} / ${state.frames.length}`;
      draw();
    };
    q('Reset').addEventListener('click', () => { stop(); state.i = 0; update(); });
    q('Back').addEventListener('click', () => { stop(); state.i = Math.max(0, state.i - 1); update(); });
    q('Fwd').addEventListener('click', () => { stop(); state.i = Math.min(state.frames.length - 1, state.i + 1); update(); });
    q('Scrub').addEventListener('input', (e) => { stop(); state.i = +e.target.value; update(); });
    q('Speed').addEventListener('input', (e) => { sim.speed = 1580 - +e.target.value; if (playTimer) { stop(); play(); } });
    const play = () => {
      if (state.i >= state.frames.length - 1) state.i = 0;
      q('Play').textContent = '⏸ Pause';
      playTimer = setInterval(() => {
        if (state.i >= state.frames.length - 1) { stop(); return; }
        state.i++;
        update();
      }, sim.speed);
    };
    q('Play').addEventListener('click', () => (playTimer ? stop() : play()));
    state.stopUI = () => { const b = q('Play'); if (b) b.textContent = '▶ Play'; };
    update();
  }

  function stop() {
    if (playTimer) clearInterval(playTimer);
    playTimer = null;
    [sim, search].forEach((s) => s.stopUI && s.stopUI());
  }

  /* ---------- Sorting tab ---------- */
  function renderSorting() {
    const body = SH.$('#simBody', el);
    sim.frames = GEN[sim.algo](sim.arr);
    sim.i = 0;
    body.innerHTML = `
      <div class="card">
        <div class="row">
          <label class="field" style="min-width:170px">Algorithm
            <select id="algo">${Object.keys(GEN).map((k) => `<option value="${k}" ${k === sim.algo ? 'selected' : ''}>${k[0].toUpperCase() + k.slice(1)} sort</option>`).join('')}</select></label>
          <label class="field" style="flex:1;min-width:220px">Array (comma separated)
            <input type="text" id="arrIn" class="mono" value="${sim.arr.join(', ')}"></label>
          <div class="row" style="align-self:flex-end">
            <button class="btn" id="applyArr">Apply</button>
            <button class="btn" id="randArr">🎲 Random</button>
            <button class="btn btn-ghost" id="worstArr" title="Reverse-sorted input">Worst case</button>
          </div>
        </div>
        <p class="small muted mt-sm">${INFO[sim.algo]}</p>
        <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px" id="sortGrid">
          <div>
            <div class="bars" id="bars"></div>
            <div class="legend"><span><i style="background:var(--warn)"></i>Comparing</span><span><i style="background:var(--bad)"></i>Swap / write</span><span><i style="background:var(--accent)"></i>Key / min / i</span><span><i style="background:var(--violet)"></i>Pivot</span><span><i style="background:var(--ok)"></i>Sorted</span></div>
          </div>
          <div>
            <div class="pseudo" id="pseudo"></div>
            <div class="row mt-sm small"><span class="badge">Comparisons: <strong id="cmpCount">0</strong></span><span class="badge">Swaps / writes: <strong id="swpCount">0</strong></span></div>
          </div>
        </div>
        <div class="sim-msg mt" id="simMsg"></div>
        ${controls('s')}
      </div>
      <div class="card mt" id="sortQuiz"></div>`;

    const draw = () => {
      const f = sim.frames[sim.i];
      const max = Math.max(...f.arr, 1);
      SH.$('#bars', body).innerHTML = f.arr
        .map((v, k) => {
          let cls = '';
          if (f.sorted.includes(k)) cls = 'sorted';
          if (f.act.includes(k)) cls = 'active';
          if (f.cmp.includes(k)) cls = 'compare';
          if (f.pivot === k) cls = 'pivot';
          if (f.swp.includes(k)) cls = 'swap';
          if (f.range && (k < f.range[0] || k > f.range[1])) cls += ' dim';
          return `<div class="bar-col"><div class="bar-val">${v}</div><div class="bar ${cls}" style="height:${Math.max(4, (v / max) * 82)}%"></div><div class="bar-idx">${k}</div></div>`;
        })
        .join('');
      SH.$('#pseudo', body).innerHTML = PSEUDO[sim.algo].map((l, k) => `<div class="${k === f.line ? 'on' : ''}">${SH.esc(l)}</div>`).join('');
      SH.$('#simMsg', body).textContent = f.msg;
      SH.$('#cmpCount', body).textContent = f.comps;
      SH.$('#swpCount', body).textContent = f.swaps;
    };
    bindControls('s', sim, draw);

    SH.$('#algo', body).addEventListener('change', (e) => { sim.algo = e.target.value; stop(); renderSorting(); });
    SH.$('#applyArr', body).addEventListener('click', () => {
      try { sim.arr = parseArray(SH.$('#arrIn', body).value); stop(); renderSorting(); } catch (e) { SH.toast(e.message, 'bad'); }
    });
    SH.$('#randArr', body).addEventListener('click', () => { sim.arr = randomArray(8 + Math.floor(Math.random() * 5)); stop(); renderSorting(); });
    SH.$('#worstArr', body).addEventListener('click', () => { sim.arr = randomArray(8, true).reverse(); stop(); renderSorting(); });
    if (window.innerWidth < 860) SH.$('#sortGrid', body).style.gridTemplateColumns = '1fr';
    renderSortQuiz();
  }

  function newSortQuiz() {
    const algos = ['bubble', 'selection', 'insertion'];
    const algo = algos[Math.floor(Math.random() * algos.length)];
    const arr = randomArray(6).map((x) => Math.ceil(x / 3));
    const uniq = Array.from(new Set(arr));
    while (uniq.length < 6) { const v = 1 + Math.floor(Math.random() * 40); if (!uniq.includes(v)) uniq.push(v); }
    const k = 1 + Math.floor(Math.random() * 2);
    sortQuiz = { algo, arr: uniq, k, answer: afterPasses(algo, uniq, k), result: null };
  }

  function renderSortQuiz() {
    if (!sortQuiz) newSortQuiz();
    const host = SH.$('#sortQuiz', el);
    const q = sortQuiz;
    host.innerHTML = `
      <div class="card-head"><h3>✍ Tracing exercise: predict the pass</h3><button class="btn btn-sm" id="sqNew">↻ New exercise</button></div>
      <p>Apply <strong>${q.algo} sort</strong> (ascending) to the array below. What does it look like after <strong>${q.k} complete pass${q.k > 1 ? 'es' : ''}</strong> of the outer loop?</p>
      <div class="result-pill">[${q.arr.join(', ')}]</div>
      <p class="small muted mt-sm">${q.algo === 'bubble' ? 'One pass = one full sweep of adjacent compare-and-swaps.' : q.algo === 'selection' ? 'One pass = find the minimum of the unsorted part and swap it to the front of that part.' : 'Pass 1 inserts a[1] into the sorted prefix, pass 2 inserts a[2], and so on.'}</p>
      <div class="row mt-sm">
        <input type="text" id="sqIn" class="mono" placeholder="e.g. 3, 5, 1, ..." style="flex:1;min-width:200px" ${q.result ? 'disabled' : ''}>
        ${q.result ? '' : '<button class="btn btn-primary" id="sqCheck">Check</button>'}
        <button class="btn btn-ghost" id="sqShow">Watch it in the simulator</button>
      </div>
      ${q.result ? `<div class="feedback ${q.result.ok ? 'ok' : 'bad'}"><div class="feedback-title">${q.result.ok ? '✓ Correct!' : '✗ Not quite.'}</div>Expected: <code>[${q.answer.join(', ')}]</code>${q.result.ok ? '' : ` · You wrote: <code>[${SH.esc(q.result.given)}]</code>`}</div>` : ''}`;

    SH.$('#sqNew', host).addEventListener('click', () => { newSortQuiz(); renderSortQuiz(); });
    SH.$('#sqShow', host).addEventListener('click', () => { sim.algo = q.algo; sim.arr = q.arr.slice(); renderSorting(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    const check = () => {
      let given;
      try { given = parseArray(SH.$('#sqIn', host).value); } catch (e) { return SH.toast(e.message, 'bad'); }
      const ok = given.length === q.answer.length && given.every((v, i) => v === q.answer[i]);
      q.result = { ok, given: given.join(', ') };
      SH.store.recordAnswer({ id: 'tool-sort-trace', topic: 'algo', sub: 'Sorting', type: 'tool' }, ok, 'tool');
      renderSortQuiz();
    };
    const c = SH.$('#sqCheck', host);
    if (c) {
      c.addEventListener('click', check);
      SH.$('#sqIn', host).addEventListener('keydown', (e) => e.key === 'Enter' && check());
    }
  }

  /* ---------- Searching tab ---------- */
  const SEARCH_PSEUDO = {
    binary: ['lo = 0; hi = n - 1', 'while lo <= hi:', '  mid = (lo + hi) // 2', '  if a[mid] == target: return mid', '  if a[mid] < target: lo = mid + 1', '  else: hi = mid - 1', 'return -1  // not found'],
    linear: ['for i = 0 to n-1:', '  if a[i] == target: return i', 'return -1  // not found'],
  };

  function searchFrames(algo, a, target) {
    const frames = [];
    let steps = 0;
    if (algo === 'linear') {
      frames.push({ line: 0, msg: `Scan left to right looking for ${target}. O(n), and it works on unsorted data.` });
      for (let i = 0; i < a.length; i++) {
        steps++;
        if (a[i] === target) {
          frames.push({ cur: i, found: i, line: 1, steps, msg: `a[${i}] = ${a[i]} == ${target}. Found at index ${i} after ${steps} comparison(s).` });
          return frames;
        }
        frames.push({ cur: i, line: 1, steps, msg: `a[${i}] = ${a[i]} ≠ ${target}, so move on` });
      }
      frames.push({ line: 2, steps, msg: `${target} is not in the array (${steps} comparisons).` });
      return frames;
    }
    let lo = 0, hi = a.length - 1;
    frames.push({ lo, hi, line: 0, msg: `The array must be sorted. Search window: [${lo}..${hi}]` });
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      steps++;
      frames.push({ lo, hi, mid, line: 2, steps, msg: `mid = (${lo} + ${hi}) // 2 = ${mid}, a[mid] = ${a[mid]}` });
      if (a[mid] === target) {
        frames.push({ lo, hi, mid, found: mid, line: 3, steps, msg: `a[${mid}] == ${target}. Found after ${steps} step(s); a linear scan could need up to ${a.length}.` });
        return frames;
      }
      if (a[mid] < target) {
        frames.push({ lo, hi, mid, line: 4, steps, msg: `${a[mid]} < ${target}: discard the left half, so lo = ${mid + 1}` });
        lo = mid + 1;
      } else {
        frames.push({ lo, hi, mid, line: 5, steps, msg: `${a[mid]} > ${target}: discard the right half, so hi = ${mid - 1}` });
        hi = mid - 1;
      }
    }
    frames.push({ lo, hi, line: 6, steps, msg: `lo (${lo}) > hi (${hi}): ${target} is not present. ${steps} steps ≈ log₂(${a.length}) = ${Math.log2(a.length).toFixed(1)}` });
    return frames;
  }

  function renderSearching() {
    const body = SH.$('#simBody', el);
    if (search.algo === 'binary') search.arr = search.arr.slice().sort((x, y) => x - y);
    search.frames = searchFrames(search.algo, search.arr, search.target);
    search.i = 0;
    body.innerHTML = `
      <div class="card">
        <div class="row">
          <label class="field" style="min-width:160px">Algorithm
            <select id="salgo"><option value="binary" ${search.algo === 'binary' ? 'selected' : ''}>Binary search</option><option value="linear" ${search.algo === 'linear' ? 'selected' : ''}>Linear search</option></select></label>
          <label class="field" style="flex:1;min-width:200px">Array ${search.algo === 'binary' ? '(sorted automatically)' : ''}
            <input type="text" id="sarr" class="mono" value="${search.arr.join(', ')}"></label>
          <label class="field" style="width:110px">Target<input type="number" id="starget" value="${search.target}"></label>
          <div class="row" style="align-self:flex-end"><button class="btn" id="sApply">Apply</button><button class="btn" id="sRand">🎲 Random</button></div>
        </div>
        <p class="small muted mt-sm">${search.algo === 'binary' ? 'Binary search · O(log n) time · O(1) space · requires sorted data with random access' : 'Linear search · O(n) time · O(1) space · works on any data'}</p>
        <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px" id="searchGrid">
          <div><div class="cells" id="cells"></div>
            <div class="legend"><span><i style="background:var(--accent)"></i>Search window / current</span><span><i style="background:var(--warn)"></i>mid</span><span><i style="background:var(--ok)"></i>Found</span></div></div>
          <div class="pseudo" id="spseudo"></div>
        </div>
        <div class="sim-msg mt" id="smsg"></div>
        ${controls('q')}
      </div>`;

    const draw = () => {
      const f = search.frames[search.i];
      SH.$('#cells', body).innerHTML = search.arr
        .map((v, k) => {
          const cls = [];
          if (f.lo !== undefined) cls.push(k >= f.lo && k <= f.hi ? 'in-range' : 'out');
          if (f.mid === k) cls.push('mid');
          if (f.cur === k) cls.push('cur');
          if (f.found === k) cls.push('found');
          const ptr = [f.lo === k ? 'lo' : '', f.mid === k ? 'mid' : '', f.hi === k ? 'hi' : '', f.cur === k ? 'i' : ''].filter(Boolean).join(' ');
          return `<div class="cell ${cls.join(' ')}"><div class="cp">${ptr}</div><div class="cv">${v}</div><div class="ci">${k}</div></div>`;
        })
        .join('');
      SH.$('#spseudo', body).innerHTML = SEARCH_PSEUDO[search.algo].map((l, k) => `<div class="${k === f.line ? 'on' : ''}">${SH.esc(l)}</div>`).join('');
      SH.$('#smsg', body).textContent = f.msg;
    };
    bindControls('q', search, draw);
    if (window.innerWidth < 860) SH.$('#searchGrid', body).style.gridTemplateColumns = '1fr';

    SH.$('#salgo', body).addEventListener('change', (e) => { search.algo = e.target.value; stop(); renderSearching(); });
    SH.$('#sApply', body).addEventListener('click', () => {
      try {
        search.arr = parseArray(SH.$('#sarr', body).value);
        search.target = Math.round(+SH.$('#starget', body).value);
        stop();
        renderSearching();
      } catch (e) { SH.toast(e.message, 'bad'); }
    });
    SH.$('#sRand', body).addEventListener('click', () => {
      search.arr = randomArray(12, search.algo === 'binary');
      search.target = Math.random() < 0.8 ? search.arr[Math.floor(Math.random() * search.arr.length)] : 100;
      stop();
      renderSearching();
    });
  }

  /* ---------- Stack & Queue tab ---------- */
  function renderDS() {
    const body = SH.$('#simBody', el);
    body.innerHTML = `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-head"><h3>Stack (LIFO)</h3><span class="badge">push / pop / peek: O(1)</span></div>
          <div class="ds-stage" style="align-items:flex-end"><div class="stack-vis" id="stackVis"></div></div>
          <div class="row mt">
            <input type="text" id="stackIn" class="mono" placeholder="value" style="width:110px">
            <button class="btn btn-primary btn-sm" id="push">push</button>
            <button class="btn btn-sm" id="pop">pop</button>
            <button class="btn btn-sm" id="peek">peek</button>
            <button class="btn btn-sm btn-ghost" id="sClear">clear</button>
          </div>
          <p class="small muted mt-sm">Used for function call stacks, undo/redo, DFS, expression parsing and bracket matching.</p>
        </div>
        <div class="card">
          <div class="card-head"><h3>Queue (FIFO)</h3><span class="badge">enqueue / dequeue: O(1)</span></div>
          <div class="ds-stage" style="align-items:center"><div class="queue-vis" id="queueVis"></div></div>
          <div class="row mt">
            <input type="text" id="queueIn" class="mono" placeholder="value" style="width:110px">
            <button class="btn btn-primary btn-sm" id="enq">enqueue</button>
            <button class="btn btn-sm" id="deq">dequeue</button>
            <button class="btn btn-sm" id="front">front</button>
            <button class="btn btn-sm btn-ghost" id="qClear">clear</button>
          </div>
          <p class="small muted mt-sm">Used for BFS, task scheduling, print queues, message buffers and rate limiting.</p>
        </div>
      </div>
      <div class="card mt"><div class="card-head"><h3>Operation log</h3><button class="btn btn-sm btn-ghost" id="logClear">Clear log</button></div><div class="log" id="dsLog"></div></div>
      <div class="card mt" id="dsQuiz"></div>`;

    const log = (s) => { ds.log.push(s); drawDS(); };
    const valOf = (id) => {
      const inp = SH.$(id, body);
      const v = inp.value.trim() || String(ds.next++);
      inp.value = '';
      inp.focus();
      return v.slice(0, 6);
    };
    SH.$('#push', body).addEventListener('click', () => { const v = valOf('#stackIn'); ds.stack.push(v); log(`stack.push(${v})  → [${ds.stack.join(', ')}]`); });
    SH.$('#pop', body).addEventListener('click', () => { if (!ds.stack.length) return log('stack.pop()  → ⚠ underflow: the stack is empty'); const v = ds.stack.pop(); log(`stack.pop()  → returns ${v}`); });
    SH.$('#peek', body).addEventListener('click', () => log(ds.stack.length ? `stack.peek() → ${ds.stack[ds.stack.length - 1]} (not removed)` : 'stack.peek() → empty'));
    SH.$('#sClear', body).addEventListener('click', () => { ds.stack = []; log('stack cleared'); });
    SH.$('#enq', body).addEventListener('click', () => { const v = valOf('#queueIn'); ds.queue.push(v); log(`queue.enqueue(${v}) → [${ds.queue.join(', ')}]`); });
    SH.$('#deq', body).addEventListener('click', () => { if (!ds.queue.length) return log('queue.dequeue() → ⚠ the queue is empty'); const v = ds.queue.shift(); log(`queue.dequeue() → returns ${v}`); });
    SH.$('#front', body).addEventListener('click', () => log(ds.queue.length ? `queue.front() → ${ds.queue[0]}` : 'queue.front() → empty'));
    SH.$('#qClear', body).addEventListener('click', () => { ds.queue = []; log('queue cleared'); });
    SH.$('#logClear', body).addEventListener('click', () => { ds.log = []; drawDS(); });
    SH.$('#stackIn', body).addEventListener('keydown', (e) => e.key === 'Enter' && SH.$('#push', body).click());
    SH.$('#queueIn', body).addEventListener('keydown', (e) => e.key === 'Enter' && SH.$('#enq', body).click());
    drawDS();
    renderDSQuiz();
  }

  function drawDS() {
    const sv = SH.$('#stackVis', el);
    if (!sv) return;
    sv.innerHTML = ds.stack.length
      ? ds.stack.map((v, i) => `<div class="ds-item ${i === ds.stack.length - 1 ? 'top' : ''}">${SH.esc(v)}${i === ds.stack.length - 1 ? '<span class="ds-tag" style="top:auto;left:auto;right:-46px;bottom:10px">← top</span>' : ''}</div>`).join('')
      : '<div class="muted small" style="text-align:center">empty</div>';
    SH.$('#queueVis', el).innerHTML = ds.queue.length
      ? ds.queue.map((v, i) => `<div class="ds-item ${i === 0 ? 'top' : ''}" style="margin-top:14px">${i === 0 ? '<span class="ds-tag">front</span>' : i === ds.queue.length - 1 ? '<span class="ds-tag">rear</span>' : ''}${SH.esc(v)}</div>`).join('')
      : '<div class="muted small">empty</div>';
    const lg = SH.$('#dsLog', el);
    lg.innerHTML = ds.log.length ? ds.log.map((l) => `<div>${SH.esc(l)}</div>`).join('') : '<div style="opacity:.6">Operations will appear here.</div>';
    lg.scrollTop = lg.scrollHeight;
  }

  function newDSQuiz() {
    const kind = Math.random() < 0.5 ? 'stack' : 'queue';
    const ops = [];
    const sim2 = [];
    let next = 1;
    const count = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      if (sim2.length && Math.random() < 0.38) {
        ops.push(kind === 'stack' ? 'pop()' : 'dequeue()');
        kind === 'stack' ? sim2.pop() : sim2.shift();
      } else {
        const v = next++ * 10;
        ops.push(kind === 'stack' ? `push(${v})` : `enqueue(${v})`);
        sim2.push(v);
      }
    }
    dsQuiz = { kind, ops, answer: sim2, result: null };
  }

  function renderDSQuiz() {
    if (!dsQuiz) newDSQuiz();
    const host = SH.$('#dsQuiz', el);
    const q = dsQuiz;
    const order = q.kind === 'stack' ? 'bottom → top' : 'front → rear';
    host.innerHTML = `
      <div class="card-head"><h3>✍ Tracing exercise: final ${q.kind} state</h3><button class="btn btn-sm" id="dqNew">↻ New exercise</button></div>
      <p>Starting from an empty <strong>${q.kind}</strong>, apply these operations in order:</p>
      ${SH.codeBlock(q.ops.map((o) => `${q.kind === 'stack' ? 's' : 'q'}.${o}`).join('\n'), 'js')}
      <p class="small muted">Write the remaining elements from <strong>${order}</strong>, comma separated (leave empty if none).</p>
      <div class="row">
        <input type="text" id="dqIn" class="mono" placeholder="e.g. 10, 30" style="flex:1;min-width:200px" ${q.result ? 'disabled' : ''}>
        ${q.result ? '' : '<button class="btn btn-primary" id="dqCheck">Check</button>'}
      </div>
      ${q.result ? `<div class="feedback ${q.result.ok ? 'ok' : 'bad'}"><div class="feedback-title">${q.result.ok ? '✓ Correct!' : '✗ Not quite.'}</div>Expected (${order}): <code>[${q.answer.join(', ')}]</code>. ${q.kind === 'stack' ? 'pop() removes the most recently pushed element.' : 'dequeue() removes the oldest element.'}</div>` : ''}`;
    SH.$('#dqNew', host).addEventListener('click', () => { newDSQuiz(); renderDSQuiz(); });
    const check = () => {
      const given = SH.$('#dqIn', host).value.split(/[\s,;]+/).filter(Boolean).map(Number);
      const ok = given.length === q.answer.length && given.every((v, i) => v === q.answer[i]);
      q.result = { ok };
      SH.store.recordAnswer({ id: 'tool-ds-trace', topic: 'algo', sub: 'Data Structures', type: 'tool' }, ok, 'tool');
      renderDSQuiz();
    };
    const c = SH.$('#dqCheck', host);
    if (c) {
      c.addEventListener('click', check);
      SH.$('#dqIn', host).addEventListener('keydown', (e) => e.key === 'Enter' && check());
    }
  }

  SH.views.simulator = {
    title: 'Algorithm Simulator',
    render(root, params) {
      el = root;
      if (params.tab) { tab = params.tab; SH.cleanHash('simulator'); }
      render();
    },
    destroy: stop,
  };
})();
