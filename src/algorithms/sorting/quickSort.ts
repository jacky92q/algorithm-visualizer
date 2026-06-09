import type { Algorithm } from '../../core/types';
import { SortBarsRenderer, parseInts, type SortStep } from './shared';

const source = [
  { text: 'def quick_sort(a, lo, hi):', indent: 0 },
  { text: 'if lo >= hi: return', indent: 1 },
  { text: 'pivot = a[hi]', indent: 1 },
  { text: 'i = lo', indent: 1 },
  { text: 'for j in range(lo, hi):', indent: 1 },
  { text: 'if a[j] < pivot:', indent: 2 },
  { text: 'a[i], a[j] = a[j], a[i]', indent: 3 },
  { text: 'i += 1', indent: 3 },
  { text: 'a[i], a[hi] = a[hi], a[i]', indent: 1 },
  { text: 'quick_sort(a, lo, i-1); quick_sort(a, i+1, hi)', indent: 1 },
];

export const quickSort: Algorithm<SortStep> = {
  meta: {
    id: 'quick-sort',
    category: 'sorting',
    name: 'Quick Sort',
    tagline: 'Partition around a pivot, conquer each side',
    hook: '피벗을 기준으로 작고 큰 그룹으로 가릅니다',
    difficulty: 'Medium',
    time: 'O(n log n)',
    space: 'O(log n)',
    accent: 'teal',
    glyph: '⚡',
    summary:
      '피벗을 하나 고른 뒤, 피벗보다 작은 값은 왼쪽·큰 값은 오른쪽으로 분할(partition)합니다. 피벗은 제자리에 확정되고, 양쪽 구간을 재귀적으로 같은 방식으로 정렬합니다.',
    keyPoints: [
      '피벗 기준 분할 후 양쪽을 재귀 정렬',
      '분할이 끝나면 피벗 위치가 영구 확정',
      '평균 O(n log n), 최악 O(n²) (피벗 선택이 관건)',
    ],
    steps: [
      '맨 오른쪽 값을 피벗으로 고릅니다.',
      'j 포인터로 훑으며 피벗보다 작은 값을 왼쪽(i)으로 모읍니다.',
      '피벗을 경계 i 자리로 보내 확정합니다.',
      '피벗 좌·우 구간에 같은 과정을 재귀 적용합니다.',
    ],
    defaultInput: '7, 2, 9, 4, 3, 8, 1, 6',
    inputHint: '쉼표로 구분된 숫자 (1–99), 최대 14개',
  },
  sourceCode: source,
  generate(input) {
    const values = parseInts(input, [7, 2, 9, 4, 3, 8, 1, 6]);
    const n = values.length;
    const slots = values.map((_, i) => i);
    const valOf = (id: number) => values[id];
    const out: SortStep[] = [];
    const sorted: number[] = [];

    const snap = (extra: Partial<SortStep>): SortStep => ({
      line: 0,
      caption: '',
      slots: [...slots],
      values,
      sorted: [...sorted],
      ...extra,
    });

    out.push(snap({ line: 0, caption: '전체 배열에서 시작합니다.', action: 'START' }));

    const swapSlots = (a: number, b: number) => {
      const t = slots[a];
      slots[a] = slots[b];
      slots[b] = t;
    };

    const qs = (lo: number, hi: number) => {
      if (lo >= hi) {
        if (lo === hi) {
          sorted.push(slots[lo]);
          out.push(snap({ line: 1, caption: `단일 구간 [${lo}] 확정`, action: 'LOCKED', tone: 'good' }));
        }
        return;
      }
      const pivotId = slots[hi];
      out.push(
        snap({
          line: 2,
          caption: `피벗 = a[${hi}] = ${valOf(pivotId)} 선택`,
          action: 'PIVOT',
          tone: 'active',
          pivot: pivotId,
          pointers: { lo, hi },
        }),
      );
      let i = lo;
      for (let j = lo; j < hi; j++) {
        out.push(
          snap({
            line: 5,
            caption: `a[${j}]=${valOf(slots[j])} < 피벗 ${valOf(pivotId)} ?`,
            action: 'COMPARE',
            tone: 'compare',
            compare: [slots[j]],
            pivot: pivotId,
            pointers: { i, j },
          }),
        );
        if (valOf(slots[j]) < valOf(pivotId)) {
          if (i !== j) {
            swapSlots(i, j);
            out.push(
              snap({
                line: 6,
                caption: `작은 값 → 왼쪽으로: 자리 ${i} ↔ ${j} 교환`,
                action: 'SWAP',
                tone: 'bad',
                swap: [slots[i], slots[j]],
                pivot: pivotId,
                pointers: { i, j },
              }),
            );
          }
          i++;
        }
      }
      swapSlots(i, hi);
      sorted.push(pivotId);
      out.push(
        snap({
          line: 8,
          caption: `피벗 ${valOf(pivotId)} 를 자리 ${i} 에 확정`,
          action: 'PLACE',
          tone: 'good',
          pivot: pivotId,
          pointers: { pivot: i },
        }),
      );
      qs(lo, i - 1);
      qs(i + 1, hi);
    };

    qs(0, n - 1);
    out.push(snap({ line: 9, caption: '정렬 완료!', action: 'DONE', tone: 'good', sorted: [...slots] }));
    return out;
  },
  createRenderer: () => new SortBarsRenderer(),
};
