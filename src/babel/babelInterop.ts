export default function babelInterop<T>(module: T): T {
  return (module as any).default instanceof Object &&
    Object.getPrototypeOf(module) == null
    ? (module as any).default
    : module
}
