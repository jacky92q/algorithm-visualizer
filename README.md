# Algorithm Visualizer

알고리즘과 자료구조를 **캔버스 애니메이션 + 코드 하이라이트**로 단계별 시각화하는 웹앱입니다.
쇼츠(세로 영상) 제작에 최적화된 9:16 스테이지를 제공합니다.

🔗 **Live**: https://jacky92q.github.io/algorithm-visualizer/

## 기술 스택

- **React 18** + **TypeScript** + **Vite**
- **HTML5 Canvas** — 모든 시각화는 직접 그린 캔버스 렌더러
- **Framer Motion** — 페이지 전환 / UI 마이크로 인터랙션
- 디자인: 크림톤 베이스 · 브라운 · 청록(teal) 포인트

## 수록 알고리즘 (10)

| 분류 | 알고리즘 |
|------|----------|
| 정렬 | Bubble · Selection · Insertion · Quick · Merge |
| 탐색 | Binary Search |
| 경로 | BFS Pathfinding · Dijkstra |
| 스택 | Valid Parentheses |
| 트리 | Binary Search Tree |

## 화면 흐름

```
홈(카탈로그)  →  설명 페이지  →  시각화(쇼츠) 페이지
   /              /algo/:id        /algo/:id/run
```

각 페이지는 독립적입니다. 알고리즘을 고르면 먼저 개념/복잡도 설명이 나오고,
"시각화 시작"을 누르면 코드·그래픽 중심의 쇼츠 화면으로 진입합니다.

## 개발

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 타입체크 + 프로덕션 빌드
npm run preview    # 빌드 미리보기
```

## 배포

`main` 브랜치에 push 하면 `.github/workflows/deploy.yml` 이 자동으로
GitHub Pages 에 배포합니다. (Settings → Pages → Source: GitHub Actions)

## 새 알고리즘 추가

1. `src/algorithms/<category>/<name>.ts` 에 `Algorithm` 객체 작성
   (`meta`, `sourceCode`, `generate()`, `createRenderer()`)
2. `src/algorithms/index.ts` 의 `ALGORITHMS` 배열에 등록

자세한 구조는 `CLAUDE.md` 참고.
