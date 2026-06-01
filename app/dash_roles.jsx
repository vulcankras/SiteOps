/* Dashboard riêng theo vai trò — Thủ kho, Kế toán → window.WhDashboard, window.AccDashboard */
(function () {
  const { Icon, DB, Stat, BarChart, Donut, LineChart, Bar, Badge, nf, money, dmy, EQ_ST, DOC_ST } = window;

  function Head({ title, sub, right }) {
    return (
      <div className="page-head">
        <div><div className="crumbs"><span>Trang chủ</span></div><h1 className="page-title">{title}</h1>{sub && <div className="card-sub" style={{ marginTop: 3 }}>{sub}</div>}</div>
        {right}
      </div>
    );
  }
  const Card = ({ title, icon, color, right, children, pad = 14 }) => (
    <div className="card"><div className="card-head"><div className="card-title">{icon && <Icon name={icon} size={15} style={{ color: color || 'var(--blue-600)' }} />}{title}</div>{right}</div><div style={{ padding: pad }}>{children}</div></div>
  );

  /* ============ Thủ kho ============ */
  function WhDashboard({ go }) {
    const matDonut = [{ label: 'Nguyên vật liệu', value: 62, color: 'var(--teal-500)' }, { label: 'Nhiên liệu', value: 38, color: 'var(--orange-500)' }];
    const low = DB.materials.filter(m => m.stock <= m.min);
    return (
      <div className="page">
        <Head title="Dashboard Kho hàng" sub="Tổng quan kho, thiết bị & vật tư toàn công ty" right={<div style={{ display: 'flex', gap: 8 }}><button className="btn btn-sm" onClick={() => go({ page: 'kho-nhap' })}><Icon name="download" size={14} />Nhập kho</button><button className="btn btn-sm btn-primary" onClick={() => go({ page: 'kho-xuat' })}><Icon name="upload" size={14} />Xuất kho</button></div>} />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 12 }}>
          <Stat label="Giá trị tồn kho" icon="package" value="2.84" unit="tỷ" edge="var(--blue-500)" />
          <Stat label="Thiết bị quản lý" icon="excavator" value={DB.equipment.length} unit="TB" edge="var(--violet-500)" foot="5 đang chạy" />
          <Stat label="Phiếu chờ duyệt" icon="file" value="2" edge="var(--amber-500)" />
          <Stat label="Cảnh báo tồn thấp" icon="alert" value={low.length} edge="var(--red-500)" />
          <Stat label="TB thuê sắp hết hạn" icon="clock" value="1" unit="" edge="var(--orange-500)" foot="còn 1 ngày" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Card title="Cơ cấu tồn kho" icon="package">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Donut data={matDonut} size={118} center={<><div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>2.84</div><div style={{ fontSize: 10, color: 'var(--ink-500)' }}>tỷ ₫</div></>} />
              <div style={{ flex: 1 }}>{matDonut.map((d, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 8 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} /><span style={{ flex: 1 }}>{d.label}</span><b>{d.value}%</b></div>)}</div>
            </div>
          </Card>
          <Card title="Nhập / Xuất theo tuần (tr ₫)" icon="chart" color="var(--orange-500)">
            <BarChart height={150} data={[{ label: 'T2', value: 142 }, { label: 'T3', value: 0 }, { label: 'T4', value: 139 }, { label: 'T5', value: 96 }, { label: 'T6', value: 168 }, { label: 'T7', value: 54 }].map(d => ({ ...d, color: 'var(--blue-500)' }))} />
          </Card>
          <Card title="Tình trạng thiết bị" icon="excavator" color="var(--violet-500)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {Object.entries(EQ_ST).map(([k, v]) => { const c = DB.equipment.filter(e => e.status === k).length; return <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}><span className={'badge ' + v.cls} style={{ minWidth: 116, justifyContent: 'center' }}>{v.label}</span><div style={{ flex: 1 }}><Bar value={c} max={DB.equipment.length} /></div><b className="mono" style={{ width: 20, textAlign: 'right' }}>{c}</b></div>; })}
            </div>
          </Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card title="Vật tư tồn thấp — cần nhập" icon="alert" color="var(--red-500)" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => go({ page: 'kho-vat-tu' })}>Xem</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Vật tư</th><th className="num">Tồn</th><th className="num">Tối thiểu</th><th></th></tr></thead>
              <tbody>{low.map(m => <tr key={m.id}><td style={{ fontWeight: 600 }}>{m.name}</td><td className="num">{nf(m.stock, m.stock < 100 ? 1 : 0)} {m.unit}</td><td className="num muted">{nf(m.min)}</td><td><span className="badge badge-red">Thấp</span></td></tr>)}</tbody>
            </table>
          </Card>
          <Card title="Phiếu kho gần đây" icon="file" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => go({ page: 'kho-nhap' })}>Tất cả</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Mã phiếu</th><th>Loại</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
              <tbody>{[...DB.receipts.slice(0, 2), ...DB.issues.slice(0, 2)].map(d => <tr key={d.id}><td className="mono" style={{ fontWeight: 600 }}>{d.code}</td><td style={{ fontSize: 11.5 }}>{d.kind || d.type}</td><td className="mono" style={{ fontSize: 11.5 }}>{dmy(d.date)}</td><td><Badge map={DOC_ST} k={d.status} /></td></tr>)}</tbody>
            </table>
          </Card>
        </div>
      </div>
    );
  }

  /* ============ Kế toán ============ */
  function AccDashboard({ go }) {
    const totalDebt = DB.partners.reduce((s, p) => s + p.debt, 0);
    const payroll = DB.payroll.reduce((s, p) => s + p.gross, 0);
    const costSeries = [{ color: 'var(--teal-500)', fill: 'var(--teal-500)', data: [142, 168, 95, 210, 188, 246] }];
    return (
      <div className="page">
        <Head title="Dashboard Tài chính" sub="Giải ngân, công nợ, quỹ lương toàn công ty" right={<button className="btn btn-sm"><Icon name="download" size={14} />Xuất báo cáo BGĐ</button>} />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 12 }}>
          <Stat label="Tổng giá trị HĐ" icon="wallet" value="3.07" unit="tỷ" edge="var(--blue-500)" />
          <Stat label="Đã giải ngân" icon="money" value="1.69" unit="tỷ" delta="8%" edge="var(--green-500)" foot="55%" />
          <Stat label="Chi phí tháng 5" icon="chart" value="504" unit="tr" edge="var(--orange-500)" />
          <Stat label="Công nợ phải trả" icon="partner" value={nf(totalDebt)} unit="tr" edge="var(--red-500)" />
          <Stat label="Quỹ lương tháng" icon="users" value={nf(payroll, 0)} unit="tr" edge="var(--violet-500)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>
          <Card title="Chi phí thực hiện theo tháng (tr ₫)" icon="chart" color="var(--teal-500)">
            <LineChart series={costSeries} labels={['T12', 'T1', 'T2', 'T3', 'T4', 'T5']} height={160} />
          </Card>
          <Card title="Giải ngân theo dự án" icon="road">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {DB.projects.map(p => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}><span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span><span className="mono">{Math.round(p.spent / p.contractValue * 100)}%</span></div>
                  <Bar value={p.spent} max={p.contractValue} tone="green" />
                  <div className="muted mono" style={{ fontSize: 10.5, marginTop: 2 }}>{money(p.spent)} / {money(p.contractValue)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card title="Công nợ đối tác" icon="partner" color="var(--red-500)" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => go({ page: 'doi-tac' })}>Xem</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Đối tác</th><th>Loại</th><th className="num">Công nợ</th></tr></thead>
              <tbody>{DB.partners.filter(p => p.debt > 0).map(p => <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.name}</td><td style={{ fontSize: 11.5 }}>{p.type[0]}</td><td className="num"><b style={{ color: 'var(--red-600)' }}>{nf(p.debt)} tr</b></td></tr>)}</tbody>
            </table>
          </Card>
          <Card title="Quỹ lương theo bộ phận" icon="wallet" color="var(--violet-500)" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => go({ page: 'hrm-luong' })}>Bảng lương</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Bộ phận</th><th className="num">Số người</th><th className="num">Quỹ lương</th></tr></thead>
              <tbody>{[['Đội cơ giới', 4, 38.5], ['Đội vận tải', 2, 17.2], ['BCH công trường', 2, 22.0], ['Kho / Vật tư', 1, 9.4]].map(([d, n, v]) => <tr key={d}><td style={{ fontWeight: 600 }}>{d}</td><td className="num">{n}</td><td className="num mono">{nf(v, 1)} tr</td></tr>)}</tbody>
            </table>
          </Card>
        </div>
      </div>
    );
  }

  Object.assign(window, { WhDashboard, AccDashboard });
})();
