import type { Algorithm } from '../../core/types';
import { SortBarsRenderer, parseInts, type SortStep } from './shared';

const source = [
  { text: 'def bubble_sort(a):', indent: 0 },
  { text: 'n = len(a)', indent: 1 },
  { text: 'for i in range(n - 1):', indent: 1 },
  { text: 'swapped = False', indent: 2 },
  { text: 'for j in range(n - 1 - i):', indent: 2 },
  { text: 'if a[j] > a[j + 1]:', indent: 3 },
  { text: 'a[j], a[j+1] = a[j+1], a[j]', indent: 4 },
  { text: 'swapped = True', indent: 4 },
  { text: 'if not swapped: break', indent: 2 },
  { text: 'return a', indent: 1 },
];

export const bubbleSort: Algorithm<SortStep> = {
  meta: {
    id: 'bubble-sort',
    category: 'sorting',
    name: 'Bubble Sort',
    tagline: 'Adjacent swaps bubble the max to the end',
    hook: '가장 큰 값이 거품처럼 끝으로 떠오릅니다',
    difficulty: 'Easy',
    time: 'O(n²)',
    space: 'O(1)',
    accent: 'coral',
    glyph: '🫧',
    summary:
      '인접한 두 원소를 비교해 잘못된 순서면 교환합니다. 한 바퀴를 돌 때마다 가장 큰 값이 맨 뒤로 확정되고, 교환이 한 번도 없으면 조기 종료합니다.',
    keyPoints: [
      '인접한 쌍만 비교 — 구현이 가장 단순',
      '한 패스마다 최댓값이 뒤쪽에 고정',
      'swapped 플래그로 정렬 완료 시 조기 종료',
    ],
    steps: [
      '왼쪽부터 인접한 두 칸을 비교합니다.',
      '왼쪽이 더 크면 두 값을 교환(swap)합니다.',
      '끝까지 가면 최댓값 하나가 오른쪽에 확정됩니다.',
      '교환이 없을 때까지 패스를 반복합니다.',
    ],
    defaultInput: '5, 2, 9, 1, 7, 3, 8, 4',
    inputHint: '쉼표로 구분된 숫자 (1–99), 최대 14개',
    en: {
      name: 'Bubble Sort',
      tagline: 'Adjacent swaps bubble the max to the end',
      hook: 'The largest value bubbles to the end like a bubble',
      summary: 'Compares adjacent pairs and swaps them if out of order. After each pass, the largest unsorted value is locked at the end. An early-exit flag stops the algorithm as soon as no swaps occur.',
      keyPoints: [
        'Only compares adjacent pairs — simplest implementation',
        'Each pass locks the maximum at the right end',
        'Early exit via swapped flag when already sorted',
      ],
      steps: [
        'Compare two adjacent elements from the left.',
        'If the left is greater, swap them.',
        'After one pass, the largest value is locked at the right.',
        'Repeat until no swaps occur in a pass.',
      ],
      defaultInput: '5, 2, 9, 1, 7, 3, 8, 4',
      inputHint: 'Comma-separated numbers (1–99), up to 14 values',
    },
  },
  sourceCode: source,
  generate(input) {
    const values = parseInts(input, [5, 2, 9, 1, 7, 3, 8, 4]);
    const n = values.length;
    const slots = values.map((_, i) => i); // slot i holds id i initially
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

    out.push(snap({ line: 1, caption: '배열을 준비합니다.', action: 'START', tone: 'neutral' }));

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        const idA = slots[j];
        const idB = slots[j + 1];
        out.push(
          snap({
            line: 5,
            caption: `a[${j}]=${valOf(idA)} 와 a[${j + 1}]=${valOf(idB)} 비교`,
            action: 'COMPARE',
            tone: 'compare',
            compare: [idA, idB],
            pointers: { j, 'j+1': j + 1 },
          }),
        );
        if (valOf(idA) > valOf(idB)) {
          slots[j] = idB;
          slots[j + 1] = idA;
          swapped = true;
          out.push(
            snap({
              line: 6,
              caption: `${valOf(idA)} > ${valOf(idB)} → 교환`,
              action: 'SWAP',
              tone: 'bad',
              swap: [idA, idB],
              pointers: { j, 'j+1': j + 1 },
            }),
          );
        }
      }
      sorted.unshift(slots[n - 1 - i]);
      out.push(
        snap({
          line: 8,
          caption: `${valOf(slots[n - 1 - i])} 가 제자리에 확정`,
          action: 'LOCKED',
          tone: 'good',
        }),
      );
      if (!swapped) break;
    }
    if (sorted.length < n) for (const id of slots) if (!sorted.includes(id)) sorted.push(id);
    out.push(snap({ line: 9, caption: '정렬 완료!', action: 'DONE', tone: 'good', sorted: [...slots] }));
    return out;
  },
  createRenderer: () => new SortBarsRenderer(),
};
