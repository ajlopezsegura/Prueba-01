/**
 * Tries native Web Share API (mobile), falls back to clipboard copy.
 * Returns 'shared' | 'copied' | 'cancelled' | 'error'
 */
export async function shareOrCopy(url, title) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
      return 'shared'
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'error'
  }
}

/** Base URL for building share links (origin + pathname, without hash) */
export function shareBase() {
  return window.location.origin + window.location.pathname
}
