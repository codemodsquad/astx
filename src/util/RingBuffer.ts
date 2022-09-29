export default class RingBuffer<T> {
  private readonly buffer: T[]
  private _size = 0
  private offset = 0

  constructor(capacity: number) {
    this.buffer = new Array(capacity)
  }

  push(...values: T[]): void {
    for (const value of values) {
      if (this.isFull) {
        throw new Error(`buffer is full`)
      }
      const i = this.offset + this._size++
      this.buffer[i < this.buffer.length ? i : i - this.buffer.length] = value
    }
  }

  pull(): T | undefined {
    if (!this._size) return undefined
    const result = this.buffer[this.offset]
    this.offset++
    if (this.offset === this.buffer.length) this.offset = 0
    this._size--
    return result
  }

  get size(): number {
    return this._size
  }

  get isFull(): boolean {
    return this._size === this.buffer.length
  }

  get capacity(): number {
    return this.buffer.length
  }
}
