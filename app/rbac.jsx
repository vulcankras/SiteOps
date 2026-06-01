/* Phân quyền RBAC — Vai trò × Module × Hành động → window.RBAC */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Avatar, AvatarStack, toast } = window;

  /* nhóm module & module con */
  const GROUPS = [
    { g: 'Tổng quan', items: [['dashboard', 'Dashboard'], ['bao-cao', 'Báo cáo tổng hợp']] },
    { g: 'Công trường', items: [['cong-truong', 'Công trường / Dự án'], ['cong-viec', 'Công việc'], ['tien-do', 'Tiến độ'], ['nhat-ky', 'Nhật ký hàng ngày'], ['vat-lieu-do', 'Vật liệu đổ'], ['goi-thau', 'Gói thầu'], ['tai-chinh', 'Tài chính CT']] },
    { g: 'Kho hàng', items: [['kho-nhap', 'Nhập kho'], ['kho-xuat', 'Xuất kho'], ['kho-ton', 'Tồn kho'], ['kho-kiem', 'Kiểm kho'], ['kho-thiet-bi', 'Thiết bị'], ['kho-vat-tu', 'Vật tư'], ['kho-sua-chua', 'Sửa chữa & Bảo trì']] },
    { g: 'Nhân sự (HRM)', items: [['hrm-cham-cong', 'Chấm công GPS'], ['hrm-cong-may', 'Công nhật & Ca máy'], ['hrm-luong', 'Bảng lương'], ['hrm-list', 'Hồ sơ nhân sự']] },
    { g: 'Đối tác & Danh mục', items: [['khach-hang', 'Khách hàng'], ['doi-tac', 'Đối tác'], ['danh-muc', 'Danh mục']] },
    { g: 'Hệ thống', items: [['cai-dat', 'Cài đặt hệ thống'], ['phan-quyen', 'Phân quyền']] },
  ];
  const ACTIONS = [['view', 'Xem'], ['create', 'Tạo'], ['edit', 'Sửa'], ['delete', 'Xoá'], ['approve', 'Duyệt'], ['export', 'Xuất']];

  const EXTRA = [
    { id: 'wh', name: 'Thủ kho', sub: 'Kho hàng', desc: 'Quản lý nhập/xuất/tồn kho, thiết bị, vật tư.', system: false },
    { id: 'acc', name: 'Kế toán', sub: 'P. Kế toán', desc: 'Tài chính, lương, công nợ, báo cáo.', system: false },
  ];
  const ROLES = [...DB.roles.map(r => ({ ...r, system: true })), ...EXTRA];
  const MEMBERS = { pm: ['u1'], site: ['u4', 'u5'], watch: ['u2'], exec: ['u3', 'u6', 'u7', 'u8'], wh: ['u9', 'u8'], acc: ['u2', 'u11'] };

  /* quyền mặc định theo vai trò */
  const KHO = ['kho-nhap', 'kho-xuat', 'kho-ton', 'kho-kiem', 'kho-thiet-bi', 'kho-vat-tu', 'kho-sua-chua'];
  const FIELD = ['cong-viec', 'tien-do', 'nhat-ky', 'vat-lieu-do'];
  const def = (role, mid) => {
    const P = (v, c, e, d, a, x) => ({ view: v, create: c, edit: e, delete: d, approve: a, export: x });
    const none = P(false, false, false, false, false, false);
    switch (role) {
      case 'pm': // Quản lý dự án (văn phòng) — xem tất cả, không sửa/xoá
        return mid === 'phan-quyen' ? none : P(true, false, false, false, false, true);
      case 'site': // Chỉ huy trực tiếp — quản lý tất cả trừ Gói thầu & phân quyền
        if (mid === 'goi-thau' || mid === 'phan-quyen' || mid === 'cai-dat') return none;
        return P(true, true, true, false, true, true);
      case 'watch': // Người theo dõi — KT/KH kỹ thuật, chỉ xem
        if (['phan-quyen', 'cai-dat'].includes(mid)) return none;
        return P(true, false, false, false, false, true);
      case 'exec': // Người thực hiện — nhập liệu phần được giao
        if ([...FIELD, ...KHO, 'cong-truong'].includes(mid)) return P(true, true, true, false, false, false);
        if (mid === 'dashboard') return P(true, false, false, false, false, false);
        return none;
      case 'wh': // Thủ kho
        if (KHO.includes(mid)) return P(true, true, true, true, true, true);
        if (['dashboard', 'cong-truong', 'doi-tac', 'danh-muc'].includes(mid)) return P(true, false, false, false, false, true);
        return none;
      case 'acc': // Kế toán
        if (['tai-chinh', 'hrm-luong', 'bao-cao', 'doi-tac', 'khach-hang'].includes(mid)) return P(true, true, true, false, true, true);
        if (['goi-thau', 'dashboard', 'kho-ton', 'danh-muc'].includes(mid)) return P(true, false, false, false, false, true);
        return none;
      default: return none;
    }
  };

  function RBAC() {
    const [sel, setSel] = useState('pm');
    const role = ROLES.find(r => r.id === sel);
    // perms state for selected role
    const buildPerms = (rid) => { const o = {}; GROUPS.forEach(g => g.items.forEach(([mid]) => { o[mid] = def(rid, mid); })); return o; };
    const [permsByRole, setPermsByRole] = useState(() => { const all = {}; ROLES.forEach(r => { all[r.id] = buildPerms(r.id); }); return all; });
    const perms = permsByRole[sel];

    const toggle = (mid, act) => setPermsByRole(s => ({ ...s, [sel]: { ...s[sel], [mid]: { ...s[sel][mid], [act]: !s[sel][mid][act] } } }));
    const toggleRow = (mid, on) => setPermsByRole(s => ({ ...s, [sel]: { ...s[sel], [mid]: Object.fromEntries(ACTIONS.map(([a]) => [a, on])) } }));
    const count = (rid) => { let c = 0; const pp = permsByRole[rid]; Object.values(pp).forEach(m => ACTIONS.forEach(([a]) => { if (m[a]) c++; })); return c; };

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 16, alignItems: 'start' }}>
        {/* roles list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head"><div className="card-title"><Icon name="shield-check" size={15} style={{ color: 'var(--blue-600)' }} />Vai trò</div></div>
          <div style={{ padding: 8 }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setSel(r.id)} style={{ display: 'block', width: '100%', textAlign: 'left', border: '1px solid ' + (sel === r.id ? 'var(--blue-500)' : 'transparent'), background: sel === r.id ? 'var(--blue-50)' : 'transparent', borderRadius: 8, padding: '9px 10px', marginBottom: 4, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 12.5 }}>{r.name}</span>
                  {r.system ? <span className="badge badge-gray" style={{ fontSize: 9 }}>Hệ thống</span> : <span className="badge badge-violet" style={{ fontSize: 9 }}>Tuỳ chỉnh</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <AvatarStack ids={MEMBERS[r.id] || []} max={4} />
                  <span className="muted" style={{ fontSize: 10.5 }}>{count(r.id)} quyền</span>
                </div>
              </button>
            ))}
            <button className="btn btn-sm" style={{ width: '100%', marginTop: 6 }} onClick={() => toast('Mở form tạo vai trò mới (demo)')}><Icon name="plus" size={13} />Tạo vai trò mới</button>
          </div>
        </div>

        {/* matrix */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head">
            <div><div className="card-title">{role.name}</div><div className="card-sub">{role.desc}</div></div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-blue"><Icon name="users" size={11} />{(MEMBERS[sel] || []).length} thành viên</span>
              <button className="btn btn-sm btn-primary" onClick={() => toast('Đã lưu phân quyền cho vai trò ' + role.name)}><Icon name="save" size={13} />Lưu</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl tbl-compact" style={{ minWidth: 640 }}>
              <thead><tr>
                <th style={{ minWidth: 200 }}>Module / Chức năng</th>
                {ACTIONS.map(([a, l]) => <th key={a} className="num" style={{ textAlign: 'center' }}>{l}</th>)}
                <th style={{ textAlign: 'center' }}>Tất cả</th>
              </tr></thead>
              <tbody>
                {GROUPS.map(grp => (
                  <React.Fragment key={grp.g}>
                    <tr style={{ background: 'var(--surface-2)' }}><td colSpan={ACTIONS.length + 2} style={{ fontWeight: 700, fontSize: 11, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{grp.g}</td></tr>
                    {grp.items.map(([mid, label]) => {
                      const m = perms[mid]; const allOn = ACTIONS.every(([a]) => m[a]);
                      return (
                        <tr key={mid}>
                          <td style={{ fontWeight: 500 }}>{label}</td>
                          {ACTIONS.map(([a]) => (
                            <td key={a} style={{ textAlign: 'center' }}>
                              <button onClick={() => toggle(mid, a)} title={a} style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid ' + (m[a] ? 'var(--blue-500)' : 'var(--line)'), background: m[a] ? 'var(--blue-600)' : '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                {m[a] && <Icon name="check" size={13} style={{ color: '#fff' }} />}
                              </button>
                            </td>
                          ))}
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => toggleRow(mid, !allOn)} style={{ fontSize: 10.5, border: '1px solid var(--line)', borderRadius: 5, background: '#fff', padding: '2px 7px', cursor: 'pointer', color: 'var(--ink-600)' }}>{allOn ? 'Bỏ' : 'Chọn'}</button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  window.RBAC = RBAC;
})();
