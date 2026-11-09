/* Dashboard: structure and copy from pitchdeckdoclist new_dev_migration (src/listing/.../dashboard), look from Figma UI3. */
(function () {
  const { $, $$, ic, icf, esc, openMenu, openModal, closeModal, toast } = UI;
  const root = $('#dash');
  const D = { tab: 'Recent', view: 'grid', sort: 'Last edited', picked: new Set(), starred: new Set(['d2']), empty: false };
  const THEMES = [
    { bg: '#0D193F', a: '#80CAFF', b: '#FFFFFF', c: '#0D99FF', art: 'bars' },
    { bg: '#FFFFFF', a: '#9747FF', b: '#1E1E1E', c: '#E4CCFF', art: 'shape' },
    { bg: '#FFF1C2', a: '#B86200', b: '#1E1E1E', c: '#FFCD29', art: 'bars' },
    { bg: '#E0F6E5', a: '#009951', b: '#083A23', c: '#14AE5C', art: 'shape' },
    { bg: '#1E1E1E', a: '#FF99E0', b: '#FFFFFF', c: '#FF24BD', art: 'shape' },
    { bg: '#F2F9FF', a: '#0768CF', b: '#093077', c: '#80CAFF', art: 'bars' },
    { bg: '#FFF5F5', a: '#DC3412', b: '#660E0B', c: '#FFAFA3', art: 'shape' },
    { bg: '#EBFBFF', a: '#047195', b: '#0E2F43', c: '#00A2C2', art: 'bars' }];
  /* real slide images from pitchdeckdoclist public/assets (hireourteam, refresh) */
  const IMG = ['d1-sales-review', 'd2-investor-update', 'd3-product-roadmap', 'd4-onboarding', 'd5-brand-guidelines', 'd6-marketing-report', 'd7-team-offsite', 'd8-customer-story'];
  const DECKS = [
    ['d1', 'Q3 Sales Review', 'Edited 3 hours ago'], ['d2', 'Investor Update, November', 'Edited yesterday'], ['d3', 'Product Roadmap 2027', 'Edited 2 days ago'],
    ['d4', 'Onboarding Training', 'Edited 4 days ago'], ['d5', 'Brand Guidelines', 'Edited last week'], ['d6', 'Marketing Channel Report', 'Edited last week'],
    ['d7', 'Team Offsite Plan', 'Edited 2 weeks ago'], ['d8', 'Customer Story: Acme', 'Edited 3 weeks ago']].map((d, i) => ({ id: d[0], title: d[1], meta: d[2], th: THEMES[i], img: `assets/thumbs/${IMG[i]}.jpg?v=2` }));
  const thumb = d => d.img ? `<img class="thimg" src="${d.img}" alt="" loading="lazy" decoding="async">` : slideArt(d.th);
  const slideArt = t => `<div class="sl" style="background:${t.bg}"><span class="k" style="background:${t.a}"></span><span class="h" style="background:${t.b}"></span><span class="h2" style="background:${t.b};opacity:.85"></span><span class="b" style="background:${t.b}"></span><span class="b" style="background:${t.b};width:44%"></span>${t.art === 'bars' ? `<span class="bars"><i style="height:40%;background:${t.c}"></i><i style="height:70%;background:${t.a}"></i><i style="height:55%;background:${t.c}"></i><i style="height:100%;background:${t.a}"></i></span>` : `<span class="shape" style="background:${t.c}"></span>`}</div>`;
  UI.slideArt = slideArt; UI.DECKS = DECKS;

  function sidebar(current = 'Home') {
    const nav = [['house', 'Home', current === 'Home'], ['stack', 'Templates'], ['swatches', 'Brand Kit', false, 'Pro'], ['pen-nib', 'Hire an expert'], ['gift', 'Refer and earn']];
    return `<aside class="side" aria-label="Sidebar">
      <div class="side-top">
        <button class="ws" id="wsBtn" aria-expanded="false"><span class="ava">M</span><span class="grow"><span class="nm">Mani's workspace</span><span class="mt">Free plan · 1 member</span></span>${ic('caret-up-down')}</button>
        <button class="btn primary newdeck">${ic('plus')}New deck</button>
      </div>
      <div class="side-scroll">
        ${nav.map(n => `<div class="navslot"><button class="navrow" ${n[2] ? 'aria-current="page"' : ''}>${ic(n[0])}<span>${n[1]}</span>${n[3] ? `<span class="badge pro">${n[3]}</span>` : ''}</button></div>`).join('')}
        <div class="grp" aria-expanded="true"><button class="gl">${ic('caret-right')}<span>Projects</span></button><button class="ibtn" data-tip="New project">${ic('plus')}</button></div>
        <div class="grows">${[['cube', '#9747FF', 'Sales enablement', 'buildings', 'All workspace members can access'], ['cube', '#0D99FF', 'Fundraising', 'lock-simple', 'Private']].map(p => `<div class="navslot"><button class="rowitem"><i class="ph-light ph-${p[0]}" style="color:${p[1]}"></i><span class="nm">${p[2]}</span><span class="acc" data-tip="${p[4]}">${ic(p[3])}</span></button></div>`).join('')}</div>
        <div class="grp" aria-expanded="true"><button class="gl">${ic('caret-right')}<span>Folders</span></button><button class="ibtn" data-tip="New folder">${ic('plus')}</button></div>
        <div class="grows">${[['folder', '#14AE5C', 'Client pitches', 'users', 'Shared'], ['folder', '#FFA629', 'Drafts 2026', 'lock-simple', 'Private']].map(p => `<div class="navslot"><button class="rowitem"><i class="ph-light ph-${p[0]}" style="color:${p[1]}"></i><span class="nm">${p[2]}</span><span class="acc" data-tip="${p[4]}">${ic(p[3])}</span></button></div>`).join('')}</div>
      </div>
      <div class="side-foot">
        <div class="plan"><div class="row"><span class="strong">Free plan</span><span class="muted">120 credits</span></div><div class="bar"><span style="width:60%"></span></div><span class="muted">120 of 200 credits left</span><button class="btn sm secondary">See plans</button></div>
        <div class="navslot"><button class="navrow" id="inviteRow">${ic('user-plus')}<span>Invite teammates</span><span class="badge gold">Gold</span></button></div>
        <div class="navslot"><button class="navrow" data-go="settings" ${current === 'Settings' ? 'aria-current="page"' : ''}>${ic('gear-six')}<span>Workspace settings</span></button></div>
      </div>
    </aside>`;
  }
  function topbar() {
    return `<div class="dtop">
      <button class="ibtn lg mobmenu" aria-label="Open menu">${ic('list')}</button>
      <div class="field tall search" id="searchBtn" role="button" tabindex="0">${ic('magnifying-glass')}<span>Search decks, settings, actions</span><span class="kbd">⌘K</span></div>
      <div class="spacer"></div>
      <button class="meter" data-tip="See credit usage"><span class="tr"><span></span></span>120 credits</button>
      <button class="ibtn lg" id="themeBtn" data-tip="Switch to dark mode"><i data-theme-icon class="ph-light ph-moon"></i></button>
      <button class="ibtn lg" id="helpBtn" data-tip="Help and support">${ic('question')}</button>
      <button class="ibtn lg bell" id="bellBtn" data-tip="Notifications">${ic('bell')}<span class="dot">3</span></button>
      <button class="ibtn lg" id="avaBtn" aria-label="Account"><span class="uava">M</span></button>
    </div>`;
  }
  function hero() {
    const hp = new URLSearchParams(location.search).get('hero'), opt = hp && window.HERO_OPTIONS && window.HERO_OPTIONS.find(o => String(o.n) === hp);
    if (opt) return opt.html();
    return `<section class="hero"><span class="chip">${ic('user-circle')}Set up for sales</span>
      <h1>Your sales review, ready again every quarter</h1>
      <p>Bring last quarter's numbers. We rebuild the review with fresh charts and keep your story.</p>
      <div class="acts"><button class="btn primary">${ic('plus')}New deck</button><button class="btn secondary">${ic('microsoft-powerpoint-logo')}Import PowerPoint</button></div>
      <div class="deco" aria-hidden="true"><span></span><span></span><span></span></div></section>`;
  }
  function tabsRow() {
    const tabs = ['Recent', 'Created by me', 'Starred', 'Shared with me', 'Downloads', 'Trash'];
    const right = D.tab === 'Trash' ? `<div class="seg"><button aria-pressed="true">Presentations</button><button aria-pressed="false">Projects and folders</button></div>`
      : `<button class="selectbox" id="sortBtn" ${D.tab === 'Downloads' ? 'style="visibility:hidden"' : ''}><span>${D.sort}</span><span class="ico24">${ic('caret-down')}</span></button>
         <div class="seg" ${D.tab === 'Downloads' ? 'style="visibility:hidden"' : ''}><button data-dv="grid" aria-pressed="${D.view === 'grid'}" data-tip="Grid">${ic('squares-four')}</button><button data-dv="list" aria-pressed="${D.view === 'list'}" data-tip="List">${ic('list-bullets')}</button></div>`;
    return `<div class="trow"><div class="tabs" role="tablist">${tabs.map(t => `<button class="tab" role="tab" aria-selected="${t === D.tab}">${t}</button>`).join('')}</div>${right}</div>`;
  }
  function deckList() {
    if (D.empty) return `<div class="empty"><span class="ei">${ic('file-text')}</span><span class="t13s">No decks yet</span><span class="muted">Start from your numbers or import a PowerPoint.</span><button class="btn sm primary">${ic('plus')}New deck</button></div>`;
    const trash = D.tab === 'Trash';
    const list = DECKS.map(d => ({ ...d, meta: trash ? 'Deleted 3 days ago · removed in 27 days' : d.meta }));
    if (D.view === 'list') return `<div class="dlist"><table><thead><tr><th>Name</th><th>Owner</th><th>Edited</th><th></th></tr></thead><tbody>${list.map(d => `<tr data-id="${d.id}"><td><span class="mini">${thumb(d)}</span><span class="strong">${esc(d.title)}</span></td><td class="muted">You</td><td class="muted">${esc(d.meta.replace('Edited ', ''))}</td><td style="width:40px"><button class="ibtn more" data-tip="More">${ic('dots-three')}</button></td></tr>`).join('')}</tbody></table></div>`;
    return `<div class="decks">${list.map(d => `<article class="deck ${D.picked.has(d.id) ? 'picked' : ''}" data-id="${d.id}"><div class="thumb">${thumb(d)}</div>
      <span class="sel"><span class="cb" role="checkbox" aria-checked="${D.picked.has(d.id)}">${ic('check')}</span></span>
      <button class="star ${D.starred.has(d.id) ? 'on' : ''}" data-tip="${D.starred.has(d.id) ? 'Unstar' : 'Star'}">${D.starred.has(d.id) ? icf('star') : ic('star')}</button>
      <div class="body"><span class="grow"><span class="tt">${esc(d.title)}</span><span class="mt">${esc(d.meta)}</span></span><button class="ibtn more" data-tip="More">${ic('dots-three')}</button></div></article>`).join('')}</div>`;
  }
  function msbar() { const n = D.picked.size; return `<div class="msbar ${n ? 'on' : ''}"><span class="strong">${n} ${n === 1 ? 'item' : 'items'} selected</span><span class="grow"></span><button class="btn sm ghost">${ic('folder-simple')}Move to project or folder</button><button class="ibtn" data-tip="Delete">${ic('trash')}</button><button class="ibtn" id="msClose" data-tip="Clear selection">${ic('x')}</button></div>`; }

  function render() {
    root.innerHTML = sidebar() + `<div class="dmain">${topbar()}<div class="dscroll"><div class="dcol">${hero()}${tabsRow()}<div id="deckArea">${deckList()}</div></div></div></div>` + msbar();
    wire(); UI.setTheme(UI.S.theme);
  }
  function rerenderBody() { $('.trow', root).outerHTML = tabsRow(); $('#deckArea', root).innerHTML = deckList(); $('.msbar', root).outerHTML = msbar(); wireBody(); }

  const cardMenu = (anchor, id) => openMenu(anchor, [
    { label: 'Open', icon: 'arrow-square-out' }, { label: 'Export as PPT', icon: 'download-simple' }, { label: 'Refresh Data', icon: 'arrows-clockwise' }, { label: 'Improve Presentation', icon: 'sparkle', brand: true },
    { sep: 1 }, { label: 'Share', icon: 'share-fat', onClick: () => UI.openShare('invite', DECKS.find(d => d.id === id).title) }, { label: 'Present', icon: 'play' }, { label: 'Rename', icon: 'pencil-simple' }, { label: 'Duplicate', icon: 'copy' }, { label: 'Move to project or folder', icon: 'folder-simple' },
    { sep: 1 }, { label: 'Delete', icon: 'trash', danger: true, onClick: () => toast('Moved to Trash') }], { width: 224, align: 'end' });
  const wsMenu = a => openMenu(a, [{ section: 'Workspaces' },
    { html: `<button class="mi" style="height:40px"><span class="chk">${ic('check')}</span><span class="ava" style="width:20px;height:20px;border-radius:4px;background:linear-gradient(135deg,#0D99FF,#9747FF);display:inline-flex;align-items:center;justify-content:center;font-weight:550;margin-right:8px">M</span><span><span style="display:block">Mani's workspace</span><span class="t9" style="color:var(--color-text-menu-secondary)">Free plan · 1 member</span></span></button>` },
    { html: `<button class="mi" style="height:40px"><span class="chk"></span><span style="width:20px;height:20px;border-radius:4px;background:#14AE5C;display:inline-flex;align-items:center;justify-content:center;font-weight:550;margin-right:8px">D</span><span><span style="display:block">Deck Studio</span><span class="t9" style="color:var(--color-text-menu-secondary)">Pro Plan · 6 members</span></span></button>` },
    { sep: 1 }, { label: 'Create or Join workspace', icon: 'plus' }, { label: 'Workspace settings', icon: 'gear-six', onClick: () => goView('settings', 'st-general') }], { width: 240 });
  const helpMenu = a => openMenu(a, [{ label: 'Help centre', icon: 'book-open' }, { label: 'Keyboard shortcuts', icon: 'command', sc: '⌘/' }, { label: 'Contact support', icon: 'lifebuoy' }], { width: 220, align: 'end' });
  const bellMenu = a => openMenu(a, [], { width: 340, align: 'end', head: `<div class="mhead" style="justify-content:space-between"><span class="strong">Notifications</span><button class="btn text" style="color:var(--color-text-menu-selected)">Mark all as read</button></div>
      ${[['chat-circle', 'Priya commented on Q3 Sales Review', '"Can we move the forecast up?"', '2m', 1], ['share-fat', 'Arun shared Product Roadmap 2027 with you', 'Can edit', '1h', 1], ['sparkle', 'Your deck Investor Update, November is ready', 'Generated from your notes', '3h', 1], ['user-plus', 'Meera joined Deck Studio', 'Workspace', 'Yesterday', 0]].map(n => `<div class="nrow"><span class="ni">${ic(n[0])}</span><span class="nt"><span>${esc(n[1])}</span><div class="nm2 t9">${esc(n[2])} · ${n[3]}</div></span>${n[4] ? '<span class="ud"></span>' : ''}</div>`).join('')}` });
  const avaMenu = a => openMenu(a, [{ label: 'Profile', icon: 'user', onClick: () => UI.openProfile('account') }, { label: 'Preferences', icon: 'sliders-horizontal', onClick: () => UI.openProfile('prefs') }, { sep: 1 }, { label: 'Workspace settings', icon: 'gear-six', onClick: () => goView('settings', 'st-general') }, { label: 'Plan and billing', icon: 'credit-card', onClick: () => goView('settings', 'st-billing') }, { label: 'Credits and usage', icon: 'coins', onClick: () => goView('settings', 'st-credits') }, { sep: 1 }, { label: 'Notifications', icon: 'bell' },
    { label: 'Appearance', icon: 'circle-half', sc: UI.S.theme === 'dark' ? 'Dark' : 'Light', onClick: () => UI.setTheme(UI.S.theme === 'dark' ? 'light' : 'dark') }, { label: 'Keyboard shortcuts', icon: 'command' }, { sep: 1 }, { label: 'Sign out', icon: 'sign-out' }],
    { width: 256, align: 'end', head: `<div class="mhead"><span class="uava" style="width:32px;height:32px;font-size:13px">M</span><span><span class="strong" style="display:block">Mani</span><span class="t9" style="color:var(--color-text-menu-secondary)">manivasakan@deck.in</span></span></div><div class="msep" style="margin-top:0"></div>` });
  const sortMenu = a => openMenu(a, ['Last edited', 'Name'].map(s => ({ label: s, check: D.sort === s, onClick: () => { D.sort = s; rerenderBody(); } })), { width: 160, over: true });
  function searchModal() {
    openModal(`<div style="padding:8px"><div class="field tall">${ic('magnifying-glass')}<input id="sq" placeholder="Search decks, settings and actions" autofocus><span class="kbd">Esc</span></div></div>
      <div class="mbody" style="padding:0 8px 8px;height:334px">${[['presentation', 'Q3 Sales Review', 'Deck'], ['presentation', 'Investor Update, November', 'Deck'], ['cube', 'Sales enablement', 'Project'], ['folder', 'Client pitches', 'Folder'], ['plus', 'New deck', 'Action'], ['user-plus', 'Invite a teammate', 'Action']].map((r, i) => `<div class="srow ${i === 0 ? 'kb' : ''}">${ic(r[0])}<span>${r[1]}</span><span class="kind">${r[2]}</span></div>`).join('')}</div>`,
      { width: 560, onMount: m => { m.dataset.dismiss = 'backdrop'; setTimeout(() => $('#sq', m) && $('#sq', m).focus(), 30); } });
  }

  function wireBody() {
    $$('.tab', root).forEach(t => t.addEventListener('click', () => { D.tab = t.textContent; D.empty = D.tab === 'Starred' ? false : D.empty; rerenderBody(); }));
    $$('[data-dv]', root).forEach(b => b.addEventListener('click', () => { D.view = b.dataset.dv; rerenderBody(); }));
    const sb = $('#sortBtn', root); sb && sb.addEventListener('click', () => sortMenu(sb));
    $$('.more', root).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); cardMenu(b, b.closest('[data-id]').dataset.id); }));
    $$('.deck .star', root).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const id = b.closest('.deck').dataset.id; D.starred.has(id) ? D.starred.delete(id) : D.starred.add(id); rerenderBody(); }));
    $$('.deck .sel', root).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const id = b.closest('.deck').dataset.id; D.picked.has(id) ? D.picked.delete(id) : D.picked.add(id); rerenderBody(); }));
    $$('.deck', root).forEach(c => c.addEventListener('click', () => { UI.S.state = ''; UI.setView('editor'); UI.runState('ed-default'); }));
    const mc = $('#msClose', root); mc && mc.addEventListener('click', () => { D.picked.clear(); rerenderBody(); });
  }
  const goView = (v, st) => { UI.S.state = ''; UI.setView(v); UI.runState(st); };
  function wireShell(r) {
    $('#wsBtn', r).addEventListener('click', e => wsMenu(e.currentTarget));
    $('#helpBtn', r).addEventListener('click', e => helpMenu(e.currentTarget));
    $('#bellBtn', r).addEventListener('click', e => bellMenu(e.currentTarget));
    $('#avaBtn', r).addEventListener('click', e => avaMenu(e.currentTarget));
    $('#themeBtn', r).addEventListener('click', () => UI.setTheme(UI.S.theme === 'dark' ? 'light' : 'dark'));
    $('#searchBtn', r).addEventListener('click', searchModal);
    $('#searchBtn', r).addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); searchModal(); } }); /* role=button: keyboard opens it too */
    $$('.grp', r).forEach(g => $('.gl', g).addEventListener('click', () => { const open = g.getAttribute('aria-expanded') !== 'true'; g.setAttribute('aria-expanded', open); const rows = g.nextElementSibling; if (rows && rows.classList.contains('grows')) rows.hidden = !open; }));
    const mm = $('.mobmenu', r); mm && mm.addEventListener('click', () => $('.side', r).classList.toggle('drawer'));
    $$('.navrow', r).forEach(n => { if ($('span', n) && $('span', n).textContent === 'Home') n.addEventListener('click', () => goView('dashboard', 'db-home')); });
    const st = $('[data-go="settings"]', r); st && st.addEventListener('click', () => goView('settings', 'st-general'));
    $$('.newdeck, .hero .btn.primary', r).forEach(b => b.addEventListener('click', () => goView('create', 'cr-start')));
    $$('.hx [data-create]', r).forEach(b => b.addEventListener('click', () => goView('create', 'cr-start')));
    $$('.hx [data-send]', r).forEach(b => b.addEventListener('click', () => goView('create', 'cr-typed')));
    $$('.hx [data-import]', r).forEach(b => b.addEventListener('click', () => UI.toast('Opens Import PowerPoint')));
    $$('.plan .btn', r).forEach(b => b.addEventListener('click', () => goView('pricing', 'pr-plans')));
    const inv = $('#inviteRow', r); inv && inv.addEventListener('click', () => goView('pricing', 'pr-nudge-invite'));
  }
  function wire() { wireShell(root); wireBody(); }
  UI.shell = { side: sidebar, top: topbar, wire: wireShell, body: () => { const keep = { ...D, picked: new Set(D.picked) }; Object.assign(D, { tab: 'Recent', view: 'grid', empty: false, picked: new Set() }); const h = `<div class="dcol">${hero()}${tabsRow()}<div>${deckList()}</div></div>`; Object.assign(D, keep); return h; } };
  UI.onChange(k => { if (k === 'theme') $$('[id="themeBtn"]').forEach(tb => tb.dataset.tip = UI.S.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); });
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && UI.S.view === 'dashboard') { e.preventDefault(); searchModal(); } });

  const reset = (o = {}) => { Object.assign(D, { tab: 'Recent', view: 'grid', empty: false, picked: new Set() }, o); render(); };
  const firstMore = () => $('.deck .more', root) || $('.more', root);
  UI.registerStates('dashboard', [
    { id: 'db-home', label: 'Home, grid', run: () => reset() },
    { id: 'db-list', label: 'Home, list view', run: () => reset({ view: 'list' }) },
    { id: 'db-card-menu', label: 'Deck card menu', run: () => { reset(); cardMenu(firstMore(), 'd1'); } },
    { id: 'db-share', label: 'Share from a card (Invite tab)', run: () => { reset(); UI.openShare('invite', 'Q3 Sales Review'); } },
    { id: 'db-ws', label: 'Workspace switcher', run: () => { reset(); const ws = $('#wsBtn', root); if (!ws.offsetParent) $('.side', root).classList.add('drawer'); wsMenu(ws); } },
    { id: 'db-account', label: 'Account menu', run: () => { reset(); avaMenu($('#avaBtn', root)); } },
    { id: 'db-bell', label: 'Notifications', run: () => { reset(); bellMenu($('#bellBtn', root)); } },
    { id: 'db-help', label: 'Help menu', run: () => { reset(); helpMenu($('#helpBtn', root)); } },
    { id: 'db-search', label: 'Search (⌘K)', run: () => { reset(); searchModal(); } },
    { id: 'db-sort', label: 'Sort menu', run: () => { reset(); sortMenu($('#sortBtn', root)); } },
    { id: 'db-multi', label: 'Multi-select bar', run: () => reset({ picked: new Set(['d1', 'd3']) }) },
    { id: 'db-empty', label: 'Empty state', run: () => reset({ empty: true }) },
    { id: 'db-trash', label: 'Trash tab', run: () => reset({ tab: 'Trash' }) }]);
  render();
})();
