import { NodePath, SpreadElement } from '../types'
import { CompiledMatcher, CompileOptions, MatchResult } from '.'
import compileCaptureMatcher from './Capture'

export default function compileSpreadElementMatcher(
  path: NodePath<SpreadElement, SpreadElement>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const n = compileOptions.backend.t.namedTypes
  const { argument } = path.value
  if (n.Identifier.check(argument)) {
    const capture = compileCaptureMatcher(path, argument.name, compileOptions)
    if (capture) {
      const restCaptureAs = capture.arrayCaptureAs || capture.restCaptureAs
      if (restCaptureAs) {
        return {
          pattern: path,
          restCaptureAs,
          match: (): MatchResult => {
            throw new Error(
              `rest capture placeholder ${restCaptureAs} is in an invalid position`
            )
          },
        }
      }
    }
  }
}
