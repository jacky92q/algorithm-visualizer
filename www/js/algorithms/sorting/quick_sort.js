const ALGO_QUICK_SORT = {
  name: 'Quick Sort',
  desc: 'Quick Sort',
  defaultInput: '7,3,8,1,6,2,5',
  inputPlaceholder: 'e.g., 7,3,8,1,6,2,5',
  inputDesc: 'Enter numbers separated by commas',

  info: {
    summary: 'Divide-and-conquer sorting algorithm. Partition array around pivot and recursively sort partitions.',
    complexity: 'O(n log n) average, O(n²) worst',
    space: 'O(log n)',
    keyPoints: [
      'Select pivot element from array',
      'Partition: elements < pivot on left, > pivot on right',
      'Recursively sort left and right partitions',
      'Efficient divide-and-conquer approach',
    ],
  },

  sourceCode: [
    { text: 'def quick_sort(arr, low, high):', indent: 0 },
    { text: 'if low < high:', indent: 1 },
    { text: 'pi = partition(arr, low, high)', indent: 2 },
    { text: 'quick_sort(arr, low, pi-1)', indent: 2 },
    { text: 'quick_sort(arr, pi+1, high)', indent: 2 },
    { text: '', indent: 0 },
    { text: 'def partition(arr, low, high):', indent: 0 },
    { text: 'pivot = arr[high]', indent: 1 },
    { text: 'i = low - 1', indent: 1 },
    { text: 'for j in range(low, high):', indent: 1 },
    { text: 'if arr[j] < pivot:', indent: 2 },
    { text: 'i += 1; swap arr[i] and arr[j]', indent: 3 },
    { text: 'swap arr[i+1] and arr[high]', indent: 1 },
    { text: 'return i + 1', indent: 1 },
  ],

  generateTrace(s) {
    const arr = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (arr.length === 0) arr.push(0);
    const result = [];

    result.push({ line: 1, currentChar: '', array: [...arr], pivot: -1, comparing: [-1, -1], partitionIndex: -1, action: 'INIT', description: 'Initialize array for quick sort' });

    function partition(low, high) {
      const pivot = arr[high];
      let i = low - 1;

      result.push({ line: 8, currentChar: `pivot = ${pivot}`, array: [...arr], pivot: high, comparing: [-1, -1], partitionIndex: -1, action: 'SELECT_PIVOT', description: `Select pivot: ${pivot}` });

      for (let j = low; j < high; j++) {
        result.push({ line: 10, currentChar: `arr[${j}] = ${arr[j]}`, array: [...arr], pivot: high, comparing: [j, -1], partitionIndex: -1, action: 'COMPARE', description: `Compare ${arr[j]} with pivot ${pivot}` });

        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          result.push({ line: 12, currentChar: `swap arr[${i}] and arr[${j}]`, array: [...arr], pivot: high, comparing: [i, j], partitionIndex: -1, action: 'SWAP', description: `Swap: ${arr[j]} and ${arr[i]}` });
        }
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      result.push({ line: 13, currentChar: `swap arr[${i + 1}] and arr[${high}]`, array: [...arr], pivot: i + 1, comparing: [i + 1, high], partitionIndex: i + 1, action: 'PIVOT_PLACED', description: `Pivot placed at position ${i + 1}` });

      return i + 1;
    }

    function quickSort(low, high) {
      if (low < high) {
        const pi = partition(low, high);
        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
      }
    }

    quickSort(0, arr.length - 1);

    result.push({ line: 1, currentChar: '', array: [...arr], pivot: -1, comparing: [-1, -1], partitionIndex: -1, action: 'DONE ✅', description: 'Array sorted! Quick sort complete.' });
    return result;
  },

  renderVisual(step) {
    const array = step.array || [];
    if (array.length === 0) {
      return `<div style="color:#888;text-align:center;padding:40px;">No array data</div>`;
    }

    const maxVal = Math.max(...array);
    const minVal = Math.min(...array);
    const range = maxVal - minVal || 1;
    const pivot = step.pivot;
    const comparing = step.comparing || [-1, -1];

    return `
      <div style="width:100%;height:100%;background:#0a0c10;border-radius:10px;padding:16px;border:1px solid #1e2330;display:flex;align-items:flex-end;justify-content:center;gap:6px;">
        ${array.map((val, idx) => {
          const height = ((val - minVal) / range) * 85 + 10;
          let bgColor = '#3b82f6';
          if (idx === pivot) bgColor = '#f59e0b';
          else if (comparing.includes(idx)) bgColor = '#ec4899';

          return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;min-width:35px;">
              <div style="width:100%;height:${height}%;background:${bgColor};border-radius:4px;box-shadow:0 0 8px ${bgColor}30;transition:all 0.2s ease;"></div>
              <div style="font-size:10px;color:#93c5fd;font-weight:bold;">${val}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderInput(s) {
    const arr = s.split(',').map(x => x.trim()).join(', ');
    return `quick_sort([<span style="color:#93c5fd;">${arr}</span>], 0, ${arr.split(',').length - 1})`;
  }
};

ALGO_QUICK_SORT.info = {
  summary: 'Divide-and-conquer sorting algorithm. Partition array around pivot and recursively sort partitions.',
  complexity: 'O(n log n) average, O(n²) worst',
  space: 'O(log n)',
  keyPoints: [
    'Select pivot element from array',
    'Partition: elements < pivot on left, > pivot on right',
    'Recursively sort left and right partitions',
    'Efficient divide-and-conquer approach',
  ],
};
