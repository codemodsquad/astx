import fs from 'fs-extra'
import Path from 'path'
import { glob } from 'glob-gitignore'
import {
  runTransformOnFile,
  Transform,
  TransformResult,
} from './runTransformOnFile'

export default async function* runTransform(
  transform: Transform,
  options: { paths: Iterable<string> | AsyncIterable<string> }
): AsyncIterable<TransformResult> {
  const transformResults: (
    | Promise<TransformResult>
    | Promise<TransformResult>[]
  )[] = []

  for await (const path of options.paths) {
    if ((await fs.stat(path)).isDirectory()) {
      const files = await glob(
        Path.join(path, '**', '*.{js,js.flow,ts,tsx,cjs,mjs}')
      )
      transformResults.push(files.map(runTransformOnFile(transform)))
    } else {
      transformResults.push(runTransformOnFile(transform)(path))
    }
  }

  for (const elem of transformResults) {
    if (Array.isArray(elem)) {
      for (const promise of elem) yield await promise
    } else {
      yield await elem
    }
  }
}
