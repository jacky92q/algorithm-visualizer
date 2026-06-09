import type { Algorithm } from '../../core/types';
import { SortBarsRenderer, parseInts, type SortStep } from './shared';

const source = [
  { text: 'def insertion_sort(a):', indent: 0 },
  { text: 'for i in range(1, len(a)):', indent: 1 },
  { text: 'key = a[i]', indent: 2 },
  { text: 'j = i - 1', indent: 2 },
  { text: 'while j >= 0 and a[j] > key:', indent: 2 },
  { text: 'a[j + 1] = a[j]', indent: 3 },
  { text: 'j -= 1', indent: 3 },
  { text: 'a[j + 1] = key', indent: 2 },
  { text: 'return a', indent: 1 },
];

export const insertionSort: Algorithm<SortStep> = {
  meta: {
    id: 'insertion-sort',
    category: 'sorting',
    name: 'Insertion Sort',
    tagline: 'Build a sorted prefix, one card at a time',
    hook: '카드 정렬하듯 한 장씩 알맞은 자리에 꽂습니다',
    difficulty: 'Easy',
    time: 'O(n²)',
    space: 'O(1)',
    accent: 'amber',
    glyph: '🃏',
    summary:
      '왼쪽 부분배열을 항상 정렬된 상태로 유지하면서, 다음 원소(key)를 뒤에서부터 비교하며 알맞은 위치에 삽입합니다. 거의 정렬된 데이터에서 매우 빠릅니다.',
    keyPoints: [
      '왼쪽은 언제나 정렬된 상태로 유지',
      'key 를 뒤로 밀며 삽입 위치 탐색',
      '거의 정렬된 배열에서 O(n) 에 가까움',
    ],
    steps: [
      '두 번째 원소를 key 로 집습니다.',
      '왼쪽 정렬 구간에서 key 보다 큰 값들을 오른쪽으로 밉니다.',
      '빈 자리에 key 를 꽂습니다.',
      '모든 원소를 처리할 때까지 반복합니다.',
    ],
    defaultInput: '6, 3, 8, 2, 7, 4, 1, 5',
    inputHint: '쉼표로 구분된 숫자 (1–99), 최대 14개',
    en: {
      name: 'Insertion Sort',
      tagline: 'Build a sorted prefix, one card at a time',
      hook: 'Inserts each element into its correct position like sorting cards',
      summary: 'Maintains a sorted left sub-array and inserts each new element (key) by shifting larger elements right. Near-optimal for nearly-sorted data.',
      keyPoints: [
        'Left portion is always sorted',
        'Key shifts elements right to find its insertion spot',
        'Approaches O(n) on nearly-sorted input',
      ],
      steps: [
        'Take the second element as the key.',
        'Shift elements in the sorted section that are greater than key to the right.',
        'Insert key into the gap.',
        'Repeat for every element until the array is sorted.',
      ],
      defaultInput: '6, 3, 8, 2, 7, 4, 1, 5',
      inputHint: 'Comma-separated numbers (1–99), up to 14 values',
    },
  },
  sourceCode: source,
  generate(input) {
    const values = parseInts(input, [6, 3, 8, 2, 7, 4, 1, 5]);
    const n = values.length;
    const slots = values.map((_, i) => i);
    const valOf = (id: number) => values[id];
    const out: SortStep[] = [];

    const snap = (extra: Partial<SortStep>): SortStep => ({
      line: 0,
      caption: '',
      slots: [...slots],
      values,
      ...extra,
    });

    out.push(snap({ line: 0, caption: '첫 원소는 이미 정렬된 것으로 봅니다.', action: 'START', sorted: [slots[0]] }));

    for (let i = 1; i < n; i++) {
      const keyId = slots[i];
      const key = valOf(keyId);
      out.push(
        snap({
          line: 2,
          caption: `key = a[${i}] = ${key}`,
          action: 'PICK',
          tone: 'active',
          pivot: keyId,
          sorted: slots.slice(0, i),
          pointers: { i },
        }),
      );
      let j = i - 1;
      while (j >= 0 && valOf(slots[j]) > key) {
        out.push(
          snap({
            line: 4,
            caption: `a[${j}]=${valOf(slots[j])} > ${key} → 오른쪽으로 민다`,
            action: 'SHIFT',
            tone: 'compare',
            compare: [slots[j]],
            pivot: keyId,
            pointers: { j },
          }),
        );
        slots[j + 1] = slots[j];
        slots[j] = keyId; // key conceptually floats; keep array consistent
        j--;
      }
      out.push(
        snap({
          line: 7,
          caption: `${key} 를 a[${j + 1}] 에 삽입`,
          action: 'INSERT',
          tone: 'good',
          highlight: [keyId],
          sorted: slots.slice(0, i + 1),
          pointers: { 'j+1': j + 1 },
        }),
      );
    }
    out.push(snap({ line: 8, caption: '정렬 완료!', action: 'DONE', tone: 'good', sorted: [...slots] }));
    return out;
  },
  createRenderer: () => new SortBarsRenderer(),
};
