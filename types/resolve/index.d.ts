declare module 'resolve' {
  function resolve(
    request: string,
    options: { basedir?: string },
    cb: (result: string) => void
  ): void
  export = resolve
}
