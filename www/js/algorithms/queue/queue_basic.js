const ALGO_QUEUE_BASIC = {
  name: 'Queue 기본',
  desc: 'Enqueue & Dequeue',
  defaultInput: '1,2,3,4,5',
  inputPlaceholder: '예: 1,2,3,4,5',
  inputDesc: '숫자를 쉼표로 구분해서 입력하세요',
  sourceCode: [
    { text: 'queue = []',               indent: 0 },
    { text: 'def enqueue(val):',        indent: 0 },
    { text: 'queue.append(val)',        indent: 1 },
    { text: 'def dequeue():',           indent: 0 },
    { text: 'if queue:',               indent: 1 },
    { text: 'return queue.pop(0)',     indent: 2 },
    { text: 'return None',             indent: 2 },
  ],
  generateTrace(s) {
    const nums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const result = [];
    const queue = [];
    for (const n of nums) {
      result.push({ line: 2, currentChar: `enqueue(${n})`, stack: [...queue], action: 'CALL', description: `enqueue(${n}) 호출` });
      queue.push(n);
      result.push({ line: 3, currentChar: `${n}`, stack: [...queue], action: 'ENQUEUE', description: `${n} 을 큐에 추가 → [${queue.join(', ')}]` });
    }
    while (queue.length > 0) {
      result.push({ line: 4, currentChar: 'dequeue()', stack: [...queue], action: 'CALL', description: `dequeue() 호출` });
      const val = queue.shift();
      result.push({ line: 6, currentChar: `${val}`, stack: [...queue], action: 'DEQUEUE', description: `${val} 을 큐에서 dequeue → [${queue.join(', ')}]` });
    }
    result.push({ line: 1, currentChar: '[]', stack: [], action: 'DONE ✅', description: '큐가 비었습니다' });
    return result;
  },
  renderInput(s) {
    return `enqueue/dequeue([<span style="color:#ffdd57;">${s}</span>])`;
  }
};
