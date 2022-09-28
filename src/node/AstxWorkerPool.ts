import { clearCache } from 'babel-parse-wild-code'
import { range } from 'lodash'
import { cpus } from 'os'
import { IpcTransformResult } from './ipc'
import astxGlob from './astxGlob'
import AstxWorker from './AstxWorker'
import AsyncPool from './AsyncPool'
import { astxCosmiconfig } from './astxCosmiconfig'
import { RunTransformOnFileOptions } from './runTransformOnFile'

export type Progress = {
  type: 'progress'
  completed: number
  total: number
  globDone: boolean
}

export default class AstxWorkerPool {
  pool: AsyncPool<AstxWorker>

  constructor({ capacity = cpus().length }: { capacity?: number } = {}) {
    this.pool = new AsyncPool(range(capacity).map(() => new AstxWorker()))
  }

  async end(): Promise<void> {
    await Promise.all(this.pool.elements.map((e) => e.end()))
  }

  runTransformOnFile(
    options: RunTransformOnFileOptions
  ): Promise<IpcTransformResult> {
    return this.pool.run((worker) => worker.runTransformOnFile(options))
  }

  async *runTransform({
    transform,
    transformFile,
    paths: _paths,
    cwd = process.cwd(),
    config,
    signal,
  }: Omit<RunTransformOnFileOptions, 'file'> & {
    paths?: readonly string[]
    cwd?: string
  }): AsyncIterable<{ type: 'result'; result: IpcTransformResult } | Progress> {
    clearCache()
    astxCosmiconfig.clearSearchCache()

    if (signal?.aborted) return

    let completed = 0,
      total = 0,
      globDone = false
    const progress = (): Progress => ({
      type: 'progress',
      completed,
      total,
      globDone,
    })
    yield progress()

    const paths = _paths?.length ? _paths : [cwd]
    const promises = []
    for (const include of paths) {
      for await (const file of astxGlob({ include, cwd })) {
        if (signal?.aborted) return
        total++
        yield progress()
        if (signal?.aborted) return
        const promise = this.runTransformOnFile({
          file,
          transform,
          transformFile,
          config,
          signal,
        })
        promise.catch(() => {
          // ignore
        })
        promises.push(promise)
      }
    }
    if (signal?.aborted) return
    globDone = true
    yield progress()

    for (const promise of promises) {
      if (signal?.aborted) return
      yield { type: 'result', result: await promise }
      if (signal?.aborted) return
      completed++
      yield progress()
    }
  }
}
