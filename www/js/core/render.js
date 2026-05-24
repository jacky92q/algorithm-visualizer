function fitCodeFontSize() {
  const card = document.querySelector('.code-card');
  if (!card) return;
  const codeView = document.getElementById('code-view');
  const inputRow = document.querySelector('.code-input-row');
  const lineCount = getCurrentAlgo().sourceCode.length;
  const availHeight = card.clientHeight - (inputRow ? inputRow.clientHeight : 0) - 20;
  let fontSize = 13;
  while (fontSize > 7) {
    if ((fontSize + 6) * lineCount <= availHeight) break;
    fontSize--;
  }
  codeView.style.fontSize = fontSize + 'px';
}

function render() {
  const step = trace[currentIndex];
  const algo = getCurrentAlgo();
  renderCode(step.line);
  renderVisual(step);
  document.getElementById('current-char').innerText = step.currentChar || '';
  document.getElementById('description').innerText = step.description || '';
  document.getElementById('action').innerText = step.action || '';
  if (algo.renderInput) {
    document.getElementById('input-display').innerHTML = algo.renderInput(inputString, currentIndex, trace);
  }
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

function renderVisual(step) {
  const algo = getCurrentAlgo();
  const card = document.getElementById('visual-card');
  if (algo.renderVisual) {
    card.innerHTML = algo.renderVisual(step);
  } else {
    // 기본 스택 시각화
    const stack = step.stack || [];
    if (stack.length === 0) {
      card.innerHTML = `<div style="color:#333;font-size:14px;">비어있음</div>`;
      return;
    }
    card.innerHTML = `
      <div class="v-stack">
        <div class="v-label">TOP</div>
        <div class="v-stack-row">
          ${[...stack].reverse().map((item, i) => `
            <div class="v-block ${i === 0 ? 'active' : ''}">${item}</div>
          `).join('')}
        </div>
        <div class="v-label">BOTTOM</div>
      </div>
    `;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
