declare module 'glob-gitignore' {
  export function glob(glob: string | string[]): Promise<string[]>
}
