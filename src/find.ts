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

  const matches: Array<Match<Node>> = []

  const match = compileMatcher(query, options)

  root.find(nodeType).forEach((path: ASTPath<any>) => {
    let captures: Record<string, ASTPath<any>> | null = null
    if (
      match(path, {
        ...options,
        onCapture: (identifier, path) => {
          if (!captures) captures = {}
          captures[identifier] = path
        },
      })
    ) {
      const match: Match<Node> = { path, node: path.node }
      if (captures) {
        const pathCaptures: Record<string, ASTPath<any>> = captures
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
