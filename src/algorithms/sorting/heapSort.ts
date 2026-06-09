import type { Algorithm, RenderCtx, Renderer } from '../../core/types';
import { SortBarsRenderer, parseInts, type SortStep } from './shared';
import { rgba } from '../../core/palette';
import { line, text } from '../../core/draw';

/** SortStep extended with heap-specific metadata. */
export interface HeapSortStep extends SortStep {
  heapSize: number;   // number of elements still in the heap (rest are sorted)
  siftRoot?: number;  // slot index of the sift-down root (for edge highlighting)
}

// ─── Renderer ────────────────────────────────────────────────────────────────

class HeapSortRenderer implements Renderer<HeapSortStep> {
  private readonly _base = new SortBarsRenderer();

  draw(rc: RenderCtx, prev: HeapSortStep | null, curr: HeapSortStep): void {
    // 1. Draw bars exactly as the shared renderer would
    this._base.draw(rc, prev, curr);

    // 2. Overlay parent→child edges for the active heap portion
    this._drawHeapEdges(rc, curr);
  }

  private _drawHeapEdges(rc: RenderCtx, curr: HeapSortStep): void {
    const { ctx, width, height, time } = rc;
    const n = curr.slots.length;
    const heapSize = curr.heapSize;
    if (heapSize <= 1) return;

    // Mirror the bar layout constants from SortBarsRenderer
    const padX = Math.max(28, width * 0.06);
    const padBottom = 100;
    const usableW = width - padX * 2;
    const slotW = usableW / n;
    const baseY = height - padBottom;

    const slotX = (slot: number) => padX + slotW * slot + slotW / 2;

    // id → current slot mapping
    const slotOf = (id: number) => curr.slots.indexOf(id);

    for (let parentSlot = 0; parentSlot < Math.floor(heapSize / 2); parentSlot++) {
      const parentId = curr.slots[parentSlot];
      const barH_parent = Math.max(12, (curr.values[parentId] / Math.max(...curr.values, 1)) *
        (baseY - 56 /* padTop */));
      const px = slotX(parentSlot);
      const py = baseY - barH_parent;  // top-center of parent bar

      for (const childSlot of [parentSlot * 2 + 1, parentSlot * 2 + 2]) {
        if (childSlot >= heapSize) continue;
        const childId = curr.slots[childSlot];
        void slotOf(parentId); // keep reference
        void slotOf(childId);
        const barH_child = Math.max(12, (curr.values[childId] / Math.max(...curr.values, 1)) *
          (baseY - 56));
        const cx2 = slotX(childSlot);
        const cy2 = baseY - barH_child;

        // Is this edge part of the active sift-down subtree?
        const inActive = curr.siftRoot !== undefined && parentSlot >= curr.siftRoot;
        const pulse = 0.55 + 0.45 * Math.sin(time * 3.5 + parentSlot);
        const edgeColor = inActive
          ? rgba('#E0A33B', 0.72 * pulse)
          : rgba('#A8835E', 0.22);
        const edgeWidth = inActive ? 2.0 : 1.0;

        // Draw a subtle quadratic bezier curve
        ctx.save();
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = edgeWidth;
        ctx.lineCap = 'round';
        ctx.setLineDash(inActive ? [] : [3, 5]);
        ctx.beginPath();
        const cpx = (px + cx2) / 2;
        const cpy = Math.min(py, cy2) - 18;
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(cpx, cpy, cx2, cy2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Label "HEAP" over the heap portion and "SORTED" for the rest
    if (heapSize < n) {
      const heapMidX = slotX(Math.floor((heapSize - 1) / 2));
      text(ctx, 'HEAP', heapMidX, 26, {
        size: 11,
        weight: 700,
        color: rgba('#C9821C', 0.7),
        letterSpacing: 2,
      });
      const sortedMidX = slotX(Math.floor((heapSize + n - 1) / 2));
      text(ctx, 'SORTED', sortedMidX, 26, {
        size: 11,
        weight: 700,
        color: rgba('#2A9D8F', 0.7),
        letterSpacing: 2,
      });
      // divider line
      const divX = slotX(heapSize - 1) + slotW * 0.5;
      line(ctx, divX, 34, divX, height - padBottom + 4,
        rgba('#C9821C', 0.25), 1.5, [4, 6]);
    }
  }
}

// ─── Source Code ─────────────────────────────────────────────────────────────

const source = [
  { text: 'def heap_sort(a):', indent: 0 },
  { text: 'n = len(a)', indent: 1 },
  { text: 'for i in range(n//2 - 1, -1, -1):', indent: 1 },
  { text: 'sift_down(a, i, n)', indent: 2 },
  { text: 'for i in range(n - 1, 0, -1):', indent: 1 },
  { text: 'a[0], a[i] = a[i], a[0]', indent: 2 },
  { text: 'sift_down(a, 0, i)', indent: 2 },
  { text: 'def sift_down(a, i, size):', indent: 0 },
  { text: 'while True:', indent: 1 },
  { text: 'largest = i', indent: 2 },
  { text: 'l, r = 2*i+1, 2*i+2', indent: 2 },
  { text: 'if l < size and a[l] > a[largest]:', indent: 2 },
  { text: 'largest = l', indent: 3 },
  { text: 'if r < size and a[r] > a[largest]:', indent: 2 },
  { text: 'largest = r', indent: 3 },
  { text: 'if largest == i: break', indent: 2 },
  { text: 'a[i], a[largest] = a[largest], a[i]', indent: 2 },
  { text: 'i = largest', indent: 2 },
];

// ─── Generate ────────────────────────────────────────────────────────────────

export const heapSort: Algorithm<HeapSortStep> = {
  meta: {
    id: 'heap-sort',
    category: 'sorting',
    name: 'Heap Sort',
    tagline: 'Build a max-heap, extract max repeatedly',
    hook: '힙 트리를 만들어 최댓값을 하나씩 뽑아냅니다',
    difficulty: 'Hard',
    time: 'O(n log n)',
    space: 'O(1)',
    accent: 'amber',
    glyph: '🏔️',
    summary:
      '먼저 배열을 최대 힙으로 만든 뒤, 루트(최댓값)를 배열 끝과 교환하고 힙 크기를 줄여 다시 힙 성질을 복원합니다. 막대 위에 그려지는 곡선 엣지가 힙의 부모-자식 관계를 보여줍니다.',
    keyPoints: [
      '완전 이진 트리 형태의 힙을 배열로 표현 (인덱스 i → 자식 2i+1, 2i+2)',
      '최대 힙: 부모가 자식보다 항상 크거나 같음',
      '루트 추출 후 sift-down 으로 힙 성질 복원 — O(log n)',
    ],
    steps: [
      '배열 전체를 최대 힙으로 변환합니다 (build-heap).',
      '루트(최댓값)를 힙의 마지막 원소와 교환합니다.',
      '힙 크기를 1 줄이고 루트를 sift-down 해 힙을 복원합니다.',
      '힙 크기가 1이 될 때까지 2–3을 반복합니다.',
    ],
    defaultInput: '15 12 8 6 10 4 7 3 11 9',
    inputHint: '공백 또는 쉼표로 구분 (1–99), 최대 14개',
  },
  sourceCode: source,

  generate(input) {
    const values = parseInts(input, [15, 12, 8, 6, 10, 4, 7, 3, 11, 9]);
    const n = values.length;
    // slots[i] = id of the element currently in slot i
    const slots = values.map((_, i) => i);
    const out: HeapSortStep[] = [];
    const sorted: number[] = [];

    const snap = (extra: Partial<HeapSortStep>): HeapSortStep => ({
      line: 0,
      caption: '',
      captionEn: '',
      slots: [...slots],
      values,
      sorted: [...sorted],
      heapSize: n,
      ...extra,
    });

    out.push(snap({
      line: 1,
      caption: '배열을 준비합니다. 이제 최대 힙을 구성할 것입니다.',
      captionEn: 'Array ready. We will now build a max-heap.',
      action: 'START',
      tone: 'neutral',
      heapSize: n,
    }));

    /** Swap two slots and push a step. */
    const doSwap = (s1: number, s2: number, heapSize: number, siftRoot: number | undefined, lineNum: number, ko: string, en: string) => {
      const idA = slots[s1];
      const idB = slots[s2];
      slots[s1] = idB;
      slots[s2] = idA;
      out.push(snap({
        line: lineNum,
        caption: ko,
        captionEn: en,
        action: 'SWAP',
        tone: 'bad',
        swap: [idA, idB],
        compare: [idA, idB],
        heapSize,
        siftRoot,
      }));
    };

    /** sift-down in-place on `slots`, recording steps. */
    const siftDown = (root: number, size: number) => {
      let i = root;
      while (true) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        out.push(snap({
          line: 9,
          caption: `힙 슬롯 ${i} 에서 sift-down 시작 (자식: ${l < size ? l : '없음'}, ${r < size ? r : '없음'})`,
          captionEn: `Sift-down from slot ${i} (children: ${l < size ? l : 'none'}, ${r < size ? r : 'none'})`,
          action: 'SIFT',
          tone: 'active',
          highlight: [slots[i]],
          heapSize: size,
          siftRoot: root,
        }));

        if (l < size) {
          out.push(snap({
            line: 11,
            caption: `왼쪽 자식 (슬롯 ${l}, 값 ${values[slots[l]]}) vs 현재 최대 (슬롯 ${largest}, 값 ${values[slots[largest]]})`,
            captionEn: `Left child (slot ${l}, val ${values[slots[l]]}) vs current largest (slot ${largest}, val ${values[slots[largest]]})`,
            action: 'COMPARE',
            tone: 'compare',
            compare: [slots[i], slots[l]],
            heapSize: size,
            siftRoot: root,
          }));
          if (values[slots[l]] > values[slots[largest]]) largest = l;
        }
        if (r < size) {
          out.push(snap({
            line: 13,
            caption: `오른쪽 자식 (슬롯 ${r}, 값 ${values[slots[r]]}) vs 현재 최대 (슬롯 ${largest}, 값 ${values[slots[largest]]})`,
            captionEn: `Right child (slot ${r}, val ${values[slots[r]]}) vs current largest (slot ${largest}, val ${values[slots[largest]]})`,
            action: 'COMPARE',
            tone: 'compare',
            compare: [slots[i], slots[r]],
            heapSize: size,
            siftRoot: root,
          }));
          if (values[slots[r]] > values[slots[largest]]) largest = r;
        }

        if (largest === i) {
          out.push(snap({
            line: 15,
            caption: `슬롯 ${i} 이 이미 최대 — sift-down 종료`,
            captionEn: `Slot ${i} is already the largest — sift-down complete`,
            action: 'DONE',
            tone: 'good',
            highlight: [slots[i]],
            heapSize: size,
            siftRoot: root,
          }));
          break;
        }
        doSwap(i, largest, size, root, 16,
          `슬롯 ${i} (값 ${values[slots[largest]]}) 와 슬롯 ${largest} (값 ${values[slots[i]]}) 교환`,
          `Swap slot ${i} (val ${values[slots[largest]]}) with slot ${largest} (val ${values[slots[i]]})`
        );
        i = largest;
      }
    };

    // ── Phase 1: Build max-heap ───────────────────────────────────────────
    out.push(snap({
      line: 2,
      caption: '비-리프 노드부터 역순으로 sift-down → 최대 힙 구성 시작',
      captionEn: 'Sift down every non-leaf from bottom to top to build the max-heap',
      action: 'BUILD',
      tone: 'neutral',
      heapSize: n,
    }));

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      out.push(snap({
        line: 3,
        caption: `슬롯 ${i} (값 ${values[slots[i]]}) sift-down`,
        captionEn: `Sift-down slot ${i} (val ${values[slots[i]]})`,
        action: 'HEAPIFY',
        tone: 'active',
        highlight: [slots[i]],
        heapSize: n,
        siftRoot: i,
      }));
      siftDown(i, n);
    }

    out.push(snap({
      line: 4,
      caption: '최대 힙 완성! 루트(슬롯 0)가 최댓값입니다.',
      captionEn: 'Max-heap built! The root (slot 0) holds the maximum value.',
      action: 'HEAP ✓',
      tone: 'good',
      heapSize: n,
      highlight: [slots[0]],
    }));

    // ── Phase 2: Extract max repeatedly ──────────────────────────────────
    for (let heapEnd = n - 1; heapEnd > 0; heapEnd--) {
      const maxId = slots[0];
      out.push(snap({
        line: 5,
        caption: `루트(최댓값 ${values[maxId]})를 힙 끝(슬롯 ${heapEnd})과 교환합니다`,
        captionEn: `Swap root (max ${values[maxId]}) with last heap element at slot ${heapEnd}`,
        action: 'EXTRACT',
        tone: 'compare',
        compare: [slots[0], slots[heapEnd]],
        heapSize: heapEnd + 1,
      }));
      doSwap(0, heapEnd, heapEnd, undefined, 5,
        `${values[maxId]} 확정 — 힙에서 분리`,
        `${values[maxId]} confirmed — removed from heap`
      );
      sorted.unshift(slots[heapEnd]);

      if (heapEnd > 1) {
        out.push(snap({
          line: 6,
          caption: `힙 크기 ${heapEnd} → 루트부터 sift-down으로 힙 복원`,
          captionEn: `Heap size reduced to ${heapEnd} — restore heap by sifting down root`,
          action: 'RESTORE',
          tone: 'active',
          sorted: [...sorted],
          heapSize: heapEnd,
        }));
        siftDown(0, heapEnd);
      }
    }
    sorted.unshift(slots[0]);

    out.push(snap({
      line: 4,
      caption: '정렬 완료! 힙 정렬은 추가 메모리 없이 O(n log n)을 달성합니다.',
      captionEn: 'Sorted! Heap sort achieves O(n log n) with O(1) extra space.',
      action: 'DONE',
      tone: 'good',
      sorted: [...slots],
      heapSize: 0,
    }));

    return out;
  },

  createRenderer: () => new HeapSortRenderer(),
};
