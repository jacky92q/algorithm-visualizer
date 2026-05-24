function drawGraph(visited = [], current = null) {
  const algo = getCurrentAlgo();
  if (!algo.hasGraph) return;

  const canvas = document.getElementById('graph-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const W = canvas.width;
  const H = canvas.height;
  const R = 20;
  const positions = algo.nodePositions.map(p => ({ x: p.x * W, y: p.y * H }));
  const graph = algo.graph;

  ctx.clearRect(0, 0, W, H);

  // 엣지
  for (const [node, neighbors] of Object.entries(graph)) {
    for (const neighbor of neighbors) {
      if (parseInt(node) < neighbor) {
        const a = positions[node];
        const b = positions[neighbor];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = '#2a2f3a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  // 노드
  positions.forEach((pos, i) => {
    const isVisited = visited.includes(i);
    const isCurrent = current === i;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2);
    ctx.fillStyle = isCurrent ? '#ffdd57' : isVisited ? '#2563eb' : '#2a2f3a';
    ctx.fill();
    ctx.strokeStyle = isCurrent ? '#ffaa00' : '#4f8cff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = isCurrent ? '#000' : '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i, pos.x, pos.y);
  });
}

function updateGraphVisibility() {
  const algo = getCurrentAlgo();
  document.getElementById('graph-card').style.display = algo.hasGraph ? 'block' : 'none';
}
