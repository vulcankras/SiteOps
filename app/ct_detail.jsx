/* Chi tiết Công trường — header + tab router + Tổng quan (bản đồ trung tâm) → window.CTDetail */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, money, dmy, nf, Avatar, AvatarStack, Stat, Tabs, LineChart, BarChart, Donut, AREA_ST } = window;

  /* tab list + role visibility */
  const TABS = [
    { id: 'tong-quan', label: 'Tổng quan', icon: 'dashboard' },
    { id: 'cong-viec', label: 'Công việc', icon: 'tasks' },
    { id: 'tien-do', label: 'Tiến độ', icon: 'timeline' },
    { id: 'khu-vuc', label: 'Khu vực thi công', icon: 'map-pin' },
    { id: 'nhat-ky', label: 'Nhật ký hàng ngày', icon: 'calendar' },
    { id: 'vat-lieu-do', label: 'Vật liệu đổ', icon: 'truck' },
    { id: 'thiet-bi', label: 'Thiết bị', icon: 'excavator' },
    { id: 'ton-kho', label: 'Tồn kho & Vật tư', icon: 'package' },
    { id: 'nhan-su', label: 'Nhân sự', icon: 'users' },
    { id: 'goi-thau', label: 'Gói thầu', icon: 'file', roles: ['pm', 'watch'] },
    { id: 'tai-chinh', label: 'Tài chính', icon: 'wallet', roles: ['pm', 'site', 'watch'] },
    { id: 'bao-cao', label: 'Báo cáo', icon: 'report' },
    { id: 'ho-so', label: 'Hồ sơ - Tài liệu', icon: 'folder' },
  ];

  /* nhóm điều hướng dọc trong công trường */
  const NAVGROUPS = [
    { label: null, ids: ['tong-quan'] },
    { label: 'Thi công', ids: ['cong-viec', 'tien-do', 'khu-vuc', 'nhat-ky', 'vat-lieu-do'] },
    { label: 'Nguồn lực', ids: ['thiet-bi', 'ton-kho', 'nhan-su'] },
    { label: 'Văn phòng', ids: ['goi-thau', 'tai-chinh'] },
    { label: 'Hồ sơ & Báo cáo', ids: ['bao-cao', 'ho-so'] },
  ];

  /* ---------- Strip / route map (centerpiece) ---------- */
  function RouteMap({ areas, selected, onSelect }) {
    // centerline anchor points (viewBox 1000x360)
    const P = [[40,300],[120,275],[205,295],[300,245],[385,270],[470,205],[560,232],[645,162],[735,190],[815,132],[885,162],[945,120],[978,140]];
    const segColor = { done: '#26A35C', active: '#2876AE', paused: '#E0A008', pending: '#BFCCD6' };
    const path = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    // equipment markers along route
    const markers = [
      { t: [300,245], icon: 'excavator', name: 'CAT 320', c: '#1D5E8C' },
      { t: [470,205], icon: 'truck', name: 'Howo 57', c: '#E2540C' },
      { t: [560,232], icon: 'truck', name: '568', c: '#E2540C' },
      { t: [645,162], icon: 'fuel', name: 'Lu 38', c: '#6D5BD0' },
      { t: [205,295], icon: 'warehouse', name: 'Kho HT', c: '#33485A' },
    ];
    return (
      <div style={{ position: 'relative', background: 'linear-gradient(160deg,#eef4f0,#e6eef3)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <svg viewBox="0 0 1000 360" width="100%" style={{ display: 'block' }}>
          {/* terrain contours */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#0c2a47" strokeWidth="0.5" opacity="0.05" /></pattern>
          </defs>
          <rect width="1000" height="360" fill="url(#grid)" />
          {[['M0 90 Q 250 40 500 80 T 1000 60','#1e8a4c'],['M0 320 Q 300 280 600 310 T 1000 290','#2876AE']].map(([d,c],i)=>
            <path key={i} d={d} fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="3 7" opacity="0.18" />)}
          {/* river */}
          <path d="M690 0 Q 705 120 660 200 T 700 360" fill="none" stroke="#6db4d6" strokeWidth="14" opacity="0.35" strokeLinecap="round" />
          {/* road base */}
          <path d={path(P)} fill="none" stroke="#c2ccd4" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
          <path d={path(P)} fill="none" stroke="#fff" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
          {/* colored segments per area (2 segments each) */}
          {areas.map((a, i) => {
            const pts = P.slice(i * 2, i * 2 + 3);
            const isSel = selected === a.id;
            return (
              <g key={a.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(a.id)}>
                <path d={path(pts)} fill="none" stroke={segColor[a.status]} strokeWidth={isSel ? 16 : 11} strokeLinecap="round" strokeLinejoin="round" opacity={isSel ? 1 : 0.9} />
                {/* progress overlay (dashed solid portion) */}
                <path d={path(pts)} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 7" strokeLinecap="round" opacity="0.7" />
                {/* km node */}
                <circle cx={P[i * 2][0]} cy={P[i * 2][1]} r={isSel ? 7 : 5} fill="#fff" stroke={segColor[a.status]} strokeWidth="2.5" />
                <text x={P[i * 2][0]} y={P[i * 2][1] - 13} fontSize="11" fontWeight="700" fill="#1f303d" textAnchor="middle" fontFamily="var(--mono)">{a.kmS}</text>
              </g>
            );
          })}
          {/* last km node */}
          <circle cx={P[12][0]} cy={P[12][1]} r="5" fill="#fff" stroke="#BFCCD6" strokeWidth="2.5" />
          <text x={P[12][0]} y={P[12][1] - 13} fontSize="11" fontWeight="700" fill="#1f303d" textAnchor="middle" fontFamily="var(--mono)">Km19+500</text>
          {/* equipment markers */}
          {markers.map((m, i) => (
            <g key={i}>
              <line x1={m.t[0]} y1={m.t[1]} x2={m.t[0]} y2={m.t[1] + 26} stroke={m.c} strokeWidth="1.5" />
              <circle cx={m.t[0]} cy={m.t[1] + 30} r="2.5" fill={m.c} />
              <g transform={`translate(${m.t[0] - 13},${m.t[1] - 26})`}>
                <rect width="26" height="22" rx="5" fill={m.c} />
                <g transform="translate(5,4)" stroke="#fff" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {m.icon === 'truck' && <><path d="M0 2h9v7H0zM9 4h3l3 3v2h-6z"/><circle cx="3" cy="11" r="1.4"/><circle cx="12" cy="11" r="1.4"/></>}
                  {m.icon === 'excavator' && <><path d="M0 12h16M2 12V9h5v3M2 9l1-2h3l1 2"/><path d="M7 9l3-4 4 1-1 2"/></>}
                  {m.icon === 'fuel' && <><path d="M0 14V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v11M0 14h9M0 7h7"/></>}
                  {m.icon === 'warehouse' && <><path d="M0 14V6l7-4 7 4v8M0 14h14M3 14v-4h8v4"/></>}
                </g>
              </g>
            </g>
          ))}
        </svg>
        {/* legend */}
        <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 12, background: 'rgba(255,255,255,.92)', padding: '6px 11px', borderRadius: 7, fontSize: 11, boxShadow: 'var(--shadow-sm)' }}>
          {Object.entries(segColor).map(([k, c]) => <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 4, borderRadius: 2, background: c }} />{AREA_ST[k].label}</span>)}
        </div>
        <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', gap: 6 }}>
          <button className="btn btn-sm btn-icon" style={{ background: '#fff' }}><Icon name="plus" size={14} /></button>
          <button className="btn btn-sm btn-icon" style={{ background: '#fff' }}><Icon name="crosshair" size={14} /></button>
        </div>
      </div>
    );
  }

  /* ---------- Tổng quan ---------- */
  function Overview({ p, go }) {
    const areas = DB.areas.filter(a => a.proj === p.id);
    const isRoad = p.template === 'road';
    const m = p.meta || {};
    const tasksP = DB.tasks.filter(t => t.proj === p.id);
    const defaultSel = (areas.find(a => a.status === 'active') || areas[0] || {}).id || null;
    const [sel, setSel] = useState(defaultSel);
    const selArea = areas.find(a => a.id === sel) || areas[0] || null;
    const phases = DB.phases.filter(ph => ph.proj === p.id);
    const volSeries = [{ color: 'var(--orange-500)', fill: 'var(--orange-500)', data: [12.1, 13.4, 15.8, 16.2, 14.9, 18.4] }];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* project KPIs */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          <Stat label="Tiến độ tổng" icon="target" value={p.progress} unit="%" edge="var(--blue-500)" foot={'KH: ' + (p.progress + 3) + '%'} />
          {isRoad
            ? <Stat label="KL đắp / thiết kế" icon="cube" value={m.design_vol ? nf(m.design_vol / 1000) : '—'} unit="k m³" edge="var(--orange-500)" foot={m.design_vol ? 'thiết kế' : ''} />
            : <Stat label="Công việc" icon="tasks" value={tasksP.filter(t => t.status === 'done').length + '/' + tasksP.length} edge="var(--orange-500)" />}
          <Stat label="Nhân sự huy động" icon="users" value={p.teamCount} unit="người" edge="var(--violet-500)" />
          <Stat label="Đã giải ngân" icon="wallet" value={money(p.spent)} edge="var(--teal-500)" foot={'/ ' + money(p.contractValue)} />
          {isRoad && m.length
            ? <Stat label="Chiều dài tuyến" icon="road" value={nf(m.length / 1000, 1)} unit="km" edge="var(--green-500)" foot={m.km_start + ' → ' + m.km_end} />
            : <Stat label="Thiết bị" icon="excavator" value={p.equipCount} unit="TB" edge="var(--green-500)" />}
        </div>

        {/* map + area panel */}
        {areas.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <div className="card-title"><Icon name="map" size={15} style={{ color: 'var(--blue-600)' }} />Bản đồ tuyến thi công{isRoad && m.km_start ? ' · ' + m.km_start + ' → ' + m.km_end : ''}</div>
              <div className="seg"><button className="active">Sơ đồ tuyến</button><button>Vệ tinh</button></div>
            </div>
            <div style={{ padding: 12 }}><RouteMap areas={areas} selected={sel} onSelect={setSel} /></div>
          </div>
          {/* selected area panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-head"><div className="card-title"><Icon name="map-pin" size={15} style={{ color: 'var(--orange-500)' }} />Khu vực đã chọn</div></div>
            <div style={{ padding: 14, flex: 1 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>{selArea.code}</span>
              <div style={{ fontWeight: 700, fontSize: 14, margin: '3px 0 8px' }}>{selArea.name}</div>
              <Badge map={AREA_ST} k={selArea.status} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
                {[['Lý trình', selArea.kmS + ' → ' + selArea.kmE], ['Chiều dài', nf(selArea.len) + ' m'], ['Phụ trách', DB.byId[selArea.mgr].name]].map(([k, v]) =>
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span className="muted">{k}</span><b style={{ fontWeight: 600 }}>{v}</b></div>)}
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span className="muted">Tiến độ khu vực</span><b className="mono">{selArea.progress}%</b></div>
                <Bar value={selArea.progress} />
              </div>
              <div style={{ marginTop: 16, paddingTop: 13, borderTop: '1px solid var(--line-soft)' }}>
                <div className="muted" style={{ fontSize: 11, marginBottom: 7 }}>Đối tượng gắn với khu vực</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span><Icon name="tasks" size={13} /> Công việc</span><b>4</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span><Icon name="excavator" size={13} /> Thiết bị</span><b>3</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span><Icon name="users" size={13} /> Nhân sự</span><b>18</b></div>
                </div>
              </div>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid var(--line-soft)' }}><button className="btn btn-sm" style={{ width: '100%' }} onClick={() => go({ page: 'cong-truong', sub: 'detail', id: p.id, tab: 'khu-vuc' })}>Xem tất cả khu vực<Icon name="arrow-right" size={13} /></button></div>
          </div>
        </div>
        ) : (
          <div className="card ph" style={{ height: 200, flexDirection: 'column', gap: 10 }}><Icon name="map-pin" size={26} /><div>Chưa thiết lập khu vực thi công cho dự án này</div><button className="btn btn-sm" onClick={() => go({ page: 'cong-truong', sub: 'detail', id: p.id, tab: 'khu-vuc' })}><Icon name="plus" size={13} />Thêm khu vực</button></div>
        )}

        {/* lower row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, alignItems: 'start' }}>
          <div className="card">
            <div className="card-head"><div className="card-title"><Icon name="layers" size={15} style={{ color: 'var(--blue-600)' }} />Tiến độ theo giai đoạn</div></div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {phases.length ? phases.map(ph => (
                <div key={ph.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{ph.name}</span><span className="mono" style={{ fontWeight: 600 }}>{ph.progress}%</span></div>
                  <Bar value={ph.progress} />
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 3 }}>{dmy(ph.start)} – {dmy(ph.end)}</div>
                </div>
              )) : <div className="muted" style={{ fontSize: 12, textAlign: 'center', padding: '24px 0' }}>Chưa thiết lập giai đoạn</div>}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title"><Icon name="cube" size={15} style={{ color: 'var(--orange-500)' }} />Khối lượng đắp theo tháng (k m³)</div></div>
            <div style={{ padding: 14 }}>
              <LineChart series={volSeries} labels={['T12', 'T1', 'T2', 'T3', 'T4', 'T5']} height={150} />
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title"><Icon name="info" size={15} style={{ color: 'var(--blue-600)' }} />Thông tin dự án</div></div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[['Chủ đầu tư', p.client], ['Địa điểm', p.location], ['Giám đốc DA', DB.byId[p.manager].name], ['Chỉ huy trưởng', DB.byId[p.commander].name], ['Khởi công', dmy(p.start)], ['Hoàn thành (KH)', dmy(p.end)], ...(isRoad && m.roadbed ? [['Bề rộng nền', m.roadbed + ' m']] : []), ...(m.floors ? [['Số tầng', m.floors + ' tầng']] : []), ...(m.span ? [['Chiều dài cầu', m.span + ' m']] : [])].map(([k, v]) =>
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 10 }}><span className="muted nowrap">{k}</span><b style={{ fontWeight: 600, textAlign: 'right' }}>{v}</b></div>)}
              <div style={{ marginTop: 6, paddingTop: 11, borderTop: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="muted" style={{ fontSize: 12 }}>Đội ngũ ({p.teamCount})</span>
                <AvatarStack ids={['u1', 'u4', 'u5', 'u3', 'u6', 'u7', 'u8']} max={6} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Cấu hình dự án ---------- */
  function ProjectConfig({ p, tpl, onClose }) {
    const Modal = window.Modal, Field = window.Field, ML = window.MOD_LABEL || {};
    const PROG = { volume: 'Theo khối lượng (m³)', weighted: 'Theo tỷ trọng công việc', percent: 'Theo % thủ công' };
    const ALL = Object.keys(ML);
    return (
      <Modal title="Cấu hình dự án" sub={p.name + ' · ' + tpl.name} width={780} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Huỷ</button><button className="btn btn-primary" onClick={() => { window.toast('Đã lưu cấu hình dự án'); onClose(); }}><Icon name="save" size={14} />Lưu cấu hình</button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          <Field label="Mã dự án"><input className="input mono" defaultValue={p.code} readOnly style={{ background: 'var(--surface-2)' }} /></Field>
          <Field label="Tên dự án"><input className="input" defaultValue={p.name} /></Field>
          <Field label="Loại hình (Template)"><input className="input" defaultValue={tpl.name} readOnly style={{ background: 'var(--surface-2)' }} /></Field>
          <Field label="Chủ đầu tư"><input className="input" defaultValue={p.client} /></Field>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="label" style={{ marginBottom: 6 }}>Cách tính tiến độ</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(PROG).map(([k, v]) => (
              <label key={k} style={{ flex: 1, border: '1px solid ' + (tpl.progress === k ? 'var(--blue-500)' : 'var(--line)'), borderRadius: 7, padding: '9px 11px', display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', background: tpl.progress === k ? 'var(--blue-50)' : '#fff' }}>
                <span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid ' + (tpl.progress === k ? 'var(--blue-600)' : 'var(--ink-300)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tpl.progress === k && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-600)' }} />}</span>
                <span style={{ fontSize: 11.5 }}>{v}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="divider" style={{ margin: '16px 0' }} />
        <div className="label" style={{ marginBottom: 8 }}>Module / Tab kích hoạt cho dự án này</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
          {ALL.map(mk => { const on = tpl.modules.includes(mk); return (
            <label key={mk} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: on ? 'var(--blue-50)' : '#fff' }}>
              <span style={{ width: 30, height: 17, borderRadius: 10, background: on ? 'var(--blue-600)' : 'var(--ink-300)', position: 'relative', flex: 'none' }}><span style={{ position: 'absolute', top: 2, left: on ? 15 : 2, width: 13, height: 13, borderRadius: '50%', background: '#fff' }} /></span>{ML[mk]}</label>
          ); })}
        </div>
        {tpl.fields && tpl.fields.length > 0 && <>
          <div className="divider" style={{ margin: '16px 0' }} />
          <div className="label" style={{ marginBottom: 8 }}>Thông số dự án (theo Template "{tpl.name}")</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            {tpl.fields.map(f => <Field key={f.k} label={f.label}>{f.type === 'select' ? <select className="select" defaultValue={(p.meta || {})[f.k]}>{f.opts.map(o => <option key={o}>{o}</option>)}</select> : <input className="input" defaultValue={(p.meta || {})[f.k] != null ? (p.meta || {})[f.k] : ''} />}</Field>)}
          </div>
        </>}
      </Modal>
    );
  }

  /* ---------- Quản lý quyền trong công trường ---------- */
  function PermManage({ p, onClose }) {
    const Modal = window.Modal, Menu = window.Menu, Avatar = window.Avatar;
    const init = { pm: ['u1'], site: ['u4', 'u5'], watch: ['u2'], exec: ['u3', 'u6', 'u7', 'u8', 'u9'] };
    const [members, setMembers] = useState(init);
    const summary = {
      pm: { perm: 'Xem tất cả · không sửa/xoá', scope: 'Toàn dự án', cls: 'badge-blue' },
      site: { perm: 'Quản lý · ẩn tab Gói thầu', scope: 'Toàn dự án', cls: 'badge-green' },
      watch: { perm: 'Chỉ xem', scope: 'Toàn dự án', cls: 'badge-gray' },
      exec: { perm: 'Nhập liệu phần được giao', scope: 'Khu vực được giao', cls: 'badge-violet' },
    };
    const add = (rid, uid) => setMembers(m => ({ ...m, [rid]: [...m[rid], uid] }));
    const remove = (rid, uid) => setMembers(m => ({ ...m, [rid]: m[rid].filter(x => x !== uid) }));
    const avail = (rid) => DB.people.filter(pp => !members[rid].includes(pp.id));
    return (
      <Modal title="Quản lý quyền trong công trường" sub={p.name} width={860} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Đóng</button><button className="btn btn-primary" onClick={() => { window.toast('Đã lưu phân quyền công trường'); onClose(); }}><Icon name="save" size={14} />Lưu phân quyền</button></>}>
        <div className="auto-note" style={{ marginTop: 0, marginBottom: 14 }}><Icon name="shield-check" size={13} />Gán người dùng vào <b>vai trò RBAC</b> cho riêng công trường này. Quyền chi tiết (Module × Hành động) được định nghĩa tại <b>Cài đặt → Phân quyền</b>.</div>
        <div className="card" style={{ overflow: 'visible' }}>
          <table className="tbl">
            <thead><tr><th style={{ width: 170 }}>Vai trò</th><th>Thành viên trong công trường</th><th>Quyền (RBAC)</th><th>Phạm vi dữ liệu</th></tr></thead>
            <tbody>{DB.roles.map(r => { const s = summary[r.id]; return (
              <tr key={r.id}>
                <td><div style={{ fontWeight: 600, fontSize: 12.5 }}>{r.name}</div><div className="muted" style={{ fontSize: 10.5 }}>{r.sub}</div></td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {members[r.id].map(uid => (
                      <span key={uid} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 100, padding: '2px 7px 2px 2px', fontSize: 11.5 }}>
                        <Avatar id={uid} size="av-sm" />{DB.byId[uid].name}
                        <button onClick={() => remove(r.id, uid)} className="btn btn-ghost" style={{ width: 16, height: 16, padding: 0, borderRadius: '50%' }}><Icon name="x" size={11} /></button>
                      </span>
                    ))}
                    <Menu align="left" trigger={<button className="btn btn-sm" style={{ height: 24, padding: '0 8px' }}><Icon name="plus" size={12} />Thêm</button>}
                      items={avail(r.id).slice(0, 8).map(pp => ({ label: pp.name, icon: 'users', onClick: () => add(r.id, pp.id) }))} />
                  </div>
                </td>
                <td><span className={'badge ' + s.cls}>{s.perm}</span></td>
                <td><span className="badge badge-gray"><Icon name="map-pin" size={11} />{s.scope}</span></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => { window.toast('Mở Cài đặt → Phân quyền (RBAC)'); }}><Icon name="sliders" size={13} />Cấu hình quyền chi tiết (RBAC)<Icon name="arrow-right" size={12} /></button>
        </div>
      </Modal>
    );
  }

  function GroupedTopNav({ tab, setTab, visTabs }) {
    const Menu = window.Menu;
    const find = (id) => visTabs.find(t => t.id === id);
    return (
      <div style={{ position: 'sticky', top: 84, zIndex: 30, background: '#fff', borderBottom: '1px solid var(--line)', padding: '0 22px' }}>
        <div style={{ maxWidth: 1640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 4, height: 46 }}>
          {NAVGROUPS.map((grp, gi) => {
            const items = grp.ids.map(find).filter(Boolean);
            if (!items.length) return null;
            if (!grp.label) { // Tổng quan — nút đơn
              const t = items[0], active = tab === t.id;
              return <button key={gi} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 0, background: 'none', padding: '0 12px', height: 46, fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? 'var(--blue-700)' : 'var(--ink-600)', borderBottom: '2px solid ' + (active ? 'var(--blue-700)' : 'transparent'), cursor: 'pointer' }}><Icon name={t.icon} size={15} />{t.label}</button>;
            }
            const activeItem = items.find(t => t.id === tab);
            return (
              <Menu key={gi} align="left" trigger={
                <button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 0, background: 'none', padding: '0 12px', height: 46, fontSize: 12.5, fontWeight: activeItem ? 700 : 500, color: activeItem ? 'var(--blue-700)' : 'var(--ink-600)', borderBottom: '2px solid ' + (activeItem ? 'var(--blue-700)' : 'transparent'), cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {grp.label}{activeItem ? ' · ' + activeItem.label : ''}<Icon name="chevron-down" size={13} />
                </button>
              } items={items.map(t => ({ label: t.label, icon: t.id === tab ? 'check' : t.icon, onClick: () => setTab(t.id) }))} />
            );
          })}
        </div>
      </div>
    );
  }

  function CTDetail({ id, go, role, initTab }) {
    const p = DB.projects.find(x => x.id === id);
    const visTabs = TABS.filter(t => window.PERM ? window.PERM.canTab(role, t.id) : (!t.roles || t.roles.includes(role)));
    const [tab, setTab] = useState(initTab && visTabs.some(t => t.id === initTab) ? initTab : 'tong-quan');
    const tpl = DB.templates.find(t => t.id === p.template);
    const readOnly = role === 'watch' || role === 'pm';
    const [modal, setModal] = useState(null);
    const [navStyle, setNavStyle] = useState('left');
    React.useEffect(() => {
      if (window.__setMini) window.__setMini(navStyle === 'left');
      return () => { if (window.__setMini) window.__setMini(false); };
    }, [navStyle]);

    return (
      <div>
        {/* sticky header */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ padding: '14px 22px 14px', maxWidth: 1640, margin: '0 auto' }}>
            <div className="crumbs"><a onClick={() => go({ page: 'dashboard' })} style={{ cursor: 'pointer' }}>Trang chủ</a><Icon name="chevron-right" size={12} /><a onClick={() => go({ page: 'cong-truong' })} style={{ cursor: 'pointer' }}>Công trường</a><Icon name="chevron-right" size={12} /><span>{p.name}</span></div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ width: 42, height: 42, borderRadius: 10, background: tpl.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={tpl.icon} size={22} /></span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <h1 className="page-title" style={{ fontSize: 18 }}>{p.name}</h1>
                    {p.status === 'paused'
                      ? <span className="badge badge-amber"><span className="dot" />Tạm dừng</span>
                      : <span className="badge badge-green"><span className="dot" />Đang thi công</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--ink-500)', marginTop: 3 }}>
                    <span className="mono">{p.code}</span><span><Icon name="map-pin" size={12} /> {p.location}</span>
                    <span className="badge badge-sq" style={{ background: tpl.color + '1a', color: tpl.color }}>{tpl.name}</span>
                    {readOnly && <span className="badge badge-gray"><Icon name="eye" size={11} />Chỉ xem ({DB.roles.find(r => r.id === role).name})</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="seg" title="Bố cục điều hướng">
                  <button className={navStyle === 'left' ? 'active' : ''} onClick={() => setNavStyle('left')}><Icon name="list" size={13} />Menu dọc</button>
                  <button className={navStyle === 'top' ? 'active' : ''} onClick={() => setNavStyle('top')}><Icon name="kanban" size={13} style={{ transform: 'rotate(90deg)' }} />Tab nhóm</button>
                </div>
                <button className="btn btn-sm"><Icon name="link" size={14} />Liên kết đối tượng</button>
                <button className="btn btn-sm"><Icon name="download" size={14} />Xuất báo cáo</button>
                <window.Menu align="right" trigger={<button className="btn btn-sm btn-icon"><Icon name="more-h" size={16} /></button>} items={[{ label: 'Cấu hình dự án', icon: 'settings', onClick: () => setModal('config') }, { label: 'Quản lý quyền', icon: 'shield-check', onClick: () => setModal('perm') }, { sep: true }, { label: 'Tạm dừng dự án', icon: 'stop', danger: true, onClick: () => window.toast && window.toast('Đã chuyển dự án sang Tạm dừng (demo)', 'warn') }]} />
              </div>
            </div>
          </div>
        </div>

        {navStyle === 'top' && <GroupedTopNav tab={tab} setTab={setTab} visTabs={visTabs} />}
        <div style={{ display: 'flex', maxWidth: 1640, margin: '0 auto', alignItems: 'flex-start' }}>
          {navStyle === 'left' && <aside style={{ width: 214, flex: 'none', position: 'sticky', top: 84, alignSelf: 'flex-start', padding: '16px 10px 40px 18px' }}>
            {NAVGROUPS.map((grp, gi) => {
              const items = grp.ids.map(id => visTabs.find(t => t.id === id)).filter(Boolean);
              if (!items.length) return null;
              return (
                <div key={gi} style={{ marginBottom: 13 }}>
                  {grp.label && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 10px 6px' }}>{grp.label}</div>}
                  {items.map(t => {
                    const active = tab === t.id;
                    return (
                      <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 0, background: active ? 'var(--blue-50)' : 'transparent', color: active ? 'var(--blue-700)' : 'var(--ink-700)', padding: '8px 10px', borderRadius: 7, fontSize: 12.5, fontWeight: active ? 600 : 500, marginBottom: 2, textAlign: 'left', cursor: 'pointer', position: 'relative' }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }} onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                        {active && <span style={{ position: 'absolute', left: 0, top: 7, bottom: 7, width: 3, borderRadius: 2, background: 'var(--blue-600)' }} />}
                        <Icon name={t.icon} size={15} style={{ color: active ? 'var(--blue-600)' : 'var(--ink-400)' }} />
                        <span style={{ flex: 1 }}>{t.label}</span>
                        {t.id === 'goi-thau' && <Icon name="shield-check" size={12} style={{ color: 'var(--ink-300)' }} />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </aside>}
          <div className="grow" style={{ minWidth: 0, padding: '18px 22px 60px', borderLeft: navStyle === 'left' ? '1px solid var(--line)' : 'none' }}>
            {tab === 'tong-quan' && <Overview p={p} go={go} />}
            {tab !== 'tong-quan' && window.CTTabs && <window.CTTabs tab={tab} p={p} role={role} go={go} />}
          </div>
        </div>
        {modal === 'config' && <ProjectConfig p={p} tpl={tpl} onClose={() => setModal(null)} />}
        {modal === 'perm' && <PermManage p={p} onClose={() => setModal(null)} />}
      </div>
    );
  }

  window.CTDetail = CTDetail;
  window.CT_TABS = TABS;
})();
