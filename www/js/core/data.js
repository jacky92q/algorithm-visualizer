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
    },
    sorting: {
      name: 'Sorting',
      desc: 'Array Sorting Algorithms',
      iconClass: 'sorting',
      algorithms: {
        bubble_sort: ALGO_BUBBLE_SORT,
        quick_sort:  ALGO_QUICK_SORT,
        merge_sort:  ALGO_MERGE_SORT,
      }
    },
    search: {
      name: 'Search',
      desc: 'Array Search Algorithms',
      iconClass: 'search',
      algorithms: {
        binary_search: ALGO_BINARY_SEARCH,
      }
    },
    graph: {
      name: 'Graph',
      desc: 'Graph Algorithms',
      iconClass: 'graph',
      algorithms: {
        dijkstra: ALGO_DIJKSTRA,
      }
    },
    dp: {
      name: 'Dynamic Programming',
      desc: 'DP Algorithms',
      iconClass: 'dp',
      algorithms: {
        fibonacci: ALGO_FIBONACCI,
      }
    }
  };
}

function getCurrentAlgo() {
  return DATA_STRUCTURES[currentDS].algorithms[currentAlgoKey];
}
