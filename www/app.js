const inputString = '([])'

const sourceCode = [
  { text: 'def is_valid(s):',              indent: 0 },
  { text: 'stack = []',                    indent: 1 },
  { text: "mapping = {')':'(', ']':'[', '}':'{'}",  indent: 1 },
  { text: 'for ch in s:',                  indent: 1 },
  { text: 'if ch in "([{":',               indent: 2 },
  { text: 'stack.append(ch)',              indent: 3 },
  { text: 'else:',                         indent: 2 },
  { text: 'if not stack:',                 indent: 3 },
  { text: 'return False',                  indent: 4 },
  { text: 'stack.pop()',                   indent: 3 },
  { text: 'return len(stack) == 0',        indent: 1 },
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

function fitCodeFontSize() {
  const card = document.querySelector('.code-card');
  const codeView = document.getElementById('code-view');
  const inputEl = document.querySelector('.input-display');
  const lineCount = sourceCode.length;
  const availHeight = card.clientHeight - inputEl.clientHeight - 20;

  let fontSize = 14;
  while (fontSize > 7) {
    const lineHeight = fontSize + 8;
    if (lineHeight * lineCount <= availHeight) break;
    fontSize--;
  }
  codeView.style.fontSize = fontSize + 'px';
}

function render() {
  const step = trace[currentIndex];
  renderCode(step.line);
  renderStack(step.stack);
  document.getElementById('current-char').innerText = `Current: ${step.currentChar}`;
  document.getElementById('description').innerText = step.description;
  document.getElementById('action').innerText = step.action;
}

function renderInputDisplay(activeLine) {
  // 현재 라인이 4번(for loop)이면 현재 문자 하이라이트
  const step = trace[currentIndex];
  const chars = inputString.split('');
  const charIndex = trace.slice(0, currentIndex + 1)
    .filter(t => t.action === 'READ').length - 1;

  const highlighted = chars.map((ch, i) => {
    if (i === charIndex && step.action === 'READ') {
      return `<span style="color:#ffdd57;font-weight:bold;">${ch}</span>`;
    }
    if (i < charIndex) {
      return `<span style="color:#555;">${ch}</span>`;
    }
    return `<span>${ch}</span>`;
  }).join('');

  document.getElementById('input-display').innerHTML =
    `is_valid("<span>${highlighted}</span>")`;
}

function renderCode(activeLine) {
  const codeView = document.getElementById('code-view');
  codeView.innerHTML = sourceCode.map((item, index) => {
    const indents = Array(item.indent).fill(
      `<span class="indent"></span>`
    ).join('');
    return `
      <div class="code-line ${activeLine === index + 1 ? 'active-line' : ''}">
        <div class="line-number">${index + 1}</div>
        ${indents}<span class="code-text">${escapeHtml(item.text)}</span>
      </div>
    `;
  }).join('');
  renderInputDisplay(activeLine);
  fitCodeFontSize();
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
  window.addEventListener('resize', fitCodeFontSize);
});