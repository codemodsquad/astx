import runTransformOnFile, {
  Signal,
  Transform,
  TransformResult,
} from './runTransformOnFile'
import { clearCache } from 'babel-parse-wild-code'
import { AstxConfig, astxCosmiconfig } from './AstxConfig'
import astxGlob from './util/astxGlob'

export default async function* runTransform({
  transform: _transform,
  transformFile,
  paths: _paths,
  cwd = process.cwd(),
  config,
  signal,
}: {
  transform?: Transform
  transformFile?: string
  paths?: readonly string[]
  cwd?: string
  config?: Partial<AstxConfig>
  signal?: Signal
}): AsyncIterable<TransformResult> {
  clearCache()
  astxCosmiconfig.clearSearchCache()

  const transform = transformFile ? await import(transformFile) : _transform
  if (signal?.aborted) return
  if (!transform) throw new Error(`transform or transformFile is required`)

  const paths = _paths?.length ? _paths : [cwd]
  for (const include of paths) {
    for await (const file of astxGlob({ include, cwd })) {
      if (signal?.aborted) return
      const transformed = await runTransformOnFile({
        file,
        transform,
        config,
        signal,
      })
      if (signal?.aborted) return
      yield transformed
    }
  }
}
