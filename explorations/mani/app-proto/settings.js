/* Settings: structure and copy from pitchdeckdoclist new_dev_migration (src/listing/.../views/settings), look from Figma UI3. */
(function () {
  const { $, $$, ic, esc, openMenu, openModal, closeModal, toast } = UI;
  const root = $('#settings');
  const ST = { sec: 'general', paid: false, api: false };
  let dlgBack = null; /* set before a sub-dialog opened from the Profile dialog, so Cancel goes back to it */
  const NAV = [['Workspace', [['general', 'buildings', 'General'], ['members', 'users', 'Members'], ['api', 'cpu', 'AI assistants and API']]],
    ['Billing', [['billing', 'credit-card', 'Plan and billing'], ['credits', 'lightning', 'Credits and usage']]], ['Privacy', [['privacy', 'shield-check', 'Data and privacy']]]];
  const card = (title, desc, body, right = '', cls = '') => `<section class="card ${cls}"><div class="ch"><div class="ct"><b>${title}</b>${desc ? `<span>${desc}</span>` : ''}</div>${right}</div>${body ? `<div class="cb2">${body}</div>` : ''}</section>`;
  const frow = (label, hint, ctl) => `<div class="frow"><div class="fl"><b>${label}</b>${hint ? `<span>${hint}</span>` : ''}</div><div class="fc">${ctl}</div></div>`;
  const sel = (v, cls = '') => `<button class="selectbox wide ${cls}"><span>${esc(v)}</span><span class="ico24">${ic('caret-down')}</span></button>`;
  const sw = on => `<button class="switch" role="switch" aria-checked="${on}"></button>`;
  const dlg = (title, body, btns, w = 448) => openModal(`<div class="mhdr"><span class="ttl">${esc(title)}</span><button class="ibtn" data-x data-tip="Close">${ic('x')}</button></div><div class="mbody">${body}</div><div class="mfoot"><span class="sp"></span>${btns}</div>`, { width: w, onMount: m => { const back = dlgBack; dlgBack = null; $$('[data-x],[data-cancel]', m).forEach(b => b.addEventListener('click', () => back ? back() : closeModal())); } });
  const person = (c, i, n, e, you) => `<div class="person"><span class="av" style="background:${c}">${i}</span><span style="min-width:0"><span>${esc(n)}${you ? ' <span class="muted" style="display:inline">(you)</span>' : ''}</span><span class="t9 muted">${esc(e)}</span></span></div>`;

  const S = {
    general: () => card('Workspace', 'Applies to everyone in this workspace.',
      frow('Name', 'Appears in the sidebar and on invites', `<div class="field tall"><input value="Mani's workspace" data-dirty></div>`) +
      frow('Logo', 'Shown in the sidebar and on shared links', `<span class="bigava sq">M</span><button class="btn sm secondary">Upload logo</button><button class="btn sm ghost">Remove</button><span class="muted" style="width:100%">PNG or JPG, up to 1024 × 1024 px and 1 MB.</span>`) +
      `<div class="boxed" style="margin-top:12px"><span class="grow"><span style="display:flex;align-items:center;gap:8px"><b class="strong">Allow teammates to join automatically</b><span class="badge gold">Gold</span></span><span class="muted">Allow anyone with <b class="strong">presentations.ai</b> to join this workspace</span></span>${sw(false)}</div>`) +
      card('Leave workspace', 'You will lose access to this workspace and its files', '', `<button class="btn sm danger" id="leaveBtn">Leave workspace</button>`, 'danger') +
      `<div class="unsaved" id="unsaved"><span class="grow strong">You have unsaved changes</span><button class="btn ghost" id="discard">Discard</button><button class="btn primary" id="saveCh">Save changes</button></div>`,
    members: () => `<div class="banner"><span class="bi">${ic('users')}</span><span class="grow"><b class="strong" style="display:block">Working with others?</b><span class="muted">Gold gives your whole workspace unlimited collaborators, one Brand Kit, shared templates and Refresh schedules. Viewers are always free.</span></span><button class="btn primary" id="startTeam">See Gold</button></div>` +
      card('Invite people', '', `<div style="display:flex;gap:8px"><div class="field tall chips" style="flex:1"><input placeholder="name@company.com"></div><button class="btn primary">${ic('user-plus')}Invite</button></div>
        <div class="sunk" style="margin-top:12px;display:flex;align-items:center;gap:12px"><span style="flex:1"><b class="strong">Anyone with a @presentations.ai email can join</b> as a Member <span class="badge gold">Gold</span></span><span class="muted">Allow company email sign-up</span>${sw(false)}</div>`, '<span class="badge gold">Gold</span>') +
      card('Members (3)', 'Admins manage billing and members. Editors create and edit. Viewers comment and present.', `<table class="tbl"><thead><tr><th style="width:248px">Person</th><th>Role</th><th>Last active</th><th class="r">Credits used</th><th></th></tr></thead><tbody>
        <tr><td>${person('#FFCD29', 'M', 'Mani Vasakan', 'manivasakan@presentations.ai', 1)}</td><td>Owner</td><td class="muted">Active now</td><td class="r">80</td><td></td></tr>
        <tr><td>${person('#9747FF', 'A', 'Arun Kumar', 'arun@presentations.ai')}</td><td><button class="selectbox mrole"><span>Admin</span><span class="ico24">${ic('caret-down')}</span></button></td><td class="muted">Today</td><td class="r">240</td><td class="r"><button class="ibtn mmore" data-tip="More actions">${ic('dots-three')}</button></td></tr>
        <tr><td>${person('#14AE5C', 'M', 'Meera Iyer', 'meera@presentations.ai')}</td><td><button class="selectbox mrole"><span>Member</span><span class="ico24">${ic('caret-down')}</span></button></td><td class="muted">3 Days ago</td><td class="r">0</td><td class="r"><button class="ibtn mmore" data-tip="More actions">${ic('dots-three')}</button></td></tr></tbody></table>`) +
      card('Guests (1)', '', `<table class="tbl"><thead><tr><th style="width:248px">Person</th><th>Role</th><th>Last active</th><th></th></tr></thead><tbody><tr><td>${person('#0D99FF', 'P', 'Priya Shah', 'priya@acme.com')}</td><td>Guest</td><td class="muted">1 day ago</td><td class="r"><button class="btn sm secondary">Promote to member</button> <button class="ibtn mmore" data-tip="More actions">${ic('dots-three')}</button></td></tr></tbody></table>`) +
      card('Pending requests (1)', '', `<table class="tbl"><tbody><tr><td>${person('#FFA629', 'R', 'rahul@acme.com', 'rahul@acme.com · 2 hours ago')}</td><td>Member</td><td class="r"><button class="btn sm ghost">Reject</button> <button class="btn sm secondary">Approve</button></td></tr></tbody></table>`, '<button class="btn sm secondary">Approve all</button>') +
      card('Pending invitations (2)', '', `<table class="tbl"><thead><tr><th>Person</th><th style="width:80px">Role</th><th style="width:152px"></th></tr></thead><tbody>
        <tr><td><b class="strong">kiran@acme.com</b><div class="t9 muted">kiran@acme.com · Mani's workspace · invited by Mani · Expires on Nov 16</div></td><td>Member</td><td class="r"><button class="btn sm ghost">Resend</button><button class="btn sm ghost">Revoke</button></td></tr>
        <tr><td><b class="strong">sara@globex.com</b><div class="t9 muted">sara@globex.com · Sales enablement · invited by Arun · Expires on Nov 18</div></td><td>Can view</td><td class="r"><button class="btn sm ghost">Resend</button><button class="btn sm ghost">Revoke</button></td></tr></tbody></table>`) +
      card('Who can invite', "The Owner and Admins always invite directly. A project lead's invite for a new Member waits for their approval unless this is on.", `<div class="boxed"><span class="grow">Send project leads' Member invites without approval <span class="badge gold">Available on Gold</span></span><button class="switch" role="switch" aria-checked="false" disabled></button></div>`) +
      card('Single sign-on (SAML)', 'Require everyone at your company to sign in through Okta, Azure AD or Google Workspace.', '', '<span class="badge outline">Enterprise</span><button class="btn sm secondary">Talk to us</button>'),
    api: () => card('Use Presentations.AI from your AI assistant', 'Our platform provides powerful AI-driven tools for creating professional presentations through both REST API and MCP (Model Context Protocol) integration.',
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="sunk"><b class="strong" style="display:block">MCP Integration</b><span class="muted">Claude Desktop: AI-powered chat, natural language slides, seamless workflow, and real-time collaboration for productivity.</span></div><div class="sunk"><b class="strong" style="display:block">REST API Integration</b><span class="muted">Traditional HTTP API with JSON responses and bearer token authentication, ideal for web, mobile, and backend apps.</span></div></div>`,
      `<button class="btn sm secondary">${ic('arrow-square-out')}Documentation</button>`) +
      card('API and MCP', 'Your API keys are used to access the API on your own behalf. You will be the creator of presentations made with the API. Check out the API documentation for more information and how to use it.',
        ST.api ? frow('API key', 'Shown once. Scoped to this workspace.', `<div class="field tall dis"><input disabled value="No API keys yet"></div><button class="btn primary" id="newKey">${ic('key')}Create API key</button>`)
          : `<div class="sunk" style="display:flex;align-items:center;gap:16px"><span style="flex:1"><b class="strong" style="display:block">Create presentations at scale</b><span class="muted">Automate presentations by integrating with your app or workflow.</span><div style="margin-top:12px"><button class="btn primary" id="exploreApi">Explore API and MCP</button></div></span><span class="ico24" style="width:72px;height:72px;border-radius:13px;background:var(--color-bg);color:var(--color-icon-brand)"><i class="ph-light ph-plugs-connected" style="font-size:32px"></i></span></div>`,
        ST.api ? '<span class="gbadge">API Access</span>' : ''),
    billing: () => {
      const P = UI.PLANS || [];
      const cur = ST.paid ? card('Pro <span class="badge pro" style="vertical-align:middle">Current plan</span>', '$240/year · 1 seat · 5,000 Credits', '<span class="muted">Your next billing date is Oct 2, 2027</span>', '<button class="btn sm secondary" id="chgPlan">Change plan</button><button class="btn sm ghost" id="cancelRen">Cancel renewal</button>')
        : card('Free <span class="badge pro" style="vertical-align:middle">Current plan</span>', '1 Editor · 200 Credits', '', '<button class="btn sm primary" id="seePlans">See plans</button>');
      const up = ST.paid ? '' : card('Upgrade Plans', '', `<div class="packs">${P.filter(p => p.id !== 'basic').map(p => `<button class="pack" data-goplans><span class="coin" style="background:var(--color-bg-brand-tertiary);color:var(--color-icon-brand)">${ic(p.icon)}</span><span class="grow"><b class="strong" style="display:block">Get ${p.name} · ${p.credits} credits</b><span class="muted" data-tip="${esc(p.more)}">+ 3 more features</span></span><span style="text-align:right"><span class="gbadge" style="margin-bottom:4px">20% OFF</span><b class="strong" style="display:block">$${p.annualMo}<span class="muted" style="font-weight:450"> a month</span></b><span class="t9 muted">$${p.annualYr} billed annually</span></span>${ic('caret-right')}</button>`).join('')}</div>`);
      const inv = ST.paid ? card('Invoices', '', `<table class="tbl"><tbody>${[['Oct 2, 2026', '$240']].map(r => `<tr><td>${r[0]}</td><td class="muted">manivasakan@presentations.ai</td><td>${r[1]}</td><td class="r"><span class="gbadge">Paid</span></td></tr>`).join('')}</tbody></table>`) : '';
      const cr = card(ST.paid ? '4.9k credits left' : '120 credits left', '', `<div class="cbar"><span style="width:${ST.paid ? 98 : 60}%"></span></div><div style="display:flex;justify-content:space-between" class="muted"><span>${ST.paid ? '80' : '80'} Credits used</span><span>${ST.paid ? '5,000' : '200'} Total</span></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn sm secondary" data-gocredits>Buy more credits</button><button class="btn sm ghost" id="credHist">View credit history</button></div>`);
      return cur + up + inv + cr;
    },
    credits: () => `<div style="display:grid;grid-template-columns:1.2fr 1fr;gap:16px">` + card('120 credits left', 'Free credits do not reset. Paid plans reset each year.', `<div class="cbar"><span style="width:60%"></span></div><div style="display:flex;justify-content:space-between" class="muted"><span>80 used</span><span>200 total</span></div><div style="margin-top:12px"><button class="btn sm primary" data-goplans>See plans</button></div>`) +
      card('What actions cost', 'Two prices and one multiplier. Credits are only spent when AI writes something.', `<div class="costs">${[['Generate a new slide', 'Each slide in a new deck, a slide from a prompt or from data.', '10'], ['Edit a slide with AI', 'Any AI action on one slide: rewrite, shorten, chart, notes, refresh.', '5'], ['Deep research and planning', 'Reads every source and plans first. Doubles the cost of either action.', '2×']].map(c => `<div class="crow"><span class="grow"><b class="strong" style="display:block">${c[0]}</b><span class="muted">${c[1]}</span></span><span class="pr">${c[2]}</span></div>`).join('')}</div>`) + `</div>` +
      card('Examples', '', `<div class="sunk">${['9-slide deck: 9 × 10 = 90 credits', 'Same deck with deep research: 180 credits', 'Shorten titles on 3 slides: 3 × 5 = 15 credits', "Pro's 5,000 credits a year: about 55 decks of 9 slides"].map(t => `<div style="padding:2px 0">${t}</div>`).join('')}</div><p class="muted" style="margin-top:8px">Always free: themes, Brand Kit, typing your own edits, present, share and download.</p>`) +
      card('Generating decks used most of the last four weeks', '320 credits across the workspace, by week and action', `<div class="legend"><span><i style="background:var(--color-bg-brand)"></i>Generate</span><span><i style="background:#FFA629"></i>AI edits</span><span><i style="background:#14AE5C"></i>Inserts</span><span><i style="background:#FFCD29"></i>Refresh</span></div><div class="chart">${chartSvg()}</div>`) +
      card('History', '', `<table class="tbl"><thead><tr><th>Date</th><th>Action</th><th>By</th><th class="r">Credits</th></tr></thead><tbody>${[['2 Oct, 10:02', 'Generate a new slide', 'Mani', '-90'], ['1 Oct, 16:40', 'Edit a slide with AI', 'Arun', '-15'], ['30 Sep, 11:15', 'Plan credits', 'System', '+200'], ['28 Sep, 09:30', 'Deep research and planning', 'Mani', '-180']].map(r => `<tr><td class="muted">${r[0]}</td><td>${r[1]}</td><td class="muted">${r[2]}</td><td class="r" style="${r[3][0] === '+' ? 'color:var(--color-text-success)' : ''}">${r[3]}</td></tr>`).join('')}</tbody></table>`, `<button class="selectbox" id="histFilter"><span>All</span><span class="ico24">${ic('caret-down')}</span></button>`),
    privacy: () => card('How your data is handled', '', ['Files, pasted numbers and CRM data are encrypted in transit and at rest.', 'Your content is never used to train AI models, on any plan.', 'Deleting a deck deletes its uploaded files and data bindings within 30 days.', 'CRM connections are read-only and can be removed at any time.'].map(t => `<div class="okrow">${ic('check-circle')}<span>${t}</span></div>`).join(''), `<span class="badge outline" style="height:24px;padding:0 8px;gap:4px">${ic('shield-check')}SOC 2 Type II</span>`) };
  function chartSvg() {
    const W = 640, H = 240, weeks = [['8 Sep', [40, 15, 5, 0]], ['15 Sep', [60, 20, 10, 5]], ['22 Sep', [90, 25, 5, 10]], ['29 Sep', [30, 10, 0, 5]]], cols = ['var(--color-bg-brand)', '#FFA629', '#14AE5C', '#FFCD29'];
    const max = 140, bw = 72, gap = (W - 4 * bw) / 5; let g = '';
    [0, 1, 2].forEach(i => { const y = 20 + i * (H - 60) / 2; g += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="var(--color-border)" stroke-dasharray="2 3"/>`; });
    weeks.forEach((w, i) => { let y = H - 40; const x = gap + i * (bw + gap); const tot = w[1].reduce((a, b) => a + b, 0);
      w[1].forEach((v, j) => { const h = v / max * (H - 60); y -= h; if (h) g += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${cols[j]}" rx="2"/>`; });
      g += `<text x="${x + bw / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="var(--color-text)">${tot}</text><text x="${x + bw / 2}" y="${H - 20}" text-anchor="middle" font-size="11" fill="var(--color-text-secondary)">${w[0]}</text>`; });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly credit use">${g}</svg>`;
  }

  /* ---------- Profile dialog (personal, opened from the avatar menu, like Figma account settings) ---------- */
  const PTABS = [['account', 'Account'], ['prefs', 'Preferences']];
  const accountBody = () => frow('Photo', '', `<span class="bigava">M</span><button class="btn sm secondary">Upload photo</button><button class="btn sm ghost" disabled style="color:var(--color-text-disabled)">Remove</button><span class="muted" style="width:100%">PNG or JPG, up to 1024 × 1024 px and 1 MB.</span>`) +
      frow('Name', '', `<div class="field tall"><input aria-label="Your first name" value="Mani" data-dirty></div><div class="field tall"><input aria-label="Your last name" value="Vasakan" data-dirty></div>`) +
      frow('Sign-in email', 'Used to sign in and for receipts. Connects your CRM and joins your company workspace', `<div class="field tall dis"><input disabled value="manivasakan@presentations.ai"></div>`) +
      frow('Which describes you', 'Chosen at sign-up. Sets your Home, suggested templates, the plans we show first and the emails you get. Applies right away.', sel('Sales and RevOps leaders', 'dis')) +
    frow('Password', 'Not set. You sign in with Google.', `<button class="btn sm secondary" id="pwBtn">${ic('lock-simple')}Set a password</button>`) +
    `<div style="margin-top:16px">` + card('Delete account', 'Removes every deck, file and connection. This cannot be undone.', '', `<button class="btn sm danger" id="delAcc">${ic('trash')}Delete account</button>`, 'danger') + `</div>`;
  const prefsBody = () => frow('Appearance', "Applies right away on this device. System follows your computer's setting.", `<div class="apgrid" role="radiogroup">${[['system', 'desktop', 'System', '<i style="background:#FFFFFF"></i><i style="background:#2C2C2C"></i>'], ['light', 'sun', 'Light', '<i style="background:#FFFFFF"></i>'], ['dark', 'moon', 'Dark', '<i style="background:#2C2C2C"></i>']].map(t => `<button class="aptile" role="radio" data-ap="${t[0]}" aria-checked="${t[0] === UI.S.theme}"><span class="pv">${t[3]}</span><span class="lb">${ic(t[1])}${t[2]}</span></button>`).join('')}</div>`) +
    frow('Language', 'Applies to the app interface', `<span id="langBtn">${sel('English')}</span>`) +
    frow('Time zone', 'Used for Refresh dates and reminders', `<span id="tzBtn">${sel('Asia/Kolkata (GMT+5:30)')}</span>`);
  function openProfile(tab = 'account', o = {}) {
    const back = () => openProfile(tab);
    const foot = tab === 'account' ? `<span class="sp"></span><button class="btn secondary" data-px>Cancel</button><button class="btn primary" id="pSave" ${o.dirty ? '' : 'disabled'}>Save changes</button>`
      : `<span class="sp muted">Changes apply right away.</span><button class="btn primary" data-px>Done</button>`;
    openModal(`<div class="mhdr"><span class="ttl">Your account</span><button class="ibtn" data-px data-tip="Close">${ic('x')}</button></div>
      <div class="tabs ptabs" role="tablist">${PTABS.map(t => `<button class="tab" role="tab" data-ptab="${t[0]}" aria-selected="${tab === t[0]}">${t[1]}</button>`).join('')}</div>
      <div class="mbody pbody">${tab === 'account' ? accountBody() : prefsBody()}</div><div class="mfoot">${foot}</div>`,
      { width: 720, onMount: m => {
        m.dataset.dismiss = 'backdrop';
        $$('[data-px]', m).forEach(b => b.addEventListener('click', closeModal));
        $$('[data-ptab]', m).forEach(b => b.addEventListener('click', () => openProfile(b.dataset.ptab)));
        $$('[data-dirty]', m).forEach(i => i.addEventListener('input', () => { $('#pSave', m).disabled = false; }));
        const sv = $('#pSave', m); sv && sv.addEventListener('click', () => { closeModal(); toast('Changes saved'); });
        const pw = $('#pwBtn', m); pw && pw.addEventListener('click', () => { dlgBack = back; pwDlg(); });
        const da = $('#delAcc', m); da && da.addEventListener('click', () => { dlgBack = back; delDlg(); });
        $$('[data-ap]', m).forEach(t => t.addEventListener('click', () => { const v = t.dataset.ap; UI.setTheme(v === 'dark' ? 'dark' : 'light'); $$('[data-ap]', m).forEach(x => x.setAttribute('aria-checked', x === t)); }));
        const lb = $('#langBtn button', m); lb && lb.addEventListener('click', () => openMenu(lb, ['English', 'Español', 'Français', 'Deutsch', 'Português', '日本語'].map((l, i) => ({ label: l, check: i === 0, onClick: () => { if (i) { dlgBack = back; langDlg(l); } } })), { width: 220, over: true }));
        const tz = $('#tzBtn button', m); tz && tz.addEventListener('click', () => openMenu(tz, ['Asia/Kolkata (GMT+5:30)', 'Asia/Singapore (GMT+8)', 'Europe/London (GMT+1)', 'America/New_York (GMT-4)'].map((l, i) => ({ label: l, check: i === 0 })), { width: 240, over: true }));
      } });
  }
  UI.openProfile = openProfile;
  function homeBehind() {
    root.innerHTML = UI.shell.side('Home') + `<div class="dmain">${UI.shell.top()}<div class="dscroll">${UI.shell.body()}</div></div>`;
    UI.shell.wire(root); UI.setTheme(UI.S.theme);
  }
  function render() {
    root.innerHTML = UI.shell.side('Settings') + `<div class="dmain">${UI.shell.top()}<div class="dscroll"><div class="stwrap"><h1>Workspace settings</h1>
      <div class="wshead"><span class="bigava sq">M</span><span class="grow"><b class="strong" style="display:block">Mani's workspace</b><span class="muted">${ST.paid ? 'Pro plan' : 'Free plan'} · 3 members · ${ST.paid ? '4.9k' : '120'} credits left</span></span>${ST.paid ? '<span class="badge pro">Pro</span>' : '<button class="btn sm secondary" id="seePlans2">See plans</button>'}<button class="btn sm secondary" data-sec="members">${ic('user-plus')}Invite people</button></div>
      <div class="stgrid"><nav class="stnav" aria-label="Settings">${NAV.map(g => `<div class="gh">${g[0]}</div>${g[1].map(n => `<div class="navslot"><button class="navrow" data-sec="${n[0]}" ${ST.sec === n[0] ? 'aria-current="page"' : ''}>${ic(n[1])}<span>${n[2]}</span></button></div>`).join('')}`).join('')}</nav>
      <div class="stcol"><div class="tabs stnav-m">${NAV.flatMap(g => g[1]).map(n => `<button class="tab" data-sec="${n[0]}" aria-selected="${ST.sec === n[0]}">${n[2]}</button>`).join('')}</div>${S[ST.sec]()}</div></div></div></div></div>`;
    UI.shell.wire(root); wire(); UI.setTheme(UI.S.theme);
  }
  function wire() {
    $$('[data-sec]', root).forEach(b => b.addEventListener('click', () => { ST.sec = b.dataset.sec; render(); }));
    $$('.switch', root).forEach(s => s.addEventListener('click', () => { if (!s.disabled) s.setAttribute('aria-checked', s.getAttribute('aria-checked') !== 'true'); }));
    $$('[data-dirty]', root).forEach(i => i.addEventListener('input', () => $('#unsaved', root).classList.add('on')));
    const d = $('#discard', root); d && d.addEventListener('click', render);
    const sv = $('#saveCh', root); sv && sv.addEventListener('click', () => { $('#unsaved', root).classList.remove('on'); toast('Changes saved'); });
    $$('[data-ap]', root).forEach(t => t.addEventListener('click', () => { const v = t.dataset.ap; UI.setTheme(v === 'dark' ? 'dark' : 'light'); $$('[data-ap]', root).forEach(x => x.setAttribute('aria-checked', x === t)); }));
    const lb = $('#langBtn button', root); lb && lb.addEventListener('click', () => openMenu(lb, ['English', 'Español', 'Français', 'Deutsch', 'Português', '日本語'].map((l, i) => ({ label: l, check: i === 0, onClick: () => i && langDlg(l) })), { width: 220, over: true }));
    const tz = $('#tzBtn button', root); tz && tz.addEventListener('click', () => openMenu(tz, ['Asia/Kolkata (GMT+5:30)', 'Asia/Singapore (GMT+8)', 'Europe/London (GMT+1)', 'America/New_York (GMT-4)'].map((l, i) => ({ label: l, check: i === 0 })), { width: 240, over: true }));
    const pw = $('#pwBtn', root); pw && pw.addEventListener('click', pwDlg);
    const lv = $('#leaveBtn', root); lv && lv.addEventListener('click', leaveDlg);
    $$('.mrole', root).forEach(b => b.addEventListener('click', () => openMenu(b, ['Admin', 'Member'].map(r => ({ label: r, check: $('span', b).textContent === r, onClick: () => { $('span', b).textContent = r; toast('Member role updated'); } })), { width: 140, over: true })));
    $$('.mmore', root).forEach(b => b.addEventListener('click', () => openMenu(b, [{ label: 'Remove', icon: 'trash', danger: true, onClick: removeDlg }], { width: 160, align: 'end' })));
    const nk = $('#newKey', root); nk && nk.addEventListener('click', keyDlg);
    const ex = $('#exploreApi', root); ex && ex.addEventListener('click', () => { ST.api = true; render(); });
    const toPr = st => () => { UI.S.state = ''; UI.setView('pricing'); UI.runState(st); };
    $$('#seePlans, #seePlans2, [data-goplans]', root).forEach(b => b.addEventListener('click', toPr('pr-plans')));
    $$('#chgPlan', root).forEach(b => b.addEventListener('click', toPr('pr-paid')));
    $$('[data-gocredits]', root).forEach(b => b.addEventListener('click', toPr('pr-credits')));
    $$('#startTeam', root).forEach(b => b.addEventListener('click', toPr('pr-nudge-invite')));
    const cr = $('#cancelRen', root); cr && cr.addEventListener('click', () => cancelFlow(1));
    const ch = $('#credHist', root); ch && ch.addEventListener('click', histDlg);
    const da = $('#delAcc', root); da && da.addEventListener('click', delDlg);
    const hf = $('#histFilter', root); hf && hf.addEventListener('click', () => openMenu(hf, ['All', 'Generate a new slide', 'Edit a slide with AI', 'Deep research and planning', 'Plan credits'].map((x, i) => ({ label: x, check: i === 0 })), { width: 220, align: 'end' }));
  }
  const langDlg = l => dlg('Change Language', `<div style="display:flex;align-items:center;gap:8px;justify-content:center"><span class="pchip">${ic('globe-simple')}English</span>${ic('arrow-right')}<span class="pchip" aria-pressed="true">${ic('globe-simple')}${esc(l)}</span></div><div class="sunk" style="margin-top:12px"><b class="strong" style="display:block">Apply to interface only</b><span class="muted">Menus and controls will use this language</span></div>`, '<button class="btn secondary" data-cancel>Cancel</button><button class="btn primary" data-cancel>Change Language</button>');
  const pwDlg = () => dlg('Update your password', `<p class="muted">Your password should be 10+ characters and a mix of letters, symbols and numbers.</p>${[['Current password', 'Enter your current password'], ['New Password', 'Enter your new password'], ['Re-enter new password', 'Re-enter new password']].map(f => `<div style="margin-top:12px"><b class="strong" style="display:block;margin-bottom:4px">${f[0]}</b><div class="field tall"><input type="password" placeholder="${f[1]}"><button class="ibtn" data-tip="Show password">${ic('eye')}</button></div></div>`).join('')}`, '<button class="btn secondary" data-cancel>Cancel</button><button class="btn primary">Update password</button>');
  const leaveDlg = () => dlg('Leave workspace', `<p class="muted">You'll lose access to this workspace and its files. Public and shared decks stay with the workspace. Your private decks are deleted; if you rejoin within 30 days, an admin can restore them.</p>`, '<button class="btn secondary" data-cancel>Cancel</button><button class="btn danger" data-cancel>Leave workspace</button>');
  const removeDlg = () => dlg('Remove member', '<p class="muted">Arun Kumar will lose access to this workspace and all of its decks.</p>', '<button class="btn secondary" data-cancel>Cancel</button><button class="btn danger" data-cancel>Remove</button>', 400);
  const keyDlg = () => dlg('Name your new API key', `<p class="muted">This will help you identify it, and you can always change it later.</p><div style="margin-top:12px"><b class="strong" style="display:block;margin-bottom:4px">API Key name</b><div class="field tall"><input placeholder="API Key name"></div></div>`, `<button class="btn secondary" data-cancel>Cancel</button><button class="btn primary" id="mkKey">Create API key</button>`) || setTimeout(() => { const b = $('#mkKey'); b && b.addEventListener('click', savedKeyDlg); }, 0);
  const savedKeyDlg = () => { dlg('Keep it safe.', `<p class="muted">This is your API key. Please copy it and keep it safe.</p><div class="field tall" style="margin-top:12px"><input readonly value="pai_live_7Hk2Qm9xL4vR8tN3"><button class="btn sm secondary">${ic('copy')}Copy</button></div><label style="display:flex;gap:8px;align-items:flex-start;margin-top:12px;cursor:pointer"><span class="cb" role="checkbox" aria-checked="false" id="keyOk">${ic('check')}</span><span>Yes, I have saved my key and I understand I cannot see this in future.</span></label>`, '<button class="btn primary" id="keySave" disabled>Save</button>');
    setTimeout(() => { const c = $('#keyOk'), s = $('#keySave'); c && c.parentElement.addEventListener('click', () => { const on = c.getAttribute('aria-checked') !== 'true'; c.setAttribute('aria-checked', on); s.disabled = !on; }); s && s.addEventListener('click', closeModal); }, 0); };
  const histDlg = () => dlg('Credit History', `<table class="tbl"><thead><tr><th>Event</th><th>Date</th><th class="r">Credits</th></tr></thead><tbody>${[['Generate a new slide', 'Mani', '2 Oct 2025', '-90'], ['Edit a slide with AI', 'Arun', '1 Oct 2025', '-15'], ['Plan credits', 'System', '30 Sep 2025', '+200']].map(r => `<tr><td>${r[0]}<div class="t9 muted">by ${r[1]}</div></td><td class="muted">${r[2]}</td><td class="r">${r[3]}</td></tr>`).join('')}</tbody></table>`, '<button class="btn sm secondary" disabled>Previous</button><button class="btn sm secondary">Next</button>', 520);
  const delDlg = () => { dlg('Delete your account?', `<p class="muted">Type DELETE to confirm. Your decks and files are removed permanently.</p><div class="field tall" style="margin-top:12px;font-family:var(--font-family-mono)"><input id="delIn" placeholder="DELETE"></div>`, '<button class="btn secondary" data-cancel>Keep my account</button><button class="btn danger" id="delGo" disabled>Delete permanently</button>');
    setTimeout(() => { const i = $('#delIn'), b = $('#delGo'); i && i.addEventListener('input', () => { b.disabled = i.value !== 'DELETE'; }); }, 0); };
  function cancelFlow(step) {
    const keep = '<button class="btn secondary" id="cfNext">Continue to cancel</button><button class="btn primary" data-cancel>Keep my plan</button>';
    const steps = {
      1: ['Worried about being charged next year without notice?', "<p class=\"muted\">Keep your plan and we'll email you a reminder before your renewal, so there are no surprises.</p>"],
      2: ["Nothing changes today, you're on Pro until Oct 2, 2027", ['12 Presentations', 'Generating New Decks', '4,920 Unused Credits'].map(t => `<div class="boxed" style="margin-top:8px"><span class="grow">${t}</span><span class="gbadge">Till Oct 2, 2027</span></div>`).join('')],
      3: ["Mind sharing why you're cancelling?", '<p class="muted">It helps us improve. Pick any that apply.</p>' + ['Too expensive', 'Not using it enough', 'Missing features I need', 'Found a better alternative', 'Technical issues or bugs', 'Taking a temporary break', 'Other'].map(t => `<label style="display:flex;gap:8px;align-items:center;padding:6px 0;cursor:pointer" class="cfopt"><span class="cb" role="checkbox" aria-checked="false">${ic('check')}</span>${t}</label>`).join('')],
      4: ["Before you cancel, here's 20% off your next renewal.", '<p class="muted">Stay on Pro and your next renewal drops by 20%.</p>'] };
    const btns = step === 4 ? '<button class="btn secondary" data-cancel>Continue to cancel</button><button class="btn primary" data-cancel>Stay on Pro, save 20% off</button>' : keep;
    dlg(steps[step][0], steps[step][1], btns);
    setTimeout(() => { const n = $('#cfNext'); n && n.addEventListener('click', () => cancelFlow(step + 1)); $$('.cfopt').forEach(o => o.addEventListener('click', e => { e.preventDefault(); const c = $('.cb', o); c.setAttribute('aria-checked', c.getAttribute('aria-checked') !== 'true'); })); }, 0);
  }

  const go = (sec, o = {}) => { Object.assign(ST, { sec, paid: false, api: false }, o); render(); };
  UI.onChange(k => { if (k === 'theme') $$('#modal [data-ap]').forEach(x => x.setAttribute('aria-checked', x.dataset.ap === UI.S.theme)); });
  UI.registerStates('settings', [
    { id: 'st-general', label: 'Workspace: General', run: () => go('general') },
    { id: 'st-leave', label: 'General, leave workspace', run: () => { go('general'); leaveDlg(); } },
    { id: 'st-members', label: 'Workspace: Members', run: () => go('members') },
    { id: 'st-member-menu', label: 'Members, row menu', run: () => { go('members'); const b = $('.mmore', root); openMenu(b, [{ label: 'Remove', icon: 'trash', danger: true, onClick: removeDlg }], { width: 160, align: 'end' }); } },
    { id: 'st-api', label: 'Workspace: AI assistants and API, no API plan', run: () => go('api') },
    { id: 'st-api-on', label: 'AI assistants and API, with API plan', run: () => go('api', { api: true }) },
    { id: 'st-api-key', label: 'API, new key saved dialog', run: () => { go('api', { api: true }); savedKeyDlg(); } },
    { id: 'st-billing', label: 'Workspace: Plan and billing, free', run: () => go('billing') },
    { id: 'st-billing-paid', label: 'Plan and billing, paid Pro', run: () => go('billing', { paid: true }) },
    { id: 'st-cancel1', label: 'Cancel renewal, step 1', run: () => { go('billing', { paid: true }); cancelFlow(1); } },
    { id: 'st-cancel3', label: 'Cancel renewal, reasons', run: () => { go('billing', { paid: true }); cancelFlow(3); } },
    { id: 'st-cancel4', label: 'Cancel renewal, 20% offer', run: () => { go('billing', { paid: true }); cancelFlow(4); } },
    { id: 'st-history', label: 'Credit history dialog', run: () => { go('billing'); histDlg(); } },
    { id: 'st-credits', label: 'Workspace: Credits and usage', run: () => go('credits') },
    { id: 'st-privacy', label: 'Workspace: Data and privacy', run: () => go('privacy') },
    { id: 'st-profile', label: 'Profile dialog: Account (from avatar)', run: () => { homeBehind(); openProfile('account'); } },
    { id: 'st-profile-unsaved', label: 'Profile dialog: name changed, Save on', run: () => { homeBehind(); openProfile('account', { dirty: true }); } },
    { id: 'st-prefs', label: 'Profile dialog: Preferences', run: () => { homeBehind(); openProfile('prefs'); } },
    { id: 'st-lang', label: 'Profile dialog: change language', run: () => { homeBehind(); dlgBack = () => openProfile('prefs'); langDlg('Español'); } },
    { id: 'st-pw', label: 'Profile dialog: set a password', run: () => { homeBehind(); dlgBack = () => openProfile('account'); pwDlg(); } },
    { id: 'st-delete', label: 'Profile dialog: delete account', run: () => { homeBehind(); dlgBack = () => openProfile('account'); delDlg(); } }]);
})();
