/* Khách hàng, Đối tác, Danh mục, Báo cáo tổng hợp, Cài đặt → window.{KhachHang,DoiTac,DanhMuc,BaoCao,CaiDat} */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, nf, money, Avatar, Stat, BarChart, Donut, Tabs, toast, Search } = window;

  const Page = ({ title, crumbLabel, right, children }) => <div className="page"><div className="page-head"><div><div className="crumbs"><span>Trang chủ</span><Icon name="chevron-right" size={12} /><span>{crumbLabel}</span></div><h1 className="page-title">{title}</h1></div>{right}</div>{children}</div>;

  function KhachHang() {
    return (
      <Page title="Khách hàng" crumbLabel="Khách hàng" right={<button className="btn btn-sm btn-primary"><Icon name="plus" size={14} />Thêm khách hàng</button>}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head"><div className="card-title"><Icon name="customer" size={15} style={{ color: 'var(--blue-600)' }} />Khách hàng mua thanh lý</div></div>
          <table className="tbl"><thead><tr><th>Khách hàng</th><th>Loại</th><th>Điện thoại</th><th className="num">Số lần mua</th><th></th></tr></thead>
            <tbody>{DB.customers.map(c => (
              <tr key={c.id} className="clickable">
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="customer" size={16} /></span><span style={{ fontWeight: 600, fontSize: 12.5 }}>{c.name}</span></div></td>
                <td><span className="badge badge-gray">{c.type}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{c.phone}</td>
                <td className="num">{c.bought}</td>
                <td style={{ textAlign: 'right' }}><Icon name="chevron-right" size={15} style={{ color: 'var(--ink-300)' }} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Page>
    );
  }

  function DoiTac() {
    const TYPE_CLS = { 'Nhập vật tư': 'badge-teal', 'Nhập nhiên liệu': 'badge-orange', 'Cho thuê thiết bị': 'badge-violet', 'Sửa chữa thiết bị': 'badge-amber', 'Thuê thiết bị': 'badge-blue' };
    return (
      <Page title="Đối tác" crumbLabel="Đối tác" right={<button className="btn btn-sm btn-primary"><Icon name="plus" size={14} />Thêm đối tác</button>}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng đối tác" icon="partner" value={DB.partners.length} edge="var(--blue-500)" />
          <Stat label="NCC vật tư/NL" icon="package" value="2" edge="var(--teal-500)" />
          <Stat label="Đối tác thiết bị" icon="excavator" value="2" edge="var(--violet-500)" />
          <Stat label="Tổng công nợ" icon="wallet" value={nf(DB.partners.reduce((s, p) => s + p.debt, 0))} unit="tr" edge="var(--red-500)" />
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Đối tác</th><th>Loại hình</th><th>Điện thoại</th><th className="num">Công nợ</th><th></th></tr></thead>
            <tbody>{DB.partners.map(p => (
              <tr key={p.id} className="clickable">
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--orange-50)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="partner" size={16} /></span><span style={{ fontWeight: 600, fontSize: 12.5 }}>{p.name}</span></div></td>
                <td><div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{p.type.map(t => <span key={t} className={'badge ' + (TYPE_CLS[t] || 'badge-gray')}>{t}</span>)}</div></td>
                <td className="mono" style={{ fontSize: 12 }}>{p.phone}</td>
                <td className="num">{p.debt ? <b style={{ color: 'var(--red-600)' }}>{nf(p.debt)} tr</b> : <span className="muted">—</span>}</td>
                <td style={{ textAlign: 'right' }}><Icon name="chevron-right" size={15} style={{ color: 'var(--ink-300)' }} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Page>
    );
  }

  function DanhMuc() {
    const cats = [
      { name: 'Loại công việc', icon: 'tasks', count: 12, items: ['Đào đất', 'Đắp đất', 'San nền', 'Lu lèn', 'Đổ bê tông'] },
      { name: 'Loại thiết bị', icon: 'excavator', count: 9, items: ['Máy xúc', 'Lu rung', 'Máy ủi', 'Xe ben 4 chân'] },
      { name: 'Đơn vị tính', icon: 'cube', count: 8, items: ['m³', 'm²', 'Tấn', 'Lít', 'Bao'] },
      { name: 'Loại vật tư', icon: 'package', count: 6, items: ['Nguyên vật liệu', 'Nhiên liệu'] },
      { name: 'Phòng ban', icon: 'users', count: 7, items: ['Ban điều hành', 'P. Kế toán', 'Đội cơ giới'] },
      { name: 'Loại chi phí', icon: 'wallet', count: 10, items: ['Nhiên liệu', 'Nhân công', 'Vật tư', 'Thầu phụ'] },
    ];
    return (
      <Page title="Danh mục" crumbLabel="Danh mục">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {cats.map((c, i) => (
            <div key={i} className="card">
              <div className="card-head"><div className="card-title"><Icon name={c.icon} size={15} style={{ color: 'var(--blue-600)' }} />{c.name}</div><span className="badge badge-gray">{c.count}</span></div>
              <div style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.items.map(it => <span key={it} className="badge badge-gray badge-sq">{it}</span>)}
                <button className="badge badge-blue badge-sq" style={{ cursor: 'pointer' }}><Icon name="plus" size={11} />Thêm</button>
              </div>
            </div>
          ))}
        </div>
      </Page>
    );
  }

  function BaoCao() {
    const projDonut = DB.projects.map(p => ({ label: p.name, value: p.contractValue, color: DB.templates.find(t => t.id === p.template).color }));
    return (
      <Page title="Báo cáo tổng hợp" crumbLabel="Báo cáo tổng hợp" right={<button className="btn btn-sm"><Icon name="download" size={14} />Xuất báo cáo BGĐ</button>}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng giá trị HĐ" icon="wallet" value="3.07" unit="tỷ" edge="var(--blue-500)" />
          <Stat label="Doanh thu nghiệm thu" icon="money" value="1.78" unit="tỷ" delta="6%" edge="var(--green-500)" />
          <Stat label="Chi phí thực hiện" icon="chart" value="1.69" unit="tỷ" edge="var(--orange-500)" />
          <Stat label="Lợi nhuận gộp ước" icon="target" value="92" unit="tr" edge="var(--violet-500)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="card"><div className="card-head"><div className="card-title"><Icon name="chart" size={15} style={{ color: 'var(--blue-600)' }} />Khối lượng thực hiện theo tháng (k m³)</div></div><div style={{ padding: 14 }}><BarChart height={170} data={[{ label: 'T12', value: 12.1 }, { label: 'T1', value: 13.4 }, { label: 'T2', value: 15.8 }, { label: 'T3', value: 16.2 }, { label: 'T4', value: 14.9 }, { label: 'T5', value: 18.4 }].map(d => ({ ...d, color: 'var(--orange-500)' }))} unit=" k m³" /></div></div>
          <div className="card"><div className="card-head"><div className="card-title"><Icon name="pie" size={15} style={{ color: 'var(--violet-500)' }} />Cơ cấu giá trị hợp đồng</div></div>
            <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Donut data={projDonut} size={140} center={<><div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>3.07</div><div style={{ fontSize: 10, color: 'var(--ink-500)' }}>tỷ ₫</div></>} />
              <div style={{ flex: 1 }}>{projDonut.map((d, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, marginBottom: 7 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flex: 'none' }} /><span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</span><b className="mono">{money(d.value)}</b></div>)}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head"><div className="card-title"><Icon name="road" size={15} style={{ color: 'var(--blue-600)' }} />Tổng hợp dự án</div></div>
          <table className="tbl"><thead><tr><th>Dự án</th><th>Tiến độ</th><th className="num">Giá trị HĐ</th><th className="num">Đã giải ngân</th><th className="num">% giải ngân</th><th className="num">Nhân sự</th><th className="num">Thiết bị</th></tr></thead>
            <tbody>{DB.projects.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600, fontSize: 12.5 }}>{p.name}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120 }}><window.Bar value={p.progress} /><span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{p.progress}%</span></div></td>
                <td className="num">{money(p.contractValue)}</td>
                <td className="num">{money(p.spent)}</td>
                <td className="num">{Math.round(p.spent / p.contractValue * 100)}%</td>
                <td className="num">{p.teamCount}</td>
                <td className="num">{p.equipCount}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Page>
    );
  }

  function CaiDat() {
    const [tab, setTab] = useState('roles');
    return (
      <Page title="Cài đặt hệ thống" crumbLabel="Cài đặt hệ thống">
        <div style={{ marginBottom: 14 }}><Tabs tabs={[{ id: 'roles', label: 'Phân quyền', icon: 'shield-check' }, { id: 'noti', label: 'Thông báo', icon: 'bell' }, { id: 'gps', label: 'Chấm công GPS', icon: 'crosshair' }, { id: 'general', label: 'Chung', icon: 'settings' }]} active={tab} onChange={setTab} /></div>
        {tab === 'roles' && (window.RBAC ? <window.RBAC /> : null)}
        {tab === 'gps' && (
          <div className="card card-pad" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['Bật chấm công GPS', true], ['Bắt buộc trong vùng địa lý (geofence)', true], ['Xác thực bằng WiFi công trường', true], ['Cho phép chấm công offline (PWA)', true], ['Chụp ảnh khi chấm công', false]].map(([l, on], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13 }}>{l}</span>
                  <span style={{ width: 38, height: 22, borderRadius: 12, background: on ? 'var(--blue-600)' : 'var(--ink-300)', position: 'relative', cursor: 'pointer' }}><span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: '.15s' }} /></span>
                </div>
              ))}
              <div className="field" style={{ marginTop: 6 }}><label className="label">Bán kính geofence (m)</label><input className="input" defaultValue="200" type="number" style={{ maxWidth: 160 }} /></div>
            </div>
          </div>
        )}
        {tab === 'noti' && <div className="card card-pad muted" style={{ textAlign: 'center', padding: 40 }}>Cấu hình kênh thông báo: Push, Email, Zalo OA — nhắc việc, phê duyệt, cảnh báo hết hạn thuê.</div>}
        {tab === 'general' && <div className="card card-pad muted" style={{ textAlign: 'center', padding: 40 }}>Thông tin công ty, logo, định dạng mã phiếu, ngôn ngữ, múi giờ.</div>}
      </Page>
    );
  }

  Object.assign(window, { KhachHang, DoiTac, DanhMuc, BaoCao, CaiDat });
})();
