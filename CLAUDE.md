# Algorithm Visualizer - 코드 구조 가이드

## 📱 프로젝트 개요

**Algorithm Visualizer**는 자료구조(Stack, Queue, Linked List, Tree)와 알고리즘(DFS, BFS, 정렬 등)을 단계별로 시각화하는 웹/모바일 학습 도구입니다.

- **플랫폼**: Web + Mobile (Capacitor)
- **기술 스택**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **주요 기능**: 알고리즘 단계별 실행, 코드 라인 하이라이팅, 시각화, 사용자 입력 변경

---

## 🏗️ 아키텍처 개요

```
┌─────────────────────────────────────┐
│      index.html (Entry Point)       │
│  - 페이지 레이아웃 (home, visual)     │
│  - 모달, 탭, 제어 버튼               │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────────────────────────┐
        │                                 │
    ┌───▼─────────────────┐   ┌──────────▼─────────────┐
    │  Core Logic         │   │  Algorithm Definitions │
    │  (js/core/*)        │   │  (js/algorithms/*)     │
    │                     │   │                        │
    │ • main.js           │   │ • stack_basic.js       │
    │ • data.js           │   │ • brackets.js          │
    │ • render.js         │   │ • dfs.js               │
    │ • nav.js            │   │ • bfs.js               │
    │                     │   │ • ... 등 10개+        │
    └─────────────────────┘   └────────────────────────┘
```

---

## 📂 디렉토리 구조

```
algorithm-visualizer/
├── package.json                  # Capacitor 설정
├── capacitor.config.json         # 모바일 설정
├── www/                          # 웹 애플리케이션
│   ├── index.html               # 메인 HTML (유일한 페이지)
│   ├── css/
│   │   └── main.css             # 모든 스타일
│   └── js/
│       ├── core/                # 핵심 로직
│       │   ├── main.js          # 전역 상태, 재생 제어
│       │   ├── data.js          # 알고리즘 카탈로그
│       │   ├── render.js        # 렌더링 함수
│       │   └── nav.js           # 페이지/탭 네비게이션
│       └── algorithms/          # 알고리즘 구현
│           ├── stack/           # 스택 (5개)
│           │   ├── stack_basic.js
│           │   ├── brackets.js  # 괄호 검사
│           │   ├── dfs.js       # 깊이 우선 탐색
│           │   ├── rpn.js       # 역폴란드 표기법
│           │   └── palindrome.js
│           ├── queue/           # 큐 (3개)
│           │   ├── queue_basic.js
│           │   ├── bfs.js       # 너비 우선 탐색
│           │   └── bfs_maze.js  # 미로 찾기
│           ├── linkedlist/      # 연결 리스트 (1개)
│           │   └── linked_list.js
│           └── tree/            # 트리 (1개)
│               └── binary_tree.js
└── .github/                     # GitHub 설정
```

---

## 🔄 전역 상태 (main.js)

앱은 다음 전역 변수들로 상태를 관리합니다:

```javascript
// 선택된 알고리즘
currentDS = 'stack'           // 현재 자료구조 (stack/queue/linkedlist/tree)
currentAlgoKey = 'brackets'   // 현재 알고리즘 (brackets/dfs/bfs 등)

// 재생 상태
trace = []                    // 현재 알고리즘의 모든 실행 단계
currentIndex = 0              // 현재 보고 있는 단계 인덱스
isPlaying = false             // 자동 재생 여부
timer = null                  // setInterval ID

// 사용자 입력
inputString = '([])'          // 알고리즘 입력값
```

---

## 🎯 핵심 개념: 알고리즘 정의 구조

모든 알고리즘은 다음과 같은 구조의 객체로 정의됩니다:

```javascript
const ALGO_BRACKETS = {
  // 1. 메타데이터
  name: '괄호 검사',
  desc: 'Valid Parentheses',
  defaultInput: '([])',
  inputPlaceholder: '예: ([])',
  inputDesc: '괄호만 입력해주세요',
  
  // 2. 정보 (설명 탭에 표시)
  info: {
    summary: '스택을 이용해 괄호가 올바르게 짝지어졌는지 확인...',
    complexity: 'O(n)',
    space: 'O(n)',
    keyPoints: [
      '여는 괄호는 스택에 push',
      '닫는 괄호는 스택에서 pop해서 매칭 확인',
      '마지막에 스택이 비어있으면 Valid',
    ],
  },
  
  // 3. 소스 코드 (시각화 탭에 표시, 줄 번호 매핑용)
  sourceCode: [
    { text: 'def is_valid(s):', indent: 0 },
    { text: 'stack = []', indent: 1 },
    // ... 매 항목마다 {text, indent}
  ],
  
  // 4. 핵심 메서드: 단계별 실행 기록 생성
  generateTrace(inputString) {
    const result = [];
    const stack = [];
    
    for (const ch of inputString) {
      // 각 단계에 대한 스냅샷 생성
      result.push({
        line: 4,                    // 현재 실행 코드 라인
        currentChar: ch,            // 현재 처리 중인 문자
        stack: [...stack],          // 현재 스택 상태 (snapshot)
        action: 'PUSH',             // 액션 (PUSH/POP/VISIT 등)
        description: `"${ch}" 를 스택에 push`  // 설명
      });
    }
    
    return result;  // 전체 단계 배열
  },
  
  // 5. (선택) 커스텀 시각화 렌더러
  renderVisual(step) {
    const stack = step.stack;
    return `<div>스택 내용: ${stack.join(',')}</div>`;
  },
  
  // 6. (선택) 커스텀 입력 렌더러
  renderInput(inputString) {
    return `<span>${inputString}</span>`;
  }
};
```

---

## 🔁 실행 흐름

### 1️⃣ 앱 시작 (index.html 로드)

```javascript
// main.js
document.addEventListener('DOMContentLoaded', () => {
  initData();        // data.js: 알고리즘 카탈로그 초기화
  renderHome();      // nav.js: 홈 페이지 렌더링
  window.addEventListener('resize', fitCodeFontSize);
});
```

### 2️⃣ 알고리즘 선택 (nav.js: selectAlgo)

사용자가 홈에서 알고리즘 클릭:
```javascript
function selectAlgo(dsKey, algoKey) {
  currentDS = dsKey;                         // 자료구조 변경
  currentAlgoKey = algoKey;                  // 알고리즘 변경
  inputString = getCurrentAlgo().defaultInput;  // 기본 입력값
  
  switchTab('desc');                         // 설명 탭으로
  renderDesc();                              // 설명 카드 렌더링
  resetAndStart();                           // 시각화 초기화
  navigateTo('visual');                      // visual 페이지로 이동
}
```

### 3️⃣ 단계 생성 (main.js: resetAndStart)

```javascript
function resetAndStart() {
  currentIndex = 0;
  // 🔑 핵심: 알고리즘의 generateTrace() 호출
  trace = getCurrentAlgo().generateTrace(inputString);
  render();  // 첫 번째 단계 렌더링
}
```

### 4️⃣ 단계 렌더링 (render.js: render)

```javascript
function render() {
  const step = trace[currentIndex];  // 현재 단계 가져오기
  const algo = getCurrentAlgo();
  
  renderCode(step.line);                    // 코드 라인 하이라이팅
  renderVisual(step);                       // 시각화 렌더링
  
  // 상태 정보 업데이트
  document.getElementById('current-char').innerText = step.currentChar || '';
  document.getElementById('description').innerText = step.description || '';
  document.getElementById('action').innerText = step.action || '';
  
  // 입력값 커스텀 렌더링
  if (algo.renderInput) {
    document.getElementById('input-display').innerHTML = 
      algo.renderInput(inputString, currentIndex, trace);
  }
}
```

### 5️⃣ 단계 제어 (main.js: nextStep, prevStep, togglePlay)

```javascript
function nextStep() {
  if (currentIndex < trace.length - 1) {
    currentIndex++;
    render();  // 다음 단계 렌더링
  }
}

function togglePlay() {
  // setInterval로 자동 진행 (1.2초마다 nextStep)
  // ▶ ⏸ 토글
}
```

---

## 🎨 렌더링 시스템

### Code Rendering (render.js: renderCode)
- `sourceCode` 배열을 HTML로 변환
- 현재 `step.line`에 해당하는 라인만 `active-line` 클래스 추가
- 들여쓰기 표현

### Visual Rendering (render.js: renderVisual)
1. 알고리즘에 `renderVisual()` 메서드가 있으면 호출
2. 없으면 기본 스택 시각화:
```javascript
<div class="v-stack">
  <div class="v-label">TOP</div>
  <div class="v-stack-row">
    ${stack.reverse().map(item => `<div class="v-block">${item}</div>`)}
  </div>
  <div class="v-label">BOTTOM</div>
</div>
```

---

## 📋 데이터 흐름

```
selectAlgo()
    ↓
[currentDS, currentAlgoKey 설정]
    ↓
resetAndStart()
    ↓
[trace = generateTrace(inputString)]
    ↓
[currentIndex = 0]
    ↓
render()
    ↓
[step = trace[currentIndex]]
    ↓
renderCode() + renderVisual()
    ↓
[DOM 업데이트]
    ↓
nextStep() / prevStep() / togglePlay()
    ↓
[currentIndex 변경]
    ↓
render() 다시 호출
```

---

## 🧠 주요 함수 정리

### main.js (전역 제어)
| 함수 | 역할 |
|------|------|
| `resetAndStart()` | 인덱스 0으로 리셋, trace 생성 |
| `nextStep()` | 다음 단계로 이동 후 렌더링 |
| `prevStep()` | 이전 단계로 이동 후 렌더링 |
| `togglePlay()` | 자동 재생 on/off |

### data.js (카탈로그)
| 함수 | 역할 |
|------|------|
| `initData()` | `DATA_STRUCTURES` 객체 생성 |
| `getCurrentAlgo()` | 현재 선택된 알고리즘 객체 반환 |

### render.js (렌더링)
| 함수 | 역할 |
|------|------|
| `render()` | 현재 단계의 모든 UI 업데이트 |
| `renderCode(line)` | 코드 라인 하이라이팅 |
| `renderVisual(step)` | 자료구조 시각화 |
| `fitCodeFontSize()` | 코드 글자 크기 자동 조정 |

### nav.js (네비게이션)
| 함수 | 역할 |
|------|------|
| `navigateTo(page)` | 페이지 전환 (home ↔ visual) |
| `goBack()` | visual에서 home으로 돌아가기 |
| `switchTab(tab)` | desc ↔ vis 탭 전환 |
| `selectAlgo(dsKey, algoKey)` | 알고리즘 선택 → visual로 이동 |
| `renderHome()` | 홈 페이지 렌더링 |
| `renderDesc()` | 알고리즘 설명 렌더링 |
| `openModal()` / `closeModal()` | 입력값 변경 모달 |
| `confirmInput()` | 입력값 확정 → trace 재생성 |

---

## 🔧 알고리즘 추가 방법

새로운 알고리즘을 추가하려면:

### 1. 파일 생성
```javascript
// www/js/algorithms/category/new_algo.js

const ALGO_NEW_ALGO = {
  name: '알고리즘 이름',
  desc: 'English Description',
  defaultInput: 'default-value',
  inputPlaceholder: '입력 예시',
  inputDesc: '입력 설명',
  
  info: {
    summary: '알고리즘 요약',
    complexity: 'O(n)',
    space: 'O(1)',
    keyPoints: ['포인트1', '포인트2', '포인트3'],
  },
  
  sourceCode: [
    { text: 'function algo(input):', indent: 0 },
    { text: 'return result', indent: 1 },
  ],
  
  generateTrace(input) {
    const result = [];
    // input을 처리하면서 각 단계를 result에 push
    result.push({
      line: 1,
      currentChar: 'x',
      stack: [],
      action: 'INIT',
      description: '초기화',
    });
    return result;
  },
};
```

### 2. HTML에 script 추가
```html
<script src="js/algorithms/category/new_algo.js"></script>
```

### 3. data.js에 등록
```javascript
function initData() {
  DATA_STRUCTURES = {
    // ...
    category: {
      // ...
      algorithms: {
        new_algo: ALGO_NEW_ALGO,  // 추가
      }
    }
  };
}
```

---

## 🐛 주의사항

### 1. Trace 생성 시
- 각 단계의 상태는 **snapshot** (독립적인 사본)이어야 함
- `[...array]` 또는 `new Set()` 사용해서 복사
- 참조 유지하면 모든 단계가 같은 상태를 가지게 됨

### 2. 렌더링
- `render()`는 `trace[currentIndex]`를 기반으로 호출됨
- 매번 호출될 때마다 전체 DOM을 다시 그림 (성능 최적화 여지 있음)

### 3. 전역 변수
- `currentIndex`, `trace` 등이 전역이므로 동시성 이슈는 없음
- 하지만 리팩토링 시 전역 상태를 객체화하면 좋을 것 같음

### 4. 입력값 검증
- `confirmInput()`에서 빈 값 체크만 함
- 유효성 검사는 `generateTrace()` 내에서 처리

---

## 📱 모바일 (Capacitor) 관련

- **capacitor.config.json**: 앱 이름, 디스플레이 설정 등
- **nav.js의 handleBackButton**: Android 뒤로가기 버튼 처리
- 대부분의 로직은 웹 표준 API만 사용 (호환성 좋음)

---

## 🎓 학습 흐름

사용자 입장:
1. 홈에서 자료구조/알고리즘 선택
2. **설명 탭**: 개념, 시간복잡도, 핵심 포인트 학습
3. **시각화 탭**: 
   - 코드 라인을 따라가며 알고리즘 동작 이해
   - ▶ Play로 전체 흐름 보기
   - ‹ › 버튼으로 단계별 탐색
   - ✏️ 로 입력값 변경해서 다양한 경우 학습

---

## 🚀 개선 아이디어

- [ ] 렌더링 최적화: 변경된 부분만 업데이트
- [ ] 전역 상태 객체화: 코드 모듈화
- [ ] 입력값 검증 강화
- [ ] 복잡한 알고리즘을 위한 더 상세한 시각화
- [ ] 모바일 터치 제스처 (스와이프로 단계 이동)
- [ ] PWA 지원
- [ ] 다국어 지원

---

**작성일**: 2026-05-24  
**최후 수정**: 지원 중  
**브랜치**: `claude/code-structure-review-oeteg`
