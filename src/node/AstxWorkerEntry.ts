#!/usr/bin/env node

import { makeIpcTransformResult } from './ipc'
import runTransformOnFile, {
  RunTransformOnFileOptions,
} from './runTransformOnFile'
import { parentPort as _parentPort } from 'worker_threads'

const parentPort = _parentPort
if (!parentPort) process.exit(1)

const abortControllers: Map<number, AbortController> = new Map()
parentPort.on('message', async (message: any) => {
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
        parentPort.postMessage({
          type: 'error',
          seq,
          error: { message: error.message, stack: error.stack },
        })
        return
      } finally {
        abortControllers.delete(seq)
      }
      parentPort.postMessage({
        type: 'transformResult',
        seq,
        result: makeIpcTransformResult(result),
      })
      return
    }
  }
})
