export const input = `export type StrictOmit<T, K extends keyof T> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;`

export const parsers = ['babel/tsx', 'recast/babel/tsx']

export const find = `type StrictOmit<$$T> = $T2`

export const expectedFind = [
  {
    arrayCaptures: {
      $$T: ['T', 'K extends keyof T'],
    },
    captures: {
      $T2: 'T extends any ? Pick<T, Exclude<keyof T, K>> : never',
    },
    node: 'type StrictOmit<T, K extends keyof T> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;',
  },
]
