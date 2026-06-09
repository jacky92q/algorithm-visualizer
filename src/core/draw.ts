// Low-level canvas drawing helpers shared by all renderers.

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export interface CellStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  glow?: string;
  glowBlur?: number;
  lift?: number; // shadow offset for a "raised" look
}

export function softCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  style: CellStyle,
): void {
  ctx.save();
  if (style.glow) {
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = style.glowBlur ?? 18;
  } else if (style.lift) {
    ctx.shadowColor = 'rgba(74, 53, 40, 0.18)';
    ctx.shadowBlur = style.lift * 3;
    ctx.shadowOffsetY = style.lift;
  }
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = style.fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if (style.stroke) {
    ctx.lineWidth = style.strokeWidth ?? 2;
    ctx.strokeStyle = style.stroke;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
  }
  ctx.restore();
}

export function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  opts: {
    size?: number;
    color?: string;
    weight?: number | string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    font?: string;
    alpha?: number;
    letterSpacing?: number;
  } = {},
): void {
  ctx.save();
  ctx.globalAlpha = opts.alpha ?? 1;
  const family = opts.font ?? "'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.font = `${opts.weight ?? 600} ${opts.size ?? 16}px ${family}`;
  ctx.fillStyle = opts.color ?? '#2E241B';
  ctx.textAlign = opts.align ?? 'center';
  ctx.textBaseline = opts.baseline ?? 'middle';
  if (opts.letterSpacing && 'letterSpacing' in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${opts.letterSpacing}px`;
  }
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 2,
  dash?: number[],
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
  stroke?: string,
  strokeWidth = 2,
  glow?: string,
): void {
  ctx.save();
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 22;
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  if (stroke) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

// A subtle moving dotted texture for the stage background.
export function paperGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  color: string,
): void {
  const gap = 34;
  const drift = (time * 6) % gap;
  ctx.save();
  ctx.fillStyle = color;
  for (let y = -gap + drift; y < h + gap; y += gap) {
    for (let x = -gap + drift; x < w + gap; x += gap) {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
