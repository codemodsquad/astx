export const input = `
interface Foo {
  a: number;
  b: string;
  c(): string;
  d(x: number): string;
}
`
export const find = `
interface Foo {
  $$a: $;
  $b: $;
  d(x: number): string;
}
`

export const expectedFind = [
  {
    node: `interface Foo {
  a: number;
  b: string;
  c(): string;
  d(x: number): string;
}`,
    captures: {
      $b: 'c(): string',
    },
    arrayCaptures: {
      $$a: ['a: number', 'b: string'],
    },
  },
]

export const replace = `
interface Foo {
  d(x: number): string;
  $b: $;
  e(): number;
  $$a: $;
}
`

export const expectedReplace = `
interface Foo {
  d(x: number): string;
  c(): string;
  e(): number;
  a: number;
  b: string;
}
`

export const parsers = [
  'babel',
  'babel/tsx',
  // 'recast/babel', recast bug...
  'recast/babel/tsx',
]
