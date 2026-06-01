/* Shared UI components & helpers → window globals */
(function () {
  const { useState, useEffect, useRef } = React;
  const Icon = window.Icon;
  const DB = window.DB;

  /* ---------- formatters ---------- */
  const nf = (n, d = 0) => (n == null ? '—' : Number(n).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d }));
  const money = (tr) => (tr == null ? '—' : (Math.abs(tr) >= 1000 ? nf(tr / 1000, tr % 1000 === 0 ? 0 : 1) + ' tỷ' : nf(tr, 0) + ' tr'));
  const dmy = (s) => { if (!s) return '—'; const [y, m, d] = s.split(' ')[0].split('-'); return `${d}/${m}/${y}`; };

  /* ---------- status maps ---------- */
  const TASK_ST = {
    todo: { label: 'Chưa làm', cls: 'badge-gray' },
    doing: { label: 'Đang làm', cls: 'badge-blue' },
    review: { label: 'Chờ nghiệm thu', cls: 'badge-amber' },
    done: { label: 'Hoàn thành', cls: 'badge-green' },
  };
  const EQ_ST = {
    running: { label: 'Đang hoạt động', cls: 'badge-green' },
    idle: { label: 'Đang nghỉ', cls: 'badge-gray' },
    maintenance: { label: 'Đang sửa chữa', cls: 'badge-amber' },
    'rented-out': { label: 'Đang cho thuê', cls: 'badge-violet' },
    liquidated: { label: 'Đã thanh lý', cls: 'badge-red' },
  };
  const OWN_ST = {
    own: { label: 'Sở hữu', cls: 'badge-blue' },
    rented: { label: 'Thuê ngoài', cls: 'badge-orange' },
    'rented-out': { label: 'Cho thuê', cls: 'badge-violet' },
    liquidated: { label: 'Thanh lý', cls: 'badge-red' },
  };
  const AREA_ST = {
    pending: { label: 'Chưa thi công', cls: 'badge-gray' },
    active: { label: 'Đang thi công', cls: 'badge-blue' },
    paused: { label: 'Tạm dừng', cls: 'badge-amber' },
    done: { label: 'Hoàn thành', cls: 'badge-green' },
  };
  const DOC_ST = {
    draft: { label: 'Nháp', cls: 'badge-gray' },
    pending: { label: 'Chờ duyệt', cls: 'badge-amber' },
    submitted: { label: 'Chờ duyệt', cls: 'badge-amber' },
    approved: { label: 'Đã duyệt', cls: 'badge-green' },
    done: { label: 'Hoàn thành', cls: 'badge-green' },
    doing: { label: 'Đang xử lý', cls: 'badge-blue' },
    cancel: { label: 'Đã huỷ', cls: 'badge-red' },
  };
  const Badge = ({ map, k, children, cls }) => {
    const m = map && map[k];
    return <span className={'badge ' + (cls || (m ? m.cls : 'badge-gray'))}>{m ? m.label : children}</span>;
  };

  /* ---------- avatar ---------- */
  function Avatar({ id, person, size = 'av' }) {
    const p = person || (DB.byId[id]) || { initials: '?', color: '#888' };
    return <div className={'av ' + (size !== 'av' ? size : '')} style={{ background: p.color }} title={p.name}>{p.initials}</div>;
  }
  function AvatarStack({ ids = [], max = 4 }) {
    const show = ids.slice(0, max);
    return (
      <div className="av-stack">
        {show.map((id, i) => <Avatar key={i} id={id} size="av-sm" />)}
        {ids.length > max && <div className="av av-sm" style={{ background: '#93A4B3' }}>+{ids.length - max}</div>}
      </div>
    );
  }

  /* ---------- progress bar ---------- */
  function Bar({ value, max = 100, tone = '', w }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    const t = tone || (pct >= 100 ? 'green' : pct >= 50 ? '' : pct >= 25 ? 'amber' : 'orange');
    return <div className="bar" style={{ width: w }}><span className={''} style={{ width: pct + '%', background: t === '' ? 'var(--blue-500)' : `var(--${t === 'green' ? 'green' : t === 'amber' ? 'amber' : 'orange'}-500)` }} /></div>;
  }

  /* ---------- KPI / stat card ---------- */
  function Stat({ label, icon, value, unit, delta, deltaDir, edge = 'var(--blue-500)', foot }) {
    return (
      <div className="stat">
        <div className="accent-edge" style={{ background: edge }} />
        <div className="stat-label">{icon && <Icon name={icon} size={14} />}{label}</div>
        <div className="stat-num">{value}<span className="stat-unit">{unit}</span></div>
        {(delta || foot) && (
          <div className="stat-foot">
            {delta && <span className={deltaDir === 'down' ? 'down' : 'up'} style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
              <Icon name={deltaDir === 'down' ? 'chevron-down' : 'chevron-up'} size={12} />{delta}</span>}
            {foot && <span className="muted">{foot}</span>}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Tabs ---------- */
  function Tabs({ tabs, active, onChange, scroll }) {
    return (
      <div className="tabs" style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--line)', overflowX: scroll ? 'auto' : 'visible' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            disabled={t.disabled}
            style={{
              border: 0, background: 'none', padding: '9px 13px', fontSize: 12.5, whiteSpace: 'nowrap',
              fontWeight: active === t.id ? 600 : 500,
              color: t.disabled ? 'var(--ink-300)' : active === t.id ? 'var(--blue-700)' : 'var(--ink-500)',
              borderBottom: '2px solid ' + (active === t.id ? 'var(--blue-700)' : 'transparent'),
              marginBottom: -1, cursor: t.disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7,
            }}>
            {t.icon && <Icon name={t.icon} size={14} />}{t.label}
            {t.count != null && <span className="badge badge-gray" style={{ height: 17, padding: '0 6px', fontSize: 10 }}>{t.count}</span>}
            {t.lock && <Icon name="shield-check" size={12} style={{ color: 'var(--ink-300)' }} />}
          </button>
        ))}
      </div>
    );
  }

  /* ---------- Donut chart ---------- */
  function Donut({ data, size = 130, thickness = 18, center }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const r = (size - thickness) / 2; const c = 2 * Math.PI * r; let off = 0;
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-soft)" strokeWidth={thickness} />
          {data.map((d, i) => {
            const len = (d.value / total) * c; const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} />;
            off += len; return el;
          })}
        </svg>
        {center && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{center}</div>}
      </div>
    );
  }

  /* ---------- Bar chart (vertical) ---------- */
  function BarChart({ data, height = 160, unit = '', tone = 'var(--blue-500)' }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, padding: '8px 0' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-600)', fontWeight: 600 }}>{nf(d.value)}</div>
            <div title={d.label + ': ' + nf(d.value) + unit} style={{ width: '70%', maxWidth: 38, height: `${(d.value / max) * 100}%`, minHeight: 3, background: d.color || tone, borderRadius: '3px 3px 0 0', transition: 'height .4s' }} />
            <div style={{ fontSize: 10.5, color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>{d.label}</div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------- Line / area chart ---------- */
  function LineChart({ series, height = 170, labels = [], unit = '' }) {
    const W = 560, H = height, pad = { l: 8, r: 8, t: 14, b: 22 };
    const allVals = series.flatMap(s => s.data);
    const max = Math.max(...allVals, 1) * 1.1, min = 0;
    const n = series[0].data.length;
    const x = (i) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
        {[0, .25, .5, .75, 1].map((g, i) => <line key={i} x1={pad.l} x2={W - pad.r} y1={pad.t + g * (H - pad.t - pad.b)} y2={pad.t + g * (H - pad.t - pad.b)} stroke="var(--line-soft)" strokeWidth="1" />)}
        {series.map((s, si) => {
          const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
          const area = `${pad.l},${y(0)} ` + pts + ` ${x(n - 1)},${y(0)}`;
          return <g key={si}>
            {s.fill && <polygon points={area} fill={s.fill} opacity="0.12" />}
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
            {s.data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="#fff" stroke={s.color} strokeWidth="1.6" />)}
          </g>;
        })}
        {labels.map((l, i) => <text key={i} x={x(i)} y={H - 6} fontSize="10" fill="var(--ink-500)" textAnchor="middle" fontFamily="var(--font)">{l}</text>)}
      </svg>
    );
  }

  /* ---------- Modal ---------- */
  function Modal({ title, sub, onClose, children, foot, width = 720 }) {
    useEffect(() => {
      const h = (e) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
    }, []);
    return (
      <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal pop-in" style={{ maxWidth: width }} onMouseDown={e => e.stopPropagation()}>
          <div className="modal-head">
            <div><div className="modal-title">{title}</div>{sub && <div className="card-sub" style={{ marginTop: 2 }}>{sub}</div>}</div>
            <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
          <div className="modal-body">{children}</div>
          {foot && <div className="modal-foot">{foot}</div>}
        </div>
      </div>
    );
  }

  /* ---------- Toast ---------- */
  let toastFn = null;
  function ToastHost() {
    const [items, setItems] = useState([]);
    useEffect(() => { toastFn = (msg, kind = 'ok') => { const id = Math.random(); setItems(x => [...x, { id, msg, kind }]); setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 2600); }; }, []);
    return <div className="toast-wrap">{items.map(t => (
      <div key={t.id} className={'toast ' + t.kind}><Icon name={t.kind === 'warn' ? 'alert' : 'check-circle'} size={16} style={{ color: t.kind === 'warn' ? 'var(--amber-500)' : 'var(--green-500)' }} />{t.msg}</div>
    ))}</div>;
  }
  const toast = (m, k) => toastFn && toastFn(m, k);

  /* ---------- Search input ---------- */
  function Search({ placeholder = 'Tìm kiếm…', value, onChange, w = 220 }) {
    return (
      <div style={{ position: 'relative', width: w }}>
        <Icon name="search" size={15} style={{ position: 'absolute', left: 9, top: 9, color: 'var(--ink-400)' }} />
        <input className="input" style={{ paddingLeft: 30, height: 32 }} placeholder={placeholder} value={value || ''} onChange={e => onChange && onChange(e.target.value)} />
      </div>
    );
  }

  /* ---------- Dropdown menu ---------- */
  function Menu({ trigger, items, align = 'right' }) {
    const [open, setOpen] = useState(false); const ref = useRef();
    useEffect(() => { const h = e => ref.current && !ref.current.contains(e.target) && setOpen(false); document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <div onClick={() => setOpen(o => !o)}>{trigger}</div>
        {open && (
          <div className="pop-in" style={{ position: 'absolute', [align]: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid var(--line)', borderRadius: 8, boxShadow: 'var(--shadow-pop)', minWidth: 180, zIndex: 60, padding: 5 }}>
            {items.map((it, i) => it.sep ? <div key={i} className="divider" style={{ margin: '5px 0' }} /> : (
              <button key={i} onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', border: 0, background: 'none', padding: '7px 9px', borderRadius: 5, fontSize: 12.5, color: it.danger ? 'var(--red-600)' : 'var(--ink-700)', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                {it.icon && <Icon name={it.icon} size={14} />}{it.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Section header (within page) ---------- */
  function SectionHead({ title, sub, icon, right }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <Icon name={icon} size={16} style={{ color: 'var(--blue-600)' }} />}
          <div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>{title}</div>{sub && <div className="card-sub">{sub}</div>}</div>
        </div>
        {right}
      </div>
    );
  }

  /* ---------- Field ---------- */
  function Field({ label, req, hint, children, span }) {
    return (
      <div className="field" style={{ gridColumn: span ? `span ${span}` : undefined }}>
        {label && <label className="label">{label}{req && <span className="req">*</span>}</label>}
        {children}
        {hint && <div className="hint">{hint}</div>}
      </div>
    );
  }

  Object.assign(window, {
    nf, money, dmy, Badge, Avatar, AvatarStack, Bar, Stat, Tabs, Donut, BarChart, LineChart,
    Modal, ToastHost, toast, Search, Menu, SectionHead, Field,
    TASK_ST, EQ_ST, OWN_ST, AREA_ST, DOC_ST,
  });
})();
