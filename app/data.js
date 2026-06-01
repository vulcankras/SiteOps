/* ============================================================
   NAM HẢI — Mock data, grounded in the real attached documents.
   Công trình chính: Cao tốc Hữu Nghị – Chi Lăng.
   Exposed as window.DB.
   ============================================================ */
(function () {
  const av = (name) => {
    const parts = name.trim().split(/\s+/);
    return (parts[parts.length - 2]?.[0] || '') + (parts[parts.length - 1]?.[0] || '');
  };
  const palette = ['#1D5E8C','#E2540C','#1E8A4C','#6D5BD0','#11888A','#C98A06','#C5372C','#2876AE'];
  const colorFor = (s) => palette[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];

  /* ---------------- Roles ---------------- */
  const roles = [
    { id: 'pm',    name: 'Quản lý dự án',      sub: 'Khối Văn phòng', desc: 'Xem toàn bộ công trường, không sửa/xoá.', tabs: 'all' },
    { id: 'site',  name: 'Chỉ huy trực tiếp',  sub: 'Tại công trường', desc: 'Quản lý mọi thứ, KHÔNG xem Gói thầu.', tabs: 'no-bid' },
    { id: 'watch', name: 'Người theo dõi',     sub: 'P. Kế toán / Kế hoạch KT', desc: 'Chỉ xem thông tin tại công trường.', tabs: 'watch' },
    { id: 'exec',  name: 'Người thực hiện',    sub: 'Cán bộ vật tư / TB / KT', desc: 'Thực hiện & nhập liệu phần được giao.', tabs: 'exec' },
  ];

  /* ---------------- People ---------------- */
  const P = (id, name, title, dept, phone) => ({ id, name, title, dept, phone, initials: av(name), color: colorFor(name) });
  const people = [
    P('u1', 'Nguyễn Văn An', 'Giám đốc dự án', 'Ban điều hành', '0912 345 678'),
    P('u2', 'Lê Thị Bình', 'Kế toán công trình', 'P. Kế toán', '0987 112 233'),
    P('u3', 'Hoàng Văn Hải', 'Thợ lái máy chính', 'Đội cơ giới', '0934 556 778'),
    P('u4', 'Trần Văn Cường', 'Chỉ huy trưởng', 'BCH công trường', '0905 221 144'),
    P('u5', 'Phạm Minh Đức', 'Cán bộ kỹ thuật', 'P. Kế hoạch KT', '0978 443 221'),
    P('u6', 'Lăng Văn Hùng', 'Thợ lái Lu', 'Đội cơ giới', '0961 778 990'),
    P('u7', 'Hà Văn Vinh', 'Thợ lái Lu', 'Đội cơ giới', '0932 665 441'),
    P('u8', 'Đỗ Thị Mai', 'Cán bộ vật tư', 'Kho công trường', '0918 334 556'),
    P('u9', 'Vũ Quang Trung', 'QL thiết bị', 'Đội cơ giới', '0903 887 221'),
    P('u10','Bùi Văn Khoa', 'Lái xe Howo', 'Đội vận tải', '0946 112 889'),
    P('u11','Ngô Thị Lan', 'Nhân sự - C&B', 'P. Hành chính NS', '0967 553 118'),
    P('u12','Đặng Văn Sơn', 'Thợ sửa chữa', 'Xưởng cơ khí', '0925 447 663'),
  ];
  const byId = Object.fromEntries(people.map(p => [p.id, p]));

  /* ---------------- Project templates (dynamic config) ---------------- */
  const templates = [
    {
      id: 'road', name: 'Dự án Làm đường', icon: 'road', color: '#E2540C', popular: true,
      desc: 'Thi công tuyến đường, cao tốc. Quản lý theo lý trình Km, khối lượng đào/đắp.',
      progress: 'volume', // theo khối lượng
      modules: ['cong-viec','khu-vuc','nhat-ky','vat-lieu-do','thiet-bi','ton-kho','nhan-su','goi-thau','tai-chinh','bao-cao','ho-so'],
      fields: [
        { k: 'route_name', label: 'Tên tuyến', type: 'text', req: true },
        { k: 'km_start', label: 'Lý trình bắt đầu', type: 'text', req: true, hint: 'VD: Km0+000' },
        { k: 'km_end', label: 'Lý trình kết thúc', type: 'text', req: true, hint: 'VD: Km43+500' },
        { k: 'length', label: 'Tổng chiều dài (m)', type: 'number', req: true },
        { k: 'roadbed', label: 'Bề rộng nền (m)', type: 'number' },
        { k: 'design_vol', label: 'KL đắp thiết kế (m³)', type: 'number' },
      ],
    },
    {
      id: 'house', name: 'Dự án Xây nhà', icon: 'building', color: '#1D5E8C',
      desc: 'Công trình dân dụng, nhà cao tầng. Quản lý theo tầng/hạng mục, tỷ trọng công việc.',
      progress: 'weighted', // tỷ trọng
      modules: ['cong-viec','nhan-su','thiet-bi','vat-tu','tai-chinh','nhat-ky','bao-cao','ho-so'],
      fields: [
        { k: 'floors', label: 'Số tầng', type: 'number', req: true },
        { k: 'area', label: 'Tổng diện tích sàn (m²)', type: 'number', req: true },
        { k: 'structure', label: 'Kết cấu', type: 'select', opts: ['Bê tông cốt thép','Khung thép','Hỗn hợp'] },
      ],
    },
    {
      id: 'bridge', name: 'Dự án Cầu', icon: 'bridge', color: '#11888A',
      desc: 'Cầu vượt, cầu sông. Quản lý theo trụ/nhịp, tiến độ %.',
      progress: 'percent',
      modules: ['cong-viec','khu-vuc','nhan-su','thiet-bi','vat-tu','tai-chinh','bao-cao'],
      fields: [
        { k: 'span', label: 'Tổng chiều dài cầu (m)', type: 'number', req: true },
        { k: 'piers', label: 'Số trụ', type: 'number' },
      ],
    },
    {
      id: 'infra', name: 'Hạ tầng kỹ thuật', icon: 'grid', color: '#6D5BD0',
      desc: 'San nền, thoát nước, hạ tầng khu đô thị/KCN.',
      progress: 'volume',
      modules: ['cong-viec','khu-vuc','nhan-su','thiet-bi','vat-tu','nhat-ky','bao-cao'],
      fields: [ { k: 'area', label: 'Diện tích (ha)', type: 'number', req: true } ],
    },
  ];

  /* ---------------- Projects ---------------- */
  const projects = [
    {
      id: 'p1', code: 'CT-2026-001', name: 'Cao tốc Hữu Nghị – Chi Lăng',
      template: 'road', status: 'active', progress: 62,
      location: 'Đồng Đăng, Lạng Sơn', client: 'Tập đoàn Đèo Cả',
      manager: 'u1', commander: 'u4', start: '2025-08-01', end: '2026-12-30',
      contractValue: 1840000, spent: 1086000, // triệu VND
      meta: { route_name: 'Cao tốc Bắc Giang – Lạng Sơn (đoạn HN-CL)', km_start: 'Km1+000', km_end: 'Km43+500', length: 42500, roadbed: 24, design_vol: 2850000 },
      teamCount: 86, equipCount: 24, taskDone: 28, taskTotal: 45,
    },
    {
      id: 'p2', code: 'CT-2026-002', name: 'Đường vành đai KCN Đồng Văn',
      template: 'road', status: 'active', progress: 34,
      location: 'Duy Tiên, Hà Nam', client: 'BQL KCN Đồng Văn',
      manager: 'u1', commander: 'u5', start: '2026-01-15', end: '2026-11-30',
      contractValue: 720000, spent: 244000,
      meta: { route_name: 'Vành đai KCN Đồng Văn IV', km_start: 'Km0+000', km_end: 'Km12+200', length: 12200, roadbed: 18, design_vol: 640000 },
      teamCount: 42, equipCount: 11, taskDone: 9, taskTotal: 26,
    },
    {
      id: 'p3', code: 'CT-2025-014', name: 'Cầu vượt Nút giao IC3',
      template: 'bridge', status: 'active', progress: 78,
      location: 'TP. Lạng Sơn', client: 'Sở GTVT Lạng Sơn',
      manager: 'u1', commander: 'u4', start: '2025-05-01', end: '2026-08-15',
      contractValue: 410000, spent: 318000,
      meta: { span: 320, piers: 6 },
      teamCount: 31, equipCount: 8, taskDone: 18, taskTotal: 23,
    },
    {
      id: 'p4', code: 'CT-2025-009', name: 'Nhà điều hành Nam Hải Group',
      template: 'house', status: 'paused', progress: 45,
      location: 'TP. Bắc Giang', client: 'Nội bộ Nam Hải',
      manager: 'u1', commander: 'u5', start: '2025-09-10', end: '2026-10-01',
      contractValue: 96000, spent: 41000,
      meta: { floors: 9, area: 6400, structure: 'Bê tông cốt thép' },
      teamCount: 24, equipCount: 4, taskDone: 12, taskTotal: 28,
    },
  ];

  /* ---------------- Phases (giai đoạn) ---------------- */
  const phases = [
    { id: 'ph1', proj: 'p1', name: 'GĐ1 — Dọn dẹp mặt bằng', start: '2025-08-01', end: '2025-10-15', progress: 100 },
    { id: 'ph2', proj: 'p1', name: 'GĐ2 — Đào & đắp nền đường', start: '2025-10-16', end: '2026-06-30', progress: 68 },
    { id: 'ph3', proj: 'p1', name: 'GĐ3 — Móng & mặt đường', start: '2026-05-01', end: '2026-11-15', progress: 18 },
    { id: 'ph4', proj: 'p1', name: 'GĐ4 — Hoàn thiện & ATGT', start: '2026-10-01', end: '2026-12-30', progress: 0 },
    { id: 'ph5', proj: 'p2', name: 'GĐ1 — Chuẩn bị & dọn mặt bằng', start: '2026-01-15', end: '2026-03-31', progress: 100 },
    { id: 'ph6', proj: 'p2', name: 'GĐ2 — Đào đắp nền đường', start: '2026-03-15', end: '2026-09-30', progress: 38 },
    { id: 'ph7', proj: 'p2', name: 'GĐ3 — Móng & mặt đường', start: '2026-09-01', end: '2026-11-30', progress: 0 },
  ];

  /* ---------------- Areas (khu vực thi công - Km) ---------------- */
  const areas = [
    { id: 'kv1', proj: 'p1', code: 'KV-001', name: 'Đoạn nền Km3+000 ~ Km4+500', kmS: 'Km3+000', kmE: 'Km4+500', len: 1500, mgr: 'u4', status: 'done', progress: 100 },
    { id: 'kv2', proj: 'p1', code: 'KV-002', name: 'Đoạn nền Km4+500 ~ Km7+800', kmS: 'Km4+500', kmE: 'Km7+800', len: 3300, mgr: 'u4', status: 'active', progress: 64 },
    { id: 'kv3', proj: 'p1', code: 'KV-003', name: 'Nút giao IC3 (Km7+800)', kmS: 'Km7+800', kmE: 'Km8+200', len: 400, mgr: 'u5', status: 'active', progress: 41 },
    { id: 'kv4', proj: 'p1', code: 'KV-004', name: 'Đoạn nền Km8+200 ~ Km12+000', kmS: 'Km8+200', kmE: 'Km12+000', len: 3800, mgr: 'u5', status: 'active', progress: 22 },
    { id: 'kv5', proj: 'p1', code: 'KV-005', name: 'Cầu vượt sông Km14+300', kmS: 'Km14+300', kmE: 'Km14+650', len: 350, mgr: 'u4', status: 'paused', progress: 8 },
    { id: 'kv6', proj: 'p1', code: 'KV-006', name: 'Đoạn nền Km15+000 ~ Km19+500', kmS: 'Km15+000', kmE: 'Km19+500', len: 4500, mgr: 'u4', status: 'pending', progress: 0 },
    { id: 'kv7', proj: 'p2', code: 'KV-001', name: 'Đoạn Km0+000 ~ Km4+000', kmS: 'Km0+000', kmE: 'Km4+000', len: 4000, mgr: 'u5', status: 'done', progress: 100 },
    { id: 'kv8', proj: 'p2', code: 'KV-002', name: 'Đoạn Km4+000 ~ Km8+500', kmS: 'Km4+000', kmE: 'Km8+500', len: 4500, mgr: 'u5', status: 'active', progress: 46 },
    { id: 'kv9', proj: 'p2', code: 'KV-003', name: 'Đoạn Km8+500 ~ Km12+200', kmS: 'Km8+500', kmE: 'Km12+200', len: 3700, mgr: 'u5', status: 'pending', progress: 0 },
  ];

  /* ---------------- Tasks (công việc cha-con) ---------------- */
  const tasks = [
    { id: 't1', proj: 'p1', code: 'CV-202602-001', name: 'Đào & đắp nền đường Km4–Km7', parent: null, area: 'kv2', phase: 'ph2', type: 'Đắp đất', assignee: 'u4', status: 'doing', progress: 64, calc: 'volume', planVol: 320000, doneVol: 204800, unit: 'm³', start: '2025-11-01', end: '2026-06-30' },
    { id: 't2', proj: 'p1', code: 'CV-202602-002', name: 'Đào hữu cơ, bóc phong hoá', parent: 't1', area: 'kv2', phase: 'ph2', type: 'Đào đất', assignee: 'u3', status: 'done', progress: 100, calc: 'volume', planVol: 45000, doneVol: 45000, unit: 'm³', start: '2025-11-01', end: '2025-12-10' },
    { id: 't3', proj: 'p1', code: 'CV-202602-003', name: 'Đắp đất K95 lớp 1-4', parent: 't1', area: 'kv2', phase: 'ph2', type: 'Đắp đất', assignee: 'u6', status: 'doing', progress: 72, calc: 'volume', planVol: 180000, doneVol: 129600, unit: 'm³', start: '2025-12-11', end: '2026-04-30' },
    { id: 't4', proj: 'p1', code: 'CV-202602-004', name: 'Lu lèn K98 hoàn thiện nền', parent: 't1', area: 'kv2', phase: 'ph2', type: 'Lu lèn', assignee: 'u7', status: 'doing', progress: 38, calc: 'volume', planVol: 95000, doneVol: 36100, unit: 'm³', start: '2026-03-01', end: '2026-06-30' },
    { id: 't5', proj: 'p1', code: 'CV-202603-005', name: 'Thi công nút giao IC3', parent: null, area: 'kv3', phase: 'ph2', type: 'San nền', assignee: 'u5', status: 'doing', progress: 41, calc: 'percent', planVol: 100, doneVol: 41, unit: '%', start: '2026-02-01', end: '2026-07-15' },
    { id: 't6', proj: 'p1', code: 'CV-202604-006', name: 'Cấp phối đá dăm móng đường', parent: null, area: 'kv1', phase: 'ph3', type: 'Móng đường', assignee: 'u4', status: 'todo', progress: 0, calc: 'volume', planVol: 62000, doneVol: 0, unit: 'm³', start: '2026-05-15', end: '2026-09-30' },
    { id: 't7', proj: 'p1', code: 'CV-202601-007', name: 'Dọn dẹp & bàn giao mặt bằng', parent: null, area: 'kv1', phase: 'ph1', type: 'Chuẩn bị', assignee: 'u4', status: 'done', progress: 100, calc: 'percent', planVol: 100, doneVol: 100, unit: '%', start: '2025-08-01', end: '2025-10-15' },
    { id: 't8', proj: 'p1', code: 'CV-202605-008', name: 'Thi công cống thoát nước Km5+200', parent: null, area: 'kv2', phase: 'ph2', type: 'Thoát nước', assignee: 'u5', status: 'review', progress: 90, calc: 'percent', planVol: 100, doneVol: 90, unit: '%', start: '2026-04-01', end: '2026-05-25' },
    { id: 't9', proj: 'p2', code: 'CV-202602-001', name: 'Đào đắp nền đường Km4–Km8', parent: null, area: 'kv8', phase: 'ph6', type: 'Đắp đất', assignee: 'u5', status: 'doing', progress: 46, calc: 'volume', planVol: 240000, doneVol: 110400, unit: 'm³', start: '2026-03-15', end: '2026-09-30' },
    { id: 't10', proj: 'p2', code: 'CV-202601-002', name: 'Dọn dẹp & bàn giao mặt bằng', parent: null, area: 'kv7', phase: 'ph5', type: 'Chuẩn bị', assignee: 'u5', status: 'done', progress: 100, calc: 'percent', planVol: 100, doneVol: 100, unit: '%', start: '2026-01-15', end: '2026-03-31' },
    { id: 't11', proj: 'p2', code: 'CV-202603-003', name: 'Lu lèn nền K95 đoạn Km4+000', parent: null, area: 'kv8', phase: 'ph6', type: 'Lu lèn', assignee: 'u7', status: 'doing', progress: 30, calc: 'volume', planVol: 64000, doneVol: 19200, unit: 'm³', start: '2026-04-01', end: '2026-08-30' },
    { id: 't12', proj: 'p3', code: 'CV-202601-001', name: 'Thi công trụ cầu T1–T3', parent: null, area: null, phase: null, type: 'Thi công cầu', assignee: 'u4', status: 'doing', progress: 72, calc: 'percent', planVol: 100, doneVol: 72, unit: '%', start: '2025-09-01', end: '2026-06-30' },
    { id: 't13', proj: 'p3', code: 'CV-202604-002', name: 'Lắp dầm nhịp N1–N2', parent: null, area: null, phase: null, type: 'Thi công cầu', assignee: 'u4', status: 'doing', progress: 55, calc: 'percent', planVol: 100, doneVol: 55, unit: '%', start: '2026-03-01', end: '2026-07-31' },
    { id: 't14', proj: 'p4', code: 'CV-202509-001', name: 'Thi công phần thô tầng 1–5', parent: null, area: null, phase: null, type: 'Đổ bê tông', assignee: 'u5', status: 'doing', progress: 60, calc: 'weighted', planVol: 100, doneVol: 60, unit: '%', start: '2025-09-10', end: '2026-05-30' },
    { id: 't15', proj: 'p4', code: 'CV-202602-002', name: 'Xây tô hoàn thiện tầng 1–3', parent: null, area: null, phase: null, type: 'Hoàn thiện', assignee: 'u5', status: 'todo', progress: 0, calc: 'weighted', planVol: 100, doneVol: 0, unit: '%', start: '2026-06-01', end: '2026-09-30' },
  ];

  /* ---------------- Equipment (máy + xe) ---------------- */
  const equipment = [
    { id: 'e1', code: 'TB-M-202508-0012', series: 'CAT320-XYZ-2025', name: 'Máy xúc CAT 320', kind: 'machine', cat: 'Máy xúc bánh xích', brand: 'Caterpillar', model: 'CAT 320', year: 2023, own: 'own', status: 'running', loc: 'p1', locName: 'CT Hữu Nghị – Chi Lăng', driver: 'u3', power: '162 HP', bucket: '1.2 m³', fuel: 'Diesel', hourStart: 1253.5, hourNow: 1612.0, unitPrice: 2850 },
    { id: 'e2', code: 'TB-M-202508-0013', series: 'LU38-KOM-2024', name: 'Lu rung Komatsu (Lu 38)', kind: 'machine', cat: 'Lu rung bánh thép', brand: 'Komatsu', model: 'JV100', year: 2022, own: 'own', status: 'running', loc: 'p1', locName: 'CT Hữu Nghị – Chi Lăng', driver: 'u6', power: '125 HP', fuel: 'Diesel', hourStart: 980, hourNow: 1342, unitPrice: 1650 },
    { id: 'e3', code: 'TB-M-202509-0021', series: 'LU37-SAK-2023', name: 'Lu tĩnh Sakai (Lu 37)', kind: 'machine', cat: 'Lu tĩnh bánh thép', brand: 'Sakai', model: 'SW880', year: 2021, own: 'own', status: 'maintenance', loc: 'wh1', locName: 'Kho chính Nam Hải', driver: 'u7', power: '110 HP', fuel: 'Diesel', hourStart: 1500, hourNow: 2104, unitPrice: 1400 },
    { id: 'e4', code: 'TB-M-202510-0030', series: 'LU41-XCMG-2024', name: 'Lu rung XCMG (Lu 4.1)', kind: 'machine', cat: 'Lu rung bánh thép', brand: 'XCMG', model: 'XS123', year: 2023, own: 'rented', status: 'running', loc: 'p1', locName: 'CT Hữu Nghị – Chi Lăng', driver: 'u7', power: '130 HP', fuel: 'Diesel', hourStart: 340, hourNow: 612, unitPrice: 0, rent: { form: 'hour', supplier: 'pt3', start: '2026-03-01', end: '2026-06-01', price: 320, used: 272, quota: 500 } },
    { id: 'e5', code: 'TB-X-202507-0044', series: 'HOWO-44-2021', name: 'Xe Howo 4 chân (Xe 44)', kind: 'vehicle', cat: 'Xe ben 4 chân', brand: 'Howo', model: 'ZZ3317', year: 2020, own: 'own', status: 'running', loc: 'p1', locName: 'CT Hữu Nghị – Chi Lăng', driver: 'u10', plate: '29H-21544', bucketVol: '12 m³', load: '18 tấn', avgTrip: 12, fuel: 'Diesel', kmStart: 84200, kmNow: 96450, unitPrice: 1950 },
    { id: 'e6', code: 'TB-X-202507-0057', series: 'HOWO-57-2021', name: 'Xe Howo 3 chân (Xe 57)', kind: 'vehicle', cat: 'Xe ben 3 chân', brand: 'Howo', model: 'ZZ3257', year: 2021, own: 'own', status: 'running', loc: 'p1', locName: 'CT Hữu Nghị – Chi Lăng', driver: 'u10', plate: '29H-21557', bucketVol: '10 m³', load: '15 tấn', avgTrip: 10, fuel: 'Diesel', kmStart: 51200, kmNow: 62980, unitPrice: 1750 },
    { id: 'e7', code: 'TB-X-202602-0568', series: 'DP-568-2022', name: 'Xe điều phối 568', kind: 'vehicle', cat: 'Xe ben điều phối', brand: 'Howo', model: 'ZZ3317', year: 2022, own: 'rented', status: 'running', loc: 'p1', locName: 'CT Hữu Nghị – Chi Lăng', driver: 'u10', plate: '29C-15653', bucketVol: '20 m³', load: '30 tấn', avgTrip: 20, fuel: 'Diesel', kmStart: 12000, kmNow: 18420, unitPrice: 0, rent: { form: 'trip', supplier: 'pt3', start: '2026-05-01', end: '2026-05-31', price: 95, used: 51, quota: 80 } },
    { id: 'e8', code: 'TB-M-202506-0008', series: 'DOZ-D6-2020', name: 'Máy ủi CAT D6', kind: 'machine', cat: 'Máy ủi', brand: 'Caterpillar', model: 'D6', year: 2019, own: 'own', status: 'idle', loc: 'wh1', locName: 'Kho chính Nam Hải', driver: null, power: '215 HP', fuel: 'Diesel', hourStart: 3200, hourNow: 4180, unitPrice: 2400 },
    { id: 'e9', code: 'TB-M-202504-0003', series: 'GR-140-2018', name: 'Máy san gạt 140', kind: 'machine', cat: 'Máy san', brand: 'SDLG', model: 'G9165', year: 2018, own: 'own', status: 'liquidated', loc: '-', locName: 'Đã thanh lý', driver: null, power: '165 HP', fuel: 'Diesel', hourStart: 6100, hourNow: 8920, unitPrice: 900 },
    { id: 'e10', code: 'TB-X-202601-0029', series: 'LONG-29H-2021', name: 'Xe Long 29H-21571', kind: 'vehicle', cat: 'Xe ben 4 chân', brand: 'Dongfeng', model: 'L315', year: 2021, own: 'rented-out', status: 'rented-out', loc: 'pt5', locName: 'Cho thuê: Cty Long Phát', driver: null, plate: '29H-21571', bucketVol: '12 m³', load: '18 tấn', avgTrip: 12, fuel: 'Diesel', kmStart: 22000, kmNow: 31200, unitPrice: 1900, rent: { form: 'day', supplier: 'pt5', start: '2026-04-10', end: '2026-06-10', price: 2800, used: 52, quota: 61 } },
  ];

  /* ---------------- Materials (vật tư) ---------------- */
  const materials = [
    { id: 'm1', code: 'VT-NVL-0001', name: 'Đất đắp K95', type: 'nvl', unit: 'm³', spec: 'Đất đồi chọn lọc', density: 1.85, stock: 4200, min: 1000, price: 48 },
    { id: 'm2', code: 'VT-NVL-0002', name: 'Cấp phối đá dăm 0x37', type: 'nvl', unit: 'm³', spec: 'CPĐD loại I', density: 2.1, stock: 860, min: 500, price: 285 },
    { id: 'm3', code: 'VT-NVL-0003', name: 'Cát vàng', type: 'nvl', unit: 'm³', spec: 'Cát vàng xây dựng', density: 1.45, stock: 320, min: 200, price: 320 },
    { id: 'm4', code: 'VT-NVL-0004', name: 'Xi măng PCB40', type: 'nvl', unit: 'Bao', spec: 'Bao 50kg', density: null, stock: 1450, min: 800, price: 0.092 },
    { id: 'm5', code: 'VT-NVL-0005', name: 'Thép D16 CB400', type: 'nvl', unit: 'Tấn', spec: 'Thanh 11.7m', density: null, stock: 18.4, min: 10, price: 16800 },
    { id: 'm6', code: 'VT-NL-0001', name: 'Dầu Diesel DO 0,05S', type: 'nl', unit: 'Lít', spec: 'DO 0,05S-II', density: 0.84, loss: 1.5, stock: 6800, min: 3000, price: 0.0205 },
    { id: 'm7', code: 'VT-NL-0002', name: 'Dầu thuỷ lực HD46', type: 'nl', unit: 'Lít', spec: 'HLP 46', density: 0.87, loss: 0.8, stock: 240, min: 200, price: 0.058 },
    { id: 'm8', code: 'VT-NL-0003', name: 'Mỡ bôi trơn', type: 'nl', unit: 'Kg', spec: 'NLGI 2', density: null, loss: 0.5, stock: 64, min: 40, price: 0.085 },
  ];

  /* ---------------- Warehouses ---------------- */
  const warehouses = [
    { id: 'wh1', code: 'KHO-01', name: 'Kho chính Nam Hải', loc: 'TP. Bắc Giang', mgr: 'u9', type: 'central' },
    { id: 'wh2', code: 'KHO-CT-01', name: 'Kho hiện trường HN–CL', loc: 'Km5+200, Đồng Đăng', mgr: 'u8', type: 'site' },
    { id: 'wh3', code: 'KHO-CT-02', name: 'Kho hiện trường Đồng Văn', loc: 'Duy Tiên, Hà Nam', mgr: 'u8', type: 'site' },
  ];

  /* ---------------- Machine logs (nhật trình máy) — from photo ---------------- */
  const machineLogs = [
    { id: 'ml1', date: '2026-05-11', equip: 'e2', driver: 'u6', work: 'Lu đất Kg5 Km5', area: 'kv2', hStart: 1308, hEnd: 1319, hours: 11, fuel: 150, qty: 0, unit: 'm³', status: 'approved' },
    { id: 'ml2', date: '2026-05-12', equip: 'e2', driver: 'u6', work: 'Lu đất Kg5 Km5', area: 'kv2', hStart: 1319, hEnd: 1330, hours: 11, fuel: 0, qty: 0, unit: 'm³', status: 'approved' },
    { id: 'ml3', date: '2026-05-13', equip: 'e2', driver: 'u6', work: 'Lu đất Kg5 Km5', area: 'kv2', hStart: 1330, hEnd: 1343, hours: 13.30, fuel: 190, qty: 0, unit: 'm³', status: 'approved' },
    { id: 'ml4', date: '2026-05-14', equip: 'e3', driver: 'u7', work: 'Lu 37 — Km7', area: 'kv3', hStart: 980, hEnd: 992, hours: 12, fuel: 150, qty: 0, unit: 'm³', status: 'approved' },
    { id: 'ml5', date: '2026-05-15', equip: 'e4', driver: 'u7', work: 'Lu đất Kg5 Km4', area: 'kv2', hStart: 600, hEnd: 611, hours: 11, fuel: 0, qty: 0, unit: 'm³', status: 'submitted' },
    { id: 'ml6', date: '2026-05-15', equip: 'e1', driver: 'u3', work: 'Đào & đắp nền Km4', area: 'kv2', hStart: 1604, hEnd: 1612, hours: 8, fuel: 160, qty: 450, unit: 'm³', status: 'submitted' },
  ];

  /* ---------------- Vehicle logs (nhật ký xe) — from Howo sheet ---------------- */
  const vehicleLogs = [
    { id: 'vl1', date: '2026-05-16', equip: 'e5', driver: 'u10', work: 'Đất đắp', from: 'Km3+900', to: 'Km3+400', trips: 3, dist: 0.8, totalDist: 2.4, avg: 12, vol: 36, status: 'approved' },
    { id: 'vl2', date: '2026-05-16', equip: 'e6', driver: 'u10', work: 'Đất đắp', from: 'Km4+500', to: 'Km4+300', trips: 16, dist: 0.7, totalDist: 11.2, avg: 10, vol: 160, status: 'approved' },
    { id: 'vl3', date: '2026-05-16', equip: 'e7', driver: 'u10', work: 'Đất điều phối', from: 'Km7+800', to: 'Km7+200', trips: 51, dist: 1.0, totalDist: 51.0, avg: 20, vol: 854, status: 'approved' },
    { id: 'vl4', date: '2026-05-16', equip: 'e10', driver: 'u10', work: 'Đất đắp', from: 'Km4+500', to: 'Km4+300', trips: 10, dist: 0.7, totalDist: 7.0, avg: 12, vol: 120, status: 'submitted' },
  ];

  /* ---------------- Material drops (vật liệu đổ, QR đếm chuyến) — 16/05 ---------------- */
  const drops = [
    { id: 'd1', date: '2026-05-16', work: 'Đất điều phối — CTY 568', plate: '29C-15653', trips: 10, vol: 200, time: '08:12' },
    { id: 'd2', date: '2026-05-16', work: 'Đất điều phối — CTY 568', plate: '29C-02617', trips: 11, vol: 220, time: '09:05' },
    { id: 'd3', date: '2026-05-16', work: 'Đất điều phối — CTY 568', plate: '29C-15618', trips: 7, vol: 140, time: '10:21' },
    { id: 'd4', date: '2026-05-16', work: 'Đất điều phối — CTY 568', plate: '29C-15678', trips: 8, vol: 160, time: '11:40' },
    { id: 'd5', date: '2026-05-16', work: 'Đất điều phối — CTY 568', plate: '29C-15605', trips: 3, vol: 60, time: '13:30' },
    { id: 'd6', date: '2026-05-16', work: 'Đất điều phối — CTY 568', plate: '29C-15501', trips: 5, vol: 100, time: '14:48' },
    { id: 'd7', date: '2026-05-16', work: 'Đất điều phối — CTY 568', plate: '29C-15655', trips: 6, vol: 120, time: '15:55' },
    { id: 'd8', date: '2026-05-16', work: 'Đất điều phối — CTY 568', plate: '29C-15621', trips: 1, vol: 20, time: '16:30' },
  ];

  /* ---------------- Overtime tickets (phiếu tăng ca) ---------------- */
  const overtime = [
    { id: 'ot1', date: '2026-05-15', person: 'u6', equip: 'e2', content: 'Lu đất Km7', from: '17:30', to: '20:30', hours: 3, status: 'approved', approver: 'u4' },
    { id: 'ot2', date: '2026-05-15', person: 'u7', equip: 'e4', content: 'Lu Đất Kg5 KM4', from: '17:30', to: '20:30', hours: 3, status: 'approved', approver: 'u4' },
    { id: 'ot3', date: '2026-05-13', person: 'u6', equip: 'e2', content: 'Lu đất Kg5 Km5', from: '17:30', to: '23:00', hours: 5.5, status: 'pending', approver: 'u4' },
    { id: 'ot4', date: '2026-05-14', person: 'u3', equip: 'e1', content: 'Đào đất ban đêm', from: '17:30', to: '21:00', hours: 3.5, status: 'pending', approver: 'u4' },
  ];

  /* ---------------- Construction logs (nhật ký thi công) ---------------- */
  const siteLogs = [
    { id: 'sl1', date: '2026-05-16', author: 'u4', weatherAM: 'Nắng', weatherPM: 'Nắng', weatherEve: 'Bình thường',
      staff: 6, workers: 42, machines: ['e1','e2','e5','e6','e7'],
      work: 'Đào điều phối đất Km7→Km4; đắp & lu lèn K95 đoạn Km4+500. Tổng 51 chuyến, 854 m³ đất.',
      accept: 'Nghiệm thu lớp đắp K95 lớp 3 đoạn Km4+500~Km4+800. Đạt độ chặt yêu cầu.',
      safety: 'Không có sự cố', note: 'Đề nghị bổ sung 02 xe tưới nước chống bụi.' },
    { id: 'sl2', date: '2026-05-15', author: 'u4', weatherAM: 'Nắng', weatherPM: 'Mưa', weatherEve: 'Mưa',
      staff: 5, workers: 38, machines: ['e2','e4'],
      work: 'Lu lèn nền đường Km4–Km5. Tăng ca buổi tối 2 máy lu.',
      accept: 'Kiểm tra cao độ nền đoạn Km4+500.',
      safety: 'Không có sự cố', note: '' },
  ];

  /* ---------------- Timesheets (chấm công) ---------------- */
  const today = '2026-05-16';
  const timesheet = people.slice(2, 11).map((p, i) => {
    const states = ['in','in','in','late','in','in','off','in','in'];
    const st = states[i % states.length];
    return {
      id: 'ts' + p.id, person: p.id, date: today, status: st,
      checkIn: st === 'off' ? null : (st === 'late' ? '07:42' : ['06:58','07:01','07:03','07:00','06:55'][i % 5]),
      checkOut: null, hours: st === 'off' ? 0 : (7.5 + (i % 3) * 0.5),
      ot: i % 3 === 0 ? 3 : 0,
      gps: st === 'off' ? null : 'Km5+200, Đồng Đăng', wifi: st === 'off' ? null : 'NamHai-CT-HNCL',
      method: i % 2 === 0 ? 'GPS + WiFi' : 'GPS',
    };
  });

  /* ---------------- Payroll (bảng lương tháng) ---------------- */
  const payroll = people.slice(2, 11).map((p, i) => {
    const base = [9.5, 8.2, 11, 10, 8.5, 8.5, 7, 12, 9][i % 9]; // triệu
    const days = [26, 24, 26, 25, 23, 26, 0, 27, 25][i % 9];
    const ot = [12, 6, 0, 18, 4, 9, 0, 22, 7][i % 9];
    const otPay = ot * 0.085;
    const machineShift = p.dept === 'Đội cơ giới' ? [3.2, 0, 4.1, 5.5, 2.8][i % 5] : 0;
    return { id: 'pr' + p.id, person: p.id, base, days, std: 26, ot, otPay, machineShift, deduct: 0.6,
      gross: +(base * days / 26 + otPay + machineShift).toFixed(2) };
  });

  /* ---------------- Partners / customers ---------------- */
  const partners = [
    { id: 'pt1', name: 'Cty CP Vật liệu Lạng Sơn', type: ['Nhập vật tư'], phone: '0205 388 112', debt: 142 },
    { id: 'pt2', name: 'Cty TNHH Xăng dầu Đồng Đăng', type: ['Nhập nhiên liệu'], phone: '0205 877 334', debt: 38 },
    { id: 'pt3', name: 'Cty Cơ giới Thành Đạt', type: ['Cho thuê thiết bị'], phone: '0204 556 778', debt: 0 },
    { id: 'pt4', name: 'Xưởng cơ khí Hồng Phát', type: ['Sửa chữa thiết bị'], phone: '0912 443 221', debt: 65 },
    { id: 'pt5', name: 'Cty Vận tải Long Phát', type: ['Thuê thiết bị'], phone: '0988 221 556', debt: 0 },
  ];
  const customers = [
    { id: 'cu1', name: 'Cty Thu mua phế liệu Tân Phát', type: 'Mua thanh lý', phone: '0913 668 224', bought: 1 },
    { id: 'cu2', name: 'Ông Trần Đại Nghĩa', type: 'Mua thanh lý', phone: '0945 117 882', bought: 1 },
  ];

  /* ---------------- Repairs (sửa chữa) ---------------- */
  const repairs = [
    { id: 'rp1', code: 'SC-001', equip: 'e3', date: '2026-04-20', type: 'Bảo dưỡng định kỳ', cost: 45, place: 'Xưởng Nam Hải', by: 'u12', status: 'done', note: 'Thay lọc dầu, lọc gió' },
    { id: 'rp2', code: 'SC-002', equip: 'e1', date: '2026-03-05', type: 'Sửa hỏng bơm thuỷ lực', cost: 125, place: 'Đối tác Hồng Phát', by: 'pt4', status: 'done', note: 'Thay bơm thuỷ lực chính' },
    { id: 'rp3', code: 'SC-003', equip: 'e3', date: '2026-05-14', type: 'Sửa hệ thống rung', cost: 0, place: 'Xưởng Nam Hải', by: 'u12', status: 'doing', note: 'Đang chờ phụ tùng' },
  ];

  /* ---------------- Transfers (luân chuyển) ---------------- */
  const transfers = [
    { id: 'tr1', date: '2026-05-16 08:15', kind: 'Xuất kho', code: 'XK-001', equip: 'e2', from: 'Kho chính Nam Hải', to: 'CT Hữu Nghị – Chi Lăng', by: 'u1', note: 'Giao cho giai đoạn lu lèn', status: 'done' },
    { id: 'tr2', date: '2026-05-14 14:30', kind: 'Nhập kho', code: 'NK-002', equip: 'e3', from: 'CT Hữu Nghị – Chi Lăng', to: 'Kho chính Nam Hải', by: 'u2', note: 'Bảo dưỡng định kỳ', status: 'done' },
    { id: 'tr3', date: '2026-04-15 09:45', kind: 'Xuất kho', code: 'XK-003', equip: 'e1', from: 'Kho chính Nam Hải', to: 'CT Hữu Nghị – Chi Lăng', by: 'u5', note: 'Thi công gói thầu 1A', status: 'done' },
  ];

  /* ---------------- Stock receipts/issues (nhập/xuất kho) ---------------- */
  const receipts = [
    { id: 'nk1', code: 'PN-202605-018', date: '2026-05-15', kind: 'Vật tư', wh: 'wh2', source: 'Mua mới', supplier: 'pt1', items: 2, total: 142, status: 'approved', by: 'u8' },
    { id: 'nk2', code: 'PN-202605-017', date: '2026-05-12', kind: 'Vật tư', wh: 'wh2', source: 'Mua mới', supplier: 'pt2', items: 1, total: 139, status: 'approved', by: 'u8' },
    { id: 'nk3', code: 'PN-202605-016', date: '2026-05-10', kind: 'Thiết bị', wh: 'wh1', source: 'Trả từ cho thuê', supplier: 'pt5', items: 1, total: 0, status: 'pending', by: 'u9' },
  ];
  const issues = [
    { id: 'xk1', code: 'XK-202605-024', date: '2026-05-16', type: 'Xuất vật tư', wh: 'wh2', to: 'CT Hữu Nghị – Chi Lăng', items: 3, total: 96, status: 'approved', by: 'u8' },
    { id: 'xk2', code: 'XK-202605-001', date: '2026-05-16', type: 'Luân chuyển thiết bị', wh: 'wh1', to: 'CT Hữu Nghị – Chi Lăng', items: 1, total: 0, status: 'approved', by: 'u1' },
    { id: 'xk3', code: 'XK-202605-019', date: '2026-05-14', type: 'Cho thuê thiết bị', wh: 'wh1', to: 'Cty Long Phát', items: 1, total: 168, status: 'approved', by: 'u9' },
    { id: 'xk4', code: 'XK-202604-008', date: '2026-04-28', type: 'Xuất thanh lý thiết bị', wh: 'wh1', to: 'KH Tân Phát', items: 1, total: 320, status: 'approved', by: 'u9' },
  ];

  /* ---------------- Alerts ---------------- */
  const alerts = [
    { id: 'al1', level: 'red', icon: 'clock', title: 'Thiết bị thuê sắp hết hạn', desc: 'Lu 4.1 (XCMG) — còn 1 ngày tới hạn trả (01/06).', time: '2 giờ trước' },
    { id: 'al2', level: 'amber', icon: 'box', title: 'Tồn kho thấp', desc: 'Dầu thuỷ lực HD46 còn 240 L (mức tối thiểu 200 L).', time: '5 giờ trước' },
    { id: 'al3', level: 'amber', icon: 'truck', title: 'Vượt số chuyến hợp đồng', desc: 'Xe điều phối 568 đã chạy 51/80 chuyến.', time: 'Hôm qua' },
    { id: 'al4', level: 'red', icon: 'wrench', title: 'Thiết bị đang sửa chữa', desc: 'Lu 37 (Sakai) — chờ phụ tùng hệ thống rung.', time: 'Hôm qua' },
  ];

  /* ---------------- Tiến độ thi công chi tiết (WBS Gantt) — theo PDF Nam Hải ---------------- */
  /* lvl: 0 = nhóm hạng mục (header), 1 = công việc. done = % KL thực tế. start/end = kế hoạch. */
  const S = (id, lvl, name, dvt, kl, days, start, end, done) => ({ id, lvl, name, dvt, kl, days, start, end, done });
  const schedule = [
    S('h1', 0, 'TUYẾN CHÍNH · Km3+300 – Km4+699', null, null, null, '2025-03-01', '2026-02-08', null),
    S('s1', 1, 'Công tác chuẩn bị, đường công vụ, bãi thải', null, null, 285, '2025-03-01', '2025-12-10', 100),
    S('s2', 1, 'Dọn dẹp mặt bằng', 'm²', 93963, 60, '2025-03-16', '2025-05-14', 100),
    S('s3', 1, 'Đào đất không thích hợp', 'm³', 30385, 60, '2025-03-31', '2025-05-29', 100),
    S('s4', 1, 'Đào đất các loại', 'm³', 887177, 160, '2025-04-10', '2025-09-16', 96),
    S('s5', 1, 'Đào đá các loại', 'm³', 71489, 180, '2025-04-30', '2025-10-26', 88),
    S('s6', 1, 'Đắp nền đường K95', 'm³', 220894, 200, '2025-04-25', '2025-11-10', 78),
    S('s7', 1, 'Đắp nền đường K98', 'm³', 2692, 30, '2025-11-11', '2025-12-10', 40),
    S('s8', 1, 'Móng cấp phối đá dăm loại I, lớp trên', 'm³', 13758, 60, '2025-12-11', '2026-02-08', 12),
    S('h2', 0, 'CÔNG TRÌNH TRÊN TUYẾN · Km3+300 – Km4+699', null, null, null, '2025-03-16', '2026-08-09', null),
    S('s9', 1, 'Cống hộp', null, null, 90, '2025-03-16', '2025-06-13', 100),
    S('s10', 1, 'Cống tròn Km3+860 (D1.5m, t=18cm)', 'm', 98.8, 55, '2025-04-15', '2025-06-08', 100),
    S('s11', 1, 'Cống tròn Km4+187 (D1.25m)', 'm', 56, 30, '2025-04-25', '2025-05-14', 100),
    S('s12', 1, 'Cống tròn Km4+410 (D1.25m)', 'm', 108, 45, '2025-04-25', '2025-06-08', 100),
    S('s13', 1, 'Cống tròn Km4+597 (D1.5m, t=14cm)', 'm', 77, 35, '2025-04-15', '2025-05-19', 100),
    S('s14', 1, 'Hầm chui Km3+392 (6.0×4.5m)', 'm', 50, 120, '2025-03-16', '2025-07-13', 92),
    S('s15', 1, 'Hầm chui Km4+384 (4.0×4.0m)', 'm', 32.2, 60, '2025-05-15', '2025-07-13', 90),
    S('s16', 1, 'Rãnh thoát nước các loại (dọc, đỉnh, cơ)', 'm', 4350, 350, '2025-06-09', '2026-05-31', 35),
    S('s17', 1, 'Gia cố mái taluy', 'm²', 122991, 360, '2025-08-08', '2026-08-09', 18),
    S('h3', 0, 'TUYẾN CHÍNH · Km6+200 – Km7+400', null, null, null, '2024-12-01', '2026-02-07', null),
    S('s18', 1, 'Công tác chuẩn bị, đường công vụ, bãi thải', null, null, 365, '2024-12-01', '2025-12-09', 100),
    S('s19', 1, 'Dọn dẹp mặt bằng', 'm²', 46782, 90, '2024-12-16', '2025-03-24', 100),
    S('s20', 1, 'Đào đất không thích hợp', 'm³', 9660, 90, '2024-12-31', '2025-04-08', 100),
    S('s21', 1, 'Đào đất các loại', 'm³', 460754, 90, '2025-04-09', '2025-07-08', 98),
    S('s22', 1, 'Đắp nền đường K95', 'm³', 112996, 200, '2025-04-24', '2025-11-09', 82),
    S('s23', 1, 'Đắp nền đường K98', 'm³', 4314, 30, '2025-11-10', '2025-12-09', 44),
    S('s24', 1, 'Móng cấp phối đá dăm loại I, lớp trên', 'm³', 12089, 60, '2025-12-10', '2026-02-07', 14),
    S('h4', 0, 'CÔNG TRÌNH TRÊN TUYẾN · Km6+200 – Km7+400', null, null, null, '2025-03-25', '2026-11-14', null),
    S('s25', 1, 'Cống hộp Km6+367 (2×3.0×3.0m)', 'm', 65.9, 66, '2025-03-25', '2025-05-29', 100),
    S('s26', 1, 'Cống tròn Km6+528 (D1.25m)', 'm', 58, 45, '2025-04-09', '2025-05-23', 100),
    S('s27', 1, 'Cống tròn Km7+176 (D1.5m)', 'm', 83, 40, '2025-04-14', '2025-05-23', 100),
    S('s28', 1, 'Hầm chui Km6+387 (4.0×4.0m)', 'm', 22, 42, '2025-04-09', '2025-05-20', 100),
    S('s29', 1, 'Hầm chui Km7+150 (4.0×4.0m)', 'm', 23.8, 42, '2025-04-14', '2025-05-25', 100),
    S('s30', 1, 'Thi công đường ngang, đường gom', 'km', 1.62, 200, '2026-04-29', '2026-11-14', 0),
  ];
  // S-curve: base tháng 12/2024 (idx0) → 11/2026 (idx23). nowIdx = 05/2026.
  const scurve = {
    base: '2024-12', nowIdx: 17,
    planCum:   [2, 4, 7, 11, 16, 22, 28, 34, 40, 46, 51, 55, 59, 62, 64, 66, 67, 68, 74, 82, 90, 96, 99, 100],
    actualCum: [1, 2, 5, 8, 12, 17, 22, 28, 34, 40, 45, 49, 53, 56, 58, 60, 61, 62],
  };

  /* ---------------- Gói thầu (nhiều gói trong 1 công trường, mỗi gói 1 đoạn) ---------------- */
  const bids = [
    { id: 'b1', proj: 'p1', code: 'EC01', name: 'Thi công nền đường & công trình Km3+300–Km4+699 và Km6+200–Km7+400', scope: 'Km3+300 → Km4+699 · Km6+200 → Km7+400', areas: ['kv1', 'kv2', 'kv3'], value: 980000, accepted: 58, paid: 540000, progress: 62, status: 'active', start: '2025-08-01', end: '2026-09-30', contractor: 'Liên danh Quân Trung – Nam Hải' },
    { id: 'b2', proj: 'p1', code: 'EC02', name: 'Thi công nền đường đoạn Km8+200–Km12+000', scope: 'Km8+200 → Km12+000', areas: ['kv4'], value: 540000, accepted: 20, paid: 280000, progress: 22, status: 'active', start: '2025-10-01', end: '2026-11-15', contractor: 'Liên danh Quân Trung – Nam Hải' },
    { id: 'b3', proj: 'p1', code: 'EC03', name: 'Cầu vượt sông & cống Km14+300', scope: 'Km14+300 → Km19+500', areas: ['kv5', 'kv6'], value: 320000, accepted: 8, paid: 90000, progress: 8, status: 'pending', start: '2026-03-01', end: '2026-12-30', contractor: 'Cty CP Nam Hải' },
    { id: 'b4', proj: 'p2', code: 'DV01', name: 'Thi công nền đường vành đai KCN Đồng Văn', scope: 'Km0+000 → Km12+200', areas: ['kv7', 'kv8', 'kv9'], value: 720000, accepted: 30, paid: 244000, progress: 34, status: 'active', start: '2026-01-15', end: '2026-11-30', contractor: 'Cty CP Nam Hải' },
  ];

  window.DB = {
    roles, people, byId, templates, projects, phases, areas, tasks, equipment, materials,
    warehouses, machineLogs, vehicleLogs, drops, overtime, siteLogs, timesheet, payroll,
    partners, customers, repairs, transfers, receipts, issues, alerts, schedule, scurve, bids, colorFor, av,
  };
})();
