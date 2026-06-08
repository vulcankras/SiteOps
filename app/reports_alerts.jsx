/* Báo cáo kho (Xe/Máy/Tiêu hao) + Cảnh báo kho (5 loại) — đúng mind map Phase 1.
   Ghi đè window.KhoBaoCao, window.KhoCanhBao (load sau kho2.jsx). */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, nf, dmy, money, Tabs, Stat, toast } = window;

  const crumb = (go, label) => <div className="crumbs"><a onClick={() => go({ page: 'dashboard' })} style={{ cursor: 'pointer' }}>Trang chủ</a><Icon name="chevron-right" size={12} /><span>Kho hàng</span><Icon name="chevron-right" size={12} /><span>{label}</span></div>;
  const Page = ({ go, title, label, right, children }) => <div className="page"><div className="page-head"><div>{crumb(go, label)}<h1 className="page-title">{title}</h1></div>{right}</div>{children}</div>;
  const drv = (id) => id && DB.byId[id] ? DB.byId[id].name : '—';
  const REPORT_DATE = '16/05/2026';

  /* ---- dữ liệu suy ra cho báo cáo hàng ngày ---- */
  // Xe: gộp theo vehicleLogs (mỗi xe 1 dòng) + thông tin từ equipment
  const vehicleRows = () => DB.vehicleLogs.map(v => {
    const e = DB.equipment.find(x => x.id === v.equip) || {};
    const hours = Math.min(12, 6 + v.trips * 0.12);
    const hStart = 7, hEnd = +(hStart + hours).toFixed(1);
    const fuelL = Math.round(v.trips * 5.5 + v.totalDist * 0.8);
    return { e, v, hStart: '07:00', hEnd: fmtH(hEnd), hours: +hours.toFixed(1), kmStart: e.kmStart, kmEnd: e.kmNow, totalKm: v.totalDist, fuelL };
  });
  // Máy: gộp theo machineLogs
  const machineRows = () => DB.machineLogs.map(m => {
    const e = DB.equipment.find(x => x.id === m.equip) || {};
    return { e, m, hStart: m.hStart, hEnd: m.hEnd, hours: m.hours, fuelL: m.fuel };
  });
  function fmtH(h) { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); }

  // Tiêu hao trung bình theo thiết bị (toàn bộ máy + xe đang vận hành)
  const fuelAvgRows = () => DB.equipment.filter(e => e.status === 'running' || e.status === 'idle' || e.status === 'maintenance').map(e => {
    const logs = e.kind === 'machine' ? DB.machineLogs.filter(l => l.equip === e.id) : DB.vehicleLogs.filter(l => l.equip === e.id);
    const totalH = e.kind === 'machine' ? logs.reduce((s, l) => s + l.hours, 0) : logs.reduce((s, l) => s + Math.min(12, 6 + l.trips * 0.12), 0);
    const totalFuel = e.kind === 'machine' ? logs.reduce((s, l) => s + l.fuel, 0) : logs.reduce((s, l) => s + Math.round(l.trips * 5.5 + l.totalDist * 0.8), 0);
    const dailyH = logs.length ? +(totalH / logs.length).toFixed(1) : 0;
    const avg = totalH ? +(totalFuel / totalH).toFixed(1) : 0;
    return { e, dailyH, avg, totalFuel, totalH: +totalH.toFixed(1) };
  });

  function KhoBaoCao({ go }) {
    const [tab, setTab] = useState('xe');
    const vr = vehicleRows(), mr = machineRows(), fr = fuelAvgRows();
    const exportBtn = <div style={{ display: 'flex', gap: 8 }}><input className="input" type="date" defaultValue="2026-05-16" style={{ width: 150 }} /><button className="btn btn-sm" onClick={() => toast('Đang tạo Excel…')}><Icon name="download" size={14} />Xuất Excel</button><button className="btn btn-sm" onClick={() => toast('Đang tạo PDF…')}><Icon name="file" size={14} />PDF</button></div>;
    return (
      <Page go={go} title="Báo cáo kho" label="Báo cáo" right={exportBtn}>
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'xe', label: 'Tổng hợp Xe hàng ngày', icon: 'truck' }, { id: 'may', label: 'Tổng hợp Máy hàng ngày', icon: 'excavator' }, { id: 'fuel', label: 'Tiêu hao nhiên liệu TB', icon: 'chart' }]} active={tab} onChange={setTab} /></div>

        {tab === 'xe' && <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
            <Stat label="Số xe hoạt động" icon="truck" value={vr.length} unit="xe" edge="var(--blue-500)" />
            <Stat label="Tổng số chuyến" icon="refresh" value={vr.reduce((s, r) => s + r.v.trips, 0)} edge="var(--orange-500)" />
            <Stat label="Tổng khối lượng" icon="cube" value={nf(vr.reduce((s, r) => s + r.v.vol, 0))} unit="m³" edge="var(--green-500)" />
            <Stat label="Tổng nhiên liệu đổ" icon="droplet" value={nf(vr.reduce((s, r) => s + r.fuelL, 0))} unit="L" edge="var(--violet-500)" />
          </div>
          <div className="card" style={{ overflow: 'auto' }}>
            <div className="card-head"><div className="card-title"><Icon name="truck" size={15} style={{ color: 'var(--blue-600)' }} />Báo cáo tổng hợp tình hình Xe — ngày {REPORT_DATE}</div></div>
            <table className="tbl tbl-compact" style={{ minWidth: 1500, whiteSpace: 'nowrap' }}>
              <thead><tr>
                <th>Mã</th><th>Series</th><th>Tên xe</th><th>Biển số</th><th>Dung tích</th><th>Người lái</th>
                <th className="num">Giờ BĐ</th><th className="num">Giờ KT</th><th className="num">Tổng giờ</th>
                <th className="num">Km BĐ</th><th className="num">Km KT</th><th className="num">Tổng km</th>
                <th>Nhiên liệu</th><th>ĐV</th><th className="num">NL đổ</th><th className="num">Số chuyến</th><th className="num">Tổng khối</th>
              </tr></thead>
              <tbody>{vr.map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.e.code}</td><td className="mono">{r.e.series}</td><td style={{ fontWeight: 600 }}>{r.e.name}</td>
                  <td className="mono">{r.e.plate}</td><td>{r.e.bucketVol}</td><td>{drv(r.v.driver)}</td>
                  <td className="num mono">{r.hStart}</td><td className="num mono">{r.hEnd}</td><td className="num"><b>{nf(r.hours, 1)}</b></td>
                  <td className="num mono">{nf(r.kmStart)}</td><td className="num mono">{nf(r.kmEnd)}</td><td className="num"><b>{nf(r.totalKm, 1)}</b></td>
                  <td>{r.e.fuel}</td><td>Lít</td><td className="num">{nf(r.fuelL)}</td>
                  <td className="num"><b style={{ color: 'var(--orange-600)' }}>{r.v.trips}</b></td><td className="num"><b style={{ color: 'var(--green-700)' }}>{nf(r.v.vol)}</b></td>
                </tr>
              ))}
              <tr style={{ background: 'var(--surface-2)', fontWeight: 700 }}>
                <td colSpan={8}>Tổng cộng — {vr.length} xe</td>
                <td className="num">{nf(vr.reduce((s, r) => s + r.hours, 0), 1)}</td><td colSpan={2}></td>
                <td className="num">{nf(vr.reduce((s, r) => s + r.totalKm, 0), 1)}</td><td colSpan={2}></td>
                <td className="num">{nf(vr.reduce((s, r) => s + r.fuelL, 0))}</td>
                <td className="num" style={{ color: 'var(--orange-600)' }}>{vr.reduce((s, r) => s + r.v.trips, 0)}</td>
                <td className="num" style={{ color: 'var(--green-700)' }}>{nf(vr.reduce((s, r) => s + r.v.vol, 0))}</td>
              </tr></tbody>
            </table>
          </div>
        </>}

        {tab === 'may' && <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
            <Stat label="Số máy hoạt động" icon="excavator" value={mr.length} unit="lượt" edge="var(--violet-500)" />
            <Stat label="Tổng giờ máy" icon="clock" value={nf(mr.reduce((s, r) => s + r.hours, 0), 1)} unit="giờ" edge="var(--blue-500)" />
            <Stat label="Tổng nhiên liệu đổ" icon="droplet" value={nf(mr.reduce((s, r) => s + r.fuelL, 0))} unit="L" edge="var(--orange-500)" />
          </div>
          <div className="card" style={{ overflow: 'auto' }}>
            <div className="card-head"><div className="card-title"><Icon name="excavator" size={15} style={{ color: 'var(--violet-600)' }} />Báo cáo tổng hợp tình hình Máy — ngày {REPORT_DATE}</div></div>
            <table className="tbl tbl-compact" style={{ minWidth: 1200, whiteSpace: 'nowrap' }}>
              <thead><tr>
                <th>Mã</th><th>Series</th><th>Tên máy</th><th>Người lái</th>
                <th className="num">Giờ BĐ</th><th className="num">Giờ KT</th><th className="num">Tổng giờ</th>
                <th>Hạng mục</th><th>Nhiên liệu</th><th>ĐV</th><th className="num">NL đổ</th><th className="num">Sản lượng</th>
              </tr></thead>
              <tbody>{mr.map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.e.code}</td><td className="mono">{r.e.series}</td><td style={{ fontWeight: 600 }}>{r.e.name}</td><td>{drv(r.m.driver)}</td>
                  <td className="num mono">{nf(r.hStart, 1)}</td><td className="num mono">{nf(r.hEnd, 1)}</td><td className="num"><b>{nf(r.hours, 1)}</b></td>
                  <td style={{ fontSize: 11.5 }}>{r.m.work}</td><td>{r.e.fuel}</td><td>Lít</td><td className="num">{nf(r.fuelL)}</td>
                  <td className="num">{r.m.qty ? nf(r.m.qty) + ' ' + r.m.unit : '—'}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--surface-2)', fontWeight: 700 }}>
                <td colSpan={6}>Tổng cộng — {mr.length} lượt máy</td>
                <td className="num">{nf(mr.reduce((s, r) => s + r.hours, 0), 1)}</td><td colSpan={3}></td>
                <td className="num">{nf(mr.reduce((s, r) => s + r.fuelL, 0))}</td><td></td>
              </tr></tbody>
            </table>
          </div>
        </>}

        {tab === 'fuel' && <>
          <div className="auto-note" style={{ marginTop: 0, marginBottom: 14 }}><Icon name="info" size={13} />Mức tiêu hao trung bình = tổng nhiên liệu đổ ÷ tổng giờ lái. Dòng tô đỏ là thiết bị tiêu hao cao bất thường (&gt; 16 L/giờ).</div>
          <div className="card" style={{ overflow: 'auto' }}>
            <div className="card-head"><div className="card-title"><Icon name="chart" size={15} style={{ color: 'var(--orange-500)' }} />Báo cáo tiêu hao nhiên liệu trung bình — Máy / Xe</div></div>
            <table className="tbl tbl-compact" style={{ minWidth: 900, whiteSpace: 'nowrap' }}>
              <thead><tr><th>Mã</th><th>Series</th><th>Tên thiết bị</th><th>Phân loại</th><th className="num">Giờ lái/ngày (TB)</th><th className="num">Tổng giờ</th><th className="num">Tổng NL (L)</th><th className="num">TB tiêu hao (L/giờ)</th></tr></thead>
              <tbody>{fuelAvgRows().sort((a, b) => b.avg - a.avg).map((r, i) => {
                const high = r.avg > 16;
                return <tr key={i} style={high ? { background: 'var(--red-50)' } : null}>
                  <td className="mono">{r.e.code}</td><td className="mono">{r.e.series}</td><td style={{ fontWeight: 600 }}>{r.e.name}</td>
                  <td><span className={'badge ' + (r.e.kind === 'machine' ? 'badge-violet' : 'badge-blue')}>{r.e.kind === 'machine' ? 'Máy' : 'Xe'}</span></td>
                  <td className="num">{nf(r.dailyH, 1)}</td><td className="num">{nf(r.totalH, 1)}</td><td className="num">{nf(r.totalFuel)}</td>
                  <td className="num"><b style={{ color: high ? 'var(--red-600)' : 'var(--ink-800)' }}>{r.avg ? nf(r.avg, 1) : '—'}</b>{high && <Icon name="alert" size={12} style={{ color: 'var(--red-500)', marginLeft: 4 }} />}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </>}
      </Page>
    );
  }

  /* ============ Cảnh báo kho — 5 loại theo mind map ============ */
  function daysTo(dateStr) { const today = new Date('2026-05-16'); const d = new Date(dateStr); return Math.round((d - today) / 86400000); }

  function buildAlerts() {
    const out = [];
    // 1. Thiết bị thuê sắp đến hạn trả (rent.end trong 7 ngày)
    DB.equipment.filter(e => e.rent && e.own === 'rented').forEach(e => {
      const d = daysTo(e.rent.end);
      if (d <= 30) out.push({ group: 'return', level: d <= 5 ? 'red' : 'amber', icon: 'clock', title: e.name + ' sắp đến hạn trả', desc: 'Hết hạn thuê ' + dmy(e.rent.end) + (d >= 0 ? ' · còn ' + d + ' ngày' : ' · đã quá ' + (-d) + ' ngày') + ' · NCC: ' + (DB.byId[e.rent.supplier] ? DB.byId[e.rent.supplier].name : e.rent.supplier), action: 'Tạo phiếu trả', page: 'kho-xuat' });
    });
    // 2. Thiết bị tiêu hao nhiều nhiên liệu (TB tiêu hao > 16 L/giờ)
    fuelAvgRows().filter(r => r.avg > 16).forEach(r => {
      out.push({ group: 'fuel', level: r.avg > 18 ? 'red' : 'amber', icon: 'droplet', title: r.e.name + ' tiêu hao nhiên liệu cao', desc: 'Trung bình ' + nf(r.avg, 1) + ' L/giờ (ngưỡng 16 L/giờ) — kiểm tra kỹ thuật / nghi ngờ thất thoát', action: 'Lập phiếu kiểm tra', page: 'kho-sua-chua' });
    });
    // 3. Nhân sự thuê ngoài sắp đến lịch nghỉ
    [{ name: 'Tổ lái máy thuê — Cty Long Phát', off: '2026-05-20', n: 3 }, { name: 'Đội vận tải thuê 568', off: '2026-05-22', n: 4 }].forEach(x => {
      const d = daysTo(x.off);
      if (d <= 10) out.push({ group: 'hr-leave', level: d <= 3 ? 'amber' : 'blue', icon: 'users', title: x.name + ' sắp đến lịch nghỉ', desc: x.n + ' nhân sự thuê ngoài nghỉ từ ' + dmy(x.off) + ' · còn ' + d + ' ngày — bố trí nhân lực thay thế', action: 'Bố trí thay thế', page: 'hrm-cong-may' });
    });
    // 4. Nhân sự nghỉ làm nhiều (timesheet rỗng nhiều ngày)
    [{ id: 'u11', empty: 5 }, { id: 'u7', empty: 3 }].forEach(x => {
      const p = DB.byId[x.id]; if (!p) return;
      out.push({ group: 'hr-absent', level: x.empty >= 5 ? 'red' : 'amber', icon: 'calendar', title: p.name + ' chấm công rỗng ' + x.empty + ' ngày', desc: 'Không có dữ liệu chấm công ' + x.empty + ' ngày gần nhất — xác minh nghỉ phép / bỏ việc', action: 'Xem chấm công', page: 'hrm-cham-cong' });
    });
    // 5. Thiết bị có số chuyến gần nhau quá (nghi gian lận đếm chuyến)
    const vbyDriver = {};
    DB.vehicleLogs.forEach(v => { (vbyDriver[v.driver] = vbyDriver[v.driver] || []).push(v); });
    DB.vehicleLogs.filter(v => v.trips >= 40).forEach(v => {
      const e = DB.equipment.find(x => x.id === v.equip) || {};
      out.push({ group: 'trip', level: 'amber', icon: 'scan', title: e.name + ' có số chuyến bất thường', desc: v.trips + ' chuyến/ngày, các lần quét QR cách nhau quá ngắn — nghi đếm trùng/khống, cần đối soát', action: 'Đối soát chuyến', page: 'cong-truong' });
    });
    return out;
  }

  const GROUPS = [
    { id: 'return', label: 'Thiết bị thuê sắp đến hạn trả', icon: 'clock' },
    { id: 'fuel', label: 'Thiết bị tiêu hao nhiều nhiên liệu', icon: 'droplet' },
    { id: 'hr-leave', label: 'Nhân sự thuê ngoài sắp đến lịch nghỉ', icon: 'users' },
    { id: 'hr-absent', label: 'Nhân sự nghỉ làm nhiều (timesheet rỗng)', icon: 'calendar' },
    { id: 'trip', label: 'Thiết bị có số chuyến gần nhau quá', icon: 'scan' },
  ];

  function KhoCanhBao({ go }) {
    const alerts = buildAlerts();
    const tone = { red: 'var(--red-500)', amber: 'var(--amber-500)', blue: 'var(--blue-500)' };
    const bg = { red: 'var(--red-50)', amber: 'var(--amber-50)', blue: 'var(--blue-50)' };
    const [filter, setFilter] = useState('all');
    const shown = filter === 'all' ? alerts : alerts.filter(a => a.group === filter);
    return (
      <Page go={go} title="Cảnh báo kho & vận hành" label="Cảnh báo" right={<span className="badge badge-red" style={{ height: 30, padding: '0 12px' }}><Icon name="alert" size={13} />{alerts.length} cảnh báo</span>}>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          <button className={'chip ' + (filter === 'all' ? 'active' : '')} onClick={() => setFilter('all')}>Tất cả ({alerts.length})</button>
          {GROUPS.map(g => { const c = alerts.filter(a => a.group === g.id).length; return <button key={g.id} className={'chip ' + (filter === g.id ? 'active' : '')} onClick={() => setFilter(g.id)}><Icon name={g.icon} size={12} />{g.label} ({c})</button>; })}
        </div>
        {GROUPS.filter(g => filter === 'all' || filter === g.id).map(g => {
          const items = alerts.filter(a => a.group === g.id);
          if (!items.length) return null;
          return (
            <div key={g.id} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-700)' }}><Icon name={g.icon} size={15} style={{ color: 'var(--orange-500)' }} />{g.label}<span className="badge badge-gray">{items.length}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {items.map((a, i) => (
                  <div key={i} className="card" style={{ display: 'flex', gap: 13, padding: 13, alignItems: 'center', borderLeft: '3px solid ' + tone[a.level] }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: bg[a.level], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tone[a.level], flex: 'none' }}><Icon name={a.icon} size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div><div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 2 }}>{a.desc}</div></div>
                    <button className="btn btn-sm" onClick={() => { toast('Mở: ' + a.action); go({ page: a.page }); }}>{a.action}</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Page>
    );
  }

  Object.assign(window, { KhoBaoCao, KhoCanhBao });
})();
