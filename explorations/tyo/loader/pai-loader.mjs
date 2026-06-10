let paiLoaderUid = 0;

const N = 8;
const TILE = 120;
const CENTER = 60;
const RADIUS = 29.25;
const DW = 19.5;
const DH = 15.6;
const STAGGER = 0.08;
const MORPH = 0.55;

const LOGO = {
  big: { x: 21, y: 21, w: 72, h: 54, o: 1 },
  small: { x: 21, y: 69, w: 45, h: 33, o: 1 },
  enter: { x: 21, y: 101, w: 20, h: 15, o: 0 },
};

const ROLE = { small: 3, big: 4, enter: 5 };
const APPEAR_ORDER = [3, 4, 5, 6, 7, 0, 1, 2];

const EXP = [41.4, 1];
const COL = [4, 0.8];
const NORM = [RADIUS, 1];
const STAR_RING = [RADIUS, 1, 10, 8];
const BURST = [13.5, 1, 58, DH];
const SOFT_OUT = [35.5, 1.02];
const SOFT_IN = [19, 0.92];
const TIGHT = [10, 0.86];

const VARIANT_DEFS = {
  classic: { steps: [NORM, NORM, NORM, NORM] },
  pulseOut: { steps: [NORM, NORM, EXP, EXP] },
  pulseIn: { steps: [NORM, NORM, COL, COL] },
  heartbeat: { steps: [NORM, COL, EXP, COL] },
  expandCollapse: { steps: [NORM, EXP, EXP, COL] },
  breathe: { steps: [NORM, SOFT_OUT, EXP, SOFT_OUT] },
  focus: { steps: [NORM, SOFT_IN, COL, SOFT_IN] },
  squeeze: { steps: [SOFT_OUT, NORM, TIGHT, COL], offset: 2 },
  starburst: { steps: [STAR_RING, STAR_RING, BURST, STAR_RING] },
};

export const PAI_LOADER_VARIANTS = Object.freeze(Object.keys(VARIANT_DEFS));

export const DEFAULT_PAI_LOADER_CONFIG = Object.freeze({
  speed: 1.5,
  hold: 0,
  slant: 25,
  radius: 2,
  scale: 1,
  spin: 40,
  easing: 'linear',
  color: '#2f2be5',
  background: 'transparent',
});

export const DEFAULT_PAI_LOADER_PHASES = Object.freeze({
  idle: { state: 'logo' },
  thinking: { state: 'spinner', variant: 'random' },
  searching: { state: 'spinner', variant: 'pulseOut' },
  reasoning: { state: 'spinner', variant: 'heartbeat' },
  generating: { state: 'spinner', variant: 'expandCollapse' },
  done: { state: 'logo' },
});

const clonePhases = phases => Object.fromEntries(
  Object.entries(phases || {}).map(([key, value]) => [key, { ...value }]),
);

export function createPaiLoader(mount, options = {}) {
  if (!mount) throw new Error('createPaiLoader requires a mount element.');

  const cfg = Object.assign({}, DEFAULT_PAI_LOADER_CONFIG, options.config);
  const phases = Object.assign(
    clonePhases(DEFAULT_PAI_LOADER_PHASES),
    clonePhases(options.phases),
  );

  const ns = 'pai' + (++paiLoaderUid);
  const el = document.createElement('div');
  el.className = `pai-loader ${ns}`;
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', options.ariaLabel || 'Loading');

  const ring = document.createElement('div');
  ring.className = 'ring';
  el.appendChild(ring);
  mount.appendChild(el);

  const dashes = [];
  for (let i = 0; i < N; i++) {
    const dash = document.createElement('div');
    dash.className = 'dash';
    ring.appendChild(dash);
    dashes.push(dash);
  }

  const styleStatic = document.head.appendChild(document.createElement('style'));
  const styleKf = document.head.appendChild(document.createElement('style'));
  const styleOrbit = document.head.appendChild(document.createElement('style'));

  styleStatic.textContent = `
    .${ns} { width:${TILE}px; height:${TILE}px; position:relative; overflow:hidden; transform-origin:center; }
    .${ns} .ring { position:absolute; inset:0; transform-origin:50% 50%; }
    .${ns} .ring.spin { animation:${ns}ringspin var(--speed) infinite; }
    .${ns} .dash { position:absolute; left:0; top:0; background:var(--blue); border-radius:var(--radius); transform-origin:50% 50%; will-change:transform,opacity; }
    .${ns} .dash.cascade { animation:${ns}cascade var(--speed) infinite; }
    .${ns} .dash.orbit { animation-duration:var(--orbitDur); animation-iteration-count:infinite; }
    .${ns}.morphing .dash { transition:transform var(--morph) var(--ease), width var(--morph) var(--ease), height var(--morph) var(--ease), opacity var(--morph) var(--ease); }
    .${ns}.morphing .ring { transition:transform var(--morphTotal) var(--ease); }
  `;

  let state = 'logo';
  let phase = 'idle';
  let variant = 'classic';
  let busy = false;
  let wantSpinner = false;
  let pendingPhase = null;
  let destroyed = false;

  const timers = new Set();
  const rafs = new Set();
  const listeners = { phasechange: [] };

  const frame = fn => {
    const id = requestAnimationFrame(() => {
      rafs.delete(id);
      if (!destroyed) fn();
    });
    rafs.add(id);
    return id;
  };

  const delay = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      if (!destroyed) fn();
    }, ms);
    timers.add(id);
    return id;
  };

  const sk = (w, h) => {
    const sh = h * cfg.slant / 100;
    return {
      h2: h - sh,
      dy: sh / 2,
      ang: -(Math.atan2(sh, w) * 180 / Math.PI),
    };
  };

  const setStyle = (dash, transform, width, height, opacity) => {
    dash.style.transform = transform;
    dash.style.width = width + 'px';
    dash.style.height = height + 'px';
    dash.style.opacity = opacity;
  };

  const slotPose = i => {
    const angle = i * 360 / N;
    const rad = angle * Math.PI / 180;
    const k = sk(DW, DH);
    return {
      t: `translate(${(CENTER + RADIUS * Math.cos(rad) - DW / 2).toFixed(2)}px,${(CENTER + RADIUS * Math.sin(rad) - k.h2 / 2).toFixed(2)}px) rotate(${angle}deg) skewY(${k.ang.toFixed(2)}deg)`,
      w: DW,
      h: k.h2,
    };
  };

  const applyLogoPose = i => {
    const role = Object.keys(ROLE).find(key => ROLE[key] === i);
    if (role) {
      const pose = LOGO[role];
      const k = sk(pose.w, pose.h);
      setStyle(
        dashes[i],
        `translate(${pose.x}px,${(pose.y + k.dy).toFixed(2)}px) skewY(${k.ang.toFixed(2)}deg)`,
        pose.w,
        k.h2,
        pose.o,
      );
      return;
    }

    const pose = slotPose(i);
    setStyle(dashes[i], pose.t + ' scale(0.4)', pose.w, pose.h, 0);
  };

  const applySpinnerPose = i => {
    const pose = slotPose(i);
    setStyle(dashes[i], pose.t, pose.w, pose.h, 1);
  };

  const orbitPose = (i, [r, scale, w = DW, h = DH]) => {
    const angle = i * 360 / N;
    const rad = angle * Math.PI / 180;
    const k = sk(w, h);
    return {
      t: `translate(${(CENTER + r * Math.cos(rad) - w / 2).toFixed(2)}px,${(CENTER + r * Math.sin(rad) - k.h2 / 2).toFixed(2)}px) rotate(${angle}deg) scale(${scale}) skewY(${k.ang.toFixed(2)}deg)`,
      w,
      h: k.h2,
    };
  };

  const orbitStyle = (i, step) => {
    const pose = orbitPose(i, step);
    return `transform:${pose.t}; width:${pose.w}px; height:${pose.h.toFixed(2)}px; opacity:1;`;
  };

  function buildCSS() {
    const ease = `animation-timing-function:${cfg.easing};`;
    const seg3 = 100 / 3;
    const arr3 = k => (k * seg3 + seg3 * (100 - cfg.hold) / 100).toFixed(2);
    const cpose = (x, y, w, h, opacity) => {
      const k = sk(w, h);
      return `transform:translate(${x}px,${(y + k.dy).toFixed(2)}px) skewY(${k.ang.toFixed(2)}deg); width:${w}px; height:${k.h2.toFixed(2)}px; opacity:${opacity};`;
    };

    let css = `@keyframes ${ns}cascade {
      0% { ${cpose(21, 101, 20, 15, 0)} ${ease} }
      ${arr3(0)}%, 33.33% { ${cpose(21, 69, 45, 33, 1)} ${ease} }
      ${arr3(1)}%, 66.67% { ${cpose(21, 21, 72, 54, 1)} ${ease} }
      ${arr3(2)}%, 100% { ${cpose(21, 21, 16, 12, 0)} }
    }\n`;

    const SEGS = N + 1;
    const seg = 100 / SEGS;
    const at = k => (k * seg).toFixed(3);
    const arr = k => (k * seg + seg * (100 - cfg.hold) / 100).toFixed(3);

    css += `@keyframes ${ns}ringspin {\n`;
    for (let k = 0; k < SEGS; k++) {
      css += `${at(k)}% { transform: rotate(${k * cfg.spin}deg); ${ease} }\n`;
      css += `${arr(k)}%${k === SEGS - 1 ? ', 100%' : ''} { transform: rotate(${(k + 1) * cfg.spin}deg); }\n`;
    }
    css += '}\n';
    styleKf.textContent = css;
  }

  function buildOrbitCSS(name) {
    const def = VARIANT_DEFS[name] || VARIANT_DEFS.classic;
    const steps = def.steps;
    const ease = `animation-timing-function:${cfg.easing};`;
    const seg = 25;
    const arr = k => (k * seg + seg * (100 - cfg.hold) / 100).toFixed(2);
    let css = '';

    for (let i = 0; i < N; i++) {
      const shift = (def.offset || 0) * i;
      css += `@keyframes ${ns}orbit${i} {\n`;
      for (let k = 0; k < 4; k++) {
        css += `${k * seg}% { ${orbitStyle(i, steps[(k + shift) % 4])} ${ease} }\n`;
        css += `${arr(k)}%${k === 3 ? ', 100%' : ''} { ${orbitStyle(i, steps[(k + shift + 1) % 4])} }\n`;
      }
      css += '}\n';
    }

    styleOrbit.textContent = css;
  }

  const startCascade = () => {
    const delays = {
      [ROLE.enter]: 0,
      [ROLE.small]: -cfg.speed / 3,
      [ROLE.big]: -cfg.speed * 2 / 3,
    };
    Object.entries(delays).forEach(([i, d]) => {
      dashes[i].style.animationDelay = d + 's';
      dashes[i].classList.add('cascade');
    });
  };

  const stopCascade = () => [ROLE.enter, ROLE.small, ROLE.big].forEach(i => {
    dashes[i].classList.remove('cascade');
    dashes[i].style.animationDelay = '';
  });

  const startOrbit = () => dashes.forEach((dash, i) => {
    dash.style.animationName = `${ns}orbit${i}`;
    dash.classList.add('orbit');
  });

  const stopOrbit = () => dashes.forEach(dash => {
    dash.classList.remove('orbit');
    dash.style.animationName = '';
  });

  const freezeDashes = () => dashes.forEach(dash => {
    const style = getComputedStyle(dash);
    if (style.transform && style.transform !== 'none') dash.style.transform = style.transform;
    dash.style.width = style.width;
    dash.style.height = style.height;
    dash.style.opacity = style.opacity;
  });

  const morphTotal = () => (MORPH + (N - 1) * STAGGER) * 1000 + 60;

  const emit = () => {
    if (destroyed) return;
    listeners.phasechange.forEach(fn => fn(phase, state === 'spinner' ? variant : null, state));
  };

  const drain = () => {
    if (!pendingPhase) return;
    const next = pendingPhase;
    pendingPhase = null;
    setPhase(next);
  };

  function enterSpinner() {
    busy = true;
    wantSpinner = false;
    buildOrbitCSS(variant);
    stopCascade();

    frame(() => frame(() => {
      el.classList.add('morphing');
      ring.classList.add('spin');
      APPEAR_ORDER.forEach((i, k) => {
        dashes[i].style.transitionDelay = (k * STAGGER) + 's';
      });
      dashes.forEach((_, i) => applySpinnerPose(i));

      delay(() => {
        el.classList.remove('morphing');
        dashes.forEach(dash => {
          dash.style.transitionDelay = '';
        });
        startOrbit();
        state = 'spinner';
        busy = false;
        emit();
        drain();
      }, morphTotal());
    }));
  }

  function enterLogo() {
    busy = true;
    freezeDashes();
    stopOrbit();

    let angle = 0;
    const tf = getComputedStyle(ring).transform;
    if (tf && tf !== 'none') {
      const matrix = new DOMMatrix(tf);
      angle = (Math.atan2(matrix.b, matrix.a) * 180 / Math.PI + 360) % 360;
    }

    ring.classList.remove('spin');
    ring.style.transform = `rotate(${angle}deg)`;

    frame(() => frame(() => {
      el.classList.add('morphing');
      ring.style.transform = 'rotate(360deg)';
      APPEAR_ORDER.slice().reverse().forEach((i, k) => {
        dashes[i].style.transitionDelay = (k * STAGGER) + 's';
      });
      dashes.forEach((_, i) => applyLogoPose(i));

      delay(() => {
        el.classList.remove('morphing');
        ring.style.transform = '';
        dashes.forEach(dash => {
          dash.style.transitionDelay = '';
        });
        startCascade();
        state = 'logo';
        busy = false;
        emit();
        drain();
      }, morphTotal());
    }));
  }

  function switchVariant() {
    busy = true;
    freezeDashes();
    stopOrbit();

    frame(() => frame(() => {
      el.classList.add('morphing');
      dashes.forEach((_, i) => applySpinnerPose(i));

      delay(() => {
        el.classList.remove('morphing');
        buildOrbitCSS(variant);
        startOrbit();
        busy = false;
        emit();
        drain();
      }, MORPH * 1000 + 60);
    }));
  }

  const pickRandom = () => {
    let choice;
    do {
      choice = PAI_LOADER_VARIANTS[Math.random() * PAI_LOADER_VARIANTS.length | 0];
    } while (choice === variant && PAI_LOADER_VARIANTS.length > 1);
    return choice;
  };

  const resolveVariant = name => {
    if ((name || 'classic') === 'random') return pickRandom();
    return VARIANT_DEFS[name] ? name : 'classic';
  };

  function setPhase(name) {
    if (destroyed) return;
    const ph = phases[name];
    if (!ph) {
      console.warn('unknown phase:', name);
      return;
    }
    if (busy) {
      pendingPhase = name;
      return;
    }

    phase = name;
    if (ph.state === 'logo') {
      wantSpinner = false;
      if (state === 'logo') {
        emit();
        return;
      }
      enterLogo();
      return;
    }

    const nextVariant = resolveVariant(ph.variant);
    if (state === 'spinner') {
      if (nextVariant === variant) {
        emit();
        return;
      }
      variant = nextVariant;
      switchVariant();
      return;
    }

    variant = nextVariant;
    wantSpinner = true;
  }

  const handleCascadeIteration = event => {
    if (event.target !== dashes[ROLE.enter] || state !== 'logo' || busy) return;
    if (wantSpinner) enterSpinner();
  };

  dashes[ROLE.enter].addEventListener('animationiteration', handleCascadeIteration);

  function setConfig(partial = {}) {
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

    if (busy) return;
    if (state === 'logo') {
      dashes.forEach((_, i) => applyLogoPose(i));
      stopCascade();
      void el.offsetWidth;
      startCascade();
    } else {
      dashes.forEach((_, i) => applySpinnerPose(i));
      buildOrbitCSS(variant);
      stopOrbit();
      ring.classList.remove('spin');
      void ring.offsetWidth;
      ring.classList.add('spin');
      startOrbit();
    }
  }

  function setPhases(nextPhases = {}) {
    if (destroyed) return;
    Object.entries(nextPhases).forEach(([key, value]) => {
      phases[key] = { ...value };
    });
  }

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
    return () => off(event, fn);
  }

  function off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(listener => listener !== fn);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    timers.forEach(id => clearTimeout(id));
    rafs.forEach(id => cancelAnimationFrame(id));
    timers.clear();
    rafs.clear();
    dashes[ROLE.enter].removeEventListener('animationiteration', handleCascadeIteration);
    styleStatic.remove();
    styleKf.remove();
    styleOrbit.remove();
    el.remove();
    Object.keys(listeners).forEach(key => {
      listeners[key] = [];
    });
  }

  dashes.forEach((_, i) => applyLogoPose(i));
  setConfig({});
  startCascade();

  return {
    el,
    phases,
    setPhase,
    setConfig,
    setPhases,
    getPhase: () => phase,
    getVariant: () => (state === 'spinner' ? variant : null),
    getState: () => state,
    getConfig: () => ({ ...cfg }),
    on,
    off,
    destroy,
  };
}
