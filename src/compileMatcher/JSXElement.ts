import { JSXElement, ASTPath } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import compileGenericArrayMatcher from './GenericArrayMatcher'
import normalizeJSXTextValue from '../util/normalizeJSXTextValue'

function shouldSkipChild(path: ASTPath): boolean {
  return (
    path.node.type === 'JSXText' &&
    normalizeJSXTextValue(path.node.value) === ''
  )
}

export default function compileJSXElementMatcher(
  path: ASTPath,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const pattern: JSXElement = path.node
  const { children } = pattern
  if (children) {
    return compileGenericNodeMatcher(path, compileOptions, {
      keyMatchers: {
        children: compileGenericArrayMatcher(
          path.get('children').filter((p: ASTPath) => !shouldSkipChild(p)),
          compileOptions,
          {
            skipElement: shouldSkipChild,
          }
        ),
      },
    })
  }
}
