import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { text } from '../../core/draw';
import { easeInOutCubic, clamp, lerp } from '../../core/easing';
import { rgba, mixHex } from '../../core/palette';

// ─── Step Interface ───────────────────────────────────────────────────────────

export interface HanoiStep extends BaseStep {
  pegs: number[][];   // pegs[i] = disk numbers on peg i, bottom → top
  diskCount: number;  // total number of disks
  from?: number;      // source peg index (disk was removed from here)
  to?: number;        // destination peg index (disk was placed here)
}

// ─── Colors ──────────────────────────────────────────────────────────────────

/** Return the fill color for disk d out of total n (coral→amber→teal gradient). */
function diskColor(d: number, n: number): string {
  const t = n <= 1 ? 0 : (d - 1) / (n - 1);  // smallest disk (1) → 0, largest (n) → 1
  if (t < 0.5) return mixHex('#E07856', '#E0A33B', t * 2);   // coral → amber
  return mixHex('#E0A33B', '#2A9D8F', (t - 0.5) * 2);        // amber → teal
}

function diskColorDark(d: number, n: number): string {
  const t = n <= 1 ? 0 : (d - 1) / (n - 1);
  if (t < 0.5) return mixHex('#C85A3A', '#C9821C', t * 2);
  return mixHex('#C9821C', '#1E7A6F', (t - 0.5) * 2);
}

// ─── Renderer ────────────────────────────────────────────────────────────────

class HanoiRenderer implements Renderer<HanoiStep> {
  draw(rc: RenderCtx, prev: HanoiStep | null, curr: HanoiStep): void {
    const { ctx, width, height, time } = rc;
    const e = easeInOutCubic(rc.t);
    const n = curr.diskCount;

    // Layout
    const baseY = height - 80;          // horizontal base line y
    const pegH = Math.min(height * 0.5, 210);
    const pegW = 10;
    const pegTopY = baseY - pegH;
    const diskH = Math.min((pegH - 12) / (n + 1), 32);
    const maxDiskW = Math.min(width * 0.25, 140);
    const minDiskW = Math.max(maxDiskW * 0.3, 28);
    const diskWStep = n > 1 ? (maxDiskW - minDiskW) / (n - 1) : 0;

    const pegX = (p: number) => width * (0.2 + p * 0.3);  // 3 pegs at 20%, 50%, 80%

    const diskWidth = (d: number) => minDiskW + (d - 1) * diskWStep;

    // Peg labels
    ['A', 'B', 'C'].forEach((label, p) => {
      text(ctx, label, pegX(p), baseY + 28, {
        size: 16, weight: 800, color: '#9A8B70',
      });
    });

    // ── Base platform ─────────────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = rgba('#6F4E37', 0.35);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pegX(0) - maxDiskW * 0.6, baseY);
    ctx.lineTo(pegX(2) + maxDiskW * 0.6, baseY);
    ctx.stroke();
    ctx.restore();

    // ── Pegs (vertical pillars) ───────────────────────────────────────────
    for (let p = 0; p < 3; p++) {
      const px = pegX(p);
      const grad = ctx.createLinearGradient(px - pegW / 2, 0, px + pegW / 2, 0);
      grad.addColorStop(0, '#A8835E');
      grad.addColorStop(0.4, '#C9A87C');
      grad.addColorStop(1, '#6F4E37');
      ctx.save();
      ctx.shadowColor = rgba('#4A3528', 0.25);
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(px - pegW / 2, pegTopY, pegW, pegH, [pegW / 2, pegW / 2, 0, 0]);
      ctx.fill();
      ctx.restore();
    }

    // ── Determine animating disk ──────────────────────────────────────────
    // The disk being moved is the one that exists in `prev.from` top but
    // hasn't yet reached `curr.to` — it's animating through three phases:
    //   [0, 0.33): lift  from prev.from top
    //   [0.33, 0.67): slide horizontally
    //   [0.67, 1]: lower to curr.to top
    const movingDisk = curr.from !== undefined && curr.to !== undefined && prev
      ? prev.pegs[curr.from][prev.pegs[curr.from].length - 1]
      : undefined;

    const diskY = (_pegIdx: number, stackLevel: number): number =>
      baseY - diskH * 0.5 - stackLevel * diskH;

    const liftClearY = pegTopY - diskH - 8;  // fully lifted above all pegs

    const movingPos = (() => {
      if (movingDisk === undefined || prev === null || curr.from === undefined || curr.to === undefined) {
        return null;
      }
      const fromPeg = curr.from;
      const toPeg = curr.to;
      const fromStackLevel = prev.pegs[fromPeg].length - 1;   // was at top of from
      const toStackLevel = curr.pegs[toPeg].length - 1;        // will be at top of to

      const startX2 = pegX(fromPeg);
      const startY = diskY(fromPeg, fromStackLevel);
      const endX2 = pegX(toPeg);
      const endY = diskY(toPeg, toStackLevel);

      // Three-phase tween
      let x: number;
      let y: number;
      if (e < 0.33) {
        const t2 = e / 0.33;
        x = startX2;
        y = lerp(startY, liftClearY, easeInOutCubic(t2));
      } else if (e < 0.67) {
        const t2 = (e - 0.33) / 0.34;
        x = lerp(startX2, endX2, easeInOutCubic(t2));
        y = liftClearY;
      } else {
        const t2 = (e - 0.67) / 0.33;
        x = endX2;
        y = lerp(liftClearY, endY, easeInOutCubic(t2));
      }
      return { x, y };
    })();

    // ── Draw disks on pegs ────────────────────────────────────────────────
    for (let p = 0; p < 3; p++) {
      curr.pegs[p].forEach((d, level) => {
        if (d === movingDisk) return; // drawn separately below
        const dx = pegX(p);
        const dy = diskY(p, level);
        this._drawDisk(ctx, dx, dy, d, n, diskWidth, diskH, time, false);
      });
    }

    // ── Draw the animating disk on top ─────────────────────────────────────
    if (movingDisk !== undefined && movingPos) {
      this._drawDisk(ctx, movingPos.x, movingPos.y, movingDisk, n, diskWidth, diskH, time, true);
    }

    // ── Move counter / info ───────────────────────────────────────────────
    text(ctx, `2ⁿ−1 = ${Math.pow(2, n) - 1} 번 이동`, width / 2, 28, {
      size: 13, weight: 700, color: rgba('#9A8B70', 0.9), letterSpacing: 1,
    });
  }

  private _drawDisk(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    d: number,
    n: number,
    diskWidth: (d: number) => number,
    diskH: number,
    time: number,
    glow: boolean,
  ) {
    const dw = diskWidth(d);
    const c1 = diskColor(d, n);
    const c2 = diskColorDark(d, n);

    ctx.save();
    if (glow) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 4);
      ctx.shadowColor = rgba(c1, 0.6 + 0.2 * pulse);
      ctx.shadowBlur = 22;
    } else {
      ctx.shadowColor = rgba('#4A3528', 0.2);
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
    }

    const r = diskH * 0.45;
    const grad = ctx.createLinearGradient(0, cy - diskH / 2, 0, cy + diskH / 2);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);

    ctx.beginPath();
    ctx.roundRect(cx - dw / 2, cy - diskH / 2, dw, diskH, r);
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle sheen
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cx - dw / 2 + 6, cy - diskH / 2 + 4, dw - 12, diskH * 0.38, r * 0.6);
    ctx.fill();
    ctx.restore();

    // Disk number label
    text(ctx, String(d), cx, cy, {
      size: clamp(diskH * 0.44, 10, 18),
      weight: 800,
      color: '#FFF7EA',
    });
  }
}

// ─── Source Code ─────────────────────────────────────────────────────────────

const source = [
  { text: 'def hanoi(n, src, dst, aux):', indent: 0 },
  { text: 'if n == 1:', indent: 1 },
  { text: 'move(src → dst)  # base case', indent: 2 },
  { text: 'return', indent: 2 },
  { text: 'hanoi(n-1, src, aux, dst)', indent: 1 },
  { text: 'move(src → dst)  # move largest disk', indent: 1 },
  { text: 'hanoi(n-1, aux, dst, src)', indent: 1 },
];

// ─── Generate ────────────────────────────────────────────────────────────────

export const hanoi: Algorithm<HanoiStep> = {
  meta: {
    id: 'tower-of-hanoi',
    category: 'stack',
    name: 'Tower of Hanoi',
    tagline: 'Recursively move n disks using 3 pegs',
    hook: '재귀의 아름다움 — n개의 원판을 최소 횟수로 옮깁니다',
    difficulty: 'Medium',
    time: 'O(2ⁿ)',
    space: 'O(n)',
    accent: 'coral',
    glyph: '🗼',
    summary:
      '3개의 기둥에서 n개의 원판을 규칙에 따라 목표 기둥으로 옮깁니다. 규칙: 한 번에 하나, 큰 원판이 작은 원판 위에 올라갈 수 없습니다. 재귀로 풀면 "n-1개를 보조 기둥에 → 가장 큰 원판을 목표로 → n-1개를 목표로" 단 세 줄이 됩니다.',
    keyPoints: [
      '재귀 분할: 크기 n → 크기 n-1 두 번 + 원판 1번 이동',
      '최소 이동 횟수 = 2ⁿ − 1 (지수적 증가)',
      '스택의 LIFO 성질이 원판 순서를 자동으로 보장',
    ],
    steps: [
      '가장 큰 원판 아래 n-1개를 보조 기둥으로 옮깁니다.',
      '가장 큰 원판을 목표 기둥으로 옮깁니다.',
      '보조 기둥의 n-1개를 목표 기둥으로 옮깁니다.',
      '크기 1이 되면 바로 이동합니다 (기저 케이스).',
    ],
    defaultInput: '4',
    inputHint: '원판 수 (2–5 권장)',
    en: {
      name: 'Tower of Hanoi',
      tagline: 'Recursively move n disks using 3 pegs',
      hook: 'The beauty of recursion — move n disks in minimum moves',
      summary: 'Move n disks from peg A to C following two rules: move only one disk at a time, and never place a larger disk on a smaller one. Recursion reduces it to three lines: move n-1 to aux, move largest to goal, move n-1 to goal.',
      keyPoints: [
        'Divide: size n → two size-(n-1) subproblems + 1 move',
        'Minimum moves = 2ⁿ − 1 (exponential growth)',
        'LIFO stack property ensures disk order is maintained',
      ],
      steps: [
        'Move the top n-1 disks to the auxiliary peg.',
        'Move the largest disk to the destination peg.',
        'Move the n-1 disks from auxiliary to destination.',
        'Base case: n=1 is a single move.',
      ],
      defaultInput: '4',
      inputHint: 'Number of disks (2–5 recommended)',
    },
  },
  sourceCode: source,

  generate(input) {
    const parsed = parseInt(input.trim(), 10);
    const n = Number.isFinite(parsed) && parsed >= 2 && parsed <= 6 ? parsed : 4;

    // Initial state: all disks on peg 0, largest (n) at bottom
    const pegs: number[][] = [
      Array.from({ length: n }, (_, i) => n - i),  // peg A: [n, n-1, ..., 1]
      [],
      [],
    ];

    const out: HanoiStep[] = [];

    const snap = (extra: Partial<HanoiStep>): HanoiStep => ({
      line: 0,
      caption: '',
      captionEn: '',
      pegs: pegs.map((p) => [...p]),
      diskCount: n,
      ...extra,
    });

    const pegName = ['A', 'B', 'C'];

    out.push(snap({
      line: 0,
      caption: `원판 ${n}개가 기둥 A에 있습니다. 목표: 기둥 C로 이동`,
      captionEn: `${n} disks on peg A. Goal: move all to peg C.`,
      action: 'START',
      tone: 'neutral',
    }));

    let moveCount = 0;

    const move = (disk: number, fromPeg: number, toPeg: number) => {
      moveCount++;
      const fromTop = pegs[fromPeg].pop()!;
      if (fromTop !== disk) throw new Error('Hanoi logic error');

      out.push(snap({
        line: disk === 1 ? 2 : 5,
        caption: `원판 ${disk} 을(를) 기둥 ${pegName[fromPeg]} → ${pegName[toPeg]} 으로 이동 (${moveCount}번째)`,
        captionEn: `Move disk ${disk} from peg ${pegName[fromPeg]} to peg ${pegName[toPeg]} (move #${moveCount})`,
        action: 'MOVE',
        tone: disk === n ? 'good' : 'active',
        from: fromPeg,
        to: toPeg,
      }));

      pegs[toPeg].push(disk);
    };

    const hanoi = (diskNum: number, src: number, dst: number, aux: number) => {
      if (diskNum === 1) {
        out.push(snap({
          line: 1,
          caption: `원판 1 — 기저 케이스: 바로 ${pegName[src]} → ${pegName[dst]}`,
          captionEn: `Disk 1 — base case: move directly ${pegName[src]} → ${pegName[dst]}`,
          action: 'BASE',
          tone: 'compare',
        }));
        move(1, src, dst);
        return;
      }

      out.push(snap({
        line: 4,
        caption: `hanoi(${diskNum - 1}, ${pegName[src]}, ${pegName[aux]}, ${pegName[dst]}) — 위 ${diskNum - 1}개를 보조 기둥으로`,
        captionEn: `hanoi(${diskNum - 1}, ${pegName[src]}, ${pegName[aux]}, ${pegName[dst]}) — move top ${diskNum - 1} to aux peg`,
        action: 'RECURSE',
        tone: 'neutral',
      }));
      hanoi(diskNum - 1, src, aux, dst);

      out.push(snap({
        line: 5,
        caption: `원판 ${diskNum}(가장 큰) 을(를) ${pegName[src]} → ${pegName[dst]} 로 이동`,
        captionEn: `Move the largest remaining disk ${diskNum}: ${pegName[src]} → ${pegName[dst]}`,
        action: 'BIG MOVE',
        tone: 'active',
      }));
      move(diskNum, src, dst);

      out.push(snap({
        line: 6,
        caption: `hanoi(${diskNum - 1}, ${pegName[aux]}, ${pegName[dst]}, ${pegName[src]}) — 보조 기둥에서 목표로`,
        captionEn: `hanoi(${diskNum - 1}, ${pegName[aux]}, ${pegName[dst]}, ${pegName[src]}) — move ${diskNum - 1} from aux to destination`,
        action: 'RECURSE',
        tone: 'neutral',
      }));
      hanoi(diskNum - 1, aux, dst, src);
    };

    hanoi(n, 0, 2, 1);

    out.push(snap({
      line: 0,
      caption: `완료! ${Math.pow(2, n) - 1}번의 이동으로 모든 원판이 기둥 C에 도착했습니다.`,
      captionEn: `Done! All ${n} disks moved to peg C in ${Math.pow(2, n) - 1} moves (minimum possible).`,
      action: 'DONE',
      tone: 'good',
    }));

    return out;
  },

  createRenderer: () => new HanoiRenderer(),
};
