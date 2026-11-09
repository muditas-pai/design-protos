/* Core: URL state, theme, menus, tooltips, modal, toast, state picker. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ic = (n, cls = '') => `<i class="ph-light ph-${n} ${cls}"></i>`;
  const icf = (n, cls = '') => `<i class="ph-fill ph-${n} ${cls}"></i>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const params = new URLSearchParams(location.search);
  const pv = params.get('view'), pt = params.get('theme');
  const VIEWS = ['dashboard', 'create', 'editor', 'settings', 'pricing'];
  const S = { view: VIEWS.includes(pv) ? pv : 'dashboard', theme: pt === 'dark' ? 'dark' : 'light', state: params.get('state') || '' };
  const listeners = [];
  function syncUrl() {
    const p = new URLSearchParams(); p.set('view', S.view); p.set('theme', S.theme); if (S.state) p.set('state', S.state);
    const hp = new URLSearchParams(location.search).get('hero'); if (hp) p.set('hero', hp); /* Home top section option (hero-options.js) */
    history.replaceState(null, '', '?' + p.toString());
  }
  function setTheme(t) {
    S.theme = t; document.documentElement.setAttribute('data-preferred-theme', t);
    $$('[data-ctl="theme"] button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === t));
    $$('[data-theme-label]').forEach(el => el.textContent = t === 'dark' ? 'Dark' : 'Light');
    $$('[data-theme-icon]').forEach(el => el.className = 'ph-light ' + (t === 'dark' ? 'ph-sun' : 'ph-moon'));
    syncUrl(); listeners.forEach(f => f('theme'));
  }
  function setView(v) {
    S.view = v; $$('.app').forEach(a => a.classList.toggle('on', a.dataset.view === v));
    $$('[data-ctl="view"] button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
    closeMenu(); fillStates(); syncUrl(); listeners.forEach(f => f('view'));
  }

  /* ---------- Menu ---------- */
  const menu = $('#menu'); let menuAnchor = null, menuDir = null, menuOpts = null;
  function renderItems(items) {
    return items.map((it, i) => {
      if (it.sep) return '<div class="msep"></div>';
      if (it.section) return `<div class="mlabel">${esc(it.section)}</div>`;
      if (it.html) return it.html;
      const lead = it.check !== undefined ? `<span class="chk">${it.check ? ic('check') : ''}</span>` : `<span class="lead">${it.icon ? ic(it.icon) : ''}</span>`;
      const cls = ['mi', it.danger ? 'danger' : '', it.brand ? 'brand' : '', it.desc ? 'tall' : ''].join(' ');
      const body = it.desc ? `<span><span>${esc(it.label)}</span>${it.badge ? `<span class="badge pro">${esc(it.badge)}</span>` : ''}<span class="desc t9">${esc(it.desc)}</span></span>` : `<span>${esc(it.label)}</span>${it.badge ? `<span class="badge pro">${esc(it.badge)}</span>` : ''}`;
      return `<button class="${cls}" role="menuitem" data-i="${i}" ${it.disabled ? 'aria-disabled="true"' : ''}>${lead}${body}${it.sc ? `<span class="sc">${esc(it.sc)}</span>` : ''}</button>`;
    }).join('');
  }
  function placeMenu() {
    if (!menuAnchor || !menu.classList.contains('open')) return;
    const r = menuAnchor.getBoundingClientRect(); const vw = innerWidth, vh = innerHeight, gap = 4, pad = 8;
    menu.style.maxHeight = ''; const mh = menu.scrollHeight, mw = menu.offsetWidth;
    const below = vh - r.bottom - gap - pad, above = r.top - gap - pad;
    if (!menuDir) menuDir = (mh <= below || below >= above) ? 'down' : 'up';
    const avail = menuDir === 'down' ? below : above; const h = Math.min(mh, avail);
    menu.style.maxHeight = h + 'px';
    menu.style.top = (menuDir === 'down' ? r.bottom + gap : r.top - gap - h) + 'px';
    let left = menuOpts.align === 'end' ? r.right - mw : r.left + (menuOpts.offsetX || 0);
    if (menuOpts.over) { left = r.left - 8; }
    left = Math.max(pad, Math.min(left, vw - mw - pad)); menu.style.left = left + 'px';
  }
  function openMenu(anchor, items, opts = {}) {
    if (!opts.noToggle && menuAnchor === anchor && menu.classList.contains('open')) { closeMenu(); return; }
    closeMenu(); menuAnchor = anchor; menuOpts = opts; menuDir = opts.dir || null;
    menu.style.width = opts.width ? opts.width + 'px' : ''; menu.style.minWidth = opts.width ? opts.width + 'px' : '';
    menu.innerHTML = (opts.head || '') + renderItems(items);
    menu.classList.add('open'); anchor.setAttribute('aria-expanded', 'true'); placeMenu();
    $$('.mi[data-i]', menu).forEach(b => b.addEventListener('click', e => { const it = items[+b.dataset.i]; closeMenu(); it && it.onClick && it.onClick(e); }));
    $$('.mi:not([data-i])', menu).forEach(b => b.addEventListener('click', () => closeMenu()));
    opts.onMount && opts.onMount(menu);
  }
  function closeMenu() { if (menuAnchor) menuAnchor.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); menuAnchor = null; menuDir = null; }
  document.addEventListener('mousedown', e => { if (menu.classList.contains('open') && !menu.contains(e.target) && !(menuAnchor && menuAnchor.contains(e.target))) closeMenu(); });
  addEventListener('resize', () => { placeMenu(); hideTip(); });
  addEventListener('scroll', e => { if (!menu.contains(e.target)) placeMenu(); }, true);

  /* ---------- Tooltip ---------- */
  const tip = $('#tip'); let tipT = 0;
  function showTip(el) {
    const t = el.dataset.tip; if (!t) return; tip.innerHTML = `<span>${esc(t)}</span>${el.dataset.sc ? `<span class="sc">${esc(el.dataset.sc)}</span>` : ''}`;
    tip.classList.add('open'); const r = el.getBoundingClientRect(); const tw = tip.offsetWidth, th = tip.offsetHeight;
    let top = r.top - 6 - th, below = false; if (top < 8) { top = r.bottom + 6; below = true; }
    tip.classList.toggle('below', below); tip.style.top = top + 'px';
    tip.style.left = Math.max(8, Math.min(r.left + r.width / 2 - tw / 2, innerWidth - tw - 8)) + 'px';
  }
  function hideTip() { clearTimeout(tipT); tip.classList.remove('open'); }
  document.addEventListener('mouseover', e => { const el = e.target.closest('[data-tip]'); if (!el) return; clearTimeout(tipT); tipT = setTimeout(() => showTip(el), 450); });
  document.addEventListener('mouseout', e => { if (e.target.closest('[data-tip]')) hideTip(); });
  document.addEventListener('mousedown', hideTip);

  /* ---------- Modal ---------- */
  const scrim = $('#scrim'), modal = $('#modal');
  function openModal(html, opts = {}) { delete modal.dataset.dismiss; modal.style.width = opts.width ? `min(${opts.width}px,100%)` : ''; modal.innerHTML = html; scrim.classList.add('open'); opts.onMount && opts.onMount(modal); }
  function closeModal() { scrim.classList.remove('open'); modal.innerHTML = ''; }
  scrim.addEventListener('mousedown', e => { if (e.target === scrim && modal.dataset.dismiss === 'backdrop') closeModal(); });

  /* ---------- Toast ---------- */
  const toastEl = $('#toast'); let toastT = 0;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('open'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('open'), 2200); }

  /* ---------- States (review bar picker) ---------- */
  const registry = {}; const sel = $('#stateSel');
  function registerStates(view, list) { registry[view] = list; if (S.view === view) fillStates(); }
  function fillStates() {
    const list = registry[S.view] || []; sel.innerHTML = list.map(s => `<option value="${s.id}">${esc(s.label)}</option>`).join('');
    if (S.state && list.find(s => s.id === S.state)) sel.value = S.state; else sel.value = list[0] ? list[0].id : '';
  }
  sel.addEventListener('change', () => { runState(sel.value); });
  $('#replayBtn').addEventListener('click', () => runState(sel.value));
  function runState(id) { const s = (registry[S.view] || []).find(x => x.id === id); if (!s) return; closeMenu(); closeModal(); S.state = id; syncUrl(); s.run(); }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const hadMenu = menu.classList.contains('open'); closeMenu(); hideTip(); if (!hadMenu && modal.dataset.dismiss === 'backdrop') closeModal(); } });
  $$('[data-ctl="view"] button').forEach(b => b.addEventListener('click', () => { S.state = ''; setView(b.dataset.v); runFirst(); }));
  $$('[data-ctl="theme"] button').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.v)));
  function runFirst() { const list = registry[S.view] || []; if (list[0]) runState(list[0].id); }

  window.UI = { $, $$, ic, icf, esc, S, setTheme, setView, openMenu, closeMenu, placeMenu, openModal, closeModal, toast, registerStates, runState, onChange: f => listeners.push(f),
    boot() { setTheme(S.theme); setView(S.view); if (S.state && (registry[S.view] || []).find(x => x.id === S.state)) runState(S.state); else runFirst(); } };
})();
