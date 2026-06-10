import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text, line } from '../../core/draw';
import { easeOutBack, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';

// state codes
const UNKNOWN = 0;
const PRIME = 1;
const COMPOSITE = 2;

interface SieveStep extends BaseStep {
  n: number;
  state: number[]; // index 0..n
  cur?: number; // current prime p
  marking?: number; // multiple being struck out this step
}

const source = [
  { text: 'def sieve(n):', indent: 0 },
  { text: 'is_prime = [True] * (n + 1)', indent: 1 },
  { text: 'is_prime[0] = is_prime[1] = False', indent: 1 },
  { text: 'p = 2', indent: 1 },
  { text: 'while p * p <= n:', indent: 1 },
  { text: 'if is_prime[p]:', indent: 2 },
  { text: 'for m in range(p*p, n+1, p):', indent: 3 },
  { text: 'is_prime[m] = False', indent: 4 },
  { text: 'p += 1', indent: 2 },
  { text: 'return [i for i in range(2, n+1) if is_prime[i]]', indent: 1 },
];

class SieveRenderer implements Renderer<SieveStep> {
  draw(rc: RenderCtx, prev: SieveStep | null, curr: SieveStep): void {
    const { ctx, width, height, time } = rc;
    const n = curr.n;
    const count = n - 1; // numbers 2..n

    const padX = Math.max(18, width * 0.05);
    const padTop = 64;
    const padBottom = 56;
    const availW = width - padX * 2;
    const availH = height - padTop - padBottom;

    // choose a column count that keeps cells roughly square within the stage
    let cols = Math.max(1, Math.round(Math.sqrt(count * (availW / availH))));
    cols = clamp(cols, 4, 12);
    let rows = Math.ceil(count / cols);
    let cell = Math.min(availW / cols, availH / rows);
    cell = Math.min(cell, 64);
    const gridW = cell * cols;
    const gridH = cell * rows;
    const startX = (width - gridW) / 2;
    const startY = padTop + (availH - gridH) / 2;

    text(ctx, `SIEVE OF ERATOSTHENES   ·   n = ${n}`, width / 2, 30, {
      size: clamp(width * 0.032, 11, 15), weight: 700, color: '#9A8B70', letterSpacing: 2,
    });

    const numAt = (i: number) => i + 2; // grid position i → number
    let primesFound = 0;

    for (let i = 0; i < count; i++) {
      const num = numAt(i);
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = startX + c * cell;
      const y = startY + r * cell;
      const pad = cell * 0.07;
      const cw = cell - pad * 2;

      const st = curr.state[num];
      const isCur = curr.cur === num;
      const isMarking = curr.marking === num;
      if (st === PRIME) primesFound++;

      let fill = '#F3E9D6';
      let stroke = rgba('#C9A87C', 0.35);
      let txtColor = '#6F4E37';
      let glow = '';
      if (st === PRIME) {
        fill = '#CDEBE4';
        stroke = rgba('#2A9D8F', 0.6);
        txtColor = '#1E7A6F';
      } else if (st === COMPOSITE) {
        fill = '#EEE6D6';
        stroke = rgba('#C9A87C', 0.25);
        txtColor = rgba('#9A8B70', 0.7);
      }
      if (isMarking) {
        fill = '#F8DCD0';
        stroke = '#E07856';
        txtColor = '#C85A3A';
        glow = rgba('#E07856', 0.6);
      }
      if (isCur) {
        fill = '#FBE5C2';
        stroke = '#E0A33B';
        txtColor = '#C9821C';
        glow = rgba('#E0A33B', 0.65);
      }

      // pop when just struck this step
      const prevMarking = prev?.marking === num;
      const pop = isMarking && !prevMarking ? easeOutBack(clamp(rc.t, 0, 1)) : 1;
      const sw = cw * (0.6 + 0.4 * pop);
      const ox = x + (cell - sw) / 2;
      const oy = y + (cell - sw) / 2;

      ctx.save();
      if (glow) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 4);
        ctx.shadowColor = glow;
        ctx.shadowBlur = 16 * pulse;
      } else if (st === PRIME) {
        ctx.shadowColor = rgba('#2A9D8F', 0.14);
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
      }
      roundRect(ctx, ox, oy, sw, sw, 9);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();

      ctx.lineWidth = isCur || isMarking || st === PRIME ? 2 : 1.1;
      ctx.strokeStyle = stroke;
      roundRect(ctx, ox, oy, sw, sw, 9);
      ctx.stroke();

      text(ctx, String(num), x + cell / 2, y + cell / 2, {
        size: clamp(cell * 0.34, 9, 19), weight: 800, color: txtColor,
      });

      // strike-through line for composites
      if (st === COMPOSITE && !isMarking) {
        line(ctx, ox + sw * 0.2, oy + sw * 0.5, ox + sw * 0.8, oy + sw * 0.5, rgba('#9A8B70', 0.5), 1.5);
      }
    }

    text(ctx, `primes found: ${primesFound}`, width / 2, height - 28, {
      size: clamp(width * 0.035, 12, 18), weight: 800, color: '#1E7A6F',
    });
    void prev;
  }
}

export const sieve: Algorithm<SieveStep> = {
  meta: {
    id: 'sieve-eratosthenes',
    category: 'math',
    name: 'Sieve of Eratosthenes',
    tagline: 'Cross out multiples to leave the primes',
    hook: '배수를 지워나가면 소수만 남습니다',
    difficulty: 'Easy',
    time: 'O(n log log n)',
    space: 'O(n)',
    accent: 'teal',
    glyph: '🔢',
    summary:
      '2부터 n까지의 수 중에서 소수를 찾는 고전 알고리즘입니다. 가장 작은 수 2를 소수로 확정한 뒤 그 배수(4,6,8…)를 모두 지웁니다. 다음으로 남은 가장 작은 수 3을 소수로 확정하고 배수를 지우는 과정을 √n 까지 반복하면, 지워지지 않고 남은 수가 곧 소수입니다.',
    keyPoints: [
      '가장 작은 미지의 수는 항상 소수',
      '소수 p 의 배수는 p×p 부터 지우면 충분',
      'p ≤ √n 까지만 검사하면 됨',
    ],
    steps: [
      '2부터 n까지 모두 소수 후보로 둡니다.',
      '남은 가장 작은 수 p 를 소수로 확정합니다.',
      'p×p 부터 p 간격으로 배수를 지웁니다.',
      'p > √n 이 되면 남은 수가 모두 소수입니다.',
    ],
    defaultInput: '30',
    inputHint: 'n 값 (10–60 권장)',
    en: {
      name: 'Sieve of Eratosthenes',
      tagline: 'Cross out multiples to leave the primes',
      hook: 'Strike out the multiples and the primes remain',
      summary:
        'A classic algorithm for finding all primes up to n. Confirm the smallest number 2 as prime, then strike out all its multiples (4, 6, 8…). Confirm the next surviving number 3, strike its multiples, and repeat up to √n. Whatever is left uncrossed is prime.',
      keyPoints: [
        'The smallest unmarked number is always prime',
        'Striking multiples of p can start from p×p',
        'Only need to test p up to √n',
      ],
      steps: [
        'Mark every number from 2 to n as a prime candidate.',
        'Confirm the smallest surviving number p as prime.',
        'Strike out multiples of p starting at p×p, stepping by p.',
        'Once p > √n, everything left is prime.',
      ],
      defaultInput: '30',
      inputHint: 'Value of n (10–60 recommended)',
    },
  },
  sourceCode: source,
  generate(input) {
    const parsed = parseInt(input.trim(), 10);
    const n = Number.isFinite(parsed) ? clamp(parsed, 10, 60) : 30;

    const state = new Array(n + 1).fill(UNKNOWN);
    state[0] = COMPOSITE;
    state[1] = COMPOSITE;
    const out: SieveStep[] = [];
    const snap = (e: Partial<SieveStep>): SieveStep => ({
      line: 0,
      caption: '',
      n,
      state: [...state],
      ...e,
    });

    out.push(snap({
      line: 1,
      caption: `2부터 ${n}까지 모두 소수 후보로 둡니다.`,
      captionEn: `Mark every number from 2 to ${n} as a prime candidate.`,
      action: 'INIT',
      tone: 'neutral',
    }));

    for (let p = 2; p * p <= n; p++) {
      if (state[p] === COMPOSITE) continue;
      state[p] = PRIME;
      out.push(snap({
        line: 5,
        caption: `${p} 은 소수로 확정 — 이제 ${p} 의 배수를 지웁니다.`,
        captionEn: `${p} is prime — now strike out its multiples.`,
        action: `PRIME ${p}`,
        tone: 'active',
        cur: p,
      }));
      for (let m = p * p; m <= n; m += p) {
        if (state[m] === COMPOSITE) continue;
        state[m] = COMPOSITE;
        out.push(snap({
          line: 7,
          caption: `${m} = ${p} × ${m / p} → 합성수, 지움`,
          captionEn: `${m} = ${p} × ${m / p} → composite, struck out`,
          action: 'STRIKE',
          tone: 'compare',
          cur: p,
          marking: m,
        }));
      }
    }

    // remaining unknowns are prime
    const primes: number[] = [];
    for (let i = 2; i <= n; i++) {
      if (state[i] === PRIME) primes.push(i);
      else if (state[i] === UNKNOWN) {
        state[i] = PRIME;
        primes.push(i);
      }
    }
    out.push(snap({
      line: 9,
      caption: `완료! ${n} 이하 소수 ${primes.length}개: ${primes.join(', ')}`,
      captionEn: `Done! ${primes.length} primes ≤ ${n}: ${primes.join(', ')}`,
      action: 'DONE',
      tone: 'good',
    }));

    return out;
  },
  createRenderer: () => new SieveRenderer(),
};

export type { SieveStep };
export { UNKNOWN, PRIME, COMPOSITE };
