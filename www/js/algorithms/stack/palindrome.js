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

ALGO_PALINDROME.info = {
  summary: '스택을 이용해 문자열이 앞뒤로 동일한지(팰린드롬) 확인합니다.',
  complexity: 'O(n)',
  space: 'O(n)',
  keyPoints: [
    '모든 문자를 스택에 push',
    '스택에서 pop하면 역순으로 나옴',
    '원본과 역순이 같으면 팰린드롬',
  ],
};

ALGO_PALINDROME.renderVisual = function(step) {
  const stack = step.stack || [];
  const isPush = step.action === 'PUSH';
  const isPop = step.action === 'POP';
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;">
      ${stack.length === 0
        ? `<div style="color:#333;font-size:14px;">스택 비어있음</div>`
        : `
          <div style="font-size:11px;color:#888;">TOP ↓</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">
            ${[...stack].reverse().map((ch, i) => `
              <div class="v-block ${i === 0 && (isPush || isPop) ? 'highlight' : ''}">${ch}</div>
            `).join('')}
          </div>
          <div style="font-size:11px;color:#888;">BOTTOM</div>
        `
      }
      ${step.action === 'POP' ? `
        <div style="font-size:13px;color:#a78bfa;">역순: "${step.description.split('"')[1] || ''}"</div>
      ` : ''}
    </div>
  `;
};
