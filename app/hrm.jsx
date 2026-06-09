/* HRM — Chấm công GPS, Công nhật & Ca máy, Bảng lương, Hồ sơ NS, Đơn từ.
   Cấp Tổng công ty: hiển thị nhân sự từ TẤT CẢ công trường (cột + bộ lọc Công trường). → window.HRM */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, dmy, nf, money, Avatar, Modal, Field, toast, Tabs, Stat, Search, DOC_ST } = window;

  /* ---- cấu hình công trường & ánh xạ nhân sự ---- */
  const SITES = [
    { id: 'p1', name: 'Cao tốc Hữu Nghị – Chi Lăng', short: 'HN–Chi Lăng', color: '#E2540C' },
    { id: 'p2', name: 'Đường vành đai KCN Đồng Văn', short: 'Đồng Văn', color: '#1D5E8C' },
    { id: 'p3', name: 'Cầu vượt Nút giao IC3', short: 'Cầu IC3', color: '#11888A' },
    { id: 'office', name: 'Văn phòng / Tổng công ty', short: 'Văn phòng', color: '#6D5BD0' },
  ];
  const PERSON_PROJ = { u1: 'office', u2: 'office', u3: 'p1', u4: 'p1', u5: 'p1', u6: 'p1', u7: 'p2', u8: 'p1', u9: 'office', u10: 'p1', u11: 'office', u12: 'office' };
  const siteOf = (id) => SITES.find(s => s.id === (PERSON_PROJ[id] || 'office'));
  const isOutsourced = (id) => !!(DB.outsourcedInfo && DB.outsourcedInfo[id]) || (DB.projectStaff || []).some(s => s.person === id && s.staffType === 'outsourced');
  const SiteTag = ({ pid }) => { const s = siteOf(pid); return <span className="badge badge-sq" style={{ background: s.color + '1a', color: s.color, fontSize: 10.5 }}>{s.short}</span>; };

  /* ---- hồ sơ chi tiết (sinh theo bộ phận) ---- */
  const certByDept = (dept, title) => {
    if (/lái xe|vận tải/i.test(title)) return ['GPLX hạng FC', 'Chứng chỉ ATLĐ nhóm 4'];
    if (/cơ giới|lái máy|lái lu|vận hành/i.test(dept + title)) return ['Chứng chỉ vận hành máy hạng II', 'ATLĐ nhóm 3', 'Sơ cấp cứu'];
    if (/kỹ thuật/i.test(dept)) return ['Kỹ sư XD Cầu đường', 'Chứng chỉ giám sát', 'ATLĐ nhóm 2'];
    if (/kế toán/i.test(dept)) return ['Chứng chỉ kế toán trưởng'];
    if (/sửa chữa|cơ khí/i.test(dept)) return ['Thợ sửa chữa bậc 5/7', 'Hàn điện'];
    return ['ATLĐ nhóm 1'];
  };
  const hrDetail = (p) => {
    const seed = p.id.charCodeAt(1);
    return {
      join: ['2021-06-15', '2022-03-01', '2020-11-20', '2023-01-10', '2019-08-05'][seed % 5],
      contract: seed % 3 === 0 ? 'Không xác định thời hạn' : (seed % 3 === 1 ? 'Xác định 24 tháng' : 'Thời vụ 12 tháng'),
      birth: 1985 + (seed % 12),
      home: ['Lạng Sơn', 'Bắc Giang', 'Hà Nam', 'Thái Nguyên', 'Hà Nội'][seed % 5],
      idCard: '0240' + (88000000 + seed * 137911).toString().slice(0, 8),
      bhxh: (seed % 2 === 0),
      base: (DB.payroll.find(pr => pr.person === p.id) || {}).base || 8 + (seed % 5),
      certs: certByDept(p.dept, p.title),
    };
  };

  /* ---- thanh lọc công trường (chỉ ở cấp Tổng công ty) ---- */
  function SiteFilter({ scope, value, onChange }) {
    if (scope && scope !== 'company') {
      const s = SITES.find(x => x.id === scope);
      return <span className="badge badge-sq" style={{ background: (s ? s.color : '#888') + '1a', color: s ? s.color : '#888', height: 30, padding: '0 11px' }}><Icon name="map-pin" size={12} />{s ? s.name : scope}</span>;
    }
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className={'chip ' + (value === 'all' ? 'active' : '')} onClick={() => onChange('all')}>Tất cả công trường</button>
        {SITES.map(s => <button key={s.id} className={'chip ' + (value === s.id ? 'active' : '')} onClick={() => onChange(s.id)}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.short}</button>)}
      </div>
    );
  }
  const useSite = (scope) => useState(scope && scope !== 'company' ? scope : 'all');
  const inSite = (pid, site) => site === 'all' ? true : (PERSON_PROJ[pid] || 'office') === site;

  const crumb = (go, label) => <div className="crumbs"><a onClick={() => go({ page: 'dashboard' })} style={{ cursor: 'pointer' }}>Trang chủ</a><Icon name="chevron-right" size={12} /><span>Nhân sự</span><Icon name="chevron-right" size={12} /><span>{label}</span></div>;
  const Page = ({ go, title, label, right, children }) => <div className="page"><div className="page-head"><div>{crumb(go, label)}<h1 className="page-title">{title}</h1></div>{right}</div>{children}</div>;
  const TS_ST = { in: { label: 'Có mặt', cls: 'badge-green' }, late: { label: 'Đi muộn', cls: 'badge-amber' }, off: { label: 'Vắng', cls: 'badge-red' } };

  /* ============ Chấm công GPS ============ */
  function ChamCong({ go, scope }) {
    const [site, setSite] = useSite(scope);
    const ts = DB.timesheet.filter(t => inSite(t.person, site));
    const present = ts.filter(t => t.status !== 'off');
    const pins = [[42, 55], [58, 40], [50, 68], [66, 60], [38, 45], [72, 48], [55, 30]];
    const company = !scope || scope === 'company';
    return (
      <Page go={go} title="Chấm công GPS" label="Chấm công GPS" right={<div style={{ display: 'flex', gap: 8 }}><input className="input" type="date" defaultValue="2026-05-16" style={{ width: 150 }} /><button className="btn btn-sm"><Icon name="download" size={14} />Xuất bảng công</button></div>}>
        <div style={{ marginBottom: 12 }}><SiteFilter scope={scope} value={site} onChange={setSite} /></div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng nhân sự" icon="users" value={ts.length} unit="người" edge="var(--blue-500)" />
          <Stat label="Có mặt" icon="check-circle" value={ts.filter(t => t.status === 'in').length} edge="var(--green-500)" />
          <Stat label="Đi muộn" icon="clock" value={ts.filter(t => t.status === 'late').length} edge="var(--amber-500)" />
          <Stat label="Vắng" icon="x" value={ts.filter(t => t.status === 'off').length} edge="var(--red-500)" />
          <Stat label="Tổng giờ công" icon="target" value={nf(ts.reduce((s, t) => s + t.hours, 0), 1)} unit="giờ" edge="var(--violet-500)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head"><div className="card-title"><Icon name="crosshair" size={15} style={{ color: 'var(--orange-500)' }} />Vị trí chấm công (GPS)</div><span className="badge badge-green"><span className="dot" />{present.length} online</span></div>
            <div style={{ position: 'relative', aspectRatio: '4/3', background: 'linear-gradient(160deg,#eaf1ec,#e3ebf2)' }}>
              <svg viewBox="0 0 100 75" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                <defs><pattern id="g2" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#0c2a47" strokeWidth="0.2" opacity="0.08" /></pattern></defs>
                <rect width="100" height="75" fill="url(#g2)" />
                <path d="M5 60 Q 30 50 50 55 T 95 40" fill="none" stroke="#c2ccd4" strokeWidth="4" strokeLinecap="round" />
                <path d="M5 60 Q 30 50 50 55 T 95 40" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="55" cy="50" r="26" fill="var(--blue-500)" opacity="0.07" stroke="var(--blue-400)" strokeWidth="0.4" strokeDasharray="1 1" />
              </svg>
              {present.slice(0, pins.length).map((t, i) => (
                <div key={i} style={{ position: 'absolute', left: pins[i][0] + '%', top: pins[i][1] + '%', transform: 'translate(-50%,-100%)' }} title={DB.byId[t.person].name}>
                  <div style={{ width: 22, height: 22, borderRadius: '50% 50% 50% 0', background: DB.byId[t.person].color, transform: 'rotate(-45deg)', border: '2px solid #fff', boxShadow: 'var(--shadow-sm)' }} />
                </div>
              ))}
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,.92)', borderRadius: 7, padding: '6px 10px', fontSize: 11, boxShadow: 'var(--shadow-sm)' }}><Icon name="map-pin" size={12} /> {site === 'all' ? 'Tất cả công trường' : (SITES.find(s => s.id === site) || {}).name}</div>
            </div>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head"><div className="card-title"><Icon name="clock" size={15} style={{ color: 'var(--blue-600)' }} />Bảng chấm công hôm nay</div></div>
            <table className="tbl"><thead><tr><th>Nhân sự</th>{company && <th>Công trường</th>}<th>Vào ca</th><th>Phương thức</th><th>Vị trí GPS</th><th className="num">Giờ công</th><th>Trạng thái</th></tr></thead>
              <tbody>{ts.map(t => (
                <tr key={t.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar id={t.person} size="av-sm" /><div><div style={{ fontWeight: 600, fontSize: 12 }}>{DB.byId[t.person].name}</div><div className="muted" style={{ fontSize: 10 }}>{DB.byId[t.person].title}</div></div></div></td>
                  {company && <td><SiteTag pid={t.person} /></td>}
                  <td className="mono" style={{ fontSize: 12 }}>{t.checkIn || '—'}</td>
                  <td>{t.method ? <span className="badge badge-blue" style={{ fontSize: 10 }}>{t.method === 'GPS + WiFi' ? <><Icon name="wifi" size={10} />GPS+WiFi</> : <><Icon name="crosshair" size={10} />GPS</>}</span> : '—'}</td>
                  <td style={{ fontSize: 11.5 }}>{t.gps || '—'}</td>
                  <td className="num"><b>{t.hours ? nf(t.hours, 1) : '—'}</b>{t.ot ? <span className="badge badge-orange" style={{ fontSize: 9, marginLeft: 4 }}>+{t.ot}h TC</span> : null}</td>
                  <td><span className={'badge ' + TS_ST[t.status].cls}>{TS_ST[t.status].label}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </Page>
    );
  }

  /* ============ Công nhật & Ca máy ============ */
  function CongMay({ go, scope }) {
    const [tab, setTab] = useState('cong');
    const [site, setSite] = useSite(scope);
    const company = !scope || scope === 'company';
    const pr = DB.payroll.filter(p => inSite(p.person, site));
    return (
      <Page go={go} title="Công nhật & Ca máy" label="Công nhật & Ca máy" right={<div style={{ display: 'flex', gap: 8 }}><input className="input" defaultValue="Tháng 5/2026" style={{ width: 140 }} readOnly /><button className="btn btn-sm"><Icon name="download" size={14} />Xuất bảng công</button></div>}>
        <div style={{ marginBottom: 12 }}><SiteFilter scope={scope} value={site} onChange={setSite} /></div>
        <div className="auto-note" style={{ marginTop: 0, marginBottom: 14 }}><Icon name="link" size={13} />Bảng công nhật và ca máy được tổng hợp tự động từ chấm công GPS, nhật trình máy và phiếu tăng ca theo từng công trường.</div>
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'cong', label: 'Công nhật (người)', icon: 'users' }, { id: 'may', label: 'Ca máy (thiết bị)', icon: 'excavator' }]} active={tab} onChange={setTab} /></div>
        {tab === 'cong' ? (
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="tbl"><thead><tr><th>Nhân sự</th><th>Bộ phận</th>{company && <th>Công trường</th>}<th className="num">Công chuẩn</th><th className="num">Công thực tế</th><th className="num">Giờ tăng ca</th><th className="num">Công ca đêm</th><th className="num">Tổng quy đổi</th></tr></thead>
              <tbody>{pr.map(p => { const per = DB.byId[p.person]; return (
                <tr key={p.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar id={p.person} size="av-sm" />{per.name}</div></td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{per.dept}</td>
                  {company && <td><SiteTag pid={p.person} /></td>}
                  <td className="num">{p.std}</td><td className="num"><b>{p.days}</b></td>
                  <td className="num">{p.ot ? nf(p.ot, 1) + 'h' : '—'}</td>
                  <td className="num">{p.machineShift ? nf(p.machineShift, 1) : '—'}</td>
                  <td className="num"><b>{nf(p.days + p.ot / 8 + p.machineShift, 1)}</b></td>
                </tr>
              ); })}</tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="tbl"><thead><tr><th>Thiết bị</th><th>Người vận hành</th><th className="num">Số ca</th><th className="num">Tổng giờ máy</th><th className="num">Giờ TB/ca</th><th className="num">Sản lượng</th><th>Công trường</th></tr></thead>
              <tbody>{DB.equipment.filter(e => e.kind === 'machine' && e.status !== 'liquidated').map(e => (
                <tr key={e.id} className="clickable" onClick={() => go({ page: 'kho-thiet-bi', sub: 'detail', id: e.id })}>
                  <td style={{ fontWeight: 600, fontSize: 12.5 }}>{e.name}</td>
                  <td>{e.driver ? DB.byId[e.driver].name : '—'}</td>
                  <td className="num">{12 + (e.id.charCodeAt(1) % 8)}</td>
                  <td className="num"><b>{nf(e.hourNow - e.hourStart, 1)}</b></td>
                  <td className="num">8.0</td>
                  <td className="num">{nf((e.hourNow - e.hourStart) * 1.5)} m³</td>
                  <td style={{ fontSize: 12 }}>{e.locName}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Page>
    );
  }

  /* ============ Bảng lương ============ */
  function BangLuong({ go, scope }) {
    const [site, setSite] = useSite(scope);
    const company = !scope || scope === 'company';
    const rows = DB.payroll.filter(p => inSite(p.person, site));
    const total = rows.reduce((s, p) => s + p.gross, 0);
    return (
      <Page go={go} title="Bảng lương" label="Bảng lương" right={<div style={{ display: 'flex', gap: 8 }}><input className="input" defaultValue="Tháng 5/2026" style={{ width: 140 }} readOnly /><button className="btn btn-sm btn-primary"><Icon name="check" size={14} />Chốt lương</button></div>}>
        <div style={{ marginBottom: 12 }}><SiteFilter scope={scope} value={site} onChange={setSite} /></div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng quỹ lương" icon="wallet" value={nf(total, 1)} unit="tr" edge="var(--blue-500)" />
          <Stat label="Số người" icon="users" value={rows.length} edge="var(--violet-500)" />
          <Stat label="Tổng giờ tăng ca" icon="clock" value={nf(rows.reduce((s, p) => s + p.ot, 0), 0)} unit="giờ" edge="var(--orange-500)" />
          <Stat label="Lương TB/người" icon="money" value={rows.length ? nf(total / rows.length, 1) : 0} unit="tr" edge="var(--green-500)" />
        </div>
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="tbl"><thead><tr><th>Nhân sự</th><th>Bộ phận</th>{company && <th>Công trường</th>}<th className="num">Lương cơ bản</th><th className="num">Công</th><th className="num">Tăng ca</th><th className="num">Lương ca máy</th><th className="num">Khấu trừ</th><th className="num">Thực lĩnh</th><th></th></tr></thead>
            <tbody>{rows.map(p => { const per = DB.byId[p.person]; return (
              <tr key={p.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar id={p.person} size="av-sm" />{per.name}</div></td>
                <td className="muted" style={{ fontSize: 11.5 }}>{per.dept}</td>
                {company && <td><SiteTag pid={p.person} /></td>}
                <td className="num">{nf(p.base, 1)}</td>
                <td className="num">{p.days}/{p.std}</td>
                <td className="num">{p.otPay ? nf(p.otPay, 2) : '—'}</td>
                <td className="num">{p.machineShift ? nf(p.machineShift, 1) : '—'}</td>
                <td className="num down">-{nf(p.deduct, 1)}</td>
                <td className="num"><b style={{ color: 'var(--blue-700)' }}>{nf(p.gross, 1)} tr</b></td>
                <td style={{ textAlign: 'right' }}><button className="btn btn-icon btn-sm btn-ghost" onClick={() => toast('Đã gửi phiếu lương cho ' + per.name)}><Icon name="file" size={14} /></button></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </Page>
    );
  }

  /* ============ Hồ sơ nhân sự ============ */
  function HoSoNS({ go, scope }) {
    const [site, setSite] = useSite(scope);
    const [q, setQ] = useState('');
    const [sel, setSel] = useState(null);
    const company = !scope || scope === 'company';
    const list = DB.people.filter(p => inSite(p.id, site) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.title.toLowerCase().includes(q.toLowerCase())));
    return (
      <Page go={go} title="Hồ sơ nhân sự" label="Hồ sơ nhân sự" right={<button className="btn btn-sm btn-primary"><Icon name="plus" size={14} />Thêm nhân sự</button>}>
        <div style={{ marginBottom: 12 }}><SiteFilter scope={scope} value={site} onChange={setSite} /></div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Cơ hữu / Thuê ngoài" icon="users" value={list.filter(p => !isOutsourced(p.id)).length} unit={'/ ' + list.filter(p => isOutsourced(p.id)).length + ' thuê'} edge="var(--blue-500)" />
          <Stat label="Tại công trường" icon="road" value={list.filter(p => PERSON_PROJ[p.id] !== 'office').length} edge="var(--orange-500)" />
          <Stat label="Khối văn phòng" icon="building" value={list.filter(p => PERSON_PROJ[p.id] === 'office').length} edge="var(--violet-500)" />
          <Stat label="HĐ không thời hạn" icon="shield-check" value={list.filter(p => hrDetail(p).contract.startsWith('Không')).length} edge="var(--green-500)" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><Search placeholder="Tìm tên / chức vụ…" value={q} onChange={setQ} w={240} /><button className="chip"><Icon name="filter" size={13} />Bộ phận</button></div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Nhân sự</th><th>Loại</th><th>Chức vụ</th><th>Bộ phận</th>{company && <th>Công trường</th>}<th>Điện thoại</th><th>Hợp đồng</th><th></th></tr></thead>
            <tbody>{list.map(p => { const d = hrDetail(p); const out = isOutsourced(p.id); return (
              <tr key={p.id} className="clickable" onClick={() => setSel(p)}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar id={p.id} /><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>{p.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>NV-{p.id.slice(1).padStart(3, '0')}</div></div></div></td>
                <td>{out ? <span className="badge badge-orange"><Icon name="partner" size={10} />Thuê ngoài</span> : <span className="badge badge-blue"><Icon name="customer" size={10} />Cơ hữu</span>}</td>
                <td>{p.title}</td>
                <td className="muted" style={{ fontSize: 12 }}>{p.dept}</td>
                {company && <td><SiteTag pid={p.id} /></td>}
                <td className="mono" style={{ fontSize: 12 }}>{p.phone}</td>
                <td><span className={'badge ' + (d.contract.startsWith('Không') ? 'badge-green' : 'badge-gray')}>{d.contract.startsWith('Không') ? 'Vô thời hạn' : d.contract.split(' ').slice(0, 2).join(' ')}</span></td>
                <td style={{ textAlign: 'right' }}><Icon name="chevron-right" size={15} style={{ color: 'var(--ink-300)' }} /></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
        {sel && (window.PersonDetail ? <window.PersonDetail pid={sel.id} onClose={() => setSel(null)} /> : <EmpDetail p={sel} onClose={() => setSel(null)} />)}
      </Page>
    );
  }

  function EmpDetail({ p, onClose }) {
    const [tab, setTab] = useState('info');
    const d = hrDetail(p);
    const s = siteOf(p.id);
    const ts = DB.timesheet.find(t => t.person === p.id);
    return (
      <Modal title={p.name} sub={'NV-' + p.id.slice(1).padStart(3, '0') + ' · ' + p.title} width={680} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Đóng</button><button className="btn"><Icon name="edit" size={14} />Sửa hồ sơ</button></>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
          <Avatar id={p.id} size="av-lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{p.title} · {p.dept}</div>
            <div style={{ marginTop: 5, display: 'flex', gap: 6 }}><SiteTag pid={p.id} /><span className={'badge ' + (d.contract.startsWith('Không') ? 'badge-green' : 'badge-gray')}>{d.contract}</span></div>
          </div>
          <div style={{ textAlign: 'right' }}><div className="muted" style={{ fontSize: 11 }}>Lương cơ bản</div><div className="mono" style={{ fontWeight: 700, fontSize: 15, color: 'var(--blue-700)' }}>{nf(d.base, 1)} tr</div></div>
        </div>
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'info', label: 'Thông tin', icon: 'customer' }, { id: 'contract', label: 'Hợp đồng & lương', icon: 'file' }, { id: 'certs', label: 'Chứng chỉ', icon: 'shield-check' }, { id: 'cham', label: 'Chấm công', icon: 'clock' }]} active={tab} onChange={setTab} /></div>
        {tab === 'info' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 16px' }}>
          {[['Họ tên', p.name], ['Năm sinh', d.birth], ['Số CCCD', d.idCard], ['Quê quán', d.home], ['Điện thoại', p.phone], ['Công trường', s.name], ['Bộ phận', p.dept], ['Chức vụ', p.title]].map(([k, v]) => <div key={k}><div className="muted" style={{ fontSize: 11 }}>{k}</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2, fontFamily: k === 'Số CCCD' || k === 'Điện thoại' ? 'var(--mono)' : 'inherit' }}>{v}</div></div>)}
        </div>}
        {tab === 'contract' && <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 16px', marginBottom: 14 }}>
            {[['Loại hợp đồng', d.contract], ['Ngày vào làm', dmy(d.join)], ['Lương cơ bản', nf(d.base, 1) + ' tr/tháng'], ['Hình thức trả', PERSON_PROJ[p.id] === 'office' ? 'Lương tháng' : 'Công nhật + ca máy'], ['BHXH / BHYT', d.bhxh ? 'Đã đóng' : 'Chưa đăng ký'], ['Phụ cấp', PERSON_PROJ[p.id] !== 'office' ? 'Công trường + ăn ca' : 'Trách nhiệm']].map(([k, v]) => <div key={k}><div className="muted" style={{ fontSize: 11 }}>{k}</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{v}</div></div>)}
          </div>
          <div className="auto-note" style={{ marginTop: 0 }}><Icon name="info" size={13} />Lương thực lĩnh được tính tự động từ Công nhật & Ca máy + phiếu tăng ca của tháng.</div>
        </div>}
        {tab === 'certs' && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {d.certs.map((c, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8 }}><Icon name="shield-check" size={16} style={{ color: 'var(--green-600)' }} /><span style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{c}</span><span className="badge badge-green">Còn hiệu lực</span></div>)}
        </div>}
        {tab === 'cham' && <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl tbl-compact"><thead><tr><th>Ngày</th><th>Vào ca</th><th className="num">Giờ công</th><th className="num">Tăng ca</th><th>Trạng thái</th></tr></thead>
            <tbody>{['16/05', '15/05', '14/05', '13/05'].map((day, i) => <tr key={i}><td className="mono">{day}/2026</td><td className="mono">{ts && ts.checkIn ? ts.checkIn : '07:0' + i}</td><td className="num">{nf(7.5 + (i % 2) * 0.5, 1)}</td><td className="num">{i % 2 === 0 ? '3h' : '—'}</td><td>{i === 2 ? <span className="badge badge-amber">Đi muộn</span> : <span className="badge badge-green">Có mặt</span>}</td></tr>)}</tbody>
          </table>
        </div>}
      </Modal>
    );
  }

  /* ============ Đơn từ & Tăng ca ============ */
  function DonTu({ go, scope }) {
    const [tab, setTab] = useState('leave');
    const [site, setSite] = useSite(scope);
    const company = !scope || scope === 'company';
    const ot = DB.overtime.filter(o => inSite(o.person, site));
    return (
      <Page go={go} title="Đơn từ & Tăng ca" label="Đơn từ & Tăng ca">
        <div style={{ marginBottom: 12 }}><SiteFilter scope={scope} value={site} onChange={setSite} /></div>
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'leave', label: 'Đơn xin nghỉ', icon: 'calendar', count: 2 }, { id: 'ot', label: 'Đơn tăng ca', icon: 'clock', count: ot.length }, { id: 'bu', label: 'Đơn làm bù', icon: 'refresh', count: 2 }, { id: 'doi-tb', label: 'Đơn đổi thiết bị', icon: 'excavator', count: 2 }]} active={tab} onChange={setTab} /></div>
        {tab === 'ot' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="tbl"><thead><tr><th>Ngày</th><th>Người tăng ca</th>{company && <th>Công trường</th>}<th>Thiết bị</th><th>Nội dung</th><th>Thời gian</th><th className="num">Số giờ</th><th>Trạng thái</th></tr></thead>
              <tbody>{ot.map(o => { const e = DB.equipment.find(x => x.id === o.equip); return (
                <tr key={o.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{dmy(o.date)}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={o.person} size="av-sm" />{DB.byId[o.person].name}</div></td>
                  {company && <td><SiteTag pid={o.person} /></td>}
                  <td style={{ fontSize: 12 }}>{e ? e.name : '—'}</td>
                  <td style={{ fontSize: 12 }}>{o.content}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{o.from} – {o.to}</td>
                  <td className="num"><b>{nf(o.hours, 1)}h</b></td>
                  <td>{o.status === 'approved' ? <Badge map={DOC_ST} k="approved" /> : <div style={{ display: 'flex', gap: 5 }}><button className="btn btn-sm" style={{ height: 24, padding: '0 8px', borderColor: 'var(--green-500)', color: 'var(--green-600)' }} onClick={() => toast('Đã duyệt phiếu tăng ca')}>Duyệt</button><button className="btn btn-sm btn-ghost" style={{ height: 24, padding: '0 8px' }}>Từ chối</button></div>}</td>
                </tr>
              ); })}</tbody>
            </table>
          </div>
        )}
        {tab === 'leave' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="tbl"><thead><tr><th>Người gửi</th>{company && <th>Công trường</th>}<th>Loại đơn</th><th>Từ ngày</th><th>Đến ngày</th><th>Lý do</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id="u5" size="av-sm" />Phạm Minh Đức</div></td>{company && <td><SiteTag pid="u5" /></td>}<td>Nghỉ phép năm</td><td className="mono">18/05/2026</td><td className="mono">19/05/2026</td><td className="muted">Việc gia đình</td><td><Badge map={DOC_ST} k="pending" /></td></tr>
                <tr><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id="u8" size="av-sm" />Đỗ Thị Mai</div></td>{company && <td><SiteTag pid="u8" /></td>}<td>Nghỉ ốm</td><td className="mono">14/05/2026</td><td className="mono">14/05/2026</td><td className="muted">Khám bệnh</td><td><Badge map={DOC_ST} k="approved" /></td></tr>
              </tbody>
            </table>
          </div>
        )}
        {tab === 'bu' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="auto-note" style={{ margin: 12 }}><Icon name="info" size={13} />Đơn làm bù cho ngày nghỉ lễ/chủ nhật đã đi làm — quy đổi sang ngày công bù hoặc lương ×200%.</div>
            <table className="tbl"><thead><tr><th>Người gửi</th>{company && <th>Công trường</th>}<th>Ngày làm bù</th><th>Bù cho ngày</th><th className="num">Số công</th><th>Lý do</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id="u6" size="av-sm" />Hoàng Văn Hải</div></td>{company && <td><SiteTag pid="u6" /></td>}<td className="mono">11/05/2026 (CN)</td><td className="mono">02/05/2026</td><td className="num"><b>1.0</b></td><td className="muted">Đi làm CN, xin nghỉ bù lễ</td><td><div style={{ display: 'flex', gap: 5 }}><button className="btn btn-sm" style={{ height: 24, padding: '0 8px', borderColor: 'var(--green-500)', color: 'var(--green-600)' }} onClick={() => toast('Đã duyệt đơn làm bù')}>Duyệt</button><button className="btn btn-sm btn-ghost" style={{ height: 24, padding: '0 8px' }}>Từ chối</button></div></td></tr>
                <tr><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id="u7" size="av-sm" />Lý Văn Phúc</div></td>{company && <td><SiteTag pid="u7" /></td>}<td className="mono">04/05/2026 (CN)</td><td className="mono">30/04/2026</td><td className="num"><b>1.0</b></td><td className="muted">Tăng ca lễ 30/4</td><td><Badge map={DOC_ST} k="approved" /></td></tr>
              </tbody>
            </table>
          </div>
        )}
        {tab === 'doi-tb' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="auto-note" style={{ margin: 12 }}><Icon name="info" size={13} />Đơn đề nghị đổi/điều chuyển thiết bị giữa người vận hành hoặc công trường — duyệt xong tự cập nhật gán thiết bị.</div>
            <table className="tbl"><thead><tr><th>Người đề nghị</th>{company && <th>Công trường</th>}<th>Thiết bị</th><th>Từ → đến</th><th>Lý do</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id="u4" size="av-sm" />Trần Văn Cường</div></td>{company && <td><SiteTag pid="u4" /></td>}<td style={{ fontSize: 12 }}>Lu rung XCMG (Lu 4.1)</td><td style={{ fontSize: 12 }}>Lý V. Phúc → Hoàng V. Hải</td><td className="muted">Phúc nghỉ phép 2 ngày</td><td className="mono">15/05/2026</td><td><div style={{ display: 'flex', gap: 5 }}><button className="btn btn-sm" style={{ height: 24, padding: '0 8px', borderColor: 'var(--green-500)', color: 'var(--green-600)' }} onClick={() => toast('Đã duyệt & cập nhật gán thiết bị')}>Duyệt</button><button className="btn btn-sm btn-ghost" style={{ height: 24, padding: '0 8px' }}>Từ chối</button></div></td></tr>
                <tr><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id="u5" size="av-sm" />Phạm Minh Đức</div></td>{company && <td><SiteTag pid="u5" /></td>}<td style={{ fontSize: 12 }}>Xe Howo 3 chân (Xe 57)</td><td style={{ fontSize: 12 }}>HN–Chi Lăng → Đồng Văn</td><td className="muted">Điều phối tăng cường</td><td className="mono">13/05/2026</td><td><Badge map={DOC_ST} k="approved" /></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </Page>
    );
  }

  window.HRM = function HRM({ nav, go, scope }) {
    switch (nav.page) {
      case 'hrm-cham-cong': return <ChamCong go={go} scope={scope} />;
      case 'hrm-cong-may': return <CongMay go={go} scope={scope} />;
      case 'hrm-luong': return <BangLuong go={go} scope={scope} />;
      case 'hrm-list': return <HoSoNS go={go} scope={scope} />;
      case 'hrm-don-tu': return <DonTu go={go} scope={scope} />;
      default: return <ChamCong go={go} scope={scope} />;
    }
  };
})();
