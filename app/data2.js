/* Dữ liệu mở rộng cho quản lý công trường — augment window.DB.
   Load NGAY SAU data.js. Thêm: phân loại thiết bị, lịch sử toàn trình, nhân sự dự án, kho. */
(function () {
  const DB = window.DB;

  /* ===== 1. Bổ sung phân loại + chứng chỉ cho thiết bị ===== */
  // group: nhóm chi tiết. Máy: xuc/dao/lu/ui/san/cau. Xe: ben/bon/daukeo/dieuphoi/khac
  const GROUP = {
    e1: 'xuc', e2: 'lu', e3: 'lu', e4: 'lu', e8: 'ui', e9: 'san',
    e5: 'ben', e6: 'ben', e7: 'dieuphoi', e10: 'ben',
  };
  DB.equipGroups = {
    machine: [['xuc', 'Máy xúc'], ['dao', 'Máy đào'], ['lu', 'Máy lu'], ['ui', 'Máy ủi'], ['san', 'Máy san'], ['cau', 'Máy cẩu']],
    vehicle: [['ben', 'Xe ben'], ['bon', 'Xe bồn'], ['daukeo', 'Xe đầu kéo'], ['dieuphoi', 'Xe điều phối'], ['khac', 'Xe khác']],
  };
  DB.equipGroupLabel = (g) => { for (const k in DB.equipGroups) { const f = DB.equipGroups[k].find(x => x[0] === g); if (f) return f[1]; } return g; };

  // chứng chỉ / đăng kiểm cho thiết bị (cho cảnh báo hết hạn)
  const EQ_CERT = {
    e1: { name: 'Kiểm định an toàn', no: 'KĐ-2025-0112', expiry: '2026-09-12' },
    e2: { name: 'Kiểm định an toàn', no: 'KĐ-2025-0145', expiry: '2026-06-18' },
    e4: { name: 'Kiểm định an toàn', no: 'KĐ-2025-0230', expiry: '2026-06-22' },
    e5: { name: 'Đăng kiểm xe', no: '29H-21544-ĐK', expiry: '2026-06-30' },
    e6: { name: 'Đăng kiểm xe', no: '29H-21557-ĐK', expiry: '2026-07-15' },
    e7: { name: 'Đăng kiểm xe', no: '29C-15653-ĐK', expiry: '2026-06-11' },
  };
  DB.equipment.forEach(e => {
    e.group = GROUP[e.id] || (e.kind === 'machine' ? 'xuc' : 'ben');
    e.cert = EQ_CERT[e.id] || null;
    e.statusLabel = { running: 'Đang chạy', idle: 'Chờ việc', maintenance: 'Bảo trì', 'rented-out': 'Đang cho thuê', liquidated: 'Đã thanh lý' }[e.status] || e.status;
  });

  /* ===== 2. Lịch sử điều chuyển thiết bị giữa công trường ===== */
  DB.equipTransfers = [
    { id: 'tr1', equip: 'e1', from: 'wh1', to: 'p1', date: '2025-10-20', reason: 'Điều động đào nền GĐ2', by: 'u1', doc: 'ĐC-2025-0042' },
    { id: 'tr2', equip: 'e2', from: 'wh1', to: 'p1', date: '2025-11-02', reason: 'Bổ sung lu lèn K95', by: 'u1', doc: 'ĐC-2025-0051' },
    { id: 'tr3', equip: 'e4', from: 'pt3', to: 'p1', date: '2026-03-01', reason: 'Thuê tăng cường mùa khô', by: 'u4', doc: 'ĐC-2026-0009' },
    { id: 'tr4', equip: 'e5', from: 'p2', to: 'p1', date: '2026-01-15', reason: 'Điều chuyển từ CT Đồng Văn', by: 'u1', doc: 'ĐC-2026-0003' },
    { id: 'tr5', equip: 'e7', from: 'pt3', to: 'p1', date: '2026-05-01', reason: 'Thuê điều phối đất Km7', by: 'u4', doc: 'ĐC-2026-0021' },
    { id: 'tr6', equip: 'e3', from: 'p1', to: 'wh1', date: '2026-05-05', reason: 'Đưa về kho bảo trì lớn', by: 'u9', doc: 'ĐC-2026-0024' },
    { id: 'tr7', equip: 'e8', from: 'p1', to: 'wh1', date: '2026-02-10', reason: 'Hết hạng mục san nền, đưa về kho', by: 'u1', doc: 'ĐC-2026-0006' },
  ];

  /* ===== 3. Lịch sử nhiên liệu tiêu hao ===== */
  DB.fuelLogs = [
    { id: 'f1', date: '2026-05-16', equip: 'e1', liters: 160, odo: 1612, cost: 3.28, by: 'u8' },
    { id: 'f2', date: '2026-05-15', equip: 'e1', liters: 155, odo: 1604, cost: 3.18, by: 'u8' },
    { id: 'f3', date: '2026-05-16', equip: 'e2', liters: 150, odo: 1342, cost: 3.08, by: 'u8' },
    { id: 'f4', date: '2026-05-13', equip: 'e2', liters: 190, odo: 1343, cost: 3.90, by: 'u8' },
    { id: 'f5', date: '2026-05-16', equip: 'e5', liters: 88, odo: 96450, cost: 1.80, by: 'u8' },
    { id: 'f6', date: '2026-05-16', equip: 'e6', liters: 76, odo: 62980, cost: 1.56, by: 'u8' },
    { id: 'f7', date: '2026-05-16', equip: 'e7', liters: 320, odo: 18420, cost: 6.56, by: 'u8' },
    { id: 'f8', date: '2026-05-15', equip: 'e4', liters: 240, odo: 600, cost: 4.92, by: 'u8' },
  ];

  /* ===== 4. Lịch sử người vận hành (ai lái, thời gian) ===== */
  DB.operatorHistory = [
    { id: 'oh1', equip: 'e1', person: 'u3', from: '2025-10-20', to: null, current: true },
    { id: 'oh2', equip: 'e2', person: 'u6', from: '2025-11-02', to: null, current: true },
    { id: 'oh3', equip: 'e4', person: 'u7', from: '2026-03-01', to: null, current: true },
    { id: 'oh4', equip: 'e4', person: 'u6', from: '2026-02-01', to: '2026-02-28', current: false },
    { id: 'oh5', equip: 'e5', person: 'u10', from: '2026-01-15', to: null, current: true },
    { id: 'oh6', equip: 'e7', person: 'u11', from: '2026-05-01', to: null, current: true },
  ];

  /* ===== 5. Lịch sử sửa chữa & bảo trì (kèm chi phí) ===== */
  DB.equipRepairs = [
    { id: 'r1', equip: 'e3', date: '2026-05-06', type: 'Đại tu', content: 'Thay bơm thuỷ lực, đại tu hệ lu rung', cost: 48, vendor: 'pt4', status: 'doing', by: 'u12' },
    { id: 'r2', equip: 'e1', date: '2026-04-12', type: 'Bảo trì định kỳ', content: 'Thay dầu, lọc, kiểm tra gầu', cost: 6.5, vendor: 'internal', status: 'done', by: 'u12' },
    { id: 'r3', equip: 'e2', date: '2026-03-20', type: 'Sửa chữa', content: 'Thay gioăng, xử lý rò dầu', cost: 4.2, vendor: 'internal', status: 'done', by: 'u12' },
    { id: 'r4', equip: 'e5', date: '2026-02-28', type: 'Bảo trì định kỳ', content: 'Bảo dưỡng 90.000 km', cost: 8.0, vendor: 'pt4', status: 'done', by: 'u12' },
  ];

  /* ===== 6. Nhân sự dự án — công ty vs thuê ngoài, tổ đội, vai trò ===== */
  // company team members
  DB.projectStaff = [
    // BCH
    { person: 'u4', proj: 'p1', staffType: 'company', team: 'bch', role: 'Chỉ huy trưởng', lead: true, area: null, equip: null },
    { person: 'u5', proj: 'p1', staffType: 'company', team: 'kythuat', role: 'Cán bộ kỹ thuật', area: 'kv2', equip: null },
    { person: 'u2', proj: 'p1', staffType: 'company', team: 'bch', role: 'Kế toán công trình', area: null, equip: null },
    { person: 'u8', proj: 'p1', staffType: 'company', team: 'vattu', role: 'Cán bộ vật tư / Thủ kho HT', area: null, equip: null },
    // Đội cơ giới (company)
    { person: 'u3', proj: 'p1', staffType: 'company', team: 'cogioi', role: 'Thợ lái máy xúc', area: 'kv2', equip: 'e1' },
    { person: 'u6', proj: 'p1', staffType: 'company', team: 'cogioi', role: 'Thợ lái lu', lead: true, area: 'kv2', equip: 'e2' },
    { person: 'u7', proj: 'p1', staffType: 'company', team: 'cogioi', role: 'Thợ lái lu', area: 'kv2', equip: 'e4' },
    { person: 'u12', proj: 'p1', staffType: 'company', team: 'cogioi', role: 'Thợ sửa chữa', area: null, equip: null },
    // Đội vận tải (company)
    { person: 'u10', proj: 'p1', staffType: 'company', team: 'vantai', role: 'Lái xe Howo', lead: true, area: 'kv3', equip: 'e5' },
    // Thuê ngoài
    { person: 'u11', proj: 'p1', staffType: 'outsourced', team: 'vantai-thue', role: 'Lái xe điều phối (thuê)', supplier: 'pt5', area: 'kv3', equip: 'e7' },
  ];
  // tổ/đội definitions
  DB.teams = [
    { id: 'bch', name: 'Ban chỉ huy công trường', kind: 'company' },
    { id: 'kythuat', name: 'Tổ kỹ thuật', kind: 'company' },
    { id: 'vattu', name: 'Tổ vật tư - kho', kind: 'company' },
    { id: 'cogioi', name: 'Đội cơ giới', kind: 'company' },
    { id: 'vantai', name: 'Đội vận tải', kind: 'company' },
    { id: 'vantai-thue', name: 'Đội vận tải thuê ngoài — Long Phát', kind: 'outsourced', supplier: 'pt5' },
    { id: 'caulao-thue', name: 'Tổ cầu lao thuê — 568', kind: 'outsourced', supplier: 'pt5' },
  ];
  // nhân công thuê ngoài bổ sung (không có hồ sơ chính thức, gom theo tổ)
  DB.outsourcedCrews = [
    { id: 'oc1', proj: 'p1', team: 'caulao-thue', name: 'Tổ cầu lao đắp lề', supplier: 'pt5', count: 18, role: 'Đắp lề, hoàn thiện thủ công', leadName: 'Hoàng Văn Tỉnh', phone: '0978 552 110', start: '2026-04-01', end: '2026-06-30', dayRate: 0.42 },
    { id: 'oc2', proj: 'p1', team: 'vantai-thue', name: 'Tổ lái xe điều phối', supplier: 'pt5', count: 4, role: 'Lái xe ben điều phối đất', leadName: 'Lý Văn Phúc', phone: '0935 778 220', start: '2026-05-01', end: '2026-05-31', dayRate: 0.55 },
  ];
  DB.teamName = (id) => (DB.teams.find(t => t.id === id) || {}).name || id;

  /* ===== 7. Chứng chỉ / giấy phép người lái (cho cảnh báo) ===== */
  DB.personCerts = [
    { person: 'u3', name: 'Chứng chỉ vận hành máy xúc hạng II', no: 'VH-II-3321', expiry: '2027-03-15' },
    { person: 'u6', name: 'Chứng chỉ vận hành lu hạng II', no: 'VH-II-5510', expiry: '2026-06-20' },
    { person: 'u7', name: 'Chứng chỉ vận hành lu hạng II', no: 'VH-II-5511', expiry: '2026-12-01' },
    { person: 'u10', name: 'GPLX hạng FC', no: 'FC-290114', expiry: '2026-06-25' },
    { person: 'u11', name: 'GPLX hạng FC', no: 'FC-290552', expiry: '2027-01-10' },
    { person: 'u3', name: 'Chứng chỉ ATLĐ nhóm 3', no: 'AT3-1120', expiry: '2026-06-09' },
  ];

  /* ===== 8. Định mức vật liệu (cho hao hụt) — gắn dự toán theo dự án ===== */
  DB.materialBudget = {
    p1: [
      { mat: 'Đất đắp K95', unit: 'm³', plan: 320000, actual: 332800, allow: 3 },
      { mat: 'Cấp phối đá dăm (CPĐD)', unit: 'm³', plan: 48500, actual: 50900, allow: 4 },
      { mat: 'Bê tông thương phẩm M300', unit: 'm³', plan: 6200, actual: 6510, allow: 2 },
      { mat: 'Cát vàng', unit: 'm³', plan: 12400, actual: 13380, allow: 5 },
      { mat: 'Xi măng PCB40', unit: 'tấn', plan: 1850, actual: 1905, allow: 2 },
      { mat: 'Thép D≥10', unit: 'tấn', plan: 420, actual: 426, allow: 1.5 },
    ],
  };

  /* ===== 9. Phân loại vật tư chi tiết (5 nhóm) ===== */
  DB.matCats = [
    { id: 'nvl', name: 'Vật liệu xây dựng', icon: 'cube' },
    { id: 'nl', name: 'Nhiên liệu', icon: 'droplet' },
    { id: 'phu', name: 'Vật tư phụ / tiêu hao', icon: 'package' },
    { id: 'phutung', name: 'Phụ tùng thay thế', icon: 'wrench' },
  ];
  // bổ sung vài vật tư phụ & phụ tùng
  DB.materials.push(
    { id: 'm9', code: 'VT-P-0001', name: 'Cốp pha thép định hình', type: 'phu', unit: 'Bộ', spec: '1.5×3m', stock: 42, min: 20, price: 1.8, wh: 'wh2' },
    { id: 'm10', code: 'VT-P-0002', name: 'Bảo hộ lao động (bộ)', type: 'phu', unit: 'Bộ', spec: 'Áo+nón+găng', stock: 35, min: 30, price: 0.25, wh: 'wh2' },
    { id: 'm11', code: 'VT-PT-0001', name: 'Lọc dầu máy xúc CAT', type: 'phutung', unit: 'Cái', spec: 'CAT 320', stock: 6, min: 8, price: 0.45, wh: 'wh1' },
    { id: 'm12', code: 'VT-PT-0002', name: 'Gầu nghiền BS', type: 'phutung', unit: 'Cái', spec: 'D1.2m', stock: 2, min: 1, price: 12, wh: 'wh1' },
  );
  // gán kho cho vật tư cũ
  DB.materials.forEach(m => { if (!m.wh) m.wh = m.type === 'nl' ? 'wh2' : (m.type === 'phutung' ? 'wh1' : 'wh2'); });
  DB.matCatLabel = (t) => (DB.matCats.find(c => c.id === t) || {}).name || t;

  /* ===== helper: lịch sử toàn trình của 1 thiết bị ===== */
  DB.equipTimeline = function (eid) {
    const ev = [];
    DB.equipTransfers.filter(t => t.equip === eid).forEach(t => ev.push({ date: t.date, kind: 'transfer', icon: 'refresh', color: 'var(--blue-500)', title: 'Điều chuyển', desc: 'Từ ' + locName(t.from) + ' → ' + locName(t.to) + ' · ' + t.reason, meta: t.doc }));
    DB.equipRepairs.filter(r => r.equip === eid).forEach(r => ev.push({ date: r.date, kind: 'repair', icon: 'wrench', color: 'var(--orange-500)', title: r.type, desc: r.content, meta: window.money ? window.money(r.cost) : r.cost + ' tr' }));
    DB.operatorHistory.filter(o => o.equip === eid).forEach(o => ev.push({ date: o.from, kind: 'operator', icon: 'customer', color: 'var(--teal-500)', title: 'Gán người vận hành', desc: (DB.byId[o.person] || {}).name + (o.current ? ' (hiện tại)' : ' (đến ' + window.dmy(o.to) + ')'), meta: '' }));
    return ev.sort((a, b) => b.date.localeCompare(a.date));
  };
  function locName(id) {
    if (DB.byId[id]) return DB.byId[id].name;
    const p = DB.projects.find(x => x.id === id); if (p) return p.name;
    const w = DB.warehouses.find(x => x.id === id); if (w) return w.name;
    const pt = DB.partners.find(x => x.id === id); if (pt) return pt.name;
    return id;
  }
  DB.locName = locName;

  /* ===== 10. Lịch sử quét QR đếm chuyến — từng lượt quét ===== */
  // Đăng ký xe theo biển số (gồm xe nội bộ + xe thuê CTY 568)
  const PLATE_REG = {
    '29C-15653': { name: 'Xe điều phối 568', series: 'DP-568-2022', driver: 'Lý Văn Phúc', vol: 20 },
    '29C-02617': { name: 'Xe ben 568 - 02', series: 'BEN-568-02', driver: 'Nông Văn Đại', vol: 20 },
    '29C-15618': { name: 'Xe ben 568 - 03', series: 'BEN-568-03', driver: 'Hoàng Văn Tỉnh', vol: 20 },
    '29C-15678': { name: 'Xe ben 568 - 04', series: 'BEN-568-04', driver: 'Vi Văn Thành', vol: 20 },
    '29C-15605': { name: 'Xe ben 568 - 05', series: 'BEN-568-05', driver: 'Lương Văn Sỹ', vol: 20 },
    '29C-15501': { name: 'Xe ben 568 - 06', series: 'BEN-568-06', driver: 'Triệu Văn Quý', vol: 20 },
    '29C-15655': { name: 'Xe ben 568 - 07', series: 'BEN-568-07', driver: 'Bế Văn Hoàn', vol: 20 },
    '29C-15621': { name: 'Xe ben 568 - 08', series: 'BEN-568-08', driver: 'Đàm Văn Lực', vol: 20 },
    '29H-21544': { name: 'Xe Howo 4 chân (Xe 44)', series: 'HOWO-44-2021', driver: 'Bùi Văn Khoa', vol: 12, equip: 'e5' },
    '29H-21557': { name: 'Xe Howo 3 chân (Xe 57)', series: 'HOWO-57-2021', driver: 'Bùi Văn Khoa', vol: 10, equip: 'e6' },
  };
  DB.plateReg = PLATE_REG;
  const SCANNERS = ['u8', 'u5']; // cán bộ vật tư / kỹ thuật trực điểm đổ
  // sinh từng lượt quét từ drops (mỗi chuyến = 1 lượt quét)
  function addMin(hhmm, mins) {
    let [h, m] = hhmm.split(':').map(Number); m += mins; h += Math.floor(m / 60); m = m % 60;
    return String(h % 24).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }
  const qrScans = [];
  let sid = 1;
  DB.drops.forEach(d => {
    const reg = PLATE_REG[d.plate] || { name: d.plate, series: '—', driver: '—', vol: d.vol / d.trips };
    const per = +(d.vol / d.trips).toFixed(1);
    for (let i = 0; i < d.trips; i++) {
      qrScans.push({
        id: 'qr' + (sid++), date: d.date, time: addMin(d.time, i * 7),
        plate: d.plate, equip: reg.equip || null, name: reg.name, series: reg.series,
        driver: reg.driver, scanner: SCANNERS[(sid) % SCANNERS.length], vol: per,
        work: d.work, gps: 'Km7+' + (200 + i * 5),
      });
    }
  });
  // thêm vài lượt của xe Howo nội bộ (đổ tại bãi)
  ['29H-21544', '29H-21557'].forEach((pl, k) => {
    const reg = PLATE_REG[pl];
    for (let i = 0; i < (k === 0 ? 6 : 5); i++) qrScans.push({ id: 'qr' + (sid++), date: '2026-05-16', time: addMin('07:50', i * 23 + k * 11), plate: pl, equip: reg.equip, name: reg.name, series: reg.series, driver: reg.driver, scanner: 'u5', vol: reg.vol, work: 'Vận chuyển đất đắp K95', gps: 'Km4+' + (500 + i * 20) });
  });
  qrScans.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  DB.qrScans = qrScans;

  // báo cáo ngày của 1 thiết bị (gộp theo biển + ngày)
  DB.qrDailyByPlate = function (date) {
    const map = {};
    DB.qrScans.filter(s => !date || s.date === date).forEach(s => {
      const key = s.date + '|' + s.plate;
      if (!map[key]) map[key] = { date: s.date, plate: s.plate, name: s.name, series: s.series, driver: s.driver, equip: s.equip, trips: 0, vol: 0, first: s.time, last: s.time };
      const r = map[key]; r.trips++; r.vol += s.vol; if (s.time < r.first) r.first = s.time; if (s.time > r.last) r.last = s.time;
    });
    return Object.values(map).sort((a, b) => b.trips - a.trips);
  };

  /* ===== 11. Nhân sự thuê ngoài — hợp đồng, người quản lý, lương trả ===== */
  // mỗi nhân sự thuê ngoài (theo person trong projectStaff staffType=outsourced)
  DB.outsourcedInfo = {
    u11: {
      supplierType: 'company', supplier: 'pt5', // nhà cung cấp nhân lực
      manager: 'u4',           // ai quản lý (chỉ huy / đội trưởng)
      contractNo: 'HĐNL-2026-018', contractFrom: '2026-05-01', contractTo: '2026-05-31',
      payForm: 'trip',         // theo chuyến
      rate: 0.18, rateUnit: 'chuyến',
      account: false,          // không có tài khoản hệ thống
      idCard: '024090001234', birth: 1990, home: 'Cao Lộc, Lạng Sơn', phone: '0935 778 220',
    },
  };
  // hợp đồng cung cấp nhân lực (cấp tổ/đội)
  DB.laborContracts = [
    { id: 'LC1', supplier: 'pt5', no: 'HĐNL-2026-018', team: 'vantai-thue', proj: 'p1', from: '2026-05-01', to: '2026-05-31', count: 4, payForm: 'trip', rate: 0.18, value: 95, status: 'active', manager: 'u4' },
    { id: 'LC2', supplier: 'pt5', no: 'HĐNL-2026-011', team: 'caulao-thue', proj: 'p1', from: '2026-04-01', to: '2026-06-30', count: 18, payForm: 'day', rate: 0.42, value: 412, status: 'active', manager: 'u4' },
  ];
  // bảng lương trả cho nhân sự thuê ngoài (theo tháng)
  DB.outsourcedPay = {
    u11: [
      { month: '05/2026', trips: 51, rate: 0.18, gross: 9.18, advance: 4.0, net: 5.18, status: 'pending', payTo: 'supplier' },
      { month: '04/2026', trips: 62, rate: 0.18, gross: 11.16, advance: 5.0, net: 6.16, status: 'paid', payTo: 'supplier' },
    ],
  };
  // timesheet thuê ngoài (chấm công theo ngày — đơn giản)
  DB.outsourcedTimesheet = {
    u11: [
      { date: '2026-05-16', in: '06:50', out: '17:20', trips: 8, status: 'ok' },
      { date: '2026-05-15', in: '06:55', out: '17:10', trips: 9, status: 'ok' },
      { date: '2026-05-14', in: '07:10', out: '16:40', trips: 7, status: 'late' },
      { date: '2026-05-13', in: '—', out: '—', trips: 0, status: 'off' },
      { date: '2026-05-12', in: '06:48', out: '17:30', trips: 10, status: 'ok' },
    ],
  };

  /* ===== 12. Lịch sử lương nhân sự cơ hữu (theo tháng) ===== */
  DB.payHistory = {
    u3: [{ month: '04/2026', cong: 26, caMay: 18, base: 12, ot: 2.4, gross: 16.8, net: 15.2, status: 'paid' }, { month: '03/2026', cong: 25, caMay: 16, base: 12, ot: 1.8, gross: 15.9, net: 14.4, status: 'paid' }, { month: '02/2026', cong: 22, caMay: 14, base: 12, ot: 1.2, gross: 14.1, net: 12.9, status: 'paid' }],
    u6: [{ month: '04/2026', cong: 27, caMay: 20, base: 10.5, ot: 3.1, gross: 15.6, net: 14.1, status: 'paid' }, { month: '03/2026', cong: 26, caMay: 18, base: 10.5, ot: 2.5, gross: 14.8, net: 13.5, status: 'paid' }],
    u7: [{ month: '04/2026', cong: 25, caMay: 17, base: 10.5, ot: 2.0, gross: 14.2, net: 12.9, status: 'paid' }],
    u10: [{ month: '04/2026', cong: 26, caMay: 0, base: 11, ot: 2.8, gross: 15.4, net: 14.0, status: 'paid' }],
  };
  DB.supplierName = (id) => (DB.partners.find(x => x.id === id) || {}).name || id;
})();
