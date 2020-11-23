export default function mapValues<K extends string | number | symbol, V, V2>(
  obj: Record<K, V>,
  mapper: (value: V) => V2
): Record<K, V2> {
  const mapped: Record<K, V2> = {} as any
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      mapped[key] = mapper(obj[key])
    }
  }
  return mapped
}
