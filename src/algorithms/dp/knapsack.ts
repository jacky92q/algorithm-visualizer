import type { Algorithm } from '../../core/types';
import { DPTableRenderer, type DPStep } from './shared';

const source = [
  { text: 'def knapsack(wt, val, W):', indent: 0 },
  { text: 'n = len(wt)', indent: 1 },
  { text: 'dp = [[0]*(W+1) for _ in range(n+1)]', indent: 1 },
  { text: 'for i in range(1, n + 1):', indent: 1 },
  { text: 'for w in range(W + 1):', indent: 2 },
  { text: 'dp[i][w] = dp[i-1][w]            # skip item', indent: 3 },
  { text: 'if wt[i-1] <= w:', indent: 3 },
  { text: 'take = dp[i-1][w-wt[i-1]] + val[i-1]', indent: 4 },
  { text: 'dp[i][w] = max(dp[i][w], take)', indent: 4 },
  { text: 'return dp[n][W]', indent: 1 },
];

interface Item { w: number; v: number; }

function parse(input: string): { items: Item[]; W: number } {
  let items: Item[] = [
    { w: 1, v: 1 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
    { w: 5, v: 7 },
  ];
  let W = 7;
  const parts = input.split('|');
  if (parts[0]) {
    const pairs = parts[0].trim().split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
    const parsed: Item[] = [];
    for (const p of pairs) {
      const [w, v] = p.split(/[\s/:]+/).map((s) => parseInt(s, 10));
      if (Number.isFinite(w) && Number.isFinite(v) && w > 0) parsed.push({ w, v });
    }
    if (parsed.length) items = parsed.slice(0, 5);
  }
  if (parts[1]) {
    const cap = parseInt(parts[1].trim(), 10);
    if (Number.isFinite(cap) && cap > 0) W = cap;
  }
  W = Math.min(W, 10);
  return { items, W };
}

export const knapsack: Algorithm<DPStep> = {
  meta: {
    id: 'knapsack-01',
    category: 'dp',
    name: '0/1 Knapsack',
    tagline: 'Maximize value within a weight budget',
    hook: '무게 한도 안에서 가치를 최대로 담습니다',
    difficulty: 'Medium',
    time: 'O(n × W)',
    space: 'O(n × W)',
    accent: 'amber',
    glyph: '🎒',
    summary:
      '각 물건을 통째로 담거나(1) 빼는(0) 선택만 가능할 때, 무게 한도 W 를 넘지 않으면서 가치 합을 최대로 만드는 문제입니다. dp[i][w] 는 “앞에서 i개 물건, 한도 w” 일 때 최대 가치이며, 각 칸은 “물건을 건너뛰기” 와 “담기” 중 더 큰 값을 고릅니다.',
    keyPoints: [
      'dp[i][w] = 물건 i개, 용량 w 일 때 최대 가치',
      '건너뛰기: dp[i-1][w]',
      '담기: dp[i-1][w − wᵢ] + vᵢ (단, wᵢ ≤ w)',
    ],
    steps: [
      '0번째 행/열(물건·용량 0)을 0으로 둡니다.',
      '각 칸에서 먼저 “물건 건너뛰기” 값을 가져옵니다.',
      '물건이 들어갈 수 있으면 “담기” 값과 비교해 큰 쪽 선택.',
      'dp[n][W] 가 최대 가치입니다.',
    ],
    defaultInput: '1/1, 3/4, 4/5, 5/7 | 7',
    inputHint: '"무게/가치, … | 용량"  예: 1/1, 3/4, 4/5 | 7',
    en: {
      name: '0/1 Knapsack',
      tagline: 'Maximize value within a weight budget',
      hook: 'Packs maximum value without exceeding the weight limit',
      summary:
        'Each item is either taken whole (1) or left out (0). The goal is to maximize total value without exceeding capacity W. dp[i][w] is the best value using the first i items with capacity w; each cell takes the larger of "skip the item" and "take the item".',
      keyPoints: [
        'dp[i][w] = best value with i items and capacity w',
        'Skip: dp[i-1][w]',
        'Take: dp[i-1][w − wᵢ] + vᵢ (if wᵢ ≤ w)',
      ],
      steps: [
        'Row/column 0 (no items / zero capacity) is all zeros.',
        'Each cell first inherits the "skip item" value.',
        'If the item fits, compare with the "take" value and keep the max.',
        'dp[n][W] is the maximum achievable value.',
      ],
      defaultInput: '1/1, 3/4, 4/5, 5/7 | 7',
      inputHint: '"weight/value, … | capacity"  e.g. 1/1, 3/4, 4/5 | 7',
    },
  },
  sourceCode: source,
  generate(input) {
    const { items, W } = parse(input);
    const n = items.length;
    const rows = n + 1;
    const cols = W + 1;
    const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

    const flat = (): (number | string | null)[] => {
      const arr: (number | string | null)[] = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) arr.push(filled[r][c] ? dp[r][c] : null);
      return arr;
    };
    const filled: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(false));

    const rowHeader = ['∅', ...items.map((it) => `${it.w}/${it.v}`)];
    const colHeader = Array.from({ length: cols }, (_, c) => String(c));
    const idx = (r: number, c: number) => r * cols + c;

    const out: DPStep[] = [];
    const snap = (e: Partial<DPStep>): DPStep => ({
      line: 0,
      caption: '',
      rows,
      cols,
      rowHeader,
      colHeader,
      cells: flat(),
      corner: 'i\\w',
      rowAxis: 'item w/v',
      colAxis: 'capacity w',
      ...e,
    });

    // base row/col
    for (let c = 0; c < cols; c++) filled[0][c] = true;
    for (let r = 0; r < rows; r++) filled[r][0] = true;
    out.push(snap({
      line: 2,
      caption: '0번 행과 열을 0으로 초기화합니다 (물건/용량 없음).',
      captionEn: 'Initialize row 0 and column 0 to zero (no item / no capacity).',
      action: 'INIT',
      tone: 'neutral',
    }));

    for (let i = 1; i <= n; i++) {
      const { w: wi, v: vi } = items[i - 1];
      for (let w = 1; w <= W; w++) {
        // skip
        dp[i][w] = dp[i - 1][w];
        filled[i][w] = true;
        out.push(snap({
          line: 5,
          caption: `dp[${i}][${w}] 건너뛰기 = 위 칸 dp[${i - 1}][${w}] = ${dp[i - 1][w]}`,
          captionEn: `dp[${i}][${w}] skip = cell above dp[${i - 1}][${w}] = ${dp[i - 1][w]}`,
          action: 'SKIP',
          tone: 'active',
          cur: idx(i, w),
          deps: [idx(i - 1, w)],
        }));
        // take
        if (wi <= w) {
          const take = dp[i - 1][w - wi] + vi;
          out.push(snap({
            line: 7,
            caption: `담기 후보 = dp[${i - 1}][${w - wi}](${dp[i - 1][w - wi]}) + ${vi} = ${take} vs ${dp[i][w]}`,
            captionEn: `take candidate = dp[${i - 1}][${w - wi}](${dp[i - 1][w - wi]}) + ${vi} = ${take} vs ${dp[i][w]}`,
            action: 'TAKE?',
            tone: 'compare',
            cur: idx(i, w),
            deps: [idx(i - 1, w - wi)],
          }));
          if (take > dp[i][w]) {
            dp[i][w] = take;
            out.push(snap({
              line: 8,
              caption: `${take} > 건너뛰기 → dp[${i}][${w}] = ${take} (물건 담음)`,
              captionEn: `${take} > skip → dp[${i}][${w}] = ${take} (item taken)`,
              action: 'PUT IN',
              tone: 'good',
              cur: idx(i, w),
            }));
          }
        }
      }
    }

    out.push(snap({
      line: 9,
      caption: `완료! 용량 ${W} 에서 최대 가치 = ${dp[n][W]}`,
      captionEn: `Done! Maximum value at capacity ${W} = ${dp[n][W]}`,
      action: 'DONE',
      tone: 'good',
      picks: [idx(n, W)],
      result: `max value = ${dp[n][W]}`,
    }));

    return out;
  },
  createRenderer: () => new DPTableRenderer(),
};
