(() => {
  const $ = id => document.getElementById(id);
  const range = (id, out, formatter = v => Number(v).toFixed(2)) => {
    const input = $(id), output = $(out);
    if (!input) return null;
    const update = () => { if (output) output.textContent = formatter(input.value); };
    input.addEventListener('input', update); update(); return input;
  };
  const canvasCtx = id => {
    const canvas = $(id); if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return { w: rect.width, h: rect.height };
    };
    return { canvas, ctx, size };
  };
  const grid = (ctx, w, h, x0, y0, sx, sy, xSpan, ySpan) => {
    ctx.clearRect(0, 0, w, h); ctx.lineWidth = 1; ctx.strokeStyle = '#242a34';
    const xStep = xSpan > 9 ? 2 : 1, yStep = ySpan > 9 ? 2 : 1;
    for (let x = Math.ceil(-xSpan / 2 / xStep) * xStep; x <= xSpan / 2; x += xStep) { ctx.beginPath(); ctx.moveTo(x0 + x * sx, 0); ctx.lineTo(x0 + x * sx, h); ctx.stroke(); }
    for (let y = Math.ceil(-ySpan / 2 / yStep) * yStep; y <= ySpan / 2; y += yStep) { ctx.beginPath(); ctx.moveTo(0, y0 - y * sy); ctx.lineTo(w, y0 - y * sy); ctx.stroke(); }
    ctx.strokeStyle = '#6f7785'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.moveTo(x0, 0); ctx.lineTo(x0, h); ctx.stroke();
    ctx.fillStyle = '#808895'; ctx.font = '10px DM Mono, monospace'; ctx.fillText('Re', w - 21, y0 - 8); ctx.fillText('Im', x0 + 8, 12);
  };
  function complexPage() {
    const s = range('sigma', 'sigmaOut', v => (Number(v) < 0 ? '−' : '') + Math.abs(Number(v)).toFixed(2));
    const o = range('omega', 'omegaOut'); const t = range('time', 'timeOut', v => Number(v).toFixed(1));
    const view = canvasCtx('complexCanvas'); if (!view) return;
    const draw = () => {
      const { w, h } = view.size(), { ctx } = view; const x0 = w * .5, y0 = h * .5, scale = Math.min(w / 7, h / 5.2);
      grid(ctx, w, h, x0, y0, scale, scale, w / scale, h / scale);
      const sigma = Number(s.value), omega = Number(o.value), time = Number(t.value);
      ctx.beginPath(); let began = false;
      for (let i = 0; i <= 240; i++) { const q = time * i / 240, r = Math.exp(sigma * q), x = x0 + scale * r * Math.cos(omega * q), y = y0 - scale * r * Math.sin(omega * q); if (!Number.isFinite(x + y) || Math.abs(r) > 15) { began = false; continue; } if (!began) { ctx.moveTo(x, y); began = true; } else ctx.lineTo(x, y); }
      ctx.strokeStyle = '#73e5dc'; ctx.lineWidth = 2; ctx.stroke();
      const r = Math.exp(sigma * time), px = x0 + scale * r * Math.cos(omega * time), py = y0 - scale * r * Math.sin(omega * time);
      ctx.beginPath(); ctx.arc(px, py, 5, 0, 2 * Math.PI); ctx.fillStyle = '#efffca'; ctx.fill(); ctx.beginPath(); ctx.arc(px, py, 9, 0, 2 * Math.PI); ctx.strokeStyle = '#73e5dc99'; ctx.stroke();
      $('complexReadout').textContent = `t=${time.toFixed(2)}   z=${(r * Math.cos(omega * time)).toFixed(2)} ${(r * Math.sin(omega * time) < 0 ? '−' : '+')} ${(Math.abs(r * Math.sin(omega * time))).toFixed(2)}i   |z|=${r.toFixed(2)}`;
    };
    [s, o, t].forEach(x => x.addEventListener('input', draw)); window.addEventListener('resize', draw); draw();
  }
  function laplacePage() {
    const probe = range('probe', 'probeOut', v => (Number(v) < 0 ? '−' : '') + Math.abs(Number(v)).toFixed(2));
    const omega = range('probeOmega', 'probeOmegaOut', v => (Number(v) < 0 ? '−' : '') + Math.abs(Number(v)).toFixed(2));
    const mode = $('probeMode'), modeOut = $('probeModeOut'), view = canvasCtx('laplaceCanvas'); if (!view) return;
    const draw = () => {
      const { w, h } = view.size(), { ctx } = view, xSpan = 8, ySpan = 6, scale = Math.min(w / xSpan, h / ySpan), x0 = w / 2, y0 = h / 2;
      grid(ctx, w, h, x0, y0, scale, scale, xSpan, ySpan);
      let poles = [-1, -3], sample = 'two decays';
      if (mode.value === 'single') { poles = [-1]; sample = 'e^(−t)'; }
      if (mode.value === 'cosine') { poles = []; sample = 'cos(2t)'; }
      poles.forEach(p => { const x = x0 + p * scale; ctx.strokeStyle = '#c7a0ff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - 6, y0 - 6); ctx.lineTo(x + 6, y0 + 6); ctx.moveTo(x - 6, y0 + 6); ctx.lineTo(x + 6, y0 - 6); ctx.stroke(); });
      if (mode.value === 'cosine') [-2, 2].forEach(p => { const y = y0 - p * scale; ctx.strokeStyle = '#c7a0ff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x0 - 6, y - 6); ctx.lineTo(x0 + 6, y + 6); ctx.moveTo(x0 - 6, y + 6); ctx.lineTo(x0 + 6, y - 6); ctx.stroke(); });
      const re = Number(probe.value), im = Number(omega.value), px = x0 + re * scale, py = y0 - im * scale;
      ctx.setLineDash([3, 4]); ctx.strokeStyle = '#718092'; ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(px, py); ctx.lineTo(px, y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fillStyle = '#73e5dc'; ctx.fill();
      const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
      let value;
      if (mode.value === 'single') value = cdiv([1, 0], [re + 1, im]);
      else if (mode.value === 'cosine') value = cdiv([re, im], [re * re - im * im + 4, 2 * re * im]);
      else { const v1 = cdiv([1, 0], [re + 1, im]), v2 = cdiv([.6, 0], [re + 3, im]); value = [v1[0] + v2[0], v1[1] + v2[1]]; }
      const mag = Math.hypot(...value), converges = mode.value === 'cosine' ? re > 0 : mode.value === 'single' ? re > -1 : re > -3;
      modeOut.textContent = sample;
      $('laplaceReadout').textContent = `s=${re.toFixed(2)} ${im < 0 ? '−' : '+'} ${Math.abs(im).toFixed(2)}i   |F(s)|=${Number.isFinite(mag) ? mag.toFixed(2) : '∞'}   ${converges ? 'integral converges' : 'outside ROC'}`;
    };
    [probe, omega].forEach(x => x.addEventListener('input', draw)); mode.addEventListener('change', draw); window.addEventListener('resize', draw); draw();
  }
  function springPage() {
    const damping = range('damping', 'dampingOut'); const drive = range('drive', 'driveOut'); const force = range('force', 'forceOut'); const view = canvasCtx('springCanvas'); if (!view) return;
    const draw = () => {
      const { w, h } = view.size(), { ctx } = view, zeta = Number(damping.value), omega = Number(drive.value), F = Number(force.value);
      const dt = .012, end = 26, n = Math.ceil(end / dt), xs = new Float64Array(n + 1), velocities = new Float64Array(n + 1);
      const accel = (x, v, time) => F * Math.cos(omega * time) - 2 * zeta * v - x;
      for (let i = 0; i < n; i++) { const time = i * dt, x = xs[i], v = velocities[i]; const k1x = v, k1v = accel(x, v, time); const k2x = v + dt * k1v / 2, k2v = accel(x + dt * k1x / 2, v + dt * k1v / 2, time + dt / 2); const k3x = v + dt * k2v / 2, k3v = accel(x + dt * k2x / 2, v + dt * k2v / 2, time + dt / 2); const k4x = v + dt * k3v, k4v = accel(x + dt * k3x, v + dt * k3v, time + dt); xs[i + 1] = x + dt * (k1x + 2 * k2x + 2 * k3x + k4x) / 6; velocities[i + 1] = v + dt * (k1v + 2 * k2v + 2 * k3v + k4v) / 6; }
      const pad = { l: 38, r: 14, t: 24, b: 28 }, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b, xmax = 26, ymax = Math.max(1, ...xs.map(Math.abs)) * 1.16, X = i => pad.l + i / n * pw, Y = v => pad.t + (ymax - v) / (2 * ymax) * ph;
      ctx.clearRect(0, 0, w, h); ctx.strokeStyle = '#29303a'; ctx.lineWidth = 1;
      for (let j = -2; j <= 2; j++) { const y = pad.t + j * ph / 4; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); }
      ctx.fillStyle = '#7b8491'; ctx.font = '10px DM Mono, monospace'; ctx.fillText('displacement', pad.l, 13); ctx.fillText('time →', w - 51, h - 8);
      ctx.beginPath(); for (let i = 0; i <= n; i += 3) { const px = X(i), py = Y(xs[i]); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.strokeStyle = '#73e5dc'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); for (let i = 0; i <= n; i += 3) { const value = F * Math.cos(omega * (i * dt)) * .55, px = X(i), py = Y(value); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.strokeStyle = '#ffb27f88'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      const detune = Math.abs(omega - 1).toFixed(2);
      $('springReadout').textContent = `ζ=${zeta.toFixed(2)}   Ω/ω₀=${omega.toFixed(2)}   final x=${xs[n].toFixed(2)}   |Ω/ω₀−1|=${detune}`;
    };
    [damping, drive, force].forEach(x => x.addEventListener('input', draw)); window.addEventListener('resize', draw); draw();
  }
  function matrixPage() {
    const a = range('matrixA', 'matrixAOut', v => (Number(v) < 0 ? '−' : '') + Math.abs(Number(v)).toFixed(2)); const b = range('matrixB', 'matrixBOut', v => (Number(v) < 0 ? '−' : '') + Math.abs(Number(v)).toFixed(2)); const omega = range('matrixW', 'matrixWOut'); const view = canvasCtx('matrixCanvas'); if (!view) return;
    const draw = () => {
      const { w, h } = view.size(), { ctx } = view, aa = Number(a.value), bb = Number(b.value), ww = Number(omega.value), xSpan = 6, ySpan = 5, scale = Math.min(w / xSpan, h / ySpan), x0 = w / 2, y0 = h / 2;
      grid(ctx, w, h, x0, y0, scale, scale, xSpan, ySpan);
      const dx = xSpan / 9, dy = ySpan / 7;
      for (let x = -xSpan / 2 + .35; x < xSpan / 2; x += dx) for (let y = -ySpan / 2 + .25; y < ySpan / 2; y += dy) {
        const vx = aa * x - ww * y, vy = ww * x + bb * y, len = Math.hypot(vx, vy); if (len < .03) continue; const norm = Math.min(.33, len * .10) / len, ex = x + vx * norm, ey = y + vy * norm, sx = x0 + x * scale, sy = y0 - y * scale;
        ctx.strokeStyle = '#82968b80'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x0 + ex * scale, y0 - ey * scale); ctx.stroke();
        ctx.beginPath(); ctx.arc(sx, sy, 1.25, 0, 2 * Math.PI); ctx.fillStyle = '#a4e8aa88'; ctx.fill();
      }
      const dt = .018, end = 9, n = Math.ceil(end / dt); let x = 1, y = 0; const path = [[x, y]];
      const f = (u, v) => [aa * u - ww * v, ww * u + bb * v];
      for (let i = 0; i < n; i++) { const [k1x, k1y] = f(x, y), [k2x, k2y] = f(x + dt * k1x / 2, y + dt * k1y / 2), [k3x, k3y] = f(x + dt * k2x / 2, y + dt * k2y / 2), [k4x, k4y] = f(x + dt * k3x, y + dt * k3y); x += dt * (k1x + 2 * k2x + 2 * k3x + k4x) / 6; y += dt * (k1y + 2 * k2y + 2 * k3y + k4y) / 6; if (!Number.isFinite(x + y) || Math.hypot(x, y) > 30) break; path.push([x, y]); }
      ctx.beginPath(); path.forEach(([px, py], i) => { const sx = x0 + px * scale, sy = y0 - py * scale; if (!i) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy); }); ctx.strokeStyle = '#a4e8aa'; ctx.lineWidth = 2.3; ctx.stroke();
      const last = path[path.length - 1]; ctx.beginPath(); ctx.arc(x0 + last[0] * scale, y0 - last[1] * scale, 4.5, 0, Math.PI * 2); ctx.fillStyle = '#edffbc'; ctx.fill();
      $('matrixReadout').textContent = `A=[[${aa.toFixed(2)}, −${ww.toFixed(2)}],[${ww.toFixed(2)}, ${bb.toFixed(2)}]]   start (1, 0)   final (${last[0].toFixed(2)}, ${last[1].toFixed(2)})`;
    };
    [a, b, omega].forEach(x => x.addEventListener('input', draw)); window.addEventListener('resize', draw); draw();
  }
  const chapter = document.body.dataset.chapter;
  const sections = [...document.querySelectorAll('.lesson-content > .lesson-section')];
  document.querySelectorAll('.lesson-aside .aside-card:first-child a').forEach((link, i) => {
    if (sections[i]) { sections[i].id = `chapter-section-${i + 1}`; link.href = `#chapter-section-${i + 1}`; }
  });
  ({ complex: complexPage, laplace: laplacePage, odes: springPage, matrix: matrixPage })[chapter]?.();
})();
