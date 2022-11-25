import { TransformOptions } from './src'

export async function astx({ astx }: TransformOptions): Promise<void> {
  astx.find`require.resolve('$source')`().replace(
    ({ $source }) =>
      `require.resolve('${$source.stringValue.replace(/\.babel\.js$/, '.js')}')`
  )
}
