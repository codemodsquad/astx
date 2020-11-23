export default function isEmpty(obj: Record<any, any>): boolean {
  for (const key in obj) return false
  return true
}
