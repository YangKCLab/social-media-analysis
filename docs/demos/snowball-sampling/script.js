// Snowball sampling demo.
// Deterministic frontier search over a keyword co-occurrence network: each round searches the
// keywords found in the previous round and adds every keyword that co-occurs with them.
(function () {
  'use strict';

  const DATA = window.SNOWBALL_DATA;
  const GRAPH = DATA.related;                 // keyword -> keywords that co-occur with it
  const ALL = Object.keys(GRAPH);
  const N = ALL.length;
  const LOOKUP = new Map(ALL.map(k => [k.toLowerCase(), k]));
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const $ = id => document.getElementById(id);
  const el = {
    chips: $('seedChips'), form: $('seedForm'), input: $('seedInput'), list: $('keywordList'), hint: $('seedHint'),
    next: $('nextBtn'), play: $('playBtn'), reset: $('resetBtn'), speed: $('speed'), speedValue: $('speedValue'),
    showHidden: $('showHidden'),
    statRound: $('statRound'), statTotal: $('statTotal'), statNew: $('statNew'), statLeft: $('statLeft'),
    plotTotal: $('plotTotal'), plotNew: $('plotNew'), export: $('exportBtn'),
    status: $('status'), svg: $('network'), detail: $('detail'),
  };
  const HINT_DEFAULT = 'Changing the seeds restarts the run.';
  const DETAIL_DEFAULT = 'Hover over a keyword to see what found it and what it co-occurs with. Click to pin.';

  const state = {
    seeds: DATA.defaultSeeds.slice(),
    round: 0,
    foundRound: new Map(),   // keyword -> round in which it was found (0 = seed)
    foundVia: new Map(),     // keyword -> keywords whose search found it
    frontier: [],            // keywords found in the previous round; searched in the next
    history: [],             // {round, total, added} per round; round 0 holds the seeds
    saturated: false,
    playing: false,
    timer: null,
    layout: null,
    nodes: new Map(),        // keyword -> <g class="node">
    edges: [],               // [{from, to, path}]
    pinned: null,
  };

  // ---------------------------------------------------------------- search
  function reset() {
    stopPlay();
    state.round = 0;
    state.foundRound = new Map(state.seeds.map(s => [s, 0]));
    state.foundVia = new Map(state.seeds.map(s => [s, []]));
    state.frontier = state.seeds.slice();
    state.history = [{ round: 0, total: state.seeds.length, added: state.seeds.length }];
    state.saturated = false;
    state.pinned = null;
    state.layout = computeLayout(state.seeds);
    buildNetwork();
    render();
  }

  function runRound() {
    if (state.saturated || state.seeds.length === 0) return;
    const round = state.round + 1;
    const added = [];
    for (const k of state.frontier) {
      for (const n of GRAPH[k]) {
        if (!state.foundRound.has(n)) {
          state.foundRound.set(n, round);
          state.foundVia.set(n, [k]);
          added.push(n);
        } else if (state.foundRound.get(n) === round) {
          state.foundVia.get(n).push(k);
        }
      }
    }
    state.round = round;
    state.frontier = added;
    state.history.push({ round, total: state.foundRound.size, added: added.length });
    if (added.length === 0) { state.saturated = true; stopPlay(); }
    render();
  }

  // ---------------------------------------------------------------- auto play
  function startPlay() {
    if (state.saturated || state.seeds.length === 0) return;
    state.playing = true;
    el.play.textContent = 'Pause';
    el.play.classList.add('playing');
    runRound();
    if (state.playing) schedule();
  }
  function schedule() {
    clearTimeout(state.timer);
    state.timer = setTimeout(() => { runRound(); if (state.playing) schedule(); }, Number(el.speed.value) * 1000);
  }
  function stopPlay() {
    state.playing = false;
    clearTimeout(state.timer);
    state.timer = null;
    el.play.textContent = 'Auto play';
    el.play.classList.remove('playing');
  }

  // ---------------------------------------------------------------- layout
  // Columns by distance from the seed set, which for this search equals the round of discovery.
  // Keywords with no path from the seeds go in extra "not reachable" columns on the right.
  const PITCH = 22, COLW = 236, PAD_X = 24, HEAD = 46, PAD_Y = 16, NODE_R = 6;

  function computeLayout(seeds) {
    const dist = new Map(seeds.map(s => [s, 0]));
    const parents = new Map(seeds.map(s => [s, []]));
    const columns = [seeds.slice()];
    let frontier = seeds.slice();
    while (frontier.length) {
      const next = [];
      for (const k of frontier) {
        for (const n of GRAPH[k]) {
          if (!dist.has(n)) { dist.set(n, columns.length); parents.set(n, [k]); next.push(n); }
          else if (dist.get(n) === columns.length) parents.get(n).push(k);
        }
      }
      if (next.length) columns.push(next);
      frontier = next;
    }
    // Order each column by the mean row of its parents, so edges stay short and cross less.
    const rowOf = new Map();
    columns[0].forEach((k, i) => rowOf.set(k, i));
    for (let c = 1; c < columns.length; c++) {
      const bary = k => parents.get(k).reduce((s, p) => s + rowOf.get(p), 0) / parents.get(k).length;
      columns[c].sort((a, b) => bary(a) - bary(b) || a.localeCompare(b));
      columns[c].forEach((k, i) => rowOf.set(k, i));
    }
    const unreachable = ALL.filter(k => !dist.has(k)).sort((a, b) => a.localeCompare(b));
    const maxReach = Math.max(...columns.map(c => c.length), 30);
    const extra = [];
    for (let i = 0; i < unreachable.length; i += maxReach) extra.push(unreachable.slice(i, i + maxReach));
    const allCols = columns.concat(extra);

    const maxRows = Math.max(...allCols.map(c => c.length), 12);
    const H = HEAD + maxRows * PITCH + PAD_Y;
    const W = PAD_X * 2 + allCols.length * COLW;
    const pos = new Map();
    allCols.forEach((col, c) => {
      const x = PAD_X + c * COLW + NODE_R + 4;
      const pitch = Math.min(PITCH * 3, (maxRows * PITCH) / Math.max(col.length, 1));
      const top = HEAD + (maxRows * PITCH - (col.length - 1) * pitch) / 2;
      col.forEach((k, i) => pos.set(k, { x, y: top + i * pitch, col: c }));
    });
    const edges = [];
    for (let c = 1; c < columns.length; c++) {
      for (const k of columns[c]) for (const p of parents.get(k)) edges.push({ from: p, to: k });
    }
    return { columns, unreachable, allCols, pos, edges, W, H };
  }

  // ---------------------------------------------------------------- network drawing
  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  }

  function buildNetwork() {
    const L = state.layout;
    const svg = el.svg;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${L.W} ${L.H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.remove('focused');

    const heads = svgEl('g', { class: 'heads' }, svg);
    L.allCols.forEach((col, c) => {
      const x = PAD_X + c * COLW;
      const isReach = c < L.columns.length;
      const first = c === L.columns.length;
      if (!isReach && !first) return;
      const g = svgEl('g', { class: isReach ? 'col' : 'col col-unreachable' }, heads);
      const label = c === 0 ? 'Seeds' : isReach ? `Round ${c}` : 'Not reachable';
      const t = svgEl('text', { class: 'col-head', x, y: 20, 'data-col': c }, g);
      t.textContent = label;
      const s = svgEl('text', { class: 'col-sub', x, y: 35, 'data-col': c }, g);
      s.textContent = isReach ? '' : 'no path from the seeds';
    });

    const edgeG = svgEl('g', { class: 'edges' }, svg);
    const nodeG = svgEl('g', { class: 'nodes' }, svg);
    state.nodes = new Map();
    for (const [k, p] of L.pos) {
      const g = svgEl('g', { class: 'node', transform: `translate(${p.x},${p.y})`, 'data-k': k }, nodeG);
      svgEl('circle', { r: NODE_R }, g);
      const t = svgEl('text', { x: NODE_R + 6, dy: '0.35em' }, g);
      t.textContent = k;
      g.addEventListener('mouseenter', () => { if (!state.pinned) focus(k); });
      g.addEventListener('mouseleave', () => { if (!state.pinned) unfocus(); });
      g.addEventListener('click', ev => { ev.stopPropagation(); state.pinned = state.pinned === k ? null : k; state.pinned ? focus(k) : unfocus(); });
      state.nodes.set(k, g);
    }
    // Edges start after the label text, so measure the labels first.
    const labelEnd = new Map();
    for (const [k, g] of state.nodes) {
      const t = g.querySelector('text');
      labelEnd.set(k, L.pos.get(k).x + NODE_R + 6 + t.getComputedTextLength());
    }
    state.edges = L.edges.map(e => {
      const a = L.pos.get(e.from), b = L.pos.get(e.to);
      const x0 = labelEnd.get(e.from) + 5, x1 = b.x - NODE_R - 3, mid = (x0 + x1) / 2;
      const path = svgEl('path', { class: 'edge', d: `M${x0},${a.y} C${mid},${a.y} ${mid},${b.y} ${x1},${b.y}` }, edgeG);
      return { from: e.from, to: e.to, path };
    });
  }

  function focus(k) {
    const lit = new Set([k]);
    for (const e of state.edges) {
      const on = e.from === k || e.to === k;
      e.path.classList.toggle('lit', on);
      if (on) { lit.add(e.from); lit.add(e.to); }
    }
    for (const [n, g] of state.nodes) g.classList.toggle('lit', lit.has(n));
    el.svg.classList.add('focused');
    el.detail.innerHTML = describe(k);
  }
  function unfocus() {
    el.svg.classList.remove('focused');
    for (const g of state.nodes.values()) g.classList.remove('lit');
    for (const e of state.edges) e.path.classList.remove('lit');
    el.detail.textContent = DETAIL_DEFAULT;
  }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function listOf(arr, max) {
    const shown = arr.slice(0, max).map(esc).join(', ');
    return arr.length > max ? `${shown}, … (${arr.length} in total)` : shown;
  }
  function describe(k) {
    const r = state.foundRound.get(k);
    const co = GRAPH[k];
    let head;
    if (r === 0) head = `<b>${esc(k)}</b> is a seed.`;
    else if (r !== undefined) head = `<b>${esc(k)}</b> was found in round ${r} by searching ${listOf(state.foundVia.get(k), 4)}.`;
    else if (state.layout.pos.get(k).col >= state.layout.columns.length) head = `<b>${esc(k)}</b> is not reachable: no keyword that can be found from these seeds co-occurs with it.`;
    else head = `<b>${esc(k)}</b> has not been found yet.`;
    const tail = co.length ? ` Co-occurs with ${listOf(co, 6)}.` : ' Nothing co-occurs with it.';
    return head + tail;
  }

  // ---------------------------------------------------------------- render
  function render() {
    const L = state.layout;
    const round = state.round;
    // nodes
    for (const [k, g] of state.nodes) {
      const r = state.foundRound.get(k);
      let cls;
      if (r === 0) cls = 'seed';
      else if (r === round && round > 0) cls = 'new';
      else if (r !== undefined) cls = 'found';
      else if (L.pos.get(k).col >= L.columns.length) cls = 'unreachable';
      else cls = 'hidden';
      g.setAttribute('class', `node ${cls}${g.classList.contains('lit') ? ' lit' : ''}`);
    }
    // edges: shown once the child is found; the ones found this round are stressed
    for (const e of state.edges) {
      const r = state.foundRound.get(e.to);
      e.path.style.display = r === undefined ? 'none' : '';
      e.path.classList.toggle('fresh', r === round && round > 0);
    }
    // column headers
    el.svg.querySelectorAll('.col-head').forEach(t => {
      const c = Number(t.dataset.col);
      t.classList.toggle('active', c < L.columns.length && c <= round);
    });
    el.svg.querySelectorAll('.col-sub').forEach(t => {
      const c = Number(t.dataset.col);
      if (c >= L.columns.length) return;
      const h = state.history[c];
      t.textContent = c <= round && h ? (c === 0 ? `${h.added} keyword${h.added === 1 ? '' : 's'}` : `${h.added} new`) : '';
    });
    el.svg.classList.toggle('hide-hidden', !el.showHidden.checked);

    // counts
    const total = state.foundRound.size;
    const last = state.history[state.history.length - 1];
    el.statRound.textContent = round;
    el.statTotal.textContent = total;
    el.statNew.textContent = round === 0 ? '–' : last.added;
    el.statLeft.textContent = N - total;

    // status
    const nSeeds = state.seeds.length;
    let status;
    if (nSeeds === 0) status = 'Add at least one seed keyword to start.';
    else if (round === 0) status = `Ready. Press <b>Next round</b> to search with the ${nSeeds} seed${nSeeds === 1 ? '' : 's'}.`;
    else if (state.saturated) {
      status = `Round ${round} found nothing new: <b>saturated</b> after ${round - 1} round${round - 1 === 1 ? '' : 's'} with ${total} of ${N} keywords.`;
      if (L.unreachable.length) status += ` ${L.unreachable.length} keyword${L.unreachable.length === 1 ? ' is' : 's are'} not reachable from these seeds.`;
    } else {
      const searched = state.history[round - 1].added;
      status = `Round ${round}: searched ${searched} keyword${searched === 1 ? '' : 's'}, found <b>${last.added} new</b>. ${total} of ${N} found.`;
    }
    el.status.innerHTML = status;
    el.status.classList.toggle('done', state.saturated);

    // controls
    const stop = state.saturated || nSeeds === 0;
    el.next.disabled = stop;
    el.play.disabled = stop && !state.playing;
    el.export.disabled = total === 0;

    if (state.pinned && state.nodes.has(state.pinned)) focus(state.pinned);
    else if (!el.svg.classList.contains('focused')) el.detail.textContent = DETAIL_DEFAULT;

    drawTotalPlot();
    drawNewPlot();
  }

  // ---------------------------------------------------------------- plots
  const PW = 300, PH = 132, PM = { t: 12, r: 10, b: 24, l: 34 };
  function plotFrame(svg, xMax, yMax, yTicks) {
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${PW} ${PH}`);
    const w = PW - PM.l - PM.r, h = PH - PM.t - PM.b;
    const g = svgEl('g', { transform: `translate(${PM.l},${PM.t})` }, svg);
    const x = v => (v / xMax) * w;
    const y = v => h - (v / yMax) * h;
    for (const v of yTicks) {
      svgEl('line', { class: 'grid', x1: 0, x2: w, y1: y(v), y2: y(v) }, g);
      const t = svgEl('text', { class: 'tick', x: -6, y: y(v), dy: '0.35em', 'text-anchor': 'end' }, g);
      t.textContent = v;
    }
    svgEl('line', { class: 'axis', x1: 0, x2: w, y1: h, y2: h }, g);
    for (let r = 0; r <= xMax; r++) {
      const t = svgEl('text', { class: 'tick', x: x(r), y: h + 12, 'text-anchor': 'middle' }, g);
      t.textContent = r;
    }
    const xl = svgEl('text', { class: 'tick', x: w / 2, y: h + 22, 'text-anchor': 'middle' }, g);
    xl.textContent = 'round';
    return { g, x, y, w, h };
  }
  function niceMax(v) {
    if (v <= 5) return 5;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  }

  function drawTotalPlot() {
    const xMax = Math.max(6, state.round + 1);
    const yMax = N * 1.06;  // the cap line at N is the top of the useful range
    const f = plotFrame(el.plotTotal, xMax, yMax, [0, Math.round(N / 2), N]);
    svgEl('line', { class: 'cap', x1: 0, x2: f.w, y1: f.y(N), y2: f.y(N) }, f.g);
    const cl = svgEl('text', { class: 'cap-label', x: f.w, y: f.y(N) - 4, 'text-anchor': 'end' }, f.g);
    cl.textContent = `all ${N} keywords`;
    const d = state.history.map((h, i) => `${i ? 'L' : 'M'}${f.x(h.round)},${f.y(h.total)}`).join(' ');
    svgEl('path', { class: 'line', d }, f.g);
    for (const h of state.history) {
      const c = svgEl('circle', { class: 'dot', cx: f.x(h.round), cy: f.y(h.total), r: 4 }, f.g);
      const t = svgEl('title', {}, c);
      t.textContent = `Round ${h.round}: ${h.total} keywords found`;
    }
  }

  function drawNewPlot() {
    const xMax = Math.max(6, state.round + 1);
    const yMax = niceMax(Math.max(...state.history.map(h => h.added), 10));
    const f = plotFrame(el.plotNew, xMax, yMax, [0, yMax / 2, yMax]);
    const bw = Math.min(18, (f.w / (xMax + 1)) * 0.7);
    for (const h of state.history) {
      const cls = h.round === 0 ? 'bar seed' : h.round === state.round ? 'bar' : 'bar past';
      const top = f.y(h.added), bottom = f.y(0);
      const r = svgEl('rect', { class: cls, x: f.x(h.round) - bw / 2, y: top, width: bw, height: Math.max(0, bottom - top), rx: 2 }, f.g);
      const t = svgEl('title', {}, r);
      t.textContent = h.round === 0 ? `${h.added} seed${h.added === 1 ? '' : 's'}` : `Round ${h.round}: ${h.added} new`;
    }
  }

  // ---------------------------------------------------------------- seeds UI
  function renderChips() {
    el.chips.innerHTML = '';
    for (const s of state.seeds) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = s;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = '×';
      b.setAttribute('aria-label', `Remove ${s}`);
      b.addEventListener('click', () => { state.seeds = state.seeds.filter(k => k !== s); hint(''); renderChips(); reset(); });
      chip.appendChild(b);
      el.chips.appendChild(chip);
    }
  }
  function hint(msg) {
    el.hint.textContent = msg || HINT_DEFAULT;
    el.hint.classList.toggle('warn', Boolean(msg));
  }
  function addSeed(raw) {
    const text = raw.trim();
    if (!text) return;
    const key = LOOKUP.get(text.toLowerCase());
    if (!key) { hint(`“${text}” is not in this demo's keyword network.`); return; }
    if (state.seeds.includes(key)) { hint(`“${key}” is already a seed.`); return; }
    state.seeds.push(key);
    hint('');
    el.input.value = '';
    renderChips();
    reset();
  }

  // ---------------------------------------------------------------- export
  function exportCsv() {
    const rows = [['keyword', 'round_found', 'found_via', 'co_occurs_with']];
    const found = Array.from(state.foundRound.entries()).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
    for (const [k, r] of found) rows.push([k, r, state.foundVia.get(k).join('; '), GRAPH[k].join('; ')]);
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `snowball-keywords-round-${state.round}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------------------------------------------------------------- wiring
  function init() {
    for (const k of ALL) { const o = document.createElement('option'); o.value = k; el.list.appendChild(o); }
    el.form.addEventListener('submit', ev => { ev.preventDefault(); addSeed(el.input.value); });
    el.next.addEventListener('click', () => { runRound(); if (state.playing) schedule(); });
    el.play.addEventListener('click', () => (state.playing ? stopPlay() : startPlay()));
    el.reset.addEventListener('click', reset);
    el.speed.addEventListener('input', () => { el.speedValue.textContent = el.speed.value; if (state.playing) schedule(); });
    el.showHidden.addEventListener('change', () => el.svg.classList.toggle('hide-hidden', !el.showHidden.checked));
    el.export.addEventListener('click', exportCsv);
    el.svg.addEventListener('click', () => { if (state.pinned) { state.pinned = null; unfocus(); } });
    document.addEventListener('keydown', ev => {
      if (ev.target === el.input) return;
      if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); runRound(); if (state.playing) schedule(); }
    });
    hint('');
    renderChips();
    reset();
  }

  init();
})();
