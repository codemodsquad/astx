import { clearCache } from 'babel-parse-wild-code'
import { range } from 'lodash'
import { cpus } from 'os'
import { IpcTransformResult } from './ipc'
import astxGlob from './astxGlob'
import AstxWorker from './AstxWorker'
import AsyncPool from './AsyncPool'
import { astxCosmiconfig } from './astxCosmiconfig'
import { RunTransformOptions, Progress } from './runTransform'
import { RunTransformOnFileOptions } from './runTransformOnFile'
import PushPullIterable from '../util/PushPullIterable'

class AbortedError extends Error {}

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

  runTransform({
    gitignore,
    transform,
    transformFile,
    paths,
    exclude,
    fs,
    cwd = process.cwd(),
    config,
    signal,
    queueCapacity,
  }: RunTransformOptions & {
    queueCapacity?: number
  }): AsyncIterable<{ type: 'result'; result: IpcTransformResult } | Progress> {
    clearCache()
    astxCosmiconfig.clearSearchCache()

    const events = new PushPullIterable<
      { type: 'result'; result: IpcTransformResult } | Progress
    >(queueCapacity || 1000)

    async function emit(
      event: { type: 'result'; result: IpcTransformResult } | Progress
    ): Promise<void> {
      if (!(await events.push(event)) || signal?.aborted) {
        throw new AbortedError()
      }
    }

    let completed = 0,
      total = 0,
      globDone = false

    const progress = (): Progress => ({
      type: 'progress',
      completed,
      total,
      globDone,
    })

    async function checkDone(): Promise<void> {
      if (globDone && completed === total) {
        await transform?.finish?.()
        events.return()
      }
    }

    ;(async () => {
      try {
        await emit(progress())
        for (const include of paths?.length ? paths : [cwd]) {
          for await (const file of astxGlob({
            include,
            exclude,
            cwd,
            gitignore,
            fs,
          })) {
            if (signal?.aborted) return
            total++
            await emit(progress())
            this.runTransformOnFile({
              file,
              source: fs ? await fs.readFile(file, 'utf8') : undefined,
              transform,
              transformFile,
              config,
              signal,
            })
              .then(async (result) => {
                if (signal?.aborted) return
                completed++
                await emit({ type: 'result', result })
                if (signal?.aborted) return
                await emit(progress())
                if (signal?.aborted) return
                await checkDone()
              })
              .catch((error) => {
                if (error instanceof AbortedError) return
                events.throw(error)
              })
          }
        }
        if (signal?.aborted) return
        globDone = true
        await emit(progress())
        if (signal?.aborted) return
        await checkDone()
      } catch (error) {
        if (error instanceof AbortedError) return
        events.throw(error)
      }
    })()

    return events
  }
}
