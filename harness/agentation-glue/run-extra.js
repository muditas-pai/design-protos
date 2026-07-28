// Supplementary: does the claimed coordinate model hold under scroll, and for
// position:fixed elements (the isFixed / fixedMarkersLayer branch)?
const { chromium } = require('playwright');
const PORT = Number(process.argv[2] || 8961);
const out = [];

const boot = async (page, glue) => {
  await page.goto(`http://localhost:${PORT}/a${glue ? '?glue=1' : ''}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  await page.waitForSelector('[data-agentation-root]');
  await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });
  await page.waitForTimeout(400);
};
const fm = async (page) => { await page.locator('[class*="toolbarContainer"]').first().click({force:true}); await page.waitForTimeout(500); };
const annotate = async (page, sel, text) => {
  const b = await page.locator(sel).first().boundingBox();
  await page.mouse.click(b.x + b.width/2, b.y + b.height/2);
  const ta = page.locator('textarea[placeholder*="change"]');
  await ta.waitFor({ timeout: 8000 }); await ta.fill(text);
  await page.locator('button:has-text("Add")').last().click({force:true});
  await page.waitForTimeout(700);
};
const markers = (page) => page.evaluate(() => [...document.querySelectorAll('[class*="arkersLayer"]')].flatMap(l =>
  [...l.querySelectorAll('[data-annotation-marker]')].map(m => { const r=m.getBoundingClientRect();
    return { label:(m.textContent||'').trim(), cx:+(r.left+r.width/2).toFixed(1), cy:+(r.top+r.height/2).toFixed(1),
             layer: l.className.includes('fixed')?'fixed':'absolute' }; })));
const er = (page, sel) => page.evaluate(s => { const e=document.querySelector(s); if(!e) return null;
  const r=e.getBoundingClientRect(); return {cx:+(r.left+r.width/2).toFixed(1), cy:+(r.top+r.height/2).toFixed(1)}; }, sel);
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('feedback-annotations-/a')||'[]'));

(async () => {
  const browser = await chromium.launch();

  // --- E1: annotate a DEEP element while scrolled, mutate, reload, re-measure
  for (const glue of [false, true]) {
    const ctx = await browser.newContext({ viewport:{width:1280,height:900} });
    const page = await ctx.newPage();
    await boot(page, glue);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload(); await page.waitForFunction(() => window.__ready === true);
    await page.waitForSelector('[data-agentation-root]');
    await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(400);
    await fm(page);
    await annotate(page, '[data-ref="deep-target"]', 'deep note while scrolled');
    const st = (await stored(page))[0];
    const scrollY = await page.evaluate(() => window.scrollY);
    // verify claimed model: y should be DOCUMENT y
    const elDoc = await page.evaluate(() => { const r=document.querySelector('[data-ref="deep-target"]').getBoundingClientRect();
      return { docCy: +(r.top + r.height/2 + window.scrollY).toFixed(1) }; });

    await page.evaluate(() => window.__addMutation('wrap'));
    await page.waitForTimeout(200);
    await page.reload(); await page.waitForFunction(() => window.__ready === true);
    await page.waitForSelector('[data-agentation-root]');
    if (glue) await page.evaluate(() => window.__glue.settled());
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });
    await page.waitForTimeout(400);
    await fm(page); await page.waitForTimeout(700);
    const el = await er(page, '[data-ref="deep-target"]');
    const m = (await markers(page))[0] || null;
    out.push({ test:'E1 scrolled', glue, scrollY_at_capture: scrollY,
      stored_y: +st.y.toFixed(1), element_document_cy: elDoc.docCy,
      stored_y_matches_document_y: Math.abs(st.y - elDoc.docCy) < 30,
      stored_isFixed: st.isFixed ?? null,
      element_after: el, marker_after: m,
      offset_px: (el&&m) ? +Math.hypot(m.cx-el.cx, m.cy-el.cy).toFixed(1) : null });
    await ctx.close();
  }

  // --- E2: position:fixed target -> fixedMarkersLayer branch
  for (const glue of [false, true]) {
    const ctx = await browser.newContext({ viewport:{width:1280,height:900} });
    const page = await ctx.newPage();
    await boot(page, glue);
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload(); await page.waitForFunction(() => window.__ready === true);
    await page.waitForSelector('[data-agentation-root]');
    await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });
    await page.waitForTimeout(300);
    await fm(page);
    await annotate(page, '#stickybar', 'note on the fixed footer');
    const st = (await stored(page))[0];
    // mutate: make the fixed bar taller so it moves up
    await page.evaluate(() => window.__addMutation('fatbar'));
    await page.waitForTimeout(200);
    await page.reload(); await page.waitForFunction(() => window.__ready === true);
    await page.waitForSelector('[data-agentation-root]');
    if (glue) await page.evaluate(() => window.__glue.settled());
    await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });
    await page.waitForTimeout(300);
    await fm(page); await page.waitForTimeout(700);
    const el = await er(page, '#stickybar');
    const m = (await markers(page))[0] || null;
    out.push({ test:'E2 fixed element', glue, stored_isFixed: st.isFixed ?? null, stored_glueRef: st.glueRef ?? null,
      marker_layer: m ? m.layer : null, element_after: el, marker_after: m,
      offset_px: (el&&m) ? +Math.hypot(m.cx-el.cx, m.cy-el.cy).toFixed(1) : null });
    await ctx.close();
  }

  await browser.close();
  out.forEach(o => console.log(JSON.stringify(o)));
  require('fs').writeFileSync(__dirname+'/results-extra.json', JSON.stringify(out,null,2));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
