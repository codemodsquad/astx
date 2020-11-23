export default function mapValues<K extends string | number | symbol, V, V2>(obj: Record<K, V>, mapper: (value: V) => V2): Record<K, V2>;
