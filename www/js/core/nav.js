var currentPage = 'home';

function navigateTo(page) {
  const from = document.getElementById('page-' + currentPage);
  const to = document.getElementById('page-' + page);

  from.classList.add('hidden');
  to.classList.remove('hidden');
  to.classList.add('slide-in');

  setTimeout(() => to.classList.remove('slide-in'), 350);
  currentPage = page;
}

function goBack() {
  if (currentPage === 'visual') {
    const from = document.getElementById('page-visual');
    from.classList.add('slide-out');
    setTimeout(() => {
      from.classList.add('hidden');
      from.classList.remove('slide-out');
      document.getElementById('page-home').classList.remove('hidden');
      currentPage = 'home';
    }, 320);
  }
}

// 뒤로가기 버튼 처리 (Android/모바일)
function handleBackButton() {
  console.log('[BackButton] currentPage:', currentPage, 'modalOpen:', document.getElementById('modal-overlay').classList.contains('show'));

  if (document.getElementById('modal-overlay').classList.contains('show')) {
    console.log('[BackButton] 모달 닫기');
    closeModal();
    return;
  }
  if (currentPage === 'visual') {
    console.log('[BackButton] 홈으로 이동');
    goBack();
    return;
  }
  // 홈이면 앱 종료 (Capacitor)
  console.log('[BackButton] 앱 종료');
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.exitApp();
  }
}

// Capacitor 뒤로가기 이벤트 (App 플러그인 사용)
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
  const { App } = window.Capacitor.Plugins;
  App.addListener('backButton', () => {
    handleBackButton();
  });
  console.log('[Capacitor] backButton 리스너 등록됨');
} else {
  console.log('[Capacitor] Capacitor 또는 App 플러그인 없음');
}

// 브라우저 뒤로가기도 처리
window.addEventListener('popstate', handleBackButton);

// 홈 리스트 렌더링
function renderHome() {
  const list = document.getElementById('home-list');
  list.innerHTML = Object.entries(DATA_STRUCTURES).map(([dsKey, ds]) => `
    <div class="ds-section">
      <div class="ds-header">
        <div class="ds-icon ${ds.iconClass}">${ds.icon}</div>
        <div class="ds-info">
          <div class="ds-name">${ds.name}</div>
          <div class="ds-desc">${ds.desc}</div>
        </div>
      </div>
      ${Object.entries(ds.algorithms).map(([algoKey, algo]) => `
        <div class="algo-item" onclick="selectAlgo('${dsKey}', '${algoKey}')">
          <span class="algo-name">${algo.name}</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="algo-tag">${algo.info ? algo.info.complexity : 'O(n)'}</span>
            <span class="algo-arrow">›</span>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function selectAlgo(dsKey, algoKey) {
  currentDS = dsKey;
  currentAlgoKey = algoKey;
  inputString = getCurrentAlgo().defaultInput;

  // 탭 초기화
  switchTab('desc');

  // 제목 업데이트
  document.getElementById('nav-title').innerText = getCurrentAlgo().name;

  // 설명 렌더링
  renderDesc();

  // 시각화 초기화
  resetAndStart();

  // 페이지 전환
  navigateTo('visual');
}

// 탭 전환
var currentTab = 'desc';
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('content-desc').classList.toggle('hidden', tab !== 'desc');
  document.getElementById('content-vis').classList.toggle('hidden', tab !== 'vis');
  document.getElementById('tab-desc').classList.toggle('active', tab === 'desc');
  document.getElementById('tab-vis').classList.toggle('active', tab === 'vis');
  if (tab === 'vis') {
    render();
  }
}

// 설명 카드 렌더링
function renderDesc() {
  const algo = getCurrentAlgo();
  const info = algo.info || {};
  document.getElementById('desc-card').innerHTML = `
    <div class="desc-algo-name">${algo.name}</div>
    <div class="desc-summary">${info.summary || ''}</div>
    <div class="desc-complexity-row">
      <div class="complexity-box">
        <div class="complexity-label">시간복잡도</div>
        <div class="complexity-value">${info.complexity || 'O(n)'}</div>
      </div>
      <div class="complexity-box">
        <div class="complexity-label">공간복잡도</div>
        <div class="complexity-value">${info.space || 'O(n)'}</div>
      </div>
    </div>
    <div>
      <div class="desc-points-title">핵심 포인트</div>
      ${(info.keyPoints || []).map(p => `
        <div class="desc-point">
          <div class="desc-point-dot"></div>
          <div>${p}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// 모달
function openModal() {
  const algo = getCurrentAlgo();
  document.getElementById('modal-input').value = inputString;
  document.getElementById('modal-input').placeholder = algo.inputPlaceholder || '';
  document.getElementById('modal-desc').innerText = algo.inputDesc || '';
  document.getElementById('modal-overlay').classList.add('show');
  document.getElementById('modal-input').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}

function confirmInput() {
  const val = document.getElementById('modal-input').value.trim();
  if (!val) return;
  inputString = val;
  closeModal();
  resetAndStart();
}
