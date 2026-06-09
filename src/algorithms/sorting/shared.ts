import type { BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text, line } from '../../core/draw';
import { easeInOutCubic, lerp, clamp } from '../../core/easing';
import { mixHex, rgba } from '../../core/palette';

export interface SortStep extends BaseStep {
  slots: number[];
  values: number[];
  compare?: number[];
  swap?: number[];
  pivot?: number;
  sorted?: number[];
  highlight?: number[];
  pointers?: Record<string, number>;
}

export function parseInts(input: string, fallback: number[]): number[] {
  const nums = input
    .split(/[\s,]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n));
  const arr = nums.length ? nums : fallback;
  return arr.slice(0, 14).map((n) => clamp(n, 1, 99));
}

const ROLE = {
  base1: '#C9A87C',
  base2: '#A8835E',
  sorted1: '#5FC3B6',
  sorted2: '#2A9D8F',
  pivot1: '#EAB861',
  pivot2: '#C9821C',
  compare1: '#EC9275',
  compare2: '#C85A3A',
  high1: '#B98C66',
  high2: '#6F4E37',
};

export class SortBarsRenderer implements Renderer<SortStep> {
  draw(rc: RenderCtx, prev: SortStep | null, curr: SortStep): void {
    const { ctx, width, height, time } = rc;
    const n = curr.slots.length;
    const maxVal = Math.max(...curr.values, 1);

    // Layout constants — padBottom must be big enough for:
    //   slot-index labels  (+28)
    //   pointer arrows     (+50)
    //   pointer labels     (+66)
    const padX = Math.max(28, width * 0.06);
    const padTop = 56;       // room for value chip above the tallest bar
    const padBottom = 100;   // room for labels/pointers below the baseline
    const usableW = width - padX * 2;
    const slotW = usableW / n;
    const barW = Math.min(slotW * 0.68, 64);
    const baseY = height - padBottom;       // the visible floor line
    const maxBarH = baseY - padTop;

    const slotX = (slot: number) => padX + slotW * slot + slotW / 2;
    const e = easeInOutCubic(rc.t);

    // floor line
    line(ctx, padX - 6, baseY, width - padX + 6, baseY,
      rgba('#6F4E37', 0.18), 1.5, [3, 8]);

    const prevSlotOf = (id: number) => {
      if (!prev) return curr.slots.indexOf(id);
      const p = prev.slots.indexOf(id);
      return p === -1 ? curr.slots.indexOf(id) : p;
    };

    const inSet = (arr: number[] | undefined, id: number) => !!arr && arr.includes(id);

    for (let id = 0; id < n; id++) {
      const v = curr.values[id];
      const slotNow = curr.slots.indexOf(id);
      const slotWas = prevSlotOf(id);
      const x = lerp(slotX(slotWas), slotX(slotNow), e);
      const barH = Math.max(12, (v / maxVal) * maxBarH);

      const isSwap    = inSet(curr.swap,      id);
      const isCompare = inSet(curr.compare,   id);
      const isSorted  = inSet(curr.sorted,    id);
      const isPivot   = curr.pivot === id;
      const isHigh    = inSet(curr.highlight, id);

      // vertical hop while swapping
      const hop = isSwap ? Math.sin(e * Math.PI) * 20 : 0;
      const top = baseY - barH - hop;   // bar top (bar ends exactly at baseY)

      let c1 = ROLE.base1;
      let c2 = ROLE.base2;
      let glow = '';
      if (isSorted) {
        c1 = ROLE.sorted1; c2 = ROLE.sorted2;
        glow = rgba('#2A9D8F', 0.5);
      } else if (isPivot) {
        c1 = ROLE.pivot1; c2 = ROLE.pivot2;
        glow = rgba('#E0A33B', 0.55);
      } else if (isSwap || isCompare) {
        c1 = ROLE.compare1; c2 = ROLE.compare2;
        glow = rgba('#E07856', 0.5);
      } else if (isHigh) {
        c1 = ROLE.high1; c2 = ROLE.high2;
      }

      const grad = ctx.createLinearGradient(0, top, 0, baseY);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);

      // bar body — ends cleanly at baseY (no floor extension)
      ctx.save();
      if (glow) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 4);
        ctx.shadowColor = glow;
        ctx.shadowBlur = (isPivot ? 28 : 20) * pulse;
      } else {
        ctx.shadowColor = 'rgba(74,53,40,0.16)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
      }
      // Top-only rounded corners so bar sits flush on the baseline
      const r = 11;
      ctx.beginPath();
      ctx.moveTo(x - barW / 2 + r, top);
      ctx.arcTo(x + barW / 2, top, x + barW / 2, top + r, r);
      ctx.lineTo(x + barW / 2, baseY);
      ctx.lineTo(x - barW / 2, baseY);
      ctx.lineTo(x - barW / 2, top + r);
      ctx.arcTo(x - barW / 2, top, x - barW / 2 + r, top, r);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // glossy top sheen
      ctx.save();
      ctx.globalAlpha = 0.18;
      roundRect(ctx, x - barW / 2 + 4, top + 4, barW - 8, Math.min(barH * 0.35, 22), 7);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();

      // value chip — always above the bar with enough room
      const chipY = top - 16;
      text(ctx, String(v), x, Math.max(chipY, padTop - 10), {
        size: clamp(barW * 0.44, 13, 21),
        weight: 800,
        color: isSorted ? '#1E7A6F' : isPivot ? '#C9821C' : '#4A3528',
        font: "'Plus Jakarta Sans', sans-serif",
      });

      // slot-index label — well below the baseline
      text(ctx, String(slotNow), x, baseY + 28, {
        size: 12,
        weight: 600,
        color: mixHex('#9A8B70', '#6F4E37', 0.3),
      });
    }

    // named pointers (i, j, min, pivot …)
    if (curr.pointers) {
      Object.entries(curr.pointers).forEach(([name, slot]) => {
        const x = slotX(slot);
        const arrowY = baseY + 50;
        // triangle pointing up
        ctx.save();
        ctx.fillStyle = '#6F4E37';
        ctx.beginPath();
        ctx.moveTo(x, arrowY - 9);
        ctx.lineTo(x - 7, arrowY + 1);
        ctx.lineTo(x + 7, arrowY + 1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        text(ctx, name, x, arrowY + 16, { size: 12, weight: 700, color: '#6F4E37' });
      });
    }
  }
}
