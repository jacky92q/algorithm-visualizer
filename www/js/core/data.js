var DATA_STRUCTURES = null;

function initData() {
  DATA_STRUCTURES = {
    stack: {
      name: 'Stack',
      desc: 'Last In First Out',
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
      desc: 'First In First Out',
      iconClass: 'queue',
      algorithms: {
        queue_basic: ALGO_QUEUE_BASIC,
        bfs:         ALGO_BFS,
        bfs_maze:    ALGO_BFS_MAZE,
      }
    },
    linkedlist: {
      name: 'Linked List',
      desc: 'Node-based Data Structure',
      iconClass: 'linked',
      algorithms: {
        linked_list: ALGO_LINKED_LIST,
      }
    },
    tree: {
      name: 'Tree',
      desc: 'Binary Tree Structure',
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
