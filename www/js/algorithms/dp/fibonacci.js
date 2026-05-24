const ALGO_FIBONACCI = {
  name: 'Fibonacci',
  desc: 'Fibonacci Sequence',
  defaultInput: '6',
  inputPlaceholder: 'e.g., 6',
  inputDesc: 'Enter n (compute fib(n))',

  info: {
    summary: 'Dynamic programming approach to compute Fibonacci number. Demonstrates memoization to avoid redundant calculations.',
    complexity: 'O(n) with memoization, O(2^n) naive',
    space: 'O(n)',
    keyPoints: [
      'Base cases: fib(0)=0, fib(1)=1',
      'Recurrence: fib(n) = fib(n-1) + fib(n-2)',
      'Memoization stores computed values',
      'Avoids exponential duplicate work',
    ],
  },

  sourceCode: [
    { text: 'def fib(n, memo={}):', indent: 0 },
    { text: 'if n in memo:', indent: 1 },
    { text: 'return memo[n]', indent: 2 },
    { text: 'if n <= 1:', indent: 1 },
    { text: 'return n', indent: 2 },
    { text: 'memo[n] = fib(n-1, memo) + fib(n-2, memo)', indent: 1 },
    { text: 'return memo[n]', indent: 1 },
  ],

  generateTrace(s) {
    const n = parseInt(s) || 6;
    const result = [];
    const memo = {};
    let callOrder = [];
    let computeOrder = [];

    result.push({
      line: 1,
      currentChar: `n: ${n}`,
      memo: { ...memo },
      callStack: [],
      callOrder: [],
      current: -1,
      value: null,
      action: 'INIT',
      description: `Compute fibonacci(${n})`
    });

    function fib(n, depth = 0) {
      if (memo[n] !== undefined) {
        callOrder.push(`fib(${n}) [cached]`);
        result.push({
          line: 3,
          currentChar: `return memo[${n}]`,
          memo: { ...memo },
          callStack: callOrder.slice(-5),
          callOrder: callOrder.slice(),
          current: n,
          value: memo[n],
          action: 'CACHE_HIT',
          description: `fib(${n}) found in memo: ${memo[n]}`
        });
        return memo[n];
      }

      callOrder.push(`fib(${n})`);

      if (n <= 1) {
        result.push({
          line: 5,
          currentChar: `return ${n}`,
          memo: { ...memo },
          callStack: callOrder.slice(-5),
          callOrder: callOrder.slice(),
          current: n,
          value: n,
          action: 'BASE_CASE',
          description: `Base case: fib(${n}) = ${n}`
        });
        computeOrder.push(n);
        return n;
      }

      result.push({
        line: 6,
        currentChar: `fib(${n-1}) + fib(${n-2})`,
        memo: { ...memo },
        callStack: callOrder.slice(-5),
        callOrder: callOrder.slice(),
        current: n,
        value: null,
        action: 'RECURSE',
        description: `Computing fib(${n}) = fib(${n-1}) + fib(${n-2})`
      });

      const fib1 = fib(n - 1, depth + 1);
      const fib2 = fib(n - 2, depth + 1);
      const val = fib1 + fib2;

      memo[n] = val;
      computeOrder.push(n);

      result.push({
        line: 6,
        currentChar: `memo[${n}] = ${val}`,
        memo: { ...memo },
        callStack: callOrder.slice(-5),
        callOrder: callOrder.slice(),
        current: n,
        value: val,
        action: 'STORE',
        description: `Store memo[${n}] = fib(${n-1}) + fib(${n-2}) = ${fib1} + ${fib2} = ${val}`
      });

      callOrder.pop();
      return val;
    }

    const finalResult = fib(n);

    result.push({
      line: 7,
      currentChar: `return ${finalResult}`,
      memo: { ...memo },
      callStack: [],
      callOrder: [],
      current: -1,
      value: finalResult,
      action: 'DONE ✅',
      description: `Fibonacci(${n}) = ${finalResult}`
    });

    return result;
  },

  renderVisual(step) {
    const memo = step.memo || {};
    const current = step.current;
    const callOrder = step.callOrder || [];
    const value = step.value;

    const maxMemoIndex = Math.max(...Object.keys(memo).map(k => parseInt(k)), 0) + 1;
    const memoArray = Array(maxMemoIndex).fill(null).map((_, i) => memo[i]);

    return `
      <div style="width:100%;display:flex;flex-direction:column;gap:12px;">
        <div style="background:#0a0c10;border-radius:10px;padding:12px;border:1px solid #1e2330;">
          <div style="color:#555;font-size:12px;margin-bottom:8px;">MEMOIZATION TABLE</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
            ${memoArray.map((val, i) => {
              const isCurrent = i === current;
              const bgColor = isCurrent ? '#422006' : val !== null ? '#052e16' : '#13161e';
              const textColor = isCurrent ? '#fbbf24' : val !== null ? '#34d399' : '#444';
              const stroke = isCurrent ? '#f59e0b' : val !== null ? '#10b981' : '#2a3040';

              return `
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                  <div style="width:45px;height:45px;background:${bgColor};border:2px solid ${stroke};border-radius:8px;
                    display:flex;align-items:center;justify-content:center;">
                    <span style="color:${textColor};font-size:12px;font-weight:bold;">${val !== null ? val : '-'}</span>
                  </div>
                  <div style="font-size:10px;color:#888;">f(${i})</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="background:#0a0c10;border-radius:10px;padding:12px;border:1px solid #1e2330;">
          <div style="color:#555;font-size:12px;margin-bottom:8px;">CALL STACK</div>
          <div style="max-height:80px;overflow-y:auto;">
            ${callOrder.length > 0 ? callOrder.slice(-8).map((call, idx) => {
              const isLatest = idx === callOrder.length - 1;
              return `
                <div style="padding:4px;font-size:11px;color:${isLatest ? '#93c5fd' : '#666'};font-family:monospace;border-left:2px solid ${isLatest ? '#3b82f6' : 'transparent'};padding-left:8px;">
                  ${call}
                </div>
              `;
            }).join('') : '<div style="color:#666;font-size:11px;">-</div>'}
          </div>
        </div>

        <div style="text-align:center;font-size:12px;color:#888;">
          ${step.action === 'CACHE_HIT' ? 'Found in cache!' : step.action === 'BASE_CASE' ? 'Base case reached' : step.action === 'STORE' ? `Storing result: ${value}` : step.action === 'DONE ✅' ? `Result: ${value}` : 'Computing...'}
        </div>
      </div>
    `;
  },

  renderInput(s) {
    return `fib(<span style="color:#ffdd57;">${s}</span>)`;
  }
};

ALGO_FIBONACCI.info = {
  summary: 'Dynamic programming approach to compute Fibonacci number. Demonstrates memoization to avoid redundant calculations.',
  complexity: 'O(n) with memoization, O(2^n) naive',
  space: 'O(n)',
  keyPoints: [
    'Base cases: fib(0)=0, fib(1)=1',
    'Recurrence: fib(n) = fib(n-1) + fib(n-2)',
    'Memoization stores computed values',
    'Avoids exponential duplicate work',
  ],
};
