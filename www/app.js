const sourceCode = [
  'def is_valid(s):',
  '    stack = []',
  "    mapping = {')': '(', ']': '[', '}': '{'}",
  '    for ch in s:',
  '        if ch in "([{":',
  '            stack.append(ch)',
  '        else:',
  '            if not stack:',
  '                return False',
  '            stack.pop()',
  '    return len(stack) == 0',
];

const trace = [
  { line: 4,  currentChar: '(', stack: [],          action: 'READ', description: 'Read character (' },
  { line: 6,  currentChar: '(', stack: ['('],        action: 'PUSH', description: 'Push ( into stack' },
  { line: 4,  currentChar: '[', stack: ['('],        action: 'READ', description: 'Read character [' },
  { line: 6,  currentChar: '[', stack: ['(', '['],   action: 'PUSH', description: 'Push [ into stack' },
  { line: 4,  currentChar: ']', stack: ['(', '['],   action: 'READ', description: 'Read character ]' },
  { line: 10, currentChar: ']', stack: ['('],        action: 'POP',  description: 'Pop [ from stack' },
  { line: 4,  currentChar: ')', stack: ['('],        action: 'READ', description: 'Read character )' },
  { line: 10, currentChar: ')', stack: [],           action: 'POP',  description: 'Pop ( from stack' },
  { line: 11, currentChar: '',  stack: [],           action: 'DONE', description: 'Valid!' },
];

let currentIndex = 0;
let timer = null;
let isPlaying = false;
let lastStack = null;

function render() {
  const step = trace[currentIndex];
  renderCode(step.line);
  renderStack(step.stack);
  document.getElementById('current-char').innerHTML = `Current Character: ${step.currentChar}`;
  document.getElementById('description').innerText = step.description;
  document.getElementById('action').innerText = step.action;
}

function renderCode(activeLine) {
  const codeView = document.getElementById('code-view');
  codeView.innerHTML = sourceCode.map((line, index) => `
    <div class="code-line ${activeLine === index + 1 ? 'active-line' : ''}">
      <div class="line-number">${index + 1}</div>
      <div>${escapeHtml(line)}</div>
    </div>
  `).join('');
}

function renderStack(stack) {
  const serialized = JSON.stringify(stack);
  if (serialized === lastStack) return;
  lastStack = serialized;

  const stackView = document.getElementById('stack-view');
  stackView.innerHTML = stack.map(item =>
    `<div class="stack-item">${item}</div>`
  ).join('');
}

function nextStep() {
  if (currentIndex < trace.length - 1) {
    currentIndex++;
    render();
  }
}

function prevStep() {
  if (currentIndex > 0) {
    currentIndex--;
    render();
  }
}

function togglePlay() {
  const btn = document.getElementById('play-btn');

  if (isPlaying) {
    clearInterval(timer);
    isPlaying = false;
    btn.innerText = '▶ Play';
  } else {
    if (currentIndex >= trace.length - 1) {
      currentIndex = 0;
      render();
    }

    isPlaying = true;
    btn.innerText = '⏸ Pause';

    timer = setInterval(() => {
      if (currentIndex >= trace.length - 1) {
        clearInterval(timer);
        isPlaying = false;
        btn.innerText = '▶ Play';
        return;
      }
      nextStep();
    }, 1200);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  render();
});