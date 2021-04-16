import {
  Node as ASTNode,
  NodePath,
  Root,
  Expression,
  Identifier,
  Statement,
  isStatement,
  visit,
  TemplateLiteral,
} from './variant'
import j from 'jscodeshift'
import find, { Match, StatementsMatch } from './find'
import cloneDeep from 'lodash/cloneDeep'

export function replaceCaptures(
  path: NodePath<any>,
  captures: Record<string, ASTNode>
): void {
  const doReplace = (path: NodePath<any>) => {
    const captureMatch = /^\$[a-z0-9]+/i.exec(path.node.name)
    const captureName = captureMatch ? captureMatch[0] : null
    const capture = captureName ? captures[captureName] : null
    if (capture) {
      if (isStatement(capture) && !isStatement(path.parentPath.node)) {
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
  visit(path, {
    Identifier: doReplace,
    TypeParameter: doReplace,
    TSTypeParameter: doReplace,
  })
}

export function replaceStringCaptures(
  path: NodePath<any>,
  captures: Record<string, string>
): void {
  const replaceOnLiteral = (path: NodePath<any>) => {
    const captureMatch = /^\$[a-z0-9]+/i.exec(path.node.value)
    const captureName = captureMatch ? captureMatch[0] : null
    const capture = captureName ? captures[captureName] : null
    if (capture) {
      path.node.value = capture
    } else {
      const escaped = path.node.value.replace(/^\$\$/, '$')
      if (escaped !== path.node.value) path.node.value = escaped
    }
  }
  visit(path, {
    StringLiteral: replaceOnLiteral,
    Literal: replaceOnLiteral,
    TemplateLiteral: (path: NodePath<TemplateLiteral>) => {
      if (path.node.quasis.length !== 1) return
      const [quasi] = path.node.quasis
      const { cooked } = quasi.value
      if (cooked == null) return
      const captureMatch = /^\$[a-z0-9]+/i.exec(cooked)
      const captureName = captureMatch ? captureMatch[0] : null
      const capture = captureName ? captures[captureName] : null
      if (capture) {
        quasi.value = {
          // TODO: this doesn't completely produce the correct raw string
          raw: capture.replace(/\\|`|\${/g, '\\$&'),
          cooked: capture,
        }
      } else {
        const escaped = cooked.replace(/^\$\$/, '$')
        if (escaped !== cooked) quasi.value = { raw: escaped, cooked: escaped }
      }
    },
  })
}

function getCaptureHolder(path: NodePath<any>): NodePath<any> | null {
  while (path && path.node?.type !== 'Program' && path.parentPath) {
    if (Array.isArray(path.parentPath.value)) return path
    path = path.parentPath
  }
  return null
}

export function replaceArrayCaptures(
  path: NodePath<any>,
  arrayCaptures: Record<string, ASTNode[]>
): void {
  const doReplace = (path: NodePath<any>) => {
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

  const replacePaths: NodePath<any>[] = []

  visit(path, {
    Identifier: (path: NodePath<Identifier>): void => {
      const included = (() => {
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
      })()
      if (included) replacePaths.push(path)
    },
    JSXAttribute: (path: NodePath<Identifier>): void => {
      const { parentPath: parent } = path
      if (parent.node.type !== 'JSXAttribute' || parent.node.value == null)
        replacePaths.push(path)
    },
    TypeParameter: doReplace,
    TSTypeParameter: doReplace,
  })

  for (const identifier of replacePaths) doReplace(identifier)
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
      if (match.stringCaptures)
        replaceStringCaptures(path, match.stringCaptures)
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

function ensureStatements(
  value: Expression | Statement | Statement[]
): Statement[] {
  if (Array.isArray(value)) return value
  if (isStatement(value)) return [value]
  return [j.expressionStatement(value as Expression)]
}

export function replaceStatementsMatches(
  matches: StatementsMatch[],
  replace:
    | Expression
    | Statement
    | Statement[]
    | ((match: StatementsMatch) => Expression | Statement | Statement[])
): void {
  for (const match of matches) {
    const replacements = ensureStatements(
      typeof replace === 'function' ? replace(match) : cloneDeep(replace)
    )
    const parent = match.paths[0].parentPath
    let index = match.paths[0].name
    for (const replacement of replacements) {
      parent.insertAt(index, replacement)
      const replaced = parent.get(index++)
      if (match.arrayCaptures)
        replaceArrayCaptures(replaced, match.arrayCaptures)
      if (match.captures) replaceCaptures(replaced, match.captures)
      if (match.stringCaptures)
        replaceStringCaptures(replaced, match.stringCaptures)
    }
    for (const path of match.paths) path.prune()
  }
}

export type ReplaceOptions = {
  where?: { [captureName: string]: (path: NodePath<any>) => boolean }
}
export default function replace<Node extends ASTNode>(
  root: Root,
  query: Node,
  replace: ASTNode | ((match: Match<Node>) => ASTNode),
  options?: ReplaceOptions
): void
export default function replace(
  root: Root,
  query: Statement[],
  replace:
    | Statement
    | Statement[]
    | ((match: StatementsMatch) => Statement | Statement[]),
  options?: ReplaceOptions
): void
export default function replace<Node extends ASTNode>(
  root: Root,
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
        | Expression
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
