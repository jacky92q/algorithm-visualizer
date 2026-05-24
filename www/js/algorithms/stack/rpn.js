const ALGO_RPN = {
  name: 'RPN Calculator',
  desc: 'RPN Calculator',
  defaultInput: '2,3,+,4,*',
  inputPlaceholder: 'e.g., 2,3,+,4,*',
  inputDesc: 'Enter numbers and operators (+ - * /) separated by commas',

  info: {
    summary: 'Calculate expressions in Reverse Polish Notation (RPN). Uses a stack to handle operation order without parentheses.',
    complexity: 'O(n)',
    space: 'O(n)',
    keyPoints: [
      'Push numbers to stack when encountered',
      'When operator is encountered, pop two numbers, calculate, and push result',
      'Final result remains on stack',
    ],
  },

  sourceCode: [
    { text: 'def rpn(tokens):',            indent: 0 },
    { text: 'stack = []',                  indent: 1 },
    { text: 'for token in tokens:',        indent: 1 },
    { text: 'if token.isdigit():',         indent: 2 },
    { text: 'stack.append(int(token))',    indent: 3 },
    { text: 'else:',                       indent: 2 },
    { text: 'b = stack.pop()',             indent: 3 },
    { text: 'a = stack.pop()',             indent: 3 },
    { text: 'stack.append(a op b)',        indent: 3 },
    { text: 'return stack[0]',             indent: 1 },
  ],

  generateTrace(s) {
    const tokens = s.split(',').map(t => t.trim());
    const result = [];
    const stack = [];
    const ops = { '+': (a,b) => a+b, '-': (a,b) => a-b, '*': (a,b) => a*b, '/': (a,b) => Math.floor(a/b) };
    for (const token of tokens) {
      result.push({ line: 3, currentChar: token, stack: [...stack], action: 'READ', description: `Read token "${token}"` });
      if (!isNaN(token)) {
        stack.push(parseInt(token));
        result.push({ line: 5, currentChar: token, stack: [...stack], action: 'PUSH', description: `Push ${token} to stack` });
      } else if (ops[token]) {
        const b = stack.pop();
        const a = stack.pop();
        const val = ops[token](a, b);
        stack.push(val);
        result.push({ line: 9, currentChar: token, stack: [...stack], action: 'CALC', description: `${a} ${token} ${b} = ${val} → push` });
      }
    }
    result.push({ line: 10, currentChar: `${stack[0]}`, stack: [...stack], action: 'DONE ✅', description: `Result: ${stack[0]}` });
    return result;
  },

  renderVisual(step) {
    const stack = step.stack;
    const isCalc = step.action === 'CALC';
    if (stack.length === 0) {
      return `<div style="color:#555;font-size:14px;">Stack is empty</div>`;
    }
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;">
        <div style="font-size:11px;color:#888;">TOP ↓</div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
          ${[...stack].reverse().map((item, i) => `
            <div class="visual-block ${i === 0 && isCalc ? 'highlight' : ''}" style="width:80px;">
              ${item}
            </div>
          `).join('')}
        </div>
        <div style="font-size:11px;color:#888;">BOTTOM</div>
        ${isCalc ? `<div style="color:#ffdd57;font-size:13px;margin-top:4px;">${step.description}</div>` : ''}
      </div>
    `;
  },

  renderInput(s) {
    return `rpn([<span style="color:#ffdd57;">${s}</span>])`;
  }
};

ALGO_RPN.info = {
  summary: 'Calculate expressions in Reverse Polish Notation (RPN). Uses a stack to handle operation order without parentheses.',
  complexity: 'O(n)',
  space: 'O(n)',
  keyPoints: [
    'Push numbers to stack when encountered',
    'When operator is encountered, pop two numbers, calculate, and push result',
    'Final result remains on stack',
  ],
};
