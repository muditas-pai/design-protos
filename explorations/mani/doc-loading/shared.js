// Shared editor frame + mock deck for the "opening an old deck" loading explorations.
// Each option page calls Loader.mount({ index, name }) and then animates the frame its own way.
(function () {
  // Shortlisted versions, in tab order: [file, tab label].
  const OPTIONS = [
    ["9a-combined-bar.html", "Bottom · count"],
    ["9b-combined-segments.html", "Bottom · segments"],
    ["10a-topbar-segments.html", "Top bar · segments"],
    ["10b-topbar-line.html", "Top bar · line"],
  ];
  const DECK_TITLE = "Q3 Pipeline Review";
  // Mock deck: a warm editorial theme (cream, charcoal, terracotta, sage). Deliberately not the product's brand blue,
  // so the slides read as the user's content, not as UI.
  const SLIDES = [
    { kind: "cover", kicker: "Sales team · Q3 2026", title: "Q3 Pipeline Review", text: "Where we landed, what moved, and the plan for Q4." },
    { kind: "stats", kicker: "Summary", title: "A record quarter for closed revenue" },
    { kind: "bars", kicker: "Pipeline", title: "Most value sits in late stages" },
    { kind: "deals", kicker: "Deals", title: "Four deals decide Q4" },
    { kind: "line", kicker: "Win rate", title: "Win rate climbed for 5 months" },
    { kind: "risks", kicker: "Watch list", title: "Three risks to manage" },
    { kind: "plan", kicker: "Next quarter", title: "The plan for Q4" },
    { kind: "close", kicker: "Thank you", title: "Questions and discussion", text: "Numbers and notes are in the appendix." },
  ];

  // Heroicons outline (24px grid, 1.5 stroke) as used by the redesign header / floater, plus the design's crown.
  const hp = (d, w = 20) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const icon = {
    home: hp("m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"),
    undo: hp("M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"),
    sun: hp("M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"),
    more: hp("M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"),
    share: "<svg aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 256 256\"><rect width=\"256\" height=\"256\" fill=\"none\"></rect><circle cx=\"64\" cy=\"128\" r=\"32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></circle><circle cx=\"176\" cy=\"200\" r=\"32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></circle><circle cx=\"176\" cy=\"56\" r=\"32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></circle><line x1=\"149.1\" y1=\"73.3\" x2=\"90.9\" y2=\"110.7\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></line><line x1=\"90.9\" y1=\"145.3\" x2=\"149.1\" y2=\"182.7\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></line></svg>", // Phosphor ShareNetwork (regular), exact from phosphor-react as the header renders it
    play: "<svg aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 256 256\"><rect width=\"256\" height=\"256\" fill=\"none\"></rect><path d=\"M228.1,121.2,84.2,33.2A8,8,0,0,0,72,40V216a8,8,0,0,0,12.2,6.8l143.9-88A7.9,7.9,0,0,0,228.1,121.2Z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></path></svg>", // Phosphor Play (regular), exact from phosphor-react as the header renders it
    download: "<svg aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 256 256\"><rect width=\"256\" height=\"256\" fill=\"none\"></rect><polyline points=\"86 110 128 152 170 110\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></polyline><line x1=\"128\" y1=\"40\" x2=\"128\" y2=\"152\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></line><path d=\"M216,152v56a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V152\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"></path></svg>", // Phosphor DownloadSimple (regular), exact from phosphor-react as the header renders it
    plus: hp("M12 4.5v15m7.5-7.5h-15", 16),
    swatch: hp("M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z", 16),
    sparkles: hp("M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z", 16).replace("<svg", '<svg class="brand"'),
    left: hp("M15.75 19.5 8.25 12l7.5-7.5", 16),
    right: hp("m8.25 4.5 7.5 7.5-7.5 7.5", 16),
    crown: `<svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M28.79 9.73s-1.91 11.56-2.5 17.47H5.71C5.12 21.29 3.21 9.73 3.21 9.73a.95.95 0 0 1 1.23-.93l4.87 5.91a.85.85 0 0 0 1.24-.19l4.81-9.42a.85.85 0 0 1 1.28 0l4.81 9.42a.85.85 0 0 0 1.24.19l4.87-5.91a.95.95 0 0 1 1.23.93Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    fab: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h12M4 12h8M4 18h6M17 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></svg>',
  };

  function slideHTML(s) {
    const head = `<div class="kicker">${s.kicker}</div><h2>${s.title}</h2>`;
    let body = "";
    if (s.kind === "cover") body = `<div class="cover-grid"><div>${head}<p>${s.text}</p></div><div class="cover-art"><i></i><i></i><i></i></div></div><div class="foot"><span>Northwind Sales</span><span>October 2026</span></div>`;
    if (s.kind === "close") body = `<div class="close-wrap">${head}<p>${s.text}</p></div><div class="foot"><span>Northwind Sales</span><span>8</span></div>`;
    if (s.kind === "stats") body = `${head}<div class="stats">${[["$4.2M", "Closed won", "+18% vs Q2"], ["31%", "Win rate", "+4 pts"], ["48", "Open deals", "$11.6M value"]].map(([v, l, d]) => `<div class="stat"><b>${v}</b><span>${l}</span><em>${d}</em></div>`).join("")}</div>`;
    if (s.kind === "bars") body = `${head}<div class="chart">${[["Lead", 38, "1.1"], ["Qualified", 54, "1.6"], ["Demo", 47, "1.4"], ["Proposal", 80, "2.4"], ["Legal", 66, "2.0"], ["Commit", 100, "3.1"]].map(([l, h, v], i) => `<div class="col"><span class="val">$${v}M</span><i style="height:${h}%" class="${i >= 3 ? "hot" : ""}"></i><span class="lab">${l}</span></div>`).join("")}</div>`;
    if (s.kind === "deals") body = `${head}<div class="deals">${[["Northwind", "Renewal", "$820K", "Legal"], ["Acme", "Expansion", "$640K", "Proposal"], ["Globex", "Pilot to rollout", "$410K", "Commit"], ["Initech", "New logo", "$380K", "Demo"]].map(([n, t, v, st]) => `<div class="deal"><span class="mono">${n.slice(0, 1)}</span><div><b>${n}</b><span>${t}</span></div><span class="tag">${st}</span><strong>${v}</strong></div>`).join("")}</div>`;
    if (s.kind === "line") body = `${head}<svg class="line" viewBox="0 0 100 40" preserveAspectRatio="none"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8553D" stop-opacity=".22"/><stop offset="1" stop-color="#C8553D" stop-opacity="0"/></linearGradient></defs><path d="M0,30 L20,27 L40,24 L60,19 L80,14 L100,9 L100,40 L0,40 Z" fill="url(#ar)"/><polyline fill="none" stroke="#C8553D" stroke-width="1.1" points="0,30 20,27 40,24 60,19 80,14 100,9"/><line x1="0" y1="39.8" x2="100" y2="39.8" stroke="#D9CFBF" stroke-width=".4"/></svg><div class="months"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div>`;
    if (s.kind === "risks") body = `${head}<div class="risks">${[["High", "Two deals slipped a quarter", "Re-scope both with exec sponsors this month."], ["Medium", "Longer legal reviews", "Start legal at proposal, not at commit."], ["Medium", "One champion left Acme", "Map two new contacts before renewal talks."]].map(([lv, t, d]) => `<div class="risk"><span class="lvl ${lv === "High" ? "hi" : ""}">${lv}</span><b>${t}</b><span>${d}</span></div>`).join("")}</div>`;
    if (s.kind === "plan") body = `${head}<div class="plan">${[["Focus", "Expand in the top 20 accounts"], ["Hire", "Two account executives for EMEA"], ["Ship", "CRM sync for every rep"]].map(([t, d], i) => `<div class="step"><span class="n">0${i + 1}</span><b>${t}</b><span>${d}</span></div>`).join("")}</div>`;
    const theme = s.kind === "cover" || s.kind === "close" ? "dark" : "";
    return `<div class="slide ${theme}"><div class="pad k-${s.kind}">${body}</div></div>`;
  }

  // Builds the editor frame (redesign header, 208px slide rail, top-aligned canvas, bottom floater slot).
  // topRight: HTML for the right side of the top bar while loading. Returns element refs.
  function mount({ index, name, label, topRight = "", title = DECK_TITLE }) {
    const app = document.createElement("div");
    // "loading": nothing is editable or clickable until every slide has loaded (setReadyBar clears it).
    app.className = "app loading";
    app.innerHTML = `
      <header class="bar">
        <button class="icon-btn" aria-label="Back to dashboard">${icon.home}</button>
        <span class="sep"></span>
        <span class="title" data-ref="title">${title}</span>
        <span data-ref="aftertitle" style="display:contents"></span>
        <div class="right" data-ref="right">${topRight}</div>
      </header>
      <div class="body">
        <aside class="rail" data-ref="rail">
          <div class="rail-head"><button class="btn btn-secondary btn-sm" disabled>${icon.plus}New slide</button></div>
          <div class="rail-list">
            ${SLIDES.map((_, i) => `<div class="thumb-row${i === 0 ? " cur" : ""}"><span class="num">${i + 1}</span><div class="thumb${i === 0 ? " active" : ""}" data-thumb="${i}"></div></div>`).join("")}
          </div>
        </aside>
        <main class="stage" data-ref="stage">
          <div class="frame">
            <div class="counter-row"><span data-ref="counter"><span class="sk shimmer" style="display:inline-block;width:76px;height:12px;border-radius:9999px"></span></span><span style="display:flex;gap:4px"><button class="icon-btn" disabled aria-label="Previous slide">${icon.left}</button><button class="icon-btn" disabled aria-label="Next slide">${icon.right}</button></span></div>
            <div class="canvas" data-ref="canvas"></div>
            <div class="floater-slot" data-ref="floater"></div>
          </div>
          <span class="fab" aria-hidden="true">${icon.fab}</span>
        </main>
      </div>`;
    document.body.prepend(app);

    // Proto footer (not part of the design): a tab per version + Replay.
    const here = location.pathname.split("/").pop();
    const proto = document.createElement("nav");
    proto.className = "proto";
    proto.setAttribute("aria-label", "Versions");
    proto.innerHTML = `<div class="proto-tabs" role="tablist">${OPTIONS.map(([file, tab], i) => `<a role="tab" href="${file}" aria-selected="${file === here}"><span class="proto-n">${String.fromCharCode(65 + i)}</span>${tab}</a>`).join("")}</div><span class="proto-sep"></span><button type="button" class="proto-replay" data-ref="replay"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>Replay</button><a class="proto-all" href="index.html">All</a>`;
    document.body.appendChild(proto);
    proto.querySelector("[data-ref=replay]").addEventListener("click", () => location.reload());

    const $ = (r) => app.querySelector(`[data-ref=${r}]`);
    return {
      app, bar: app.querySelector(".bar"), title: $("title"), afterTitle: $("aftertitle"), right: $("right"), rail: $("rail"), stage: $("stage"), canvas: $("canvas"), floater: $("floater"), counter: $("counter"),
      thumbs: [...app.querySelectorAll("[data-thumb]")],
    };
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Ready state, as the redesign header and floater render for a free workspace on madhu_ui_v2.
  const READY_RIGHT = `<button class="icon-btn" disabled aria-label="Undo">${icon.undo}</button><button class="icon-btn" aria-label="Theme">${icon.sun}</button><button class="icon-btn" aria-label="More actions">${icon.more}</button><span class="meter"><span class="trk"><span></span></span><b>1,240</b>credits</span><button class="btn btn-secondary">${icon.share}Share</button><button class="btn btn-secondary">${icon.play}Present</button><button class="btn btn-primary">${icon.download}Download</button>`;
  const UPGRADE = `<button class="btn btn-secondary btn-upgrade">${icon.crown}Upgrade</button>`;
  const FLOATER = `<div class="floater"><button class="btn btn-ghost">${icon.plus}Insert</button><button class="btn btn-ghost">${icon.swatch}Style</button><button class="btn btn-ghost">${icon.sparkles}Edit with AI</button><span class="vsep"></span><button class="icon-btn" aria-label="Slide options">${icon.more}</button></div>`;
  const SKELETON_RIGHT = `<span class="sk shimmer ghost-pill" style="width:108px"></span><span class="sk shimmer ghost-pill" style="width:84px"></span><span class="sk shimmer ghost-pill" style="width:92px"></span><span class="sk shimmer ghost-pill" style="width:104px"></span>`;

  // Fill one thumb / the canvas with the real slide (fade in).
  function showThumb(ui, i) {
    ui.thumbs[i].classList.remove("pending", "shimmer");
    ui.thumbs[i].innerHTML = slideHTML(SLIDES[i]);
    ui.thumbs[i].firstElementChild.classList.add("fade-in");
  }
  function showCanvas(ui, i = 0) {
    ui.canvas.innerHTML = slideHTML(SLIDES[i]);
    ui.canvas.firstElementChild.classList.add("fade-in");
    ui.counter.textContent = `Slide ${i + 1} of ${SLIDES.length}`;
  }
  function showFloater(ui) {
    ui.floater.innerHTML = FLOATER;
    ui.floater.firstElementChild.classList.add("fade-in");
  }
  // Everything that only appears once the deck is editable: header actions, Upgrade, counter, floater.
  function setReadyBar(ui, { floater = true } = {}) {
    ui.app.classList.remove("loading");
    ui.right.innerHTML = READY_RIGHT;
    ui.right.classList.add("fade-in");
    if (!ui.afterTitle.innerHTML) ui.afterTitle.innerHTML = UPGRADE;
    ui.counter.textContent = `Slide 1 of ${SLIDES.length}`;
    ui.rail.querySelector(".rail-head .btn").disabled = false;
    ui.stage.querySelectorAll(".counter-row .icon-btn")[1].disabled = false;
    if (floater) showFloater(ui);
  }

  window.Loader = { mount, slideHTML, SLIDES, DECK_TITLE, wait, READY_RIGHT, SKELETON_RIGHT, FLOATER, icon, showThumb, showCanvas, showFloater, setReadyBar };
})();
