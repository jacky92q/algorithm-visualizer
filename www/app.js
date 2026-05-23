// ============================
// 자료구조 & 알고리즘 정의
// ============================

const DATA_STRUCTURES = {
  stack: {
    name: 'Stack',
    icon: '📚',
    desc: '후입선출 (LIFO)',
    stackLabel: 'STACK',
    algorithms: {
      stack_basic: {
        name: 'Stack 기본',
        icon: '🔢',
        desc: 'Push & Pop',
        defaultInput: '1,2,3,4,5',
        inputPlaceholder: '예: 1,2,3,4,5',
        inputDesc: '숫자를 쉼표로 구분해서 입력하세요',
        sourceCode: [
          { text: 'stack = []',              indent: 0 },
          { text: 'def push(val):',          indent: 0 },
          { text: 'stack.append(val)',       indent: 1 },
          { text: 'def pop():',              indent: 0 },
          { text: 'if stack:',              indent: 1 },
          { text: 'return stack.pop()',     indent: 2 },
          { text: 'return None',            indent: 2 },
        ],
        generateTrace(s) {
          const nums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
          const result = [];
          const stack = [];
          for (const n of nums) {
            result.push({ line: 2, currentChar: `push(${n})`, stack: [...stack], action: 'CALL', description: `push(${n}) 호출` });
            stack.push(n);
            result.push({ line: 3, currentChar: `${n}`, stack: [...stack], action: 'PUSH', description: `${n} 을 스택에 push → [${stack.join(', ')}]` });
          }
          while (stack.length > 0) {
            result.push({ line: 4, currentChar: `pop()`, stack: [...stack], action: 'CALL', description: `pop() 호출` });
            const val = stack.pop();
            result.push({ line: 6, currentChar: `${val}`, stack: [...stack], action: 'POP', description: `${val} 을 스택에서 pop → [${stack.join(', ')}]` });
          }
          result.push({ line: 1, currentChar: '[]', stack: [], action: 'DONE ✅', description: '스택이 비었습니다' });
          return result;
        },
        renderInput(s) {
          return `push/pop([<span style="color:#ffdd57;">${s}</span>])`;
        }
      },

      brackets: {
        name: '괄호 검사',
        icon: '🔤',
        desc: 'Valid Parentheses',
        defaultInput: '([])',
        inputPlaceholder: '예: ([])',
        inputDesc: '괄호만 입력해주세요 ( ) [ ] { }',
        sourceCode: [
          { text: 'def is_valid(s):',                       indent: 0 },
          { text: 'stack = []',                             indent: 1 },
          { text: "mapping = {')':'(', ']':'[', '}':'{'}",  indent: 1 },
          { text: 'for ch in s:',                           indent: 1 },
          { text: 'if ch in "([{":',                        indent: 2 },
          { text: 'stack.append(ch)',                       indent: 3 },
          { text: 'else:',                                  indent: 2 },
          { text: 'if not stack:',                          indent: 3 },
          { text: 'return False',                           indent: 4 },
          { text: 'stack.pop()',                            indent: 3 },
          { text: 'return len(stack) == 0',                 indent: 1 },
        ],
        generateTrace(s) {
          const result = [];
          const stack = [];
          const mapping = { ')': '(', ']': '[', '}': '{' };
          for (const ch of s) {
            result.push({ line: 4, currentChar: ch, stack: [...stack], action: 'READ', description: `문자 ${ch} 읽기` });
            if ('([{'.includes(ch)) {
              stack.push(ch);
              result.push({ line: 6, currentChar: ch, stack: [...stack], action: 'PUSH', description: `${ch} 를 스택에 push` });
            } else {
              if (stack.length === 0) {
                result.push({ line: 9, currentChar: ch, stack: [], action: 'INVALID ❌', description: '스택이 비어있음! 유효하지 않음' });
                return result;
              }
              stack.pop();
              result.push({ line: 10, currentChar: ch, stack: [...stack], action: 'POP', description: `${mapping[ch]} 를 스택에서 pop` });
            }
          }
          const valid = stack.length === 0;
          result.push({ line: 11, currentChar: '', stack: [...stack], action: valid ? 'VALID ✅' : 'INVALID ❌', description: valid ? '스택이 비어있음. 유효함!' : '스택이 비어있지 않음. 유효하지 않음!' });
          return result;
        },
        renderInput(s, idx, trace) {
          const step = trace[idx];
          const chars = s.split('');
          const charIndex = trace.slice(0, idx + 1).filter(t => t.action === 'READ').length - 1;
          const highlighted = chars.map((ch, i) => {
            if (i === charIndex && step.action === 'READ') return `<span style="color:#ffdd57;font-weight:bold;">${ch}</span>`;
            if (i < charIndex) return `<span style="color:#555;">${ch}</span>`;
            return `<span>${ch}</span>`;
          }).join('');
          return `is_valid("<span>${highlighted}</span>")`;
        }
      },

      dfs: {
        name: 'DFS 탐색',
        icon: '🌲',
        desc: 'Depth First Search',
        defaultInput: '0',
        inputPlaceholder: '시작 노드 번호 (예: 0)',
        inputDesc: '시작 노드 번호를 입력하세요 (0~4)',
        hasGraph: true,
        graph: {
          0: [1, 2],
          1: [0, 3],
          2: [0, 4],
          3: [1],
          4: [2],
        },
        nodePositions: [
          { x: 0.5, y: 0.15 },
          { x: 0.2, y: 0.5  },
          { x: 0.8, y: 0.5  },
          { x: 0.2, y: 0.85 },
          { x: 0.8, y: 0.85 },
        ],
        sourceCode: [
          { text: 'def dfs(graph, start):',       indent: 0 },
          { text: 'stack = [start]',              indent: 1 },
          { text: 'visited = set()',              indent: 1 },
          { text: 'while stack:',                indent: 1 },
          { text: 'node = stack.pop()',          indent: 2 },
          { text: 'if node not in visited:',     indent: 2 },
          { text: 'visited.add(node)',           indent: 3 },
          { text: 'for neighbor in graph[node]:', indent: 3 },
          { text: 'stack.append(neighbor)',      indent: 4 },
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
      }
    }
  },

  queue: {
    name: 'Queue',
    icon: '🚶',
    desc: '선입선출 (FIFO)',
    stackLabel: 'QUEUE',
    algorithms: {
      queue_basic: {
        name: 'Queue 기본',
        icon: '🔢',
        desc: 'Enqueue & Dequeue',
        defaultInput: '1,2,3,4,5',
        inputPlaceholder: '예: 1,2,3,4,5',
        inputDesc: '숫자를 쉼표로 구분해서 입력하세요',
        sourceCode: [
          { text: 'queue = []',                    indent: 0 },
          { text: 'def enqueue(val):',             indent: 0 },
          { text: 'queue.append(val)',             indent: 1 },
          { text: 'def dequeue():',               indent: 0 },
          { text: 'if queue:',                    indent: 1 },
          { text: 'return queue.pop(0)',          indent: 2 },
          { text: 'return None',                  indent: 2 },
        ],
        generateTrace(s) {
          const nums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
          const result = [];
          const queue = [];
          for (const n of nums) {
            result.push({ line: 2, currentChar: `enqueue(${n})`, stack: [...queue], action: 'CALL', description: `enqueue(${n}) 호출` });
            queue.push(n);
            result.push({ line: 3, currentChar: `${n}`, stack: [...queue], action: 'ENQUEUE', description: `${n} 을 큐에 추가 → [${queue.join(', ')}]` });
          }
          while (queue.length > 0) {
            result.push({ line: 4, currentChar: `dequeue()`, stack: [...queue], action: 'CALL', description: `dequeue() 호출` });
            const val = queue.shift();
            result.push({ line: 6, currentChar: `${val}`, stack: [...queue], action: 'DEQUEUE', description: `${val} 을 큐에서 dequeue → [${queue.join(', ')}]` });
          }
          result.push({ line: 1, currentChar: '[]', stack: [], action: 'DONE ✅', description: '큐가 비었습니다' });
          return result;
        },
        renderInput(s) {
          return `enqueue/dequeue([<span style="color:#ffdd57;">${s}</span>])`;
        }
      },

      bfs: {
        name: 'BFS 탐색',
        icon: '🌊',
        desc: 'Breadth First Search',
        defaultInput: '0',
        inputPlaceholder: '시작 노드 번호 (예: 0)',
        inputDesc: '시작 노드 번호를 입력하세요 (0~4)',
        hasGraph: true,
        graph: {
          0: [1, 2],
          1: [0, 3],
          2: [0, 4],
          3: [1],
          4: [2],
        },
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
      }
    }
  }
};

// ============================
// 상태
// ============================

let currentDS = 'stack';
let currentAlgoKey = 'brackets';
let inputString = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey].defaultInput;
let trace = [];
let currentIndex = 0;
let timer = null;
let isPlaying = false;
let lastStack = null;
let drawerStep = 'ds'; // 'ds' | 'algo'

// ============================
// 그래프 시각화
// ============================

function drawGraph(visited = [], current = null) {
  const algo = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey];
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
  const algo = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey];
  const graphCard = document.getElementById('graph-card');
  graphCard.style.display = algo.hasGraph ? 'block' : 'none';
}

// ============================
// Drawer (2단계)
// ============================

function openDrawer() {
  drawerStep = 'ds';
  renderDrawer();
  document.getElementById('drawer-overlay').classList.add('show');
  document.getElementById('drawer').classList.add('show');
}

function closeDrawer() {
  document.getElementById('drawer-overlay').classList.remove('show');
  document.getElementById('drawer').classList.remove('show');
}

function renderDrawer() {
  const title = document.getElementById('drawer-title');
  const list = document.getElementById('drawer-list');

  if (drawerStep === 'ds') {
    title.innerHTML = '자료구조 선택';
    list.innerHTML = Object.entries(DATA_STRUCTURES).map(([key, ds]) => `
      <div class="drawer-item ${key === currentDS ? 'active' : ''}" onclick="selectDS('${key}')">
        <span class="drawer-item-icon">${ds.icon}</span>
        <div class="drawer-item-info">
          <span class="drawer-item-name">${ds.name}</span>
          <span class="drawer-item-desc">${ds.desc}</span>
        </div>
      </div>
    `).join('');
  } else {
    const ds = DATA_STRUCTURES[currentDS];
    title.innerHTML = `<button class="drawer-back" onclick="goBackDrawer()">← 뒤로</button> ${ds.name} 알고리즘`;
    list.innerHTML = Object.entries(ds.algorithms).map(([key, algo]) => `
      <div class="drawer-item ${key === currentAlgoKey ? 'active' : ''}" onclick="selectAlgo('${key}')">
        <span class="drawer-item-icon">${algo.icon}</span>
        <div class="drawer-item-info">
          <span class="drawer-item-name">${algo.name}</span>
          <span class="drawer-item-desc">${algo.desc}</span>
        </div>
      </div>
    `).join('');
  }
}

function selectDS(key) {
  currentDS = key;
  drawerStep = 'algo';
  renderDrawer();
}

function goBackDrawer() {
  drawerStep = 'ds';
  renderDrawer();
}

function selectAlgo(key) {
  currentAlgoKey = key;
  inputString = DATA_STRUCTURES[currentDS].algorithms[key].defaultInput;
  closeDrawer();
  updateGraphVisibility();
  document.getElementById('stack-label').innerText = DATA_STRUCTURES[currentDS].stackLabel;
  resetAndStart();
}

// ============================
// Modal
// ============================

function openModal() {
  const algo = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey];
  document.getElementById('modal-input').value = inputString;
  document.getElementById('modal-input').placeholder = algo.inputPlaceholder;
  document.getElementById('modal-desc').innerText = algo.inputDesc;
  document.getElementById('modal-overlay').classList.add('show');
  document.getElementById('modal-input').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}

function confirmInput() {
  const val = document.getElementById('modal-input').value.trim();
  if (!val) return;
  inputString = val;
  closeModal();
  resetAndStart();
}

// ============================
// 렌더링
// ============================

function resetAndStart() {
  clearInterval(timer);
  isPlaying = false;
  document.getElementById('play-btn').innerText = '▶ Play';
  lastStack = null;
  currentIndex = 0;
  trace = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey].generateTrace(inputString);
  render();
}

function fitCodeFontSize() {
  const card = document.querySelector('.code-card');
  const codeView = document.getElementById('code-view');
  const inputEl = document.querySelector('.input-row');
  const lineCount = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey].sourceCode.length;
  const availHeight = card.clientHeight - inputEl.clientHeight - 20;
  let fontSize = 14;
  while (fontSize > 7) {
    const lineHeight = fontSize + 8;
    if (lineHeight * lineCount <= availHeight) break;
    fontSize--;
  }
  codeView.style.fontSize = fontSize + 'px';
}

function render() {
  const step = trace[currentIndex];
  const algo = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey];
  renderCode(step.line);
  renderStack(step.stack);
  document.getElementById('current-char').innerText = step.currentChar;
  document.getElementById('description').innerText = step.description;
  document.getElementById('action').innerText = step.action;
  document.getElementById('input-display').innerHTML = algo.renderInput(inputString, currentIndex, trace);

  if (algo.hasGraph) {
    drawGraph(step.visited || [], step.current);
  }
}

function renderCode(activeLine) {
  const algo = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey];
  const codeView = document.getElementById('code-view');
  codeView.innerHTML = algo.sourceCode.map((item, index) => {
    const indents = Array(item.indent).fill(`<span class="indent"></span>`).join('');
    return `
      <div class="code-line ${activeLine === index + 1 ? 'active-line' : ''}">
        <div class="line-number">${index + 1}</div>
        ${indents}<span class="code-text">${escapeHtml(item.text)}</span>
      </div>
    `;
  }).join('');
  fitCodeFontSize();
}

function renderStack(stack) {
  const serialized = JSON.stringify(stack);
  if (serialized === lastStack) return;
  lastStack = serialized;
  const stackView = document.getElementById('stack-view');
  stackView.innerHTML = stack.map(item =>
    `<div class="stack-item">${item}</div>`
  ).join('');
}

function nextStep() {
  if (currentIndex < trace.length - 1) {
    currentIndex++;
    render();
  }
}

function prevStep() {
  if (currentIndex > 0) {
    currentIndex--;
    render();
  }
}

function togglePlay() {
  const btn = document.getElementById('play-btn');
  if (isPlaying) {
    clearInterval(timer);
    isPlaying = false;
    btn.innerText = '▶ Play';
  } else {
    if (currentIndex >= trace.length - 1) {
      currentIndex = 0;
      render();
    }
    isPlaying = true;
    btn.innerText = '⏸ Pause';
    timer = setInterval(() => {
      if (currentIndex >= trace.length - 1) {
        clearInterval(timer);
        isPlaying = false;
        btn.innerText = '▶ Play';
        return;
      }
      nextStep();
    }, 1200);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  updateGraphVisibility();
  trace = DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey].generateTrace(inputString);
  render();
  window.addEventListener('resize', fitCodeFontSize);
});