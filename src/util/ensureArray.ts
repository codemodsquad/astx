export default function ensureArray<T>(x: T | readonly T[]): readonly T[] {
  return Array.isArray(x as any) ? (x as any) : [x]
}
