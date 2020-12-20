import j, { ASTPath, ASTNode, Collection } from 'jscodeshift'
import mapValues from './util/mapValues'
import isEmpty from './util/isEmpty'
import matchAgainstQuery from './matchAgainstQuery/index'

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

  root.find(nodeType).forEach((path: ASTPath<any>) => {
    const pathCaptures: Record<string, ASTPath<any>> = {}
    if (
      matchAgainstQuery(path, query, {
        ...options,
        onCapture: (identifier, path) => (pathCaptures[identifier] = path),
      })
    ) {
      const match: Match<Node> = { path, node: path.node }
      matches.push(
        isEmpty(pathCaptures)
          ? match
          : {
              ...match,
              pathCaptures,
              captures: mapValues(pathCaptures, path => path.node),
            }
      )
    }
  })

  return matches
}
