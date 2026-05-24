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
