import { NodePath } from '../types'

export default class CompilePathError extends Error {
  path: NodePath
  source: string | undefined

  constructor(message: string, path: NodePath, source?: string) {
    super(message)
    this.path = path
    this.source = source
  }
}
