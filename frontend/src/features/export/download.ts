/** Trigger a browser download for in-memory content. */
export function downloadBlob(name: string, data: Uint8Array | string, mime: string): void {
  const part = typeof data === 'string' ? data : (data.buffer as ArrayBuffer)
  const url = URL.createObjectURL(new Blob([part], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
