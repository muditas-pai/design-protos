/* ============================================================================
   baby-pai.js — v1. The world loader.
   ----------------------------------------------------------------------------
   Loaded by the shell AND (optionally) by any document mounted inside it.
   No dependencies, no build step.

     <script src="../baby-pai.js" data-root=".."></script>

   What it does, in order:
     1. reads ?state=<scenario-id>  ->  fetch <root>/scenarios/<id>.json
     2. resolves $ref fixtures      ->  real rows, first-N, never sampled
     3. derives everything derivable (remaining, pct_used, counts, ends_on)
     4. freezes the clock + entropy (unless ?freeze=0)
     5. paints body.dataset buckets so CSS drives ALL visibility
     6. fills [data-bind] / [data-repeat] so a document needs no per-file JS
     7. flips <html data-baby="ready"> — the renderer waits on this

   If there is no scenario file it falls back to today's behaviour exactly:
   body.dataset.state = <the raw ?state= value>, data-baby="legacy". That is
   what keeps the 227 existing prototypes working untouched.
   ========================================================================== */
(function () {
  var SELF = document.currentScript;
  var ROOT = (SELF && SELF.dataset.root) || '.';
  var Q = new URLSearchParams(location.search);
  var NAME = Q.get('state') || Q.get('scenario') || 'default';
  var FROZEN = Q.get('freeze') !== '0';
  var html = document.documentElement;
  var cache = new Map();
  var PINS = {};                         // dataset keys that survive a repaint

  var get = function (o, p) {
    return String(p).split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o);
  };
  var setPath = function (o, p, v) {
    var ks = String(p).split('.'), last = ks.pop();
    ks.reduce(function (a, k) { return (a[k] = a[k] || {}); }, o)[last] = v;
  };
  var json = function (url) {
    if (!cache.has(url)) cache.set(url, fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return r.json();
    }));
    return cache.get(url);
  };
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---- $ref resolution ---------------------------------------------------
     {"$ref":"../fixtures.json#/decks","take":6,"starred":[0]}
     `take` is the first N in order. There is no sampling, so no entropy. */
  function deref(node, base) {
    if (Array.isArray(node)) return Promise.all(node.map(function (n) { return deref(n, base); }));
    if (node && typeof node === 'object') {
      if (node.$ref) {
        var parts = node.$ref.split('#');
        return json(new URL(parts[0], base).href).then(function (doc) {
          var v = parts[1] ? get(doc, parts[1].replace(/^\//, '').replace(/\//g, '.')) : doc;
          if (Array.isArray(v)) {
            v = v.slice(0, Number.isInteger(node.take) ? node.take : v.length)
                 .map(function (r, i) { return Object.assign({}, r, { _i: i }); });
            (node.starred || []).forEach(function (i) { if (v[i]) v[i].starred = true; });
          }
          return v;
        });
      }
      var keys = Object.keys(node), out = {};
      return Promise.all(keys.map(function (k) {
        return deref(node[k], base).then(function (v) { out[k] = v; });
      })).then(function () { return out; });
    }
    return Promise.resolve(node);
  }

  /* ---- derive — nothing derivable is ever stored in a scenario ----------- */
  var DAY = 864e5;
  function derive(s) {
    s.user = s.user || {}; s.content = s.content || {};
    s.location = s.location || {}; s.overlays = s.overlays || {};
    var c = s.user.credits;
    if (c && c.included != null) {
      c.used = c.used || 0;
      c.remaining = Math.max(0, c.included - c.used);
      c.pct_used = c.included ? Math.round((c.used / c.included) * 100) : 0;
    }
    var t = s.user.trial;
    if (t && t.days_remaining != null) {
      t.ends_on = new Date(Date.parse(s.now) + t.days_remaining * DAY).toISOString();
    }
    if (s.user.workspace) s.user.workspace_initial = s.user.workspace.trim().charAt(0).toUpperCase();
    s.counts = {};
    Object.keys(s.content).forEach(function (k) {
      if (Array.isArray(s.content[k])) s.counts[k] = s.content[k].length;
    });
    return s;
  }

  /* ---- buckets — CSS wants an enum, not a number.
         Every threshold lives here, once, so [data-docs="few"] means the same
         thing on every surface in the product. ------------------------------ */
  function buckets(s) {
    var d = {};
    d.state = s.branch || s.role || 'default';       // <- the legacy contract
    d.scenario = s.id || NAME;
    if (s.user.plan_id) d.plan = s.user.plan_id;
    if (s.user.plan_period) d.period = s.user.plan_period;
    var n = s.counts.decks;
    if (n != null) d.docs = n === 0 ? 'none' : n <= 5 ? 'few' : 'many';
    var c = s.user.credits;
    if (c && c.included != null) {
      d.credits = c.remaining === 0 ? 'empty'
        : c.remaining <= c.included * 0.2 ? 'low' : 'ok';
    }
    var t = s.user.trial;
    d.trial = !t ? 'none' : t.days_remaining <= 0 ? 'expired'
      : t.days_remaining <= 3 ? 'expiring' : 'active';
    var tm = s.user.team;
    d.team = tm && tm.in_team ? (tm.role || 'member') : 'solo';
    if (tm && tm.in_team && tm.seats_total != null) {
      d.seats = tm.seats_used >= tm.seats_total ? 'full' : 'open';
    }
    if (s.location.surface) d.route = s.location.surface;
    if (s.overlays.modal) d.modal = s.overlays.modal.id;
    if (s.overlays.banner) d.banner = s.overlays.banner.id;
    if (s.overlays.toast) d.toast = s.overlays.toast.id;
    Object.keys(s.flags || {}).forEach(function (f) {
      if (s.flags[f]) {
        d['flag' + f.replace(/(^|_)(\w)/g, function (_, __, ch) { return ch.toUpperCase(); })] = 'on';
      }
    });
    return d;
  }

  /* ---- formatters — all resolve against the frozen clock ----------------- */
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var FMT = {
    ago: function (days) {
      if (days == null) return '';
      return days === 0 ? 'today' : days === 1 ? 'yesterday'
        : days < 7 ? days + ' days ago'
        : days < 30 ? Math.floor(days / 7) + 'w ago'
        : Math.floor(days / 30) + 'mo ago';
    },
    date: function (iso) {
      if (!iso) return '';
      var d = new Date(iso);
      return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    },
    plural: function (n) { return n === 1 ? '' : 's'; },
    num: function (n) { return n == null ? '' : Number(n).toLocaleString('en-US'); },
    slides: function (n) { return n == null ? '' : n + ' slide' + (n === 1 ? '' : 's'); }
  };

  function fill(el, v, s) {
    el.textContent = el.dataset.fmt && FMT[el.dataset.fmt]
      ? FMT[el.dataset.fmt](v, s)
      : (v == null ? '' : v);
  }

  function paint(s) {
    var body = document.body, d = buckets(s);
    Object.keys(body.dataset).forEach(function (k) { delete body.dataset[k]; });
    Object.keys(d).forEach(function (k) { body.dataset[k] = d[k]; });
    Object.keys(PINS).forEach(function (k) { body.dataset[k] = PINS[k]; });

    document.querySelectorAll('[data-bind]').forEach(function (el) {
      fill(el, get(s, el.dataset.bind), s);
    });

    document.querySelectorAll('[data-repeat]').forEach(function (host) {
      var tpl = host.querySelector('template');
      if (!tpl) return;
      var rows = get(s, host.dataset.repeat) || [];
      host.querySelectorAll('[data-row]').forEach(function (n) { n.remove(); });
      rows.forEach(function (row, i) {
        var frag = tpl.content.cloneNode(true);
        frag.querySelectorAll('[data-field]').forEach(function (f) {
          fill(f, row[f.dataset.field], s);
        });
        var el = frag.firstElementChild;
        if (!el) return;
        el.setAttribute('data-row', i);
        Object.keys(row).forEach(function (k) {
          var v = row[k];
          if (v === true) el.setAttribute('data-' + k, '');
          else if (v === false || v == null || typeof v === 'object') { /* skip */ }
          else el.setAttribute('data-' + k, String(v));
        });
        host.appendChild(frag);
      });
    });

    document.dispatchEvent(new CustomEvent('baby-pai:paint', { detail: s }));
  }

  /* ---- public API — what click handlers (driven states) use -------------- */
  var PAI = window.PAI = {
    state: null,
    ready: false,
    scenario: NAME,
    frozen: FROZEN,
    now: function () { return new Date(Date.parse(PAI.state.now)); },
    rand: function () { return 0.5; },
    get: function (p) { return get(PAI.state, p); },
    set: function (p, v) {
      setPath(PAI.state, p, v);
      derive(PAI.state);
      paint(PAI.state);
      broadcast();
      return PAI.state;
    },
    /* dataset keys the shell owns (place, mount) that must survive a repaint */
    pin: function (k, v) { PINS[k] = v; document.body.dataset[k] = v; },
    /* hard navigation to another scenario — the continuity fields name these */
    go: function (id) {
      var q = new URLSearchParams(location.search);
      q.set('state', id);
      location.search = q.toString();
    },
    /* adopt a state object handed over from a parent frame */
    adopt: function (s) { PAI.state = derive(s); paint(PAI.state); PAI.ready = true; html.dataset.baby = 'ready'; }
  };

  /* ---- cross-frame: shell -> mounted documents --------------------------- */
  function broadcast() {
    document.querySelectorAll('iframe').forEach(function (f) {
      try { f.contentWindow.postMessage({ type: 'pai:state', state: PAI.state }, '*'); } catch (e) {}
    });
  }
  window.addEventListener('message', function (ev) {
    var m = ev.data;
    if (!m || typeof m !== 'object') return;
    if (m.type === 'pai:state' && m.state) { PAI.adopt(m.state); }
    if (m.type === 'pai:state-patch' && m.patch) {
      Object.keys(m.patch).forEach(function (p) { setPath(PAI.state, p, m.patch[p]); });
      derive(PAI.state); paint(PAI.state); broadcast();
    }
  });

  function legacy(why) {
    document.body.dataset.state = NAME;
    html.dataset.baby = 'legacy';
    console.warn('[baby-pai] no world (' + why + ') — legacy ?state= behaviour');
    document.dispatchEvent(new CustomEvent('baby-pai:ready', { detail: null }));
  }

  function boot() {
    var url = new URL(ROOT + '/scenarios/' + NAME + '.json', location.href).href;
    json(url)
      .then(function (raw) { return deref(raw, url); })
      .then(function (s) {
        s.id = s.id || NAME;
        s.now = s.now || '2026-07-28T09:00:00Z';
        PAI.rand = mulberry32(s.seed == null ? 1 : s.seed);
        if (FROZEN) {
          var ms = Date.parse(s.now);
          Date.now = function () { return ms; };   // no wall clock, ever
          Math.random = PAI.rand;                  // no entropy, ever
          var st = document.createElement('style');
          st.id = 'baby-pai-freeze';
          st.textContent = '*,*::before,*::after{animation-duration:0s!important;'
            + 'animation-delay:0s!important;transition-duration:0s!important;'
            + 'transition-delay:0s!important;caret-color:transparent!important;'
            + 'scroll-behavior:auto!important}';
          document.head.appendChild(st);
        }
        PAI.state = derive(s);
        paint(PAI.state);
        PAI.ready = true;
        html.dataset.baby = 'ready';               // the renderer waits on this
        document.dispatchEvent(new CustomEvent('baby-pai:ready', { detail: PAI.state }));
      })
      .catch(function (e) { legacy(e.message); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
