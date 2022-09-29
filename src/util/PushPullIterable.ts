type ResolveReject<T> = {
  resolve: (value: T) => void
  reject: (error?: any) => void
}

export class PushPullIterable<T> implements AsyncIterable<T> {
  private readonly capacity: number
  private queue: T[] = []
  private pushQueue: ResolveReject<boolean>[] = []
  private pullQueue: ResolveReject<IteratorResult<T>>[] = []
  private producing = true
  private consuming = true
  private iterating = false

  constructor(capacity: number) {
    if (
      (capacity !== Infinity && !Number.isFinite(capacity)) ||
      capacity < 0 ||
      capacity % 1
    ) {
      throw new Error(`invalid capacity: ${capacity}`)
    }
    this.capacity = capacity
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    if (this.iterating) {
      throw new Error(
        `this iterable doesn't support creating more than one iterator`
      )
    }
    this.iterating = true
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    return {
      async next(): Promise<IteratorResult<T>> {
        return self.pull()
      },
      async return(): Promise<IteratorResult<T>> {
        self.iteratorReturn()
        return { value: undefined, done: true }
      },
      async throw(error?: any): Promise<IteratorResult<T>> {
        self.iteratorThrow({ error })
        return { value: undefined, done: true }
      },
    }
  }

  async push(value: T): Promise<boolean> {
    if (!this.producing) {
      throw new Error(`can't push after returning or throwing`)
    }
    if (!this.consuming) return false
    const waitingPull = this.pullQueue.shift()
    if (waitingPull) {
      waitingPull.resolve({ value, done: false })
      return this.consuming
    }
    if (this.queue.length < this.capacity) {
      this.queue.push(value)
      return this.consuming
    }
    return new Promise<boolean>((resolve, reject) => {
      this.pushQueue.push({
        resolve: (keepGoing: boolean) => {
          if (keepGoing && this.producing) this.queue.push(value)
          resolve(keepGoing)
        },
        reject,
      })
    })
  }

  private async pull(): Promise<IteratorResult<T>> {
    if (!this.consuming) {
      throw new Error(`can't call next after returning or throwing`)
    }
    if (this.queue.length) {
      const pulled: T = this.queue.shift() as any
      this.pushQueue.shift()?.resolve(true)
      return { value: pulled, done: false }
    }
    if (!this.producing) {
      return { value: undefined, done: true }
    }
    return new Promise<IteratorResult<T>>((resolve, reject) => {
      this.pullQueue.push({ resolve, reject })
    })
  }

  return(): void {
    if (!this.producing) return
    this.producing = false
    const { pullQueue } = this
    this.pullQueue = []
    for (const pull of pullQueue) {
      pull.resolve({ value: undefined, done: true })
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  throw(error?: any): void {
    if (!this.producing) return
    this.producing = false
    const { pullQueue } = this
    this.pullQueue = []
    for (const pull of pullQueue) {
      pull.reject(error)
    }
  }

  private iteratorReturn(): void {
    if (!this.consuming) return
    this.consuming = false
    const { pushQueue } = this
    this.pushQueue = []
    for (const push of pushQueue) {
      push.resolve(false)
    }
  }

  private iteratorThrow(error?: any): void {
    if (!this.consuming) return
    this.consuming = false
    const { pushQueue } = this
    this.pushQueue = []
    for (const push of pushQueue) {
      push.reject(error)
    }
  }
}
