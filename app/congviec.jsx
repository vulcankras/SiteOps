/* Công việc — TaskBoard tái sử dụng (List / Kanban / Timeline) + trang Công việc tổng → window.TaskBoard, window.CongViec */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, dmy, nf, Avatar, Modal, Field, toast, TASK_ST } = window;

  const KANBAN = [
    { id: 'todo', label: 'Chưa làm', color: 'var(--ink-400)' },
    { id: 'doing', label: 'Đang làm', color: 'var(--blue-500)' },
    { id: 'review', label: 'Chờ nghiệm thu', color: 'var(--amber-500)' },
    { id: 'done', label: 'Hoàn thành', color: 'var(--green-500)' },
  ];
  const CALC = { volume: 'Theo khối lượng', percent: 'Theo %', weighted: 'Theo tỷ trọng' };

  function TaskRow({ t, child, go, showProject }) {
    const proj = DB.projects.find(p => p.id === t.proj);
    return (
      <tr className="clickable" onClick={() => go && go({ page: 'cong-truong', sub: 'detail', id: t.proj, tab: 'cong-viec' })}>
        <td style={{ paddingLeft: child ? 30 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {child ? <Icon name="chevron-right" size={12} style={{ color: 'var(--ink-300)' }} /> : <span style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--blue-500)' }} />}
            <div><div style={{ fontWeight: 600, fontSize: 12.5 }}>{t.name}</div><div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{t.code}</div></div>
          </div>
        </td>
        <td><span className="badge badge-gray">{t.type}</span></td>
        {showProject && <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: DB.templates.find(x => x.id === proj.template).color, flex: 'none' }} /><span style={{ fontSize: 12, fontWeight: 500 }}>{proj.name}</span></div></td>}
        <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={t.assignee} size="av-sm" /><span style={{ fontSize: 12 }}>{DB.byId[t.assignee].name}</span></div></td>
        <td className="num" style={{ fontSize: 11.5 }}>{t.calc === 'volume' ? nf(t.doneVol) + ' / ' + nf(t.planVol) + ' ' + t.unit : '—'}</td>
        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120 }}><Bar value={t.progress} /><span className="mono" style={{ fontSize: 11.5, fontWeight: 600, width: 32, textAlign: 'right' }}>{t.progress}%</span></div></td>
        <td style={{ fontSize: 11.5 }}>{dmy(t.start)}<br /><span className="muted">{dmy(t.end)}</span></td>
        <td><Badge map={TASK_ST} k={t.status} /></td>
      </tr>
    );
  }

  function TaskBoard({ projId, go, embedded }) {
    const [view, setView] = useState('list');
    const [create, setCreate] = useState(false);
    const tasks = DB.tasks.filter(t => !projId || t.proj === projId);
    const parents = tasks.filter(t => !t.parent);
    const childrenOf = (id) => tasks.filter(t => t.parent === id);

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="seg">
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><Icon name="list" size={14} />Danh sách</button>
              <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><Icon name="kanban" size={14} />Kanban</button>
              {projId && <button className={view === 'timeline' ? 'active' : ''} onClick={() => setView('timeline')}><Icon name="timeline" size={14} />Timeline</button>}
            </div>
            <button className="chip"><Icon name="filter" size={13} />Giai đoạn</button>
            <button className="chip"><Icon name="map-pin" size={13} />Khu vực</button>
            <button className="chip"><Icon name="users" size={13} />Người thực hiện</button>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => setCreate(true)}><Icon name="plus" size={14} />Tạo công việc</button>
        </div>

        {view === 'list' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="tbl">
              <thead><tr><th>Công việc</th><th>Loại</th>{!projId && <th>Công trường</th>}<th>Người thực hiện</th><th className="num">Khối lượng</th><th>Tiến độ</th><th>Thời gian</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {parents.map(t => <React.Fragment key={t.id}><TaskRow t={t} go={go} showProject={!projId} />{childrenOf(t.id).map(c => <TaskRow key={c.id} t={c} child go={go} showProject={!projId} />)}</React.Fragment>)}
              </tbody>
            </table>
          </div>
        )}

        {view === 'kanban' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, alignItems: 'start' }}>
            {KANBAN.map(col => {
              const items = tasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} style={{ background: 'var(--bg-2)', borderRadius: 8, padding: 8, minHeight: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 6px 9px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                    <b style={{ fontSize: 12.5 }}>{col.label}</b>
                    <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>{items.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map(t => (
                      <div key={t.id} className="card" style={{ padding: 11, cursor: 'grab', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span className="badge badge-gray" style={{ fontSize: 10 }}>{t.type}</span><Icon name="grip" size={13} style={{ color: 'var(--ink-300)' }} /></div>
                        {!projId && <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}><span style={{ width: 6, height: 6, borderRadius: 2, background: DB.templates.find(x => x.id === DB.projects.find(p => p.id === t.proj).template).color, flex: 'none' }} /><span style={{ fontSize: 10.5, color: 'var(--ink-500)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{DB.projects.find(p => p.id === t.proj).name}</span></div>}
                        <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 3 }}>{t.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)', marginBottom: 8 }}>{t.code}</div>
                        <Bar value={t.progress} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                          <Avatar id={t.assignee} size="av-sm" />
                          <span style={{ fontSize: 10.5, color: 'var(--ink-500)' }}><Icon name="calendar" size={11} /> {dmy(t.end)}</span>
                          <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{t.progress}%</span>
                        </div>
                      </div>
                    ))}
                    <button className="btn btn-sm btn-ghost" style={{ width: '100%', color: 'var(--ink-500)' }} onClick={() => setCreate(true)}><Icon name="plus" size={13} />Thêm</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'timeline' && projId && <Timeline tasks={parents} childrenOf={childrenOf} />}

        {create && <CreateTask projId={projId} onClose={() => setCreate(false)} />}
      </div>
    );
  }

  function Timeline({ tasks, childrenOf }) {
    const months = ['T11/25', 'T12/25', 'T1/26', 'T2/26', 'T3/26', 'T4/26', 'T5/26', 'T6/26', 'T7/26', 'T8/26', 'T9/26'];
    // map task start/end to column index (rough)
    const monthIdx = (d) => { const [y, m] = d.split('-').map(Number); return (y - 2025) * 12 + (m - 11); };
    const all = tasks.flatMap(t => [t, ...childrenOf(t.id)]);
    return (
      <div className="card" style={{ overflow: 'auto' }}>
        <div style={{ minWidth: 880 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `260px repeat(${months.length},1fr)`, borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
            <div style={{ padding: '9px 12px', fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase' }}>Công việc</div>
            {months.map(m => <div key={m} style={{ padding: '9px 4px', fontSize: 10.5, fontWeight: 600, color: 'var(--ink-500)', textAlign: 'center', borderLeft: '1px solid var(--line-soft)' }}>{m}</div>)}
          </div>
          {all.map(t => {
            const s = Math.max(0, monthIdx(t.start)), e = Math.min(months.length - 1, monthIdx(t.end));
            const span = e - s + 1;
            const col = t.status === 'done' ? 'var(--green-500)' : t.status === 'review' ? 'var(--amber-500)' : t.status === 'doing' ? 'var(--blue-500)' : 'var(--ink-300)';
            return (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: `260px repeat(${months.length},1fr)`, borderBottom: '1px solid var(--line-soft)', alignItems: 'center' }}>
                <div style={{ padding: '8px 12px', paddingLeft: t.parent ? 26 : 12 }}><div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div></div>
                <div style={{ gridColumn: `${s + 2} / span ${span}`, padding: '0 3px' }}>
                  <div style={{ height: 22, background: col, borderRadius: 5, display: 'flex', alignItems: 'center', padding: '0 8px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, width: t.progress + '%', background: 'rgba(255,255,255,.25)' }} />
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, position: 'relative', whiteSpace: 'nowrap' }}>{t.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- Create task form (from spec) ---------- */
  function CreateTask({ projId, onClose }) {
    const [calc, setCalc] = useState('percent');
    return (
      <Modal title="Tạo công việc mới" sub="Form tạo mới công việc — hỗ trợ công việc cha–con (tối đa 2 cấp)" width={760} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Huỷ</button><button className="btn" onClick={() => { toast('Đã lưu nháp'); onClose(); }}>Lưu nháp</button><button className="btn btn-primary" onClick={() => { toast('Đã tạo công việc'); onClose(); }}>Tạo công việc</button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          <Field label="Mã công việc" req><input className="input" defaultValue="CV-202605-009" readOnly style={{ background: 'var(--surface-2)' }} /></Field>
          <Field label="Tên công việc" req><input className="input" placeholder="VD: Đắp đất K95 lớp 5" /></Field>
          <Field label="Loại công việc" req><select className="select"><option>Đào đất</option><option>Đắp đất</option><option>San nền</option><option>Lu lèn</option><option>Đổ bê tông</option><option>Thi công cầu</option><option>Móng đường</option><option>Thoát nước</option></select></Field>
          <Field label="Công việc cha" hint="Hỗ trợ tối đa 2 cấp"><select className="select"><option>— Không —</option><option>Đào & đắp nền đường Km4–Km7</option><option>Thi công nút giao IC3</option></select></Field>
          <Field label="Ngày dự kiến bắt đầu" req><input className="input" type="date" defaultValue="2026-06-01" /></Field>
          <Field label="Ngày dự kiến kết thúc" req><input className="input" type="date" /></Field>
          <Field label="Người thực hiện" req><select className="select">{DB.people.map(p => <option key={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Giao việc theo giờ" hint="Estimated Hours"><input className="input" type="number" placeholder="VD: 320" /></Field>
          <Field label="Khu vực thi công"><select className="select">{DB.areas.filter(a => a.proj === (projId || 'p1')).map(a => <option key={a.id}>{a.name}</option>)}</select></Field>
          <Field label="Giai đoạn"><select className="select">{DB.phases.filter(p => p.proj === (projId || 'p1')).map(p => <option key={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Cách tính tiến độ" req span={2}>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(CALC).map(([k, v]) => (
                <label key={k} onClick={() => setCalc(k)} style={{ flex: 1, border: '1px solid ' + (calc === k ? 'var(--blue-500)' : 'var(--line)'), borderRadius: 7, padding: '9px 11px', display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', background: calc === k ? 'var(--blue-50)' : '#fff' }}>
                  <span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid ' + (calc === k ? 'var(--blue-600)' : 'var(--ink-300)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{calc === k && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-600)' }} />}</span>
                  <span style={{ fontSize: 12 }}>{v}</span>
                </label>
              ))}
            </div>
          </Field>
          {calc === 'volume' && <><Field label="Khối lượng kế hoạch" req><input className="input" type="number" placeholder="m³" /></Field><Field label="Đơn vị"><select className="select"><option>m³</option><option>m²</option><option>tấn</option><option>md</option></select></Field></>}
          <Field label="File đính kèm" span={2}><div className="ph" style={{ height: 70, flexDirection: 'column', gap: 5, cursor: 'pointer' }}><Icon name="upload" size={18} /><span style={{ fontSize: 11 }}>Kéo thả bản vẽ, tài liệu hoặc bấm để chọn</span></div></Field>
        </div>
      </Modal>
    );
  }

  function CongViec({ go, scope }) {
    const scoped = scope && scope !== 'company';
    const proj = scoped ? DB.projects.find(p => p.id === scope) : null;
    const tasksV = DB.tasks.filter(t => !scoped || t.proj === scope);
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><a onClick={() => go({ page: 'dashboard' })} style={{ cursor: 'pointer' }}>Trang chủ</a><Icon name="chevron-right" size={12} /><span>Công việc</span></div>
            <h1 className="page-title">Công việc & Tiến độ</h1>
          </div>
          <div className="seg">
            {scoped
              ? <button className="active">{proj.name}</button>
              : [['Tất cả dự án', 'all'], ['Hữu Nghị–Chi Lăng', 'p1']].map(([l, k], i) => <button key={k} className={i === 0 ? 'active' : ''}>{l}</button>)}
          </div>
        </div>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <window.Stat label="Tổng công việc" icon="tasks" value={tasksV.length} edge="var(--blue-500)" />
          <window.Stat label="Đang thực hiện" icon="play" value={tasksV.filter(t => t.status === 'doing').length} edge="var(--orange-500)" />
          <window.Stat label="Chờ nghiệm thu" icon="check-circle" value={tasksV.filter(t => t.status === 'review').length} edge="var(--amber-500)" />
          <window.Stat label="Hoàn thành" icon="flag" value={tasksV.filter(t => t.status === 'done').length} edge="var(--green-500)" />
        </div>
        <TaskBoard go={go} projId={scoped ? scope : null} />
      </div>
    );
  }

  Object.assign(window, { TaskBoard, CongViec });
})();
