import * as t from '@babel/types'
import traverse, { NodePath } from '@babel/traverse'

export default function prepareForBabelGenerate<T extends t.Node>(ast: T): T {
  traverse(ast, {
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      const { specifiers } = path.node
      if (specifiers) {
        const defaultIndex = specifiers.findIndex(
          (s) => s.type === 'ImportDefaultSpecifier'
        )
        if (defaultIndex > 0) {
          const specifier = specifiers[defaultIndex]
          specifiers.splice(defaultIndex, 1)
          specifiers.unshift(specifier)
        }
      }
    },
    ClassDeclaration(path: NodePath<t.ClassDeclaration>) {
      if (path.node.implements?.length === 0) delete path.node.implements
    },
    ClassExpression(path: NodePath<t.ClassExpression>) {
      if (path.node.implements?.length === 0) delete path.node.implements
    },
  })
  return ast
}
