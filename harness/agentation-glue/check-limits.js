const { chromium } = require('playwright');
const PORT = Number(process.argv[2] || 8961);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1280,height:900} });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/a?glue=1`);
  await page.waitForFunction(() => window.__ready === true, null, {timeout:20000});
  await page.waitForSelector('[data-agentation-root]');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload(); await page.waitForFunction(() => window.__ready === true);
  await page.waitForSelector('[data-agentation-root]');
  await page.evaluate(() => { const p=[...document.querySelectorAll('body > div')].pop(); if(p){p.style.position='relative';p.style.zIndex='2147483647';} });
  await page.waitForTimeout(300);

  // L1: annotate an element with NO [data-ref] ancestor (the <h1>)
  await page.locator('[class*="toolbarContainer"]').first().click({force:true});
  await page.waitForTimeout(500);
  const bx = await page.locator('h1').first().boundingBox();
  await page.mouse.click(bx.x + bx.width/2, bx.y + bx.height/2);
  const ta = page.locator('textarea[placeholder*="change"]');
  await ta.waitFor({timeout:8000}); await ta.fill('no data-ref anywhere above me');
  await page.locator('button:has-text("Add")').last().click({force:true});
  await page.waitForTimeout(800);
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('feedback-annotations-/a')||'[]')[0]);
  const re = await page.evaluate(() => window.__glue.reanchor('/a'));
  console.log(JSON.stringify({ check:'L1 no-data-ref-ancestor',
    glueRef: st.glueRef ?? null, glueAnchorMiss: st.glueAnchorMiss ?? null,
    reanchor: { reanchored: re.reanchored, orphaned: re.orphaned, unanchored: re.unanchored } }));

  // L2: teardown ordering across 4 navigations
  for (const p of ['/b','/c','/a','/b']) { await page.evaluate(x => window.__go(x), p); await page.waitForTimeout(600); }
  await page.evaluate(() => window.__glue.settled());
  const log = await page.evaluate(() => window.__glue.log().filter(e => ['mount','unmount'].includes(e.ev)).map(e => e.ev));
  let ok = true, mounted = false;
  for (const ev of log) { if (ev === 'mount') { if (mounted) ok = false; mounted = true; } else { if (!mounted) ok = false; mounted = false; } }
  const roots = await page.evaluate(() => document.querySelectorAll('[data-agentation-root]').length);
  console.log(JSON.stringify({ check:'L2 remount ordering', sequence: log.join(','),
    strictly_alternating: ok, live_agentation_roots: roots }));
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
