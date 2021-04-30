import { JSXElement, ASTNode } from 'jscodeshift'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import compileGenericArrayMatcher from './GenericArrayMatcher'
import normalizeJSXTextValue from '../util/normalizeJSXTextValue'

function shouldSkipChild(node: ASTNode): boolean {
  return node.type === 'JSXText' && normalizeJSXTextValue(node.value) === ''
}

export default function compileJSXElementMatcher(
  pattern: JSXElement,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const { children } = pattern
  if (children) {
    return compileGenericNodeMatcher(pattern, compileOptions, {
      keyMatchers: {
        children: compileGenericArrayMatcher(
          children.filter((c) => !shouldSkipChild(c)),
          compileOptions,
          { skipElement: (p) => shouldSkipChild(p.node) }
        ),
      },
    })
  }
}
