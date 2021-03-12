import j, {
  ASTNode,
  ASTPath,
  Collection,
  Identifier,
  Statement,
} from 'jscodeshift'
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
  while (path && path.node?.type !== 'Program' && path.parentPath) {
    if (Array.isArray(path.parentPath.value)) return path
    if (path.parentPath.node?.type === 'Statement') return null
    path = path.parentPath
  }
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
        case 'ObjectProperty':
        case 'Property':
          if (parent.node.shorthand && parent.node.key === path.node) {
            captureHolder.insertBefore(replacement)
          }
          break
        default:
          captureHolder.insertBefore(replacement)
      }
    }
    captureHolder.prune()
  }

  j([path])
    .find(j.Identifier)
    // filter out identifiers that are the value node of shorthand properties, or the local node of shorthand import specifiers.
    // it was causing problems when the value node was getting visited after the property was replaced
    .filter((path: ASTPath<Identifier>): boolean => {
      const { parentPath: parent } = path
      switch (parent.node.type) {
        case 'ObjectProperty':
        case 'Property':
          return !parent.node.shorthand || path.node !== parent.node.value
        case 'ImportSpecifier':
          return (
            path.node === parent.node.imported ||
            (path.node === parent.node.local &&
              parent.node.local.name !== parent.node.imported.name)
          )
        default:
          return true
      }
    })
    .forEach(doReplace)
  j([path])
    .find(j.JSXAttribute)
    .filter((path: ASTPath<Identifier>): boolean => {
      const { parentPath: parent } = path
      return parent.node.type !== 'JSXAttribute' || parent.node.value == null
    })
    .forEach(doReplace)
  j([path]).find(j.TypeParameter).forEach(doReplace)
  j([path]).find(j.TSTypeParameter).forEach(doReplace)
}

export function generateReplacements<Node extends ASTNode>(
  matches: Match<Node>[],
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): ASTNode[] {
  return matches.map(
    (match: Match<Node>): ASTNode => {
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
      const path = j([replacement]).paths()[0]
      if (match.arrayCaptures) replaceArrayCaptures(path, match.arrayCaptures)
      if (match.captures) replaceCaptures(path, match.captures)
      return path.node
    }
  )
}

export function replaceMatches<Node extends ASTNode>(
  matches: Match<Node>[],
  replace: ASTNode | ((match: Match<Node>) => ASTNode)
): void {
  const replacements = generateReplacements(matches, replace)
  for (let i = 0; i < matches.length; i++) {
    matches[i].path.replace(replacements[i])
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
