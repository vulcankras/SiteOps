/* Dashboard công trường theo vai trò — Chỉ huy, Kỹ thuật, Vật tư → window.SiteRoleDash */
(function () {
  const { Icon, DB, Stat, Bar, BarChart, LineChart, Avatar, AvatarStack, Badge, nf, money, dmy, TASK_ST, DOC_ST } = window;

  const Card = ({ title, icon, color, right, children, pad = 14 }) => (
    <div className="card"><div className="card-head"><div className="card-title">{icon && <Icon name={icon} size={15} style={{ color: color || 'var(--blue-600)' }} />}{title}</div>{right}</div><div style={{ padding: pad }}>{children}</div></div>
  );
  const goTab = (go, p, tab) => go({ page: 'cong-truong', sub: 'detail', id: p.id, tab });

  /* ===== Chỉ huy trưởng ===== */
  function SiteCmd({ p, go }) {
    const tasks = DB.tasks.filter(t => t.proj === p.id);
    const volData = [{ label: 'T2', value: 620 }, { label: 'T3', value: 740 }, { label: 'T4', value: 810 }, { label: 'T5', value: 690 }, { label: 'T6', value: 854 }, { label: 'T7', value: 1020 }].map(d => ({ ...d, color: 'var(--orange-500)' }));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          <Stat label="Tiến độ công trường" icon="target" value={p.progress} unit="%" edge="var(--blue-500)" foot="KH: 65%" />
          <Stat label="Nhân sự hôm nay" icon="users" value="42" unit="/86" edge="var(--green-500)" foot="có mặt" />
          <Stat label="Thiết bị hoạt động" icon="excavator" value="5" unit="/8" edge="var(--violet-500)" />
          <Stat label="Phiếu chờ duyệt" icon="file" value="3" edge="var(--amber-500)" foot="tăng ca, NK, xuất kho" />
          <Stat label="KL đắp tuần" icon="cube" value="5.1" unit="k m³" edge="var(--orange-500)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
          <Card title="Khối lượng đào / đắp (7 ngày)" icon="cube" color="var(--orange-500)" right={<span className="badge badge-orange">Tổng: 5.1k m³</span>}><BarChart data={volData} unit=" m³" height={170} /></Card>
          <Card title="Phiếu chờ bạn duyệt" icon="shield-check" color="var(--orange-500)" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => goTab(go, p, 'nhan-su')}>Xem</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Loại</th><th>Người</th><th></th></tr></thead>
              <tbody>{[['Tăng ca', 'Lăng Văn Hùng'], ['Nhật ký', 'Phạm Minh Đức'], ['Xuất kho', 'Đỗ Thị Mai']].map(([t, w], i) => <tr key={i}><td><span className="badge badge-amber">{t}</span></td><td style={{ fontSize: 12 }}>{w}</td><td style={{ textAlign: 'right' }}><button className="btn btn-sm" style={{ height: 24, padding: '0 9px', borderColor: 'var(--green-500)', color: 'var(--green-600)' }} onClick={() => window.toast('Đã duyệt')}>Duyệt</button></td></tr>)}</tbody>
            </table>
          </Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card title="Công việc cần chú ý" icon="tasks" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => goTab(go, p, 'cong-viec')}>Tất cả</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Công việc</th><th>Trạng thái</th><th className="num">%</th></tr></thead>
              <tbody>{tasks.filter(t => t.status !== 'done').slice(0, 5).map(t => <tr key={t.id}><td style={{ fontWeight: 600 }}>{t.name}</td><td><Badge map={TASK_ST} k={t.status} /></td><td className="num mono">{t.progress}%</td></tr>)}</tbody>
            </table>
          </Card>
          <Card title="Tiến độ theo giai đoạn" icon="layers">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>{DB.phases.filter(ph => ph.proj === p.id).map(ph => <div key={ph.id}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}><span style={{ fontWeight: 600 }}>{ph.name}</span><span className="mono">{ph.progress}%</span></div><Bar value={ph.progress} /></div>)}</div>
          </Card>
        </div>
      </div>
    );
  }

  /* ===== Cán bộ kỹ thuật ===== */
  function SiteTech({ p, go }) {
    const tasks = DB.tasks.filter(t => t.proj === p.id);
    const mine = tasks.filter(t => t.assignee === 'u5' || t.status !== 'done').slice(0, 6);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <Stat label="Công việc phụ trách" icon="tasks" value={tasks.filter(t => t.status !== 'done').length} edge="var(--blue-500)" />
          <Stat label="Chờ nghiệm thu" icon="check-circle" value={tasks.filter(t => t.status === 'review').length} edge="var(--amber-500)" />
          <Stat label="KL hoàn thành tuần" icon="cube" value="5.1" unit="k m³" edge="var(--orange-500)" />
          <Stat label="Nhật ký cần lập" icon="calendar" value="1" edge="var(--red-500)" foot="hôm nay" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <Card title="Công việc đang thực hiện" icon="tasks" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => goTab(go, p, 'cong-viec')}>Tất cả</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Công việc</th><th>Loại</th><th className="num">KL</th><th>Tiến độ</th></tr></thead>
              <tbody>{mine.map(t => <tr key={t.id}><td style={{ fontWeight: 600 }}>{t.name}</td><td><span className="badge badge-gray">{t.type}</span></td><td className="num" style={{ fontSize: 11 }}>{t.calc === 'volume' ? nf(t.doneVol) + '/' + nf(t.planVol) : '—'}</td><td><div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 100 }}><Bar value={t.progress} /><span className="mono" style={{ fontSize: 11 }}>{t.progress}%</span></div></td></tr>)}</tbody>
            </table>
          </Card>
          <Card title="Thao tác nhanh" icon="play">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Lập nhật ký', 'calendar', 'nhat-ky'], ['Cập nhật tiến độ', 'target', 'tien-do'], ['Xem khu vực', 'map-pin', 'khu-vuc'], ['Hồ sơ - Bản vẽ', 'folder', 'ho-so']].map(([l, ic, tab]) =>
                <button key={tab} onClick={() => goTab(go, p, tab)} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', padding: 13, border: '1px solid var(--line)', borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={17} /></span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{l}</span>
                </button>)}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ===== Cán bộ vật tư ===== */
  function SiteMat({ p, go }) {
    const low = DB.materials.filter(m => m.stock <= m.min);
    const drops = DB.drops;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <Stat label="Chuyến vật liệu hôm nay" icon="truck" value={drops.reduce((s, d) => s + d.trips, 0)} unit="chuyến" edge="var(--orange-500)" />
          <Stat label="KL vật liệu đổ" icon="cube" value={nf(drops.reduce((s, d) => s + d.vol, 0))} unit="m³" edge="var(--blue-500)" />
          <Stat label="Vật tư tồn thấp" icon="alert" value={low.length} edge="var(--red-500)" />
          <Stat label="Phiếu kho chờ duyệt" icon="file" value="1" edge="var(--amber-500)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <Card title="Chuyến xe vật liệu hôm nay" icon="qr" color="var(--orange-500)" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => goTab(go, p, 'vat-lieu-do')}>Xem & quét QR</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Giờ</th><th>Biển số</th><th className="num">Chuyến</th><th className="num">m³</th></tr></thead>
              <tbody>{drops.slice(0, 6).map(d => <tr key={d.id}><td className="mono" style={{ fontSize: 11.5 }}>{d.time}</td><td className="mono">{d.plate}</td><td className="num"><b>{d.trips}</b></td><td className="num">{nf(d.vol)}</td></tr>)}</tbody>
            </table>
          </Card>
          <Card title="Vật tư tồn thấp" icon="alert" color="var(--red-500)" pad={0} right={<button className="btn btn-sm btn-ghost" onClick={() => goTab(go, p, 'ton-kho')}>Tồn kho</button>}>
            <table className="tbl tbl-compact"><thead><tr><th>Vật tư</th><th className="num">Tồn</th><th></th></tr></thead>
              <tbody>{low.map(m => <tr key={m.id}><td style={{ fontWeight: 600 }}>{m.name}</td><td className="num">{nf(m.stock, m.stock < 100 ? 1 : 0)} {m.unit}</td><td><span className="badge badge-red">Thấp</span></td></tr>)}
                {low.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 16, color: 'var(--ink-400)' }}>Tồn kho đủ</td></tr>}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    );
  }

  function SiteRoleDash({ role, p, go }) {
    if (role === 'site') return <SiteCmd p={p} go={go} />;
    if (role === 'kt') return <SiteTech p={p} go={go} />;
    if (role === 'exec') return <SiteMat p={p} go={go} />;
    return null;
  }
  window.SiteRoleDash = SiteRoleDash;
})();
