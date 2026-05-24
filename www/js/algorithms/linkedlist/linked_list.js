const ALGO_LINKED_LIST = {
  name: 'Linked List',
  desc: 'Linked List Insertion/Deletion',
  defaultInput: '1,2,3,4,5',
  inputPlaceholder: 'e.g., 1,2,3,4,5',
  inputDesc: 'Enter numbers separated by commas',

  sourceCode: [
    { text: 'class Node:',                      indent: 0 },
    { text: 'def __init__(self, val):',          indent: 1 },
    { text: 'self.val = val',                   indent: 2 },
    { text: 'self.next = None',                 indent: 2 },
    { text: 'def append(head, val):',           indent: 0 },
    { text: 'node = Node(val)',                 indent: 1 },
    { text: 'cur = head',                       indent: 1 },
    { text: 'while cur.next:',                  indent: 1 },
    { text: 'cur = cur.next',                   indent: 2 },
    { text: 'cur.next = node',                  indent: 1 },
    { text: 'def delete(head, val):',           indent: 0 },
    { text: 'cur = head',                       indent: 1 },
    { text: 'while cur.next:',                  indent: 1 },
    { text: 'if cur.next.val == val:',          indent: 2 },
    { text: 'cur.next = cur.next.next',         indent: 3 },
    { text: 'return',                           indent: 3 },
    { text: 'cur = cur.next',                   indent: 2 },
  ],

  generateTrace(s) {
    const nums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const result = [];
    const list = [];

    // Insert
    for (const n of nums) {
      result.push({
        line: 5, currentChar: `append(${n})`, stack: [...list],
        action: 'CALL', description: `append(${n}) called`, highlight: null
      });
      result.push({
        line: 6, currentChar: `Node(${n})`, stack: [...list],
        action: 'CREATE', description: `Node(${n}) created`, highlight: null
      });
      if (list.length > 0) {
        result.push({
          line: 8, currentChar: `traverse`, stack: [...list],
          action: 'TRAVERSE', description: `Traverse to last node`, highlight: list[list.length - 1]
        });
      }
      list.push(n);
      result.push({
        line: 10, currentChar: `${n}`, stack: [...list],
        action: 'APPEND', description: `${n} linked`, highlight: n
      });
    }

    // Delete (from front)
    const deleteQueue = [...nums];
    while (deleteQueue.length > 0) {
      const target = deleteQueue.shift();
      result.push({
        line: 11, currentChar: `delete(${target})`, stack: [...list],
        action: 'CALL', description: `delete(${target}) called`, highlight: null
      });
      result.push({
        line: 13, currentChar: `searching...`, stack: [...list],
        action: 'SEARCH', description: `Search for node with val == ${target}`, highlight: target
      });
      const idx = list.indexOf(target);
      if (idx !== -1) {
        list.splice(idx, 1);
        result.push({
          line: 15, currentChar: `${target}`, stack: [...list],
          action: 'DELETE', description: `Node ${target} deleted → cur.next = cur.next.next`, highlight: null
        });
      }
    }

    result.push({
      line: 1, currentChar: 'None', stack: [],
      action: 'DONE ✅', description: 'List is empty', highlight: null
    });
    return result;
  },

  renderInput(s) {
    return `linked_list([<span style="color:#ffdd57;">${s}</span>])`;
  }
};

ALGO_LINKED_LIST.info = {
  summary: '연결 리스트는 각 노드가 다음 노드를 가리키는 포인터를 가지는 선형 자료구조입니다. 삽입과 삭제가 효율적입니다.',
  complexity: 'O(n)',
  space: 'O(n)',
  keyPoints: [
    '각 노드는 데이터(val)와 다음 노드 포인터(next)를 가짐',
    '삽입: 마지막 노드까지 순회 후 연결',
    '삭제: 삭제할 노드의 이전 노드의 next를 건너뜀',
  ],
};

ALGO_LINKED_LIST.renderVisual = function(step) {
  const list = step.stack || [];
  const highlight = step.highlight;
  const action = step.action;

  if (list.length === 0) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div style="color:#333;font-size:14px;">리스트 비어있음</div>
        <div style="font-size:12px;color:#555;">HEAD → NULL</div>
      </div>
    `;
  }

  const nodes = list.map((item, i) => {
    const isHighlight = item === highlight;
    const isDelete = action === 'DELETE' && item === highlight;
    const bg = isDelete ? '#3f0000' : isHighlight ? '#1e2d4a' : '#13161e';
    const border = isDelete ? '#ef4444' : isHighlight ? '#f59e0b' : '#2a3040';
    const textColor = isDelete ? '#ef4444' : isHighlight ? '#fbbf24' : '#d0d0d0';

    return `
      <div style="display:flex;align-items:center;gap:4px;">
        <div style="background:${bg};border:1.5px solid ${border};border-radius:10px;
          min-width:44px;height:44px;display:flex;flex-direction:column;
          align-items:center;justify-content:center;padding:0 8px;">
          <div style="font-size:15px;font-weight:bold;color:${textColor};">${item}</div>
          <div style="font-size:9px;color:#444;">val</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:1px;">
          <div style="font-size:10px;color:#555;">next</div>
          <div style="color:${i < list.length - 1 ? '#3b82f6' : '#333'};font-size:16px;">→</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="width:100%;overflow-x:auto;">
      <div style="display:flex;align-items:center;gap:2px;padding:8px;min-width:max-content;">
        <div style="font-size:12px;color:#10b981;margin-right:4px;font-weight:bold;">HEAD</div>
        <div style="color:#3b82f6;font-size:16px;margin-right:4px;">→</div>
        ${nodes}
        <div style="font-size:12px;color:#555;margin-left:2px;">NULL</div>
      </div>
    </div>
  `;
};
