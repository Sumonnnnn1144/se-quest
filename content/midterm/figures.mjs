// Diagrams drawn for SE Quest. They carry the same knowledge as the lecture slides but are our own work,
// so no slide images ship with the site. Each one renders per language; lesson cards reference them with fig=<name>.
// SVGs use a narrow viewBox on purpose, so labels stay readable at phone width.

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function svg(w, h, alt, body) {
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(alt)}">${body}</svg>`;
}
// Multi-line text: lines split on \n, centred on y.
function text(x, y, s, cls = 't', anchor = 'middle', lh = 13) {
  const lines = String(s).split('\n'), y0 = y - (lines.length - 1) * lh / 2 + 4;
  return `<text x="${x}" y="${y0}" class="${cls}" text-anchor="${anchor}">${lines.map((l, i) => `<tspan x="${x}" y="${y0 + i * lh}">${esc(l)}</tspan>`).join('')}</text>`;
}
function box(x, y, w, h, label, cls = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" class="b ${cls}"/>${text(x + w / 2, y + h / 2, label, cls.includes('hi') ? 't hi' : 't')}`;
}
// A line through points with an arrowhead at the end.
function arrow(points, { dash = false, hollow = false, cls = '' } = {}) {
  const [x2, y2] = points.at(-1), [x1, y1] = points.at(-2), a = Math.atan2(y2 - y1, x2 - x1), s = hollow ? 10 : 7;
  const p = (r, d) => `${(x2 - s * Math.cos(a + r) * d).toFixed(1)},${(y2 - s * Math.sin(a + r) * d).toFixed(1)}`;
  const head = `${x2},${y2} ${p(.5, 1.1)} ${p(-.5, 1.1)}`;
  const end = hollow ? [x2 - s * Math.cos(a), y2 - s * Math.sin(a)] : [x2 - s * .8 * Math.cos(a), y2 - s * .8 * Math.sin(a)];
  const line = [...points.slice(0, -1), end].map(q => q.map(n => +n.toFixed(1)).join(',')).join(' ');
  return `<polyline points="${line}" class="l ${dash ? 'dash' : ''} ${cls}"/><polygon points="${head}" class="${hollow ? 'hh' : 'ah'} ${cls}"/>`;
}
const smooth = pts => pts.map((p, i) => {
  if (i === 0) return `M${p[0]} ${p[1]}`;
  const a = pts[i - 1], mx = (a[0] + p[0]) / 2;
  return `C${mx} ${a[1]} ${mx} ${p[1]} ${p[0]} ${p[1]}`;
}).join('');

// A curve without the flat spots of smooth(), for data lines.
const catmull = pts => pts.map((p, i) => {
  if (i === 0) return `M${p[0]} ${p[1]}`;
  const p0 = pts[i - 2] ?? pts[i - 1], p1 = pts[i - 1], p3 = pts[i + 1] ?? p;
  return `C${p1[0] + (p[0] - p0[0]) / 6} ${p1[1] + (p[1] - p0[1]) / 6} ${p[0] - (p3[0] - p1[0]) / 6} ${p[1] - (p3[1] - p1[1]) / 6} ${p[0]} ${p[1]}`;
}).join('');

/* ---------- Waterfall ---------- */
function waterfallSvg(L, stage2, revised) {
  const W = 118, H = 36, steps = ['Requirements\ndefinition', stage2, 'Implementation\nand Unit Testing', 'Integration and\nSystem Testing', 'Operation and\nMaintenance'];
  const at = i => [8 + i * 57, 6 + i * 47];
  const base = at(4)[1] + H + 16;
  let g = '';
  steps.forEach((_, i) => {
    const [x, y] = at(i);
    if (i < 4) { const [nx, ny] = at(i + 1); g += arrow([[x + W, y + H / 2], [nx + W / 2, y + H / 2], [nx + W / 2, ny]]); }
    if (i < 4) g += arrow([[x + 20, base], [x + 20, y + H]], { cls: 'back' });
    if (revised && i < 3) { const [nx, ny] = at(i + 1); g += arrow([[nx, ny + H / 2], [x + 20, ny + H / 2]], { cls: 'back' }); }
  });
  const [lx, ly] = at(4);
  g += `<polyline points="${lx + W / 2},${ly + H} ${lx + W / 2},${base} ${at(0)[0] + 20},${base}" class="l back"/>`;
  steps.forEach((s, i) => { const [x, y] = at(i); g += box(x, y, W, H, s, revised && i === 1 ? 'hi' : ''); });
  g += text(8, base + 15, L('Mũi tên đứt nét màu xanh: quay lại giai đoạn trước', 'Blue arrows: going back to an earlier stage'), 'tm', 'start');
  return svg(360, base + 24, L('Waterfall gồm 5 giai đoạn nối tiếp, có mũi tên quay lại các giai đoạn trước', 'Waterfall has 5 stages in sequence, with arrows back to earlier stages'), g);
}

/* ---------- Gantt, read from the bar chart on slide 03#28, in weeks after 4/7 ---------- */
const GANTT = [
  ['Start', 0, null, null], ['T4', 0, 2, 6], ['T1', 0, 1.43, null], ['T2', 0, 3, 3.43], ['M1', 1.43, null, null],
  ['T7', 1.43, 5.35, 8], ['T3', 1.43, 4.4, null], ['M5', 2, 2, 6], ['T8', 2, 7, 11], ['M3', 3, 3, 3.43], ['M2', 3, 3, 6],
  ['T6', 3, 4, 4.43], ['T5', 3, 5, 8], ['M4', 4.55, null, null], ['T9', 4.55, 7.43, null], ['M7', 5.5, 5.5, 8],
  ['T10', 5.5, 8.5, 11], ['M6', 7.57, null, null], ['T11', 7.57, 9, null], ['M8', 9, null, null], ['T12', 9, 11, null], ['Finish', 11, null, null],
];
const DATES = ['4/7', '18/7', '1/8', '15/8', '29/8', '12/9'];

export const figures = {
  boehm: L => {
    const X = 40, Y = 12, W = 300, H = 170, x = v => X + v / 30 * W, y = v => Y + H - v / 100 * H;
    const curve = [[0, 15], [4, 24], [8, 38], [11, 52], [15, 70], [20, 82], [25, 89], [30, 91]].map(([a, b]) => [x(a), y(b)]);
    const line = catmull(curve);
    let g = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" class="area2"/><path d="${line}L${X + W} ${Y + H}L${X} ${Y + H}Z" class="area1"/><path d="${line}" class="edge"/>`;
    [0, 50, 100].forEach(v => { g += `<line x1="${X - 4}" x2="${X}" y1="${y(v)}" y2="${y(v)}" class="tick"/>` + text(X - 7, y(v), `${v}%`, 'tm', 'end'); });
    [[0, 1955], [15, 1970], [30, 1985]].forEach(([v, s]) => { g += text(x(v), Y + H + 14, s, 'tm'); });
    g += text(x(7), y(78), 'Hardware', 't') + text(x(19), y(38), 'Software', 't on');
    return svg(360, 202, L('Tỷ trọng chi phí phần mềm tăng từ khoảng 15% năm 1955 lên khoảng 90% năm 1985, phần cứng giảm tương ứng', 'Software share of cost rises from about 15% in 1955 to about 90% in 1985, while hardware falls'), g)
      + `<p class="fg-note">${L('Boehm, 1981. Tỷ trọng trong tổng chi phí, đường cong vẽ gần đúng theo hình.', 'Boehm, 1981. Share of total cost; the curve is approximate.')}</p>`;
  },

  chaos: L => {
    const rows = [[2004, 30, 51, 19], [2009, 33, 46, 21], [2014, 39, 42, 19], [2020, 35, 46, 19]];
    return `<div class="fg-legend"><span><i class="c-good"></i>✔ Successful</span><span><i class="c-gold"></i>~ Challenged</span><span><i class="c-bad"></i>✘ Failed</span></div>
      <div class="fg-stack" role="img" aria-label="${esc(L('CHAOS: Successful, Challenged, Failed theo năm. 2004: 30, 51, 19. 2009: 33, 46, 21. 2014: 39, 42, 19. 2020: 35, 46, 19.', 'CHAOS: Successful, Challenged, Failed by year. 2004: 30, 51, 19. 2009: 33, 46, 21. 2014: 39, 42, 19. 2020: 35, 46, 19.'))}">
      ${rows.map(([yr, s, c, f]) => `<div class="fg-row ${yr === 2020 ? 'now' : ''}"><b>${yr}</b><div class="fg-bar"><span class="c-good" style="flex:${s}">${s}%</span><span class="c-gold" style="flex:${c}">${c}%</span><span class="c-bad" style="flex:${f}">${f}%</span></div></div>`).join('')}
      </div>`;
  },

  cmmi: L => {
    const rows = [
      [5, 'Optimizing', L('Cải tiến liên tục', 'Continuous improvement')],
      [4, 'Quantitatively Managed', L('Đo lường, data-driven', 'Measured, data-driven')],
      [3, 'Defined', L('Chuẩn toàn tổ chức', 'Organization-wide standards')],
      [2, 'Managed', L('Quản lý ở mức project', 'Managed per project')],
      [1, 'Initial', L('Bị động, hay trễ', 'Reactive, often late')],
    ];
    return `<ol class="fg-stair" aria-label="CMMI">${rows.map(([n, name, note]) => `<li style="margin-left:${(n - 1) * 8}%;--lv:${n}"><b class="n">${n}</b><span><b>${name}</b><small>${note}</small></span></li>`).join('')}</ol>`;
  },

  waterfall: L => waterfallSvg(L, 'Analysis and\nDesign', false),
  'waterfall-revised': L => waterfallSvg(L, 'System and\nSoftware Design', true)
    + `<p class="fg-note">${L('Khác với hình trước: stage 2 đổi tên, và stage nào cũng có mũi tên về stage liền trước.', 'Unlike the previous diagram: stage 2 is renamed, and each stage has an arrow to the one before it.')}</p>`,

  incremental: L => {
    const rowY = [20, 88, 156], X0 = 80, w = 86, gap = 10;
    let g = box(2, 88, 62, 36, 'Require-\nments', 'hi');
    rowY.forEach((y, r) => {
      g += text(X0 + 2, y - 8, `Build ${r + 1}`, 'tm', 'start');
      g += arrow(r === 1 ? [[64, y + 18], [X0, y + 18]] : [[33, r === 0 ? 88 : 124], [33, y + 18], [X0, y + 18]]);
      ['Analysis &\nDesign', 'Implemen-\ntation', 'Testing'].forEach((s, k) => {
        const x = X0 + k * (w + gap);
        if (k < 2) g += arrow([[x + w, y + 18], [x + w + gap, y + 18]]);
        g += box(x, y, w, 36, s);
      });
    });
    return svg(360, 200, L('Từ Requirements chung chia thành các build, mỗi build có Analysis & Design, Implementation, Testing', 'Shared requirements split into builds, each with Analysis & Design, Implementation and Testing'), g);
  },

  spiral: L => {
    const cx = 180, cy = 150, turns = 2.875, pts = [], R = 84;
    for (let k = 0; k <= 240; k++) { const f = k / 240, th = -Math.PI + f * turns * 2 * Math.PI, r = 6 + f * R; pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]); }
    const quad = (x, y, cls, title, sub, tx, ty, anchor) => `<rect x="${x}" y="${y}" width="176" height="146" rx="8" class="q ${cls}"/>` + text(tx, ty, title, 't big', anchor) + text(tx, ty + 17 + (sub.split('\n').length - 1) * 6.5, sub, 'tm', anchor);
    let g = quad(2, 2, 'q1', '1 · Plan', 'Requirements\ngathering', 10, 22, 'start')
      + quad(182, 2, 'q2', '2 · Risk Analysis', 'Risk reduction\nPrototyping', 350, 22, 'end')
      + quad(182, 152, 'q3', '3 · Engineering', 'Coding\nTesting', 350, 256, 'end')
      + quad(2, 152, 'q4', '4 · Evaluate', 'Customer\nEvolution', 10, 256, 'start');
    g += arrow(pts.map(p => [+p[0].toFixed(1), +p[1].toFixed(1)]), { cls: 'spiral' });
    g += `<rect x="${cx - 17}" y="${cy - 9}" width="34" height="18" rx="4" class="b hi"/>` + text(cx, cy, 'Start', 'ts');
    g += text(cx - 86, cy + 42, 'Release', 't hi2', 'end');
    return svg(360, 300, L('Spiral: mỗi vòng xoắn đi qua Plan, Risk Analysis, Engineering, Evaluate rồi tới Release', 'Spiral: each loop passes Plan, Risk Analysis, Engineering, Evaluate, then Release'), g);
  },

  rup: L => {
    const X = 106, W = 250, ROW = 25, TOP = 40;
    const disc = [
      ['Business Modeling', [3.5, 2.6, 2, 1.2, .8, .4, .1, 0]], ['Requirements', [3.2, 3, 1.8, 1.6, 1.4, 1, .4, .2]],
      ['Analysis & Design', [1.5, 3.2, 3, 2.4, 2.5, 1.4, .6, .1]], ['Implementation', [.3, 1.2, 2.4, 3.6, 3.6, 3.2, 1, .3]],
      ['Test', [.4, 1, 1, 1.2, 1.1, 2, 1, .4]], ['Deployment', [0, 0, .1, .2, .3, 1.6, 2.8, 1.2]],
      ['Config. & Change', [.2, .4, .5, 1, 1.4, 1.5, 1.4, 1.1]], ['Project Mgmt', [1.5, 1, 1.2, .9, .9, 1.2, 1.4, 1.4]], ['Environment', [.7, .8, .5, .7, .2, .2, .5, .2]],
    ];
    const iters = ['Initial', 'E1', 'E2', 'C1', 'C2', 'CN', 'T1', 'T2'], cell = W / 8;
    const phases = [['Inception', 0, 1], ['Elaboration', 1, 3], ['Construction', 3, 6], ['Transition', 6, 8]];
    let g = '';
    phases.forEach(([n, a, b]) => {
      g += `<rect x="${X + a * cell + 1}" y="2" width="${(b - a) * cell - 2}" height="20" rx="3" class="b"/>` + text(X + (a + b) / 2 * cell, 12, n === 'Inception' ? 'Incep.' : n, 'ts');
      if (a) g += `<line x1="${X + a * cell}" x2="${X + a * cell}" y1="24" y2="${TOP + 9 * ROW}" class="grid"/>`;
    });
    disc.forEach(([n, v], r) => {
      const y0 = TOP + (r + 1) * ROW - 3, pts = v.map((h, i) => [X + (i + .5) * cell, y0 - h * 5.2]);
      const all = [[X, y0], ...pts, [X + W, y0]];
      g += `<path d="${smooth(all)}Z" class="hump h${r % 3}"/><line x1="${X}" x2="${X + W}" y1="${y0}" y2="${y0}" class="base"/>` + text(X - 5, y0 - 7, n, 'ts', 'end');
    });
    iters.forEach((n, i) => { g += text(X + (i + .5) * cell, TOP + 9 * ROW + 12, n, 'ts'); });
    return svg(360, TOP + 9 * ROW + 24, L('RUP: chiều ngang là 4 phase và các iteration, chiều dọc là 9 discipline, độ cao sóng là mức nặng của discipline theo thời gian', 'RUP: horizontally 4 phases and their iterations, vertically 9 disciplines, wave height shows the workload over time'), g)
      + `<p class="fg-note">${L('Độ cao sóng vẽ gần đúng theo hình dạng trên slide, không phải số đo. E, C, T là các iteration của Elaboration, Construction, Transition.', 'Wave heights are approximate shapes, not measurements. E, C, T are iterations of Elaboration, Construction, Transition.')}</p>`;
  },

  scrum: L => {
    let g = box(2, 8, 100, 42, 'Product\nBacklog') + text(52, 60, 'Product Owner', 'ts');
    g += arrow([[102, 29], [130, 29]]) + box(130, 8, 100, 42, 'Sprint\nPlanning');
    g += arrow([[230, 29], [258, 29]]) + box(258, 8, 100, 42, 'Sprint\nBacklog');
    g += arrow([[308, 50], [308, 78], [262, 78]]);
    g += `<rect x="72" y="72" width="190" height="84" rx="42" class="b hi"/>` + text(167, 96, L('Sprint (tối đa 1 tháng)', 'Sprint (max 1 month)'), 't hi') + text(167, 116, L('Daily Scrum 15 phút mỗi ngày', 'Daily Scrum, 15 min every day'), 'tm') + text(167, 134, L('Developers + Scrum Master', 'Developers + Scrum Master'), 'tm');
    g += arrow([[262, 140], [290, 140], [290, 176]]) + box(240, 176, 118, 42, 'Increment');
    g += arrow([[240, 197], [216, 197]]) + box(120, 176, 96, 42, 'Sprint\nReview');
    g += arrow([[120, 197], [96, 197]]) + box(2, 176, 94, 42, 'Sprint\nRetrospective');
    g += arrow([[48, 176], [48, 72]], { cls: 'back' });
    g += text(4, 128, L('Sprint\nkế tiếp', 'Next\nSprint'), 'ts', 'start');
    return svg(360, 226, L('Scrum: Product Backlog, Sprint Planning, Sprint Backlog, Sprint có Daily Scrum, Increment, Sprint Review, Sprint Retrospective, rồi Sprint kế tiếp', 'Scrum: Product Backlog, Sprint Planning, Sprint Backlog, the Sprint with Daily Scrum, Increment, Sprint Review, Sprint Retrospective, then the next Sprint'), g);
  },

  kanban: L => {
    const cols = [['Backlog', null, ['F', 'E']], ['Todo', 2, ['D']], ['Ongoing', 2, ['B', 'G']], ['Done', null, ['C']]];
    return `<div class="fg-board" role="img" aria-label="${esc(L('Bảng Kanban 4 cột: Backlog, Todo giới hạn WIP 2, Ongoing giới hạn WIP 2, Done. Thẻ đi từ trái sang phải.', 'A Kanban board with 4 columns: Backlog, Todo with WIP limit 2, Ongoing with WIP limit 2, Done. Cards move left to right.'))}">
      ${cols.map(([n, wip, cards]) => `<div class="col"><div class="head"><b>${n}</b>${wip ? `<small>WIP ≤ ${wip}</small>` : '<small>&nbsp;</small>'}</div>${cards.map(c => `<span class="sticky">${c}</span>`).join('')}</div>`).join('')}
      </div><div class="fg-flow">${L('Dòng chảy: thẻ đi từ trái sang phải, nên đều', 'Flow: cards move left to right, evenly')} ▶</div>`;
  },

  cfd: L => {
    const X = 8, Y = 10, W = 344, H = 150, y = v => Y + H - v / 100 * H, x = i => X + i / 6 * W;
    const done = [0, 4, 12, 22, 35, 48, 62], prog = [3, 12, 22, 33, 46, 60, 74], todo = [10, 26, 42, 58, 72, 86, 100];
    const band = (top, bot, cls) => {
      const up = top.map((v, i) => [x(i), y(v)]), low = bot.map((v, i) => [x(i), y(v)]).reverse();
      return `<path d="M${up.map(p => p.join(' ')).join('L')}L${low.map(p => p.join(' ')).join('L')}Z" class="${cls}"/>`;
    };
    const zero = done.map(() => 0);
    let g = band(todo, prog, 'cf1') + band(prog, done, 'cf2') + band(done, zero, 'cf3');
    g += `<line x1="${X}" x2="${X + W}" y1="${Y + H}" y2="${Y + H}" class="base"/>` + text(X + W / 2, Y + H + 13, L('Thời gian ▶', 'Time ▶'), 'tm');
    return `<div class="fg-legend"><span><i class="cf1"></i>To Do</span><span><i class="cf2"></i>In Progress</span><span><i class="cf3"></i>Done</span></div>`
      + svg(360, 182, L('Cumulative flow diagram: ba dải To Do, In Progress, Done xếp chồng theo thời gian', 'Cumulative flow diagram: To Do, In Progress and Done bands stacked over time'), g)
      + `<p class="fg-note">${L('Hình minh hoạ dạng biểu đồ, số liệu không có thật. Dải In Progress hẹp lại nghĩa là WIP giảm.', 'Illustration of the chart shape, not real data. A narrower In Progress band means less WIP.')}</p>`;
  },

  gantt: L => {
    const X = 44, W = 306, TOP = 20, ROW = 14.5, wk = W / 11;
    let g = '';
    DATES.forEach((d, i) => { const x = X + i * 2 * wk; g += text(x, 8, d, 'ts') + `<line x1="${x}" x2="${x}" y1="16" y2="${TOP + GANTT.length * ROW}" class="grid"/>`; });
    GANTT.forEach(([name, start, end, slack], r) => {
      const y = TOP + r * ROW, mid = y + ROW / 2;
      g += text(X - 5, mid - 1, name, name.startsWith('T') ? 'ts' : 'ts mut', 'end');
      if (slack != null) g += `<rect x="${X + (end ?? start) * wk}" y="${y + 2.5}" width="${(slack - (end ?? start)) * wk}" height="${ROW - 5}" class="slack"/>`;
      if (name.startsWith('T')) g += `<rect x="${X + start * wk}" y="${y + 2.5}" width="${(end - start) * wk}" height="${ROW - 5}" class="task"/>`;
      else g += `<polygon points="${X + start * wk},${mid - 5} ${X + start * wk + 5},${mid} ${X + start * wk},${mid + 5} ${X + start * wk - 5},${mid}" class="dia"/>`;
    });
    return svg(360, TOP + GANTT.length * ROW + 4, L('Activity timeline: các task T1 đến T12 và milestone M1 đến M8 từ 4/7 đến 19/9', 'Activity timeline: tasks T1 to T12 and milestones M1 to M8 from 4/7 to 19/9'), g)
      + `<div class="fg-legend"><span><i class="k-task"></i>Task</span><span><i class="k-slack"></i>${L('Phần linh hoạt', 'Flexibility')}</span><span><i class="k-dia"></i>Milestone</span></div>`
      + `<p class="fg-note">${L('Theo Sommerville: thanh nhạt là khoảng trễ được phép mà không ảnh hưởng critical path.', 'Per Sommerville: the pale bar is how late it can finish without affecting the critical path.')}</p>`;
  },

  riskmatrix: L => {
    const P = [['Unlikely', 10], ['Seldom', 25], ['Occasional', 50], ['Likely', 75], ['Frequently', 90]];
    const R = [['Negligible', 10, [0, 0, 0, 0, 0]], ['Insignificant', 25, [0, 0, 1, 1, 1]], ['Moderate', 50, [0, 1, 2, 2, 2]], ['Serious', 75, [0, 1, 2, 2, 3]], ['Catastrophic', 90, [0, 1, 2, 3, 3]]];
    // The worked examples in the lesson: Serious x Likely, Catastrophic x Seldom, Catastrophic x Likely.
    const mark = new Set(['Serious|Likely', 'Catastrophic|Seldom', 'Catastrophic|Likely']);
    return `<div class="fg-scroll"><table class="fg-risk"><caption class="fg-sr">${L('Giá trị RE = Probability × Loss', 'RE values = Probability × Loss')}</caption>
      <thead><tr><th scope="col">Loss \\ P</th>${P.map(([n, v]) => `<th scope="col">${n}<small>${v}</small></th>`).join('')}</tr></thead>
      <tbody>${R.map(([n, v, z]) => `<tr><th scope="row">${n}<small>${v}</small></th>${P.map(([pn, p], i) => `<td class="z${z[i]}${mark.has(`${n}|${pn}`) ? ' mk' : ''}">${(p * v).toLocaleString('en-US')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="fg-note">${L('Ô càng đậm thì rủi ro càng cao, chia vùng theo ma trận trên slide.', 'Darker cells mean higher risk, zoned as in the slide matrix.')}</p>`;
  },

  're-process': L => {
    const W = 104, H = 40, steps = ['Feasibility\nstudy', 'Requirements\ngathering', 'Requirements\nspecification', 'Requirements\nvalidation'];
    const at = i => [4 + i * 83, 4 + i * 44];
    let g = '';
    steps.forEach((_, i) => { if (i < 3) { const [x, y] = at(i), [nx, ny] = at(i + 1); g += arrow([[x + 30, y + H], [x + 30, ny + H / 2], [nx, ny + H / 2]]); } });
    steps.forEach((s, i) => { const [x, y] = at(i); g += box(x, y, W, H, s); });
    g += `<rect x="4" y="196" width="352" height="36" rx="5" class="b hi"/>` + text(180, 214, L('Requirements management: xuyên suốt dự án', 'Requirements management: throughout the project'), 't hi');
    return svg(360, 238, L('Feasibility study, Requirements gathering, specification, validation nối tiếp, còn Requirements management diễn ra xuyên suốt', 'Feasibility study, Requirements gathering, specification and validation in sequence, with Requirements management throughout'), g);
  },

  actors: L => {
    const actor = (x, y, label) => `<g class="actor"><circle cx="${x}" cy="${y}" r="9"/><line x1="${x}" y1="${y + 9}" x2="${x}" y2="${y + 32}"/><line x1="${x - 13}" y1="${y + 17}" x2="${x + 13}" y2="${y + 17}"/><line x1="${x}" y1="${y + 32}" x2="${x - 11}" y2="${y + 48}"/><line x1="${x}" y1="${y + 32}" x2="${x + 11}" y2="${y + 48}"/></g>` + text(x, y + 62, label, 't');
    return svg(360, 170, L('Doctor là một loại Employee: mũi tên generalization đầu rỗng từ Doctor tới Employee', 'Doctor is a kind of Employee: a hollow generalization arrow from Doctor to Employee'),
      actor(70, 78, 'Doctor') + actor(290, 14, 'Employee') + arrow([[92, 106], [266, 54]], { hollow: true })
      + text(205, 112, L('generalization\nDoctor là một loại Employee', 'generalization\nDoctor is a kind of Employee'), 'tm'));
  },

  'uc-payvat': L => {
    const row = (note, label, body) => `<div class="uc-row"><small>${note}</small><div><b>${label}</b>${body}</div></div>`;
    return `<div class="fg-uc"><div class="uc-title">Use case: PayVAT</div>
      ${row(L('Mã định danh', 'Unique identifier'), 'ID', ' UC1')}
      ${row(L('Actor tham gia', 'Actors involved'), 'Actors', '<br>Time, Government')}
      ${row(L('Trạng thái trước khi bắt đầu', 'State before it starts'), 'Preconditions', '<ol><li>It is the end of a business quarter.</li></ol>')}
      ${row(L('Các bước thực tế', 'The actual steps'), 'Flow of events', '<ol><li>Starts at the end of the quarter.</li><li>System works out the VAT owed.</li><li>System sends the payment to the Government.</li></ol>')}
      ${row(L('Trạng thái khi kết thúc', 'State when it ends'), 'Postconditions', '<ol><li>Government has the correct VAT amount.</li></ol>')}
    </div>`;
  },

  'uc-basket': L => {
    const row = (note, label, body) => `<div class="uc-row"><small>${note}</small><div><b>${label}</b>${body}</div></div>`;
    return `<div class="fg-uc"><div class="uc-title">Use case: DisplayBasket · UC11</div>
      ${row(L('Actor', 'Actor'), 'Actors', '<br>Customer')}
      ${row(L('Điều kiện đầu', 'Starting state'), 'Preconditions', '<ol><li>Customer is logged on.</li></ol>')}
      ${row(L('Luồng chính, bước 2 rẽ nhánh', 'Main flow, step 2 branches'), 'Flow of events', '<ol><li>Customer selects "display basket".</li><li>If the basket is empty:<ol class="sub"><li>System tells the Customer it is empty.</li><li>Use case ends.</li></ol></li><li>System lists each item: product ID, name, quantity, price.</li></ol>')}
      ${row(L('Luồng phụ', 'Alternative'), 'Alternative flow 1', '<ol><li>At any time, Customer may leave the basket screen.</li></ol>')}
      ${row(L('Luồng phụ', 'Alternative'), 'Alternative flow 2', '<ol><li>At any time, Customer may leave the system.</li></ol>')}
    </div>`;
  },

  'uc-examples': L => {
    const uc = (cx, cy, rx, s, cls = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="21" class="b ${cls}"/>` + text(cx, cy, s, 'ts');
    const actor = (x, y, s) => `<g class="actor"><circle cx="${x}" cy="${y}" r="6"/><line x1="${x}" y1="${y + 6}" x2="${x}" y2="${y + 20}"/><line x1="${x - 9}" y1="${y + 11}" x2="${x + 9}" y2="${y + 11}"/><line x1="${x}" y1="${y + 20}" x2="${x - 7}" y2="${y + 30}"/><line x1="${x}" y1="${y + 20}" x2="${x + 7}" y2="${y + 30}"/></g>` + text(x, y + 40, s, 'ts');
    const block = (y, title, who, base, inc, ext) => text(2, y + 8, title, 't hi2', 'start')
      + actor(26, y + 30, who) + `<line x1="40" y1="${y + 48}" x2="96" y2="${y + 48}" class="l"/>`
      + uc(150, y + 48, 54, base, 'hi')
      + arrow([[204, y + 48], [262, y + 48]], { dash: true, cls: 'rel' }) + text(232, y + 38, '«include»', 'ts rel')
      + uc(308, y + 48, 48, inc)
      + arrow([[150, y + 112], [150, y + 70]], { dash: true, cls: 'rel' }) + text(190, y + 91, '«extend»', 'ts rel')
      + uc(150, y + 132, 66, ext);
    return svg(360, 332, L('Hai ví dụ: Checkout order include Payment, Verify shipping address extend Checkout order; Load and Display web page include Show images, Read web page loud extend Load and Display web page', 'Two examples: Checkout order includes Payment, Verify shipping address extends Checkout order; Load and Display web page includes Show images, Read web page loud extends Load and Display web page'),
      block(2, 'Online shopping', 'Customer', 'Checkout\norder', 'Payment', 'Verify shipping\naddress') + block(168, 'Firefox', 'User', 'Load and\nDisplay page', 'Show\nimages', 'Read web page\nloud'));
  },

  layers: L => {
    const layer = (name, inner) => `<div class="ly"><b>${name}</b><span>${inner}</span></div>`;
    return `<div class="fg-layers" role="img" aria-label="${esc(L('Ba lớp phần mềm: Client gồm các UI, Business Layer gồm các Library, Data Layer lưu dữ liệu, nối với nhau qua interface', 'Three software layers: Client with UIs, Business Layer with libraries, Data Layer with storage, connected through interfaces'))}">
      ${layer('Data Layer', L('Dữ liệu', 'Data'))}<i>▲ interface</i>${layer('Business Layer', 'Libraries')}<i>▲ interface</i>${layer('Client', 'UIs')}</div>`;
  },

  'digital-analogue': L => {
    const data = [['Jan', 2842], ['Feb', 2851], ['Mar', 3164], ['Apr', 2789], ['May', 1273], ['Jun', 2835]];
    const X = 6, W = 348, H = 110, Y = 8, cell = W / 6, y = v => Y + H - v / 4000 * H;
    let g = '';
    data.forEach(([m, v], i) => {
      const x = X + i * cell + 8, w = cell - 16;
      g += `<path d="M${x} ${Y + H}V${y(v) + 4}Q${x} ${y(v)} ${x + 4} ${y(v)}H${x + w - 4}Q${x + w} ${y(v)} ${x + w} ${y(v) + 4}V${Y + H}Z" class="${m === 'May' ? 'bar lo' : 'bar'}"/>` + text(x + w / 2, Y + H + 12, m, 'ts');
    });
    g += `<line x1="${X}" x2="${X + W}" y1="${Y + H}" y2="${Y + H}" class="base"/>`;
    return `<div class="fg-duo"><div><b class="fg-h">Digital</b><div class="fg-scroll"><table class="fg-nums"><tr>${data.map(([m]) => `<th scope="col">${m}</th>`).join('')}</tr><tr>${data.map(([, v]) => `<td>${v}</td>`).join('')}</tr></table></div><small>${L('Giá trị chính xác, tốn ít chỗ', 'Exact values, little space')}</small></div>
      <div><b class="fg-h">Analogue</b>${svg(360, 136, L('Biểu đồ cột cùng số liệu, tháng May thấp hẳn', 'Bar chart of the same data, May is clearly lower'), g)}<small>${L('Thấy ngay giá trị tương đối: May thấp bất thường', 'Relative values at a glance: May stands out')}</small></div></div>`;
  },

  'ui-process': L => {
    const steps = [['User analysis', L('Hiểu người dùng sẽ làm gì với hệ thống', 'Understand what users will do with the system')], ['System prototyping', L('Làm một loạt prototype để thử', 'Build a series of prototypes to try')], ['Interface evaluation', L('Thử các prototype với người dùng', 'Try the prototypes with users')]];
    return `<ol class="fg-steps">${steps.map(([n, d]) => `<li><b>${n}</b><small>${d}</small></li>`).join('')}</ol>`;
  },

  'error-msg': L => `<div class="fg-duo">
    <div class="dlg bad"><p class="verdict">✘ ${L('Hướng hệ thống', 'System-oriented')}</p><div class="win"><b>Error #27</b><p>Invalid patient id</p></div><div class="btns"><span>OK</span><span>Cancel</span></div></div>
    <div class="dlg good"><p class="verdict">✔ ${L('Hướng người dùng', 'User-oriented')}</p><div class="win"><b>R. MacDonald is not a registered patient</b><p>Click Patients for a list of patients.<br>Click Retry to enter the name again.<br>Click Help for more information.</p></div><div class="btns"><span>Patients</span><span>Help</span><span>Retry</span><span>Cancel</span></div></div>
  </div>`,
};

// Rendered once per language at build time.
export function renderFigures() {
  const out = {};
  for (const [name, draw] of Object.entries(figures)) {
    out[name] = { vi: draw((vi) => vi), en: draw((_, en) => en) };
  }
  return out;
}
