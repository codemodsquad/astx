import { Backend } from '../src/backend/Backend'
import { Node, NodePath, getAstxMatchInfo } from '../src/types'

export function extractSource(
  path: NodePath<Node, any>,
  source: string,
  backend: Backend
): string
export function extractSource(
  path: NodePath<Node, any>[],
  source: string,
  backend: Backend
): string[]
export function extractSource(
  path: NodePath<Node, any> | NodePath<Node, any>[],
  source: string,
  backend: Backend
): string | string[] {
  if (Array.isArray(path))
    return path.map((p) => extractSource(p, source, backend))
  const { node } = path
  const { start, end } = backend.location(node)
  if (start == null || end == null)
    throw new Error(`failed to get node source range`)
  // const { typeAnnotation } = node as any
  const astx = getAstxMatchInfo(node)

  if (astx?.subcapture) {
    return backend.generate(astx.subcapture).code
  }
  if (
    node.type === 'TSPropertySignature' ||
    node.type === 'TSMethodSignature'
  ) {
    return source.substring(start, end).replace(/[,;]$/, '')
  }

  return source.substring(start, end)
}
