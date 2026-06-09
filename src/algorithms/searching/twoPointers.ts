import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeOutBack, easeInOutCubic, lerp, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';

// ─── Step Interface ───────────────────────────────────────────────────────────

export interface TwoPointerStep extends BaseStep {
  values: number[];     // sorted array
  target: number;       // target sum
  left: number;         // left pointer index
  right: number;        // right pointer index
  found?: boolean;      // pair found
  currentSum?: number;  // current sum being evaluated
  done?: boolean;       // algorithm finished
}

// ─── Renderer ────────────────────────────────────────────────────────────────

class TwoPointerRenderer implements Renderer<TwoPointerStep> {
  draw(rc: RenderCtx, prev: TwoPointerStep | null, curr: TwoPointerStep): void {
    const { ctx, width, height, time } = rc;
    const e = easeInOutCubic(rc.t);
    const n = curr.values.length;

    const padX = Math.max(28, width * 0.07);
    const usableW = width - padX * 2;
    const chipW = Math.min((usableW - (n - 1) * 8) / n, 58);
    const gap = Math.min(8, (usableW - n * chipW) / (n - 1));
    const totalW = n * chipW + (n - 1) * gap;
    const startX = (width - totalW) / 2;
    const chipH = Math.min(chipW * 1.05, 56);
    const cy = height * 0.42;

    // ── Target banner ──────────────────────────────────────────────────────
    const tw = 130;
    text(ctx, 'TARGET SUM', width / 2, cy - chipH / 2 - 82, {
      size: 11, weight: 700, color: '#9A8B70', letterSpacing: 3,
    });
    ctx.save();
    roundRect(ctx, width / 2 - tw / 2, cy - chipH / 2 - 70, tw, 40, 14);
    ctx.fillStyle = '#4A3528';
    ctx.shadowColor = rgba('#4A3528', 0.4);
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();
    text(ctx, String(curr.target), width / 2, cy - chipH / 2 - 50, {
      size: 24, weight: 800, color: '#FFF7EA',
    });

    // ── Current sum display ────────────────────────────────────────────────
    if (curr.currentSum !== undefined && !curr.done) {
      const sumStr = `${curr.values[curr.left]} + ${curr.values[curr.right]} = ${curr.currentSum}`;
      const sumColor = curr.currentSum === curr.target
        ? '#2A9D8F'
        : curr.currentSum < curr.target
          ? '#C9821C'
          : '#E07856';
      text(ctx, sumStr, width / 2, cy - chipH / 2 - 14, {
        size: clamp(width * 0.038, 14, 20),
        weight: 800,
        color: sumColor,
      });
    }

    // Interpolate pointer positions for smooth movement
    const prevLeft  = prev ? prev.left  : curr.left;
    const prevRight = prev ? prev.right : curr.right;
    const animLeft  = lerp(prevLeft,  curr.left,  e);
    const animRight = lerp(prevRight, curr.right, e);

    // ── Chips ──────────────────────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const x = startX + i * (chipW + gap);
      const isLeft  = i === curr.left;
      const isRight = i === curr.right;
      const isFound = curr.found && (isLeft || isRight);

      let fill = '#F3E9D6';
      let stroke = rgba('#C9A87C', 0.45);
      let glow = '';

      if (isFound) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 6);
        fill = '#D6F0EA';
        stroke = '#2A9D8F';
        glow = rgba('#2A9D8F', 0.55 + 0.2 * pulse);
      } else if (isLeft) {
        fill = '#D6F0EA';
        stroke = '#2A9D8F';
        glow = rgba('#2A9D8F', 0.5);
      } else if (isRight) {
        fill = '#F8DCD0';
        stroke = '#E07856';
        glow = rgba('#E07856', 0.5);
      }

      // Pop animation on newly active chips
      const justBecameActive = (isLeft  && prev?.left  !== curr.left  && i === curr.left) ||
                               (isRight && prev?.right !== curr.right && i === curr.right);
      const pop = justBecameActive ? easeOutBack(clamp(rc.t, 0, 1)) * 6 : (isLeft || isRight ? 3 : 0);

      ctx.save();
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = 'rgba(74,53,40,0.12)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
      }
      roundRect(ctx, x, cy - chipH / 2 - pop, chipW, chipH + pop * 0.5, 14);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();

      ctx.lineWidth = (isLeft || isRight) ? 2.5 : 1.5;
      ctx.strokeStyle = stroke;
      roundRect(ctx, x, cy - chipH / 2 - pop, chipW, chipH + pop * 0.5, 14);
      ctx.stroke();

      text(ctx, String(curr.values[i]), x + chipW / 2, cy - pop * 0.3, {
        size: clamp(chipW * 0.42, 14, 24),
        weight: 800,
        color: isFound ? '#1E7A6F' : isLeft ? '#1E7A6F' : isRight ? '#C85A3A' : '#4A3528',
      });
      text(ctx, String(i), x + chipW / 2, cy + chipH / 2 + 14, {
        size: 10, weight: 600, color: '#B0A081',
      });
    }

    // ── Pointer arrows (animated positions) ───────────────────────────────
    const arrowY = cy + chipH / 2 + 34;
    const chipCenter = (idx: number) => startX + idx * (chipW + gap) + chipW / 2;

    const drawArrow = (animIdx: number, label: string, color: string) => {
      const x = chipCenter(animIdx);
      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = rgba(color, 0.5);
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(x, arrowY - 10);
      ctx.lineTo(x - 7, arrowY + 2);
      ctx.lineTo(x + 7, arrowY + 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      text(ctx, label, x, arrowY + 16, { size: 13, weight: 800, color });
    };

    if (!curr.done) {
      drawArrow(animLeft, 'L', '#2A9D8F');
      drawArrow(animRight, 'R', '#E07856');
    }

    // ── Found / Not-found verdict ─────────────────────────────────────────
    if (curr.done) {
      const good = !!curr.found;
      const label = good
        ? `FOUND: ${curr.values[curr.left]} + ${curr.values[curr.right]} = ${curr.target}  ✓`
        : `NOT FOUND  ✕`;
      const col = good ? '#2A9D8F' : '#E07856';
      const vbw = Math.min(width * 0.72, 320);
      ctx.save();
      ctx.globalAlpha = clamp(rc.t * 1.8, 0, 1);
      ctx.shadowColor = rgba(col, 0.5);
      ctx.shadowBlur = 24;
      roundRect(ctx, width / 2 - vbw / 2, height * 0.72, vbw, 50, 16);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.restore();
      text(ctx, label, width / 2, height * 0.72 + 25, {
        size: clamp(width * 0.038, 13, 18),
        weight: 800,
        color: '#FFF7EA',
        alpha: clamp(rc.t * 1.8, 0, 1),
      });
    }
  }
}

// ─── Source Code ─────────────────────────────────────────────────────────────

const source = [
  { text: 'def two_sum_sorted(a, target):', indent: 0 },
  { text: 'lo, hi = 0, len(a) - 1', indent: 1 },
  { text: 'while lo < hi:', indent: 1 },
  { text: 's = a[lo] + a[hi]', indent: 2 },
  { text: 'if s == target:', indent: 2 },
  { text: 'return lo, hi', indent: 3 },
  { text: 'elif s < target:', indent: 2 },
  { text: 'lo += 1  # need larger sum', indent: 3 },
  { text: 'else:', indent: 2 },
  { text: 'hi -= 1  # need smaller sum', indent: 3 },
  { text: 'return None  # no pair found', indent: 1 },
];

// ─── Algorithm ───────────────────────────────────────────────────────────────

export const twoPointers: Algorithm<TwoPointerStep> = {
  meta: {
    id: 'two-pointers',
    category: 'searching',
    name: 'Two Pointers',
    tagline: 'Squeeze from both ends toward the target sum',
    hook: '양쪽 끝에서 좁혀오며 합을 맞춥니다',
    difficulty: 'Easy',
    time: 'O(n)',
    space: 'O(1)',
    accent: 'teal',
    glyph: '👈👉',
    summary:
      '정렬된 배열에서 두 수의 합이 target이 되는 쌍을 찾습니다. 왼쪽 포인터(L)와 오른쪽 포인터(R)로 시작해, 합이 크면 R을 왼쪽으로, 합이 작으면 L을 오른쪽으로 이동합니다. O(n) 시간, O(1) 공간.',
    keyPoints: [
      '배열이 정렬되어 있어야 작동',
      'L+R < target → L 증가  /  L+R > target → R 감소',
      'O(n) 시간, O(1) 공간 — 이중 루프 O(n²)보다 훨씬 효율적',
    ],
    steps: [
      'L = 0, R = n-1 로 양끝을 가리킵니다.',
      'a[L] + a[R] 을 계산합니다.',
      '합 < target 이면 L++, 합 > target 이면 R--.',
      'L >= R 까지 반복합니다.',
    ],
    defaultInput: '1 3 5 7 9 11 13 15 17 19 ? 20',
    inputHint: '정렬된 숫자 그리고 " ? target" (예: 1,3,5,7 ? 8)',
    en: {
      name: 'Two Pointers',
      tagline: 'Squeeze from both ends toward the target sum',
      hook: 'Converges from both ends to find the target sum pair',
      summary: 'Finds a pair in a sorted array whose sum equals the target. If the sum is too large move the right pointer left; if too small move the left pointer right. O(n) time, O(1) space.',
      keyPoints: [
        'Requires sorted input',
        'Sum too large → R--  /  Sum too small → L++',
        'O(n) time and O(1) space vs O(n²) brute force',
      ],
      steps: [
        'Set L = 0, R = n-1 pointing at both ends.',
        'Compute a[L] + a[R].',
        'If sum < target, L++; if sum > target, R--.',
        'Repeat until L >= R.',
      ],
      defaultInput: '1 3 5 7 9 11 13 15 17 19 ? 20',
      inputHint: 'Sorted numbers then " ? target" (e.g. 1,3,5,7 ? 8)',
    },
  },
  sourceCode: source,

  generate(input) {
    let target = 20;
    let arrPart = input;
    if (input.includes('?')) {
      const [a, t] = input.split('?');
      arrPart = a;
      target = parseInt(t.trim(), 10);
    }
    let values = arrPart
      .split(/[\s,]+/)
      .map((s) => parseInt(s, 10))
      .filter((x) => Number.isFinite(x))
      .slice(0, 14);
    if (!values.length) values = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    values = [...values].sort((a, b) => a - b);
    if (!Number.isFinite(target)) target = values[Math.floor(values.length / 2)] + values[Math.floor(values.length / 2) + 1];

    const n = values.length;
    const out: TwoPointerStep[] = [];

    const snap = (extra: Partial<TwoPointerStep>): TwoPointerStep => ({
      line: 0,
      caption: '',
      captionEn: '',
      values,
      target,
      left: 0,
      right: n - 1,
      done: false,
      ...extra,
    });

    out.push(snap({
      line: 1,
      caption: `L=0(값 ${values[0]}), R=${n - 1}(값 ${values[n - 1]}) — 양끝에서 시작`,
      captionEn: `L=0 (val ${values[0]}), R=${n - 1} (val ${values[n - 1]}) — start at both ends`,
      action: 'INIT',
      tone: 'neutral',
      left: 0,
      right: n - 1,
    }));

    let lo = 0;
    let hi = n - 1;

    while (lo < hi) {
      const s = values[lo] + values[hi];
      out.push(snap({
        line: 3,
        caption: `a[${lo}](${values[lo]}) + a[${hi}](${values[hi]}) = ${s}`,
        captionEn: `a[${lo}](${values[lo]}) + a[${hi}](${values[hi]}) = ${s}`,
        action: 'SUM',
        tone: 'active',
        left: lo,
        right: hi,
        currentSum: s,
      }));

      if (s === target) {
        out.push(snap({
          line: 5,
          caption: `${values[lo]} + ${values[hi]} = ${target} ✓ 발견!`,
          captionEn: `${values[lo]} + ${values[hi]} = ${target} ✓ Found!`,
          action: 'FOUND ✓',
          tone: 'good',
          left: lo,
          right: hi,
          found: true,
          currentSum: s,
          done: true,
        }));
        return out;
      } else if (s < target) {
        out.push(snap({
          line: 7,
          caption: `${s} < ${target} — 합이 작으므로 L++ 로 더 큰 수를 선택`,
          captionEn: `${s} < ${target} — sum too small, move L right for a larger value`,
          action: 'L++',
          tone: 'compare',
          left: lo,
          right: hi,
          currentSum: s,
        }));
        lo++;
      } else {
        out.push(snap({
          line: 9,
          caption: `${s} > ${target} — 합이 크므로 R-- 로 더 작은 수를 선택`,
          captionEn: `${s} > ${target} — sum too large, move R left for a smaller value`,
          action: 'R--',
          tone: 'compare',
          left: lo,
          right: hi,
          currentSum: s,
        }));
        hi--;
      }
    }

    out.push(snap({
      line: 10,
      caption: `L >= R — 합이 ${target} 인 쌍을 찾지 못했습니다.`,
      captionEn: `L >= R — no pair with sum ${target} exists.`,
      action: 'NOT FOUND',
      tone: 'bad',
      left: lo,
      right: hi,
      done: true,
    }));

    return out;
  },

  createRenderer: () => new TwoPointerRenderer(),
};
