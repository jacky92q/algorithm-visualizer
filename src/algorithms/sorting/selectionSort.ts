import type { Algorithm } from '../../core/types';
import { SortBarsRenderer, parseInts, type SortStep } from './shared';

const source = [
  { text: 'def selection_sort(a):', indent: 0 },
  { text: 'n = len(a)', indent: 1 },
  { text: 'for i in range(n):', indent: 1 },
  { text: 'min_idx = i', indent: 2 },
  { text: 'for j in range(i + 1, n):', indent: 2 },
  { text: 'if a[j] < a[min_idx]:', indent: 3 },
  { text: 'min_idx = j', indent: 4 },
  { text: 'a[i], a[min_idx] = a[min_idx], a[i]', indent: 2 },
  { text: 'return a', indent: 1 },
];

export const selectionSort: Algorithm<SortStep> = {
  meta: {
    id: 'selection-sort',
    category: 'sorting',
    name: 'Selection Sort',
    tagline: 'Pick the minimum, place it up front',
    hook: '남은 것 중 최솟값을 골라 앞에 꽂습니다',
    difficulty: 'Easy',
    time: 'O(n²)',
    space: 'O(1)',
    accent: 'plum',
    glyph: '🎯',
    summary:
      '아직 정렬되지 않은 구간에서 최솟값을 찾아 맨 앞 원소와 교환합니다. 교환 횟수가 최대 n-1번으로 적은 것이 특징입니다.',
    keyPoints: [
      '매 라운드마다 최솟값 하나를 선택',
      '선택한 값을 정렬 구간 맨 앞과 교환',
      '교환 횟수가 적어 쓰기 비용이 클 때 유리',
    ],
    steps: [
      '정렬 안 된 구간을 끝까지 훑어 최솟값을 찾습니다.',
      '찾은 최솟값을 구간 맨 앞과 한 번 교환합니다.',
      '정렬 경계를 한 칸 오른쪽으로 옮깁니다.',
      '구간이 비워질 때까지 반복합니다.',
    ],
    defaultInput: '8, 4, 1, 6, 3, 9, 2, 7',
    inputHint: '쉼표로 구분된 숫자 (1–99), 최대 14개',
    en: {
      name: 'Selection Sort',
      tagline: 'Pick the minimum, place it up front',
      hook: 'Selects the minimum from the remaining unsorted portion',
      summary: 'Finds the minimum in the unsorted section and swaps it to the front. At most n-1 swaps total, making it good when write operations are expensive.',
      keyPoints: [
        'Selects one minimum per round',
        'Swaps the minimum to the front of the unsorted section',
        'At most n-1 swaps — good when writes are costly',
      ],
      steps: [
        'Scan the unsorted section to find the minimum value.',
        'Swap the minimum with the first element of the unsorted section.',
        'Advance the sorted boundary by one.',
        'Repeat until the unsorted section is empty.',
      ],
      defaultInput: '8, 4, 1, 6, 3, 9, 2, 7',
      inputHint: 'Comma-separated numbers (1–99), up to 14 values',
    },
  },
  sourceCode: source,
  generate(input) {
    const values = parseInts(input, [8, 4, 1, 6, 3, 9, 2, 7]);
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

    out.push(snap({ line: 1, caption: '배열을 준비합니다.', captionEn: 'Initialize the array.', action: 'START' }));

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      out.push(
        snap({
          line: 3,
          caption: `min_idx = ${i} (${valOf(slots[i])}) 로 가정`,
          captionEn: `Assume min at index ${i} (value ${valOf(slots[i])})`,
          action: 'PICK MIN',
          tone: 'active',
          pivot: slots[minIdx],
          pointers: { i },
        }),
      );
      for (let j = i + 1; j < n; j++) {
        out.push(
          snap({
            line: 5,
            caption: `a[${j}]=${valOf(slots[j])} 와 최솟값 ${valOf(slots[minIdx])} 비교`,
            captionEn: `Compare a[${j}]=${valOf(slots[j])} with current min ${valOf(slots[minIdx])}`,
            action: 'COMPARE',
            tone: 'compare',
            compare: [slots[j]],
            pivot: slots[minIdx],
            pointers: { j, min: minIdx },
          }),
        );
        if (valOf(slots[j]) < valOf(slots[minIdx])) {
          minIdx = j;
          out.push(
            snap({
              line: 6,
              caption: `새 최솟값 발견: ${valOf(slots[minIdx])}`,
              captionEn: `New minimum found: ${valOf(slots[minIdx])}`,
              action: 'NEW MIN',
              tone: 'active',
              pivot: slots[minIdx],
              pointers: { min: minIdx },
            }),
          );
        }
      }
      const a = slots[i];
      const b = slots[minIdx];
      slots[i] = b;
      slots[minIdx] = a;
      sorted.push(b);
      out.push(
        snap({
          line: 7,
          caption: `${valOf(b)} 를 ${i} 번 자리에 확정`,
          captionEn: `Place ${valOf(b)} at index ${i}`,
          action: 'SWAP',
          tone: 'good',
          swap: [a, b],
        }),
      );
    }
    sorted.push(slots[n - 1]);
    out.push(snap({ line: 8, caption: '정렬 완료!', captionEn: 'Sorted!', action: 'DONE', tone: 'good', sorted: [...slots] }));
    return out;
  },
  createRenderer: () => new SortBarsRenderer(),
};
