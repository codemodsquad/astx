#!/usr/bin/env node

import { makeIpcTransformResult } from './ipc'
import runTransformOnFile, {
  RunTransformOnFileOptions,
} from './runTransformOnFile'

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
