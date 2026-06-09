import type { Algorithm, BaseStep, Category } from '../core/types';
import { bubbleSort } from './sorting/bubbleSort';
import { insertionSort } from './sorting/insertionSort';
import { selectionSort } from './sorting/selectionSort';
import { quickSort } from './sorting/quickSort';
import { mergeSort } from './sorting/mergeSort';
import { heapSort } from './sorting/heapSort';
import { countingSort } from './sorting/countingSort';
import { binarySearch } from './searching/binarySearch';
import { twoPointers } from './searching/twoPointers';
import { bfsMaze } from './pathfinding/bfsMaze';
import { dijkstra } from './pathfinding/dijkstra';
import { dfsGrid } from './pathfinding/dfsGrid';
import { astar } from './pathfinding/astar';
import { parentheses } from './stack/parentheses';
import { hanoi } from './stack/hanoi';
import { bst } from './tree/bst';
import { fibonacci } from './dp/fibonacci';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ALGORITHMS: Algorithm<any>[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  quickSort,
  mergeSort,
  heapSort,
  countingSort,
  binarySearch,
  twoPointers,
  bfsMaze,
  dijkstra,
  dfsGrid,
  astar,
  parentheses,
  hanoi,
  bst,
  fibonacci,
];

export interface CategoryInfo {
  id: Category;
  label: string;
  glyph: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'sorting', label: 'Sorting', glyph: '📊' },
  { id: 'searching', label: 'Searching', glyph: '🔎' },
  { id: 'pathfinding', label: 'Pathfinding', glyph: '🗺️' },
  { id: 'stack', label: 'Stack', glyph: '📚' },
  { id: 'tree', label: 'Tree', glyph: '🌳' },
  { id: 'dp', label: 'DP', glyph: '🧮' },
];

export function getAlgorithm(id: string): Algorithm<BaseStep> | undefined {
  return ALGORITHMS.find((a) => a.meta.id === id) as Algorithm<BaseStep> | undefined;
}

export function algorithmsByCategory(cat: Category): Algorithm<BaseStep>[] {
  return ALGORITHMS.filter((a) => a.meta.category === cat) as Algorithm<BaseStep>[];
}
