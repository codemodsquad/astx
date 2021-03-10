import {
  runTransformOnFile,
  Transform,
  TransformResult,
} from './runTransformOnFile'
import resolveGlobsAndDirs from './util/resolveGlobsAndDirs'

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

  const transformResults = files.map(runTransformOnFile(transform))

  for (const elem of transformResults) {
    if (Array.isArray(elem)) {
      for (const promise of elem) yield await promise
    } else {
      yield await elem
    }
  }
}
