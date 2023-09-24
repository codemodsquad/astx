import { Backend } from '../backend/Backend'
import { Node } from '../types'
import { replaceRanges } from './replaceRanges'

export interface SimpleReplacementInterface {
  replace(target: Node, replacement: Node): void
  bail(): void
}

export class SimpleReplacementCollector implements SimpleReplacementInterface {
  replacements: [[number, number], Node][] = []
  bailed = false
  source: string
  backend: Backend

  constructor({ source, backend }: { source: string; backend: Backend }) {
    this.source = source
    this.backend = backend
  }

  replace(target: Node, replacement: Node): void {
    if (this.bailed) return
    const loc = this.backend.location(target)
    const start = loc?.start
    const end = loc?.end
    if (start == null || end == null) return this.bail()
    this.replacements.push([[start, end], replacement])
  }

  bail(): void {
    this.bailed = true
  }

  applyReplacements(): string {
    if (this.bailed) throw new Error(`bailed`)
    if (!this.replacements.length) throw new Error(`no replacements`)
    return replaceRanges(this.source, ({ replace }) => {
      for (const [range, replacement] of this.replacements) {
        this.backend.removeComments(replacement)
        replace(range, this.backend.generate(replacement).code)
      }
    })
  }
}
