/* Home top section: 3 options (1, 2, 3). Used by hero-options.html (gallery) and by Home via ?hero=N.
   Original look (product DS geometry), Figma color tokens. Inspiration screenshots from Mobbin in hero-refs/. */
(function () {
  const ic = n => `<i class="ph-light ph-${n}"></i>`;
  const M = id => `https://mobbin.com/screens/${id}`;
  /* Prompt bar = Create's: Design (beam border until a kit is picked, same picker) and Options (same panel, inline).
     Parts come from original/create.js (UI.createParts); prompt, kit and options carry into Create on send. */
  const P = () => window.UI && window.UI.createParts;
  const designBtn = () => { const p = P(), kit = p && p.state().kit;
    return `<button class="btn sm secondary dtrig ${kit ? '' : 'beam'}" data-hx-design style="height:32px" data-tip="Design">${p ? p.kitHtml() : ic('palette') + 'Design'}${ic('caret-down')}</button>`; };
  const optsBtn = open => { const n = P() ? P().changed() : 0;
    return `<button class="btn sm ${open ? 'secondary' : 'ghost'}" data-hx-opts aria-expanded="${!!open}" style="height:32px">${ic('sliders-horizontal')}Options${n ? `<span class="cnt">${n}</span>` : ''}</button>`; };
  const promptBox = (ph, big) => `<div class="hx-prompt ${big ? 'big' : ''}"><textarea aria-label="Your prompt" placeholder="${ph}"></textarea>
    <div class="hx-pbar"><button class="btn sm secondary hx-sq" data-tip="Add files">${ic('plus')}</button>${designBtn()}${optsBtn(false)}<span class="grow"></span><button class="btn primary hx-send" data-hx-send data-tip="Create">${ic('arrow-up')}</button></div></div>`;
  /* Options panel inline under the prompt; once the box scrolls away the shared docked prompt bar (create.js) keeps the controls in reach. */
  const owners = new WeakMap();
  function owner(sec) {
    if (owners.has(sec)) return owners.get(sec);
    const card = () => sec.querySelector('.hx-prompt'), ta = () => sec.querySelector('textarea');
    const o = { on: () => UI.S.view === 'dashboard' && sec.isConnected && !!sec.querySelector('.hx-opts'), card,
      top: () => { let p = sec.parentElement; while (p && p !== document.body && !/(auto|scroll)/.test(getComputedStyle(p).overflowY)) p = p.parentElement; return p && p !== document.body ? p.getBoundingClientRect().top : 0; },
      text: () => (ta() ? ta().value.trim() : ''), ph: ta() ? ta().getAttribute('placeholder') : '',
      act: k => { if (k === 'back' || k === 'mic' || k === 'plus') P().toBox(card(), ta()); else if (k === 'send') send(sec);
        else if (k === 'design') P().design(() => { const d = sec.querySelector('[data-hx-design]'); if (d) d.outerHTML = designBtn(); P().dock.check(); });
        else if (k === 'opts') { const b = sec.querySelector('.hx-opts'); if (b && b.scrollIntoView) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); } } };
    owners.set(sec, o); return o;
  }
  function optsUI(sec, open) {
    let box = sec.querySelector('.hx-opts'); const btn = () => sec.querySelector('[data-hx-opts]');
    if (!open) { if (box) box.remove(); btn().outerHTML = optsBtn(false); P().dock.detach(owner(sec)); return; }
    if (!box) { box = document.createElement('div'); box.className = 'hx-opts'; sec.querySelector('.hx-prompt').after(box); }
    const draw = () => { box.innerHTML = P().panel(); P().wire(box, draw, () => optsUI(sec, false), () => send(sec)); btn().outerHTML = optsBtn(true); P().dock.attach(owner(sec)); };
    draw();
  }
  function send(sec) { const C = P().state(), t = sec.querySelector('textarea');
    P().open({ text: t ? t.value : '', kit: C.kit, o: { ...C.o }, opts: !!sec.querySelector('.hx-opts') }); }

  /* Ways to start a deck: ONE list for every option and the More popover. Add a new way here and it appears
     behind More everywhere. Order = priority: options show the first few, the rest sit behind More. */
  const WAYS = [
    { id: 'prompt', icon: 'sparkle', name: 'Create with AI', desc: 'From a prompt, we write every slide', rec: true },
    { id: 'import', icon: 'microsoft-powerpoint-logo', name: 'Import PowerPoint', desc: 'Redesign an existing deck', tone: 'o' },
    { id: 'template', icon: 'circles-four', name: 'Choose a template', desc: 'Start from a ready layout', tone: 'g' },
    { id: 'expert', icon: 'pen-nib', name: 'Hire an expert', desc: 'A designer builds it for you', tone: 'p' },
    { id: 'update', icon: 'arrows-clockwise', name: 'Update a presentation', desc: 'Refresh numbers in a deck', tone: 'b' },
  ];
  const OTHER = WAYS.filter(w => !w.rec);
  const REC = '<span class="hx-rec">Recommended</span>';
  const MORE = 'data-ways aria-haspopup="menu" aria-expanded="false"';
  const ALL = `All ${WAYS.length} ways to start`;
  /* Example prompts (option 1): the chip shows the label, a click puts the full prompt in the box. */
  const EX = [
    { emoji: '📈', label: 'Quarterly sales review', text: 'Q3 sales review for the leadership team: revenue against target, win rate, the top five deals and the Q4 plan. 12 slides.' },
    { emoji: '📊', label: 'Pipeline update', text: 'Pipeline update for Monday\'s sales call: value by stage, the deals at risk and what moves this week. 8 slides.' },
    { emoji: '🤝', label: 'Account plan', text: 'Account plan for [customer name]: who decides, what they spend with us today and where we grow next year. 9 slides.' },
    { emoji: '📋', label: 'Board update', text: 'November board update: revenue, burn and runway, and the three decisions we need from the board. 10 slides.' },
  ];
  /* Round-icon row of the other ways, More last (options 1 and 3). `lead` = extra item before them. */
  const waysRow = (lead = '') => `<div class="hx-types">${lead}${OTHER.slice(0, 4).map(w => `<button class="hx-type" data-way="${w.id}"><span class="hx-dot ${w.tone}">${ic(w.icon)}</span>${w.name}</button>`).join('')}<button class="hx-type" ${MORE}><span class="hx-dot n">${ic('dots-three')}</span>More</button></div>`;

  window.HERO_OPTIONS = [
    { n: 1, name: 'Prompt first', idea: 'The prompt is the hero. Four examples fill it in one click; the other ways sit in one row below, More last.',
      ref: { app: 'Manus', img: '01-manus.jpg', url: M('156621d5-5d04-427e-acd0-a20be1c8d1ca') },
      html: () => `<section class="hx hx1"><h1>What are you presenting next?</h1>
        ${promptBox('Q4 sales review for the leadership team: pipeline, win rate and the Q1 plan', true)}
        <div class="hx-chips">${EX.map((x, i) => `<button class="hx-chip" data-ex="${i}"><span class="hx-emo" aria-hidden="true">${x.emoji}</span>${x.label}</button>`).join('')}</div>
        ${waysRow()}</section>` },

    { n: 2, name: 'Greeting plus cards', idea: 'A greeting, then one row of cards. Create with AI comes first, marked Recommended; three more ways follow and More opens the full list, so a new way needs no new layout.',
      ref: { app: 'Clay', img: '02-clay.jpg', url: M('a61a701d-9f59-4c6a-9cf7-34fe42028742') },
      html: () => `<section class="hx hx2"><h1>Good afternoon, Mani</h1>
        <div class="hx-cards5"><button class="hx-card rec" data-create><span class="hx-ico b">${ic('sparkle')}</span><b>${WAYS[0].name}</b><span class="d">${WAYS[0].desc}</span>${REC}</button>${OTHER.slice(0, 3).map(w => `<button class="hx-card" data-way="${w.id}"><span class="hx-ico">${ic(w.icon)}</span><b>${w.name}</b><span class="d">${w.desc}</span></button>`).join('')}<button class="hx-card" ${MORE}><span class="hx-ico">${ic('dots-three')}</span><b>More</b><span class="d">${ALL}</span></button></div></section>` },

    { n: 3, name: 'A row of ways', idea: 'Tinted band with one row of round icons. Create with AI comes first, filled and marked Recommended; the other ways follow, More last.',
      ref: { app: 'Canva', img: '03-canva.jpg', url: M('42b3f60f-9fe9-427a-ab18-dc2e097a7b1f') },
      html: () => `<section class="hx hx3"><h1>Start a deck for your next meeting</h1>
        ${waysRow(`<button class="hx-type rec" data-create><span class="hx-dot brand">${ic('sparkle')}</span>${WAYS[0].name}${REC}</button>`)}</section>` },
  ];

  /* More popover: lists every way to start. Own code (the gallery has no app.js); on Home it routes through window.UI.
     Opens below when it fits, flips above when there is more room, caps height and scrolls inside, keeps direction while open. */
  let pop = null, anchor = null, dir = null;
  function place() {
    if (!anchor) return; if (!anchor.isConnected) return close();
    const r = anchor.getBoundingClientRect(), gap = 6, pad = 8;
    if (r.bottom < 0 || r.top > innerHeight) return close(); /* button scrolled out of view */
    pop.style.maxHeight = ''; const mh = pop.offsetHeight, mw = pop.offsetWidth; /* offsetHeight counts the border, so no false scrollbar */
    const below = innerHeight - r.bottom - gap - pad, above = r.top - gap - pad;
    if (!dir) dir = (mh <= below || below >= above) ? 'down' : 'up';
    const h = Math.max(0, Math.min(mh, dir === 'down' ? below : above));
    pop.style.maxHeight = h + 'px';
    pop.style.top = (dir === 'down' ? r.bottom + gap : r.top - gap - h) + 'px';
    pop.style.left = Math.max(pad, Math.min(r.left, innerWidth - mw - pad)) + 'px';
  }
  function open(a) {
    if (anchor === a) return close(); close();
    if (!pop) { pop = document.createElement('div'); pop.className = 'hx-pop'; pop.setAttribute('role', 'menu'); pop.setAttribute('aria-label', 'Ways to start a deck'); document.body.appendChild(pop); }
    pop.innerHTML = `<div class="hx-pop-h"><b>Ways to start a deck</b><span>${WAYS.length}</span></div>` + WAYS.map(w =>
      `<button class="hx-pop-i" role="menuitem" data-way="${w.id}"><span class="hx-ico ${w.rec ? 'b' : ''}">${ic(w.icon)}</span><span><b>${w.name}${w.rec ? REC : ''}</b><span class="d">${w.desc}</span></span></button>`).join('');
    anchor = a; dir = null; a.setAttribute('aria-expanded', 'true'); pop.classList.add('open'); place();
    const first = pop.querySelector('.hx-pop-i'); if (first) first.focus({ preventScroll: true });
  }
  function close() { if (anchor) anchor.setAttribute('aria-expanded', 'false'); anchor = null; dir = null; if (pop) pop.classList.remove('open'); }
  function go(id) {
    const w = WAYS.find(x => x.id === id), U = window.UI; close();
    if (!w || !U) return; /* gallery: no app behind it */
    if (id === 'prompt') { U.S.state = ''; U.setView('create'); U.runState('cr-start'); } else U.toast(`Opens ${w.name}`);
  }
  document.addEventListener('click', e => {
    const m = e.target.closest('[data-ways]'); if (m) return open(m);
    const w = e.target.closest('.hx [data-way], .hx-pop [data-way]'); if (w) return go(w.dataset.way);
    const d = e.target.closest('.hx [data-hx-design]'); if (d && P()) return P().design(() => { d.outerHTML = designBtn(); });
    const o = e.target.closest('.hx [data-hx-opts]'); if (o && P()) { P().state(); const s = o.closest('.hx'); return optsUI(s, !s.querySelector('.hx-opts')); }
    const sn = e.target.closest('.hx [data-hx-send]'); if (sn && P()) return send(sn.closest('.hx'));
    const x = e.target.closest('.hx [data-ex]'); if (x) { const t = x.closest('.hx').querySelector('textarea'); if (t) { t.value = EX[+x.dataset.ex].text; t.focus(); } }
  });
  document.addEventListener('mousedown', e => { if (anchor && !pop.contains(e.target) && !anchor.contains(e.target)) close(); });
  document.addEventListener('keydown', e => {
    if (!anchor) return;
    if (e.key === 'Escape') { const a = anchor; close(); a.focus(); return; }
    const items = [...pop.querySelectorAll('.hx-pop-i')], i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
    if (e.key === 'Tab' && i > -1) { const a = anchor; close(); a.focus(); } /* Tab leaves the list, back on More */
  });
  addEventListener('resize', place);
  addEventListener('scroll', e => { if (anchor && !pop.contains(e.target)) place(); }, true);
  window.HERO_WAYS = WAYS; window.HERO_EXAMPLES = EX;
})();
