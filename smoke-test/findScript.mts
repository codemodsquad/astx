import { TransformOptions } from '../src'

export function astx({ astx, mark }: TransformOptions) {
  mark(astx.find`export type TransformOptions = $T`)
}
