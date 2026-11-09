/* Editor: structure and copy from pitchdeckdoclist new_dev_migration (src/editor/core/view/editor), look from Figma UI3. */
(function () {
  const { $, $$, ic, esc, openMenu, closeMenu, toast } = UI;
  const root = $('#editor');
  const E = { sel: 'none', slide: 1, panel: null, title: 'Refresh Studio capabilities' };
  /* The deck: a real one (atlas/assets/decks/refresh-capabilities, Refresh Studio capabilities deck 2024).
     Slide 1 = real, selectable elements rebuilt from its slide 04; slides 2 to 12 = its slides 05 to 15 as images;
     slides 13 to 16 = element slides for the chart, table, diagram and logo states. Rail thumbnails of live slides are scaled copies. */
  const N = 16, IMG = n => (n >= 2 && n <= 12 ? String(n + 3).padStart(2, '0') : null), MOCK = { 13: 'chart', 14: 'table', 15: 'diagram', 16: 'logos' };
  const SEL_SLIDE = { chart: 13, table: 14, node: 15, logo: 16 };
  /* selection id -> floater kind (slide 1 has several text boxes) */
  const FK = { body: 'body', year: 'body', f1: 'body', f2: 'body', f3: 'body' };
  /* Text properties per element of slide 1 (title pattern vs text box), in the product's units */
  const TP = { text: { title: 1, style: 'Large', color: '0A0A0A', size: 61, line: 1.12, letter: -0.03, align: 0, kase: 0 },
    body: { style: 'Medium', color: '6E6E6E', size: 23, line: 1.45, letter: -0.01, align: 0, kase: 0, para: 0 },
    year: { style: 'Caption', color: '0A0A0A', size: 15, line: 1.3, letter: 0, align: 2, kase: 0, para: 0 },
    f1: { style: 'Caption', color: '1E1E1E', size: 12, line: 1.3, letter: 0.02, align: 0, kase: 1, para: 0 },
    f2: { style: 'Caption', color: '1E1E1E', size: 12, line: 1.3, letter: 0.02, align: 0, kase: 1, para: 0 },
    f3: { style: 'Caption', color: '1E1E1E', size: 12, line: 1.3, letter: 0.02, align: 2, kase: 0, para: 0 } };
  const s1Html = range => `<div class="s1">
      <div class="s1-year" data-sel="year">2024</div>
      <div class="s1-title" data-sel="text">Refresh Studio is a digital product<br>design studio that helps<br>companies enhance their brand<br>offering and ${range ? '<mark class="s1-hl">customer experience.</mark>' : '<span class="s1-hl">customer experience.</span>'}</div>
      <div class="s1-body" data-sel="body">Refresh Studio is a well-established and independent digital product design studio, proudly rooted in Johannesburg, South Africa. With a local and international reach, we cater to a wide range of clients, including tech start-ups, development houses, and everything in between.</div>
      <img class="s1-photo" data-sel="image" src="assets/deck/refresh/s1-photo.jpg" alt="Three designers at their desks">
      <div class="s1-f s1-f1" data-sel="f1">REFRESH STUDIO™ CAPABILITIES DECK</div><div class="s1-f s1-f2" data-sel="f2">ABOUT</div><div class="s1-f s1-f3" data-sel="f3">03</div></div>`;

  /* ---------- floater definitions (order from InlineFloater + Floater*Util) ---------- */
  const F = {
    text: ['tstyle', 'step', ['color', 'Font Color'], ['text-align-left', 'Alignment', { dd: 'align' }], '|', ['text-b', 'Bold'], ['text-italic', 'Italic'], '|', ['gear-six', 'Advanced Options', { act: 'textprops' }], ['trash', 'Delete', { danger: 1 }], '|', ['plus', 'Add graphic, label, subtitle or button', { label: 'Add', dd: 'add' }]],
    range: [['highlighter', 'Highlight', { label: 'Highlight' }], '|', ['color', 'Font Color'], '|', ['text-b', 'Bold'], ['text-italic', 'Italic'], ['text-underline', 'Underline'], ['text-strikethrough', 'Strike-through'], '|', ['text-superscript', 'Super-script'], ['text-subscript', 'Sub-script'], '|', ['link-simple', 'Add a link to a website or a slide', { pop: 'link' }], '|', ['eraser', 'Clear Styles']],
    chart: [['arrows-clockwise', 'Change', { label: 'Change' }], 'pager', ['plus-circle', 'Add Point', { label: 'Add Point', dd: 'points' }], ['pencil-simple', 'Edit chart', { label: 'Edit chart' }], ['gear-six', 'Configure additional settings for this slide', { label: 'Settings' }], ['text-t', 'Add title'], ['trash', 'Delete graphic', { danger: 1 }]],
    table: [['arrows-clockwise', 'Change', { label: 'Change' }], ['rows', 'Type', { label: 'Type', dd: 'ttype' }], ['text-align-left', 'Alignment', { dd: 'align' }], ['arrows-out-line-horizontal', 'Resize'], ['copy', 'Duplicate'], ['paint-bucket', 'Background Color'], '|', ['gear-six', 'Configure additional settings for this slide', { label: 'Settings' }], ['trash', 'Delete graphic', { danger: 1 }]],
    node: ['step', ['color', 'Font Color'], ['text-align-center', 'Alignment', { dd: 'align' }], '|', ['text-b', 'Bold'], ['text-italic', 'Italic'], '|', ['cards-three', 'Duplicate'], ['caret-left', 'Swap Previous'], ['caret-right', 'Swap Next'], '|', ['gear-six', 'Advanced Options'], ['trash', 'Delete point', { danger: 1 }]],
    body: ['tstyle', 'step', ['color', 'Font Color'], ['text-align-left', 'Alignment', { dd: 'align' }], '|', ['text-b', 'Bold'], ['text-italic', 'Italic'], '|', ['list-numbers', 'Decimal'], ['paragraph', 'Paragraph'], ['list-bullets', 'Bullet list'], ['list-checks', 'Check list'], ['columns', 'Text Column', { dd: 'cols' }], '|', ['text-superscript', 'Super-script'], ['text-subscript', 'Sub-script'], '|', ['gear-six', 'Advanced Options', { act: 'textprops' }]],
    image: [['cloud-arrow-up', 'Upload'], ['image', 'Replace image', { label: 'Replace' }], ['crop', 'Crop'], '|', ['trash', 'Delete graphic', { danger: 1 }]],
    logo: [['cloud-arrow-up', 'Upload'], ['image', 'Replace'], ['crop', 'Crop'], '|', ['shapes', 'Type', { label: 'Type', dd: 'ltype' }], ['arrows-clockwise', 'Change'], ['arrows-out', 'Resize'], ['plus', 'Add item'], ['grid-four', 'Position'], ['circle-half', 'Contrast'], '|', ['trash', 'Delete', { danger: 1 }]],
    bg: [['cloud-arrow-up', 'Upload Image'], ['image', 'Replace', { img: 1 }], ['crop', 'Crop', { img: 1 }], ['stack', 'Overlay', { label: 'Overlay' }]] };
  function floaterHtml(kind) {
    const items = F[kind]; if (!items) return '';
    return `<div class="fbar" role="toolbar" aria-label="Edit selection">${items.map((it, i) => {
      if (it === '|') return '<span class="fsep"></span>';
      if (it === 'tstyle') return `<button class="ft lbl tsel" data-tip="Font Size" data-dd="tstyle"><span>${(TP[E.sel] || TP.text).style}</span>${ic('caret-down', 'car')}</button>`;
      if (it === 'step') return `<span class="step" data-tip="Font Size"><b>${kind === 'node' ? 16 : (TP[E.sel] || { size: 40 }).size}</b><button class="ibtn" style="width:16px;height:16px" data-fi="step">${ic('caret-down', 'car')}</button></span>`;
      if (it === 'pager') return `<button class="ft" data-tip="Previous">${ic('caret-left')}</button><span class="muted" style="padding:0 2px">1 / 2</span><button class="ft" data-tip="Next">${ic('caret-right')}</button><span class="fsep"></span>`;
      const [icn, tip, o = {}] = it; if (o.img && !IMG(E.slide)) return '';
      if (icn === 'color') return `<button class="ft" data-tip="${tip}" data-fi="${i}" data-pop="color"><span class="fcolor"><b>A</b><span style="background:#0D99FF"></span></span></button>`;
      const lbl = o.label ? `<span>${o.label}</span>` : '';
      return `<button class="ft ${o.label ? 'lbl' : ''} ${o.danger ? 'danger' : ''}" data-tip="${tip}" data-fi="${i}" ${o.dd ? `data-dd="${o.dd}"` : ''} ${o.pop ? `data-pop="${o.pop}"` : ''} ${o.act ? `data-act="${o.act}"` : ''}>${ic(icn)}${lbl}${o.dd ? ic('caret-down', 'car') : ''}</button>`;
    }).join('')}</div>`;
  }

  /* ---------- slide content ---------- */
  function slideHtml() {
    if (E.slide === 1) return s1Html(E.sel === 'range');
    const im = IMG(E.slide); if (im) return `<img class="s-img" src="assets/deck/refresh/c/${im}.jpg" alt="Slide ${E.slide} of the Refresh Studio capabilities deck">`;
    return mockHtml(MOCK[E.slide] || 'chart', E.sel === 'range');
  }
  function mockHtml(type, range) {
    const title = range ? 'Q3 revenue grew <mark>18% year on year</mark>' : 'Q3 revenue grew 18% year on year';
    const left = `<div class="sc-k">Q3 review</div><div class="sc-t" data-sel="text">${title}</div><div class="sc-s">Enterprise deals and a faster sales cycle drove the quarter. Churn held flat at 2.1%.</div><ul class="sc-ul"><li>New ARR: $4.2M, up 31%</li><li>Sales cycle down from 64 to 48 days</li><li>Net retention at 118%</li></ul>`;
    const right = {
      chart: `<div class="sc-chart" data-sel="chart"><i data-v="Q4" style="height:44%;background:#BDE3FF"></i><i data-v="Q1" style="height:58%;background:#80CAFF"></i><i data-v="Q2" style="height:70%;background:#0D99FF"></i><i data-v="Q3" style="height:92%;background:#0768CF"></i></div>`,
      table: `<table class="sc-table" data-sel="table"><thead><tr><th>Region</th><th>Q2</th><th>Q3</th><th>Change</th></tr></thead><tbody><tr><td>North America</td><td>$1.9M</td><td>$2.3M</td><td>+21%</td></tr><tr><td>Europe</td><td>$1.1M</td><td>$1.2M</td><td>+9%</td></tr><tr><td>APAC</td><td>$0.6M</td><td>$0.7M</td><td>+17%</td></tr></tbody></table>`,
      diagram: `<div class="sc-dia"><div class="nd"><b>1</b>Lead</div><span class="ar">→</span><div class="nd" data-sel="node"><b>2</b>Demo</div><span class="ar">→</span><div class="nd"><b>3</b>Close</div></div>`,
      image: `<div class="sc-img" data-sel="image"></div>`,
      logos: `<div class="sc-logos" data-sel="logo"><span>ACME</span><span>Globex</span><span>Initech</span><span>Umbrella</span><span>Hooli</span><span>Stark</span></div>` }[type];
    return left + right;
  }

  function topbar() {
    return `<div class="etop">
      <button class="ibtn lg" data-tip="Back to dashboard" id="homeBtn">${ic('house')}</button><span class="vdiv"></span>
      <input class="title" aria-label="Deck title" value="${esc(E.title)}">
      <button class="btn sm secondary upg">${ic('crown-simple')}Upgrade</button>
      <span class="grow"></span>
      <button class="ibtn lg" data-tip="Undo" data-sc="⌘Z">${ic('arrow-u-up-left')}</button><button class="ibtn lg" data-tip="Redo" data-sc="⇧⌘Z">${ic('arrow-u-up-right')}</button>
      <button class="ibtn lg" id="eTheme" data-tip="Switch theme"><i data-theme-icon class="ph-light ph-moon"></i></button>
      <button class="ibtn lg" id="eMore" data-tip="More actions">${ic('dots-three')}</button>
      <button class="meter meterE" data-tip="Credits left. Click for usage."><span class="tr"><span></span></span>120 credits</button>
      <button class="btn secondary" id="eShare">${ic('share-network')}Share</button>
      <button class="btn secondary" id="ePresent">${ic('play')}Present${ic('caret-down', 'car')}</button>
      <button class="btn primary" data-tip="Get an editable Powerpoint, including animations.">${ic('download-simple')}Download</button>
    </div>`;
  }
  const thumb = n => { const im = IMG(n);
    return im ? `<div class="pv"><img src="assets/deck/refresh/t/${im}.jpg" alt="" loading="lazy"></div>` : `<div class="pv live" aria-hidden="true"><div class="slide">${n === 1 ? s1Html(false) : mockHtml(MOCK[n], false)}</div></div>`; };
  function rail() {
    const rows = Array.from({ length: N }, (_, i) => `${i ? '<div class="addbtw"><button aria-label="New slide">' + ic('plus') + '</button></div>' : ''}<div class="srow2 ${i + 1 === E.slide ? 'on' : ''}" data-n="${i + 1}"><span class="num">${i + 1}</span>${thumb(i + 1)}</div>`).join('');
    return `<nav class="rail" aria-label="Slides"><div class="rh"><button class="btn sm secondary" id="newSlide">${ic('plus')}New slide</button></div><div class="rl">${rows}</div></nav>`;
  }
  function panelHtml() {
    if (E.panel === 'style') return `<div class="rp-h"><span class="ttl">Style</span><button class="ibtn" data-close data-tip="Close">${ic('x')}</button></div><div class="rp-b"><div class="psec"><p style="padding-top:12px">Click a brand kit to apply it to every slide. Undo restores the previous look.</p><div style="padding:12px 16px 0"><div class="seg wide"><button aria-pressed="true">Created by me</button><button aria-pressed="false">Workspace</button><button aria-pressed="false">For you</button></div></div></div>
      <div class="psec" style="border:0;padding-top:12px"><div class="kits">${[['Deck Studio Blue', ['#0D99FF', '#0768CF', '#80CAFF', '#1E1E1E'], '#F2F9FF', 1], ['Midnight', ['#80CAFF', '#9747FF', '#FFFFFF', '#2C2C2C'], '#0D193F'], ['Sunrise', ['#FFA629', '#F24822', '#FFCD29', '#1E1E1E'], '#FFF4E5'], ['Mint', ['#14AE5C', '#009951', '#8DDDA4', '#083A23'], '#EDF9EF']].map(k => `<div class="kit ${k[3] ? 'on' : ''}"><div class="kp" style="background:${k[2]}">${k[1].map(c => `<i style="background:${c}"></i>`).join('')}</div><div class="kn"><span class="strong">${k[0]}</span><button class="ibtn" data-tip="More">${ic('dots-three')}</button></div></div>`).join('')}</div></div></div>`;
    if (E.panel === 'notes') return `<div class="rp-h"><span class="ttl">Speaker notes</span><button class="ibtn" data-close data-tip="Close">${ic('x')}</button></div><div class="rp-b"><div style="padding:16px"><button class="btn primary" style="width:100%">${ic('sparkle')}Generate with AI</button></div><div class="notes"><textarea placeholder="Add notes"></textarea></div></div>`;
    if (E.panel === 'textprops') {
      const t = TP[E.sel] || TP.text, title = !!t.title;
      const sl = (label, v, min, max) => `<div class="psec"><div class="ph"><span>${label}</span></div><div class="prow"><div class="slider"><span style="width:${Math.round((v - min) / (max - min) * 100)}%"></span><b style="left:${Math.round((v - min) / (max - min) * 100)}%"></b></div><div class="field" style="width:64px"><input value="${v}" aria-label="${label}"></div></div></div>`;
      const tiles = (label, items, on) => `<div class="psec"><div class="ph"><span>${label}</span></div><div class="prow"><div class="tiles tiles4">${items.map((x, i) => `<button aria-pressed="${i === on}" data-tip="${x[1]}" aria-label="${x[1]}">${x[0].startsWith('<') ? x[0] : ic(x[0])}</button>`).join('')}</div></div></div>`;
      const dd = (label, v) => `<div class="psec"><div class="ph"><span>${label}</span><button class="ibtn" data-tip="Reset" aria-label="Reset ${label}">${ic('arrow-counter-clockwise')}</button></div><div class="prow"><button class="selectbox wide" data-pdd="${label}"><span>${v}</span><span class="ico24">${ic('caret-down')}</span></button></div></div>`;
      const sw = (label, on) => `<div class="psec"><div class="prow" style="justify-content:space-between"><span>${label}</span><button class="switch" role="switch" aria-checked="${!!on}" aria-label="${label}"></button></div></div>`;
      const AL = [['text-align-left', 'Left'], ['text-align-center', 'Center'], ['text-align-right', 'Right'], ['text-align-justify', 'Justify']];
      const CASE = [['minus', 'None'], ['<b>AA</b>', 'Uppercase'], ['<b>Aa</b>', 'Capitalize'], ['<b>aa</b>', 'Lowercase']];
      return `<div class="rp-h"><button class="ibtn" data-close data-tip="Back">${ic('arrow-left')}</button><span class="ttl">Text properties</span><button class="ibtn" data-close data-tip="Close">${ic('x')}</button></div><div class="rp-b">
      <div class="psec"><div class="ph"><span>Type Style</span></div><div class="prow"><button class="selectbox wide" data-pdd="Type Style"><span>${t.style}</span><span class="ico24">${ic('caret-down')}</span></button></div></div>
      <div class="psec"><div class="ph"><span>Color</span><button class="ibtn" data-tip="Reset" aria-label="Reset Color">${ic('arrow-counter-clockwise')}</button></div><div class="prow"><div class="field full"><label class="swatch" style="background:#${t.color}"><input type="color" value="#${t.color}" aria-label="Pick a color"></label><input value="${t.color}" aria-label="Hex color"></div></div></div>
      ${dd('Font Size', t.size)}
      ${tiles('Alignment', AL, t.align)}
      ${title ? tiles('Text horizontal', [['align-left', 'Left'], ['align-center-horizontal', 'Center'], ['align-right', 'Right']], 0) + tiles('Text vertical', [['align-top', 'Top'], ['align-center-vertical', 'Middle'], ['align-bottom', 'Bottom']], 0) : ''}
      ${sl('Opacity', 100, 20, 100)}
      ${title ? `<div class="psec"><div class="ph"><span>Text Background</span></div><div class="prow"><div class="field full"><span class="swatch none"></span><input value="None" aria-label="Text Background" readonly></div></div></div>` + sw('Text grayscale', false) : ''}
      ${title ? '' : sl('Paragraph space', t.para, 0, 5)}
      ${sl('Line spacing', t.line, 0.5, 2)}
      ${sl('Letter spacing', t.letter, -0.1, 1)}
      ${tiles('Case', CASE, t.kase)}
      ${title ? '' : tiles('List with Text', [['minus', 'None'], ['list-bullets', 'Bullet list'], ['list-numbers', 'Decimal'], ['list-checks', 'Check list']], 0)}
      <div style="padding:16px"><button class="btn secondary" style="width:100%">Reset to default</button></div></div>`;
    }
    return '';
  }
  function render() {
    if (E.panel === 'textprops' && !TP[E.sel]) E.panel = null; /* Text properties only while a text box is selected */
    const oldRail = $('.rl', root); const railTop = oldRail ? oldRail.scrollTop : 0;
    root.innerHTML = topbar() + `<div class="ebody">${rail()}<main class="cv" id="cv">
        <div class="fslot" id="fslot">${floaterHtml(FK[E.sel] || E.sel)}</div>
        <div class="counter"><span>Slide ${E.slide} of ${N}</span><div><button class="ibtn" id="prevSlide" data-tip="Previous Slide" ${E.slide === 1 ? 'aria-disabled="true"' : ''}>${ic('caret-left')}</button><button class="ibtn" id="nextSlide" data-tip="Next Slide" ${E.slide === N ? 'aria-disabled="true"' : ''}>${ic('caret-right')}</button></div></div>
        <div class="slide" id="slide">${slideHtml()}</div>
        <div class="fbar btool" id="btool"><button class="ft lbl" id="bInsert">${ic('plus')}<span>Insert</span>${ic('caret-down', 'car')}</button><button class="ft lbl ${E.panel === 'style' ? 'on' : ''}" id="bStyle">${ic('swatches')}<span>Style</span></button><button class="ft lbl" id="bAi"><i class="ph-light ph-sparkle" style="color:var(--color-icon-brand)"></i><span>Edit with AI</span></button><span class="fsep"></span><button class="ft" id="bMore" data-tip="More actions">${ic('dots-three-vertical')}</button></div>
      </main><aside class="rpanel ${E.panel ? 'on' : ''} ${E.panel === 'style' ? 'w380' : ''}" id="rpanel">${panelHtml()}</aside></div>`;
    const rl = $('.rl', root); if (rl) rl.scrollTop = railTop;
    UI.setTheme(UI.S.theme); wire(); requestAnimationFrame(layout);
  }

  /* ---------- layout + selection ---------- */
  function layout() {
    const cv = $('#cv', root); if (!cv || !cv.offsetParent) return;
    const short = innerHeight <= 700; const chrome = (short ? 8 : 16) + 48 + (short ? 4 : 8) + 32 + 48 + (short ? 12 : 24) + 24;
    const w = Math.max(360, Math.min(cv.clientWidth - 48, (cv.clientHeight - chrome) * 16 / 9, 1040));
    cv.style.setProperty('--slide-w', Math.round(w) + 'px'); drawSel();
  }
  function drawSel() {
    const slide = $('#slide', root); if (!slide) return; $$('.sel-box,.tchrome', slide).forEach(n => n.remove());
    if (E.sel === 'none') return;
    const sr = slide.getBoundingClientRect(); let r;
    if (E.sel === 'bg') r = { left: sr.left, top: sr.top, width: sr.width, height: sr.height };
    else { const key = E.sel === 'range' ? 'text' : E.sel; const el = $(`[data-sel="${key}"]`, slide); if (!el) return; r = (E.sel === 'range' ? $('mark', el) : el).getBoundingClientRect(); }
    const b = document.createElement('div'); b.className = 'sel-box';
    Object.assign(b.style, { left: r.left - sr.left + 'px', top: r.top - sr.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    if (E.sel === 'bg') b.classList.add('bgsel');
    if ($('[contenteditable="true"]', slide)) b.classList.add('editing', ...(E.sel === 'text' ? ['keep'] : [])); /* stays in edit mode across redraws */
    if (E.sel !== 'range' && E.sel !== 'bg') b.innerHTML = `<span class="drag" aria-hidden="true">${ic('dots-six-vertical')}</span><span class="hd tl"></span><span class="hd tr"></span><span class="hd bl"></span><span class="hd br"></span>`;
    slide.appendChild(b);
    if (E.sel === 'table') tableChrome(slide, sr);
  }
  function tableChrome(slide, sr) {
    const t = $('.sc-table', slide); const th = $$('th', t); const row = $$('tbody tr', t)[1]; const c = th[2].getBoundingClientRect(); const rr = row.getBoundingClientRect(); const tr = t.getBoundingClientRect();
    const mk = (cls, css, html, tip) => { const d = document.createElement('div'); d.className = 'tchrome ' + cls; d.innerHTML = html || ''; if (tip) d.dataset.tip = tip; Object.assign(d.style, { position: 'absolute', ...css }); slide.appendChild(d); return d; };
    const handle = 'background:var(--color-bg);border:1px solid var(--color-border);border-radius:5px;box-shadow:var(--elevation-100);display:flex;align-items:center;justify-content:center;color:var(--color-icon-secondary);pointer-events:auto;cursor:grab';
    mk('', { left: c.left - sr.left + c.width / 2 - 11 + 'px', top: tr.top - sr.top - 18 + 'px', width: '22px', height: '14px', cssText: '' }, ic('dots-three'), 'Column options').setAttribute('style', `position:absolute;left:${c.left - sr.left + c.width / 2 - 11}px;top:${tr.top - sr.top - 18}px;width:22px;height:14px;${handle}`);
    mk('', {}, ic('dots-three-vertical'), 'Row options').setAttribute('style', `position:absolute;left:${tr.left - sr.left - 18}px;top:${rr.top - sr.top + rr.height / 2 - 11}px;width:14px;height:22px;${handle}`);
    mk('', {}, ic('plus'), 'Insert column after').setAttribute('style', `position:absolute;left:${c.right - sr.left - 9}px;top:${tr.top - sr.top - 9}px;width:18px;height:18px;border-radius:9px;background:#0D99FF;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;pointer-events:auto`);
    mk('', {}, ic('plus'), 'Add row').setAttribute('style', `position:absolute;left:${tr.left - sr.left + tr.width / 2 - 10}px;top:${tr.bottom - sr.top + 8}px;width:20px;height:20px;border-radius:5px;${handle};color:var(--color-icon)`);
  }
  addEventListener('resize', () => { if (UI.S.view === 'editor') layout(); });

  /* ---------- menus & popovers ---------- */
  let pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(anchor, html) {
    closePop(); closeMenu(); pop = document.createElement('div'); pop.className = 'pop open'; pop.innerHTML = html; document.body.appendChild(pop);
    const r = anchor.getBoundingClientRect(); const pw = pop.offsetWidth, ph = pop.offsetHeight; let top = r.bottom + 8; if (top + ph > innerHeight - 8) top = Math.max(8, r.top - 8 - ph);
    pop.style.top = top + 'px'; pop.style.left = Math.max(8, Math.min(r.left + r.width / 2 - pw / 2, innerWidth - pw - 8)) + 'px'; return pop;
  }
  document.addEventListener('mousedown', e => { if (pop && !pop.contains(e.target) && !e.target.closest('[data-pop]')) closePop(); });
  const colorPop = a => openPop(a, `<div class="pt">Theme Colors</div><div class="sw-grid">${['#0D99FF', '#0768CF', '#80CAFF', '#9747FF', '#14AE5C', '#FFCD29', '#F24822', '#1E1E1E', '#757575', '#FFFFFF'].map((c, i) => `<button style="background:${c}" class="${i === 0 ? 'on' : ''}" aria-label="${c}"></button>`).join('')}<button style="background:var(--color-bg-secondary);display:flex;align-items:center;justify-content:center" aria-label="Custom color">${ic('plus')}</button></div><button class="btn sm secondary" style="width:100%;margin-top:12px">Reset to default</button>`);
  const linkPop = a => openPop(a, `<div style="display:flex;gap:8px;align-items:center"><button class="selectbox"><span>URL</span><span class="ico24">${ic('caret-down')}</span></button><div class="field" style="width:240px"><input placeholder="Enter URL"></div><button class="ibtn" data-tip="Update">${ic('check')}</button><button class="ibtn" data-tip="Delete">${ic('trash')}</button></div>`);
  const ddMenus = {
    align: a => openMenu(a, [['Left', 'text-align-left'], ['Center', 'text-align-center'], ['Right', 'text-align-right'], ['Justify', 'text-align-justify']].map((x, i) => ({ label: x[0], icon: x[1], sc: i === 0 ? '✓' : '' })), { width: 160 }),
    add: a => openMenu(a, [{ section: 'Title parts' }, { label: 'Graphic', icon: 'image', sc: 'Add' }, { label: 'Label', icon: 'tag', sc: 'Remove' }, { label: 'Subtitle', icon: 'text-t', sc: 'Remove' }, { label: 'CTA button', icon: 'cursor-click', sc: 'Add' }], { width: 224 }),
    points: a => openMenu(a, ['3 points', '4 points', '5 points', '6 points'].map((x, i) => ({ label: x, check: i === 1 })), { width: 180 }),
    ttype: a => openMenu(a, ['Text', 'Number', 'Currency', 'Percent', 'Rating'].map((x, i) => ({ label: x, check: i === 0 })), { width: 180 }),
    ltype: a => openMenu(a, ['Wordmark', 'Icon', 'Dark', 'Light', 'Grayscale'].map((x, i) => ({ label: x, check: i === 0 })), { width: 180 }),
    step: a => { const v = (TP[E.sel] || { size: 40 }).size; openMenu(a, [...new Set([8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128, 240, v])].sort((x, y) => x - y).map(x => ({ label: String(x), check: x === v })), { width: 102 }); },
    tstyle: a => { const t = TP[E.sel] || TP.text; openMenu(a, (t.title ? ['Huge', 'Extra large', 'Large', 'Medium', 'Small'] : ['Large', 'Medium', 'Small', 'Caption']).map(x => ({ label: x, check: x === t.style })), { width: 180 }); },
    cols: a => openMenu(a, ['1 column', '2 columns', '3 columns', '4 columns'].map((x, i) => ({ label: x, check: i === 0 })), { width: 180 }) };
  const insertMenu = a => openMenu(a, [{ section: 'Slide' }, { label: 'Insert with a prompt', icon: 'sparkle', brand: true }, { label: 'Insert from template', icon: 'stack' }, { section: 'On this slide' },
    ...[['Text', 'text-t'], ['List', 'list-bullets'], ['Diagram', 'funnel-simple'], ['Chart', 'chart-pie'], ['Concept', 'circles-three'], ['Media', 'image'], ['People', 'users'], ['Quote', 'quotes']].map(x => ({ label: x[0], icon: x[1] }))], { width: 256, dir: 'up' });
  const slideMore = a => openMenu(a, [{ label: 'Duplicate slide', icon: 'copy' }, { label: 'Add slide below', icon: 'plus' }, { label: 'Move up', icon: 'arrow-up' }, { label: 'Move down', icon: 'arrow-down' }, { sep: 1 }, { label: 'Slide colors', icon: 'paint-brush' }, { label: 'Add sticker', icon: 'smiley' }, { label: 'Speaker notes', icon: 'note', onClick: () => setPanel('notes') }, { sep: 1 }, { label: 'Delete slide', icon: 'trash', danger: true }], { width: 224, dir: 'up' });
  const aiBar = a => openMenu(a, [{ section: 'Writing' }, ...[['Improve writing', 'magic-wand'], ['Expand text', 'arrows-out-simple'], ['Make shorter', 'arrows-in-simple'], ['Simplify language', 'text-aa'], ['Adjust tone', 'microphone'], ['Rewrite text', 'pencil-simple-line'], ['Generate speaker notes', 'note']].map(x => ({ label: x[0], icon: x[1] })),
    { section: 'Design' }, ...[['Redesign slide', 'sparkle'], ['Split into 2 slides', 'columns'], ['Redesign Chart', 'chart-bar'], ['Change layout', 'layout']].map(x => ({ label: x[0], icon: x[1] })), { html: `<div class="msearch aim">${ic('magnifying-glass')}<input placeholder="Search AI action"></div>` }],
    { width: 300, dir: 'up', head: `<div class="aih t9s"><span>This slide</span><span style="text-transform:none;font:var(--text-body-small)">5 credits each</span></div>` });
  const topMore = a => openMenu(a, [{ label: 'Presentation settings', icon: 'sliders-horizontal', desc: 'Logo, animations and footer settings' }, { sep: 1 }, { label: 'Refresh Data', icon: 'arrows-clockwise' }, { label: 'Refresh Summary', icon: 'article' }, { label: 'Analytics', icon: 'chart-line-up', badge: 'Pro' }, { sep: 1 },
    { label: 'Meet and present', icon: 'video-camera', badge: 'Pro' }, { label: 'Duplicate presentation', icon: 'copy' }, { label: 'Add to favourites', icon: 'star' }, { label: 'Move to project or folder', icon: 'folder-simple' }, { sep: 1 }, { label: 'Delete presentation', icon: 'trash', danger: true }], { width: 256, align: 'end' });
  const presentMenu = a => openMenu(a, [{ label: 'From current slide', icon: 'play' }, { label: 'From beginning', icon: 'skip-back' }, { label: 'Without animation', icon: 'lightning' }], { width: 224, align: 'end' });
  const newSlideMenu = a => openMenu(a, [{ label: 'New slide with a prompt', icon: 'sparkle', brand: true }, { label: 'New slide from template', icon: 'squares-four' }], { width: 224 });
  const railMenu = a => { a.scrollIntoView({ block: 'nearest' }); openMenu(a, [{ section: 'Slide' }, { label: 'New slide', icon: 'plus' }, { label: 'Remix', icon: 'sparkle' }, { sep: 1 }, { label: 'Cut', icon: 'scissors', sc: '⌘X' }, { label: 'Copy', icon: 'copy', sc: '⌘C' }, { label: 'Paste', icon: 'clipboard', sc: '⌘V' }, { sep: 1 }, { label: 'Duplicate slide', icon: 'copy-simple' }, { label: 'Delete slide', icon: 'trash', danger: true }], { width: 220, noToggle: true }); };

  function setPanel(p) { E.panel = E.panel === p ? null : p; render(); }
  function wire() {
    $('#homeBtn', root).addEventListener('click', () => { UI.S.state = ''; UI.setView('dashboard'); UI.runState('db-home'); });
    $('#eTheme', root).addEventListener('click', () => UI.setTheme(UI.S.theme === 'dark' ? 'light' : 'dark'));
    $('#eMore', root).addEventListener('click', e => topMore(e.currentTarget));
    $('#ePresent', root).addEventListener('click', e => presentMenu(e.currentTarget));
    $('#eShare', root).addEventListener('click', () => UI.openShare('share', E.title));
    $('#newSlide', root).addEventListener('click', e => newSlideMenu(e.currentTarget));
    $$('.addbtw button', root).forEach(b => b.addEventListener('click', e => newSlideMenu(e.currentTarget)));
    const toSlide = n => { if (n < 1 || n > N) return; E.slide = n; E.sel = 'none'; E.panel = E.panel === 'textprops' ? null : E.panel; render(); const on = $('.srow2.on', root); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' }); };
    $('#prevSlide', root).addEventListener('click', () => toSlide(E.slide - 1)); $('#nextSlide', root).addEventListener('click', () => toSlide(E.slide + 1));
    $$('.srow2 .pv', root).forEach(p => { p.addEventListener('click', () => toSlide(+p.parentElement.dataset.n)); p.addEventListener('contextmenu', e => { e.preventDefault(); railMenu(p); }); });
    $('#bInsert', root).addEventListener('click', e => insertMenu(e.currentTarget));
    $('#bStyle', root).addEventListener('click', () => setPanel('style'));
    $('#bAi', root).addEventListener('click', e => aiBar(e.currentTarget));
    $('#bMore', root).addEventListener('click', e => slideMore(e.currentTarget));
    $$('[data-close]', root).forEach(b => b.addEventListener('click', () => { E.panel = null; render(); }));
    $$('#fslot [data-dd]', root).forEach(b => b.addEventListener('click', () => ddMenus[b.dataset.dd](b)));
    $$('#fslot [data-fi="step"]', root).forEach(b => b.addEventListener('click', () => ddMenus.step(b)));
    $$('#fslot [data-pop="color"]', root).forEach(b => b.addEventListener('click', () => colorPop(b)));
    $$('#fslot [data-pop="link"]', root).forEach(b => b.addEventListener('click', () => linkPop(b)));
    $$('#fslot [data-act="textprops"]', root).forEach(b => b.addEventListener('click', () => setPanel('textprops')));
    const slide = $('#slide', root);
    slide.addEventListener('click', e => {
      if (e.target.closest('.tchrome') || e.target.closest('[contenteditable="true"]')) return;
      const t = e.target.closest('[data-sel]');
      if (t && t.dataset.sel === E.sel && TP[E.sel] && E.slide === 1) return editText(t); /* click a selected text box again (or double-click) to type */
      E.sel = t ? t.dataset.sel : 'bg'; render(); });
  }
  /* Text edit mode (SlideEditor.jsx): caret in the box; drag button hides; title keeps its corner handles. Esc leaves it. */
  function editText(el) {
    el.setAttribute('contenteditable', 'true'); el.focus(); drawSel();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePop(); if (UI.S.view === 'editor' && $('#slide [contenteditable="true"]', root)) render(); } });
  UI.onChange(k => { if (k === 'view' && UI.S.view === 'editor') requestAnimationFrame(layout); if (k === 'view' && UI.S.view !== 'editor') closePop(); });

  const go = (sel, panel = null, after) => { closePop(); E.sel = sel; E.slide = SEL_SLIDE[sel] || 1; E.panel = panel; render(); if (after) requestAnimationFrame(() => requestAnimationFrame(after)); };
  const q = s => $(s, root);
  UI.registerStates('editor', [
    { id: 'ed-default', label: 'Editor, nothing selected', run: () => go('none') },
    { id: 'ed-text', label: 'Floater: text selected', run: () => go('text') },
    { id: 'ed-text-color', label: 'Floater: text, Font Color', run: () => go('text', null, () => colorPop(q('[data-pop="color"]'))) },
    { id: 'ed-text-align', label: 'Floater: text, Alignment', run: () => go('text', null, () => ddMenus.align(q('[data-dd="align"]'))) },
    { id: 'ed-text-add', label: 'Floater: text, Add title parts', run: () => go('text', null, () => ddMenus.add(q('[data-dd="add"]'))) },
    { id: 'ed-textprops', label: 'Panel: Text properties', run: () => go('text', 'textprops') },
    { id: 'ed-range', label: 'Floater: text range', run: () => go('range') },
    { id: 'ed-range-link', label: 'Floater: text range, link', run: () => go('range', null, () => linkPop(q('[data-pop="link"]'))) },
    { id: 'ed-chart', label: 'Floater: chart', run: () => go('chart') },
    { id: 'ed-chart-add', label: 'Floater: chart, Add Point', run: () => go('chart', null, () => ddMenus.points(q('[data-dd="points"]'))) },
    { id: 'ed-table', label: 'Floater: table with handles', run: () => go('table') },
    { id: 'ed-node', label: 'Floater: diagram node', run: () => go('node') },
    { id: 'ed-image', label: 'Floater: image', run: () => go('image') },
    { id: 'ed-logo', label: 'Floater: logo grid', run: () => go('logo') },
    { id: 'ed-logo-type', label: 'Floater: logo grid, Type', run: () => go('logo', null, () => ddMenus.ltype(q('[data-dd="ltype"]'))) },
    { id: 'ed-bg', label: 'Floater: slide background', run: () => go('bg') },
    { id: 'ed-insert', label: 'Bottom bar: Insert', run: () => go('none', null, () => insertMenu(q('#bInsert'))) },
    { id: 'ed-ai', label: 'Bottom bar: Edit with AI', run: () => go('none', null, () => aiBar(q('#bAi'))) },
    { id: 'ed-more', label: 'Bottom bar: slide More actions', run: () => go('none', null, () => slideMore(q('#bMore'))) },
    { id: 'ed-style', label: 'Panel: Style', run: () => go('none', 'style') },
    { id: 'ed-notes', label: 'Panel: Speaker notes', run: () => go('none', 'notes') },
    { id: 'ed-topmore', label: 'Top bar: More actions', run: () => go('none', null, () => topMore(q('#eMore'))) },
    { id: 'ed-present', label: 'Top bar: Present', run: () => go('none', null, () => presentMenu(q('#ePresent'))) },
    { id: 'ed-newslide', label: 'Rail: New slide', run: () => go('none', null, () => newSlideMenu(q('#newSlide'))) },
    { id: 'ed-railmenu', label: 'Rail: right-click menu', run: () => go('none', null, () => railMenu(q('.srow2.on .pv'))) },
    { id: 'ed-share', label: 'Share: Share externally', run: () => { go('none'); UI.openShare('share', E.title); } },
    { id: 'ed-share-live', label: 'Share: live link + Advanced settings', run: () => { go('none'); UI.openShare('share', E.title, { live: true, adv: true }); } },
    { id: 'ed-share-li', label: 'Share: LinkedIn menu', run: () => { go('none'); UI.openShare('share', E.title, { live: true, li: true }); } },
    { id: 'ed-unpublish', label: 'Share: unpublish confirm', run: () => { go('none'); UI.openShare('share', E.title, { live: true, unpub: true }); } },
    { id: 'ed-share-invite', label: 'Share: Invite to collaborate', run: () => { go('none'); UI.openShare('invite', E.title); } },
    { id: 'ed-share-invite-edit', label: 'Share: Invite, Can edit hint', run: () => { go('none'); UI.openShare('invite', E.title, { role: 'Can edit' }); } },
    { id: 'ed-share-export', label: 'Share: Export to PowerPoint', run: () => { go('none'); UI.openShare('export', E.title); } }]);
  render();
  UI.boot();
})();
