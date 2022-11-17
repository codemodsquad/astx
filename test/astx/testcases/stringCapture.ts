import { TransformOptions } from '../../../src'
export const input = `
import a from 'b'
import c from 'd'
`

export function astx({ astx, report }: TransformOptions): void {
  for (const { $$$i, $s } of astx.find`import {$$$i} from '$s'`()) {
    report({ $$$i: $$$i.code, $s: $s.stringValue })
  }
}

export const expectedReports = [
  { $$$i: 'a', $s: 'b' },
  { $$$i: 'c', $s: 'd' },
]
