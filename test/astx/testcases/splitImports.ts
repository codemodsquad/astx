import { TransformOptions } from '../../../src'

export const input = `
import { mapValues, map } from 'lodash'
import { fromPairs } from 'lodash'
`

export function astx({ astx, statement }: TransformOptions): void {
  astx.find`import { $$imports } from 'lodash'`().replace(({ $$imports }) =>
    $$imports.map(
      (imp) => statement`import ${imp.code} from 'lodash/${imp.code}'`
    )
  )
}

export const expected = `
import mapValues from "lodash/mapValues";
import map from "lodash/map";
import fromPairs from "lodash/fromPairs";
`
