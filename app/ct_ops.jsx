/* Quản lý công trường — Báo cáo vận hành, Thiết bị (phân loại + toàn trình), Nhân sự, Cảnh báo.
   Override các tab trong CTTabs qua window.Site*  →  load sau ct_tabs.jsx. */
(function () {
  const { useState, useMemo } = window.React;
  const { Icon, DB, Badge, Bar, Stat, Tabs, Modal, Avatar, Search, SectionHead, nf, money, dmy, toast, EQ_ST, OWN_ST, DOC_ST } = window;

  const Card = ({ title, icon, color, right, children, pad = 0, scroll }) => (
    <div className="card" style={scroll ? { overflow: 'auto' } : { overflow: 'hidden' }}>
      {title && <div className="card-head"><div className="card-title">{icon && <Icon name={icon} size={15} style={{ color: color || 'var(--blue-600)' }} />}{title}</div>{right}</div>}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
  const drv = (id) => id && DB.byId[id] ? DB.byId[id].name : '—';
  const REPORT_DATE = '16/05/2026';

  /* ════════════════════ 1. BÁO CÁO VẬN HÀNH ════════════════════ */
  function SiteBaoCao({ p }) {
    const [tab, setTab] = useState('tong-hop');
    const [grain, setGrain] = useState('day');     // day | week | month
    const [fEquip, setFEquip] = useState('all');
    const [fDriver, setFDriver] = useState('all');
    const [fArea, setFArea] = useState('all');

    const eqs = DB.equipment.filter(e => e.loc === p.id);
    const drivers = [...new Set(DB.projectStaff.filter(s => s.proj === p.id && s.equip).map(s => s.person))];
    const areas = DB.areas.filter(a => a.proj === p.id);

    const matchE = (eid) => fEquip === 'all' || eid === fEquip;
    const matchD = (did) => fDriver === 'all' || did === fDriver;

    // nguồn dữ liệu (mỗi loại 1 nguồn — không nhập trùng)
    const vlogs = DB.vehicleLogs.filter(v => matchE(v.equip) && matchD(v.driver));
    const mlogs = DB.machineLogs.filter(m => matchE(m.equip) && matchD(m.driver) && (fArea === 'all' || m.area === fArea));
    const flogs = DB.fuelLogs.filter(f => matchE(f.equip));

    const grainLabel = { day: 'ngày 16/05/2026', week: 'tuần 20 (12–18/05)', month: 'tháng 05/2026' }[grain];
    const km = (n) => nf(n, 1);

    const FilterBar = (
      <div className="card" style={{ padding: 12, marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="seg">
          {[['day', 'Theo ngày'], ['week', 'Theo tuần'], ['month', 'Theo tháng']].map(([k, l]) => <button key={k} className={grain === k ? 'active' : ''} onClick={() => setGrain(k)}>{l}</button>)}
        </div>
        <span style={{ width: 1, height: 22, background: 'var(--line)' }} />
        <select className="select" style={{ height: 32, width: 180 }} value={fEquip} onChange={e => setFEquip(e.target.value)}>
          <option value="all">Tất cả xe / máy</option>
          {eqs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select className="select" style={{ height: 32, width: 160 }} value={fDriver} onChange={e => setFDriver(e.target.value)}>
          <option value="all">Tất cả tài xế / thợ lái</option>
          {drivers.map(d => <option key={d} value={d}>{drv(d)}</option>)}
        </select>
        <select className="select" style={{ height: 32, width: 180 }} value={fArea} onChange={e => setFArea(e.target.value)}>
          <option value="all">Tất cả khu vực (Km)</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
          <button className="btn btn-sm" onClick={() => toast('Đang tạo Excel…')}><Icon name="download" size={14} />Excel</button>
          <button className="btn btn-sm" onClick={() => toast('Đang tạo PDF…')}><Icon name="file" size={14} />PDF</button>
        </div>
      </div>
    );

    return (
      <div>
        <SectionHead title="Báo cáo vận hành" sub={'Tổng hợp ' + grainLabel + ' · mỗi số liệu lấy từ một nguồn gốc, không nhập trùng'} icon="report" />
        <div style={{ marginBottom: 14 }}><Tabs active={tab} onChange={setTab} tabs={[
          { id: 'tong-hop', label: 'Nhật ký vận hành (tổng hợp)', icon: 'report' },
          { id: 'van-chuyen', label: 'Vận chuyển', icon: 'truck' },
          { id: 'ca-may', label: 'Ca máy', icon: 'excavator' },
          { id: 'nhien-lieu', label: 'Nhiên liệu', icon: 'droplet' },
          { id: 'doi-soat', label: 'Đối soát QR', icon: 'scan' },
        ]} /></div>
        {FilterBar}

        {/* ---- Tổng hợp: gộp xe + máy 1 dòng / thiết bị ---- */}
        {tab === 'tong-hop' && <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
            <Stat label="Giờ máy" icon="clock" value={km(mlogs.reduce((s, m) => s + m.hours, 0))} unit="giờ" edge="var(--violet-500)" />
            <Stat label="Số chuyến xe" icon="refresh" value={vlogs.reduce((s, v) => s + v.trips, 0)} edge="var(--orange-500)" />
            <Stat label="Khối lượng VC" icon="cube" value={nf(vlogs.reduce((s, v) => s + v.vol, 0))} unit="m³" edge="var(--green-500)" />
            <Stat label="Nhiên liệu" icon="droplet" value={nf(flogs.reduce((s, f) => s + f.liters, 0))} unit="L" edge="var(--blue-500)" />
          </div>
          <Card title={'Nhật ký vận hành tổng hợp — ' + grainLabel} icon="report" scroll>
            <table className="tbl tbl-compact" style={{ minWidth: 1000, whiteSpace: 'nowrap' }}>
              <thead><tr><th>Thiết bị</th><th>Loại</th><th>Người VH</th><th className="num">Giờ máy</th><th className="num">Chuyến</th><th className="num">Khối lượng</th><th className="num">Nhiên liệu (L)</th><th>Hạng mục</th></tr></thead>
              <tbody>
                {eqs.filter(e => matchE(e.id)).map(e => {
                  const ml = mlogs.filter(m => m.equip === e.id), vl = vlogs.filter(v => v.equip === e.id), fl = flogs.filter(f => f.equip === e.id);
                  if (e.kind === 'machine' && !ml.length && !fl.length) return null;
                  if (e.kind === 'vehicle' && !vl.length && !fl.length) return null;
                  return <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.name}<div className="mono muted" style={{ fontSize: 10 }}>{e.code}</div></td>
                    <td><span className={'badge ' + (e.kind === 'machine' ? 'badge-violet' : 'badge-blue')}>{e.kind === 'machine' ? 'Máy' : 'Xe'}</span></td>
                    <td style={{ fontSize: 12 }}>{drv(e.driver)}</td>
                    <td className="num mono">{e.kind === 'machine' ? km(ml.reduce((s, m) => s + m.hours, 0)) : '—'}</td>
                    <td className="num mono">{e.kind === 'vehicle' ? vl.reduce((s, v) => s + v.trips, 0) : '—'}</td>
                    <td className="num mono">{e.kind === 'vehicle' ? nf(vl.reduce((s, v) => s + v.vol, 0)) + ' m³' : (ml.reduce((s, m) => s + (m.qty || 0), 0) ? nf(ml.reduce((s, m) => s + (m.qty || 0), 0)) + ' m³' : '—')}</td>
                    <td className="num mono">{nf(fl.reduce((s, f) => s + f.liters, 0))}</td>
                    <td style={{ fontSize: 11.5 }}>{(ml[0] || vl[0] || {}).work || '—'}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </Card>
          <div className="auto-note" style={{ marginTop: 12 }}><Icon name="info" size={13} />Bảng tổng hợp chỉ <b>đọc lại</b> số liệu: giờ máy từ Nhật trình máy, chuyến/khối lượng từ Nhật ký xe, nhiên liệu từ phiếu cấp dầu. Không có ô nhập tay tại đây.</div>
        </>}

        {/* ---- Vận chuyển: theo chuyến & khối lượng ---- */}
        {tab === 'van-chuyen' && <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
            <Stat label="Tổng chuyến" icon="refresh" value={vlogs.reduce((s, v) => s + v.trips, 0)} edge="var(--orange-500)" />
            <Stat label="Tổng khối lượng" icon="cube" value={nf(vlogs.reduce((s, v) => s + v.vol, 0))} unit="m³" edge="var(--green-500)" />
            <Stat label="Tổng quãng đường" icon="road" value={km(vlogs.reduce((s, v) => s + v.totalDist, 0))} unit="km" edge="var(--blue-500)" />
          </div>
          <Card title={'Báo cáo vận chuyển — ' + grainLabel} icon="truck" color="var(--orange-500)" scroll>
            <table className="tbl tbl-compact" style={{ minWidth: 980, whiteSpace: 'nowrap' }}>
              <thead><tr><th>Xe</th><th>Biển số</th><th>Tài xế</th><th>Hạng mục</th><th>Lấy → Đổ</th><th className="num">Số chuyến</th><th className="num">Tải/chuyến</th><th className="num">Tổng khối</th><th className="num">Quãng đường</th><th>Nguồn</th></tr></thead>
              <tbody>{vlogs.map(v => { const e = DB.equipment.find(x => x.id === v.equip) || {}; return (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td><td className="mono">{e.plate}</td><td style={{ fontSize: 12 }}>{drv(v.driver)}</td>
                  <td style={{ fontSize: 11.5 }}>{v.work}</td><td className="mono" style={{ fontSize: 11.5 }}>{v.from} → {v.to}</td>
                  <td className="num"><b style={{ color: 'var(--orange-600)' }}>{v.trips}</b></td><td className="num">{v.avg} m³</td>
                  <td className="num"><b>{nf(v.vol)} m³</b></td><td className="num">{km(v.totalDist)} km</td>
                  <td><Badge map={DOC_ST} k={v.status} /></td>
                </tr>
              ); })}
                <tr style={{ background: 'var(--surface-2)', fontWeight: 700 }}><td colSpan={5}>Tổng cộng</td><td className="num" style={{ color: 'var(--orange-600)' }}>{vlogs.reduce((s, v) => s + v.trips, 0)}</td><td></td><td className="num">{nf(vlogs.reduce((s, v) => s + v.vol, 0))} m³</td><td className="num">{km(vlogs.reduce((s, v) => s + v.totalDist, 0))} km</td><td></td></tr>
              </tbody>
            </table>
          </Card>
        </>}

        {/* ---- Ca máy: giờ máy & sản lượng ---- */}
        {tab === 'ca-may' && <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
            <Stat label="Tổng giờ máy" icon="clock" value={km(mlogs.reduce((s, m) => s + m.hours, 0))} unit="giờ" edge="var(--violet-500)" />
            <Stat label="Lượt ca máy" icon="excavator" value={mlogs.length} edge="var(--blue-500)" />
            <Stat label="Sản lượng" icon="cube" value={nf(mlogs.reduce((s, m) => s + (m.qty || 0), 0))} unit="m³" edge="var(--green-500)" />
          </div>
          <Card title={'Báo cáo ca máy — ' + grainLabel} icon="excavator" color="var(--violet-600)" scroll>
            <table className="tbl tbl-compact" style={{ minWidth: 920, whiteSpace: 'nowrap' }}>
              <thead><tr><th>Máy</th><th>Series</th><th>Thợ lái</th><th>Hạng mục</th><th>Khu vực</th><th className="num">Giờ BĐ</th><th className="num">Giờ KT</th><th className="num">Tổng giờ</th><th className="num">Sản lượng</th><th>Nguồn</th></tr></thead>
              <tbody>{mlogs.map(m => { const e = DB.equipment.find(x => x.id === m.equip) || {}; const a = DB.areas.find(x => x.id === m.area) || {}; return (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td><td className="mono" style={{ fontSize: 11 }}>{e.series}</td><td style={{ fontSize: 12 }}>{drv(m.driver)}</td>
                  <td style={{ fontSize: 11.5 }}>{m.work}</td><td style={{ fontSize: 11 }}>{a.name || '—'}</td>
                  <td className="num mono">{nf(m.hStart, 1)}</td><td className="num mono">{nf(m.hEnd, 1)}</td><td className="num"><b>{nf(m.hours, 1)}</b></td>
                  <td className="num">{m.qty ? nf(m.qty) + ' ' + m.unit : '—'}</td><td><Badge map={DOC_ST} k={m.status} /></td>
                </tr>
              ); })}
                <tr style={{ background: 'var(--surface-2)', fontWeight: 700 }}><td colSpan={7}>Tổng cộng</td><td className="num">{km(mlogs.reduce((s, m) => s + m.hours, 0))}</td><td className="num">{nf(mlogs.reduce((s, m) => s + (m.qty || 0), 0))} m³</td><td></td></tr>
              </tbody>
            </table>
          </Card>
        </>}

        {/* ---- Nhiên liệu: cấp & tiêu hao ---- */}
        {tab === 'nhien-lieu' && <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
            <Stat label="Tổng dầu cấp" icon="droplet" value={nf(flogs.reduce((s, f) => s + f.liters, 0))} unit="L" edge="var(--blue-500)" />
            <Stat label="Chi phí nhiên liệu" icon="wallet" value={nf(flogs.reduce((s, f) => s + f.cost, 0), 1)} unit="tr" edge="var(--teal-500)" />
            <Stat label="TB tiêu hao cao" icon="alert" value={fuelAvg(p).filter(r => r.avg > 16).length} unit={'/' + fuelAvg(p).length} edge="var(--red-500)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Card title="Phiếu cấp nhiên liệu" icon="droplet" color="var(--blue-500)" scroll>
              <table className="tbl tbl-compact" style={{ whiteSpace: 'nowrap' }}>
                <thead><tr><th>Ngày</th><th>Thiết bị</th><th className="num">Số lít</th><th className="num">Đồng hồ</th><th className="num">Chi phí</th></tr></thead>
                <tbody>{flogs.map(f => { const e = DB.equipment.find(x => x.id === f.equip) || {}; return (
                  <tr key={f.id}><td className="mono" style={{ fontSize: 11.5 }}>{dmy(f.date)}</td><td style={{ fontSize: 12 }}>{e.name}</td><td className="num"><b>{nf(f.liters)}</b></td><td className="num mono">{nf(f.odo)}</td><td className="num">{nf(f.cost, 1)} tr</td></tr>
                ); })}</tbody>
              </table>
            </Card>
            <Card title="Tiêu hao trung bình (L/giờ)" icon="chart" color="var(--orange-500)" scroll>
              <table className="tbl tbl-compact" style={{ whiteSpace: 'nowrap' }}>
                <thead><tr><th>Thiết bị</th><th>Loại</th><th className="num">Tổng NL</th><th className="num">TB</th><th>ĐG</th></tr></thead>
                <tbody>{fuelAvg(p).filter(r => matchE(r.e.id)).sort((a, b) => b.avg - a.avg).map((r, i) => { const high = r.avg > 16; return (
                  <tr key={i} style={high ? { background: 'var(--red-50)' } : null}>
                    <td style={{ fontWeight: 600 }}>{r.e.name}</td><td><span className={'badge ' + (r.e.kind === 'machine' ? 'badge-violet' : 'badge-blue')}>{r.e.kind === 'machine' ? 'Máy' : 'Xe'}</span></td>
                    <td className="num">{nf(r.totalFuel)} L</td><td className="num"><b style={{ color: high ? 'var(--red-600)' : 'var(--ink-800)' }}>{nf(r.avg, 1)}</b></td>
                    <td>{high ? <span className="badge badge-red">Cao</span> : <span className="badge badge-green">BT</span>}</td>
                  </tr>
                ); })}</tbody>
              </table>
            </Card>
          </div>
        </>}

        {/* ---- Đối soát QR vs khai báo ---- */}
        {tab === 'doi-soat' && <DoiSoatQR p={p} />}
      </div>
    );
  }

  function fuelAvg(p) {
    return DB.equipment.filter(e => e.loc === p.id).map(e => {
      const logs = e.kind === 'machine' ? DB.machineLogs.filter(l => l.equip === e.id) : DB.vehicleLogs.filter(l => l.equip === e.id);
      const totalH = e.kind === 'machine' ? logs.reduce((s, l) => s + l.hours, 0) : logs.reduce((s, l) => s + Math.min(12, 6 + l.trips * 0.12), 0);
      const fl = DB.fuelLogs.filter(f => f.equip === e.id);
      const totalFuel = fl.reduce((s, f) => s + f.liters, 0);
      return { e, totalFuel, totalH: +totalH.toFixed(1), avg: totalH ? +(totalFuel / totalH).toFixed(1) : 0 };
    }).filter(r => r.totalFuel > 0);
  }

  function DoiSoatQR({ p }) {
    // QR (drops) theo biển số vs khai báo tài xế (vehicleLogs)
    const rows = DB.vehicleLogs.map(v => {
      const e = DB.equipment.find(x => x.id === v.equip) || {};
      const qrTrips = DB.drops.filter(d => d.plate === e.plate).reduce((s, d) => s + d.trips, 0);
      const declared = v.trips;
      const diff = declared - qrTrips;
      return { e, declared, qrTrips, diff, vol: v.vol };
    }).filter(r => r.e.plate);
    // thêm các xe QR có nhưng không khớp log (xe thuê 568)
    const extraPlates = [...new Set(DB.drops.map(d => d.plate))].filter(pl => !rows.some(r => r.e.plate === pl));
    extraPlates.forEach(pl => { const qr = DB.drops.filter(d => d.plate === pl).reduce((s, d) => s + d.trips, 0); rows.push({ e: { name: 'Xe điều phối ' + pl, plate: pl, kind: 'vehicle' }, declared: qr, qrTrips: qr, diff: 0, vol: qr * 20 }); });
    const totalDiff = rows.reduce((s, r) => s + Math.abs(r.diff), 0);
    return (
      <div>
        <div className="auto-note" style={{ marginTop: 0, marginBottom: 14 }}><Icon name="info" size={13} />Đối chiếu <b>số chuyến quét QR tại điểm đổ</b> (tự động, khách quan) với <b>số chuyến tài xế khai</b> trong nhật ký xe. Chênh lệch khác 0 cần xác minh — chống khai khống.</div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng chuyến QR" icon="scan" value={rows.reduce((s, r) => s + r.qrTrips, 0)} edge="var(--blue-500)" />
          <Stat label="Tổng chuyến khai báo" icon="file" value={rows.reduce((s, r) => s + r.declared, 0)} edge="var(--orange-500)" />
          <Stat label="Tổng chênh lệch" icon="alert" value={totalDiff} unit="chuyến" edge={totalDiff > 0 ? 'var(--red-500)' : 'var(--green-500)'} />
        </div>
        <Card title="Đối soát số chuyến — QR vs Khai báo" icon="scan" color="var(--blue-600)" scroll>
          <table className="tbl tbl-compact" style={{ whiteSpace: 'nowrap' }}>
            <thead><tr><th>Xe</th><th>Biển số</th><th className="num">Chuyến QR</th><th className="num">Chuyến khai</th><th className="num">Chênh lệch</th><th>Đánh giá</th></tr></thead>
            <tbody>{rows.map((r, i) => { const ok = r.diff === 0; return (
              <tr key={i} style={!ok ? { background: 'var(--amber-50)' } : null}>
                <td style={{ fontWeight: 600 }}>{r.e.name}</td><td className="mono">{r.e.plate}</td>
                <td className="num mono"><b style={{ color: 'var(--blue-600)' }}>{r.qrTrips}</b></td><td className="num mono">{r.declared}</td>
                <td className="num mono"><b style={{ color: ok ? 'var(--green-600)' : 'var(--red-600)' }}>{r.diff > 0 ? '+' : ''}{r.diff}</b></td>
                <td>{ok ? <span className="badge badge-green">Khớp</span> : <span className="badge badge-amber">Lệch — xác minh</span>}</td>
              </tr>
            ); })}</tbody>
          </table>
        </Card>
      </div>
    );
  }

  /* ════════════════════ 2. THIẾT BỊ (phân loại + toàn trình) ════════════════════ */
  function SiteThietBi({ p, go }) {
    const [fOwn, setFOwn] = useState('all');     // own | rented
    const [fKind, setFKind] = useState('all');   // machine | vehicle
    const [fGroup, setFGroup] = useState('all');
    const [fStatus, setFStatus] = useState('all');
    const [q, setQ] = useState('');
    const [sel, setSel] = useState(null);

    const all = DB.equipment.filter(e => e.loc === p.id);
    const list = all.filter(e =>
      (fOwn === 'all' || (fOwn === 'own' ? e.own === 'own' : e.own !== 'own')) &&
      (fKind === 'all' || e.kind === fKind) &&
      (fGroup === 'all' || e.group === fGroup) &&
      (fStatus === 'all' || e.status === fStatus) &&
      (!q || e.name.toLowerCase().includes(q.toLowerCase()) || e.code.toLowerCase().includes(q.toLowerCase()) || (e.plate || '').includes(q))
    );
    const groups = fKind === 'vehicle' ? DB.equipGroups.vehicle : fKind === 'machine' ? DB.equipGroups.machine : [...DB.equipGroups.machine, ...DB.equipGroups.vehicle];
    const cnt = (fn) => all.filter(fn).length;

    return (
      <div>
        <SectionHead title="Thiết bị tại công trường" sub={p.name + ' · ' + all.length + ' thiết bị đang ở công trường'} icon="excavator"
          right={<button className="btn btn-sm btn-primary" onClick={() => toast('Mở form điều động thiết bị')}><Icon name="plus" size={14} />Điều động thiết bị</button>} />

        {/* phân loại nhanh */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Sở hữu / Thuê ngoài" icon="excavator" value={cnt(e => e.own === 'own')} unit={'/ ' + cnt(e => e.own !== 'own') + ' thuê'} edge="var(--blue-500)" />
          <Stat label="Máy thi công" icon="excavator" value={cnt(e => e.kind === 'machine')} unit="máy" edge="var(--violet-500)" />
          <Stat label="Xe vận tải" icon="truck" value={cnt(e => e.kind === 'vehicle')} unit="xe" edge="var(--orange-500)" />
          <Stat label="Đang hoạt động" icon="check-circle" value={cnt(e => e.status === 'running')} unit={'/ ' + all.length} edge="var(--green-500)" />
        </div>

        {/* bộ lọc đa chiều */}
        <div className="card" style={{ padding: 12, marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Search placeholder="Tìm tên / mã / biển số…" value={q} onChange={setQ} w={200} />
          <FilterSelect label="Nguồn" value={fOwn} onChange={setFOwn} opts={[['all', 'Tất cả nguồn'], ['own', 'Sở hữu'], ['rented', 'Thuê ngoài']]} />
          <FilterSelect label="Loại hình" value={fKind} onChange={v => { setFKind(v); setFGroup('all'); }} opts={[['all', 'Tất cả loại'], ['machine', 'Máy thi công'], ['vehicle', 'Xe vận tải']]} />
          <FilterSelect label="Nhóm" value={fGroup} onChange={setFGroup} opts={[['all', 'Tất cả nhóm'], ...groups]} />
          <FilterSelect label="Tình trạng" value={fStatus} onChange={setFStatus} opts={[['all', 'Tất cả tình trạng'], ['running', 'Đang chạy'], ['idle', 'Chờ việc'], ['maintenance', 'Bảo trì']]} />
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-500)' }}>{list.length} thiết bị</span>
        </div>

        <Card scroll>
          <table className="tbl"><thead><tr><th>Mã / Thiết bị</th><th>Nguồn</th><th>Loại hình</th><th>Nhóm</th><th>Người vận hành</th><th className="num">Giờ máy / Km</th><th>Tình trạng</th><th></th></tr></thead>
            <tbody>{list.map(e => (
              <tr key={e.id} className="clickable" onClick={() => setSel(e)}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 28, height: 28, borderRadius: 7, background: e.kind === 'vehicle' ? 'var(--orange-50)' : 'var(--blue-50)', color: e.kind === 'vehicle' ? 'var(--orange-600)' : 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={e.kind === 'vehicle' ? 'truck' : 'excavator'} size={15} /></span><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>{e.name}</div><div className="mono muted" style={{ fontSize: 10 }}>{e.code}</div></div></div></td>
                <td><Badge map={OWN_ST} k={e.own} /></td>
                <td><span className={'badge ' + (e.kind === 'machine' ? 'badge-violet' : 'badge-blue')}>{e.kind === 'machine' ? 'Máy' : 'Xe'}</span></td>
                <td><span className="badge badge-gray">{DB.equipGroupLabel(e.group)}</span></td>
                <td style={{ fontSize: 12 }}>{drv(e.driver)}</td>
                <td className="num mono">{e.kind === 'vehicle' ? nf(e.kmNow) + ' km' : nf(e.hourNow, 1) + ' h'}</td>
                <td><Badge map={EQ_ST} k={e.status} /></td>
                <td style={{ textAlign: 'right' }}><Icon name="chevron-right" size={15} style={{ color: 'var(--ink-300)' }} /></td>
              </tr>
            ))}
              {!list.length && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-400)' }}>Không có thiết bị khớp bộ lọc</td></tr>}
            </tbody>
          </table>
        </Card>
        {sel && <EquipDetail e={sel} p={p} go={go} onClose={() => setSel(null)} />}
      </div>
    );
  }

  function FilterSelect({ label, value, onChange, opts }) {
    return <select className="select" style={{ height: 32, width: 'auto', minWidth: 130 }} value={value} onChange={e => onChange(e.target.value)} title={label}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>;
  }

  /* ---- Chi tiết thiết bị: toàn trình lịch sử ---- */
  function EquipDetail({ e, p, go, onClose }) {
    const [tab, setTab] = useState('tong-quan');
    const timeline = DB.equipTimeline(e.id);
    const mlogs = DB.machineLogs.filter(m => m.equip === e.id);
    const vlogs = DB.vehicleLogs.filter(v => v.equip === e.id);
    const flogs = DB.fuelLogs.filter(f => f.equip === e.id);
    const reps = DB.equipRepairs.filter(r => r.equip === e.id);
    const ops = DB.operatorHistory.filter(o => o.equip === e.id);
    const trs = DB.equipTransfers.filter(t => t.equip === e.id);
    const curProj = DB.projects.find(x => x.id === e.loc);

    return (
      <Modal title={e.name} sub={e.code + ' · ' + e.series} width={820} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Đóng</button><button className="btn"><Icon name="qr" size={14} />In QR định danh</button><button className="btn btn-primary"><Icon name="refresh" size={14} />Điều chuyển</button></>}>
        {/* header chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <Badge map={OWN_ST} k={e.own} /><span className={'badge ' + (e.kind === 'machine' ? 'badge-violet' : 'badge-blue')}>{e.kind === 'machine' ? 'Máy thi công' : 'Xe vận tải'}</span>
          <span className="badge badge-gray">{DB.equipGroupLabel(e.group)}</span><Badge map={EQ_ST} k={e.status} />
          {curProj && <span className="badge badge-orange"><Icon name="map-pin" size={11} />{curProj.name}</span>}
        </div>
        <div style={{ marginBottom: 14 }}><Tabs active={tab} onChange={setTab} tabs={[
          { id: 'tong-quan', label: 'Tổng quan', icon: 'info' },
          { id: 'toan-trinh', label: 'Toàn trình', icon: 'timeline' },
          { id: 'van-hanh', label: e.kind === 'machine' ? 'Ca máy' : 'Chuyến xe', icon: e.kind === 'machine' ? 'excavator' : 'truck' },
          { id: 'nhien-lieu', label: 'Nhiên liệu', icon: 'droplet' },
          { id: 'sua-chua', label: 'Sửa chữa', icon: 'wrench' },
          { id: 'nguoi-vh', label: 'Người vận hành', icon: 'customer' },
          ...(e.own !== 'own' ? [{ id: 'thue', label: 'HĐ thuê', icon: 'file' }] : []),
        ]} /></div>

        {tab === 'tong-quan' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 16px', marginBottom: 14 }}>
              {[['Hãng / Model', e.brand + ' ' + e.model], ['Năm SX', e.year], ['Công suất', e.power || '—'], e.kind === 'vehicle' ? ['Biển số', e.plate] : ['Dung tích gầu', e.bucket || '—'], e.kind === 'vehicle' ? ['Tải trọng', e.load] : ['Nhiên liệu', e.fuel], ['Người vận hành', drv(e.driver)], ['Giờ máy / Km hiện tại', e.kind === 'vehicle' ? nf(e.kmNow) + ' km' : nf(e.hourNow, 1) + ' giờ'], ['Đơn giá ca', e.unitPrice ? nf(e.unitPrice) + ' k/giờ' : '—']].map(([k, v]) =>
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line-soft)', padding: '5px 0', fontSize: 12.5 }}><span className="muted">{k}</span><b>{v}</b></div>)}
            </div>
            {e.cert && <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, marginBottom: 12 }}>
              <Icon name="shield-check" size={17} style={{ color: certColor(e.cert.expiry) }} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>{e.cert.name}</div><div className="mono muted" style={{ fontSize: 11 }}>{e.cert.no} · hết hạn {dmy(e.cert.expiry)}</div></div>
              <span className="badge" style={{ background: certColor(e.cert.expiry) === 'var(--red-500)' ? 'var(--red-50)' : 'var(--green-50)', color: certColor(e.cert.expiry) }}>{certDays(e.cert.expiry)}</span>
            </div>}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <Stat label={e.kind === 'machine' ? 'Tổng giờ ghi nhận' : 'Tổng chuyến'} icon="clock" value={e.kind === 'machine' ? nf(mlogs.reduce((s, m) => s + m.hours, 0), 1) : vlogs.reduce((s, v) => s + v.trips, 0)} edge="var(--violet-500)" />
              <Stat label="Tổng nhiên liệu" icon="droplet" value={nf(flogs.reduce((s, f) => s + f.liters, 0))} unit="L" edge="var(--blue-500)" />
              <Stat label="Chi phí sửa chữa" icon="wrench" value={nf(reps.reduce((s, r) => s + r.cost, 0), 1)} unit="tr" edge="var(--orange-500)" />
            </div>
          </div>
        )}

        {tab === 'toan-trinh' && (
          <div style={{ position: 'relative', paddingLeft: 8 }}>
            <div className="auto-note" style={{ marginTop: 0, marginBottom: 16 }}><Icon name="info" size={13} />Toàn bộ vòng đời thiết bị: điều chuyển giữa công trường, gán người vận hành, sửa chữa & bảo trì.</div>
            <div style={{ position: 'relative', marginLeft: 8 }}>
              <div style={{ position: 'absolute', left: 11, top: 4, bottom: 4, width: 2, background: 'var(--line)' }} />
              {timeline.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '2px solid ' + ev.color, color: ev.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', zIndex: 1 }}><Icon name={ev.icon} size={13} /></span>
                  <div style={{ flex: 1, paddingTop: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><b style={{ fontSize: 13 }}>{ev.title}</b><span className="mono muted" style={{ fontSize: 11 }}>{dmy(ev.date)}</span></div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-600)', marginTop: 2 }}>{ev.desc}</div>
                    {ev.meta && <div className="mono muted" style={{ fontSize: 10.5, marginTop: 2 }}>{ev.meta}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'van-hanh' && (e.kind === 'machine' ? (
          <table className="tbl tbl-compact"><thead><tr><th>Ngày</th><th>Hạng mục</th><th className="num">Giờ BĐ</th><th className="num">Giờ KT</th><th className="num">Tổng giờ</th><th className="num">SL</th><th>TT</th></tr></thead>
            <tbody>{mlogs.map(m => <tr key={m.id}><td className="mono" style={{ fontSize: 11.5 }}>{dmy(m.date)}</td><td style={{ fontSize: 12 }}>{m.work}</td><td className="num mono">{nf(m.hStart, 1)}</td><td className="num mono">{nf(m.hEnd, 1)}</td><td className="num"><b>{nf(m.hours, 1)}</b></td><td className="num">{m.qty ? nf(m.qty) : '—'}</td><td><Badge map={DOC_ST} k={m.status} /></td></tr>)}
              {!mlogs.length && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 16, color: 'var(--ink-400)' }}>Chưa có ca máy</td></tr>}</tbody>
          </table>
        ) : (
          <table className="tbl tbl-compact"><thead><tr><th>Ngày</th><th>Hạng mục</th><th>Lấy → Đổ</th><th className="num">Chuyến</th><th className="num">Khối lượng</th><th className="num">Km</th><th>TT</th></tr></thead>
            <tbody>{vlogs.map(v => <tr key={v.id}><td className="mono" style={{ fontSize: 11.5 }}>{dmy(v.date)}</td><td style={{ fontSize: 12 }}>{v.work}</td><td className="mono" style={{ fontSize: 11 }}>{v.from}→{v.to}</td><td className="num"><b>{v.trips}</b></td><td className="num">{nf(v.vol)} m³</td><td className="num">{nf(v.totalDist, 1)}</td><td><Badge map={DOC_ST} k={v.status} /></td></tr>)}
              {!vlogs.length && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 16, color: 'var(--ink-400)' }}>Chưa có chuyến xe</td></tr>}</tbody>
          </table>
        ))}

        {tab === 'nhien-lieu' && (
          <table className="tbl tbl-compact"><thead><tr><th>Ngày</th><th className="num">Số lít</th><th className="num">Đồng hồ</th><th className="num">Chi phí</th><th>Người cấp</th></tr></thead>
            <tbody>{flogs.map(f => <tr key={f.id}><td className="mono" style={{ fontSize: 11.5 }}>{dmy(f.date)}</td><td className="num"><b>{nf(f.liters)} L</b></td><td className="num mono">{nf(f.odo)}</td><td className="num">{nf(f.cost, 1)} tr</td><td style={{ fontSize: 12 }}>{drv(f.by)}</td></tr>)}
              {!flogs.length && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 16, color: 'var(--ink-400)' }}>Chưa có phiếu cấp dầu</td></tr>}</tbody>
          </table>
        )}

        {tab === 'sua-chua' && (
          <table className="tbl tbl-compact"><thead><tr><th>Ngày</th><th>Loại</th><th>Nội dung</th><th className="num">Chi phí</th><th>Đơn vị</th><th>TT</th></tr></thead>
            <tbody>{reps.map(r => <tr key={r.id}><td className="mono" style={{ fontSize: 11.5 }}>{dmy(r.date)}</td><td><span className="badge badge-gray">{r.type}</span></td><td style={{ fontSize: 12 }}>{r.content}</td><td className="num"><b>{nf(r.cost, 1)} tr</b></td><td style={{ fontSize: 11.5 }}>{r.vendor === 'internal' ? 'Nội bộ' : (DB.byId[r.vendor] || DB.partners.find(x => x.id === r.vendor) || {}).name}</td><td><Badge map={DOC_ST} k={r.status === 'doing' ? 'pending' : 'approved'} /></td></tr>)}
              {!reps.length && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 16, color: 'var(--ink-400)' }}>Chưa có lịch sử sửa chữa</td></tr>}</tbody>
          </table>
        )}

        {tab === 'nguoi-vh' && (
          <table className="tbl tbl-compact"><thead><tr><th>Người vận hành</th><th>Từ ngày</th><th>Đến ngày</th><th>Trạng thái</th></tr></thead>
            <tbody>{ops.map(o => <tr key={o.id}><td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar id={o.person} size="av-sm" />{drv(o.person)}</div></td><td className="mono" style={{ fontSize: 11.5 }}>{dmy(o.from)}</td><td className="mono" style={{ fontSize: 11.5 }}>{o.to ? dmy(o.to) : '—'}</td><td>{o.current ? <span className="badge badge-green">Hiện tại</span> : <span className="badge badge-gray">Đã chuyển</span>}</td></tr>)}
              {!ops.length && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 16, color: 'var(--ink-400)' }}>Chưa gán người vận hành</td></tr>}</tbody>
          </table>
        )}

        {tab === 'thue' && e.rent && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 16px', marginBottom: 12 }}>
              {[['Nhà cung cấp', (DB.partners.find(x => x.id === e.rent.supplier) || {}).name], ['Hình thức thuê', { hour: 'Theo giờ', day: 'Theo ngày', trip: 'Theo chuyến', month: 'Theo tháng' }[e.rent.form]], ['Đơn giá', nf(e.rent.price) + ' k/' + { hour: 'giờ', day: 'ngày', trip: 'chuyến', month: 'tháng' }[e.rent.form]], ['Thời hạn', dmy(e.rent.start) + ' → ' + dmy(e.rent.end)], ['Đã sử dụng', e.rent.used + ' / ' + e.rent.quota], ['Còn lại', (e.rent.quota - e.rent.used) + ' đơn vị']].map(([k, v]) =>
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line-soft)', padding: '5px 0', fontSize: 12.5 }}><span className="muted">{k}</span><b>{v}</b></div>)}
            </div>
            <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span className="muted">Mức sử dụng hợp đồng</span><b className="mono">{Math.round(e.rent.used / e.rent.quota * 100)}%</b></div>
              <Bar value={e.rent.used} max={e.rent.quota} tone={e.rent.used / e.rent.quota > 0.85 ? 'red' : 'blue'} />
              <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>Hết hạn {dmy(e.rent.end)} — {certDays(e.rent.end)}</div>
            </div>
          </div>
        )}
      </Modal>
    );
  }

  function certColor(d) { const days = daysTo(d); return days < 0 ? 'var(--red-500)' : days <= 15 ? 'var(--amber-500)' : 'var(--green-500)'; }
  function certDays(d) { const days = daysTo(d); return days < 0 ? 'Đã quá hạn ' + (-days) + ' ngày' : 'Còn ' + days + ' ngày'; }
  function daysTo(dateStr) { return Math.round((new Date(dateStr) - new Date('2026-05-16')) / 86400000); }

  /* ════════════════════ 3. NHÂN SỰ DỰ ÁN ════════════════════ */
  function SiteNhanSu({ p, go }) {
    const [fType, setFType] = useState('all');
    const [fTeam, setFTeam] = useState('all');
    const staff = DB.projectStaff.filter(s => s.proj === p.id);
    const list = staff.filter(s => (fType === 'all' || s.staffType === fType) && (fTeam === 'all' || s.team === fTeam));
    const crews = DB.outsourcedCrews.filter(c => c.proj === p.id);
    const ts = (pid) => DB.timesheet.find(t => t.person === pid);
    const teamsUsed = [...new Set(staff.map(s => s.team))];
    const companyN = staff.filter(s => s.staffType === 'company').length;
    const outN = staff.filter(s => s.staffType === 'outsourced').length + crews.reduce((s, c) => s + c.count, 0);

    return (
      <div>
        <SectionHead title="Nhân sự tham gia dự án" sub={p.name + ' · ' + companyN + ' nhân sự công ty · ' + outN + ' thuê ngoài'} icon="users"
          right={<button className="btn btn-sm" onClick={() => go({ page: 'hrm-cham-cong' })}><Icon name="crosshair" size={14} />Chấm công GPS</button>} />

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Nhân sự công ty" icon="users" value={companyN} unit="người" edge="var(--blue-500)" />
          <Stat label="Thuê ngoài" icon="partner" value={outN} unit="người" edge="var(--orange-500)" />
          <Stat label="Có mặt hôm nay" icon="check-circle" value={staff.filter(s => { const t = ts(s.person); return t && t.status !== 'off'; }).length} unit={'/ ' + companyN} edge="var(--green-500)" />
          <Stat label="Đang vận hành TB" icon="excavator" value={staff.filter(s => s.equip).length} unit="người" edge="var(--violet-500)" />
        </div>

        <div className="card" style={{ padding: 12, marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="seg">
            {[['all', 'Tất cả'], ['company', 'Nhân sự công ty'], ['outsourced', 'Thuê ngoài']].map(([k, l]) => <button key={k} className={fType === k ? 'active' : ''} onClick={() => setFType(k)}>{l}</button>)}
          </div>
          <FilterSelect label="Tổ đội" value={fTeam} onChange={setFTeam} opts={[['all', 'Tất cả tổ đội'], ...teamsUsed.map(t => [t, DB.teamName(t)])]} />
        </div>

        {/* danh sách nhân sự có hồ sơ */}
        <Card title="Danh sách nhân sự (có hồ sơ)" icon="users" scroll>
          <table className="tbl"><thead><tr><th>Nhân sự</th><th>Loại</th><th>Tổ / Đội</th><th>Vai trò trong dự án</th><th>Khu vực</th><th>Thiết bị vận hành</th><th>Hôm nay</th></tr></thead>
            <tbody>{list.map(s => { const pr = DB.byId[s.person]; const t = ts(s.person); const eq = s.equip ? DB.equipment.find(x => x.id === s.equip) : null; const area = s.area ? DB.areas.find(a => a.id === s.area) : null; return (
              <tr key={s.person}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar id={s.person} size="av-sm" /><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>{pr.name}{s.lead && <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 9.5 }}>Tổ trưởng</span>}</div><div className="muted" style={{ fontSize: 10.5 }}>{pr.phone}</div></div></div></td>
                <td>{s.staffType === 'company' ? <span className="badge badge-blue">Công ty</span> : <span className="badge badge-orange">Thuê ngoài</span>}</td>
                <td style={{ fontSize: 12 }}>{DB.teamName(s.team)}</td>
                <td style={{ fontSize: 12 }}>{s.role}</td>
                <td style={{ fontSize: 11.5 }}>{area ? area.name : '—'}</td>
                <td>{eq ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}><Icon name={eq.kind === 'vehicle' ? 'truck' : 'excavator'} size={13} style={{ color: 'var(--violet-500)' }} />{eq.name}</span> : <span className="muted">—</span>}</td>
                <td>{!t ? <span className="muted">—</span> : t.status === 'off' ? <span className="badge badge-gray">Vắng</span> : t.status === 'late' ? <span className="badge badge-amber">Muộn {t.checkIn}</span> : <span className="badge badge-green">{t.checkIn}</span>}</td>
              </tr>
            ); })}</tbody>
          </table>
        </Card>

        {/* tổ thuê ngoài (theo đội, không hồ sơ cá nhân) */}
        {(fType === 'all' || fType === 'outsourced') && crews.length > 0 && <div style={{ marginTop: 14 }}>
          <Card title="Tổ / đội thuê ngoài (theo nhà cung cấp)" icon="partner" color="var(--orange-500)" scroll>
            <table className="tbl"><thead><tr><th>Tổ / Đội</th><th>Nhà cung cấp</th><th>Phụ trách</th><th className="num">Số người</th><th>Vai trò</th><th>Thời hạn</th><th className="num">Đơn giá/ngày</th></tr></thead>
              <tbody>{crews.map(c => <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td style={{ fontSize: 12 }}>{(DB.partners.find(x => x.id === c.supplier) || {}).name}</td>
                <td style={{ fontSize: 12 }}>{c.leadName}<div className="muted" style={{ fontSize: 10.5 }}>{c.phone}</div></td>
                <td className="num"><b>{c.count}</b></td>
                <td style={{ fontSize: 11.5 }}>{c.role}</td>
                <td className="mono" style={{ fontSize: 11 }}>{dmy(c.start)} → {dmy(c.end)}</td>
                <td className="num">{nf(c.dayRate, 2)} tr</td>
              </tr>)}</tbody>
            </table>
          </Card>
        </div>}
      </div>
    );
  }

  /* ════════════════════ 4. CẢNH BÁO CÔNG TRƯỜNG (8 loại) ════════════════════ */
  function buildSiteAlerts(p) {
    const out = [];
    // 1. Tiến độ chậm
    DB.areas.filter(a => a.proj === p.id && a.status === 'active' && a.progress < 70).forEach(a => out.push({ g: 'progress', level: a.progress < 60 ? 'red' : 'amber', icon: 'target', title: 'Tiến độ chậm: ' + a.name, desc: 'Đạt ' + a.progress + '% — chậm so với kế hoạch đoạn ' + a.kmS + '→' + a.kmE, tab: 'tien-do', act: 'Xem tiến độ' }));
    // 2. Hao hụt vật liệu
    (DB.materialBudget[p.id] || []).filter(m => (m.actual - m.plan) / m.plan * 100 > m.allow).forEach(m => { const pct = ((m.actual - m.plan) / m.plan * 100).toFixed(1); out.push({ g: 'hao-hut', level: pct > 4 ? 'red' : 'amber', icon: 'chart', title: 'Vượt định mức: ' + m.mat, desc: 'Hao hụt +' + pct + '% (định mức ≤' + m.allow + '%) — KL thực tế ' + nf(m.actual) + ' ' + m.unit, tab: 'nhat-ky', act: 'Xem hao hụt' }); });
    // 3. Thiết bị thuê sắp hết hạn
    DB.equipment.filter(e => e.loc === p.id && e.rent).forEach(e => { const d = daysTo(e.rent.end); if (d <= 30) out.push({ g: 'thue', level: d <= 5 ? 'red' : 'amber', icon: 'clock', title: e.name + ' sắp hết hạn thuê', desc: 'Hết hạn ' + dmy(e.rent.end) + ' · ' + certDays(e.rent.end) + ' · ' + (DB.partners.find(x => x.id === e.rent.supplier) || {}).name, tab: 'thiet-bi', act: 'Xem thiết bị' }); });
    // 4. Chấm công bất thường
    [{ id: 'u11', n: 5 }, { id: 'u7', n: 3 }].forEach(x => { const pr = DB.byId[x.id]; if (pr) out.push({ g: 'cham-cong', level: x.n >= 5 ? 'red' : 'amber', icon: 'calendar', title: pr.name + ' chấm công bất thường', desc: 'Vắng/thiếu giờ ' + x.n + ' ngày gần nhất — cần xác minh', page: 'hrm-cham-cong', act: 'Xem chấm công' }); });
    // 5. QR bất thường (đối soát lệch)
    DB.vehicleLogs.forEach(v => { const e = DB.equipment.find(x => x.id === v.equip) || {}; const qr = DB.drops.filter(d => d.plate === e.plate).reduce((s, d) => s + d.trips, 0); if (e.plate && qr && Math.abs(v.trips - qr) > 0) out.push({ g: 'qr', level: 'amber', icon: 'scan', title: e.name + ': lệch số chuyến QR', desc: 'Khai ' + v.trips + ' chuyến / QR ghi ' + qr + ' chuyến — nghi khai khống, cần đối soát', tab: 'bao-cao', act: 'Đối soát QR' }); });
    // 6. Vật tư tồn thấp tại kho công trường
    DB.materials.filter(m => m.wh === 'wh2' && m.stock <= m.min).forEach(m => out.push({ g: 'ton-thap', level: 'amber', icon: 'package', title: 'Tồn thấp: ' + m.name, desc: 'Còn ' + nf(m.stock, m.stock < 100 ? 1 : 0) + ' ' + m.unit + ' (tối thiểu ' + nf(m.min) + ') tại kho hiện trường', tab: 'ton-kho', act: 'Xem tồn kho' }));
    // 7. Chứng chỉ/giấy phép sắp hết hạn
    DB.personCerts.filter(c => daysTo(c.expiry) <= 20).forEach(c => { const pr = DB.byId[c.person]; out.push({ g: 'chung-chi', level: daysTo(c.expiry) < 0 ? 'red' : 'amber', icon: 'shield-check', title: c.name + ' — ' + (pr ? pr.name : ''), desc: c.no + ' · ' + certDays(c.expiry), tab: 'nhan-su', act: 'Xem nhân sự' }); });
    DB.equipment.filter(e => e.loc === p.id && e.cert && daysTo(e.cert.expiry) <= 20).forEach(e => out.push({ g: 'chung-chi', level: daysTo(e.cert.expiry) < 0 ? 'red' : 'amber', icon: 'shield-check', title: e.cert.name + ' — ' + e.name, desc: e.cert.no + ' · ' + certDays(e.cert.expiry), tab: 'thiet-bi', act: 'Xem thiết bị' }));
    // 8. An toàn lao động
    out.push({ g: 'atld', level: 'blue', icon: 'alert', title: 'Chưa kiểm tra ATLĐ khu vực Km7', desc: 'Hạng mục đào sâu Km7+200 chưa có biên bản kiểm tra an toàn tuần này', tab: 'nhat-ky', act: 'Ghi nhận ATLĐ' });
    return out;
  }
  const ALERT_GROUPS = [
    { id: 'progress', label: 'Tiến độ chậm', icon: 'target' },
    { id: 'hao-hut', label: 'Hao hụt vật liệu', icon: 'chart' },
    { id: 'thue', label: 'Thiết bị thuê hết hạn', icon: 'clock' },
    { id: 'cham-cong', label: 'Chấm công bất thường', icon: 'calendar' },
    { id: 'qr', label: 'QR / chuyến bất thường', icon: 'scan' },
    { id: 'ton-thap', label: 'Vật tư tồn thấp', icon: 'package' },
    { id: 'chung-chi', label: 'Chứng chỉ sắp hết hạn', icon: 'shield-check' },
    { id: 'atld', label: 'An toàn lao động', icon: 'alert' },
  ];

  function SiteAlerts({ p, go, onTab, compact }) {
    const alerts = useMemo(() => buildSiteAlerts(p), [p.id]);
    const [filter, setFilter] = useState('all');
    const tone = { red: 'var(--red-500)', amber: 'var(--amber-500)', blue: 'var(--blue-500)' };
    const bg = { red: 'var(--red-50)', amber: 'var(--amber-50)', blue: 'var(--blue-50)' };
    const shown = compact ? alerts.slice(0, 4) : (filter === 'all' ? alerts : alerts.filter(a => a.g === filter));
    const open = (a) => { if (a.page) go({ page: a.page }); else if (a.tab && onTab) onTab(a.tab); };

    if (compact) return (
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-head"><div className="card-title"><Icon name="alert" size={15} style={{ color: 'var(--red-500)' }} />Cảnh báo công trường<span className="badge badge-red" style={{ marginLeft: 4 }}>{alerts.length}</span></div>{onTab && <button className="btn btn-sm btn-ghost" onClick={() => onTab('canh-bao')}>Xem tất cả</button>}</div>
        <div>{shown.map((a, i) => (
          <div key={i} onClick={() => open(a)} style={{ display: 'flex', gap: 11, padding: '10px 13px', borderBottom: i < shown.length - 1 ? '1px solid var(--line-soft)' : 'none', cursor: 'pointer', alignItems: 'center' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: bg[a.level], color: tone[a.level], display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={a.icon} size={15} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>{a.title}</div><div className="muted" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.desc}</div></div>
            <Icon name="chevron-right" size={15} style={{ color: 'var(--ink-300)' }} />
          </div>
        ))}</div>
      </div>
    );

    return (
      <div>
        <SectionHead title="Cảnh báo công trường" sub={alerts.length + ' cảnh báo cần xử lý tại ' + p.name} icon="alert"
          right={<span className="badge badge-red" style={{ height: 30, padding: '0 12px' }}><Icon name="alert" size={13} />{alerts.length} cảnh báo</span>} />
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          <button className={'chip ' + (filter === 'all' ? 'active' : '')} onClick={() => setFilter('all')}>Tất cả ({alerts.length})</button>
          {ALERT_GROUPS.map(g => { const c = alerts.filter(a => a.g === g.id).length; if (!c) return null; return <button key={g.id} className={'chip ' + (filter === g.id ? 'active' : '')} onClick={() => setFilter(g.id)}><Icon name={g.icon} size={12} />{g.label} ({c})</button>; })}
        </div>
        {ALERT_GROUPS.filter(g => filter === 'all' || filter === g.id).map(g => {
          const items = alerts.filter(a => a.g === g.id); if (!items.length) return null;
          return <div key={g.id} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-700)' }}><Icon name={g.icon} size={15} style={{ color: 'var(--orange-500)' }} />{g.label}<span className="badge badge-gray">{items.length}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{items.map((a, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 13, padding: 13, alignItems: 'center', borderLeft: '3px solid ' + tone[a.level] }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: bg[a.level], color: tone[a.level], display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={a.icon} size={18} /></div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div><div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 2 }}>{a.desc}</div></div>
                <button className="btn btn-sm" onClick={() => open(a)}>{a.act}</button>
              </div>
            ))}</div>
          </div>;
        })}
      </div>
    );
  }

  Object.assign(window, { SiteBaoCao, SiteThietBi, SiteNhanSu, SiteAlerts });
})();
