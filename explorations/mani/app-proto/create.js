/* Create flow: structure and copy from pitchdeckdoclist new_dev_migration (createflowv2 + src/chat), look from Figma UI3. */
(function () {
  const { $, $$, ic, esc, openMenu, openModal, closeModal, toast } = UI;
  const root = $('#create');
  const C = { screen: 'landing', text: '', files: [], opts: false, o: null, err: '', banner: '', kit: null, stage: 'thinking', q: null };
  const PH = ['Q3 business review for the leadership team', 'Seed pitch for a scheduling app for dental clinics', 'Onboarding guide for new support hires', 'Quarterly marketing results with campaign highlights', 'Launch plan for our new mobile app'];
  const SUG = [['🏛️', 'Q4 revenue performance and 2026 strategic priorities'], ['🎯', 'Q3 OKR progress with risks and recommended actions'], ['📣', 'Q3 results team milestones and 6-month priorities']];
  const WAYS = [['microsoft-powerpoint-logo', 'Import PowerPoint', 'Redesign an existing deck'], ['squares-four', 'Choose a template', 'Start from a ready layout'], ['pen-nib', 'Hire an expert', 'A designer builds it for you'], ['arrows-clockwise', 'Update a presentation', 'Refresh numbers in a deck']];
  const PERSONAS = [['chart-line-up', 'Sales and RevOps leaders', 'Sales leaders, RevOps, account managers'], ['rocket-launch', 'Founders and leadership', 'Founders, CEOs, finance and leadership'], ['handshake', 'Account executives and consultants', 'Account executives, consultants, agencies'], ['kanban', 'Project and operations leads', 'Project, program and operations leads'],
    ['megaphone', 'Marketers', 'Marketing and growth teams'], ['chalkboard-teacher', 'Trainers and L&D', 'Trainers, L&D, HR and team leads'], ['student', 'Students', 'School and college students'], ['user', 'Everyone else', 'Anyone else']];
  const OD = { count: 'Let AI decide', time: 'Not set', lang: 'Auto', detail: 'Auto', notes: false, role: 'Sales and RevOps leaders', use: 'Detect from the request', shown: 'Not said', narr: "The use case's arc", missing: 'Estimates', effort: 'Auto', express: false, deep: false, cite: false };
  const LISTS = { count: ['Let AI decide', 'One Summary Slide', 'Short (2-5 slides)', 'Medium (6-10 slides)', 'Long (11-20 slides)', 'Very Long (21+ slides)'], role: PERSONAS.map(p => p[1]),
    shown: ['Not said', 'A big room or stage', 'A meeting room', 'A video call', 'Read on its own', 'Printed'], narr: ["The use case's arc", 'Investor pitch', 'Answer first (SCR)', 'Performance report', 'Problem → solution → proof', 'Proposal', 'Case study', 'Launch reveal', 'Lesson', 'Plan & roadmap', 'Explainer'] };
  const nChanged = () => Object.keys(OD).filter(k => C.o[k] !== OD[k]).length;
  let rotT = 0;

  const head = (chat) => `<div class="crtop"><button class="ibtn lg" id="crBack" data-tip="Back">${ic('arrow-left')}</button><span class="grow"></span>${chat ? '<span class="badge outline" style="height:24px;padding:0 8px">Premium · 20 credits/slide</span>' : ''}<button class="ibtn lg" id="crTheme" data-tip="Switch theme"><i data-theme-icon class="ph-light ph-moon"></i></button><button class="ibtn lg" id="crClose" data-tip="Close">${ic('x')}</button></div>`;
  const chip = (k, v) => `<button class="pchip" data-k="${k}" data-v="${esc(v)}" aria-pressed="${C.o[k] === v}">${esc(v)}</button>`;
  const selbtn = k => `<button class="selectbox" data-sel="${k}" ${LISTS[k] ? '' : 'aria-disabled="true"'}><span>${esc(C.o[k])}</span><span class="ico24">${ic('caret-down')}</span></button>`;
  const seg = (k, opts) => `<div class="seg">${opts.map(o => `<button data-k="${k}" data-v="${esc(o)}" aria-pressed="${C.o[k] === o}">${o}</button>`).join('')}</div>`;
  const sw = k => `<button class="switch" role="switch" data-k="${k}" aria-checked="${!!C.o[k]}"></button>`;
  /* Options, PV2 v5 web (pitchdeckdoclist src/chat/components/createprompt/CreateOptionsPanel.jsx): a row per section,
     title and line on the left (sticky beside a tall section), its fields on the right; Audience and tone in two columns;
     Speaker notes and Mode as toggle rows with a tinted icon tile; Effort with bar glyphs. */
  const fld = (label, ctl, sub) => `<div class="of"><span class="ol">${label}${sub ? `<span class="os2">${sub}</span>` : ''}</span>${ctl}</div>`;
  const tog = (k, icon, t, d) => `<div class="otg"><span class="oti ${C.o[k] ? 'on' : ''}">${ic(icon)}</span><span class="otx"><b>${t}</b><span>${d}</span></span>${sw(k)}</div>`;
  const bars = n => `<svg viewBox="0 0 16 16" class="obar" aria-hidden="true">${[0, 1, 2].map(i => `<rect x="${3 + i * 4}" y="${11 - i * 3}" width="2" height="${3 + i * 3}" rx=".5" fill="currentColor" opacity="${i < n ? 1 : 0.3}"/>`).join('')}</svg>`;
  const osec = (t, sub, body) => `<section class="orw"><div class="ort"><b>${t}</b><span>${sub}</span></div><div class="orb">${body}</div></section>`;
  function optionsPanel() {
    return `<div class="optp v5" id="optPanel" role="region" aria-label="Options"><div class="oh"><b class="strong">Options</b><span class="muted">Remembered for next time</span><span class="grow"></span>${nChanged() ? '<button class="btn sm ghost" id="optReset">Reset</button>' : ''}<button class="btn sm ghost" id="optHide">Hide options</button></div>
      ${osec('Length and language', 'Slide count, talk time, language and detail', `<div class="ocol">
        ${fld('Slide count', selbtn('count'))}
        ${fld('Presentation time', `<div class="ochips">${['Not set', '5 min', '10 min', '15 min', '20 min', '30 min', '45+ min'].map(t => chip('time', t)).join('')}</div>`, 'We fit the slides to it')}
        ${fld('Language', selbtn('lang'))}
        ${fld('Level of detail', seg('detail', ['Auto', 'Brief', 'Standard', 'Detailed']))}
        ${tog('notes', 'text-align-left', 'Speaker notes', 'Talking points under every slide')}</div>`)}
      ${osec('Audience and tone', "Who it's for and how it flows. We read it from your prompt.", `<div class="og2">${fld('Your role', selbtn('role'))}${fld('Use case', selbtn('use'))}${fld('Shown', selbtn('shown'))}${fld('Narrative', selbtn('narr'))}${fld('Missing data', seg('missing', ['Placeholders', 'Estimates']))}</div>
        <p class="onote">Leave these on auto and we read them from your prompt.</p>`)}
      ${osec('Effort', 'More effort gives richer slides and uses more credits.', `<div class="seg">${['Auto', 'Efficient', 'Standard', 'Premium'].map((o, i) => `<button data-k="effort" data-v="${o}" aria-pressed="${C.o.effort === o}">${i ? bars(i) : ic('sparkle')}${o}</button>`).join('')}</div>
        <p class="onote">Picks Premium, Standard or Efficient from your topic. Higher effort uses more credits.</p>`)}
      ${osec('Project', 'Every deck in a project reads its files. Pick a folder to save the deck there.', `<button class="selectbox ofull" aria-disabled="true">${ic('prohibit')}<span class="grow">None</span><span class="badge gold">Gold</span>${ic('caret-right')}</button>
        <p class="onote">Project knowledge is on Gold</p>`)}
      ${osec('Mode', 'Skip questions, search the web or cite sources.', `<div>${tog('express', 'lightning', 'Express', 'No questions: straight to slides')}${tog('deep', 'binoculars', 'Deep search', 'Web research on every slide: 2× credits')}${tog('cite', 'quotes', 'Cite sources', 'A footnote on every claim, plus a sources slide')}</div>`)}</div>`;
  }
  const kitHtml = () => C.kit ? `<span style="display:inline-flex;gap:2px">${C.kit.c.map(c => `<i style="width:8px;height:8px;border-radius:4px;background:${c};font-size:0"></i>`).join('')}</span>${esc(C.kit.n)}` : `${ic('palette')}Design`;
  function landing() {
    const has = C.text.trim().length > 0 || C.files.length;
    const kit = kitHtml();
    return `<div class="crbody" id="crBody"><div class="crcol"><h1>Describe your deck<span class="muted">, or upload a file</span></h1>
      <div class="prompt" id="promptCard">${C.files.length ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${C.files.map((f, i) => `<div class="filechip">${ic(f.icon)}<span class="grow"><span style="display:block">${esc(f.n)}</span><span class="cbar" style="margin:4px 0 0;height:4px;display:block"><span style="width:${f.p}%"></span></span></span><button class="ibtn fx" data-fi="${i}" data-tip="Remove">${ic('x')}</button></div>`).join('')}</div>` : ''}
        <div class="ta"><textarea id="crText" aria-label="Describe your deck">${esc(C.text)}</textarea>${C.text.trim() ? '' : `<span class="rot" id="rot">${C.files.length ? 'Describe what your presentation is about...' : PH[0]}</span>`}</div>
        <div class="pb"><button class="btn sm secondary" id="plusBtn" style="width:32px;height:32px;padding:0" data-tip="Add files">${ic('plus')}</button>
          <button class="btn sm secondary dtrig ${C.kit ? '' : 'beam'}" id="designBtn" style="height:32px" data-tip="Design">${kit}${ic('caret-down')}</button>
          <button class="btn sm ${C.opts ? 'secondary' : 'ghost'}" id="optBtn" style="height:32px">${ic('sliders-horizontal')}Options${nChanged() ? `<span class="cnt">${nChanged()}</span>` : ''}</button>
          <span class="grow"></span><button class="ibtn lg" data-tip="Dictate your prompt">${ic('microphone')}</button>
          <button class="btn primary send" id="sendBtn" ${has ? '' : 'disabled'} data-tip="${has ? 'Create' : 'Write a few words or add a file first'}">${ic('arrow-up')}</button></div></div>
      ${C.err ? `<div class="errline">${esc(C.err)}</div>` : ''}${C.banner ? `<div class="fbanner">${esc(C.banner)}</div>` : ''}
      ${C.opts ? optionsPanel() : ''}
      ${has ? '' : `<div class="sugg"><span class="lbl">Leaders are creating presentations for</span>${SUG.map(s => `<button class="pchip sg">${s[0]} ${esc(s[1])}</button>`).join('')}</div>
        <div class="ways"><div class="wl">Other ways to start</div><div class="wg">${WAYS.map(w => `<button class="opt"><span class="oi">${ic(w[0])}</span><b>${w[1]}</b><span class="t9">${w[2]}</span></button>`).join('')}</div></div>`}
    </div></div>`;
  }
  function chat() {
    const steps = [['Checked the audience', 'Checking who this deck is for...'], ['Checked the company', 'Checking which company this is about...'], ['Read your material', 'Reading your material...'], ['Wrote the expert brief', 'Writing the expert brief...'], ['Wrote the deck', 'Writing the deck...']];
    const nowIdx = { thinking: 3, slides: 5, done: 5 }[C.stage] ?? 3;
    const tl = C.stage === 'thinking' ? steps.slice(0, nowIdx + 1).map((s, i) => i < nowIdx ? `<div class="ti done">${ic('check-circle')}${s[0]}</div>` : `<div class="ti now"><span class="sp"></span><span class="shimmer">${s[1]}</span></div>`).join('')
      : `<button class="thought">${ic('caret-right')}Thought for 14s</button><div class="ti ${C.stage === 'done' ? 'done' : 'now'}" style="margin-top:8px">${C.stage === 'done' ? `${ic('check-circle')}<b class="strong">Your deck is ready</b>` : `<span class="sp"></span><span class="shimmer">Writing the deck...</span>`}</div>`;
    const slides = C.stage !== 'thinking' ? `<div class="slidesbox">${['Q3 revenue grew 18% year on year', 'Enterprise deals led the quarter', 'Sales cycle down from 64 to 48 days', 'Q4 priorities and asks'].map(t => `<div>${ic('check-circle')}${t}</div>`).join('')}</div>` : '';
    return `<div class="crbody"><div class="chatcol"><div class="bubble">${esc(C.text || 'Q3 business review for the leadership team')}</div><div class="tl">${tl}</div>${slides}
      ${C.stage === 'done' ? '<div style="margin-top:16px"><button class="btn primary" id="openDeck">Open your deck</button></div>' : ''}</div></div>${qcard()}`;
  }
  function qcard() {
    if (C.q === 'questions') return `<div class="qdock"><div class="qh"><b>Who will you present this to?</b><button class="ibtn" data-tip="Previous">${ic('caret-left')}</button><span class="muted">1 of 3</span><button class="ibtn" data-tip="Next">${ic('caret-right')}</button><button class="ibtn" data-qx data-tip="Close">${ic('x')}</button></div>
      <div class="qb">${['The leadership team, in a quarterly review', 'The board, as a pre-read', 'My sales team, to plan next quarter'].map((o, i) => `<button class="qopt"><span class="qn">${i + 1}</span>${o}</button>`).join('')}<button class="qopt"><span class="qn">${ic('pencil-simple')}</span><span class="muted">Something else</span></button></div>
      <div class="qf"><span class="grow">Pick one, or type your own answer</span><button class="btn sm ghost">Skip</button><button class="btn sm primary">Send</button></div></div>`;
    if (C.q === 'company') return `<div class="qdock"><div class="qh"><b>What company is this presentation for?</b><button class="ibtn" data-qx data-tip="Close">${ic('x')}</button></div>
      <div class="qb">${['Google', 'PayPal', 'Slack'].map(c => `<button class="qopt"><span class="qn">${c[0]}</span>${c}</button>`).join('')}<div class="field tall" style="margin:8px 0 0">${ic('magnifying-glass')}<input placeholder="Search a company or type its website"></div></div>
      <div class="qf"><span class="grow">Try a URL like acme.com</span><button class="btn sm ghost">Skip</button><button class="btn sm primary">Use</button></div></div>`;
    if (C.q === 'suggested') return `<div class="qdock"><div class="qh"><b>Suggested prompt</b><button class="ibtn" data-qx data-tip="Close suggestion">${ic('x')}</button></div>
      <div class="qb"><p class="muted" style="padding:0 8px 8px">Your prompt is a bit short. Here's a clearer version that will give you a better deck.</p><div class="sunk t13">Q3 business review for <span class="hl">[the leadership team]</span> covering revenue, pipeline and <span class="hl">[top 3 risks]</span>, ending with Q4 priorities.</div></div>
      <div class="qf"><span class="grow">Click a highlighted part to fill it in</span><button class="btn sm ghost">Keep my original</button><button class="btn sm primary">Use this prompt ${ic('arrow-right')}</button></div></div>`;
    return '';
  }
  function persona() {
    return `<div class="crbody"><div class="crcol" style="max-width:1024px"><div class="muted" style="text-align:center">Welcome, Mani</div><h1>Which of these best describes you?</h1><p class="sub">We set up your first deck, your Home page and the plans we show you around the work you do.</p>
      <div class="personas">${PERSONAS.map((p, i) => `<button class="opt" role="radio" aria-checked="${i === 0}"><span class="ck">${ic('check')}</span><span class="oi">${ic(p[0])}</span><b>${p[1]}</b><span class="t9">${p[2]}</span></button>`).join('')}</div></div></div>
      <div class="crfoot"><span class="grow">We'll set up your workspace for <b class="strong" id="pName">Sales and RevOps leaders</b>.</span><button class="btn primary" id="pCont">Continue</button></div>`;
  }
  function render(keep) {
    clearInterval(rotT); const sc = keep && $('#crBody', root) ? $('#crBody', root).scrollTop : 0;
    const chatMode = C.screen === 'chat';
    root.innerHTML = `<div class="crwrap">${head(chatMode)}${C.screen === 'landing' ? landing() : chatMode ? chat() : persona()}</div>`;
    UI.setTheme(UI.S.theme); wire(); if (keep && $('#crBody', root)) $('#crBody', root).scrollTop = sc;
    const rot = $('#rot', root); if (rot && !C.files.length) { let i = 0; rotT = setInterval(() => { if (!document.body.contains(rot)) return clearInterval(rotT); rot.classList.add('out'); setTimeout(() => { i = (i + 1) % PH.length; rot.textContent = PH[i]; rot.classList.remove('out'); }, 300); }, 3400); }
  }
  const plusMenu = a => openMenu(a, [{ label: 'Upload files', icon: 'upload-simple', desc: 'PDF, Word, Excel, images', onClick: () => addFile() }, { label: 'Google Drive', icon: 'google-drive-logo' }, { label: 'Notion', icon: 'notion-logo' }, { sep: 1 }, { html: '<div class="mlabel" style="padding-right:8px;white-space:normal;height:auto;padding-top:4px;padding-bottom:4px">Have a .pptx? Use Import PowerPoint below.</div>' }], { width: 280 });
  function addFile() { C.files.push({ n: 'Q3-revenue.xlsx', icon: 'microsoft-excel-logo', p: 100 }); if (C.files.length > 3) { C.files.length = 3; C.banner = 'Maximum files reached'; } render(); }
  function designModal(onPick) {
    const kits = [['Deck Studio Blue', ['#0D99FF', '#0768CF', '#80CAFF'], 'Workspace', 1], ['Midnight brand', ['#80CAFF', '#9747FF', '#2C2C2C']], ['Sunrise brand', ['#FFA629', '#F24822', '#FFCD29']], ['Mint brand', ['#14AE5C', '#8DDDA4', '#083A23']], ['Graphite brand', ['#2C2C2C', '#757575', '#E6E6E6']]];
    openModal(`<div class="mhdr"><span class="ttl">Design</span><button class="ibtn" id="dmx" data-tip="Close">${ic('x')}</button></div><div class="mbody"><p class="muted">A look for this deck. Items tagged Workspace are shared with everyone in your workspace.</p>
      <div class="themes"><button class="theme" style="border-style:dashed;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:150px;gap:6px"><span class="ico24" style="width:32px;height:32px;border-radius:16px;background:var(--color-bg-secondary)">${ic('plus')}</span><b class="strong">Add new Brand Kit</b><span class="badge outline">Paid plans · preview free</span></button>
      ${kits.map((k, i) => `<button class="theme kitpick" data-k="${i}" aria-checked="${C.kit && C.kit.n === k[0]}"><span class="tp">${UI.slideArt({ bg: '#FFFFFF', a: k[1][0], b: '#1E1E1E', c: k[1][1], art: i % 2 ? 'shape' : 'bars' })}</span><span class="tn"><span>${k[0]}</span>${k[2] ? `<span class="badge outline">${k[2]}</span>` : ''}</span></button>`).join('')}</div></div>`,
      { width: 880, onMount: m => { m.dataset.dismiss = 'backdrop'; $('#dmx', m).addEventListener('click', closeModal); $$('.kitpick', m).forEach(b => b.addEventListener('click', () => { const k = kits[+b.dataset.k]; C.kit = { n: k[0], c: k[1] }; closeModal(); typeof onPick === 'function' ? onPick() : render(); })); } });
  }
  function leaveDlg() { openModal(`<div class="mhdr"><span class="ttl">Are you sure you want to leave?</span></div><div class="mbody"><p class="muted">Your progress will be lost.</p></div><div class="mfoot"><span class="sp"></span><button class="btn secondary" id="lc">Cancel</button><button class="btn danger" id="lg">Leave page</button></div>`, { width: 400, onMount: m => { $('#lc', m).addEventListener('click', closeModal); $('#lg', m).addEventListener('click', () => { closeModal(); toDash(); }); } }); }
  const toDash = () => { UI.S.state = ''; UI.setView('dashboard'); UI.runState('db-home'); };
  function submit() { if (C.text.trim().length < 5 && !C.files.length) { C.err = 'This description is too short. Please add more details.'; render(); return; } C.err = ''; C.screen = 'chat'; C.stage = 'thinking'; C.q = null; render(); }
  /* Docked prompt bar (pitchdeckdoclist OnboardLandingUI.jsx "create-prompt-dock", PV2 v5 web): once the prompt box scrolls up
     out of view while Options is open, the same controls float at the bottom; the prompt line scrolls back to the box.
     One bar for Create and Home option 1: whoever attaches last owns it (card, scroll top, text, actions). */
  const dock = (() => {
    let el = null, owner = null;
    const hide = () => { if (el) { el.classList.remove('open'); el.innerHTML = ''; el.dataset.sig = ''; } };
    function check() {
      if (!owner || !owner.on()) return hide();
      const card = owner.card(); if (!card || !card.isConnected) return hide();
      const r = card.getBoundingClientRect(); if (r.height && r.bottom > owner.top()) return hide(); /* box still on screen */
      if (!el) { el = document.createElement('div'); el.className = 'pdock'; document.body.appendChild(el);
        el.addEventListener('click', e => { const b = e.target.closest('[data-dk]'); if (b && owner) owner.act(b.dataset.dk); }); }
      const t = owner.text(), n = nChanged();
      const html = `<div class="pdock-in" data-test-id="create-prompt-dock"><button class="pdock-t ${t ? 'has' : ''}" data-dk="back" data-tip="Back to the prompt">${esc(t || owner.ph)}</button>
        <button class="btn sm secondary pdock-sq" data-dk="plus" data-tip="Add files" aria-label="Add files">${ic('plus')}</button>
        <button class="btn sm secondary" data-dk="design">${C.kit ? kitHtml() : ic('palette') + 'Design'}</button>
        <button class="btn sm secondary" data-dk="opts" aria-expanded="true">${ic('sliders-horizontal')}Options${n ? `<span class="cnt">${n}</span>` : ''}</button>
        <button class="btn sm ghost pdock-sq" data-dk="mic" data-tip="Dictate your prompt" aria-label="Dictate your prompt">${ic('microphone')}</button>
        <button class="btn sm primary pdock-sq" data-dk="send" data-tip="Create" aria-label="Create">${ic('arrow-up')}</button></div>`;
      if (el.dataset.sig !== html) { el.innerHTML = html; el.dataset.sig = html; }
      if (r.width) { el.style.left = r.left + 'px'; el.style.width = r.width + 'px'; }
      el.classList.add('open');
    }
    addEventListener('scroll', check, true); addEventListener('resize', check);
    return { attach: o => { owner = o; check(); }, detach: o => { if (owner === o) { owner = null; hide(); } }, check };
  })();
  const toBox = (card, ta, then) => { if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => then ? then() : (ta && ta.focus({ preventScroll: true })), 320); };
  const crOwner = {
    on: () => UI.S.view === 'create' && C.screen === 'landing' && C.opts,
    card: () => $('#promptCard', root), top: () => { const b = $('#crBody', root); return b ? b.getBoundingClientRect().top : 0; },
    text: () => C.text.trim(), ph: 'Describe your deck',
    act: k => { const card = $('#promptCard', root), ta = $('#crText', root);
      if (k === 'back' || k === 'mic') toBox(card, ta); else if (k === 'plus') toBox(card, ta, () => plusMenu($('#plusBtn', root)));
      else if (k === 'design') designModal(); else if (k === 'send') submit();
      else if (k === 'opts') { const pnl = $('#optPanel', root); if (pnl && pnl.scrollIntoView) pnl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } },
  };
  function wireOpts(scope, rerender, hide, send) {
    const oh = $('#optHide', scope); oh && oh.addEventListener('click', hide);
    const setO = (k, v) => { C.o[k] = v; rerender(); };
    const orr = $('#optReset', scope); orr && orr.addEventListener('click', () => { C.o = { ...OD }; rerender(); });
    const ss = $('#stickSend', scope); ss && ss.addEventListener('click', send);
    $$('.optp [data-sel]', scope).forEach(b => { const k = b.dataset.sel; if (!LISTS[k]) return; b.addEventListener('click', () => openMenu(b, LISTS[k].map(x => ({ label: x, check: x === C.o[k], badge: x.startsWith('Very Long') ? 'Pro' : undefined, onClick: () => setO(k, x) })), { width: 240, over: true })); });
    $$('.optp [data-k]', scope).forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; setO(k, b.dataset.v !== undefined ? b.dataset.v : !C.o[k]); }));
  }
  function wire() {
    $('#crTheme', root).addEventListener('click', () => UI.setTheme(UI.S.theme === 'dark' ? 'light' : 'dark'));
    $('#crBack', root).addEventListener('click', () => { if (C.screen === 'chat') { C.screen = 'landing'; render(); } else toDash(); });
    $('#crClose', root).addEventListener('click', () => C.screen === 'chat' ? leaveDlg() : toDash());
    const ta = $('#crText', root);
    if (ta) {
      ta.addEventListener('input', () => { const had = !!C.text.trim(); C.text = ta.value; const has = !!C.text.trim(); if (had !== has) { const pos = ta.selectionStart; render(); const t2 = $('#crText', root); t2.focus(); t2.setSelectionRange(pos, pos); } });
      ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); });
      $('#plusBtn', root).addEventListener('click', e => plusMenu(e.currentTarget));
      $('#designBtn', root).addEventListener('click', () => designModal());
      $('#optBtn', root).addEventListener('click', () => { C.opts = !C.opts; render(); });
      $('#sendBtn', root).addEventListener('click', submit);
      $$('.sg', root).forEach(b => b.addEventListener('click', () => { C.text = b.textContent.replace(/^\S+\s/, ''); render(); }));
      $$('.fx', root).forEach(b => b.addEventListener('click', () => { C.files.splice(+b.dataset.fi, 1); C.banner = ''; render(); }));
      $$('.ways .opt', root).forEach(b => b.addEventListener('click', () => toast('Opens ' + $('b', b).textContent)));
    }
    wireOpts(root, () => render(true), () => { C.opts = false; render(); }, submit);
    $$('[data-qx]', root).forEach(b => b.addEventListener('click', () => { C.q = null; render(); }));
    $$('.qopt, .qf .btn', root).forEach(b => b.addEventListener('click', () => { C.q = null; C.stage = 'slides'; render(); }));
    const od = $('#openDeck', root); od && od.addEventListener('click', () => { UI.S.state = ''; UI.setView('editor'); UI.runState('ed-default'); });
    $$('.personas .opt', root).forEach(b => b.addEventListener('click', () => { $$('.personas .opt', root).forEach(x => x.setAttribute('aria-checked', x === b)); $('#pName', root).textContent = $('b', b).textContent; }));
    const pc = $('#pCont', root); pc && pc.addEventListener('click', () => { C.screen = 'landing'; render(); });
    if (C.screen === 'landing' && C.opts) dock.attach(crOwner); else dock.detach(crOwner);
  }
  UI.onChange(k => { if (k === 'view' && UI.S.view !== 'create') clearInterval(rotT); if (k === 'view') dock.check(); });
  const go = (o = {}) => { Object.assign(C, { screen: 'landing', text: '', files: [], opts: false, o: { ...OD }, err: '', banner: '', kit: null, stage: 'thinking', q: null }, o); render(); };
  /* Shared with Home option 1 (original/hero-options.js): same Design picker and options panel; open() carries prompt, kit and options into Create. */
  UI.createParts = {
    state: () => { if (!C.o) C.o = { ...OD }; return C; },
    kitHtml, changed: () => (C.o ? nChanged() : 0), panel: () => optionsPanel(), wire: wireOpts, design: onPick => designModal(onPick),
    open: carry => { UI.S.state = ''; UI.setView('create'); go(carry); }, dock, toBox,
  };
  UI.registerStates('create', [
    { id: 'cr-start', label: 'Prompt landing, empty', run: () => go() },
    { id: 'cr-typed', label: 'Prompt typed (send on)', run: () => go({ text: 'Q3 business review for the leadership team' }) },
    { id: 'cr-plus', label: '"+" add files menu', run: () => { go(); plusMenu($('#plusBtn', root)); } },
    { id: 'cr-files', label: 'Files attached', run: () => go({ files: [{ n: 'Q3-revenue.xlsx', icon: 'microsoft-excel-logo', p: 100 }, { n: 'Board-notes.pdf', icon: 'file-pdf', p: 64 }] }) },
    { id: 'cr-max', label: 'Maximum files banner', run: () => go({ files: [{ n: 'Q3-revenue.xlsx', icon: 'microsoft-excel-logo', p: 100 }, { n: 'Board-notes.pdf', icon: 'file-pdf', p: 100 }, { n: 'Pipeline.csv', icon: 'file-csv', p: 100 }], banner: 'Maximum files reached' }) },
    { id: 'cr-short', label: 'Too short error', run: () => go({ text: 'Q3', err: 'This description is too short. Please add more details.' }) },
    { id: 'cr-options', label: 'Options panel', run: () => go({ text: 'Q3 business review for the leadership team', opts: true, o: { ...OD, time: '10 min', effort: 'Premium' } }) },
    { id: 'cr-count', label: 'Options, slide count menu', run: () => { go({ text: 'Q3 business review for the leadership team', opts: true }); $('[data-sel="count"]', root).click(); } },
    { id: 'cr-design', label: 'Design picker', run: () => { go(); designModal(); } },
    { id: 'cr-kit', label: 'Brand kit picked', run: () => go({ text: 'Q3 business review for the leadership team', kit: { n: 'Deck Studio Blue', c: ['#0D99FF', '#0768CF', '#80CAFF'] } }) },
    { id: 'cr-thinking', label: 'Generating, thinking', run: () => go({ screen: 'chat', text: 'Q3 business review for the leadership team', stage: 'thinking' }) },
    { id: 'cr-questions', label: 'Generating, quick questions card', run: () => go({ screen: 'chat', text: 'Q3 business review for the leadership team', stage: 'thinking', q: 'questions' }) },
    { id: 'cr-company', label: 'Generating, company card', run: () => go({ screen: 'chat', text: 'Pitch deck for our Series A', stage: 'thinking', q: 'company' }) },
    { id: 'cr-suggested', label: 'Generating, suggested prompt', run: () => go({ screen: 'chat', text: 'Q3 review', stage: 'thinking', q: 'suggested' }) },
    { id: 'cr-slides', label: 'Generating, slides streaming', run: () => go({ screen: 'chat', text: 'Q3 business review for the leadership team', stage: 'slides' }) },
    { id: 'cr-done', label: 'Deck ready', run: () => go({ screen: 'chat', text: 'Q3 business review for the leadership team', stage: 'done' }) },
    { id: 'cr-leave', label: 'Leave confirm', run: () => { go({ screen: 'chat', text: 'Q3 business review for the leadership team' }); leaveDlg(); } },
    { id: 'cr-persona', label: 'Onboarding: persona pick', run: () => go({ screen: 'persona' }) }]);
})();
