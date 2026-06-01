/* HRM — Chấm công GPS, Công nhật & Ca máy, Bảng lương, Hồ sơ NS, Đơn từ → window.HRM */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, dmy, nf, money, Avatar, Modal, Field, toast, Tabs, Stat, SectionHead, Search, DOC_ST } = window;

  const crumb = (go, label) => <div className="crumbs"><a onClick={() => go({ page: 'dashboard' })} style={{ cursor: 'pointer' }}>Trang chủ</a><Icon name="chevron-right" size={12} /><span>Nhân sự</span><Icon name="chevron-right" size={12} /><span>{label}</span></div>;
  const Page = ({ go, title, label, right, children }) => <div className="page"><div className="page-head"><div>{crumb(go, label)}<h1 className="page-title">{title}</h1></div>{right}</div>{children}</div>;

  const TS_ST = { in: { label: 'Có mặt', cls: 'badge-green' }, late: { label: 'Đi muộn', cls: 'badge-amber' }, off: { label: 'Vắng', cls: 'badge-red' } };

  /* ---------- Chấm công GPS ---------- */
  function ChamCong({ go }) {
    const ts = DB.timesheet;
    const present = ts.filter(t => t.status !== 'off');
    // pins on mini map
    const pins = [[42, 55], [58, 40], [50, 68], [66, 60], [38, 45], [72, 48], [55, 30]];
    return (
      <Page go={go} title="Chấm công GPS" label="Chấm công GPS" right={<div style={{ display: 'flex', gap: 8 }}><input className="input" type="date" defaultValue="2026-05-16" style={{ width: 150 }} /><button className="btn btn-sm"><Icon name="download" size={14} />Xuất bảng công</button></div>}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng nhân sự" icon="users" value={ts.length} unit="người" edge="var(--blue-500)" />
          <Stat label="Có mặt" icon="check-circle" value={ts.filter(t => t.status === 'in').length} edge="var(--green-500)" />
          <Stat label="Đi muộn" icon="clock" value={ts.filter(t => t.status === 'late').length} edge="var(--amber-500)" />
          <Stat label="Vắng" icon="x" value={ts.filter(t => t.status === 'off').length} edge="var(--red-500)" />
          <Stat label="Tổng giờ công" icon="target" value={nf(ts.reduce((s, t) => s + t.hours, 0), 1)} unit="giờ" edge="var(--violet-500)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14 }}>
          {/* GPS map */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head"><div className="card-title"><Icon name="crosshair" size={15} style={{ color: 'var(--orange-500)' }} />Vị trí chấm công (GPS)</div><span className="badge badge-green"><span className="dot" />{present.length} online</span></div>
            <div style={{ position: 'relative', aspectRatio: '4/3', background: 'linear-gradient(160deg,#eaf1ec,#e3ebf2)' }}>
              <svg viewBox="0 0 100 75" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                <defs><pattern id="g2" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#0c2a47" strokeWidth="0.2" opacity="0.08" /></pattern></defs>
                <rect width="100" height="75" fill="url(#g2)" />
                <path d="M5 60 Q 30 50 50 55 T 95 40" fill="none" stroke="#c2ccd4" strokeWidth="4" strokeLinecap="round" />
                <path d="M5 60 Q 30 50 50 55 T 95 40" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                {/* geofence */}
                <circle cx="55" cy="50" r="26" fill="var(--blue-500)" opacity="0.07" stroke="var(--blue-400)" strokeWidth="0.4" strokeDasharray="1 1" />
              </svg>
              {pins.map((p, i) => (
                <div key={i} style={{ position: 'absolute', left: p[0] + '%', top: p[1] + '%', transform: 'translate(-50%,-100%)' }} title={DB.byId[present[i % present.length].person].name}>
                  <div style={{ width: 22, height: 22, borderRadius: '50% 50% 50% 0', background: DB.byId[present[i % present.length].person].color, transform: 'rotate(-45deg)', border: '2px solid #fff', boxShadow: 'var(--shadow-sm)' }} />
                </div>
              ))}
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,.92)', borderRadius: 7, padding: '6px 10px', fontSize: 11, boxShadow: 'var(--shadow-sm)' }}><Icon name="map-pin" size={12} /> Km5+200, Đồng Đăng · Bán kính 200m</div>
            </div>
          </div>
          {/* timesheet */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head"><div className="card-title"><Icon name="clock" size={15} style={{ color: 'var(--blue-600)' }} />Bảng chấm công hôm nay</div></div>
            <table className="tbl"><thead><tr><th>Nhân sự</th><th>Vào ca</th><th>Phương thức</th><th>Vị trí GPS</th><th className="num">Giờ công</th><th>Trạng thái</th></tr></thead>
              <tbody>{ts.map(t => (
                <tr key={t.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar id={t.person} size="av-sm" /><div><div style={{ fontWeight: 600, fontSize: 12 }}>{DB.byId[t.person].name}</div><div className="muted" style={{ fontSize: 10 }}>{DB.byId[t.person].title}</div></div></div></td>
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

  /* ---------- Công nhật & Ca máy ---------- */
  function CongMay({ go }) {
    const [tab, setTab] = useState('cong');
    return (
      <Page go={go} title="Công nhật & Ca máy" label="Công nhật & Ca máy" right={<div style={{ display: 'flex', gap: 8 }}><input className="input" defaultValue="Tháng 5/2026" style={{ width: 140 }} readOnly /><button className="btn btn-sm"><Icon name="download" size={14} />Xuất bảng công</button></div>}>
        <div className="auto-note" style={{ marginTop: 0, marginBottom: 14 }}><Icon name="link" size={13} />Bảng công nhật và ca máy được tổng hợp tự động từ chấm công GPS, nhật trình máy và phiếu tăng ca.</div>
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'cong', label: 'Công nhật (người)', icon: 'users' }, { id: 'may', label: 'Ca máy (thiết bị)', icon: 'excavator' }]} active={tab} onChange={setTab} /></div>
        {tab === 'cong' ? (
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="tbl"><thead><tr><th>Nhân sự</th><th>Bộ phận</th><th className="num">Công chuẩn</th><th className="num">Công thực tế</th><th className="num">Giờ tăng ca</th><th className="num">Công ca đêm</th><th className="num">Tổng quy đổi</th></tr></thead>
              <tbody>{DB.payroll.map(pr => { const p = DB.byId[pr.person]; return (
                <tr key={pr.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar id={pr.person} size="av-sm" />{p.name}</div></td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{p.dept}</td>
                  <td className="num">{pr.std}</td>
                  <td className="num"><b>{pr.days}</b></td>
                  <td className="num">{pr.ot ? nf(pr.ot, 1) + 'h' : '—'}</td>
                  <td className="num">{pr.machineShift ? nf(pr.machineShift, 1) : '—'}</td>
                  <td className="num"><b>{nf(pr.days + pr.ot / 8 + pr.machineShift, 1)}</b></td>
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

  /* ---------- Bảng lương ---------- */
  function BangLuong({ go }) {
    const total = DB.payroll.reduce((s, p) => s + p.gross, 0);
    return (
      <Page go={go} title="Bảng lương" label="Bảng lương" right={<div style={{ display: 'flex', gap: 8 }}><input className="input" defaultValue="Tháng 5/2026" style={{ width: 140 }} readOnly /><button className="btn btn-sm btn-primary"><Icon name="check" size={14} />Chốt lương</button></div>}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng quỹ lương" icon="wallet" value={nf(total, 1)} unit="tr" edge="var(--blue-500)" />
          <Stat label="Số người" icon="users" value={DB.payroll.length} edge="var(--violet-500)" />
          <Stat label="Tổng giờ tăng ca" icon="clock" value={nf(DB.payroll.reduce((s, p) => s + p.ot, 0), 0)} unit="giờ" edge="var(--orange-500)" />
          <Stat label="Lương TB/người" icon="money" value={nf(total / DB.payroll.length, 1)} unit="tr" edge="var(--green-500)" />
        </div>
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="tbl"><thead><tr><th>Nhân sự</th><th>Bộ phận</th><th className="num">Lương cơ bản</th><th className="num">Công</th><th className="num">Tăng ca</th><th className="num">Lương ca máy</th><th className="num">Khấu trừ</th><th className="num">Thực lĩnh</th><th></th></tr></thead>
            <tbody>{DB.payroll.map(pr => { const p = DB.byId[pr.person]; return (
              <tr key={pr.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar id={pr.person} size="av-sm" />{p.name}</div></td>
                <td className="muted" style={{ fontSize: 11.5 }}>{p.dept}</td>
                <td className="num">{nf(pr.base, 1)}</td>
                <td className="num">{pr.days}/{pr.std}</td>
                <td className="num">{pr.otPay ? nf(pr.otPay, 2) : '—'}</td>
                <td className="num">{pr.machineShift ? nf(pr.machineShift, 1) : '—'}</td>
                <td className="num down">-{nf(pr.deduct, 1)}</td>
                <td className="num"><b style={{ color: 'var(--blue-700)' }}>{nf(pr.gross, 1)} tr</b></td>
                <td style={{ textAlign: 'right' }}><button className="btn btn-icon btn-sm btn-ghost" onClick={() => toast('Đã gửi phiếu lương cho ' + p.name)}><Icon name="file" size={14} /></button></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </Page>
    );
  }

  /* ---------- Hồ sơ nhân sự ---------- */
  function HoSoNS({ go }) {
    const [tab, setTab] = useState('all');
    return (
      <Page go={go} title="Hồ sơ nhân sự" label="Hồ sơ nhân sự" right={<button className="btn btn-sm btn-primary"><Icon name="plus" size={14} />Thêm nhân sự</button>}>
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'all', label: 'Tất cả', count: DB.people.length }, { id: 'in', label: 'Nội bộ', count: 10 }, { id: 'out', label: 'Thuê ngoài', count: 2 }]} active={tab} onChange={setTab} /></div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><Search placeholder="Tìm nhân sự…" /><button className="chip"><Icon name="filter" size={13} />Bộ phận</button></div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Nhân sự</th><th>Chức vụ</th><th>Bộ phận</th><th>Điện thoại</th><th>Loại</th><th></th></tr></thead>
            <tbody>{DB.people.map(p => (
              <tr key={p.id} className="clickable">
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar id={p.id} /><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>{p.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>NV-{p.id.slice(1).padStart(3, '0')}</div></div></div></td>
                <td>{p.title}</td>
                <td className="muted" style={{ fontSize: 12 }}>{p.dept}</td>
                <td className="mono" style={{ fontSize: 12 }}>{p.phone}</td>
                <td><span className="badge badge-blue">Nội bộ</span></td>
                <td style={{ textAlign: 'right' }}><button className="btn btn-icon btn-sm btn-ghost"><Icon name="phone" size={14} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Page>
    );
  }

  /* ---------- Đơn từ & Tăng ca ---------- */
  function DonTu({ go }) {
    const [tab, setTab] = useState('ot');
    return (
      <Page go={go} title="Đơn từ & Tăng ca" label="Đơn từ & Tăng ca">
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'ot', label: 'Phiếu tăng ca', icon: 'clock', count: DB.overtime.length }, { id: 'leave', label: 'Đơn nghỉ phép', icon: 'calendar', count: 2 }]} active={tab} onChange={setTab} /></div>
        {tab === 'ot' ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="tbl"><thead><tr><th>Ngày</th><th>Người tăng ca</th><th>Thiết bị</th><th>Nội dung</th><th>Thời gian</th><th className="num">Số giờ</th><th>Xác nhận</th><th>Trạng thái</th></tr></thead>
              <tbody>{DB.overtime.map(o => { const e = DB.equipment.find(x => x.id === o.equip); return (
                <tr key={o.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{dmy(o.date)}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={o.person} size="av-sm" />{DB.byId[o.person].name}</div></td>
                  <td style={{ fontSize: 12 }}>{e ? e.name : '—'}</td>
                  <td style={{ fontSize: 12 }}>{o.content}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{o.from} – {o.to}</td>
                  <td className="num"><b>{nf(o.hours, 1)}h</b></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}><Avatar id={o.approver} size="av-sm" />BCH CT</div></td>
                  <td>{o.status === 'approved' ? <Badge map={DOC_ST} k="approved" /> : <div style={{ display: 'flex', gap: 5 }}><button className="btn btn-sm" style={{ height: 24, padding: '0 8px', borderColor: 'var(--green-500)', color: 'var(--green-600)' }} onClick={() => toast('Đã duyệt phiếu tăng ca')}>Duyệt</button><button className="btn btn-sm btn-ghost" style={{ height: 24, padding: '0 8px' }}>Từ chối</button></div>}</td>
                </tr>
              ); })}</tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="tbl"><thead><tr><th>Người gửi</th><th>Loại đơn</th><th>Từ ngày</th><th>Đến ngày</th><th>Lý do</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id="u5" size="av-sm" />Phạm Minh Đức</div></td><td>Nghỉ phép năm</td><td className="mono">18/05/2026</td><td className="mono">19/05/2026</td><td className="muted">Việc gia đình</td><td><Badge map={DOC_ST} k="pending" /></td></tr>
                <tr><td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id="u8" size="av-sm" />Đỗ Thị Mai</div></td><td>Nghỉ ốm</td><td className="mono">14/05/2026</td><td className="mono">14/05/2026</td><td className="muted">Khám bệnh</td><td><Badge map={DOC_ST} k="approved" /></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </Page>
    );
  }

  window.HRM = function HRM({ nav, go }) {
    switch (nav.page) {
      case 'hrm-cham-cong': return <ChamCong go={go} />;
      case 'hrm-cong-may': return <CongMay go={go} />;
      case 'hrm-luong': return <BangLuong go={go} />;
      case 'hrm-list': return <HoSoNS go={go} />;
      case 'hrm-don-tu': return <DonTu go={go} />;
      default: return <ChamCong go={go} />;
    }
  };
})();
