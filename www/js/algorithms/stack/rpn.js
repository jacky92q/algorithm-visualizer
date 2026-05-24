const ALGO_RPN = {
  name: '역폴리시 계산기',
  desc: 'RPN Calculator',
  defaultInput: '2,3,+,4,*',
  inputPlaceholder: '예: 2,3,+,4,*',
  inputDesc: '숫자와 연산자(+ - * /)를 쉼표로 구분',
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
        result.push({ line: 9, currentChar: token, stack: [...stack], action: 'CALC', description: `${a} ${token} ${b} = ${val}, 스택에 push` });
      }
    }
    result.push({ line: 10, currentChar: `${stack[0]}`, stack: [...stack], action: 'DONE ✅', description: `결과: ${stack[0]}` });
    return result;
  },
  renderInput(s) {
    return `rpn([<span style="color:#ffdd57;">${s}</span>])`;
  }
};
