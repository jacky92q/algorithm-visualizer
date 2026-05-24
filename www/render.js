function fitCodeFontSize() {
  const card = document.querySelector('.code-card');
  const codeView = document.getElementById('code-view');
  const inputEl = document.querySelector('.input-row');
  const lineCount = getCurrentAlgo().sourceCode.length;
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
  const algo = getCurrentAlgo();
  renderCode(step.line);
  renderStack(step.stack);
  document.getElementById('current-char').innerText = step.currentChar;
  document.getElementById('description').innerText = step.description;
  document.getElementById('action').innerText = step.action;
  document.getElementById('input-display').innerHTML = algo.renderInput(inputString, currentIndex, trace);
  if (algo.hasGraph) drawGraph(step.visited || [], step.current);
}

function renderCode(activeLine) {
  const algo = getCurrentAlgo();
  const codeView = document.getElementById('code-view');
  codeView.innerHTML = algo.sourceCode.map((item, index) => {
    const indents = Array(item.indent).fill(`<span class="indent"></span>`).join('');
    return `
      <div class="code-line ${activeLine === index + 1 ? 'active-line' : ''}">
        <div class="line-number">${index + 1}</div>
        ${indents}<span class="code-text">${escapeHtml(item.text)}</span>
      </div>
    `;
  }).join('');
  fitCodeFontSize();
}

function renderStack(stack) {
  const serialized = JSON.stringify(stack);
  if (serialized === lastStack) return;
  lastStack = serialized;
  document.getElementById('stack-view').innerHTML = stack.map(item =>
    `<div class="stack-item">${item}</div>`
  ).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
