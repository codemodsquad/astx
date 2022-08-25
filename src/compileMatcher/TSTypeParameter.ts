import { TSTypeParameter, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'
import * as j from 'jscodeshift'

export default function compileTSTypeParameterMatcher(
  path: NodePath<TSTypeParameter>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSTypeParameter = path.node

  if (
    pattern.constraint == null &&
    (pattern as j.TSTypeParameter).typeAnnotation == null &&
    pattern.default == null &&
    !(pattern as j.TSTypeParameter).optional
  ) {
    const captureMatcher = compileCaptureMatcher(
      path,
      pattern.name,
      compileOptions
    )

    if (captureMatcher) return captureMatcher
  }
}
