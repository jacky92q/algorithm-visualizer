const ALGO_STACK_BASIC = {
  name: 'Basic Stack',
  desc: 'Push & Pop',
  defaultInput: '1,2,3,4,5',
  inputPlaceholder: 'e.g., 1,2,3,4,5',
  inputDesc: 'Enter numbers separated by commas',

  info: {
    summary: 'Stack is a Last-In-First-Out (LIFO) data structure. The last element added is the first one removed.',
    complexity: 'O(1)',
    space: 'O(n)',
    keyPoints: [
      'push: Add data to the top of the stack',
      'pop: Remove and return data from the top of the stack',
      'Similar structure to stacking plates',
    ],
  },

  sourceCode: [
    { text: 'stack = []',          indent: 0 },
    { text: 'def push(val):',      indent: 0 },
    { text: 'stack.append(val)',   indent: 1 },
    { text: 'def pop():',          indent: 0 },
    { text: 'if stack:',           indent: 1 },
    { text: 'return stack.pop()', indent: 2 },
    { text: 'return None',        indent: 2 },
  ],

  generateTrace(s) {
    const nums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const result = [];
    const stack = [];
    for (const n of nums) {
      result.push({ line: 2, currentChar: `push(${n})`, stack: [...stack], action: 'CALL', description: `push(${n}) called` });
      stack.push(n);
      result.push({ line: 3, currentChar: `${n}`, stack: [...stack], action: 'PUSH', description: `${n} pushed to stack → [${stack.join(', ')}]` });
    }
    while (stack.length > 0) {
      result.push({ line: 4, currentChar: 'pop()', stack: [...stack], action: 'CALL', description: `pop() called` });
      const val = stack.pop();
      result.push({ line: 6, currentChar: `${val}`, stack: [...stack], action: 'POP', description: `${val} popped from stack → [${stack.join(', ')}]` });
    }
    result.push({ line: 1, currentChar: '[]', stack: [], action: 'DONE ✅', description: 'Stack is empty' });
    return result;
  },

  renderVisual(step) {
    const stack = step.stack;
    const isPush = step.action === 'PUSH';
    const isPop = step.action === 'POP';
    if (stack.length === 0) {
      return `<div style="color:#555;font-size:14px;">Stack is empty</div>`;
    }
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;">
        <div style="font-size:11px;color:#888;">TOP ↓</div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
          ${[...stack].reverse().map((item, i) => `
            <div class="visual-block ${i === 0 && (isPush || isPop) ? 'highlight' : ''}"
              style="width:80px;">
              ${item}
            </div>
          `).join('')}
        </div>
        <div style="font-size:11px;color:#888;">BOTTOM</div>
      </div>
    `;
  },

  renderInput(s) {
    return `push/pop([<span style="color:#ffdd57;">${s}</span>])`;
  }
};

ALGO_STACK_BASIC.info = {
  summary: 'Stack is a Last-In-First-Out (LIFO) data structure. The last element added is the first one removed.',
  complexity: 'O(1)',
  space: 'O(n)',
  keyPoints: [
    'push: Add data to the top of the stack',
    'pop: Remove and return data from the top of the stack',
    'Similar structure to stacking plates',
  ],
};

ALGO_STACK_BASIC.renderVisual = function(step) {
  const stack = step.stack || [];
  const isPush = step.action === 'PUSH';
  const isPop = step.action === 'POP';
  if (stack.length === 0) {
    return `<div style="color:#333;font-size:14px;">Stack is empty</div>`;
  }
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;">
      <div style="font-size:11px;color:#888;">TOP ↓</div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
        ${[...stack].reverse().map((item, i) => `
          <div class="v-block ${i === 0 && (isPush||isPop) ? 'highlight' : i === 0 ? 'active' : ''}"
            style="width:90px;">${item}</div>
        `).join('')}
      </div>
      <div style="font-size:11px;color:#888;">BOTTOM</div>
    </div>
  `;
};
