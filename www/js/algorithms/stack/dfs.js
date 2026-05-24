const ALGO_DFS = {
  name: 'DFS Search',
  desc: 'Depth First Search',
  defaultInput: '0',
  inputPlaceholder: 'Starting node number (e.g., 0)',
  inputDesc: 'Enter starting node number (0-4)',
  hasGraph: true,
  graph: { 0: [1,2], 1: [0,3], 2: [0,4], 3: [1], 4: [2] },
  nodePositions: [
    { x: 0.5,  y: 0.15 },
    { x: 0.2,  y: 0.5  },
    { x: 0.8,  y: 0.5  },
    { x: 0.2,  y: 0.85 },
    { x: 0.8,  y: 0.85 },
  ],
  sourceCode: [
    { text: 'def dfs(graph, start):',        indent: 0 },
    { text: 'stack = [start]',               indent: 1 },
    { text: 'visited = set()',               indent: 1 },
    { text: 'while stack:',                  indent: 1 },
    { text: 'node = stack.pop()',            indent: 2 },
    { text: 'if node not in visited:',       indent: 2 },
    { text: 'visited.add(node)',             indent: 3 },
    { text: 'for neighbor in graph[node]:', indent: 3 },
    { text: 'stack.append(neighbor)',        indent: 4 },
  ],
  generateTrace(s) {
    const graph = this.graph;
    const start = parseInt(s) || 0;
    const result = [];
    const stack = [start];
    const visited = new Set();
    result.push({ line: 2, currentChar: `start: ${start}`, stack: [...stack], visited: [], current: null, action: 'INIT', description: `Initialize stack: [${start}]` });
    while (stack.length > 0) {
      const node = stack.pop();
      result.push({ line: 5, currentChar: `node: ${node}`, stack: [...stack], visited: [...visited], current: node, action: 'POP', description: `Pop node ${node}` });
      if (!visited.has(node)) {
        visited.add(node);
        result.push({ line: 7, currentChar: `node: ${node}`, stack: [...stack], visited: [...visited], current: node, action: 'VISIT', description: `Visit node ${node}! visited: {${[...visited].join(', ')}}` });
        for (const neighbor of graph[node]) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
            result.push({ line: 9, currentChar: `neighbor: ${neighbor}`, stack: [...stack], visited: [...visited], current: node, action: 'PUSH', description: `Push neighbor node ${neighbor} to stack` });
          }
        }
      }
    }
    result.push({ line: 4, currentChar: '', stack: [], visited: [...visited], current: null, action: 'DONE ✅', description: `Search complete! Visit order: ${[...visited].join(' → ')}` });
    return result;
  },
  renderInput(s) {
    return `dfs(graph, <span style="color:#ffdd57;">${s}</span>)`;
  }
};

ALGO_DFS.info = {
  summary: 'Explore a graph in depth-first order using a stack. Explores one direction to the end, then backtracks.',
  complexity: 'O(V+E)',
  space: 'O(V)',
  keyPoints: [
    'Push starting node to stack',
    'Visit node popped from stack',
    'Push unvisited neighbor nodes to stack',
  ],
};

ALGO_DFS.renderVisual = function(step) {
  const graph = ALGO_DFS.graph;
  const visited = step.visited || [];
  const current = step.current;
  const stack = step.stack || [];

  const positions = [
    { x: 50, y: 12 },
    { x: 20, y: 45 },
    { x: 80, y: 45 },
    { x: 20, y: 80 },
    { x: 80, y: 80 },
  ];

  const edges = [];
  for (const [node, neighbors] of Object.entries(graph)) {
    for (const n of neighbors) {
      if (parseInt(node) < n) {
        edges.push([parseInt(node), n]);
      }
    }
  }

  const svgEdges = edges.map(([a, b]) => {
    const pa = positions[a]; const pb = positions[b];
    return `<line x1="${pa.x}%" y1="${pa.y}%" x2="${pb.x}%" y2="${pb.y}%" stroke="#1e2330" stroke-width="2"/>`;
  }).join('');

  const svgNodes = positions.map((pos, i) => {
    const isCurrent = current === i;
    const isVisited = visited.includes(i);
    const isInStack = stack.includes(i);
    let fill = '#13161e'; let stroke = '#2a3040'; let textColor = '#444';
    if (isCurrent) { fill = '#422006'; stroke = '#f59e0b'; textColor = '#fbbf24'; }
    else if (isVisited) { fill = '#052e16'; stroke = '#10b981'; textColor = '#34d399'; }
    else if (isInStack) { fill = '#1e2d4a'; stroke = '#3b82f6'; textColor = '#93c5fd'; }
    return `
      <circle cx="${pos.x}%" cy="${pos.y}%" r="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${pos.x}%" y="${pos.y}%" text-anchor="middle" dominant-baseline="middle"
        fill="${textColor}" font-size="13" font-weight="bold">${i}</text>
    `;
  }).join('');

  const stackStr = stack.length > 0 ? `[${stack.join(', ')}]` : '[]';
  const visitedStr = visited.length > 0 ? visited.join(' → ') : '-';

  return `
    <div style="width:100%;display:flex;flex-direction:column;gap:8px;">
      <svg width="100%" height="130px" style="overflow:visible;">
        ${svgEdges}${svgNodes}
      </svg>
      <div style="display:flex;gap:8px;font-size:12px;">
        <div style="flex:1;background:#0a0c10;border-radius:10px;padding:8px;border:1px solid #1e2330;">
          <div style="color:#555;margin-bottom:4px;">STACK</div>
          <div style="color:#93c5fd;font-family:monospace;">${stackStr}</div>
        </div>
        <div style="flex:1;background:#0a0c10;border-radius:10px;padding:8px;border:1px solid #1e2330;">
          <div style="color:#555;margin-bottom:4px;">VISITED</div>
          <div style="color:#34d399;font-family:monospace;">${visitedStr}</div>
        </div>
      </div>
    </div>
  `;
};
