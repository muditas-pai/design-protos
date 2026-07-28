/**
 * agentation-glue.js
 * ---------------------------------------------------------------------------
 * Glue for agentation@3.0.2 that fixes three defects:
 *
 *   D1 route bleed        -> G1 remount-on-navigate
 *   D2 silent misplacement-> G3 re-anchor stored coords before mount
 *   D3 no stable anchor   -> G2 capture [data-ref] in onAnnotationAdd
 *
 * ---------------------------------------------------------------------------
 * COORDINATE MODEL (read out of the bundle's own sourcemap, not guessed)
 *
 * src/components/page-toolbar-css/annotation-marker/index.tsx:
 *     style={{ left: `${annotation.x}%`, top: annotation.y }}
 *   and styles.module.scss .marker { position:absolute; transform:translate(-50%,-50%) }
 *
 *   => x is a PERCENTAGE, y is PIXELS, and they address the marker's CENTRE.
 *
 * src/components/page-toolbar-css/styles.module.scss:
 *     .markersLayer      { position:absolute; top:0; left:0; right:0; height:0 }
 *     .fixedMarkersLayer { position:fixed;    top:0; left:0; right:0; bottom:0 }
 *   Both are portalled into document.body (createPortal(..., document.body)).
 *   With an unpositioned body the absolute layer's containing block is the
 *   initial containing block: viewport-wide, anchored at the DOCUMENT origin.
 *
 *   => x% resolves against window.innerWidth in both layers.
 *   => y is DOCUMENT y for !isFixed (absolute layer), VIEWPORT y for isFixed.
 *
 * src/components/page-toolbar-css/index.tsx, click handler (~line 2023):
 *     const x = (e.clientX / window.innerWidth) * 100;
 *     const isFixed = isElementFixed(elementUnder);
 *     const y = isFixed ? e.clientY : e.clientY + window.scrollY;
 *     boundingBox: { x: rect.left,
 *                    y: isFixed ? rect.top : rect.top + window.scrollY,
 *                    width: rect.width, height: rect.height }
 *
 *   => x/y come from the CLICK POINT, never from the element. That is exactly
 *      why the sample annotation's x:75 has no relation to boundingBox.x:924 -
 *      75% of a 1280px viewport is 960px, a point inside the 924..1236 element.
 *      And y:368 ~= bb.y+height/2 only because that click happened to land near
 *      the element's vertical middle. It is a coincidence, not a formula.
 *
 *   => boundingBox does NOT drive the marker at all. Its only render use is the
 *      hover tooltip (index.tsx ~1890/2772: `bb.y + bb.height/2 - scrollY`) plus
 *      the markdown output. Note bb.x is rect.left with NO scrollX added.
 *
 * The element-centred form is agentation's own (index.tsx ~1170, demo path):
 *     x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
 *     y: rect.top + rect.height / 2 + window.scrollY,
 *
 * So the correct re-anchor transform, for an element rect and a fractional
 * offset (fx,fy) inside it, is:
 *
 *     px = rect.left + fx * rect.width          // viewport px
 *     py = rect.top  + fy * rect.height         // viewport px
 *     x  = (px / window.innerWidth) * 100
 *     y  = isFixed ? py : py + window.scrollY
 *     boundingBox = { x: rect.left,
 *                     y: isFixed ? rect.top : rect.top + window.scrollY,
 *                     width: rect.width, height: rect.height }
 *
 * Inverse (what the test harness asserts against), for a non-fixed marker:
 *     screenX = (x / 100) * window.innerWidth - window.scrollX
 *     screenY = y - window.scrollY
 * ---------------------------------------------------------------------------
 */

const STORAGE_PREFIX = "feedback-annotations-";
const ORPHAN_PREFIX = "agentation-glue-orphans-";
const BANNER_ID = "agentation-glue-orphan-banner";

// --- storage -------------------------------------------------------------

const key = (pathname) => STORAGE_PREFIX + pathname;
const orphanKey = (pathname) => ORPHAN_PREFIX + pathname;

function readJSON(k) {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function writeJSON(k, v) {
  try {
    if (!v || v.length === 0) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* quota / disabled */
  }
}

// --- geometry ------------------------------------------------------------

/** Mirror of agentation's isElementFixed (index.tsx line 252). */
function isElementFixed(el) {
  let cur = el;
  while (cur && cur !== document.body) {
    const pos = getComputedStyle(cur).position;
    if (pos === "fixed" || pos === "sticky") return true;
    cur = cur.parentElement;
  }
  return false;
}

/**
 * Write marker coordinates for `el` onto `ann`, placing the marker centre at
 * the fractional offset (fx,fy) within the element's box.
 */
function applyAnchor(ann, el, fx, fy) {
  const rect = el.getBoundingClientRect();
  const fixed = isElementFixed(el);
  const scrollY = fixed ? 0 : window.scrollY;

  const px = rect.left + fx * rect.width;
  const py = rect.top + fy * rect.height;

  ann.x = (px / window.innerWidth) * 100;
  ann.y = py + scrollY;
  ann.isFixed = fixed || undefined;
  ann.boundingBox = {
    x: rect.left,
    y: rect.top + scrollY,
    width: rect.width,
    height: rect.height,
  };
  return rect;
}

/** Inverse transform: where the marker centre actually lands on screen. */
export function markerScreenPosition(ann) {
  const x = (ann.x / 100) * window.innerWidth - (ann.isFixed ? 0 : window.scrollX);
  const y = ann.isFixed ? ann.y : ann.y - window.scrollY;
  return { x, y };
}

// --- G2: capture the anchor ---------------------------------------------

function resolveAnnotatedElement(ann) {
  for (const sel of [ann.fullPath, ann.elementPath]) {
    if (!sel) continue;
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch {
      /* invalid selector */
    }
  }
  // Fall back to hit-testing the captured marker point.
  const p = markerScreenPosition(ann);
  const hit = document.elementFromPoint(p.x, p.y);
  if (hit && !hit.closest("[data-feedback-toolbar],[data-agentation-root]")) return hit;
  return null;
}

function nearestRef(el) {
  const holder = el && el.closest ? el.closest("[data-ref]") : null;
  return holder ? { el: holder, ref: holder.getAttribute("data-ref") } : null;
}

/**
 * G2. Call synchronously inside onAnnotationAdd. Mutating the annotation there
 * persists: index.tsx addAnnotation() pushes the SAME object into state
 * (`setAnnotations(prev => [...prev, newAnnotation])`) and then hands that same
 * reference to `onAnnotationAdd?.(newAnnotation)`; the save effect stringifies
 * state afterwards.
 */
export function captureAnchor(ann) {
  const el = resolveAnnotatedElement(ann);
  const found = nearestRef(el);
  if (!found) {
    ann.glueRef = null;
    ann.glueAnchorMiss = "no-data-ref-ancestor";
    return ann;
  }
  const rect = found.el.getBoundingClientRect();
  const scrollY = ann.isFixed ? 0 : window.scrollY;

  // Marker centre in the same space as the ref rect (viewport px).
  const px = (ann.x / 100) * window.innerWidth;
  const py = ann.y - scrollY;

  ann.glueRef = found.ref;
  ann.glueAnchor = {
    // fractional position of the marker inside the ref element's box
    fx: rect.width ? clamp01((px - rect.left) / rect.width) : 0.5,
    fy: rect.height ? clamp01((py - rect.top) / rect.height) : 0.5,
    // enough to detect a miss / a swapped-out element later
    tag: found.el.tagName.toLowerCase(),
    text: (found.el.textContent || "").trim().slice(0, 80),
    rect: { x: rect.left, y: rect.top + scrollY, width: rect.width, height: rect.height },
    capturedAt: Date.now(),
    innerWidth: window.innerWidth,
  };
  delete ann.glueAnchorMiss;
  delete ann.orphaned;
  return ann;
}

const clamp01 = (n) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5);

// --- G3: re-anchor -------------------------------------------------------

function findRefElement(ref) {
  try {
    return document.querySelector(`[data-ref="${CSS.escape(ref)}"]`);
  } catch {
    return null;
  }
}

function isRendered(el) {
  if (!el || !el.isConnected) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 || r.height > 0;
}

/**
 * G3. Rewrite stored coordinates for every ref-bearing annotation on `pathname`
 * so its marker lands on where its [data-ref] element IS RIGHT NOW.
 * Annotations whose ref is gone are moved to a sidecar orphan key, flagged
 * `orphaned: true`, and NOT left in the live array - so a lost anchor becomes
 * detectable instead of being silently drawn at stale coordinates.
 * Orphans whose ref reappears are re-anchored and moved back.
 *
 * Returns { reanchored, orphaned, recovered, unanchored, details }.
 */
export function reanchor(pathname = location.pathname) {
  const live = readJSON(key(pathname));
  const parked = readJSON(orphanKey(pathname));

  const keep = [];
  const orphans = [];
  const details = [];
  let reanchored = 0;
  let recovered = 0;
  let unanchored = 0;

  const process = (ann, wasParked) => {
    if (!ann || typeof ann !== "object") return;

    if (!ann.glueRef) {
      // Never had an anchor - nothing we can do, leave it alone (D2 remains
      // for these; that is honest, not hidden).
      unanchored++;
      delete ann.orphaned;
      keep.push(ann);
      details.push({ id: ann.id, result: "unanchored" });
      return;
    }

    const el = findRefElement(ann.glueRef);
    if (!isRendered(el)) {
      ann.orphaned = true;
      ann.orphanReason = el ? "ref-not-rendered" : "ref-not-found";
      ann.orphanedAt = Date.now();
      orphans.push(ann);
      details.push({ id: ann.id, ref: ann.glueRef, result: "orphaned", reason: ann.orphanReason });
      return;
    }

    const a = ann.glueAnchor || { fx: 0.5, fy: 0.5 };
    const before = { x: ann.x, y: ann.y };
    const rect = applyAnchor(ann, el, clamp01(a.fx), clamp01(a.fy));
    delete ann.orphaned;
    delete ann.orphanReason;
    delete ann.orphanedAt;
    keep.push(ann);
    if (wasParked) recovered++;
    else reanchored++;
    details.push({
      id: ann.id,
      ref: ann.glueRef,
      result: wasParked ? "recovered" : "reanchored",
      before,
      after: { x: ann.x, y: ann.y },
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    });
  };

  live.forEach((a) => process(a, false));
  parked.forEach((a) => process(a, true));

  writeJSON(key(pathname), keep);
  writeJSON(orphanKey(pathname), orphans);
  renderOrphanBanner(pathname);

  return { pathname, reanchored, orphaned: orphans.length, recovered, unanchored, details };
}

/** G3. List orphaned annotations for a path (or every path). */
export function listOrphans(pathname) {
  if (pathname) return readJSON(orphanKey(pathname));
  const all = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(ORPHAN_PREFIX)) {
      readJSON(k).forEach((a) => all.push({ ...a, pathname: k.slice(ORPHAN_PREFIX.length) }));
    }
  }
  return all;
}

/** Drop orphan records for a path. */
export function clearOrphans(pathname = location.pathname) {
  writeJSON(orphanKey(pathname), []);
  renderOrphanBanner(pathname);
}

// --- orphan surfacing ----------------------------------------------------

function renderOrphanBanner(pathname) {
  const orphans = listOrphans(pathname);
  let el = document.getElementById(BANNER_ID);
  if (orphans.length === 0) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("div");
    el.id = BANNER_ID;
    el.setAttribute("data-agentation-glue", "orphan-banner");
    el.style.cssText =
      "position:fixed;left:12px;bottom:12px;z-index:2147483646;max-width:420px;" +
      "font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;background:#7f1d1d;" +
      "color:#fff;padding:10px 12px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.35);" +
      "pointer-events:auto;";
    document.body.appendChild(el);
  }
  el.dataset.orphanCount = String(orphans.length);
  el.textContent =
    `${orphans.length} orphaned annotation${orphans.length === 1 ? "" : "s"} — anchor lost, not drawn: ` +
    orphans.map((o) => `${o.glueRef} (${o.orphanReason})`).join(", ");
}

// --- G1: mount / teardown / remount --------------------------------------

async function waitFor(predicate, { timeout = 2000, label = "condition" } = {}) {
  const start = performance.now();
  while (!predicate()) {
    if (performance.now() - start > timeout) throw new Error(`glue: timed out waiting for ${label}`);
    await new Promise((r) => requestAnimationFrame(r));
  }
}

/**
 * Create the glue controller.
 *
 * @param {object} o
 * @param {object} o.React        React namespace (createElement)
 * @param {Function} o.createRoot react-dom/client createRoot
 * @param {Function} o.Agentation the Agentation component
 * @param {Element} [o.container] host node; created if absent
 * @param {object} [o.props]      props forwarded to Agentation
 * @param {boolean} [o.patchHistory=true] auto-remount on pushState/replaceState/popstate
 */
export function createAgentationGlue({
  React,
  createRoot,
  Agentation,
  container,
  props = {},
  patchHistory = true,
}) {
  const host =
    container ||
    (() => {
      const d = document.createElement("div");
      d.id = "agentation-root";
      document.body.appendChild(d);
      return d;
    })();

  let root = null;
  let queue = Promise.resolve();
  let currentPath = location.pathname;
  let unpatch = null;
  const log = [];

  const userProps = { ...props };

  // G2 wired in: wrap the caller's onAnnotationAdd.
  const wrappedProps = {
    ...userProps,
    onAnnotationAdd: (annotation) => {
      try {
        captureAnchor(annotation);
      } catch (e) {
        annotation.glueAnchorMiss = "capture-error:" + (e && e.message);
      }
      log.push({ t: Date.now(), ev: "add", id: annotation.id, ref: annotation.glueRef ?? null });
      if (typeof userProps.onAnnotationAdd === "function") userProps.onAnnotationAdd(annotation);
    },
  };

  async function doUnmount() {
    if (!root) return;
    const r = root;
    root = null;
    r.unmount();
    // Teardown must COMPLETE before remount: agentation portals into
    // document.body, so wait until its portal root is actually gone.
    await waitFor(
      () => host.childNodes.length === 0 && !document.querySelector("[data-agentation-root]"),
      { label: "agentation teardown" }
    );
    log.push({ t: Date.now(), ev: "unmount", path: currentPath });
  }

  async function doMount(pathname) {
    // G3: rewrite stored coordinates BEFORE React reads them on mount.
    const res = reanchor(pathname);
    log.push({ t: Date.now(), ev: "reanchor", ...res, details: undefined });
    root = createRoot(host);
    root.render(React.createElement(Agentation, wrappedProps));
    await waitFor(() => !!document.querySelector("[data-agentation-root]"), {
      label: "agentation mount",
    });
    log.push({ t: Date.now(), ev: "mount", path: pathname });
    return res;
  }

  /** Serialise every lifecycle op so teardown always finishes before remount. */
  const serial = (fn) => (queue = queue.then(fn, fn));

  const api = {
    host,
    mount: () =>
      serial(async () => {
        currentPath = location.pathname;
        if (root) await doUnmount();
        return doMount(currentPath);
      }),

    unmount: () => serial(doUnmount),

    /** G1. Call on every pushState navigation. */
    navigate: (pathname = location.pathname) =>
      serial(async () => {
        await doUnmount();
        currentPath = pathname;
        return doMount(pathname);
      }),

    /** Alias */
    onRouteChange(pathname) {
      return api.navigate(pathname);
    },

    reanchor: (p) => reanchor(p ?? location.pathname),
    listOrphans,
    clearOrphans,
    captureAnchor,
    markerScreenPosition,
    settled: () => queue,
    log: () => log.slice(),

    destroy() {
      if (unpatch) unpatch();
      unpatch = null;
      return serial(doUnmount);
    },
  };

  if (patchHistory) {
    const fire = () => {
      if (location.pathname === currentPath) return;
      api.navigate(location.pathname);
    };
    const wrap = (name) => {
      const orig = history[name];
      history[name] = function (...args) {
        const r = orig.apply(this, args);
        // let the app's own router render first, then remount on the next frame
        requestAnimationFrame(fire);
        return r;
      };
      return () => {
        history[name] = orig;
      };
    };
    const u1 = wrap("pushState");
    const u2 = wrap("replaceState");
    const onPop = () => requestAnimationFrame(fire);
    window.addEventListener("popstate", onPop);
    unpatch = () => {
      u1();
      u2();
      window.removeEventListener("popstate", onPop);
    };
  }

  return api;
}

export default createAgentationGlue;
