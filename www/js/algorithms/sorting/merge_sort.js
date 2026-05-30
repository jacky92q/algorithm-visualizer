const ALGO_MERGE_SORT = {
  name: 'Merge Sort',
  desc: 'Merge Sort',
  defaultInput: '6,3,8,5,2,7,1,4',
  inputPlaceholder: 'e.g., 6,3,8,5,2,7,1,4',
  inputDesc: 'Enter numbers separated by commas',

  info: {
    summary: 'Divide-and-conquer sorting algorithm. Recursively divide array in half and merge sorted subarrays.',
    complexity: 'O(n log n)',
    space: 'O(n)',
    keyPoints: [
      'Divide array into two halves recursively',
      'Base case: single element is already sorted',
      'Merge two sorted subarrays maintaining order',
      'Guaranteed O(n log n) performance',
    ],
  },

  sourceCode: [
    { text: 'def merge_sort(arr):', indent: 0 },
    { text: 'if len(arr) <= 1:', indent: 1 },
    { text: 'return arr', indent: 2 },
    { text: 'mid = len(arr) // 2', indent: 1 },
    { text: 'left = merge_sort(arr[:mid])', indent: 1 },
    { text: 'right = merge_sort(arr[mid:])', indent: 1 },
    { text: 'return merge(left, right)', indent: 1 },
    { text: '', indent: 0 },
    { text: 'def merge(left, right):', indent: 0 },
    { text: 'result = []', indent: 1 },
    { text: 'i = j = 0', indent: 1 },
    { text: 'while i < len(left) and j < len(right):', indent: 1 },
    { text: 'if left[i] <= right[j]:', indent: 2 },
    { text: 'result.append(left[i]); i += 1', indent: 3 },
    { text: 'else:', indent: 2 },
    { text: 'result.append(right[j]); j += 1', indent: 3 },
    { text: 'result += left[i:] + right[j:]', indent: 1 },
    { text: 'return result', indent: 1 },
  ],

  generateTrace(s) {
    const arr = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (arr.length === 0) arr.push(0);
    const result = [];
    let stepCount = 0;

    result.push({ line: 1, currentChar: '', array: [...arr], leftArray: [], rightArray: [], merging: [], step: stepCount++, action: 'INIT', description: 'Initialize array for merge sort' });

    function mergeSort(arr, depth = 0) {
      if (arr.length <= 1) {
        result.push({ line: 2, currentChar: `arr = [${arr.join(', ')}]`, array: [...arr], leftArray: [], rightArray: [], merging: [], step: stepCount++, action: 'BASE_CASE', description: `Base case: single element [${arr.join(', ')}]` });
        return arr;
      }

      const mid = Math.floor(arr.length / 2);
      const left = arr.slice(0, mid);
      const right = arr.slice(mid);

      result.push({ line: 4, currentChar: `mid = ${mid}`, array: [...arr], leftArray: [...left], rightArray: [...right], merging: [], step: stepCount++, action: 'DIVIDE', description: `Divide into [${left.join(', ')}] and [${right.join(', ')}]` });

      const sortedLeft = mergeSort(left, depth + 1);
      const sortedRight = mergeSort(right, depth + 1);

      const merged = merge(sortedLeft, sortedRight);
      return merged;
    }

    function merge(left, right) {
      const merged = [];
      let i = 0, j = 0;

      result.push({ line: 9, currentChar: `merge [${left.join(', ')}] and [${right.join(', ')}]`, array: merged, leftArray: [...left], rightArray: [...right], merging: [], step: stepCount++, action: 'START_MERGE', description: `Merging [${left.join(', ')}] and [${right.join(', ')}]` });

      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          merged.push(left[i]);
          result.push({ line: 13, currentChar: `append left[${i}] = ${left[i]}`, array: [...merged], leftArray: left.slice(i), rightArray: right.slice(j), merging: [left[i]], step: stepCount++, action: 'APPEND', description: `Append ${left[i]} from left array` });
          i++;
        } else {
          merged.push(right[j]);
          result.push({ line: 15, currentChar: `append right[${j}] = ${right[j]}`, array: [...merged], leftArray: left.slice(i), rightArray: right.slice(j), merging: [right[j]], step: stepCount++, action: 'APPEND', description: `Append ${right[j]} from right array` });
          j++;
        }
      }

      while (i < left.length) {
        merged.push(left[i]);
        i++;
      }
      while (j < right.length) {
        merged.push(right[j]);
        j++;
      }

      result.push({ line: 17, currentChar: `result = [${merged.join(', ')}]`, array: [...merged], leftArray: [], rightArray: [], merging: [], step: stepCount++, action: 'MERGE_DONE', description: `Merge complete: [${merged.join(', ')}]` });

      return merged;
    }

    mergeSort(arr);

    result.push({ line: 1, currentChar: '', array: [...arr], leftArray: [], rightArray: [], merging: [], step: stepCount++, action: 'DONE ✅', description: 'Array sorted! Merge sort complete.' });
    return result;
  },

  renderVisual(step) {
    const array = step.array || [];
    const leftArray = step.leftArray || [];
    const rightArray = step.rightArray || [];

    const allVals = [...array, ...leftArray, ...rightArray];
    if (allVals.length === 0) {
      return `<div style="color:#888;text-align:center;padding:40px;">No array data</div>`;
    }

    const maxVal = Math.max(...allVals);
    const minVal = Math.min(...allVals);
    const range = maxVal - minVal || 1;

    return `
      <div style="width:100%;height:280px;background:#0a0e27;border-radius:0;padding:20px;border:none;display:flex;align-items:stretch;justify-content:center;gap:6px;">
        ${array.length > 0 ? array.map((val) => {
          const height = ((val - minVal) / range) * 95 + 5;
          return `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;flex:1;min-width:35px;">
              <div style="width:100%;height:${height}%;background:#34d399;border-radius:4px;box-shadow:0 0 12px #34d39940;transition:all 0.2s ease;"></div>
              <div style="font-size:12px;color:#34d399;font-weight:bold;">${val}</div>
            </div>
          `;
        }).join('') : '<div style="color:#666;font-size:12px;">Merging...</div>'}
      </div>
    `;
  },

  renderInput(s) {
    const arr = s.split(',').map(x => x.trim()).join(', ');
    return `merge_sort([<span style="color:#93c5fd;">${arr}</span>])`;
  }
};

ALGO_MERGE_SORT.info = {
  summary: 'Divide-and-conquer sorting algorithm. Recursively divide array in half and merge sorted subarrays.',
  complexity: 'O(n log n)',
  space: 'O(n)',
  keyPoints: [
    'Divide array into two halves recursively',
    'Base case: single element is already sorted',
    'Merge two sorted subarrays maintaining order',
    'Guaranteed O(n log n) performance',
  ],
};
