import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeInOutCubic, lerp, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';

interface GcdStep extends BaseStep {
  a: number;
  b: number;
  q?: number;
  r?: number;
  maxVal: number;
  done?: boolean;
}

const source = [
  { text: 'def gcd(a, b):', indent: 0 },
  { text: 'while b != 0:', indent: 1 },
  { text: 'q, r = divmod(a, b)   # a = q*b + r', indent: 2 },
  { text: 'a, b = b, r', indent: 2 },
  { text: 'return a', indent: 1 },
];

class GcdRenderer implements Renderer<GcdStep> {
  draw(rc: RenderCtx, prev: GcdStep | null, curr: GcdStep): void {
    const { ctx, width, height, time } = rc;
    const e = easeInOutCubic(rc.t);
    const padX = Math.max(28, width * 0.08);
    const usableW = width - padX * 2;
    const maxVal = curr.maxVal;
    const scale = (v: number) => (v / maxVal) * usableW;

    const a = prev ? lerp(prev.a, curr.a, e) : curr.a;
    const b = prev ? lerp(prev.b, curr.b, e) : curr.b;

    text(ctx, 'EUCLIDEAN  GCD', width / 2, 32, {
      size: clamp(width * 0.032, 11, 15), weight: 700, color: '#9A8B70', letterSpacing: 2,
    });

    // ── equation ──────────────────────────────────────────────────────────
    const eqY = height * 0.26;
    if (!curr.done && curr.q !== undefined && curr.r !== undefined) {
      text(ctx, `${curr.a} = ${curr.q} × ${curr.b} + ${curr.r}`, width / 2, eqY, {
        size: clamp(width * 0.05, 16, 28), weight: 800, color: '#4A3528',
      });
    } else if (curr.done) {
      text(ctx, `gcd = ${curr.a}`, width / 2, eqY, {
        size: clamp(width * 0.06, 18, 34), weight: 800, color: '#1E7A6F',
      });
    }

    const barH = clamp(height * 0.08, 34, 64);
    const aY = height * 0.44;
    const bY = aY + barH + 56;

    // ── bar a, segmented into q blocks of b + remainder r ─────────────────
    const aW = scale(a);
    const aX = (width - aW) / 2;
    text(ctx, `a = ${curr.a}`, aX, aY - 16, {
      size: 13, weight: 700, color: '#6F4E37', align: 'left',
    });

    if (!curr.done && curr.q !== undefined && curr.r !== undefined && curr.b > 0) {
      const segW = scale(curr.b);
      let sx = aX;
      for (let k = 0; k < curr.q; k++) {
        const shade = k % 2 === 0 ? '#C9A87C' : '#A8835E';
        roundRect(ctx, sx, aY, segW - 2, barH, 8);
        ctx.fillStyle = shade;
        ctx.fill();
        text(ctx, String(curr.b), sx + segW / 2, aY + barH / 2, {
          size: clamp(segW * 0.3, 9, 15), weight: 700, color: '#FFF7EA',
        });
        sx += segW;
      }
      // remainder block (highlighted)
      const rW = scale(curr.r);
      if (rW > 1) {
        ctx.save();
        const pulse = 0.6 + 0.4 * Math.sin(time * 4);
        ctx.shadowColor = rgba('#E07856', 0.6 * pulse);
        ctx.shadowBlur = 16;
        roundRect(ctx, sx, aY, Math.max(rW - 2, 4), barH, 8);
        ctx.fillStyle = '#E07856';
        ctx.fill();
        ctx.restore();
        text(ctx, `r=${curr.r}`, sx + rW / 2, aY + barH / 2, {
          size: clamp(rW * 0.32, 9, 14), weight: 800, color: '#FFF7EA',
        });
      }
    } else {
      // single solid bar (e.g. final state)
      roundRect(ctx, aX, aY, Math.max(aW, 4), barH, 8);
      ctx.fillStyle = curr.done ? '#2A9D8F' : '#C9A87C';
      ctx.fill();
      text(ctx, String(curr.a), aX + aW / 2, aY + barH / 2, {
        size: clamp(aW * 0.12, 11, 18), weight: 800, color: '#FFF7EA',
      });
    }

    // ── bar b (reference) ─────────────────────────────────────────────────
    if (curr.b > 0 || (prev && prev.b > 0)) {
      const bW = scale(b);
      const bX = (width - bW) / 2;
      ctx.save();
      roundRect(ctx, bX, bY, Math.max(bW, 4), barH, 8);
      ctx.fillStyle = '#2A9D8F';
      ctx.fill();
      ctx.restore();
      text(ctx, `b = ${curr.b}`, bX, bY - 16, {
        size: 13, weight: 700, color: '#1E7A6F', align: 'left',
      });
      if (bW > 24) {
        text(ctx, String(curr.b), bX + bW / 2, bY + barH / 2, {
          size: clamp(bW * 0.14, 11, 18), weight: 800, color: '#FFF7EA',
        });
      }
    }

    // ── caption hint ──────────────────────────────────────────────────────
    if (!curr.done) {
      text(ctx, 'a 안에 b 가 몇 번 들어가고 얼마가 남는가 → 남은 값으로 반복',
        width / 2, height - 30, {
          size: clamp(width * 0.028, 10, 14), weight: 600, color: rgba('#9A8B70', 0.9),
        });
    }
  }
}

export const gcd: Algorithm<GcdStep> = {
  meta: {
    id: 'euclidean-gcd',
    category: 'math',
    name: 'Euclidean Algorithm (GCD)',
    tagline: 'Repeated remainder until nothing is left',
    hook: '나머지를 반복해 최대공약수를 찾습니다',
    difficulty: 'Easy',
    time: 'O(log min(a,b))',
    space: 'O(1)',
    accent: 'brown',
    glyph: '➗',
    summary:
      '두 수의 최대공약수(GCD)를 구하는 2000년 넘은 알고리즘입니다. 핵심은 gcd(a, b) = gcd(b, a mod b) 라는 성질입니다. 큰 수를 작은 수로 나눈 나머지로 계속 바꿔가다 나머지가 0이 되면, 그때의 나누는 수가 최대공약수입니다. 막대를 “몇 번 들어가고 얼마가 남는지”로 시각화합니다.',
    keyPoints: [
      '핵심 성질: gcd(a, b) = gcd(b, a mod b)',
      '나머지가 0이 되는 순간의 제수가 GCD',
      '나눗셈 기반이라 매우 빠름 (로그 시간)',
    ],
    steps: [
      'a 를 b 로 나눈 몫 q 와 나머지 r 을 구합니다.',
      'a = q×b + r 로 막대를 분할해 보여줍니다.',
      '(a, b) 를 (b, r) 로 바꿔 반복합니다.',
      'r 이 0이 되면 b 가 최대공약수입니다.',
    ],
    defaultInput: '84 | 60',
    inputHint: '두 자연수  예: 84 | 60',
    en: {
      name: 'Euclidean Algorithm (GCD)',
      tagline: 'Repeated remainder until nothing is left',
      hook: 'Finds the greatest common divisor through repeated remainders',
      summary:
        'A 2000-year-old algorithm for the greatest common divisor. Its key identity is gcd(a, b) = gcd(b, a mod b). Replace the pair with (b, a mod b) repeatedly; when the remainder hits zero, the current divisor is the GCD. The bar shows how many times b fits into a and what remains.',
      keyPoints: [
        'Key identity: gcd(a, b) = gcd(b, a mod b)',
        'The divisor when the remainder becomes 0 is the GCD',
        'Division-based, so very fast (logarithmic time)',
      ],
      steps: [
        'Divide a by b to get quotient q and remainder r.',
        'Split the bar as a = q×b + r.',
        'Replace (a, b) with (b, r) and repeat.',
        'When r reaches 0, b is the greatest common divisor.',
      ],
      defaultInput: '84 | 60',
      inputHint: 'Two positive integers  e.g. 84 | 60',
    },
  },
  sourceCode: source,
  generate(input) {
    let nums = input
      .split(/[|\s,]+/)
      .map((s) => parseInt(s, 10))
      .filter((x) => Number.isFinite(x) && x > 0);
    if (nums.length < 2) nums = [84, 60];
    let a = clamp(nums[0], 1, 99999);
    let b = clamp(nums[1], 1, 99999);
    if (a < b) [a, b] = [b, a];
    const maxVal = Math.max(a, b);

    const out: GcdStep[] = [];
    const snap = (e: Partial<GcdStep>): GcdStep => ({
      line: 0,
      caption: '',
      a,
      b,
      maxVal,
      ...e,
    });

    out.push(snap({
      line: 0,
      caption: `gcd(${a}, ${b}) 를 구합니다 — 큰 수를 작은 수로 나눠갑니다.`,
      captionEn: `Compute gcd(${a}, ${b}) — repeatedly divide the larger by the smaller.`,
      action: 'START',
      tone: 'neutral',
      a, b,
    }));

    let ca = a;
    let cb = b;
    let guard = 0;
    while (cb !== 0 && guard++ < 100) {
      const q = Math.floor(ca / cb);
      const r = ca % cb;
      out.push(snap({
        line: 2,
        caption: `${ca} ÷ ${cb} = 몫 ${q}, 나머지 ${r}  →  ${ca} = ${q}×${cb} + ${r}`,
        captionEn: `${ca} ÷ ${cb} = quotient ${q}, remainder ${r}  →  ${ca} = ${q}×${cb} + ${r}`,
        action: 'DIVIDE',
        tone: 'active',
        a: ca, b: cb, q, r,
      }));
      out.push(snap({
        line: 3,
        caption: r === 0
          ? `나머지가 0 — 나누던 수 ${cb} 가 최대공약수입니다.`
          : `(a, b) ← (${cb}, ${r}) 로 바꿔 반복합니다.`,
        captionEn: r === 0
          ? `Remainder is 0 — the divisor ${cb} is the GCD.`
          : `Replace (a, b) ← (${cb}, ${r}) and repeat.`,
        action: 'REPLACE',
        tone: r === 0 ? 'good' : 'compare',
        a: cb, b: r,
      }));
      ca = cb;
      cb = r;
    }

    out.push(snap({
      line: 4,
      caption: `완료! gcd(${a}, ${b}) = ${ca}`,
      captionEn: `Done! gcd(${a}, ${b}) = ${ca}`,
      action: 'DONE',
      tone: 'good',
      a: ca, b: 0,
      done: true,
    }));

    return out;
  },
  createRenderer: () => new GcdRenderer(),
};
