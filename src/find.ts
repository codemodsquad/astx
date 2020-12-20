import j, { ASTPath, ASTNode, Collection } from 'jscodeshift'
import mapValues from 'lodash/mapValues'
import compileMatcher from './compileMatcher'

export type Match<Node extends ASTNode> = {
  path: ASTPath<Node>
  node: Node
  pathCaptures?: Record<string, ASTPath<any>>
  captures?: Record<string, ASTNode>
}

function getNodeType(query: ASTNode): any {
  switch (query.type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
      return j.Function
    default:
      return j[query.type] as any
  }
}

export type FindOptions = {
  where?: { [captureName: string]: (path: ASTPath<any>) => boolean }
}

export default function find<Node extends ASTNode>(
  root: Collection,
  query: Node,
  options?: FindOptions
): Array<Match<Node>> {
  const nodeType = getNodeType(query)
  const match = compileMatcher(query, options)

  const matches: Array<Match<Node>> = []
  root.find(nodeType).forEach((path: ASTPath<any>) => {
    const result = match(path)
    if (result) {
      const match: Match<Node> = { path, node: path.node }
      const { captures: pathCaptures } = result
      if (pathCaptures) {
        match.pathCaptures = pathCaptures
        match.captures = mapValues(
          pathCaptures,
          (path: ASTPath<any>) => path.node
        )
      }
      matches.push(match)
    }
  })

  return matches
}
