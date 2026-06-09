import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeOutBack, easeInOutCubic, lerp, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';

interface SearchStep extends BaseStep {
  values: number[];
  lo: number;
  hi: number;
  mid: number;
  target: number;
  found: boolean;
  done: boolean;
}

const source = [
  { text: 'def binary_search(a, target):', indent: 0 },
  { text: 'lo, hi = 0, len(a) - 1', indent: 1 },
  { text: 'while lo <= hi:', indent: 1 },
  { text: 'mid = (lo + hi) // 2', indent: 2 },
  { text: 'if a[mid] == target:', indent: 2 },
  { text: 'return mid', indent: 3 },
  { text: 'elif a[mid] < target:', indent: 2 },
  { text: 'lo = mid + 1', indent: 3 },
  { text: 'else:', indent: 2 },
  { text: 'hi = mid - 1', indent: 3 },
  { text: 'return -1', indent: 1 },
];

class SearchRenderer implements Renderer<SearchStep> {
  draw(rc: RenderCtx, prev: SearchStep | null, curr: SearchStep): void {
    const { ctx, width, height, time } = rc;
    const n = curr.values.length;
    const padX = Math.max(24, width * 0.05);
    const usableW = width - padX * 2;
    const cellW = Math.min(usableW / n - 8, 64);
    const gap = 8;
    const totalW = n * cellW + (n - 1) * gap;
    const startX = (width - totalW) / 2;
    const cy = height / 2 + 6;
    const cellH = Math.min(cellW * 1.15, 84);
    const e = easeInOutCubic(rc.t);

    // target banner
    text(ctx, 'TARGET', width / 2, cy - cellH / 2 - 76, {
      size: 12,
      weight: 700,
      color: '#9A8B70',
      letterSpacing: 2,
    });
    ctx.save();
    const tw = 70;
    roundRect(ctx, width / 2 - tw / 2, cy - cellH / 2 - 64, tw, 40, 12);
    ctx.fillStyle = '#6F4E37';
    ctx.shadowColor = rgba('#6F4E37', 0.4);
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();
    text(ctx, String(curr.target), width / 2, cy - cellH / 2 - 44, {
      size: 22,
      weight: 800,
      color: '#FFF7EA',
    });

    // interpolate lo/hi for a smooth window collapse
    const lo = prev ? lerp(prev.lo, curr.lo, e) : curr.lo;
    const hi = prev ? lerp(prev.hi, curr.hi, e) : curr.hi;

    for (let i = 0; i < n; i++) {
      const x = startX + i * (cellW + gap);
      const inRange = i >= lo - 0.5 && i <= hi + 0.5;
      const isMid = i === curr.mid;
      const isFoundCell = curr.found && i === curr.mid;

      let fill = inRange ? '#F1E4CC' : '#EDE6D8';
      let stroke = inRange ? '#C9A87C' : '#E0D2B8';
      let txt = inRange ? '#4A3528' : '#BBA98A';
      let glow = '';

      if (isMid && !curr.done) {
        fill = '#FBEFCF';
        stroke = '#E0A33B';
        glow = rgba('#E0A33B', 0.55);
      }
      if (isFoundCell) {
        fill = '#D6F0EA';
        stroke = '#2A9D8F';
        glow = rgba('#2A9D8F', 0.7);
      }

      const pop = isMid && !curr.done ? easeOutBack(clamp(rc.t, 0, 1)) * 6 : 0;
      ctx.save();
      if (glow) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 5);
        ctx.shadowColor = glow;
        ctx.shadowBlur = 20 * pulse;
      } else if (inRange) {
        ctx.shadowColor = 'rgba(74,53,40,0.14)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
      }
      roundRect(ctx, x, cy - cellH / 2 - pop, cellW, cellH, 14);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = isMid || isFoundCell ? 3 : 2;
      ctx.strokeStyle = stroke;
      roundRect(ctx, x, cy - cellH / 2 - pop, cellW, cellH, 14);
      ctx.stroke();

      text(ctx, String(curr.values[i]), x + cellW / 2, cy - pop, {
        size: clamp(cellW * 0.42, 16, 26),
        weight: 800,
        color: txt,
      });
      text(ctx, String(i), x + cellW / 2, cy + cellH / 2 + 16, {
        size: 11,
        weight: 600,
        color: '#B0A081',
      });
    }

    // pointers lo / hi / mid
    const cellCenter = (idx: number) => startX + idx * (cellW + gap) + cellW / 2;
    const drawPtr = (idx: number, label: string, color: string, below: boolean) => {
      const x = cellCenter(idx);
      const y = below ? cy + cellH / 2 + 34 : cy - cellH / 2 - 18;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      if (below) {
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x - 6, y + 1);
        ctx.lineTo(x + 6, y + 1);
      } else {
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x - 6, y - 1);
        ctx.lineTo(x + 6, y - 1);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      text(ctx, label, x, below ? y + 12 : y - 12, { size: 12, weight: 800, color });
    };
    if (!curr.done) {
      drawPtr(Math.round(lo), 'lo', '#2A9D8F', true);
      drawPtr(Math.round(hi), 'hi', '#C85A3A', true);
      drawPtr(curr.mid, 'mid', '#C9821C', false);
    }
  }
}

export const binarySearch: Algorithm<SearchStep> = {
  meta: {
    id: 'binary-search',
    category: 'searching',
    name: 'Binary Search',
    tagline: 'Halve the range every single step',
    hook: '매 단계 후보를 절반씩 지워나갑니다',
    difficulty: 'Easy',
    time: 'O(log n)',
    space: 'O(1)',
    accent: 'teal',
    glyph: '🔍',
    summary:
      '정렬된 배열에서 중앙값과 목표를 비교해 한쪽 절반을 통째로 버립니다. 후보 구간이 매번 절반이 되므로 100만 개라도 약 20번이면 끝납니다.',
    keyPoints: [
      '전제 조건: 배열이 정렬되어 있어야 함',
      '중앙값 비교로 탐색 범위를 절반씩 제거',
      '백만 개 데이터도 약 20번 비교면 충분',
    ],
    steps: [
      'lo, hi 로 전체 범위를 잡고 중앙 mid 를 봅니다.',
      'a[mid] 와 target 을 비교합니다.',
      '작으면 왼쪽 절반을, 크면 오른쪽 절반을 버립니다.',
      '값을 찾거나 범위가 사라질 때까지 반복합니다.',
    ],
    defaultInput: '3, 8, 12, 17, 23, 29, 34, 41, 50, 58 ? 34',
    inputHint: '정렬된 숫자들 그리고 " ? target" (예: 1,3,5 ? 5)',
  },
  sourceCode: source,
  generate(input) {
    let target = 0;
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
    if (!values.length) values = [3, 8, 12, 17, 23, 29, 34, 41, 50, 58];
    values = values.sort((a, b) => a - b);
    if (!Number.isFinite(target)) target = values[Math.floor(values.length / 2)];

    const out: SearchStep[] = [];
    let lo = 0;
    let hi = values.length - 1;
    const snap = (e: Partial<SearchStep>): SearchStep => ({
      line: 0,
      caption: '',
      values,
      lo,
      hi,
      mid: (lo + hi) >> 1,
      target,
      found: false,
      done: false,
      ...e,
    });

    out.push(snap({ line: 1, caption: `lo=0, hi=${hi} 로 전체 범위 설정`, action: 'INIT', tone: 'neutral' }));

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      out.push(
        snap({ line: 3, mid, caption: `mid=${mid}, a[${mid}]=${values[mid]}`, action: 'MID', tone: 'active' }),
      );
      if (values[mid] === target) {
        out.push(
          snap({ line: 5, mid, caption: `a[${mid}]=${target} 발견!`, action: 'FOUND ✓', tone: 'good', found: true, done: true }),
        );
        return out;
      } else if (values[mid] < target) {
        out.push(
          snap({ line: 7, mid, caption: `${values[mid]} < ${target} → 왼쪽 절반 버림`, action: 'GO RIGHT', tone: 'compare' }),
        );
        lo = mid + 1;
      } else {
        out.push(
          snap({ line: 9, mid, caption: `${values[mid]} > ${target} → 오른쪽 절반 버림`, action: 'GO LEFT', tone: 'compare' }),
        );
        hi = mid - 1;
      }
    }
    out.push(snap({ line: 10, caption: `${target} 는 배열에 없습니다.`, action: 'NOT FOUND', tone: 'bad', done: true }));
    return out;
  },
  createRenderer: () => new SearchRenderer(),
};
