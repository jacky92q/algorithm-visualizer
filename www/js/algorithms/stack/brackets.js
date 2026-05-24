const ALGO_BRACKETS = {
  name: 'Valid Parentheses',
  desc: 'Valid Parentheses',
  defaultInput: '([])',
  inputPlaceholder: 'e.g., ([])',
  inputDesc: 'Enter brackets only: ( ) [ ] { }',

  info: {
    summary: 'Algorithm to check if parentheses are correctly matched using a stack.',
    complexity: 'O(n)',
    space: 'O(n)',
    keyPoints: [
      'Push opening brackets to stack',
      'Pop and match closing brackets',
      'Valid if stack is empty at the end',
    ],
  },

  sourceCode: [
    { text: 'def is_valid(s):', indent: 0 },
    { text: 'stack = []', indent: 1 },
    { text: "mapping = {')':'(', ']':'[', '}':'{'}",  indent: 1 },
    { text: 'for ch in s:', indent: 1 },
    { text: 'if ch in "([{":', indent: 2 },
    { text: 'stack.append(ch)', indent: 3 },
    { text: 'else:', indent: 2 },
    { text: 'if not stack:', indent: 3 },
    { text: 'return False', indent: 4 },
    { text: 'stack.pop()', indent: 3 },
    { text: 'return len(stack) == 0', indent: 1 },
  ],

  generateTrace(s) {
    const result = [];
    const stack = [];
    const mapping = { ')': '(', ']': '[', '}': '{' };
    for (const ch of s) {
      result.push({ line: 4, currentChar: ch, stack: [...stack], action: 'READ', description: `Read character "${ch}"` });
      if ('([{'.includes(ch)) {
        stack.push(ch);
        result.push({ line: 6, currentChar: ch, stack: [...stack], action: 'PUSH', description: `Push "${ch}" to stack` });
      } else {
        if (stack.length === 0) {
          result.push({ line: 9, currentChar: ch, stack: [], action: 'INVALID ❌', description: 'Stack is empty! Cannot match.' });
          return result;
        }
        stack.pop();
        result.push({ line: 10, currentChar: ch, stack: [...stack], action: 'POP', description: `Pop "${mapping[ch]}" from stack` });
      }
    }
    const valid = stack.length === 0;
    result.push({ line: 11, currentChar: '', stack: [...stack], action: valid ? 'VALID ✅' : 'INVALID ❌', description: valid ? 'Stack is empty - Valid parentheses!' : 'Remaining brackets in stack - Invalid!' });
    return result;
  },

  renderVisual(step) {
    const stack = step.stack;
    if (stack.length === 0) {
      return `<div style="color:#555;font-size:14px;">Stack is empty</div>`;
    }
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;">
        <div style="font-size:11px;color:#888;margin-bottom:4px;">← TOP</div>
        <div style="display:flex;flex-direction:row-reverse;gap:6px;flex-wrap:wrap;justify-content:center;">
          ${[...stack].reverse().map((item, i) => `
            <div class="visual-block ${i === 0 ? 'highlight' : ''}">${item}</div>
          `).join('')}
        </div>
        <div style="font-size:11px;color:#888;margin-top:4px;">BOTTOM →</div>
      </div>
    `;
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

ALGO_BRACKETS.info = {
  summary: 'Algorithm to check if parentheses are correctly matched using a stack.',
  complexity: 'O(n)',
  space: 'O(n)',
  keyPoints: [
    'Push opening brackets to stack',
    'Pop and match closing brackets',
    'Valid if stack is empty at the end',
  ],
};

ALGO_BRACKETS.renderVisual = function(step) {
  const stack = step.stack || [];
  const isPush = step.action === 'PUSH';
  const isPop = step.action === 'POP';
  const ch = step.currentChar;
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px;color:#555;margin-bottom:6px;">Current Char</div>
          <div style="width:50px;height:50px;background:${isPush?'#1e2d4a':isPop?'#422006':'#13161e'};
            border:2px solid ${isPush?'#3b82f6':isPop?'#f59e0b':'#2a3040'};
            border-radius:12px;display:flex;align-items:center;justify-content:center;
            font-size:22px;font-weight:bold;color:${isPush?'#93c5fd':isPop?'#fbbf24':'#555'};">
            ${ch || '·'}
          </div>
        </div>
        <div style="font-size:24px;color:#333;">${isPush ? '→ push' : isPop ? '← pop' : ''}</div>
        <div style="text-align:center;">
          <div style="font-size:11px;color:#555;margin-bottom:6px;">STACK</div>
          <div style="display:flex;gap:4px;">
            ${stack.length === 0
              ? `<div style="color:#333;font-size:13px;line-height:50px;">Empty</div>`
              : [...stack].reverse().map((item, i) => `
                <div class="v-block ${i === 0 ? 'active' : ''}">${item}</div>
              `).join('')
            }
          </div>
        </div>
      </div>
    </div>
  `;
};
