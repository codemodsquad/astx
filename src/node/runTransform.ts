import runTransformOnFile from './runTransformOnFile'
import { clearCache } from 'babel-parse-wild-code'
import { AstxConfig } from '../AstxConfig'
import astxGlob from './astxGlob'
import { astxCosmiconfig } from './astxCosmiconfig'
import { Transform, TransformResult } from '../Astx'
import Gitignore from 'gitignore-fs'

export type RunTransformOptions = {
  gitignore?: Gitignore | null
  transform?: Transform
  transformFile?: string
  paths?: readonly string[]
  exclude?: string
  cwd?: string
  config?: Partial<AstxConfig>
  signal?: AbortSignal
}

export default async function* runTransform({
  gitignore,
  transform: _transform,
  transformFile,
  paths: _paths,
  exclude,
  cwd = process.cwd(),
  config,
  signal,
}: RunTransformOptions): AsyncIterable<TransformResult> {
  clearCache()
  astxCosmiconfig.clearSearchCache()

  const transform = transformFile ? await import(transformFile) : _transform
  if (signal?.aborted) return
  if (!transform) throw new Error(`transform or transformFile is required`)

  const paths = _paths?.length ? _paths : [cwd]
  for (const include of paths) {
    for await (const file of astxGlob({ include, exclude, cwd, gitignore })) {
      if (signal?.aborted) return
      let transformed
      try {
        transformed = await runTransformOnFile({
          file,
          transform,
          config,
          signal,
        })
      } catch (error: any) {
        if (error.message === 'aborted' && signal?.aborted) return
        throw error
      }
      if (signal?.aborted) return
      yield transformed
    }
  }
  if (signal?.aborted) return
  await transform.finish?.()
}
