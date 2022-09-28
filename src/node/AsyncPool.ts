type Entry<E> = { elem: E; available: boolean }

export default class AsyncPool<E> {
  entries: Entry<E>[] = []
  callbacks: ((entry: Entry<E>) => void)[] = []

  constructor(entries: E[]) {
    this.entries = entries.map((elem) => ({ elem, available: true }))
  }

  get elements(): E[] {
    return this.entries.map((e) => e.elem)
  }

  async run<T>(executor: (elem: E) => Promise<T>): Promise<T> {
    const entry =
      this.entries.find((e) => e.available) ||
      (await new Promise<Entry<E>>((resolve) => this.callbacks.push(resolve)))
    try {
      entry.available = false
      return await executor(entry.elem)
    } finally {
      entry.available = true
      this.callbacks.shift()?.(entry)
    }
  }
}
