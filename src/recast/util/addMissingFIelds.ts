import typesPlugin from 'ast-types/lib/types'
import { Fork } from 'ast-types/types'

export default function addMissingFields(fork: Fork): void {
  const types = fork.use(typesPlugin)
  const { Type } = types
  const { def, or } = Type

  const TypeAnnotation = or(
    def('TypeAnnotation'),
    def('TSTypeAnnotation'),
    null
  )
  const TypeParamDecl = or(
    def('TypeParameterDeclaration'),
    def('TSTypeParameterDeclaration'),
    null
  )

  def('ArrayPattern').field('typeAnnotation', TypeAnnotation, () => null)
  def('CallExpression')
    .field('typeAnnotation', TypeAnnotation, () => null)
    .field('typeArguments', TypeParamDecl, () => null)
    .field('typeParameters', TypeParamDecl, () => null)
  def('NewExpression').field('typeParameters', TypeParamDecl, () => null)
  def('ImportSpecifier').field(
    'importKind',
    or('value', 'type', 'typeof', null),
    () => null
  )
}
