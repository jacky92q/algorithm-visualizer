import { useEffect, useRef } from 'react';
import type { Algorithm, BaseStep, RenderCtx } from '../core/types';
import { PALETTE } from '../core/palette';
import { paperGrid } from '../core/draw';
import { clamp } from '../core/easing';

interface Props {
  algorithm: Algorithm<BaseStep>;
  steps: BaseStep[];
  index: number;
  /** transition duration in ms for step → step tween */
  transitionMs?: number;
}

export default function CanvasStage({ algorithm, steps, index, transitionMs = 480 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef(algorithm.createRenderer());
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const animRef = useRef({ start: performance.now(), index: index });
  const indexRef = useRef(index);
  const mountRef = useRef(performance.now());

  // recreate renderer when algorithm changes
  useEffect(() => {
    rendererRef.current = algorithm.createRenderer();
  }, [algorithm]);

  // restart tween whenever the step index changes
  useEffect(() => {
    animRef.current = { start: performance.now(), index };
    indexRef.current = index;
  }, [index]);

  // resize handling
  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // render loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const frame = () => {
      const now = performance.now();
      const { w, h, dpr } = sizeRef.current;
      const t = clamp((now - animRef.current.start) / transitionMs, 0, 1);
      const time = (now - mountRef.current) / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, PALETTE.paper);
      grad.addColorStop(1, PALETTE.cream2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      paperGrid(ctx, w, h, time, 'rgba(111,78,55,0.05)');

      const i = indexRef.current;
      const curr = steps[i];
      const prev = i > 0 ? steps[i - 1] : null;
      if (curr) {
        const rc: RenderCtx = { ctx, width: w, height: h, t, time, dpr, palette: PALETTE };
        try {
          rendererRef.current.draw(rc, prev, curr);
        } catch {
          /* renderer guard — never break the loop */
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [steps, transitionMs]);

  return (
    <div className="canvas-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} className="stage-canvas" />
    </div>
  );
}
