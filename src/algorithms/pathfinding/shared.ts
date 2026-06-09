import type { BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeOutBack, clamp } from '../../core/easing';
import { rgba, mixHex } from '../../core/palette';

// status codes per cell
export const S_NONE = 0;
export const S_FRONTIER = 1;
export const S_VISITED = 2;
export const S_PATH = 3;
export const S_CURRENT = 4;

export interface GridStep extends BaseStep {
  rows: number;
  cols: number;
  start: number;
  goal: number;
  walls: boolean[];
  status: number[];
  dist?: number[];
  weights?: number[]; // terrain weight (Dijkstra); undefined = uniform
}

export function idx(r: number, c: number, cols: number): number {
  return r * cols + c;
}

export class GridRenderer implements Renderer<GridStep> {
  draw(rc: RenderCtx, prev: GridStep | null, curr: GridStep): void {
    const { ctx, width, height, time, t } = rc;
    const { rows, cols } = curr;
    const padX = Math.max(20, width * 0.05);
    const padY = 56;
    const cell = Math.min((width - padX * 2) / cols, (height - padY * 2) / rows);
    const gridW = cell * cols;
    const gridH = cell * rows;
    const ox = (width - gridW) / 2;
    const oy = (height - gridH) / 2 + 8;
    const gap = Math.max(2, cell * 0.08);

    const cellRect = (i: number) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      return { x: ox + c * cell + gap / 2, y: oy + r * cell + gap / 2, s: cell - gap };
    };

    // board backing
    ctx.save();
    roundRect(ctx, ox - 10, oy - 10, gridW + 20, gridH + 20, 18);
    ctx.fillStyle = rgba('#6F4E37', 0.06);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < rows * cols; i++) {
      const { x, y, s } = cellRect(i);
      const st = curr.status[i];
      const wasSt = prev ? prev.status[i] : S_NONE;
      const justChanged = st !== wasSt;

      let fill = '#F6EEDD';
      let stroke = rgba('#C9A87C', 0.35);
      let glow = '';
      let pop = 0;

      if (curr.walls[i]) {
        fill = '#4A3528';
        stroke = '#3A281D';
      } else if (curr.weights && curr.weights[i] > 1) {
        // heavier terrain — darker cream/brown tint
        const w = clamp((curr.weights[i] - 1) / 8, 0, 1);
        fill = mixHex('#F1E4CC', '#B98C66', w);
        stroke = rgba('#A8835E', 0.5);
      }

      if (st === S_VISITED) {
        fill = '#CDEBE4';
        stroke = rgba('#2A9D8F', 0.5);
      } else if (st === S_FRONTIER) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 5 + i);
        fill = mixHex('#9EDBCF', '#5FC3B6', pulse);
        stroke = '#2A9D8F';
        glow = rgba('#2A9D8F', 0.45);
      } else if (st === S_CURRENT) {
        fill = '#FBE5C2';
        stroke = '#E0A33B';
        glow = rgba('#E0A33B', 0.6);
        pop = justChanged ? easeOutBack(clamp(t, 0, 1)) * 5 : 0;
      } else if (st === S_PATH) {
        fill = '#E7C46A';
        stroke = '#C9821C';
        glow = rgba('#E0A33B', 0.5);
      }

      ctx.save();
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 14;
      }
      const grow = justChanged && (st === S_VISITED || st === S_FRONTIER) ? easeOutBack(clamp(t, 0, 1)) : 1;
      const gs = s * (0.6 + 0.4 * grow);
      const gx = x + (s - gs) / 2;
      const gy = y + (s - gs) / 2 - pop;
      roundRect(ctx, gx, gy, gs, gs, Math.max(4, cell * 0.16));
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = stroke;
      roundRect(ctx, gx, gy, gs, gs, Math.max(4, cell * 0.16));
      ctx.stroke();

      if (curr.dist && st !== S_NONE && !curr.walls[i] && curr.dist[i] < 1e8 && cell > 26) {
        text(ctx, String(curr.dist[i]), x + s / 2, y + s / 2 - pop, {
          size: clamp(cell * 0.28, 9, 15),
          weight: 700,
          color: st === S_PATH ? '#4A3528' : '#1E7A6F',
        });
      }
    }

    // start & goal markers on top
    const marker = (i: number, label: string, color: string) => {
      const { x, y, s } = cellRect(i);
      ctx.save();
      ctx.shadowColor = rgba(color, 0.6);
      ctx.shadowBlur = 16;
      roundRect(ctx, x, y, s, s, Math.max(5, cell * 0.18));
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
      text(ctx, label, x + s / 2, y + s / 2, {
        size: clamp(cell * 0.4, 12, 22),
        weight: 800,
        color: '#FFF7EA',
      });
    };
    marker(curr.start, 'S', '#2A9D8F');
    marker(curr.goal, 'G', '#E07856');
  }
}
