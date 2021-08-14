export const input = `
const foo = <Foo>
  {a}
  <div>hello</div>
  {b}
  <div>world</div>
</Foo>

const bar = <Foo>
  {a}
  <div>goodbye</div>
  {b}
  <div>world</div>
</Foo>
`

export const find = `<$a>
  {$$a}
  <div>hello</div>
  {$$b}
</$a>`

export const expectedFind = [
  {
    node: `<Foo>
  {a}
  <div>hello</div>
  {b}
  <div>world</div>
</Foo>`,
    captures: {
      $a: 'Foo',
    },
    arrayCaptures: {
      $$a: ['{a}'],
      $$b: ['{b}', '\n  ', '<div>world</div>'],
    },
  },
]

export const replace = `<$a>
  <div>blah</div>
  {$$b}
  {$$a}
</$a>`

export const expectedReplace = `
const foo = (
  <Foo>
    <div>blah</div>
    {b}
    <div>world</div>
    {a}
  </Foo>
);

const bar = (
  <Foo>
    {a}
    <div>goodbye</div>
    {b}
    <div>world</div>
  </Foo>
);
`
