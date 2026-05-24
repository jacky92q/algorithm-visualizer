const ALGO_BUBBLE_SORT = {
  name: 'Bubble Sort',
  desc: 'Bubble Sort',
  defaultInput: '5,3,8,1,2',
  inputPlaceholder: 'e.g., 5,3,8,1,2',
  inputDesc: 'Enter numbers separated by commas',

  info: {
    summary: 'Simple sorting algorithm that repeatedly swaps adjacent elements if they are in wrong order. Bubble the largest element to the end in each pass.',
    complexity: 'O(n²)',
    space: 'O(1)',
    keyPoints: [
      'Compare adjacent elements in array',
      'Swap if left element is greater than right',
      'Repeat for n-1 passes',
      'Each pass moves the largest unsorted element to its position',
    ],
  },

  sourceCode: [
    { text: 'def bubble_sort(arr):', indent: 0 },
    { text: 'n = len(arr)', indent: 1 },
    { text: 'for i in range(n):', indent: 1 },
    { text: 'for j in range(n-i-1):', indent: 2 },
    { text: 'if arr[j] > arr[j+1]:', indent: 3 },
    { text: 'swap arr[j] and arr[j+1]', indent: 4 },
    { text: 'return arr', indent: 1 },
  ],

  generateTrace(s) {
    const arr = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (arr.length === 0) arr.push(0);
    const result = [];
    const n = arr.length;

    result.push({ line: 2, currentChar: '', array: [...arr], i: -1, j: -1, comparing: [-1, -1], swapped: false, action: 'INIT', description: 'Initialize array for bubble sort' });

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        result.push({ line: 4, currentChar: `compare arr[${j}] and arr[${j+1}]`, array: [...arr], i, j, comparing: [j, j+1], swapped: false, action: 'COMPARE', description: `Compare ${arr[j]} and ${arr[j+1]}` });

        if (arr[j] > arr[j+1]) {
          [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
          result.push({ line: 6, currentChar: `swap arr[${j}] and arr[${j+1}]`, array: [...arr], i, j, comparing: [j, j+1], swapped: true, action: 'SWAP', description: `Swap ${arr[j+1]} and ${arr[j]}` });
        }
      }
    }

    result.push({ line: 7, currentChar: '', array: [...arr], i: -1, j: -1, comparing: [-1, -1], swapped: false, action: 'DONE ✅', description: 'Array sorted! Bubble sort complete.' });
    return result;
  },

  renderVisual(step) {
    const array = step.array || [];
    const comparing = step.comparing || [-1, -1];
    const maxVal = Math.max(...array, 10);

    return `
      <div style="width:100%;display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:flex-end;justify-content:center;gap:6px;height:120px;background:#0a0c10;border-radius:10px;padding:12px;border:1px solid #1e2330;">
          ${array.map((val, idx) => {
            const height = (val / maxVal) * 100;
            const isComparing = comparing.includes(idx);
            const bgColor = isComparing ? '#f59e0b' : '#3b82f6';
            const textColor = isComparing ? '#fbbf24' : '#93c5fd';
            return `
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
                <div style="width:100%;height:${height}%;background:${bgColor};border-radius:4px;transition:all 0.3s;"></div>
                <div style="font-size:11px;color:${textColor};font-weight:bold;">${val}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="text-align:center;font-size:12px;color:#888;">
          ${step.action === 'SWAP' ? 'Swapping...' : step.action === 'COMPARE' ? 'Comparing...' : 'Sorted!'}
        </div>
      </div>
    `;
  },

  renderInput(s) {
    const arr = s.split(',').map(x => x.trim()).join(', ');
    return `bubble_sort([<span style="color:#93c5fd;">${arr}</span>])`;
  }
};

ALGO_BUBBLE_SORT.info = {
  summary: 'Simple sorting algorithm that repeatedly swaps adjacent elements if they are in wrong order. Bubble the largest element to the end in each pass.',
  complexity: 'O(n²)',
  space: 'O(1)',
  keyPoints: [
    'Compare adjacent elements in array',
    'Swap if left element is greater than right',
    'Repeat for n-1 passes',
    'Each pass moves the largest unsorted element to its position',
  ],
};
