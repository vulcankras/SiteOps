/* Chế độ hiện trường (mobile) — phân theo vai trò → window.MobileApp */
(function () {
  const { useState, useRef, useEffect } = window.React;
  const { Icon, DB, nf, dmy, toast } = window;
  const IOSDevice = window.IOSDevice;
  const NAVY = '#0C2A47', ORANGE = '#F26B1D', BLUE = '#1D5E8C', GREEN = '#1E8A4C';

  /* ---------- tài khoản demo theo vai trò hiện trường ---------- */
  const M_ROLES = {
    laimay: { name: 'Hoàng Văn Hải', title: 'Vận hành máy thi công', icon: 'excavator', tiles: ['chamcong', 'quetmay', 'tangca', 'lichsu'], nav: ['home', 'chamcong', 'quetmay'] },
    laixe: { name: 'Bùi Văn Khoa', title: 'Lái xe vận tải (Howo)', icon: 'truck', tiles: ['chamcong', 'nhatkyxe', 'quetchuyen', 'tangca'], nav: ['home', 'chamcong', 'nhatkyxe'] },
    vattu: { name: 'Đỗ Thị Mai', title: 'Cán bộ vật tư / Thủ kho', icon: 'package', tiles: ['quetkho', 'kiemtb', 'vatlieu', 'tonkho'], nav: ['home', 'quetkho', 'kiemtb'] },
    kythuat: { name: 'Phạm Minh Đức', title: 'Cán bộ kỹ thuật', icon: 'tasks', tiles: ['nhatky', 'tiendo', 'nghiemthu', 'anh'], nav: ['home', 'nhatky', 'tiendo'] },
    chuhuy: { name: 'Trần Văn Cường', title: 'Chỉ huy trưởng', icon: 'shield-check', tiles: ['duyet', 'dashboard', 'nhatky', 'nhansu'], nav: ['home', 'duyet', 'chamcong'] },
    congnhan: { name: 'Lăng Văn Hùng', title: 'Công nhân', icon: 'users', tiles: ['chamcong', 'bangcong'], nav: ['home', 'chamcong'] },
  };
  const TILE = {
    chamcong: { s: 'chamcong', label: 'Chấm công GPS', sub: 'Vào/ra ca', icon: 'crosshair', c: ORANGE },
    quetmay: { s: 'quetmay', label: 'Nhật trình máy', sub: 'Giờ máy · sản lượng', icon: 'excavator', c: '#6D5BD0' },
    quetchuyen: { s: 'quetchuyen', label: 'Đếm chuyến nhanh', sub: 'Quét QR vật liệu đổ', icon: 'scan', c: BLUE },
    nhatkyxe: { s: 'nhatkyxe', label: 'Nhật ký xe', sub: 'Chuyến · tải trọng · km', icon: 'truck', c: BLUE },
    quetkho: { s: 'quetkho', label: 'Xuất / Nhập kho', sub: 'Quét QR vật tư · TB', icon: 'warehouse', c: GREEN },
    kiemtb: { s: 'kiemtb', label: 'Định danh / Kiểm kê', sub: 'Quét QR thiết bị', icon: 'qr', c: '#11888A' },
    vatlieu: { s: 'quetchuyen', label: 'Xác nhận vật liệu đổ', sub: 'Quét QR đếm chuyến', icon: 'scan', c: ORANGE },
    tonkho: { s: 'tonkho', label: 'Tồn kho hiện trường', sub: 'Kiểm tra nhanh', icon: 'package', c: GREEN },
    nhatky: { s: 'nhatky', label: 'Nhật ký thi công', sub: 'Lập nhật ký ngày', icon: 'calendar', c: BLUE },
    tiendo: { s: 'tiendo', label: 'Cập nhật tiến độ', sub: 'Khối lượng công việc', icon: 'target', c: '#6D5BD0' },
    nghiemthu: { s: 'nhatky', label: 'Nghiệm thu', sub: 'Ghi nhận nghiệm thu', icon: 'check-circle', c: GREEN },
    anh: { s: 'anh', label: 'Ảnh hiện trường', sub: 'Chụp & gắn vị trí', icon: 'camera', c: ORANGE },
    duyet: { s: 'duyet', label: 'Duyệt phiếu', sub: 'Tăng ca · NK · xuất kho', icon: 'shield-check', c: ORANGE, badge: 3 },
    dashboard: { s: 'dashboard', label: 'Dashboard CT', sub: 'Chỉ số công trường', icon: 'dashboard', c: BLUE },
    nhansu: { s: 'nhansu', label: 'Nhân sự hôm nay', sub: 'Có mặt · tăng ca', icon: 'users', c: '#11888A' },
    tangca: { s: 'tangca', label: 'Phiếu tăng ca', sub: 'Đăng ký tăng ca', icon: 'clock', c: GREEN },
    lichsu: { s: 'lichsu', label: 'Lịch sử của tôi', sub: 'Giờ máy · ca làm', icon: 'history', c: BLUE },
    bangcong: { s: 'bangcong', label: 'Bảng công của tôi', sub: 'Công · tăng ca', icon: 'calendar', c: BLUE },
  };

  /* ---------- helpers ---------- */
  function Field({ label, hint, children }) {
    return <div style={{ marginBottom: 13 }}><div style={{ fontSize: 11.5, fontWeight: 600, color: '#4d6375', marginBottom: 5 }}>{label}</div>{children}{hint && <div style={{ fontSize: 10.5, color: '#93A4B3', marginTop: 3 }}>{hint}</div>}</div>;
  }
  const inp = { width: '100%', height: 44, borderRadius: 11, border: '1px solid #dce4eb', padding: '0 13px', fontSize: 14, boxSizing: 'border-box', background: '#fff' };
  const btnP = { width: '100%', height: 50, borderRadius: 14, border: 'none', background: BLUE, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' };
  function PhotoReq() { return <button style={{ width: '100%', height: 50, borderRadius: 14, border: '1px dashed #bfccd6', background: '#f7fafc', color: '#6b8094', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}><Icon name="camera" size={18} />Chụp ảnh chứng minh <span style={{ color: ORANGE }}>*</span></button>; }
  function Head({ title, sub }) { return <div style={{ padding: '14px 16px 8px' }}><div style={{ fontSize: 19, fontWeight: 700 }}>{title}</div>{sub && <div style={{ fontSize: 12.5, color: '#6b8094', marginTop: 2 }}>{sub}</div>}</div>; }

  /* ---------- Scanner (reusable) ---------- */
  function Scanner({ label, hint, onShot }) {
    return (
      <div style={{ position: 'relative', aspectRatio: '1', background: NAVY, borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 36, border: '2px solid rgba(255,255,255,.45)', borderRadius: 14 }} />
        <div style={{ position: 'absolute', left: 38, right: 38, height: 2, background: `linear-gradient(90deg,transparent,${ORANGE},transparent)`, boxShadow: `0 0 10px ${ORANGE}`, animation: 'scanmv 1.8s ease-in-out infinite' }} />
        <Icon name="qr" size={70} style={{ color: 'rgba(255,255,255,.16)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{hint}</div>
        <style>{`@keyframes scanmv{0%,100%{top:40px}50%{bottom:40px;top:auto}}`}</style>
      </div>
    );
  }

  /* ---------- Screens ---------- */
  function ChamCong() {
    const [checked, setChecked] = useState(true);
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div style={{ position: 'relative', height: 140, borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(160deg,#eaf1ec,#e3ebf2)', marginBottom: 16 }}>
          <svg viewBox="0 0 100 46" width="100%" height="100%"><path d="M0 34 Q30 27 55 31 T100 22" stroke="#c2ccd4" strokeWidth="3" fill="none" /><circle cx="52" cy="28" r="18" fill="#1D5E8C" opacity="0.08" stroke="#4F95C8" strokeWidth="0.3" strokeDasharray="1 1" /></svg>
          <div style={{ position: 'absolute', left: '52%', top: '58%', transform: 'translate(-50%,-100%)' }}><div style={{ width: 22, height: 22, borderRadius: '50% 50% 50% 0', background: ORANGE, transform: 'rotate(-45deg)', border: '3px solid #fff' }} /></div>
          <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, background: 'rgba(255,255,255,.92)', borderRadius: 9, padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="crosshair" size={12} style={{ color: GREEN }} />Trong vùng công trường · ±8m</div>
        </div>
        <button onClick={() => { setChecked(c => !c); toast(checked ? 'Đã chấm RA ca' : 'Đã chấm VÀO ca'); }} style={{ width: 150, height: 150, borderRadius: '50%', border: 'none', background: checked ? 'radial-gradient(circle at 50% 35%,#DE4A3C,#C5372C)' : 'radial-gradient(circle at 50% 35%,#2FA864,#1E8A4C)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto', boxShadow: '0 10px 28px rgba(0,0,0,.18)', cursor: 'pointer' }}>
          <Icon name={checked ? 'log-out' : 'crosshair'} size={38} /><span style={{ fontSize: 15, fontWeight: 700 }}>{checked ? 'CHẤM RA CA' : 'CHẤM VÀO CA'}</span>
        </button>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[['Trạng thái', checked ? 'Đã vào ca 07:01' : 'Chưa vào ca'], ['GPS', 'Km5+200, Đồng Đăng'], ['WiFi', 'NamHai-CT-HNCL']].map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e4e9ee', borderRadius: 12, padding: '11px 13px' }}>
              <Icon name={i === 0 ? 'clock' : i === 1 ? 'crosshair' : 'wifi'} size={17} style={{ color: GREEN }} />
              <div style={{ flex: 1, textAlign: 'left' }}><div style={{ fontSize: 11, color: '#6b8094' }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div></div>
              <Icon name="check-circle" size={18} style={{ color: GREEN }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function QuetMay() {
    const [picked, setPicked] = useState(false);
    const [hcur, setHcur] = useState('');
    const e = DB.equipment[0];
    const hStart = picked ? e.hourNow : 0;
    const hours = picked && hcur ? Math.max(0, (Number(hcur) - hStart)).toFixed(1) : '0.0';
    const fuelNorm = 18;
    const fuelEst = (Number(hours) * fuelNorm).toFixed(0);
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => { setPicked(true); toast('Đã nạp thông tin máy: ' + e.name); }} style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', background: picked ? '#DBF1E3' : ORANGE, color: picked ? GREEN : '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 16 }}>
          <Icon name={picked ? 'check-circle' : 'scan'} size={19} />{picked ? 'Đã nhận diện: ' + e.name : 'Quét QR máy thi công'}
        </button>
        {picked && <div style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 12, padding: 12, marginBottom: 14 }} className="fade-in">
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b8094', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="qr" size={12} style={{ color: GREEN }} />Thông tin máy (tự động từ QR)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 14px', fontSize: 12 }}>
            {[['Mã máy', e.code], ['Model', e.model], ['Loại máy', e.cat], ['Dung tích gầu', e.bucket || '—'], ['Công suất', e.power], ['Định mức NL', fuelNorm + ' L/giờ']].map(([k, v]) => <React.Fragment key={k}><span style={{ color: '#6b8094' }}>{k}</span><b style={{ textAlign: 'right' }}>{v}</b></React.Fragment>)}
          </div>
        </div>}
        <Field label="Công việc / Hạng mục"><select style={inp}><option>Đào đất các loại</option><option>Đắp đất K95 lớp 1-4</option><option>Lu lèn K98 hoàn thiện nền</option><option>San nền</option></select></Field>
        <Field label="Khu vực thi công"><select style={inp}>{DB.areas.filter(a => a.proj === 'p1').map(a => <option key={a.id}>{a.name}</option>)}</select></Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Giờ máy ban đầu" hint="Tự động"><input style={{ ...inp, background: '#f7fafc', fontFamily: 'var(--mono)' }} value={picked ? nf(hStart, 1) : ''} readOnly placeholder="—" /></Field></div>
          <div style={{ flex: 1 }}><Field label="Giờ máy hiện tại *"><input value={hcur} onChange={e => setHcur(e.target.value)} style={{ ...inp, fontFamily: 'var(--mono)' }} placeholder="Đồng hồ" inputMode="decimal" /></Field></div>
        </div>
        <Field label="Số giờ hoạt động" hint="= hiện tại − ban đầu"><input style={{ ...inp, background: '#fff', fontFamily: 'var(--mono)', fontWeight: 700, color: '#6D5BD0' }} value={hours + ' giờ'} readOnly /></Field>
        <Field label="Nhiên liệu dự kiến" hint="= giờ hoạt động × định mức"><input style={{ ...inp, background: '#f7fafc', fontFamily: 'var(--mono)', fontWeight: 700, color: ORANGE }} value={fuelEst + ' L'} readOnly /></Field>
        <div style={{ background: '#f7fafc', border: '1px solid #e4e9ee', borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="cube" size={14} style={{ color: '#6D5BD0' }} />Sản lượng thi công</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 2 }}><div style={{ fontSize: 11, color: '#6b8094', marginBottom: 4 }}>Khối lượng hoàn thành</div><input style={{ ...inp, height: 40, fontFamily: 'var(--mono)' }} placeholder="VD: 450" inputMode="decimal" /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: '#6b8094', marginBottom: 4 }}>Đơn vị</div><select style={{ ...inp, height: 40 }}><option>m³</option><option>m²</option><option>tấn</option></select></div>
          </div>
        </div>
        <Field label="Dầu Diesel cấp (L)"><input style={{ ...inp, fontFamily: 'var(--mono)' }} placeholder="Lít" inputMode="decimal" /></Field>
        <div style={{ fontSize: 11, color: '#6b8094', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><Icon name="crosshair" size={13} style={{ color: GREEN }} />Vị trí máy: Km4+500 (GPS tự động)</div>
        <PhotoReq />
        <button style={btnP} onClick={() => toast('Đã lưu nhật trình máy (offline — chờ sync)')}>Lưu & cập nhật giờ máy</button>
      </div>
    );
  }

  function NhatKyXe() {
    const [picked, setPicked] = useState(false);
    const [trips, setTrips] = useState(0);
    const [kmCur, setKmCur] = useState('');
    const e = DB.equipment[4];
    const kmStart = picked ? e.kmNow : 0;
    const load = e.avgTrip || 12;
    const dist = picked && kmCur ? Math.max(0, (Number(kmCur) - kmStart)) : 0;
    const totalVol = trips * load;
    const fuelNorm = 6;
    const fuelEst = trips * fuelNorm;
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => { setPicked(true); toast('Đã nạp xe: ' + e.name + ' · ' + e.plate); }} style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', background: picked ? '#DBF1E3' : ORANGE, color: picked ? GREEN : '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 16 }}>
          <Icon name={picked ? 'check-circle' : 'scan'} size={19} />{picked ? e.name + ' · ' + e.plate : 'Quét QR xe vận tải'}
        </button>
        {picked && <div style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 12, padding: 12, marginBottom: 14 }} className="fade-in">
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b8094', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="qr" size={12} style={{ color: GREEN }} />Thông tin xe (tự động từ QR)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 14px', fontSize: 12 }}>
            {[['Biển số', e.plate], ['Loại xe', e.cat], ['Tải trọng', e.load], ['Thể tích thùng', e.bucketVol], ['Định mức NL', fuelNorm + ' L/chuyến'], ['Nhà thầu', 'Đội vận tải A']].map(([k, v]) => <React.Fragment key={k}><span style={{ color: '#6b8094' }}>{k}</span><b style={{ textAlign: 'right' }}>{v}</b></React.Fragment>)}
          </div>
        </div>}
        <Field label="Công việc / Hạng mục"><select style={inp}><option>Đất đắp</option><option>Đất điều phối</option><option>Vận chuyển CPĐD</option><option>Chở phế thải</option></select></Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Khu vực lấy"><input style={inp} placeholder="VD: Km7+800" /></Field></div>
          <div style={{ flex: 1 }}><Field label="Khu vực đổ"><input style={inp} placeholder="VD: Km7+200" /></Field></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Số km đầu" hint="Tự động"><input style={{ ...inp, background: '#f7fafc', fontFamily: 'var(--mono)' }} value={picked ? nf(kmStart) : ''} readOnly placeholder="—" /></Field></div>
          <div style={{ flex: 1 }}><Field label="Số km hiện tại"><input value={kmCur} onChange={e => setKmCur(e.target.value)} style={{ ...inp, fontFamily: 'var(--mono)' }} placeholder="Đồng hồ" inputMode="numeric" /></Field></div>
        </div>
        <Field label="Quãng đường chạy" hint="= km hiện tại − km đầu"><input style={{ ...inp, fontFamily: 'var(--mono)', fontWeight: 700, color: BLUE }} value={nf(dist) + ' km'} readOnly /></Field>
        <div style={{ background: '#f7fafc', border: '1px solid #e4e9ee', borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="truck" size={14} style={{ color: ORANGE }} />Khối lượng vận chuyển</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: '#6b8094', marginBottom: 4 }}>Số chuyến</div><input type="number" value={trips} onChange={e => setTrips(+e.target.value)} style={{ ...inp, height: 40, fontFamily: 'var(--mono)' }} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: '#6b8094', marginBottom: 4 }}>Tải trọng/chuyến</div><input value={load + ' m³'} readOnly style={{ ...inp, height: 40, fontFamily: 'var(--mono)', background: '#fff' }} /></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 11px', background: '#fff', borderRadius: 9 }}><span style={{ fontSize: 12, color: '#6b8094' }}>Tổng khối lượng</span><b style={{ fontFamily: 'var(--mono)', color: ORANGE, fontSize: 15 }}>{nf(totalVol, 1)} m³</b></div>
        </div>
        <Field label="Nhiên liệu dự kiến" hint="= số chuyến × định mức"><input style={{ ...inp, background: '#f7fafc', fontFamily: 'var(--mono)', fontWeight: 700, color: ORANGE }} value={fuelEst + ' L'} readOnly /></Field>
        <Field label="Dầu Diesel tiêu thụ thực tế (L)"><input style={{ ...inp, fontFamily: 'var(--mono)' }} placeholder="Lít" inputMode="decimal" /></Field>
        <PhotoReq />
        <button style={btnP} onClick={() => toast('Đã lưu nhật ký xe (offline — chờ sync)')}>Lưu nhật ký xe</button>
      </div>
    );
  }

  function QuetChuyen() {
    const [count, setCount] = useState(0);
    const [log, setLog] = useState([]);
    const plates = ['29C-15653', '29C-02617', '29C-15618', '29C-15678', '29C-15605'];
    const scan = () => { const p = plates[count % plates.length]; setCount(c => c + 1); setLog(l => [{ p, t: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }, ...l]); if (navigator.vibrate) navigator.vibrate(40); };
    return (
      <div style={{ padding: 16 }}>
        <Scanner hint="Hướng camera vào QR trên xe" />
        <div style={{ display: 'flex', gap: 10, margin: '14px 0 12px' }}>
          <div style={{ flex: 1, textAlign: 'center', background: '#EFF5FA', borderRadius: 12, padding: '12px 0' }}><div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: BLUE }}>{count}</div><div style={{ fontSize: 11, color: '#6b8094' }}>Chuyến</div></div>
          <div style={{ flex: 1, textAlign: 'center', background: '#FDF3EC', borderRadius: 12, padding: '12px 0' }}><div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: ORANGE }}>{count * 20}</div><div style={{ fontSize: 11, color: '#6b8094' }}>Tổng m³</div></div>
        </div>
        <button onClick={scan} style={{ ...btnP, background: ORANGE, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}><Icon name="scan" size={20} />Quét chuyến ( +1 )</button>
        <div style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 14, overflow: 'hidden' }}>
          {log.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: '#93A4B3', fontSize: 12.5 }}>Chưa có chuyến nào</div> : log.slice(0, 6).map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderBottom: '1px solid #eef2f5' }}><Icon name="truck" size={16} style={{ color: BLUE }} /><span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{l.p}</span><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#6b8094' }}>{l.t}</span><span style={{ fontSize: 12, fontWeight: 600 }}>20 m³</span></div>
          ))}
        </div>
      </div>
    );
  }

  function QuetKho() {
    const [kind, setKind] = useState('xuat');
    const [items, setItems] = useState([]);
    const pool = [['Dầu Diesel DO', 'VT-NL-0001', '200 L'], ['Cát vàng', 'VT-NVL-0003', '12 m³'], ['Lu rung XCMG', 'TB-M-...0030', '1 TB'], ['Xi măng PCB40', 'VT-NVL-0004', '40 bao']];
    const scan = () => { const it = pool[items.length % pool.length]; setItems(l => [...l, it]); toast('Đã quét: ' + it[0]); if (navigator.vibrate) navigator.vibrate(40); };
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, background: '#eef2f5', borderRadius: 12, padding: 4 }}>
          {[['xuat', 'Xuất kho'], ['nhap', 'Nhập kho']].map(([k, l]) => <button key={k} onClick={() => setKind(k)} style={{ flex: 1, height: 38, border: 'none', borderRadius: 9, background: kind === k ? '#fff' : 'transparent', color: kind === k ? BLUE : '#6b8094', fontWeight: 700, fontSize: 13, boxShadow: kind === k ? '0 1px 3px rgba(0,0,0,.08)' : 'none', cursor: 'pointer' }}>{l}</button>)}
        </div>
        <Scanner hint="Quét QR vật tư / thiết bị" />
        <button onClick={scan} style={{ ...btnP, background: GREEN, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px 0' }}><Icon name="scan" size={19} />Quét mã ( +1 )</button>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#4d6375', marginBottom: 8 }}>Danh sách {kind === 'xuat' ? 'xuất' : 'nhập'} ({items.length})</div>
        <div style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
          {items.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: '#93A4B3', fontSize: 12.5 }}>Quét mã để thêm</div> : items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderBottom: '1px solid #eef2f5' }}><Icon name="package" size={16} style={{ color: GREEN }} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{it[0]}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: '#93A4B3' }}>{it[1]}</div></div><span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 700 }}>{it[2]}</span></div>
          ))}
        </div>
        {items.length > 0 && <button style={btnP} onClick={() => toast('Đã gửi duyệt phiếu ' + (kind === 'xuat' ? 'xuất' : 'nhập') + ' kho')}>Gửi duyệt phiếu</button>}
      </div>
    );
  }

  function KiemTB() {
    const [e, setE] = useState(null);
    const scan = () => { setE(DB.equipment[1]); toast('Đã nhận diện thiết bị'); };
    return (
      <div style={{ padding: 16 }}>
        <Scanner hint="Quét QR định danh thiết bị" />
        <button onClick={scan} style={{ ...btnP, background: '#11888A', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px 0' }}><Icon name="scan" size={19} />Quét QR thiết bị</button>
        {e && <div style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 14, padding: 14, marginBottom: 14 }} className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}><span style={{ width: 42, height: 42, borderRadius: 10, background: '#EFF5FA', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="excavator" size={22} /></span><div><div style={{ fontWeight: 700, fontSize: 14 }}>{e.name}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: '#93A4B3' }}>{e.code}</div></div></div>
          {[['Series', e.series], ['Vị trí hệ thống', e.locName], ['Giờ máy', nf(e.hourNow, 1) + ' h'], ['Trạng thái', 'Đang hoạt động']].map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eef2f5', fontSize: 12.5 }}><span style={{ color: '#6b8094' }}>{k}</span><b>{v}</b></div>)}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button style={{ ...btnP, background: GREEN, height: 44 }} onClick={() => toast('Đã xác nhận có mặt thiết bị')}>Xác nhận kiểm kê</button></div>
        </div>}
      </div>
    );
  }

  function NhatKy() {
    return (
      <div style={{ padding: 16 }}>
        <Field label="Ngày"><input style={{ ...inp, background: '#f7fafc' }} value="16/05/2026" readOnly /></Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><Field label="Cán bộ"><input style={{ ...inp, background: '#f7fafc', fontFamily: 'var(--mono)' }} value="6" readOnly /></Field></div>
          <div style={{ flex: 1 }}><Field label="Công nhân"><input style={{ ...inp, background: '#f7fafc', fontFamily: 'var(--mono)' }} value="42" readOnly /></Field></div>
        </div>
        <div style={{ fontSize: 10.5, color: '#93A4B3', margin: '-6px 0 12px' }}>Tự động từ chấm công GPS hôm nay</div>
        <Field label="Thời tiết"><select style={inp}><option>Nắng</option><option>Mưa</option><option>Bình thường</option></select></Field>
        <Field label="Nội dung công việc trong ngày"><textarea style={{ ...inp, height: 80, padding: 11 }} placeholder="Đào điều phối, đắp & lu lèn K95…" /></Field>
        <Field label="Nội dung nghiệm thu"><textarea style={{ ...inp, height: 64, padding: 11 }} placeholder="Ghi chi tiết…" /></Field>
        <PhotoReq />
        <button style={btnP} onClick={() => toast('Đã gửi duyệt nhật ký thi công')}>Gửi duyệt</button>
      </div>
    );
  }

  function TienDo() {
    const tasks = DB.tasks.filter(t => t.proj === 'p1' && t.status !== 'done').slice(0, 5);
    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12.5, color: '#6b8094', marginBottom: 12 }}>Cập nhật khối lượng thực tế hôm nay cho công việc đang thi công.</div>
        {tasks.map(t => (
          <div key={t.id} style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 14, padding: 13, marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: '#93A4B3', marginBottom: 8 }}>{t.code}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input placeholder={t.calc === 'volume' ? 'KL hôm nay (' + t.unit + ')' : '% hôm nay'} style={{ ...inp, height: 40, fontFamily: 'var(--mono)' }} />
              <button style={{ height: 40, padding: '0 16px', borderRadius: 10, border: 'none', background: BLUE, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }} onClick={() => toast('Đã cập nhật ' + t.name)}>Ghi</button>
            </div>
            <div style={{ marginTop: 8, height: 6, borderRadius: 4, background: '#eef2f5', overflow: 'hidden' }}><div style={{ height: '100%', width: t.progress + '%', background: BLUE }} /></div>
            <div style={{ fontSize: 10.5, color: '#6b8094', marginTop: 3 }}>Hiện tại: {t.progress}%</div>
          </div>
        ))}
      </div>
    );
  }

  function Duyet() {
    const [items, setItems] = useState([
      { id: 1, type: 'Tăng ca', who: 'Lăng Văn Hùng', desc: 'Lu đất Km7 · 17:30–23:00 · 5.5h', icon: 'clock' },
      { id: 2, type: 'Nhật ký', who: 'Phạm Minh Đức', desc: 'Nhật ký thi công 15/05', icon: 'calendar' },
      { id: 3, type: 'Xuất kho', who: 'Đỗ Thị Mai', desc: 'Xuất 500L dầu DO cho đội máy', icon: 'warehouse' },
    ]);
    const act = (id, ok) => { setItems(l => l.filter(x => x.id !== id)); toast(ok ? 'Đã duyệt' : 'Đã từ chối'); };
    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12.5, color: '#6b8094', marginBottom: 12 }}>{items.length} phiếu chờ duyệt</div>
        {items.length === 0 ? <div style={{ textAlign: 'center', color: '#93A4B3', padding: 40, fontSize: 13 }}><Icon name="check-circle" size={30} /><div style={{ marginTop: 8 }}>Đã duyệt hết phiếu</div></div> : items.map(it => (
          <div key={it.id} style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><span style={{ width: 34, height: 34, borderRadius: 9, background: '#FDF3EC', color: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={it.icon} size={17} /></span><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{it.type}</div><div style={{ fontSize: 11.5, color: '#6b8094' }}>{it.who}</div></div></div>
            <div style={{ fontSize: 12.5, color: '#33485a', marginBottom: 11 }}>{it.desc}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => act(it.id, true)} style={{ flex: 1, height: 42, borderRadius: 11, border: 'none', background: GREEN, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Icon name="check" size={15} /> Duyệt</button>
              <button onClick={() => act(it.id, false)} style={{ flex: 1, height: 42, borderRadius: 11, border: '1px solid #e4e9ee', background: '#fff', color: '#C5372C', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Từ chối</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function Simple({ icon, title, text }) { return <div style={{ padding: 40, textAlign: 'center', color: '#93A4B3' }}><Icon name={icon} size={32} /><div style={{ fontWeight: 600, color: '#33485a', marginTop: 10 }}>{title}</div><div style={{ fontSize: 12.5, marginTop: 4 }}>{text}</div></div>; }

  function RoleHome({ role, go }) {
    const r = M_ROLES[role];
    return (
      <div style={{ padding: '8px 16px 16px' }}>
        <div style={{ background: `linear-gradient(135deg,${NAVY},${BLUE})`, borderRadius: 18, padding: 18, color: '#fff', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={r.icon} size={21} /></span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700 }}>{r.name}</div><div style={{ fontSize: 12, opacity: .85 }}>{r.title}</div></div>
            <span style={{ fontSize: 10.5, background: 'rgba(255,255,255,.14)', padding: '4px 9px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#26A35C' }} />Online</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, background: 'rgba(255,255,255,.12)', padding: '7px 11px', borderRadius: 10 }}><Icon name="map-pin" size={14} />CT Hữu Nghị – Chi Lăng</div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#33485a', marginBottom: 10 }}>Thao tác của bạn</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {r.tiles.map(tk => { const t = TILE[tk]; return (
            <button key={tk} onClick={() => go(t.s)} style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 16, padding: 15, display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer', position: 'relative' }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: t.c + '1a', color: t.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={t.icon} size={21} /></span>
              {t.badge && <span style={{ position: 'absolute', top: 12, right: 12, minWidth: 18, height: 18, background: '#DE4A3C', color: '#fff', borderRadius: 9, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{t.badge}</span>}
              <div><div style={{ fontWeight: 700, fontSize: 13.5, color: '#14202b' }}>{t.label}</div><div style={{ fontSize: 11, color: '#6b8094', marginTop: 1 }}>{t.sub}</div></div>
            </button>
          ); })}
        </div>
      </div>
    );
  }

  const SCREENS = {
    chamcong: { title: 'Chấm công GPS', c: ChamCong },
    quetmay: { title: 'Nhật trình máy', c: QuetMay },
    quetchuyen: { title: 'Đếm chuyến / Vật liệu đổ', c: QuetChuyen },
    quetkho: { title: 'Xuất / Nhập kho', c: QuetKho },
    kiemtb: { title: 'Định danh / Kiểm kê TB', c: KiemTB },
    nhatky: { title: 'Nhật ký thi công', c: NhatKy },
    tiendo: { title: 'Cập nhật tiến độ', c: TienDo },
    duyet: { title: 'Duyệt phiếu', c: Duyet },
    nhatkyxe: { title: 'Nhật ký xe', c: NhatKyXe },
    tonkho: { title: 'Tồn kho hiện trường', c: () => <Simple icon="package" title="Tồn kho hiện trường" text="Kiểm tra nhanh tồn vật tư tại công trường." /> },
    anh: { title: 'Ảnh hiện trường', c: () => <Simple icon="camera" title="Ảnh hiện trường" text="Chụp ảnh gắn vị trí GPS & thời gian." /> },
    dashboard: { title: 'Dashboard công trường', c: () => <Simple icon="dashboard" title="Dashboard công trường" text="Tiến độ, nhân sự, thiết bị hôm nay." /> },
    nhansu: { title: 'Nhân sự hôm nay', c: () => <Simple icon="users" title="Nhân sự hôm nay" text="42 có mặt · 5 đội thi công." /> },
    tangca: { title: 'Phiếu tăng ca', c: () => <Simple icon="clock" title="Đăng ký tăng ca" text="Tạo phiếu tăng ca, gửi Chỉ huy duyệt." /> },
    lichsu: { title: 'Lịch sử của tôi', c: () => <Simple icon="history" title="Lịch sử của tôi" text="Giờ máy, ca làm, sản lượng đã ghi." /> },
    bangcong: { title: 'Bảng công của tôi', c: () => <Simple icon="calendar" title="Bảng công của tôi" text="Công, tăng ca tháng này." /> },
  };
  const NAVMETA = { home: ['Trang chủ', 'dashboard'], chamcong: ['Chấm công', 'crosshair'], quetmay: ['Nhật trình', 'excavator'], quetchuyen: ['Đếm chuyến', 'scan'], nhatkyxe: ['Nhật ký xe', 'truck'], quetkho: ['Kho', 'warehouse'], kiemtb: ['Thiết bị', 'qr'], nhatky: ['Nhật ký', 'calendar'], tiendo: ['Tiến độ', 'target'], duyet: ['Duyệt', 'shield-check'] };

  /* ---------- Login (phone + OTP + role chips) ---------- */
  function MobileLogin({ onDone }) {
    const [step, setStep] = useState('phone');
    const [otp, setOtp] = useState(['', '', '', '']);
    const refs = useRef([]);
    const setD = (i, val) => { if (!/^\d?$/.test(val)) return; const n = [...otp]; n[i] = val; setOtp(n); if (val && i < 3) refs.current[i + 1].focus(); };
    return (
      <div style={{ background: `linear-gradient(170deg,${NAVY},${BLUE})`, minHeight: '100%', padding: '36px 22px', display: 'flex', flexDirection: 'column', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 26 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg,${ORANGE},#E2540C)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="road" size={21} /></div>
          <div><div style={{ fontWeight: 800, fontSize: 19 }}>SiteOps</div><div style={{ fontSize: 11.5, color: '#8fb0c8' }}>Field · Hiện trường</div></div>
        </div>
        {step === 'phone' ? (
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 6 }}>Đăng nhập</div>
            <div style={{ fontSize: 13, color: '#9fb8cc', marginBottom: 20 }}>Nhập số điện thoại để nhận mã OTP.</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#9fb8cc', marginBottom: 6 }}>Số điện thoại</div>
            <input defaultValue="0934 556 778" style={{ width: '100%', height: 50, borderRadius: 12, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: '#fff', padding: '0 15px', fontSize: 16, fontFamily: 'var(--mono)', boxSizing: 'border-box' }} />
            <button onClick={() => setStep('otp')} style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 18, cursor: 'pointer' }}>Gửi mã OTP</button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 6 }}>Nhập mã OTP</div>
            <div style={{ fontSize: 13, color: '#9fb8cc', marginBottom: 18 }}>Mã 4 số gửi tới <b style={{ color: '#fff' }}>•••• 778</b></div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              {otp.map((d, i) => <input key={i} ref={el => refs.current[i] = el} value={d} onChange={e => setD(i, e.target.value)} maxLength={1} inputMode="numeric" style={{ width: 54, height: 62, textAlign: 'center', fontSize: 25, fontWeight: 700, fontFamily: 'var(--mono)', borderRadius: 12, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: '#fff', outline: 'none' }} />)}
            </div>
            <button onClick={() => onDone('laimay')} style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: ORANGE, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Xác nhận</button>
          </div>
        )}
        {/* demo role chips */}
        <div style={{ marginTop: 'auto', paddingTop: 22 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6b859c', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="play" size={12} />Đăng nhập nhanh theo vai trò</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(M_ROLES).map(([k, r]) => (
              <button key={k} onClick={() => onDone(k)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.06)', color: '#fff', borderRadius: 11, padding: '8px 10px', cursor: 'pointer', fontSize: 11.5, textAlign: 'left' }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={r.icon} size={13} /></span>
                <span style={{ lineHeight: 1.2 }}>{r.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function MobileApp({ onExit, initialRole }) {
    const [role, setRole] = useState(initialRole || null);
    const [screen, setScreen] = useState('home');
    const r = role ? M_ROLES[role] : null;
    const S = screen === 'home' ? null : SCREENS[screen];
    const Comp = S ? S.c : null;
    const navIds = r ? r.nav.concat(['profile']) : [];
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 30% 20%, #1b3a5c, #0c2a47 70%)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'auto' }}>
        <button onClick={onExit} style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}><Icon name="arrow-left" size={15} />Quay lại desktop</button>
        <div style={{ position: 'absolute', top: 24, right: 24, color: 'rgba(255,255,255,.55)', fontSize: 12, maxWidth: 230, textAlign: 'right' }}>App hiện trường theo vai trò — chấm công, quét QR máy/xe/kho, nhật ký, duyệt phiếu. Hỗ trợ offline (PWA).</div>
        <div style={{ transform: 'scale(.92)' }}>
          <IOSDevice title={role ? (screen === 'home' ? 'SiteOps Field' : screen === 'profile' ? 'Tài khoản' : (S ? S.title : '')) : 'Đăng nhập'}>
            {!role ? <MobileLogin onDone={(rk) => { setRole(rk); setScreen('home'); }} /> : (
              <div style={{ background: '#f2f5f8', minHeight: '100%', paddingBottom: 70 }}>
                {/* offline status strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', background: '#fff', borderBottom: '1px solid #eef2f5', fontSize: 10.5, color: '#6b8094' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="wifi" size={12} style={{ color: GREEN }} />Đã đồng bộ</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {role !== 'home' && screen !== 'home' && <button onClick={() => setScreen('home')} style={{ border: 'none', background: 'none', color: BLUE, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>‹ Trang chủ</button>}
                    <button onClick={() => { setRole(null); setScreen('home'); }} style={{ border: 'none', background: 'none', color: '#93A4B3', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="log-out" size={12} />Thoát</button>
                  </span>
                </div>
                {screen === 'home' ? <RoleHome role={role} go={setScreen} />
                  : screen === 'profile' ? <div><Head title={r.name} sub={r.title + ' · CT Hữu Nghị – Chi Lăng'} /><div style={{ padding: 16 }}><Simple icon="customer" title="Tài khoản" text="Hồ sơ, đổi mật khẩu, thông báo." /></div></div>
                    : <><Head title={S.title} /><Comp go={setScreen} /></>}
              </div>
            )}
            {role && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e4e9ee', display: 'flex', paddingBottom: 4 }}>
              {navIds.map(id => { const meta = id === 'profile' ? ['Cá nhân', 'customer'] : NAVMETA[id]; const active = screen === id || (id === 'home' && screen === 'home'); return (
                <button key={id} onClick={() => setScreen(id)} style={{ flex: 1, border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: active ? BLUE : '#93A4B3', cursor: 'pointer' }}>
                  <Icon name={meta[1]} size={20} /><span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>{meta[0]}</span>
                </button>
              ); })}
            </div>}
          </IOSDevice>
        </div>
      </div>
    );
  }

  window.MobileApp = MobileApp;
})();
