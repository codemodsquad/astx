import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'

export const input = `
import blah from '@jcoreio/require-env'

blah('TEST')
requireEnv('TEST2')
$requireEnv('TEST3')
`

export function astx({ astx, report }: TransformOptions): void {
  const { $requireEnv } =
    astx.find`import $requireEnv from '@jcoreio/require-env'`()
  for (const { $v } of astx.find`${$requireEnv}($v)`()) {
    report($v.code)
  }
}

export const expectedReports = ["'TEST'"]

astxTestcase({
  file: __filename,
  input,
  astx,
  expectedReports,
})
