# Algorithm Visualizer — 코드 구조 가이드

## 📱 프로젝트 개요

**Algorithm Visualizer**는 알고리즘/자료구조를 캔버스 애니메이션과 코드 하이라이트로
단계별 시각화하는 웹앱입니다. 쇼츠(세로 영상) 제작에 맞춘 9:16 스테이지가 핵심입니다.

- **기술 스택**: React 18 + TypeScript + Vite + HTML5 Canvas + Framer Motion
- **배포**: GitHub Pages (`jacky92q.github.io/algorithm-visualizer`)
- **디자인 톤**: 크림 베이스 · 브라운 · 청록(teal) 포인트

---

## 🏗️ 아키텍처

```
index.html → src/main.tsx (HashRouter)
                  │
              src/App.tsx ── Routes
                  │
   ┌──────────────┼───────────────────────────┐
   /              /algo/:id                    /algo/:id/run
HomePage      DescriptionPage               VisualizePage
(카탈로그)     (개념·복잡도 설명)            (쇼츠 시각화 스테이지)
```

- **HashRouter** 사용 → GitHub Pages 의 새로고침 404 문제 회피.
- 세 페이지는 완전히 분리. 탭이 아니라 별도 화면으로 전환된다.

---

## 📂 디렉토리 구조

```
algorithm-visualizer/
├── index.html
├── vite.config.ts            # base: '/algorithm-visualizer/'
├── tsconfig*.json
├── public/favicon.svg
├── .github/workflows/deploy.yml   # main push → GitHub Pages
└── src/
    ├── main.tsx               # 진입점 (HashRouter)
    ├── App.tsx                # 라우트 정의 + 페이지 전환 애니메이션
    ├── index.css              # 전체 디자인 시스템 (CSS 변수 토큰)
    ├── core/
    │   ├── types.ts           # Algorithm / BaseStep / Renderer / RenderCtx
    │   ├── palette.ts         # 색 팔레트 + hex 유틸 (mix/rgba)
    │   ├── draw.ts            # 캔버스 저수준 헬퍼 (roundRect, text, circle…)
    │   └── easing.ts          # 이징 함수 (cubic, back, elastic, lerp)
    ├── hooks/
    │   └── usePlayer.ts       # 재생 상태머신 (index/play/speed/seek)
    ├── components/
    │   ├── CanvasStage.tsx    # 캔버스 + RAF 루프 + step 간 tween
    │   └── CodePanel.tsx      # 소스코드 + 활성 라인 글로우
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── DescriptionPage.tsx
    │   └── VisualizePage.tsx  # 쇼츠 스테이지 (가장 중요)
    └── algorithms/
        ├── index.ts           # ALGORITHMS 레지스트리 + CATEGORIES
        ├── sorting/           # shared.ts(SortBarsRenderer) + 5종
        ├── searching/binarySearch.ts
        ├── pathfinding/       # shared.ts(GridRenderer) + bfsMaze, dijkstra
        ├── stack/parentheses.ts
        └── tree/bst.ts
```

---

## 🎯 핵심 개념: Algorithm 인터페이스

모든 알고리즘은 `core/types.ts` 의 `Algorithm<S>` 를 구현한다.

```ts
interface Algorithm<S extends BaseStep> {
  meta: AlgorithmMeta;          // 이름/복잡도/설명/기본입력/accent 색 등
  sourceCode: CodeLine[];       // 코드 패널에 표시 + step.line 으로 하이라이트
  generate(input: string): S[]; // 입력 → 전체 step 트레이스 생성
  createRenderer(): Renderer<S>;// 캔버스 렌더러 인스턴스
}
```

### Step (프레임)

```ts
interface BaseStep {
  line: number;     // 현재 실행 중인 sourceCode 인덱스 (0-based)
  caption: string;  // 스테이지 하단 설명
  action?: string;  // 배지 라벨 (PUSH/SWAP/VISIT…)
  tone?: 'neutral'|'compare'|'active'|'good'|'bad'; // 배지/강조 색
}
```

각 알고리즘은 BaseStep 을 확장해 자기 상태(예: `slots`, `stack`, `status`, `nodes`)를
담는다. **모든 step 은 독립적인 스냅샷**이어야 한다 (`[...arr]`, `{...obj}` 로 복사).

### Renderer

```ts
interface Renderer<S> {
  draw(rc: RenderCtx, prev: S | null, curr: S): void;
}
```

- `rc.t` : 이전→현재 step 사이 tween 진행도(0..1). 막대 이동·노드 등장 등 보간에 사용.
- `rc.time` : 누적 시간(초). 글로우 펄스 등 무한 루프 애니메이션에 사용.
- `prev`, `curr` 를 비교해 등장/이동/제거를 애니메이션한다 (id 기반 보간 패턴).

---

## 🔁 실행 흐름 (VisualizePage)

```
generate(input)  →  steps[]            (useMemo)
       │
usePlayer(steps.length) → { index, isPlaying, next/prev/toggle/seek, speed }
       │
CanvasStage(steps, index)
   └ RAF 루프: t = (now - stepStart)/transitionMs
       renderer.draw(rc, steps[index-1], steps[index])
```

- 재생 시 `usePlayer` 가 speed 에 따른 간격으로 `index++`.
- `index` 변경 → CanvasStage 가 tween(t) 0→1 재생 → 부드러운 전환.

---

## 🎨 렌더러 패턴 (id 기반 보간)

부드러운 이동 애니메이션의 핵심은 **안정적인 id**다.

- **정렬**(`sorting/shared.ts`): 각 막대는 고정 `id`(원래 인덱스)와 `value`. step 은
  `slots`(슬롯 순서대로의 id 배열)만 바꾼다. 렌더러는 같은 id 의 prev/curr 슬롯 x좌표를
  보간해 막대가 미끄러지듯 swap 된다.
- **스택**(`stack/parentheses.ts`): 블록마다 id. prev 에 없던 블록은 떨어지며 등장,
  pop 된 블록은 위로 날아가며 사라진다.
- **트리**(`tree/bst.ts`): 노드 id 별로 prev/curr 레이아웃을 계산해 위치 보간. 새 노드는
  스케일 인.
- **격자**(`pathfinding/shared.ts`): 셀 status 코드(visited/frontier/path/current)로 색·글로우,
  방금 바뀐 셀은 pop 애니메이션.

---

## 🎨 디자인 토큰 (index.css)

`:root` 의 CSS 변수로 색을 관리하고, `.accent-{teal|brown|amber|coral|rose|plum}`
클래스로 알고리즘별 포인트 컬러(`--accent`)를 주입한다. `meta.accent` 가 이 클래스와 연결.

---

## 🔧 새 알고리즘 추가

1. `src/algorithms/<category>/<name>.ts` 작성:
   - `meta`(id/category/name/복잡도/summary/keyPoints/steps/defaultInput/accent/glyph)
   - `sourceCode`: `{text, indent}[]`
   - `generate(input)`: step 배열 반환 (각 step 에 `line`/`caption`/`action`/`tone` + 상태)
   - `createRenderer()`: 기존 공유 렌더러 재사용 또는 신규 `Renderer` 구현
2. `src/algorithms/index.ts` 의 `ALGORITHMS` 에 등록 (카테고리는 `CATEGORIES`).

> 같은 카테고리에 비슷한 시각화면 `shared.ts` 의 렌더러를 재사용하는 것이 가장 빠르다.

---

## 🐛 주의사항

- step 상태는 반드시 깊은 복사 스냅샷 (참조 공유 금지).
- `generate()` 의 모든 `line` 은 `0 ≤ line < sourceCode.length` 여야 한다.
- 렌더러 `draw` 는 매 프레임 호출 → 무거운 연산 지양, 예외는 CanvasStage 가 try/catch 로 보호.
- 캔버스는 devicePixelRatio(최대 2)로 스케일. 좌표는 CSS 픽셀 기준으로 작성.

---

## 🚀 개발 / 배포

```bash
npm run dev      # 개발 서버
npm run build    # tsc -b && vite build (타입체크 포함)
npm run preview  # 빌드 미리보기
```

`main` push → GitHub Actions(`deploy.yml`) → GitHub Pages 자동 배포.

---

**기술 스택**: React + TS + Vite + Canvas + Framer Motion
**브랜치**: `claude/algorithm-visualizer-redesign-irb3aj`
