/* Pricing: redesign plan picker (modal over Home), close offer, question flow, feature nudge, credits, checkout.
   Structure and copy from pitchdeckdoclist new_dev_migration. Prices are samples (not in the code). */
(function () {
  const { $, $$, ic, esc, openModal, closeModal, toast } = UI;
  const root = $('#pricing');
  UI.PLANS = [
    { id: 'basic', name: 'Basic', icon: 'lightning', emoji: '⚡', credits: '1,000', meter: 2, annualMo: 10, annualYr: 120, monthly: 12,
      tagline: 'Edit and export decks as PowerPoint or PDF', bullets: ['Editable PowerPoint export', 'PDF export', 'No watermark'], more: 'Editable PowerPoint export, PDF export, no watermark' },
    { id: 'pro', name: 'Pro', icon: 'rocket-launch', emoji: '🚀', credits: '5,000', meter: 6, annualMo: 20, annualYr: 240, monthly: 25, featured: true, chip: '5× Basic',
      tagline: 'Advanced AI and your Brand Kit on every deck', lead: 'Everything in Basic', bullets: ['Advanced AI models and agents', 'Full Brand Kit', 'Research and planning tools', 'Deck analytics'], more: 'Advanced AI models, full Brand Kit, research tools, deck analytics' },
    { id: 'gold', name: 'Gold', icon: 'diamond', emoji: '💎', credits: '25,000', meter: 24, annualMo: 96, annualYr: 1152, monthly: 120, chip: '5× Pro', badge: 'Unlimited collaborators',
      tagline: 'For teams: unlimited collaborators and frontier AI models', lead: 'Everything in Pro', bullets: ['Unlimited collaborators', 'Frontier AI models', 'Advanced brand controls', 'Shared project knowledge', 'Priority AI generation'], more: 'Unlimited collaborators, frontier AI models, shared project knowledge' }];
  const byId = id => UI.PLANS.find(p => p.id === id);
  const P = { bill: 'yearly', offer: false, paid: false };
  const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
  const off = n => Math.round(n * 0.8);
  let tmrT = 0;

  function base(ctab) {
    clearInterval(tmrT);
    root.innerHTML = UI.shell.side('Home') + `<div class="dmain">${UI.shell.top()}<div class="dscroll">${UI.shell.body()}</div></div>
      <div class="ctab ${ctab ? 'on' : ''}" id="ctab">${ic('gift')}<span>Before you go: 20% off your first year, for the next hour.</span><button class="btn sm secondary" id="ctabApply">Apply</button><button class="ibtn" id="ctabX" data-tip="Close" style="color:#fff">${ic('x')}</button></div>`;
    UI.shell.wire(root); UI.setTheme(UI.S.theme);
    $('#ctabApply', root).addEventListener('click', () => { $('#ctab', root).classList.remove('on'); P.offer = true; P.bill = 'yearly'; picker(); toast('Offer applied: 20% off your first year'); });
    $('#ctabX', root).addEventListener('click', () => $('#ctab', root).classList.remove('on'));
  }

  /* ---------- Plan picker ---------- */
  function pcard(p) {
    const yr = P.bill === 'yearly';
    let price, lines;
    if (P.offer && yr) {
      price = `<s>${fmt(p.annualMo)}</s><b>${fmt(off(p.annualMo))}</b><span class="muted">a month</span>`;
      lines = `<div class="pline">${fmt(off(p.annualYr))} first year, then ${fmt(p.annualYr)} a year</div><div class="pline gr">${fmt(p.annualYr - off(p.annualYr))} off your first year (20%)</div>`;
    } else if (yr) {
      price = `<b>${fmt(p.annualMo)}</b><span class="muted">a month</span>`;
      lines = `<div class="pline">Billed ${fmt(p.annualYr)} a year</div><div class="pline gr">${fmt((p.monthly - p.annualMo) * 12)} a year less than monthly</div>`;
    } else {
      price = `<b>${fmt(p.monthly)}</b><span class="muted">a month</span>`;
      lines = '<div class="pline">Billed monthly</div><div class="pline" aria-hidden="true">&nbsp;</div>';
    }
    const cur = P.paid && p.id === 'pro', below = P.paid && p.id === 'basic';
    const cta = below ? '<div class="navail">Not available on your plan</div>'
      : cur ? '<button class="btn secondary lg2" disabled>Current plan</button>'
      : `<button class="btn ${p.featured || P.paid ? 'primary' : 'secondary'} lg2" data-buy="${p.id}">${P.paid ? 'Change plan' : 'Buy ' + p.name}</button>`;
    const pill = cur ? '<span class="badge rb cur">Current plan</span>' : (p.featured && !P.paid ? '<span class="badge pro rb">Recommended</span>' : '');
    return `<div class="pcard ${p.featured && !P.paid ? 'feat' : ''}">${pill}
      <div><div class="pn">${ic(p.icon)}<b>${p.name}</b>${p.badge ? `<span class="badge gold">${p.badge}</span>` : ''}</div><div class="tag" style="margin-top:2px">${p.tagline}</div></div>
      <div><div style="display:flex;align-items:center;gap:6px"><span><b class="strong">${p.credits}</b> credits a year</span>${p.chip ? `<span class="badge outline">${p.chip}</span>` : ''}</div>
        <div class="meter24" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => `<i class="${i < p.meter ? 'on' : ''}"></i>`).join('')}</div></div>
      <div><div class="price">${price}</div>${lines}</div>${cta}
      <div>${p.lead ? `<div class="strong" style="margin-bottom:6px">${p.lead}</div>` : ''}<ul>${p.bullets.map(b => `<li>${ic('check')}<span>${b}</span></li>`).join('')}</ul></div></div>`;
  }
  function picker() {
    const yrLbl = P.offer ? '<span class="gr">Offer applied</span>' : '<span class="gr">Up to 20% off</span>';
    openModal(`<button class="ibtn lg pkx" id="pkX" data-tip="Close">${ic('x')}</button>
      <div class="mbody pk"><div class="prhead"><h1>Choose a plan for your decks</h1><p>Every paid plan exports editable PowerPoint and PDF, with no watermark.</p>
        <div class="seg ptoggle" role="group" aria-label="Billing"><button data-bill="yearly" aria-pressed="${P.bill === 'yearly'}">Yearly ${yrLbl}</button><button data-bill="monthly" aria-pressed="${P.bill === 'monthly'}">Monthly</button></div></div>
        <div class="plans">${UI.PLANS.map(pcard).join('')}</div></div>
      <div class="pfoot">${ic('lock-simple')}<span class="grow">Cancel any time; your plan stays on until the end of the billing period. An expert can also finish the deck for you. <button class="lnk" id="hireX">Hire an expert</button></span><button class="btn ghost" id="notNow">Not now</button></div>`,
      { width: 1040, onMount: m => {
        m.dataset.dismiss = 'x';
        $$('[data-bill]', m).forEach(b => b.addEventListener('click', () => { P.bill = b.dataset.bill; picker(); }));
        $$('[data-buy]', m).forEach(b => b.addEventListener('click', () => checkout(b.dataset.buy)));
        $('#hireX', m).addEventListener('click', () => toast('Opens Hire an expert'));
        [$('#pkX', m), $('#notNow', m)].forEach(b => b.addEventListener('click', () => P.offer || P.paid ? closeModal() : question()));
      } });
  }

  /* ---------- Gold for teams ---------- */
  function goldOnly() {
    const g = byId('gold');
    openModal(`<button class="ibtn lg pkx" id="pkX" data-tip="Close">${ic('x')}</button>
      <div class="mbody pk"><div class="prhead"><h1>Your whole team on one Gold plan</h1><p>Everyone in your workspace edits, comments and presents on one plan.</p></div>
        <div class="goldgrid">${pcard(g)}<div><div class="t9s muted" style="margin-top:4px">What 20 seats cost elsewhere</div>
          <div class="tiles3">${[['Gamma Business', '$9,600'], ['Beautiful.ai Team', '$12,000'], ['Each extra seat on Gold', '$0']].map((t, i) => `<div class="sunk" ${i === 2 ? 'style="background:var(--color-bg-success-tertiary)"' : ''}><span class="muted">${t[0]}</span><b ${i === 2 ? 'style="color:var(--color-text-success)"' : ''}>${t[1]}</b><span class="t9 muted">a year</span></div>`).join('')}</div>
          <p class="muted" style="margin-top:12px">Gold is ${fmt(g.annualYr)} a year for the whole workspace, with unlimited collaborators.</p></div></div></div>
      <div class="pfoot">${ic('lock-simple')}<span class="grow">Cancel any time; your plan stays on until the end of the billing period.</span><button class="btn ghost" id="seeAll">See all plans</button></div>`,
      { width: 960, onMount: m => { $('[data-buy]', m).addEventListener('click', () => checkout('gold')); $('#pkX', m).addEventListener('click', closeModal); $('#seeAll', m).addEventListener('click', picker); } });
  }

  /* ---------- Close offer ---------- */
  function closeOffer(pick = 'pro') {
    let left = 15 * 60 - 1;
    const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    openModal(`<div class="mhdr" style="box-shadow:none"><span class="ttl"><span class="timer">${ic('timer')}Offer ends in <span id="tmr">${mmss(left)}</span></span></span><button class="ibtn" id="coX" data-tip="Close">${ic('x')}</button></div>
      <div class="mbody" style="padding-top:4px"><h2 class="ofh">20% off your first year</h2><p class="muted" style="margin-top:4px">Same plan and features for 20% less. It renews at the full yearly price after year one.</p>
        <div role="radiogroup" aria-label="Plan" style="margin-top:8px">${UI.PLANS.map(p => `<button class="radrow" role="radio" data-p="${p.id}" aria-checked="${p.id === pick}"><span class="rd"></span><span class="grow"><b class="strong">${p.emoji} ${p.name}</b></span><s class="muted">${fmt(p.annualYr)}</s><b class="strong">${fmt(off(p.annualYr))}/year</b></button>`).join('')}</div>
        <button class="btn primary lg2" id="coApply" style="width:100%;margin-top:16px">Apply 20% off</button>
        <p class="t9 muted" style="text-align:center;margin-top:8px">Nothing changes except your first-year price. Offers never stack.</p></div>`,
      { width: 480, onMount: m => {
        m.dataset.dismiss = 'x';
        tmrT = setInterval(() => { const t = $('#tmr', m); if (!t) return clearInterval(tmrT); left = Math.max(0, left - 1); t.textContent = mmss(left); }, 1000);
        $$('.radrow', m).forEach(b => b.addEventListener('click', () => $$('.radrow', m).forEach(x => x.setAttribute('aria-checked', x === b))));
        $('#coApply', m).addEventListener('click', () => { clearInterval(tmrT); P.offer = true; P.bill = 'yearly'; checkout($('.radrow[aria-checked="true"]', m).dataset.p); toast('Offer applied: 20% off your first year'); });
        $('#coX', m).addEventListener('click', () => { clearInterval(tmrT); closeModal(); });
      } });
  }

  /* ---------- Question flow ---------- */
  const ANS = [['The price is too high', 'tag'], ['I don’t want to pay for a whole year', 'calendar'], ['I’m not sure the credits are enough', 'coins'], ['Not ready to buy yet', 'clock']];
  function question() {
    openModal(`<div class="mhdr" style="box-shadow:none"><span class="ttl"></span><button class="ibtn" id="qX" data-tip="Close">${ic('x')}</button></div>
      <div class="mbody" style="padding-top:0"><h2 class="ofh">What stopped you?</h2><p class="muted" style="margin-top:4px">One question, asked once. Your answer picks the next step, or closes this.</p>
        <div style="margin-top:8px">${ANS.map((a, i) => `<button class="radrow ans" data-a="${i}">${ic(a[1])}<span class="grow">${a[0]}</span>${ic('caret-right')}</button>`).join('')}</div></div>`,
      { width: 480, onMount: m => {
        m.dataset.dismiss = 'x';
        $('#qX', m).addEventListener('click', closeModal);
        $$('.ans', m).forEach(b => b.addEventListener('click', () => [() => closeOffer(), qMonthly, qCredits, () => { closeModal(); toast('Your plans are in Settings when you are ready'); }][+b.dataset.a]()));
      } });
  }
  function qMonthly() {
    const p = byId('pro');
    openModal(`<div class="mhdr" style="box-shadow:none"><button class="ibtn" id="qB" data-tip="Back">${ic('arrow-left')}</button><span class="ttl"></span><button class="ibtn" id="qX" data-tip="Close">${ic('x')}</button></div>
      <div class="mbody" style="padding-top:0"><h2 class="ofh">Pay for Pro one month at a time</h2>
        <div style="margin-top:12px">${['Every Pro feature, same as yearly', 'Cancel any month, nothing to lock in', 'Switch to yearly later and save up to 20%'].map(t => `<div class="okrow">${ic('check-circle')}<span>${t}</span></div>`).join('')}</div>
        <button class="btn primary lg2" id="qGo" style="width:100%;margin-top:16px">Start Pro monthly · ${fmt(p.monthly)} a month</button>
        <button class="btn ghost" id="qNo" style="width:100%;margin-top:4px">No thanks</button>
        <p class="t9 muted" style="text-align:center;margin-top:8px">Pro yearly is ${fmt(p.annualMo)} a month, billed once a year.</p></div>`,
      { width: 480, onMount: m => { m.dataset.dismiss = 'x'; $('#qB', m).addEventListener('click', question); [$('#qX', m), $('#qNo', m)].forEach(b => b.addEventListener('click', closeModal)); $('#qGo', m).addEventListener('click', () => { P.bill = 'monthly'; checkout('pro'); }); } });
  }
  const costs = () => `<div class="costs">${[['Generate a new slide', 'Each slide in a new deck, a slide from a prompt or from data.', '10'], ['Edit a slide with AI', 'Any AI action on one slide: rewrite, shorten, chart, notes, refresh.', '5'], ['Deep research and planning', 'Reads every source and plans first. Doubles the cost of either action.', '2×']].map(c => `<div class="crow"><span class="grow"><b class="strong" style="display:block">${c[0]}</b><span class="muted">${c[1]}</span></span><span class="pr">${c[2]}</span></div>`).join('')}</div>`;
  function qCredits() {
    openModal(`<div class="mhdr" style="box-shadow:none"><button class="ibtn" id="qB" data-tip="Back">${ic('arrow-left')}</button><span class="ttl"></span><button class="ibtn" id="qX" data-tip="Close">${ic('x')}</button></div>
      <div class="mbody" style="padding-top:0"><h2 class="ofh">What the credits cover</h2><p class="muted" style="margin-top:4px">Credits are only spent when AI writes something.</p>
        <div class="sunk" style="margin-top:12px">${costs()}</div>
        <p class="muted" style="margin-top:12px">Pro's 5,000 credits a year make about 55 decks of 9 slides. Themes, Brand Kit, your own edits, present, share and download are always free.</p>
        <div style="display:flex;gap:8px;margin-top:16px"><button class="btn primary lg2" id="qPlans" style="flex:1">Back to plans</button><button class="btn ghost lg2" id="qNo">Still not sure</button></div></div>`,
      { width: 480, onMount: m => { m.dataset.dismiss = 'x'; $('#qB', m).addEventListener('click', question); [$('#qX', m), $('#qNo', m)].forEach(b => b.addEventListener('click', closeModal)); $('#qPlans', m).addEventListener('click', picker); } });
  }

  /* ---------- Feature nudge ---------- */
  const FEATS = [['Export editable PowerPoint', 'microsoft-powerpoint-logo', 'basic', 'Download decks you can keep editing in PowerPoint.'], ['Brand Sync', 'palette', 'pro', 'Your fonts, colors and logo on every slide.'], ['Shared knowledge base', 'books', 'gold', 'Files every deck in your workspace can read.'],
    ['Team collaboration', 'users-three', 'gold', 'Edit, comment and present together, with unlimited collaborators.'], ['Ultra AI model', 'sparkle', 'gold', 'Frontier models for the decks that matter most.'], ['Presentation analytics', 'chart-bar', 'pro', 'See who opened your deck and which slides they read.'],
    ['Projects', 'folder-simple', 'gold', 'Group decks with the files they share.'], ['Custom Themes', 'paint-brush', 'pro', 'Build a theme once and use it on every deck.'], ['Present live', 'presentation', 'basic', 'Present from your browser, with your notes beside you.'],
    ['Longer presentations', 'stack', 'pro', 'Decks with 21 slides or more.'], ['Pro AI model', 'magic-wand', 'pro', 'Smarter writing and layouts on every slide.']];
  function nudge(fi = 0, invite = false) {
    const f = FEATS[fi], tiers = invite ? ['gold'] : ['basic', 'pro', 'gold'].slice(['basic', 'pro', 'gold'].indexOf(f[2]));
    const names = tiers.map(t => byId(t).name), who = names.length === 3 ? 'any paid plan' : names.join(' or ');
    const title = invite ? 'Invite your team and collaborate with the Gold plan' : `Access <u>${esc(f[0])}</u> and lots more with ${who}`;
    openModal(`<button class="ibtn lg pkx" id="nX" data-tip="Close">${ic('x')}</button><div class="nudge"><div class="nl"><h2>${title}</h2>
        <div class="frail">${FEATS.map((x, i) => `<button data-f="${i}" aria-current="${i === fi && !invite}">${ic(x[1])}<span>${x[0]}</span></button>`).join('')}</div></div>
      <div class="nr"><div class="pv"><div class="mock">${UI.slideArt({ bg: '#FFFFFF', a: '#0D99FF', b: '#1E1E1E', c: '#0768CF', art: fi % 2 ? 'shape' : 'bars' })}</div></div>
        <div><b class="strong t13" style="display:block">${invite ? 'Team collaboration' : esc(f[0])}</b><span class="muted">${invite ? FEATS[3][3] : f[3]}</span></div>
        <div class="acts">${tiers.map(t => `<button class="btn lg2 ${t === 'gold' ? 'goldb' : t === 'pro' ? 'primary' : 'secondary'}" data-buy="${t}">Buy ${byId(t).name}</button>`).join('')}</div></div></div>`,
      { width: 940, onMount: m => {
        m.dataset.dismiss = 'backdrop';
        $('#nX', m).addEventListener('click', closeModal);
        $$('[data-f]', m).forEach(b => b.addEventListener('click', () => nudge(+b.dataset.f)));
        $$('[data-buy]', m).forEach(b => b.addEventListener('click', () => checkout(b.dataset.buy)));
      } });
  }

  /* ---------- AI credits ---------- */
  function credits() {
    openModal(`<button class="ibtn lg pkx" id="cX" data-tip="Close">${ic('x')}</button><div class="cred2"><div class="cl"><h2 class="ofh">Need more credits?</h2><p class="muted" style="margin-top:4px">Free credits do not reset. Paid plans reset each year.</p>
        <div class="card" style="margin-top:16px"><b class="strong">120 credits left</b><div class="cbar"><span style="width:60%"></span></div><div style="display:flex;justify-content:space-between" class="muted"><span>80 used</span><span>200 total</span></div></div>
        <div class="t9s muted" style="margin-top:16px">What actions cost</div>${costs()}</div>
      <div class="cr"><b class="strong t13" style="display:block">Top up your workspace credit balance</b><p class="muted" style="margin:4px 0 12px">Top-up credits never expire and everyone in the workspace can use them.</p>
        <div class="packs">${[['2,000', '$10', '$20'], ['2,500', '$25'], ['5,000', '$45']].map(k => `<button class="pack" data-pack="${k[0]}"><span class="coin">${ic('coins')}</span><span class="grow"><b class="strong" style="display:block">${k[0]} credits</b><span class="muted">About ${Math.floor(parseInt(k[0].replace(',', '')) / 90)} decks of 9 slides</span></span>${k[2] ? `<span class="gbadge">50% off</span><s class="muted">${k[2]}</s>` : ''}<b class="strong">${k[1]}</b>${ic('caret-right')}</button>`).join('')}</div>
        <p class="t9 muted" style="margin-top:12px">Need more each year? A paid plan gives you up to 25,000 credits a year. <button class="lnk" id="cPlans">See plans</button></p></div></div>`,
      { width: 1000, onMount: m => { m.dataset.dismiss = 'backdrop'; $('#cX', m).addEventListener('click', closeModal); $('#cPlans', m).addEventListener('click', picker); $$('[data-pack]', m).forEach(b => b.addEventListener('click', () => toast(`Opens checkout for ${b.dataset.pack} credits`))); } });
  }

  /* ---------- Checkout ---------- */
  function checkout(id = 'pro') {
    const p = byId(id), yr = P.bill === 'yearly', sub = yr ? p.annualYr : p.monthly, disc = P.offer && yr ? p.annualYr - off(p.annualYr) : 0;
    const tag = { basic: 'Edit and export, no watermark', pro: 'Smarter AI, full brand control', gold: 'Frontier models, unlimited ambition' }[id];
    openModal(`<button class="ibtn lg pkx" id="ckX" data-tip="Close">${ic('x')}</button><div class="chk2"><div class="ckl">
        <button class="btn sm ghost" id="ckBack" style="align-self:flex-start;margin-left:-8px">${ic('arrow-left')}Back to plans</button>
        <div><h2 class="ofh">Upgrade to ${p.name}</h2><p class="muted" style="margin-top:2px">${tag}</p></div>
        <div class="seg wide ptoggle" role="group" aria-label="Billing" style="margin-top:0"><button data-bill="yearly" aria-pressed="${yr}">Yearly <span class="gr">Save ${Math.round((1 - p.annualYr / (p.monthly * 12)) * 100)}%</span></button><button data-bill="monthly" aria-pressed="${!yr}">Monthly</button></div>
        <div><div class="t9s muted" style="margin-bottom:4px">Order summary</div>
          <div class="sumrow"><span>${p.name}, ${yr ? 'billed yearly' : 'billed monthly'}</span><span>${fmt(sub)}</span></div>
          <div class="sumrow"><span>${p.credits} credits a year</span><span class="muted">Included</span></div>
          ${disc ? `<div class="sumrow" style="color:var(--color-text-success)"><span>Discount, 20% off your first year</span><span>-${fmt(disc)}</span></div>` : ''}
          <div class="sumrow" style="border-bottom:0"><b class="strong">Total</b><b class="strong">${fmt(sub - disc)}</b></div></div>
        <span class="grow" style="flex:1"></span>
        <div class="trust">${[['users', 'Used by 12M+ presenters'], ['shield-check', 'GDPR compliant'], ['seal-check', 'SOC 2 Type II']].map(t => `<span>${ic(t[0])}${t[1]}</span>`).join('')}</div></div>
      <div class="ckr"><b class="strong t13">Pay with</b><div class="skel"></div><div class="skel" style="height:40px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="skel" style="height:40px"></div><div class="skel" style="height:40px"></div></div><div class="skel" style="height:40px"></div>
        <p class="t9 muted">The payment form loads here.</p><span style="flex:1"></span>
        <button class="btn primary lg2" id="ckPay">Pay ${fmt(sub - disc)}</button>
        <p class="t9 muted" style="text-align:center">Cancel any time; your plan stays on until the end of the billing period.</p></div></div>`,
      { width: 1080, onMount: m => {
        m.dataset.dismiss = 'x';
        $$('[data-bill]', m).forEach(b => b.addEventListener('click', () => { P.bill = b.dataset.bill; checkout(id); }));
        $('#ckBack', m).addEventListener('click', picker);
        $('#ckPay', m).addEventListener('click', () => toast('Sample checkout: nothing is charged'));
        $('#ckX', m).addEventListener('click', () => { closeModal(); if (!P.offer) $('#ctab', root).classList.add('on'); });
      } });
  }

  const go = (o, fn) => { Object.assign(P, { bill: 'yearly', offer: false, paid: false }, o); base(o.ctab); delete P.ctab; fn && fn(); };
  UI.onChange(k => { if (k === 'view' && UI.S.view !== 'pricing') clearInterval(tmrT); });
  UI.registerStates('pricing', [
    { id: 'pr-plans', label: 'Plan picker, yearly (sample prices)', run: () => go({}, picker) },
    { id: 'pr-monthly', label: 'Plan picker, monthly', run: () => go({ bill: 'monthly' }, picker) },
    { id: 'pr-offer', label: 'Plan picker, 20% offer applied', run: () => go({ offer: true }, () => { picker(); toast('Offer applied: 20% off your first year'); }) },
    { id: 'pr-paid', label: 'Plan picker, already on Pro', run: () => go({ paid: true }, picker) },
    { id: 'pr-gold', label: 'Gold for teams', run: () => go({}, goldOnly) },
    { id: 'pr-q', label: 'Close: what stopped you?', run: () => go({}, question) },
    { id: 'pr-close', label: 'Close: 20% off offer', run: () => go({}, () => closeOffer()) },
    { id: 'pr-q-monthly', label: 'Close: pay monthly', run: () => go({}, qMonthly) },
    { id: 'pr-q-credits', label: 'Close: what the credits cover', run: () => go({}, qCredits) },
    { id: 'pr-nudge', label: 'Feature nudge (PowerPoint export)', run: () => go({}, () => nudge(0)) },
    { id: 'pr-nudge-pro', label: 'Feature nudge (Brand Sync)', run: () => go({}, () => nudge(1)) },
    { id: 'pr-nudge-invite', label: 'Feature nudge (invite team)', run: () => go({}, () => nudge(3, true)) },
    { id: 'pr-credits', label: 'Need more credits', run: () => go({}, credits) },
    { id: 'pr-checkout', label: 'Checkout, Pro yearly', run: () => go({}, () => checkout('pro')) },
    { id: 'pr-checkout-offer', label: 'Checkout, Pro with 20% off', run: () => go({ offer: true }, () => checkout('pro')) },
    { id: 'pr-checkout-close', label: 'Checkout closed, offer tab', run: () => go({ ctab: true }) }]);
})();
