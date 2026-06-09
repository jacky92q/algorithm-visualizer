import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeOutBack, easeInOutCubic, lerp, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';

// ─── Step Interface ───────────────────────────────────────────────────────────

export interface FibStep extends BaseStep {
  n: number;                  // computing fib(0..n)
  dp: number[];               // dp[i] = -1 if not yet computed
  active?: number;            // index currently being filled
  deps?: [number, number];    // [i-1, i-2] — show dependency arrows
}

// ─── Renderer ────────────────────────────────────────────────────────────────

class FibRenderer implements Renderer<FibStep> {
  draw(rc: RenderCtx, prev: FibStep | null, curr: FibStep): void {
    const { ctx, width, height, time } = rc;
    const e = easeInOutCubic(rc.t);
    const totalSlots = curr.n + 1;

    // Layout
    const padX = Math.max(24, width * 0.05);
    const usableW = width - padX * 2;
    const boxW = Math.min((usableW - (totalSlots - 1) * 6) / totalSlots, 64);
    const gap = Math.min(6, (usableW - totalSlots * boxW) / Math.max(totalSlots - 1, 1));
    const totalW = totalSlots * boxW + (totalSlots - 1) * gap;
    const startX = (width - totalW) / 2;
    const boxH = Math.min(boxW * 1.05, 60);
    const rowY = height * 0.46;

    const boxCX = (i: number) => startX + i * (boxW + gap) + boxW / 2;
    const boxLeft = (i: number) => startX + i * (boxW + gap);

    // ── Title ────────────────────────────────────────────────────────────
    text(ctx, `FIBONACCI  DP  TABLE   fib(${curr.n})`, width / 2, 28, {
      size: 12, weight: 700, color: '#9A8B70', letterSpacing: 2,
    });

    // ── Dependency arrows ────────────────────────────────────────────────
    if (curr.active !== undefined && curr.deps) {
      const [ia, ib] = curr.deps;
      const targetCX = boxCX(curr.active);
      const targetTopY = rowY - boxH / 2 - 2;

      [ia, ib].forEach((srcIdx, which) => {
        if (srcIdx < 0) return;
        const srcCX = boxCX(srcIdx);
        const srcTopY = rowY - boxH / 2 - 2;

        // Draw a bezier arc from src-top to target-top
        const arcH = 38 + which * 14;
        const cpX = (srcCX + targetCX) / 2;
        const cpY = srcTopY - arcH;

        const arrowColor = which === 0 ? '#2A9D8F' : '#E07856';
        const alphaPulse = 0.6 + 0.4 * Math.sin(time * 4 + which);
        ctx.save();
        ctx.strokeStyle = rgba(arrowColor, 0.7 * alphaPulse);
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(srcCX, srcTopY);
        ctx.quadraticCurveTo(cpX, cpY, targetCX, targetTopY);
        ctx.stroke();
        ctx.restore();

        // Arrowhead at target
        const dx = targetCX - cpX;
        const dy = targetTopY - cpY;
        const ang = Math.atan2(dy, dx);
        ctx.save();
        ctx.fillStyle = rgba(arrowColor, alphaPulse);
        ctx.beginPath();
        ctx.translate(targetCX, targetTopY);
        ctx.rotate(ang);
        ctx.moveTo(0, 0);
        ctx.lineTo(-9, -4);
        ctx.lineTo(-9, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Equation text above the active box
      const va = curr.dp[ia];
      const vb = curr.dp[ib];
      if (va >= 0 && vb >= 0) {
        text(ctx, `${va}  +  ${vb}  =  ${va + vb}`, boxCX(curr.active), rowY - boxH / 2 - 74, {
          size: clamp(width * 0.038, 14, 20),
          weight: 800,
          color: '#C9821C',
        });
      }
    }

    // ── Boxes ─────────────────────────────────────────────────────────────
    for (let i = 0; i <= curr.n; i++) {
      const v = curr.dp[i];
      const prevV = prev ? prev.dp[i] : -1;
      const isActive = curr.active === i;
      const justFilled = isActive && v >= 0 && prevV < 0;
      const isComputed = v >= 0;

      // Pop-in scale animation for newly filled box
      const popT = justFilled ? easeOutBack(clamp(rc.t, 0, 1)) : 1;
      const prevIsActive = prev?.active === i && prev?.dp[i] < 0;
      const fadeOutActive = prevIsActive && !isActive;
      const scaleT = fadeOutActive ? lerp(1, 0.95, e) : popT;

      const scaledW = boxW * (0.5 + 0.5 * scaleT);
      const scaledH = boxH * (0.5 + 0.5 * scaleT);
      const bx = boxLeft(i) + (boxW - scaledW) / 2;
      const by = rowY - scaledH / 2;

      let fill: string;
      let stroke: string;
      let glow = '';

      if (isActive) {
        fill = '#FBE5C2';
        stroke = '#E0A33B';
        glow = rgba('#E0A33B', 0.6);
      } else if (isComputed) {
        fill = '#CDEBE4';
        stroke = rgba('#2A9D8F', 0.6);
      } else {
        fill = '#F3E9D6';
        stroke = rgba('#C9A87C', 0.3);
      }

      ctx.save();
      if (glow) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 4);
        ctx.shadowColor = rgba('#E0A33B', pulse * 0.7);
        ctx.shadowBlur = 18;
      } else if (isComputed) {
        ctx.shadowColor = rgba('#2A9D8F', 0.15);
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
      }
      roundRect(ctx, bx, by, scaledW, scaledH, 12);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();

      ctx.lineWidth = (isActive || isComputed) ? 2 : 1.2;
      ctx.strokeStyle = stroke;
      roundRect(ctx, bx, by, scaledW, scaledH, 12);
      ctx.stroke();

      // Value label
      if (isComputed && scaledW > 18) {
        text(ctx, String(v), boxCX(i), rowY, {
          size: clamp(boxW * 0.36, 11, 20),
          weight: 800,
          color: isActive ? '#C9821C' : '#1E7A6F',
        });
      } else if (!isComputed && scaledW > 18) {
        text(ctx, '?', boxCX(i), rowY, {
          size: clamp(boxW * 0.32, 10, 18),
          weight: 700,
          color: rgba('#9A8B70', 0.5),
        });
      }

      // Index label below box
      text(ctx, `[${i}]`, boxCX(i), rowY + boxH / 2 + 16, {
        size: clamp(boxW * 0.24, 9, 13),
        weight: 600,
        color: '#B0A081',
      });
    }

    // ── Base case labels ──────────────────────────────────────────────────
    if (totalSlots > 1) {
      text(ctx, 'fib(0)=0', boxCX(0), rowY - boxH / 2 - 14, {
        size: 9, weight: 600, color: rgba('#9A8B70', 0.6),
      });
    }
    if (totalSlots > 2) {
      text(ctx, 'fib(1)=1', boxCX(1), rowY - boxH / 2 - 14, {
        size: 9, weight: 600, color: rgba('#9A8B70', 0.6),
      });
    }

    // ── Progress bar at bottom ────────────────────────────────────────────
    const computed = curr.dp.filter((v) => v >= 0).length;
    const progress = computed / (curr.n + 1);
    const barW = width * 0.6;
    const barH2 = 6;
    const bx2 = (width - barW) / 2;
    const by2 = height - 48;
    ctx.save();
    roundRect(ctx, bx2, by2, barW, barH2, 3);
    ctx.fillStyle = rgba('#C9A87C', 0.3);
    ctx.fill();
    roundRect(ctx, bx2, by2, barW * progress, barH2, 3);
    ctx.fillStyle = '#2A9D8F';
    ctx.fill();
    ctx.restore();
    text(ctx, `fib(${curr.active ?? curr.n}) = ${curr.dp[curr.active ?? curr.n] >= 0 ? curr.dp[curr.active ?? curr.n] : '?'}`,
      width / 2, height - 24, {
        size: 14, weight: 700, color: '#4A3528',
      });

    void prev;
  }
}

// ─── Source Code ─────────────────────────────────────────────────────────────

const source = [
  { text: 'def fib_dp(n):', indent: 0 },
  { text: 'if n <= 1: return n', indent: 1 },
  { text: 'dp = [-1] * (n + 1)', indent: 1 },
  { text: 'dp[0] = 0', indent: 1 },
  { text: 'dp[1] = 1', indent: 1 },
  { text: 'for i in range(2, n + 1):', indent: 1 },
  { text: 'dp[i] = dp[i-1] + dp[i-2]', indent: 2 },
  { text: 'return dp[n]', indent: 1 },
];

// ─── Algorithm ───────────────────────────────────────────────────────────────

export const fibonacci: Algorithm<FibStep> = {
  meta: {
    id: 'fibonacci-dp',
    category: 'dp',
    name: 'Fibonacci DP',
    tagline: 'Build up from base cases with memoization',
    hook: '이미 푼 문제를 기록해 중복 계산을 없앱니다',
    difficulty: 'Easy',
    time: 'O(n)',
    space: 'O(n)',
    accent: 'amber',
    glyph: '🌀',
    summary:
      '피보나치 수열을 단순 재귀로 풀면 같은 계산을 수없이 반복합니다. 동적 프로그래밍으로 dp 배열에 이미 계산한 값을 저장하면, 각 fib(i)는 딱 한 번만 계산됩니다. O(n) 시간, O(n) 공간.',
    keyPoints: [
      '기저 케이스: dp[0]=0, dp[1]=1',
      '점화식: dp[i] = dp[i-1] + dp[i-2]',
      '중복 계산 제거 → 지수 O(2ⁿ) → 선형 O(n)',
    ],
    steps: [
      'dp[0] = 0, dp[1] = 1 로 초기화합니다.',
      'i = 2부터 n까지 dp[i] = dp[i-1] + dp[i-2]를 계산합니다.',
      '각 계산 시 두 이전 값을 화살표로 시각화합니다.',
      'dp[n] 이 최종 피보나치 수입니다.',
    ],
    defaultInput: '10',
    inputHint: 'n 값 (2–15 권장)',
    en: {
      name: 'Fibonacci DP',
      tagline: 'Build up from base cases with memoization',
      hook: 'Records solved subproblems to eliminate redundant computation',
      summary: 'Naive recursion recomputes the same Fibonacci values exponentially. Dynamic programming stores each dp[i] once, reducing time complexity from O(2ⁿ) to O(n). Arrows visualize which previous values each new value depends on.',
      keyPoints: [
        'Base cases: dp[0]=0, dp[1]=1',
        'Recurrence: dp[i] = dp[i-1] + dp[i-2]',
        'Memoization: O(2ⁿ) → O(n) via eliminating recomputation',
      ],
      steps: [
        'Initialize dp[0]=0 and dp[1]=1.',
        'For i from 2 to n, compute dp[i] = dp[i-1] + dp[i-2].',
        'Arrows show which two previous values are being summed.',
        'dp[n] is the final Fibonacci number.',
      ],
      defaultInput: '10',
      inputHint: 'Value of n (2–15 recommended)',
    },
  },
  sourceCode: source,

  generate(input) {
    const parsed = parseInt(input.trim(), 10);
    const n = Number.isFinite(parsed) && parsed >= 2 && parsed <= 15 ? parsed : 10;

    const dp = new Array(n + 1).fill(-1);
    const out: FibStep[] = [];

    const snap = (extra: Partial<FibStep>): FibStep => ({
      line: 0,
      caption: '',
      captionEn: '',
      n,
      dp: [...dp],
      ...extra,
    });

    out.push(snap({
      line: 2,
      caption: `fib(${n}) 계산 시작 — dp 배열 초기화 (모두 -1)`,
      captionEn: `Starting fib(${n}) — initialize dp array with -1 (uncomputed)`,
      action: 'INIT',
      tone: 'neutral',
    }));

    dp[0] = 0;
    out.push(snap({
      line: 3,
      caption: 'dp[0] = 0 — 기저 케이스 설정',
      captionEn: 'dp[0] = 0 — base case',
      action: 'BASE',
      tone: 'good',
      active: 0,
    }));

    if (n >= 1) {
      dp[1] = 1;
      out.push(snap({
        line: 4,
        caption: 'dp[1] = 1 — 기저 케이스 설정',
        captionEn: 'dp[1] = 1 — base case',
        action: 'BASE',
        tone: 'good',
        active: 1,
      }));
    }

    for (let i = 2; i <= n; i++) {
      out.push(snap({
        line: 6,
        caption: `dp[${i}] 계산 중 — dp[${i - 1}](${dp[i - 1]}) + dp[${i - 2}](${dp[i - 2]})`,
        captionEn: `Computing dp[${i}] = dp[${i - 1}](${dp[i - 1]}) + dp[${i - 2}](${dp[i - 2]})`,
        action: 'COMPUTE',
        tone: 'active',
        active: i,
        deps: [i - 1, i - 2],
      }));

      dp[i] = dp[i - 1] + dp[i - 2];

      out.push(snap({
        line: 6,
        caption: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]} ✓`,
        captionEn: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]} ✓`,
        action: 'FILL',
        tone: 'good',
        active: i,
        deps: [i - 1, i - 2],
      }));
    }

    out.push(snap({
      line: 7,
      caption: `완료! fib(${n}) = ${dp[n]}`,
      captionEn: `Done! fib(${n}) = ${dp[n]}`,
      action: 'DONE',
      tone: 'good',
      active: n,
    }));

    return out;
  },

  createRenderer: () => new FibRenderer(),
};
