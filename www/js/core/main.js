window.onerror = function(msg, src, line) {
  document.body.insertAdjacentHTML('afterbegin',
    `<div style="background:#dc2626;color:white;padding:10px;font-size:12px;position:fixed;top:0;z-index:9999;width:100%;">
      ERR: ${msg}<br>${src}:${line}
    </div>`
  );
};

var currentDS = 'stack';
var currentAlgoKey = 'brackets';
var inputString = '([])';
var trace = [];
var currentIndex = 0;
var timer = null;
var isPlaying = false;

function resetAndStart() {
  clearInterval(timer);
  isPlaying = false;
  const btn = document.getElementById('play-btn');
  if (btn) btn.innerText = '▶ Play';
  currentIndex = 0;
  trace = getCurrentAlgo().generateTrace(inputString);
  if (currentTab === 'vis') render();
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
  initData();
  renderHome();
  window.addEventListener('resize', fitCodeFontSize);
});
