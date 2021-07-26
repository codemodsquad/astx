export default function normalizeJSXTextValue(value: string): string {
  return value
    .replace(/^\s+|\s+$/g, (match) => (/\n/.test(match) ? '' : ' '))
    .replace(/\s+/gm, ' ')
}
