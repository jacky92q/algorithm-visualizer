import type { Algorithm } from '../../core/types';
import { SortBarsRenderer, parseInts, type SortStep } from './shared';

const source = [
  { text: 'def shell_sort(a):', indent: 0 },
  { text: 'n = len(a)', indent: 1 },
  { text: 'gap = n // 2', indent: 1 },
  { text: 'while gap > 0:', indent: 1 },
  { text: 'for i in range(gap, n):', indent: 2 },
  { text: 'key = a[i]; j = i', indent: 3 },
  { text: 'while j >= gap and a[j-gap] > key:', indent: 3 },
  { text: 'a[j] = a[j-gap]; j -= gap', indent: 4 },
  { text: 'a[j] = key', indent: 3 },
  { text: 'gap //= 2', indent: 2 },
  { text: 'return a', indent: 1 },
];

export const shellSort: Algorithm<SortStep> = {
  meta: {
    id: 'shell-sort',
    category: 'sorting',
    name: 'Shell Sort',
    tagline: 'Gapped insertion sort, shrinking the gap',
    hook: '멀리 떨어진 원소부터 정렬해 간격을 좁혀갑니다',
    difficulty: 'Medium',
    time: 'O(n log²n)',
    space: 'O(1)',
    accent: 'plum',
    glyph: '🪜',
    summary:
      '삽입 정렬을 개선한 알고리즘입니다. 처음에는 큰 간격(gap)으로 떨어진 원소끼리 비교·교환해 대략적으로 정렬한 뒤, 간격을 절반씩 줄여가며 점점 촘촘하게 맞춥니다. 마지막 gap=1 단계는 일반 삽입 정렬이지만, 그 전에 거의 정렬돼 있어 매우 빠릅니다.',
    keyPoints: [
      '큰 간격부터 시작해 멀리 있는 원소를 빠르게 제자리로',
      'gap 을 절반씩 줄이며 점진적으로 정밀 정렬',
      '거의 정렬된 상태에서 마지막 삽입 정렬이 매우 빠름',
    ],
    steps: [
      'gap = n/2 로 시작합니다.',
      'gap 만큼 떨어진 원소들에 삽입 정렬을 적용합니다.',
      'gap 을 절반으로 줄여 반복합니다.',
      'gap = 1 의 마지막 패스로 정렬을 마칩니다.',
    ],
    defaultInput: '9, 1, 6, 3, 8, 2, 7, 4, 5',
    inputHint: '쉼표로 구분된 숫자 (1–99), 최대 14개',
    en: {
      name: 'Shell Sort',
      tagline: 'Gapped insertion sort, shrinking the gap',
      hook: 'Sorts far-apart elements first, then narrows the gap',
      summary:
        'An optimization of insertion sort. It first compares and swaps elements far apart (a large gap), roughly ordering the array, then halves the gap repeatedly for finer passes. The final gap=1 pass is plain insertion sort, but the array is nearly sorted by then, making it fast.',
      keyPoints: [
        'Large gaps move distant elements toward place quickly',
        'Gap halves each round for progressively finer sorting',
        'Final insertion pass is fast on the nearly-sorted array',
      ],
      steps: [
        'Start with gap = n/2.',
        'Run insertion sort on elements that are gap apart.',
        'Halve the gap and repeat.',
        'Finish with a final gap=1 pass.',
      ],
      defaultInput: '9, 1, 6, 3, 8, 2, 7, 4, 5',
      inputHint: 'Comma-separated numbers (1–99), up to 14 values',
    },
  },
  sourceCode: source,
  generate(input) {
    const values = parseInts(input, [9, 1, 6, 3, 8, 2, 7, 4, 5]);
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

    out.push(snap({ line: 1, caption: '배열을 준비합니다.', captionEn: 'Initialize the array.', action: 'START', tone: 'neutral' }));

    for (let gap = n >> 1; gap > 0; gap = gap >> 1) {
      out.push(
        snap({
          line: 2,
          caption: `간격 gap = ${gap} 로 부분 정렬을 시작합니다.`,
          captionEn: `Start gapped pass with gap = ${gap}.`,
          action: `GAP ${gap}`,
          tone: 'active',
        }),
      );
      for (let i = gap; i < n; i++) {
        const keyId = slots[i];
        const key = valOf(keyId);
        let j = i;
        while (j >= gap && valOf(slots[j - gap]) > key) {
          out.push(
            snap({
              line: 6,
              caption: `a[${j - gap}]=${valOf(slots[j - gap])} > ${key} → gap=${gap} 만큼 뒤로 민다`,
              captionEn: `a[${j - gap}]=${valOf(slots[j - gap])} > ${key} → shift back by gap=${gap}`,
              action: 'COMPARE',
              tone: 'compare',
              compare: [slots[j - gap], keyId],
              pivot: keyId,
              pointers: { 'j-gap': j - gap, j },
            }),
          );
          slots[j] = slots[j - gap];
          slots[j - gap] = keyId; // key floats to j-gap; keep array consistent
          out.push(
            snap({
              line: 7,
              caption: `${valOf(slots[j])} 를 ${gap}칸 오른쪽으로 이동`,
              captionEn: `Move ${valOf(slots[j])} ${gap} slot(s) to the right`,
              action: 'SHIFT',
              tone: 'bad',
              swap: [slots[j], keyId],
              pivot: keyId,
            }),
          );
          j -= gap;
        }
        out.push(
          snap({
            line: 8,
            caption: `${key} 를 a[${j}] 에 배치`,
            captionEn: `Place ${key} at a[${j}]`,
            action: 'PLACE',
            tone: 'good',
            highlight: [keyId],
            pointers: { j },
          }),
        );
      }
    }
    out.push(snap({ line: 10, caption: '정렬 완료!', captionEn: 'Sorted!', action: 'DONE', tone: 'good', sorted: [...slots] }));
    return out;
  },
  createRenderer: () => new SortBarsRenderer(),
};
