import Astx from '../Astx'
import { Node, NodePath } from '../types'
import * as t from '@babel/types'
import findImports from './findImports'
import { stripImportKind } from './imports'
import {
  getPlaceholder,
  unescapeIdentifier,
} from '../compileMatcher/Placeholder'

export default function addImports(
  astx: Astx,
  pattern: readonly NodePath<Node, any>[]
): Astx {
  for (const { node } of pattern) {
    if (node.type !== 'ImportDeclaration') {
      throw new Error(
        `statement is not an import declaration: ${
          astx.backend.generate(node).code
        }`
      )
    }
  }

  function addDeclaration(decl: t.ImportDeclaration) {
    astx.context.simpleReplacements?.bail()
    const before =
      astx.find(
        (a) =>
          a.node.type === 'ImportDeclaration' &&
          a.node.source.value === decl.source.value
      ).matched || astx.find((a) => a.node.type === 'ImportDeclaration').matched
    if (before) {
      before.paths[before.paths.length - 1].insertAfter(decl)
    } else {
      const after = astx.find((a) =>
        astx.context.backend.t.namedTypes.Statement.check(a.node)
      ).matched
      if (after) {
        after.paths[0].insertBefore(decl)
      } else {
        const program = astx.find((a) => a.node.type === 'Program').paths[0]
        if (program) {
          program.get('body').unshift(decl)
        }
      }
    }
  }

  for (const { node } of pattern) {
    const decl: t.ImportDeclaration = node as any

    if (!decl.specifiers?.length) {
      if (
        astx.find(
          (a) =>
            a.node.type === 'ImportDeclaration' &&
            a.node.source.value === decl.source.value
        ).matched
      ) {
        continue
      }
      addDeclaration(t.cloneNode(decl))
    } else {
      for (let specifier of decl.specifiers) {
        if (
          astx.findImports({
            ...decl,
            specifiers: [specifier],
          }).matched
        ) {
          continue
        }

        if (getPlaceholder(specifier.local.name)) {
          specifier = {
            ...specifier,
            local:
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.type === 'Identifier'
                ? specifier.imported
                : t.identifier(specifier.local.name.replace(/^\$+/, '')),
          }
        } else {
          specifier = {
            ...specifier,
            local: t.identifier(unescapeIdentifier(specifier.local.name)),
          }
        }
        const existingImportKind = astx.find(
          (a) =>
            a.node.type === 'ImportDeclaration' &&
            a.node.source.value === decl.source.value &&
            (a.node.importKind || 'value') === (decl.importKind || 'value') &&
            (specifier.type !== 'ImportNamespaceSpecifier' ||
              !a.node.specifiers?.length) &&
            !a.node.specifiers?.some(
              (s) => s.type === 'ImportNamespaceSpecifier'
            )
        )
        if (existingImportKind.matched) {
          const existingDecl: t.ImportDeclaration =
            existingImportKind.node as any
          astx.context.simpleReplacements?.bail()
          addSpecifierToDeclaration(existingDecl, t.cloneNode(specifier))
        } else {
          addDeclaration(t.cloneNode({ ...decl, specifiers: [specifier] }))
        }
      }
    }
  }

  return findImports(astx, pattern)
}

function addSpecifierToDeclaration(
  decl: t.ImportDeclaration,
  specifier:
    | t.ImportSpecifier
    | t.ImportNamespaceSpecifier
    | t.ImportDefaultSpecifier
) {
  if (decl.importKind === 'type' || decl.importKind === 'typeof') {
    specifier = stripImportKind(specifier)
  }
  if (!decl.specifiers?.length) {
    decl.specifiers = [specifier]
  } else if (specifier.type === 'ImportDefaultSpecifier') {
    if (decl.specifiers.some((s) => s.type === 'ImportDefaultSpecifier')) {
      decl.specifiers.push(
        t.importSpecifier(specifier.local, t.identifier('default'))
      )
    } else {
      decl.specifiers.unshift(specifier)
    }
  } else {
    decl.specifiers.push(specifier)
  }
}
