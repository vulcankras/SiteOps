/* Root app — nav state, role, page dispatch → mounts to #root */
(function () {
  const { useState } = React;
  const { Shell, Dashboard, ToastHost, Icon } = window;

  function Coming({ title }) {
    return (
      <div className="page">
        <div className="center" style={{ flexDirection: 'column', gap: 12, padding: '80px 0', color: 'var(--ink-400)' }}>
          <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="grid" size={26} /></div>
          <div style={{ fontWeight: 600, color: 'var(--ink-600)' }}>{title}</div>
          <div style={{ fontSize: 12 }}>Màn hình đang được dựng trong bản demo.</div>
        </div>
      </div>
    );
  }

  function App() {
    const [role, setRole] = useState('pm');
    const [nav, setNav] = useState({ page: 'dashboard' });
    const [mobile, setMobile] = useState(false);
    const [mini, setMini] = useState(false);
    React.useEffect(() => { window.__setMini = setMini; }, []);
    const go = (n) => { if (n.sub !== 'detail') setMini(false); setNav(n); window.scrollTo(0, 0); const c = document.querySelector('.content'); if (c) c.scrollTop = 0; };

    if (mobile && window.MobileApp) return <><window.MobileApp onExit={() => setMobile(false)} /><ToastHost /></>;

    let page;
    const P = window;
    switch (nav.page) {
      case 'dashboard': page = <Dashboard go={go} />; break;
      case 'cong-truong': page = P.CongTruong ? <P.CongTruong nav={nav} go={go} role={role} /> : <Coming title="Công trường" />; break;
      case 'cong-viec': page = P.CongViec ? <P.CongViec go={go} /> : <Coming title="Công việc" />; break;
      case 'khach-hang': page = P.KhachHang ? <P.KhachHang /> : <Coming title="Khách hàng" />; break;
      case 'doi-tac': page = P.DoiTac ? <P.DoiTac /> : <Coming title="Đối tác" />; break;
      case 'danh-muc': page = P.DanhMuc ? <P.DanhMuc /> : <Coming title="Danh mục" />; break;
      case 'bao-cao': page = P.BaoCao ? <P.BaoCao /> : <Coming title="Báo cáo tổng hợp" />; break;
      case 'cai-dat': page = P.CaiDat ? <P.CaiDat /> : <Coming title="Cài đặt hệ thống" />; break;
      default:
        if (nav.page.startsWith('kho')) { page = P.Kho ? <P.Kho nav={nav} go={go} /> : <Coming title="Kho hàng" />; }
        else if (nav.page.startsWith('hrm')) { page = P.HRM ? <P.HRM nav={nav} go={go} /> : <Coming title="Nhân sự" />; }
        else page = <Coming title={nav.page} />;
    }

    return (
      <>
        <Shell nav={nav} go={go} role={role} setRole={setRole} mini={mini} onMobile={() => setMobile(true)}>
          {page}
        </Shell>
        <ToastHost />
      </>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
