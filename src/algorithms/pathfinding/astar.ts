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

// ─── Extended step ────────────────────────────────────────────────────────────

interface AStarStep extends GridStep {
  /** h-score (Manhattan heuristic) for each cell — used as overlay label. */
  heuristic: number[];
  /** g-score (cost from start) — same as dist[]. Stored separately for clarity. */
  gScore: number[];
}

// ─── Renderer ────────────────────────────────────────────────────────────────

class AStarRenderer implements Renderer<AStarStep> {
  draw(rc: RenderCtx, prev: AStarStep | null, curr: AStarStep): void {
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
      const g = curr.gScore[i];
      const h = curr.heuristic[i];
      const f = g < 1e8 ? g + h : Infinity;

      let fill = '#F6EEDD';
      let stroke = rgba('#C9A87C', 0.3);
      let glow = '';
      let pop = 0;

      if (curr.walls[i]) {
        fill = '#4A3528';
        stroke = '#3A281D';
      } else if (st === S_VISITED) {
        fill = '#CDEBE4';
        stroke = rgba('#2A9D8F', 0.5);
      } else if (st === S_FRONTIER) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 5 + i);
        // Frontier color tinted by h value (lower h = more towards goal = warmer)
        const hRatio = clamp(h / (rows + cols), 0, 1);
        fill = mixHex('#F6D88E', '#9EDBCF', hRatio);
        stroke = '#C9821C';
        glow = rgba('#E0A33B', 0.4 + 0.15 * pulse);
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
      const grow = justChanged && (st === S_VISITED || st === S_FRONTIER)
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

      // Labels inside cells (only when big enough)
      if (!curr.walls[i] && s > 26) {
        if (st === S_FRONTIER && isFinite(f)) {
          // Show f = g+h on frontier cells, with g and h as tiny subscripts
          text(ctx, String(f), x + s / 2, y + s / 2 - pop - 4, {
            size: clamp(cell * 0.3, 9, 15),
            weight: 800,
            color: '#C9821C',
          });
          // g and h sub-labels only when cell is big enough
          if (s > 38) {
            text(ctx, `g${g}`, x + s * 0.28, y + s * 0.75 - pop, {
              size: clamp(cell * 0.18, 7, 9),
              weight: 700,
              color: rgba('#2A9D8F', 0.85),
            });
            text(ctx, `h${h}`, x + s * 0.72, y + s * 0.75 - pop, {
              size: clamp(cell * 0.18, 7, 9),
              weight: 700,
              color: rgba('#E07856', 0.85),
            });
          }
        } else if ((st === S_VISITED || st === S_CURRENT || st === S_PATH) && g < 1e8) {
          text(ctx, String(g), x + s / 2, y + s / 2 - pop, {
            size: clamp(cell * 0.28, 8, 14),
            weight: 700,
            color: st === S_PATH ? '#4A3528' : st === S_CURRENT ? '#C9821C' : '#1E7A6F',
          });
        }
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

    // Legend
    text(ctx, 'f=g+h  (frontier)  ·  g  (visited)', width / 2, height - 16, {
      size: 10, weight: 600, color: rgba('#9A8B70', 0.85),
    });

    void prev;
  }
}

// ─── Maze ────────────────────────────────────────────────────────────────────

// A maze that showcases A*'s directed exploration toward the goal
const MAZE = [
  'S...#.....',
  '####.####.',
  '....#...#.',
  '.##.#.#.#.',
  '....#.#.#.',
  '.####.#...',
  '.#....###.',
  '.#.##.....',
  '...#.####.',
  '....#....G',
];

// ─── Source Code ─────────────────────────────────────────────────────────────

const source = [
  { text: 'def astar(grid, start, goal):', indent: 0 },
  { text: 'h = lambda n: manhattan(n, goal)', indent: 1 },
  { text: 'g = {start: 0}; prev = {}', indent: 1 },
  { text: 'open = [(h(start), start)]  # (f, node)', indent: 1 },
  { text: 'while open:', indent: 1 },
  { text: 'f, cur = heappop(open)', indent: 2 },
  { text: 'if cur == goal: break', indent: 2 },
  { text: 'for nxt in neighbors(cur):', indent: 2 },
  { text: 'ng = g[cur] + 1', indent: 3 },
  { text: 'if ng < g.get(nxt, inf):', indent: 3 },
  { text: 'g[nxt] = ng; prev[nxt] = cur', indent: 4 },
  { text: 'heappush(open, (ng + h(nxt), nxt))', indent: 4 },
  { text: 'return rebuild(prev, goal)', indent: 1 },
];

// ─── Algorithm ───────────────────────────────────────────────────────────────

export const astar: Algorithm<AStarStep> = {
  meta: {
    id: 'astar',
    category: 'pathfinding',
    name: 'A* Search',
    tagline: 'Heuristic-guided shortest path',
    hook: '목표까지의 예상 거리를 더해 방향을 잡습니다',
    difficulty: 'Hard',
    time: 'O(E log V)',
    space: 'O(V)',
    accent: 'rose',
    glyph: '⭐',
    summary:
      'A* 는 Dijkstra에 휴리스틱(h)을 더해 탐색 방향에 목표 쪽 편향을 줍니다. f = g + h 에서 g는 시작점부터의 실제 비용, h는 목표까지의 추정 비용(맨해튼 거리)입니다. h가 실제값을 절대 과대평가하지 않으면(허용 가능 휴리스틱) 최단 경로를 보장합니다.',
    keyPoints: [
      'f = g + h — g: 실제 비용, h: 맨해튼 거리 추정',
      '허용 가능 휴리스틱 → 최단 경로 보장',
      'BFS보다 훨씬 적은 셀을 탐색해 목표에 도달',
    ],
    steps: [
      '시작 노드를 open set에 추가 (f = 0 + h).',
      'f 최소 노드를 꺼내고 이웃의 g, f를 계산합니다.',
      '더 짧은 경로 발견 시 g, prev 갱신, open에 추가합니다.',
      '목표에 도달하면 prev로 경로를 복원합니다.',
    ],
    defaultInput: '미로 (고정)',
    inputHint: 'A* 미로는 데모용으로 고정되어 있습니다',
    en: {
      name: 'A* Search',
      tagline: 'Add a heuristic to Dijkstra for goal-directed search',
      hook: 'Heuristic guidance leads directly toward the goal',
      summary: 'A* extends Dijkstra with a heuristic h(n) = Manhattan distance to the goal. f = g + h ensures the path with the lowest estimated total cost is explored first. With an admissible heuristic, A* is both complete and optimal.',
      keyPoints: [
        'f = g + h — g: actual cost, h: Manhattan distance estimate',
        'Admissible heuristic → guaranteed shortest path',
        'Explores far fewer cells than BFS by biasing toward the goal',
      ],
      steps: [
        'Add the start node to the open set with f = 0 + h(start).',
        'Extract the node with lowest f; compute g and f for each neighbor.',
        'Update g and prev when a shorter path is found; add to open.',
        'When the goal is reached, trace back via prev pointers.',
      ],
      defaultInput: 'Maze (fixed)',
      inputHint: 'The A* maze is a fixed demo',
    },
  },
  sourceCode: source,

  generate(): AStarStep[] {
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

    const goalR = Math.floor(goal / cols);
    const goalC = goal % cols;
    const manhattan = (i: number) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      return Math.abs(r - goalR) + Math.abs(c - goalC);
    };

    const INF = 1e9;
    const gScore = new Array(rows * cols).fill(INF);
    const heuristic = Array.from({ length: rows * cols }, (_, i) => manhattan(i));
    const status = new Array(rows * cols).fill(S_NONE);
    const prev = new Map<number, number>();
    gScore[start] = 0;
    status[start] = S_FRONTIER;

    const out: AStarStep[] = [];

    const snap = (e: Partial<AStarStep>): AStarStep => ({
      line: 0,
      caption: '',
      captionEn: '',
      rows,
      cols,
      start,
      goal,
      walls,
      status: [...status],
      dist: [...gScore],
      gScore: [...gScore],
      heuristic: [...heuristic],
      ...e,
    });

    out.push(snap({
      line: 3,
      caption: `시작점 f=${manhattan(start)}, g=0, h=${manhattan(start)} — open set 초기화`,
      captionEn: `Start f=${manhattan(start)}, g=0, h=${manhattan(start)} — initialize open set`,
      action: 'INIT',
      tone: 'neutral',
    }));

    const neighbors = (i: number): number[] => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const res: number[] = [];
      if (r > 0) res.push(i - cols);
      if (r < rows - 1) res.push(i + cols);
      if (c > 0) res.push(i - 1);
      if (c < cols - 1) res.push(i + 1);
      return res;
    };

    // Simple priority queue using sorted array (small grid, acceptable)
    const open: number[] = [start];
    const closed = new Set<number>();
    let found = false;

    while (open.length) {
      // Extract min f = g + h
      let bestIdx = 0;
      for (let k = 1; k < open.length; k++) {
        const fk = gScore[open[k]] + heuristic[open[k]];
        const fb = gScore[open[bestIdx]] + heuristic[open[bestIdx]];
        if (fk < fb) bestIdx = k;
      }
      const cur = open.splice(bestIdx, 1)[0];
      if (closed.has(cur)) continue;
      closed.add(cur);

      status[cur] = S_CURRENT;
      const g = gScore[cur];
      const h = heuristic[cur];
      out.push(snap({
        line: 5,
        caption: `확정: (${Math.floor(cur / cols)},${cur % cols})  f=${g + h}  g=${g}  h=${h}`,
        captionEn: `Expand (${Math.floor(cur / cols)},${cur % cols})  f=${g + h}  g=${g}  h=${h}`,
        action: 'EXPAND',
        tone: 'active',
      }));

      if (cur === goal) { found = true; break; }
      status[cur] = S_VISITED;

      let relaxed = false;
      for (const nxt of neighbors(cur)) {
        if (closed.has(nxt) || walls[nxt]) continue;
        const ng = g + 1;
        if (ng < gScore[nxt]) {
          gScore[nxt] = ng;
          prev.set(nxt, cur);
          status[nxt] = S_FRONTIER;
          if (!open.includes(nxt)) open.push(nxt);
          relaxed = true;
        }
      }

      if (relaxed) {
        out.push(snap({
          line: 10,
          caption: '이웃 갱신 — 더 낮은 f=g+h 발견 시 open set 업데이트',
          captionEn: 'Neighbors updated — add to open set with new f=g+h scores',
          action: 'RELAX',
          tone: 'compare',
        }));
      }
    }

    if (found) {
      const path: number[] = [];
      let cur: number | undefined = goal;
      while (cur !== undefined) {
        path.push(cur);
        cur = prev.get(cur);
      }
      for (const i of path) status[i] = S_PATH;
      out.push(snap({
        line: 12,
        caption: `최단 경로 확정! 총 ${path.length - 1} 칸 — BFS보다 훨씬 적은 셀 탐색`,
        captionEn: `Shortest path found! ${path.length - 1} steps — far fewer cells visited than BFS`,
        action: 'PATH ✓',
        tone: 'good',
      }));
    } else {
      out.push(snap({
        line: 12,
        caption: '도달 불가!',
        captionEn: 'Unreachable!',
        action: 'NO PATH',
        tone: 'bad',
      }));
    }

    return out;
  },

  createRenderer: () => new AStarRenderer(),
};
