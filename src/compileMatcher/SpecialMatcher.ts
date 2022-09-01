import { Node, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileOptionalMatcher from './Optional'
import compileOrMatcher from './Or'
import compileAndMatcher from './And'
import CompilePathError from '../util/CompilePathError'

export default function compileSpecialMatcher(
  path: NodePath,
  name: string,
  params: NodePath<Node, Node[]>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  switch (name) {
    case '$Optional':
      if (params.value.length !== 1) {
        throw new CompilePathError(
          `$Optional must be used with 1 type parameter`,
          path
        )
      }
      return compileOptionalMatcher(path, params.get(0), compileOptions)
    case '$Or':
      if (params.value.length < 2) {
        throw new CompilePathError(
          `$Or must be called with at least 2 arguments`,
          path
        )
      }
      return compileOrMatcher(path, params, compileOptions)
    case '$And':
      if (params.value.length < 2) {
        throw new CompilePathError(
          `$And must be called with at least 2 arguments`,
          path
        )
      }
      return compileAndMatcher(path, params, compileOptions)
  }
}
