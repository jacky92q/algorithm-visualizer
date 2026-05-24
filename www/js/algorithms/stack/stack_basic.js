const ALGO_STACK_BASIC = {
  name: 'Stack 기본',
  desc: 'Push & Pop',
  defaultInput: '1,2,3,4,5',
  inputPlaceholder: '예: 1,2,3,4,5',
  inputDesc: '숫자를 쉼표로 구분해서 입력하세요',

  info: {
    summary: '스택(Stack)은 후입선출(LIFO) 구조입니다. 마지막에 넣은 데이터가 가장 먼저 나옵니다.',
    complexity: 'O(1)',
    space: 'O(n)',
    keyPoints: [
      'push: 스택 맨 위에 데이터 추가',
      'pop: 스택 맨 위 데이터 제거 및 반환',
      '접시 쌓기와 같은 구조',
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
      result.push({ line: 2, currentChar: `push(${n})`, stack: [...stack], action: 'CALL', description: `push(${n}) 호출` });
      stack.push(n);
      result.push({ line: 3, currentChar: `${n}`, stack: [...stack], action: 'PUSH', description: `${n} 을 스택에 push → [${stack.join(', ')}]` });
    }
    while (stack.length > 0) {
      result.push({ line: 4, currentChar: 'pop()', stack: [...stack], action: 'CALL', description: `pop() 호출` });
      const val = stack.pop();
      result.push({ line: 6, currentChar: `${val}`, stack: [...stack], action: 'POP', description: `${val} 을 스택에서 pop → [${stack.join(', ')}]` });
    }
    result.push({ line: 1, currentChar: '[]', stack: [], action: 'DONE ✅', description: '스택이 비었습니다' });
    return result;
  },

  renderVisual(step) {
    const stack = step.stack;
    const isPush = step.action === 'PUSH';
    const isPop = step.action === 'POP';
    if (stack.length === 0) {
      return `<div style="color:#555;font-size:14px;">스택 비어있음</div>`;
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
  summary: '스택(Stack)은 후입선출(LIFO) 구조입니다. 마지막에 넣은 데이터가 가장 먼저 나옵니다.',
  complexity: 'O(1)',
  space: 'O(n)',
  keyPoints: [
    'push: 스택 맨 위에 데이터 추가',
    'pop: 스택 맨 위 데이터 제거 및 반환',
    '접시 쌓기와 같은 구조',
  ],
};

ALGO_STACK_BASIC.renderVisual = function(step) {
  const stack = step.stack || [];
  const isPush = step.action === 'PUSH';
  const isPop = step.action === 'POP';
  if (stack.length === 0) {
    return `<div style="color:#333;font-size:14px;">스택 비어있음</div>`;
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
