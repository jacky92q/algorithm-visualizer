import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Lang = 'ko' | 'en';

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem('av-lang');
    if (stored === 'ko' || stored === 'en') return stored;
  } catch { /* ignore */ }
  return navigator.language.startsWith('ko') ? 'ko' : 'en';
}

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangCtx>({
  lang: 'ko',
  setLang: () => {},
  t: (k) => k,
});

export function useLang() {
  return useContext(LangContext);
}

const UI: Record<Lang, Record<string, string>> = {
  ko: {
    'home.badge': '✦ ALGORITHM VISUALIZER',
    'home.title.pre': '알고리즘을 ',
    'home.title.accent': '눈으로',
    'home.title.post': ' 이해하다',
    'home.sub': '단계별 애니메이션과 코드 하이라이트로 핵심 알고리즘을 시각화합니다.',
    'home.concepts': '프로토콜 · 개념 시각화',
    'home.footer': 'Made for shorts · Canvas + React + TypeScript',
    'cat.network.name': '네트워크',
    'cat.network.blurb': '통신 프로토콜의 동작 원리',
    'concept.tag': '애니메이션 설명',
    'concept.close': '닫기',
    'cat.sorting.name': '정렬',
    'cat.sorting.blurb': '값을 순서대로 재배치',
    'cat.searching.name': '탐색',
    'cat.searching.blurb': '원하는 값 빠르게 찾기',
    'cat.pathfinding.name': '경로 탐색',
    'cat.pathfinding.blurb': '격자에서 길 찾기',
    'cat.stack.name': '스택',
    'cat.stack.blurb': 'LIFO 구조 활용',
    'cat.tree.name': '트리',
    'cat.tree.blurb': '계층 구조 다루기',
    'cat.dp.name': '동적 프로그래밍',
    'cat.dp.blurb': '중복 계산 없이 최적해',
    'cat.math.name': '수학',
    'cat.math.blurb': '수론·정수 알고리즘',
    'desc.back': '← 목록',
    'desc.time': '시간복잡도',
    'desc.space': '공간복잡도',
    'desc.difficulty': '난이도',
    'desc.keyPoints': '핵심 포인트',
    'desc.steps': '동작 순서',
    'desc.cta': '▶ 시각화 시작하기',
    'desc.missing': '알고리즘을 찾을 수 없습니다.',
    'desc.goHome': '← 홈으로',
    'viz.inputTitle': '입력값 바꾸기',
    'viz.default': '기본값',
    'viz.apply': '적용',
    'viz.missing': '알고리즘을 찾을 수 없습니다.',
    'viz.goHome': '← 홈으로',
    'viz.presetTitle': '예시 선택',
    'lang.title': '언어',
    'lang.ko': '한국어',
    'lang.en': 'English',
  },
  en: {
    'home.badge': '✦ ALGORITHM VISUALIZER',
    'home.title.pre': 'See Algorithms ',
    'home.title.accent': 'in Action',
    'home.title.post': '',
    'home.sub': 'Step-by-step animation and code highlighting for essential algorithms.',
    'home.concepts': 'Protocols & Concept Visualizations',
    'home.footer': 'Made for shorts · Canvas + React + TypeScript',
    'cat.network.name': 'Network',
    'cat.network.blurb': 'How communication protocols work',
    'concept.tag': 'Animated explainer',
    'concept.close': 'Close',
    'cat.sorting.name': 'Sorting',
    'cat.sorting.blurb': 'Rearrange values in order',
    'cat.searching.name': 'Searching',
    'cat.searching.blurb': 'Find the target value quickly',
    'cat.pathfinding.name': 'Pathfinding',
    'cat.pathfinding.blurb': 'Navigate through grid mazes',
    'cat.stack.name': 'Stack',
    'cat.stack.blurb': 'LIFO data structure',
    'cat.tree.name': 'Tree',
    'cat.tree.blurb': 'Hierarchical data structures',
    'cat.dp.name': 'Dynamic Programming',
    'cat.dp.blurb': 'Optimal solutions without redundancy',
    'cat.math.name': 'Math',
    'cat.math.blurb': 'Number theory & integer algorithms',
    'desc.back': '← Back',
    'desc.time': 'Time',
    'desc.space': 'Space',
    'desc.difficulty': 'Difficulty',
    'desc.keyPoints': 'Key Points',
    'desc.steps': 'How It Works',
    'desc.cta': '▶ Start Visualization',
    'desc.missing': 'Algorithm not found.',
    'desc.goHome': '← Home',
    'viz.inputTitle': 'Change Input',
    'viz.default': 'Default',
    'viz.apply': 'Apply',
    'viz.missing': 'Algorithm not found.',
    'viz.goHome': '← Home',
    'viz.presetTitle': 'Choose Example',
    'lang.title': 'Language',
    'lang.ko': '한국어',
    'lang.en': 'English',
  },
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    try { localStorage.setItem('av-lang', l); } catch { /* ignore */ }
    setLangState(l);
  };

  const t = (key: string) => UI[lang][key] ?? UI.ko[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}
