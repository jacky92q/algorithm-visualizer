import type { BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text, line } from '../../core/draw';
import { easeOutBack, easeInOutCubic, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';

/**
 * Generic dynamic-programming table step. Drives a `rows × cols` grid with
 * header labels along the top and left edges. Cells hold a number/string or
 * `null` (not yet computed). Used by Coin Change (single conceptual row),
 * 0/1 Knapsack and Longest Common Subsequence.
 */
export interface DPStep extends BaseStep {
  rows: number;
  cols: number;
  /** Left-edge label for each data row (length === rows). */
  rowHeader: string[];
  /** Top-edge label for each data column (length === cols). */
  colHeader: string[];
  /** Row-major cell contents, length rows*cols. `null` = blank. */
  cells: (number | string | null)[];
  /** Index of the cell currently being computed. */
  cur?: number;
  /** Indices the current cell reads from (dependency highlight). */
  deps?: number[];
  /** Indices on the answer / traceback path (green outline). */
  picks?: number[];
  /** Small label inside the top-left corner cell. */
  corner?: string;
  /** Axis title above the column headers. */
  colAxis?: string;
  /** English variant of colAxis (renderer picks via rc.lang). */
  colAxisEn?: string;
  /** Axis title beside the row headers. */
  rowAxis?: string;
  /** English variant of rowAxis (renderer picks via rc.lang). */
  rowAxisEn?: string;
  /** Big summary text shown along the bottom. */
  result?: string;
}

const COL = {
  blank: '#F3E9D6',
  blankStroke: rgba('#C9A87C', 0.3),
  filled: '#CDEBE4',
  filledStroke: rgba('#2A9D8F', 0.55),
  filledText: '#1E7A6F',
  cur: '#FBE5C2',
  curStroke: '#E0A33B',
  curText: '#C9821C',
  dep: '#F8DCD0',
  depStroke: '#E07856',
  pick: '#2A9D8F',
  header: '#9A8B70',
};

export class DPTableRenderer implements Renderer<DPStep> {
  draw(rc: RenderCtx, prev: DPStep | null, curr: DPStep): void {
    const { ctx, width, height, time } = rc;
    const { rows, cols } = curr;
    const e = easeInOutCubic(rc.t);
    const colAxis = rc.lang === 'en' ? (curr.colAxisEn ?? curr.colAxis) : curr.colAxis;
    const rowAxis = rc.lang === 'en' ? (curr.rowAxisEn ?? curr.rowAxis) : curr.rowAxis;

    const gridCols = cols + 1; // +1 header column
    const gridRows = rows + 1; // +1 header row

    const padX = Math.max(20, width * 0.05);
    const padTop = 70; // title + colAxis
    const padBottom = 64; // result text
    const availW = width - padX * 2;
    const availH = height - padTop - padBottom;

    const cell = Math.min(availW / gridCols, availH / gridRows, 60);
    const gridW = cell * gridCols;
    const gridH = cell * gridRows;
    const startX = (width - gridW) / 2;
    const startY = padTop + (availH - gridH) / 2;

    const gx = (gc: number) => startX + gc * cell;
    const gy = (gr: number) => startY + gr * cell;
    const dataIdx = (r: number, c: number) => r * cols + c;
    const fs = clamp(cell * 0.34, 9, 18);
    const hfs = clamp(cell * 0.3, 8, 15);

    // ── Axis titles ───────────────────────────────────────────────────────
    if (colAxis) {
      text(ctx, colAxis, startX + cell + (gridW - cell) / 2, startY - 16, {
        size: clamp(width * 0.03, 11, 15), weight: 700, color: COL.header, letterSpacing: 1,
      });
    }
    if (rowAxis) {
      ctx.save();
      ctx.translate(startX - 16, startY + cell + (gridH - cell) / 2);
      ctx.rotate(-Math.PI / 2);
      text(ctx, rowAxis, 0, 0, {
        size: clamp(width * 0.03, 11, 15), weight: 700, color: COL.header, letterSpacing: 1,
      });
      ctx.restore();
    }

    // ── Corner cell ───────────────────────────────────────────────────────
    if (curr.corner) {
      text(ctx, curr.corner, gx(0) + cell / 2, gy(0) + cell / 2, {
        size: hfs, weight: 700, color: rgba('#9A8B70', 0.85),
      });
    }

    // ── Header row / column ───────────────────────────────────────────────
    for (let c = 0; c < cols; c++) {
      text(ctx, curr.colHeader[c] ?? '', gx(c + 1) + cell / 2, gy(0) + cell / 2, {
        size: hfs, weight: 800, color: '#6F4E37',
      });
    }
    for (let r = 0; r < rows; r++) {
      text(ctx, curr.rowHeader[r] ?? '', gx(0) + cell / 2, gy(r + 1) + cell / 2, {
        size: hfs, weight: 800, color: '#6F4E37',
      });
    }

    // ── Dependency arrows (drawn under cells) ─────────────────────────────
    if (curr.cur !== undefined && curr.deps) {
      const cr = Math.floor(curr.cur / cols);
      const cc = curr.cur % cols;
      const tx = gx(cc + 1) + cell / 2;
      const ty = gy(cr + 1) + cell / 2;
      const pulse = 0.55 + 0.45 * Math.sin(time * 4);
      for (const d of curr.deps) {
        const dr = Math.floor(d / cols);
        const dc = d % cols;
        const sx = gx(dc + 1) + cell / 2;
        const sy = gy(dr + 1) + cell / 2;
        line(ctx, sx, sy, tx, ty, rgba(COL.depStroke, 0.5 * pulse), 2, [4, 4]);
      }
    }

    // ── Cells ─────────────────────────────────────────────────────────────
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = dataIdx(r, c);
        const v = curr.cells[idx];
        const has = v !== null && v !== undefined;
        const isCur = curr.cur === idx;
        const isDep = !!curr.deps && curr.deps.includes(idx);
        const isPick = !!curr.picks && curr.picks.includes(idx);
        const prevV = prev ? prev.cells[idx] : null;
        const justFilled = has && (prevV === null || prevV === undefined);

        let fill = COL.blank;
        let stroke = COL.blankStroke;
        let txtColor = rgba('#9A8B70', 0.55);
        let glow = '';
        if (has) {
          fill = COL.filled;
          stroke = COL.filledStroke;
          txtColor = COL.filledText;
        }
        if (isDep) {
          fill = COL.dep;
          stroke = COL.depStroke;
          txtColor = '#C85A3A';
        }
        if (isCur) {
          fill = COL.cur;
          stroke = COL.curStroke;
          txtColor = COL.curText;
          glow = rgba(COL.curStroke, 0.6);
        }

        const pad = cell * 0.08;
        const cw = cell - pad * 2;
        const x = gx(c + 1) + pad;
        const y = gy(r + 1) + pad;

        // pop-in scale for a freshly filled cell
        const pop = justFilled ? easeOutBack(clamp(rc.t, 0, 1)) : 1;
        const sw = cw * (0.55 + 0.45 * pop);
        const sh = cw * (0.55 + 0.45 * pop);
        const ox = x + (cw - sw) / 2;
        const oy = y + (cw - sh) / 2;

        ctx.save();
        if (glow) {
          const pulse = 0.6 + 0.4 * Math.sin(time * 4);
          ctx.shadowColor = rgba(COL.curStroke, pulse * 0.7);
          ctx.shadowBlur = 16;
        } else if (has) {
          ctx.shadowColor = rgba('#2A9D8F', 0.12);
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 3;
        }
        roundRect(ctx, ox, oy, sw, sh, 9);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();

        ctx.lineWidth = isPick ? 3 : isCur || has ? 1.8 : 1.1;
        ctx.strokeStyle = isPick ? COL.pick : stroke;
        roundRect(ctx, ox, oy, sw, sh, 9);
        ctx.stroke();

        if (sw > 14) {
          text(ctx, has ? String(v) : '·', gx(c + 1) + cell / 2, gy(r + 1) + cell / 2, {
            size: has ? fs : fs * 0.8,
            weight: 800,
            color: txtColor,
          });
        }
        void e;
      }
    }

    // ── Result text ───────────────────────────────────────────────────────
    if (curr.result) {
      text(ctx, curr.result, width / 2, height - 30, {
        size: clamp(width * 0.04, 14, 22), weight: 800, color: '#4A3528',
      });
    }
  }
}
