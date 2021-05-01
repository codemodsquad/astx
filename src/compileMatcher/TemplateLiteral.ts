import { TemplateLiteral, ASTPath } from 'jscodeshift'
import { CompileOptions, CompiledMatcher } from './'
import { compileStringCaptureMatcher } from './Capture'

export default function matchTemplateLiteral(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: TemplateLiteral = path.node
  const captureMatcher = compileStringCaptureMatcher(
    pattern,
    (node: TemplateLiteral) =>
      node.quasis.length === 1 ? node.quasis[0].value.cooked ?? null : null,
    compileOptions
  )
  if (captureMatcher) return captureMatcher
}
