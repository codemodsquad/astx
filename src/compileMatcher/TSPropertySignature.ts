import { TSPropertySignature, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileTSPropertySignatureMatcher(
  path: NodePath<TSPropertySignature>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TSPropertySignature = path.node

  if (pattern.key.type === 'Identifier') {
    if (
      !pattern.optional &&
      !pattern.computed &&
      (pattern.typeAnnotation == null ||
        pattern.typeAnnotation?.typeAnnotation?.type === 'TSAnyKeyword')
    ) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.key.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
