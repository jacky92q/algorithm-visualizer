var drawerStep = 'ds';
var DATA_STRUCTURES = null;

function initDataStructures() {
  DATA_STRUCTURES = {
    stack: {
      name: 'Stack',
      desc: '후입선출 (LIFO)',
      stackLabel: 'STACK',
      algorithms: {
        stack_basic: ALGO_STACK_BASIC,
        brackets:    ALGO_BRACKETS,
        dfs:         ALGO_DFS,
      }
    },
    queue: {
      name: 'Queue',
      desc: '선입선출 (FIFO)',
      stackLabel: 'QUEUE',
      algorithms: {
        queue_basic: ALGO_QUEUE_BASIC,
        bfs:         ALGO_BFS,
      }
    }
  };
}

function getCurrentAlgo() {
  return DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey];
}

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
  inputString = getCurrentAlgo().defaultInput;
  closeDrawer();
  updateGraphVisibility();
  document.getElementById('stack-label').innerText = DATA_STRUCTURES[currentDS].stackLabel;
  resetAndStart();
}

function openModal() {
  const algo = getCurrentAlgo();
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