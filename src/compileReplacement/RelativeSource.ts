import { CompiledReplacement, CompileReplacementOptions } from '.'
import { NodePath } from '../types'
import * as t from '@babel/types'
import Path from 'path'

export default function compileRelativeSourceReplacement(
  pattern: NodePath<any, any>,
  compileReplacementOptions: CompileReplacementOptions
): CompiledReplacement | void {
  const source = pattern.value
  const { getResolveAgainstDir } = compileReplacementOptions
  if (
    source.type === 'StringLiteral' &&
    source.value.startsWith('.') &&
    getResolveAgainstDir
  ) {
    const target = Path.resolve(getResolveAgainstDir(), source.value)
    return {
      generate: (match, { filename }) => {
        if (!filename) return t.stringLiteral(source.value)
        const relative = Path.relative(Path.dirname(filename), target)
        return t.stringLiteral(
          relative.startsWith('.') ? relative : `./${relative}`
        )
      },
    }
  }
}
