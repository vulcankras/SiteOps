/* Chế độ hiện trường (mobile) — chấm công GPS, quét QR đếm chuyến, nhật trình máy → window.MobileApp */
(function () {
  const { useState, useEffect, useRef } = window.React;
  const { Icon, DB, nf, dmy, toast } = window;
  const IOSDevice = window.IOSDevice;

  const NAVY = '#0C2A47', ORANGE = '#F26B1D', BLUE = '#1D5E8C';

  function Tile({ icon, label, sub, color, onClick }) {
    return (
      <button onClick={onClick} style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: color + '1a', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={22} /></span>
        <div><div style={{ fontWeight: 700, fontSize: 14, color: '#14202b' }}>{label}</div><div style={{ fontSize: 11.5, color: '#6b8094', marginTop: 1 }}>{sub}</div></div>
      </button>
    );
  }

  function Home({ go }) {
    return (
      <div style={{ padding: '8px 16px 16px' }}>
        <div style={{ background: `linear-gradient(135deg,${NAVY},${BLUE})`, borderRadius: 18, padding: 18, color: '#fff', marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, opacity: .8 }}>Xin chào,</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Hoàng Văn Hải</div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>Thợ lái máy · Đội cơ giới</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, background: 'rgba(255,255,255,.12)', padding: '7px 11px', borderRadius: 10 }}>
            <Icon name="map-pin" size={14} /><span style={{ flex: 1 }}>CT Hữu Nghị – Chi Lăng</span><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#26A35C' }} />Đã chấm công</span>
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#33485a', marginBottom: 10 }}>Thao tác nhanh tại hiện trường</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Tile icon="crosshair" label="Chấm công GPS" sub="Vào/ra ca" color={ORANGE} onClick={() => go('cham-cong')} />
          <Tile icon="scan" label="Quét chuyến xe" sub="Đếm vật liệu đổ" color={BLUE} onClick={() => go('quet')} />
          <Tile icon="excavator" label="Nhật trình máy" sub="Ghi giờ máy" color="#6D5BD0" onClick={() => go('may')} />
          <Tile icon="clock" label="Phiếu tăng ca" sub="Đăng ký" color="#1E8A4C" onClick={() => toast('Mở phiếu tăng ca')} />
        </div>
        <div style={{ marginTop: 18, background: '#fff', border: '1px solid #e4e9ee', borderRadius: 16, padding: 15 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>Hôm nay của tôi</div>
          {[['Giờ công', '8.0 giờ', 'clock'], ['Giờ máy CAT 320', '+8 giờ', 'excavator'], ['Chuyến đã đếm', '12 chuyến', 'truck']].map(([k, v, ic], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid #eef2f5' : 'none' }}>
              <Icon name={ic} size={16} style={{ color: '#6b8094' }} /><span style={{ flex: 1, fontSize: 13 }}>{k}</span><b style={{ fontSize: 13 }}>{v}</b>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ChamCong() {
    const [checked, setChecked] = useState(true);
    const [t, setT] = useState('07:01');
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        {/* mini map */}
        <div style={{ position: 'relative', height: 150, borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(160deg,#eaf1ec,#e3ebf2)', marginBottom: 18 }}>
          <svg viewBox="0 0 100 50" width="100%" height="100%"><rect width="100" height="50" fill="none" /><path d="M0 38 Q 30 30 55 34 T 100 24" stroke="#c2ccd4" strokeWidth="3" fill="none" /><circle cx="52" cy="30" r="20" fill="#1D5E8C" opacity="0.08" stroke="#4F95C8" strokeWidth="0.3" strokeDasharray="1 1" /></svg>
          <div style={{ position: 'absolute', left: '52%', top: '60%', transform: 'translate(-50%,-100%)' }}><div style={{ width: 24, height: 24, borderRadius: '50% 50% 50% 0', background: ORANGE, transform: 'rotate(-45deg)', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} /></div>
          <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, background: 'rgba(255,255,255,.92)', borderRadius: 9, padding: '7px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="crosshair" size={12} style={{ color: '#1E8A4C' }} />Trong vùng công trường · Sai số ±8m</div>
        </div>
        {/* big button */}
        <button onClick={() => { setChecked(c => !c); toast(checked ? 'Đã chấm công RA ca' : 'Đã chấm công VÀO ca'); }}
          style={{ width: 168, height: 168, borderRadius: '50%', border: 'none', background: checked ? `radial-gradient(circle at 50% 35%, #DE4A3C, #C5372C)` : `radial-gradient(circle at 50% 35%, #2FA864, #1E8A4C)`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto', boxShadow: '0 10px 28px rgba(0,0,0,.18)', cursor: 'pointer' }}>
          <Icon name={checked ? 'log-out' : 'crosshair'} size={40} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>{checked ? 'CHẤM RA CA' : 'CHẤM VÀO CA'}</span>
        </button>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[['Trạng thái', checked ? 'Đã vào ca lúc ' + t : 'Chưa vào ca', checked], ['Xác thực GPS', 'Km5+200, Đồng Đăng', true], ['WiFi công trường', 'NamHai-CT-HNCL', true]].map(([k, v, ok], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e4e9ee', borderRadius: 12, padding: '11px 13px' }}>
              <Icon name={i === 0 ? 'clock' : i === 1 ? 'crosshair' : 'wifi'} size={17} style={{ color: ok ? '#1E8A4C' : '#93A4B3' }} />
              <div style={{ flex: 1, textAlign: 'left' }}><div style={{ fontSize: 11, color: '#6b8094' }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div></div>
              {ok && <Icon name="check-circle" size={18} style={{ color: '#1E8A4C' }} />}
            </div>
          ))}
        </div>
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
        <div style={{ position: 'relative', aspectRatio: '1', background: '#0C2A47', borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ position: 'absolute', inset: 36, border: '2px solid rgba(255,255,255,.45)', borderRadius: 14 }} />
          <div style={{ position: 'absolute', left: 38, right: 38, height: 2, background: `linear-gradient(90deg,transparent,${ORANGE},transparent)`, boxShadow: `0 0 10px ${ORANGE}`, animation: 'scanmove 1.8s ease-in-out infinite' }} />
          <Icon name="qr" size={72} style={{ color: 'rgba(255,255,255,.16)' }} />
          <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Hướng camera vào QR trên xe</div>
          <style>{`@keyframes scanmove{0%,100%{top:40px}50%{bottom:40px;top:auto}}`}</style>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, textAlign: 'center', background: '#EFF5FA', borderRadius: 12, padding: '12px 0' }}><div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: BLUE }}>{count}</div><div style={{ fontSize: 11, color: '#6b8094' }}>Chuyến</div></div>
          <div style={{ flex: 1, textAlign: 'center', background: '#FDF3EC', borderRadius: 12, padding: '12px 0' }}><div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: ORANGE }}>{count * 20}</div><div style={{ fontSize: 11, color: '#6b8094' }}>Tổng m³</div></div>
        </div>
        <button onClick={scan} style={{ width: '100%', height: 52, borderRadius: 14, border: 'none', background: ORANGE, color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 14 }}><Icon name="scan" size={20} />Quét chuyến ( +1 )</button>
        <div style={{ background: '#fff', border: '1px solid #e4e9ee', borderRadius: 14, overflow: 'hidden' }}>
          {log.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: '#93A4B3', fontSize: 12.5 }}>Chưa có chuyến nào</div> : log.slice(0, 6).map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderBottom: i < Math.min(log.length, 6) - 1 ? '1px solid #eef2f5' : 'none' }}>
              <Icon name="truck" size={16} style={{ color: BLUE }} /><span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{l.p}</span><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#6b8094' }}>{l.t}</span><span style={{ fontSize: 12, fontWeight: 600 }}>20 m³</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function MayForm() {
    const [scanned, setScanned] = useState(false);
    const e = DB.equipment[0];
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => { setScanned(true); toast('Đã nạp thông tin máy CAT 320'); }} style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', background: scanned ? '#DBF1E3' : ORANGE, color: scanned ? '#1E8A4C' : '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 16 }}>
          <Icon name={scanned ? 'check-circle' : 'scan'} size={19} />{scanned ? 'Đã nhận diện: ' + e.name : 'Quét QR máy'}
        </button>
        {[['Công việc', 'Đắp đất K95 lớp 1-4', false], ['Số giờ máy ban đầu', scanned ? nf(e.hourNow, 1) : '—', true], ['Số giờ máy hiện tại', '', false], ['Khối lượng hoàn thành (m³)', '', false], ['Dầu Diesel cấp (L)', '', false]].map(([l, v, ro], i) => (
          <div key={i} style={{ marginBottom: 13 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#4d6375', marginBottom: 5 }}>{l}</div>
            <input defaultValue={v} readOnly={ro} placeholder={i >= 2 ? 'Nhập…' : ''} style={{ width: '100%', height: 44, borderRadius: 11, border: '1px solid #dce4eb', padding: '0 13px', fontSize: 14, background: ro ? '#f7fafc' : '#fff', fontFamily: i >= 1 ? 'var(--mono)' : 'inherit', boxSizing: 'border-box' }} />
          </div>
        ))}
        <button style={{ width: '100%', height: 50, borderRadius: 14, border: '1px dashed #bfccd6', background: '#f7fafc', color: '#6b8094', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}><Icon name="camera" size={18} />Chụp ảnh chứng minh</button>
        <button onClick={() => toast('Đã lưu nhật trình máy')} style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', background: BLUE, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Lưu & cập nhật giờ máy</button>
      </div>
    );
  }

  const SCREENS = {
    home: { title: 'SiteOps Field', comp: Home },
    'cham-cong': { title: 'Chấm công GPS', comp: ChamCong },
    quet: { title: 'Quét chuyến xe', comp: QuetChuyen },
    may: { title: 'Nhật trình máy', comp: MayForm },
  };
  const NAV = [['home', 'Trang chủ', 'dashboard'], ['cham-cong', 'Chấm công', 'crosshair'], ['quet', 'Quét QR', 'scan'], ['may', 'Nhật ký', 'excavator']];

  function MobileApp({ onExit }) {
    const [screen, setScreen] = useState('home');
    const S = SCREENS[screen];
    const Comp = S.comp;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 30% 20%, #1b3a5c, #0c2a47 70%)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'auto' }}>
        <button onClick={onExit} style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}><Icon name="arrow-left" size={15} />Quay lại desktop</button>
        <div style={{ position: 'absolute', top: 24, right: 24, color: 'rgba(255,255,255,.55)', fontSize: 12, maxWidth: 220, textAlign: 'right' }}>Ứng dụng hiện trường — chạy trên điện thoại của cán bộ, thợ lái máy & lái xe.</div>
        <div style={{ transform: 'scale(.92)' }}>
          <IOSDevice title={S.title}>
            <div style={{ background: '#f2f5f8', minHeight: '100%', paddingBottom: 76 }}>
              <Comp go={setScreen} />
            </div>
            {/* bottom tab bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e4e9ee', display: 'flex', paddingBottom: 6 }}>
              {NAV.map(([id, label, icon]) => (
                <button key={id} onClick={() => setScreen(id)} style={{ flex: 1, border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: screen === id ? BLUE : '#93A4B3', cursor: 'pointer' }}>
                  <Icon name={icon} size={21} /><span style={{ fontSize: 10, fontWeight: screen === id ? 700 : 500 }}>{label}</span>
                </button>
              ))}
            </div>
          </IOSDevice>
        </div>
      </div>
    );
  }

  window.MobileApp = MobileApp;
})();
