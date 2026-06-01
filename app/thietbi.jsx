/* Chi tiết thiết bị → window.ThietBiDetail */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, dmy, nf, money, Avatar, Tabs, toast, Stat, LineChart, EQ_ST, OWN_ST } = window;

  function QRBox({ code }) {
    // deterministic pseudo-QR grid
    const cells = [];
    let seed = [...code].reduce((a, c) => a + c.charCodeAt(0), 0);
    for (let i = 0; i < 169; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; cells.push(seed % 100 < 48); }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13,1fr)', width: 104, height: 104, gap: 0, background: '#fff', padding: 5, border: '1px solid var(--line)', borderRadius: 6 }}>
        {cells.map((b, i) => <div key={i} style={{ background: b ? 'var(--ink-900)' : 'transparent' }} />)}
      </div>
    );
  }

  function Info({ e }) {
    const groups = [
      { title: 'Thông tin định danh', rows: [['Mã thiết bị', e.code], ['Số series', e.series], ['Biển số / Số khung', e.plate || '—']] },
      { title: 'Thông tin thiết bị', rows: [['Tên thiết bị', e.name], ['Nhóm', e.kind === 'vehicle' ? 'Xe vận chuyển' : 'Máy thi công'], ['Loại', e.cat], ['Hãng sản xuất', e.brand], ['Model', e.model], ['Năm sản xuất', e.year]] },
      { title: 'Thông tin quản lý', rows: [['Người vận hành', e.driver ? DB.byId[e.driver].name : '—'], ['Vị trí hiện tại', e.locName], ['Số lượng', '1 ' + (e.kind === 'vehicle' ? 'xe' : 'chiếc')]] },
      { title: 'Thông số kỹ thuật', rows: e.kind === 'vehicle' ? [['Dung tích thùng', e.bucketVol], ['Tải trọng', e.load], ['KL TB/chuyến', e.avgTrip + ' m³'], ['Nhiên liệu', e.fuel], ['Số km ban đầu', nf(e.kmStart) + ' km']] : [['Dung tích gầu', e.bucket || '—'], ['Công suất', e.power], ['Nhiên liệu', e.fuel], ['Số giờ ban đầu', nf(e.hourStart, 1) + ' giờ']] },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {groups.map((g, i) => (
            <div key={i} className="card card-pad">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 11 }}>{g.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.rows.map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, gap: 10 }}><span className="muted nowrap">{k}</span><b style={{ fontWeight: 600, textAlign: 'right', fontFamily: ['Mã thiết bị', 'Số series', 'Biển số / Số khung'].includes(k) ? 'var(--mono)' : 'inherit' }}>{v}</b></div>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card card-pad" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 11 }}>Mã QR định danh</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 11 }}><QRBox code={e.code} /></div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 11 }}>{e.code}</div>
            <button className="btn btn-sm" style={{ width: '100%' }} onClick={() => toast('Đang in tem QR…')}><Icon name="print" size={14} />In mã QR</button>
          </div>
          {e.own === 'rented' && e.rent && (
            <div className="card card-pad" style={{ borderColor: 'var(--orange-200)', background: 'var(--orange-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}><Icon name="handshake" size={15} style={{ color: 'var(--orange-600)' }} /><b style={{ fontSize: 12.5 }}>Hợp đồng thuê ngoài</b></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Nhà cung cấp</span><b>{DB.partners.find(p => p.id === e.rent.supplier)?.name}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Hình thức</span><b>{({ hour: 'Theo giờ máy', trip: 'Theo chuyến', day: 'Theo ngày' })[e.rent.form]}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Hết hạn</span><b style={{ color: 'var(--red-600)' }}>{dmy(e.rent.end)}</b></div>
                <div style={{ marginTop: 4 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}><span className="muted">Đã dùng {e.rent.used}/{e.rent.quota}</span><b>{Math.round(e.rent.used / e.rent.quota * 100)}%</b></div><Bar value={e.rent.used} max={e.rent.quota} tone="orange" /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function VanHanh({ e }) {
    const rows = e.kind === 'vehicle'
      ? [['2026-05-16', 'u10', '—', 51, 1020, 'Đất điều phối', 'Tốt'], ['2026-05-15', 'u10', '—', 16, 160, 'Đất đắp', 'Tốt']]
      : [['2026-05-16', 'u3', 8.0, '—', 450, 'Đào & đắp nền', 'Tốt'], ['2026-05-15', 'u3', 7.5, '—', 320, 'Đắp đất K95', 'Trung bình'], ['2026-05-14', 'u6', 11, '—', 380, 'Lu lèn', 'Tốt']];
    return (
      <div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label={e.kind === 'vehicle' ? 'Tổng số chuyến' : 'Tổng giờ máy'} icon="clock" value={e.kind === 'vehicle' ? '612' : nf(e.hourNow - e.hourStart, 1)} unit={e.kind === 'vehicle' ? 'chuyến' : 'giờ'} edge="var(--blue-500)" />
          <Stat label="Sản lượng luỹ kế" icon="cube" value={e.kind === 'vehicle' ? '11.4' : '8.6'} unit="k m³" edge="var(--orange-500)" />
          <Stat label="TG hoạt động TB/ngày" icon="target" value={e.kind === 'vehicle' ? '9.2' : '7.8'} unit="giờ" edge="var(--green-500)" />
          <Stat label="Hiệu suất" icon="chart" value="Tốt" edge="var(--violet-500)" />
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Ngày</th><th>Người lái</th><th className="num">{e.kind === 'vehicle' ? 'Chuyến' : 'Giờ máy'}</th><th className="num">KL hoàn thành</th><th>Công việc chính</th><th>Hiệu suất</th></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 12 }}>{dmy(r[0])}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={r[1]} size="av-sm" />{DB.byId[r[1]].name}</div></td>
                <td className="num"><b>{e.kind === 'vehicle' ? r[3] : nf(r[2], 1)}</b></td>
                <td className="num">{nf(r[4])} m³</td>
                <td>{r[5]}</td>
                <td><span className={'badge ' + (r[6] === 'Tốt' ? 'badge-green' : 'badge-amber')}>{r[6]}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  function NhienLieu({ e }) {
    const series = [{ color: 'var(--orange-500)', fill: 'var(--orange-500)', data: [6.2, 6.4, 6.5, 6.8, 6.6, 6.8] }];
    const rows = [['2026-05-25', 180, 1253.5, 1261.5, 8, 6.2, 'u2'], ['2026-05-24', 150, 1100, 1253.5, 153.5, 6.8, 'u3']];
    return (
      <div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng nhiên liệu đã đổ" icon="fuel" value="2.450" unit="L" edge="var(--orange-500)" />
          <Stat label="Số giờ sử dụng" icon="clock" value={nf(e.hourNow - e.hourStart, 0)} unit="giờ" edge="var(--blue-500)" />
          <Stat label="Tiêu hao trung bình" icon="chart" value="6.8" unit="L/giờ" delta="tăng dần" deltaDir="up" edge="var(--red-500)" />
          <Stat label="Chi phí nhiên liệu" icon="wallet" value="50.2" unit="tr" edge="var(--teal-500)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
          <div className="card"><div className="card-head"><div className="card-title"><Icon name="chart" size={15} style={{ color: 'var(--orange-500)' }} />Xu hướng tiêu hao (L/giờ)</div></div><div style={{ padding: 14 }}><LineChart series={series} labels={['T12', 'T1', 'T2', 'T3', 'T4', 'T5']} height={150} /></div></div>
          <div className="card" style={{ overflow: 'hidden' }}><div className="card-head"><div className="card-title"><Icon name="droplet" size={15} style={{ color: 'var(--blue-600)' }} />Lịch sử đổ nhiên liệu</div></div>
            <table className="tbl tbl-compact"><thead><tr><th>Ngày</th><th className="num">Lít</th><th className="num">Giờ trước</th><th className="num">Giờ sau</th><th className="num">Giờ SD</th><th className="num">L/giờ</th><th>Người đổ</th></tr></thead>
              <tbody>{rows.map((r, i) => <tr key={i}><td className="mono" style={{ fontSize: 11.5 }}>{dmy(r[0])}</td><td className="num">{r[1]}</td><td className="num">{nf(r[2], 1)}</td><td className="num">{nf(r[3], 1)}</td><td className="num">{nf(r[4], 1)}</td><td className="num"><b>{r[5]}</b></td><td style={{ fontSize: 11.5 }}>{DB.byId[r[6]].name}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function SuaChuaTab({ e }) {
    const list = DB.repairs.filter(r => r.equip === e.id);
    return (
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl"><thead><tr><th>Mã đơn</th><th>Ngày</th><th>Loại sửa chữa</th><th className="num">Chi phí</th><th>Nơi sửa</th><th>Ghi chú</th></tr></thead>
          <tbody>{list.length ? list.map(r => <tr key={r.id}><td className="mono" style={{ fontWeight: 600 }}>{r.code}</td><td className="mono" style={{ fontSize: 12 }}>{dmy(r.date)}</td><td>{r.type}</td><td className="num">{r.cost ? nf(r.cost) + ' tr' : '—'}</td><td style={{ fontSize: 12 }}>{r.place}</td><td className="muted" style={{ fontSize: 11.5 }}>{r.note}</td></tr>) : <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--ink-400)' }}>Chưa có lịch sử sửa chữa</td></tr>}</tbody>
        </table>
      </div>
    );
  }

  function LuanChuyen({ e }) {
    return (
      <div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
          <Stat label="Tổng số lần luân chuyển" icon="refresh" value="12" unit="lần" edge="var(--blue-500)" />
          <Stat label="Đang sử dụng tại" icon="map-pin" value={e.locName.length > 16 ? 'HN–Chi Lăng' : e.locName} edge="var(--green-500)" />
          <Stat label="TG tại vị trí hiện tại" icon="clock" value="45" unit="ngày" edge="var(--orange-500)" />
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl"><thead><tr><th>Ngày giờ</th><th>Loại phiếu</th><th>Mã phiếu</th><th>Từ vị trí</th><th>Đến vị trí</th><th>Người thực hiện</th><th>Lý do</th><th>Trạng thái</th></tr></thead>
            <tbody>{DB.transfers.map(t => (
              <tr key={t.id} className="clickable">
                <td className="mono" style={{ fontSize: 11.5 }}>{t.date}</td>
                <td><span className={'badge ' + (t.kind === 'Xuất kho' ? 'badge-blue' : 'badge-teal')}>{t.kind}</span></td>
                <td className="mono" style={{ fontWeight: 600 }}>{t.code}</td>
                <td style={{ fontSize: 12 }}>{t.from}</td>
                <td style={{ fontSize: 12 }}>{t.to}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={t.by} size="av-sm" />{DB.byId[t.by].name}</div></td>
                <td className="muted" style={{ fontSize: 11.5 }}>{t.note}</td>
                <td><span className="badge badge-green">Hoàn thành</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  function ThietBiDetail({ id, go }) {
    const e = DB.equipment.find(x => x.id === id);
    const [tab, setTab] = useState('info');
    return (
      <div className="page">
        <div className="crumbs"><a onClick={() => go({ page: 'dashboard' })} style={{ cursor: 'pointer' }}>Trang chủ</a><Icon name="chevron-right" size={12} /><a onClick={() => go({ page: 'kho-thiet-bi' })} style={{ cursor: 'pointer' }}>Thiết bị</a><Icon name="chevron-right" size={12} /><span>{e.name}</span></div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
            <span style={{ width: 46, height: 46, borderRadius: 11, background: e.kind === 'vehicle' ? 'var(--orange-50)' : 'var(--blue-50)', color: e.kind === 'vehicle' ? 'var(--orange-600)' : 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={e.kind === 'vehicle' ? 'truck' : 'excavator'} size={24} /></span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><h1 className="page-title" style={{ fontSize: 18 }}>{e.name}</h1><Badge map={EQ_ST} k={e.status} /><Badge map={OWN_ST} k={e.own} /></div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--ink-500)', marginTop: 3 }}><span className="mono">{e.code}</span><span className="mono">SN: {e.series}</span><span><Icon name="map-pin" size={12} /> {e.locName}</span></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm"><Icon name="refresh" size={14} />Luân chuyển</button>
            <button className="btn btn-sm"><Icon name="report" size={14} />Báo cáo nhanh</button>
            <button className="btn btn-sm btn-primary"><Icon name="edit" size={14} />Sửa thông tin</button>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Tabs tabs={[{ id: 'info', label: 'Thông tin chung', icon: 'info' }, { id: 'van-hanh', label: 'Lịch sử vận hành', icon: 'history' }, { id: 'nhien-lieu', label: 'Nhiên liệu', icon: 'fuel' }, { id: 'sua-chua', label: 'Sửa chữa', icon: 'wrench' }, { id: 'luan-chuyen', label: 'Lịch sử luân chuyển', icon: 'refresh' }]} active={tab} onChange={setTab} />
        </div>
        {tab === 'info' && <Info e={e} />}
        {tab === 'van-hanh' && <VanHanh e={e} />}
        {tab === 'nhien-lieu' && <NhienLieu e={e} />}
        {tab === 'sua-chua' && <SuaChuaTab e={e} />}
        {tab === 'luan-chuyen' && <LuanChuyen e={e} />}
      </div>
    );
  }

  window.ThietBiDetail = ThietBiDetail;
})();
