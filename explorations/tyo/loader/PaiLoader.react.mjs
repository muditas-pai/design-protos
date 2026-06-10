import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  createPaiLoader,
  DEFAULT_PAI_LOADER_CONFIG,
  DEFAULT_PAI_LOADER_PHASES,
  PAI_LOADER_VARIANTS,
} from './pai-loader.mjs';

export {
  createPaiLoader,
  DEFAULT_PAI_LOADER_CONFIG,
  DEFAULT_PAI_LOADER_PHASES,
  PAI_LOADER_VARIANTS,
} from './pai-loader.mjs';

export const PAI_LOADER_MIN_SIZE = 20;

const normalizeSize = size => {
  const value = Number(size);
  return Number.isFinite(value) ? Math.max(PAI_LOADER_MIN_SIZE, value) : 120;
};

export const PaiLoader = forwardRef(function PaiLoader({
  phase = 'idle',
  size = 120,
  config,
  phases,
  className,
  style,
  ariaLabel = 'Loading',
  onPhaseChange,
}, ref) {
  const mountRef = useRef(null);
  const loaderRef = useRef(null);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const pixelSize = normalizeSize(size);

  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const loader = createPaiLoader(mountRef.current, {
      ariaLabel,
      config: {
        ...config,
        scale: pixelSize / 120,
      },
      phases,
    });

    loaderRef.current = loader;

    Object.assign(loader.el.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginLeft: '-60px',
      marginTop: '-60px',
    });

    const offPhaseChange = loader.on('phasechange', (nextPhase, variant, state) => {
      onPhaseChangeRef.current?.(nextPhase, variant, state);
    });

    return () => {
      offPhaseChange();
      loader.destroy();
      if (loaderRef.current === loader) loaderRef.current = null;
    };
  }, []);

  useEffect(() => {
    loaderRef.current?.setConfig({
      ...config,
      scale: pixelSize / 120,
    });
  }, [config, pixelSize]);

  useEffect(() => {
    if (!phases) return;
    loaderRef.current?.setPhases(phases);
    loaderRef.current?.setPhase(phase);
  }, [phases, phase]);

  useEffect(() => {
    if (loaderRef.current?.el) {
      loaderRef.current.el.setAttribute('aria-label', ariaLabel);
    }
  }, [ariaLabel]);

  useEffect(() => {
    loaderRef.current?.setPhase(phase);
  }, [phase]);

  useImperativeHandle(ref, () => ({
    setPhase: nextPhase => loaderRef.current?.setPhase(nextPhase),
    setConfig: nextConfig => loaderRef.current?.setConfig(nextConfig),
    setPhases: nextPhases => loaderRef.current?.setPhases(nextPhases),
    getPhase: () => loaderRef.current?.getPhase(),
    getVariant: () => loaderRef.current?.getVariant(),
    getState: () => loaderRef.current?.getState(),
    getConfig: () => loaderRef.current?.getConfig(),
    getElement: () => loaderRef.current?.el ?? null,
  }), []);

  return React.createElement('span', {
    ref: mountRef,
    className,
    style: {
      display: 'inline-block',
      width: pixelSize,
      height: pixelSize,
      position: 'relative',
      overflow: 'hidden',
      verticalAlign: 'middle',
      flex: '0 0 auto',
      ...style,
    },
  });
});

export default PaiLoader;
