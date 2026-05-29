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
var playbackSpeed = 1.0;
var favorites = JSON.parse(localStorage.getItem('algo-favorites') || '[]');

function resetAndStart() {
  clearInterval(timer);
  isPlaying = false;
  const btn = document.getElementById('play-btn');
  if (btn) btn.innerText = '▶ Play';
  currentIndex = 0;
  trace = getCurrentAlgo().generateTrace(inputString);
  if (currentTab === 'vis') render();
}

function resetToFirst() {
  clearInterval(timer);
  isPlaying = false;
  const btn = document.getElementById('play-btn');
  if (btn) btn.innerText = '▶ Play';
  currentIndex = 0;
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
    const interval = Math.max(300, 1200 / playbackSpeed);
    timer = setInterval(() => {
      if (currentIndex >= trace.length - 1) {
        clearInterval(timer);
        isPlaying = false;
        btn.innerText = '▶ Play';
        return;
      }
      nextStep();
    }, interval);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initData();
  renderHome();
  window.addEventListener('resize', fitCodeFontSize);
  setupKeyboardShortcuts();
});

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 모달이 열려있으면 무시
    if (document.getElementById('modal-overlay').classList.contains('show')) return;

    // 시각화 탭에서만 작동
    if (currentTab !== 'vis') return;

    switch(e.key) {
      case ' ':  // SpaceBar: Play/Pause
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':  // Right arrow: Next step
        e.preventDefault();
        nextStep();
        break;
      case 'ArrowLeft':  // Left arrow: Previous step
        e.preventDefault();
        prevStep();
        break;
      case 'r':  // 'r' key: Reset
      case 'R':
        e.preventDefault();
        resetToFirst();
        break;
      case 'e':  // 'e' key: Edit input
      case 'E':
        e.preventDefault();
        openModal();
        break;
    }
  });
}

function toggleFavorite(ds, algoKey) {
  const key = `${ds}:${algoKey}`;
  const idx = favorites.indexOf(key);
  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.push(key);
  }
  localStorage.setItem('algo-favorites', JSON.stringify(favorites));
  renderHome();
}

function isFavorite(ds, algoKey) {
  return favorites.includes(`${ds}:${algoKey}`);
}
