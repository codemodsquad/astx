export default function sortFlags(flags: string): string {
  return flags.split('').sort().join('')
}
