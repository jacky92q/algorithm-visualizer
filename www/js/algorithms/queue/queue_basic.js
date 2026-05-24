const ALGO_QUEUE_BASIC = {
  name: 'Queue 기본',
  desc: 'Enqueue & Dequeue',
  defaultInput: '1,2,3,4,5',
  inputPlaceholder: '예: 1,2,3,4,5',
  inputDesc: '숫자를 쉼표로 구분해서 입력하세요',
  sourceCode: [
    { text: 'queue = []',               indent: 0 },
    { text: 'def enqueue(val):',        indent: 0 },
    { text: 'queue.append(val)',        indent: 1 },
    { text: 'def dequeue():',           indent: 0 },
    { text: 'if queue:',               indent: 1 },
    { text: 'return queue.pop(0)',     indent: 2 },
    { text: 'return None',             indent: 2 },
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
      result.push({ line: 4, currentChar: 'dequeue()', stack: [...queue], action: 'CALL', description: `dequeue() 호출` });
      const val = queue.shift();
      result.push({ line: 6, currentChar: `${val}`, stack: [...queue], action: 'DEQUEUE', description: `${val} 을 큐에서 dequeue → [${queue.join(', ')}]` });
    }
    result.push({ line: 1, currentChar: '[]', stack: [], action: 'DONE ✅', description: '큐가 비었습니다' });
    return result;
  },
  renderInput(s) {
    return `enqueue/dequeue([<span style="color:#ffdd57;">${s}</span>])`;
  }
};

ALGO_QUEUE_BASIC.info = {
  summary: '큐(Queue)는 선입선출(FIFO) 구조입니다. 먼저 넣은 데이터가 가장 먼저 나옵니다.',
  complexity: 'O(1)',
  space: 'O(n)',
  keyPoints: [
    'enqueue: 큐 맨 뒤에 데이터 추가',
    'dequeue: 큐 맨 앞 데이터 제거 및 반환',
    '줄 서기와 같은 구조',
  ],
};

ALGO_QUEUE_BASIC.renderVisual = function(step) {
  const queue = step.stack || [];
  const isEnqueue = step.action === 'ENQUEUE';
  const isDequeue = step.action === 'DEQUEUE';
  if (queue.length === 0) {
    return `<div style="color:#333;font-size:14px;">큐 비어있음</div>`;
  }
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;">
      <div style="display:flex;flex-direction:row;gap:6px;align-items:center;">
        <div style="font-size:11px;color:#10b981;writing-mode:vertical-rl;">FRONT</div>
        ${queue.map((item, i) => `
          <div class="v-block ${i === 0 && isDequeue ? 'highlight' : ''} ${i === queue.length-1 && isEnqueue ? 'active' : ''}">${item}</div>
        `).join('<div style="color:#333;font-size:12px;">→</div>')}
        <div style="font-size:11px;color:#3b82f6;writing-mode:vertical-rl;">BACK</div>
      </div>
      <div style="display:flex;gap:20px;font-size:12px;color:#555;">
        <span>← dequeue</span>
        <span>enqueue →</span>
      </div>
    </div>
  `;
};
