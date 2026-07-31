/**
 * Оповещение других вкладок того же origin об изменении данных.
 * BroadcastChannel доставляет событие сразу (можно с полезной нагрузкой);
 * storage-событие - запасной путь; при возврате на вкладку - повторная сверка.
 */
export function createCrossTabSync<TPayload = unknown>(options: {
  storageKey: string
  channelName: string
  onRemoteChange: (payload?: TPayload) => void
  syncOnVisible?: boolean
}) {
  const syncOnVisible = options.syncOnVisible ?? true
  const channel =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(options.channelName) : null

  function handleChannelMessage(event: MessageEvent<{ type?: string; payload?: TPayload }>) {
    options.onRemoteChange(event.data?.payload)
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === options.storageKey) options.onRemoteChange()
  }

  function handleVisibility() {
    if (document.visibilityState === 'visible') options.onRemoteChange()
  }

  channel?.addEventListener('message', handleChannelMessage)
  window.addEventListener('storage', handleStorage)
  if (syncOnVisible) document.addEventListener('visibilitychange', handleVisibility)

  return {
    notify(payload?: TPayload) {
      channel?.postMessage({ type: 'change', payload })
    },
    dispose() {
      channel?.removeEventListener('message', handleChannelMessage)
      channel?.close()
      window.removeEventListener('storage', handleStorage)
      if (syncOnVisible) document.removeEventListener('visibilitychange', handleVisibility)
    }
  }
}
