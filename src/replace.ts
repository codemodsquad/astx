import j, { ASTNode, ASTPath, Collection } from 'jscodeshift'
import find, { Match } from './find'
import cloneDeep from 'lodash/cloneDeep'

export function replaceCaptures(
  path: ASTPath<any>,
  captures: Record<string, ASTNode>
): void {
  j([path])
    .find(j.Identifier)
    .forEach((path: ASTPath<any>) => {
      const captureMatch = /^\$[a-z0-9]+/i.exec(path.node.name)
      const capture = captureMatch ? captures[captureMatch[0]] : null
      if (capture) {
        path.replace(capture)
      } else {
        const escaped = path.node.name.replace(/^\$\$/, '$')
        if (escaped !== path.node.name) path.replace(j.identifier(escaped))
      }
    })
}

export function replaceMatches<Node extends ASTNode>(
  matches: Match<Node>[],
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): void {
  for (const match of matches) {
    const [replaced] = match.path.replace(
      typeof replace === 'function' ? replace(match) : cloneDeep(replace)
    )
    if (match.captures) replaceCaptures(replaced, match.captures)
  }
}

export type ReplaceOptions = {
  where?: { [captureName: string]: (path: ASTPath<any>) => boolean }
}

export default function replace<Node extends ASTNode>(
  root: Collection,
  query: Node,
  replace: ASTNode | ((match: Match<Node>) => ASTNode),
  options?: ReplaceOptions
): void {
  const matches = find(root, query, options)
  replaceMatches(matches, replace)
}
