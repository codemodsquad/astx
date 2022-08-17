import { ASTPath } from 'jscodeshift'

export default class CompilePathError extends Error {
  path: ASTPath
  source: string | undefined

  constructor(message: string, path: ASTPath, source?: string) {
    super(message)
    this.path = path
    this.source = source
  }
}
