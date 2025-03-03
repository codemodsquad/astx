import { register as registerLoader } from 'node:module'

export function register() {
  registerLoader('./tsn-esm-transpile-only.mjs', import.meta.url)
}
