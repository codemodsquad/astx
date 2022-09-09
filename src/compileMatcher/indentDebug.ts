import { Debugger } from '../types'

export default function indentDebug(debug: Debugger, amount: number): Debugger {
  const indent = '  '.repeat(amount)
  const result = (format: string, ...args: any[]) =>
    debug.enabled ? debug(indent + format, ...args) : undefined
  const prototype = Object.create(debug)
  Object.setPrototypeOf(result, prototype)
  return result as any
}
