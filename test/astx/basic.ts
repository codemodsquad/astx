import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'

export const input = `
process.env.FOO
process.env.BAR

const { BAZ, QUX, BOO: boo } = process.env
let { GLORM } = process.env

;({ A } = process.env)
`

export function astx({ astx, report }: TransformOptions): void {
  for (const { $v } of astx.find`process.env.$v`()) {
    report($v.code)
  }
  for (const { $$$v } of [
    ...astx.find`const /**/ { $$$v } = process.env`(),
    ...astx.find`({ $$$v } = process.env)`(),
  ]) {
    for (const { $v } of $$$v.find`({ /**/ $v: $a })`()) {
      report($v.code)
    }
  }
}

export const expectedReports = ['FOO', 'BAR', 'BAZ', 'QUX', 'BOO', 'GLORM', 'A']

astxTestcase({
  file: __filename,
  input,
  astx,
  expectedReports,
})
