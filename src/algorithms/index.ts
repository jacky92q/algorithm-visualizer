import type { Algorithm, BaseStep, Category } from '../core/types';
import { bubbleSort } from './sorting/bubbleSort';
import { insertionSort } from './sorting/insertionSort';
import { selectionSort } from './sorting/selectionSort';
import { quickSort } from './sorting/quickSort';
import { mergeSort } from './sorting/mergeSort';
import { binarySearch } from './searching/binarySearch';
import { bfsMaze } from './pathfinding/bfsMaze';
import { dijkstra } from './pathfinding/dijkstra';
import { parentheses } from './stack/parentheses';
import { bst } from './tree/bst';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ALGORITHMS: Algorithm<any>[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  quickSort,
  mergeSort,
  binarySearch,
  bfsMaze,
  dijkstra,
  parentheses,
  bst,
];

export interface CategoryInfo {
  id: Category;
  label: string;
  ko: string;
  glyph: string;
  blurb: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'sorting', label: 'Sorting', ko: '정렬', glyph: '📊', blurb: '값을 순서대로 재배치' },
  { id: 'searching', label: 'Searching', ko: '탐색', glyph: '🔎', blurb: '원하는 값 빠르게 찾기' },
  { id: 'pathfinding', label: 'Pathfinding', ko: '경로 탐색', glyph: '🗺️', blurb: '격자에서 길 찾기' },
  { id: 'stack', label: 'Stack', ko: '스택', glyph: '📚', blurb: 'LIFO 구조 활용' },
  { id: 'tree', label: 'Tree', ko: '트리', glyph: '🌳', blurb: '계층 구조 다루기' },
];

export function getAlgorithm(id: string): Algorithm<BaseStep> | undefined {
  return ALGORITHMS.find((a) => a.meta.id === id) as Algorithm<BaseStep> | undefined;
}

export function algorithmsByCategory(cat: Category): Algorithm<BaseStep>[] {
  return ALGORITHMS.filter((a) => a.meta.category === cat) as Algorithm<BaseStep>[];
}
