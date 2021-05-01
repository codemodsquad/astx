import { GenericTypeAnnotation, TSTypeReference, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileOptionalMatcher from './Optional'

import compileOrMatcher from './Or'
import compileAndMatcher from './And'

export default function compileSpecialType(
  name: string,
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern = path.node
  const { typeParameters }: GenericTypeAnnotation | TSTypeReference = pattern
  if (!typeParameters) return
  const { params } = typeParameters
  const paramsPath = path.get('typeParameters').get('params')
  switch (name) {
    case '$Optional':
      if (params.length !== 1) {
        throw new Error(`$Optional must be used with 1 type parameter`)
      }
      return compileOptionalMatcher(paramsPath.get(0), compileOptions)
    case '$Or':
      if (params.length < 2) {
        throw new Error(`$Or must be called with at least 2 arguments`)
      }
      return compileOrMatcher(
        paramsPath.filter(() => true),
        compileOptions
      )
    case '$And':
      if (params.length < 2) {
        throw new Error(`$And must be called with at least 2 arguments`)
      }
      return compileAndMatcher(
        paramsPath.filter(() => true),
        compileOptions
      )
  }
}
