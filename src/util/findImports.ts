import { ImportDeclaration } from '@babel/types'
import Astx from '../Astx'
import * as t from '@babel/types'
import { Node, NodePath } from '../types'
import { Match } from '../find'
import {
  addImportKind,
  getImportKind,
  getImported,
  stripImportKind,
} from './imports'

export default function findImports(
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

  // pre-filter down to import declarations to speed up going through the various
  // patterns for each import specifier in the pattern
  const allExisting = astx.find(
    (a) => a.node.type === 'ImportDeclaration'
  ).matched
  if (!allExisting) return new Astx(astx.context, [])

  const matches: Match[] = []

  const restSpecifier = () =>
    t.importSpecifier(t.identifier('$$$'), t.identifier('$$$'))

  for (const { node } of pattern) {
    const decl: ImportDeclaration = node as any
    // filter down to only declarations where the source matches to speed up
    // going through the various patterns for each import specifier in the pattern
    const existing = allExisting.filter(
      (a) => (a.node as ImportDeclaration).source.value === decl.source.value
    ).matched
    if (!existing) return new Astx(astx.context, [])

    if (!decl.specifiers?.length) {
      const match =
        existing.find(decl).matched ||
        existing.find(t.importDeclaration([restSpecifier()], decl.source))
          .matched
      if (!match) return new Astx(astx.context, [])
      matches.push(...match.matches)
    } else {
      for (const specifier of decl.specifiers) {
        const cases: Node[] = []

        const importKind = getImportKind(specifier, decl.importKind || 'value')
        if (importKind === 'type') {
          // try import type { $specifier, $$$ }
          cases.push({
            ...t.importDeclaration(
              [stripImportKind(specifier), restSpecifier()],
              decl.source
            ),
            importKind: 'type',
          })
          if (specifier.type === 'ImportSpecifier') {
            // try import { type $specifier, $$$ }
            cases.push(
              t.importDeclaration(
                [addImportKind(specifier, 'type'), restSpecifier()],
                decl.source
              )
            )
            if (getImported(specifier) === 'default') {
              // try import { type default as $specifier.local, $$$ }
              cases.push({
                ...t.importDeclaration(
                  [t.importDefaultSpecifier(specifier.local), restSpecifier()],
                  decl.source
                ),
                importKind: 'type',
              })
            }
          }
          if (specifier.type === 'ImportDefaultSpecifier') {
            // try import { default as $specifier.local, $$$ }
            cases.push(
              t.importDeclaration(
                [
                  addImportKind(
                    t.importSpecifier(specifier.local, t.identifier('default')),
                    'type'
                  ),
                  restSpecifier(),
                ],
                decl.source
              )
            )
          }
        }
        // try import { $specifier, $$$ }
        cases.push(
          t.importDeclaration(
            [stripImportKind(specifier), restSpecifier()],
            decl.source
          )
        )
        if (
          specifier.type === 'ImportSpecifier' &&
          getImported(specifier) === 'default'
        ) {
          // try import $specifier, { $$$ }
          cases.push(
            t.importDeclaration(
              [t.importDefaultSpecifier(specifier.local), restSpecifier()],
              decl.source
            )
          )
        }
        if (specifier.type === 'ImportDefaultSpecifier') {
          // try import { default as $specifier.local, $$$ }
          cases.push(
            t.importDeclaration(
              [
                t.importSpecifier(specifier.local, t.identifier('default')),
                restSpecifier(),
              ],
              decl.source
            )
          )
        }

        let found = false

        for (const node of cases) {
          const match = existing.find(node).matched
          if (match) {
            found = true
            matches.push(...match.matches)
            break
          }
        }

        if (!found) return new Astx(astx.context, [])
      }
    }
  }
  return new Astx(astx.context, matches)
}
