const ALGO_PALINDROME = {
  name: 'Palindrome Check',
  desc: 'Palindrome Check',
  defaultInput: 'racecar',
  inputPlaceholder: 'e.g., racecar',
  inputDesc: 'Enter an English word',
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
      result.push({ line: 3, currentChar: ch, stack: [...stack], action: 'READ', description: `Read character "${ch}"` });
      stack.push(ch);
      result.push({ line: 4, currentChar: ch, stack: [...stack], action: 'PUSH', description: `Push "${ch}" to stack` });
    }

    let reversed = '';
    while (stack.length > 0) {
      const ch = stack.pop();
      reversed += ch;
      result.push({ line: 7, currentChar: ch, stack: [...stack], action: 'POP', description: `Pop "${ch}" → reversed: "${reversed}"` });
    }

    const isPalin = s === reversed;
    result.push({ line: 8, currentChar: reversed, stack: [], action: isPalin ? 'VALID ✅' : 'INVALID ❌', description: isPalin ? `"${s}" == "${reversed}" → Palindrome!` : `"${s}" != "${reversed}" → Not a palindrome` });
    return result;
  },
  renderInput(s) {
    return `is_palindrome(<span style="color:#ffdd57;">"${s}"</span>)`;
  }
};

ALGO_PALINDROME.info = {
  summary: 'Use a stack to check if a string reads the same forwards and backwards (palindrome).',
  complexity: 'O(n)',
  space: 'O(n)',
  keyPoints: [
    'Push all characters to stack',
    'Popping from stack gives characters in reverse order',
    'If original equals reversed, it is a palindrome',
  ],
};

ALGO_PALINDROME.renderVisual = function(step) {
  const stack = step.stack || [];
  const isPush = step.action === 'PUSH';
  const isPop = step.action === 'POP';
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;">
      ${stack.length === 0
        ? `<div style="color:#333;font-size:14px;">Stack is empty</div>`
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
        <div style="font-size:13px;color:#a78bfa;">Reversed: "${step.description.split('"')[1] || ''}"</div>
      ` : ''}
    </div>
  `;
};
