/* Verification harness for the baby-PAI spike.
   Run:  cd $PAI_DESIGN/baby-pai && npx playwright test --help >/dev/null
         node _verify.mjs
   Requires a python http.server on 8917 rooted at the PAI-design repo root. */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:8917/baby-pai/';
const SHOTS = './screenshots';
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
function ok(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : ''));
}

const browser = await chromium.launch();

async function page(width = 1440) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light' });
  const p = await ctx.newPage();
  const errs = [], reqfail = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('requestfailed', r => reqfail.push(r.url() + ' :: ' + (r.failure()?.errorText || '')));
  p.on('response', r => { if (r.status() >= 400) reqfail.push(r.status() + ' ' + r.url()); });
  return { p, ctx, errs, reqfail };
}

async function boot(p, url) {
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.dataset.baby === 'ready', null, { timeout: 10000 });
  await p.waitForFunction(() => !!document.querySelector('.bp-slot iframe'), null, { timeout: 10000 });
  const f = p.frames().find(f => f.url().includes('/surfaces/') || f.url().includes('/explorations/'));
  if (f) await f.waitForLoadState('domcontentloaded');
  await p.waitForTimeout(1200);   // agentation + fonts
}

/* ── 1. credits-exhausted ────────────────────────────────────────────── */
{
  const { p, ctx, errs, reqfail } = await page();
  await boot(p, BASE + 'index.html?state=credits-exhausted');

  const ds = await p.evaluate(() => ({ ...document.body.dataset }));
  ok('cx: buckets', ds.state === 'error' && ds.plan === 'pro' && ds.docs === 'many'
    && ds.credits === 'empty' && ds.seats === 'full' && ds.modal === 'upgrade-gold' && ds.place === 'app',
    JSON.stringify(ds));

  const paiCssApplied = await p.evaluate(() =>
    getComputedStyle(document.querySelector('.pai-badge[data-plan-is="pro"]')).borderRadius);
  ok('cx: pai.css is actually applied in the shell', paiCssApplied === '34px', 'badge radius=' + paiCssApplied);

  const chip = await p.textContent('#credits-chip');
  ok('cx: credit chip reads from state', /0 credits left/.test(chip.replace(/\s+/g, ' ')), chip.trim());

  const dash = p.frames().find(f => f.url().includes('surfaces/dashboard.html'));
  ok('cx: dashboard surface mounted', !!dash, dash ? dash.url() : 'no frame');
  const cards = await dash.locator('.card[data-row]').count();
  ok('cx: 24 deck cards rendered from fixtures', cards === 24, 'cards=' + cards);
  const dashCssOk = await dash.evaluate(() => getComputedStyle(document.body).backgroundColor);
  ok('cx: surface picked up pai.css tokens', dashCssOk === 'rgb(255, 255, 255)', dashCssOk);

  const modal = p.frames().find(f => f.url().includes('protos/upgrade-gold.html'));
  ok('cx: modal proto mounted as overlay', !!modal, modal ? modal.url() : 'no frame');
  const modalVisible = await p.locator('[data-slot="overlay"] iframe').isVisible();
  ok('cx: overlay layer visible above the shell', modalVisible);
  const dialogBox = await modal.locator('#dialog').boundingBox();
  ok('cx: modal dialog has real geometry', dialogBox && dialogBox.width > 300, JSON.stringify(dialogBox));

  await p.screenshot({ path: SHOTS + '/credits-exhausted@1440.png' });
  ok('cx: console clean', errs.length === 0, errs.join(' | '));
  ok('cx: no failed requests', reqfail.length === 0, reqfail.join(' | '));

  /* --- the thing a lone file cannot be judged on: what happens after dismiss */
  await modal.locator('#not-now').click();
  await p.waitForTimeout(400);
  const afterDismiss = await p.evaluate(() => ({
    overlayHidden: document.querySelector('[data-slot="overlay"]').hidden,
    modalKey: document.body.dataset.modal,
    dashStillThere: !!document.querySelector('.bp-slot iframe')
  }));
  ok('cx: dismiss reveals a LIVE dashboard behind',
    afterDismiss.overlayHidden === true && afterDismiss.modalKey === undefined && afterDismiss.dashStillThere,
    JSON.stringify(afterDismiss));
  await p.screenshot({ path: SHOTS + '/credits-exhausted-dismissed@1440.png' });

  /* --- reach: the credit chip is a REAL entry point back into the modal */
  await p.click('#credits-chip');
  await p.waitForTimeout(600);
  const reopened = p.frames().find(f => f.url().includes('protos/upgrade-gold.html'));
  ok('cx: reach — credit chip re-opens the modal (real click path)', !!reopened);

  /* --- primary action changes the world: plan -> gold, credits refilled */
  await reopened.locator('#go-gold').click();
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({
    plan: document.body.dataset.plan,
    credits: document.body.dataset.credits,
    chip: document.querySelector('#credits-chip').textContent.replace(/\s+/g, ' ').trim(),
    goldBadge: getComputedStyle(document.querySelector('[data-plan-is="gold"]')).display,
    proBadge: getComputedStyle(document.querySelector('[data-plan-is="pro"]')).display,
    upgradeBtn: getComputedStyle(document.querySelector('#topbar-upgrade')).display
  }));
  ok('cx: primary action patches the world (plan=gold, credits refilled, badge flips, CTA gone)',
    after.plan === 'gold' && after.credits === 'ok' && /4,500 credits left/.test(after.chip)
    && after.goldBadge !== 'none' && after.proBadge === 'none' && after.upgradeBtn === 'none',
    JSON.stringify(after));
  await p.screenshot({ path: SHOTS + '/credits-exhausted-upgraded@1440.png' });
  await ctx.close();
}

/* ── 2. empty ────────────────────────────────────────────────────────── */
{
  const { p, ctx, errs, reqfail } = await page();
  await boot(p, BASE + 'index.html?state=empty');
  const ds = await p.evaluate(() => ({ ...document.body.dataset }));
  ok('empty: buckets', ds.state === 'empty' && ds.plan === 'free' && ds.docs === 'none' && ds.team === 'solo',
    JSON.stringify(ds));
  const dash = p.frames().find(f => f.url().includes('surfaces/dashboard.html'));
  const emptyShown = await dash.locator('.empty').isVisible();
  const gridShown = await dash.locator('.files').isVisible();
  const rows = await dash.locator('.card[data-row]').count();
  ok('empty: empty state shown, grid hidden, 0 rows',
    emptyShown === true && gridShown === false && rows === 0,
    `empty=${emptyShown} files=${gridShown} rows=${rows}`);
  const upgradeVisible = await p.locator('#topbar-upgrade').isVisible();
  ok('empty: free plan still shows the Upgrade CTA', upgradeVisible);
  await p.screenshot({ path: SHOTS + '/empty@1440.png' });
  ok('empty: console clean', errs.length === 0, errs.join(' | '));
  ok('empty: no failed requests', reqfail.length === 0, reqfail.join(' | '));
  await ctx.close();
}

/* ── 3. trial-expiring (the OTHER place) ─────────────────────────────── */
{
  const { p, ctx, errs, reqfail } = await page();
  await boot(p, BASE + 'index.html?state=trial-expiring');
  const ds = await p.evaluate(() => ({ ...document.body.dataset }));
  ok('trial: buckets + place=editor', ds.state === 'default' && ds.trial === 'expiring'
    && ds.banner === 'trial-ending' && ds.place === 'editor' && ds.route === 'editor', JSON.stringify(ds));
  const editorVisible = await p.locator('.bp-editor').isVisible();
  const appVisible = await p.locator('.bp-app').isVisible();
  ok('trial: editor place shown, app place hidden', editorVisible === true && appVisible === false);
  const film = await p.locator('.bp-film-item[data-row]').count();
  const current = await p.locator('.bp-film-item[data-current]').count();
  ok('trial: filmstrip driven by state (8 slides, slide 3 focused)', film === 8 && current === 1, `film=${film} current=${current}`);
  const doc = await p.textContent('.bp-docname');
  ok('trial: doc name from fixtures', doc.trim() === 'Series B — Foursquare', doc.trim());
  const canvas = p.frames().find(f => f.url().includes('surfaces/deck-canvas.html'));
  ok('trial: second surface mounted in the second place', !!canvas, canvas ? canvas.url() : 'none');
  const bannerVis = await canvas.locator('.banner').isVisible();
  const bannerTxt = (await canvas.textContent('.banner')).replace(/\s+/g, ' ').trim();
  ok('trial: warning banner present, dated off the frozen clock',
    bannerVis && /2 days/.test(bannerTxt) && /30 Jul 2026/.test(bannerTxt), bannerTxt);
  const h1 = await canvas.textContent('h1');
  ok('trial: canvas shows the focused slide title', h1.trim() === 'Traction', h1.trim());
  await p.screenshot({ path: SHOTS + '/trial-expiring@1440.png' });
  ok('trial: console clean', errs.length === 0, errs.join(' | '));
  ok('trial: no failed requests', reqfail.length === 0, reqfail.join(' | '));
  await ctx.close();
}

/* ── 4. determinism ──────────────────────────────────────────────────── */
{
  const { p, ctx } = await page();
  const read = async () => {
    await boot(p, BASE + 'index.html?state=credits-exhausted');
    return p.evaluate(() => ({ now: Date.now(), r: [Math.random(), Math.random()] }));
  };
  const a = await read(), b = await read();
  ok('freeze: clock frozen + entropy seeded (identical across loads)',
    a.now === b.now && a.now === Date.parse('2026-07-28T09:00:00Z') && JSON.stringify(a.r) === JSON.stringify(b.r),
    JSON.stringify(a));
  await ctx.close();
}

/* ── 5. 390 viewport ─────────────────────────────────────────────────── */
{
  const { p, ctx, errs } = await page(390);
  await boot(p, BASE + 'index.html?state=credits-exhausted');
  const sidebar = await p.locator('.bp-sidebar').isVisible();
  const hScroll = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  ok('390: sidebar collapses, no horizontal scroll', sidebar === false && hScroll === false,
    `sidebar=${sidebar} hscroll=${hScroll}`);
  await p.screenshot({ path: SHOTS + '/credits-exhausted@390.png' });
  ok('390: console clean', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
{
  const { p, ctx } = await page(390);
  await boot(p, BASE + 'index.html?state=trial-expiring');
  await p.screenshot({ path: SHOTS + '/trial-expiring@390.png' });
  await ctx.close();
}
{
  const { p, ctx } = await page(390);
  await boot(p, BASE + 'index.html?state=empty');
  await p.screenshot({ path: SHOTS + '/empty@390.png' });
  await ctx.close();
}

/* ── 6. the mount contract: a REAL untouched file from PAI-design ─────── */
{
  const { p, ctx, errs } = await page();
  await p.goto(BASE + 'index.html?state=credits-exhausted&mount=slide-limit-crazy8s&overlay=none', { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.dataset.baby === 'ready', null, { timeout: 10000 });
  await p.waitForTimeout(2500);
  const ext = p.frames().find(f => f.url().includes('free-slide-limit-card'));
  ok('mount: an untouched real file from PAI-design mounts by relative path', !!ext,
    ext ? ext.url().replace(BASE, '') : 'no frame');
  const h = ext ? await ext.locator('body').boundingBox() : null;
  ok('mount: it actually rendered inside the chrome', !!h && h.height > 400, JSON.stringify(h));
  const shellStillPainted = await p.evaluate(() => document.body.dataset.credits);
  ok('mount: shell chrome still driven by the world around it', shellStillPainted === 'empty', shellStillPainted);
  await p.screenshot({ path: SHOTS + '/mount-external-untouched@1440.png' });
  await ctx.close();
}

/* ── 7. the proto is standalone: same bytes, opened directly ─────────── */
{
  const { p, ctx, errs } = await page();
  await p.goto(BASE + 'protos/upgrade-gold.html', { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const box = await p.locator('#dialog').boundingBox();
  ok('standalone: the modal proto works opened directly, no shell', !!box && box.width > 300, JSON.stringify(box));
  ok('standalone: console clean', errs.length === 0, errs.join(' | '));
  await p.screenshot({ path: SHOTS + '/proto-standalone@1440.png' });
  await ctx.close();
}

/* ── 8. legacy contract: an unknown scenario does not break anything ─── */
{
  const { p, ctx } = await page();
  await p.goto(BASE + 'surfaces/dashboard.html?state=does-not-exist', { waitUntil: 'load' });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => ({ baby: document.documentElement.dataset.baby, ds: { ...document.body.dataset } }));
  ok('legacy: unknown ?state= falls back to today\'s behaviour (body.dataset.state only)',
    r.baby === 'legacy' && r.ds.state === 'does-not-exist' && Object.keys(r.ds).length === 1,
    JSON.stringify(r));
  await ctx.close();
}

/* ── 9. agentation actually mounted ──────────────────────────────────── */
{
  const { p, ctx } = await page();
  await boot(p, BASE + 'index.html?state=credits-exhausted');
  await p.waitForTimeout(2500);
  /* agentation renders through a React portal appended to <body>, exactly as it
     does in the 103 files that already carry it — not into #agentation-root. */
  const agent = await p.evaluate(() => {
    const bar = document.querySelector('[data-agentation-toolbar]');
    return { rootPresent: !!document.getElementById('agentation-root'), toolbar: !!bar,
             cls: bar ? bar.className : '' };
  });
  ok('agentation: annotation toolbar mounted (portal, same as the other 103 files)',
     agent.rootPresent && agent.toolbar, JSON.stringify(agent));
  await ctx.close();
}

await browser.close();

const failed = results.filter(r => !r.pass);
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' checks passed');
if (failed.length) { console.log('FAILURES:\n' + failed.map(f => '  - ' + f.name + ' :: ' + f.detail).join('\n')); process.exit(1); }
