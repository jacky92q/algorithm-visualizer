const ALGO_PALINDROME = {
  name: '팰린드롬 판별',
  desc: 'Palindrome Check',
  defaultInput: 'racecar',
  inputPlaceholder: '예: racecar',
  inputDesc: '영어 단어를 입력하세요',
  sourceCode: [
    { text: 'def is_palindrome(s):',      indent: 0 },
    { text: 'stack = []',                 indent: 1 },
    { text: 'for ch in s:',              indent: 1 },
    { text: 'stack.append(ch)',          indent: 2 },
    { text: 'reversed_s = ""',           indent: 1 },
    { text: 'while stack:',              indent: 1 },
    { text: 'reversed_s += stack.pop()', indent: 2 },
    { text: 'return s == reversed_s',    indent: 1 },
  ],
  generateTrace(s) {
    const result = [];
    const stack = [];

    for (const ch of s) {
      result.push({ line: 3, currentChar: ch, stack: [...stack], action: 'READ', description: `문자 "${ch}" 읽기` });
      stack.push(ch);
      result.push({ line: 4, currentChar: ch, stack: [...stack], action: 'PUSH', description: `"${ch}" 스택에 push` });
    }

    let reversed = '';
    while (stack.length > 0) {
      const ch = stack.pop();
      reversed += ch;
      result.push({ line: 7, currentChar: ch, stack: [...stack], action: 'POP', description: `"${ch}" pop → reversed: "${reversed}"` });
    }

    const isPalin = s === reversed;
    result.push({ line: 8, currentChar: reversed, stack: [], action: isPalin ? 'VALID ✅' : 'INVALID ❌', description: isPalin ? `"${s}" == "${reversed}" → 팰린드롬!` : `"${s}" != "${reversed}" → 팰린드롬 아님` });
    return result;
  },
  renderInput(s) {
    return `is_palindrome(<span style="color:#ffdd57;">"${s}"</span>)`;
  }
};
