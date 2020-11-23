import j, { ASTNode, ASTPath, Collection } from 'jscodeshift'
import find, { Match } from './find'

export function replaceCaptures(
  path: ASTPath<any>,
  captures: Record<string, ASTNode>
): void {
  j([path])
    .find(j.Identifier)
    .forEach((path: ASTPath<any>) => {
      const captureMatch = /^\$([a-z0-9]+)/i.exec(path.node.name)
      if (!captureMatch) return
      const capture = captures[captureMatch[1]]
      if (!capture) return
      path.replace(capture)
    })
}

export function replaceMatches<Node extends ASTNode>(
  matches: Match<Node>[],
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): void {
  for (const match of matches) {
    const [replaced] = match.path.replace(
      typeof replace === 'function' ? replace(match) : replace
    )
    if (match.captures) replaceCaptures(replaced, match.captures)
  }
}

export default function replace<Node extends ASTNode>(
  root: Collection,
  query: Node,
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): void {
  const matches = find(root, query)
  replaceMatches(matches, replace)
}
