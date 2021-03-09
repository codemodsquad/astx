import j, { ASTNode, ASTPath, Collection, Statement } from 'jscodeshift'
import t from 'ast-types'
import find, { Match, StatementsMatch } from './find'
import cloneDeep from 'lodash/cloneDeep'

export function replaceCaptures(
  path: ASTPath<any>,
  captures: Record<string, ASTNode>
): void {
  const doReplace = (path: ASTPath<any>) => {
    const captureMatch = /^\$[a-z0-9]+/i.exec(path.node.name)
    const captureName = captureMatch ? captureMatch[0] : null
    const capture = captureName ? captures[captureName] : null
    if (capture) {
      if (
        t.namedTypes.Statement.check(capture) &&
        !t.namedTypes.Statement.check(path.parentPath.node)
      ) {
        if (path.parentPath.node?.type !== 'ExpressionStatement') {
          throw new Error(
            `can't replace ${captureName} because it captured a statement, but a statement can't go in replacement position`
          )
        }
        path.parentPath.replace(capture)
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
    const { parentPath: parent } = path
    const captureHolder = getCaptureHolder(path)
    if (!captureHolder) return
    const captureMatch = /^\$_?[a-z0-9]+/i.exec(path.node.name)
    const capture = captureMatch ? arrayCaptures[captureMatch[0]] : null
    if (!capture) return
    for (const replacement of capture) {
      switch (parent.node.type) {
        case 'SpreadElement':
        case 'SpreadProperty':
          captureHolder.insertBefore(replacement)
          break
        case 'ObjectProperty':
        case 'Property':
          if (parent.node.shorthand && parent.node.key === path.node) {
            captureHolder.insertBefore(replacement)
          }
          break
        // eslint-disable-next-line no-fallthrough
        default:
          path.replace(replacement)
          captureHolder.insertBefore(cloneDeep(captureHolder.node))
      }
    }
    captureHolder.prune()
  }

  j([path])
    .find(j.Identifier)
    // filter out identifiers that are the value node of shorthand properties.
    // it was causing problems when the value node was getting visited after the property was replaced
    .filter((path: ASTPath<any>) => {
      const { parentPath: parent } = path
      return (
        (parent.node.type !== 'ObjectProperty' &&
          parent.node.type !== 'Property') ||
        !parent.node.shorthand ||
        path.node !== parent.node.value
      )
    })
    .forEach(doReplace)
  j([path]).find(j.TypeParameter).forEach(doReplace)
  j([path]).find(j.TSTypeParameter).forEach(doReplace)
}

export function replaceMatches<Node extends ASTNode>(
  matches: Match<Node>[],
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): void {
  for (const match of matches) {
    const replacement =
      typeof replace === 'function' ? replace(match) : cloneDeep(replace)
    switch (match.node.type) {
      case 'ClassDeclaration':
      case 'ClassExpression':
        if (
          replacement.type !== match.node.type &&
          (replacement.type === 'ClassDeclaration' ||
            replacement.type === 'ClassExpression')
        ) {
          replacement.type = match.node.type
        }
        break
    }
    const [replaced] = match.path.replace(replacement)
    if (match.arrayCaptures) replaceArrayCaptures(replaced, match.arrayCaptures)
    if (match.captures) replaceCaptures(replaced, match.captures)
  }
}

export function replaceStatementsMatches(
  matches: StatementsMatch[],
  replace:
    | Statement
    | Statement[]
    | ((match: StatementsMatch) => Statement | Statement[])
): void {
  for (const match of matches) {
    const _replacements =
      typeof replace === 'function' ? replace(match) : cloneDeep(replace)
    const replacements = Array.isArray(_replacements)
      ? _replacements
      : [_replacements]
    const parent = match.paths[0].parentPath
    let index = match.paths[0].name
    for (const replacement of replacements) {
      parent.insertAt(index, replacement)
      const replaced = parent.get(index++)
      if (match.arrayCaptures)
        replaceArrayCaptures(replaced, match.arrayCaptures)
      if (match.captures) replaceCaptures(replaced, match.captures)
    }
    for (const path of match.paths) path.prune()
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
): void
export default function replace(
  root: Collection,
  query: Statement[],
  replace:
    | Statement
    | Statement[]
    | ((match: StatementsMatch) => Statement | Statement[]),
  options?: ReplaceOptions
): void
export default function replace<Node extends ASTNode>(
  root: Collection,
  query: Node | Statement[],
  replace:
    | ASTNode
    | Statement
    | Statement[]
    | ((match: Match<Node>) => ASTNode)
    | ((match: StatementsMatch) => Statement | Statement[]),
  options?: ReplaceOptions
): void {
  if (Array.isArray(query)) {
    const matches = find(root, query, options)
    replaceStatementsMatches(
      matches,
      replace as
        | Statement
        | Statement[]
        | ((match: StatementsMatch) => Statement | Statement[])
    )
  } else {
    const matches = find(root, query, options)
    replaceMatches(
      matches,
      replace as ASTNode | ((match: Match<Node>) => ASTNode)
    )
  }
}
