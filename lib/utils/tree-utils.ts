type TreeNode = {
  id: string;
  children?: unknown[];
  level?: number;
};

const DEFAULT_LEVEL = 999;

const isValidTreeNode = (node: unknown): node is TreeNode => {
  return (
    node !== null &&
    typeof node === 'object' &&
    'id' in node
  );
};

const hasLevel = (node: TreeNode): node is TreeNode & { level: number } => {
  return 'level' in node && typeof node.level === 'number';
};

const traverseTree = (
  node: unknown,
  callback: (node: TreeNode) => void
): void => {
  if (!isValidTreeNode(node)) return;
  
  callback(node);
  
  if (node.children) {
    node.children.forEach(child => traverseTree(child, callback));
  }
};

const searchTree = (
  node: unknown,
  predicate: (node: TreeNode) => boolean
): TreeNode | null => {
  if (!isValidTreeNode(node)) return null;
  
  if (predicate(node)) return node;
  
  if (node.children) {
    for (const child of node.children) {
      const found = searchTree(child, predicate);
      if (found) return found;
    }
  }
  
  return null;
};

export const collectAllNodeIds = (tree: unknown): Set<string> => {
  const nodeIds = new Set<string>();
  
  traverseTree(tree, (node) => {
    nodeIds.add(node.id);
  });
  
  return nodeIds;
};

export const findNodeById = (tree: unknown, nodeId: string): TreeNode | null => {
  return searchTree(tree, (node) => node.id === nodeId);
};

export const getNodeLevel = (tree: unknown, nodeId: string): number => {
  const node = findNodeById(tree, nodeId);
  return node && hasLevel(node) ? node.level : DEFAULT_LEVEL;
};

export const sortNodesByLevel = (tree: unknown, nodeIds: string[]): string[] => {
  return nodeIds.sort((a, b) => getNodeLevel(tree, a) - getNodeLevel(tree, b));
};