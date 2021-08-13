export const input = `
setFakeServerHandler(() =>
  Promise.resolve({
    headers: javaScriptHeaders,
    body: [
      "function generateBid() {",
      "  return { bid: 0.03, render: 'about:blank#1' };",
      "}",
    ].join("\\n"),
  })
);
`

export const find = `
setFakeServerHandler(() => Promise.resolve($response));
`
export const replace = `
const fakeServerHandler = jasmine.createSpy<FakeServerHandler>("fakeServerHandler"); fakeServerHandler.withArgs(jasmine.objectContaining<FakeRequest>({url: new URL(biddingLogicUrl1)})).and.resolveTo($response);
`

export const expectedReplace = `
const fakeServerHandler = jasmine.createSpy<FakeServerHandler>("fakeServerHandler");

fakeServerHandler.withArgs(jasmine.objectContaining<FakeRequest>({
  url: new URL(biddingLogicUrl1)
})).and.resolveTo({
  headers: javaScriptHeaders,

  body: [
    "function generateBid() {",
    "  return { bid: 0.03, render: 'about:blank#1' };",
    "}",
  ].join("\\n"),
});
`
