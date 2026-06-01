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

  function TaskRow({ t, child, go, showProject, onOpen }) {
    const proj = DB.projects.find(p => p.id === t.proj);
    return (
      <tr className="clickable" onClick={() => onOpen ? onOpen(t) : (go && go({ page: 'cong-truong', sub: 'detail', id: t.proj, tab: 'cong-viec' }))}>
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

  const TYPE_CFG = {
    'Đào đất': { mode: 'volume', specs: [['Cấp đất', 'Cấp III'], ['Hệ số nở rời', '1.2']] },
    'Đắp đất': { mode: 'volume', specs: [['Độ chặt yêu cầu', 'K95'], ['Chiều dày lớp', '30 cm']] },
    'San nền': { mode: 'volume', specs: [['Cao độ thiết kế', 'Theo bản vẽ'], ['Độ dốc ngang', '2%']] },
    'Lu lèn': { mode: 'volume', specs: [['Độ chặt', 'K98'], ['Số lượt lu', '8–10 lượt']] },
    'Móng đường': { mode: 'volume', specs: [['Vật liệu', 'CPĐD loại I'], ['Mô đun đàn hồi', 'E≥200 MPa']] },
    'Đổ bê tông': { mode: 'checklist', checklist: ['Nghiệm thu cốt thép', 'Nghiệm thu ván khuôn', 'Kiểm tra mác BT & độ sụt', 'Đổ & đầm bê tông', 'Bảo dưỡng bê tông', 'Tháo ván khuôn'] },
    'Thoát nước': { mode: 'checklist', checklist: ['Đào hố móng', 'Bê tông lót', 'Lắp đặt cống / ống', 'Đắp trả & lu lèn', 'Hoàn thiện hố ga'] },
    'Thi công cầu': { mode: 'checklist', checklist: ['Cọc khoan nhồi', 'Bệ trụ', 'Thân trụ', 'Lắp dầm', 'Bản mặt cầu', 'Lan can & hoàn thiện'] },
    'Chuẩn bị': { mode: 'checklist', checklist: ['Bàn giao mốc giới', 'Dọn dẹp mặt bằng', 'Làm đường công vụ', 'Lán trại & bãi tập kết'] },
    'Hoàn thiện': { mode: 'checklist', checklist: ['Xây tường', 'Tô trát', 'Sơn bả', 'Hoàn thiện chi tiết'] },
  };
  const cfgOf = (t) => TYPE_CFG[t.type] || { mode: t.calc === 'volume' ? 'volume' : 'checklist', checklist: ['Chuẩn bị', 'Thi công', 'Nghiệm thu', 'Hoàn thành'] };

  function TaskActions({ t, onClose, onSub }) {
    const [tab, setTab] = useState('detail');
    const [st, setSt] = useState(t.status);
    const cfg = cfgOf(t);
    const area = DB.areas.find(a => a.id === t.area);
    const [checks, setChecks] = useState((cfg.checklist || []).map((_, i) => i < Math.round((cfg.checklist || []).length * t.progress / 100)));
    const volSeries = [{ color: 'var(--orange-500)', fill: 'var(--orange-500)', data: [3.2, 4.1, 3.8, 5.0, 4.5, 6.2].map(x => x * (t.planVol > 100000 ? 1000 : 10)) }];
    const proj = DB.projects.find(p => p.id === t.proj);
    return (
      <Modal title={t.name} sub={t.code + ' · ' + proj.name} width={640} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Đóng</button>{tab !== 'detail' && <button className="btn btn-primary" onClick={() => { toast(tab === 'progress' ? 'Đã ghi nhận tiến độ' : 'Đã chuyển trạng thái'); onClose(); }}>Lưu</button>}</>}>
        <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['detail', 'Xem chi tiết', 'eye'], ['progress', 'Báo cáo tiến độ', 'target'], ['status', 'Chuyển trạng thái', 'refresh'], ['sub', 'Tạo công việc con', 'plus']].map(([k, l, ic]) => (
            <button key={k} onClick={() => k === 'sub' ? onSub() : setTab(k)} className={'btn btn-sm ' + (tab === k ? 'btn-primary' : '')}><Icon name={ic} size={14} />{l}</button>
          ))}
        </div>
        {tab === 'detail' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 14 }}>
              {[['Loại công việc', t.type], ['Người thực hiện', DB.byId[t.assignee].name], ['Cách tính', { volume: 'Theo khối lượng', percent: 'Theo %', weighted: 'Theo tỷ trọng' }[t.calc]], ['Thời gian', dmy(t.start) + ' – ' + dmy(t.end)]].map(([k, v]) =>
                <div key={k}><div className="muted" style={{ fontSize: 11 }}>{k}</div><div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{v}</div></div>)}
            </div>
            {area && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, marginBottom: 14 }}>
                <Icon name="map-pin" size={16} style={{ color: 'var(--orange-500)' }} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>{area.name}</div><div className="mono muted" style={{ fontSize: 10.5 }}>{area.kmS} → {area.kmE} · {nf(area.len)} m · {DB.byId[area.mgr].name}</div></div>
                <div style={{ textAlign: 'right' }}><div className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{area.progress}%</div><div className="muted" style={{ fontSize: 10 }}>khu vực</div></div>
              </div>
            )}
            {cfg.mode === 'volume' ? (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 8, padding: '11px 13px' }}><div className="muted" style={{ fontSize: 11 }}>Khối lượng thực hiện</div><div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange-600)' }}>{nf(t.doneVol)}<span style={{ fontSize: 12, color: 'var(--ink-400)' }}> / {nf(t.planVol)} {t.unit}</span></div></div>
                  <div style={{ width: 130, background: 'var(--surface-2)', borderRadius: 8, padding: '11px 13px' }}><div className="muted" style={{ fontSize: 11 }}>Tiến độ</div><div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue-700)' }}>{t.progress}%</div></div>
                </div>
                {cfg.specs && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 14px', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
                  <div style={{ gridColumn: 'span 2', fontWeight: 700, fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Thông số kỹ thuật</div>
                  {cfg.specs.map(([k, v]) => <React.Fragment key={k}><span className="muted">{k}</span><b style={{ textAlign: 'right' }}>{v}</b></React.Fragment>)}
                </div>}
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div className="card-head"><div className="card-title"><Icon name="cube" size={14} style={{ color: 'var(--orange-500)' }} />Sản lượng 6 ngày gần nhất</div></div>
                  <div style={{ padding: 12 }}><window.BarChart data={volSeries[0].data.map((v, i) => ({ label: 'N' + (i + 1), value: v, color: 'var(--orange-500)' }))} height={120} unit={' ' + t.unit} /></div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <b style={{ fontSize: 12.5 }}><Icon name="check-circle" size={14} style={{ color: 'var(--green-600)', marginRight: 5 }} />Hạng mục / Nghiệm thu</b>
                  <span className="badge badge-blue">{checks.filter(Boolean).length}/{checks.length} · {Math.round(checks.filter(Boolean).length / checks.length * 100)}%</span>
                </div>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {cfg.checklist.map((item, i) => (
                    <label key={i} onClick={() => setChecks(c => c.map((v, j) => j === i ? !v : v))} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderBottom: i < cfg.checklist.length - 1 ? '1px solid var(--line-soft)' : 'none', cursor: 'pointer' }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, border: '1.5px solid ' + (checks[i] ? 'var(--green-500)' : 'var(--ink-300)'), background: checks[i] ? 'var(--green-500)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{checks[i] && <Icon name="check" size={13} style={{ color: '#fff' }} />}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, textDecoration: checks[i] ? 'line-through' : 'none', color: checks[i] ? 'var(--ink-500)' : 'var(--ink-800)' }}>{item}</span>
                      {checks[i] && <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: 10 }}>Đạt</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'progress' && (
          <div>
            <div className="auto-note" style={{ marginTop: 0, marginBottom: 14 }}><Icon name="info" size={13} />Nhập khối lượng/tỷ lệ thực hiện hôm nay — hệ thống cập nhật tiến độ & đẩy vào báo cáo, S-curve.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <window.Field label="Ngày báo cáo"><input className="input" type="date" defaultValue="2026-06-02" /></window.Field>
              <window.Field label={t.calc === 'volume' ? 'Khối lượng hôm nay (' + t.unit + ')' : '% hoàn thành hôm nay'}><input className="input mono" placeholder={t.calc === 'volume' ? 'VD: 1.200' : 'VD: 5'} /></window.Field>
              <window.Field label="Nội dung thực hiện" span={2}><textarea className="textarea" placeholder="Mô tả phần việc đã làm…" /></window.Field>
              <window.Field label="Ảnh hiện trường" span={2}><div className="ph" style={{ height: 64, flexDirection: 'column', gap: 4, cursor: 'pointer' }}><Icon name="camera" size={18} /><span style={{ fontSize: 11 }}>Chụp / tải ảnh</span></div></window.Field>
            </div>
          </div>
        )}
        {tab === 'status' && (
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Chọn trạng thái mới cho công việc:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {KANBAN.map(c => (
                <label key={c.id} onClick={() => setSt(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid ' + (st === c.id ? 'var(--blue-500)' : 'var(--line)'), borderRadius: 8, cursor: 'pointer', background: st === c.id ? 'var(--blue-50)' : '#fff' }}>
                  <span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid ' + (st === c.id ? 'var(--blue-600)' : 'var(--ink-300)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{st === c.id && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-600)' }} />}</span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </Modal>
    );
  }

  function TaskBoard({ projId, go, embedded }) {
    const [view, setView] = useState('list');
    const [create, setCreate] = useState(false);
    const [q, setQ] = useState('');
    const [sel, setSel] = useState(null);
    const tasks = DB.tasks.filter(t => !projId || t.proj === projId);
    const match = (t) => !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.code.toLowerCase().includes(q.toLowerCase());
    const childrenOf = (id) => tasks.filter(t => t.parent === id);
    const parents = tasks.filter(t => !t.parent && (match(t) || childrenOf(t.id).some(match)));

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="seg">
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><Icon name="list" size={14} />Danh sách</button>
              <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><Icon name="kanban" size={14} />Kanban</button>
              {projId && <button className={view === 'timeline' ? 'active' : ''} onClick={() => setView('timeline')}><Icon name="timeline" size={14} />Timeline</button>}
            </div>
            <window.Search placeholder="Tìm tên / mã công việc…" value={q} onChange={setQ} w={220} />
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
                {parents.map(t => <React.Fragment key={t.id}><TaskRow t={t} go={go} showProject={!projId} onOpen={setSel} />{childrenOf(t.id).filter(c => match(t) || match(c)).map(c => <TaskRow key={c.id} t={c} child go={go} showProject={!projId} onOpen={setSel} />)}</React.Fragment>)}
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
        {sel && <TaskActions t={sel} onClose={() => setSel(null)} onSub={() => { setSel(null); setCreate(true); }} />}
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
