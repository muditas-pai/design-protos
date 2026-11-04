/* Sample deck shared by the slideshow screen and the phone remote.
   Each slide: title (shown on the remote), html (1280x720 canvas), notes (speaker notes). */
window.DECK = {
  title: "Q3 board update",
  slides: [
    {
      title: "Northwind grew revenue 38% in Q3",
      html: `<div class="s s-cover"><div class="s-mark"><span></span>Northwind</div>
        <div class="s-eyebrow">Board update · Q3 2026</div>
        <h1>Northwind grew revenue 38% in Q3</h1>
        <p class="s-sub">Prepared for the board · 7 October 2026</p></div>`,
      notes: "Welcome everyone. This is a 20 minute update with one ask at the end. Revenue grew 38% on Q2, and most of that came from three changes we made in July. Hold questions on the numbers until slide 3, where the detail is."
    },
    {
      title: "We closed 93% of target and win rate rose 3 points",
      html: `<div class="s"><div class="s-eyebrow">Headline</div>
        <h2>We closed 93% of target and win rate rose 3 points</h2>
        <div class="s-kpis">
          <div><small>Revenue</small><b>$4.2M</b><em>Target $4.5M</em></div>
          <div><small>Win rate</small><b>24%</b><em>Up from 21% in Q2</em></div>
          <div><small>New customers</small><b>46</b><em>Up from 31 in Q2</em></div>
        </div>
        <p class="s-src">Source: HubSpot export, 30 Sep 2026</p></div>`,
      notes: "We missed target by $300K. Two deals worth $380K slipped to the first week of October and both are now signed. Win rate is the number to watch: 24% is our best quarter so far. New customers rose from 31 to 46."
    },
    {
      title: "Pipeline grew every month from July to September",
      html: `<div class="s"><div class="s-eyebrow">Pipeline</div>
        <h2>Pipeline grew every month from July to September</h2>
        <div class="s-bars">
          <div style="--h:42%"><em>$6.1M</em><small>July</small></div>
          <div style="--h:61%"><em>$8.8M</em><small>August</small></div>
          <div class="hi" style="--h:88%"><em>$12.7M</em><small>September</small></div>
        </div>
        <p class="s-src">Source: HubSpot export, 30 Sep 2026</p></div>`,
      notes: "Pipeline doubled in 3 months, from $6.1M to $12.7M. September is the outlier because of the partner launch. If anyone asks: about 40% of September pipeline came through partners, and we expect that share to hold in Q4."
    },
    {
      title: "Three changes drove most of the growth",
      html: `<div class="s"><div class="s-eyebrow">What changed</div>
        <h2>Three changes drove most of the growth</h2>
        <div class="s-cards">
          <div><b>01</b><strong>Partner launch</strong><span>$5.1M of new pipeline in September</span></div>
          <div><b>02</b><strong>Shorter trial</strong><span>14 days instead of 30, same conversion</span></div>
          <div><b>03</b><strong>Annual plans first</strong><span>62% of new deals now pay yearly</span></div>
        </div></div>`,
      notes: "Spend most of the time on the partner launch. The shorter trial is a quiet win: conversion held at 18% with half the wait. Annual plans first means cash comes in earlier, which matters for the ask on slide 7."
    },
    {
      title: "Customers say onboarding now takes 2 days, not 2 weeks",
      html: `<div class="s s-quote"><div class="s-eyebrow">From customers</div>
        <blockquote>“We were live in 2 days. Last time we tried a tool like this it took our team 2 weeks.”</blockquote>
        <p class="s-who"><strong>Priya Raman</strong> · COO, Fieldline</p></div>`,
      notes: "Read the quote, then pause. Fieldline signed in August and expanded to 3 teams in September. This is the story the sales team now opens with."
    },
    {
      title: "Two risks need a decision this quarter",
      html: `<div class="s"><div class="s-eyebrow">Risks</div>
        <h2>Two risks need a decision this quarter</h2>
        <ul class="s-list">
          <li><b>Hiring</b><span>Sales team is at 9 of 15 planned seats. Each empty seat costs about $90K of pipeline a quarter.</span></li>
          <li><b>Partners</b><span>2 partners bring 70% of partner pipeline. Losing one would cut Q4 forecast by about $1.4M.</span></li>
        </ul></div>`,
      notes: "Be direct here. Hiring is the risk we can fix with the ask on the next slide. The partner concentration is a Q1 problem; we will bring a plan to the January meeting."
    },
    {
      title: "We ask the board to approve 6 new sales hires",
      html: `<div class="s s-ask"><div class="s-eyebrow">The ask</div>
        <h1>We ask the board to approve 6 new sales hires</h1>
        <p class="s-sub">$540K this year · first hires start in November · payback in about 9 months</p></div>`,
      notes: "State the ask, then stop talking. If pushed on cost: $540K this year, payback in about 9 months based on Q3 win rate. Ask for a decision today or a named owner and a date."
    }
  ]
};

/* Renders slide i into el and keeps it scaled to el's width. */
window.mountSlide = function (el, i) {
  const s = window.DECK.slides[i];
  if (!s) { el.innerHTML = ""; return; }
  el.classList.add("slide-fit");
  el.innerHTML = `<div class="slide">${s.html}</div>`;
  const inner = el.firstChild;
  const fit = () => { inner.style.transform = `scale(${el.clientWidth / 1280})`; };
  fit();
  if (!el._ro) { el._ro = new ResizeObserver(() => { const c = el.firstChild; if (c) c.style.transform = `scale(${el.clientWidth / 1280})`; }); el._ro.observe(el); }
};
