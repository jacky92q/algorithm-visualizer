import type { Algorithm } from '../../core/types';
import { DPTableRenderer, type DPStep } from './shared';

const source = [
  { text: 'def lcs(a, b):', indent: 0 },
  { text: 'dp = [[0]*(len(b)+1) for _ in range(len(a)+1)]', indent: 1 },
  { text: 'for i in range(1, len(a) + 1):', indent: 1 },
  { text: 'for j in range(1, len(b) + 1):', indent: 2 },
  { text: 'if a[i-1] == b[j-1]:', indent: 3 },
  { text: 'dp[i][j] = dp[i-1][j-1] + 1', indent: 4 },
  { text: 'else:', indent: 3 },
  { text: 'dp[i][j] = max(dp[i-1][j], dp[i][j-1])', indent: 4 },
  { text: 'return dp[len(a)][len(b)]', indent: 1 },
];

function parse(input: string): { a: string; b: string } {
  const toks = input.split(/[|\s,]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
  let a = toks[0] ?? 'AGCAT';
  let b = toks[1] ?? 'GAC';
  a = a.replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'AGCAT';
  b = b.replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'GAC';
  return { a, b };
}

export const lcs: Algorithm<DPStep> = {
  meta: {
    id: 'lcs',
    category: 'dp',
    name: 'Longest Common Subsequence',
    tagline: 'Longest shared subsequence of two strings',
    hook: '두 문자열에 공통으로 숨은 가장 긴 부분 수열',
    difficulty: 'Medium',
    time: 'O(m × n)',
    space: 'O(m × n)',
    accent: 'brown',
    glyph: '🧬',
    summary:
      '두 문자열에서 순서를 유지한 채(연속일 필요는 없음) 공통으로 뽑을 수 있는 가장 긴 수열의 길이를 구합니다. dp[i][j] 는 a 의 앞 i글자와 b 의 앞 j글자의 LCS 길이입니다. 두 글자가 같으면 대각선 +1, 다르면 위/왼쪽 중 큰 값을 가져옵니다.',
    keyPoints: [
      '글자 일치 → dp[i-1][j-1] + 1 (대각선)',
      '불일치 → max(dp[i-1][j], dp[i][j-1])',
      '부분 수열은 연속이 아니어도 됨 (순서만 유지)',
    ],
    steps: [
      '빈 문자열에 해당하는 0번 행·열을 0으로 둡니다.',
      '두 글자가 같으면 왼쪽 위 대각선 값 +1.',
      '다르면 위·왼쪽 중 더 큰 값을 가져옵니다.',
      '오른쪽 아래 끝 칸이 LCS 길이입니다.',
    ],
    defaultInput: 'AGCAT | GAC',
    inputHint: '두 문자열  예: AGCAT | GAC',
    en: {
      name: 'Longest Common Subsequence',
      tagline: 'Longest shared subsequence of two strings',
      hook: 'The longest sequence hidden in common across two strings',
      summary:
        'Finds the longest subsequence (order preserved, not necessarily contiguous) common to two strings. dp[i][j] is the LCS length of the first i characters of a and the first j of b. Equal characters add 1 on the diagonal; otherwise it takes the larger of the cell above or to the left.',
      keyPoints: [
        'Match → dp[i-1][j-1] + 1 (diagonal)',
        'Mismatch → max(dp[i-1][j], dp[i][j-1])',
        'A subsequence need not be contiguous (order only)',
      ],
      steps: [
        'Row/column 0 (empty prefix) is all zeros.',
        'If two characters match, take the diagonal value + 1.',
        'Otherwise take the larger of the cell above or to the left.',
        'The bottom-right cell holds the LCS length.',
      ],
      defaultInput: 'AGCAT | GAC',
      inputHint: 'Two strings  e.g. AGCAT | GAC',
    },
  },
  sourceCode: source,
  generate(input) {
    const { a, b } = parse(input);
    const m = a.length;
    const nn = b.length;
    const rows = m + 1;
    const cols = nn + 1;
    const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const filled: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(false));

    const flat = (): (number | string | null)[] => {
      const arr: (number | string | null)[] = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) arr.push(filled[r][c] ? dp[r][c] : null);
      return arr;
    };
    const idx = (r: number, c: number) => r * cols + c;
    const rowHeader = ['∅', ...a.split('')];
    const colHeader = ['∅', ...b.split('')];

    const out: DPStep[] = [];
    const snap = (e: Partial<DPStep>): DPStep => ({
      line: 0,
      caption: '',
      rows,
      cols,
      rowHeader,
      colHeader,
      cells: flat(),
      corner: '',
      rowAxis: `a = ${a}`,
      colAxis: `b = ${b}`,
      ...e,
    });

    for (let c = 0; c < cols; c++) filled[0][c] = true;
    for (let r = 0; r < rows; r++) filled[r][0] = true;
    out.push(snap({
      line: 1,
      caption: '빈 접두사에 해당하는 0번 행·열을 0으로 초기화합니다.',
      captionEn: 'Initialize row 0 and column 0 (empty prefixes) to zero.',
      action: 'INIT',
      tone: 'neutral',
    }));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= nn; j++) {
        const ca = a[i - 1];
        const cb = b[j - 1];
        filled[i][j] = true;
        if (ca === cb) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          out.push(snap({
            line: 5,
            caption: `'${ca}' = '${cb}' 일치 → 대각선 ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}`,
            captionEn: `'${ca}' = '${cb}' match → diagonal ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}`,
            action: 'MATCH',
            tone: 'good',
            cur: idx(i, j),
            deps: [idx(i - 1, j - 1)],
          }));
        } else {
          const up = dp[i - 1][j];
          const left = dp[i][j - 1];
          dp[i][j] = Math.max(up, left);
          out.push(snap({
            line: 7,
            caption: `'${ca}' ≠ '${cb}' → max(위 ${up}, 왼쪽 ${left}) = ${dp[i][j]}`,
            captionEn: `'${ca}' ≠ '${cb}' → max(up ${up}, left ${left}) = ${dp[i][j]}`,
            action: 'MAX',
            tone: 'compare',
            cur: idx(i, j),
            deps: [idx(i - 1, j), idx(i, j - 1)],
          }));
        }
      }
    }

    // traceback to highlight one LCS path
    const picks: number[] = [];
    let pi = m;
    let pj = nn;
    const seq: string[] = [];
    while (pi > 0 && pj > 0) {
      if (a[pi - 1] === b[pj - 1]) {
        picks.push(idx(pi, pj));
        seq.push(a[pi - 1]);
        pi--; pj--;
      } else if (dp[pi - 1][pj] >= dp[pi][pj - 1]) {
        pi--;
      } else {
        pj--;
      }
    }
    const lcsStr = seq.reverse().join('');

    out.push(snap({
      line: 8,
      caption: `완료! LCS 길이 = ${dp[m][nn]}  (예: "${lcsStr}")`,
      captionEn: `Done! LCS length = ${dp[m][nn]}  (e.g. "${lcsStr}")`,
      action: 'DONE',
      tone: 'good',
      picks,
      result: `LCS = "${lcsStr}"  (len ${dp[m][nn]})`,
    }));

    return out;
  },
  createRenderer: () => new DPTableRenderer(),
};
