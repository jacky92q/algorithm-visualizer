import type { Algorithm } from '../../core/types';
import {
  GridRenderer,
  type GridStep,
  S_NONE,
  S_FRONTIER,
  S_VISITED,
  S_PATH,
  S_CURRENT,
} from './shared';

const source = [
  { text: 'def dijkstra(grid, start, goal):', indent: 0 },
  { text: 'dist = {start: 0}; pq = [(0, start)]', indent: 1 },
  { text: 'while pq:', indent: 1 },
  { text: 'd, cur = heappop(pq)', indent: 2 },
  { text: 'if cur == goal: break', indent: 2 },
  { text: 'for nxt in neighbors(cur):', indent: 2 },
  { text: 'nd = d + weight(nxt)', indent: 3 },
  { text: 'if nd < dist.get(nxt, INF):', indent: 3 },
  { text: 'dist[nxt] = nd; prev[nxt] = cur', indent: 4 },
  { text: 'heappush(pq, (nd, nxt))', indent: 4 },
  { text: 'return rebuild(prev, goal)', indent: 1 },
];

const WEIGHTS = [
  '111119111',
  '199919191',
  '111919191',
  '991911191',
  '111999991',
  '191111111',
  '199999991',
  '111111111',
];

export const dijkstra: Algorithm<GridStep> = {
  meta: {
    id: 'dijkstra',
    category: 'pathfinding',
    name: "Dijkstra's Shortest Path",
    tagline: 'Cheapest-first growth over weighted terrain',
    hook: '비용이 싼 칸부터 욕심내어 뻗어나갑니다',
    difficulty: 'Hard',
    time: 'O(E log V)',
    space: 'O(V)',
    accent: 'amber',
    glyph: '🧭',
    summary:
      '칸마다 이동 비용이 다른 가중 그래프에서 최소 비용 경로를 찾습니다. 우선순위 큐로 “지금까지 누적 비용이 가장 작은” 칸을 먼저 확정(relax)하며, 더 짧은 길을 발견할 때마다 거리를 갱신합니다.',
    keyPoints: [
      '누적 비용이 가장 작은 칸부터 확정',
      '더 짧은 경로 발견 시 dist 갱신(relax)',
      '음수 가중치가 없을 때 최단 경로 보장',
    ],
    steps: [
      '모든 거리를 ∞로, 시작점은 0으로 둡니다.',
      '우선순위 큐에서 최소 비용 칸을 꺼냅니다.',
      '이웃 칸의 거리를 (현재거리 + 이동비용)으로 완화합니다.',
      '도착점을 확정하면 prev 로 경로를 복원합니다.',
    ],
    defaultInput: '가중치 격자 (고정)',
    inputHint: '진한 칸일수록 통과 비용이 큽니다',
  },
  sourceCode: source,
  generate() {
    const rows = WEIGHTS.length;
    const cols = WEIGHTS[0].length;
    const weights: number[] = [];
    const walls: boolean[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        weights[r * cols + c] = parseInt(WEIGHTS[r][c], 10);
        walls[r * cols + c] = false;
      }
    const start = 0;
    const goal = rows * cols - 1;

    const INF = 1e9;
    const dist = new Array(rows * cols).fill(INF);
    const status = new Array(rows * cols).fill(S_NONE);
    const prev = new Map<number, number>();
    dist[start] = 0;

    const out: GridStep[] = [];
    const snap = (e: Partial<GridStep>): GridStep => ({
      line: 0,
      caption: '',
      rows,
      cols,
      start,
      goal,
      walls,
      weights,
      status: [...status],
      dist: [...dist],
      ...e,
    });

    out.push(snap({ line: 1, caption: '시작점 거리=0, 나머지는 ∞', action: 'INIT', tone: 'neutral' }));

    const neighbors = (i: number) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const res: number[] = [];
      if (r > 0) res.push(i - cols);
      if (r < rows - 1) res.push(i + cols);
      if (c > 0) res.push(i - 1);
      if (c < cols - 1) res.push(i + 1);
      return res;
    };

    const visited = new Set<number>();
    const pq: number[] = [start];
    status[start] = S_FRONTIER;
    let found = false;

    while (pq.length) {
      // extract-min
      let best = 0;
      for (let k = 1; k < pq.length; k++) if (dist[pq[k]] < dist[pq[best]]) best = k;
      const cur = pq.splice(best, 1)[0];
      if (visited.has(cur)) continue;
      visited.add(cur);
      status[cur] = S_CURRENT;
      out.push(
        snap({
          line: 3,
          caption: `최소 비용 칸 확정: (${Math.floor(cur / cols)},${cur % cols}) d=${dist[cur]}`,
          action: 'EXTRACT-MIN',
          tone: 'active',
        }),
      );
      if (cur === goal) {
        found = true;
        break;
      }
      status[cur] = S_VISITED;
      let relaxed = false;
      for (const nxt of neighbors(cur)) {
        if (visited.has(nxt)) continue;
        const nd = dist[cur] + weights[nxt];
        if (nd < dist[nxt]) {
          dist[nxt] = nd;
          prev.set(nxt, cur);
          if (status[nxt] !== S_VISITED) status[nxt] = S_FRONTIER;
          if (!pq.includes(nxt)) pq.push(nxt);
          relaxed = true;
        }
      }
      if (relaxed)
        out.push(snap({ line: 8, caption: '이웃들의 거리를 갱신(relax)', action: 'RELAX', tone: 'compare' }));
    }

    if (found) {
      const path: number[] = [];
      let cur: number | undefined = goal;
      while (cur !== undefined) {
        path.push(cur);
        cur = prev.get(cur);
      }
      for (const i of path) status[i] = S_PATH;
      out.push(
        snap({
          line: 10,
          caption: `최소 비용 경로 확정 — 총 비용 ${dist[goal]}`,
          action: 'PATH ✓',
          tone: 'good',
        }),
      );
    } else {
      out.push(snap({ line: 10, caption: '도달 불가!', action: 'NO PATH', tone: 'bad' }));
    }
    return out;
  },
  createRenderer: () => new GridRenderer(),
};
