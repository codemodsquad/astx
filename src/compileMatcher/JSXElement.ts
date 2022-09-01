import { JSXElement, NodePath } from '../types'
import { CompiledMatcher, CompileOptions } from '.'
import compileGenericNodeMatcher from './GenericNodeMatcher'
import compileGenericArrayMatcher from './GenericArrayMatcher'
import normalizeJSXTextValue from '../util/normalizeJSXTextValue'

export default function compileJSXElementMatcher(
  path: NodePath<JSXElement, JSXElement>,
  compileOptions: CompileOptions
): CompiledMatcher | void {
  const children = path.get('children')
  const n = compileOptions.backend.t.namedTypes

  function shouldSkipChild(path: NodePath): boolean {
    return (
      n.JSXText.check(path.value) &&
      normalizeJSXTextValue(path.value.value) === ''
    )
  }

  if (Array.isArray(children.value) && children.value.length) {
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
