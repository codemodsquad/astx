import {
  runTransformOnFile,
  Transform,
  TransformResult,
} from './runTransformOnFile'
import resolveGlobsAndDirs from './util/resolveGlobsAndDirs'
import { clearCache } from 'babel-parse-wild-code'

export default async function* runTransform(
  transform: Transform,
  options: { paths: string[] }
): AsyncIterable<TransformResult> {
  const files = await resolveGlobsAndDirs(options.paths, [
    'js',
    'jsx',
    'flow',
    'ts',
    'tsx',
    'cjs',
    'mjs',
    'esm',
  ])

  clearCache()
  const transformResults = files.map(runTransformOnFile(transform))

  for (const elem of transformResults) {
    yield await elem
  }
}
