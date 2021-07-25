import { ASTPath } from '../variant'
import { CompiledMatcher, CompileOptions } from '.'
import compileOptionalMatcher from './Optional'
import compileOrMatcher from './Or'
import compileAndMatcher from './And'

export default function compileSpecialMatcher(
  name: string,
  params: ASTPath[],
  compileOptions: CompileOptions
): CompiledMatcher | void {
  switch (name) {
    case '$Optional':
      if (params.length !== 1) {
        throw new Error(`$Optional must be used with 1 type parameter`)
      }
      return compileOptionalMatcher(params[0], compileOptions)
    case '$Or':
      if (params.length < 2) {
        throw new Error(`$Or must be called with at least 2 arguments`)
      }
      return compileOrMatcher(params, compileOptions)
    case '$And':
      if (params.length < 2) {
        throw new Error(`$And must be called with at least 2 arguments`)
      }
      return compileAndMatcher(params, compileOptions)
  }
}
