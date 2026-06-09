import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeOutBack, easeInOutCubic, lerp, clamp } from '../../core/easing';
import { rgba, mixHex } from '../../core/palette';

// ─── Step Interface ───────────────────────────────────────────────────────────

export interface CountStep extends BaseStep {
  original: number[];           // original input values (fixed)
  output: (number | null)[];    // output array being built (null = empty slot)
  count: number[];              // count[v] = occurrences of value v
  maxVal: number;               // max value in input (count array length = maxVal + 1)
  activeOrig?: number;          // highlighted index in original array
  activeCount?: number;         // highlighted index in count array
  activeOut?: number;           // highlighted index in output array
  phase: 'count' | 'reconstruct' | 'done';
}

// ─── Renderer ────────────────────────────────────────────────────────────────

class CountingSortRenderer implements Renderer<CountStep> {
  draw(rc: RenderCtx, prev: CountStep | null, curr: CountStep): void {
    const { ctx, width, height, time } = rc;
    const e = easeInOutCubic(rc.t);
    const n = curr.original.length;
    const countLen = curr.maxVal + 1;

    // Layout: top section = original / output boxes, bottom section = count bars
    const topSectionH = height * 0.42;
    const bottomSectionH = height - topSectionH - 12;

    this._drawOriginalAndOutput(ctx, width, topSectionH, curr, prev, e, time, rc.t);
    this._drawCountBars(ctx, width, topSectionH + 12, bottomSectionH, n, countLen, curr, prev, e, time);
  }

  private _drawOriginalAndOutput(
    ctx: CanvasRenderingContext2D,
    width: number,
    _sectionH: number,
    curr: CountStep,
    prev: CountStep | null,
    e: number,
    _time: number,
    t: number,
  ) {
    const n = curr.original.length;
    const padX = Math.max(20, width * 0.06);
    const usableW = width - padX * 2;
    const cellW = Math.min((usableW - (n - 1) * 6) / n, 54);
    const gap = 6;
    const totalW = n * cellW + (n - 1) * gap;
    const startX = (width - totalW) / 2;

    // Row 1: original array (read-only)
    const origRowY = 44;
    const cellH = Math.min(cellW * 1.1, 50);

    text(ctx, 'INPUT', width / 2, origRowY - 18, {
      size: 11, weight: 700, color: '#9A8B70', letterSpacing: 3,
    });

    for (let i = 0; i < n; i++) {
      const x = startX + i * (cellW + gap);
      const v = curr.original[i];
      const isActive = curr.activeOrig === i;
      const prevActive = prev?.activeOrig === i;
      const popT = isActive ? easeOutBack(clamp(t, 0, 1)) : prevActive ? 1 - e : 0;
      const pop = popT * 5;

      ctx.save();
      if (isActive) {
        ctx.shadowColor = rgba('#E0A33B', 0.6);
        ctx.shadowBlur = 18;
      }
      roundRect(ctx, x, origRowY - pop, cellW, cellH + pop * 0.6, 10);
      ctx.fillStyle = isActive ? '#FBE5C2' : '#F3E9D6';
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = isActive ? 2.5 : 1.5;
      ctx.strokeStyle = isActive ? '#E0A33B' : rgba('#C9A87C', 0.5);
      roundRect(ctx, x, origRowY - pop, cellW, cellH + pop * 0.6, 10);
      ctx.stroke();

      text(ctx, String(v), x + cellW / 2, origRowY + cellH / 2 - pop * 0.2, {
        size: clamp(cellW * 0.4, 14, 22),
        weight: 800,
        color: isActive ? '#C9821C' : '#4A3528',
      });
      text(ctx, String(i), x + cellW / 2, origRowY + cellH + 12, {
        size: 10, weight: 600, color: '#B0A081',
      });
    }

    // Row 2: output array (being built)
    const outRowY = origRowY + cellH + 36;
    text(ctx, 'OUTPUT', width / 2, outRowY - 18, {
      size: 11, weight: 700, color: '#9A8B70', letterSpacing: 3,
    });

    for (let i = 0; i < n; i++) {
      const x = startX + i * (cellW + gap);
      const v = curr.output[i];
      const isActive = curr.activeOut === i;
      const justFilled = isActive && v !== null;

      const scaleT = justFilled ? easeOutBack(clamp(t, 0, 1)) : 1;
      const scaledW = cellW * (0.6 + 0.4 * scaleT);
      const scaledH = cellH * (0.6 + 0.4 * scaleT);
      const sx = x + (cellW - scaledW) / 2;
      const sy = outRowY + (cellH - scaledH) / 2;

      ctx.save();
      if (justFilled) {
        ctx.shadowColor = rgba('#2A9D8F', 0.55);
        ctx.shadowBlur = 16;
      }
      roundRect(ctx, sx, sy, scaledW, scaledH, 10);
      ctx.fillStyle = v !== null ? '#CDEBE4' : '#EDE6D8';
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = v !== null ? 2 : 1.2;
      ctx.strokeStyle = v !== null ? rgba('#2A9D8F', 0.6) : rgba('#C9A87C', 0.3);
      roundRect(ctx, sx, sy, scaledW, scaledH, 10);
      ctx.stroke();

      if (v !== null) {
        text(ctx, String(v), x + cellW / 2, outRowY + cellH / 2, {
          size: clamp(cellW * 0.4, 14, 22),
          weight: 800,
          color: '#1E7A6F',
        });
      }
    }

  }

  private _drawCountBars(
    ctx: CanvasRenderingContext2D,
    width: number,
    offsetY: number,
    sectionH: number,
    _n: number,
    countLen: number,
    curr: CountStep,
    prev: CountStep | null,
    e: number,
    time: number,
  ) {
    const padX = Math.max(24, width * 0.06);
    const usableW = width - padX * 2;
    const slotW = usableW / countLen;
    const cellW = Math.min(slotW * 0.78, 50);
    const barMaxH = sectionH - 68;
    const baseY = offsetY + sectionH - 28;
    const maxCount = Math.max(...curr.count, 1);

    text(ctx, 'COUNT  ARRAY', width / 2, offsetY + 16, {
      size: 11, weight: 700, color: '#9A8B70', letterSpacing: 3,
    });

    for (let v = 0; v < countLen; v++) {
      const cx = padX + slotW * v + slotW / 2;
      const countNow = curr.count[v];
      const countWas = prev ? prev.count[v] : 0;
      const isActive = curr.activeCount === v;

      // Animate count growing
      const animCount = lerp(countWas, countNow, e);
      const barH = Math.max(4, (animCount / maxCount) * barMaxH);
      const barTop = baseY - barH;

      const pulse = isActive ? (0.6 + 0.4 * Math.sin(time * 5)) : 0;

      ctx.save();
      if (isActive) {
        ctx.shadowColor = rgba('#E07856', 0.55 + 0.2 * pulse);
        ctx.shadowBlur = 16;
      }
      const grad = ctx.createLinearGradient(0, barTop, 0, baseY);
      grad.addColorStop(0, isActive ? '#EC9275' : mixHex('#C9A87C', '#5FC3B6', clamp(v / (countLen - 1), 0, 1)));
      grad.addColorStop(1, isActive ? '#C85A3A' : mixHex('#A8835E', '#2A9D8F', clamp(v / (countLen - 1), 0, 1)));
      const r = 7;
      ctx.beginPath();
      ctx.moveTo(cx - cellW / 2 + r, barTop);
      ctx.arcTo(cx + cellW / 2, barTop, cx + cellW / 2, barTop + r, r);
      ctx.lineTo(cx + cellW / 2, baseY);
      ctx.lineTo(cx - cellW / 2, baseY);
      ctx.lineTo(cx - cellW / 2, barTop + r);
      ctx.arcTo(cx - cellW / 2, barTop, cx - cellW / 2 + r, barTop, r);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Count number above bar
      if (countNow > 0) {
        text(ctx, String(countNow), cx, barTop - 12, {
          size: clamp(cellW * 0.38, 11, 18),
          weight: 800,
          color: isActive ? '#C85A3A' : '#4A3528',
        });
      }

      // Value label below baseline
      text(ctx, String(v), cx, baseY + 14, {
        size: 11, weight: 700, color: '#9A8B70',
      });
    }
  }
}

// ─── Source Code ─────────────────────────────────────────────────────────────

const source = [
  { text: 'def counting_sort(a):', indent: 0 },
  { text: 'max_val = max(a)', indent: 1 },
  { text: 'count = [0] * (max_val + 1)', indent: 1 },
  { text: 'for x in a:', indent: 1 },
  { text: 'count[x] += 1', indent: 2 },
  { text: 'out = []', indent: 1 },
  { text: 'for v in range(len(count)):', indent: 1 },
  { text: 'out.extend([v] * count[v])', indent: 2 },
  { text: 'return out', indent: 1 },
];

// ─── Algorithm ───────────────────────────────────────────────────────────────

export const countingSort: Algorithm<CountStep> = {
  meta: {
    id: 'counting-sort',
    category: 'sorting',
    name: 'Counting Sort',
    tagline: 'Count occurrences, then reconstruct in order',
    hook: '각 값이 몇 번 등장하는지 세어 순서대로 재구성합니다',
    difficulty: 'Easy',
    time: 'O(n + k)',
    space: 'O(k)',
    accent: 'plum',
    glyph: '🔢',
    summary:
      '값의 범위 k가 작을 때 O(n + k) 시간으로 정렬합니다. 각 값의 등장 횟수를 세는 카운트 배열을 만들고, 그 횟수만큼 값을 출력 배열에 채워 넣습니다. 비교를 전혀 하지 않는 비-비교 정렬의 대표 알고리즘입니다.',
    keyPoints: [
      '비-비교 정렬 — 원소 사이를 비교하지 않음',
      'k = max(a) 일 때 시간·공간 모두 O(n + k)',
      '값 범위가 좁을 때(예: 점수·나이) 매우 빠름',
    ],
    steps: [
      '입력 배열을 순회해 count[x]++ 로 등장 횟수를 셉니다.',
      'count 배열을 0부터 끝까지 훑으며 값을 출력 배열에 채웁니다.',
      'count[v]가 2이면 v를 두 번 출력하는 식으로 재구성합니다.',
      '출력 배열이 곧 정렬된 결과입니다.',
    ],
    defaultInput: '4 2 2 8 3 3 1 4 2',
    inputHint: '공백 또는 쉼표로 구분 (1–9 권장), 최대 16개',
    en: {
      name: 'Counting Sort',
      tagline: 'Count occurrences, reconstruct in order',
      hook: 'Counts values instead of comparing — no swaps at all',
      summary: 'Counts occurrences of each value in a count array, then reconstructs the sorted output by placing each value count[v] times. No comparisons — runs in O(n + k) where k is the value range.',
      keyPoints: [
        'Non-comparison sort — no element comparisons',
        'O(n + k) time and space, where k = max value',
        'Extremely fast when the value range is small (e.g., scores, ages)',
      ],
      steps: [
        'Scan the input and increment count[x] for each element x.',
        'Scan the count array from 0 to max.',
        'Output each value v exactly count[v] times.',
        'The output array is the sorted result.',
      ],
      defaultInput: '4 2 2 8 3 3 1 4 2',
      inputHint: 'Space or comma-separated numbers (1–9 recommended), up to 16',
    },
  },
  sourceCode: source,

  generate(input) {
    const nums = input
      .split(/[\s,]+/)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n) && n >= 0);
    const original = (nums.length ? nums : [4, 2, 2, 8, 3, 3, 1, 4, 2]).slice(0, 16);
    const maxVal = Math.max(...original);
    const count = new Array(maxVal + 1).fill(0);
    const output: (number | null)[] = new Array(original.length).fill(null);

    const out: CountStep[] = [];

    const snap = (extra: Partial<CountStep>): CountStep => ({
      line: 0,
      caption: '',
      captionEn: '',
      original: [...original],
      output: [...output],
      count: [...count],
      maxVal,
      phase: 'count',
      ...extra,
    });

    out.push(snap({
      line: 2,
      caption: `최댓값 ${maxVal} 확인 — count[0..${maxVal}] 배열을 0으로 초기화합니다.`,
      captionEn: `Max value is ${maxVal} — initialize count[0..${maxVal}] with zeros.`,
      action: 'INIT',
      tone: 'neutral',
      phase: 'count',
    }));

    // Phase 1: Count
    for (let i = 0; i < original.length; i++) {
      const x = original[i];
      out.push(snap({
        line: 3,
        caption: `original[${i}] = ${x} 를 읽습니다.`,
        captionEn: `Reading original[${i}] = ${x}.`,
        action: 'READ',
        tone: 'active',
        activeOrig: i,
        activeCount: x,
        phase: 'count',
      }));
      count[x]++;
      out.push(snap({
        line: 4,
        caption: `count[${x}] ++ → ${count[x]}. 값 ${x}가 ${count[x]}번 등장`,
        captionEn: `count[${x}] → ${count[x]}. Value ${x} has appeared ${count[x]} time(s).`,
        action: 'COUNT',
        tone: 'compare',
        activeOrig: i,
        activeCount: x,
        phase: 'count',
      }));
    }

    out.push(snap({
      line: 5,
      caption: '카운트 완료! 이제 count 배열을 순서대로 읽어 출력을 구성합니다.',
      captionEn: 'Counting done! Now read the count array in order to reconstruct the output.',
      action: 'PHASE 2',
      tone: 'neutral',
      phase: 'reconstruct',
    }));

    // Phase 2: Reconstruct
    let outIdx = 0;
    for (let v = 0; v <= maxVal; v++) {
      if (count[v] === 0) continue;
      out.push(snap({
        line: 6,
        caption: `count[${v}] = ${count[v]} — 값 ${v}를 ${count[v]}번 출력합니다.`,
        captionEn: `count[${v}] = ${count[v]} — place value ${v} exactly ${count[v]} time(s).`,
        action: 'EXPAND',
        tone: 'active',
        activeCount: v,
        phase: 'reconstruct',
      }));
      for (let k = 0; k < count[v]; k++) {
        output[outIdx] = v;
        out.push(snap({
          line: 7,
          caption: `output[${outIdx}] = ${v} 기록`,
          captionEn: `Write output[${outIdx}] = ${v}.`,
          action: 'WRITE',
          tone: 'good',
          activeCount: v,
          activeOut: outIdx,
          phase: 'reconstruct',
        }));
        outIdx++;
      }
    }

    out.push(snap({
      line: 8,
      caption: '정렬 완료! 비교 없이 O(n + k) 시간만에 정렬되었습니다.',
      captionEn: 'Sorted! No comparisons were needed — O(n + k) total time.',
      action: 'DONE',
      tone: 'good',
      phase: 'done',
    }));

    return out;
  },

  createRenderer: () => new CountingSortRenderer(),
};
