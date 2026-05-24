const ALGO_BRACKETS = {
  name: '괄호 검사',
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
};
