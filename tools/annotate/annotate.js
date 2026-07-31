/* ==========================================================================
   Annotation mode, injected into a proto at serve time.

   The proto file on disk is NEVER written. serve.py adds one script tag on
   the way out and passes the hash of the raw bytes, so the freeze check still
   describes the file rather than what the browser was handed.

   Idle, this adds one keydown listener and nothing else: the proto behaves
   exactly as it does without the server, which is what lets you click through
   a flow to the state you want and only then start annotating.

   Shift+C toggles annotation mode. Every piece of chrome lives inside a shadow
   root, so the proto's own DOM stays clean and a stored selector keeps meaning
   what it meant.
   ========================================================================== */
(function () {
  "use strict";

  var tag   = document.currentScript;
  var PROTO = tag.getAttribute("data-proto");
  var HASH  = tag.getAttribute("data-hash");
  var STORE = PROTO.replace(/\/[^/]*$/, "") + "/annotations.jsonl";

  var on = false;                // annotation mode
  var frozen = false;            // note box open
  var annotations = [];
  var dirty = false;
  var hoverDeep = null, lift = 0, target = null;

  /* ---- shadow root ------------------------------------------------------ */

  var host = document.createElement("div");
  host.id = "pai-annotate-root";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  var sr = host.attachShadow({ mode: "open" });
  sr.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '*{box-sizing:border-box;font-family:Inter,system-ui,-apple-system,sans-serif}' +
    '#hl{position:fixed;border:1px solid #58a6ff;background:rgba(56,139,253,.14);' +
      'border-radius:2px;display:none}' +
    '#tip{position:fixed;display:none;padding:2px 6px;border-radius:4px;background:#58a6ff;' +
      'color:#04121f;font-size:10px;font-weight:600;white-space:nowrap;' +
      'font-family:ui-monospace,SFMono-Regular,Menlo,monospace}' +
    '.marker{position:fixed;width:20px;height:20px;border-radius:999px;background:#d29922;' +
      'color:#1c1200;font-size:11px;font-weight:700;display:flex;align-items:center;' +
      'justify-content:center;box-shadow:0 0 0 2px rgba(0,0,0,.35);pointer-events:auto;' +
      'cursor:pointer;transform:translate(-50%,-50%)}' +
    '.marker.unresolved{background:#f85149;color:#fff}' +
    /* idle affordance */
    '#nub{position:fixed;right:12px;bottom:12px;padding:5px 9px;border-radius:999px;' +
      'background:rgba(13,17,23,.72);color:#8b949e;font-size:11px;font-weight:500;' +
      'pointer-events:auto;cursor:pointer;user-select:none;transition:color .15s,background .15s}' +
    '#nub:hover{background:rgba(13,17,23,.92);color:#e6edf3}' +
    /* active bottom bar */
    '#bar{position:fixed;left:0;right:0;bottom:0;display:none;align-items:center;gap:8px;' +
      'padding:7px 12px;background:rgba(13,17,23,.96);border-top:1px solid #30363d;' +
      'pointer-events:auto;color:#e6edf3;font-size:11px}' +
    '#crumbs{display:flex;align-items:center;gap:4px;overflow:hidden;white-space:nowrap;' +
      'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#6e7681}' +
    '#crumbs b{color:#58a6ff;font-weight:600}' +
    '.sp{flex:1}' +
    '.pill{padding:3px 8px;border-radius:999px;background:#21262d;color:#8b949e;' +
      'font-variant-numeric:tabular-nums}' +
    '.pill.warn{background:#3d2b06;color:#e3b341}' +
    'button{height:26px;padding:0 10px;border:1px solid #30363d;border-radius:6px;' +
      'background:#21262d;color:#e6edf3;font:inherit;font-size:11px;font-weight:500;cursor:pointer}' +
    'button:hover{background:#30363d}' +
    'button.primary{background:#238636;border-color:#2ea043}' +
    'button.primary:hover{background:#2ea043}' +
    'button.danger{background:transparent;border-color:#30363d;color:#f85149}' +
    'button.danger:hover{background:#da3633;border-color:#da3633;color:#fff}' +
    /* note box */
    '#note{position:fixed;display:none;width:340px;background:#161b22;border:1px solid #58a6ff;' +
      'border-radius:8px;box-shadow:0 12px 32px rgba(0,0,0,.5);padding:8px;pointer-events:auto}' +
    '#note .sel{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;' +
      'color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:6px}' +
    '#note textarea{width:100%;min-height:58px;resize:vertical;border:0;outline:none;' +
      'background:transparent;color:#e6edf3;font:inherit;font-size:13px;line-height:1.45}' +
    '#note textarea::placeholder{color:#6e7681}' +
    '#note .row{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:10px;color:#6e7681}' +
    '#toast{position:fixed;left:50%;bottom:52px;transform:translateX(-50%);padding:8px 14px;' +
      'border-radius:999px;font-size:12px;background:#238636;color:#fff;opacity:0;' +
      'transition:opacity .18s}' +
    '#toast.show{opacity:1}' +
    '</style>' +
    '<div id="hl"></div><div id="tip"></div>' +
    '<div id="nub">&#8679;C annotate</div>' +
    '<div id="bar">' +
      '<span id="crumbs"></span><span class="sp"></span>' +
      '<span class="pill" id="count">0 notes</span>' +
      '<span class="pill warn" id="stale" style="display:none"></span>' +
      '<button id="copy">Copy for Claude</button>' +
      '<button class="primary" id="save">Save</button>' +
      '<button id="exit">Done</button>' +
    '</div>' +
    '<div id="note"><div class="sel"></div>' +
      '<textarea placeholder="What do you notice? Plain words, no categories."></textarea>' +
      '<div class="row"><span>Enter saves, Esc cancels</span><span class="sp"></span>' +
      '<button class="danger" id="ndel" style="display:none">Delete</button>' +
      '<button id="ncancel">Cancel</button><button class="primary" id="nadd">Add</button></div>' +
    '</div>' +
    '<div id="toast"></div>';

  var $ = function (s) { return sr.querySelector(s); };
  var hl = $("#hl"), tip = $("#tip"), bar = $("#bar"), nub = $("#nub");
  var crumbs = $("#crumbs"), countEl = $("#count"), staleEl = $("#stale");
  var noteBox = $("#note"), noteTa = noteBox.querySelector("textarea");
  var noteSel = noteBox.querySelector(".sel"), toastEl = $("#toast");
  var editing = null;        // index into `annotations` while editing, else null

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function () { document.body.appendChild(host); });

  function toast(msg, bad) {
    toastEl.textContent = msg;
    toastEl.style.background = bad ? "#da3633" : "#238636";
    toastEl.classList.add("show");
    setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  }

  /* ---- selectors -------------------------------------------------------- */

  /* Classes the proto's own JS toggles at runtime. They describe the moment,
     not the element, so they must never reach a stored selector: a marker made
     while a step was showing has to resolve when it is not. */
  var VOLATILE = /^(is|has|js)-|^(active|open|selected|current|hidden|show|disabled)$/;

  function stableClasses(el) {
    return (el.getAttribute("class") || "").trim().split(/\s+/)
      .filter(Boolean).filter(function (c) { return !VOLATILE.test(c); });
  }

  /* A deterministic, unique CSS path. The proto is frozen, so this stays exact
     forever and there is no need for fuzzy re-resolution. */
  function cssPath(el) {
    var parts = [];
    while (el && el.nodeType === 1 && el !== document.body) {
      var part = el.tagName.toLowerCase();
      if (el.id && document.querySelectorAll("#" + CSS.escape(el.id)).length === 1) {
        parts.unshift("#" + CSS.escape(el.id));
        break;
      }
      var cls = stableClasses(el);
      if (cls.length) part += "." + cls.map(function (c) { return CSS.escape(c); }).join(".");
      var parent = el.parentElement;
      if (parent) {
        var sibs = Array.prototype.filter.call(parent.children, function (s) {
          return s.tagName === el.tagName;
        });
        if (sibs.length > 1) part += ":nth-of-type(" + (sibs.indexOf(el) + 1) + ")";
      }
      parts.unshift(part);
      el = parent;
    }
    return parts.join(" > ");
  }

  function label(el) {
    var cls = stableClasses(el);
    return el.tagName.toLowerCase() + (cls.length ? "." + cls[0] : "");
  }

  function ancestry(el) {
    var out = [];
    while (el && el.nodeType === 1 && el !== document.body) { out.unshift(el); el = el.parentElement; }
    return out;
  }

  function resolveTarget() {
    var el = hoverDeep;
    for (var i = 0; i < lift && el && el.parentElement && el.parentElement !== document.body; i++) {
      el = el.parentElement;
    }
    return el;
  }

  function state() { return location.hash || ""; }

  /* A note needs an identity of its own. Position in the array is not one:
     deleting the second note renumbers every note after it, and anything
     holding a reference — a contact-sheet card, a crop on disk — would
     silently re-point at the wrong judgement. */
  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID().slice(0, 8);
    return Math.random().toString(36).slice(2, 10);
  }

  /* ---- painting --------------------------------------------------------- */

  function paint() {
    if (frozen || !target) return;
    var r = target.getBoundingClientRect();
    hl.style.display = "block";
    hl.style.left = r.left + "px"; hl.style.top = r.top + "px";
    hl.style.width = r.width + "px"; hl.style.height = r.height + "px";
    tip.style.display = "block";
    tip.textContent = label(target);
    tip.style.left = r.left + "px";
    tip.style.top = Math.max(0, r.top - 16) + "px";

    var chain = ancestry(target);
    crumbs.innerHTML = chain.map(function (e, i) {
      return i === chain.length - 1 ? "<b>" + label(e) + "</b>" : "<span>" + label(e) + "</span>";
    }).join(" &rsaquo; ");
  }

  function clearPaint() { hl.style.display = "none"; tip.style.display = "none"; }

  function renderMarkers() {
    Array.prototype.slice.call(sr.querySelectorAll(".marker")).forEach(function (m) { m.remove(); });
    if (!on) return;
    var here = state(), shown = 0;
    annotations.forEach(function (a, i) {
      if ((a.state || "") !== here) return;         // only this state, so no bleed
      var el = null;
      try { el = document.querySelector(a.selector); } catch (e) { /* bad selector */ }
      var m = document.createElement("div");
      m.className = "marker" + (el ? "" : " unresolved");
      m.textContent = String(i + 1);
      m.title = (el ? "" : "anchor not found on this state\n") + a.note;
      if (el) {
        var r = el.getBoundingClientRect();
        m.style.left = (r.left + r.width / 2) + "px";
        m.style.top = r.top + "px";
      } else {
        m.style.left = (16 + shown * 24) + "px";
        m.style.top = "16px";
      }
      m.addEventListener("click", function (ev) {
        ev.stopPropagation();
        // an unresolved note has no element to sit beside, so anchor to its marker
        openNote(el, i, el ? null : m.getBoundingClientRect());
      });
      sr.appendChild(m);
      shown++;
    });
    countEl.textContent = annotations.length + (annotations.length === 1 ? " note" : " notes");
  }

  function markDirty(v) {
    dirty = v;
    $("#save").textContent = v ? "Save •" : "Save";
  }

  /* ---- note box --------------------------------------------------------- */

  /* One box for both jobs. `index` present means editing an existing note:
     the text is prefilled, Delete appears, and commit rewrites that record
     rather than appending a new one. `anchor` covers the case where the note
     being edited no longer resolves, so there is no element to sit beside. */
  function openNote(el, index, anchor) {
    frozen = true;
    editing = (index === undefined || index === null) ? null : index;
    if (el) target = el;
    var r = anchor || el.getBoundingClientRect();

    noteSel.textContent = editing === null ? cssPath(el) : annotations[editing].selector;
    noteTa.value = editing === null ? "" : annotations[editing].note;
    $("#ndel").style.display = editing === null ? "none" : "";
    $("#nadd").textContent = editing === null ? "Add" : "Update";

    // keep the element outlined while the box is open, so an edit shows you
    // what it is about rather than asking you to remember
    if (el) {
      var er = el.getBoundingClientRect();
      hl.style.display = "block";
      hl.style.left = er.left + "px"; hl.style.top = er.top + "px";
      hl.style.width = er.width + "px"; hl.style.height = er.height + "px";
      tip.style.display = "block";
      tip.textContent = label(el);
      tip.style.left = er.left + "px";
      tip.style.top = Math.max(0, er.top - 16) + "px";
    }

    noteBox.style.display = "block";
    var top = r.bottom + 8;
    if (top + 140 > window.innerHeight) top = Math.max(8, r.top - 148);
    noteBox.style.top = top + "px";
    noteBox.style.left = Math.min(Math.max(8, r.left), window.innerWidth - 350) + "px";
    noteTa.focus();
    noteTa.setSelectionRange(noteTa.value.length, noteTa.value.length);
  }

  function closeNote() {
    frozen = false; editing = null;
    noteBox.style.display = "none";
    clearPaint();
  }

  function deleteNote() {
    if (editing === null) return;
    annotations.splice(editing, 1);
    markDirty(true);
    closeNote();
    renderMarkers();
  }

  function commitNote() {
    var text = noteTa.value.trim();
    if (!text) { closeNote(); return; }

    // editing keeps the note's anchor, its hash and when it was first made:
    // only the words change, and the hash records which version of the file
    // the judgement was made against
    if (editing !== null) {
      annotations[editing].note = text;
      markDirty(true);
      closeNote();
      renderMarkers();
      return;
    }

    var r = target.getBoundingClientRect();
    // document coords, not client: the proto scrolls, so a client-relative rect
    // would only mean anything at the scroll position it was taken at.
    var sc = document.scrollingElement || document.documentElement;
    annotations.push({
      id: newId(),
      proto: PROTO,
      hash: HASH,
      state: state(),
      viewport: [window.innerWidth, window.innerHeight],
      selector: cssPath(target),
      tag: target.tagName.toLowerCase(),
      classes: (target.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean),
      text: (target.textContent || "").trim().slice(0, 120),
      rect: [Math.round(r.left + sc.scrollLeft), Math.round(r.top + sc.scrollTop),
             Math.round(r.width), Math.round(r.height)],
      note: text,
      at: new Date().toISOString()
    });
    markDirty(true);
    closeNote();
    renderMarkers();
  }

  $("#nadd").addEventListener("click", commitNote);
  $("#ncancel").addEventListener("click", closeNote);
  $("#ndel").addEventListener("click", deleteNote);
  noteTa.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitNote(); }
    else if (e.key === "Escape") { e.preventDefault(); closeNote(); }
    e.stopPropagation();
  });

  /* ---- store ------------------------------------------------------------ */

  function serialise() {
    return annotations.map(function (a) { return JSON.stringify(a); }).join("\n") + "\n";
  }

  function loadExisting() {
    return fetch("/" + STORE, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (txt) {
        annotations = txt.split("\n").filter(Boolean).map(function (l) {
          try { return JSON.parse(l); } catch (e) { return null; }
        }).filter(Boolean).filter(function (a) { return a.proto === PROTO; });
        // a frozen proto that was edited anyway invalidates the notes made before
        var stale = annotations.filter(function (a) { return a.hash && a.hash !== HASH; });
        if (stale.length) {
          staleEl.style.display = "";
          staleEl.textContent = stale.length + " note" + (stale.length === 1 ? "" : "s") +
                                " predate an edit to this file";
        }
      })
      .catch(function () { annotations = []; });
  }

  $("#save").addEventListener("click", function () {
    fetch("/_annotate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `proto` lets the server keep every sibling's notes in the shared store
      body: JSON.stringify({ file: STORE, proto: PROTO, content: serialise() })
    }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).then(function (d) {
      markDirty(false);
      // "written to disk" and "everyone else has it" are different claims,
      // and a tool that says the second when it only did the first is lying
      var g = (d && d.git) || {};
      if (g.state === "pushed")         toast("Saved and pushed to " + g.branch);
      else if (g.state === "committed") toast("Saved and committed, push failed", true);
      else if (g.state === "failed")    toast("Saved. Git " + g.at + " failed", true);
      else                              toast("Saved to " + STORE.split("/").pop());
    }).catch(function () { toast("No local writer. Use Copy for Claude.", true); });
  });

  $("#copy").addEventListener("click", function () {
    navigator.clipboard.writeText(
      "In " + STORE + ", replace the lines whose \"proto\" is\n" + PROTO +
      "\nwith these " + annotations.length + (annotations.length === 1 ? " line" : " lines") +
      ", and leave every other line alone:\n\n" + serialise()
    ).then(function () { toast("Copied. Paste into Claude Code."); },
           function () { toast("Clipboard blocked.", true); });
  });

  /* ---- mode ------------------------------------------------------------- */

  /* Chrome that belongs to some other tool rather than to the design. Mani's
     protos carry an agentation toolbar; annotating it would file a note about
     a widget nobody is designing. */
  function foreignChrome(el) {
    return !!(el.closest && el.closest("#agentation-root"));
  }

  function onMove(e) {
    if (frozen) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (el === host) return;                        // hovering our own chrome
    if (!el || el === document.documentElement || el === document.body || foreignChrome(el)) {
      clearPaint(); target = null; return;
    }
    if (el !== hoverDeep) { hoverDeep = el; lift = 0; }
    target = resolveTarget();
    paint();
  }

  /* The wheel scrolls the proto, because most protos are taller than the frame
     and reaching the bottom has to stay free. Alt (Option) + wheel changes the
     grouping level: the rarer, deliberate action takes the modifier. */
  function onWheel(e) {
    if (ours(e)) return;                            // scrolling inside the note box
    if (frozen) { e.preventDefault(); return; }     // keep the note box anchored
    if (!e.altKey || !hoverDeep) return;            // let the proto scroll
    e.preventDefault();
    lift = Math.max(0, lift + (e.deltaY < 0 ? 1 : -1));
    target = resolveTarget();
    paint();
  }

  function onKey(e) {
    if (frozen) return;
    if (e.key === "ArrowUp")   { e.preventDefault(); lift++; target = resolveTarget(); paint(); }
    if (e.key === "ArrowDown") { e.preventDefault(); lift = Math.max(0, lift - 1); target = resolveTarget(); paint(); }
  }

  /* Our own chrome lives in a shadow root, so at the document listener the
     target of a click on the Save button is the HOST, not the button. Without
     this guard the capture below eats it and every control in the bar is dead. */
  function ours(e) {
    var path = e.composedPath ? e.composedPath() : [];
    return path.indexOf(host) !== -1;
  }

  function onClick(e) {
    if (frozen || ours(e)) return;
    e.preventDefault(); e.stopPropagation();        // select, never activate
    if (target) openNote(target);
  }

  function onScroll() { renderMarkers(); if (!frozen && target) paint(); }

  var LISTEN = [
    ["mousemove", onMove, true], ["wheel", onWheel, { passive: false, capture: true }],
    ["keydown", onKey, true], ["click", onClick, true], ["scroll", onScroll, true]
  ];

  function setMode(v) {
    if (v === on) return;
    on = v;
    LISTEN.forEach(function (l) {
      document[on ? "addEventListener" : "removeEventListener"](l[0], l[1], l[2]);
    });
    window[on ? "addEventListener" : "removeEventListener"]("resize", onScroll);
    bar.style.display = on ? "flex" : "none";
    nub.style.display = on ? "none" : "";
    if (on) { loadExisting().then(renderMarkers); }
    else { clearPaint(); closeNote(); renderMarkers(); hoverDeep = null; target = null; }
  }

  // Shift+C toggles. Bound at the document, capture phase, so a proto that
  // handles its own keys does not swallow it.
  document.addEventListener("keydown", function (e) {
    if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.key || "").toLowerCase() !== "c" && e.code !== "KeyC") return;
    var t = e.target;
    if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;  // typing, not toggling
    if (t && t.isContentEditable) return;
    e.preventDefault(); e.stopPropagation();
    setMode(!on);
  }, true);

  $("#nub").addEventListener("click", function () { setMode(true); });
  $("#exit").addEventListener("click", function () { setMode(false); });

  window.addEventListener("beforeunload", function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });
  window.addEventListener("hashchange", function () { if (on) renderMarkers(); });
})();
