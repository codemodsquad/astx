import j, { ASTNode, ASTPath, Collection } from 'jscodeshift'
import t from 'ast-types'
import find, { Match } from './find'
import cloneDeep from 'lodash/cloneDeep'

function getParentStatement(path: ASTPath<any>): ASTPath<any> | null {
  do {
    if (t.namedTypes.Statement.check(path?.node)) return path
    path = path.parentPath
  } while (path != null && path.node?.type !== 'Program')
}

export function replaceCaptures(
  path: ASTPath<any>,
  captures: Record<string, ASTNode>
): void {
  const doReplace = (path: ASTPath<any>) => {
    const captureMatch = /^\$[a-z0-9]+/i.exec(path.node.name)
    const capture = captureMatch ? captures[captureMatch[0]] : null
    if (capture) {
      if (t.namedTypes.Statement.check(capture)) {
        getParentStatement(path).replace(capture)
      } else {
        path.replace(capture)
      }
    } else {
      const escaped = path.node.name.replace(/^\$\$/, '$')
      if (escaped !== path.node.name) path.replace(j.identifier(escaped))
    }
  }
  j([path]).find(j.Identifier).forEach(doReplace)
  j([path]).find(j.TypeParameter).forEach(doReplace)
  j([path]).find(j.TSTypeParameter).forEach(doReplace)
}

function getCaptureHolder(path: ASTPath<any>): ASTPath<any> | null {
  do {
    if (Array.isArray(path.parentPath.value)) return path
    if (path.parentPath.node?.type === 'Statement') return null
    path = path.parentPath
  } while (path != null && path.node?.type !== 'Program')
}

export function replaceArrayCaptures(
  path: ASTPath<any>,
  arrayCaptures: Record<string, ASTNode[]>
): void {
  const doReplace = (path: ASTPath<any>) => {
    const { parent } = path
    const captureHolder = getCaptureHolder(path)
    if (!captureHolder) return
    const captureMatch = /^\$_?[a-z0-9]+/i.exec(path.node.name)
    const capture = captureMatch ? arrayCaptures[captureMatch[0]] : null
    if (!capture) return
    for (const replacement of capture) {
      if (
        parent.node.type === 'SpreadElement' ||
        parent.node.type === 'SpreadProperty'
      ) {
        captureHolder.insertBefore(replacement)
      } else {
        path.replace(replacement)
        // const replacementNode = cloneDeep(captureHolder.node)
        captureHolder.insertBefore(cloneDeep(captureHolder.node))
      }
    }
    captureHolder.prune()
  }

  j([path]).find(j.Identifier).forEach(doReplace)
  j([path]).find(j.TypeParameter).forEach(doReplace)
  j([path]).find(j.TSTypeParameter).forEach(doReplace)
}

export function replaceMatches<Node extends ASTNode>(
  matches: Match<Node>[],
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): void {
  for (const match of matches) {
    const [replaced] = match.path.replace(
      typeof replace === 'function' ? replace(match) : cloneDeep(replace)
    )
    if (match.arrayCaptures) replaceArrayCaptures(replaced, match.arrayCaptures)
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
