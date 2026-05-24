const ALGO_BINARY_SEARCH = {
  name: 'Binary Search',
  desc: 'Binary Search',
  defaultInput: '1,3,5,7,9,11 / 7',
  inputPlaceholder: 'e.g., 1,3,5,7,9,11 / 7',
  inputDesc: 'Sorted array / target (separated by /)',

  info: {
    summary: 'Efficient search algorithm for sorted arrays. Divides search space in half with each comparison.',
    complexity: 'O(log n)',
    space: 'O(1)',
    keyPoints: [
      'Array must be sorted',
      'Compare target with middle element',
      'If equal, target found',
      'If target < middle, search left half',
      'If target > middle, search right half',
    ],
  },

  sourceCode: [
    { text: 'def binary_search(arr, target):', indent: 0 },
    { text: 'left = 0', indent: 1 },
    { text: 'right = len(arr) - 1', indent: 1 },
    { text: 'while left <= right:', indent: 1 },
    { text: 'mid = (left + right) // 2', indent: 2 },
    { text: 'if arr[mid] == target:', indent: 2 },
    { text: 'return mid', indent: 3 },
    { text: 'elif arr[mid] < target:', indent: 2 },
    { text: 'left = mid + 1', indent: 3 },
    { text: 'else:', indent: 2 },
    { text: 'right = mid - 1', indent: 3 },
    { text: 'return -1', indent: 1 },
  ],

  generateTrace(s) {
    const parts = s.split('/').map(x => x.trim());
    const arr = parts[0] ? parts[0].split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x)) : [];
    const target = parts[1] ? parseInt(parts[1]) : 0;

    if (arr.length === 0) arr.push(target);

    const result = [];

    result.push({ line: 1, currentChar: `target: ${target}`, array: [...arr], left: 0, right: arr.length - 1, mid: -1, comparing: [], action: 'INIT', description: `Initialize search for target: ${target}` });

    let left = 0;
    let right = arr.length - 1;
    let found = false;
    let foundIndex = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      result.push({ line: 5, currentChar: `mid = ${mid}`, array: [...arr], left, right, mid, comparing: [mid], action: 'CALCULATE_MID', description: `Calculate mid = (${left} + ${right}) / 2 = ${mid}` });

      result.push({ line: 6, currentChar: `arr[${mid}] = ${arr[mid]}`, array: [...arr], left, right, mid, comparing: [mid], action: 'COMPARE', description: `Compare arr[${mid}] = ${arr[mid]} with target ${target}` });

      if (arr[mid] === target) {
        result.push({ line: 7, currentChar: `found at ${mid}`, array: [...arr], left, right, mid, comparing: [mid], action: 'FOUND ✅', description: `Target ${target} found at index ${mid}!` });
        found = true;
        foundIndex = mid;
        break;
      } else if (arr[mid] < target) {
        result.push({ line: 9, currentChar: `left = ${mid + 1}`, array: [...arr], left: mid + 1, right, mid, comparing: [mid], action: 'SEARCH_RIGHT', description: `${arr[mid]} < ${target}, search right half` });
        left = mid + 1;
      } else {
        result.push({ line: 11, currentChar: `right = ${mid - 1}`, array: [...arr], left, right: mid - 1, mid, comparing: [mid], action: 'SEARCH_LEFT', description: `${arr[mid]} > ${target}, search left half` });
        right = mid - 1;
      }
    }

    if (!found) {
      result.push({ line: 12, currentChar: 'not found', array: [...arr], left, right, mid: -1, comparing: [], action: 'NOT_FOUND ❌', description: `Target ${target} not found in array` });
    }

    return result;
  },

  renderVisual(step) {
    const array = step.array || [];
    const left = step.left || 0;
    const right = step.right || array.length - 1;
    const mid = step.mid;
    const comparing = step.comparing || [];
    const maxVal = Math.max(...array, 10);

    return `
      <div style="width:100%;display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:flex-end;justify-content:center;gap:4px;height:100px;background:#0a0c10;border-radius:10px;padding:12px;border:1px solid #1e2330;">
          ${array.map((val, idx) => {
            const height = (val / maxVal) * 100;
            let bgColor = '#555';
            let textColor = '#999';

            if (idx >= left && idx <= right) {
              bgColor = '#3b82f6';
              textColor = '#93c5fd';
            }
            if (comparing.includes(idx)) {
              bgColor = '#f59e0b';
              textColor = '#fbbf24';
            }
            if (idx === mid) {
              bgColor = '#ec4899';
              textColor = '#f472b6';
            }

            return `
              <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;">
                <div style="width:100%;height:${height}%;background:${bgColor};border-radius:3px;"></div>
                <div style="font-size:10px;color:${textColor};font-weight:bold;">${val}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="display:flex;gap:8px;font-size:11px;">
          <div style="flex:1;background:#0a0c10;border-radius:10px;padding:8px;border:1px solid #1e2330;">
            <div style="color:#555;margin-bottom:3px;">RANGE</div>
            <div style="color:#93c5fd;font-family:monospace;">[${left}, ${right}]</div>
          </div>
          ${mid >= 0 ? `
            <div style="flex:1;background:#0a0c10;border-radius:10px;padding:8px;border:1px solid #1e2330;">
              <div style="color:#555;margin-bottom:3px;">MID</div>
              <div style="color:#f472b6;font-family:monospace;">${mid}</div>
            </div>
          ` : ''}
        </div>
        <div style="text-align:center;font-size:12px;color:#888;">
          ${step.action}
        </div>
      </div>
    `;
  },

  renderInput(s) {
    const parts = s.split('/').map(x => x.trim());
    const arr = parts[0];
    const target = parts[1] || '?';
    return `binary_search([<span style="color:#93c5fd;">${arr}</span>], <span style="color:#f59e0b;">${target}</span>)`;
  }
};

ALGO_BINARY_SEARCH.info = {
  summary: 'Efficient search algorithm for sorted arrays. Divides search space in half with each comparison.',
  complexity: 'O(log n)',
  space: 'O(1)',
  keyPoints: [
    'Array must be sorted',
    'Compare target with middle element',
    'If equal, target found',
    'If target < middle, search left half',
    'If target > middle, search right half',
  ],
};
