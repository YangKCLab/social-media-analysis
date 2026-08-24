// Snowball sampling demo.
// Deterministic frontier search over a keyword co-occurrence network: each round searches the
// keywords found in the previous round and adds every keyword that co-occurs with them.
// Two views draw the same run: "network" (rings by round, seeds in the centre) and "columns".
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
    showHidden: $('showHidden'), viewNetwork: $('viewNetwork'), viewColumns: $('viewColumns'),
    statRound: $('statRound'), statTotal: $('statTotal'), statNew: $('statNew'), statLeft: $('statLeft'),
    plotTotal: $('plotTotal'), plotNew: $('plotNew'), export: $('exportBtn'),
    status: $('status'), svg: $('network'), detail: $('detail'),
  };
  const HINT_DEFAULT = 'Changing the seeds restarts the run.';
  const DETAIL_DEFAULT = 'Hover over a keyword to see what found it and what it co-occurs with. Click to pin.';

  const state = {
    seeds: DATA.defaultSeeds.slice(),
    view: location.hash === '#columns' ? 'columns' : 'network',
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
    labelBox: new Map(),     // keyword -> label bounding box in drawing units
    captionBox: [],          // ring caption boxes, obstacles for the label collision pass
    edges: [],               // [{from, to, tree, path}]
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
    build();
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
  // Distance from the seed set equals the round of discovery for this search. Keywords with no
  // path from the seeds are "unreachable" and drawn apart from the rest.
  const NODE_R = 6;

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
    const unreachable = ALL.filter(k => !dist.has(k)).sort((a, b) => a.localeCompare(b));
    const colOf = new Map();
    columns.forEach((col, c) => col.forEach(k => colOf.set(k, c)));
    unreachable.forEach(k => colOf.set(k, -1));
    // Discovery edges: the searched keyword -> the keyword it found.
    const tree = [];
    for (let c = 1; c < columns.length; c++) {
      for (const k of columns[c]) for (const p of parents.get(k)) tree.push({ from: p, to: k });
    }
    // Every other co-occurrence pair, undirected and de-duplicated, for the faint background network.
    const treeKey = new Set(tree.map(e => e.from + ' ' + e.to));
    const seen = new Set();
    const co = [];
    for (const a of ALL) {
      for (const b of GRAPH[a]) {
        const key = a < b ? a + ' ' + b : b + ' ' + a;
        if (seen.has(key) || treeKey.has(a + ' ' + b) || treeKey.has(b + ' ' + a)) continue;
        seen.add(key);
        co.push({ from: a, to: b });
      }
    }
    return {
      columns, parents, unreachable, colOf, tree, co,
      col: columnGeometry(columns, parents, unreachable),
      net: networkGeometry(columns, parents, unreachable, colOf),
    };
  }

  // Columns view: one column per round, rows ordered by the mean row of the node's parents.
  function columnGeometry(columns, parents, unreachable) {
    const PITCH = 22, COLW = 236, PAD_X = 24, HEAD = 46, PAD_Y = 16;
    const ordered = columns.map(c => c.slice());
    const rowOf = new Map();
    ordered[0].forEach((k, i) => rowOf.set(k, i));
    for (let c = 1; c < ordered.length; c++) {
      const bary = k => parents.get(k).reduce((s, p) => s + rowOf.get(p), 0) / parents.get(k).length;
      ordered[c].sort((a, b) => bary(a) - bary(b) || a.localeCompare(b));
      ordered[c].forEach((k, i) => rowOf.set(k, i));
    }
    const chunk = Math.max(...ordered.map(c => c.length), 30);
    const extra = [];
    for (let i = 0; i < unreachable.length; i += chunk) extra.push(unreachable.slice(i, i + chunk));
    const allCols = ordered.concat(extra);
    const maxRows = Math.max(...allCols.map(c => c.length), 12);
    const H = HEAD + maxRows * PITCH + PAD_Y;
    const W = PAD_X * 2 + allCols.length * COLW;
    const pos = new Map();
    allCols.forEach((col, c) => {
      const x = PAD_X + c * COLW + NODE_R + 4;
      const pitch = Math.min(PITCH * 3, (maxRows * PITCH) / Math.max(col.length, 1));
      const top = HEAD + (maxRows * PITCH - (col.length - 1) * pitch) / 2;
      col.forEach((k, i) => pos.set(k, { x, y: top + i * pitch }));
    });
    return { pos, W, H, allCols, nReach: ordered.length, COLW, PAD_X };
  }

  // Network view: seeds in the centre, one elliptical ring per round. A node's angle starts at
  // the mean angle of its parents; nodes on a ring are then pushed apart until none overlap.
  function networkGeometry(columns, parents, unreachable, colOf) {
    const ASPECT = 1.45, GAP = 82, ARC = 26, PAD = 130;
    const angle = new Map();
    const ringIndex = new Map();
    const rings = [];
    const nSeeds = columns[0].length;
    rings.push(nSeeds > 1 ? Math.min(28 + 10 * nSeeds, 60) : 0);
    columns[0].forEach((k, i) => angle.set(k, Math.PI + (i * 2 * Math.PI) / nSeeds));
    for (let c = 1; c < columns.length; c++) {
      const n = columns[c].length;
      const r = Math.max(rings[c - 1] + GAP, ((n * ARC) / (2 * Math.PI)) * 1.15);
      rings.push(r);
      const target = new Map(columns[c].map(k => [k, circularMean(parents.get(k).map(p => angle.get(p)))]));
      const order = columns[c].slice().sort((a, b) => target.get(a) - target.get(b));
      const a = order.map(k => target.get(k));
      const minSep = Math.min(ARC / r, (2 * Math.PI) / n);
      for (let it = 0; it < 400; it++) {
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          let gap = a[j] - a[i];
          if (j === 0) gap += 2 * Math.PI;
          if (gap < minSep) { const d = (minSep - gap) / 2; a[i] -= d; a[j] += d; }
        }
        for (let i = 0; i < n; i++) a[i] += 0.03 * angleDiff(target.get(order[i]), a[i]);
      }
      order.forEach((k, i) => { angle.set(k, a[i]); ringIndex.set(k, i); });
    }
    const R = rings[rings.length - 1];
    const cx = PAD + R * ASPECT, cy = PAD * 0.4 + R;
    const pos = new Map();
    for (const [k, t] of angle) {
      const r = rings[colOf.get(k)];
      pos.set(k, { x: cx + Math.cos(t) * r * ASPECT, y: cy + Math.sin(t) * r });
    }
    let W = cx + R * ASPECT + PAD, H = cy + R + PAD * 0.4;
    // Unreachable keywords: a block of short columns to the right of the rings.
    let block = null;
    if (unreachable.length) {
      const PITCH = 20, COLW = 200, per = 30;
      const x0 = W - PAD + 60;
      const cols = Math.ceil(unreachable.length / per);
      const rows = Math.min(per, unreachable.length);
      const top = Math.max(60, cy - (rows * PITCH) / 2);
      unreachable.forEach((k, i) => pos.set(k, { x: x0 + Math.floor(i / per) * COLW + NODE_R, y: top + (i % per) * PITCH }));
      block = { x: x0, y: top - 26 };
      W = x0 + cols * COLW + 20;
      H = Math.max(H, top + rows * PITCH + 20);
    }
    return { pos, W, H, cx, cy, rings, ASPECT, block, ringIndex };
  }
  function circularMean(angles) {
    const x = angles.reduce((s, t) => s + Math.cos(t), 0);
    const y = angles.reduce((s, t) => s + Math.sin(t), 0);
    return Math.atan2(y, x);
  }
  function angleDiff(target, current) {
    let d = target - current;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }

  // ---------------------------------------------------------------- drawing
  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  }
  function text(parent, attrs, content) {
    const t = svgEl('text', attrs, parent);
    t.textContent = content;
    return t;
  }
  function title(parent, content) {
    const t = svgEl('title', {}, parent);
    t.textContent = content;
  }

  function build() {
    const L = state.layout;
    const net = state.view === 'network';
    const G = net ? L.net : L.col;
    const svg = el.svg;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${G.W} ${G.H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.remove('focused');
    svg.dataset.view = state.view;

    const guides = svgEl('g', { class: 'guides' }, svg);
    if (net) {
      G.rings.forEach((r, c) => {
        if (r > 0) svgEl('ellipse', { class: 'ring', cx: G.cx, cy: G.cy, rx: r * G.ASPECT, ry: r, 'data-col': c }, guides);
      });
      state.captionBox = [];
      G.rings.forEach((r, c) => {
        const y = r > 0 ? G.cy - r - 6 : G.cy - 16;
        const t = text(guides, { class: 'col-head', x: G.cx, y, 'text-anchor': 'middle', 'data-col': c }, c === 0 ? 'Seeds' : `Round ${c}`);
        const w = t.getComputedTextLength();
        state.captionBox.push({ x: G.cx - w / 2, y: y - 12, w, h: 14 });
      });
      if (G.block) {
        const g = svgEl('g', { class: 'col col-unreachable' }, guides);
        text(g, { class: 'col-head', x: G.block.x, y: G.block.y, 'data-col': -1 }, 'Not reachable');
        text(g, { class: 'col-sub', x: G.block.x, y: G.block.y + 15 }, 'no path from the seeds');
      }
    } else {
      G.allCols.forEach((col, c) => {
        const x = G.PAD_X + c * G.COLW;
        const isReach = c < G.nReach;
        if (!isReach && c !== G.nReach) return;
        const g = svgEl('g', { class: isReach ? 'col' : 'col col-unreachable' }, guides);
        text(g, { class: 'col-head', x, y: 20, 'data-col': isReach ? c : -1 }, c === 0 ? 'Seeds' : isReach ? `Round ${c}` : 'Not reachable');
        text(g, { class: 'col-sub', x, y: 35, 'data-col': isReach ? c : -1 }, isReach ? '' : 'no path from the seeds');
      });
    }

    const coG = svgEl('g', { class: 'co-edges' }, svg);
    const edgeG = svgEl('g', { class: 'edges' }, svg);
    const nodeG = svgEl('g', { class: 'nodes' }, svg);
    state.nodes = new Map();
    for (const [k, p] of G.pos) {
      const g = svgEl('g', { class: 'node', transform: `translate(${p.x},${p.y})`, 'data-k': k }, nodeG);
      svgEl('circle', { r: NODE_R }, g);
      const t = text(g, { x: NODE_R + 6, dy: '0.35em' }, k);
      if (net) placeLabel(t, k, G);
      g.addEventListener('mouseenter', () => { if (!state.pinned) focus(k); });
      g.addEventListener('mouseleave', () => { if (!state.pinned) unfocus(); });
      g.addEventListener('click', ev => { ev.stopPropagation(); state.pinned = state.pinned === k ? null : k; state.pinned ? focus(k) : unfocus(); });
      state.nodes.set(k, g);
    }
    // Label boxes, measured once: the collision pass and the column edge anchors need them.
    state.labelBox = new Map();
    for (const [k, g] of state.nodes) {
      const t = g.querySelector('text');
      const w = t.getComputedTextLength(), p = G.pos.get(k);
      const anchor = t.getAttribute('text-anchor') || 'start';
      const x = Number(t.getAttribute('x'));
      const dy = t.getAttribute('dy');
      const yOff = { '-0.9em': -12, '-2.1em': -27, '1.35em': 17, '2.55em': 33 }[dy] || 0;
      const left = anchor === 'start' ? p.x + x : anchor === 'end' ? p.x + x - w : p.x + x - w / 2;
      state.labelBox.set(k, { x: left, y: p.y + yOff - 7, w, h: 14, end: p.x + x + w });
    }

    const at = k => ({ k, ...G.pos.get(k) });
    const mkPath = (a, b, cls) => {
      let d;
      if (net) {
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        d = `M${a.x + ux * NODE_R},${a.y + uy * NODE_R} L${b.x - ux * NODE_R},${b.y - uy * NODE_R}`;
      } else {
        const x0 = state.labelBox.get(a.k).end + 5, x1 = b.x - NODE_R - 3, mid = (x0 + x1) / 2;
        d = `M${x0},${a.y} C${mid},${a.y} ${mid},${b.y} ${x1},${b.y}`;
      }
      return svgEl('path', { class: cls, d }, cls === 'edge' ? edgeG : coG);
    };
    state.edges = L.tree.map(e => ({ from: e.from, to: e.to, tree: true, path: mkPath(at(e.from), at(e.to), 'edge') }));
    if (net) {
      for (const e of L.co) state.edges.push({ from: e.from, to: e.to, tree: false, path: mkPath(at(e.from), at(e.to), 'co') });
    }
  }

  // Network labels sit on the side of the node that faces away from the centre.
  function placeLabel(t, k, G) {
    if (state.layout.colOf.get(k) < 0) return;
    const p = G.pos.get(k);
    const dx = (p.x - G.cx) / G.ASPECT, dy = p.y - G.cy;
    if (Math.hypot(dx, dy) < 1) return;
    const a = Math.atan2(dy, dx), c = Math.cos(a), s = Math.sin(a);
    if (Math.abs(c) < 0.35) {
      const second = (G.ringIndex.get(k) || 0) % 2 === 1;
      t.setAttribute('x', 0);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dy', s < 0 ? (second ? '-2.1em' : '-0.9em') : (second ? '2.55em' : '1.35em'));
    } else if (c < 0) {
      t.setAttribute('x', -(NODE_R + 6));
      t.setAttribute('text-anchor', 'end');
    }
  }

  // Hide labels that would overlap another visible label. Seeds win, then the newest keywords.
  function collideLabels() {
    const kept = (state.captionBox || []).slice();
    const rank = k => { const r = state.foundRound.get(k); return r === 0 ? -1 : r === state.round ? 0 : r; };
    const order = Array.from(state.nodes.keys())
      .filter(k => state.foundRound.has(k))
      .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    for (const k of order) {
      const b = state.labelBox.get(k);
      const hit = kept.some(o => b.x < o.x + o.w + 4 && o.x < b.x + b.w + 4 && b.y < o.y + o.h + 1 && o.y < b.y + b.h + 1);
      state.nodes.get(k).classList.toggle('nolabel', hit);
      if (!hit) kept.push(b);
    }
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
    else if (state.layout.colOf.get(k) < 0) head = `<b>${esc(k)}</b> is not reachable: no keyword that can be found from these seeds co-occurs with it.`;
    else head = `<b>${esc(k)}</b> has not been found yet.`;
    const tail = co.length ? ` Co-occurs with ${listOf(co, 6)}.` : ' Nothing co-occurs with it.';
    return head + tail;
  }

  // ---------------------------------------------------------------- render
  function render() {
    const L = state.layout;
    const round = state.round;
    for (const [k, g] of state.nodes) {
      const r = state.foundRound.get(k);
      let cls;
      if (r === 0) cls = 'seed';
      else if (r === round && round > 0) cls = 'new';
      else if (r !== undefined) cls = 'found';
      else if (L.colOf.get(k) < 0) cls = 'unreachable';
      else cls = 'hidden';
      g.setAttribute('class', `node ${cls}${g.classList.contains('lit') ? ' lit' : ''}`);
    }
    for (const e of state.edges) {
      if (e.tree) {
        const r = state.foundRound.get(e.to);
        e.path.style.display = r === undefined ? 'none' : '';
        e.path.classList.toggle('fresh', r === round && round > 0);
      } else {
        e.path.classList.toggle('on', state.foundRound.has(e.from) && state.foundRound.has(e.to));
      }
    }
    el.svg.querySelectorAll('.col-head').forEach(t => {
      const c = Number(t.dataset.col);
      t.classList.toggle('active', c >= 0 && c <= round);
    });
    el.svg.querySelectorAll('.ring').forEach(r => r.classList.toggle('active', Number(r.dataset.col) <= round));
    el.svg.querySelectorAll('.col-sub[data-col]').forEach(t => {
      const c = Number(t.dataset.col);
      if (c < 0) return;
      const h = state.history[c];
      t.textContent = c <= round && h ? (c === 0 ? `${h.added} keyword${h.added === 1 ? '' : 's'}` : `${h.added} new`) : '';
    });
    el.svg.classList.toggle('hide-hidden', !el.showHidden.checked);
    if (state.view === 'network') collideLabels();

    const total = state.foundRound.size;
    const last = state.history[state.history.length - 1];
    el.statRound.textContent = round;
    el.statTotal.textContent = total;
    el.statNew.textContent = round === 0 ? '–' : last.added;
    el.statLeft.textContent = N - total;

    const nSeeds = state.seeds.length;
    const reachable = N - L.unreachable.length;
    const reachNote = reachable === N
      ? `All ${N} keywords are reachable from these seeds.`
      : `${reachable} of ${N} keywords are reachable from these seeds; <b>${N - reachable} are not</b>.`;
    let status;
    if (nSeeds === 0) status = 'Add at least one seed keyword to start.';
    else if (round === 0) status = `Ready. Press <b>Next round</b> to search with the ${nSeeds} seed${nSeeds === 1 ? '' : 's'}. ${reachNote}`;
    else if (state.saturated) {
      status = `Round ${round} found nothing new: <b>saturated</b> after ${round - 1} round${round - 1 === 1 ? '' : 's'} with ${total} of ${N} keywords. ${reachNote}`;
    } else {
      const searched = state.history[round - 1].added;
      status = `Round ${round}: searched ${searched} keyword${searched === 1 ? '' : 's'}, found <b>${last.added} new</b>. ${total} of ${N} found.`;
    }
    el.status.innerHTML = status;
    el.status.classList.toggle('done', state.saturated);

    const stop = state.saturated || nSeeds === 0;
    el.next.disabled = stop;
    el.play.disabled = stop && !state.playing;
    el.export.disabled = total === 0;
    el.viewNetwork.classList.toggle('active', state.view === 'network');
    el.viewColumns.classList.toggle('active', state.view === 'columns');

    if (state.pinned && state.nodes.has(state.pinned)) focus(state.pinned);
    else if (!el.svg.classList.contains('focused')) el.detail.textContent = DETAIL_DEFAULT;

    drawTotalPlot();
    drawNewPlot();
  }

  function setView(view) {
    if (state.view === view) return;
    state.view = view;
    state.pinned = null;
    history.replaceState(null, '', view === 'columns' ? '#columns' : location.pathname + location.search);
    build();
    render();
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
      text(g, { class: 'tick', x: -6, y: y(v), dy: '0.35em', 'text-anchor': 'end' }, v);
    }
    svgEl('line', { class: 'axis', x1: 0, x2: w, y1: h, y2: h }, g);
    for (let r = 0; r <= xMax; r++) text(g, { class: 'tick', x: x(r), y: h + 12, 'text-anchor': 'middle' }, r);
    text(g, { class: 'tick', x: w / 2, y: h + 22, 'text-anchor': 'middle' }, 'round');
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
    const yMax = N * 1.06;
    const f = plotFrame(el.plotTotal, xMax, yMax, [0, Math.round(N / 2), N]);
    svgEl('line', { class: 'cap', x1: 0, x2: f.w, y1: f.y(N), y2: f.y(N) }, f.g);
    text(f.g, { class: 'cap-label', x: f.w, y: f.y(N) - 4, 'text-anchor': 'end' }, `all ${N} keywords`);
    const d = state.history.map((h, i) => `${i ? 'L' : 'M'}${f.x(h.round)},${f.y(h.total)}`).join(' ');
    svgEl('path', { class: 'line', d }, f.g);
    for (const h of state.history) {
      const c = svgEl('circle', { class: 'dot', cx: f.x(h.round), cy: f.y(h.total), r: 4 }, f.g);
      title(c, `Round ${h.round}: ${h.total} keywords found`);
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
      title(r, h.round === 0 ? `${h.added} seed${h.added === 1 ? '' : 's'}` : `Round ${h.round}: ${h.added} new`);
    }
  }

  // ---------------------------------------------------------------- seeds UI
  function renderChips() {
    document.querySelectorAll('.preset').forEach(b => {
      const set = b.dataset.seeds.split('|');
      b.classList.toggle('active', set.length === state.seeds.length && set.every(k => state.seeds.includes(k)));
    });
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
    const t = raw.trim();
    if (!t) return;
    const key = LOOKUP.get(t.toLowerCase());
    if (!key) { hint(`“${t}” is not in this demo's keyword network.`); return; }
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
    document.querySelectorAll('.preset').forEach(b => b.addEventListener('click', () => {
      state.seeds = b.dataset.seeds.split('|');
      hint('');
      renderChips();
      reset();
    }));
    el.next.addEventListener('click', () => { runRound(); if (state.playing) schedule(); });
    el.play.addEventListener('click', () => (state.playing ? stopPlay() : startPlay()));
    el.reset.addEventListener('click', reset);
    el.speed.addEventListener('input', () => { el.speedValue.textContent = el.speed.value; if (state.playing) schedule(); });
    el.showHidden.addEventListener('change', () => el.svg.classList.toggle('hide-hidden', !el.showHidden.checked));
    el.viewNetwork.addEventListener('click', () => setView('network'));
    el.viewColumns.addEventListener('click', () => setView('columns'));
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
