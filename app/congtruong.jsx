/* Công trường — danh sách dự án + Trình tạo Template (cấu hình động) → window.CongTruong */
(function () {
  const { useState } = window.React;
  const { Icon, DB, Badge, Bar, money, dmy, AvatarStack, Avatar, Modal, Field, toast, nf } = window;

  const PROJ_ST = { active: { label: 'Đang thi công', cls: 'badge-green' }, paused: { label: 'Tạm dừng', cls: 'badge-amber' }, done: { label: 'Hoàn thành', cls: 'badge-blue' } };
  const PROG_LABEL = { volume: 'Theo khối lượng (m³)', weighted: 'Theo tỷ trọng công việc', percent: 'Theo % thủ công' };

  function CongTruong({ nav, go, role, scope }) {
    if (nav.sub === 'detail' && window.CTDetail) return <window.CTDetail id={nav.id} go={go} role={role} scope={scope} siteScoped={scope && scope !== 'company'} initTab={nav.tab} />;
    const projects = DB.projects.filter(p => !scope || scope === 'company' || p.id === scope);

    const [view, setView] = useState('grid');
    const [tplModal, setTplModal] = useState(false);
    const [builder, setBuilder] = useState(false);

    return (
      <div className="page">
        <div className="page-head">
          <div>
            <div className="crumbs"><a onClick={() => go({ page: 'dashboard' })} style={{ cursor: 'pointer' }}>Trang chủ</a><Icon name="chevron-right" size={12} /><span>Công trường</span></div>
            <h1 className="page-title">Công trường & Dự án</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={() => setBuilder(true)}><Icon name="sliders" size={14} />Quản lý Template</button>
            <button className="btn btn-sm btn-primary" onClick={() => setTplModal(true)}><Icon name="plus" size={14} />Tạo dự án mới</button>
          </div>
        </div>

        {/* summary strip */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 14 }}>
          <window.Stat label="Tổng dự án" icon="road" value="4" edge="var(--blue-500)" foot="3 đang chạy" />
          <window.Stat label="Tổng giá trị HĐ" icon="wallet" value="3.07" unit="tỷ" edge="var(--green-500)" />
          <window.Stat label="Đã thực hiện" icon="target" value="1.69" unit="tỷ" edge="var(--orange-500)" foot="55% giá trị" />
          <window.Stat label="Nhân sự huy động" icon="users" value="183" unit="người" edge="var(--violet-500)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <window.Search placeholder="Tìm dự án…" />
            <button className="chip"><Icon name="filter" size={13} />Loại dự án</button>
            <button className="chip"><Icon name="flag" size={13} />Trạng thái</button>
          </div>
          <div className="seg">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Icon name="grid" size={14} />Thẻ</button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><Icon name="list" size={14} />Danh sách</button>
          </div>
        </div>

        {view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: 14 }}>
            {projects.map(p => {
              const tpl = DB.templates.find(t => t.id === p.template);
              return (
                <div key={p.id} className="card" style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  onClick={() => go({ page: 'cong-truong', sub: 'detail', id: p.id })}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  {/* map-ish banner */}
                  <div style={{ height: 84, background: `linear-gradient(135deg, ${tpl.color}22, ${tpl.color}0a)`, position: 'relative', borderBottom: '1px solid var(--line-soft)', overflow: 'hidden' }}>
                    <svg width="100%" height="84" style={{ position: 'absolute', inset: 0, opacity: .5 }}><path d="M0 70 Q 80 40 160 55 T 340 30" fill="none" stroke={tpl.color} strokeWidth="2.5" strokeDasharray="2 5" /><path d="M0 78 Q 90 52 170 64 T 360 44" fill="none" stroke={tpl.color} strokeWidth="6" opacity=".25" /></svg>
                    <div style={{ position: 'absolute', top: 11, left: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 7, background: tpl.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={tpl.icon} size={15} /></span>
                      <span className="badge badge-sq" style={{ background: '#fff', color: tpl.color, fontWeight: 600 }}>{tpl.name}</span>
                    </div>
                    <span className={'badge ' + PROJ_ST[p.status].cls} style={{ position: 'absolute', top: 11, right: 13 }}><span className="dot" />{PROJ_ST[p.status].label}</span>
                  </div>
                  <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{p.code}</div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, margin: '2px 0 6px', color: 'var(--ink-900)' }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 11 }}><Icon name="map-pin" size={13} />{p.location} · {p.client}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}><span className="muted">Tiến độ</span><b className="mono">{p.progress}%</b></div>
                    <Bar value={p.progress} />
                    <div style={{ display: 'flex', gap: 14, marginTop: 13, paddingTop: 11, borderTop: '1px solid var(--line-soft)', fontSize: 11.5 }}>
                      <div><div className="muted">Công việc</div><b className="mono">{p.taskDone}/{p.taskTotal}</b></div>
                      <div><div className="muted">Thiết bị</div><b className="mono">{p.equipCount}</b></div>
                      <div><div className="muted">Nhân sự</div><b className="mono">{p.teamCount}</b></div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div className="muted">Giá trị HĐ</div><b className="mono">{money(p.contractValue)}</b></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* add card */}
            <div className="card ph" style={{ minHeight: 280, cursor: 'pointer', flexDirection: 'column', gap: 10 }} onClick={() => setTplModal(true)}>
              <Icon name="plus" size={26} /><div>Tạo dự án mới từ Template</div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="tbl">
              <thead><tr><th>Mã / Tên dự án</th><th>Template</th><th>Địa điểm</th><th>Chỉ huy</th><th>Tiến độ</th><th className="num">Giá trị HĐ</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {projects.map(p => {
                  const tpl = DB.templates.find(t => t.id === p.template);
                  return <tr key={p.id} className="clickable" onClick={() => go({ page: 'cong-truong', sub: 'detail', id: p.id })}>
                    <td><div style={{ fontWeight: 600 }}>{p.name}</div><div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{p.code}</div></td>
                    <td><span className="badge badge-sq" style={{ background: tpl.color + '1a', color: tpl.color }}><Icon name={tpl.icon} size={12} />{tpl.name}</span></td>
                    <td>{p.location}</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar id={p.commander} size="av-sm" />{DB.byId[p.commander].name}</div></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 130 }}><Bar value={p.progress} /><span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{p.progress}%</span></div></td>
                    <td className="num">{money(p.contractValue)}</td>
                    <td><span className={'badge ' + PROJ_ST[p.status].cls}>{PROJ_ST[p.status].label}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}

        {tplModal && <NewProjectModal go={go} onClose={() => setTplModal(false)} />}
        {builder && <TemplateBuilder onClose={() => setBuilder(false)} />}
      </div>
    );
  }

  /* ---------- New project (choose template → dynamic form) ---------- */
  function NewProjectModal({ onClose, go }) {
    const [step, setStep] = useState(1);
    const [tplId, setTplId] = useState(null);
    const tpl = DB.templates.find(t => t.id === tplId);
    return (
      <Modal title="Tạo dự án mới" sub={step === 1 ? 'Bước 1/2 — Chọn loại hình dự án (Template)' : 'Bước 2/2 — Thông tin dự án theo Template'} width={760} onClose={onClose}
        foot={step === 1
          ? <><button className="btn" onClick={onClose}>Huỷ</button><button className="btn btn-primary" disabled={!tplId} onClick={() => setStep(2)}>Tiếp tục<Icon name="arrow-right" size={14} /></button></>
          : <><button className="btn" onClick={() => setStep(1)}><Icon name="arrow-left" size={14} />Quay lại</button><button className="btn btn-primary" onClick={() => { toast('Đã tạo dự án mới (demo)'); onClose(); }}>Tạo dự án</button></>}>
        {step === 1 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {DB.templates.map(t => (
              <div key={t.id} onClick={() => setTplId(t.id)} style={{ border: '1.5px solid ' + (tplId === t.id ? t.color : 'var(--line)'), borderRadius: 10, padding: 14, cursor: 'pointer', background: tplId === t.id ? t.color + '0d' : '#fff', position: 'relative' }}>
                {t.popular && <span className="badge badge-orange" style={{ position: 'absolute', top: 12, right: 12 }}><Icon name="star" size={11} />Ưu tiên</span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 9, background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={t.icon} size={19} /></span>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-600)', lineHeight: 1.5, marginBottom: 10 }}>{t.desc}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  <span className="badge badge-gray">{PROG_LABEL[t.progress]}</span>
                  <span className="badge badge-gray">{t.modules.length} module</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', background: tpl.color + '0d', borderRadius: 8, marginBottom: 16 }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: tpl.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={tpl.icon} size={15} /></span>
              <div><b>{tpl.name}</b> <span className="muted">· {PROG_LABEL[tpl.progress]}</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <Field label="Mã dự án" req><input className="input" defaultValue="CT-2026-005" readOnly style={{ background: 'var(--surface-2)' }} /></Field>
              <Field label="Tên dự án" req><input className="input" placeholder="VD: Cao tốc Hữu Nghị – Chi Lăng" /></Field>
              <Field label="Chủ đầu tư"><input className="input" placeholder="Tên chủ đầu tư" /></Field>
              <Field label="Địa điểm" req><input className="input" placeholder="Tỉnh/Thành phố" /></Field>
              <Field label="Ngày khởi công"><input className="input" type="date" /></Field>
              <Field label="Ngày hoàn thành dự kiến"><input className="input" type="date" /></Field>
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
              <Icon name="sliders" size={15} style={{ color: tpl.color }} /><b style={{ fontSize: 12.5 }}>Trường cấu hình động theo Template "{tpl.name}"</b>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              {tpl.fields.map(f => (
                <Field key={f.k} label={f.label} req={f.req} hint={f.hint}>
                  {f.type === 'select'
                    ? <select className="select">{f.opts.map(o => <option key={o}>{o}</option>)}</select>
                    : <input className="input" type={f.type === 'number' ? 'number' : 'text'} placeholder={f.hint || ''} />}
                </Field>
              ))}
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-600)', marginBottom: 8 }}>Module được kích hoạt (tab trong công trường)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tpl.modules.map(m => <span key={m} className="badge badge-blue"><Icon name="check" size={11} />{MOD_LABEL[m] || m}</span>)}
            </div>
          </div>
        )}
      </Modal>
    );
  }

  const MOD_LABEL = { 'cong-viec': 'Công việc', 'khu-vuc': 'Khu vực thi công', 'nhat-ky': 'Nhật ký hàng ngày', 'vat-lieu-do': 'Vật liệu đổ', 'thiet-bi': 'Thiết bị', 'ton-kho': 'Tồn kho & Vật tư', 'vat-tu': 'Vật tư', 'nhan-su': 'Nhân sự', 'goi-thau': 'Gói thầu', 'tai-chinh': 'Tài chính', 'bao-cao': 'Báo cáo', 'ho-so': 'Hồ sơ - Tài liệu' };

  /* ---------- Template builder (manage dynamic templates) ---------- */
  function TemplateBuilder({ onClose }) {
    const [sel, setSel] = useState(DB.templates[0].id);
    const tpl = DB.templates.find(t => t.id === sel);
    const ALL_MODS = Object.keys(MOD_LABEL);
    return (
      <Modal title="Trình tạo Template dự án" sub="Cấu hình loại hình dự án — module, cách tính tiến độ, trường dữ liệu động" width={920} onClose={onClose}
        foot={<><button className="btn" onClick={onClose}>Đóng</button><button className="btn btn-primary" onClick={() => { toast('Đã lưu Template (demo)'); }}><Icon name="save" size={14} />Lưu Template</button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', marginBottom: 8 }}>Loại hình dự án</div>
            {DB.templates.map(t => (
              <button key={t.id} onClick={() => setSel(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', border: '1px solid ' + (sel === t.id ? t.color : 'var(--line)'), background: sel === t.id ? t.color + '0d' : '#fff', borderRadius: 8, padding: '9px 10px', marginBottom: 6, textAlign: 'left' }}>
                <span style={{ width: 26, height: 26, borderRadius: 6, background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={t.icon} size={14} /></span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{t.name}</span>
              </button>
            ))}
            <button className="btn btn-sm" style={{ width: '100%', marginTop: 4 }}><Icon name="plus" size={13} />Loại hình mới</button>
          </div>
          <div>
            <Field label="Tên Template"><input className="input" defaultValue={tpl.name} /></Field>
            <div style={{ marginTop: 13 }}>
              <div className="label" style={{ marginBottom: 6 }}>Cách tính tiến độ</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(PROG_LABEL).map(([k, v]) => (
                  <label key={k} style={{ flex: 1, border: '1px solid ' + (tpl.progress === k ? 'var(--blue-500)' : 'var(--line)'), borderRadius: 7, padding: '9px 11px', display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', background: tpl.progress === k ? 'var(--blue-50)' : '#fff' }}>
                    <span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid ' + (tpl.progress === k ? 'var(--blue-600)' : 'var(--ink-300)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tpl.progress === k && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-600)' }} />}</span>
                    <span style={{ fontSize: 11.5 }}>{v}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div className="label" style={{ marginBottom: 8 }}>Module kích hoạt (tab trong công trường)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
              {ALL_MODS.map(m => {
                const on = tpl.modules.includes(m);
                return <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: on ? 'var(--blue-50)' : '#fff' }}>
                  <span style={{ width: 30, height: 17, borderRadius: 10, background: on ? 'var(--blue-600)' : 'var(--ink-300)', position: 'relative', flex: 'none', transition: '.15s' }}><span style={{ position: 'absolute', top: 2, left: on ? 15 : 2, width: 13, height: 13, borderRadius: '50%', background: '#fff', transition: '.15s' }} /></span>
                  {MOD_LABEL[m]}</label>;
              })}
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="label">Trường dữ liệu động khi tạo dự án</div>
              <button className="btn btn-sm"><Icon name="plus" size={13} />Thêm trường</button>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="tbl tbl-compact">
                <thead><tr><th>Nhãn trường</th><th>Kiểu</th><th>Bắt buộc</th><th></th></tr></thead>
                <tbody>
                  {tpl.fields.map(f => <tr key={f.k}>
                    <td style={{ fontWeight: 600 }}>{f.label}</td>
                    <td><span className="badge badge-gray">{({ text: 'Văn bản', number: 'Số', select: 'Chọn', date: 'Ngày' })[f.type]}</span></td>
                    <td>{f.req ? <Icon name="check" size={14} style={{ color: 'var(--green-600)' }} /> : <span className="dim">—</span>}</td>
                    <td style={{ textAlign: 'right' }}><button className="btn btn-icon btn-sm btn-ghost"><Icon name="trash" size={14} /></button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  window.CongTruong = CongTruong;
  window.MOD_LABEL = MOD_LABEL;
})();
