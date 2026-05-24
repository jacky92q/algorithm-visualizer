const ALGO_BFS_MAZE = {
  name: 'BFS 미로탐색',
  desc: 'BFS Maze Solving',
  defaultInput: '0',
  inputPlaceholder: '사용 안함',
  inputDesc: '고정 미로를 BFS로 탐색합니다',
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
    // 5x5 미로 (0=길, 1=벽)
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

    result.push({ line: 2, currentChar: start, stack: [...queue], visited: [...visited], maze, action: 'INIT', description: `시작: (0,0) → 목표: (4,4)` });

    while (queue.length > 0) {
      const pos = queue.shift();
      const [r, c] = pos.split(',').map(Number);
      result.push({ line: 5, currentChar: pos, stack: [...queue], visited: [...visited], maze, action: 'DEQUEUE', description: `위치 (${r},${c}) 꺼내기` });

      if (pos === end) {
        result.push({ line: 7, currentChar: pos, stack: [...queue], visited: [...visited], maze, action: 'DONE ✅', description: `목표 (4,4) 도달!` });
        return result;
      }

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        const npos = `${nr},${nc}`;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0 && !visited.has(npos)) {
          visited.add(npos);
          queue.push(npos);
          result.push({ line: 10, currentChar: npos, stack: [...queue], visited: [...visited], maze, action: 'ENQUEUE', description: `(${nr},${nc}) 큐에 추가` });
        }
      }
    }
    result.push({ line: 11, currentChar: '', stack: [], visited: [...visited], maze, action: 'FAIL ❌', description: '경로 없음!' });
    return result;
  },
  renderInput() {
    return `bfs_maze(<span style="color:#ffdd57;">5x5 미로</span>)`;
  }
};
