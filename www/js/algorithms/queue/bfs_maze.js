const ALGO_BFS_MAZE = {
  name: 'BFS Maze Solving',
  desc: 'BFS Maze Solving',
  defaultInput: '0',
  inputPlaceholder: 'Not used',
  inputDesc: 'Solve fixed maze using BFS',
  sourceCode: [
    { text: 'def bfs_maze(maze, start, end):', indent: 0 },
    { text: 'queue = [start]',                 indent: 1 },
    { text: 'visited = set([start])',          indent: 1 },
    { text: 'while queue:',                    indent: 1 },
    { text: 'pos = queue.pop(0)',              indent: 2 },
    { text: 'if pos == end:',                  indent: 2 },
    { text: 'return True',                     indent: 3 },
    { text: 'for next in neighbors(pos):',     indent: 2 },
    { text: 'if next not in visited:',         indent: 3 },
    { text: 'queue.append(next)',              indent: 4 },
    { text: 'return False',                    indent: 1 },
  ],
  generateTrace(s) {
    // 5x5 maze (0=path, 1=wall)
    const maze = [
      [0,0,1,0,0],
      [1,0,1,0,1],
      [1,0,0,0,1],
      [1,1,1,0,1],
      [0,0,0,0,0],
    ];
    const rows = maze.length;
    const cols = maze[0].length;
    const start = '0,0';
    const end = '4,4';
    const result = [];
    const queue = [start];
    const visited = new Set([start]);
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

    result.push({ line: 2, currentChar: start, stack: [...queue], visited: [...visited], maze, action: 'INIT', description: `Start: (0,0) → Goal: (4,4)` });

    while (queue.length > 0) {
      const pos = queue.shift();
      const [r, c] = pos.split(',').map(Number);
      result.push({ line: 5, currentChar: pos, stack: [...queue], visited: [...visited], maze, action: 'DEQUEUE', description: `Dequeue position (${r},${c})` });

      if (pos === end) {
        result.push({ line: 7, currentChar: pos, stack: [...queue], visited: [...visited], maze, action: 'DONE ✅', description: `Reached goal (4,4)!` });
        return result;
      }

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        const npos = `${nr},${nc}`;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0 && !visited.has(npos)) {
          visited.add(npos);
          queue.push(npos);
          result.push({ line: 10, currentChar: npos, stack: [...queue], visited: [...visited], maze, action: 'ENQUEUE', description: `Enqueue (${nr},${nc})` });
        }
      }
    }
    result.push({ line: 11, currentChar: '', stack: [], visited: [...visited], maze, action: 'FAIL ❌', description: 'No path found!' });
    return result;
  },
  renderInput() {
    return `bfs_maze(<span style="color:#ffdd57;">5x5 maze</span>)`;
  }
};

ALGO_BFS_MAZE.info = {
  summary: 'Find the shortest path in a maze using BFS. Breadth-first search explores the closest paths first.',
  complexity: 'O(V+E)',
  space: 'O(V)',
  keyPoints: [
    'Start BFS from starting point',
    'Use queue for breadth-first traversal',
    'Stop when goal is reached',
  ],
};

ALGO_BFS_MAZE.renderVisual = function(step) {
  const maze = [
    [0,0,1,0,0],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,1,1,0,1],
    [0,0,0,0,0],
  ];
  const visited = step.visited || [];
  const currentPos = step.currentChar && step.currentChar.includes(',') ? step.currentChar.replace('node: ','') : null;

  const cellSize = 40;
  const cells = maze.map((row, r) =>
    row.map((cell, c) => {
      const posKey = `${r},${c}`;
      const isWall = cell === 1;
      const isCurrent = posKey === currentPos;
      const isVisited = visited.includes(posKey);
      const isStart = r === 0 && c === 0;
      const isEnd = r === 4 && c === 4;

      let bg = '#0a0c10';
      let text = '';
      if (isWall) bg = '#1e2330';
      else if (isCurrent) bg = '#422006';
      else if (isEnd) bg = '#052e16';
      else if (isStart) bg = '#1e2d4a';
      else if (isVisited) bg = '#0f2d1f';

      if (isStart) text = 'S';
      if (isEnd) text = 'E';

      return `
        <rect x="${c * cellSize + 2}" y="${r * cellSize + 2}"
          width="${cellSize - 4}" height="${cellSize - 4}"
          rx="6" fill="${bg}" stroke="${isWall ? '#1e2330' : '#13161e'}" stroke-width="1"/>
        ${text ? `<text x="${c * cellSize + cellSize/2}" y="${r * cellSize + cellSize/2}"
          text-anchor="middle" dominant-baseline="middle"
          fill="${isStart ? '#93c5fd' : '#34d399'}" font-size="11" font-weight="bold">${text}</text>` : ''}
        ${isCurrent && !isWall ? `<circle cx="${c * cellSize + cellSize/2}" cy="${r * cellSize + cellSize/2}"
          r="8" fill="#f59e0b"/>` : ''}
      `;
    }).join('')
  ).join('');

  return `
    <svg width="${5 * cellSize}" height="${5 * cellSize}" style="border-radius:12px;overflow:hidden;">
      ${cells}
    </svg>
  `;
};
