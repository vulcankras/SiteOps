/* Bộ luật phân quyền trung tâm (thực thi RBAC lên sidebar + tab) → window.PERM */
(function () {
  const PERM = {
    roles: [
      { id: 'pm', name: 'Quản lý dự án', sub: 'Khối Văn phòng / BGĐ' },
      { id: 'site', name: 'Chỉ huy trực tiếp', sub: 'Tại công trường' },
      { id: 'watch', name: 'Người theo dõi', sub: 'P. Kế toán / Kế hoạch KT' },
      { id: 'exec', name: 'Cán bộ vật tư', sub: 'Vật tư / Kho hiện trường' },
      { id: 'kt', name: 'Cán bộ kỹ thuật', sub: 'P. Kế hoạch kỹ thuật' },
      { id: 'wh', name: 'Thủ kho', sub: 'Kho hàng' },
      { id: 'acc', name: 'Kế toán', sub: 'P. Kế toán' },
    ],
    // module ids = id NAV (top-level + submenu)
    nav: {
      pm: ['*'],
      site: ['dashboard', 'cong-truong', 'cong-viec', 'kho-dashboard', 'kho-nhap', 'kho-xuat', 'kho-kiem', 'kho-thiet-bi', 'kho-vat-tu', 'kho-sua-chua', 'kho-ton', 'kho-canh-bao', 'hrm-cham-cong', 'hrm-cong-may', 'hrm-don-tu', 'danh-muc', 'bao-cao'],
      watch: ['dashboard', 'cong-truong', 'cong-viec', 'kho-ton', 'kho-bao-cao', 'bao-cao', 'doi-tac'],
      exec: ['dashboard', 'cong-truong', 'kho-nhap', 'kho-xuat', 'kho-thiet-bi', 'kho-vat-tu', 'kho-ton'],
      kt: ['dashboard', 'cong-truong', 'cong-viec'],
      wh: ['dashboard', 'kho-dashboard', 'kho-nhap', 'kho-xuat', 'kho-kiem', 'kho-thiet-bi', 'kho-vat-tu', 'kho-sua-chua', 'kho-ton', 'kho-list', 'kho-bao-cao', 'kho-canh-bao', 'doi-tac', 'khach-hang', 'danh-muc'],
      acc: ['dashboard', 'kho-ton', 'hrm-luong', 'bao-cao', 'doi-tac', 'khach-hang', 'danh-muc'],
    },
    // project detail tab ids
    tabs: {
      pm: ['*'],
      site: ['tong-quan', 'cong-viec', 'tien-do', 'khu-vuc', 'nhat-ky', 'vat-lieu-do', 'thiet-bi', 'ton-kho', 'nhan-su', 'tai-chinh', 'bao-cao', 'canh-bao', 'ho-so'],
      watch: ['tong-quan', 'cong-viec', 'tien-do', 'khu-vuc', 'nhat-ky', 'vat-lieu-do', 'thiet-bi', 'ton-kho', 'nhan-su', 'goi-thau', 'tai-chinh', 'bao-cao', 'canh-bao', 'ho-so'],
      exec: ['tong-quan', 'vat-lieu-do', 'thiet-bi', 'ton-kho', 'ho-so'],
      kt: ['tong-quan', 'cong-viec', 'tien-do', 'khu-vuc', 'nhat-ky', 'canh-bao', 'ho-so'],
      wh: ['tong-quan', 'thiet-bi', 'ton-kho', 'vat-lieu-do', 'ho-so'],
      acc: ['tong-quan', 'goi-thau', 'tai-chinh', 'nhan-su', 'bao-cao', 'ho-so'],
    },
    canNav(role, id) { const a = this.nav[role] || ['*']; return a[0] === '*' || a.includes(id); },
    canTab(role, id) { const a = this.tabs[role] || ['*']; return a[0] === '*' || a.includes(id); },
  };
  window.PERM = PERM;
})();
