import type { RenderCtx, Renderer } from '../../core/types';
import { roundRect, text, line, circle } from '../../core/draw';
import { easeInOutCubic, easeOutBack, lerp, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';
import type { Actor, FlowMsg, FlowStep, Tone } from '../types';

const TONE: Record<Tone, { line: string; fill: string; text: string }> = {
  neutral: { line: '#A8835E', fill: '#C9A87C', text: '#6F4E37' },
  active: { line: '#E0A33B', fill: '#FBE5C2', text: '#C9821C' },
  compare: { line: '#E07856', fill: '#F8DCD0', text: '#C85A3A' },
  good: { line: '#2A9D8F', fill: '#CDEBE4', text: '#1E7A6F' },
  bad: { line: '#D7574B', fill: '#F6D3CE', text: '#B23A2E' },
};

export class ActorFlowRenderer implements Renderer<FlowStep> {
  draw(rc: RenderCtx, prev: FlowStep | null, curr: FlowStep): void {
    const { ctx, width, height, time, lang } = rc;
    const e = easeInOutCubic(rc.t);
    const actors = curr.actors;
    const n = actors.length;

    const label = (a: { label: string; labelEn?: string }) =>
      lang === 'en' ? (a.labelEn ?? a.label) : a.label;
    const sub = (a: Actor) => (lang === 'en' ? (a.subEn ?? a.sub) : a.sub);
    const msgLabel = (m: FlowMsg) => (lang === 'en' ? (m.labelEn ?? m.label) : m.label);

    // ── actor columns ──────────────────────────────────────────────────────
    const padX = Math.max(34, width * 0.1);
    const usableW = width - padX * 2;
    const xOf = (idx: number) => (n === 1 ? width / 2 : padX + (usableW * idx) / (n - 1));
    const actorIndex: Record<string, number> = {};
    actors.forEach((a, i) => (actorIndex[a.id] = i));
    const xOfId = (id: string) => xOf(actorIndex[id] ?? 0);

    const headY = 74;
    const R = clamp(usableW / n / 2.6, 16, 26);
    const lifelineTop = headY + R + 44;
    const bottomY = height - 64;

    // active message = last one; highlight its endpoints
    const activeMsg = curr.msgs.length ? curr.msgs[curr.msgs.length - 1] : null;
    const isNewMsg = !!activeMsg && (!prev || prev.msgs.length < curr.msgs.length);
    const activeFrom = activeMsg?.from;
    const activeTo = activeMsg?.to;

    // ── phase label ─────────────────────────────────────────────────────────
    const phase = lang === 'en' ? (curr.phaseEn ?? curr.phase) : curr.phase;
    if (phase) {
      text(ctx, phase.toUpperCase(), width / 2, 32, {
        size: clamp(width * 0.03, 11, 15), weight: 800, color: '#9A8B70', letterSpacing: 2,
      });
    }

    // ── lifelines ────────────────────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const x = xOf(i);
      line(ctx, x, lifelineTop, x, bottomY, rgba('#A8835E', 0.28), 1.5, [4, 7]);
    }

    // ── messages ──────────────────────────────────────────────────────────────
    const count = curr.msgs.length;
    const rowGap = count ? Math.min(64, (bottomY - lifelineTop - 10) / count) : 0;
    const yMsg = (i: number) => lifelineTop + i * rowGap + rowGap * 0.62;

    for (let i = 0; i < count; i++) {
      const m = curr.msgs[i];
      const isLast = i === count - 1;
      const tone = TONE[m.tone ?? 'neutral'];
      const x1 = xOfId(m.from);
      const x2 = xOfId(m.to);
      const y = yMsg(i);
      const dir = Math.sign(x2 - x1) || 1;

      // appear/settle alpha for the freshly delivered message
      const alpha = isLast && isNewMsg ? clamp(e * 1.2, 0.15, 1) : 1;
      const aged = isLast ? 1 : clamp(1 - (count - 1 - i) * 0.07, 0.5, 1);

      ctx.save();
      ctx.globalAlpha = alpha * aged;

      // arrow shaft
      line(ctx, x1, y, x2, y, rgba(tone.line, 0.9), isLast ? 2.6 : 2, m.dashed ? [6, 5] : undefined);

      // arrowhead at target
      const ah = 7;
      ctx.fillStyle = tone.line;
      ctx.beginPath();
      ctx.moveTo(x2, y);
      ctx.lineTo(x2 - dir * ah * 1.4, y - ah);
      ctx.lineTo(x2 - dir * ah * 1.4, y + ah);
      ctx.closePath();
      ctx.fill();

      // dot at source
      circle(ctx, x1, y, 3.2, tone.line);

      ctx.restore();

      // label pill centred on the shaft, sitting just above it
      const txt = (m.tag ? `${m.tag} ` : '') + msgLabel(m);
      const fontSize = clamp(width * 0.028, 10, 14);
      ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      const tw = ctx.measureText(txt).width;
      const pillW = tw + 18;
      const pillH = fontSize + 12;
      const midX = (x1 + x2) / 2;
      const pillX = clamp(midX - pillW / 2, 6, width - pillW - 6);
      const pillY = y - pillH - 4;

      ctx.save();
      ctx.globalAlpha = alpha * aged;
      if (isLast && isNewMsg) {
        ctx.shadowColor = rgba(tone.line, 0.45);
        ctx.shadowBlur = 14;
      }
      roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
      ctx.fillStyle = isLast ? tone.fill : rgba(tone.fill, 0.8);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = alpha * aged;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = rgba(tone.line, isLast ? 0.7 : 0.4);
      roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
      ctx.stroke();
      ctx.restore();

      text(ctx, txt, pillX + pillW / 2, pillY + pillH / 2, {
        size: fontSize, weight: 800, color: tone.text, alpha: alpha * aged,
      });

      // travelling packet on the freshly delivered message
      if (isLast && isNewMsg) {
        const px = lerp(x1, x2, e);
        const pulse = 0.6 + 0.4 * Math.sin(time * 6);
        ctx.save();
        ctx.shadowColor = rgba(tone.line, 0.8 * pulse);
        ctx.shadowBlur = 16;
        circle(ctx, px, y, 6.5, tone.line, '#FFF7EA', 2);
        ctx.restore();
      }
    }

    // ── actor nodes (drawn last so they sit above lifelines/arrows) ──────────
    for (let i = 0; i < n; i++) {
      const a = actors[i];
      const x = xOf(i);
      const isActive = a.id === activeFrom || a.id === activeTo;
      const col = a.color ?? '#6F4E37';

      const pop = isActive && isNewMsg ? easeOutBack(clamp(rc.t, 0, 1)) : 1;
      const r = R * (0.92 + 0.08 * pop);
      const glow = isActive ? rgba(col, 0.5 + 0.4 * Math.sin(time * 4)) : undefined;
      circle(ctx, x, headY, r, rgba(col, 0.16), col, 2.4, glow);
      if (a.glyph) {
        text(ctx, a.glyph, x, headY + 1, { size: r * 1.05 });
      }
      text(ctx, label(a), x, headY + R + 14, {
        size: clamp(width * 0.03, 11, 15), weight: 800, color: '#4A3528',
      });
      const s = sub(a);
      if (s) {
        text(ctx, s, x, headY + R + 30, {
          size: clamp(width * 0.024, 9, 12), weight: 600,
          color: rgba('#9A8B70', 0.95), font: "'JetBrains Mono', monospace",
        });
      }
    }
  }
}
