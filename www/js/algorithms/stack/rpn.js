const ALGO_RPN = {
  name: '역폴리시 계산기',
  desc: 'RPN Calculator',
  defaultInput: '2,3,+,4,*',
  inputPlaceholder: '예: 2,3,+,4,*',
  inputDesc: '숫자와 연산자(+ - * /)를 쉼표로 구분',

  info: {
    summary: '후위 표기법(Reverse Polish Notation)으로 수식을 계산합니다. 스택을 이용해 괄호 없이도 연산 순서를 정확히 처리합니다.',
    complexity: 'O(n)',
    space: 'O(n)',
    keyPoints: [
      '숫자를 만나면 스택에 push',
      '연산자를 만나면 스택에서 두 수를 pop해서 계산',
      '계산 결과를 다시 스택에 push',
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
      result.push({ line: 3, currentChar: token, stack: [...stack], action: 'READ', description: `토큰 "${token}" 읽기` });
      if (!isNaN(token)) {
        stack.push(parseInt(token));
        result.push({ line: 5, currentChar: token, stack: [...stack], action: 'PUSH', description: `${token} 을 스택에 push` });
      } else if (ops[token]) {
        const b = stack.pop();
        const a = stack.pop();
        const val = ops[token](a, b);
        stack.push(val);
        result.push({ line: 9, currentChar: token, stack: [...stack], action: 'CALC', description: `${a} ${token} ${b} = ${val} → push` });
      }
    }
    result.push({ line: 10, currentChar: `${stack[0]}`, stack: [...stack], action: 'DONE ✅', description: `결과: ${stack[0]}` });
    return result;
  },

  renderVisual(step) {
    const stack = step.stack;
    const isCalc = step.action === 'CALC';
    if (stack.length === 0) {
      return `<div style="color:#555;font-size:14px;">스택 비어있음</div>`;
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
  summary: '후위 표기법(RPN)으로 수식을 계산합니다. 스택을 이용해 괄호 없이도 연산 순서를 정확히 처리합니다.',
  complexity: 'O(n)',
  space: 'O(n)',
  keyPoints: [
    '숫자를 만나면 스택에 push',
    '연산자를 만나면 스택에서 두 수를 pop해서 계산',
    '계산 결과를 다시 스택에 push',
  ],
};
