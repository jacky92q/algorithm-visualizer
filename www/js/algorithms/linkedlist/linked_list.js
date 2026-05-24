const ALGO_LINKED_LIST = {
  name: 'Linked List',
  desc: '연결 리스트 삽입/삭제',
  defaultInput: '1,2,3,4,5',
  inputPlaceholder: '예: 1,2,3,4,5',
  inputDesc: '숫자를 쉼표로 구분해서 입력하세요',
  sourceCode: [
    { text: 'class Node:',                    indent: 0 },
    { text: 'def __init__(self, val):',       indent: 1 },
    { text: 'self.val = val',                 indent: 2 },
    { text: 'self.next = None',               indent: 2 },
    { text: 'def append(head, val):',         indent: 0 },
    { text: 'node = Node(val)',               indent: 1 },
    { text: 'cur = head',                     indent: 1 },
    { text: 'while cur.next:',               indent: 1 },
    { text: 'cur = cur.next',                indent: 2 },
    { text: 'cur.next = node',               indent: 1 },
  ],
  generateTrace(s) {
    const nums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const result = [];
    const list = [];

    for (const n of nums) {
      result.push({ line: 5, currentChar: `append(${n})`, stack: [...list], action: 'CALL', description: `append(${n}) 호출` });
      result.push({ line: 6, currentChar: `Node(${n})`, stack: [...list], action: 'CREATE', description: `Node(${n}) 생성` });
      if (list.length > 0) {
        result.push({ line: 8, currentChar: `traverse`, stack: [...list], action: 'TRAVERSE', description: `마지막 노드까지 이동` });
      }
      list.push(n);
      result.push({ line: 10, currentChar: `${n}`, stack: [...list], action: 'APPEND', description: `${n} 연결 → [${list.join(' → ')}]` });
    }

    // 삭제
    while (list.length > 0) {
      const head = list.shift();
      result.push({ line: 5, currentChar: `delete head`, stack: [...list], action: 'DELETE', description: `head(${head}) 삭제 → [${list.join(' → ')}]` });
    }

    result.push({ line: 4, currentChar: 'None', stack: [], action: 'DONE ✅', description: '리스트가 비었습니다' });
    return result;
  },
  renderInput(s) {
    return `linked_list([<span style="color:#ffdd57;">${s}</span>])`;
  }
};
