/* Relay: moves messages between the slideshow screen (laptop) and phone remotes.

   Two modes, picked automatically:
   - "server": served by server.py (local Wi-Fi or a tunnel). Long-polling + POST.
   - "mqtt":   static hosting (GitHub Pages). A public MQTT broker over secure WebSocket.
               No server of our own. Presence uses retained messages and last-will,
               the latest slide state is a retained message, so a phone that joins
               late sees the current slide at once.

   API (both modes):
     await Relay.init()                      -> "server" | "mqtt"
     Relay.codeLength                        -> 4 (server) or 6 (mqtt)
     await Relay.pair(savedCode)             -> code
     await Relay.remoteUrl()                 -> base link the QR code opens
     Relay.listen({code, role, cid, name, onMsg, onOnline, onGone})
     Relay.send(msg)                         -> sends as the listening role
     await Relay.check(code)                 -> "ok" | "nocode" | "net"   (phone, before joining)
     await Relay.end(code)                   -> screen: forget this code, tell phones
     Relay.leave()                           -> stop listening (remote: says bye)
     Relay.closing(msg)                      -> last message on page close (screen)
*/
(function () {
  const NS = 'pai-slideshow-remote/v1';
  const BROKER = 'wss://broker.emqx.io:8084/mqtt';
  const MQTT_JS = 'https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let mode = null, cur = null; // cur = { code, role, cid, ... } of the active listener

  async function init() {
    if (mode) return mode;
    try {
      const r = await fetch('/api/info', { cache: 'no-store' });
      if (r.ok && (r.headers.get('content-type') || '').includes('json')) mode = 'server';
    } catch (e) {}
    if (!mode) { mode = 'mqtt'; await loadScript(MQTT_JS); }
    R.codeLength = mode === 'server' ? 4 : 6;
    return mode;
  }
  function loadScript(src) {
    if (window.mqtt) return Promise.resolve();
    return new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  }

  /* ================= server mode ================= */
  const post = (path, body) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}), keepalive: true });
  const SV = {
    async pair(saved) { const j = await (await post('/api/pair', { code: saved })).json(); if (!j.code) throw new Error('no code'); return j.code; },
    async remoteUrl() {
      const i = await (await fetch('/api/info')).json();
      const local = /^(localhost|127\.|\[::1\])/.test(location.hostname);
      return (local ? `http://${i.lan}:${i.port}` : location.origin) + '/r';
    },
    listen(o) {
      const gen = (o.gen = Math.random());
      (async () => {
        let fails = 0, misses = 0, online = false;
        const setOnline = v => { if (v !== online) { online = v; o.onOnline && o.onOnline(v); } };
        while (cur === o && o.gen === gen) {
          try {
            const r = await fetch(`/api/poll?code=${o.code}&role=${o.role}&cid=${o.cid}&name=${encodeURIComponent(o.name || '')}`);
            if (r.status === 404) {
              setOnline(false);
              if (o.role === 'screen') { await post('/api/pair', { code: o.code }); continue; } // server restarted: same code again
              if (++misses > 6) { o.onGone && o.onGone(); break; } // give the laptop about 12 seconds to come back
              await sleep(2000); continue;
            }
            const j = await r.json(); fails = 0; misses = 0; setOnline(true);
            (j.msgs || []).forEach(m => cur === o && o.onMsg(m));
            if (j.closed) break;
          } catch (e) { setOnline(false); fails++; await sleep(Math.min(5000, 1000 * fails)); }
        }
      })();
    },
    send(o, msg) { return post('/api/send', { code: o.code, role: o.role, cid: o.cid, msg }).then(r => r.status).catch(() => 0); },
    async check(code) {
      try { const r = await post('/api/send', { code, role: 'remote', msg: { type: 'cmd', action: 'sync' } }); return r.status === 404 ? 'nocode' : r.ok ? 'ok' : 'net'; }
      catch (e) { return 'net'; }
    },
    async end(code) { await post('/api/end', { code }).catch(() => {}); },
    leave(o) { if (o.role === 'remote') SV.send(o, { type: 'bye' }); },
    closing(o, msg) { navigator.sendBeacon && navigator.sendBeacon('/api/send', new Blob([JSON.stringify({ code: o.code, role: o.role, cid: o.cid, msg })], { type: 'application/json' })); }
  };

  /* ================= mqtt mode ================= */
  const T = (code, leaf) => `${NS}/${code}/${leaf}`;
  const MQ = {
    async pair(saved) {
      if (saved && /^\d{6}$/.test(saved)) return saved;
      return String(Math.floor(Math.random() * 900000) + 100000);
    },
    async remoteUrl() { return new URL('remote.html', location.href).href.split('?')[0]; },
    listen(o) {
      const presence = o.role === 'screen' ? T(o.code, 'screen') : T(o.code, `remotes/${o.cid}`);
      const names = {};
      const c = (o.client = window.mqtt.connect(BROKER, {
        clientId: `pai_${o.role[0]}_${o.cid}_${Math.random().toString(36).slice(2, 6)}`,
        clean: true, keepalive: 15, reconnectPeriod: 1500, connectTimeout: 10000,
        will: { topic: presence, payload: '', retain: true, qos: 1 } // the broker clears our presence if we vanish
      }));
      c.on('connect', () => {
        o.onOnline && o.onOnline(true);
        const subs = o.role === 'screen'
          ? [T(o.code, 'to-screen'), T(o.code, 'remotes/+')]
          : [T(o.code, 'to-remote'), T(o.code, 'state'), T(o.code, 'screen')];
        c.subscribe(subs, { qos: 1 });
        c.publish(presence, o.role === 'screen' ? '1' : JSON.stringify({ name: o.name || 'Phone' }), { retain: true, qos: 1 });
        if (o.role === 'screen') o.onMsg({ type: 'hello', remotes: [] }); // retained phone presences follow as quiet joins
      });
      c.on('offline', () => o.onOnline && o.onOnline(false));
      c.on('close', () => o.onOnline && o.onOnline(false));
      c.on('message', (topic, payload, packet) => {
        if (cur !== o) return;
        const s = payload.toString(), leaf = topic.slice(T(o.code, '').length);
        if (leaf.startsWith('remotes/')) {
          const id = leaf.slice(8);
          if (s) { let n = 'Phone'; try { n = JSON.parse(s).name || n; } catch (e) {} names[id] = n; o.onMsg({ type: 'remote-joined', id, name: n, quiet: packet.retain }); }
          else if (!packet.retain) o.onMsg({ type: 'remote-left', id, name: names[id] || 'Phone' });
          return;
        }
        if (leaf === 'screen') { o.onMsg({ type: s === '1' ? 'screen-back' : 'screen-left' }); return; }
        if (!s) return;
        try { o.onMsg(JSON.parse(s)); } catch (e) {}
      });
    },
    send(o, msg) {
      const c = o.client; if (!c) return Promise.resolve(0);
      if (o.role === 'screen') {
        const s = JSON.stringify(msg);
        c.publish(T(o.code, 'to-remote'), s, { qos: 0 });
        if (msg.type === 'state') c.publish(T(o.code, 'state'), s, { retain: true, qos: 1 }); // late joiners get the current slide
      } else if (msg.type === 'cmd' || msg.type === 'pointer') {
        c.publish(T(o.code, 'to-screen'), JSON.stringify(msg), { qos: msg.type === 'cmd' ? 1 : 0 });
      }
      return Promise.resolve(200);
    },
    check(code) {
      /* a code is active when a slideshow screen has announced itself on it */
      return new Promise(res => {
        let done = false;
        const c = window.mqtt.connect(BROKER, { clientId: `pai_k_${Math.random().toString(36).slice(2, 10)}`, clean: true, connectTimeout: 10000, reconnectPeriod: 0 });
        const finish = v => { if (done) return; done = true; clearTimeout(t); c.end(true); res(v); };
        const t = setTimeout(() => finish(c.connected ? 'nocode' : 'net'), 5000);
        c.on('connect', () => c.subscribe(T(code, 'screen'), { qos: 1 }));
        c.on('message', (tp, p) => finish(p.toString() === '1' ? 'ok' : 'nocode'));
        c.on('error', () => finish('net'));
      });
    },
    async end(code) {
      const o = cur; if (!o || !o.client || o.code !== code) return;
      o.client.publish(T(code, 'to-remote'), JSON.stringify({ type: 'ended-session' }), { qos: 1 });
      o.client.publish(T(code, 'state'), '', { retain: true, qos: 1 });
    },
    leave(o) {
      if (!o.client) return;
      o.client.publish(o.role === 'screen' ? T(o.code, 'screen') : T(o.code, `remotes/${o.cid}`), '', { retain: true, qos: 1 }, () => o.client.end());
      setTimeout(() => o.client && o.client.end(true), 1500);
    },
    closing(o, msg) { if (o.client) { MQ.send(o, msg); MQ.leave(o); } }
  };

  const impl = () => (mode === 'server' ? SV : MQ);
  const R = window.Relay = {
    codeLength: 4,
    init,
    get mode() { return mode; },
    pair: saved => impl().pair(saved),
    remoteUrl: () => impl().remoteUrl(),
    check: code => impl().check(code),
    listen(o) { if (cur) R.leave(true); cur = o; impl().listen(o); },
    send: msg => (cur ? impl().send(cur, msg) : Promise.resolve(0)),
    end: code => impl().end(code),
    leave(quiet) { const o = cur; cur = null; if (o) (quiet && mode === 'server') || impl().leave(o); },
    closing: msg => { if (cur) impl().closing(cur, msg); }
  };
})();
