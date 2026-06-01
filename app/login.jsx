/* Đăng nhập — chọn đơn vị làm việc → đăng nhập → 2FA. Split layout. → window.LoginApp */
(function () {
  const { useState, useRef, useEffect } = window.React;
  const { Icon, DB } = window;

  const DEMO = [
    { id: 'gd', name: 'Nguyễn Văn An', title: 'Giám đốc dự án', role: 'pm', scope: 'company', group: 'office', label: 'Giám đốc', icon: 'building' },
    { id: 'ch', name: 'Trần Văn Cường', title: 'Chỉ huy trưởng', role: 'site', scope: 'p1', group: 'site', label: 'Chỉ huy trưởng', icon: 'road' },
    { id: 'kt', name: 'Lê Thị Bình', title: 'Kế toán công trình', role: 'acc', scope: 'company', group: 'office', label: 'Kế toán', icon: 'wallet' },
    { id: 'tk', name: 'Vũ Quang Trung', title: 'Thủ kho', role: 'wh', scope: 'company', group: 'office', label: 'Thủ kho', icon: 'warehouse' },
    { id: 'vt', name: 'Đỗ Thị Mai', title: 'Cán bộ vật tư', role: 'exec', scope: 'p1', group: 'site', label: 'Cán bộ vật tư', icon: 'package' },
    { id: 'kts', name: 'Phạm Minh Đức', title: 'Cán bộ kỹ thuật', role: 'kt', scope: 'p1', group: 'site', label: 'Cán bộ kỹ thuật', icon: 'tasks' },
  ];

  function Otp({ onDone }) {
    const [v, setV] = useState(['', '', '', '', '', '']);
    const refs = useRef([]);
    const set = (i, val) => { if (!/^\d?$/.test(val)) return; const n = [...v]; n[i] = val; setV(n); if (val && i < 5) refs.current[i + 1].focus(); };
    return (
      <div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '18px 0 8px' }}>
          {v.map((d, i) => <input key={i} ref={el => refs.current[i] = el} value={d} onChange={e => set(i, e.target.value)} maxLength={1} inputMode="numeric"
            style={{ width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', border: '1.5px solid var(--line)', borderRadius: 9, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--blue-500)'} onBlur={e => e.target.style.borderColor = 'var(--line)'} />)}
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-500)', marginBottom: 16 }}>Mã OTP đã gửi tới <b>•••• •89</b> · <a style={{ color: 'var(--blue-600)', cursor: 'pointer' }}>Gửi lại (59s)</a></div>
        <button className="btn btn-primary" style={{ width: '100%', height: 42, fontSize: 14 }} onClick={onDone}>Xác nhận & đăng nhập</button>
      </div>
    );
  }

  function LoginApp({ onLogin, onMobile }) {
    const [mode, setMode] = useState('web');
    const [step, setStep] = useState('scope');
    const [scope, setScope] = useState('company');
    const [method, setMethod] = useState('email');
    const [remember, setRemember] = useState(true);
    const scopeLabel = scope === 'company' ? 'Tổng công ty Nam Hải Group' : DB.projects.find(p => p.id === scope).name;
    const finish = (acc) => onLogin(acc);
    const submitCred = () => setStep('otp');

    const Brand = (
      <div style={{ width: 460, flex: 'none', background: 'linear-gradient(160deg,#103655,#0C2A47 70%)', color: '#fff', padding: '46px 44px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 460 600" style={{ position: 'absolute', inset: 0, opacity: .5 }} preserveAspectRatio="none">
          <path d="M-20 480 Q120 420 240 450 T500 400" fill="none" stroke="#2876AE" strokeWidth="2.5" strokeDasharray="3 8" opacity=".4" />
          <path d="M-20 520 Q140 470 260 495 T500 450" fill="none" stroke="#F26B1D" strokeWidth="6" opacity=".15" />
          <pattern id="lg" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" fill="none" stroke="#fff" strokeWidth=".5" opacity=".05" /></pattern>
          <rect width="460" height="600" fill="url(#lg)" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--orange-500),var(--orange-600))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="road" size={22} /></div>
          <div><div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '.01em' }}>SiteOps</div><div style={{ fontSize: 11.5, color: '#8fb0c8' }}>Quản lý công trường số</div></div>
        </div>
        <div style={{ marginTop: 'auto', position: 'relative' }}>
          <div style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-.01em' }}>Số hóa toàn bộ công trường —<br />từ tiến độ đến từng chuyến xe.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 26 }}>
            {[['target', 'Tiến độ & sản lượng theo lý trình Km'], ['truck', 'Quét QR đếm chuyến, nhật ký máy/xe'], ['crosshair', 'Chấm công GPS, công nhật & ca máy'], ['shield-check', 'Phân quyền RBAC theo vai trò & công trường']].map(([ic, t]) =>
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 13, color: '#cfdde8' }}><span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7fb2d8' }}><Icon name={ic} size={16} /></span>{t}</div>)}
          </div>
        </div>
        <div style={{ marginTop: 30, fontSize: 11, color: '#6b859c', position: 'relative' }}>© 2026 SiteOps · Phiên bản demo</div>
      </div>
    );

    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', background: '#fff', zIndex: 1000 }}>
        {Brand}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto', background: 'var(--bg)' }}>
          <div style={{ width: '100%', maxWidth: 396 }}>
            <div className="seg" style={{ marginBottom: 18, display: 'flex' }}>
              <button className={mode === 'web' ? 'active' : ''} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode('web')}><Icon name="dashboard" size={13} />Web · Văn phòng</button>
              <button className={mode === 'mobile' ? 'active' : ''} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode('mobile')}><Icon name="qr" size={13} />Hiện trường · Mobile</button>
            </div>
            {mode === 'mobile' ? (
              <div className="fade-in">
                <h1 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 4px' }}>Đăng nhập hiện trường</h1>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: '0 0 16px' }}>App trên điện thoại của thợ lái máy, lái xe, cán bộ vật tư, kỹ thuật, chỉ huy… Đăng nhập bằng SĐT + OTP.</p>
                <button className="btn btn-accent" style={{ width: '100%', height: 46, fontSize: 14 }} onClick={() => onMobile(null)}><Icon name="qr" size={16} />Mở App hiện trường (SĐT + OTP)</button>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="play" size={12} />Hoặc mở nhanh theo vai trò</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['laimay', 'Vận hành máy thi công', 'excavator'], ['laixe', 'Lái xe vận tải (Howo)', 'truck'], ['vattu', 'Cán bộ vật tư / Thủ kho', 'package'], ['kythuat', 'Cán bộ kỹ thuật', 'tasks'], ['chuhuy', 'Chỉ huy trưởng', 'shield-check'], ['congnhan', 'Công nhân', 'users']].map(([k, l, ic]) => (
                    <button key={k} onClick={() => onMobile(k)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--line)', background: '#fff', borderRadius: 11, padding: '9px 11px', cursor: 'pointer', fontSize: 11.5, textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange-400)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}>
                      <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--orange-50)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={ic} size={13} /></span>{l}
                    </button>
                  ))}
                </div>
              </div>
            ) : (<>
            {/* steps indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, fontSize: 11.5, color: 'var(--ink-500)' }}>
              {[['scope', 'Đơn vị'], ['cred', 'Đăng nhập'], ['otp', 'Xác thực']].map(([s, l], i) => {
                const order = ['scope', 'cred', 'otp']; const done = order.indexOf(step) > i; const cur = step === s;
                return <React.Fragment key={s}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: cur ? 'var(--blue-700)' : done ? 'var(--green-600)' : 'var(--ink-400)', fontWeight: cur ? 700 : 500 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: cur ? 'var(--blue-600)' : done ? 'var(--green-500)' : 'var(--bg-2)', color: cur || done ? '#fff' : 'var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{done ? <Icon name="check" size={11} /> : i + 1}</span>{l}
                  </span>
                  {i < 2 && <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />}
                </React.Fragment>;
              })}
            </div>

            {step === 'scope' && (
              <div className="fade-in">
                <h1 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 4px' }}>Chọn đơn vị làm việc</h1>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: '0 0 18px' }}>Đăng nhập vào toàn hệ thống hoặc một công trường cụ thể.</p>
                <button onClick={() => setScope('company')} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: '1.5px solid ' + (scope === 'company' ? 'var(--blue-500)' : 'var(--line)'), background: scope === 'company' ? 'var(--blue-50)' : '#fff', borderRadius: 10, padding: '13px 14px', marginBottom: 10, cursor: 'pointer' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--blue-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="building" size={19} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>Tổng công ty</div><div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Xem & quản lý tất cả công trường</div></div>
                  {scope === 'company' && <Icon name="check-circle" size={18} style={{ color: 'var(--blue-600)' }} />}
                </button>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '14px 0 8px' }}>Hoặc vào một công trường</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 196, overflow: 'auto' }}>
                  {DB.projects.map(p => { const tpl = DB.templates.find(t => t.id === p.template); return (
                    <button key={p.id} onClick={() => setScope(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', border: '1.5px solid ' + (scope === p.id ? 'var(--blue-500)' : 'var(--line)'), background: scope === p.id ? 'var(--blue-50)' : '#fff', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
                      <span style={{ width: 32, height: 32, borderRadius: 8, background: tpl.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={tpl.icon} size={16} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div><div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{p.code} · {p.location}</div></div>
                      {scope === p.id && <Icon name="check-circle" size={17} style={{ color: 'var(--blue-600)', flex: 'none' }} />}
                    </button>
                  ); })}
                </div>
                <button className="btn btn-primary" style={{ width: '100%', height: 42, fontSize: 14, marginTop: 18 }} onClick={() => setStep('cred')}>Tiếp tục<Icon name="arrow-right" size={15} /></button>
              </div>
            )}

            {step === 'cred' && (
              <div className="fade-in">
                <button onClick={() => setStep('scope')} className="btn btn-sm btn-ghost" style={{ marginBottom: 10, padding: '0 6px' }}><Icon name="arrow-left" size={14} />Đổi đơn vị</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 9, marginBottom: 18 }}>
                  <Icon name={scope === 'company' ? 'building' : 'road'} size={16} style={{ color: 'var(--blue-600)' }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{scopeLabel}</span>
                </div>
                <h1 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 16px' }}>Đăng nhập</h1>
                <div className="seg" style={{ marginBottom: 14 }}>
                  <button className={method === 'email' ? 'active' : ''} onClick={() => setMethod('email')}>Email</button>
                  <button className={method === 'phone' ? 'active' : ''} onClick={() => setMethod('phone')}>Số điện thoại</button>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label className="label">{method === 'email' ? 'Email' : 'Số điện thoại'}</label>
                  <input className="input" style={{ height: 42 }} defaultValue={method === 'email' ? 'annv@namhai.vn' : '0912 345 678'} />
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label className="label">Mật khẩu</label>
                  <input className="input" type="password" style={{ height: 42 }} defaultValue="••••••••" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, cursor: 'pointer' }}>
                    <span onClick={() => setRemember(r => !r)} style={{ width: 17, height: 17, borderRadius: 4, border: '1.5px solid ' + (remember ? 'var(--blue-600)' : 'var(--ink-300)'), background: remember ? 'var(--blue-600)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{remember && <Icon name="check" size={12} style={{ color: '#fff' }} />}</span>Ghi nhớ đăng nhập
                  </label>
                  <a style={{ fontSize: 12.5, color: 'var(--blue-600)', cursor: 'pointer' }}>Quên mật khẩu?</a>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', height: 42, fontSize: 14 }} onClick={submitCred}>Đăng nhập<Icon name="arrow-right" size={15} /></button>
              </div>
            )}

            {step === 'otp' && (
              <div className="fade-in">
                <button onClick={() => setStep('cred')} className="btn btn-sm btn-ghost" style={{ marginBottom: 10, padding: '0 6px' }}><Icon name="arrow-left" size={14} />Quay lại</button>
                <div style={{ width: 46, height: 46, borderRadius: 11, background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon name="shield-check" size={24} /></div>
                <h1 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 4px' }}>Xác thực 2 lớp</h1>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: 0 }}>Nhập mã 6 số để hoàn tất đăng nhập.</p>
                <Otp onDone={() => finish({ role: scope === 'company' ? 'pm' : 'site', scope, user: { name: 'Nguyễn Văn An', title: scope === 'company' ? 'Giám đốc dự án' : 'Chỉ huy trưởng' } })} />
              </div>
            )}

            {/* demo quick login */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px dashed var(--line)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="play" size={12} />Đăng nhập nhanh (demo)</div>
              {[['office', 'Khối Văn phòng · Tổng công ty', 'building'], ['site', 'Tại công trường · HN–Chi Lăng', 'road']].map(([g, gl, gi]) => (
                <div key={g} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', marginBottom: 7 }}><Icon name={gi} size={12} style={{ color: 'var(--blue-500)' }} />{gl}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {DEMO.filter(d => d.group === g).map(d => (
                      <button key={d.id} onClick={() => finish({ role: d.role, scope: d.scope, user: { name: d.name, title: d.title } })} title={d.name + ' — ' + d.title} style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid var(--line)', background: '#fff', borderRadius: 100, padding: '5px 12px 5px 6px', cursor: 'pointer', fontSize: 11.5 }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue-400)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={d.icon} size={12} /></span>{d.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </>)}
          </div>
        </div>
      </div>
    );
  }

  window.LoginApp = LoginApp;
})();
