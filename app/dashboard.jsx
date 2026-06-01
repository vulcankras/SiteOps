/* Dashboard điều hành — KPI, charts, draggable widgets, filters → window.Dashboard */
(function () {
  const { useState } = React;
  const { Icon, DB, Stat, BarChart, LineChart, Donut, Bar, Badge, nf, money, dmy, TASK_ST, AvatarStack } = window;

  function Widget({ id, title, icon, right, children, edit, drag, span = 1, h }) {
    return (
      <div className="card" draggable={edit} {...drag}
        style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', cursor: edit ? 'grab' : 'default', outline: edit ? '1.5px dashed var(--blue-300)' : 'none', minHeight: h }}>
        <div className="card-head">
          <div className="card-title">{edit && <Icon name="grip" size={14} style={{ color: 'var(--ink-400)' }} />}{icon && <Icon name={icon} size={15} style={{ color: 'var(--blue-600)' }} />}{title}</div>
          {right}
        </div>
        <div style={{ padding: 14, flex: 1 }}>{children}</div>
      </div>
    );
  }

  function Dashboard({ go }) {
    const [edit, setEdit] = useState(false);
    const [scope, setScope] = useState('all');
    const [range, setRange] = useState('week');
    const initial = ['vol', 'projects', 'equip', 'trips', 'fuel', 'tasks', 'people', 'alerts'];
    const [order, setOrder] = useState(initial);
    const dragIdx = React.useRef(null);

    const onDragStart = (i) => () => { dragIdx.current = i; };
    const onDrop = (i) => (e) => { e.preventDefault(); const from = dragIdx.current; if (from == null || from === i) return; setOrder(o => { const a = [...o]; const [m] = a.splice(from, 1); a.splice(i, 0, m); return a; }); dragIdx.current = null; };
    const dragProps = (i) => edit ? { onDragStart: onDragStart(i), onDragOver: e => e.preventDefault(), onDrop: onDrop(i) } : {};

    const volData = [
      { label: 'T2', value: 620 }, { label: 'T3', value: 740 }, { label: 'T4', value: 810 },
      { label: 'T5', value: 690 }, { label: 'T6', value: 854 }, { label: 'T7', value: 1020 }, { label: 'CN', value: 410 },
    ].map(d => ({ ...d, color: 'var(--orange-500)' }));

    const equipDonut = [
      { label: 'Đang hoạt động', value: 5, color: 'var(--green-500)' },
      { label: 'Đang nghỉ', value: 1, color: 'var(--ink-400)' },
      { label: 'Đang sửa chữa', value: 1, color: 'var(--amber-500)' },
      { label: 'Cho thuê', value: 1, color: 'var(--violet-500)' },
    ];

    const tripsLine = [{ color: 'var(--blue-500)', fill: 'var(--blue-500)', data: [38, 51, 44, 49, 51, 62, 24] }];

    const WIDGETS = {
      vol: () => <Widget id="vol" title="Khối lượng đào / đắp (7 ngày)" icon="cube" span={2} edit={edit} drag={dragProps(order.indexOf('vol'))}
        right={<span className="badge badge-orange">Tổng tuần: 5.144 m³</span>}>
        <BarChart data={volData} unit=" m³" />
      </Widget>,
      projects: () => <Widget id="projects" title="Tiến độ dự án" icon="road" span={2} edit={edit} drag={dragProps(order.indexOf('projects'))}
        right={<button className="btn btn-sm btn-ghost" onClick={() => go({ page: 'cong-truong' })}>Xem tất cả</button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {DB.projects.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => go({ page: 'cong-truong', sub: 'detail', id: p.id })}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)' }}>{p.progress}%</span>
                </div>
                <Bar value={p.progress} />
              </div>
            </div>
          ))}
        </div>
      </Widget>,
      equip: () => <Widget id="equip" title="Phân bổ thiết bị" icon="excavator" edit={edit} drag={dragProps(order.indexOf('equip'))}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Donut data={equipDonut} size={118} center={<><div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{DB.equipment.length}</div><div style={{ fontSize: 10, color: 'var(--ink-500)' }}>thiết bị</div></>} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {equipDonut.map((d, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} /><span style={{ flex: 1, color: 'var(--ink-600)' }}>{d.label}</span><b className="mono">{d.value}</b>
            </div>)}
          </div>
        </div>
      </Widget>,
      trips: () => <Widget id="trips" title="Chuyến xe vận chuyển / ngày" icon="truck" edit={edit} drag={dragProps(order.indexOf('trips'))}
        right={<span className="badge badge-blue">Hôm nay: 51</span>}>
        <LineChart series={tripsLine} labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']} height={150} />
      </Widget>,
      fuel: () => <Widget id="fuel" title="Tiêu hao nhiên liệu (tháng)" icon="fuel" edit={edit} drag={dragProps(order.indexOf('fuel'))}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[{ n: 'Máy xúc CAT 320', v: 6.8, max: 10, t: 'orange' }, { n: 'Lu Komatsu 38', v: 4.2, max: 10 }, { n: 'Máy ủi CAT D6', v: 8.1, max: 10, t: 'red' }, { n: 'Lu XCMG 4.1', v: 3.6, max: 10 }].map((m, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}><span>{m.n}</span><b className="mono">{m.v} L/giờ</b></div>
              <Bar value={m.v} max={m.max} tone={m.t} />
            </div>
          ))}
        </div>
      </Widget>,
      tasks: () => <Widget id="tasks" title="Công việc cần chú ý" icon="tasks" edit={edit} drag={dragProps(order.indexOf('tasks'))}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DB.tasks.filter(t => t.status !== 'done').slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div><div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{t.code}</div></div>
              <Badge map={TASK_ST} k={t.status} />
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, width: 34, textAlign: 'right' }}>{t.progress}%</span>
            </div>
          ))}
        </div>
      </Widget>,
      people: () => <Widget id="people" title="Nhân sự hôm nay" icon="users" edit={edit} drag={dragProps(order.indexOf('people'))}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {[{ l: 'Có mặt', v: 78, c: 'var(--green-600)' }, { l: 'Đi muộn', v: 5, c: 'var(--amber-600)' }, { l: 'Vắng', v: 3, c: 'var(--red-600)' }].map((x, i) =>
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: 'var(--surface-2)', borderRadius: 6 }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: x.c }}>{x.v}</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{x.l}</div>
            </div>)}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-600)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Đang ở hiện trường</span><AvatarStack ids={['u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u10']} max={6} />
        </div>
      </Widget>,
      alerts: () => <Widget id="alerts" title="Cảnh báo" icon="alert" edit={edit} drag={dragProps(order.indexOf('alerts'))}
        right={<button className="btn btn-sm btn-ghost" onClick={() => go({ page: 'kho-canh-bao' })}>Xem</button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DB.alerts.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.level === 'red' ? 'var(--red-500)' : 'var(--amber-500)', marginTop: 5, flex: 'none' }} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 12 }}>{a.title}</div><div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{a.desc}</div></div>
            </div>
          ))}
        </div>
      </Widget>,
    };

    return (
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><span>Trang chủ</span></div>
            <h1 className="page-title">Dashboard điều hành</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="seg">
              {[['all', 'Tất cả dự án'], ['p1', 'Hữu Nghị–Chi Lăng'], ['p2', 'Đồng Văn']].map(([k, l]) =>
                <button key={k} className={scope === k ? 'active' : ''} onClick={() => setScope(k)}>{l}</button>)}
            </div>
            <div className="seg">
              {[['week', 'Tuần'], ['month', 'Tháng'], ['quarter', 'Quý']].map(([k, l]) =>
                <button key={k} className={range === k ? 'active' : ''} onClick={() => setRange(k)}>{l}</button>)}
            </div>
            <button className={'btn btn-sm ' + (edit ? 'btn-primary' : '')} onClick={() => setEdit(e => !e)}><Icon name="sliders" size={14} />{edit ? 'Xong' : 'Tuỳ chỉnh'}</button>
          </div>
        </div>

        {edit && <div className="card card-pad" style={{ marginBottom: 12, background: 'var(--blue-50)', borderColor: 'var(--blue-200)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
          <Icon name="info" size={16} style={{ color: 'var(--blue-600)' }} />Kéo–thả các thẻ để sắp xếp lại bố cục Dashboard theo ý bạn. Mỗi biểu đồ đều có bộ lọc riêng.</div>}

        {/* KPI row */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 12 }}>
          <Stat label="Dự án đang chạy" icon="road" value="3" unit="/4" edge="var(--blue-500)" foot="1 tạm dừng" />
          <Stat label="Tiến độ trung bình" icon="target" value="55" unit="%" delta="4%" edge="var(--green-500)" foot="so với tháng trước" />
          <Stat label="KL đắp tháng 5" icon="cube" value="18.4" unit="k m³" delta="12%" edge="var(--orange-500)" />
          <Stat label="Giờ máy tháng 5" icon="clock" value="2.180" unit="giờ" edge="var(--violet-500)" foot="24 thiết bị" />
          <Stat label="Giải ngân tháng 5" icon="wallet" value="92.4" unit="tỷ" delta="8%" deltaDir="down" edge="var(--teal-500)" foot="3 dự án" />
          <Stat label="Nhân sự hoạt động" icon="users" value="86" unit="người" edge="var(--amber-500)" foot="5 đội thi công" />
        </div>

        {/* widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'start' }}>
          {order.map((id) => React.cloneElement(WIDGETS[id](), { key: id }))}
        </div>
      </div>
    );
  }
  window.Dashboard = Dashboard;
})();
