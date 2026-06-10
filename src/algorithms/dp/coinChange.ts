import type { Algorithm } from '../../core/types';
import { DPTableRenderer, type DPStep } from './shared';

const source = [
  { text: 'def coin_change(coins, amount):', indent: 0 },
  { text: 'dp = [INF] * (amount + 1)', indent: 1 },
  { text: 'dp[0] = 0', indent: 1 },
  { text: 'for a in range(1, amount + 1):', indent: 1 },
  { text: 'for c in coins:', indent: 2 },
  { text: 'if c <= a:', indent: 3 },
  { text: 'dp[a] = min(dp[a], dp[a-c] + 1)', indent: 4 },
  { text: 'return dp[amount]', indent: 1 },
];

const INF = Infinity;

function parse(input: string): { coins: number[]; amount: number } {
  let coins: number[] = [1, 3, 4];
  let amount = 11;
  const parts = input.split('|');
  if (parts[0]) {
    const c = parts[0]
      .split(/[\s,]+/)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (c.length) coins = Array.from(new Set(c)).sort((a, b) => a - b).slice(0, 4);
  }
  if (parts[1]) {
    const a = parseInt(parts[1].trim(), 10);
    if (Number.isFinite(a) && a > 0) amount = a;
  }
  amount = Math.min(amount, 14);
  return { coins, amount };
}

export const coinChange: Algorithm<DPStep> = {
  meta: {
    id: 'coin-change',
    category: 'dp',
    name: 'Coin Change (Min Coins)',
    tagline: 'Fewest coins to make an amount',
    hook: '금액을 만드는 최소 동전 개수를 쌓아 올립니다',
    difficulty: 'Medium',
    time: 'O(amount × coins)',
    space: 'O(amount)',
    accent: 'teal',
    glyph: '🪙',
    summary:
      '주어진 동전들로 목표 금액을 만드는 데 필요한 최소 동전 개수를 구합니다. 작은 금액부터 차례로 dp[a] 를 채우는데, 각 동전 c 에 대해 dp[a-c]+1 중 최솟값을 고릅니다. 이미 풀어 둔 더 작은 금액의 답을 재사용하는 전형적인 bottom-up DP 입니다.',
    keyPoints: [
      'dp[a] = 금액 a 를 만드는 최소 동전 수',
      '점화식: dp[a] = min(dp[a − c] + 1) for each coin c',
      '작은 금액의 답을 재사용 (bottom-up)',
    ],
    steps: [
      'dp[0] = 0, 나머지는 ∞(불가능)로 초기화합니다.',
      '금액 a 를 1부터 차례로 올립니다.',
      '각 동전 c 에 대해 dp[a−c] + 1 을 후보로 비교합니다.',
      'dp[amount] 가 최소 동전 개수입니다.',
    ],
    defaultInput: '1 3 4 | 11',
    inputHint: '"동전들 | 금액"  예: 1 3 4 | 11',
    en: {
      name: 'Coin Change (Min Coins)',
      tagline: 'Fewest coins to make an amount',
      hook: 'Builds up the minimum coin count for each amount',
      summary:
        'Finds the fewest coins needed to make a target amount. It fills dp[a] from small amounts upward; for each coin c it takes the minimum of dp[a-c]+1. A classic bottom-up DP that reuses already-solved smaller amounts.',
      keyPoints: [
        'dp[a] = minimum coins to make amount a',
        'Recurrence: dp[a] = min(dp[a − c] + 1) over coins c',
        'Reuses answers for smaller amounts (bottom-up)',
      ],
      steps: [
        'Initialize dp[0] = 0 and the rest to ∞ (impossible).',
        'Increase the amount a from 1 upward.',
        'For each coin c, compare the candidate dp[a−c] + 1.',
        'dp[amount] holds the minimum number of coins.',
      ],
      defaultInput: '1 3 4 | 11',
      inputHint: '"coins | amount"  e.g. 1 3 4 | 11',
    },
  },
  sourceCode: source,
  generate(input) {
    const { coins, amount } = parse(input);
    const rows = amount + 1;
    const cols = 1;
    const dp: number[] = new Array(rows).fill(INF);
    const show = (v: number) => (v === INF ? '∞' : String(v));

    const cellsNow = (): (number | string | null)[] =>
      dp.map((v) => (v === INF ? '∞' : v));

    const out: DPStep[] = [];
    const rowHeader = Array.from({ length: rows }, (_, r) => String(r));
    const snap = (e: Partial<DPStep>): DPStep => ({
      line: 0,
      caption: '',
      rows,
      cols,
      rowHeader,
      colHeader: ['dp'],
      cells: cellsNow(),
      corner: 'a',
      rowAxis: '금액 a',
      colAxis: `coins = {${coins.join(', ')}}`,
      ...e,
    });

    out.push(snap({
      line: 1,
      caption: 'dp 배열을 ∞(불가능)로 초기화합니다.',
      captionEn: 'Initialize dp array to ∞ (impossible).',
      action: 'INIT',
      tone: 'neutral',
    }));

    dp[0] = 0;
    out.push(snap({
      line: 2,
      caption: 'dp[0] = 0 — 금액 0은 동전 0개',
      captionEn: 'dp[0] = 0 — amount 0 needs zero coins',
      action: 'BASE',
      tone: 'good',
      cur: 0,
    }));

    for (let a = 1; a <= amount; a++) {
      let best = INF;
      for (const c of coins) {
        if (c > a) continue;
        const cand = dp[a - c] === INF ? INF : dp[a - c] + 1;
        out.push(snap({
          line: 6,
          caption: `금액 ${a}: 동전 ${c} 사용 → dp[${a - c}](${show(dp[a - c])}) + 1 = ${show(cand)}`,
          captionEn: `Amount ${a}: use coin ${c} → dp[${a - c}](${show(dp[a - c])}) + 1 = ${show(cand)}`,
          action: `COIN ${c}`,
          tone: 'compare',
          cur: a,
          deps: [a - c],
        }));
        if (cand < best) best = cand;
      }
      dp[a] = best;
      out.push(snap({
        line: 6,
        caption: best === INF
          ? `dp[${a}] = ∞ — 이 동전들로는 ${a} 를 만들 수 없음`
          : `dp[${a}] = ${best} — 금액 ${a} 의 최소 동전 수 확정`,
        captionEn: best === INF
          ? `dp[${a}] = ∞ — amount ${a} cannot be formed`
          : `dp[${a}] = ${best} — minimum coins for amount ${a}`,
        action: 'FILL',
        tone: best === INF ? 'bad' : 'good',
        cur: a,
      }));
    }

    const ans = dp[amount];
    out.push(snap({
      line: 7,
      caption: ans === INF
        ? `완료 — ${amount} 는 만들 수 없습니다 (-1)`
        : `완료! ${amount} 를 만드는 최소 동전 = ${ans}개`,
      captionEn: ans === INF
        ? `Done — ${amount} is impossible (-1)`
        : `Done! Minimum coins for ${amount} = ${ans}`,
      action: 'DONE',
      tone: ans === INF ? 'bad' : 'good',
      picks: [amount],
      result: ans === INF ? `dp[${amount}] = −1` : `dp[${amount}] = ${ans} coins`,
    }));

    return out;
  },
  createRenderer: () => new DPTableRenderer(),
};
