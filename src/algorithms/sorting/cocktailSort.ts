import type { Algorithm } from '../../core/types';
import { SortBarsRenderer, parseInts, type SortStep } from './shared';

const source = [
  { text: 'def cocktail_sort(a):', indent: 0 },
  { text: 'lo, hi = 0, len(a) - 1', indent: 1 },
  { text: 'while lo < hi:', indent: 1 },
  { text: 'for j in range(lo, hi):       # → forward', indent: 2 },
  { text: 'if a[j] > a[j+1]: swap(j, j+1)', indent: 3 },
  { text: 'hi -= 1', indent: 2 },
  { text: 'for j in range(hi, lo, -1):   # ← backward', indent: 2 },
  { text: 'if a[j] < a[j-1]: swap(j, j-1)', indent: 3 },
  { text: 'lo += 1', indent: 2 },
  { text: 'return a', indent: 1 },
];

export const cocktailSort: Algorithm<SortStep> = {
  meta: {
    id: 'cocktail-sort',
    category: 'sorting',
    name: 'Cocktail Shaker Sort',
    tagline: 'Bubble sort that sweeps both ways',
    hook: '거품 정렬을 양방향으로 번갈아 훑습니다',
    difficulty: 'Easy',
    time: 'O(n²)',
    space: 'O(1)',
    accent: 'coral',
    glyph: '🍸',
    summary:
      '버블 정렬의 변형입니다. 왼쪽→오른쪽으로 훑어 최댓값을 끝으로 보낸 뒤, 곧바로 오른쪽→왼쪽으로 훑어 최솟값을 앞으로 보냅니다. 한 번 왕복할 때마다 양쪽 경계가 안쪽으로 좁혀져, 한 방향만 도는 버블 정렬보다 보통 빠릅니다.',
    keyPoints: [
      '정방향 패스: 가장 큰 값을 오른쪽 끝으로',
      '역방향 패스: 가장 작은 값을 왼쪽 끝으로',
      '양쪽 경계가 동시에 좁혀져 거북이(turtle) 문제 완화',
    ],
    steps: [
      '왼쪽→오른쪽으로 인접 쌍을 비교·교환합니다.',
      '오른쪽 경계를 한 칸 안으로 당깁니다.',
      '오른쪽→왼쪽으로 다시 비교·교환합니다.',
      '경계가 만날 때까지 왕복을 반복합니다.',
    ],
    defaultInput: '5, 2, 9, 1, 7, 3, 8, 4',
    inputHint: '쉼표로 구분된 숫자 (1–99), 최대 14개',
    en: {
      name: 'Cocktail Shaker Sort',
      tagline: 'Bubble sort that sweeps both ways',
      hook: 'A bubble sort that alternates forward and backward sweeps',
      summary:
        'A variation of bubble sort. It sweeps left→right pushing the maximum to the end, then immediately sweeps right→left pushing the minimum to the front. Each round narrows both boundaries inward, usually beating one-directional bubble sort.',
      keyPoints: [
        'Forward pass moves the largest value to the right end',
        'Backward pass moves the smallest value to the left end',
        'Both boundaries shrink, easing the "turtle" problem',
      ],
      steps: [
        'Sweep left→right comparing and swapping adjacent pairs.',
        'Pull the right boundary in by one.',
        'Sweep right→left comparing and swapping.',
        'Repeat the round trip until the boundaries meet.',
      ],
      defaultInput: '5, 2, 9, 1, 7, 3, 8, 4',
      inputHint: 'Comma-separated numbers (1–99), up to 14 values',
    },
  },
  sourceCode: source,
  generate(input) {
    const values = parseInts(input, [5, 2, 9, 1, 7, 3, 8, 4]);
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

    out.push(snap({ line: 1, caption: '배열을 준비합니다.', captionEn: 'Initialize the array.', action: 'START', tone: 'neutral' }));

    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      // forward sweep →
      for (let j = lo; j < hi; j++) {
        const idA = slots[j];
        const idB = slots[j + 1];
        out.push(
          snap({
            line: 4,
            caption: `→ a[${j}]=${valOf(idA)} 와 a[${j + 1}]=${valOf(idB)} 비교`,
            captionEn: `→ Compare a[${j}]=${valOf(idA)} and a[${j + 1}]=${valOf(idB)}`,
            action: 'COMPARE →',
            tone: 'compare',
            compare: [idA, idB],
            pointers: { j, 'j+1': j + 1 },
          }),
        );
        if (valOf(idA) > valOf(idB)) {
          slots[j] = idB;
          slots[j + 1] = idA;
          out.push(
            snap({
              line: 4,
              caption: `${valOf(idA)} > ${valOf(idB)} → 교환`,
              captionEn: `${valOf(idA)} > ${valOf(idB)} → swap`,
              action: 'SWAP',
              tone: 'bad',
              swap: [idA, idB],
              pointers: { j, 'j+1': j + 1 },
            }),
          );
        }
      }
      sorted.push(slots[hi]);
      out.push(
        snap({
          line: 5,
          caption: `${valOf(slots[hi])} 가 오른쪽 끝에 확정`,
          captionEn: `${valOf(slots[hi])} locked at the right end`,
          action: 'LOCKED',
          tone: 'good',
        }),
      );
      hi--;
      if (lo >= hi) break;

      // backward sweep ←
      for (let j = hi; j > lo; j--) {
        const idA = slots[j];
        const idB = slots[j - 1];
        out.push(
          snap({
            line: 7,
            caption: `← a[${j}]=${valOf(idA)} 와 a[${j - 1}]=${valOf(idB)} 비교`,
            captionEn: `← Compare a[${j}]=${valOf(idA)} and a[${j - 1}]=${valOf(idB)}`,
            action: 'COMPARE ←',
            tone: 'compare',
            compare: [idA, idB],
            pointers: { 'j-1': j - 1, j },
          }),
        );
        if (valOf(idA) < valOf(idB)) {
          slots[j] = idB;
          slots[j - 1] = idA;
          out.push(
            snap({
              line: 7,
              caption: `${valOf(idA)} < ${valOf(idB)} → 교환`,
              captionEn: `${valOf(idA)} < ${valOf(idB)} → swap`,
              action: 'SWAP',
              tone: 'bad',
              swap: [idA, idB],
              pointers: { 'j-1': j - 1, j },
            }),
          );
        }
      }
      sorted.push(slots[lo]);
      out.push(
        snap({
          line: 8,
          caption: `${valOf(slots[lo])} 가 왼쪽 끝에 확정`,
          captionEn: `${valOf(slots[lo])} locked at the left end`,
          action: 'LOCKED',
          tone: 'good',
        }),
      );
      lo++;
    }
    out.push(snap({ line: 9, caption: '정렬 완료!', captionEn: 'Sorted!', action: 'DONE', tone: 'good', sorted: [...slots] }));
    return out;
  },
  createRenderer: () => new SortBarsRenderer(),
};
