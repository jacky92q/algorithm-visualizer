import type { BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeInOutCubic, lerp, clamp } from '../../core/easing';
import { mixHex, rgba } from '../../core/palette';

// Each bar is a stable item with an id (its original index) and a value.
export interface SortStep extends BaseStep {
  /** Item ids in current slot order (slots[i] = id occupying slot i). */
  slots: number[];
  /** id -> value, fixed across the run. */
  values: number[];
  compare?: number[]; // item ids being compared
  swap?: number[]; // item ids swapped this frame
  pivot?: number; // item id pivot
  sorted?: number[]; // item ids locked sorted
  highlight?: number[]; // generic emphasis
  /** Named pointers mapped to slot index. */
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

    const padX = Math.max(28, width * 0.06);
    const padTop = 70;
    const padBottom = 86;
    const usableW = width - padX * 2;
    const slotW = usableW / n;
    const barW = Math.min(slotW * 0.72, 70);
    const baseY = height - padBottom;
    const maxBarH = baseY - padTop;

    const slotX = (slot: number) => padX + slotW * slot + slotW / 2;
    const e = easeInOutCubic(rc.t);

    // baseline
    ctx.save();
    ctx.strokeStyle = rgba('#6F4E37', 0.18);
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 8]);
    ctx.beginPath();
    ctx.moveTo(padX - 8, baseY + 0.5);
    ctx.lineTo(width - padX + 8, baseY + 0.5);
    ctx.stroke();
    ctx.restore();

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
      const barH = Math.max(10, (v / maxVal) * maxBarH);

      const isSwap = inSet(curr.swap, id);
      const isCompare = inSet(curr.compare, id);
      const isSorted = inSet(curr.sorted, id);
      const isPivot = curr.pivot === id;
      const isHigh = inSet(curr.highlight, id);

      // a little hop while swapping
      const hop = isSwap ? Math.sin(e * Math.PI) * 16 : 0;
      const top = baseY - barH - hop;

      let c1 = ROLE.base1;
      let c2 = ROLE.base2;
      let glow = '';
      if (isSorted) {
        c1 = ROLE.sorted1;
        c2 = ROLE.sorted2;
        glow = rgba('#2A9D8F', 0.5);
      } else if (isPivot) {
        c1 = ROLE.pivot1;
        c2 = ROLE.pivot2;
        glow = rgba('#E0A33B', 0.55);
      } else if (isSwap || isCompare) {
        c1 = ROLE.compare1;
        c2 = ROLE.compare2;
        glow = rgba('#E07856', 0.5);
      } else if (isHigh) {
        c1 = ROLE.high1;
        c2 = ROLE.high2;
      }

      const grad = ctx.createLinearGradient(0, top, 0, baseY);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);

      ctx.save();
      if (glow) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 4);
        ctx.shadowColor = glow;
        ctx.shadowBlur = (isPivot ? 26 : 18) * pulse;
      } else {
        ctx.shadowColor = 'rgba(74,53,40,0.16)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 6;
      }
      roundRect(ctx, x - barW / 2, top, barW, barH + 16, 12);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // glossy highlight
      ctx.save();
      roundRect(ctx, x - barW / 2 + 4, top + 4, barW - 8, Math.min(barH * 0.4, 26), 8);
      ctx.fillStyle = rgba('#FFFFFF', 0.18);
      ctx.fill();
      ctx.restore();

      // value chip on top
      text(ctx, String(v), x, top - 14, {
        size: clamp(barW * 0.42, 13, 22),
        weight: 800,
        color: isSorted ? '#1E7A6F' : isPivot ? '#C9821C' : '#4A3528',
        font: "'Plus Jakarta Sans', sans-serif",
      });

      // slot index at the base
      text(ctx, String(slotNow), x, baseY + 20, {
        size: 12,
        weight: 600,
        color: mixHex('#9A8B70', '#6F4E37', 0.3),
      });
    }

    // pointers
    if (curr.pointers) {
      const labels = Object.entries(curr.pointers);
      labels.forEach(([name, slot]) => {
        const x = slotX(slot);
        const y = baseY + 44;
        ctx.save();
        ctx.fillStyle = '#6F4E37';
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x - 7, y + 2);
        ctx.lineTo(x + 7, y + 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        text(ctx, name, x, y + 14, { size: 12, weight: 700, color: '#6F4E37' });
      });
    }
  }
}
