const ALGO_DFS = {
  name: 'DFS 탐색',
  desc: 'Depth First Search',
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
    result.push({ line: 2, currentChar: `start: ${start}`, stack: [...stack], visited: [], current: null, action: 'INIT', description: `스택 초기화: [${start}]` });
    while (stack.length > 0) {
      const node = stack.pop();
      result.push({ line: 5, currentChar: `node: ${node}`, stack: [...stack], visited: [...visited], current: node, action: 'POP', description: `노드 ${node} 꺼내기` });
      if (!visited.has(node)) {
        visited.add(node);
        result.push({ line: 7, currentChar: `node: ${node}`, stack: [...stack], visited: [...visited], current: node, action: 'VISIT', description: `노드 ${node} 방문! visited: {${[...visited].join(', ')}}` });
        for (const neighbor of graph[node]) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
            result.push({ line: 9, currentChar: `neighbor: ${neighbor}`, stack: [...stack], visited: [...visited], current: node, action: 'PUSH', description: `이웃 노드 ${neighbor} 스택에 push` });
          }
        }
      }
    }
    result.push({ line: 4, currentChar: '', stack: [], visited: [...visited], current: null, action: 'DONE ✅', description: `탐색 완료! 방문 순서: ${[...visited].join(' → ')}` });
    return result;
  },
  renderInput(s) {
    return `dfs(graph, <span style="color:#ffdd57;">${s}</span>)`;
  }
};
