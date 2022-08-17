import { ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileOptionalMatcher from './Optional'
import compileOrMatcher from './Or'
import compileAndMatcher from './And'
import CompilePathError from '../util/CompilePathError'

export default function compileSpecialMatcher(
  path: ASTPath,
  name: string,
  params: ASTPath[],
  compileOptions: CompileOptions
): CompiledMatcher | void {
  switch (name) {
    case '$Optional':
      if (params.length !== 1) {
        throw new CompilePathError(
          `$Optional must be used with 1 type parameter`,
          path
        )
      }
      return compileOptionalMatcher(params[0], compileOptions)
    case '$Or':
      if (params.length < 2) {
        throw new CompilePathError(
          `$Or must be called with at least 2 arguments`,
          path
        )
      }
      return compileOrMatcher(params, compileOptions)
    case '$And':
      if (params.length < 2) {
        throw new CompilePathError(
          `$And must be called with at least 2 arguments`,
          path
        )
      }
      return compileAndMatcher(params, compileOptions)
  }
}
