/* Tiến độ thi công chi tiết — Gantt (WBS) + S-curve sản lượng → window.TienDo */
(function () {
  const { useState, useRef } = window.React;
  const { Icon, DB, nf, dmy, Stat } = window;

  const NOW = new Date('2026-05-16');
  const MW = 38; // month column width
  const LEFTW = 560;

  const baseIdx = (() => { const [y, m] = DB.scurve.base.split('-').map(Number); return { y, m }; })();
  const monthIndex = (dateStr) => { const [y, m] = dateStr.split('-').map(Number); return (y - baseIdx.y) * 12 + (m - baseIdx.m); };
  const N = DB.scurve.planCum.length; // 24 months
  const months = Array.from({ length: N }, (_, i) => {
    const total = (baseIdx.y * 12 + (baseIdx.m - 1)) + i;
    const y = Math.floor(total / 12), m = total % 12 + 1;
    return { label: String(m).padStart(2, '0') + '/' + String(y).slice(2), q: Math.ceil(m / 3), m, y };
  });

  const planPct = (it) => { const s = new Date(it.start), e = new Date(it.end); if (NOW >= e) return 100; if (NOW <= s) return 0; return Math.round((NOW - s) / (e - s) * 100); };
  const statusOf = (done, plan) => done >= 100 ? 'done' : (done - plan < -8 ? 'late' : done - plan > 5 ? 'ahead' : 'ontrack');
  const ST = { done: { c: 'var(--green-500)', label: 'Hoàn thành' }, ontrack: { c: 'var(--blue-500)', label: 'Đúng tiến độ' }, ahead: { c: 'var(--violet-500)', label: 'Vượt tiến độ' }, late: { c: 'var(--red-500)', label: 'Chậm tiến độ' } };

  /* ---------- S-curve ---------- */
  function SCurve() {
    const { planCum, actualCum, nowIdx } = DB.scurve;
    const [hov, setHov] = window.React.useState(null);
    const wrapRef = window.React.useRef(null);
    const W = 760, H = 210, pad = { l: 34, r: 14, t: 14, b: 26 };
    const x = (i) => pad.l + (i / (N - 1)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - v / 100) * (H - pad.t - pad.b);
    const planPts = planCum.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const actPts = actualCum.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const actArea = `${x(0)},${y(0)} ` + actPts + ` ${x(actualCum.length - 1)},${y(0)}`;
    const onMove = (e) => {
      const r = wrapRef.current.getBoundingClientRect();
      const relX = (e.clientX - r.left) / r.width * W;
      let idx = Math.round((relX - pad.l) / (W - pad.l - pad.r) * (N - 1));
      idx = Math.max(0, Math.min(N - 1, idx));
      setHov(idx);
    };
    const hovLeftPct = hov != null ? (x(hov) / W) * 100 : 0;
    return (
      <div ref={wrapRef} style={{ position: 'relative' }} onMouseMove={onMove} onMouseLeave={() => setHov(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
          {[0, 25, 50, 75, 100].map(g => <g key={g}><line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="var(--line-soft)" /><text x={pad.l - 6} y={y(g) + 3} fontSize="9" fill="var(--ink-400)" textAnchor="end">{g}%</text></g>)}
          {/* now line */}
          <line x1={x(nowIdx)} x2={x(nowIdx)} y1={pad.t} y2={H - pad.b} stroke="var(--orange-400)" strokeWidth="1" strokeDasharray="3 3" />
          <text x={x(nowIdx)} y={pad.t - 3} fontSize="9" fill="var(--orange-600)" textAnchor="middle" fontWeight="700">Hôm nay</text>
          <polygon points={actArea} fill="var(--blue-500)" opacity="0.1" />
          <polyline points={planPts} fill="none" stroke="var(--ink-400)" strokeWidth="2" strokeDasharray="5 4" />
          <polyline points={actPts} fill="none" stroke="var(--blue-600)" strokeWidth="2.5" />
          {actualCum.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={hov === i ? 4 : 2.4} fill="#fff" stroke="var(--blue-600)" strokeWidth="1.5" />)}
          {/* hover guide */}
          {hov != null && <>
            <line x1={x(hov)} x2={x(hov)} y1={pad.t} y2={H - pad.b} stroke="var(--blue-400)" strokeWidth="1" />
            <circle cx={x(hov)} cy={y(planCum[hov])} r="3.5" fill="var(--ink-500)" />
            {hov < actualCum.length && <circle cx={x(hov)} cy={y(actualCum[hov])} r="4" fill="var(--blue-600)" />}
          </>}
          {months.map((mo, i) => i % 2 === 0 ? <text key={i} x={x(i)} y={H - 8} fontSize="8.5" fill="var(--ink-500)" textAnchor="middle">{mo.label}</text> : null)}
        </svg>
        {hov != null && (
          <div style={{ position: 'absolute', left: hovLeftPct + '%', top: 6, transform: 'translateX(-50%)', background: 'var(--ink-900)', color: '#fff', borderRadius: 7, padding: '7px 10px', fontSize: 11, boxShadow: 'var(--shadow-pop)', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 5 }}>
            <div style={{ fontWeight: 700, marginBottom: 3, textAlign: 'center' }}>Tháng {months[hov].label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 0, borderTop: '2px dashed #cfd8e0' }} />KH: <b className="mono">{planCum[hov]}%</b></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}><span style={{ width: 12, height: 3, background: 'var(--blue-400)', borderRadius: 2 }} />TT: <b className="mono">{hov < actualCum.length ? actualCum[hov] + '%' : '—'}</b></div>
            {hov < actualCum.length && <div style={{ marginTop: 3, paddingTop: 3, borderTop: '1px solid rgba(255,255,255,.15)', color: actualCum[hov] - planCum[hov] < 0 ? '#ff9b8a' : '#7fe0a3' }}>Lệch: {actualCum[hov] - planCum[hov] > 0 ? '+' : ''}{actualCum[hov] - planCum[hov]}%</div>}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Gantt row ---------- */
  function GanttBar({ it }) {
    if (it.lvl === 0) {
      const s = Math.max(0, monthIndex(it.start)), e = Math.min(N - 1, monthIndex(it.end));
      return (
        <div style={{ position: 'absolute', left: s * MW + 3, width: (e - s + 1) * MW - 6, top: 13, height: 8 }}>
          <div style={{ position: 'absolute', inset: 0, borderTop: '2px solid var(--ink-300)', borderLeft: '2px solid var(--ink-300)', borderRight: '2px solid var(--ink-300)', borderRadius: '3px 3px 0 0' }} />
        </div>
      );
    }
    const s = Math.max(0, monthIndex(it.start)), e = Math.min(N - 1, monthIndex(it.end));
    const left = s * MW + 3, width = Math.max(8, (e - s + 1) * MW - 6);
    const plan = planPct(it), st = statusOf(it.done, plan), col = ST[st].c;
    return (
      <div style={{ position: 'absolute', left, width, top: 9, height: 16 }} title={`${ST[st].label} · KH ${plan}% · TT ${it.done}%`}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-2)', borderRadius: 4, border: '1px solid var(--line)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: it.done + '%', background: col, borderRadius: 4 }} />
        {it.done > 0 && it.done < 100 && <span style={{ position: 'absolute', right: -2, top: -15, fontSize: 9, fontWeight: 700, color: col, fontFamily: 'var(--mono)' }}>{it.done}%</span>}
      </div>
    );
  }

  function TienDo({ projId }) {
    if (projId && projId !== 'p1') {
      return (
        <div className="card ph" style={{ height: 280, flexDirection: 'column', gap: 12 }}>
          <Icon name="timeline" size={30} />
          <div style={{ fontWeight: 600, color: 'var(--ink-600)' }}>Chưa lập tiến độ thi công chi tiết cho dự án này</div>
          <div style={{ fontSize: 12 }}>Tạo sơ đồ ngang (Gantt) theo cây hạng mục, khối lượng và mốc thời gian.</div>
          <button className="btn btn-sm btn-primary" onClick={() => window.toast && window.toast('Mở trình lập tiến độ (demo)')}><Icon name="plus" size={14} />Lập tiến độ thi công</button>
        </div>
      );
    }
    const sched = DB.schedule;
    const items = sched.filter(s => s.lvl === 1);
    const avgPlan = Math.round(items.reduce((a, it) => a + planPct(it), 0) / items.length);
    const avgDone = Math.round(items.reduce((a, it) => a + it.done, 0) / items.length);
    const lateCount = items.filter(it => statusOf(it.done, planPct(it)) === 'late').length;

    return (
      <div>
        {/* KPIs */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 14 }}>
          <Stat label="Tiến độ kế hoạch" icon="target" value={DB.scurve.planCum[DB.scurve.nowIdx]} unit="%" edge="var(--ink-400)" foot="đến hôm nay" />
          <Stat label="Tiến độ thực tế" icon="check-circle" value={DB.scurve.actualCum[DB.scurve.nowIdx]} unit="%" edge="var(--blue-500)" />
          <Stat label="Chênh lệch" icon="chart" value={(DB.scurve.actualCum[DB.scurve.nowIdx] - DB.scurve.planCum[DB.scurve.nowIdx])} unit="%" deltaDir="down" edge="var(--red-500)" foot="chậm so với KH" />
          <Stat label="Hạng mục chậm" icon="alert" value={lateCount} unit={'/' + items.length} edge="var(--amber-500)" />
          <Stat label="Hoàn thành (KH)" icon="flag" value="09/08/26" edge="var(--green-500)" foot="hợp đồng" />
        </div>

        {/* S-curve */}
        <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
          <div className="card-head">
            <div className="card-title"><Icon name="chart" size={15} style={{ color: 'var(--blue-600)' }} />Đường cong sản lượng (S-curve) · Kế hoạch vs Thực tế</div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 0, borderTop: '2px dashed var(--ink-400)' }} />Lũy kế kế hoạch</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 3, background: 'var(--blue-600)', borderRadius: 2 }} />Lũy kế thực tế</span>
            </div>
          </div>
          <div style={{ padding: 14 }}><SCurve /></div>
        </div>

        {/* Gantt */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head">
            <div className="card-title"><Icon name="timeline" size={15} style={{ color: 'var(--orange-500)' }} />Sơ đồ ngang tiến độ chi tiết (WBS)</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
              {Object.entries(ST).map(([k, v]) => <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 6, borderRadius: 2, background: v.c }} />{v.label}</span>)}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: LEFTW + N * MW }}>
              {/* header */}
              <div style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 3, background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                <div style={{ position: 'sticky', left: 0, zIndex: 4, background: 'var(--surface-2)', width: LEFTW, display: 'flex', flex: 'none', borderRight: '2px solid var(--line)' }}>
                  {[['Hạng mục công việc', 244, 'left'], ['ĐVT', 44], ['Khối lượng', 86, 'right'], ['Ngày', 40, 'right'], ['Bắt đầu', 60], ['Kết thúc', 60]].map(([l, w, al], i) =>
                    <div key={i} style={{ width: w, padding: '8px 8px', fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', textAlign: al === 'right' ? 'right' : al === 'left' ? 'left' : 'center', flex: 'none' }}>{l}</div>)}
                </div>
                <div style={{ display: 'flex', position: 'relative' }}>
                  {months.map((mo, i) => <div key={i} style={{ width: MW, flex: 'none', padding: '4px 0', textAlign: 'center', fontSize: 9, fontWeight: 600, color: mo.m === 5 && mo.y === 2026 ? 'var(--orange-600)' : 'var(--ink-500)', borderLeft: mo.m % 3 === 1 ? '1px solid var(--line)' : '1px solid var(--line-soft)' }}>{mo.label}</div>)}
                </div>
              </div>
              {/* rows */}
              {sched.map(it => {
                const plan = it.lvl === 1 ? planPct(it) : null;
                const st = it.lvl === 1 ? statusOf(it.done, plan) : null;
                return (
                  <div key={it.id} style={{ display: 'flex', borderBottom: '1px solid var(--line-soft)', background: it.lvl === 0 ? 'var(--surface-2)' : '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, zIndex: 2, width: LEFTW, display: 'flex', flex: 'none', background: it.lvl === 0 ? 'var(--surface-2)' : '#fff', borderRight: '2px solid var(--line)' }}>
                      <div style={{ width: 244, padding: '7px 8px', flex: 'none', fontSize: it.lvl === 0 ? 11 : 12, fontWeight: it.lvl === 0 ? 700 : 500, color: it.lvl === 0 ? 'var(--blue-700)' : 'var(--ink-800)', paddingLeft: it.lvl === 0 ? 8 : 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: it.lvl === 0 ? 'uppercase' : 'none', letterSpacing: it.lvl === 0 ? '.02em' : 0 }} title={it.name}>{it.name}</div>
                      <div style={{ width: 44, padding: '7px 4px', flex: 'none', fontSize: 11, textAlign: 'center', color: 'var(--ink-500)' }}>{it.dvt || ''}</div>
                      <div style={{ width: 86, padding: '7px 8px', flex: 'none', fontSize: 11, textAlign: 'right', fontFamily: 'var(--mono)' }}>{it.kl != null ? nf(it.kl, it.kl < 1000 && it.kl % 1 !== 0 ? 1 : 0) : ''}</div>
                      <div style={{ width: 40, padding: '7px 4px', flex: 'none', fontSize: 11, textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--ink-500)' }}>{it.days || ''}</div>
                      <div style={{ width: 60, padding: '7px 4px', flex: 'none', fontSize: 10.5, textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--ink-600)' }}>{it.lvl === 1 ? dmy(it.start) : ''}</div>
                      <div style={{ width: 60, padding: '7px 4px', flex: 'none', fontSize: 10.5, textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--ink-600)' }}>{it.lvl === 1 ? dmy(it.end) : ''}</div>
                    </div>
                    <div style={{ position: 'relative', width: N * MW, flex: 'none', height: 34 }}>
                      {/* month gridlines */}
                      {months.map((mo, i) => <div key={i} style={{ position: 'absolute', left: i * MW, top: 0, bottom: 0, width: 1, background: mo.m % 3 === 1 ? 'var(--line)' : 'var(--line-soft)' }} />)}
                      {/* now line */}
                      <div style={{ position: 'absolute', left: DB.scurve.nowIdx * MW + MW / 2, top: 0, bottom: 0, width: 1, background: 'var(--orange-400)' }} />
                      <GanttBar it={it} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="auto-note" style={{ marginTop: 12 }}><Icon name="info" size={13} />Số liệu khối lượng, thời gian và mốc tiến độ lấy theo "Tiến độ thi công chi tiết" của Liên danh Quân Trung – Nam Hải (Km3+300–Km4+699 & Km6+200–Km7+400). % thực tế cập nhật từ nhật ký thi công, máy và vật liệu đổ.</div>
      </div>
    );
  }

  window.TienDo = TienDo;
})();
