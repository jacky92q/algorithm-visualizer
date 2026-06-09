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
  { text: 'def bfs(grid, start, goal):', indent: 0 },
  { text: 'q = deque([start]); seen = {start}', indent: 1 },
  { text: 'prev = {}', indent: 1 },
  { text: 'while q:', indent: 1 },
  { text: 'cur = q.popleft()', indent: 2 },
  { text: 'if cur == goal: break', indent: 2 },
  { text: 'for nxt in neighbors(cur):', indent: 2 },
  { text: 'if nxt not in seen and not wall(nxt):', indent: 3 },
  { text: 'seen.add(nxt); prev[nxt] = cur', indent: 4 },
  { text: 'q.append(nxt)', indent: 4 },
  { text: 'return rebuild(prev, goal)', indent: 1 },
];

const MAZE = [
  'S.........',
  '.########.',
  '.#......#.',
  '.#.####.#.',
  '.#.#..#.#.',
  '.#.#.##.#.',
  '.#.#....#.',
  '.#.######.',
  '.#........',
  '.########G',
];

export const bfsMaze: Algorithm<GridStep> = {
  meta: {
    id: 'bfs-maze',
    category: 'pathfinding',
    name: 'BFS Pathfinding',
    tagline: 'Flood the maze level by level',
    hook: '물결처럼 퍼지며 최단 경로를 찾습니다',
    difficulty: 'Medium',
    time: 'O(V + E)',
    space: 'O(V)',
    accent: 'teal',
    glyph: '🌊',
    summary:
      '큐(Queue)를 이용해 시작점에서 같은 거리에 있는 칸들을 한 겹씩 동시에 탐색합니다. 가중치가 없는 격자에서 가장 먼저 도착한 경로가 곧 최단 경로입니다.',
    keyPoints: [
      '큐로 가까운 칸부터 차례대로 방문',
      '한 겹(레벨)씩 물결치듯 확장',
      '무가중치 그래프의 최단 경로 보장',
    ],
    steps: [
      '시작 칸을 큐에 넣고 방문 표시합니다.',
      '큐에서 칸을 꺼내 인접한 벽이 아닌 칸을 큐에 추가합니다.',
      '도착 칸을 꺼내면 탐색을 멈춥니다.',
      'prev 기록을 거꾸로 따라가 경로를 복원합니다.',
    ],
    defaultInput: '미로 (고정)',
    inputHint: 'BFS 미로는 데모용으로 고정되어 있습니다',
    en: {
      name: 'BFS Pathfinding',
      tagline: 'Flood the maze level by level',
      hook: 'Expands like a wave to find the shortest path',
      summary: 'Uses a queue to explore cells at the same distance simultaneously. In an unweighted grid the first time a cell is reached is always via the shortest path.',
      keyPoints: [
        'Queue-based: nearest cells explored first',
        'Expands level-by-level like ripples in water',
        'Guarantees shortest path in unweighted grids',
      ],
      steps: [
        'Add the start cell to the queue and mark it visited.',
        'Dequeue a cell and enqueue its unvisited non-wall neighbors.',
        'Stop when the goal cell is dequeued.',
        'Trace back via the prev map to reconstruct the path.',
      ],
      defaultInput: 'Maze (fixed)',
      inputHint: 'The BFS maze is a fixed demo',
    },
  },
  sourceCode: source,
  generate() {
    const rows = MAZE.length;
    const cols = MAZE[0].length;
    const walls: boolean[] = [];
    let start = 0;
    let goal = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = MAZE[r][c];
        const i = r * cols + c;
        walls[i] = ch === '#';
        if (ch === 'S') start = i;
        if (ch === 'G') goal = i;
      }
    }

    const status = new Array(rows * cols).fill(S_NONE);
    const out: GridStep[] = [];
    const snap = (e: Partial<GridStep>): GridStep => ({
      line: 0,
      caption: '',
      rows,
      cols,
      start,
      goal,
      walls,
      status: [...status],
      ...e,
    });

    out.push(snap({ line: 1, caption: '시작 칸을 큐에 넣습니다.', action: 'INIT', tone: 'neutral' }));

    const queue: number[] = [start];
    const seen = new Set<number>([start]);
    const prev = new Map<number, number>();
    status[start] = S_VISITED;
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

    let found = false;
    while (queue.length) {
      const cur = queue.shift()!;
      if (status[cur] !== S_PATH) status[cur] = S_CURRENT;
      out.push(
        snap({
          line: 4,
          caption: `(${Math.floor(cur / cols)}, ${cur % cols}) 칸을 큐에서 꺼냄`,
          action: 'DEQUEUE',
          tone: 'active',
        }),
      );
      if (cur === goal) {
        found = true;
        break;
      }
      status[cur] = S_VISITED;
      const added: number[] = [];
      for (const nxt of neighbors(cur)) {
        if (!seen.has(nxt) && !walls[nxt]) {
          seen.add(nxt);
          prev.set(nxt, cur);
          status[nxt] = S_FRONTIER;
          added.push(nxt);
        }
      }
      if (added.length) {
        queue.push(...added);
        out.push(
          snap({
            line: 9,
            caption: `이웃 ${added.length}칸을 큐에 추가 (frontier)`,
            action: 'ENQUEUE',
            tone: 'compare',
          }),
        );
      }
    }

    // rebuild path
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
          caption: `최단 경로 복원 — 길이 ${path.length - 1} 칸`,
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
