export const controlClass = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-ink'

export function describedBy(htmlFor: string, hint: boolean, error: boolean): string | undefined {
  const ids = [hint ? `${htmlFor}-hint` : '', error ? `${htmlFor}-error` : ''].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}
