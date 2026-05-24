window.onerror = function(msg, src, line) {
  document.body.insertAdjacentHTML('afterbegin',
    `<div style="background:red;color:white;padding:10px;font-size:12px;position:fixed;top:0;z-index:9999;">
      ERROR: ${msg}<br>${src}:${line}
    </div>`
  );
};

// 전역 상태
let currentDS = 'stack';
let currentAlgoKey = 'brackets';
let inputString = ALGO_BRACKETS.defaultInput;
let trace = [];
let currentIndex = 0;
let timer = null;
let isPlaying = false;
let lastStack = null;

function resetAndStart() {
  clearInterval(timer);
  isPlaying = false;
  document.getElementById('play-btn').innerText = '▶ Play';
  lastStack = null;
  currentIndex = 0;
  trace = getCurrentAlgo().generateTrace(inputString);
  render();
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

document.addEventListener('DOMContentLoaded', () => {
  updateGraphVisibility();
  trace = getCurrentAlgo().generateTrace(inputString);
  render();
  window.addEventListener('resize', fitCodeFontSize);
});
