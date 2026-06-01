/* App shell: sidebar + topbar + role switcher → window.Shell, window.NAV */
(function () {
  const { useState } = React;
  const Icon = window.Icon, DB = window.DB, Menu = window.Menu;

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'cong-truong', label: 'Công trường', icon: 'road' },
    { id: 'cong-viec', label: 'Công việc', icon: 'tasks' },
    { id: 'kho', label: 'Kho hàng', icon: 'warehouse', subs: [
      { id: 'kho-dashboard', label: 'Dashboard kho' },
      { id: 'kho-nhap', label: 'Nhập kho' },
      { id: 'kho-xuat', label: 'Xuất kho' },
      { id: 'kho-kiem', label: 'Kiểm kho' },
      { id: 'kho-thiet-bi', label: 'Thiết bị' },
      { id: 'kho-vat-tu', label: 'Vật tư' },
      { id: 'kho-sua-chua', label: 'Sửa chữa & Bảo trì' },
      { id: 'kho-ton', label: 'Tồn kho' },
      { id: 'kho-list', label: 'Danh sách kho' },
      { id: 'kho-bao-cao', label: 'Báo cáo kho' },
      { id: 'kho-canh-bao', label: 'Cảnh báo' },
    ] },
    { id: 'nhan-su', label: 'Nhân sự (HRM)', icon: 'users', subs: [
      { id: 'hrm-cham-cong', label: 'Chấm công GPS' },
      { id: 'hrm-cong-may', label: 'Công nhật & Ca máy' },
      { id: 'hrm-luong', label: 'Bảng lương' },
      { id: 'hrm-list', label: 'Hồ sơ nhân sự' },
      { id: 'hrm-don-tu', label: 'Đơn từ & Tăng ca' },
    ] },
    { id: 'khach-hang', label: 'Khách hàng', icon: 'customer' },
    { id: 'doi-tac', label: 'Đối tác', icon: 'partner' },
    { id: 'danh-muc', label: 'Danh mục', icon: 'category' },
    { sep: true },
    { id: 'bao-cao', label: 'Báo cáo tổng hợp', icon: 'report' },
    { id: 'cai-dat', label: 'Cài đặt hệ thống', icon: 'settings' },
  ];

  function Sidebar({ nav, go, mini }) {
    const [open, setOpen] = useState({ kho: false, 'nhan-su': false });
    const topId = nav.page;
    const W = mini ? 60 : 'var(--sidebar-w)';
    return (
      <aside style={{ width: W, background: 'var(--blue-900)', color: '#cdd9e4', display: 'flex', flexDirection: 'column', flex: 'none', position: 'sticky', top: 0, height: '100vh', transition: 'width .16s' }}>
        {/* logo */}
        <div style={{ height: 'var(--topbar-h)', display: 'flex', alignItems: 'center', gap: 10, padding: mini ? '0' : '0 16px', justifyContent: mini ? 'center' : 'flex-start', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,var(--orange-500),var(--orange-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flex: 'none' }}><Icon name="road" size={17} /></div>
          {!mini && <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 13.5, letterSpacing: '.01em' }}>SiteOps</div>
            <div style={{ fontSize: 10, color: '#7f99b0', fontWeight: 500 }}>Quản lý công trường số</div>
          </div>}
        </div>
        {/* nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: mini ? '10px 6px' : '10px 8px' }}>
          {NAV.map((n, i) => {
            if (n.sep) return <div key={i} style={{ height: 1, background: 'rgba(255,255,255,.08)', margin: mini ? '10px 6px' : '10px 8px' }} />;
            const active = topId === n.id || (n.subs && n.subs.some(s => s.id === topId));
            const isOpen = open[n.id];
            if (mini) {
              return (
                <button key={n.id} title={n.label} onClick={() => go({ page: n.subs ? n.subs[0].id : n.id })}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 40, margin: '0 auto 3px', border: 0, background: active ? 'var(--blue-600)' : 'transparent', color: active ? '#fff' : '#aebfce', borderRadius: 8, cursor: 'pointer' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <Icon name={n.icon} size={18} />
                </button>
              );
            }
            return (
              <div key={n.id}>
                <button onClick={() => { if (n.subs) { setOpen(o => ({ ...o, [n.id]: !o[n.id] })); } else go({ page: n.id }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 0, background: active && !n.subs ? 'var(--blue-600)' : 'transparent', color: active ? '#fff' : '#aebfce', padding: '8px 10px', borderRadius: 6, fontSize: 12.5, fontWeight: active ? 600 : 500, marginBottom: 2, textAlign: 'left' }}
                  onMouseEnter={e => { if (!(active && !n.subs)) e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
                  onMouseLeave={e => { if (!(active && !n.subs)) e.currentTarget.style.background = 'transparent'; }}>
                  <Icon name={n.icon} size={16} />
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {n.subs && <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={13} />}
                </button>
                {n.subs && isOpen && (
                  <div style={{ margin: '2px 0 6px 0', paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,.1)', marginLeft: 18 }}>
                    {n.subs.map(s => {
                      const sa = topId === s.id;
                      return <button key={s.id} onClick={() => go({ page: s.id })}
                        style={{ display: 'block', width: '100%', border: 0, background: sa ? 'rgba(255,255,255,.1)' : 'transparent', color: sa ? '#fff' : '#9fb2c4', padding: '6px 10px', borderRadius: 5, fontSize: 12, fontWeight: sa ? 600 : 500, marginBottom: 1, textAlign: 'left' }}
                        onMouseEnter={e => { if (!sa) e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { if (!sa) e.currentTarget.style.color = '#9fb2c4'; }}>{s.label}</button>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        {/* footer */}
        <div style={{ padding: mini ? '10px 0' : '10px 14px', borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 10.5, color: '#6b859c', display: 'flex', justifyContent: mini ? 'center' : 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green-500)' }} />{!mini && 'Hệ thống hoạt động · v1.0'}</div>
        </div>
      </aside>
    );
  }

  function Topbar({ role, setRole, go, onMobile, onAlerts, alertCount }) {
    return (
      <header style={{ height: 'var(--topbar-h)', background: '#fff', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ position: 'relative', width: 340, maxWidth: '32vw' }}>
          <Icon name="search" size={15} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--ink-400)' }} />
          <input className="input" style={{ paddingLeft: 32, height: 34, background: 'var(--surface-2)', border: '1px solid var(--line-soft)' }} placeholder="Tìm dự án, thiết bị, vật tư, mã phiếu…" />
          <kbd style={{ position: 'absolute', right: 8, top: 8, fontSize: 10, color: 'var(--ink-400)', background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: '1px 5px' }}>⌘K</kbd>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-sm" onClick={onMobile} style={{ gap: 6 }}><Icon name="qr" size={15} />Chế độ hiện trường</button>
        {/* role switcher */}
        <Menu align="right" trigger={
          <button className="btn btn-sm" style={{ gap: 7, borderColor: 'var(--blue-200)', background: 'var(--blue-50)', color: 'var(--blue-700)' }}>
            <Icon name="shield-check" size={14} />Vai trò: <b style={{ fontWeight: 700 }}>{DB.roles.find(r => r.id === role).name}</b>
            <Icon name="chevron-down" size={13} />
          </button>
        } items={DB.roles.map(r => ({ label: r.name + ' — ' + r.sub, icon: role === r.id ? 'check' : 'shield-check', onClick: () => setRole(r.id) }))} />
        <button className="btn btn-icon btn-sm btn-ghost" onClick={onAlerts} style={{ position: 'relative' }}>
          <Icon name="bell" size={17} />
          {alertCount > 0 && <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 15, height: 15, background: 'var(--red-500)', color: '#fff', borderRadius: 8, fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{alertCount}</span>}
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--line)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <window.Avatar id="u1" />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: 12.5 }}>Nguyễn Văn An</div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>Giám đốc dự án</div>
          </div>
        </div>
      </header>
    );
  }

  function Shell({ nav, go, role, setRole, onMobile, mini, children }) {
    const [alertsOpen, setAlertsOpen] = useState(false);
    return (
      <div className="app">
        <Sidebar nav={nav} go={go} mini={mini} />
        <div className="main">
          <Topbar role={role} setRole={setRole} go={go} onMobile={onMobile} alertCount={DB.alerts.length} onAlerts={() => setAlertsOpen(o => !o)} />
          <div className="content">{children}</div>
        </div>
        {alertsOpen && <AlertPanel onClose={() => setAlertsOpen(false)} />}
      </div>
    );
  }

  function AlertPanel({ onClose }) {
    const tone = { red: 'var(--red-500)', amber: 'var(--amber-500)' };
    return (
      <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose} />
        <div className="pop-in" style={{ position: 'fixed', top: 'calc(var(--topbar-h) + 6px)', right: 16, width: 360, background: '#fff', border: '1px solid var(--line)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden' }}>
          <div style={{ padding: '12px 15px', borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 13 }}>Cảnh báo & Thông báo</b>
            <span className="badge badge-red">{DB.alerts.length} mới</span>
          </div>
          <div style={{ maxHeight: 420, overflow: 'auto' }}>
            {DB.alerts.map(a => (
              <div key={a.id} style={{ display: 'flex', gap: 11, padding: '11px 15px', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: a.level === 'red' ? 'var(--red-100)' : 'var(--amber-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tone[a.level], flex: 'none' }}><Icon name={a.icon} size={15} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{a.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-600)', marginTop: 1 }}>{a.desc}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-400)', marginTop: 3 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 10, textAlign: 'center' }}><button className="btn btn-sm btn-ghost" style={{ width: '100%' }}>Xem tất cả cảnh báo</button></div>
        </div>
      </>
    );
  }

  Object.assign(window, { Shell, NAV });
})();
