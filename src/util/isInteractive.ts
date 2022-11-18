import { Readable } from 'stream'

export default function isInteractive({
  stream = process.stdout,
}: { stream?: Readable } = {}): boolean {
  return Boolean(
    (stream as any)?.isTTY &&
      process.env.TERM !== 'dumb' &&
      !('CI' in process.env)
  )
}
