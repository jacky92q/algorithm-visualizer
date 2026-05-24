var DATA_STRUCTURES = null;

function initData() {
  DATA_STRUCTURES = {
    stack: {
      name: 'Stack',
      desc: '후입선출 (LIFO)',
      icon: '📚',
      iconClass: 'stack',
      algorithms: {
        stack_basic: ALGO_STACK_BASIC,
        brackets:    ALGO_BRACKETS,
        dfs:         ALGO_DFS,
        rpn:         ALGO_RPN,
        palindrome:  ALGO_PALINDROME,
      }
    },
    queue: {
      name: 'Queue',
      desc: '선입선출 (FIFO)',
      icon: '🚶',
      iconClass: 'queue',
      algorithms: {
        queue_basic: ALGO_QUEUE_BASIC,
        bfs:         ALGO_BFS,
        bfs_maze:    ALGO_BFS_MAZE,
      }
    },
    linkedlist: {
      name: 'Linked List',
      desc: '연결 리스트',
      icon: '🔗',
      iconClass: 'linked',
      algorithms: {
        linked_list: ALGO_LINKED_LIST,
      }
    },
    tree: {
      name: 'Tree',
      desc: '이진 트리',
      icon: '🌲',
      iconClass: 'tree',
      algorithms: {
        binary_tree: ALGO_BINARY_TREE,
      }
    }
  };
}

function getCurrentAlgo() {
  return DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey];
}
