import { JSXElement, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import compileGenericArrayMatcher from './GenericArrayMatcher'
import normalizeJSXTextValue from '../util/normalizeJSXTextValue'

function shouldSkipChild(path: NodePath): boolean {
  return (
    path.node.type === 'JSXText' &&
    normalizeJSXTextValue(path.node.value) === ''
  )
}

export default function compileJSXElementMatcher(
  path: NodePath<JSXElement>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const children = path.get('children')

  if (Array.isArray(children) && children.length) {
    return compileGenericNodeMatcher(path, compileOptions, {
      keyMatchers: {
        children: compileGenericArrayMatcher(
          children.filter((p: NodePath) => !shouldSkipChild(p)),
          compileOptions,
          {
            skipElement: shouldSkipChild,
          }
        ),
      },
    })
  }
}
