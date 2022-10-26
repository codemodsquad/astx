#!/usr/bin/env node

import { ChildProcess, fork } from 'child_process'
import runTransformOnFile, {
  RunTransformOnFileOptions,
} from './runTransformOnFile'
import emitted from 'p-event'
import { IpcTransformResult, makeIpcTransformResult } from './ipc'

export default class AstxWorker {
  child: ChildProcess | undefined
  private _seq = 0
  private _running = false
  private ended = false

  constructor() {
    this.startChild()
  }

  async end(): Promise<void> {
    if (this.ended) return
    this.ended = true
    const { child } = this
    if (child && child.connected) {
      await Promise.all([
        emitted(child, 'close', { rejectionEvents: [] }),
        child.kill(),
      ])
    }
  }

  private startChild() {
    if (this.ended) return
    const child = fork(
      __filename.endsWith('.ts')
        ? require.resolve('./AstxWorker.babel.js')
        : __filename
    )
    this.child = child
    child.once('close', async () => {
      this.child = undefined
      if (this.ended) return
      await new Promise((r) => setTimeout(r, 1000))
      this.startChild()
    })
  }

  get running(): boolean {
    return this.running
  }

  private async getChild(): Promise<ChildProcess> {
    while (!this.child) {
      await new Promise((r) => setTimeout(r, 1000))
    }
    if (this.child) return this.child
    throw new Error('unexpected')
  }

  async runTransformOnFile({
    file,
    transform,
    transformFile,
    config,
    signal,
  }: RunTransformOnFileOptions): Promise<IpcTransformResult> {
    const child = await this.getChild()

    if (this._running) {
      throw new Error(`a transform is currently running`)
    }
    const seq = this._seq++

    try {
      this._running = true
      ;(signal as any)?.on?.('abort', () => {
        child.send({ type: 'abort', seq })
      })
      const promise = Promise.race([
        emitted(child, 'message', {
          filter: (event: any) => event.seq === seq,
          rejectionEvents: ['error', 'exit'],
        }),
        ...(signal
          ? [emitted(signal as any, '', { rejectionEvents: ['abort'] })]
          : []),
      ])
      promise.catch(() => {
        // ignore
      })
      child.send({
        type: 'runTransformOnFile',
        seq,
        file,
        transform,
        transformFile,
        ...(config && { config }),
      })
      const message = await promise
      switch (message.type) {
        case 'error': {
          const error = new Error(message.message)
          error.stack = message.stack
          throw error
        }
        case 'transformResult': {
          const { result } = message
          if (result.reports?.length && transform?.onReport) {
            for (const report of result.reports) {
              transform.onReport({ file, report })
            }
          }
          return result
        }
        default: {
          throw new Error(`unknown message: ${JSON.stringify(message)}`)
        }
      }
    } finally {
      this._running = false
    }
  }
}

export function workerProcess(): void {
  const abortControllers: Map<number, AbortController> = new Map()
  process.on('message', async (message: any) => {
    switch (message.type) {
      case 'abort': {
        abortControllers.get(message.seq)?.abort()
        return
      }
      case 'runTransformOnFile': {
        const { seq, file, transform, transformFile, config } =
          message as RunTransformOnFileOptions & {
            seq: number
          }
        let result
        try {
          const abortController = new AbortController()
          abortControllers.set(seq, abortController)
          const { signal } = abortController
          result = await runTransformOnFile({
            file,
            transform,
            transformFile,
            config,
            signal,
            forWorker: true,
          })
        } catch (error: any) {
          process.send?.({
            type: 'error',
            seq,
            error: { message: error.message, stack: error.stack },
          })
          return
        } finally {
          abortControllers.delete(seq)
        }
        process.send?.({
          type: 'transformResult',
          seq,
          result: makeIpcTransformResult(result),
        })
        return
      }
    }
  })
}

if (require.main === module) workerProcess()
