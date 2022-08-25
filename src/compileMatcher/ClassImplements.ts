import { NodePath, ClassImplements } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileCaptureMatcher from './Capture'

export default function compileClassImplementsMatcher(
  path: NodePath<ClassImplements>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: ClassImplements = path.node

  if (pattern.id.type === 'Identifier') {
    if (pattern.typeParameters == null) {
      const captureMatcher = compileCaptureMatcher(
        path,
        pattern.id.name,
        compileOptions
      )

      if (captureMatcher) return captureMatcher
    }
  }
}
