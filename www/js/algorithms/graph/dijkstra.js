const ALGO_DIJKSTRA = {
  name: 'Dijkstra\'s Algorithm',
  desc: 'Dijkstra\'s Shortest Path',
  defaultInput: '0',
  inputPlaceholder: 'Starting node (e.g., 0)',
  inputDesc: 'Enter starting node number (0-4)',

  info: {
    summary: 'Greedy algorithm that finds shortest path from source to all nodes in a weighted graph. Uses priority queue concept.',
    complexity: 'O((V+E) log V)',
    space: 'O(V)',
    keyPoints: [
      'Initializes distances: source = 0, others = infinity',
      'Greedily selects unvisited node with minimum distance',
      'Updates distances of unvisited neighbors',
      'Repeats until all nodes visited',
    ],
  },

  graph: {
    0: [{ node: 1, weight: 4 }, { node: 2, weight: 2 }],
    1: [{ node: 0, weight: 4 }, { node: 2, weight: 1 }, { node: 3, weight: 5 }],
    2: [{ node: 0, weight: 2 }, { node: 1, weight: 1 }, { node: 4, weight: 3 }],
    3: [{ node: 1, weight: 5 }, { node: 4, weight: 2 }],
    4: [{ node: 2, weight: 3 }, { node: 3, weight: 2 }],
  },

  sourceCode: [
    { text: 'def dijkstra(graph, start):', indent: 0 },
    { text: 'distances = {n: inf for n in graph}', indent: 1 },
    { text: 'distances[start] = 0', indent: 1 },
    { text: 'unvisited = set(graph.keys())', indent: 1 },
    { text: 'while unvisited:', indent: 1 },
    { text: 'current = min(unvisited, key=distances.get)', indent: 2 },
    { text: 'unvisited.remove(current)', indent: 2 },
    { text: 'for neighbor, weight in graph[current]:', indent: 2 },
    { text: 'alt = distances[current] + weight', indent: 3 },
    { text: 'if alt < distances[neighbor]:', indent: 3 },
    { text: 'distances[neighbor] = alt', indent: 4 },
    { text: 'return distances', indent: 1 },
  ],

  generateTrace(s) {
    const start = parseInt(s) || 0;
    const graph = ALGO_DIJKSTRA.graph;
    const result = [];

    const distances = {};
    const unvisited = new Set();
    const previous = {};

    for (const node in graph) {
      distances[node] = node === String(start) ? 0 : Infinity;
      unvisited.add(node);
      previous[node] = null;
    }

    result.push({
      line: 2,
      currentChar: `start: ${start}`,
      distances: { ...distances },
      unvisited: Array.from(unvisited),
      current: null,
      neighbors: [],
      action: 'INIT',
      description: `Initialize: distance[${start}]=0, others=∞`
    });

    while (unvisited.size > 0) {
      let minDist = Infinity;
      let current = null;

      for (const node of unvisited) {
        if (distances[node] < minDist) {
          minDist = distances[node];
          current = node;
        }
      }

      if (minDist === Infinity) break;

      result.push({
        line: 6,
        currentChar: `current: ${current}`,
        distances: { ...distances },
        unvisited: Array.from(unvisited),
        current,
        neighbors: [],
        action: 'SELECT_MIN',
        description: `Select node ${current} with min distance ${minDist}`
      });

      unvisited.delete(current);

      result.push({
        line: 7,
        currentChar: `visit ${current}`,
        distances: { ...distances },
        unvisited: Array.from(unvisited),
        current,
        neighbors: [],
        action: 'VISIT',
        description: `Visit node ${current}`
      });

      const neighbors = graph[current] || [];
      for (const { node: neighbor, weight } of neighbors) {
        if (unvisited.has(neighbor)) {
          const alt = distances[current] + weight;

          result.push({
            line: 9,
            currentChar: `check neighbor ${neighbor}`,
            distances: { ...distances },
            unvisited: Array.from(unvisited),
            current,
            neighbors: [neighbor],
            action: 'RELAX',
            description: `Check neighbor ${neighbor}: alt=${distances[current]}+${weight}=${alt}`
          });

          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = current;

            result.push({
              line: 11,
              currentChar: `update dist[${neighbor}]`,
              distances: { ...distances },
              unvisited: Array.from(unvisited),
              current,
              neighbors: [neighbor],
              action: 'UPDATE',
              description: `Update distance[${neighbor}] = ${alt}`
            });
          }
        }
      }
    }

    result.push({
      line: 12,
      currentChar: '',
      distances: { ...distances },
      unvisited: [],
      current: null,
      neighbors: [],
      action: 'DONE ✅',
      description: `All shortest paths found! Distances: ${JSON.stringify(distances).replace(/"/g, '')}`
    });

    return result;
  },

  renderVisual(step) {
    const graph = ALGO_DIJKSTRA.graph;
    const distances = step.distances || {};
    const unvisited = step.unvisited || [];
    const current = step.current;
    const neighbors = step.neighbors || [];

    const positions = [
      { x: 50, y: 12 },
      { x: 20, y: 45 },
      { x: 80, y: 45 },
      { x: 20, y: 80 },
      { x: 80, y: 80 },
    ];

    const edges = [];
    for (const [node, adjList] of Object.entries(graph)) {
      for (const { node: neighbor, weight } of adjList) {
        if (parseInt(node) < parseInt(neighbor)) {
          edges.push({ from: parseInt(node), to: parseInt(neighbor), weight });
        }
      }
    }

    const svgEdges = edges.map(({ from, to, weight }) => {
      const pa = positions[from];
      const pb = positions[to];
      const mx = (pa.x + pb.x) / 2;
      const my = (pa.y + pb.y) / 2;
      return `
        <line x1="${pa.x}%" y1="${pa.y}%" x2="${pb.x}%" y2="${pb.y}%" stroke="#1e2330" stroke-width="2"/>
        <text x="${mx}%" y="${my}%" text-anchor="middle" dominant-baseline="middle" fill="#888" font-size="12" font-weight="bold">${weight}</text>
      `;
    }).join('');

    const svgNodes = positions.map((pos, i) => {
      const isCurrent = current === String(i);
      const isNeighbor = neighbors.includes(String(i));
      const isUnvisited = unvisited.includes(String(i));

      let fill = '#13161e';
      let stroke = '#2a3040';
      let textColor = '#444';

      if (isCurrent) {
        fill = '#422006';
        stroke = '#f59e0b';
        textColor = '#fbbf24';
      } else if (!isUnvisited) {
        fill = '#052e16';
        stroke = '#10b981';
        textColor = '#34d399';
      } else if (isNeighbor) {
        fill = '#1e2d4a';
        stroke = '#3b82f6';
        textColor = '#93c5fd';
      }

      const dist = distances[String(i)];
      const distText = dist === Infinity ? '∞' : dist;

      return `
        <circle cx="${pos.x}%" cy="${pos.y}%" r="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <text x="${pos.x}%" y="${pos.y}%" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-size="12" font-weight="bold">${i}</text>
        <text x="${pos.x}%" y="${pos.y + 20}%" text-anchor="middle" fill="#888" font-size="11">${distText}</text>
      `;
    }).join('');

    return `
      <div style="width:100%;display:flex;flex-direction:column;gap:8px;">
        <svg width="100%" height="140px" style="overflow:visible;">
          ${svgEdges}${svgNodes}
        </svg>
        <div style="display:flex;gap:8px;font-size:11px;flex-wrap:wrap;justify-content:center;">
          ${Object.entries(distances).map(([node, dist]) => {
            const distText = dist === Infinity ? '∞' : dist;
            const color = current === node ? '#f59e0b' : unvisited.includes(node) ? '#93c5fd' : '#34d399';
            return `<div style="color:${color};font-family:monospace;">d[${node}]=${distText}</div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  renderInput(s) {
    return `dijkstra(graph, <span style="color:#ffdd57;">${s}</span>)`;
  }
};

ALGO_DIJKSTRA.info = {
  summary: 'Greedy algorithm that finds shortest path from source to all nodes in a weighted graph. Uses priority queue concept.',
  complexity: 'O((V+E) log V)',
  space: 'O(V)',
  keyPoints: [
    'Initializes distances: source = 0, others = infinity',
    'Greedily selects unvisited node with minimum distance',
    'Updates distances of unvisited neighbors',
    'Repeats until all nodes visited',
  ],
};
