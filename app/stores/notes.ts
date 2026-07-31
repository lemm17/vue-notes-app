import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { createCrossTabSync } from '~/lib/storage/createCrossTabSync'
import { LocalStorageRepository } from '~/lib/storage/LocalStorageRepository'
import type { Note } from '~/types/note'

/**
 * CRUD-логика списка заметок без привязки к Pinia/Nuxt - принимает уже
 * готовые notes и repository, поэтому тестируется без поднятия приложения.
 */
export function createNotesActions(notes: Ref<Note[]>, repository: LocalStorageRepository<Note[]>) {
  const getNoteById = (id: string) => notes.value.find((note) => note.id === id)

  const saveNote = (note: Note) => {
    const index = notes.value.findIndex((existing) => existing.id === note.id)
    if (index === -1) notes.value.push(note)
    else notes.value.splice(index, 1, note)
    repository.save(notes.value)
  }

  const deleteNote = (id: string) => {
    notes.value = notes.value.filter((note) => note.id !== id)
    repository.save(notes.value)
  }

  const reload = () => {
    notes.value = repository.load() ?? []
  }

  return { getNoteById, saveNote, deleteNote, reload }
}

function clearDraft(key: string, schemaVersion: number) {
  new LocalStorageRepository<Note>(key, schemaVersion).clear()
}

export const useNotesStore = defineStore('notes', () => {
  const config = useAppConfig()
  const repository = new LocalStorageRepository<Note[]>(
    config.storage.notesKey,
    config.storage.schemaVersion
  )
  const notes = ref<Note[]>(repository.load() ?? [])
  const actions = createNotesActions(notes, repository)

  const sync = import.meta.client
    ? createCrossTabSync({
        storageKey: config.storage.notesKey,
        channelName: `${config.storage.notesKey}:sync`,
        onRemoteChange: actions.reload
      })
    : null

  function saveNote(note: Note) {
    actions.saveNote(note)
    sync?.notify()
  }

  // Черновик удалённой заметки больше не нужен - иначе после перезагрузки
  // предложится восстановление уже несуществующей записи.
  function deleteNote(id: string) {
    actions.deleteNote(id)
    clearDraft(`${config.storage.draftKeyPrefix}${id}`, config.storage.schemaVersion)
    sync?.notify()
  }

  return {
    notes,
    getNoteById: actions.getNoteById,
    saveNote,
    deleteNote,
    reload: actions.reload
  }
})
