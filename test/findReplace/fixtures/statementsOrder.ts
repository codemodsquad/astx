export const input = `
const a = 1
const b = a + 3

const f = 1

function foo() {
  const c = 5
  const d = 6
  const e = c + 4
}

const g = f + 3
`

export const find = `
const $a = $b
$_c
const $d = $a + $e
`

export const expectedFind = [
  {
    arrayCaptures: {
      $_c: ['const d = 6'],
    },
    captures: {
      $a: 'c',
      $b: '5',
      $d: 'e',
      $e: '4',
    },
    nodes: ['const c = 5', 'const d = 6', 'const e = c + 4'],
  },
  {
    nodes: ['const a = 1', 'const b = a + 3'],
    captures: { $a: 'a', $b: '1', $d: 'b', $e: '3' },
    arrayCaptures: { $_c: [] },
  },
  {
    nodes: [
      'const f = 1',
      `function foo() {
  const c = 5
  const d = 6
  const e = c + 4
}`,
      'const g = f + 3',
    ],
    captures: { $a: 'f', $b: '1', $d: 'g', $e: '3' },
    arrayCaptures: {
      $_c: [
        `function foo() {
  const c = 5
  const d = 6
  const e = c + 4
}`,
      ],
    },
  },
]

export const replace = `
const $d = $b
const $a = $d + $e
$_c
`

export const expectedReplace = `
const b = 1;
const a = b + 3;
const g = 1;
const f = g + 3;
function foo() {
  const e = 5;
  const c = e + 4;
  const d = 6;
}
`
