export const input = `
if (a) {
  return a;
} else {
  return b;
}

if (a) {
  return a;
} else if (b) {
  return b;
}
`

export const find = `
if ($a) { $$body } 
`

export const expectedFind = [
  {
    arrayCaptures: { $$body: ['return b;'] },
    captures: { $a: 'b' },
    node: 'if (b) {\n  return b;\n}',
  },
]
