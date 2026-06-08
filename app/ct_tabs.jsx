/* Chi tiết Công trường — các tab → window.CTTabs (+ window.QRScan tái sử dụng) */
(function () {
  const { useState, useEffect, useRef } = window.React;
  const { Icon, DB, Badge, Bar, dmy, nf, money, Avatar, AvatarStack, Modal, Field, toast, Tabs, SectionHead, AREA_ST, EQ_ST, OWN_ST, DOC_ST } = window;

  /* ============ QR Scanner (reusable) ============ */
  function QRScan({ title = 'Quét mã QR', onClose, onResult, mode = 'single' }) {
    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState(null);
    const [count, setCount] = useState(0);
    const [log, setLog] = useState([]);
    useEffect(() => {
      if (mode !== 'count' && scanning) {
        const t = setTimeout(() => { setScanning(false); setResult(DB.equipment[0]); }, 1800);
        return () => clearTimeout(t);
      }
    }, [scanning, mode]);

    const doCount = () => {
      const plates = ['29C-15653', '29C-02617', '29C-15618', '29C-15678', '29C-15605'];
      const plate = plates[count % plates.length];
      setCount(c => c + 1);
      setLog(l => [{ plate, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), vol: 20 }, ...l]);
      toast('Đã ghi nhận chuyến xe ' + plate, 'ok');
    };

    return (
      <Modal title={title} width={mode === 'count' ? 760 : 480} onClose={onClose}
        foot={mode === 'count'
          ? <><div style={{ marginRight: 'auto', fontSize: 13 }}>Tổng: <b className="mono">{count}</b> chuyến · <b className="mono">{count * 20}</b> m³</div><button className="btn" onClick={onClose}>Đóng</button><button className="btn btn-primary" onClick={() => { toast('Đã lưu ' + count + ' chuyến'); onClose(); }}>Lưu phiên đếm</button></>
          : <button className="btn" onClick={onClose}>Đóng</button>}>
        <div style={{ display: mode === 'count' ? 'grid' : 'block', gridTemplateColumns: '300px 1fr', gap: 18 }}>
          <div>
            {/* scanner viewport */}
            <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--ink-900)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 28, border: '2px solid rgba(255,255,255,.5)', borderRadius: 10 }}>
                {['tl', 'tr', 'bl', 'br'].map(c => <span key={c} style={{ position: 'absolute', width: 22, height: 22, borderColor: 'var(--orange-500)', borderStyle: 'solid', [c[0] === 't' ? 'top' : 'bottom']: -2, [c[1] === 'l' ? 'left' : 'right']: -2, borderWidth: c[0] === 't' ? (c[1] === 'l' ? '3px 0 0 3px' : '3px 3px 0 0') : (c[1] === 'l' ? '0 0 3px 3px' : '0 3px 3px 0'), borderRadius: 3 }} />)}
              </div>
              <div className="scanline" style={{ position: 'absolute', left: 30, right: 30, height: 2, background: 'linear-gradient(90deg,transparent,var(--orange-500),transparent)', boxShadow: '0 0 8px var(--orange-500)', animation: 'scanmove 1.8s ease-in-out infinite' }} />
              <Icon name="qr" size={70} style={{ color: 'rgba(255,255,255,.16)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,.7)', fontSize: 11.5 }}>{mode === 'count' ? 'Hướng camera vào QR trên xe để đếm chuyến' : (scanning ? 'Đang tìm mã QR…' : 'Đã nhận diện thiết bị')}</div>
            </div>
            {mode === 'count' && <button className="btn btn-accent" style={{ width: '100%', marginTop: 12, height: 44, fontSize: 14 }} onClick={doCount}><Icon name="scan" size={18} />Quét chuyến xe ( +1 )</button>}
            <style>{`@keyframes scanmove{0%,100%{top:32px}50%{bottom:32px;top:auto}}`}</style>
          </div>

          {mode === 'count' ? (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px 0', background: 'var(--blue-50)', borderRadius: 8 }}><div className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--blue-700)' }}>{count}</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Chuyến đã đếm</div></div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px 0', background: 'var(--orange-50)', borderRadius: 8 }}><div className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--orange-600)' }}>{count * 20}</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Tổng m³</div></div>
              </div>
              <div className="card" style={{ overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
                <table className="tbl tbl-compact"><thead><tr><th>Thời gian</th><th>Biển số</th><th className="num">m³</th></tr></thead>
                  <tbody>{log.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--ink-400)', padding: 24 }}>Chưa có chuyến nào — bấm "Quét chuyến xe"</td></tr> : log.map((l, i) => <tr key={i}><td className="mono">{l.time}</td><td className="mono">{l.plate}</td><td className="num">{l.vol}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          ) : (!scanning && result && (
            <div className="fade-in" style={{ marginTop: 14, padding: 13, border: '1px solid var(--green-200)', background: 'var(--green-100)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}><Icon name="check-circle" size={17} style={{ color: 'var(--green-600)' }} /><b>Đã nhận diện thiết bị</b></div>
              {[['Mã thiết bị', result.code], ['Tên', result.name], ['Series', result.series], ['Giờ máy hiện tại', nf(result.hourNow, 1) + ' giờ']].map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}><span className="muted">{k}</span><b className="mono">{v}</b></div>)}
              <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 10 }} onClick={() => { onResult && onResult(result); onClose(); }}>Dùng thông tin này</button>
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  /* ============ Khu vực thi công ============ */
  function KhuVuc({ p, go }) {
    const areas = DB.areas.filter(a => a.proj === p.id);
    const [create, setCreate] = useState(false);
    return (
      <div>
        <SectionHead title="Khu vực thi công" sub="Quản lý các đoạn tuyến theo lý trình Km" icon="map-pin"
          right={<button className="btn btn-sm btn-primary" onClick={() => setCreate(true)}><Icon name="plus" size={14} />Tạo khu vực</button>} />
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead><tr><th>Mã / Tên khu vực</th><th>Lý trình</th><th className="num">Chiều dài</th><th>Phụ trách</th><th>Tiến độ</th><th>Đối tượng gắn</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {areas.map(a => (
                <tr key={a.id} className="clickable">
                  <td><div style={{ fontWeight: 600 }}>{a.name}</div><div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{a.code}</div></td>
                  <td className="mono" style={{ fontSize: 12 }}>{a.kmS} → {a.kmE}</td>
                  <td className="num">{nf(a.len)} m</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={a.mgr} size="av-sm" />{DB.byId[a.mgr].name}</div></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120 }}><Bar value={a.progress} /><span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{a.progress}%</span></div></td>
                  <td><div style={{ display: 'flex', gap: 6, fontSize: 11 }}><span className="badge badge-gray"><Icon name="tasks" size={10} />{2 + (a.progress % 4)}</span><span className="badge badge-gray"><Icon name="excavator" size={10} />{1 + (a.progress % 3)}</span></div></td>
                  <td><Badge map={AREA_ST} k={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {create && <Modal title="Tạo khu vực thi công" sub="Khu vực được gán công việc, thiết bị và nhân sự" width={680} onClose={() => setCreate(false)}
          foot={<><button className="btn" onClick={() => setCreate(false)}>Huỷ</button><button className="btn btn-primary" onClick={() => { toast('Đã tạo khu vực'); setCreate(false); }}>Tạo khu vực</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <Field label="Mã khu vực" req><input className="input" defaultValue="KV-007" readOnly style={{ background: 'var(--surface-2)' }} /></Field>
            <Field label="Tên khu vực" req><input className="input" placeholder="VD: Đoạn nền Km19+500 ~ Km23+000" /></Field>
            <Field label="Lý trình bắt đầu" req><input className="input" placeholder="Km..." /></Field>
            <Field label="Lý trình kết thúc" req><input className="input" placeholder="Km..." /></Field>
            <Field label="Chiều dài tính toán (m)"><input className="input" type="number" /></Field>
            <Field label="Người phụ trách chính" req><select className="select">{DB.people.map(p => <option key={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Ngày bắt đầu dự kiến"><input className="input" type="date" /></Field>
            <Field label="Trạng thái" req><select className="select"><option>Chưa thi công</option><option>Đang thi công</option><option>Tạm dừng</option><option>Hoàn thành</option></select></Field>
            <Field label="Ghi chú" span={2}><textarea className="textarea" placeholder="Đặc điểm khu vực, khó khăn, lưu ý…" /></Field>
          </div>
        </Modal>}
      </div>
    );
  }

  /* ============ Báo cáo hao hụt ============ */
  function HaoHut({ p }) {
    const rows = [
      { name: 'Đất đắp K95', unit: 'm³', plan: 320000, actual: 332800, allow: 3 },
      { name: 'Cấp phối đá dăm (CPĐD)', unit: 'm³', plan: 48500, actual: 50900, allow: 4 },
      { name: 'Bê tông thương phẩm M300', unit: 'm³', plan: 6200, actual: 6510, allow: 2 },
      { name: 'Cát vàng', unit: 'm³', plan: 12400, actual: 13380, allow: 5 },
      { name: 'Xi măng PCB40', unit: 'tấn', plan: 1850, actual: 1905, allow: 2 },
      { name: 'Thép D≥10', unit: 'tấn', plan: 420, actual: 426, allow: 1.5 },
    ];
    const tot = rows.reduce((a, r) => { const loss = r.actual - r.plan; a.plan += r.plan; a.over += loss > 0 ? loss : 0; return a; }, { plan: 0, over: 0 });
    return (
      <div>
        <div className="auto-note" style={{ marginTop: 0, marginBottom: 14 }}><Icon name="info" size={13} />So sánh <b>Khối lượng dự toán</b> (QL công trường nhập) với <b>Khối lượng thực tế</b> sử dụng (từ nhật ký thi công, phiếu đặt bê tông & xuất kho). Vượt định mức cho phép sẽ bị tô đỏ.</div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
          <window.Stat label="Số hạng mục vượt định mức" icon="alert" value={rows.filter(r => (r.actual - r.plan) / r.plan * 100 > r.allow).length} unit={'/' + rows.length} edge="var(--red-500)" />
          <window.Stat label="Tỷ lệ hao hụt bình quân" icon="chart" value={nf(rows.reduce((s, r) => s + (r.actual - r.plan) / r.plan * 100, 0) / rows.length, 1)} unit="%" edge="var(--orange-500)" />
          <window.Stat label="Giá trị vượt ước tính" icon="wallet" value="~1.6" unit="tỷ ₫" edge="var(--violet-500)" />
        </div>
        <div className="card" style={{ overflow: 'auto' }}>
          <div className="card-head"><div className="card-title"><Icon name="chart" size={15} style={{ color: 'var(--orange-500)' }} />Báo cáo hao hụt vật liệu — {p.name}</div></div>
          <table className="tbl tbl-compact">
            <thead><tr><th>Vật liệu</th><th>ĐVT</th><th className="num">KL dự toán</th><th className="num">KL thực tế</th><th className="num">Hao hụt</th><th className="num">% hao hụt</th><th className="num">Định mức CP</th><th>Đánh giá</th></tr></thead>
            <tbody>{rows.map((r, i) => {
              const loss = r.actual - r.plan, pct = loss / r.plan * 100, over = pct > r.allow;
              return <tr key={i} style={over ? { background: 'var(--red-50)' } : null}>
                <td style={{ fontWeight: 600 }}>{r.name}</td><td>{r.unit}</td>
                <td className="num mono">{nf(r.plan)}</td><td className="num mono">{nf(r.actual)}</td>
                <td className="num mono" style={{ color: loss > 0 ? 'var(--red-600)' : 'var(--green-600)' }}>{loss > 0 ? '+' : ''}{nf(loss)}</td>
                <td className="num"><b style={{ color: over ? 'var(--red-600)' : 'var(--ink-800)' }}>{pct > 0 ? '+' : ''}{nf(pct, 1)}%</b></td>
                <td className="num muted">≤ {nf(r.allow, 1)}%</td>
                <td>{over ? <span className="badge badge-red">Vượt định mức</span> : <span className="badge badge-green">Trong định mức</span>}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ============ Nhật ký hàng ngày ============ */
  function NhatKy({ p }) {
    const [sub, setSub] = useState('thi-cong');
    return (
      <div>
        <SectionHead title="Nhật ký hàng ngày" sub="Ghi nhận thi công, máy và xe vận chuyển tại công trường" icon="calendar" />
        <div style={{ marginBottom: 14 }}>
          <Tabs tabs={[{ id: 'thi-cong', label: 'Nhật ký thi công', icon: 'file', count: DB.siteLogs.length }, { id: 'may', label: 'Nhật trình máy', icon: 'excavator', count: DB.machineLogs.length }, { id: 'xe', label: 'Nhật ký xe', icon: 'truck', count: DB.vehicleLogs.length }, { id: 'hao-hut', label: 'Báo cáo hao hụt', icon: 'chart' }]} active={sub} onChange={setSub} />
        </div>
        {sub === 'thi-cong' && <SiteLog />}
        {sub === 'may' && <MachineLog />}
        {sub === 'xe' && <VehicleLog />}
        {sub === 'hao-hut' && <HaoHut p={p} />}
      </div>
    );
  }

  function SiteLog() {
    const [form, setForm] = useState(false);
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}><button className="btn btn-sm btn-primary" onClick={() => setForm(true)}><Icon name="plus" size={14} />Lập nhật ký thi công</button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DB.siteLogs.map(l => (
            <div key={l.id} className="card">
              <div className="card-head">
                <div className="card-title"><Icon name="calendar" size={14} style={{ color: 'var(--blue-600)' }} />Nhật ký ngày {dmy(l.date)}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Avatar id={l.author} size="av-sm" /><span style={{ fontSize: 12 }}>{DB.byId[l.author].name}</span><Badge map={DOC_ST} k="approved" /></div>
              </div>
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 4 }}>
                <Mini label="Thời tiết" value={`${l.weatherAM} / ${l.weatherPM} / ${l.weatherEve}`} icon="sun" />
                <Mini label="Cán bộ" value={l.staff + ' người'} icon="users" />
                <Mini label="Công nhân" value={l.workers + ' người'} icon="users" />
                <Mini label="Máy thi công" value={l.machines.length + ' máy'} icon="excavator" />
              </div>
              <div style={{ padding: '0 14px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Box title="Nội dung công việc trong ngày" text={l.work} />
                <Box title="Nội dung nghiệm thu" text={l.accept} />
                <Box title="ATLĐ, vệ sinh môi trường, PCCN" text={l.safety} ok />
                {l.note && <Box title="Kiến nghị nhà thầu" text={l.note} />}
              </div>
            </div>
          ))}
        </div>
        {form && <SiteLogForm onClose={() => setForm(false)} />}
      </div>
    );
  }
  const Mini = ({ label, value, icon }) => <div style={{ background: 'var(--surface-2)', borderRadius: 7, padding: '9px 11px' }}><div style={{ fontSize: 10.5, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name={icon} size={12} />{label}</div><div style={{ fontWeight: 600, fontSize: 12.5, marginTop: 3 }}>{value}</div></div>;
  const Box = ({ title, text, ok }) => <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', marginBottom: 4 }}>{title}</div><div style={{ fontSize: 12.5, lineHeight: 1.5, color: ok ? 'var(--green-600)' : 'var(--ink-700)' }}>{ok && <Icon name="shield-check" size={13} style={{ marginRight: 4 }} />}{text}</div></div>;

  function SiteLogForm({ onClose }) {
    return (
      <Modal title="Lập nhật ký thi công" sub="Nhiều trường tự động lấy từ dữ liệu hiện trường hôm nay" width={780} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Huỷ</button><button className="btn" onClick={() => { toast('Đã lưu nháp'); }}>Lưu nháp</button><button className="btn btn-primary" onClick={() => { toast('Đã gửi duyệt nhật ký'); onClose(); }}>Gửi duyệt</button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
          <Field label="Ngày lập"><input className="input" type="date" defaultValue="2026-05-16" /></Field>
          <Field label="Người lập"><input className="input" defaultValue="Trần Văn Cường" style={{ background: 'var(--surface-2)' }} readOnly /></Field>
          <Field label="Công trường"><input className="input" defaultValue="Hữu Nghị – Chi Lăng" style={{ background: 'var(--surface-2)' }} readOnly /></Field>
        </div>
        <div className="auto-note"><Icon name="info" size={13} />Nhân lực & máy móc được tự động lấy từ chấm công và tab Thiết bị của hôm nay.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13, marginTop: 8 }}>
          <Field label="Thời tiết Sáng"><select className="select"><option>Nắng</option><option>Bình thường</option><option>Mưa</option></select></Field>
          <Field label="Thời tiết Chiều"><select className="select"><option>Nắng</option><option>Bình thường</option><option>Mưa</option></select></Field>
          <Field label="Thời tiết Tối"><select className="select"><option>Bình thường</option><option>Nắng</option><option>Mưa</option></select></Field>
          <Field label="Cán bộ (tự động)"><input className="input" defaultValue="6" style={{ background: 'var(--surface-2)' }} readOnly /></Field>
          <Field label="Công nhân (tự động)"><input className="input" defaultValue="42" style={{ background: 'var(--surface-2)' }} readOnly /></Field>
          <Field label="Tổng nhân sự (tự động)"><input className="input" defaultValue="48" style={{ background: 'var(--surface-2)' }} readOnly /></Field>
        </div>
        <Field label="Nội dung công việc thực hiện trong ngày" span={2}><textarea className="textarea" style={{ marginTop: 13 }} placeholder="Gợi ý từ danh sách công việc đang thực hiện hôm nay…" defaultValue="Đào điều phối đất Km7→Km4; đắp & lu lèn K95 đoạn Km4+500." /></Field>
        <Field label="Nội dung nghiệm thu"><textarea className="textarea" style={{ marginTop: 13 }} placeholder="Nội dung quan trọng — ghi chi tiết…" /></Field>
        <Field label="Ý kiến & kiến nghị các bên"><textarea className="textarea" style={{ marginTop: 13 }} /></Field>
      </Modal>
    );
  }

  function MachineLog() {
    const [form, setForm] = useState(false);
    const machine = DB.machineLogs;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="tag-strip"><span className="badge badge-blue">Tổng giờ máy tháng 5: <b className="mono">1.842 giờ</b></span><span className="badge badge-orange">Dầu cấp: <b className="mono">2.640 L</b></span></div>
          <button className="btn btn-sm btn-primary" onClick={() => setForm(true)}><Icon name="plus" size={14} />Nhật trình máy</button>
        </div>
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Ngày</th><th>Máy</th><th>Người lái</th><th>Nội dung</th><th className="num">Giờ đầu</th><th className="num">Giờ cuối</th><th className="num">Tổng giờ</th><th className="num">Dầu (L)</th><th className="num">KL</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {machine.map(m => { const e = DB.equipment.find(x => x.id === m.equip); return (
                <tr key={m.id} className="clickable">
                  <td className="mono" style={{ fontSize: 12 }}>{dmy(m.date)}</td>
                  <td><div style={{ fontWeight: 600, fontSize: 12 }}>{e.name}</div></td>
                  <td>{DB.byId[m.driver].name}</td>
                  <td style={{ fontSize: 12 }}>{m.work}</td>
                  <td className="num">{nf(m.hStart, 1)}</td>
                  <td className="num">{nf(m.hEnd, 1)}</td>
                  <td className="num"><b>{nf(m.hours, 1)}</b></td>
                  <td className="num">{m.fuel || '—'}</td>
                  <td className="num">{m.qty ? nf(m.qty) + ' ' + m.unit : '—'}</td>
                  <td><Badge map={DOC_ST} k={m.status} /></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
        {form && <MachineLogForm onClose={() => setForm(false)} />}
      </div>
    );
  }

  function MachineLogForm({ onClose }) {
    const [scan, setScan] = useState(false);
    const [picked, setPicked] = useState(null);
    const [trips, setTrips] = useState(0);
    const [vol, setVol] = useState('');
    useEffect(() => { if (picked) setVol(picked.avgTrip || parseFloat(picked.bucket) || 12); }, [picked]);
    const totalVol = (Number(trips) || 0) * (Number(vol) || 0);
    const h0 = picked ? picked.hourNow : '';
    return (
      <>
        <Modal title="Nhật trình máy thi công" sub="Quét QR để tự động nạp thông tin máy và giờ máy ban đầu" width={720} onClose={onClose}
          foot={<><button className="btn" style={{ marginRight: 'auto' }} onClick={() => toast('Đã copy nhật trình hôm qua')}><Icon name="refresh" size={14} />Tiếp tục máy hôm qua</button><button className="btn" onClick={onClose}>Huỷ</button><button className="btn btn-primary" onClick={() => { toast('Đã lưu nhật trình máy'); onClose(); }}>Lưu & cập nhật giờ máy</button></>}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <button className="btn btn-accent" onClick={() => setScan(true)} style={{ flex: 'none' }}><Icon name="scan" size={16} />Quét QR máy</button>
            <div className="grow">
              <div style={{ padding: '8px 12px', background: picked ? 'var(--green-100)' : 'var(--surface-2)', borderRadius: 7, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                {picked ? <><Icon name="check-circle" size={15} style={{ color: 'var(--green-600)' }} /><b>{picked.name}</b> · <span className="mono">{picked.series}</span></> : <span className="muted">Chưa chọn máy — quét QR hoặc chọn từ danh sách</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            <Field label="Ngày báo cáo"><input className="input" type="date" defaultValue="2026-05-16" /></Field>
            <Field label="Công việc / Hạng mục" req><select className="select"><option>Đắp đất K95 lớp 1-4</option><option>Lu lèn K98 hoàn thiện nền</option><option>Đào hữu cơ</option></select></Field>
            <Field label="Khu vực thi công"><select className="select">{DB.areas.filter(a => a.proj === 'p1').map(a => <option key={a.id}>{a.name}</option>)}</select></Field>
            <Field label="Người lái máy"><input className="input" defaultValue="Hoàng Văn Hải" /></Field>
            <Field label="Số giờ máy ban đầu" hint="Tự động từ lần ghi cuối"><input className="input mono" value={h0 ? nf(h0, 1) : ''} readOnly placeholder="—" style={{ background: 'var(--surface-2)' }} /></Field>
            <Field label="Số giờ máy hiện tại" req hint="Quan trọng nhất"><input className="input mono" placeholder="Nhập đồng hồ giờ máy" /></Field>
            <Field label="Nội dung hoạt động"><input className="input" placeholder="VD: Đất đắp, San nền, Lu lèn…" /></Field>
            <Field label="Đơn vị / Khối lượng"><div style={{ display: 'flex', gap: 6 }}><input className="input mono" placeholder="Số lượng" /><select className="select" style={{ width: 80 }}><option>m³</option><option>m²</option><option>tấn</option></select></div></Field>
            <Field label="Dầu Diesel cấp (L)"><input className="input mono" placeholder="Lít" /></Field>
          </div>
          <div style={{ marginTop: 14, padding: 12, border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}><Icon name="truck" size={15} style={{ color: 'var(--orange-500)' }} /><b style={{ fontSize: 12.5 }}>Khối lượng vận chuyển trong ngày</b></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
              <Field label="Số chuyến xe" hint="Tự động cộng dồn khi quét QR"><input className="input mono" type="number" value={trips} onChange={e => setTrips(e.target.value)} /></Field>
              <Field label="Khối lượng / chuyến (m³)" hint="Tự động theo dung tích máy"><input className="input mono" value={vol} onChange={e => setVol(e.target.value)} placeholder="—" style={{ background: '#fff' }} /></Field>
              <Field label="Tổng KL vận chuyển/ngày" hint="= số chuyến × khối lượng/chuyến"><input className="input mono" value={totalVol ? nf(totalVol, 1) + ' m³' : '—'} readOnly style={{ background: '#fff', fontWeight: 700, color: 'var(--orange-600)' }} /></Field>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'flex-end' }}>
            <Field label="Chụp ảnh chứng minh" span={1}><div className="ph" style={{ height: 64, width: 200, flexDirection: 'column', gap: 4, cursor: 'pointer' }}><Icon name="camera" size={18} /><span style={{ fontSize: 11 }}>Chụp nhanh</span></div></Field>
            <Field label="Bắt đầu / Kết thúc ca" className="grow"><div style={{ display: 'flex', gap: 8 }}><button className="btn btn-sm"><Icon name="play" size={13} />Bắt đầu ca</button><button className="btn btn-sm"><Icon name="stop" size={13} />Kết thúc ca</button></div></Field>
          </div>
        </Modal>
        {scan && <QRScan title="Quét QR máy thi công" onClose={() => setScan(false)} onResult={setPicked} />}
      </>
    );
  }

  function VehicleLog() {
    const [form, setForm] = useState(false);
    const v = DB.vehicleLogs;
    const totalVol = v.reduce((s, x) => s + x.vol, 0), totalTrips = v.reduce((s, x) => s + x.trips, 0);
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="tag-strip"><span className="badge badge-blue">Tổng chuyến hôm nay: <b className="mono">{totalTrips}</b></span><span className="badge badge-orange">Tổng khối lượng: <b className="mono">{nf(totalVol)} m³</b></span></div>
          <button className="btn btn-sm btn-primary" onClick={() => setForm(true)}><Icon name="plus" size={14} />Nhật ký xe</button>
        </div>
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Ngày</th><th>Xe</th><th>Lái xe</th><th>Công việc</th><th>Lấy → Đổ</th><th className="num">Chuyến</th><th className="num">KL TB/ch</th><th className="num">Tổng KL</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {v.map(x => { const e = DB.equipment.find(q => q.id === x.equip); return (
                <tr key={x.id} className="clickable">
                  <td className="mono" style={{ fontSize: 12 }}>{dmy(x.date)}</td>
                  <td><div style={{ fontWeight: 600, fontSize: 12 }}>{e.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>{e.plate}</div></td>
                  <td>{DB.byId[x.driver].name}</td>
                  <td style={{ fontSize: 12 }}>{x.work}</td>
                  <td className="mono" style={{ fontSize: 11.5 }}>{x.from} → {x.to}</td>
                  <td className="num"><b>{x.trips}</b></td>
                  <td className="num">{x.avg} m³</td>
                  <td className="num"><b>{nf(x.vol)} m³</b></td>
                  <td><Badge map={DOC_ST} k={x.status} /></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
        {form && <Modal title="Nhật ký xe vận chuyển" sub="Quét QR để tự động đếm chuyến và nạp thông tin xe" width={720} onClose={() => setForm(false)}
          foot={<><button className="btn" onClick={() => setForm(false)}>Huỷ</button><button className="btn btn-primary" onClick={() => { toast('Đã lưu nhật ký xe'); setForm(false); }}>Lưu nhật ký</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            <Field label="Ngày"><input className="input" type="date" defaultValue="2026-05-16" /></Field>
            <Field label="Xe vận chuyển" req><select className="select">{DB.equipment.filter(e => e.kind === 'vehicle').map(e => <option key={e.id}>{e.name} ({e.plate})</option>)}</select></Field>
            <Field label="Công việc / Hạng mục"><input className="input" placeholder="Đất đắp, đổ bê tông…" defaultValue="Đất đắp" /></Field>
            <Field label="Khu vực lấy"><input className="input" placeholder="VD: Km7+800" /></Field>
            <Field label="Khu vực đổ"><input className="input" placeholder="VD: Km7+200" /></Field>
            <Field label="KL trung bình/chuyến" hint="Tự động theo loại xe"><input className="input mono" defaultValue="20 m³" readOnly style={{ background: 'var(--surface-2)' }} /></Field>
          </div>
          <div className="auto-note"><Icon name="info" size={13} />Tổng số chuyến tự động tăng khi quét QR. Tổng khối lượng = số chuyến × KL trung bình.</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'flex-end' }}>
            <Field label="Tổng số chuyến" span={1}><input className="input mono" defaultValue="51" /></Field>
            <Field label="Tổng khối lượng"><input className="input mono" defaultValue="1.020 m³" readOnly style={{ background: 'var(--surface-2)' }} /></Field>
            <button className="btn btn-accent" onClick={() => setForm('count')}><Icon name="scan" size={15} />Đếm bằng QR</button>
          </div>
        </Modal>}
        {form === 'count' && <QRScan title="Đếm chuyến xe bằng QR" mode="count" onClose={() => setForm(false)} />}
      </div>
    );
  }

  /* ============ Vật liệu đổ (QR) ============ */
  function VatLieuDo({ p }) {
    const [scan, setScan] = useState(false);
    const drops = DB.drops;
    const totalTrips = drops.reduce((s, d) => s + d.trips, 0), totalVol = drops.reduce((s, d) => s + d.vol, 0);
    return (
      <div>
        <SectionHead title="Bảng xác nhận vật liệu đổ tại công trường" sub="Ghi nhận số chuyến xe & khối lượng qua quét mã QR" icon="truck"
          right={<button className="btn btn-sm btn-accent" onClick={() => setScan(true)}><Icon name="scan" size={15} />Quét QR đếm chuyến</button>} />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <window.Stat label="Tổng số xe" icon="truck" value={drops.length} unit="xe" edge="var(--blue-500)" />
          <window.Stat label="Tổng số chuyến" icon="refresh" value={totalTrips} unit="chuyến" edge="var(--orange-500)" />
          <window.Stat label="Tổng khối lượng" icon="cube" value={nf(totalVol)} unit="m³" edge="var(--green-500)" />
          <window.Stat label="Ngày ghi nhận" icon="calendar" value="16/05" edge="var(--violet-500)" foot="Đất điều phối CTY 568" />
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head"><div className="card-title"><Icon name="qr" size={15} style={{ color: 'var(--orange-500)' }} />Chi tiết chuyến xe ngày 16/05/2026</div><span className="badge badge-green"><Icon name="shield-check" size={11} />Xác thực vị trí GPS</span></div>
          <table className="tbl">
            <thead><tr><th>Giờ ghi nhận</th><th>Nội dung công việc</th><th>Biển số xe</th><th className="num">Số chuyến</th><th className="num">KL/chuyến</th><th className="num">Khối lượng (m³)</th><th></th></tr></thead>
            <tbody>
              {drops.map(d => (
                <tr key={d.id}>
                  <td className="mono">{d.time}</td>
                  <td>{d.work}</td>
                  <td><span className="mono badge badge-gray badge-sq">{d.plate}</span></td>
                  <td className="num"><b>{d.trips}</b></td>
                  <td className="num">20</td>
                  <td className="num"><b>{nf(d.vol)}</b></td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-green" style={{ fontSize: 10 }}><Icon name="check" size={10} />QR</span></td>
                </tr>
              ))}
              <tr style={{ background: 'var(--surface-2)', fontWeight: 700 }}>
                <td colSpan={3}>Tổng cộng — {drops.length} xe</td>
                <td className="num">{totalTrips}</td><td></td><td className="num" style={{ color: 'var(--orange-600)' }}>{nf(totalVol)}</td><td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="auto-note" style={{ marginTop: 12 }}><Icon name="link" size={13} />Khối lượng vật liệu đổ tự động trừ tồn kho "Đất đắp K95" nếu được liên kết với kho hiện trường.</div>
        {scan && <QRScan title="Quét QR — Đếm chuyến vật liệu đổ" mode="count" onClose={() => setScan(false)} />}
      </div>
    );
  }

  /* ============ Thiết bị tại công trường ============ */
  function ThietBiTab({ p, go }) {
    const list = DB.equipment.filter(e => e.loc === p.id);
    return (
      <div>
        <SectionHead title="Thiết bị tại công trường" sub="Danh sách, tình trạng & giờ hoạt động" icon="excavator"
          right={<button className="btn btn-sm"><Icon name="link" size={14} />Điều chuyển thiết bị</button>} />
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead><tr><th>Mã / Thiết bị</th><th>Loại</th><th>Người vận hành</th><th>Nguồn gốc</th><th className="num">Giờ máy / Km</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {list.map(e => (
                <tr key={e.id} className="clickable" onClick={() => go({ page: 'kho-thiet-bi', sub: 'detail', id: e.id })}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 28, height: 28, borderRadius: 7, background: e.kind === 'vehicle' ? 'var(--orange-50)' : 'var(--blue-50)', color: e.kind === 'vehicle' ? 'var(--orange-600)' : 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={e.kind === 'vehicle' ? 'truck' : 'excavator'} size={15} /></span><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>{e.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>{e.code}</div></div></div></td>
                  <td><span className="badge badge-gray">{e.cat}</span></td>
                  <td>{e.driver ? DB.byId[e.driver].name : '—'}</td>
                  <td><Badge map={OWN_ST} k={e.own} /></td>
                  <td className="num">{e.kind === 'vehicle' ? nf(e.kmNow) + ' km' : nf(e.hourNow, 1) + ' giờ'}</td>
                  <td><Badge map={EQ_ST} k={e.status} /></td>
                  <td style={{ textAlign: 'right' }}><Icon name="chevron-right" size={15} style={{ color: 'var(--ink-300)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ============ Tồn kho & Vật tư ============ */
  function TonKhoTab({ p }) {
    return (
      <div>
        <SectionHead title="Tồn kho & Vật tư tại công trường" sub="Kho hiện trường HN–CL · cập nhật realtime" icon="package"
          right={<div style={{ display: 'flex', gap: 8 }}><button className="btn btn-sm"><Icon name="download" size={14} />Yêu cầu vật tư</button></div>} />
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead><tr><th>Mã / Vật tư</th><th>Loại</th><th>Quy cách</th><th className="num">Tồn hiện trường</th><th>Đơn vị</th><th>Mức tồn</th></tr></thead>
            <tbody>
              {DB.materials.slice(0, 6).map(m => { const low = m.stock <= m.min; const fieldStock = Math.round(m.stock * 0.3); return (
                <tr key={m.id}>
                  <td><div style={{ fontWeight: 600, fontSize: 12.5 }}>{m.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>{m.code}</div></td>
                  <td><span className={'badge ' + (m.type === 'nl' ? 'badge-orange' : 'badge-teal')}>{m.type === 'nl' ? 'Nhiên liệu' : 'Nguyên vật liệu'}</span></td>
                  <td style={{ fontSize: 12 }}>{m.spec}</td>
                  <td className="num"><b>{nf(fieldStock)}</b></td>
                  <td>{m.unit}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 130 }}><Bar value={fieldStock} max={m.stock} tone={low ? 'red' : ''} />{low && <span className="badge badge-red" style={{ fontSize: 10 }}>Thấp</span>}</div></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ============ Nhân sự tại công trường ============ */
  function NhanSuTab({ p, go }) {
    return (
      <div>
        <SectionHead title="Nhân sự tại công trường" sub="Chấm công, tăng ca tại công trường hôm nay" icon="users"
          right={<button className="btn btn-sm" onClick={() => go({ page: 'hrm-cham-cong' })}><Icon name="crosshair" size={14} />Mở chấm công GPS</button>} />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <window.Stat label="Tổng huy động" icon="users" value={p.teamCount} unit="người" edge="var(--blue-500)" />
          <window.Stat label="Có mặt hôm nay" icon="check-circle" value="42" unit="người" edge="var(--green-500)" />
          <window.Stat label="Tăng ca tuần" icon="clock" value="86" unit="giờ" edge="var(--orange-500)" />
          <window.Stat label="Phiếu chờ duyệt" icon="file" value="2" edge="var(--amber-500)" />
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head"><div className="card-title"><Icon name="clock" size={15} style={{ color: 'var(--orange-500)' }} />Phiếu tăng ca gần đây</div></div>
          <table className="tbl">
            <thead><tr><th>Ngày</th><th>Người tăng ca</th><th>Thiết bị</th><th>Nội dung</th><th>Thời gian</th><th className="num">Số giờ</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {DB.overtime.map(o => { const e = DB.equipment.find(x => x.id === o.equip); return (
                <tr key={o.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{dmy(o.date)}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={o.person} size="av-sm" />{DB.byId[o.person].name}</div></td>
                  <td style={{ fontSize: 12 }}>{e ? e.name : '—'}</td>
                  <td style={{ fontSize: 12 }}>{o.content}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{o.from} – {o.to}</td>
                  <td className="num"><b>{nf(o.hours, 1)}h</b></td>
                  <td><Badge map={DOC_ST} k={o.status} /></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ============ Gói thầu ============ */
  function GoiThau({ p }) {
    const list = DB.bids.filter(b => b.proj === p.id);
    const [detail, setDetail] = useState(null);
    const BST = { active: { label: 'Đang thi công', cls: 'badge-green' }, pending: { label: 'Chưa khởi công', cls: 'badge-gray' }, done: { label: 'Hoàn thành', cls: 'badge-blue' } };
    const totalVal = list.reduce((s, b) => s + b.value, 0), totalPaid = list.reduce((s, b) => s + b.paid, 0);
    return (
      <div>
        <SectionHead title="Gói thầu & Hợp đồng" sub={list.length + ' gói thầu trong công trường · chỉ Khối Văn phòng được xem'} icon="file"
          right={<button className="btn btn-sm btn-primary"><Icon name="plus" size={14} />Thêm gói thầu</button>} />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <window.Stat label="Số gói thầu" icon="file" value={list.length} edge="var(--blue-500)" />
          <window.Stat label="Tổng giá trị HĐ" icon="wallet" value={money(totalVal)} edge="var(--teal-500)" />
          <window.Stat label="Đã thanh toán" icon="money" value={money(totalPaid)} edge="var(--green-500)" foot={Math.round(totalPaid / totalVal * 100) + '% giá trị'} />
          <window.Stat label="Còn lại" icon="target" value={money(totalVal - totalPaid)} edge="var(--orange-500)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(b => (
            <div key={b.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => setDetail(b)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ width: 6, background: b.status === 'active' ? 'var(--green-500)' : b.status === 'pending' ? 'var(--ink-300)' : 'var(--blue-500)', flex: 'none' }} />
                <div style={{ flex: 1, padding: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span className="badge badge-blue badge-sq mono" style={{ fontWeight: 700 }}>{b.code}</span>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{b.name}</span>
                    <span className={'badge ' + BST[b.status].cls} style={{ marginLeft: 'auto' }}><span className="dot" />{BST[b.status].label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--ink-500)', marginBottom: 11 }}>
                    <span><Icon name="map-pin" size={12} /> {b.scope}</span>
                    <span><Icon name="partner" size={12} /> {b.contractor}</span>
                    <span><Icon name="map" size={12} /> {b.areas.length} khu vực</span>
                  </div>
                  <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
                    <div style={{ flex: 1, maxWidth: 260 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}><span className="muted">Tiến độ</span><b className="mono">{b.progress}%</b></div>
                      <Bar value={b.progress} />
                    </div>
                    <div><div className="muted" style={{ fontSize: 10.5 }}>Giá trị HĐ</div><b className="mono" style={{ fontSize: 13 }}>{money(b.value)}</b></div>
                    <div><div className="muted" style={{ fontSize: 10.5 }}>Đã thanh toán</div><b className="mono" style={{ fontSize: 13, color: 'var(--green-600)' }}>{money(b.paid)}</b></div>
                    <div><div className="muted" style={{ fontSize: 10.5 }}>Nghiệm thu</div><b className="mono" style={{ fontSize: 13 }}>{b.accepted}%</b></div>
                    <Icon name="chevron-right" size={16} style={{ color: 'var(--ink-300)' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {detail && <Modal title={detail.code + ' — Chi tiết gói thầu'} sub={detail.name} width={760} onClose={() => setDetail(null)}
          foot={<><button className="btn" onClick={() => setDetail(null)}>Đóng</button><button className="btn"><Icon name="download" size={14} />Xuất hợp đồng</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Số gói thầu', detail.code], ['Phạm vi (lý trình)', detail.scope], ['Nhà thầu', detail.contractor], ['Hình thức', 'Đấu thầu rộng rãi'], ['Loại hợp đồng', 'Đơn giá điều chỉnh'], ['Thời gian thực hiện', dmy(detail.start) + ' – ' + dmy(detail.end)]].map(([k, v]) =>
              <div key={k}><div className="muted" style={{ fontSize: 11 }}>{k}</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{v}</div></div>)}
          </div>
          <div className="divider" style={{ margin: '16px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Giá trị & thanh toán</div>
              {[['Giá trị HĐ', detail.value, 'var(--ink-700)'], ['Đã nghiệm thu', Math.round(detail.value * detail.accepted / 100), 'var(--green-600)'], ['Đã thanh toán', detail.paid, 'var(--blue-600)'], ['Còn lại', detail.value - detail.paid, 'var(--orange-600)']].map(([k, v, c]) =>
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line-soft)' }}><span style={{ fontSize: 12.5 }}>{k}</span><b className="mono" style={{ color: c }}>{money(v)}</b></div>)}
            </div>
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Khu vực thuộc gói thầu</div>
              {detail.areas.map(aid => { const a = DB.areas.find(x => x.id === aid); return a ? (
                <div key={aid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <Icon name="map-pin" size={13} style={{ color: 'var(--orange-500)' }} />
                  <span style={{ flex: 1, fontSize: 12 }}>{a.name}</span>
                  <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{a.progress}%</span>
                </div>
              ) : null; })}
            </div>
          </div>
        </Modal>}
      </div>
    );
  }

  /* ============ Tài chính ============ */
  function TaiChinh({ p }) {
    const costs = [
      { d: '2026-05-16', name: 'Chi dầu Diesel cho đội máy', cat: 'Nhiên liệu', amt: 54, by: 'u8' },
      { d: '2026-05-15', name: 'Thanh toán thầu phụ vận chuyển CTY 568', cat: 'Thầu phụ', amt: 168, by: 'u2' },
      { d: '2026-05-14', name: 'Tạm ứng lương đội cơ giới', cat: 'Nhân công', amt: 95, by: 'u2' },
      { d: '2026-05-12', name: 'Sửa chữa Lu 37', cat: 'Sửa chữa', amt: 45, by: 'u9' },
      { d: '2026-05-10', name: 'Mua cấp phối đá dăm', cat: 'Vật tư', amt: 142, by: 'u8' },
    ];
    return (
      <div>
        <SectionHead title="Tài chính công trường" sub="Nhật ký chi phí, thanh toán thầu phụ, tạm ứng" icon="wallet"
          right={<button className="btn btn-sm btn-primary"><Icon name="plus" size={14} />Ghi nhận chi phí</button>} />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <window.Stat label="Chi phí luỹ kế" icon="wallet" value={money(p.spent)} edge="var(--teal-500)" />
          <window.Stat label="Chi tháng 5" icon="money" value="504" unit="tr" edge="var(--orange-500)" />
          <window.Stat label="Tạm ứng chưa QT" icon="clock" value="95" unit="tr" edge="var(--amber-500)" />
          <window.Stat label="Công nợ thầu phụ" icon="partner" value="168" unit="tr" edge="var(--red-500)" />
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head"><div className="card-title"><Icon name="file" size={15} style={{ color: 'var(--blue-600)' }} />Nhật ký chi phí</div></div>
          <table className="tbl">
            <thead><tr><th>Ngày</th><th>Nội dung chi</th><th>Hạng mục</th><th>Người ghi</th><th className="num">Số tiền</th></tr></thead>
            <tbody>
              {costs.map((c, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 12 }}>{dmy(c.d)}</td>
                  <td style={{ fontWeight: 600, fontSize: 12.5 }}>{c.name}</td>
                  <td><span className="badge badge-gray">{c.cat}</span></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={c.by} size="av-sm" />{DB.byId[c.by].name}</div></td>
                  <td className="num"><b>{nf(c.amt)}.000 ₫</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ============ Báo cáo ============ */
  function BaoCaoTab({ p }) {
    const reports = [
      { name: 'Báo cáo tiến độ tổng hợp', icon: 'target', desc: 'Tiến độ theo giai đoạn, khu vực, công việc' },
      { name: 'Báo cáo khối lượng đào/đắp', icon: 'cube', desc: 'Khối lượng thực hiện theo ngày/tháng' },
      { name: 'Báo cáo giờ máy & nhiên liệu', icon: 'clock', desc: 'Hiệu suất thiết bị, tiêu hao dầu' },
      { name: 'Báo cáo chi phí công trường', icon: 'wallet', desc: 'Chi phí theo hạng mục, so kế hoạch' },
      { name: 'Báo cáo chuyến xe vận chuyển', icon: 'truck', desc: 'Tổng hợp chuyến & khối lượng vật liệu' },
      { name: 'Báo cáo nhân sự & chấm công', icon: 'users', desc: 'Công, tăng ca theo đội' },
    ];
    return (
      <div>
        <SectionHead title="Báo cáo công trường" sub="Xuất báo cáo PDF / Excel" icon="report" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {reports.map((r, i) => (
            <div key={i} className="card card-pad" style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }} onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <span style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={r.icon} size={19} /></span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div><div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{r.desc}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 9 }}><button className="btn btn-sm" onClick={() => toast('Đang tạo PDF…')}><Icon name="file" size={12} />PDF</button><button className="btn btn-sm" onClick={() => toast('Đang tạo Excel…')}><Icon name="download" size={12} />Excel</button></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ============ Hồ sơ - Tài liệu ============ */
  function HoSo({ p }) {
    const docs = [
      { name: 'Bản vẽ thiết kế kỹ thuật.pdf', type: 'Bản vẽ', size: '24 MB', by: 'u5', d: '2025-07-20' },
      { name: 'Biên bản nghiệm thu lớp K95 Km4.pdf', type: 'Biên bản', size: '1.2 MB', by: 'u4', d: '2026-05-16' },
      { name: 'Ảnh hiện trường 16-05.zip', type: 'Hình ảnh', size: '48 MB', by: 'u4', d: '2026-05-16' },
      { name: 'Hợp đồng thầu phụ vận chuyển.pdf', type: 'Hợp đồng', size: '3.4 MB', by: 'u2', d: '2026-04-28' },
      { name: 'Nhật ký thi công tháng 5.xlsx', type: 'Nhật ký', size: '0.8 MB', by: 'u4', d: '2026-05-16' },
    ];
    return (
      <div>
        <SectionHead title="Hồ sơ - Tài liệu" sub="Bản vẽ, biên bản, ảnh hiện trường…" icon="folder"
          right={<button className="btn btn-sm btn-primary"><Icon name="upload" size={14} />Tải tài liệu lên</button>} />
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead><tr><th>Tên tài liệu</th><th>Loại</th><th className="num">Dung lượng</th><th>Người tải</th><th>Ngày</th><th></th></tr></thead>
            <tbody>
              {docs.map((d, i) => (
                <tr key={i} className="clickable">
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="file" size={16} style={{ color: 'var(--blue-500)' }} /><span style={{ fontWeight: 600, fontSize: 12.5 }}>{d.name}</span></div></td>
                  <td><span className="badge badge-gray">{d.type}</span></td>
                  <td className="num">{d.size}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={d.by} size="av-sm" />{DB.byId[d.by].name}</div></td>
                  <td className="mono" style={{ fontSize: 12 }}>{dmy(d.d)}</td>
                  <td style={{ textAlign: 'right' }}><button className="btn btn-icon btn-sm btn-ghost"><Icon name="download" size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function CTTabs({ tab, p, role, go, onTab }) {
    switch (tab) {
      case 'cong-viec': return <window.TaskBoard projId={p.id} go={go} embedded />;
      case 'tien-do': return window.TienDo ? <window.TienDo projId={p.id} /> : null;
      case 'khu-vuc': return <KhuVuc p={p} go={go} />;
      case 'nhat-ky': return <NhatKy p={p} />;
      case 'vat-lieu-do': return <VatLieuDo p={p} />;
      case 'thiet-bi': return window.SiteThietBi ? <window.SiteThietBi p={p} go={go} /> : <ThietBiTab p={p} go={go} />;
      case 'ton-kho': return <TonKhoTab p={p} />;
      case 'nhan-su': return window.SiteNhanSu ? <window.SiteNhanSu p={p} go={go} /> : <NhanSuTab p={p} go={go} />;
      case 'goi-thau': return <GoiThau p={p} />;
      case 'tai-chinh': return <TaiChinh p={p} />;
      case 'bao-cao': return window.SiteBaoCao ? <window.SiteBaoCao p={p} /> : <BaoCaoTab p={p} />;
      case 'canh-bao': return window.SiteAlerts ? <window.SiteAlerts p={p} go={go} onTab={onTab} /> : null;
      case 'ho-so': return <HoSo p={p} />;
      default: return null;
    }
  }

  Object.assign(window, { CTTabs, QRScan });
})();
