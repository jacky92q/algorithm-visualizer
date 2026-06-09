import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { circle, line, text } from '../../core/draw';
import { easeOutBack, easeInOutCubic, lerp, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';

interface TNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
}
interface TreeStep extends BaseStep {
  nodes: TNode[];
  root: number | null;
  active: number | null;
  compare: number | null;
  inserted: number | null;
  visited: number[];
  phase: 'insert' | 'traverse' | 'done';
}

const source = [
  { text: 'def insert(root, x):', indent: 0 },
  { text: 'if root is None:', indent: 1 },
  { text: 'return Node(x)', indent: 2 },
  { text: 'if x < root.val:', indent: 1 },
  { text: 'root.left = insert(root.left, x)', indent: 2 },
  { text: 'else:', indent: 1 },
  { text: 'root.right = insert(root.right, x)', indent: 2 },
  { text: 'return root', indent: 1 },
  { text: '# in-order: left → node → right', indent: 0 },
];

type Layout = Map<number, { x: number; y: number }>;

function computeLayout(
  nodes: TNode[],
  root: number | null,
  width: number,
  topY: number,
  levelH: number,
): Layout {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const order: number[] = [];
  const depthOf = new Map<number, number>();
  const walk = (id: number | null, depth: number) => {
    if (id === null) return;
    const node = byId.get(id);
    if (!node) return;
    walk(node.left, depth + 1);
    order.push(id);
    depthOf.set(id, depth);
    walk(node.right, depth + 1);
  };
  walk(root, 0);
  const layout: Layout = new Map();
  const n = order.length;
  const padX = Math.max(40, width * 0.08);
  const usableW = width - padX * 2;
  order.forEach((id, i) => {
    const x = n === 1 ? width / 2 : padX + (usableW * i) / (n - 1);
    const y = topY + (depthOf.get(id) ?? 0) * levelH;
    layout.set(id, { x, y });
  });
  return layout;
}

class TreeRenderer implements Renderer<TreeStep> {
  draw(rc: RenderCtx, prev: TreeStep | null, curr: TreeStep): void {
    const { ctx, width, height, time, t } = rc;
    const e = easeInOutCubic(t);
    const topY = 96;
    const levelH = Math.min(86, (height - topY - 70) / 4);
    const R = 26;

    const layoutCurr = computeLayout(curr.nodes, curr.root, width, topY, levelH);
    const layoutPrev = prev ? computeLayout(prev.nodes, prev.root, width, topY, levelH) : layoutCurr;
    const byId = new Map(curr.nodes.map((n) => [n.id, n]));

    const posOf = (id: number) => {
      const c = layoutCurr.get(id)!;
      const p = layoutPrev.get(id) ?? c;
      return { x: lerp(p.x, c.x, e), y: lerp(p.y, c.y, e) };
    };

    // edges
    for (const node of curr.nodes) {
      const a = posOf(node.id);
      for (const childId of [node.left, node.right]) {
        if (childId === null) continue;
        const b = posOf(childId);
        const onPath =
          curr.visited.includes(node.id) && curr.visited.includes(childId) && curr.phase !== 'insert';
        const activeEdge = curr.active === childId || curr.compare === childId;
        line(
          ctx,
          a.x,
          a.y,
          b.x,
          b.y,
          activeEdge ? '#E0A33B' : onPath ? '#2A9D8F' : rgba('#A8835E', 0.55),
          activeEdge ? 4 : onPath ? 3.5 : 2.5,
        );
      }
    }

    // phase label
    text(ctx, curr.phase === 'traverse' ? 'IN-ORDER TRAVERSAL' : curr.phase === 'done' ? 'SORTED OUTPUT' : 'BST INSERT', width / 2, 40, {
      size: 13,
      weight: 800,
      color: '#9A8B70',
      letterSpacing: 3,
    });

    // nodes
    for (const node of curr.nodes) {
      const { x, y } = posOf(node.id);
      const isNew = prev ? !prev.nodes.some((n) => n.id === node.id) : true;
      const isActive = curr.active === node.id;
      const isCompare = curr.compare === node.id;
      const isVisited = curr.visited.includes(node.id);

      let fill = '#F3E6CB';
      let stroke = '#C9A87C';
      let txtColor = '#4A3528';
      let glow = '';
      if (isVisited && curr.phase !== 'insert') {
        fill = '#CDEBE4';
        stroke = '#2A9D8F';
        txtColor = '#1E7A6F';
        glow = rgba('#2A9D8F', 0.45);
      }
      if (isCompare) {
        fill = '#FBE5C2';
        stroke = '#E0A33B';
        txtColor = '#C9821C';
        glow = rgba('#E0A33B', 0.55);
      }
      if (isActive) {
        fill = '#E07856';
        stroke = '#C85A3A';
        txtColor = '#FFF7EA';
        glow = rgba('#E07856', 0.6);
      }

      let scale = 1;
      let yy = y;
      if (isNew) {
        const pe = easeOutBack(clamp(t, 0, 1));
        scale = lerp(0.2, 1, clamp(t * 1.3, 0, 1));
        yy = lerp(y - 36, y, pe);
      }
      const gl = glow ? rgba(glow, 0.6 + 0.4 * Math.sin(time * 4)) : undefined;
      circle(ctx, x, yy, R * scale, fill, stroke, 3, gl);
      text(ctx, String(node.value), x, yy, {
        size: clamp(18 * scale, 11, 19),
        weight: 800,
        color: txtColor,
      });
      void byId;
    }

    // traversal output ribbon
    if (curr.phase !== 'insert' && curr.visited.length) {
      const seq = curr.visited.map((id) => byId.get(id)?.value ?? '').join('  ');
      text(ctx, seq, width / 2, height - 34, {
        size: clamp(width * 0.03, 16, 24),
        weight: 800,
        color: '#1E7A6F',
        font: "'JetBrains Mono', monospace",
      });
    }
  }
}

export const bst: Algorithm<TreeStep> = {
  meta: {
    id: 'binary-search-tree',
    category: 'tree',
    name: 'Binary Search Tree',
    tagline: 'Insert by comparison, read it back sorted',
    hook: '작으면 왼쪽 크면 오른쪽, 규칙 하나로 정렬',
    difficulty: 'Medium',
    time: 'O(log n)',
    space: 'O(n)',
    accent: 'brown',
    glyph: '🌳',
    summary:
      '모든 노드에서 “왼쪽 < 자신 < 오른쪽” 규칙을 지키는 트리입니다. 값을 삽입할 때마다 루트부터 내려가며 자리를 찾고, 중위 순회(in-order)로 읽으면 자동으로 오름차순 정렬이 됩니다.',
    keyPoints: [
      '왼쪽 서브트리 < 노드 < 오른쪽 서브트리',
      '삽입·탐색 모두 평균 O(log n)',
      '중위 순회 결과가 곧 정렬된 수열',
    ],
    steps: [
      '루트에서 시작해 삽입할 값과 비교합니다.',
      '작으면 왼쪽, 크면 오른쪽 자식으로 내려갑니다.',
      '빈 자리를 만나면 새 노드를 매답니다.',
      '모두 삽입한 뒤 중위 순회로 정렬 결과를 읽습니다.',
    ],
    defaultInput: '50, 30, 70, 20, 40, 60, 80, 35, 65',
    inputHint: '삽입할 숫자들 (쉼표 구분), 최대 12개',
    en: {
      name: 'Binary Search Tree',
      tagline: 'Ordered tree insertion and traversal',
      hook: 'Inserts values into a self-ordering binary tree',
      summary: 'Inserts values into a tree so that left children are always smaller and right children are larger. Average O(log n) for search and insert; in-order traversal yields a sorted sequence.',
      keyPoints: [
        'Left subtree < node < right subtree at every node',
        'Average O(log n) search and insert',
        'In-order traversal produces sorted output',
      ],
      steps: [
        'Start at the root and compare with the new value.',
        'Go left if smaller, right if larger.',
        'Insert as a new leaf when an empty slot is reached.',
        'Read values in-order to see a sorted sequence.',
      ],
      defaultInput: '50, 30, 70, 20, 40, 60, 80, 35, 65',
      inputHint: 'Comma-separated numbers, up to 12 values',
    },
  },
  sourceCode: source,
  generate(input) {
    let vals = input
      .split(/[\s,]+/)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n))
      .slice(0, 12);
    if (!vals.length) vals = [50, 30, 70, 20, 40, 60, 80, 35, 65];

    const nodes: TNode[] = [];
    let nid = 0;
    let root: number | null = null;
    const out: TreeStep[] = [];

    const snap = (e: Partial<TreeStep>): TreeStep => ({
      line: 0,
      caption: '',
      nodes: nodes.map((n) => ({ ...n })),
      root,
      active: null,
      compare: null,
      inserted: null,
      visited: [],
      phase: 'insert',
      ...e,
    });

    out.push(snap({ line: 0, caption: '빈 트리에서 시작합니다.', action: 'START', tone: 'neutral' }));

    for (const x of vals) {
      if (root === null) {
        const node = { id: nid++, value: x, left: null, right: null };
        nodes.push(node);
        root = node.id;
        out.push(snap({ line: 2, caption: `${x} → 루트 노드 생성`, action: 'ROOT', tone: 'good', inserted: node.id }));
        continue;
      }
      let curId: number = root;
      const path: number[] = [];
      // descend
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const node = nodes.find((n) => n.id === curId)!;
        path.push(curId);
        out.push(
          snap({
            line: 3,
            caption: `${x} 와 ${node.value} 비교 — ${x < node.value ? '왼쪽으로' : '오른쪽으로'}`,
            action: 'COMPARE',
            tone: 'active',
            compare: curId,
            visited: [...path],
          }),
        );
        if (x < node.value) {
          if (node.left === null) {
            const nn = { id: nid++, value: x, left: null, right: null };
            nodes.push(nn);
            node.left = nn.id;
            out.push(snap({ line: 4, caption: `빈 왼쪽 자리에 ${x} 삽입`, action: 'INSERT', tone: 'good', inserted: nn.id, active: nn.id, visited: [...path, nn.id] }));
            break;
          }
          curId = node.left;
        } else {
          if (node.right === null) {
            const nn = { id: nid++, value: x, left: null, right: null };
            nodes.push(nn);
            node.right = nn.id;
            out.push(snap({ line: 6, caption: `빈 오른쪽 자리에 ${x} 삽입`, action: 'INSERT', tone: 'good', inserted: nn.id, active: nn.id, visited: [...path, nn.id] }));
            break;
          }
          curId = node.right;
        }
      }
    }

    // in-order traversal
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const visited: number[] = [];
    const traverse = (id: number | null) => {
      if (id === null) return;
      const node = byId.get(id)!;
      traverse(node.left);
      visited.push(id);
      out.push(
        snap({
          line: 8,
          caption: `방문: ${node.value}`,
          action: 'VISIT',
          tone: 'good',
          phase: 'traverse',
          active: id,
          visited: [...visited],
        }),
      );
      traverse(node.right);
    };
    out.push(snap({ line: 8, caption: '이제 중위 순회로 읽어봅니다.', action: 'TRAVERSE', tone: 'active', phase: 'traverse' }));
    traverse(root);
    out.push(
      snap({
        line: 8,
        caption: '중위 순회 = 오름차순 정렬 완료!',
        action: 'DONE',
        tone: 'good',
        phase: 'done',
        visited: [...visited],
      }),
    );
    return out;
  },
  createRenderer: () => new TreeRenderer(),
};
