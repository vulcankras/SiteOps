/* Kho hàng (phần 2) — Thiết bị, Vật tư, Sửa chữa, Tồn kho, Kiểm kho, Danh sách kho, Báo cáo, Cảnh báo */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, dmy, nf, money, Avatar, Modal, Field, toast, Tabs, Stat, SectionHead, Search, Menu, EQ_ST, OWN_ST, DOC_ST } = window;
  const Page = window.KhoPage;

  /* ---------- Thiết bị (danh sách + tab phân loại) ---------- */
  const EQ_TABS = [
    { id: 'all', label: 'Tất cả' }, { id: 'own', label: 'Sở hữu' }, { id: 'rented-out', label: 'Cho thuê' },
    { id: 'rented', label: 'Thuê ngoài' }, { id: 'maintenance', label: 'Đang sửa chữa' },
    { id: 'site', label: 'Đang ngoài công trường' }, { id: 'liquidated', label: 'Thanh lý' },
  ];
  function KhoThietBi({ go }) {
    const [tab, setTab] = useState('all');
    const [view, setView] = useState('table');
    const [create, setCreate] = useState(false);
    const [q, setQ] = useState('');
    const [fOwn, setFOwn] = useState('all');
    const [fKind, setFKind] = useState('all');
    const [fGroup, setFGroup] = useState('all');
    const [fStatus, setFStatus] = useState('all');
    const filter = (e) => tab === 'all' ? true : tab === 'site' ? (e.loc && e.loc.startsWith('p')) : tab === 'own' ? e.own === 'own' : tab === 'rented' ? e.own === 'rented' : tab === 'rented-out' ? e.status === 'rented-out' : e.status === tab;
    const list = DB.equipment.filter(e => filter(e)
      && (fOwn === 'all' || (fOwn === 'own' ? e.own === 'own' : e.own !== 'own'))
      && (fKind === 'all' || e.kind === fKind)
      && (fGroup === 'all' || e.group === fGroup)
      && (fStatus === 'all' || e.status === fStatus)
      && (!q || e.name.toLowerCase().includes(q.toLowerCase()) || e.code.toLowerCase().includes(q.toLowerCase()) || (e.plate || '').includes(q) || (e.series || '').toLowerCase().includes(q.toLowerCase())));
    const counts = (id) => DB.equipment.filter(e => id === 'all' ? true : id === 'site' ? (e.loc && e.loc.startsWith('p')) : id === 'own' ? e.own === 'own' : id === 'rented' ? e.own === 'rented' : id === 'rented-out' ? e.status === 'rented-out' : e.status === id).length;
    const groups = fKind === 'vehicle' ? DB.equipGroups.vehicle : fKind === 'machine' ? DB.equipGroups.machine : [...DB.equipGroups.machine, ...DB.equipGroups.vehicle];
    const FS = ({ value, onChange, opts }) => <select className="select" style={{ height: 32, width: 'auto', minWidth: 124 }} value={value} onChange={e => onChange(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
    return (
      <Page go={go} title="Thiết bị" label="Thiết bị" right={<button className="btn btn-sm btn-primary" onClick={() => setCreate(true)}><Icon name="plus" size={14} />Tạo thiết bị</button>}>
        <div style={{ marginBottom: 14 }}><Tabs tabs={EQ_TABS.map(t => ({ ...t, count: counts(t.id) }))} active={tab} onChange={setTab} scroll /></div>
        <div className="card" style={{ padding: 12, marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Search placeholder="Tìm mã, series, biển số…" value={q} onChange={setQ} w={210} />
          <FS value={fOwn} onChange={setFOwn} opts={[['all', 'Tất cả nguồn'], ['own', 'Sở hữu'], ['rented', 'Thuê ngoài']]} />
          <FS value={fKind} onChange={v => { setFKind(v); setFGroup('all'); }} opts={[['all', 'Tất cả loại'], ['machine', 'Máy thi công'], ['vehicle', 'Xe vận tải']]} />
          <FS value={fGroup} onChange={setFGroup} opts={[['all', 'Tất cả nhóm'], ...groups]} />
          <FS value={fStatus} onChange={setFStatus} opts={[['all', 'Tất cả tình trạng'], ['running', 'Đang chạy'], ['idle', 'Chờ việc'], ['maintenance', 'Bảo trì'], ['rented-out', 'Cho thuê'], ['liquidated', 'Thanh lý']]} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontSize: 12, color: 'var(--ink-500)' }}>{list.length} TB</span><div className="seg"><button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><Icon name="list" size={14} /></button><button className={view === 'card' ? 'active' : ''} onClick={() => setView('card')}><Icon name="grid" size={14} /></button></div></div>
        </div>
        {view === 'table' ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="tbl"><thead><tr><th>Mã / Thiết bị</th><th>Loại hình</th><th>Nhóm</th><th>Nguồn gốc</th><th>Vị trí hiện tại</th><th>Người vận hành</th><th className="num">Giờ máy / Km</th><th>Trạng thái</th><th></th></tr></thead>
              <tbody>{list.map(e => (
                <tr key={e.id} className="clickable" onClick={() => go({ page: 'kho-thiet-bi', sub: 'detail', id: e.id })}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 28, height: 28, borderRadius: 7, background: e.kind === 'vehicle' ? 'var(--orange-50)' : 'var(--blue-50)', color: e.kind === 'vehicle' ? 'var(--orange-600)' : 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={e.kind === 'vehicle' ? 'truck' : 'excavator'} size={15} /></span><div><div style={{ fontWeight: 600, fontSize: 12.5 }}>{e.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>{e.code}</div></div></div></td>
                  <td><span className={'badge ' + (e.kind === 'machine' ? 'badge-violet' : 'badge-blue')}>{e.kind === 'machine' ? 'Máy' : 'Xe'}</span></td>
                  <td><span className="badge badge-gray">{DB.equipGroupLabel(e.group)}</span></td>
                  <td><Badge map={OWN_ST} k={e.own} /></td>
                  <td style={{ fontSize: 12 }}>{e.locName}</td>
                  <td style={{ fontSize: 12 }}>{e.driver ? DB.byId[e.driver].name : '—'}</td>
                  <td className="num">{e.kind === 'vehicle' ? nf(e.kmNow) + ' km' : nf(e.hourNow, 1) + ' h'}</td>
                  <td><Badge map={EQ_ST} k={e.status} /></td>
                  <td style={{ textAlign: 'right' }}><Icon name="chevron-right" size={15} style={{ color: 'var(--ink-300)' }} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {list.map(e => (
              <div key={e.id} className="card" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => go({ page: 'kho-thiet-bi', sub: 'detail', id: e.id })}>
                <div style={{ padding: 13, display: 'flex', gap: 11 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 9, background: e.kind === 'vehicle' ? 'var(--orange-50)' : 'var(--blue-50)', color: e.kind === 'vehicle' ? 'var(--orange-600)' : 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={e.kind === 'vehicle' ? 'truck' : 'excavator'} size={22} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{e.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>{e.code}</div><div style={{ marginTop: 5 }}><Badge map={EQ_ST} k={e.status} /></div></div>
                  <div style={{ width: 38, height: 38, flex: 'none', border: '1px solid var(--line)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="qr" size={26} style={{ color: 'var(--ink-700)' }} /></div>
                </div>
                <div style={{ padding: '10px 13px', borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                  <div><div className="muted">Vị trí</div><b>{e.locName.length > 18 ? e.locName.slice(0, 18) + '…' : e.locName}</b></div>
                  <div style={{ textAlign: 'right' }}><div className="muted">{e.kind === 'vehicle' ? 'Số km' : 'Giờ máy'}</div><b className="mono">{e.kind === 'vehicle' ? nf(e.kmNow) : nf(e.hourNow, 1)}</b></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {create && <CreateEquip onClose={() => setCreate(false)} />}
      </Page>
    );
  }
  function CreateEquip({ onClose }) {
    const [kind, setKind] = useState('machine');
    const [own, setOwn] = useState('own');
    return (
      <Modal title="Tạo thiết bị mới" sub="Hệ thống tự sinh mã QR định danh khi lưu" width={820} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Huỷ</button><button className="btn btn-primary" onClick={() => { toast('Đã tạo thiết bị & sinh mã QR'); onClose(); }}>Tạo & sinh QR</button></>}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[['machine', 'Máy thi công', 'excavator'], ['vehicle', 'Xe vận chuyển', 'truck']].map(([k, l, ic]) =>
            <button key={k} onClick={() => setKind(k)} style={{ flex: 1, border: '1.5px solid ' + (kind === k ? 'var(--blue-500)' : 'var(--line)'), background: kind === k ? 'var(--blue-50)' : '#fff', borderRadius: 8, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><Icon name={ic} size={18} style={{ color: kind === k ? 'var(--blue-600)' : 'var(--ink-500)' }} /><b>{l}</b></button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
          <Field label="Mã thiết bị"><input className="input mono" defaultValue={kind === 'machine' ? 'TB-M-202605-0031' : 'TB-X-202605-0059'} readOnly style={{ background: 'var(--surface-2)' }} /></Field>
          <Field label="Số series" req hint="Duy nhất toàn hệ thống"><input className="input" /></Field>
          <Field label="Tên thiết bị" req><input className="input" /></Field>
          <Field label="Biển số / Số khung" req><input className="input" /></Field>
          <Field label="Hãng sản xuất"><input className="input" placeholder="Caterpillar, Komatsu…" /></Field>
          <Field label="Model"><input className="input" /></Field>
          <Field label="Năm sản xuất"><input className="input" type="number" placeholder="2023" /></Field>
          <Field label="Loại sở hữu" req><select className="select" value={own} onChange={e => setOwn(e.target.value)}><option value="own">Sở hữu</option><option value="rented">Thuê ngoài</option><option value="rented-out">Cho thuê</option></select></Field>
          <Field label="Vị trí ban đầu" req hint="Chỉ chọn 1 vị trí"><select className="select"><optgroup label="Kho">{DB.warehouses.map(w => <option key={w.id}>{w.name}</option>)}</optgroup><optgroup label="Công trường">{DB.projects.map(p => <option key={p.id}>{p.name}</option>)}</optgroup></select></Field>
          {kind === 'machine' ? <><Field label="Công suất"><input className="input" placeholder="HP" /></Field><Field label="Dung tích gầu"><input className="input" placeholder="m³" /></Field><Field label="Số giờ máy ban đầu"><input className="input mono" defaultValue="0" /></Field></>
            : <><Field label="Tải trọng"><input className="input" placeholder="tấn" /></Field><Field label="Dung tích thùng"><input className="input" placeholder="m³" /></Field><Field label="KL trung bình/chuyến"><input className="input" placeholder="m³" /></Field></>}
        </div>
        {own === 'rented' && <>
          <div className="divider" style={{ margin: '16px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}><Icon name="handshake" size={15} style={{ color: 'var(--orange-500)' }} /><b style={{ fontSize: 12.5 }}>Thông tin thuê ngoài (kích hoạt cảnh báo hết hạn)</b></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            <Field label="Hình thức tính thuê" req><select className="select"><option>Theo ngày</option><option>Theo giờ máy</option><option>Theo số chuyến</option></select></Field>
            <Field label="Nhà cung cấp" req><select className="select">{DB.partners.map(p => <option key={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Đơn giá thuê" req><input className="input mono" placeholder="₫" /></Field>
            <Field label="Ngày bắt đầu HĐ" req><input className="input" type="date" /></Field>
            <Field label="Ngày kết thúc HĐ" req><input className="input" type="date" /></Field>
            <Field label="Hạn mức (giờ/chuyến)"><input className="input mono" /></Field>
          </div>
        </>}
      </Modal>
    );
  }

  /* ---------- Vật tư ---------- */
  function KhoVatTu({ go }) {
    const [tab, setTab] = useState('all');
    const [create, setCreate] = useState(false);
    const [q, setQ] = useState('');
    const [fWh, setFWh] = useState('all');
    const list = DB.materials.filter(m => (tab === 'all' || m.type === tab) && (fWh === 'all' || m.wh === fWh) && (!q || m.name.toLowerCase().includes(q.toLowerCase()) || m.code.toLowerCase().includes(q.toLowerCase())));
    const catCount = (id) => DB.materials.filter(m => m.type === id).length;
    return (
      <Page go={go} title="Vật tư" label="Vật tư" right={<button className="btn btn-sm btn-primary" onClick={() => setCreate(true)}><Icon name="plus" size={14} />Tạo vật tư</button>}>
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'all', label: 'Tất cả', count: DB.materials.length }, ...DB.matCats.map(c => ({ id: c.id, label: c.name, icon: c.icon, count: catCount(c.id) }))]} active={tab} onChange={setTab} scroll /></div>
        <div className="card" style={{ padding: 12, marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Search placeholder="Tìm mã / tên vật tư…" value={q} onChange={setQ} w={220} />
          <select className="select" style={{ height: 32, width: 'auto', minWidth: 150 }} value={fWh} onChange={e => setFWh(e.target.value)}><option value="all">Tất cả kho</option>{DB.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-500)' }}>{list.length} vật tư</span>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Mã / Vật tư</th><th>Nhóm</th><th>Quy cách</th><th>ĐV</th><th>Kho</th><th className="num">Tồn kho</th><th className="num">Mức tối thiểu</th><th className="num">Đơn giá</th><th>Cảnh báo</th></tr></thead>
            <tbody>{list.map(m => { const low = m.stock <= m.min; const cls = { nvl: 'badge-teal', nl: 'badge-orange', phu: 'badge-blue', phutung: 'badge-violet' }[m.type] || 'badge-gray'; return (
              <tr key={m.id} className="clickable">
                <td><div style={{ fontWeight: 600, fontSize: 12.5 }}>{m.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)' }}>{m.code}</div></td>
                <td><span className={'badge ' + cls}>{DB.matCatLabel(m.type)}</span></td>
                <td style={{ fontSize: 12 }}>{m.spec}</td>
                <td>{m.unit}</td>
                <td style={{ fontSize: 11.5 }}>{(DB.warehouses.find(w => w.id === m.wh) || {}).name || '—'}</td>
                <td className="num"><b>{nf(m.stock, m.stock < 100 ? 1 : 0)}</b></td>
                <td className="num muted">{nf(m.min)}</td>
                <td className="num">{m.price >= 1 ? nf(m.price) + ' tr' : nf(m.price * 1000) + 'k'}</td>
                <td>{low ? <span className="badge badge-red"><Icon name="alert" size={11} />Tồn thấp</span> : <span className="badge badge-green">Đủ</span>}</td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
        {create && <CreateMaterial onClose={() => setCreate(false)} />}
      </Page>
    );
  }
  function CreateMaterial({ onClose }) {
    const [type, setType] = useState('nvl');
    return (
      <Modal title="Tạo vật tư mới" sub="Form thay đổi động theo loại vật tư" width={720} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Huỷ</button><button className="btn btn-primary" onClick={() => { toast('Đã tạo vật tư'); onClose(); }}>Tạo vật tư</button></>}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[['nvl', 'Nguyên vật liệu', 'cube', 'var(--teal-500)'], ['nl', 'Nhiên liệu', 'fuel', 'var(--orange-500)']].map(([k, l, ic, c]) =>
            <button key={k} onClick={() => setType(k)} style={{ flex: 1, border: '1.5px solid ' + (type === k ? c : 'var(--line)'), background: type === k ? c + '0d' : '#fff', borderRadius: 8, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><Icon name={ic} size={18} style={{ color: type === k ? c : 'var(--ink-500)' }} /><b>{l}</b></button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
          <Field label="Mã vật tư"><input className="input mono" defaultValue={type === 'nl' ? 'VT-NL-0004' : 'VT-NVL-0006'} readOnly style={{ background: 'var(--surface-2)' }} /></Field>
          <Field label="Tên vật tư" req><input className="input" /></Field>
          <Field label="Đơn vị tính" req><select className="select">{type === 'nl' ? <><option>Lít</option><option>Kg</option></> : <><option>m³</option><option>Tấn</option><option>Bao</option><option>Thanh</option></>}</select></Field>
          <Field label="Quy cách / Đặc tính"><input className="input" placeholder={type === 'nl' ? 'VD: Dầu DO 0,05S' : 'VD: Cát vàng, Sỏi 2x4'} /></Field>
          {type === 'nl' ? <><Field label="Tỷ trọng (kg/lít)"><input className="input mono" placeholder="0.84" /></Field><Field label="Hao hụt cho phép (%)"><input className="input mono" placeholder="1.5" /></Field></>
            : <><Field label="Khối lượng riêng (tấn/m³)"><input className="input mono" placeholder="1.85" /></Field><Field label="Kho nhập về"><select className="select">{DB.warehouses.map(w => <option key={w.id}>{w.name}</option>)}</select></Field></>}
          <Field label="Cảnh báo tồn tối thiểu"><input className="input mono" /></Field>
          <Field label="Số lượng nhập"><input className="input mono" /></Field>
          <Field label="Giá nhập (đơn vị)"><input className="input mono" placeholder="₫" /></Field>
        </div>
      </Modal>
    );
  }

  /* ---------- Sửa chữa & Bảo trì ---------- */
  function KhoSuaChua({ go }) {
    const [create, setCreate] = useState(false);
    const SC_ST = { done: { label: 'Hoàn thành', cls: 'badge-green' }, doing: { label: 'Đang sửa', cls: 'badge-amber' }, pending: { label: 'Chờ xử lý', cls: 'badge-gray' } };
    return (
      <Page go={go} title="Sửa chữa & Bảo trì" label="Sửa chữa & Bảo trì" right={<button className="btn btn-sm btn-primary" onClick={() => setCreate(true)}><Icon name="plus" size={14} />Phiếu sửa chữa</button>}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Đang sửa chữa" icon="wrench" value="1" edge="var(--amber-500)" />
          <Stat label="Chi phí sửa năm nay" icon="wallet" value="170" unit="tr" edge="var(--red-500)" />
          <Stat label="Bảo dưỡng định kỳ" icon="refresh" value="1" foot="đến hạn" edge="var(--blue-500)" />
          <Stat label="Hoàn thành tháng" icon="check-circle" value="2" edge="var(--green-500)" />
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Mã đơn</th><th>Thiết bị</th><th>Ngày</th><th>Loại sửa chữa</th><th>Nơi sửa</th><th>Người thực hiện</th><th className="num">Chi phí</th><th>Ghi chú</th><th>Trạng thái</th></tr></thead>
            <tbody>{DB.repairs.map(r => { const e = DB.equipment.find(x => x.id === r.equip); const who = r.by.startsWith('pt') ? DB.partners.find(p => p.id === r.by)?.name : DB.byId[r.by]?.name; return (
              <tr key={r.id} className="clickable">
                <td className="mono" style={{ fontWeight: 600 }}>{r.code}</td>
                <td style={{ fontWeight: 600, fontSize: 12 }}>{e.name}</td>
                <td className="mono" style={{ fontSize: 12 }}>{dmy(r.date)}</td>
                <td>{r.type}</td>
                <td style={{ fontSize: 12 }}>{r.place}</td>
                <td style={{ fontSize: 12 }}>{who}</td>
                <td className="num">{r.cost ? nf(r.cost) + ' tr' : '—'}</td>
                <td className="muted" style={{ fontSize: 11.5 }}>{r.note}</td>
                <td><span className={'badge ' + SC_ST[r.status].cls}>{SC_ST[r.status].label}</span></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
        {create && <Modal title="Phiếu yêu cầu sửa chữa" width={640} onClose={() => setCreate(false)} foot={<><button className="btn" onClick={() => setCreate(false)}>Huỷ</button><button className="btn btn-primary" onClick={() => { toast('Đã tạo phiếu sửa chữa'); setCreate(false); }}>Tạo phiếu</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <Field label="Thiết bị" req><select className="select">{DB.equipment.map(e => <option key={e.id}>{e.name}</option>)}</select></Field>
            <Field label="Loại sửa chữa" req><select className="select"><option>Bảo dưỡng định kỳ</option><option>Sửa chữa hỏng hóc</option><option>Thay phụ tùng</option></select></Field>
            <Field label="Nơi sửa chữa"><select className="select"><option>Xưởng Nam Hải</option>{DB.partners.filter(p => p.type.includes('Sửa chữa thiết bị')).map(p => <option key={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Chi phí dự kiến"><input className="input mono" placeholder="₫" /></Field>
            <Field label="Mô tả hư hỏng" span={2}><textarea className="textarea" /></Field>
          </div>
        </Modal>}
      </Page>
    );
  }

  /* ---------- Tồn kho ---------- */
  function KhoTon({ go }) {
    return (
      <Page go={go} title="Tồn kho" label="Tồn kho" right={<button className="btn btn-sm"><Icon name="download" size={14} />Xuất Excel</button>}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>{DB.warehouses.map((w, i) => <button key={w.id} className={'chip ' + (i === 0 ? 'active' : '')}>{w.name}</button>)}</div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Vật tư</th><th>Loại</th><th>ĐV</th><th className="num">Tồn đầu kỳ</th><th className="num">Nhập</th><th className="num">Xuất</th><th className="num">Tồn cuối kỳ</th><th className="num">Giá trị tồn</th></tr></thead>
            <tbody>{DB.materials.map(m => { const open = Math.round(m.stock * 0.8); const inq = Math.round(m.stock * 0.5); const out = Math.round(m.stock * 0.3); return (
              <tr key={m.id}>
                <td style={{ fontWeight: 600, fontSize: 12.5 }}>{m.name}</td>
                <td><span className={'badge ' + (m.type === 'nl' ? 'badge-orange' : 'badge-teal')}>{m.type === 'nl' ? 'NL' : 'NVL'}</span></td>
                <td>{m.unit}</td>
                <td className="num">{nf(open)}</td><td className="num up">+{nf(inq)}</td><td className="num down">-{nf(out)}</td>
                <td className="num"><b>{nf(m.stock, m.stock < 100 ? 1 : 0)}</b></td>
                <td className="num">{money(Math.round(m.stock * m.price))}</td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </Page>
    );
  }

  /* ---------- Kiểm kho ---------- */
  function KhoKiem({ go }) {
    return (
      <Page go={go} title="Kiểm kho" label="Kiểm kho" right={<button className="btn btn-sm btn-primary"><Icon name="plus" size={14} />Phiếu kiểm kê</button>}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head"><div className="card-title"><Icon name="check-circle" size={15} style={{ color: 'var(--blue-600)' }} />Phiếu kiểm kê KK-202605-002 · Kho hiện trường HN–CL</div><span className="badge badge-amber">Đang kiểm kê</span></div>
          <table className="tbl"><thead><tr><th>Vật tư</th><th>ĐV</th><th className="num">Tồn sổ sách</th><th className="num">Tồn thực tế</th><th className="num">Chênh lệch</th><th>Ghi chú</th></tr></thead>
            <tbody>{DB.materials.slice(0, 5).map((m, i) => { const real = m.stock + [0, -12, 0, 5, -3][i]; const diff = real - m.stock; return (
              <tr key={m.id}>
                <td style={{ fontWeight: 600, fontSize: 12.5 }}>{m.name}</td><td>{m.unit}</td>
                <td className="num">{nf(m.stock, m.stock < 100 ? 1 : 0)}</td>
                <td className="num"><input className="input mono" style={{ height: 28, width: 90, textAlign: 'right' }} defaultValue={nf(real, real < 100 ? 1 : 0)} /></td>
                <td className="num"><b className={diff === 0 ? '' : diff > 0 ? 'up' : 'down'}>{diff > 0 ? '+' : ''}{nf(diff)}</b></td>
                <td>{diff !== 0 && <input className="input" style={{ height: 28 }} placeholder="Lý do chênh lệch" />}</td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </Page>
    );
  }

  /* ---------- Danh sách kho ---------- */
  function KhoList({ go }) {
    return (
      <Page go={go} title="Danh sách kho" label="Danh sách kho" right={<button className="btn btn-sm btn-primary"><Icon name="plus" size={14} />Thêm kho</button>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {DB.warehouses.map(w => (
            <div key={w.id} className="card card-pad" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 9, background: w.type === 'central' ? 'var(--blue-50)' : 'var(--orange-50)', color: w.type === 'central' ? 'var(--blue-600)' : 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="warehouse" size={20} /></span>
                <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{w.name}</div><div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{w.code}</div></div>
                <span className={'badge ' + (w.type === 'central' ? 'badge-blue' : 'badge-orange')} style={{ marginLeft: 'auto' }}>{w.type === 'central' ? 'Kho chính' : 'Kho hiện trường'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span className="muted"><Icon name="map-pin" size={12} /> Địa điểm</span><b>{w.loc}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span className="muted"><Icon name="users" size={12} /> Thủ kho</span><b>{DB.byId[w.mgr].name}</b></div>
              </div>
            </div>
          ))}
        </div>
      </Page>
    );
  }

  /* ---------- Báo cáo kho ---------- */
  function KhoBaoCao({ go }) {
    const reports = [['Báo cáo Nhập-Xuất-Tồn', 'package'], ['Báo cáo tiêu hao theo công trường', 'road'], ['Hiệu suất thiết bị (giờ/chi phí)', 'excavator'], ['Thiết bị thuê sắp hết hạn', 'clock'], ['Chi phí thiết bị theo công trường', 'wallet'], ['Giá nhập trung bình', 'chart']];
    return (
      <Page go={go} title="Báo cáo kho" label="Báo cáo kho">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {reports.map(([n, ic], i) => (
            <div key={i} className="card card-pad" style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={ic} size={19} /></span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{n}</div><div style={{ display: 'flex', gap: 6, marginTop: 7 }}><button className="btn btn-sm" onClick={() => toast('Đang tạo PDF…')}>PDF</button><button className="btn btn-sm" onClick={() => toast('Đang tạo Excel…')}>Excel</button></div></div>
            </div>
          ))}
        </div>
      </Page>
    );
  }

  /* ---------- Cảnh báo ---------- */
  function KhoCanhBao({ go }) {
    const tone = { red: 'var(--red-500)', amber: 'var(--amber-500)' };
    return (
      <Page go={go} title="Cảnh báo kho" label="Cảnh báo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DB.alerts.map(a => (
            <div key={a.id} className="card" style={{ display: 'flex', gap: 13, padding: 14, alignItems: 'center', borderLeft: '3px solid ' + tone[a.level] }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: a.level === 'red' ? 'var(--red-100)' : 'var(--amber-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tone[a.level], flex: 'none' }}><Icon name={a.icon} size={19} /></div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div><div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 2 }}>{a.desc}</div></div>
              <span className="muted" style={{ fontSize: 11 }}>{a.time}</span>
              <button className="btn btn-sm">Xử lý</button>
            </div>
          ))}
        </div>
      </Page>
    );
  }

  Object.assign(window, { KhoThietBi, KhoVatTu, KhoSuaChua, KhoTon, KhoKiem, KhoList, KhoBaoCao, KhoCanhBao });
})();
