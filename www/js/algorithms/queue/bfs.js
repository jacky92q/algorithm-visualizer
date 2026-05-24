const ALGO_BFS = {
  name: 'BFS 탐색',
  desc: 'Breadth First Search',
  defaultInput: '0',
  inputPlaceholder: '시작 노드 번호 (예: 0)',
  inputDesc: '시작 노드 번호를 입력하세요 (0~4)',
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
    { text: 'def bfs(graph, start):',         indent: 0 },
    { text: 'queue = [start]',                indent: 1 },
    { text: 'visited = set([start])',         indent: 1 },
    { text: 'while queue:',                   indent: 1 },
    { text: 'node = queue.pop(0)',            indent: 2 },
    { text: 'visited.add(node)',              indent: 2 },
    { text: 'for neighbor in graph[node]:',   indent: 2 },
    { text: 'if neighbor not in visited:',    indent: 3 },
    { text: 'queue.append(neighbor)',         indent: 4 },
  ],
  generateTrace(s) {
    const graph = this.graph;
    const start = parseInt(s) || 0;
    const result = [];
    const queue = [start];
    const visited = new Set([start]);
    result.push({ line: 2, currentChar: `start: ${start}`, stack: [...queue], visited: [...visited], current: null, action: 'INIT', description: `큐 초기화: [${start}]` });
    while (queue.length > 0) {
      const node = queue.shift();
      result.push({ line: 5, currentChar: `node: ${node}`, stack: [...queue], visited: [...visited], current: node, action: 'DEQUEUE', description: `노드 ${node} 꺼내기` });
      visited.add(node);
      result.push({ line: 6, currentChar: `node: ${node}`, stack: [...queue], visited: [...visited], current: node, action: 'VISIT', description: `노드 ${node} 방문! visited: {${[...visited].join(', ')}}` });
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          result.push({ line: 9, currentChar: `neighbor: ${neighbor}`, stack: [...queue], visited: [...visited], current: node, action: 'ENQUEUE', description: `이웃 노드 ${neighbor} 큐에 추가` });
        }
      }
    }
    result.push({ line: 4, currentChar: '', stack: [], visited: [...visited], current: null, action: 'DONE ✅', description: `탐색 완료! 방문 순서: ${[...visited].join(' → ')}` });
    return result;
  },
  renderInput(s) {
    return `bfs(graph, <span style="color:#ffdd57;">${s}</span>)`;
  }
};

ALGO_BFS.info = {
  summary: '큐를 이용해 그래프를 너비 우선으로 탐색합니다. 가까운 노드부터 차례로 방문합니다.',
  complexity: 'O(V+E)',
  space: 'O(V)',
  keyPoints: [
    '시작 노드를 큐에 enqueue',
    '큐에서 dequeue한 노드를 방문',
    '방문하지 않은 이웃 노드를 큐에 enqueue',
  ],
};

ALGO_BFS.renderVisual = function(step) {
  const graph = ALGO_BFS.graph;
  const visited = step.visited || [];
  const current = step.current;
  const queue = step.stack || [];

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
      if (parseInt(node) < n) edges.push([parseInt(node), n]);
    }
  }

  const svgEdges = edges.map(([a, b]) => {
    const pa = positions[a]; const pb = positions[b];
    return `<line x1="${pa.x}%" y1="${pa.y}%" x2="${pb.x}%" y2="${pb.y}%" stroke="#1e2330" stroke-width="2"/>`;
  }).join('');

  const svgNodes = positions.map((pos, i) => {
    const isCurrent = current === i;
    const isVisited = visited.includes(i);
    const isInQueue = queue.includes(i);
    let fill = '#13161e'; let stroke = '#2a3040'; let textColor = '#444';
    if (isCurrent) { fill = '#422006'; stroke = '#f59e0b'; textColor = '#fbbf24'; }
    else if (isVisited) { fill = '#052e16'; stroke = '#10b981'; textColor = '#34d399'; }
    else if (isInQueue) { fill = '#1e2d4a'; stroke = '#3b82f6'; textColor = '#93c5fd'; }
    return `
      <circle cx="${pos.x}%" cy="${pos.y}%" r="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${pos.x}%" y="${pos.y}%" text-anchor="middle" dominant-baseline="middle"
        fill="${textColor}" font-size="13" font-weight="bold">${i}</text>
    `;
  }).join('');

  const queueStr = queue.length > 0 ? `[${queue.join(', ')}]` : '[]';
  const visitedStr = visited.length > 0 ? visited.join(' → ') : '-';

  return `
    <div style="width:100%;display:flex;flex-direction:column;gap:8px;">
      <svg width="100%" height="130px" style="overflow:visible;">
        ${svgEdges}${svgNodes}
      </svg>
      <div style="display:flex;gap:8px;font-size:12px;">
        <div style="flex:1;background:#0a0c10;border-radius:10px;padding:8px;border:1px solid #1e2330;">
          <div style="color:#555;margin-bottom:4px;">QUEUE</div>
          <div style="color:#93c5fd;font-family:monospace;">${queueStr}</div>
        </div>
        <div style="flex:1;background:#0a0c10;border-radius:10px;padding:8px;border:1px solid #1e2330;">
          <div style="color:#555;margin-bottom:4px;">VISITED</div>
          <div style="color:#34d399;font-family:monospace;">${visitedStr}</div>
        </div>
      </div>
    </div>
  `;
};
