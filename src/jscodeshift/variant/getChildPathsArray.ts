import { ASTNode, ASTPath } from './'

export default function getChildPathsArray<
  Node extends ASTNode,
  K extends keyof Node
>(
  path: ASTPath<Node>,
  key: K
): Node[K] extends (infer T)[] ? ASTPath<T>[] : ASTPath<Node[K]> {
  const result = path.get(key)
  return Array.isArray(result.value)
    ? result.map((path: ASTPath<any>) => path)
    : result
}
