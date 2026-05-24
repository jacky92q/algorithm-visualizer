const ALGO_STACK_BASIC = {
  name: 'Stack 기본',
  desc: 'Push & Pop',
  defaultInput: '1,2,3,4,5',
  inputPlaceholder: '예: 1,2,3,4,5',
  inputDesc: '숫자를 쉼표로 구분해서 입력하세요',
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
  renderInput(s) {
    return `push/pop([<span style="color:#ffdd57;">${s}</span>])`;
  }
};
