import type { Algorithm } from '../../core/types';
import { SortBarsRenderer, parseInts, type SortStep } from './shared';

const source = [
  { text: 'def merge_sort(a):', indent: 0 },
  { text: 'if len(a) <= 1: return a', indent: 1 },
  { text: 'mid = len(a) // 2', indent: 1 },
  { text: 'L = merge_sort(a[:mid])', indent: 1 },
  { text: 'R = merge_sort(a[mid:])', indent: 1 },
  { text: 'i = j = 0; out = []', indent: 1 },
  { text: 'while i < len(L) and j < len(R):', indent: 1 },
  { text: 'if L[i] <= R[j]: out.append(L[i]); i+=1', indent: 2 },
  { text: 'else: out.append(R[j]); j+=1', indent: 2 },
  { text: 'return out + L[i:] + R[j:]', indent: 1 },
];

export const mergeSort: Algorithm<SortStep> = {
  meta: {
    id: 'merge-sort',
    category: 'sorting',
    name: 'Merge Sort',
    tagline: 'Divide to single items, merge back in order',
    hook: '반으로 쪼갰다가 정렬하며 합칩니다',
    difficulty: 'Medium',
    time: 'O(n log n)',
    space: 'O(n)',
    accent: 'brown',
    glyph: '🪢',
    summary:
      '배열을 절반씩 재귀적으로 쪼개 길이 1까지 내려간 뒤, 두 정렬된 조각을 비교하며 하나로 병합합니다. 항상 O(n log n)을 보장하는 안정 정렬입니다.',
    keyPoints: [
      '분할 정복 — 항상 O(n log n) 보장',
      '두 정렬된 조각을 앞에서부터 비교·병합',
      '안정 정렬(stable), 추가 메모리 O(n) 필요',
    ],
    steps: [
      '배열을 길이 1이 될 때까지 절반씩 나눕니다.',
      '두 조각의 맨 앞을 비교해 작은 값을 먼저 꺼냅니다.',
      '한쪽이 비면 남은 값을 그대로 이어붙입니다.',
      '상위 구간으로 올라가며 병합을 반복합니다.',
    ],
    defaultInput: '5, 8, 2, 9, 1, 6, 3, 7',
    inputHint: '쉼표로 구분된 숫자 (1–99), 최대 14개',
    en: {
      name: 'Merge Sort',
      tagline: 'Divide to single items, merge back in order',
      hook: 'Splits in half, then merges back sorted',
      summary: 'Recursively splits the array down to single elements, then merges two sorted halves by comparing their fronts. A stable sort that always runs in O(n log n).',
      keyPoints: [
        'Divide-and-conquer — always O(n log n)',
        'Merges two sorted halves by comparing from the front',
        'Stable sort; requires O(n) extra memory',
      ],
      steps: [
        'Recursively split the array until each piece has length 1.',
        'Compare the front of both halves and take the smaller.',
        'When one half is empty, append the remaining elements.',
        'Merge up through all recursion levels.',
      ],
      defaultInput: '5, 8, 2, 9, 1, 6, 3, 7',
      inputHint: 'Comma-separated numbers (1–99), up to 14 values',
    },
  },
  sourceCode: source,
  generate(input) {
    const values = parseInts(input, [5, 8, 2, 9, 1, 6, 3, 7]);
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

    out.push(snap({ line: 0, caption: '전체 배열을 분할하기 시작합니다.', captionEn: 'Start dividing the full array.', action: 'START' }));

    const rangeIds = (lo: number, hi: number) =>
      Array.from({ length: hi - lo + 1 }, (_, k) => slots[lo + k]);

    const ms = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      out.push(
        snap({
          line: 2,
          caption: `[${lo}..${hi}] 를 [${lo}..${mid}] / [${mid + 1}..${hi}] 로 분할`,
          captionEn: `Divide [${lo}..${hi}] into [${lo}..${mid}] / [${mid + 1}..${hi}]`,
          action: 'DIVIDE',
          tone: 'active',
          highlight: rangeIds(lo, hi),
        }),
      );
      ms(lo, mid);
      ms(mid + 1, hi);

      // merge two sorted runs slots[lo..mid] and slots[mid+1..hi]
      const left = rangeIds(lo, mid);
      const right = rangeIds(mid + 1, hi);
      let i = 0;
      let j = 0;
      let k = lo;
      const merged: number[] = [];
      while (i < left.length && j < right.length) {
        out.push(
          snap({
            line: 6,
            caption: `L=${valOf(left[i])} vs R=${valOf(right[j])} 비교`,
            captionEn: `Compare L=${valOf(left[i])} vs R=${valOf(right[j])}`,
            action: 'COMPARE',
            tone: 'compare',
            compare: [left[i], right[j]],
            highlight: rangeIds(lo, hi),
          }),
        );
        if (valOf(left[i]) <= valOf(right[j])) merged.push(left[i++]);
        else merged.push(right[j++]);
        // write merged so far into slots for a sliding animation
        for (let p = 0; p < merged.length; p++) slots[lo + p] = merged[p];
        let q = merged.length;
        for (let p = i; p < left.length; p++) slots[lo + q++] = left[p];
        for (let p = j; p < right.length; p++) slots[lo + q++] = right[p];
        out.push(
          snap({
            line: merged[merged.length - 1] === left[i - 1] ? 7 : 8,
            caption: `${valOf(merged[merged.length - 1])} 를 병합 결과에 추가`,
            captionEn: `Append ${valOf(merged[merged.length - 1])} to merged result`,
            action: 'MERGE',
            tone: 'good',
            highlight: merged.slice(),
            pointers: { write: k },
          }),
        );
        k++;
      }
      while (i < left.length) merged.push(left[i++]);
      while (j < right.length) merged.push(right[j++]);
      for (let p = 0; p < merged.length; p++) slots[lo + p] = merged[p];
      out.push(
        snap({
          line: 9,
          caption: `[${lo}..${hi}] 병합 완료`,
          captionEn: `Merge complete for [${lo}..${hi}]`,
          action: 'MERGED',
          tone: 'good',
          highlight: rangeIds(lo, hi),
        }),
      );
    };

    ms(0, n - 1);
    out.push(snap({ line: 1, caption: '정렬 완료!', captionEn: 'Sorted!', action: 'DONE', tone: 'good', sorted: [...slots] }));
    return out;
  },
  createRenderer: () => new SortBarsRenderer(),
};
