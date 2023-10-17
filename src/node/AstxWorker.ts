#!/usr/bin/env node

import { Worker } from 'worker_threads'
import { RunTransformOnFileOptions } from './runTransformOnFile'
import emitted from 'p-event'
import { IpcTransformResult } from './ipc'

export default class AstxWorker {
  private worker: Worker | undefined
  private _seq = 0
  private _running = false
  private ended = false

  constructor() {
    this.startWorker()
  }

  async end(): Promise<void> {
    if (this.ended) return
    this.ended = true
    const { worker } = this
    if (worker) {
      await worker.terminate()
      this.worker = undefined
    }
  }

  private startWorker() {
    if (this.ended) return
    const worker = new Worker(require.resolve('./AstxWorkerEntry.babel.js'))
    this.worker = worker
    worker.once('exit', async () => {
      this.worker = undefined
      if (this.ended) return
      await new Promise((r) => setTimeout(r, 1000))
      this.startWorker()
    })
  }

  get running(): boolean {
    return this.running
  }

  private async getWorker(): Promise<Worker> {
    while (!this.worker) {
      await new Promise((r) => setTimeout(r, 1000))
    }
    if (this.worker) return this.worker
    throw new Error('unexpected')
  }

  async runTransformOnFile({
    file,
    source,
    transform,
    transformFile,
    config,
    signal,
  }: RunTransformOnFileOptions): Promise<IpcTransformResult> {
    const worker = await this.getWorker()

    if (this._running) {
      throw new Error(`a transform is currently running`)
    }
    const seq = this._seq++

    try {
      this._running = true
      ;(signal as any)?.on?.('abort', () => {
        worker.postMessage({ type: 'abort', seq })
      })
      const promise = Promise.race([
        emitted(worker, 'message', {
          filter: (event: any) => event.seq === seq,
          rejectionEvents: ['error', 'exit'],
        }).catch((reason) => {
          throw typeof reason === 'number'
            ? new Error(`worker exited with code ${reason}`)
            : reason
        }),
        ...(signal
          ? [emitted(signal as any, '', { rejectionEvents: ['abort'] })]
          : []),
      ])
      promise.catch(() => {
        // ignore
      })
      worker.postMessage({
        type: 'runTransformOnFile',
        seq,
        file,
        transform: transformFile ? undefined : transform,
        transformFile,
        ...(source && { source }),
        ...(config && { config }),
      })
      const message = await promise
      switch (message.type) {
        case 'error': {
          const error = new Error(message.error.message)
          error.stack = message.error.stack
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
