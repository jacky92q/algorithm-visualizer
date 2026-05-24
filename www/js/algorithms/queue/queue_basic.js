const ALGO_QUEUE_BASIC = {
  name: 'Basic Queue',
  desc: 'Enqueue & Dequeue',
  defaultInput: '1,2,3,4,5',
  inputPlaceholder: 'e.g., 1,2,3,4,5',
  inputDesc: 'Enter numbers separated by commas',
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
      result.push({ line: 2, currentChar: `enqueue(${n})`, stack: [...queue], action: 'CALL', description: `enqueue(${n}) called` });
      queue.push(n);
      result.push({ line: 3, currentChar: `${n}`, stack: [...queue], action: 'ENQUEUE', description: `${n} added to queue → [${queue.join(', ')}]` });
    }
    while (queue.length > 0) {
      result.push({ line: 4, currentChar: 'dequeue()', stack: [...queue], action: 'CALL', description: `dequeue() called` });
      const val = queue.shift();
      result.push({ line: 6, currentChar: `${val}`, stack: [...queue], action: 'DEQUEUE', description: `${val} dequeued from queue → [${queue.join(', ')}]` });
    }
    result.push({ line: 1, currentChar: '[]', stack: [], action: 'DONE ✅', description: 'Queue is empty' });
    return result;
  },
  renderInput(s) {
    return `enqueue/dequeue([<span style="color:#ffdd57;">${s}</span>])`;
  }
};

ALGO_QUEUE_BASIC.info = {
  summary: 'Queue is a First-In-First-Out (FIFO) data structure. The first element added is the first one removed.',
  complexity: 'O(1)',
  space: 'O(n)',
  keyPoints: [
    'enqueue: Add data to the back of the queue',
    'dequeue: Remove and return data from the front of the queue',
    'Similar structure to standing in line',
  ],
};

ALGO_QUEUE_BASIC.renderVisual = function(step) {
  const queue = step.stack || [];
  const isEnqueue = step.action === 'ENQUEUE';
  const isDequeue = step.action === 'DEQUEUE';
  if (queue.length === 0) {
    return `<div style="color:#333;font-size:14px;">Queue is empty</div>`;
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
