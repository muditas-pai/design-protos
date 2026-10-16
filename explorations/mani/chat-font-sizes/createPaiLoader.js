/* Copied verbatim from pitchdeckdoclist src/chat/components/createPaiLoader.js (madhu_ui_v2); only the ES export is swapped for a window global. */
/* =====================================================================
   createPaiLoader(mount, options) — embeddable PAI logo/spinner loader
   driven by app-level phases (e.g. LLM lifecycle states).

   Ported from Theo's brand-loader prototype (design-protos/explorations/tyo)
   — the canonical createPaiLoader. The geometry, poses and keyframe maths are
   his, verbatim. Added here: a destroy() for React unmount (his version leaked
   the three injected <style> tags), plus a `destroyed` guard so deferred
   rAF/timeout callbacks no-op after teardown.

   API:
     loader.setPhase('thinking')      switch phase (variant resolved per phases map)
     loader.getPhase()                current phase name
     loader.getVariant()              spinner variant currently playing
     loader.setConfig({speed:2,...})  live-update any config value
     loader.on('phasechange', fn)     fn(phase, variant, state)
     loader.destroy()                 detach DOM + remove injected styles
     loader.phases                    the (mutable) phase -> presentation map

   Phases map values: { state:'logo' } or { state:'spinner', variant:<name>|'random' }
   Variants: classic | heartbeat | starburst
   ===================================================================== */
let __paiUid = 0;

function createPaiLoader(mount, options = {}) {
    /* ----- geometry from the Figma prototypes (120px tile) ----- */
    const N = 8, RADIUS = 29.25, DW = 19.5, DH = 15.6;
    const ROLE = { small: 3, big: 4, enter: 5 };
    const APPEAR_ORDER = [3, 4, 5, 6, 7, 0, 1, 2];
    const STAGGER = 0.08, MORPH = 0.55;
    const EXP = [41.4, 1], COL = [4, 0.8], NORM = [RADIUS, 1];
    const STAR_RING = [RADIUS, 1, 10, 8];
    const BURST = [13.5, 1, 58, DH];
    // Curated set: only the spinner motions we ship (plus the logo state).
    const VARIANTS = {
        classic: { steps: [NORM, NORM, NORM, NORM] },
        heartbeat: { steps: [NORM, COL, EXP, COL] },
        starburst: { steps: [STAR_RING, STAR_RING, BURST, STAR_RING] },
    };

    const cfg = Object.assign({
        speed: 1.5, hold: 0, slant: 25, radius: 2, scale: 1, spin: 40,
        easing: 'linear', color: '#2f2be5', background: 'transparent',
    }, options.config);

    const phases = Object.assign({
        idle: { state: 'logo' },
        thinking: { state: 'spinner', variant: 'classic' },
        searching: { state: 'spinner', variant: 'starburst' },
        reasoning: { state: 'spinner', variant: 'heartbeat' },
        generating: { state: 'spinner', variant: 'heartbeat' },
        done: { state: 'logo' },
    }, options.phases);

    // Logo "slides": the UNSKEWED rectangle is 16:9 (width:height = 16:9), then sheared
    // by the slant — so it reads as a 16:9 slide skewed a little, not a wide bar. Height
    // derives from width (tweak the width, height follows). The shear shortens the
    // element to h·(1−slant/100), so we pre-divide to keep the rectangle itself 16:9.
    const SLIDE_AR = 9 / 16;
    const slideH = (w) => +(w * SLIDE_AR / (1 - cfg.slant / 100)).toFixed(3);
    const slide = (x, y, w, o) => ({ x, y, w, h: slideH(w), o });
    const LOGO = {
        big: slide(21, 15.5, 72, 1),
        small: slide(21, 71.5, 45, 1),
        enter: slide(21, 108, 20, 0),
    };

    /* ----- DOM + scoped styles ----- */
    const ns = 'pai' + (++__paiUid);
    const el = document.createElement('div');
    el.className = `pai-loader ${ns}`;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', 'Loading');
    const ring = document.createElement('div');
    // `pai-ring`, not `ring`: the app's Tailwind defines a `.ring` utility (a blue
    // focus-ring box-shadow), which would otherwise paint a tilted blue square that
    // tracks the spin. Scoped name avoids that collision.
    ring.className = 'pai-ring';
    el.appendChild(ring);
    mount.appendChild(el);
    const dashes = [];
    for (let i = 0; i < N; i++) {
        const d = document.createElement('div');
        d.className = 'dash';
        ring.appendChild(d);
        dashes.push(d);
    }
    const styleStatic = document.head.appendChild(document.createElement('style'));
    const styleKf = document.head.appendChild(document.createElement('style'));
    const styleOrbit = document.head.appendChild(document.createElement('style'));
    styleStatic.textContent = `
    .${ns} { width:120px; height:120px; position:relative; overflow:hidden; transform-origin:center; }
    .${ns} .pai-ring { position:absolute; inset:0; transform-origin:50% 50%; }
    .${ns} .pai-ring.spin { animation:${ns}ringspin var(--speed) infinite; }
    .${ns} .dash { position:absolute; left:0; top:0; background:var(--blue); border-radius:var(--radius); transform-origin:50% 50%; will-change:transform,opacity; }
    .${ns} .dash.cascade { animation:${ns}cascade var(--speed) infinite; }
    .${ns} .dash.orbit { animation-duration:var(--orbitDur); animation-iteration-count:infinite; }
    .${ns}.morphing .dash { transition:transform var(--morph) var(--ease), width var(--morph) var(--ease), height var(--morph) var(--ease), opacity var(--morph) var(--ease); }
    .${ns}.morphing .pai-ring { transition:transform var(--morphTotal) var(--ease); }
  `;

    /* ----- poses -----
       Parallelograms are made with skewY (not clip-path) so border-radius works.
       For a target visual box w x h with slant s% of h, the element is a
       rectangle of height h-sh skewed by -atan(sh/w), shifted down sh/2 —
       this reproduces the clip-path polygon exactly. */
    const sk = (w, h) => {
        const sh = h * cfg.slant / 100;
        return { h2: h - sh, dy: sh / 2, ang: -(Math.atan2(sh, w) * 180 / Math.PI) };
    };
    const slotPose = i => {
        const a = i * 360 / N, r = a * Math.PI / 180, k = sk(DW, DH);
        return {
            t: `translate(${(60 + RADIUS * Math.cos(r) - DW / 2).toFixed(2)}px,${(60 + RADIUS * Math.sin(r) - k.h2 / 2).toFixed(2)}px) rotate(${a}deg) skewY(${k.ang.toFixed(2)}deg)`,
            w: DW, h: k.h2,
        };
    };
    const setStyle = (d, t, w, h, o) => { d.style.transform = t; d.style.width = w + 'px'; d.style.height = h + 'px'; d.style.opacity = o; };
    const applyLogoPose = i => {
        const role = Object.keys(ROLE).find(k => ROLE[k] === i);
        if (role) {
            const p = LOGO[role], k = sk(p.w, p.h);
            setStyle(dashes[i], `translate(${p.x}px,${(p.y + k.dy).toFixed(2)}px) skewY(${k.ang.toFixed(2)}deg)`, p.w, k.h2, p.o);
        } else { const s = slotPose(i); setStyle(dashes[i], s.t + ' scale(0.4)', s.w, s.h, 0); }
    };
    const applySpinnerPose = i => { const s = slotPose(i); setStyle(dashes[i], s.t, s.w, s.h, 1); };
    const orbitPose = (i, [r, sc, w = DW, h = DH]) => {
        const a = i * 360 / N, rad = a * Math.PI / 180, k = sk(w, h);
        return {
            t: `translate(${(60 + r * Math.cos(rad) - w / 2).toFixed(2)}px,${(60 + r * Math.sin(rad) - k.h2 / 2).toFixed(2)}px) rotate(${a}deg) scale(${sc}) skewY(${k.ang.toFixed(2)}deg)`,
            w, h: k.h2,
        };
    };
    const orbitStyle = (i, step) => {
        const p = orbitPose(i, step);
        return `transform:${p.t}; width:${p.w}px; height:${p.h.toFixed(2)}px; opacity:1;`;
    };

    /* ----- dynamic keyframes ----- */
    function buildCSS() {
        const ease = `animation-timing-function:${cfg.easing};`;
        const seg3 = 100 / 3, arr3 = k => (k * seg3 + seg3 * (100 - cfg.hold) / 100).toFixed(2);
        const cpose = (x, y, w, h, o) => {
            const k = sk(w, h);
            return `transform:translate(${x}px,${(y + k.dy).toFixed(2)}px) skewY(${k.ang.toFixed(2)}deg); width:${w}px; height:${k.h2.toFixed(2)}px; opacity:${o};`;
        };
        // Cascade poses are single-sourced from LOGO so the geometry (16:9, spacing)
        // lives in one place; the final pose shrinks the top slide as it scrolls off.
        let css = `@keyframes ${ns}cascade {
      0% { ${cpose(LOGO.enter.x, LOGO.enter.y, LOGO.enter.w, LOGO.enter.h, 0)} ${ease} }
      ${arr3(0)}%, 33.33% { ${cpose(LOGO.small.x, LOGO.small.y, LOGO.small.w, LOGO.small.h, 1)} ${ease} }
      ${arr3(1)}%, 66.67% { ${cpose(LOGO.big.x, LOGO.big.y, LOGO.big.w, LOGO.big.h, 1)} ${ease} }
      ${arr3(2)}%, 100% { ${cpose(LOGO.big.x, LOGO.big.y, 16, slideH(16), 0)} }
    }\n`;
        const SEGS = N + 1, seg = 100 / SEGS;
        const at = k => (k * seg).toFixed(3), arr = k => (k * seg + seg * (100 - cfg.hold) / 100).toFixed(3);
        css += `@keyframes ${ns}ringspin {\n`;
        for (let k = 0; k < SEGS; k++) {
            css += `${at(k)}% { transform: rotate(${k * cfg.spin}deg); ${ease} }\n`;
            css += `${arr(k)}%${k === SEGS - 1 ? ', 100%' : ''} { transform: rotate(${(k + 1) * cfg.spin}deg); }\n`;
        }
        css += '}\n';
        styleKf.textContent = css;
    }
    function buildOrbitCSS(v) {
        const def = VARIANTS[v] || VARIANTS.classic;
        const S = def.steps;
        const ease = `animation-timing-function:${cfg.easing};`;
        const seg = 25, arr = k => (k * seg + seg * (100 - cfg.hold) / 100).toFixed(2);
        let css = '';
        for (let i = 0; i < N; i++) {
            const shift = (def.offset || 0) * i;
            css += `@keyframes ${ns}orbit${i} {\n`;
            for (let k = 0; k < 4; k++) {
                css += `${k * seg}% { ${orbitStyle(i, S[(k + shift) % 4])} ${ease} }\n`;
                css += `${arr(k)}%${k === 3 ? ', 100%' : ''} { ${orbitStyle(i, S[(k + shift + 1) % 4])} }\n`;
            }
            css += '}\n';
        }
        styleOrbit.textContent = css;
    }

    /* ----- animation control ----- */
    const startCascade = () => {
        const delays = { [ROLE.enter]: 0, [ROLE.small]: -cfg.speed / 3, [ROLE.big]: -cfg.speed * 2 / 3 };
        Object.entries(delays).forEach(([i, d]) => {
            dashes[i].style.animationDelay = d + 's';
            dashes[i].classList.add('cascade');
        });
    };
    const stopCascade = () => [ROLE.enter, ROLE.small, ROLE.big].forEach(i => {
        dashes[i].classList.remove('cascade'); dashes[i].style.animationDelay = '';
    });
    const startOrbit = () => dashes.forEach((d, i) => { d.style.animationName = `${ns}orbit${i}`; d.classList.add('orbit'); });
    const stopOrbit = () => dashes.forEach(d => { d.classList.remove('orbit'); d.style.animationName = ''; });
    const freezeDashes = () => dashes.forEach(d => {
        const s = getComputedStyle(d);
        if (s.transform && s.transform !== 'none') d.style.transform = s.transform;
        d.style.width = s.width;
        d.style.height = s.height;
        d.style.opacity = s.opacity;
    });
    const morphTotal = () => (MORPH + (N - 1) * STAGGER) * 1000 + 60;

    /* ----- state machine ----- */
    let state = 'logo', phase = 'idle', variant = 'classic';
    let busy = false, wantSpinner = false, pendingPhase = null;
    let destroyed = false;
    const listeners = { phasechange: [] };
    const emit = () => listeners.phasechange.forEach(fn => fn(phase, state === 'spinner' ? variant : null, state));
    const drain = () => { if (pendingPhase) { const p = pendingPhase; pendingPhase = null; setPhase(p); } };

    function enterSpinner() {
        busy = true; wantSpinner = false;
        buildOrbitCSS(variant);
        stopCascade();
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (destroyed) return;
            el.classList.add('morphing');
            ring.classList.add('spin');
            APPEAR_ORDER.forEach((i, k) => dashes[i].style.transitionDelay = (k * STAGGER) + 's');
            dashes.forEach((_, i) => applySpinnerPose(i));
            setTimeout(() => {
                if (destroyed) return;
                el.classList.remove('morphing');
                dashes.forEach(d => d.style.transitionDelay = '');
                startOrbit();
                state = 'spinner'; busy = false; emit(); drain();
            }, morphTotal());
        }));
    }

    function enterLogo() {
        busy = true;
        freezeDashes(); stopOrbit();
        let angle = 0;
        const tf = getComputedStyle(ring).transform;
        if (tf && tf !== 'none') { const m = new DOMMatrix(tf); angle = (Math.atan2(m.b, m.a) * 180 / Math.PI + 360) % 360; }
        ring.classList.remove('spin');
        ring.style.transform = `rotate(${angle}deg)`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (destroyed) return;
            el.classList.add('morphing');
            ring.style.transform = 'rotate(360deg)';
            APPEAR_ORDER.slice().reverse().forEach((i, k) => dashes[i].style.transitionDelay = (k * STAGGER) + 's');
            dashes.forEach((_, i) => applyLogoPose(i));
            setTimeout(() => {
                if (destroyed) return;
                el.classList.remove('morphing');
                ring.style.transform = '';
                dashes.forEach(d => d.style.transitionDelay = '');
                startCascade();
                state = 'logo'; busy = false; emit(); drain();
            }, morphTotal());
        }));
    }

    // Spinner -> spinner with a different variant: regroup to the base ring, then
    // start the new pattern (keeps it smooth from any mid-pattern position).
    function switchVariant() {
        busy = true;
        freezeDashes(); stopOrbit();
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (destroyed) return;
            el.classList.add('morphing');
            dashes.forEach((_, i) => applySpinnerPose(i));
            setTimeout(() => {
                if (destroyed) return;
                el.classList.remove('morphing');
                buildOrbitCSS(variant);
                startOrbit();
                busy = false; emit(); drain();
            }, MORPH * 1000 + 60);
        }));
    }

    const pickRandom = () => {
        const keys = Object.keys(VARIANTS);
        let c;
        do { c = keys[Math.random() * keys.length | 0]; } while (c === variant && keys.length > 1);
        return c;
    };
    const resolveVariant = name => {
        if ((name || 'classic') === 'random') return pickRandom();
        return VARIANTS[name] ? name : 'classic';
    };

    function setPhase(name) {
        if (destroyed) return;
        const ph = phases[name];
        if (!ph) { console.warn('unknown phase:', name); return; }
        if (busy) { pendingPhase = name; return; }
        phase = name;
        if (ph.state === 'logo') {
            wantSpinner = false;
            if (state === 'logo') { emit(); return; }
            enterLogo();
        } else {
            const v = resolveVariant(ph.variant);
            if (state === 'spinner') {
                if (v === variant) { emit(); return; }
                variant = v;
                switchVariant();
            } else {
                variant = v;
                wantSpinner = true;   // morph at the next cascade loop boundary
            }
        }
    }

    // leave the logo only at a cascade boundary so the morph is seamless
    const onCascadeIteration = e => {
        if (e.target !== dashes[ROLE.enter] || state !== 'logo' || busy) return;
        if (wantSpinner) enterSpinner();
    };
    dashes[ROLE.enter].addEventListener('animationiteration', onCascadeIteration);

    function setConfig(partial) {
        if (destroyed) return;
        Object.assign(cfg, partial);
        el.style.setProperty('--speed', cfg.speed + 's');
        el.style.setProperty('--orbitDur', cfg.speed * 2 + 's');
        el.style.setProperty('--morph', MORPH + 's');
        el.style.setProperty('--morphTotal', (MORPH + (N - 1) * STAGGER) + 's');
        el.style.setProperty('--ease', cfg.easing);
        el.style.setProperty('--blue', cfg.color);
        el.style.setProperty('--radius', cfg.radius + 'px');
        el.style.background = cfg.background;
        el.style.transform = `scale(${cfg.scale})`;
        buildCSS();
        if (!busy) {
            if (state === 'logo') {
                dashes.forEach((_, i) => applyLogoPose(i));   // refresh poses (slant changes geometry)
                stopCascade(); void el.offsetWidth; startCascade();
            } else {
                dashes.forEach((_, i) => applySpinnerPose(i)); // refresh poses (slant changes geometry)
                buildOrbitCSS(variant);
                stopOrbit();
                ring.classList.remove('spin'); void ring.offsetWidth;
                ring.classList.add('spin'); startOrbit();
            }
        }
    }

    function destroy() {
        destroyed = true;
        dashes[ROLE.enter].removeEventListener('animationiteration', onCascadeIteration);
        el.remove();
        styleStatic.remove();
        styleKf.remove();
        styleOrbit.remove();
    }

    /* ----- init ----- */
    dashes.forEach((_, i) => applyLogoPose(i));
    setConfig({});
    startCascade();

    return {
        el, phases,
        setPhase, setConfig, destroy,
        getPhase: () => phase,
        getVariant: () => (state === 'spinner' ? variant : null),
        getState: () => state,
        getConfig: () => ({ ...cfg }),
        on: (ev, fn) => { (listeners[ev] || (listeners[ev] = [])).push(fn); },
    };
}
window.createPaiLoader = createPaiLoader;
