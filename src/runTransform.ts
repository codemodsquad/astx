import runTransformOnFile, {
  Transform,
  TransformResult,
} from './runTransformOnFile'
import resolveGlobsAndDirs from './util/resolveGlobsAndDirs'
import { clearCache } from 'babel-parse-wild-code'
import { GetBackend } from './backend/Backend'

export default async function* runTransform({
  transform,
  paths,
  getBackend,
}: {
  transform: Transform
  paths: string[]
  getBackend: GetBackend
}): AsyncIterable<TransformResult> {
  const files = await resolveGlobsAndDirs(paths, [
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
  const transformResults = files.map(
    runTransformOnFile({ transform, getBackend })
  )

  for (const elem of transformResults) {
    yield await elem
  }
}
