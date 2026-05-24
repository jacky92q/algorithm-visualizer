const ALGO_BINARY_TREE = {
  name: 'Binary Tree',
  desc: 'Inorder Traversal',
  defaultInput: '4,2,6,1,3,5,7',
  inputPlaceholder: 'e.g., 4,2,6,1,3,5,7',
  inputDesc: 'Enter node values in level-order from root',

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

      // Move left
      if (leftIdx < nums.length) {
        stack.push(nums[idx]);
        result.push({
          line: 5, currentChar: `${nums[idx]}`, stack: [...stack],
          visited: [...visited], current: idx, action: 'PUSH',
          description: `Push node ${nums[idx]} to stack, move left`
        });
        inorder(leftIdx);
      }

      // Visit current node
      const stackIdx = stack.lastIndexOf(nums[idx]);
      if (stackIdx !== -1) stack.splice(stackIdx, 1);
      else if (leftIdx >= nums.length) {}

      visited.push(idx);
      result.push({
        line: 8, currentChar: `${nums[idx]}`, stack: [...stack],
        visited: [...visited], current: idx, action: 'VISIT',
        description: `Visit node ${nums[idx]}! Order: [${visited.map(i => nums[i]).join(', ')}]`
      });

      // Move right
      if (rightIdx < nums.length) {
        result.push({
          line: 9, currentChar: `${nums[idx]}`, stack: [...stack],
          visited: [...visited], current: idx, action: 'RIGHT',
          description: `Move to right child ${nums[rightIdx]}`
        });
        inorder(rightIdx);
      }
    }

    result.push({
      line: 2, currentChar: `root: ${nums[0]}`, stack: [],
      visited: [], current: 0, action: 'INIT',
      description: `Root: ${nums[0]}, start inorder traversal`
    });
    inorder(0);
    result.push({
      line: 3, currentChar: '', stack: [],
      visited: visited, current: -1, action: 'DONE ✅',
      description: `Inorder traversal complete: [${visited.map(i => nums[i]).join(', ')}]`
    });
    return result;
  },

  renderInput(s) {
    return `inorder(<span style="color:#ffdd57;">[${s}]</span>)`;
  }
};

ALGO_BINARY_TREE.info = {
  summary: 'Perform inorder traversal of a binary tree using a stack. Visits nodes in order: left → root → right. For a BST, this produces a sorted result.',
  complexity: 'O(n)',
  space: 'O(h)',
  keyPoints: [
    'Inorder: left → root → right',
    'Inorder traversal of BST yields sorted order',
    'Implement without recursion using a stack',
  ],
};

ALGO_BINARY_TREE.renderVisual = function(step) {
  const nums = ALGO_BINARY_TREE._lastNums || [4,2,6,1,3,5,7];
  const visited = step.visited || [];
  const current = step.current;
  const stack = step.stack || [];

  // Tree node positions (max 3 levels)
  const positions = {
    0: { x: 50, y: 10 },
    1: { x: 25, y: 35 },
    2: { x: 75, y: 35 },
    3: { x: 12, y: 65 },
    4: { x: 38, y: 65 },
    5: { x: 62, y: 65 },
    6: { x: 88, y: 65 },
  };

  // Edges
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

// Parse input and store nums
const _origBTGenerate = ALGO_BINARY_TREE.generateTrace;
ALGO_BINARY_TREE.generateTrace = function(s) {
  ALGO_BINARY_TREE._lastNums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
  return _origBTGenerate.call(this, s);
};
