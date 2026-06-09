/* Chi tiết nhân sự — phân biệt Cơ hữu vs Thuê ngoài → window.PersonDetail */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, Avatar, Tabs, Modal, nf, money, dmy, toast, DOC_ST } = window;

  const Row = ({ k, v, mono }) => <div><div className="muted" style={{ fontSize: 11 }}>{k}</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2, fontFamily: mono ? 'var(--mono)' : 'inherit' }}>{v}</div></div>;
  const Grid = ({ children }) => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 16px' }}>{children}</div>;
  const drv = (id) => id && DB.byId[id] ? DB.byId[id].name : '—';

  // lịch sử lái máy/xe của 1 người
  function operatorOf(pid) {
    const hist = (DB.operatorHistory || []).filter(o => o.person === pid);
    return hist.map(o => {
      const e = DB.equipment.find(x => x.id === o.equip) || {};
      const logs = e.kind === 'machine' ? DB.machineLogs.filter(l => l.equip === e.id) : DB.vehicleLogs.filter(l => l.equip === e.id);
      const totalH = e.kind === 'machine' ? logs.reduce((s, l) => s + l.hours, 0) : 0;
      const totalTrips = e.kind === 'vehicle' ? logs.reduce((s, l) => s + l.trips, 0) : 0;
      return { o, e, totalH, totalTrips };
    });
  }

  function PersonDetail({ pid, staff, onClose }) {
    const p = DB.byId[pid] || {};
    const ps = staff || (DB.projectStaff || []).find(s => s.person === pid) || {};
    const outsourced = ps.staffType === 'outsourced';
    const oi = outsourced ? (DB.outsourcedInfo[pid] || {}) : null;
    const [tab, setTab] = useState('info');
    const ops = operatorOf(pid);
    const proj = DB.projects.find(x => x.id === ps.proj);

    const companyTabs = [
      { id: 'info', label: 'Thông tin & hợp đồng', icon: 'customer' },
      { id: 'cong', label: 'Lịch sử công', icon: 'clock' },
      { id: 'luong', label: 'Lịch sử lương', icon: 'wallet' },
      { id: 'lai', label: 'Lịch sử lái máy/xe', icon: 'excavator' },
      { id: 'certs', label: 'Chứng chỉ', icon: 'shield-check' },
    ];
    const outTabs = [
      { id: 'info', label: 'Thông tin', icon: 'customer' },
      { id: 'hd-thue', label: 'Hợp đồng thuê', icon: 'file' },
      { id: 'cong', label: 'Timesheet', icon: 'clock' },
      { id: 'luong', label: 'Lương trả', icon: 'wallet' },
      { id: 'lai', label: 'Lịch sử lái', icon: 'truck' },
    ];
    const tabs = outsourced ? outTabs : companyTabs;

    const certs = (DB.personCerts || []).filter(c => c.person === pid);
    const payH = DB.payHistory[pid] || [];
    const outPay = (DB.outsourcedPay[pid] || []);
    const outTs = (DB.outsourcedTimesheet[pid] || []);

    return (
      <Modal title={p.name} sub={(outsourced ? 'Thuê ngoài' : 'NV-' + pid.slice(1).padStart(3, '0')) + ' · ' + (ps.role || p.title)} width={720} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Đóng</button>{!outsourced && <button className="btn"><Icon name="edit" size={14} />Sửa hồ sơ</button>}</>}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
          <Avatar id={pid} size="av-lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{ps.role || p.title}{ps.team ? ' · ' + DB.teamName(ps.team) : ''}</div>
            <div style={{ marginTop: 5, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {outsourced ? <span className="badge badge-orange"><Icon name="partner" size={11} />Thuê ngoài</span> : <span className="badge badge-blue"><Icon name="customer" size={11} />Nhân sự cơ hữu</span>}
              {ps.lead && <span className="badge badge-gray">Tổ trưởng</span>}
              {proj && <span className="badge badge-gray"><Icon name="map-pin" size={10} />{proj.name}</span>}
              {ps.equip && <span className="badge badge-violet"><Icon name={(DB.equipment.find(e => e.id === ps.equip) || {}).kind === 'vehicle' ? 'truck' : 'excavator'} size={10} />{(DB.equipment.find(e => e.id === ps.equip) || {}).name}</span>}
            </div>
          </div>
        </div>

        {/* note: thuê ngoài không có tài khoản */}
        {outsourced && <div style={{ display: 'flex', gap: 10, padding: '10px 13px', background: 'var(--amber-50)', border: '1px solid var(--amber-200, #f0d9a8)', borderRadius: 8, marginBottom: 14, alignItems: 'center' }}>
          <Icon name="info" size={15} style={{ color: 'var(--amber-600, #b9821a)' }} />
          <div style={{ fontSize: 12, color: 'var(--ink-700)' }}>Nhân sự thuê ngoài — <b>không có tài khoản hệ thống</b>. Mọi ghi nhận (chấm công, chuyến/ca) do <b>{drv(oi && oi.manager)}</b> ({(DB.byId[oi && oi.manager] || {}).title}) nhập & quản lý.</div>
        </div>}

        <div style={{ marginBottom: 14 }}><Tabs tabs={tabs} active={tab} onChange={setTab} scroll /></div>

        {/* ===== Thông tin ===== */}
        {tab === 'info' && (outsourced ? (
          <Grid>
            <Row k="Họ tên" v={p.name} />
            <Row k="Năm sinh" v={oi.birth || '—'} />
            <Row k="Số CCCD" v={oi.idCard || '—'} mono />
            <Row k="Quê quán" v={oi.home || '—'} />
            <Row k="Điện thoại" v={oi.phone || p.phone} mono />
            <Row k="Nguồn cung cấp" v={oi.supplierType === 'company' ? 'Nhà cung cấp: ' + DB.supplierName(oi.supplier) : 'Lao động tự do'} />
            <Row k="Người quản lý" v={drv(oi.manager) + ' (' + (DB.byId[oi.manager] || {}).title + ')'} />
            <Row k="Tổ / Đội" v={DB.teamName(ps.team)} />
            <Row k="Vai trò" v={ps.role} />
            <Row k="Thiết bị vận hành" v={ps.equip ? (DB.equipment.find(e => e.id === ps.equip) || {}).name : '—'} />
          </Grid>
        ) : (
          <div>
            <Grid>
              <Row k="Họ tên" v={p.name} />
              <Row k="Năm sinh" v={hrBirth(pid)} />
              <Row k="Số CCCD" v={hrId(pid)} mono />
              <Row k="Quê quán" v={hrHome(pid)} />
              <Row k="Điện thoại" v={p.phone} mono />
              <Row k="Bộ phận" v={p.dept} />
            </Grid>
            <div className="divider" style={{ margin: '14px 0' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>Hợp đồng lao động</div>
            <Grid>
              <Row k="Loại hợp đồng" v="HĐLĐ không xác định thời hạn" />
              <Row k="Ngày vào làm" v={hrJoin(pid)} />
              <Row k="Lương cơ bản" v={nf(hrBase(pid), 1) + ' tr/tháng'} />
              <Row k="Hình thức trả" v={ps.team === 'cogioi' || ps.team === 'vantai' ? 'Công nhật + ca máy' : 'Lương tháng'} />
              <Row k="BHXH / BHYT" v="Đã đóng đủ" />
              <Row k="Phụ cấp" v="Công trường + ăn ca" />
            </Grid>
          </div>
        ))}

        {/* ===== Hợp đồng thuê (outsourced) ===== */}
        {tab === 'hd-thue' && outsourced && (
          <div>
            <Grid>
              <Row k="Số hợp đồng" v={oi.contractNo} mono />
              <Row k="Nhà cung cấp" v={DB.supplierName(oi.supplier)} />
              <Row k="Thời hạn" v={dmy(oi.contractFrom) + ' → ' + dmy(oi.contractTo)} />
              <Row k="Hình thức trả" v={{ trip: 'Theo chuyến', day: 'Theo ngày công', hour: 'Theo giờ' }[oi.payForm]} />
              <Row k="Đơn giá" v={nf(oi.rate, 2) + ' tr / ' + oi.rateUnit} />
              <Row k="Người quản lý" v={drv(oi.manager)} />
            </Grid>
            <div className="auto-note" style={{ marginTop: 14 }}><Icon name="info" size={13} />Thanh toán theo sản lượng thực tế (chuyến/ngày công) ghi nhận trong timesheet — đối chiếu với hợp đồng cung cấp nhân lực {oi.contractNo}.</div>
            {/* hợp đồng cấp tổ/đội liên quan */}
            {(DB.laborContracts || []).filter(c => c.team === ps.team).map(c => (
              <div key={c.id} style={{ marginTop: 12, padding: 12, border: '1px solid var(--line)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><b style={{ fontSize: 12.5 }}>HĐ cung cấp: {c.no}</b><Badge map={DOC_ST} k={c.status === 'active' ? 'approved' : 'pending'} /></div>
                <div className="muted" style={{ fontSize: 11.5 }}>{DB.supplierName(c.supplier)} · {c.count} người · {dmy(c.from)}→{dmy(c.to)} · giá trị {money(c.value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* ===== Lịch sử công / Timesheet ===== */}
        {tab === 'cong' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            {outsourced ? (
              <table className="tbl tbl-compact"><thead><tr><th>Ngày</th><th>Vào</th><th>Ra</th><th className="num">Số chuyến</th><th>Trạng thái</th></tr></thead>
                <tbody>{outTs.map((t, i) => <tr key={i}><td className="mono">{dmy(t.date)}</td><td className="mono">{t.in}</td><td className="mono">{t.out}</td><td className="num"><b>{t.trips}</b></td><td>{t.status === 'off' ? <span className="badge badge-gray">Nghỉ</span> : t.status === 'late' ? <span className="badge badge-amber">Đi muộn</span> : <span className="badge badge-green">Đủ công</span>}</td></tr>)}</tbody>
              </table>
            ) : (
              <table className="tbl tbl-compact"><thead><tr><th>Ngày</th><th>Vào ca</th><th>Ra ca</th><th className="num">Giờ công</th><th className="num">Tăng ca</th><th>Trạng thái</th></tr></thead>
                <tbody>{['16/05', '15/05', '14/05', '13/05', '12/05'].map((day, i) => <tr key={i}><td className="mono">{day}/2026</td><td className="mono">07:0{i}</td><td className="mono">17:0{i}</td><td className="num">{nf(8 - (i % 2) * 0.5, 1)}</td><td className="num">{i % 2 === 0 ? '3h' : '—'}</td><td>{i === 2 ? <span className="badge badge-amber">Đi muộn</span> : <span className="badge badge-green">Có mặt</span>}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== Lương ===== */}
        {tab === 'luong' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            {outsourced ? (
              <table className="tbl tbl-compact"><thead><tr><th>Tháng</th><th className="num">Số chuyến</th><th className="num">Đơn giá</th><th className="num">Thành tiền</th><th className="num">Tạm ứng</th><th className="num">Còn lại</th><th>Trả cho</th><th>TT</th></tr></thead>
                <tbody>{outPay.map((r, i) => <tr key={i}><td><b>{r.month}</b></td><td className="num">{r.trips}</td><td className="num">{nf(r.rate, 2)} tr</td><td className="num">{nf(r.gross, 2)} tr</td><td className="num muted">{nf(r.advance, 1)} tr</td><td className="num"><b style={{ color: 'var(--green-700)' }}>{nf(r.net, 2)} tr</b></td><td style={{ fontSize: 11.5 }}>{r.payTo === 'supplier' ? 'Nhà cung cấp' : 'Cá nhân'}</td><td><Badge map={DOC_ST} k={r.status === 'paid' ? 'approved' : 'pending'} /></td></tr>)}</tbody>
              </table>
            ) : payH.length ? (
              <table className="tbl tbl-compact"><thead><tr><th>Tháng</th><th className="num">Công</th><th className="num">Ca máy</th><th className="num">Lương CB</th><th className="num">Tăng ca</th><th className="num">Thực lĩnh</th><th>TT</th></tr></thead>
                <tbody>{payH.map((r, i) => <tr key={i}><td><b>{r.month}</b></td><td className="num">{r.cong}</td><td className="num">{r.caMay}</td><td className="num">{nf(r.base, 1)} tr</td><td className="num">{nf(r.ot, 1)} tr</td><td className="num"><b style={{ color: 'var(--green-700)' }}>{nf(r.net, 1)} tr</b></td><td><Badge map={DOC_ST} k="approved" /></td></tr>)}</tbody>
              </table>
            ) : <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-400)', fontSize: 12.5 }}>Chưa có dữ liệu lương</div>}
          </div>
        )}

        {/* ===== Lịch sử lái máy/xe ===== */}
        {tab === 'lai' && (
          <div>
            {ops.length ? ops.map(({ o, e, totalH, totalTrips }, i) => (
              <div key={i} className="card" style={{ padding: 13, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: e.kind === 'vehicle' ? 'var(--orange-50)' : 'var(--blue-50)', color: e.kind === 'vehicle' ? 'var(--orange-600)' : 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={e.kind === 'vehicle' ? 'truck' : 'excavator'} size={16} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{e.name}</div><div className="mono muted" style={{ fontSize: 10.5 }}>{e.code} · {e.series}</div></div>
                  {o.current ? <span className="badge badge-green">Đang lái</span> : <span className="badge badge-gray">Đã chuyển</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, fontSize: 12 }}>
                  <div><div className="muted" style={{ fontSize: 10.5 }}>Thời gian lái</div><b>{dmy(o.from)} → {o.to ? dmy(o.to) : 'nay'}</b></div>
                  <div><div className="muted" style={{ fontSize: 10.5 }}>{e.kind === 'machine' ? 'Tổng giờ máy' : 'Tổng chuyến'}</div><b>{e.kind === 'machine' ? nf(totalH, 1) + ' giờ' : totalTrips + ' chuyến'}</b></div>
                  <div><div className="muted" style={{ fontSize: 10.5 }}>{e.kind === 'machine' ? 'Giờ máy hiện tại' : 'Km hiện tại'}</div><b>{e.kind === 'machine' ? nf(e.hourNow, 1) : nf(e.kmNow)}</b></div>
                </div>
              </div>
            )) : <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-400)', fontSize: 12.5 }}>Không có lịch sử lái máy/xe</div>}
          </div>
        )}

        {/* ===== Chứng chỉ (company) ===== */}
        {tab === 'certs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {certs.length ? certs.map((c, i) => { const days = Math.round((new Date(c.expiry) - new Date('2026-05-16')) / 86400000); const ok = days > 15; return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8 }}>
                <Icon name="shield-check" size={16} style={{ color: ok ? 'var(--green-600)' : 'var(--amber-600, #b9821a)' }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div><div className="mono muted" style={{ fontSize: 10.5 }}>{c.no} · hết hạn {dmy(c.expiry)}</div></div>
                <span className={'badge ' + (ok ? 'badge-green' : 'badge-amber')}>{ok ? 'Còn ' + days + ' ngày' : days < 0 ? 'Hết hạn' : 'Sắp hết hạn'}</span>
              </div>
            ); }) : <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-400)', fontSize: 12.5 }}>Chưa có chứng chỉ</div>}
          </div>
        )}
      </Modal>
    );
  }

  // helper hồ sơ cơ hữu (suy ra ổn định từ id)
  function hrBirth(id) { return 1980 + (parseInt(id.slice(1)) * 3) % 18; }
  function hrId(id) { return '0240' + (90000000 + parseInt(id.slice(1)) * 137).toString().slice(0, 8); }
  function hrHome(id) { const h = ['Cao Lộc, Lạng Sơn', 'Chi Lăng, Lạng Sơn', 'Hữu Lũng, Lạng Sơn', 'Văn Quan, Lạng Sơn', 'TP. Lạng Sơn']; return h[parseInt(id.slice(1)) % h.length]; }
  function hrJoin(id) { const y = ['12/03/2019', '05/06/2020', '18/09/2021', '02/01/2022', '20/07/2023']; return y[parseInt(id.slice(1)) % y.length]; }
  function hrBase(id) { return [12, 10.5, 11, 9.5, 13][parseInt(id.slice(1)) % 5]; }

  window.PersonDetail = PersonDetail;
})();
