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
  $_a: any;
  $b: any;
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
      $_a: ['a: number', 'b: string'],
    },
  },
]

export const replace = `
interface Foo {
  d(x: number): string;
  $b: any;
  e(): number;
  $_a: any;
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

// currently not working
export const skip = true
