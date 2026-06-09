import type { Algorithm, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeOutBack, clamp } from '../../core/easing';
import { rgba, mixHex } from '../../core/palette';
import {
  S_NONE,
  S_FRONTIER,
  S_VISITED,
  S_PATH,
  S_CURRENT,
  type GridStep,
} from './shared';

/** DFS-specific status: backtracked cell (explored but led to dead end). */
export const S_BACKTRACK = 5;

// ─── Renderer ────────────────────────────────────────────────────────────────

class DfsGridRenderer implements Renderer<GridStep> {
  draw(rc: RenderCtx, prev: GridStep | null, curr: GridStep): void {
    const { ctx, width, height, time, t } = rc;
    const { rows, cols } = curr;
    const padX = Math.max(16, width * 0.04);
    const padY = 44;
    const cell = Math.min((width - padX * 2) / cols, (height - padY * 2) / rows);
    const gridW = cell * cols;
    const gridH = cell * rows;
    const ox = (width - gridW) / 2;
    const oy = (height - gridH) / 2 + 4;
    const gap = Math.max(2, cell * 0.07);

    const cellRect = (i: number) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      return { x: ox + c * cell + gap / 2, y: oy + r * cell + gap / 2, s: cell - gap };
    };

    // board backing
    ctx.save();
    roundRect(ctx, ox - 8, oy - 8, gridW + 16, gridH + 16, 16);
    ctx.fillStyle = rgba('#6F4E37', 0.07);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < rows * cols; i++) {
      const { x, y, s } = cellRect(i);
      const st = curr.status[i];
      const wasSt = prev ? prev.status[i] : S_NONE;
      const justChanged = st !== wasSt;

      let fill = '#F6EEDD';
      let stroke = rgba('#C9A87C', 0.3);
      let glow = '';
      let pop = 0;

      if (curr.walls[i]) {
        fill = '#4A3528';
        stroke = '#3A281D';
      } else if (st === S_BACKTRACK) {
        // Muted brownish-rose — "explored but backtracked"
        const pulse = 0.4 + 0.2 * Math.sin(time * 2.5 + i * 0.3);
        fill = mixHex('#E8D4C0', '#C9A87C', pulse);
        stroke = rgba('#A8835E', 0.45);
      } else if (st === S_VISITED) {
        fill = '#CDEBE4';
        stroke = rgba('#2A9D8F', 0.5);
      } else if (st === S_FRONTIER) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 5 + i);
        fill = mixHex('#9EDBCF', '#5FC3B6', pulse);
        stroke = '#2A9D8F';
        glow = rgba('#2A9D8F', 0.45);
      } else if (st === S_CURRENT) {
        fill = '#FBE5C2';
        stroke = '#E0A33B';
        glow = rgba('#E0A33B', 0.65);
        pop = justChanged ? easeOutBack(clamp(t, 0, 1)) * 5 : 5;
      } else if (st === S_PATH) {
        fill = '#E7C46A';
        stroke = '#C9821C';
        glow = rgba('#E0A33B', 0.55);
      }

      ctx.save();
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 14;
      }
      const grow = justChanged && (st === S_VISITED || st === S_FRONTIER || st === S_BACKTRACK)
        ? easeOutBack(clamp(t, 0, 1))
        : 1;
      const gs = s * (0.55 + 0.45 * grow);
      const gx = x + (s - gs) / 2;
      const gy = y + (s - gs) / 2 - pop;
      roundRect(ctx, gx, gy, gs, gs, Math.max(3, cell * 0.15));
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();

      ctx.lineWidth = (st === S_CURRENT || st === S_PATH) ? 2.5 : 1.5;
      ctx.strokeStyle = stroke;
      roundRect(ctx, gx, gy, gs, gs, Math.max(3, cell * 0.15));
      ctx.stroke();

      // Depth label on current cell
      if (curr.dist && !curr.walls[i] && curr.dist[i] < 1e8 &&
          (st === S_VISITED || st === S_PATH || st === S_CURRENT || st === S_BACKTRACK) && s > 22) {
        text(ctx, String(curr.dist[i]), x + s / 2, y + s / 2 - pop, {
          size: clamp(cell * 0.28, 8, 14),
          weight: 700,
          color: st === S_PATH ? '#4A3528' : st === S_CURRENT ? '#C9821C' : st === S_BACKTRACK ? '#9A6840' : '#1E7A6F',
        });
      }
    }

    // start & goal markers
    const marker = (i: number, label: string, color: string) => {
      const { x, y, s } = cellRect(i);
      ctx.save();
      ctx.shadowColor = rgba(color, 0.6);
      ctx.shadowBlur = 16;
      roundRect(ctx, x, y, s, s, Math.max(4, cell * 0.18));
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
      text(ctx, label, x + s / 2, y + s / 2, {
        size: clamp(cell * 0.4, 11, 20),
        weight: 800,
        color: '#FFF7EA',
      });
    };
    marker(curr.start, 'S', '#2A9D8F');
    marker(curr.goal, 'G', '#E07856');

    // Legend in corner
    const legendItems: [string, string][] = [
      ['#FBE5C2', 'Current'],
      ['#CDEBE4', 'Visited'],
      ['#E8D4C0', 'Backtrack'],
      ['#E7C46A', 'Path'],
    ];
    legendItems.forEach(([color, label], idx) => {
      const lx = 14;
      const ly = height - 14 - (legendItems.length - 1 - idx) * 22;
      ctx.save();
      roundRect(ctx, lx, ly - 7, 14, 14, 3);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = rgba('#6F4E37', 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      text(ctx, label, lx + 22, ly, {
        size: 10, weight: 600, color: '#9A8B70', align: 'left',
      });
    });
  }
}

// ─── Maze ────────────────────────────────────────────────────────────────────

// Mazes with branches and dead ends so backtracking is clearly visible
const MAZES: Record<string, string[]> = {
  // A — comb: vertical teeth, DFS dives down each one before backtracking
  comb: [
    'S.........',
    '#.#.#.#.#.',
    '#.#.#.#.#.',
    '#.#.#.#.#.',
    '#.#.#.#.#.',
    '#.#.#.#.#.',
    '#.#.#.#.#.',
    '#.#.#.#.#.',
    '..#.#.#.#.',
    '#.......#G',
  ],
  // B — fingers: dead-end fingers off a central spine
  fingers: [
    'S.........',
    '.#.#.#.##.',
    '.#.#.#..#.',
    '.#.#.##.#.',
    '.#.#..#.#.',
    '.#.##.#.#.',
    '.#....#.#.',
    '.####.#.#.',
    '....#.#...',
    '.##.#.###G',
  ],
  // C — forks: repeated branch points, many lead nowhere
  forks: [
    'S........#',
    '######.#.#',
    '.....#.#.#',
    '.###.#.#.#',
    '.#.#.#.#.#',
    '.#.#.#.#.#',
    '.#.#.#.#.#',
    '.#.#.#.#.#',
    '.#...#...#',
    '.#####...G',
  ],
};

// ─── Source Code ─────────────────────────────────────────────────────────────

const source = [
  { text: 'def dfs(grid, start, goal):', indent: 0 },
  { text: 'visited = set()', indent: 1 },
  { text: 'prev = {}', indent: 1 },
  { text: 'found = False', indent: 1 },
  { text: 'def explore(cur, depth):', indent: 1 },
  { text: 'nonlocal found', indent: 2 },
  { text: 'if cur in visited: return', indent: 2 },
  { text: 'visited.add(cur)', indent: 2 },
  { text: 'if cur == goal: found = True; return', indent: 2 },
  { text: 'for nxt in neighbors(cur):', indent: 2 },
  { text: 'if nxt not in visited and not wall(nxt):', indent: 3 },
  { text: 'prev[nxt] = cur', indent: 4 },
  { text: 'explore(nxt, depth + 1)', indent: 4 },
  { text: 'if found: return', indent: 4 },
  { text: '# backtrack — dead end from this cell', indent: 3 },
  { text: 'explore(start, 0)', indent: 1 },
  { text: 'return rebuild(prev, goal)', indent: 1 },
];

// ─── Algorithm ───────────────────────────────────────────────────────────────

export const dfsGrid: Algorithm<GridStep> = {
  meta: {
    id: 'dfs-maze',
    category: 'pathfinding',
    name: 'DFS Pathfinding',
    tagline: 'Dive deep before backtracking',
    hook: '막힐 때까지 파고들다 되돌아옵니다',
    difficulty: 'Medium',
    time: 'O(V + E)',
    space: 'O(V)',
    accent: 'brown',
    glyph: '🕳️',
    summary:
      '깊이 우선 탐색(DFS)은 한 방향으로 막힐 때까지 파고든 뒤 되돌아(backtrack)와 다른 길을 시도합니다. BFS와 달리 최단 경로를 보장하지 않으며, 탐색 순서가 전혀 다릅니다. 갈색 셀이 막다른 길로 밝혀진 후 되돌아온 칸입니다.',
    keyPoints: [
      '스택(재귀)으로 가장 최근 칸을 먼저 탐색',
      '막다른 길 → 백트래킹(backtrack)으로 이전 분기로 복귀',
      '최단 경로 비보장 — BFS와 비교해 탐색 패턴 차이 확인',
    ],
    steps: [
      '시작 칸을 방문, 이웃을 순서대로 깊이 우선 탐색합니다.',
      '막다른 길에 도달하면 백트래킹해 이전 분기점으로 돌아옵니다.',
      '목표 칸을 발견하면 탐색을 종료합니다.',
      'prev 기록으로 경로를 역추적합니다.',
    ],
    defaultInput: 'comb',
    inputHint: '탐색할 미로를 선택하세요',
    presets: [
      { label: '빗살 미로 (깊은 가지)', labelEn: 'Comb (deep teeth)', value: 'comb' },
      { label: '손가락 막다른 길', labelEn: 'Dead-end fingers', value: 'fingers' },
      { label: '갈림길 미로', labelEn: 'Forking paths', value: 'forks' },
    ],
    en: {
      name: 'DFS Pathfinding',
      tagline: 'Dive deep before backtracking',
      hook: 'Dives deep into one path before backtracking',
      summary: 'DFS explores one direction as far as possible before backtracking and trying another branch. Unlike BFS, it does not guarantee the shortest path. Brown cells are dead ends that were abandoned.',
      keyPoints: [
        'Stack/recursion: explores deepest cell first',
        'Dead end → backtrack to the last unvisited branch',
        'Does NOT guarantee shortest path — compare with BFS',
      ],
      steps: [
        'Visit the start cell; recursively explore each neighbor depth-first.',
        'When a dead end is reached, backtrack to the last branch.',
        'Stop when the goal is found.',
        'Trace prev pointers to reconstruct the path.',
      ],
      defaultInput: 'comb',
      inputHint: 'Choose a maze to explore',
    },
  },
  sourceCode: source,

  generate(input) {
    const MAZE = MAZES[input] ?? MAZES.comb;
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
    const dist = new Array(rows * cols).fill(1e9);
    const out: GridStep[] = [];

    const snap = (e: Partial<GridStep>): GridStep => ({
      line: 0,
      caption: '',
      captionEn: '',
      rows,
      cols,
      start,
      goal,
      walls,
      status: [...status],
      dist: [...dist],
      ...e,
    });

    out.push(snap({
      line: 1,
      caption: '빈 visited 집합과 prev 맵으로 시작합니다.',
      captionEn: 'Start with an empty visited set and prev map.',
      action: 'INIT',
      tone: 'neutral',
    }));

    const neighbors = (i: number): number[] => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const res: number[] = [];
      // DFS order: down, right, up, left — gives a distinct path vs BFS
      if (r < rows - 1) res.push(i + cols);
      if (c < cols - 1) res.push(i + 1);
      if (r > 0) res.push(i - cols);
      if (c > 0) res.push(i - 1);
      return res;
    };

    const visited = new Set<number>();
    const prev = new Map<number, number>();
    let found = false;

    const explore = (cur: number, depth: number) => {
      if (found) return;
      if (visited.has(cur)) return;
      visited.add(cur);
      dist[cur] = depth;
      status[cur] = S_CURRENT;

      out.push(snap({
        line: 7,
        caption: `(${Math.floor(cur / cols)}, ${cur % cols}) 방문 — 깊이 ${depth}`,
        captionEn: `Visit (${Math.floor(cur / cols)}, ${cur % cols}) — depth ${depth}`,
        action: 'VISIT',
        tone: 'active',
      }));

      if (cur === goal) {
        found = true;
        out.push(snap({
          line: 8,
          caption: '목표 도달! 백트래킹 없이 경로를 역추적합니다.',
          captionEn: 'Goal reached! Backtrack through prev to reconstruct path.',
          action: 'GOAL ✓',
          tone: 'good',
        }));
        return;
      }

      status[cur] = S_VISITED;
      let hadNeighbor = false;

      for (const nxt of neighbors(cur)) {
        if (found) return;
        if (visited.has(nxt) || walls[nxt]) continue;
        hadNeighbor = true;
        prev.set(nxt, cur);
        status[nxt] = S_FRONTIER;
        out.push(snap({
          line: 11,
          caption: `(${Math.floor(nxt / cols)}, ${nxt % cols}) 를 다음 탐색 대상으로 설정`,
          captionEn: `Marking (${Math.floor(nxt / cols)}, ${nxt % cols}) as next to explore`,
          action: 'STACK',
          tone: 'compare',
        }));
        explore(nxt, depth + 1);
        if (found) return;
      }

      // Dead end — backtrack
      if (!hadNeighbor || (!found && status[cur] !== S_PATH)) {
        status[cur] = S_BACKTRACK;
        out.push(snap({
          line: 14,
          caption: `(${Math.floor(cur / cols)}, ${cur % cols}) 막다른 길 — 백트래킹`,
          captionEn: `Dead end at (${Math.floor(cur / cols)}, ${cur % cols}) — backtracking`,
          action: 'BACK',
          tone: 'bad',
        }));
      }
    };

    explore(start, 0);

    if (found) {
      const path: number[] = [];
      let cur: number | undefined = goal;
      while (cur !== undefined) {
        path.push(cur);
        cur = prev.get(cur);
      }
      for (const i of path) status[i] = S_PATH;
      out.push(snap({
        line: 16,
        caption: `경로 복원 완료 — 길이 ${path.length - 1} 칸 (최단 경로가 아닐 수 있음)`,
        captionEn: `Path rebuilt — ${path.length - 1} steps (may not be shortest)`,
        action: 'PATH ✓',
        tone: 'good',
      }));
    } else {
      out.push(snap({
        line: 16,
        caption: '도달 불가!',
        captionEn: 'Unreachable!',
        action: 'NO PATH',
        tone: 'bad',
      }));
    }

    return out;
  },

  createRenderer: () => new DfsGridRenderer(),
};
