/* Icon set — line icons, 1.7 stroke. <Icon name="..." size={16} /> */
(function () {
  const P = {
    dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  };
  // Use explicit path elements for clarity
  const ICONS = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
    road: <><path d="M5 21 8 3M19 21 16 3M12 5v2M12 11v2M12 17v2"/></>,
    tasks: <><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></>,
    warehouse: <><path d="M3 21V9l9-5 9 5v12"/><path d="M3 21h18M7 21v-6h10v6M7 15h10"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 6.5a2.5 2.5 0 0 1 0 5M17 14c2.2.5 4 2.5 4 5"/></>,
    customer: <><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></>,
    partner: <><path d="M8 13l2.5 2.5a2 2 0 0 0 3 0L21 8M3 8l4-4 4 4M14 7l3-3 4 4-3 3"/><path d="M3 8v5a2 2 0 0 0 2 2h2"/></>,
    category: <><path d="M3 7l3-3h6l9 9-9 9-9-9V7z"/><circle cx="8" cy="9" r="1.4"/></>,
    report: <><path d="M3 3v18h18"/><path d="M7 15l3-4 3 2 5-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2"/></>,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    filter: <><path d="M3 5h18l-7 8v6l-4-2v-4z"/></>,
    'chevron-down': <><path d="M6 9l6 6 6-6"/></>,
    'chevron-right': <><path d="M9 6l6 6-6 6"/></>,
    'chevron-left': <><path d="M15 6l-6 6 6 6"/></>,
    'chevron-up': <><path d="M6 15l6-6 6 6"/></>,
    'arrow-right': <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    'arrow-left': <><path d="M19 12H5M11 6l-6 6 6 6"/></>,
    'map-pin': <><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
    map: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></>,
    truck: <><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></>,
    wrench: <><path d="M14.5 6a3.5 3.5 0 0 0-4.8 4.3l-6 6a1.5 1.5 0 0 0 2.1 2.1l6-6A3.5 3.5 0 0 0 18 8l-2.3 2.3-2-2L16 6z"/></>,
    fuel: <><path d="M3 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M3 11h10"/><path d="M13 7l3 3v7a2 2 0 0 0 4 0V9l-3-3"/></>,
    droplet: <><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7M14 21h3M21 21h.01"/></>,
    scan: <><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M4 12h16"/></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    building: <><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></>,
    bridge: <><path d="M2 8s4 3 10 3 10-3 10-3M2 8v10M22 8v10M7 10v8M12 11v7M17 10v8M2 18h20"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
    download: <><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></>,
    upload: <><path d="M12 21V9M7 13l5-5 5 5M5 3h14"/></>,
    print: <><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z"/></>,
    edit: <><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    more: <><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></>,
    'more-h': <><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></>,
    kanban: <><rect x="3" y="3" width="5" height="14" rx="1"/><rect x="9.5" y="3" width="5" height="10" rx="1"/><rect x="16" y="3" width="5" height="17" rx="1"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    timeline: <><path d="M4 6h10M4 12h14M4 18h7"/><circle cx="18" cy="6" r="2"/><circle cx="20" cy="12" r="0" /><circle cx="14" cy="18" r="2"/></>,
    wifi: <><path d="M2 8.5a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/></>,
    camera: <><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h0a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/></>,
    x: <><path d="M6 6l12 12M18 6L6 18"/></>,
    check: <><path d="M5 12l5 5 9-11"/></>,
    'check-circle': <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 14h2"/></>,
    money: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v6M18 9v6"/></>,
    alert: <><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></>,
    package: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 21v-9"/></>,
    sliders: <><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></>,
    grip: <><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></>,
    crosshair: <><circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="2"/></>,
    'log-out': <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M9 12h11M16 8l4 4-4 4"/></>,
    excavator: <><path d="M3 20h18M5 20v-4h6v4M5 16l1-3h4l1 3"/><path d="M11 14l4-6 5 2-1 3"/><circle cx="6" cy="20" r="0"/></>,
    cube: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    pie: <><path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M12 3v9h9"/></>,
    plug: <><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0zM12 16v6"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    flag: <><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></>,
    link: <><path d="M9 12h6M10 8H7a4 4 0 0 0 0 8h3M14 8h3a4 4 0 0 1 0 8h-3"/></>,
    chat: <><path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/></>,
    refresh: <><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M18 4v5h-5M6 20v-5h5"/></>,
    eye2: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    star: <><path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z"/></>,
    save: <><path d="M5 3h12l4 4v14H5zM8 3v5h8V3M8 14h8v7H8z"/></>,
    'shield-check': <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></>,
    thermometer: <><path d="M12 14V4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></>,
    cloud: <><path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A3.5 3.5 0 0 1 17 18z"/></>,
    play: <><path d="M7 4l13 8-13 8z"/></>,
    stop: <><rect x="6" y="6" width="12" height="12" rx="1"/></>,
    phone: <><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4M12 8v4l3 2"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.5"/></>,
    handshake: <><path d="M8 13l2.5 2.5a2 2 0 0 0 3 0L21 8M3 8l4-4 4 4M14 7l3-3 4 4-3 3"/></>,
  };

  function Icon({ name, size = 16, stroke = 1.7, fill = 'none', style, className = '' }) {
    const body = ICONS[name] || ICONS.info;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
        stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
        className={'ic ' + className} style={{ flex: 'none', ...style }}>
        {body}
      </svg>
    );
  }
  window.Icon = Icon;
})();
