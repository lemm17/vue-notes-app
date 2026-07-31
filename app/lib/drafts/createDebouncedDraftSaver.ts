/**
 * Отложенная запись в репозиторий: несколько быстрых вызовов schedule
 * схлопываются в одно сохранение по истечении delayMs.
 */
export function createDebouncedDraftSaver<TData>(
  repository: {
    save: (data: TData) => void
    clear: () => void
    load: () => TData | null
  },
  delayMs: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  function cancelPending() {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }

  function flush(data: TData | null) {
    cancelPending()
    if (data === null) repository.clear()
    else repository.save(data)
  }

  function schedule(data: TData | null) {
    cancelPending()
    timeoutId = setTimeout(() => flush(data), delayMs)
  }

  function clear() {
    flush(null)
  }

  return {
    load: () => repository.load(),
    schedule,
    flush,
    clear,
    cancelPending
  }
}
