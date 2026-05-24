const ALGO_BINARY_TREE = {
  name: 'Binary Tree',
  desc: '중위순회 (Inorder)',
  defaultInput: '4,2,6,1,3,5,7',
  inputPlaceholder: '예: 4,2,6,1,3,5,7',
  inputDesc: '레벨 순서로 노드값 입력 (BFS 순서)',
  sourceCode: [
    { text: 'def inorder(root, stack):',     indent: 0 },
    { text: 'cur = root',                    indent: 1 },
    { text: 'while cur or stack:',           indent: 1 },
    { text: 'while cur:',                    indent: 2 },
    { text: 'stack.append(cur)',             indent: 3 },
    { text: 'cur = cur.left',               indent: 3 },
    { text: 'cur = stack.pop()',             indent: 2 },
    { text: 'visit(cur.val)',               indent: 2 },
    { text: 'cur = cur.right',              indent: 2 },
  ],
  generateTrace(s) {
    const nums = s.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const result = [];
    const stack = [];
    const visited = [];

    // 배열로 트리 표현
    // 중위순회: left → root → right
    function inorder(idx) {
      if (idx >= nums.length) return;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      // 왼쪽으로
      if (left < nums.length) {
        stack.push(nums[idx]);
        result.push({ line: 5, currentChar: `${nums[idx]}`, stack: [...stack], action: 'PUSH', description: `노드 ${nums[idx]} 스택에 push, 왼쪽으로` });
        inorder(left);
      }

      // 방문
      if (stack[stack.length - 1] === nums[idx] || left >= nums.length) {
        if (stack.includes(nums[idx])) stack.splice(stack.lastIndexOf(nums[idx]), 1);
        visited.push(nums[idx]);
        result.push({ line: 8, currentChar: `${nums[idx]}`, stack: [...stack], action: 'VISIT', description: `노드 ${nums[idx]} 방문! 순서: [${visited.join(', ')}]` });
      }

      // 오른쪽으로
      if (right < nums.length) {
        result.push({ line: 9, currentChar: `${nums[idx]}`, stack: [...stack], action: 'RIGHT', description: `오른쪽 자식 ${nums[right]}으로 이동` });
        inorder(right);
      }
    }

    result.push({ line: 2, currentChar: `root: ${nums[0]}`, stack: [], action: 'INIT', description: `루트: ${nums[0]}, 중위순회 시작` });
    inorder(0);
    result.push({ line: 3, currentChar: '', stack: [], action: 'DONE ✅', description: `중위순회 완료: [${visited.join(', ')}]` });
    return result;
  },
  renderInput(s) {
    return `inorder(<span style="color:#ffdd57;">[${s}]</span>)`;
  }
};
