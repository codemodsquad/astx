import { ASTNode, ASTPath } from './'

export default function getChildPathsArray<
  Node extends ASTNode,
  K extends keyof Node
>(
  path: ASTPath<Node>,
  key: K
): Node[K] extends (infer T)[] ? ASTPath<T>[] : never {
  return path.get(key) as any
}
