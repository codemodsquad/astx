export default function babelInterop<T>(module: T): T {
  return (module as any).default != null &&
    typeof (module as any).default === 'object' &&
    Object.getPrototypeOf(module) == null
    ? (module as any).default
    : module
}
