/**
 * Drives T1/T2/T3 against the harness, BOTH without and with the glue.
 * Every number reported here is measured from the live DOM, never asserted.
 *
 *   node run-tests.js [port]
 */
const { chromium } = require('playwright');
const PORT = Number(process.argv[2] || 8961);
const BASE = `http://localhost:${PORT}`;
const results = [];

const url = (path, glue) => `${BASE}${path}${glue ? '?glue=1' : ''}`;

// --------------------------------------------------------------- helpers

async function boot(page, path, glue) {
  await page.goto(url(path, glue), { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  await page.waitForSelector('[data-agentation-root]', { timeout: 20000 });
  // Keep the toolbar above the tools panel.
  await page.evaluate(() => {
    const p = [...document.querySelectorAll('body > div')].pop();
    if (p) { p.style.position = 'relative'; p.style.zIndex = '2147483647'; }
  });
  await page.waitForTimeout(400);
}

async function enterFeedbackMode(page) {
  await page.locator('[class*="toolbarContainer"]').first().click({ force: true });
  await page.waitForTimeout(500);
}

/** Annotate the element matching `sel` by clicking its centre. */
async function annotate(page, sel, text) {
  const box = await page.locator(sel).first().boundingBox();
  if (!box) throw new Error('no box for ' + sel);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const ta = page.locator('textarea[placeholder*="change"]');
  await ta.waitFor({ timeout: 8000 });
  await ta.fill(text);
  await page.locator('button:has-text("Add")').last().click({ force: true });
  await page.waitForTimeout(700);
  return box;
}

const storage = (page) => page.evaluate(() =>
  Object.fromEntries(Object.entries(localStorage)
    .filter(([k]) => k.startsWith('feedback-annotations-') || k.startsWith('agentation-glue-orphans-'))
    .map(([k, v]) => [k, JSON.parse(v)])));

/** Measure every rendered marker's centre from the real DOM. */
const markerRects = (page) => page.evaluate(() => {
  const layers = document.querySelectorAll('[class*="arkersLayer"]');
  const out = [];
  layers.forEach((layer) => {
    layer.querySelectorAll('[data-annotation-marker]').forEach((m) => {
      const r = m.getBoundingClientRect();
      out.push({
        label: (m.textContent || '').trim(),
        cx: +(r.left + r.width / 2).toFixed(1),
        cy: +(r.top + r.height / 2).toFixed(1),
        layer: layer.className.includes('fixed') ? 'fixed' : 'absolute',
      });
    });
  });
  return out;
});

const elemRect = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { cx: +(r.left + r.width / 2).toFixed(1), cy: +(r.top + r.height / 2).toFixed(1),
           left: +r.left.toFixed(1), top: +r.top.toFixed(1),
           w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
}, sel);

const clearAll = (page) => page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

function rec(o) { results.push(o); console.log('  ->', JSON.stringify(o)); }

// ------------------------------------------------------------------ T1

async function T1(browser, glue) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await boot(page, '/a', glue);
  await clearAll(page);
  await page.reload(); await page.waitForFunction(() => window.__ready === true);
  await page.waitForSelector('[data-agentation-root]');
  await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });

  await enterFeedbackMode(page);
  await annotate(page, '[data-ref="hero-cta"]', 'note on route A');

  const hop = async (path, sel, text) => {
    await page.evaluate((p) => window.__go(p), path);
    await page.waitForTimeout(900);
    if (glue) await page.evaluate(() => window.__glue.settled());
    await page.waitForTimeout(400);
    await enterFeedbackMode(page).catch(() => {});
    await annotate(page, sel, text);
  };
  await hop('/b', '[data-ref="pricing-box"]', 'note on route B');
  await hop('/c', '[data-ref="footer-link"]', 'note on route C');
  // return to /a — must not pick up C's annotation
  await page.evaluate(() => window.__go('/a'));
  await page.waitForTimeout(900);
  if (glue) await page.evaluate(() => window.__glue.settled());
  await page.waitForTimeout(500);

  const s = await storage(page);
  const g = (k) => (s['feedback-annotations-' + k] || []).map((x) => x.comment);
  const a = g('/a'), b = g('/b'), c = g('/c');
  const ok = (arr, letter) => arr.length === 1 && arr[0] === 'note on route ' + letter;
  rec({ test: 'T1', glue, key_a: a, key_b: b, key_c: c,
        counts: { a: a.length, b: b.length, c: c.length },
        pass: ok(a, 'A') && ok(b, 'B') && ok(c, 'C') });
  await ctx.close();
}

// ------------------------------------------------------------------ T2

const MUTATIONS = ['move', 'wrap', 'rename'];

async function T2(browser, glue, mutation) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await boot(page, '/a', glue);
  await clearAll(page);
  await page.reload(); await page.waitForFunction(() => window.__ready === true);
  await page.waitForSelector('[data-agentation-root]');
  await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });

  await enterFeedbackMode(page);
  await annotate(page, '[data-ref="hero-cta"]', 'watch this element');

  const before = {
    element: await elemRect(page, '[data-ref="hero-cta"]'),
    marker: (await markerRects(page))[0] || null,
  };

  // Apply exactly ONE mutation, then reload so agentation re-reads storage.
  await page.evaluate((m) => window.__addMutation(m), mutation);
  await page.waitForTimeout(200);
  await page.reload();
  await page.waitForFunction(() => window.__ready === true);
  await page.waitForSelector('[data-agentation-root]');
  if (glue) await page.evaluate(() => window.__glue.settled());
  await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });
  await page.waitForTimeout(400);
  await enterFeedbackMode(page);          // markers only render while isActive
  await page.waitForTimeout(700);

  const selectorsStillResolve = await page.evaluate(() => {
    const a = (JSON.parse(localStorage.getItem('feedback-annotations-/a') || '[]'))[0];
    if (!a) return null;
    const t = (sel) => { try { return sel ? !!document.querySelector(sel) : null; } catch { return 'invalid'; } };
    return { elementPath: a.elementPath, elementPath_resolves: t(a.elementPath),
             fullPath_resolves: t(a.fullPath), glueRef: a.glueRef ?? null };
  });
  const reanchorLog = glue
    ? await page.evaluate(() => window.__glue.log().filter((e) => e.ev === 'reanchor').pop())
    : null;
  const elAfter = await elemRect(page, '[data-ref="hero-cta"]');
  const mAfter = (await markerRects(page))[0] || null;
  const dx = elAfter && mAfter ? +(mAfter.cx - elAfter.cx).toFixed(1) : null;
  const dy = elAfter && mAfter ? +(mAfter.cy - elAfter.cy).toFixed(1) : null;
  const dist = dx === null ? null : +Math.hypot(dx, dy).toFixed(1);

  rec({ test: 'T2', mutation, glue,
        element_before: before.element, marker_before: before.marker,
        element_after: elAfter, marker_after: mAfter,
        dx, dy, offset_px: dist, selectorsStillResolve, reanchorLog,
        pass: dist !== null && dist <= 5 });
  await ctx.close();
}

// ------------------------------------------------------------------ T3

async function T3(browser, glue) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await boot(page, '/a', glue);
  await clearAll(page);
  await page.reload(); await page.waitForFunction(() => window.__ready === true);
  await page.waitForSelector('[data-agentation-root]');
  await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });

  await enterFeedbackMode(page);
  await annotate(page, '[data-ref="hero-cta"]', 'anchor about to vanish');

  // Delete the data-ref AND move the element, so a stale marker would be
  // visibly wrong rather than coincidentally right.
  await page.evaluate(() => { window.__addMutation('move'); window.__addMutation('delref'); });
  await page.waitForTimeout(200);
  await page.reload();
  await page.waitForFunction(() => window.__ready === true);
  await page.waitForSelector('[data-agentation-root]');
  if (glue) await page.evaluate(() => window.__glue.settled());
  await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });
  await page.waitForTimeout(400);
  await enterFeedbackMode(page);          // markers only render while isActive
  await page.waitForTimeout(700);

  const markers = await markerRects(page);
  const el = await elemRect(page, '#el-hero');
  const orphans = glue ? await page.evaluate(() => window.__glue.listOrphans('/a')) : [];
  const banner = await page.evaluate(() => {
    const b = document.getElementById('agentation-glue-orphan-banner');
    return b ? { count: +b.dataset.orphanCount, text: b.textContent.slice(0, 90) } : null;
  });
  const stale = markers[0] && el
    ? +Math.hypot(markers[0].cx - el.cx, markers[0].cy - el.cy).toFixed(1) : null;

  rec({ test: 'T3', glue,
        markers_drawn: markers.length,
        marker: markers[0] || null, element_now: el,
        stale_offset_px: stale,
        orphans_listed: orphans.length,
        orphan_reason: orphans[0] ? orphans[0].orphanReason : null,
        banner,
        pass: glue ? (markers.length === 0 && orphans.length === 1 && !!banner)
                   : undefined });
  await ctx.close();
}

// ----------------------------------------------------------------- main

(async () => {
  const browser = await chromium.launch();
  for (const glue of [false, true]) {
    console.log(`\n===== ${glue ? 'WITH GLUE' : 'BASELINE (no glue)'} =====`);
    console.log('T1 route bleed');            await T1(browser, glue);
    for (const m of MUTATIONS) {
      console.log(`T2 misplacement [${m}]`);  await T2(browser, glue, m);
    }
    console.log('T3 orphan detection');       await T3(browser, glue);
  }
  await browser.close();
  require('fs').writeFileSync(__dirname + '/results.json', JSON.stringify(results, null, 2));
  console.log('\nwrote results.json');
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
