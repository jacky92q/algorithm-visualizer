const ALGO_BINARY_TREE = {
  name: 'Binary Tree',
  desc: '중위순회 (Inorder)',
  defaultInput: '4,2,6,1,3,5,7',
  inputPlaceholder: '예: 4,2,6,1,3,5,7',
  inputDesc: '레벨 순서로 노드값 입력 (루트부터)',

  sourceCode: [
    { text: 'def inorder(root, stack=[]):',  indent: 0 },
    { text: 'cur = root',                    indent: 1 },
    { text: 'while cur or stack:',           indent: 1 },
    { text: 'while cur:',                    indent: 2 },
    { text: 'stack.append(cur)',             indent: 3 },
    { text: 'cur = cur.left',               indent: 3 },
    { text: 'cur = stack.pop()',             indent: 2 },
    { text: 'visit(cur.val)',               indent: 2 },
    { text: 'cur = cur.right',              indent: 2 },
  ],

  generateTrace(s) {
    const nums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const result = [];
    const stack = [];
    const visited = [];

    function inorder(idx) {
      if (idx >= nums.length) return;
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;

      // 왼쪽으로 이동
      if (leftIdx < nums.length) {
        stack.push(nums[idx]);
        result.push({
          line: 5, currentChar: `${nums[idx]}`, stack: [...stack],
          visited: [...visited], current: idx, action: 'PUSH',
          description: `노드 ${nums[idx]} 스택에 push, 왼쪽으로 이동`
        });
        inorder(leftIdx);
      }

      // 현재 노드 방문
      const stackIdx = stack.lastIndexOf(nums[idx]);
      if (stackIdx !== -1) stack.splice(stackIdx, 1);
      else if (leftIdx >= nums.length) {}

      visited.push(idx);
      result.push({
        line: 8, currentChar: `${nums[idx]}`, stack: [...stack],
        visited: [...visited], current: idx, action: 'VISIT',
        description: `노드 ${nums[idx]} 방문! 순서: [${visited.map(i => nums[i]).join(', ')}]`
      });

      // 오른쪽으로 이동
      if (rightIdx < nums.length) {
        result.push({
          line: 9, currentChar: `${nums[idx]}`, stack: [...stack],
          visited: [...visited], current: idx, action: 'RIGHT',
          description: `오른쪽 자식 ${nums[rightIdx]}으로 이동`
        });
        inorder(rightIdx);
      }
    }

    result.push({
      line: 2, currentChar: `root: ${nums[0]}`, stack: [],
      visited: [], current: 0, action: 'INIT',
      description: `루트: ${nums[0]}, 중위순회 시작`
    });
    inorder(0);
    result.push({
      line: 3, currentChar: '', stack: [],
      visited: visited, current: -1, action: 'DONE ✅',
      description: `중위순회 완료: [${visited.map(i => nums[i]).join(', ')}]`
    });
    return result;
  },

  renderInput(s) {
    return `inorder(<span style="color:#ffdd57;">[${s}]</span>)`;
  }
};

ALGO_BINARY_TREE.info = {
  summary: '이진 트리를 스택을 이용해 중위순회(inorder)합니다. 왼쪽 → 루트 → 오른쪽 순서로 방문하며, BST에서는 정렬된 결과가 나옵니다.',
  complexity: 'O(n)',
  space: 'O(h)',
  keyPoints: [
    '중위순회: 왼쪽 → 루트 → 오른쪽',
    'BST 중위순회 결과는 항상 오름차순',
    '스택으로 재귀 없이 구현 가능',
  ],
};

ALGO_BINARY_TREE.renderVisual = function(step) {
  const nums = ALGO_BINARY_TREE._lastNums || [4,2,6,1,3,5,7];
  const visited = step.visited || [];
  const current = step.current;
  const stack = step.stack || [];

  // 트리 노드 위치 계산 (최대 3레벨)
  const positions = {
    0: { x: 50, y: 10 },
    1: { x: 25, y: 35 },
    2: { x: 75, y: 35 },
    3: { x: 12, y: 65 },
    4: { x: 38, y: 65 },
    5: { x: 62, y: 65 },
    6: { x: 88, y: 65 },
  };

  // 엣지
  const edges = [];
  for (let i = 0; i < nums.length; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < nums.length && positions[i] && positions[left]) {
      edges.push([i, left]);
    }
    if (right < nums.length && positions[i] && positions[right]) {
      edges.push([i, right]);
    }
  }

  const svgEdges = edges.map(([a, b]) => {
    const pa = positions[a]; const pb = positions[b];
    if (!pa || !pb) return '';
    return `<line x1="${pa.x}%" y1="${pa.y}%" x2="${pb.x}%" y2="${pb.y}%"
      stroke="#1e2330" stroke-width="1.5"/>`;
  }).join('');

  const svgNodes = nums.slice(0, 7).map((val, i) => {
    if (!positions[i]) return '';
    const isCurrent = current === i;
    const isVisited = visited.includes(i);
    const isInStack = stack.includes(val);

    let fill = '#13161e';
    let stroke = '#2a3040';
    let textColor = '#555';

    if (isCurrent) {
      fill = '#422006'; stroke = '#f59e0b'; textColor = '#fbbf24';
    } else if (isVisited) {
      fill = '#052e16'; stroke = '#10b981'; textColor = '#34d399';
    } else if (isInStack) {
      fill = '#1e2d4a'; stroke = '#3b82f6'; textColor = '#93c5fd';
    }

    return `
      <circle cx="${positions[i].x}%" cy="${positions[i].y}%" r="13"
        fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${positions[i].x}%" y="${positions[i].y}%"
        text-anchor="middle" dominant-baseline="middle"
        fill="${textColor}" font-size="12" font-weight="bold">${val}</text>
    `;
  }).join('');

  const visitedStr = visited.map(i => nums[i]).join(' → ') || '-';
  const stackStr = stack.length > 0 ? `[${stack.join(', ')}]` : '[]';

  return `
    <div style="width:100%;display:flex;flex-direction:column;gap:8px;">
      <svg width="100%" height="120px">
        ${svgEdges}
        ${svgNodes}
      </svg>
      <div style="display:flex;gap:8px;font-size:12px;">
        <div style="flex:1;background:#0a0c10;border-radius:10px;padding:8px;border:1px solid #1e2330;">
          <div style="color:#555;margin-bottom:4px;">STACK</div>
          <div style="color:#93c5fd;font-family:monospace;font-size:11px;">${stackStr}</div>
        </div>
        <div style="flex:1;background:#0a0c10;border-radius:10px;padding:8px;border:1px solid #1e2330;">
          <div style="color:#555;margin-bottom:4px;">VISITED</div>
          <div style="color:#34d399;font-family:monospace;font-size:11px;">${visitedStr}</div>
        </div>
      </div>
    </div>
  `;
};

// 입력값 파싱해서 nums 저장
const _origBTGenerate = ALGO_BINARY_TREE.generateTrace;
ALGO_BINARY_TREE.generateTrace = function(s) {
  ALGO_BINARY_TREE._lastNums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
  return _origBTGenerate.call(this, s);
};
