/* Kho hàng — dashboard, nhập/xuất/kiểm kho, vật tư, sửa chữa, tồn, danh sách, báo cáo, cảnh báo → window.Kho */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, dmy, nf, money, Avatar, Modal, Field, toast, Tabs, Stat, SectionHead, Donut, BarChart, Search, Menu, EQ_ST, OWN_ST, DOC_ST } = window;

  const crumb = (go, label) => <div className="crumbs"><a onClick={() => go({ page: 'dashboard' })} style={{ cursor: 'pointer' }}>Trang chủ</a><Icon name="chevron-right" size={12} /><a onClick={() => go({ page: 'kho-dashboard' })} style={{ cursor: 'pointer' }}>Kho hàng</a><Icon name="chevron-right" size={12} /><span>{label}</span></div>;
  const Page = ({ go, title, label, right, children }) => (
    <div className="page"><div className="page-head"><div>{crumb(go, label)}<h1 className="page-title">{title}</h1></div>{right}</div>{children}</div>
  );

  /* ---------- Dashboard kho ---------- */
  function KhoDash({ go }) {
    const matDonut = [{ label: 'Nguyên vật liệu', value: 62, color: 'var(--teal-500)' }, { label: 'Nhiên liệu', value: 38, color: 'var(--orange-500)' }];
    return (
      <Page go={go} title="Dashboard kho" label="Dashboard kho">
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 14 }}>
          <Stat label="Giá trị tồn kho" icon="package" value="2.84" unit="tỷ" edge="var(--blue-500)" />
          <Stat label="Thiết bị quản lý" icon="excavator" value={DB.equipment.length} unit="TB" edge="var(--violet-500)" foot="5 đang hoạt động" />
          <Stat label="Phiếu chờ duyệt" icon="file" value="2" edge="var(--amber-500)" />
          <Stat label="Cảnh báo tồn thấp" icon="alert" value="2" edge="var(--red-500)" />
          <Stat label="TB thuê sắp hết hạn" icon="clock" value="1" edge="var(--orange-500)" foot="còn 1 ngày" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="card"><div className="card-head"><div className="card-title"><Icon name="package" size={15} style={{ color: 'var(--blue-600)' }} />Cơ cấu tồn kho</div></div>
            <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Donut data={matDonut} size={120} center={<><div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>2.84</div><div style={{ fontSize: 10, color: 'var(--ink-500)' }}>tỷ ₫</div></>} />
              <div style={{ flex: 1 }}>{matDonut.map((d, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 8 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} /><span style={{ flex: 1 }}>{d.label}</span><b>{d.value}%</b></div>)}</div>
            </div>
          </div>
          <div className="card"><div className="card-head"><div className="card-title"><Icon name="chart" size={15} style={{ color: 'var(--orange-500)' }} />Nhập / Xuất theo tuần (tr ₫)</div></div>
            <div style={{ padding: 14 }}><BarChart height={150} data={[{ label: 'T2', value: 142 }, { label: 'T3', value: 0 }, { label: 'T4', value: 139 }, { label: 'T5', value: 96 }, { label: 'T6', value: 168 }, { label: 'T7', value: 54 }].map(d => ({ ...d, color: 'var(--blue-500)' }))} /></div>
          </div>
          <div className="card"><div className="card-head"><div className="card-title"><Icon name="excavator" size={15} style={{ color: 'var(--violet-500)' }} />Tình trạng thiết bị</div></div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {Object.entries(EQ_ST).map(([k, v]) => { const c = DB.equipment.filter(e => e.status === k).length; return <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}><span className={'badge ' + v.cls} style={{ minWidth: 120, justifyContent: 'center' }}>{v.label}</span><div style={{ flex: 1 }}><Bar value={c} max={DB.equipment.length} /></div><b className="mono" style={{ width: 20, textAlign: 'right' }}>{c}</b></div>; })}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <RecentDocs go={go} title="Phiếu nhập gần đây" data={DB.receipts} kind="nhap" />
          <RecentDocs go={go} title="Phiếu xuất gần đây" data={DB.issues} kind="xuat" />
        </div>
      </Page>
    );
  }
  function RecentDocs({ title, data, kind, go }) {
    return (
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-head"><div className="card-title">{title}</div><button className="btn btn-sm btn-ghost" onClick={() => go({ page: kind === 'nhap' ? 'kho-nhap' : 'kho-xuat' })}>Xem tất cả</button></div>
        <table className="tbl tbl-compact">
          <thead><tr><th>Mã phiếu</th><th>{kind === 'nhap' ? 'Loại' : 'Hình thức'}</th><th>Ngày</th><th className="num">Giá trị</th><th>Trạng thái</th></tr></thead>
          <tbody>{data.slice(0, 4).map(d => <tr key={d.id} className="clickable"><td className="mono" style={{ fontWeight: 600 }}>{d.code}</td><td style={{ fontSize: 11.5 }}>{d.kind || d.type}</td><td className="mono" style={{ fontSize: 11.5 }}>{dmy(d.date)}</td><td className="num">{d.total ? nf(d.total) + ' tr' : '—'}</td><td><Badge map={DOC_ST} k={d.status} /></td></tr>)}</tbody>
        </table>
      </div>
    );
  }

  /* ---------- Nhập kho ---------- */
  function NhapKho({ go }) {
    const [modal, setModal] = useState(false);
    return (
      <Page go={go} title="Nhập kho" label="Nhập kho" right={<button className="btn btn-sm btn-primary" onClick={() => setModal(true)}><Icon name="plus" size={14} />Tạo phiếu nhập</button>}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><Search placeholder="Tìm mã phiếu…" /><button className="chip"><Icon name="filter" size={13} />Loại phiếu</button><button className="chip"><Icon name="flag" size={13} />Trạng thái</button></div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Mã phiếu</th><th>Loại nhập</th><th>Nguồn</th><th>Kho đích</th><th>Nhà cung cấp</th><th>Ngày</th><th className="num">Giá trị</th><th>Người tạo</th><th>Trạng thái</th></tr></thead>
            <tbody>{DB.receipts.map(r => <tr key={r.id} className="clickable">
              <td className="mono" style={{ fontWeight: 600 }}>{r.code}</td>
              <td><span className={'badge ' + (r.kind === 'Thiết bị' ? 'badge-violet' : 'badge-teal')}>{r.kind}</span></td>
              <td style={{ fontSize: 12 }}>{r.source}</td>
              <td style={{ fontSize: 12 }}>{DB.warehouses.find(w => w.id === r.wh)?.name}</td>
              <td style={{ fontSize: 12 }}>{DB.partners.find(p => p.id === r.supplier)?.name || '—'}</td>
              <td className="mono" style={{ fontSize: 12 }}>{dmy(r.date)}</td>
              <td className="num">{r.total ? nf(r.total) + ' tr' : '—'}</td>
              <td><Avatar id={r.by} size="av-sm" /></td>
              <td><Badge map={DOC_ST} k={r.status} /></td>
            </tr>)}</tbody>
          </table>
        </div>
        {modal && <NhapForm onClose={() => setModal(false)} />}
      </Page>
    );
  }
  function NhapForm({ onClose }) {
    const [kind, setKind] = useState('vat-tu');
    const [scan, setScan] = useState(false);
    return (
      <>
        <Modal title="Tạo phiếu nhập kho" sub="Nhập thiết bị (thu hồi/thuê ngoài) hoặc vật tư" width={820} onClose={onClose}
          foot={<><button className="btn" style={{ marginRight: 'auto' }}><Icon name="print" size={14} />In phiếu tạm</button><button className="btn" onClick={() => { toast('Đã lưu nháp'); }}>Lưu nháp</button><button className="btn btn-primary" onClick={() => { toast('Đã gửi duyệt phiếu nhập'); onClose(); }}>Lưu & gửi duyệt</button></>}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {[['vat-tu', 'Vật tư', 'package'], ['thiet-bi', 'Thiết bị', 'excavator']].map(([k, l, ic]) =>
              <button key={k} onClick={() => setKind(k)} style={{ flex: 1, border: '1.5px solid ' + (kind === k ? 'var(--blue-500)' : 'var(--line)'), background: kind === k ? 'var(--blue-50)' : '#fff', borderRadius: 8, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Icon name={ic} size={18} style={{ color: kind === k ? 'var(--blue-600)' : 'var(--ink-500)' }} /><b style={{ fontSize: 13 }}>{l}</b>
              </button>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            <Field label="Mã phiếu"><input className="input mono" defaultValue="PN-202605-019" readOnly style={{ background: 'var(--surface-2)' }} /></Field>
            <Field label="Ngày nhập" req><input className="input" type="date" defaultValue="2026-05-16" /></Field>
            <Field label="Kho đích" req><select className="select">{DB.warehouses.map(w => <option key={w.id}>{w.name}</option>)}</select></Field>
            <Field label="Nguồn nhập" req><select className="select">{kind === 'thiet-bi' ? <><option>Trả từ cho thuê</option><option>Trả từ công trường</option><option>Luân chuyển</option><option>Mua mới</option></> : <><option>Mua mới</option><option>Trả từ công trường</option><option>Luân chuyển</option></>}</select></Field>
            <Field label="Nhà cung cấp / Đối tác"><select className="select"><option>—</option>{DB.partners.map(p => <option key={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Số hợp đồng / Biên bản"><input className="input" /></Field>
          </div>
          <div className="divider" style={{ margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <b style={{ fontSize: 12.5 }}>{kind === 'thiet-bi' ? 'Danh sách thiết bị (chỉ TB "Đang cho thuê")' : 'Danh sách vật tư'}</b>
            <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-sm btn-accent" onClick={() => setScan(true)}><Icon name="scan" size={14} />Quét QR</button><button className="btn btn-sm"><Icon name="plus" size={13} />Thêm dòng</button></div>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {kind === 'thiet-bi' ? (
              <table className="tbl tbl-compact"><thead><tr><th>Mã TB</th><th>Tên</th><th>ĐVT</th><th className="num">Đơn giá</th><th className="num">Thành tiền</th><th className="num">Giờ/Km</th><th>Tình trạng trả</th><th></th></tr></thead>
                <tbody><tr><td className="mono">{DB.equipment[6].code}</td><td>{DB.equipment[6].name}</td><td>Chiếc</td><td className="num"><input className="input mono" style={{ height: 28, width: 100 }} defaultValue="57.000.000" /></td><td className="num"><b>57.000.000</b></td><td className="num">{nf(DB.equipment[6].kmNow)}</td><td><select className="select" style={{ height: 28 }}><option>Tốt</option><option>Cần sửa chữa</option><option>Hỏng</option></select></td><td><button className="btn btn-icon btn-sm btn-ghost"><Icon name="trash" size={13} /></button></td></tr></tbody>
              </table>
            ) : (
              <table className="tbl tbl-compact"><thead><tr><th>Vật tư</th><th>ĐV</th><th className="num">SL nhập</th><th className="num">Đơn giá</th><th className="num">Thành tiền</th><th></th></tr></thead>
                <tbody>
                  <tr><td><select className="select" style={{ height: 28 }}>{DB.materials.map(m => <option key={m.id}>{m.name}</option>)}</select></td><td>m³</td><td className="num"><input className="input mono" style={{ height: 28, width: 80 }} defaultValue="200" /></td><td className="num"><input className="input mono" style={{ height: 28, width: 90 }} defaultValue="285" /></td><td className="num"><b>57.000.000</b></td><td><button className="btn btn-icon btn-sm btn-ghost"><Icon name="trash" size={13} /></button></td></tr>
                </tbody>
              </table>
            )}
          </div>
          {<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 30, fontSize: 13 }}><span className="muted">Tổng thành tiền</span><b className="mono" style={{ fontSize: 15, color: 'var(--blue-700)' }}>57.000.000 ₫</b></div>}
        </Modal>
        {scan && <window.QRScan title="Quét QR thiết bị nhập kho" onClose={() => setScan(false)} />}
      </>
    );
  }

  /* ---------- Xuất kho ---------- */
  const XK_TYPES = [
    { id: 'vat-tu', label: 'Xuất vật tư', desc: 'Xuất vật liệu, nhiên liệu lên công trường', icon: 'package', color: 'var(--teal-500)' },
    { id: 'luan-chuyen', label: 'Luân chuyển thiết bị', desc: 'Chuyển thiết bị giữa kho và công trường', icon: 'refresh', color: 'var(--blue-500)' },
    { id: 'thanh-ly', label: 'Xuất thanh lý thiết bị', desc: 'Thanh lý, bán thiết bị cũ', icon: 'trash', color: 'var(--red-500)' },
    { id: 'cho-thue', label: 'Cho thuê thiết bị', desc: 'Cho đối tác thuê thiết bị', icon: 'handshake', color: 'var(--violet-500)' },
  ];
  function XuatKho({ go }) {
    const [pick, setPick] = useState(false);
    const [form, setForm] = useState(null);
    return (
      <Page go={go} title="Xuất kho" label="Xuất kho" right={<button className="btn btn-sm btn-primary" onClick={() => setPick(true)}><Icon name="plus" size={14} />Tạo phiếu xuất</button>}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><Search placeholder="Tìm mã phiếu…" /><button className="chip"><Icon name="filter" size={13} />Hình thức xuất</button></div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Mã phiếu</th><th>Hình thức xuất</th><th>Kho xuất</th><th>Nơi nhận</th><th>Ngày</th><th className="num">Giá trị</th><th>Người tạo</th><th>Trạng thái</th></tr></thead>
            <tbody>{DB.issues.map(r => <tr key={r.id} className="clickable">
              <td className="mono" style={{ fontWeight: 600 }}>{r.code}</td>
              <td><span className="badge badge-blue">{r.type}</span></td>
              <td style={{ fontSize: 12 }}>{DB.warehouses.find(w => w.id === r.wh)?.name}</td>
              <td style={{ fontSize: 12 }}>{r.to}</td>
              <td className="mono" style={{ fontSize: 12 }}>{dmy(r.date)}</td>
              <td className="num">{r.total ? nf(r.total) + ' tr' : '—'}</td>
              <td><Avatar id={r.by} size="av-sm" /></td>
              <td><Badge map={DOC_ST} k={r.status} /></td>
            </tr>)}</tbody>
          </table>
        </div>
        {pick && <Modal title="Tạo phiếu xuất kho mới" sub="Chọn loại xuất kho" width={680} onClose={() => setPick(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {XK_TYPES.map(t => <div key={t.id} onClick={() => { setForm(t); setPick(false); }} className="card card-pad" style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.borderColor = t.color} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}>
              <span style={{ width: 40, height: 40, borderRadius: 9, background: t.color + '1a', color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={t.icon} size={20} /></span>
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div><div className="muted" style={{ fontSize: 11.5 }}>{t.desc}</div></div>
            </div>)}
          </div>
        </Modal>}
        {form && <XuatForm type={form} onClose={() => setForm(null)} />}
      </Page>
    );
  }
  function XuatForm({ type, onClose }) {
    const [scan, setScan] = useState(false);
    const isEquip = type.id !== 'vat-tu';
    const isRent = type.id === 'cho-thue';
    const [rentMode, setRentMode] = useState('order');
    return (
      <>
        <Modal title={type.label} sub="Hỗ trợ quét QR liên tục nhiều thiết bị" width={820} onClose={onClose}
          foot={<><button className="btn" onClick={onClose}>Huỷ</button><button className="btn btn-primary" onClick={() => { toast('Đã gửi duyệt phiếu xuất'); onClose(); }}>Lưu & gửi duyệt</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            <Field label="Số phiếu xuất"><input className="input mono" defaultValue="XK-202605-025" readOnly style={{ background: 'var(--surface-2)' }} /></Field>
            <Field label="Ngày xuất" req><input className="input" type="date" defaultValue="2026-05-16" /></Field>
            <Field label="Kho xuất" req><select className="select">{DB.warehouses.map(w => <option key={w.id}>{w.name}</option>)}</select></Field>
            {type.id === 'vat-tu' && <><Field label="Công trường / Điểm nhận" req><select className="select">{DB.projects.map(p => <option key={p.id}>{p.name}</option>)}</select></Field><Field label="Người nhận" req><select className="select">{DB.people.map(p => <option key={p.id}>{p.name}</option>)}</select></Field><Field label="Lý do xuất" req><select className="select"><option>Xuất thi công</option><option>Sửa chữa</option><option>Khác</option></select></Field></>}
            {type.id === 'luan-chuyen' && <><Field label="Kho / Công trường đích" req><select className="select">{DB.projects.map(p => <option key={p.id}>{p.name}</option>)}</select></Field><Field label="Người phụ trách nhận" req><select className="select">{DB.people.map(p => <option key={p.id}>{p.name}</option>)}</select></Field><Field label="Ngày dự kiến trả"><input className="input" type="date" /></Field></>}
            {type.id === 'thanh-ly' && <><Field label="Phương thức" req><select className="select"><option>Bán</option><option>Tiêu hủy</option><option>Hủy bỏ</option></select></Field><Field label="Đối tác mua" req><select className="select">{DB.customers.map(c => <option key={c.id}>{c.name}</option>)}</select></Field><Field label="Giá thanh lý tổng" req><input className="input mono" placeholder="₫" /></Field></>}
            {type.id === 'cho-thue' && <><Field label="Đối tác thuê" req><select className="select">{DB.partners.map(p => <option key={p.id}>{p.name}</option>)}</select></Field>{rentMode === 'order' && <><Field label="Thuê từ → đến" req span={1}><div style={{ display: 'flex', gap: 6 }}><input className="input" type="date" /><input className="input" type="date" /></div></Field><Field label="Đơn giá thuê" req><div style={{ display: 'flex', gap: 6 }}><input className="input mono" placeholder="₫" /><select className="select" style={{ width: 80 }}><option>Giờ</option><option>Ngày</option><option>Tháng</option></select></div></Field></>}</>}
          </div>
          <div className="divider" style={{ margin: '16px 0' }} />
          {isRent && <div className="auto-note" style={{ marginTop: 0, marginBottom: 10 }}><Icon name="clock" size={13} />Áp dụng thời gian & giá thuê:
            <div className="seg" style={{ marginLeft: 8 }}><button className={rentMode === 'order' ? 'active' : ''} onClick={() => setRentMode('order')}>Toàn đơn</button><button className={rentMode === 'device' ? 'active' : ''} onClick={() => setRentMode('device')}>Từng thiết bị</button></div>
          </div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <b style={{ fontSize: 12.5 }}>{isEquip ? 'Danh sách thiết bị' : 'Danh sách vật tư'}</b>
            {isEquip && <button className="btn btn-sm btn-accent" onClick={() => setScan(true)}><Icon name="scan" size={14} />Quét QR liên tục</button>}
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {isEquip ? (isRent && rentMode === 'device' ? <table className="tbl tbl-compact"><thead><tr><th>Mã TB</th><th>Tên</th><th>Series</th><th>Thuê từ</th><th>Thuê đến</th><th className="num">Đơn giá thuê</th><th>Tình trạng</th></tr></thead>
              <tbody><tr><td className="mono">{DB.equipment[7].code}</td><td>{DB.equipment[7].name}</td><td className="mono">{DB.equipment[7].series}</td><td><input className="input" type="date" style={{ height: 28, width: 130 }} /></td><td><input className="input" type="date" style={{ height: 28, width: 130 }} /></td><td className="num"><div style={{ display: 'flex', gap: 4 }}><input className="input mono" style={{ height: 28, width: 80 }} placeholder="₫" /><select className="select" style={{ height: 28, width: 64 }}><option>Giờ</option><option>Ngày</option><option>Tháng</option></select></div></td><td><select className="select" style={{ height: 28 }}><option>Tốt</option><option>Bình thường</option></select></td></tr></tbody>
            </table> : <table className="tbl tbl-compact"><thead><tr><th>Mã TB</th><th>Tên</th><th>Series/Biển số</th><th className="num">Giờ/Km</th><th>Tình trạng</th></tr></thead>
              <tbody><tr><td className="mono">{DB.equipment[7].code}</td><td>{DB.equipment[7].name}</td><td className="mono">{DB.equipment[7].series}</td><td className="num">{nf(DB.equipment[7].hourNow, 1)}</td><td><select className="select" style={{ height: 28 }}><option>Tốt</option><option>Bình thường</option><option>Hỏng nhẹ</option></select></td></tr></tbody>
            </table>) : <table className="tbl tbl-compact"><thead><tr><th>Vật tư</th><th>ĐV</th><th className="num">Tồn</th><th className="num">SL yêu cầu</th><th className="num">SL thực xuất</th></tr></thead>
              <tbody><tr><td><select className="select" style={{ height: 28 }}>{DB.materials.map(m => <option key={m.id}>{m.name}</option>)}</select></td><td>Lít</td><td className="num">{nf(6800)}</td><td className="num"><input className="input mono" style={{ height: 28, width: 70 }} defaultValue="500" /></td><td className="num"><input className="input mono" style={{ height: 28, width: 70 }} defaultValue="500" /></td></tr></tbody>
            </table>}
          </div>
        </Modal>
        {scan && <window.QRScan title="Quét QR thiết bị xuất kho" onClose={() => setScan(false)} />}
      </>
    );
  }

  window.Kho = function Kho({ nav, go }) {
    if (nav.page === 'kho-thiet-bi' && nav.sub === 'detail' && window.ThietBiDetail) return <window.ThietBiDetail id={nav.id} go={go} />;
    switch (nav.page) {
      case 'kho-dashboard': return <KhoDash go={go} />;
      case 'kho-nhap': return <NhapKho go={go} />;
      case 'kho-xuat': return <XuatKho go={go} />;
      case 'kho-thiet-bi': return window.KhoThietBi ? <window.KhoThietBi go={go} /> : null;
      case 'kho-vat-tu': return window.KhoVatTu ? <window.KhoVatTu go={go} /> : null;
      case 'kho-sua-chua': return window.KhoSuaChua ? <window.KhoSuaChua go={go} /> : null;
      case 'kho-ton': return window.KhoTon ? <window.KhoTon go={go} /> : null;
      case 'kho-kiem': return window.KhoKiem ? <window.KhoKiem go={go} /> : null;
      case 'kho-list': return window.KhoList ? <window.KhoList go={go} /> : null;
      case 'kho-bao-cao': return window.KhoBaoCao ? <window.KhoBaoCao go={go} /> : null;
      case 'kho-canh-bao': return window.KhoCanhBao ? <window.KhoCanhBao go={go} /> : null;
      default: return <KhoDash go={go} />;
    }
  };
  window.KhoPage = Page;
  window.khoCrumb = crumb;
})();
