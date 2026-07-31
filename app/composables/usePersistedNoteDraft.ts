import { getCurrentInstance, nextTick, onUnmounted, toRaw, watch, type Ref } from 'vue'
import { cloneNote, noteBodyEqual } from '~/domain/notes/noteDraft'
import { createDebouncedDraftSaver } from '~/lib/drafts/createDebouncedDraftSaver'
import { createCrossTabSync } from '~/lib/storage/createCrossTabSync'
import { LocalStorageRepository } from '~/lib/storage/LocalStorageRepository'
import type { Note } from '~/types/note'

/**
 * Автосохранение черновика в localStorage с debounce и мгновенная
 * синхронизация снимка между вкладками через BroadcastChannel.
 */
export function usePersistedNoteDraft(
  storageKey: string,
  draft: Ref<Note>,
  options: {
    schemaVersion: number
    delayMs: number
    /**
     * Пока false - изменения не пишутся (например, ждём ответа в диалоге восстановления).
     */
    enabled: Ref<boolean>
    /**
     * Эталон, относительно которого считается черновик
     */
    getBaseline: () => Note | null
    /**
     * Другая вкладка прислала актуальный черновик - применить у себя.
     */
    onRemoteUpdate?: (note: Note) => void
  }
) {
  const repository = new LocalStorageRepository<Note>(storageKey, options.schemaVersion)
  const saver = createDebouncedDraftSaver(repository, options.delayMs)
  let applyingRemote = false

  function isDirty(): boolean {
    const baseline = options.getBaseline()
    if (!baseline) return draft.value.title !== '' || draft.value.todos.length > 0
    return !noteBodyEqual(toRaw(draft.value), baseline)
  }

  function applyRemote(payload?: Note) {
    if (!options.enabled.value || !options.onRemoteUpdate) return

    const remote = payload ?? saver.load()
    if (!remote) return
    if (noteBodyEqual(remote, toRaw(draft.value))) return

    applyingRemote = true
    options.onRemoteUpdate(cloneNote(remote))
    void nextTick(() => {
      applyingRemote = false
    })
  }

  const sync = import.meta.client
    ? createCrossTabSync<Note>({
        storageKey,
        channelName: `${storageKey}:sync`,
        onRemoteChange: applyRemote
      })
    : null

  function persistNow() {
    if (!options.enabled.value || applyingRemote) return
    const snapshot = isDirty() ? cloneNote(draft.value) : null
    saver.flush(snapshot)
    if (snapshot) sync?.notify(snapshot)
  }

  watch(
    draft,
    () => {
      if (!options.enabled.value || applyingRemote) return
      const snapshot = isDirty() ? cloneNote(draft.value) : null
      saver.schedule(snapshot)
      // В другие вкладки шлём сразу, не дожидаясь debounce записи на диск.
      if (snapshot) sync?.notify(snapshot)
    },
    { deep: true }
  )

  watch(options.enabled, (enabled) => {
    if (enabled) persistNow()
  })

  if (getCurrentInstance()) {
    onUnmounted(() => {
      saver.cancelPending()
      sync?.dispose()
    })
  }

  return {
    load: saver.load,
    clear: saver.clear,
    persistNow,
    cancelPending: saver.cancelPending
  }
}
