/* Share dialog: structure and copy from pitchdeckdoclist new_dev_migration (src/listing/.../share), look from Figma UI3. */
(function () {
  const { $, $$, ic, esc, openMenu, openModal, closeModal, toast } = UI;
  const SH = { tab: 'share', deck: 'Q3 Sales Review', live: false, adv: false, role: 'Can view', chips: ['priya@acme.com'] };
  const titles = { export: d => `Export "${d}"`, invite: d => `Invite collaborators to "${d}"`, share: d => `Share "${d}"` };
  const sw = (on, extra = '') => `<button class="switch" role="switch" aria-checked="${on}" ${extra}></button>`;

  function exportTab() {
    const rows = [['microsoft-powerpoint-logo', '#D24726', 'PowerPoint', ''], ['presentation', '#F4B400', 'Google Slides', 'Pro'], ['file-pdf', '#DC3412', 'PDF', 'Pro'], ['image', '#14AE5C', 'Images', 'Pro']];
    return `<div class="xlist">${rows.map(r => `<button class="xrow" data-x="${r[2]}"><span class="xi" style="background:${r[1]}">${ic(r[0])}</span><span class="nm">${r[2]}${r[3] ? `<span class="badge pro">${r[3]}</span>` : ''}</span>${ic('download-simple')}</button>`).join('')}</div>`;
  }
  function inviteTab() {
    const hint = SH.role === 'Can view' ? 'Only this deck, read-only. They join Deck Studio as a Guest, no seat is used.' : 'Can edit this deck. Someone new also joins Deck Studio as a Member and sees every public project.';
    const person = (c, i, n, e, role, invited) => `<div class="prow2"><span class="av" style="background:${c}">${i}</span><span class="who"><span>${n}</span><span class="t9 muted">${e}</span></span>${invited ? '<span class="badge warn">Invited</span>' : ''}<button class="selectbox prole"><span>${role}</span><span class="ico24">${ic('caret-down')}</span></button><button class="ibtn" data-tip="Remove">${ic('x')}</button></div>`;
    return `<div class="sh-sec"><div style="display:flex;align-items:center;gap:8px"><span class="strong">Invite via email</span><span class="badge gold">Gold</span></div>
      <div class="inv-row"><div class="field chips" id="chipBox">${SH.chips.map((c, i) => `<span class="chip ${/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c) ? '' : 'bad'}">${esc(c)}<button class="ibtn chipx" data-ci="${i}" style="width:16px;height:16px" aria-label="Remove">${ic('x')}</button></span>`).join('')}<input id="chipIn" placeholder="${SH.chips.length ? '' : 'Enter emails separated by commas'}" style="min-width:120px"></div>
      <button class="selectbox" id="roleBtn" style="height:32px"><span>${SH.role}</span><span class="ico24">${ic('caret-down')}</span></button>
      <button class="btn primary" ${SH.chips.length ? '' : 'disabled'} id="inviteGo">${ic('user-plus')}Invite</button></div>
      <p class="hint">${hint}</p></div>
      <div class="acc">${ic('folder')}<span class="grow">Everyone added to this folder can access</span>${sw(true)}</div>
      <div class="acc">${ic('buildings')}<span class="grow">All workspace members can access</span>${sw(false)}</div>
      <div class="acc">${ic('link-simple')}<span class="grow">Anyone with the link can join as a member</span><button class="btn sm secondary" id="joinCopy">Copy link</button></div>
      <div class="sh-cap">Members with access</div>
      ${person('#9747FF', 'A', 'Arun Kumar', 'arun@deck.in', 'Can edit')}${person('#14AE5C', 'M', 'Meera Iyer', 'meera@deck.in', 'Can view')}${person('#FFA629', 'R', 'rahul@acme.com', 'No account yet', 'Can view', true)}
      <div class="sh-cap">Guests with access</div>${person('#0D99FF', 'P', 'Priya Shah', 'priya@acme.com', 'Guest viewer')}`;
  }
  function shareTab() {
    const card = SH.live ? `<div class="lcard"><div class="lt"><span class="gd"></span><span class="grow"><span class="strong" style="display:block">Live link</span><span class="muted">Anyone with the link can view this presentation.</span></span><button class="btn sm ghost" id="unpub">${ic('prohibit')}Unpublish</button></div>
        <div class="field tall">${ic('link-simple')}<input readonly value="https://presentations.ai/view/q3-sales-review-7Hk2"></div></div>`
      : `<div class="lcard"><div class="lt"><span class="ico24">${ic('globe-simple')}</span><span class="grow"><span class="strong" style="display:block">Share public link</span><span class="muted">Generate a public link to share on social media</span></span></div></div>`;
    const dis = SH.live ? '' : 'disabled';
    const adv = SH.adv ? `<div class="sh-cap" style="margin-top:4px">Presentation settings</div>
        <div class="srow3"><span class="grow">Remove Presentations.AI branding from the presentation<span class="badge pro">Pro</span></span>${sw(false, 'disabled')}</div>
        <div class="srow3"><span class="grow">Enable animation</span>${sw(true)}</div>
        <div class="srow3"><span class="grow">Show author name</span>${sw(false)}</div>
        <div class="sh-cap">Security settings</div>
        <div class="srow3"><span class="grow">Password protect your presentation<span class="badge pro">Pro</span></span>${sw(false)}</div>
        <div class="srow3"><span class="grow">Set an expiration date for this link<span class="badge pro">Pro</span></span>${sw(false)}</div>
        <div class="srow3"><span class="grow">Alert me when the link is viewed<span class="badge pro">Pro</span></span>${sw(false)}</div>
        <div class="sh-cap">Add a call to action</div>
        <p class="muted">You can add a call to action Button or Form to the end of your presentation</p>
        <div class="srow3"><span class="grow">Type</span><button class="selectbox" id="ctaBtn"><span>Button</span><span class="ico24">${ic('caret-down')}</span></button></div>
        <div class="srow3"><span class="grow">Add target URL</span><div class="field" style="width:220px"><input placeholder="Enter URL"></div></div>` : '';
    return `${card}
      <div class="sh-cap">Share on social media</div>
      <div class="srowx"><span style="display:inline-flex"><button class="btn sm secondary" ${dis} style="border-radius:5px 0 0 5px">${ic('linkedin-logo')}LinkedIn</button><button class="btn sm secondary" id="liMenu" ${dis} style="border-radius:0 5px 5px 0;padding:0 4px;margin-left:-1px">${ic('caret-down')}</button></span>
        <button class="btn sm secondary" ${dis}>${ic('x-logo')}X</button><button class="btn sm secondary" ${dis}>${ic('facebook-logo')}Facebook</button><button class="btn sm secondary" ${dis}>${ic('envelope-simple')}Email</button><button class="btn sm secondary" ${dis} id="embedBtn">${ic('code')}Embed</button></div>
      <div class="earn"><span class="grow"><span class="strong" style="display:block">Say what you think of presentations.ai</span><span class="muted">Post on LinkedIn, X or Facebook, or review us on G2. Up to 50 credits.</span></span><button class="btn sm secondary">Earn credits</button></div>
      <button class="adv" id="advBtn" aria-expanded="${SH.adv}">${ic('gear-six')}<span class="grow">Advanced settings</span>${ic('caret-down')}</button>${adv}`;
  }
  function render() {
    const body = SH.tab === 'export' ? exportTab() : SH.tab === 'invite' ? inviteTab() : shareTab();
    const foot = SH.tab === 'share' ? `<div class="mfoot">${SH.live ? '<button class="btn text">Track analytics</button>' : ''}<span class="sp"></span><button class="btn primary" id="pubBtn">${SH.live ? `${ic('copy')}Copy link` : 'Generate public link'}</button></div>` : '';
    openModal(`<div class="mhdr"><span class="ttl">${esc(titles[SH.tab](SH.deck))}</span><button class="ibtn" id="shClose" data-tip="Close">${ic('x')}</button></div>
      <div class="sh-tabs"><div class="seg wide">${[['export', 'Export to PowerPoint'], ['invite', 'Invite to collaborate'], ['share', 'Share externally']].map(t => `<button data-st="${t[0]}" aria-pressed="${SH.tab === t[0]}">${t[1]}</button>`).join('')}</div></div>
      <div class="mbody">${body}</div>${foot}`, { width: 560, onMount: wire });
  }
  function wire(m) {
    m.dataset.dismiss = 'x';
    $('#shClose', m).addEventListener('click', closeModal);
    $$('[data-st]', m).forEach(b => b.addEventListener('click', () => { SH.tab = b.dataset.st; render(); }));
    $$('.switch', m).forEach(s => s.addEventListener('click', () => { if (!s.disabled) s.setAttribute('aria-checked', s.getAttribute('aria-checked') !== 'true'); }));
    $$('.xrow', m).forEach(r => r.addEventListener('click', () => toast(r.dataset.x === 'PowerPoint' ? 'Exporting to PowerPoint' : `Upgrade to export ${r.dataset.x}`)));
    const rb = $('#roleBtn', m); rb && rb.addEventListener('click', () => openMenu(rb, ['Can view', 'Can edit'].map(r => ({ label: r, check: SH.role === r, onClick: () => { SH.role = r; render(); } })), { width: 140, over: true }));
    $$('.prole', m).forEach(b => b.addEventListener('click', () => { const cur = $('span', b).textContent; const opts = cur.startsWith('Guest') ? ['Guest editor', 'Guest viewer'] : ['Can edit', 'Can view']; openMenu(b, opts.map(o => ({ label: o, check: o === cur, onClick: () => { $('span', b).textContent = o; toast('Member role updated'); } })), { width: 150, over: true }); }));
    const ig = $('#inviteGo', m); ig && ig.addEventListener('click', () => { const bad = SH.chips.filter(c => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)); if (bad.length) { toast('Please enter a valid email'); return; } SH.chips = []; render(); toast('Invite sent to specific members via email'); });
    const ci = $('#chipIn', m); if (ci) { ci.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ',' || e.key === 'Tab') && ci.value.trim()) { e.preventDefault(); SH.chips.push(...ci.value.split(',').map(s => s.trim()).filter(Boolean)); render(); setTimeout(() => $('#chipIn') && $('#chipIn').focus(), 0); } else if (e.key === 'Backspace' && !ci.value && SH.chips.length) { SH.chips.pop(); render(); setTimeout(() => $('#chipIn') && $('#chipIn').focus(), 0); } }); }
    $$('.chipx', m).forEach(b => b.addEventListener('click', () => { SH.chips.splice(+b.dataset.ci, 1); render(); }));
    const jc = $('#joinCopy', m); jc && jc.addEventListener('click', () => toast('Invite link copied. Anyone who opens it joins this workspace right away.'));
    const pb = $('#pubBtn', m); pb && pb.addEventListener('click', () => { if (!SH.live) { SH.live = true; render(); } else toast('Link Copied'); });
    const ab = $('#advBtn', m); ab && ab.addEventListener('click', () => { SH.adv = !SH.adv; render(); });
    const up = $('#unpub', m); up && up.addEventListener('click', confirmUnpublish);
    const li = $('#liMenu', m); li && li.addEventListener('click', () => liMenu(li));
    const eb = $('#embedBtn', m); eb && eb.addEventListener('click', () => toast('Embed code copied'));
    const cta = $('#ctaBtn', m); cta && cta.addEventListener('click', () => openMenu(cta, ['Button', 'Form', 'None'].map(o => ({ label: o, check: o === 'Button' })), { width: 140, over: true }));
  }
  function liMenu(a) { openMenu(a, [{ label: 'Share as native LinkedIn carousel', desc: 'Share your slides as a multi-page document for a seamless viewer experience', badge: 'Pro' }, { label: 'Post a Live Presentation Link', desc: 'Post a link that always shows the latest version of your presentation' }], { width: 300 }); }
  function confirmUnpublish() {
    openModal(`<div class="mhdr"><span class="ttl">Are you sure you want to unpublish the link?</span></div><div class="mbody"><p class="muted">Anyone with the link will no longer be able to view the presentation. You can republish it anytime.</p></div>
      <div class="mfoot"><span class="sp"></span><button class="btn secondary" id="cnl">Cancel</button><button class="btn danger" id="okU">Unpublish</button></div>`, { width: 400, onMount: m => {
      $('#cnl', m).addEventListener('click', render); $('#okU', m).addEventListener('click', () => { SH.live = false; render(); toast('Unpublish link'); }); } });
  }
  UI.openShare = (tab = 'share', deck, o = {}) => { Object.assign(SH, { tab, deck: deck || SH.deck, live: !!o.live, adv: !!o.adv, role: o.role || 'Can view', chips: o.chips || ['priya@acme.com'] }); render(); if (o.li) setTimeout(() => liMenu($('#liMenu')), 30); if (o.unpub) confirmUnpublish(); };
})();
