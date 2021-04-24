import { TemplateLiteral } from 'jscodeshift'
import { CompileOptions, CompiledMatcher } from './'
import { compileStringCaptureMatcher } from './Capture'

export default function matchTemplateLiteral(
  pattern: TemplateLiteral,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const captureMatcher = compileStringCaptureMatcher(
    pattern,
    (node: TemplateLiteral) =>
      node.quasis.length === 1 ? node.quasis[0].value.cooked ?? null : null,
    compileOptions
  )
  if (captureMatcher) return captureMatcher
}
