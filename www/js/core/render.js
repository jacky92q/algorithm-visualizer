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

  if (!step) {
    card.innerHTML = `<div style="color:#888;font-size:14px;">No data</div>`;
    return;
  }

  if (algo.renderVisual) {
    try {
      card.innerHTML = algo.renderVisual(step);
    } catch (e) {
      console.error('renderVisual error:', e);
      card.innerHTML = `<div style="color:#f87171;font-size:12px;">Visualization error</div>`;
    }
  } else {
    // Default stack visualization
    const stack = step.stack || [];
    const array = step.array || [];

    if (array.length > 0) {
      // Show array/sorting visualization
      const maxVal = Math.max(...array, 10);
      card.innerHTML = `
        <div style="width:100%;display:flex;align-items:flex-end;justify-content:center;gap:6px;height:120px;background:#0a0c10;border-radius:10px;padding:12px;border:1px solid #1e2330;">
          ${array.map((val, idx) => {
            const height = (val / maxVal) * 100;
            return `
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
                <div style="width:100%;height:${height}%;background:#3b82f6;border-radius:4px;transition:all 0.3s;"></div>
                <div style="font-size:11px;color:#93c5fd;font-weight:bold;">${val}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (stack.length > 0) {
      // Default stack visualization
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
    } else {
      card.innerHTML = `<div style="color:#555;font-size:14px;">Empty</div>`;
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
