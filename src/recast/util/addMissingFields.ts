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
  const TypeParamInst = or(
    def('TypeParameterInstantiation'),
    def('TSTypeParameterInstantiation'),
    null
  )

  def('ArrayPattern').field('typeAnnotation', TypeAnnotation, () => null)
  def('CallExpression')
    .field('typeParameters', TypeParamInst, () => null)
    .field('typeArguments', TypeParamInst, () => null)
  def('NewExpression')
    .field('typeParameters', TypeParamInst, () => null)
    .field('typeArguments', TypeParamInst, () => null)
  def('ImportSpecifier').field(
    'importKind',
    or('value', 'type', 'typeof', null),
    () => null
  )

  def('Program').bases('Block')
  def('BlockStatement').bases('Block')
  def('TSModuleBlock').bases('Block')
}
